import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/layout';
import { fetchRubrics, createEvaluation } from '../services/api';
import FileUpload from '../components/file-upload';
import { showToast } from '../services/toastService';
import { useNavigate } from 'react-router-dom';
import ModelSelector from '../components/model-selector';
import { ModelCategory } from '../types';
import AuthContext from '../authentication/authContext';

const CreateEvaluation: React.FC = () => {
  const { isAppSyncSubscribed } = useContext(AuthContext);
  const [files, setFiles] = useState<File[]>([]);
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<string | ''>('');
  const [courseName, setCourseName] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentSurname, setStudentSurname] = useState<string>('');
  const [examDescription, setExamDescription] = useState<string>('');
  const [customComments, setCustomComments] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRubricsData = async () => {
      try {
        const data = await fetchRubrics();
        setRubrics(data);
      } catch (error: any) {
        showToast('error', 'Error fetching rubrics');
      }
    };

    fetchRubricsData();
  }, []);

  const handleFileChange = (e: any) => {
    const uploadedFiles = Array.from(e.target.files || []);
    setFiles(uploadedFiles as File[]);
  };

  const handleRubricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRubric(e.target.value);
  };

  const clearFile = () => {
    setFiles([]);
  };

  const handleBack = () => {
    navigate('/evaluations');
  };

  const validateForm = (): string | null => {
    if (!selectedRubric) {
      return 'Please select a rubric.';
    }
    if (files.length === 0) {
      return 'Please upload at least one file to evaluate.';
    }
    if (!studentName.trim()) {
      return "Please provide the student's first name.";
    }
    if (!studentSurname.trim()) {
      return "Please provide the student's last name.";
    }
    if (!courseName.trim()) {
      return 'Please provide a course name.';
    }
    if (!examDescription.trim()) {
      return 'Please provide an exam description.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files[]', file);
      });

      formData.append('rubric_id', selectedRubric.toString());
      formData.append('course_name', courseName);
      formData.append('exam_description', examDescription);
      formData.append('student_name', studentName);
      formData.append('student_surname', studentSurname);

      if (selectedModel) {
        formData.append('llm_id', selectedModel);
      }

      if (customComments) {
        formData.append('custom_instructions', customComments);
      }

      // Add async_processing parameter if AppSync is subscribed
      if (isAppSyncSubscribed) {
        formData.append('async_processing', 'true');
      }

      const response = await createEvaluation(formData);
      
      // Check if response status is between 200-299
      if (response.status >= 200 && response.status < 300) {
        navigate('/evaluations');
        showToast('success', 'Evaluation created successfully.');
      } else {
        // Fallback to view page if no async processing
        const evaluationId = response.data.evaluation.id;
        navigate(`/evaluations/view/${evaluationId}`);
        showToast('success', 'Evaluation created successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the evaluation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Evaluation">
      <div className="flex items-center justify-between mb-4">
        <button
          className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rubric and File Upload section */}
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <label htmlFor="rubric" className="block text-sm font-semibold text-gray-700">
                Select Rubric
              </label>
              <select
                id="rubric"
                name="rubric"
                value={selectedRubric}
                onChange={handleRubricChange}
                className="w-full text-gray-700 bg-white border border-gray-300 rounded-lg py-2.5 px-4 shadow-sm appearance-none cursor-pointer hover:border-blue-500 transition-colors"
              >
                <option value="">Select Rubric</option>
                {rubrics?.length > 0 ? (
                  rubrics.map(rubric => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No Rubrics available
                  </option>
                )}
              </select>

              <label htmlFor="rubric" className="block text-sm font-semibold text-gray-700 pt-4">
                Select Model
              </label>
              <ModelSelector
                value={selectedModel}
                onChange={modelId => setSelectedModel(modelId)}
                category={ModelCategory.HighEnd}
              />
            </div>

            <div className="col-span-3 space-y-2">
              <div className="block text-sm font-semibold text-gray-700 mb-2">Exam File</div>
              <FileUpload
                handleFileChange={handleFileChange}
                files={files}
                text="Upload Exam File(s)"
                formats={['pdf', 'jpg', 'jpeg', 'png']}
                clearFile={clearFile}
                multiple
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label htmlFor="courseName" className="block text-sm font-semibold text-gray-700">
                Course Name
              </label>
              <input
                id="courseName"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm"
                placeholder="Enter course name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700">
                Student First Name
              </label>
              <input
                id="studentName"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm"
                placeholder="Enter student's first name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="studentSurname" className="block text-sm font-semibold text-gray-700">
                Student Last Name
              </label>
              <input
                id="studentSurname"
                value={studentSurname}
                onChange={e => setStudentSurname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm"
                placeholder="Enter student's last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="examDescription" className="block text-sm font-semibold text-gray-700">
              Exam Description
            </label>
            <textarea
              id="examDescription"
              value={examDescription}
              onChange={e => setExamDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm min-h-[100px] resize-y"
              placeholder="Provide a brief description of the exam"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customComments" className="block text-sm font-semibold text-gray-700">
              Custom Comments (Optional)
            </label>
            <textarea
              id="customComments"
              value={customComments}
              onChange={e => setCustomComments(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm min-h-[100px] resize-y"
              placeholder="Additional feedback or instructions (optional)"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="animate-spin">⌛</span>
                  <span>Creating...</span>
                </span>
              ) : (
                'Create Evaluation'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEvaluation;
