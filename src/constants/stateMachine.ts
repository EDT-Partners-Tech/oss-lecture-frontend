// © [2025] EDT&Partners. Licensed under CC BY 4.0.
export type StateDurations = {
  [key: string]: number;
};

export const STATE_DURATIONS: StateDurations = {
  UploadFiles: 5,
  CreateOpensearchCollection: 5,
  WaitForCollectionCreation: 60,
  CreateOpensearchVectorIndex: 5,
  WaitForVectorIndexCreation: 20,
  CreateBedrockKnowledgeBase: 5,
  WaitForKnowledgeBaseCreation: 5,
  CreateKnowledgeBaseDataSource: 5,
  PreprocessMaterials: 10,
  StartIngestion: 5,
  WaitForIngestion: 30,
  AnalyzeKnowledgeBase: 20,
  AggregateResults: 10,
  DataAnalysis: 30,
  GenerateCourseAssests: 15,
};

export const STATE_MESSAGES: { [key: string]: string } = {
  UploadFiles: 'state_messages.uploading_files',
  CreateOpensearchCollection: 'state_messages.configuring_search_collection',
  WaitForCollectionCreation: 'state_messages.waiting_for_collection_creation',
  CreateOpensearchVectorIndex: 'state_messages.creating_vector_index',
  WaitForVectorIndexCreation: 'state_messages.waiting_for_vector_index_creation',
  CreateBedrockKnowledgeBase: 'state_messages.generating_knowledge_base',
  WaitForKnowledgeBaseCreation: 'state_messages.finalizing_knowledge_base',
  CreateKnowledgeBaseDataSource: 'state_messages.adding_data_sources',
  PreprocessMaterials: 'state_messages.preprocessing_materials',
  StartIngestion: 'state_messages.starting_data_ingestion',
  WaitForIngestion: 'state_messages.waiting_for_data_ingestion_completed',
  AnalyzeKnowledgeBase: 'state_messages.analyzing_knowledge_base',
  AggregateResults: 'state_messages.finalizing_creation_process',
  DataAnalysis: 'state_messages.analyzing_data_to_get_insights',
  GenerateCourseAssests: 'state_messages.generating_course_assets',
};
