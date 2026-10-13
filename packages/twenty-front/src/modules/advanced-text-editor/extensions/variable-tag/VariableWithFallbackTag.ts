import { ReactNodeViewRenderer } from '@tiptap/react';

import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { VariableWithFallbackChip } from '@/advanced-text-editor/extensions/variable-tag/VariableWithFallbackChip';

export const VariableWithFallbackTag = VariableTag.extend({
  addNodeView() {
    return ReactNodeViewRenderer(VariableWithFallbackChip);
  },
});
