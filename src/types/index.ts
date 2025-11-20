/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IconType } from 'react-icons';
import { FunctionComponent, SVGProps } from 'react';

export interface TokenData {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface Region {
  name: string;
  suffix: string;
  s3_bucket: string;
}

export interface Group {
  id: string;
  name: string;
  domain: string;
  region: Region;
  logo_s3_uri: string;
  profile_picture_s3_uri: string;
}

export interface UserData {
  user_id: string;
  email: string;
  given_name: string;
  family_name: string;
  locale: string;
  picture?: string;
  'custom:avatar': string;
  role: string;
  group: Group;
  app_sync_settings?: AppSyncSettings;
}

export interface AppSyncSettings {
    "API": {
        "Events": {
            "endpoint": string,
            "region": string,
            "defaultAuthMode": string,
            "apiKey": string
        }
    }
}

export interface AppSyncPayload {
  id: string;
  type: string;
  event: {
    service_id: string;
    use_push_notification: boolean;
    title: string;
    body: string;
    data: {
        [key: string]: string;
    };
  };
}

export interface UserBackendDetails {
  user_id: string;
  role: string;
  picture: string;
  'custom:avatar': string;
  group: Group;
  app_sync_settings?: AppSyncSettings;
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  type: 'mcq' | 'tf' | 'open';
  correct_answer?: string;
  reason?: string;
}

export interface Request {
  id: string;
  title: string;
  created_at: string;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  tfq_count?: number;
  mcq_count?: number;
  open_count?: number;
  questions: {
    type: string;
  }[];
}

export interface CreateUserRequestBody {
  cognito_id: string | undefined;
  email: string;
  role: string;
  name?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string;
}

export interface DeleteUserResponse {
  message: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface GetUsersByCourseResponse {
  data: User[];
}

export interface InviteUsersRequestBody {
  courseId: string;
  userIds: number[];
}

export interface CreateCourseRequestBody {
  title: string;
  description?: string;
}

export interface CreateCourseResponse {
  id: string;
  title: string;
  description?: string;
  teacher_id: number;
}

export interface UploadMaterialResponse {
  id: number;
  title: string;
  type: string;
  s3_uri: string;
  course_id: number;
  uploaded_at: string;
}

export interface InviteUsersRequestBody {
  course_id: number;
  student_emails: string[];
}

export interface InviteUsersResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Material {
  id: string;
  title: string;
  type: string;
  s3_uri: string;
  status: string | null;
  uploaded_at: string;
}

export interface ApiEndpoint {
  id?: string;
  method: string;
  headers: Record<string, string>;
  protocol: string;
  domain: string;
  path: string;
  query_params: string[];
}

export interface Settings {
  knowledge_base_filter_structure: string[];
  knowledge_base_filter_structure_mandatory: { key: string; values: string[] }[];
  api_endpoints?: ApiEndpoint[];
  languages?: string[];
  system_prompt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  materials: Material[];
  ingestion_status: 'IN_PROGRESS' | 'ERROR' | 'COMPLETED' | null;
  teacher_id?: string;
  settings?: Settings;
  conversation_access_token?: string;
  agent_id?: string;
  agent_alias_id?: string;
}

export interface Invite {
  id?: string;
  invite_code?: string;
  email: string;
  course_id: string;
  expires_at?: string;
  status?: string;
}

export interface UserInvite {
  invite_code: string;
  password: string;
  given_name: string;
  family_name: string;
  locale: string;
}

export enum stateMachineState {
  'IN_PROGRESS' = 'IN_PROGRESS',
  'SUCCEEDED' = 'SUCCEEDED',
}

export interface Criteria {
  key: string;
  description: string;
}

export interface Indicator {
  name: string;
  weight: number;
  criteria: Criteria[];
}

export interface IndicatorUpdate extends Omit<Indicator, 'criteria'> {
  criteria: Record<string, string>;
}

export interface RubricData {
  name: string;
  description: string;
  indicators: Indicator[];
}

export interface RubricUpdate extends Omit<RubricData, 'indicators'> {
  indicators: IndicatorUpdate[];
}

export enum PodcastStatus {
  'PROCESSING' = 'PROCESSING',
  'AUDIO' = 'AUDIO_GENERATION',
  'IMAGE' = 'IMAGE_GENERATION',
  'COMPLETED' = 'COMPLETED',
  'ERROR' = 'ERROR',
}

export interface PodcastDialogItem {
  speaker: string;
  text: string;
}

export interface PodcastDetailsResponse {
  audioUrl: string;
  imageUrl: string;
  title: string;
  dialog: PodcastDialogItem[];
}

export interface PodcastStatusResponse {
  podcast_id: string;
  status: PodcastStatus;
}

export interface PodcastDetailsItem extends PodcastDetailsResponse {
  id: string;
  completed_at?: string;
  status?: PodcastStatus;
}

export interface PodcastHistoryResponse {
  data: PodcastDetailsItem[];
}

export enum ModelCategory {
  Lightweight = 'lightweight',
  MidTier = 'mid-tier',
  HighEnd = 'high-end',
  Specialized = 'specialized',
}

export interface AIModel {
  id: number;
  name: string;
  provider: string;
  identifier: string;
  category: string;
  description: string;
  is_default: boolean;
  region_name: string;
  region_suffix: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  input_modalities?: string;
  output_modalities?: string;
  supports_knowledge_base?: boolean;
  inference?: boolean;
}

export interface SelectableItem {
  id: string | number;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  code: string;
  isknowledgebase: boolean;
}

export interface ServiceUI extends Service {
  icon: IconType | FunctionComponent<SVGProps<SVGSVGElement>>;
  bgColor: string;
  url?: string;
}

export interface ComparisonEngineCreateRequest {
  process_id: string;
  name: string;
  description?: string;
  document1_id: string;
  document2_id: string;
  rules_ids: string[];
  config_id: string;
  language: string;
  model: string;
}

export interface ComparisonEngineRule {
  id?: string;
  name: string;
  description: string;
  type?: string;
  data: {
    rules: Rule[];
  };
}

export interface Rule {
  name: string;
  description: string;
  subRules: SubRule[];
  priority: 'high' | 'medium' | 'low';
  isMandatory: boolean;
}

export interface SubRule {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isMandatory: boolean;
}

export interface Chatbot {
  chatbot_id: string;
  chatbot_name: string;
  chatbot_system_prompt: string;
  messages: ChatbotMessage[];
  updated_at: string;
}

export interface ChatbotList {
  chatbot_id: string;
  chatbot_name: string;
  chatbot_system_prompt: string;
  updated_at: string;
  materials?: ChatbotFile[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
}

export interface ChatbotFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface ChatbotMessage {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatbotConversation {
  id: string;
  chatbot_id: string;
  messages: ChatbotMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatbotResponse {
  chatbot_id: string;
  chatbot_name: string;
  chatbot_status: string;
  chatbot_system_prompt: string;
  messages: ChatbotMessage[];
}

export interface ChatbotResource {
  resource_id: string;
  resource_name: string;
  resource_type: 'chatbot_material' | 'course_material' | 'course_knowledge_base';
}

export interface AnalyticsRequest {
  request_id: string;
  title: string;
  created_at: string;
  model: string;
  model_info: {
    name: string;
    provider: string;
    category: string;
    description: string;
  };
  request_tokens: number;
  response_tokens: number;
  processing_time: number;
  estimated_cost: number;
  status: string;
  response_type: string;
  user_id: string;
  user_name: string;
}

export interface ServiceAnalytics {
  service_code: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  requests: AnalyticsRequest[];
}

export interface UserAnalytics {
  name: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  services: {
    [key: string]: {
      total_requests: number;
      total_tokens: number;
      total_cost: number;
    };
  };
}

export interface AnalyticsData {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  services: {
    [key: string]: ServiceAnalytics;
  };
  users?: {
    [key: string]: UserAnalytics;
  };
}

export interface AnalyticsResponse {
  analytics: AnalyticsData;
}

export interface CourseUpdateContextType {
  triggerUpdate: () => void;
  updateTrigger: number;
}

export interface LTIPlatform {
  client_id: string;
  issuer: string;
  platform_type: string;
  auth_login_url: string;
  auth_token_url: string;
  key_set_url: string;
  deployment_ids: string[];
}

export type LTIPlatformUpdate = Omit<LTIPlatform, 'client_id' | 'issuer' | 'platform_type'>;

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
  data?: Record<string, any>;
  style?: 'primary' | 'secondary' | 'danger' | 'default';
}

export interface Notification {
  id: string;
  user_id: string;
  service_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  use_push_notification: boolean;
  is_read: boolean;
  actions?: NotificationAction[];
  notification_type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateNotificationRequest {
  user_id: string;
  service_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  notification_type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
}

export interface NotificationFilters {
  limit?: number;
  offset?: number;
  is_read?: boolean;
  notification_type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  service_id?: string;
}

export interface NotificationMetrics {
  total_unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  by_service: Record<string, number>;
  recent_notifications: {
    id: string;
    title: string;
    body: string;
    notification_type: 'info' | 'success' | 'warning' | 'error';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    service_id: string;
    created_at: string;
    has_actions: boolean;
  }[];
  filter_days: number;
}

// Topics Configuration Types
export interface TopicsConfiguration {
  overwrite: boolean;
  max_supertopics: number;
}

export interface TopicsConfigurationDB {
  id: string;
  type: string;
  configuration: TopicsConfiguration;
  created_at: string;
  updated_at: string;
}

export interface TopicsDistribution {
  [globalTopic: string]: {
    count: number;
    chatbots: {
      id: string;
      topics: string;
    }[];
  };
}

// Service Token Types
export interface ServiceTokenCreate {
  name: string;
  description?: string;
  expires_in_days: number;
}

export interface ServiceTokenWithSecret {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  is_active: boolean;
  token: string;
}

export type ServiceToken = Omit<ServiceTokenWithSecret, 'token'>;

export interface ServiceTokenList {
  tokens: ServiceToken[];
  total: number;
}