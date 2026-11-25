import React from 'react';
import { Card, Drawer, Radio, Space, Switch, Typography } from 'antd';
import { AppColors, AppSpacing } from '../theme/tokens';
import { AppStrings } from '../l10n/strings';
import type { ModelOptionId } from '../types/chat';

const { Text } = Typography;

interface ModelRouterDrawerProps {
  open: boolean;
  selectedModel: ModelOptionId;
  enableAutoFallback: boolean;
  enableOnDeviceMasking: boolean;
  onChangeModel: (model: ModelOptionId) => void;
  onChangeAutoFallback: (enabled: boolean) => void;
  onChangeMasking: (enabled: boolean) => void;
  onClose: () => void;
}

export const ModelRouterDrawer: React.FC<ModelRouterDrawerProps> = ({
  open,
  selectedModel,
  enableAutoFallback,
  enableOnDeviceMasking,
  onChangeModel,
  onChangeAutoFallback,
  onChangeMasking,
  onClose,
}) => {
  return (
    <Drawer
      title={`⚙️ ${AppStrings.modelRouterTitle}`}
      placement="bottom"
      height="70%"
      open={open}
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
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card size="small" title="1. 主推理模型 (@google/genai)" style={{ backgroundColor: AppColors.bgElevated }}>
          <Radio.Group
            value={selectedModel}
            onChange={(e) => onChangeModel(e.target.value as ModelOptionId)}
            style={{ display: 'flex', flexDirection: 'column', gap: AppSpacing.md }}
          >
            <Radio value="gemini-2.5-flash">Gemini 2.5 Flash（默认：多模态极速 / TTFT ~320ms）</Radio>
            <Radio value="gemini-2.5-pro">Gemini 2.5 Pro（复杂 LangGraph 多步规划推理）</Radio>
            <Radio value="deepseek-v3-fallback">DeepSeek-V3（手动强制切换 OpenAI 兼容备用网关）</Radio>
          </Radio.Group>
        </Card>

        <Card size="small" title="2. 自动容灾降级与浏览器本地脱敏" style={{ backgroundColor: AppColors.bgElevated }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: AppSpacing.md }}>
              <Text style={{ fontSize: 13 }}>主模型超时 (&gt;5s) 自动无缝 Fallback 至 DeepSeek-V3 / Qwen</Text>
              <Switch checked={enableAutoFallback} onChange={onChangeAutoFallback} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: AppSpacing.md }}>
              <Text style={{ fontSize: 13 }}>H5 端上传前自动本地脱敏手机号 / 身份证号</Text>
              <Switch checked={enableOnDeviceMasking} onChange={onChangeMasking} />
            </div>
          </Space>
        </Card>
      </Space>
    </Drawer>
  );
};
