import {
  CreateUserRequestBody,
  UserResponse,
  DeleteUserResponse,
  GetUsersByCourseResponse,
  InviteUsersRequestBody,
  CreateCourseRequestBody,
  CreateCourseResponse,
  InviteUsersResponse,
  UploadMaterialResponse,
  Invite,
  UserInvite,
  Question,
  PodcastStatusResponse,
  PodcastDetailsResponse,
  PodcastHistoryResponse,
  RubricUpdate,
  AIModel,
  Service,
  UserBackendDetails,
  Material,
  ComparisonEngineCreateRequest,
  ComparisonEngineRule,
  Course,
  Chatbot,
  ChatbotResource,
  AnalyticsData,
  ApiEndpoint,
  LTIPlatform,
  LTIPlatformUpdate,
  NotificationFilters,
  NotificationResponse,
  Notification,
  CreateNotificationRequest,
  NotificationMetrics,
  TopicsConfiguration,
  TopicsConfigurationDB,
  TopicsDistribution,
  ServiceTokenCreate,
  ServiceTokenWithSecret,
  ServiceTokenList
} from '../types';
import client from './client';

interface ServiceValueResponse {
  id: string;
  service_value: Record<string, string>;
}

export const getConfig = async () => {
  try {
    const response = await client.get('/config');
    return response.data;
  } catch (error: any) {
    console.error('Error retrieving config');
    throw error;
  }
};

export const translateFile = async (formData: FormData, isBlob: boolean = false) => {
  try {
    const response = await client.post('/translate-file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Expose-Headers': 'Content-Disposition',
      },
      responseType: isBlob ? 'blob' : 'json',
    });
    return response;
  } catch (error) {
    console.error('Error translating file:', error);
    throw error;
  }
};

