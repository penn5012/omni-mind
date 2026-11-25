import React from 'react';
import { Button, Card, Drawer, Space, Tag, Typography } from 'antd';
import type { CitationItem } from '@omnimind/shared-schema';
import { AppColors, AppRadius, AppSpacing, AppTypography } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';

const { Text } = Typography;

interface CitationDrawerProps {
  citation: CitationItem | null;
  onClose: () => void;
}

function renderHighlightedSnippet(snippet: string, highlightedTerm: string): React.ReactNode {
  if (!highlightedTerm || !snippet.includes(highlightedTerm)) {
    return snippet;
  }
  const idx = snippet.indexOf(highlightedTerm);
  const before = snippet.slice(0, idx);
  const after = snippet.slice(idx + highlightedTerm.length);
  return (
    <>
      {before}
      <mark
        style={{
          backgroundColor: AppColors.cyanTint,
          color: AppColors.textPrimary,
          padding: '1px 4px',
          borderRadius: 4,
          border: `1px solid ${AppColors.accentCyan}`,
        }}
      >
        {highlightedTerm}
      </mark>
      {after}
    </>
  );
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose }) => {
  return (
    <Drawer
      title={
        citation
          ? `${AppStrings.citationDrawerTitle} [#${citation.index}]`
          : AppStrings.citationDrawerTitle
      }
      placement="bottom"
      height="60%"
      open={Boolean(citation)}
      onClose={onClose}
      styles={{
        wrapper: { maxWidth: 480, margin: '0 auto' },
        header: {
          backgroundColor: AppColors.bgSurface,
          borderBottom: `1px solid ${AppColors.borderSubtle}`,
        },
        body: {
          backgroundColor: AppColors.bgSurface,
          padding: AppSpacing.lg,
        },
      }}
      extra={
        citation && (
          <Tag color="success" style={{ fontFamily: AppTypography.fontMono, marginInlineEnd: 0 }}>
            RRF: {citation.rrfScore}
          </Tag>
        )
      }
    >
      {citation && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ fontSize: AppTypography.titleSize, display: 'block' }}>
              {citation.title}
            </Text>
            <Space wrap size={[6, 6]} style={{ marginTop: AppSpacing.sm }}>
              <Tag color="cyan" style={{ fontFamily: AppTypography.fontMono, marginInlineEnd: 0 }}>
                {citation.chunkId}
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {citation.createdAt}
              </Text>
              {citation.tags.map((tag) => (
                <Tag key={tag} style={{ marginInlineEnd: 0 }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>

          <Card
            size="small"
            style={{
              backgroundColor: AppColors.bgPrimary,
              borderColor: AppColors.borderSubtle,
              borderRadius: AppRadius.md,
            }}
          >
            <Text
              className="h5-break-word"
              style={{
                fontFamily: AppTypography.fontMono,
                fontSize: AppTypography.captionSize,
                lineHeight: 1.7,
              }}
            >
              {renderHighlightedSnippet(citation.snippet, citation.highlightedTerm)}
            </Text>
          </Card>

          <Button block onClick={onClose}>
            {AppStrings.closeDrawerBtn}
          </Button>
        </Space>
      )}
    </Drawer>
  );
};
