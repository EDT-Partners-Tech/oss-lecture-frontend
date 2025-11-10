import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRubric, fetchRubricById, updateRubric, getMaterialsByUser } from '../services/api';
import { FaTrash, FaPlus, FaInfoCircle, FaUpload } from 'react-icons/fa';
import { HiDocumentMagnifyingGlass } from 'react-icons/hi2';
import Layout from '../components/layout';
import { Criteria, Indicator, Material, RubricData } from '../types';
import CriteriaField from '../components/criteria-field';
import { Input } from '../components/ui/input';
import Tooltip from '../components/ui/tooltip';
import { showToast } from '../services/toastService';
import FileUpload from '../components/file-upload';
import MaterialsModal from '../components/materials-modal';
import { t } from 'i18next';
import AuthContext from '../authentication/authContext';

interface RubricFormProps {
  isEdit?: boolean;
}

const RubricForm: React.FC<RubricFormProps> = ({ isEdit = false }) => {
  const [rubricData, setRubricData] = useState<RubricData>({
    name: '',
    description: '',
    indicators: [],
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAppSyncSubscribed } = useContext(AuthContext);

  const [isEditMode, setIsEditMode] = useState(isEdit || !id);
  const isViewMode = !isEditMode && !!id;

  const [files, setFiles] = useState<File[]>([]);
  const [s3Material, setMaterial] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualInput, setIsManualInput] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRubricData = useCallback(async () => {
    if (!id) return;

    try {
      const data = await fetchRubricById(id as string);
      const updatedIndicators = data.indicators.map((indicator: any) => ({
        ...indicator,
        criteria: Object.entries(indicator.criteria).map(([key, value]) => ({
          key,
          description: value,
        })),
      }));
      setRubricData({
        name: data.name,
        description: data.description,
        indicators: updatedIndicators,
      });
    } catch (error) {
      console.error(t('rubrics_form.error_fetching_rubric_data'), error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRubricData();
    }
    getMaterialsByUser().then(materials => {
      setMaterials(materials);
    });
  }, [fetchRubricData, id]);

  const updateIndicators = (newIndicators: Indicator[]) => {
    setRubricData(prev => ({ ...prev, indicators: newIndicators }));
  };

  const handleAddIndicator = () => {
    updateIndicators([
      ...rubricData.indicators,
      { name: '', weight: 0, criteria: [{ key: '', description: '' }] },
    ]);
  };

  const handleRemoveIndicator = (index: number) => {
    const newIndicators = rubricData.indicators.filter((_, i) => i !== index);
    updateIndicators(newIndicators);
  };

  const handleIndicatorChange = (index: number, field: keyof Indicator, value: any) => {
    const newIndicators = [...rubricData.indicators];
    (newIndicators[index] as any)[field] = value;
    updateIndicators(newIndicators);
  };

  const handleAddCriteria = (index: number) => {
    const newIndicators = [...rubricData.indicators];
    newIndicators[index].criteria.push({ key: '', description: '' });
    updateIndicators(newIndicators);
  };

  const handleRemoveCriteria = (indicatorIndex: number, criteriaIndex: number) => {
    const newIndicators = [...rubricData.indicators];
    newIndicators[indicatorIndex].criteria.splice(criteriaIndex, 1);
    updateIndicators(newIndicators);
  };

  const handleCriteriaChange = (
    indicatorIndex: number,
    criteriaIndex: number,
    field: keyof Criteria,
    value: string
  ) => {
    const newIndicators = [...rubricData.indicators];
    newIndicators[indicatorIndex].criteria[criteriaIndex][field] = value;
    updateIndicators(newIndicators);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isManualInput) {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length > 0) {
        const validFiles = selectedFiles.every(
          file => file.type === 'application/pdf' || file.type.startsWith('image/')
        );

        if (validFiles) {
          setFiles(selectedFiles);
        } else {
          showToast('error', t('rubrics_form.only_pdf_and_image_files_supported'));
        }
      }
    } else {
      const selectedFiles = Array.from(event.target.files || []);
      setFiles(selectedFiles);
    }
    event.target.value = ''; // Clear the input value
  };

  const handleSelectedMaterials = (materials: Material[]) => {
    const fetchFilesFromMaterials = async () => {
      for (const material of materials) {
        if (material) {
          setMaterial(prev => [...prev, material]);
        }
      }
    };

    fetchFilesFromMaterials();
    setModalOpen(false);
  };

  const clearFile = (index?: number) => {
    if (index === undefined) {
      setFiles([]);
    } else {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    }
  };

  const clearMaterial = (index?: number) => {
    if (index === undefined) {
      setMaterial([]);
    } else {
      setMaterial(prevFiles => prevFiles.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!(files.length + materials.length) && !isManualInput) {
      showToast('error', t('rubrics_form.please_upload_files_or_switch_to_manual_input'));
      return;
    }

    if (isManualInput) {
      const totalWeight = rubricData.indicators.reduce(
        (sum, indicator) => sum + indicator.weight,
        0
      );
      if (totalWeight !== 1) {
        showToast('info', t('rubrics_form.the_sum_of_weights_should_be_1'));
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isEditMode && id) {
        // Handle edit mode
        const rubricUpdate = {
          ...rubricData,
          indicators: rubricData.indicators.map(indicator => {
            // Convert criteria array to object format
            const criteriaObject: Record<string, string> = {};
            indicator.criteria.forEach(criterion => {
              criteriaObject[criterion.key] = criterion.description;
            });

            return {
              name: indicator.name,
              weight: indicator.weight,
              criteria: criteriaObject,
            };
          }),
        };
        await updateRubric(id, rubricUpdate);
        setIsEditMode(false);
        showToast('success', t('rubrics_form.rubric_updated_successfully'));
      } else {
        // Handle create mode
        if (!isManualInput) {
          if (files.length + s3Material.length > 0) {
            // File-only mode
            const formData = new FormData();
            files.forEach(file => {
              formData.append(`files[]`, file);
            });
            s3Material.forEach(material => {
              formData.append(`materials[]`, material.id);
            });
            
            // Add async_process parameter if AppSync is subscribed
            if (isAppSyncSubscribed) {
              formData.append('async_processing', 'true');
            }
            
            await createRubric(formData);
          } else {
            showToast('error', t('rubrics_form.please_upload_files_or_materials'));
            return;
          }
        } else {
          // Manual input mode
          const formData = new FormData();

          // If there are files, append them
          if (files.length + s3Material.length > 0) {
            files.forEach(file => {
              formData.append(`files[]`, file);
            });
            s3Material.forEach(material => {
              formData.append(`materials[]`, material.id);
            });
          }

          // Append rubric data as string
          formData.append('rubric_data', JSON.stringify(rubricData));
          
          // Add async_process parameter if AppSync is subscribed
          if (isAppSyncSubscribed) {
            formData.append('async_process', 'true');
          }

          await createRubric(formData);
        }
        navigate('/rubrics-management');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} rubric:`, error);
      showToast('error', t('rubrics_form.failed_to_save_rubric'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={isEditMode && id ? t('rubrics_form.edit_rubric') : id ? t('rubrics_form.view_rubric') : t('rubrics_form.create_rubric')}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/rubrics-management')}
        >
          {t('rubrics_form.back')}
        </button>
        {isViewMode && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsEditMode(true)}
          >
            {t('rubrics_form.edit_rubric_button')}
          </button>
        )}
      </div>
      <div className="p-6 bg-white rounded shadow-md">
        {isEditMode && !id && (
          <div className="mb-6 flex flex-col gap-4">
            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-gray-200 dark:border-gray-700 dark:text-gray-400">
              <li className={isManualInput ? 'text' : ''}>
                <button
                  onClick={() => setIsManualInput(true)}
                  className={`inline-block h-10 px-6 rounded-t-lg ${
                    isManualInput
                      ? 'text-primary bg-background active border-b-2 border-primary dark:text-blue-500'
                      : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  {t('rubrics_form.manual_input')}
                </button>
              </li>
              <li className={!isManualInput ? 'text' : ''}>
                <button
                  onClick={() => setIsManualInput(false)}
                  className={`inline-block h-10 px-6 rounded-t-lg ${
                    !isManualInput
                      ? 'text-primary bg-background active border-b-2 border-primary dark:text-blue-500'
                      : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  <FaUpload className="inline mr-2" />
                  {t('rubrics_form.upload_file')}
                </button>
                {!isManualInput && (
                  <button
                    onClick={() => {
                      setModalOpen(true);
                    }}
                    className="inline-block h-10 px-6"
                  >
                    <HiDocumentMagnifyingGlass className="inline mr-2 text-xl" />
                  </button>
                )}
              </li>
            </ul>

            {!isManualInput && (
              <FileUpload
                handleFileChange={handleFileChange}
                files={files}
                materials={s3Material}
                text={t('rubrics_form.upload_files')}
                formats={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']}
                description={t('rubrics_form.upload_files_description')}
                clearFile={clearFile}
                clearMaterial={clearMaterial}
                multiple
              />
            )}
          </div>
        )}
        {((isManualInput && isEditMode) || (id && isEditMode) || (id && !isEditMode)) && (
          <>
            <div className="mb-6">
              {isEditMode ? (
                <Input
                  value={rubricData.name}
                  onChange={e => setRubricData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('rubrics_form.rubric_name')}
                />
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700">{t('rubrics_form.rubric_name')}</label>
                  <p className="text-lg">{rubricData.name}</p>
                </>
              )}
            </div>
            <div className="mb-6">
              {isEditMode ? (
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  placeholder={t('rubrics_form.description')}
                  value={rubricData.description}
                  onChange={e =>
                    setRubricData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-lg">{rubricData.description}</p>
                </>
              )}
            </div>
            <h5 className="text-xl font-bold mb-4 flex items-center">
              {t('rubrics_form.indicators')}
              <Tooltip
                className="text-wrap min-w-[40vw]"
                content={t('rubrics_form.indicators_description')}
                position="top"
              >
                <FaInfoCircle className="ml-2 text-gray-500" />
              </Tooltip>
            </h5>
            {rubricData.indicators.map((indicator, indicatorIndex) => (
              <div key={indicatorIndex} className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="text-lg font-medium">{t('rubrics_form.indicator')} {indicatorIndex + 1}</h6>
                  {isEditMode && (
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveIndicator(indicatorIndex)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {isEditMode ? (
                    <>
                      <Input
                        value={indicator.name}
                        onChange={e =>
                          handleIndicatorChange(indicatorIndex, 'name', e.target.value)
                        }
                        placeholder={t('rubrics_form.indicator_name')}
                      />
                      <Input
                        value={indicator.weight}
                        onChange={e =>
                          handleIndicatorChange(
                            indicatorIndex,
                            'weight',
                            parseFloat(e.target.value)
                          )
                        }
                        min={0}
                        max={1}
                        step={0.1}
                        placeholder={t('rubrics_form.weight')}
                        type="number"
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('rubrics_form.indicator_name')}
                        </label>
                        <p className="text-lg">{indicator.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('rubrics_form.weight')}</label>
                        <p className="text-lg">{indicator.weight}</p>
                      </div>
                    </>
                  )}
                </div>
                <h6 className="text-sm font-bold my-2 flex items-center">
                  {t('rubrics_form.criteria')}
                  <Tooltip
                    content={t('rubrics_form.criteria_description')}
                    position="top"
                  >
                    <FaInfoCircle className="ml-2 text-gray-500" />
                  </Tooltip>
                </h6>
                {indicator.criteria.map((criteria, criteriaIndex) => (
                  <CriteriaField
                    key={criteriaIndex}
                    criteria={criteria}
                    onChange={(field, value) =>
                      handleCriteriaChange(indicatorIndex, criteriaIndex, field, value)
                    }
                    onRemove={() => handleRemoveCriteria(indicatorIndex, criteriaIndex)}
                    isEdit={isEditMode}
                  />
                ))}
                {isEditMode && (
                  <button
                    className="flex px-4 py-2 border border-blue-500 text-blue-500 rounded mt-4 items-center"
                    onClick={() => handleAddCriteria(indicatorIndex)}
                  >
                    <FaPlus className="mr-2" /> {t('rubrics_form.add_criteria')}
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button
                className="flex px-4 py-2 border border-green-500 text-green-500 rounded mb-6 items-center"
                onClick={handleAddIndicator}
              >
                <FaPlus className="mr-2" /> {t('rubrics_form.add_indicator')}
              </button>
            )}
          </>
        )}
        {isEditMode && (
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? t('rubrics_form.saving') : isEditMode ? t('rubrics_form.save_changes') : t('rubrics_form.save_rubric')}
            </button>
          </div>
        )}
        <MaterialsModal
          materials={materials}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(selectedMaterials: string[]) => {
            const materialsToProcess: Material[] = materials.filter(material =>
              selectedMaterials.includes(material.id)
            );

            handleSelectedMaterials(materialsToProcess);
          }}
        />
      </div>
    </Layout>
  );
};

export default RubricForm;