export const translateText = async (requestBody: any) => {
  try {
    const response = await client.post('/translate-text/', requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};

export const generateExam = async (formData: FormData) => {
  try {
    const response = await client.post('/generate-exam/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error generating exam:', error);
    throw error;
  }
};

export const getExams = async () => {
  try {
    const response = await client.get('/get-exams/');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const getAgentQuestions = async () => {
  try {
    const response = await client.get(`/generate-response/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching request detail:', error);
    throw error;
  }
};

export const getRequestDetail = async (id: string) => {
  try {
    const response = await client.get(`/get-request/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching request detail:', error);
    throw error;
  }
};

export const deleteExam = async (id: string) => {
  try {
    const response = await client.delete(`/exam/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

export const getQuestionBank = async (course_id: string) => {
  try {
    const response = await client.get(`/get-question-bank/${course_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question bank:', error);
    throw error;
  }
};

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await client.post('/upload-pdf/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export const uploadUrl = async (url: string) => {
  try {
    const response = await client.post(
      '/upload-url/',
      { url: url },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading URL:', error);
    throw error;
  }
};

export const askQuestion = async (docId: string, question: string, llm_id?: string) => {
  const formData = new FormData();
  formData.append('question', question);

  if (llm_id) {
    formData.append('llm_id', llm_id);
  }

  try {
    const response = await client.post(`/ask-question/${docId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
};

export const transcribeMedia = async (formData: FormData, async_processing: boolean = false) => {
  try {
    // If async_processing is true, add the parameter to the FormData
    if (async_processing) {
      formData.append('async_processing', 'true');
    }
    
    const response = await client.post('/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error transcribing media:', error);
    throw error;
  }
};

export const getTranscripts = async () => {
  try {
    const response = await client.get('/transcription-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    throw error;
  }
};

export const getTranscriptById = async (id: string) => {
  try {
    const response = await client.get(`/transcript/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

export const deleteTranscript = async (id: string) => {
  try {
    const response = await client.delete(`/transcript/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transcript:', error);
    throw error;
  }
};

export const getTranscriptionStatus = async (jobName: string) => {
  try {
    const { data } = await client.get(`/transcription-status/${jobName}`);
    return data;
  } catch (error) {
    console.error('Error fetching transcription status:', error);
    return { error: 'Failed to fetch transcription status.' };
  }
};

export const summarizeTranscript = async (
  transcript_id: number,
  transcript: string,
  language: string
) => {
  try {
    const response = await client.post(
      '/summarize',
      {
        transcript: transcript,
        language: language,
        transcript_id: transcript_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading URL:', error);
    throw error;
  }
};

export const generatePodcast = async (formData: FormData, async_processing: boolean = false): Promise<PodcastStatusResponse> => {
  try {
    // If async_processing is true, add the parameter to the FormData
    if (async_processing) {
      formData.append('async_processing', 'true');
    }
    
    const response = await client.post<PodcastStatusResponse>('/podcast/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating podcast:', error);
    throw error;
  }
};

export const getPodcastStatus = async (podcastId: string): Promise<PodcastStatusResponse> => {
  try {
    const response = await client.get<PodcastStatusResponse>(`/podcast/status/${podcastId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching podcast status:', error);
    throw error;
  }
};

export const getPodcastDetails = async (podcastId: string): Promise<PodcastDetailsResponse> => {
  try {
    const response = await client.get<PodcastDetailsResponse>(`/podcast/details/${podcastId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching podcast:', error);
    throw error;
  }
};

export const getPodcastUserHistory = async (): Promise<PodcastHistoryResponse> => {
  try {
    const response = await client.get<PodcastHistoryResponse>('/podcast/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching podcast history:', error);
    throw error;
  }
};

export const deletePodcast = async (podcastId: string) => {
  try {
    const response = await client.delete(`/podcast/${podcastId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting podcast:', error);
    throw error;
  }
};

export const createUser = async (data: CreateUserRequestBody): Promise<UserResponse> => {
  try {
    const response = await client.post('/users/', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<DeleteUserResponse> => {
  try {
    const response = await client.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUsersByCourse = async (courseId: number): Promise<GetUsersByCourseResponse> => {
  try {
    const response = await client.get(`/users/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users by course:', error);
    throw error;
  }
};

// Invite users to a course
export const inviteUsersToCourse = async (
  data: InviteUsersRequestBody
): Promise<InviteUsersResponse[]> => {
  try {
    const response = await client.post(`/courses/${data.course_id}/invite`, data.student_emails, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error inviting users to course:', error);
    throw error;
  }
};

// Get courses
export const getCourses = async (is_kbm: boolean = false): Promise<Course[]> => {
  try {
    const response = await client.get('/courses/', {
      params: {
        is_kbm: is_kbm,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
};

// Create a course
export const createCourse = async (
  data: CreateCourseRequestBody
): Promise<CreateCourseResponse> => {
  try {
    const response = await client.post('/courses/', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const startIngestion = async (CourseId: string): Promise<{ message: string }> => {
  try {
    const response = await client.get(`/courses/${CourseId}/ingestion`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error starting ingestion:', error);
    throw error;
  }
};

export const uploadMaterial = async (
  courseId: string,
  files: File[],
  extra_processing: boolean = false
): Promise<UploadMaterialResponse[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('course_id', courseId.toString());
  formData.append('extra_processing', extra_processing.toString());
  try {
    const response = await client.post(`/courses/${courseId}/materials/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading materials:', error);
    throw error;
  }
};

export const preprocessMaterials = async (courseId: string): Promise<{ message: string }> => {
  try {
    const response = await client.get(`/courses/${courseId}/materials/preprocess`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error preprocessing materials:', error);
    throw error;
  }
};

export const getMaterials = async (courseId: string) => {
  try {
    const response = await client.get(`/courses/${courseId}/materials/`);
    return response.data;
  } catch (error) {
    console.error('Error getting materials:', error);
    throw error;
  }
};

export const inviteUserToCourse = async (invite: Invite) => {
  try {
    const response = await client.post(`/courses/invites/`, invite, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

export const getInvitationsByCourse = async (courseId: string) => {
  try {
    const response = await client.get(`/courses/invites/${courseId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching invitations:', error);
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const confirmInvite = async (userData: UserInvite) => {
  try {
    const response = await client.post(`/courses/invites/confirm`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming invite:', error);
    throw error;
  }
};

export const validateInvite = async (inviteCode: string) => {
  try {
    const response = await client.get(`/courses/invites/validate/${inviteCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Error validating invite:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid or expired invite');
    }
    throw error;
  }
};

export const updateQuestion = async (id: string, updatedData: any) => {
  try {
    const response = await client.put(`/questions/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (id: string) => {
  try {
    const response = await client.delete(`/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

export const refreshQuestion = async (question: Question, prompt: string, kb_id = '') => {
  try {
    const response = await client.post(`/questions/refresh/`, {
      kb_id: kb_id,
      prompt: prompt,
      question: question,
    });
    return response.data;
  } catch (error) {
    console.error('Error refreshing question:', error);
    throw error;
  }
};

export const AgentExam = async (formData: FormData) => {
  try {
    const response = await client.post('/agent-exam/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error generating exam:', error);
    throw error;
  }
};

export const askQuestionAgent = async (
  courseId: string,
  question: string,
  materials: string[] = [],
  llm_id?: string
) => {
  const formData = new FormData();
  formData.append('question', question);

  if (materials.length > 0) {
    formData.append('materials', materials.join(','));
  }

  if (llm_id) {
    formData.append('llm_id', llm_id);
  }

  try {
    const response = await client.post(`/ask-agent/${courseId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
};

export const processText = async (
  text: string,
  action: string,
  startIndex: number | null,
  endIndex: number | null,
  tones: string[],
  audiences: string[],
  llm_id?: string
) => {
  try {
    const response = await client.post('/process_text', {
      text: text,
      action: action,
      start_index: startIndex,
      end_index: endIndex,
      tones: tones,
      audiences: audiences,
      llm_id: llm_id,
    });

    return response.data.response;
  } catch (error) {
    console.error('Error getting response for processText:', error);
  }
};

export const createKnowledgeBase = async (courseId: string) => {
  try {
    const response = await client.post(`/courses/${courseId}/state_machine`);
    return response.data;
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    throw error;
  }
};

export const pollStateMachine = async (courseId: string, execution_arn: string) => {
  try {
    const response = await client.post(`/courses/${courseId}/poll_state_machine`, {
      execution_arn: execution_arn,
    });
    return response.data;
  } catch (error) {
    console.error('Error polling state machine:', error);
    throw error;
  }
};

export const analyzeKnowledgeBase = async (courseId: string) => {
  const maxRetries = 3;
  let retryCount = 0;
  const delay = 30000;

  while (retryCount < maxRetries) {
    try {
      const response = await client.get(`/courses/${courseId}/analyze_knowledge_base`);
      const data = response.data;

      if (!data.summary || data.summary == '') {
        throw new Error('No summary found');
      } else {
        return data;
      }
    } catch (error: any) {
      console.error(
        `Error analyzing knowledge base (attempt ${retryCount + 1}/${maxRetries}):`,
        error
      );

      // Retry if not the last attempt
      if (retryCount < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
        continue;
      }

      throw error;
    }
  }
};

export const getSampleQuestions = async (courseId: string) => {
  try {
    const response = await client.get(`/courses/${courseId}/sample_questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const getIngestionStatus = async (courseId: string) => {
  try {
    const response = await client.get(`/courses/${courseId}/ingestion_status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching materials summary:', error);
  }
};

export const deleteMaterials = async (
  courseId: string,
  materialIds: string[],
  extraProcessing: boolean = false
) => {
  try {
    const response = await client.delete(`/courses/${courseId}/materials/`, {
      data: materialIds,
      params: {
        extra_processing: extraProcessing ? '1' : '0',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting materials:', error);
    throw error;
  }
};

/**
 * Fetch all rubrics.
 */
export const fetchRubrics = async () => {
  try {
    const response = await client.get('/evaluations/rubrics/');
    return response.data;
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    throw error;
  }
};

/**
 * Create a new rubric.
 * @param {Object} rubricData - The rubric data to create.
 */
export const createRubric = async (formData: FormData) => {
  const response = await client.post('/evaluations/rubrics/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing rubric.
 * @param {number} rubricId - The ID of the rubric to update.
 * @param {Object} rubricData - The updated rubric data.
 */
export const updateRubric = async (rubricId: string, rubricData: RubricUpdate) => {
  try {
    const response = await client.put(`/evaluations/rubrics/${rubricId}`, rubricData);
    return response.data;
  } catch (error) {
    console.error('Error updating rubric:', error);
    throw error;
  }
};

/**
 * Delete a rubric.
 * @param {number} rubricId - The ID of the rubric to delete.
 */
export const deleteRubric = async (rubricId: any) => {
  try {
    const response = await client.delete(`/evaluations/rubrics/${rubricId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting rubric:', error);
    throw error;
  }
};

/**
 * Fetch all evaluations.
 */
export const fetchEvaluations = async () => {
  try {
    const response = await client.get('/evaluations/');
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    throw error;
  }
};

/**
 * Re-evaluate an exam.
 * @param {FormData} formData - The form data containing evaluation ID, rubric ID, and the new exam file.
 */
export const reevaluateExam = async (formData: any) => {
  try {
    const response = await client.post('/evaluations/evaluate-exam/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error re-evaluating exam:', error);
    throw error;
  }
};

/**
 * Fetch a specific rubric by ID.
 * @param {number} rubricId - The ID of the rubric to fetch.
 */
export const fetchRubricById = async (rubricId: string) => {
  try {
    const response = await client.get(`/evaluations/rubrics/${rubricId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching rubric with ID ${rubricId}:`, error);
    throw error;
  }
};

/**
 * Delete an evaluation by ID.
 * @param {number} evaluationId - The ID of the evaluation to delete.
 */
export const deleteEvaluation = async (evaluationId: string) => {
  try {
    const response = await client.delete(`/evaluations/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw error;
  }
};

/**
 * Create a new evaluation.
 * @param {FormData} formData - The form data containing the exam file and rubric ID.
 * @returns {Promise<any>} - The response data from the API.
 */
export const createEvaluation = async (formData: FormData): Promise<any> => {
  try {
    const response = await client.post('/evaluations/evaluate-exam/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating evaluation:', error);
    throw error;
  }
};

/**
 * Fetch a single evaluation by ID.
 * @param {number} evaluationId - The ID of the evaluation to fetch.
 * @returns {Promise<any>} - The evaluation data.
 */
export const fetchEvaluationById = async (evaluationId: string): Promise<any> => {
  try {
    const response = await client.get(`/evaluations/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluation by ID:', error);
    throw error;
  }
};

export const getModels = async (params?: {
  input_modality?: string;
  output_modality?: string;
  category?: string;
  supports_knowledge_base?: boolean;
  all_models?: boolean;
}): Promise<{ models: AIModel[] }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.input_modality) queryParams.append('input_modality', params.input_modality);
    if (params?.output_modality) queryParams.append('output_modality', params.output_modality);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.supports_knowledge_base)
      queryParams.append('supports_knowledge_base', params.supports_knowledge_base.toString());
    if (params?.all_models) queryParams.append('all_models', params.all_models.toString());

    let url = '/models';
    if (queryParams.toString()) {
      url = '/models?' + queryParams.toString();
    }
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI models:', error);
    throw error;
  }
};

export const getCurrentUserDetails = async (): Promise<UserBackendDetails> => {
  try {
    const response = await client.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
};

export const getCurrentUserServices = async (): Promise<Service[]> => {
  try {
    const response = await client.get('/services');
    return response.data.services;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getGroupServices = async (groupId: string): Promise<Service[]> => {
  try {
    const response = await client.get(`/groups/${groupId}/services`);
    return response.data.services;
  } catch (error) {
    console.error('Error fetching group services:', error);
    throw error;
  }
};

export const getGroupModels = async (groupId: string): Promise<AIModel[]> => {
  try {
    const response = await client.get(`/groups/${groupId}/models`);
    return response.data.models;
  } catch (error) {
    console.error('Error fetching group models:', error);
    throw error;
  }
};

export const configureGroupServices = async (
  groupId: string,
  services: Service[]
): Promise<void> => {
  try {
    await client.put(`/groups/${groupId}/services`, {
      services_ids: services.map(service => service.id),
    });
  } catch (error) {
    console.error('Error configuring group services:', error);
    throw error;
  }
};

export const configureGroupModels = async (groupId: string, models: AIModel[]): Promise<void> => {
  try {
    await client.put(`/groups/${groupId}/models`, {
      models_ids: models.map(model => model.id),
    });
  } catch (error) {
    console.error('Error configuring group models:', error);
    throw error;
  }
};

export const updateGroupName = async (groupId: string, newName: string): Promise<void> => {
  try {
    await client.patch(`/groups/${groupId}`, {
      name: newName,
    });
  } catch (error) {
    console.error('Error updating group name:', error);
    throw error;
  }
};

// Get all materials from the user
export const getMaterialsByUser = async (): Promise<Material[]> => {
  try {
    const response = await client.get('/courses/all_teacher_materials/');
    return response.data;
  } catch (error) {
    console.error('Error getting materials:', error);
    throw error;
  }
};

export const getBlobFromURL = async (id: string): Promise<Blob> => {
  const response = await client.get('/courses/materials/' + id, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Expose-Headers': 'Content-Disposition',
    },
    responseType: 'blob',
  });
  return response.data;
};

export const fetchComparisonsEngineData = async (type: string = 'resume') => {
  try {
    const response = await client.get(`/compare/${type}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
  }
};

export const fetchComparisonEngineData = async (id: string) => {
  try {
    const response = await client.get('/compare/data/' + id + '/');
    return response.data;
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
  }
};

export const fetchComparisonEngineRulesData = async (type: string) => {
  try {
    const response = await client.get('/compare/rules/' + type + '/');
    return response.data;
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
  }
};

export const fetchComparisonEngineRuleData = async (id: string) => {
  try {
    const response = await client.get('/compare/rule/data/' + id + '/');
    return response.data;
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
  }
};

export const deleteComparison = async (id: string) => {
  try {
    const response = await client.delete('/compare/' + id + '/');
    return response.data;
  } catch (error) {
    console.error('Error deleting comparison:', error);
    throw error;
  }
};

export const deleteComparisonRule = async (id: string) => {
  try {
    const response = await client.delete('/compare/rule/' + id + '/');
    return response.data;
  } catch (error) {
    console.error('Error deleting comparison:', error);
    throw error;
  }
};

export const uploadComparisonFiles = async (formData: FormData) => {
  try {
    const response = await client.post('/compare/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading comparison files:', error);
    throw error;
  }
};

export const createComparisonEngine = async (
  request: ComparisonEngineCreateRequest,
  type: string
) => {
  try {
    const response = await client.post(`/compare/${type}-status`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comparison:', error);
    throw error;
  }
};

export const createComparisonRule = async (type: string, request: ComparisonEngineRule) => {
  try {
    const response = await client.post(`/compare/rule/${type}/`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comparison:', error);
    throw error;
  }
};

export const createFileFromMarkdown = async (
  inputData: string,
  inputFormat: string,
  outputFormat: string
) => {
  try {
    const response = await client.post(
      '/compare/convert/',
      {
        input_data: inputData,
        input_format: inputFormat,
        output_format: outputFormat,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating Filo from markdown:', error);
    throw error;
  }
};

export const uploadGroupLogo = async (formData: FormData, groupId: string) => {
  try {
    const response = await client.post(`/groups/${groupId}/upload-logo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading group logo:', error);
    throw error;
  }
};

export const uploadProfileLogo = async (formData: FormData) => {
  try {
    const response = await client.post(`/users/upload-logo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading group logo:', error);
    throw error;
  }
};

export const removeGroupLogo = async (groupId: string) => {
  try {
    const response = await client.delete(`/groups/${groupId}/remove-logo/`);
    return response.data;
  } catch (error) {
    console.error('Error removing group logo:', error);
    throw error;
  }
};

export const chatbotConversation = async (prompt: string, chatbotId: string, async_processing: boolean = false) => {
  try {
    const response = await client.post(
      '/chatbot/chatbot-conversation/',
      {
        prompt: prompt,
        chatbot_id: chatbotId,
        async_processing: async_processing,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in the conversation with the chatbot:', error);
    throw error;
  }
};

export const startChatbot = async (
  files: File[],
  chatbotName: string,
  systemPrompt: string,
  resourceData?: ChatbotResource,
  async_processing: boolean = false
) => {
  try {
    const formData = new FormData();

    // Agregar los archivos al FormData
    files.forEach(file => {
      formData.append('files', file);
    });

    // Agregar los demás campos
    formData.append('chatbot_name', chatbotName);
    formData.append('system_prompt', systemPrompt);
    if (resourceData) {
      formData.append('resource_data', JSON.stringify(resourceData));
    }
    formData.append('async_processing', async_processing.toString());
    const response = await client.post('/chatbot/start-chatbot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error when starting the chatbot:', error);
    throw error;
  }
};

export const getChatbots = async () => {
  try {
    const response = await client.get('/chatbot/');
    return response.data;
  } catch (error) {
    console.error('Error when getting the chatbots:', error);
    throw error;
  }
};

export const getChatbotById = async (chatbotId: string): Promise<Chatbot> => {
  try {
    const response = await client.get(`/chatbot/${chatbotId}`);
    return response.data;
  } catch (error) {
    console.error(`Error when getting the chatbot with ID ${chatbotId}:`, error);
    throw error;
  }
};

export const deleteChatbot = async (chatbotId: string) => {
  try {
    const response = await client.delete(`/chatbot/${chatbotId}`);
    return response.data;
  } catch (error) {
    console.error(`Error when deleting the chatbot with ID ${chatbotId}:`, error);
    throw error;
  }
};

export const getChatbotConversations = async (chatbotId: string) => {
  try {
    const response = await client.get(`/chatbot/${chatbotId}/conversations`);
    return response.data;
  } catch (error) {
    console.error(
      `Error when getting the conversations of the chatbot with ID ${chatbotId}:`,
      error
    );
    throw error;
  }
};

export const getChatbotConversation = async (chatbotId: string, conversationId: string) => {
  try {
    const response = await client.get(`/chatbot/${chatbotId}/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error when getting the conversation ${conversationId} of the chatbot with ID ${chatbotId}:`,
      error
    );
    throw error;
  }
};

export const getChatbotResources = async (): Promise<ChatbotResource[]> => {
  try {
    const response = await client.get(`/chatbot/resources`);
    return response.data;
  } catch (error) {
    console.error('Error when getting the resources of the chatbot:', error);
    throw error;
  }
};

export const getKnowledgebaseData = async (courseId: string) => {
  try {
    const response = await client.get(`/courses/${courseId}/data`);
    return response.data;
  } catch (error) {
    console.error('Error when getting the knowledgebase data:', error);
    throw error;
  }
};

export const updateSettings = async (
  courseId: string,
  knowledge_base_filter_structure: string[],
  api_endpoints?: ApiEndpoint[],
  languages?: string[],
  knowledge_base_filter_structure_mandatory?: { key: string; values: string[] }[],
  system_prompt?: string
) => {
  try {
    const response = await client.put(`/courses/${courseId}/settings`, {
      settings: {
        knowledge_base_filter_structure,
        api_endpoints,
        languages,
        knowledge_base_filter_structure_mandatory,
        system_prompt,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error when updating the file structure:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string, async_processing: boolean = false) => {
  try {
    const response = await client.delete(`/courses/${courseId}/`, {
      params: {
        async_processing: async_processing ? 'true' : 'false',
      },
    });
    return response;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const updateConversationAccessToken = async (
  courseId: string,
  token: string
): Promise<void> => {
  try {
    await client.put(`/courses/${courseId}/conversation_access_token`, {
      conversation_access_token: token,
    });
  } catch (error) {
    console.error('Error updating conversation access token:', error);
    throw error;
  }
};

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const response = await client.get(`/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
  getUserAnalytics: async (fromDate?: string, toDate?: string): Promise<AnalyticsData> => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);

      const url = `/analytics/user` + (params.toString() ? `?${params.toString()}` : '');
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },
  getGroupAnalytics: async (fromDate?: string, toDate?: string): Promise<AnalyticsData> => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);

      const url = `/analytics/group/` + (params.toString() ? `?${params.toString()}` : '');
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching group analytics:', error);
      throw error;
    }
  },
  getAdminAnalytics: async (
    fromDate?: string,
    toDate?: string,
    userId?: string
  ): Promise<AnalyticsData> => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (userId) params.append('user_id', userId);

      const url = `/analytics/admin` + (params.toString() ? `?${params.toString()}` : '');
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      throw error;
    }
  },
};

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await client.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  passwordChallenge: async (username: string, newPassword: string, session: string) => {
    try {
      const response = await client.post('/auth/password-challenge', {
        username,
        newPassword,
        session,
      });
      return response.data;
    } catch (error) {
      console.error('Password challenge failed:', error);
      throw error;
    }
  },

  forgotPassword: async (username: string) => {
    try {
      const response = await client.post('/auth/forgot-password', {
        username,
      });
      return response.data;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    try {
      const response = await client.post(
        '/auth/google',
        { idToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },
};

export const thirdPartyIntegrationService = {
  getAvailableServices: async (): Promise<string[]> => {
    try {
      const response = await client.get('/integrations/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching available services:', error);
      throw error;
    }
  },

  getGlobalIntegrations: async (): Promise<any[]> => {
    try {
      const response = await client.get(`/integrations/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  },

  getIntegrationByService: async (serviceName: string): Promise<ServiceValueResponse> => {
    try {
      const response = await client.get<ServiceValueResponse>(
        `/integrations/service/${serviceName}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching integration by service:', error);
      throw error;
    }
  },

  getPublicIntegrationByService: async (serviceName: string): Promise<ServiceValueResponse> => {
    try {
      const response = await client.get<ServiceValueResponse>(
        `/integrations/public/service/${serviceName}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching public integration by service:', error);
      throw error;
    }
  },

  updateIntegration: async (integrationId: string, updateData: any): Promise<any> => {
    try {
      const response = await client.put(`/integrations/${integrationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  },

  deleteIntegration: async (integrationId: string): Promise<void> => {
    try {
      await client.delete(`/integrations/${integrationId}`);
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  },
};

export const getServiceConfig = async (
  groupId: string,
  serviceId: string
): Promise<Record<string, string>> => {
  try {
    const response = await client.get(`/groups/${groupId}/services/${serviceId}/config`);
    return response.data.config;
  } catch (error) {
    console.error('Error fetching service configuration:', error);
    throw error;
  }
};

export const updateServiceConfig = async (
  groupId: string,
  serviceId: string,
  config: Record<string, string>
): Promise<void> => {
  try {
    await client.put(`/groups/${groupId}/services/${serviceId}/config`, { config });
  } catch (error) {
    console.error('Error updating service configuration:', error);
    throw error;
  }
};

export const exportToS3 = async (question_ids: string[]) => {
  try {
    const response = await client.post('/export-questions', {
      question_ids: question_ids,
    });

    return response.data;
  } catch (error) {
    console.error('Error exporting to S3:', error);
    throw error;
  }
};

export const updateCourse = async (courseId: string, formData: FormData) => {
  try {
    const response = await client.post(`/courses/update-course/${courseId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteAndUpdateCourse = async (
  courseId: string, 
  materialIds: string[], 
  extraProcessing: boolean = false
) => {
try {
  const response = await client.delete(`/courses/${courseId}/materials-update/`, {
    data: materialIds,
    params: {
      extra_processing: extraProcessing ? '1' : '0'
    },
  });
  return response;
} catch (error) {
  console.error('Error deleting and updating course:', error);
  throw error;
}
};

// LTI Platform Management APIs
export const getLTIPlatforms = async (): Promise<LTIPlatform[]> => {
  try {
    const response = await client.get('/lti-management/platforms');
    return response.data;
  } catch (error) {
    console.error('Error fetching LTI platforms:', error);
    throw error;
  }
};

export const createLTIPlatform = async (platform: LTIPlatform): Promise<LTIPlatform> => {
  try {
    const response = await client.post('/lti-management/platforms', platform);
    return response.data;
  } catch (error) {
    console.error('Error creating LTI platform:', error);
    throw error;
  }
};

export const updateLTIPlatform = async (clientId: string, platform: LTIPlatformUpdate): Promise<LTIPlatform> => {
  try {
    const response = await client.patch(`/lti-management/platforms/${clientId}`, platform);
    return response.data;
  } catch (error) {
    console.error('Error updating LTI platform:', error);
    throw error;
  }
};

export const deleteLTIPlatform = async (clientId: string): Promise<void> => {
  try {
    await client.delete(`/lti-management/platforms/${clientId}`);
  } catch (error) {
    console.error('Error deleting LTI platform:', error);
    throw error;
  }
};

export const getNotifications = async (filters: NotificationFilters = {}): Promise<NotificationResponse> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await client.get(`/notifications/?${params.toString()}`);
    
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        limit: filters.limit || 10,
        offset: filters.offset || 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await client.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await client.put('/notifications/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const createNotification = async (notification: CreateNotificationRequest): Promise<Notification> => {
  try {
    const response = await client.post('/notifications/', notification);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await client.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getNotificationMetrics = async (days?: number): Promise<NotificationMetrics> => {
  try {
    const params = new URLSearchParams();
    if (days !== undefined) {
      params.append('days', days.toString());
    }

    const response = await client.get(`/notifications/metrics/unread-count?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification metrics:', error);
    throw error;
  }
};

// Topics Configuration Management APIs
export const getTopicsConfiguration = async (): Promise<TopicsConfigurationDB | null> => {
  try {
    const response = await client.get('/topics/configuration');
    // If response is empty object, return null
    if (Object.keys(response.data).length === 0) {
      return null;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching topics configuration:', error);
    throw error;
  }
};

export const createTopicsConfiguration = async (configuration: TopicsConfiguration): Promise<{ message: string }> => {
  try {
    const response = await client.post('/topics/configuration', configuration);
    return response.data;
  } catch (error) {
    console.error('Error creating topics configuration:', error);
    throw error;
  }
};

export const updateTopicsConfiguration = async (configuration: TopicsConfiguration): Promise<{ message: string }> => {
  try {
    const response = await client.patch('/topics/configuration', configuration);
    return response.data;
  } catch (error) {
    console.error('Error updating topics configuration:', error);
    throw error;
  }
};

export const deleteTopicsConfiguration = async (): Promise<{ message: string }> => {
  try {
    const response = await client.delete('/topics/configuration');
    return response.data;
  } catch (error) {
    console.error('Error deleting topics configuration:', error);
    throw error;
  }
};

export const getTopicsDistribution = async (): Promise<TopicsDistribution> => {
  try {
    const response = await client.get('/topics/distribution');
    return response.data;
  } catch (error) {
    console.error('Error fetching topics distribution:', error);
    throw error;
  }
};

export const triggerTopicsAnalysis = async (): Promise<{ message: string; etl_task_id: string }> => {
  try {
    const response = await client.post('/topics/etl_task');
    return response.data;
  } catch (error) {
    console.error('Error triggering topics analysis:', error);
    throw error;
  }
};

export const getGuardrailsByAgents = async () => {
  try {
    const response = await client.get('/guardrails/by-agent');
    return response.data;
  } catch (error) {
    console.error('Error fetching guardrails:', error);
    throw error;
  }
};

export const getGuardrails = async () => {
  try {
    const response = await client.get('/guardrails/');
    return response.data;
  } catch (error) {
    console.error('Error fetching guardrails:', error);
    throw error;
  }
};

export const createServiceToken = async (tokenInfo: ServiceTokenCreate): Promise<ServiceTokenWithSecret> => {
  try {
    const response = await client.post('/service-tokens', tokenInfo);
    return response.data;
  } catch (error) {
    console.error('Error creating service token:', error);
    throw error;
  }
};

export const getServiceTokens = async (): Promise<ServiceTokenList> => {
  try {
    const response = await client.get('/service-tokens', {
      params: {
        active_only: false
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service tokens:', error);
    throw error;
  }
};

export const revokeServiceToken = async (tokenId: string): Promise<void> => {
  try {
    await client.delete(`/service-tokens/${tokenId}`);
  } catch (error) {
    console.error('Error revoking service token:', error);
    throw error;
  }
};
