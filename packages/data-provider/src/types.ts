import * as React from 'react';
import { TExample, TMessage, EModelEndpoint, TPlugin, TConversation, TPreset } from './schemas';

export * from './schemas';

export type TMessages = TMessage[];

export type TMessagesAtom = TMessages | null;

export type TSubmission = {
  clientId?: string;
  context?: string;
  conversationId?: string;
  conversationSignature?: string;
  current: boolean;
  endpoint: EModelEndpoint | null;
  invocationId: number;
  isCreatedByUser: boolean;
  jailbreak: boolean;
  jailbreakConversationId?: string;
  messageId: string;
  overrideParentMessageId?: string | boolean;
  parentMessageId?: string;
  sender: string;
  systemMessage?: string;
  text: string;
  toneStyle?: string;
  model?: string;
  promptPrefix?: string;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  frequence_penalty?: number;
  conversation: TConversation;
  message: TMessage;
  endpointOption: TEndpointOption;
};

export type TEndpointOption = {
  endpoint: EModelEndpoint | null;
  model?: string;
  promptPrefix?: string;
  temperature?: number;
};

export type TPluginAction = {
  pluginKey: string;
  action: 'install' | 'uninstall';
  auth?: unknown;
};

export type TTemplate = {
  [key: string]: TPlugin;
};

export type TUpdateUserPlugins = {
  pluginKey: string;
  action: string;
  auth?: unknown;
};

export type TOptionSettings = {
  showExamples?: boolean;
  isCodeChat?: boolean;
};

export type TUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  provider: string;
  plugins: string[];
  createdAt: string;
  updatedAt: string;
};

export type TGetConversationsResponse = {
  conversations: TConversation[];
  pageNumber: string;
  pageSize: string | number;
  pages: string | number;
};

export type TUpdateConversationRequest = {
  conversationId: string;
  title: string;
};

export type TUpdateConversationResponse = {
  data: TConversation;
};

export type TDeleteConversationRequest = {
  conversationId?: string;
  source?: string;
};

export type TDeleteConversationResponse = {
  acknowledged: boolean;
  deletedCount: number;
  messages: {
    acknowledged: boolean;
    deletedCount: number;
  };
};

export type TSearchResults = {
  conversations: TConversation[];
  messages: TMessage[];
  pageNumber: string;
  pageSize: string | number;
  pages: string | number;
  filter: object;
};

export type TEndpointsConfig = {
  azureOpenAI: {
    availableModels: [];
  } | null;
  bingAI: {
    availableModels: [];
  } | null;
  chatGPTBrowser: {
    availableModels: [];
  } | null;
  anthropic: {
    availableModels: [];
  } | null;
  google: {
    availableModels: [];
  } | null;
  openAI: {
    availableModels: [];
  } | null;
  gptPlugins: {
    availableModels: [];
    availableTools?: [];
    plugins?: [];
  } | null;
};

export type TUpdateTokenCountResponse = {
  count: number;
};

export type TMessageTreeNode = object;

export type TSearchMessage = object;

export type TSearchMessageTreeNode = object;

export type TRegisterUser = {
  name: string;
  email: string;
  username: string;
  password: string;
  confirm_password?: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  token: string;
  user: TUser;
};

export type TRequestPasswordReset = {
  email: string;
};

export type TResetPassword = {
  userId: string;
  token: string;
  password: string;
  confirm_password?: string;
};

export type TStartupConfig = {
  appTitle: boolean;
  googleLoginEnabled: boolean;
  openidLoginEnabled: boolean;
  githubLoginEnabled: boolean;
  openidLabel: string;
  openidImageUrl: string;
  discordLoginEnabled: boolean;
  serverDomain: string;
  registrationEnabled: boolean;
  socialLoginEnabled: boolean;
  emailEnabled: boolean;
};

export type TRefreshTokenResponse = {
  token: string;
  user: TUser;
};

export type TRequestPasswordResetResponse = {
  link?: string;
  message?: string;
};

export type File = {
  name: string;
  date: number;
  size: number;
};

export type SetOption = (param: number | string) => (newValue: number | string | boolean) => void;
export type SetExample = (
  i: number,
  type: string,
  newValue: number | string | boolean | null,
) => void;

export enum Side {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export type OptionHoverProps = {
  endpoint: string;
  type: string;
  side: Side;
};

export type BaseProps = {
  conversation: TConversation | TPreset | null;
  className?: string;
  isPreset?: boolean;
  readonly?: boolean;
};

export type SettingsProps = BaseProps & {
  setOption: SetOption;
};

export type TModels = {
  models: string[];
};

export type ModelSelectProps = SettingsProps & TModels;

export type ExamplesProps = {
  readonly?: boolean;
  className?: string;
  examples: TExample[];
  setExample: SetExample;
  addExample: () => void;
  removeExample: () => void;
};

export type GoogleProps = {
  showExamples: boolean;
  isCodeChat: boolean;
};

export type GoogleViewProps = SettingsProps & GoogleProps;
export type OptionComponent = React.FC<ModelSelectProps>;
export type MultiViewComponent = React.FC<BaseProps & TModels>;

export type SelectProps = {
  conversation: TConversation | null;
  setOption: SetOption;
  extraProps?: GoogleProps;
};

export type SetOptionsPayload = {
  setOption: SetOption;
  setExample: SetExample;
  addExample: () => void;
  removeExample: () => void;
  setAgentOption: SetOption;
  getConversation: () => TConversation | TPreset | null;
  checkPluginSelection: (value: string) => boolean;
  setTools: (newValue: string) => void;
};

export type UseSetOptions = (preset?: TPreset | boolean | null) => SetOptionsPayload;
export type UsePresetOptions = (preset?: TPreset | boolean | null) => SetOptionsPayload | boolean;

export type PopoverButton = {
  label: string;
  buttonClass: string;
  handler: () => void;
  icon: React.ReactNode;
};

export type EndpointOptionsPopoverProps = {
  children: React.ReactNode;
  visible: boolean;
  endpoint: EModelEndpoint;
  saveAsPreset: () => void;
  closePopover: () => void;
};

export type EditPresetProps = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  preset: TPreset;
  title?: string;
};

export type MultiSelectDropDownProps = {
  title?: string;
  value: Array<{ icon?: string; name?: string; isButton?: boolean }>;
  disabled?: boolean;
  setSelected: (option: string) => void;
  availableValues: TPlugin[];
  showAbove?: boolean;
  showLabel?: boolean;
  containerClassName?: string;
  isSelected: (value: string) => boolean;
  className?: string;
  optionValueKey?: string;
};

export type TError = {
  message: string;
  code?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export type CleanupPreset = {
  preset: Partial<TPreset>;
  endpointsConfig?: TEndpointsConfig | Record<string, unknown>;
};

export type PagesProps = {
  pages: number;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
};
