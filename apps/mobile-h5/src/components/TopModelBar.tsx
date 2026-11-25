import React from 'react';
import { Badge, Button, Space, Tag, Typography } from 'antd';
import { DatabaseOutlined, DownOutlined } from '@ant-design/icons';
import { AppColors, AppSpacing, AppTypography } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';
import type { ModelOptionId } from '../types/chat';

const { Text } = Typography;

interface TopModelBarProps {
  memoryCount: number;
  bffOnline: boolean;
  selectedModel: ModelOptionId;
  onOpenMemories: () => void;
  onOpenModelRouter: () => void;
}

const MODEL_SHORT_LABELS: Record<ModelOptionId, string> = {
  'gemini-2.5-flash': 'Gemini 2.5',
  'gemini-2.5-pro': 'Gemini Pro',
  'deepseek-v3-fallback': 'DeepSeek-V3',
};

export const TopModelBar: React.FC<TopModelBarProps> = ({
  memoryCount,
  bffOnline,
  selectedModel,
  onOpenMemories,
  onOpenModelRouter,
}) => {
  return (
    <header className="h5-header">
      <div
        style={{
          height: 52,
          paddingInline: AppSpacing.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: AppSpacing.sm,
        }}
      >
        <Button
          size="small"
          icon={<DatabaseOutlined />}
          onClick={onOpenMemories}
          style={{
            backgroundColor: AppColors.bgElevated,
            borderColor: AppColors.borderSubtle,
            fontSize: AppTypography.captionSize,
            flexShrink: 0,
          }}
        >
          {AppStrings.memoryBankPrefix}({memoryCount})
        </Button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
          }}
        >
          <Space size={4} align="center">
            <Text strong ellipsis style={{ fontSize: AppTypography.titleSize, color: AppColors.textPrimary }}>
              {AppStrings.appName}
            </Text>
            <Tag
              color="geekblue"
              style={{
                marginInlineEnd: 0,
                paddingInline: 5,
                lineHeight: '16px',
                fontSize: 10,
                fontFamily: AppTypography.fontMono,
              }}
            >
              {AppStrings.h5Badge}
            </Tag>
          </Space>
          <Badge
            status={bffOnline ? 'success' : 'warning'}
            text={
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: AppTypography.fontMono,
                  color: AppColors.textSecondary,
                }}
              >
                {bffOnline ? AppStrings.onlineLabel : AppStrings.offlineLabel}
              </Text>
            }
          />
        </div>

        <Button
          size="small"
          shape="round"
          onClick={onOpenModelRouter}
          style={{
            backgroundColor: AppColors.bgElevated,
            borderColor: AppColors.borderSubtle,
            color: AppColors.statusSuccess,
            fontFamily: AppTypography.fontMono,
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {MODEL_SHORT_LABELS[selectedModel]} <DownOutlined style={{ fontSize: 10 }} />
        </Button>
      </div>
    </header>
  );
};
