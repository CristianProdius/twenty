import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { createStaticConnection } from '@/sdk/logic-function/connections/create-static-connection';
import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

const buildConnection = (
  overrides: Partial<AppConnection> = {},
): AppConnection => ({
  id: 'c-1',
  providerName: 'telegram-bot',
  name: 'Easy Bac Help',
  handle: 'tg-bot:easybac_help_bot',
  visibility: 'workspace',
  userWorkspaceId: 'uws-1',
  workspaceMemberId: 'wm-1',
  accessToken: '',
  scopes: [],
  authFailedAt: null,
  authFailedReason: null,
  ...overrides,
});

describe('createStaticConnection', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('creates a static connection over GraphQL and returns the response', async () => {
    const connection = buildConnection({ id: 'persisted' });

    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { createAppStaticConnection: connection } }),
        { status: 200 },
      ),
    );

    const result = await createStaticConnection({
      providerName: 'telegram-bot',
      handle: 'tg-bot:easybac_help_bot',
      displayName: 'Easy Bac Help',
      visibility: 'workspace',
    });

    expect(result).toEqual(connection);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(requestInit).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer app-token',
        }),
      }),
    );

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('createAppStaticConnection(input: $input)');
    expect(sentBody.variables).toEqual({
      input: {
        providerName: 'telegram-bot',
        handle: 'tg-bot:easybac_help_bot',
        displayName: 'Easy Bac Help',
      },
    });
  });

  it('surfaces non-2xx HTTP responses as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response('bad request', { status: 400, statusText: 'Bad Request' }),
    );

    await expect(
      createStaticConnection({
        providerName: 'telegram-bot',
        handle: 'tg-bot:x',
        visibility: 'workspace',
      }),
    ).rejects.toThrow(/HTTP 400/);
  });
});
