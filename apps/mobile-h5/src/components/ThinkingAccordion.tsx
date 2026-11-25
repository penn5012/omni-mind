import React from 'react';
import { Collapse, Space, Typography } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import type { ThinkingEvent } from '@omnimind/shared-schema';
import { AppColors, AppSpacing, AppTypography } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';

const { Text } = Typography;

interface ThinkingAccordionProps {
  thinking: ThinkingEvent;
}

export const ThinkingAccordion: React.FC<ThinkingAccordionProps> = ({ thinking }) => {
  return (
    <Collapse
      size="small"
      defaultActiveKey={['thinking']}
      style={{
        marginBottom: AppSpacing.md,
        backgroundColor: AppColors.bgElevated,
        borderColor: AppColors.borderSubtle,
      }}
      items={[
        {
          key: 'thinking',
          label: (
            <Space size={6}>
              <ExperimentOutlined style={{ color: AppColors.accentCyan }} />
              <Text
                style={{
                  fontFamily: AppTypography.fontMono,
                  fontSize: AppTypography.captionSize,
                  color: AppColors.accentCyan,
                }}
              >
                {AppStrings.thinkingDonePrefix} ({thinking.durationMs}ms)
              </Text>
            </Space>
          ),
          children: (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {thinking.steps.map((step) => (
                <Text
                  key={step.id}
                  type="secondary"
                  className="h5-break-word"
                  style={{
                    fontFamily: AppTypography.fontMono,
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  ├─ {step.label}：{step.detail}
                </Text>
              ))}
            </Space>
          ),
        },
      ]}
    />
  );
};
