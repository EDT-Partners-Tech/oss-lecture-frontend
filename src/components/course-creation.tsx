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

import React, { useState, ChangeEvent, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  analyzeKnowledgeBase,
  createCourse,
  createKnowledgeBase,
  pollStateMachine,
  startIngestion,
  uploadMaterial,
  preprocessMaterials,
  getIngestionStatus,
} from '../services/api';
import { showToast } from '../services/toastService';
import FileUpload from './file-upload';
import AuthContext from '../authentication/authContext';
import client from '../services/client';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const STATE_DURATIONS: { [key: string]: number } = {
  UploadFiles: 5,
  CreateOpensearchCollection: 5,
  WaitForCollectionCreation: 60,
  CreateOpensearchVectorIndex: 5,
  WaitForVectorIndexCreation: 20,
  CreateBedrockKnowledgeBase: 5,
  WaitForKnowledgeBaseCreation: 5,
  CreateKnowledgeBaseDataSource: 5,
  AggregateResults: 10,
  DataAnalysis: 5,
  GenerateCourseAssests: 15,
  WaitForIngestion: 30,
};

const STATE_MESSAGES: { [key: string]: string } = {
  UploadFiles: 'Uploading files for your course...',
  CreateOpensearchCollection: 'Setting up a search collection...',
  WaitForCollectionCreation: 'Waiting for the search collection to be created...',
  CreateOpensearchVectorIndex: 'Creating a vector index for efficient search...',
  WaitForVectorIndexCreation: 'Waiting for the vector index to be ready...',
  CreateBedrockKnowledgeBase: 'Generating the knowledge base...',
  WaitForKnowledgeBaseCreation: 'Finalizing the knowledge base...',
  CreateKnowledgeBaseDataSource: 'Adding data sources to the knowledge base...',
  AggregateResults: 'Wrapping up the creation process...',
  DataAnalysis: 'Analyzing the data for insights...',
  GenerateCourseAssests: 'Generating course assets...',
  WaitForIngestion: 'Waiting for the data ingestion to be completed...',
};

const TOTAL_TIME = Object.values(STATE_DURATIONS).reduce((sum, duration) => sum + duration, 0);

