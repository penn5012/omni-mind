import React, { useRef } from 'react';
import { Button, Input, Space, Tag, Typography } from 'antd';
import {
  AudioOutlined,
  CameraOutlined,
  CloseCircleOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { AppColors, AppSpacing } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';
import type { LocalImageAttachment, ScenarioHint } from '../types/chat';
import { compressImageFile } from '../utils/h5NativeBridge';

const { Text } = Typography;

interface MultimodalComposerProps {
  inputText: string;
  isStreaming: boolean;
  isListening: boolean;
  attachedPhoto: LocalImageAttachment | null;
  onChangeInput: (val: string) => void;
  onAttachPhoto: (photo: LocalImageAttachment | null) => void;
  onToggleVoice: () => void;
  onSend: (text: string, hint?: ScenarioHint, forcePhoto?: boolean) => void;
  onStop: () => void;
}

export const MultimodalComposer: React.FC<MultimodalComposerProps> = ({
  inputText,
  isStreaming,
  isListening,
  attachedPhoto,
  onChangeInput,
  onAttachPhoto,
  onToggleVoice,
  onSend,
  onStop,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    onAttachPhoto(compressed);
    e.target.value = '';
  };

  return (
    <>
      {/* Horizontally scrollable quick-action pill bar (mobile zero-overflow) */}
      <div className="h5-quick-bar">
        <Button
          size="small"
          shape="round"
          style={{ flexShrink: 0 }}
          onClick={() =>
            onSend('帮我把白板上的架构评审时间加到日历，并查上周预算上限', 'whiteboard_schedule', true)
          }
        >
          {AppStrings.quickWhiteboard}
        </Button>
        <Button
          size="small"
          shape="round"
          style={{ flexShrink: 0 }}
          onClick={() => onSend('帮我识别这张星巴克咖啡小票并归档记账', 'receipt_expense', true)}
        >
          {AppStrings.quickReceipt}
        </Button>
        <Button
          size="small"
          shape="round"
          style={{ flexShrink: 0 }}
          onClick={() => onSend('检索我上周拍的 Q4 AI 基建预算上限是多少？', 'rag_budget', false)}
        >
          {AppStrings.quickRag}
        </Button>
        <Button
          size="small"
          shape="round"
          style={{ flexShrink: 0 }}
          onClick={() => onSend('统计汇总我 11 月份的消费开销分类占比', 'monthly_analytics', false)}
        >
          {AppStrings.quickAnalytics}
        </Button>
      </div>

      {/* Bottom Sticky Composer */}
      <footer className="h5-composer">
        {attachedPhoto && (
          <div
            style={{
              marginBottom: AppSpacing.sm,
              padding: AppSpacing.sm,
              borderRadius: 10,
              backgroundColor: AppColors.bgElevated,
              border: `1px solid ${AppColors.borderSubtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: AppSpacing.sm,
            }}
          >
            <Space size={8} style={{ minWidth: 0 }}>
              {attachedPhoto.previewUrl && (
                <img
                  src={attachedPhoto.previewUrl}
                  alt={attachedPhoto.fileName}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'cover',
                    borderRadius: 6,
                    border: `1px solid ${AppColors.accentCyan}`,
                  }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <Text ellipsis style={{ fontSize: 12, display: 'block', maxWidth: 220 }}>
                  📷 {attachedPhoto.fileName}
                </Text>
                <Tag color="cyan" style={{ fontSize: 10, marginInlineEnd: 0 }}>
                  Canvas 已压缩 • 准备多模态解析
                </Tag>
              </div>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => onAttachPhoto(null)}
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: AppSpacing.sm }}>
          <Button
            type={attachedPhoto ? 'primary' : 'default'}
            shape="circle"
            icon={<CameraOutlined />}
            aria-label="拍照或选择图片"
            onClick={() => fileInputRef.current?.click()}
            style={{ flexShrink: 0 }}
          />

          <Input
            value={inputText}
            onChange={(e) => onChangeInput(e.target.value)}
            onPressEnter={() => onSend(inputText)}
            placeholder={isListening ? AppStrings.voiceListeningHint : AppStrings.inputPlaceholder}
            suffix={
              <AudioOutlined
                onClick={onToggleVoice}
                style={{
                  cursor: 'pointer',
                  color: isListening ? AppColors.statusError : AppColors.textSecondary,
                }}
              />
            }
            style={{
              borderRadius: 20,
              backgroundColor: AppColors.bgElevated,
              borderColor: isListening ? AppColors.statusError : AppColors.borderSubtle,
            }}
          />

          {isStreaming ? (
            <Button
              danger
              type="primary"
              shape="round"
              icon={<StopOutlined />}
              onClick={onStop}
              style={{ flexShrink: 0 }}
            >
              {AppStrings.stopGenerating}
            </Button>
          ) : (
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              aria-label={AppStrings.sendBtn}
              onClick={() => onSend(inputText)}
              style={{ flexShrink: 0 }}
            />
          )}
        </div>
      </footer>
    </>
  );
};
