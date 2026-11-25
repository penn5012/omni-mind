import React from 'react';
import { Alert, Button, Card, Descriptions, Progress, Space, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ChatMessageItem } from '../types/chat';
import { AppColors, AppSpacing, AppTypography } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';
import { downloadCalendarIcs } from '../utils/h5NativeBridge';

const { Text, Title } = Typography;

interface GenerativeCardRendererProps {
  msg: ChatMessageItem;
  onToolApproval: (msgId: string, cardId: string, toolName: string, approved: boolean) => void;
  onArchiveExpense: (msgId: string) => void;
}

export const GenerativeCardRenderer: React.FC<GenerativeCardRendererProps> = ({
  msg,
  onToolApproval,
  onArchiveExpense,
}) => {
  const card = msg.uiCard;
  if (!card) return null;

  if (card.cardType === 'tool_approval_card') {
    const borderColor =
      card.status === 'approved'
        ? AppColors.statusSuccess
        : card.status === 'rejected'
        ? AppColors.statusError
        : AppColors.statusWarning;

    return (
      <Card
        size="small"
        style={{
          marginTop: AppSpacing.md,
          backgroundColor: AppColors.bgElevated,
          borderColor,
          borderWidth: 1.5,
        }}
        title={
          <Space size={6}>
            <SafetyCertificateOutlined style={{ color: borderColor }} />
            <Text strong style={{ color: borderColor, fontSize: 13 }}>
              日程写入审批 (HITL)
            </Text>
          </Space>
        }
        extra={
          <Tag
            color={card.status === 'pending' ? 'warning' : card.status === 'approved' ? 'success' : 'error'}
            style={{ marginInlineEnd: 0, fontSize: 11 }}
          >
            {card.status === 'pending' ? '等待确认' : card.status === 'approved' ? '✓ 已批准' : '✕ 已拒绝'}
          </Tag>
        }
      >
        <Descriptions
          column={1}
          size="small"
          bordered
          styles={{
            label: {
              width: 78,
              padding: '6px 8px',
              fontFamily: AppTypography.fontMono,
              fontSize: 11,
              color: AppColors.textSecondary,
            },
            content: {
              padding: '6px 8px',
              fontFamily: AppTypography.fontMono,
              fontSize: 12,
              wordBreak: 'break-word',
            },
          }}
        >
          <Descriptions.Item label="Tool">{card.toolName}</Descriptions.Item>
          <Descriptions.Item label="事项">{card.actionSummary}</Descriptions.Item>
          <Descriptions.Item label="时间">
            <Text style={{ color: AppColors.accentCyan, fontSize: 12 }}>{card.scheduledTime}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="冲突检测">
            <Text type="success" style={{ fontSize: 12 }}>
              {card.conflictCheck}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {card.status === 'pending' ? (
          <div style={{ marginTop: AppSpacing.md, display: 'flex', gap: AppSpacing.sm }}>
            <Button
              danger
              block
              size="middle"
              icon={<CloseCircleOutlined />}
              onClick={() => onToolApproval(msg.id, card.cardId, card.toolName, false)}
            >
              {AppStrings.rejectBtn}
            </Button>
            <Button
              type="primary"
              block
              size="middle"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                onToolApproval(msg.id, card.cardId, card.toolName, true);
                downloadCalendarIcs({
                  title: card.actionSummary,
                  description: `Tool: ${card.toolName} (${card.scheduledTime})`,
                });
              }}
            >
              {AppStrings.approveBtn}
            </Button>
          </div>
        ) : (
          <Alert
            style={{ marginTop: AppSpacing.md }}
            type={card.status === 'approved' ? 'success' : 'error'}
            showIcon
            message={<span style={{ fontSize: 12 }}>{msg.approvalResultText}</span>}
          />
        )}
      </Card>
    );
  }

  if (card.cardType === 'expense_card') {
    return (
      <Card
        size="small"
        style={{
          marginTop: AppSpacing.md,
          backgroundColor: AppColors.bgElevated,
          borderColor: AppColors.borderSubtle,
        }}
        title={<span style={{ fontSize: 13 }}>🧾 {card.merchant}</span>}
        extra={
          <Tag color="cyan" style={{ marginInlineEnd: 0, fontSize: 11 }}>
            {card.category}
          </Tag>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {card.items.map((item, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', justifyContent: 'space-between', gap: AppSpacing.sm }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                • {item.name}
              </Text>
              <Text style={{ fontFamily: AppTypography.fontMono, fontSize: 13, flexShrink: 0 }}>
                {card.currency}
                {item.price.toFixed(2)}
              </Text>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: AppSpacing.sm,
              borderTop: `1px solid ${AppColors.borderSubtle}`,
            }}
          >
            <Text type="secondary" style={{ fontSize: 11 }}>
              OCR {(card.confidence * 100).toFixed(0)}% • 占预算 {card.monthlyRatioPercent}%
            </Text>
            <Title
              level={4}
              style={{
                margin: 0,
                color: AppColors.statusSuccess,
                fontFamily: AppTypography.fontMono,
              }}
            >
              {card.currency}
              {card.totalAmount.toFixed(2)}
            </Title>
          </div>

          {msg.archivedExpense ? (
            <Alert type="success" showIcon message={AppStrings.archivedExpenseLabel} />
          ) : (
            <Button
              type="primary"
              block
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => onArchiveExpense(msg.id)}
            >
              {AppStrings.archiveExpenseBtn}
            </Button>
          )}
        </Space>
      </Card>
    );
  }

  if (card.cardType === 'schedule_card') {
    return (
      <Card
        size="small"
        style={{
          marginTop: AppSpacing.md,
          backgroundColor: AppColors.bgElevated,
          borderColor: AppColors.borderSubtle,
        }}
        title={
          <Space size={6}>
            <CalendarOutlined style={{ color: AppColors.accentCyan }} />
            <span style={{ fontSize: 13 }}>{card.title}</span>
          </Space>
        }
        extra={
          <Tag color={card.hasConflict ? 'error' : 'success'} style={{ marginInlineEnd: 0, fontSize: 11 }}>
            {card.hasConflict ? '存在冲突' : '🟢 无冲突'}
          </Tag>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text style={{ fontFamily: AppTypography.fontMono, color: AppColors.accentCyan, fontSize: 12 }}>
            🕒 {card.startTime} - {card.endTime}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            📍 {card.location}
          </Text>
          <Button
            type="primary"
            ghost
            block
            size="small"
            icon={<DownloadOutlined />}
            onClick={() =>
              downloadCalendarIcs({
                title: card.title,
                location: card.location,
                description: `OmniMind H5 智能日程提取 (${card.startTime} - ${card.endTime})`,
              })
            }
          >
            {AppStrings.exportCalendarBtn}
          </Button>
        </Space>
      </Card>
    );
  }

  if (card.cardType === 'analytics_card') {
    return (
      <Card
        size="small"
        style={{
          marginTop: AppSpacing.md,
          backgroundColor: AppColors.bgElevated,
          borderColor: AppColors.borderSubtle,
        }}
        title={
          <Space size={6}>
            <PieChartOutlined style={{ color: AppColors.accentPrimary }} />
            <span style={{ fontSize: 13 }}>{card.periodTitle}</span>
          </Space>
        }
        extra={
          <Text
            strong
            style={{
              color: AppColors.statusSuccess,
              fontFamily: AppTypography.fontMono,
              fontSize: 13,
            }}
          >
            ¥{card.totalAmount.toFixed(2)}
          </Text>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {card.categories.map((cat, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <Text type="secondary">
                  {cat.label} ({cat.percent}%)
                </Text>
                <Text style={{ fontFamily: AppTypography.fontMono }}>¥{cat.amount}</Text>
              </div>
              <Progress
                percent={cat.percent}
                size="small"
                showInfo={false}
                strokeColor={
                  cat.colorToken === 'accentPrimary'
                    ? AppColors.accentPrimary
                    : cat.colorToken === 'accentCyan'
                    ? AppColors.accentCyan
                    : AppColors.statusSuccess
                }
              />
            </div>
          ))}
          <Alert type="info" showIcon message={<span style={{ fontSize: 12 }}>{card.aiInsight}</span>} />
        </Space>
      </Card>
    );
  }

  return null;
};
