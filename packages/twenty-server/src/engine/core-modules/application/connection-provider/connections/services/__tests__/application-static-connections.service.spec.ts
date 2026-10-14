import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ApplicationStaticConnectionsService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-static-connections.service';

describe('ApplicationStaticConnectionsService', () => {
  const workspaceId = 'ws-1';
  const applicationId = 'app-1';
  const providerId = 'provider-1';

  const staticProvider = {
    id: providerId,
    name: 'telegram-bot',
    displayName: 'Telegram Bot',
    type: 'static' as const,
    applicationId,
    workspaceId,
  };

  const oauthProvider = {
    ...staticProvider,
    name: 'linear',
    displayName: 'Linear',
    type: 'oauth' as const,
  };

  const createService = ({
    provider = staticProvider,
    existingAccount = null,
    savedAccount,
    memberMaps = {
      idByUserWorkspaceId: { 'uw-fallback': 'wm-fallback' },
    },
  }: {
    provider?: typeof staticProvider | typeof oauthProvider | null;
    existingAccount?: Record<string, unknown> | null;
    savedAccount?: Record<string, unknown>;
    memberMaps?: { idByUserWorkspaceId: Partial<Record<string, string>> };
  } = {}) => {
    const connectedAccountRepository = {
      findOne: jest.fn().mockResolvedValue(existingAccount),
      create: jest.fn((data) => data),
      save: jest.fn().mockImplementation(async (data) => ({
        id: 'conn-new',
        ...data,
        ...(savedAccount ?? {}),
      })),
    };

    const connectionProviderRepository = {
      findOne: jest.fn().mockResolvedValue(provider),
    };

    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatWorkspaceMemberMaps: memberMaps,
      }),
    };

    const service = new ApplicationStaticConnectionsService(
      connectedAccountRepository as never,
      connectionProviderRepository as never,
      workspaceCacheService as never,
    );

    return {
      service,
      connectedAccountRepository,
      connectionProviderRepository,
      workspaceCacheService,
    };
  };

  it('creates a workspace-visible APP connection with no tokens', async () => {
    const { service, connectedAccountRepository } = createService();

    const result = await service.createOrGet({
      applicationId,
      workspaceId,
      requestUserWorkspaceId: 'uw-requester',
      providerName: 'telegram-bot',
      handle: 'tg-bot:easybac_help_bot',
      displayName: 'Easy Bac Help',
    });

    expect(connectedAccountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: ConnectedAccountProvider.APP,
        handle: 'tg-bot:easybac_help_bot',
        name: 'Easy Bac Help',
        visibility: 'workspace',
        userWorkspaceId: 'uw-requester',
        accessToken: null,
        refreshToken: null,
        scopes: [],
        connectionProviderId: providerId,
        applicationId,
        workspaceId,
      }),
    );
    expect(result).toMatchObject({
      id: 'conn-new',
      providerName: 'telegram-bot',
      handle: 'tg-bot:easybac_help_bot',
      visibility: 'workspace',
      accessToken: '',
      scopes: [],
    });
  });

  it('is idempotent on (provider, handle) and returns the existing connection', async () => {
    const existing = {
      id: 'conn-existing',
      handle: 'tg-bot:easybac_help_bot',
      name: 'Existing',
      visibility: 'workspace',
      userWorkspaceId: 'uw-owner',
      scopes: [],
      authFailedAt: null,
      authFailedReason: null,
    };
    const { service, connectedAccountRepository } = createService({
      existingAccount: existing,
    });

    const result = await service.createOrGet({
      applicationId,
      workspaceId,
      requestUserWorkspaceId: 'uw-requester',
      providerName: 'telegram-bot',
      handle: 'tg-bot:easybac_help_bot',
    });

    expect(connectedAccountRepository.save).not.toHaveBeenCalled();
    expect(result.id).toBe('conn-existing');
    expect(result.workspaceMemberId).toBeNull();
  });

  it('falls back to a workspace member when the request has no user', async () => {
    const { service, connectedAccountRepository } = createService();

    await service.createOrGet({
      applicationId,
      workspaceId,
      requestUserWorkspaceId: null,
      providerName: 'telegram-bot',
      handle: 'tg-bot:easybac_help_bot',
    });

    expect(connectedAccountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userWorkspaceId: 'uw-fallback',
      }),
    );
  });

  it('rejects a non-static provider', async () => {
    const { service } = createService({ provider: oauthProvider });

    await expect(
      service.createOrGet({
        applicationId,
        workspaceId,
        requestUserWorkspaceId: 'uw-requester',
        providerName: 'linear',
        handle: 'user@example.com',
      }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
    });
  });

  it('rejects an unknown provider name', async () => {
    const { service } = createService({ provider: null });

    await expect(
      service.createOrGet({
        applicationId,
        workspaceId,
        requestUserWorkspaceId: 'uw-requester',
        providerName: 'missing',
        handle: 'tg-bot:x',
      }),
    ).rejects.toBeInstanceOf(ConnectionProviderException);
  });
});
