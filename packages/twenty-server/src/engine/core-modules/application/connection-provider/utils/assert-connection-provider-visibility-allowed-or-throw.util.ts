import { msg } from '@lingui/core/macro';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const assertConnectionProviderVisibilityAllowedOrThrow = ({
  provider,
  visibility,
  reconnectTarget,
}: {
  provider: Pick<ConnectionProviderEntity, 'allowedVisibilities'>;
  visibility: ConnectedAccountVisibility;
  reconnectTarget: Pick<
    ConnectedAccountEntity,
    'visibility' | 'archivedAt'
  > | null;
}): void => {
  // App updates must preserve reconnects of live connections without grandfathering sharing or reviving archived ones.
  const isGrandfatheredReconnect =
    isDefined(reconnectTarget) &&
    !isDefined(reconnectTarget.archivedAt) &&
    reconnectTarget.visibility === visibility;

  if (
    isGrandfatheredReconnect ||
    provider.allowedVisibilities.includes(visibility)
  ) {
    return;
  }

  throw new ConnectionProviderException(
    `The connection provider does not allow ${visibility} connections.`,
    ConnectionProviderExceptionCode.INVALID_REQUEST,
    {
      userFriendlyMessage:
        visibility === 'user'
          ? msg`This provider only supports connections shared with the workspace.`
          : msg`This provider only supports personal connections.`,
    },
  );
};
