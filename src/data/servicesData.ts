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

import {
  FaClipboardCheck,
  FaFileAlt,
  FaList,
  FaPen,
  FaStream,
  FaPodcast,
  FaBalanceScale,
  FaBook,
} from 'react-icons/fa';
import { AiEditor } from '../images/icons';

export const servicesData = [
  {
    code: 'translation_service',
    icon: FaList,
    bgColor: 'bg-orange-200',
    url: '/translator',
  },
  {
    code: 'questions_generator_service',
    icon: FaStream,
    bgColor: 'bg-red-200',
    url: '/exam-requests',
  },
  {
    code: 'content_query_service',
    icon: FaPen,
    bgColor: 'bg-purple-200',
    url: '/chatbot',
  },
  {
    code: 'transcription_service',
    icon: FaFileAlt,
    bgColor: 'bg-purple-200',
    url: '/transcripts',
  },
  {
    code: 'ai_rich_text_editor_service',
    icon: AiEditor,
    bgColor: 'bg-red-200',
    url: '/ai-editor',
  },
  {
    code: 'evaluations_service',
    icon: FaClipboardCheck,
    bgColor: 'bg-yellow-200',
    url: '/evaluations',
  },
  {
    code: 'podcast_generator',
    icon: FaPodcast,
    bgColor: 'bg-green-200',
    url: '/podcasts',
  },
  {
    code: 'comparison_engine',
    icon: FaBalanceScale,
    bgColor: 'bg-blue-200',
    url: '/comparison-engine',
  },
  {
    code: 'knowledge_base_manager',
    icon: FaBook,
    bgColor: 'bg-green-200',
    url: '/knowledge-base',
  },
];

export const knowledgebaseServicesData = [
  {
    code: 'knowledge_base_chat_service',
    icon: FaPen,
    bgColor: 'bg-purple-200',
    url: '/ask-agent',
  },
  {
    code: 'knowledge_base_questions_generator',
    icon: FaStream,
    bgColor: 'bg-red-200',
    url: '/exam-generator',
  },
];
