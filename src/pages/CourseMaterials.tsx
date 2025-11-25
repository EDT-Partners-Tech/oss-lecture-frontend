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

import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import {
  getMaterials,
  uploadMaterial,
  startIngestion,
  deleteMaterials,
  preprocessMaterials,
  deleteCourse,
  updateCourse,
  deleteAndUpdateCourse,
} from '../services/api';
import { Course } from '../types';
import Layout from '../components/layout';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from '../services/toastService';
import {
  PdfFile,
  WordFile,
  PowerpointFile,
  ExcelFile,
  ImageFile,
  TxtFile,
  VideoFile,
  AudioFile,
  File,
  Warning,
  Info,
  AudioBook,
} from '../images/icons';
import { formatDate } from '../lib/utils';
import FileUpload from '../components/file-upload';
import AuthContext from '../authentication/authContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const CourseMaterials: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [deletingCourse, setDeletingCourse] = useState<boolean>(false);
  const { isAppSyncSubscribed } = useContext(AuthContext);
  const { t } = useTranslation();

  const fetchCourseData = async () => {
    if (!id) {
      showToast('error', 'Course Not Found!');
      return;
    }

    try {
      const response = await getMaterials(id);
      setCourse(response);
    } catch (err: any) {
      console.error('Error fetching course data:', err);
    }
  };

  useEffect(() => {
    fetchCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleDeleteMaterials = async () => {
    if (!id || selectedMaterials.length === 0) return;

    setDeleting(true);
    try {
      if (isAppSyncSubscribed) {
        const response = await deleteAndUpdateCourse(id, selectedMaterials, false);
        
        if (response.status >= 200 && response.status < 300) {
          toast.success(t('course_generation.processing'));
          navigate('/dashboard');
          return;
        } else {
          setDeleting(false);
          return;
        }
      }

      // Flujo normal si no está suscrito
      await deleteMaterials(id, selectedMaterials, false);
      await preprocessMaterials(id);
      await startIngestion(id);
      fetchCourseData();
      setSelectedMaterials([]);
    } catch (error) {
      console.error('Error deleting materials:', error);
    } finally {
      setDeleting(false);
    }
  };

  const clearFiles = (index?: number) => {
    if (index !== undefined) {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    } else {
      setFiles([]);
    }
  };

  const handleUpload = async () => {
    if (!id || files.length === 0) return;

    setUploading(true);

    try {
      if (isAppSyncSubscribed) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('extra_processing', 'false');
        
        const response = await updateCourse(id, formData);
        
        if (response.status >= 200 && response.status < 300) {
          toast.success(t('course_generation.processing'));
          navigate('/dashboard');
          return;
        } else {
          setUploading(false);
          return;
        }
      }

      // Flujo normal si no está suscrito
      await uploadMaterial(id, files, false);
      await preprocessMaterials(id);
      await startIngestion(id);
      fetchCourseData();
      clearFiles();
    } catch (error) {
      console.error('Error uploading materials:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    const classes = 'w-20 h-20';

    if (fileType.includes('pdf')) {
      return <PdfFile className={classes} />;
    } else if (fileType.includes('docx')) {
      return <WordFile className={classes} />;
    } else if (fileType.includes('presentation')) {
      return <PowerpointFile className={classes} />;
    } else if (fileType.includes('xlsx')) {
      return <ExcelFile className={classes} />;
    } else if (fileType.includes('image')) {
      return <ImageFile className={classes} />;
    } else if (fileType.includes('txt')) {
      return <TxtFile className={classes} />;
    } else if (fileType.includes('video')) {
      return <VideoFile className={classes} />;
    } else if (fileType.includes('audio')) {
      return <AudioFile className={classes} />;
    } else if (fileType.includes('epub')) {
      return <AudioBook className={classes} />;
    } else {
      return <File className={classes} />;
    }
  };

  const handleDeleteCourse = async () => {
    if (!id) {
      showToast('error', 'Course Not Found!');
      return;
    }

    if (
      window.confirm(t('course_generation.delete_course_confirmation'))
    ) {
      setDeletingCourse(true);
      try {
        if (isAppSyncSubscribed) {
          const response = await deleteCourse(id, true);
          
          if (response.status >= 200 && response.status < 300) {
            showToast('success', t('course_generation.processing'));
            navigate('/courses');
            return;
          } else {
            setDeletingCourse(false);
            return;
          }
        }

        // Flujo normal si no está suscrito
        await deleteCourse(id, false);
        showToast('success', t('course_generation.course_deleted_successfully'));
        navigate('/dashboard');
      } catch (err: any) {
        setDeletingCourse(false);
      }
    }
  };

//   if (loading) return <p>Loading...</p>;

  return (
    <Layout title={t('course_generation.course_material')}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('course_generation.back')}
        </button>
        <button
          className={`px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 ${
            deletingCourse ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleDeleteCourse}
          disabled={deletingCourse}
        >
          {deletingCourse ? t('course_generation.deleting_course') : t('course_generation.delete_course')}
        </button>
      </div>
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{course?.title}</h1>
          </div>{' '}
          <p className="text-lg text-gray-600 mt-2">{course?.description}</p>
          <p className="text-sm text-gray-500 py-1 mt-2">
            ID: {course?.id}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 py-5">
              {t('course_generation.created_on')}: {formatDate(course?.created_at || '')}
            </p>
            {selectedMaterials.length > 0 && (
              <button
                className={`bg-red-500 text-white px-4 py-2 rounded ${
                  deleting ? 'opacity-80 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
                onClick={handleDeleteMaterials}
                disabled={deleting}
              >
                {deleting ? t('course_generation.deleting_materials') : t('course_generation.delete_materials')}
              </button>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">{t('course_generation.materials')}</h2>
        {course?.materials.length === 0 ? (
          <p>{t('course_generation.no_materials_available')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
            {course?.materials.map(material => (
              <div
                key={material.id}
                className={`p-4 rounded-lg shadow flex flex-col items-center relative cursor-pointer ${
                  selectedMaterials.includes(material.id) ? 'bg-blue-500' : 'bg-white'
                }`}
                onClick={() => {
                  if (selectedMaterials.includes(material.id)) {
                    setSelectedMaterials(selectedMaterials.filter(id => id !== material.id));
                  } else {
                    setSelectedMaterials([...selectedMaterials, material.id]);
                  }
                }}
              >
                {material.status && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 group">
                    {['transcribed', 'processed'].some(status =>
                      material.status?.toLowerCase().includes(status)
                    ) ? (
                      <Info className="w-8 h-8 text-blue-600" />
                    ) : (
                      <Warning className="w-8 h-8 text-yellow-500" />
                    )}
                    <span
                      className={`${
                        ['transcribed', 'processed'].some(status =>
                          material.status?.toLowerCase().includes(status)
                        )
                          ? 'text-blue-500 bg-blue-100 border-blue-200'
                          : 'text-yellow-600 bg-yellow-100 border-yellow-200'
                      }
                        text-xs font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200 absolute -top-6 right-0 z-10 w-44 break-words whitespace-normal borde shadow-lg backdrop-blur-md`}
                      title={material.status}
                    >
                      {material.status}
                    </span>
                  </div>
                )}
                <div className="text-3xl mb-2">{getFileIcon(material.type)}</div>
                <a
                  href={material.s3_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-600 underline text-center overflow-hidden text-ellipsis break-all ${
                    selectedMaterials.includes(material.id) ? 'text-white' : ''
                  }`}
                  onClick={e => e.stopPropagation()}
                >
                  {material.title}
                </a>
              </div>
            ))}
          </div>
        )}

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
          text="Drag and drop files here or click to select files"
          clearFile={clearFiles}
          multiple
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          className="bg-primary text-white px-4 py-2 rounded mr-4"
          disabled={uploading}
        >
          {uploading ? t('course_generation.uploading_materials.title') : t('course_generation.upload_materials')}
        </button>
      </div>
    </Layout>
  );
};

export default CourseMaterials;
