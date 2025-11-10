// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import ConfirmUser from './pages/ConfirmUser';
import './App.css';
import ExamGenerator from './pages/ExamGenerator/ExamGenerator';
import NotFound from './pages/NotFound';
import ProtectedRoute from './ProtectedRoute';
import Profile from './pages/Profile';
import Translator from './pages/Translator';
import ExamRequests from './pages/ExamGenerator/ExamRequests';
import ExamQuestions from './pages/ExamGenerator/ExamQuestions';
import ContentChat from './pages/ContentChat';
import Transcriber from './pages/Transcriber';
import RouteError from './components/route-error';
import TranscriptionHistory from './pages/TranscriptionHistory';
import TranscriptPage from './pages/Transcript';
import Course from './pages/Course';
import CourseList from './pages/CourseList';
import CourseMaterials from './pages/CourseMaterials';
import InviteConfirmation from './pages/InviteConfirmation';
import KnowledgebaseGenerator from './pages/KnowlegebaseGenerator/KnowledgebaseGenerator';
import KnowledgebaseQuestionBank from './pages/KnowlegebaseGenerator/KnowledgebaseQuestionBank';
import KnowledgebaseChat from './pages/KnowledgebaseChat';
import ResetPassword from './pages/ResetPassword';
import RichTextEditor from './pages/RichTextEditor';
import EvaluationsTable from './pages/EvaluationsTable';
import RubricForm from './pages/RubricsForm';
import RubricsManagement from './pages/RubricsManagement';
import ViewEvaluation from './pages/ViewEvaluation';
import CreateEvaluation from './pages/CreateEvaluation';
import PodcastGenerator from './pages/PodcastGenerator';
import PodcastHistory from './pages/PodcastHistory';
import ComparisonEngine from './pages/ComparisonEngine';
import ComparisonEngineDashboard from './pages/CEDashboard';
import ComparisonEngineCreator from './pages/CECreator';
import ComparisonEngineView from './pages/CEView';
import ComparisonEngineRulesDashboard from './pages/CERulesDashboard';
import ComparisonEngineRuleView from './pages/CERuleView';
import ComparisonEngineRuleCreator from './pages/CERuleCreator';
import AdminPanel from './pages/AdminPanel';
import MainDashboard from './pages/MainDashboard';
import ChatbotDashboard from './pages/ChatbotDashboard';
import ChatbotCreator from './pages/ChatbotCreator';
import ChatbotChat from './pages/ChatbotChat';
import KnowledgebaseDashboard from './pages/KnowledgebaseDashboard';
import KnowledgebaseCreator from './pages/KnowledgebaseCreator';
import KnowledgebaseView from './pages/KnowledgebaseView';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { thirdPartyIntegrationService } from './services/api';
import { useEffect } from 'react';
import { initializeSentry } from './lib/sentry';
import useAuth from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/profile', element: <Profile /> },
      { path: '/dashboard', element: <MainDashboard /> },
      { path: '/admin', element: <AdminPanel /> },
      { path: '/analytics', element: <AnalyticsDashboard /> },
      { path: '/add-course', element: <Course /> },
      { path: '/course/:id', element: <CourseMaterials /> },
      { path: '/courses', element: <CourseList /> },
      { path: '/exam-generator', element: <ExamGenerator /> },
      { path: '/exam-requests', element: <ExamRequests /> },
      { path: '/request/:id', element: <ExamQuestions /> },
      { path: '/translator', element: <Translator /> },
      { path: '/content-chat', element: <ContentChat /> },
      { path: '/transcriber', element: <Transcriber /> },
      { path: '/transcripts', element: <TranscriptionHistory /> },
      { path: '/transcript/:id', element: <TranscriptPage /> },
      { path: '/podcasts', element: <PodcastHistory /> },
      { path: '/podcast-generator/:podcastId?', element: <PodcastGenerator /> },
      { path: '/podcast/:podcastId?', element: <PodcastGenerator /> },

      { path: '/:id/exam-generator', element: <KnowledgebaseGenerator /> },
      { path: '/:id/question-bank', element: <KnowledgebaseQuestionBank /> },
      { path: '/:id/ask-agent', element: <KnowledgebaseChat /> },
      { path: '/ai-editor', element: <RichTextEditor /> },

      { path: '/rubrics-management', element: <RubricsManagement /> },
      { path: '/rubrics/:id?', element: <RubricForm /> },
      { path: '/rubrics/edit/:id', element: <RubricForm isEdit={true} /> },
      { path: '/evaluations', element: <EvaluationsTable /> },
      { path: '/evaluations/create', element: <CreateEvaluation /> },
      { path: '/evaluations/view/:id', element: <ViewEvaluation /> },

      // Comparison engine routes
      { path: '/comparison-engine', element: <ComparisonEngine /> },
      { path: '/comparison-engine/:type', element: <ComparisonEngineDashboard /> },
      { path: '/comparison-engine/:type/create', element: <ComparisonEngineCreator /> },
      { path: '/comparison-engine/:type/view/:id', element: <ComparisonEngineView /> },
      { path: '/comparison-engine/rules', element: <ComparisonEngineRulesDashboard /> },
      { path: '/comparison-engine/rule/create', element: <ComparisonEngineRuleCreator /> },
      { path: '/comparison-engine/rule/view/:id', element: <ComparisonEngineRuleView /> },

      // Chatbot routes
      { path: '/chatbot', element: <ChatbotDashboard /> },
      { path: '/chatbot/create', element: <ChatbotCreator /> },
      { path: '/chatbot/:id', element: <ChatbotChat /> },

      // Knowledgebase routes
      { path: '/knowledge-base', element: <KnowledgebaseDashboard /> },
      { path: '/knowledge-base/create', element: <KnowledgebaseCreator /> },
      { path: '/knowledge-base/view/:id', element: <KnowledgebaseView /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/confirm', element: <ConfirmUser /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/invite/confirm/:inviteCode', element: <InviteConfirmation /> },
  { path: '*', element: <NotFound /> },
]);

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    const initializeSentryConfig = async () => {
      try {
        const integration =
          await thirdPartyIntegrationService.getPublicIntegrationByService('sentry');
        if (integration?.service_value?.dsn) {
          initializeSentry(integration.service_value.dsn, integration.service_value.environment);
        } else {
          console.warn('Sentry DSN not found in integration configuration');
        }
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
    };

    initializeSentryConfig();
  }, [user]);

  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}
