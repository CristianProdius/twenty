import { http, HttpResponse } from 'msw';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type ConnectionProviderAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const applicationIdentifier = v4();
const providerIdentifier = v4();
const roleIdentifier = v4();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const TOKEN_ENDPOINT = 'https://connection-choices.example.com/token';

const buildManifest = (allowedVisibilities?: ConnectedAccountVisibility[]) =>
  buildBaseManifest({
    appId: applicationIdentifier,
    roleId: roleIdentifier,
    overrides: {
      connectionProviders: [
        {
          universalIdentifier: providerIdentifier,
          name: 'visibility-provider',
          displayName: 'Visibility provider',
          type: 'oauth',
          ...(isDefined(allowedVisibilities) ? { allowedVisibilities } : {}),
          oauth: {
            authorizationEndpoint: 'https://example.com/authorize',
            tokenEndpoint: TOKEN_ENDPOINT,
            scopes: ['read'],
            clientIdVariable: 'CLIENT_ID',
            clientSecretVariable: 'CLIENT_SECRET',
          },
        },
      ],
    },
  });

describe('app manifest connection visibility choices', () => {
  let accountService: ConnectionProviderAccountService;
  let oauthFlow: ConnectionProviderOAuthFlowService;
  let metadataService: ConnectedAccountMetadataService;
  let applicationId: string;
  let tokenExchanges: number;
  const member = {
    id: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    userId: USER_DATA_SEED_IDS.JANE,
  };

  const providers = () =>
    getCoreRepository<ConnectionProviderEntity>(ConnectionProviderEntity);
  const accounts = () =>
    getCoreRepository<ConnectedAccountEntity>(ConnectedAccountEntity);
  const readProvider = async () => {
    const provider = await providers().findOneByOrFail({
      universalIdentifier: providerIdentifier,
      workspaceId,
    });
    assertOAuthProvider(provider);
    return provider;
  };
  const setChoices = async (
    allowedVisibilities: ConnectedAccountVisibility[],
  ) => {
    if (allowedVisibilities.includes('workspace')) {
      const { errors } = await syncApplication({
        manifest: buildManifest(allowedVisibilities),
      });
      expect(errors).toBeUndefined();
    }
    // Sync refuses personal-only declarations for now, so the row is written directly to keep exercising the runtime check.
    await providers().update(
      { universalIdentifier: providerIdentifier, workspaceId },
      { allowedVisibilities },
    );
  };
  setupHttpMock(
    http.post(TOKEN_ENDPOINT, () => {
      tokenExchanges += 1;
      return HttpResponse.json({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        scope: 'read',
      });
    }),
  );
  const save = async (
    overrides: Partial<
      Parameters<ConnectionProviderAccountService['saveConnection']>[0]
    > = {},
  ) =>
    accountService.saveConnection({
      provider: await readProvider(),
      workspaceId,
      userId: member.userId,
      userWorkspaceId: member.id,
      visibility: 'user',
      reconnectingConnectedAccountId: null,
      handle: 'account',
      tokenResponse: {
        accessToken: plaintextStringSchema.parse('initial-access'),
        refreshToken: plaintextStringSchema.parse('initial-refresh'),
        idToken: null,
        scopes: ['read'],
      },
      ...overrides,
    });
  const authorize = async (
    overrides: Partial<
      Parameters<
        ConnectionProviderOAuthFlowService['startAuthorizationFlow']
      >[0]
    > = {},
  ) => {
    const { authorizationUrl } = await oauthFlow.startAuthorizationFlow({
      connectionProvider: await readProvider(),
      workspaceId,
      userId: member.userId,
      userWorkspaceId: member.id,
      reconnectingConnectedAccountId: null,
      redirectLocation: null,
      ...overrides,
    });
    const state = new URL(authorizationUrl).searchParams.get('state');
    if (!isDefined(state)) {
      throw new Error('Authorization did not provide signed state');
    }
    return state;
  };
  const complete = async (state: string) =>
    oauthFlow.completeAuthorizationFlow({
      statePayload: await oauthFlow.verifyState(state),
      code: 'authorization-code',
    });

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: applicationIdentifier,
      name: 'Connection visibility choices',
      description: 'Connection visibility regression tests',
      sourcePath: 'connection-visibility-tests',
    });
    jest.useRealTimers();
    const { errors } = await syncApplication({ manifest: buildManifest() });
    expect(errors).toBeUndefined();
    const createdProvider = await readProvider();
    expect(createdProvider.allowedVisibilities).toEqual(['workspace']);
    applicationId = createdProvider.applicationId;
    const encryption = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    );
    for (const key of ['CLIENT_ID', 'CLIENT_SECRET']) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."applicationRegistrationVariable" (key, "encryptedValue", "applicationRegistrationId")
         SELECT $1, $2, "applicationRegistrationId" FROM core.application WHERE id = $3`,
        [
          key,
          encryption.encryptVersioned(
            plaintextStringSchema.parse(`test-${key}`),
          ),
          applicationId,
        ],
      );
    }
    accountService = getAppProviderByClassName(
      'ConnectionProviderAccountService',
    );
    oauthFlow = getAppProviderByClassName('ConnectionProviderOAuthFlowService');
    metadataService = getAppProviderByClassName(
      'ConnectedAccountMetadataService',
    );
  }, 120000);

  beforeEach(async () => {
    await setChoices(['user', 'workspace']);
    tokenExchanges = 0;
  }, 60000);

  afterEach(async () => {
    jest.restoreAllMocks();
    if (isDefined(applicationId)) {
      await accounts().delete({ applicationId, workspaceId });
    }
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: applicationIdentifier,
    });
  }, 120000);

  it('refuses personal connections when the declaration is omitted', async () => {
    const { errors } = await syncApplication({ manifest: buildManifest() });
    expect(errors).toBeUndefined();
    expect((await readProvider()).allowedVisibilities).toEqual(['workspace']);

    await expect(authorize({ visibility: 'user' })).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
    });
    await expect(save({ visibility: 'user' })).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
    });
    expect(tokenExchanges).toBe(0);
    expect(await accounts().countBy({ applicationId })).toBe(0);
  });

  it('resolves an omitted visibility to the only allowed one', async () => {
    await setChoices(['workspace']);

    const result = await complete(await authorize());

    expect(
      await accounts().findOneByOrFail({ id: result.connectedAccountId }),
    ).toMatchObject({ visibility: 'workspace' });
  });

  it.each(['user', 'workspace'] as const)(
    'allows a %s connection when both visibilities are declared',
    async (visibility) => {
      const result = await complete(await authorize({ visibility }));

      expect(
        await accounts().findOneByOrFail({ id: result.connectedAccountId }),
      ).toMatchObject({ visibility });
    },
  );

  it('refuses to share a personal connection when workspace connections are not allowed', async () => {
    const original = await save({ visibility: 'user' });
    await setChoices(['user']);
    const share = {
      reconnectingConnectedAccountId: original.connectedAccount.id,
      visibility: 'workspace' as const,
    };

    await expect(authorize(share)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
    });
    await expect(save(share)).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
    });
    expect(tokenExchanges).toBe(0);
    expect(
      await accounts().findOneByOrFail({ id: original.connectedAccount.id }),
    ).toMatchObject({ visibility: 'user' });
  });

  it.each(['user', 'workspace'] as const)(
    'reconnects a live %s connection the app no longer offers but refuses to revive an archived one',
    async (visibility) => {
      const live = await save({ visibility });
      const archived = await save({ visibility });
      await metadataService.disconnect({
        id: archived.connectedAccount.id,
        workspaceId,
      });
      await setChoices([visibility === 'user' ? 'workspace' : 'user']);

      const result = await complete(
        await authorize({
          reconnectingConnectedAccountId: live.connectedAccount.id,
        }),
      );
      expect(result.connectedAccountId).toBe(live.connectedAccount.id);

      const revive = {
        reconnectingConnectedAccountId: archived.connectedAccount.id,
      };
      await expect(authorize(revive)).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
      });
      await expect(save({ ...revive, visibility })).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
      });
      expect(
        await accounts().findOneByOrFail({ id: archived.connectedAccount.id }),
      ).toMatchObject({
        archivedAt: expect.anything(),
        accessToken: null,
        refreshToken: null,
      });
    },
  );
});
