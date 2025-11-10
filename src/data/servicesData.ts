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
