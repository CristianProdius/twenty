import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type AppConnectionDto } from 'src/engine/core-modules/application/connection-provider/connections/dtos/app-connection.dto';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type CreateArgs = {
  applicationId: string;
  workspaceId: string;
  requestUserWorkspaceId: string | null;
  providerName: string;
  handle: string;
  displayName?: string;
};

@Injectable()
export class ApplicationStaticConnectionsService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(ConnectionProviderEntity)
    private readonly connectionProviderRepository: WorkspaceScopedRepository<ConnectionProviderEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async createOrGet({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    providerName,
    handle,
    displayName,
  }: CreateArgs): Promise<AppConnectionDto> {
    const trimmedHandle = handle.trim();

    if (!isNonEmptyString(trimmedHandle)) {
      throw new ConnectionProviderException(
        'Static connection handle must be a non-empty string',
        ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
      );
    }

    const provider = await this.connectionProviderRepository.findOne(
      workspaceId,
      { where: { applicationId, name: providerName } },
    );

    if (!isDefined(provider)) {
      throw new ConnectionProviderException(
        `Connection provider "${providerName}" not found`,
        ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
      );
    }

    if (provider.type !== 'static') {
      throw new ConnectionProviderException(
        `Connection provider "${providerName}" is type "${provider.type}"; createAppStaticConnection requires type "static"`,
        ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
      );
    }

    const existing = await this.connectedAccountRepository.findOne({
      where: {
        applicationId,
        workspaceId,
        connectionProviderId: provider.id,
        handle: trimmedHandle,
        provider: ConnectedAccountProvider.APP,
      },
    });

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    if (isDefined(existing)) {
      return this.toDto({
        account: existing,
        providerName: provider.name,
        workspaceMemberId:
          flatWorkspaceMemberMaps.idByUserWorkspaceId[
            existing.userWorkspaceId
          ] ?? null,
      });
    }

    const userWorkspaceId = await this.resolveUserWorkspaceId({
      requestUserWorkspaceId,
      flatWorkspaceMemberMaps,
    });

    const normalizedDisplayName = isNonEmptyString(displayName?.trim())
      ? displayName.trim()
      : null;

    const created = this.connectedAccountRepository.create({
      workspaceId,
      applicationId,
      connectionProviderId: provider.id,
      provider: ConnectedAccountProvider.APP,
      handle: trimmedHandle,
      name: normalizedDisplayName ?? `${provider.displayName}`,
      visibility: 'workspace',
      userWorkspaceId,
      accessToken: null,
      refreshToken: null,
      scopes: [],
      authFailedAt: null,
      authFailedReason: null,
      lastCredentialsRefreshedAt: null,
    });

    const saved = await this.connectedAccountRepository.save(created);

    return this.toDto({
      account: saved,
      providerName: provider.name,
      workspaceMemberId:
        flatWorkspaceMemberMaps.idByUserWorkspaceId[saved.userWorkspaceId] ??
        null,
    });
  }

  private async resolveUserWorkspaceId({
    requestUserWorkspaceId,
    flatWorkspaceMemberMaps,
  }: {
    requestUserWorkspaceId: string | null;
    flatWorkspaceMemberMaps: {
      idByUserWorkspaceId: Partial<Record<string, string>>;
    };
  }): Promise<string> {
    if (isDefined(requestUserWorkspaceId)) {
      return requestUserWorkspaceId;
    }

    // Install/cron hooks have no request user; the column is NOT NULL, and
    // workspace visibility means the owner does not gate access.
    const fallbackUserWorkspaceId = Object.keys(
      flatWorkspaceMemberMaps.idByUserWorkspaceId,
    )[0];

    if (!isDefined(fallbackUserWorkspaceId)) {
      throw new ConnectionProviderException(
        'Cannot create a static connection: workspace has no members to own the row',
        ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
      );
    }

    return fallbackUserWorkspaceId;
  }

  private toDto({
    account,
    providerName,
    workspaceMemberId,
  }: {
    account: ConnectedAccountEntity;
    providerName: string;
    workspaceMemberId: string | null;
  }): AppConnectionDto {
    return {
      id: account.id,
      providerName,
      name: account.name ?? account.handle,
      handle: account.handle,
      visibility: account.visibility as 'user' | 'workspace',
      userWorkspaceId: account.userWorkspaceId,
      workspaceMemberId,
      accessToken: '',
      scopes: account.scopes ?? [],
      authFailedAt: account.authFailedAt?.toISOString() ?? null,
      authFailedReason: account.authFailedReason,
    };
  }
}
