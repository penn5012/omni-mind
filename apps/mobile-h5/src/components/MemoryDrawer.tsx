import React from 'react';
import { Card, Drawer, Empty, Space, Tag, Typography } from 'antd';
import type { CitationItem } from '@omnimind/shared-schema';
import { AppColors, AppSpacing, AppTypography } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';

const { Text } = Typography;

interface MemoryDrawerProps {
  open: boolean;
  totalCount: number;
  memories: CitationItem[];
  onSelectMemory: (item: CitationItem) => void;
  onClose: () => void;
}

export const MemoryDrawer: React.FC<MemoryDrawerProps> = ({
  open,
  totalCount,
  memories,
  onSelectMemory,
  onClose,
}) => {
  return (
    <Drawer
      title={`🧠 ${AppStrings.memoryDrawerTitle}`}
      placement="bottom"
      height="68%"
      open={open}
      onClose={onClose}
      extra={
        <Tag color="cyan" style={{ fontFamily: AppTypography.fontMono, marginInlineEnd: 0 }}>
          共 {totalCount} 条切片
        </Tag>
      }
      styles={{
        wrapper: { maxWidth: 480, margin: '0 auto' },
        header: {
          backgroundColor: AppColors.bgSurface,
          borderBottom: `1px solid ${AppColors.borderSubtle}`,
        },
        body: {
          backgroundColor: AppColors.bgSurface,
          padding: AppSpacing.md,
        },
      }}
    >
      {memories.length === 0 ? (
        <Empty description="暂无记忆切片" />
      ) : (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {memories.map((item) => (
            <Card
              key={item.id}
              size="small"
              hoverable
              onClick={() => {
                onClose();
                onSelectMemory(item);
              }}
              style={{
                backgroundColor: AppColors.bgElevated,
                borderColor: AppColors.borderSubtle,
              }}
            >
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: AppSpacing.sm }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {item.title}
                  </Text>
                  <Tag color="success" style={{ marginInlineEnd: 0, fontFamily: AppTypography.fontMono }}>
                    {item.rrfScore}
                  </Tag>
                </div>
                <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                  {item.snippet}
                </Text>
                <Space wrap size={[4, 4]}>
                  <Text type="secondary" style={{ fontSize: 11, fontFamily: AppTypography.fontMono }}>
                    {item.createdAt}
                  </Text>
                  {item.tags.map((t) => (
                    <Tag key={t} style={{ marginInlineEnd: 0, fontSize: 11 }}>
                      {t}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </Drawer>
  );
};
