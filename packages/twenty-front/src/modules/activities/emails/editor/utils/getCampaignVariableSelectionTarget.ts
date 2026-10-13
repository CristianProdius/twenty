import { type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import {
  type CampaignVariable,
  TIPTAP_NODE_TYPES,
  isDefined,
  parseCampaignVariable,
} from 'twenty-shared/utils';

export type CampaignVariableSelectionTarget = {
  pos: number;
  campaignVariable: CampaignVariable;
};

export const getCampaignVariableSelectionTarget = (
  editor: Editor,
): CampaignVariableSelectionTarget | null => {
  const { selection } = editor.state;

  if (
    !(selection instanceof NodeSelection) ||
    selection.node.type.name !== TIPTAP_NODE_TYPES.VARIABLE_TAG
  ) {
    return null;
  }

  const variable = selection.node.attrs.variable;
  const campaignVariable =
    typeof variable === 'string' ? parseCampaignVariable(variable) : undefined;

  if (!isDefined(campaignVariable)) {
    return null;
  }

  return { pos: selection.from, campaignVariable };
};
