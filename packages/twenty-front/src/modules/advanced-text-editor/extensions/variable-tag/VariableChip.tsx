import { BaseChip } from '@/ui/input/components/BaseChip';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
`;

type VariableChipProps = Pick<NodeViewProps, 'deleteNode' | 'editor'> & {
  label: string;
  title?: string;
  leftIcon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

export const VariableChip = ({
  deleteNode,
  editor,
  label,
  title,
  leftIcon,
  selected,
  onClick,
}: VariableChipProps) => (
  <NodeViewWrapper
    as={StyledWrapper}
    style={{ whiteSpace: 'nowrap' }}
    onClick={onClick}
  >
    <BaseChip
      label={label}
      title={title}
      leftIcon={leftIcon}
      selected={selected}
      onRemove={
        editor.isEditable
          ? (event) => {
              event.stopPropagation();
              deleteNode();
            }
          : undefined
      }
      removeAriaLabel={t`Remove variable`}
    />
  </NodeViewWrapper>
);
