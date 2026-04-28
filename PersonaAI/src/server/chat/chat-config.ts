export const NVIDIA_CHAT_CONFIG = {
  baseURL: 'https://integrate.api.nvidia.com/v1',
  model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
  temperature: 0.6,
  topP: 0.95,
  maxTokens: 2048,
  reasoningBudget: 4096,
  enableThinking: true,
} as const;