const CourseCreation: React.FC = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const activeStateRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useContext(AuthContext);
  const { t } = useTranslation();
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }, []);

  const clearFiles = useCallback((index?: number) => {
    if (index !== undefined) {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    } else {
      setFiles([]);
    }
  }, []);

  const updateProgress = useCallback((currentState: string) => {
    if (activeStateRef.current === currentState) return;
    activeStateRef.current = currentState;

    const stateIndex = Object.keys(STATE_DURATIONS).indexOf(currentState);
    if (stateIndex === -1) return;

    const previousDuration = Object.entries(STATE_DURATIONS)
      .slice(0, stateIndex)
      .reduce((sum, [, duration]) => sum + duration, 0);

    const currentStateDuration = STATE_DURATIONS[currentState];
    const startProgress = (previousDuration / TOTAL_TIME) * 100;
    const endProgress = ((previousDuration + currentStateDuration) / TOTAL_TIME) * 100;

    let progressValue = startProgress;
    const step = (endProgress - startProgress) / (currentStateDuration * 1000);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      progressValue = Math.min(progressValue + step * 16.7, endProgress);
      setProgress(progressValue);

      if (progressValue < endProgress) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const analyzeDataAndRedirect = useCallback(
    async (courseId: string) => {
      try {
        await analyzeKnowledgeBase(courseId);
      } catch (error) {
        console.warn('Knowledge base analysis failed, but continuing:', error);
      }
      clearFiles();
      navigate(`/course/${courseId}`);
    },
    [clearFiles, navigate]
  );

  const pollStateMachineStatus = useCallback(
    async (courseId: string, executionArn: string): Promise<boolean> => {
      try {
        const response = await pollStateMachine(courseId, executionArn);
        const newState = response.current_state;
        const currentStatus = response.state_status;

        if (newState !== state) {
          setState(newState);
          updateProgress(newState);
        }

        if (currentStatus === 'SUCCEEDED') {

          setState('AggregateResults');
          updateProgress('AggregateResults');
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['AggregateResults'] * 1000)
          );
          
          await preprocessMaterials(courseId);
          await startIngestion(courseId);

          // Wait for the ingestion to be completed
          setState('WaitForIngestion');
          updateProgress('WaitForIngestion');
          let ingestionCompleted = false;
          while (!ingestionCompleted) {
            const ingestionStatus = await getIngestionStatus(courseId);
            if (['COMPLETED', 'COMPLETE'].includes(ingestionStatus.status)) {
              ingestionCompleted = true;
            } else if (ingestionStatus.status === 'FAILED') {
              throw new Error('La ingestión falló');
            } else {
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['WaitForIngestion'] * 1000)
          );

          setState('DataAnalysis');
          updateProgress('DataAnalysis');
          await new Promise(resolve => setTimeout(resolve, STATE_DURATIONS['DataAnalysis'] * 1000));
          setState('GenerateCourseAssests');
          updateProgress('GenerateCourseAssests');
          await analyzeDataAndRedirect(courseId);

          return true;
        }

        if (currentStatus === 'FAILED') {
          throw new Error('State machine execution failed');
        }

        return false;
      } catch (error) {
        console.error('Error polling state machine:', error);
        throw error;
      }
    },
    [state, updateProgress, analyzeDataAndRedirect]
  );

  const handleSubmit = async () => {
    if (!courseTitle.trim()) {
      showToast('info', t('course_creation.please_enter_a_course_title'));
      return;
    }

    if (files.length === 0) {
      showToast('info', t('course_creation.please_upload_at_least_one_file'));
      return;
    }

    setLoading(true);
    try {

      // Chequear si está suscripto a AppSync
      if (isAppSyncSubscribed) {
        // Usar el nuevo endpoint /generate-course
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('extra_processing', 'false');

        // Add title to FormData
        formData.append('title', courseTitle);
        // Add extra_processing to FormData
        formData.append('extra_processing', 'false');
        
        const response = await client.post(`/courses/generate-course/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Si el status están en el rango 200-299, entonces es exitoso
        if (response.status >= 200 && response.status < 300) {
          toast.success(t('course_generation.course_generated_successfully'));
          navigate('/courses');
          return;
        } else {
          showToast('error', t('course_generation.error_generating_course'));
          setLoading(false);
          return;
        }
      }

      // --- FLUJO NORMAL SI NO ESTÁ SUSCRIPTO ---
      const courseResponse = await createCourse({ title: courseTitle });
      // Upload files if there are any
      if (files.length > 0) {
        setState('UploadFiles');
        updateProgress('UploadFiles');
        await uploadMaterial(courseResponse.id, files);
      }

      const stateMachine = await createKnowledgeBase(courseResponse.id);

      let completed = false;
      while (!completed) {
        completed = await pollStateMachineStatus(courseResponse.id, stateMachine.executionArn);
        if (!completed) {
          const currentDelay = STATE_DURATIONS[state] || 5;
          await new Promise(resolve => setTimeout(resolve, currentDelay * 1000));
        }
      }
    } catch (error) {
      console.error('Error during course creation flow:', error);
      showToast('error', t('course_creation.error_creating_course'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
            {t('course_creation.back')}
        </button>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <label htmlFor="course-title" className="block text-lg font-medium mb-2">
            {t('course_creation.course_title')}
          </label>
          <input
            id="course-title"
            type="text"
            value={courseTitle}
            onChange={e => setCourseTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={t('course_creation.enter_course_title')}
          />
        </div>

        <FileUpload
          handleFileChange={handleFileChange}
          files={files}
          formats={[
            'txt',
            'md',
            'html',
            'doc',
            'docx',
            'csv',
            'xls',
            'xlsx',
            'pdf',
            'mp3',
            'mp4',
            'm4a',
            'flac',
            'amr',
            'ogg',
            'webm',
            'wav',
            'epub',
          ]}
          text={t('course_creation.drag_and_drop_files')}
          clearFile={clearFiles}
          multiple
          className="mb-4"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? t('course_creation.creating') : t('course_creation.create_course')}
        </button>

        {loading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-700">
              {t(`state_messages.${STATE_MESSAGES[state]}`) || t('course_creation.processing')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCreation;
