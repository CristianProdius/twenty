import { EmailThemedDocument } from '@/activities/emails/editor/extensions/EmailThemedDocument';
import { BlockDragAndDrop } from '@/advanced-text-editor/extensions/BlockDragAndDrop';
import { VariableWithFallbackTag } from '@/advanced-text-editor/extensions/variable-tag/VariableWithFallbackTag';
import { ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockExtensions';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const CAMPAIGN_BODY_EDITOR_PROFILE = {
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  documentExtension: EmailThemedDocument,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    VariableWithFallbackTag,
    ...ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS,
    BlockDragAndDrop,
  ],
} satisfies AdvancedTextEditorProfile;
