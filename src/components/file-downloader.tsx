import React, { useEffect, useState } from 'react';
import { downloadFile } from '../lib/utils';
import { Question } from '../types';
import { exportToS3, thirdPartyIntegrationService } from '../services/api';
import { showToast } from '../services/toastService';
import { LoadingIcon } from '../images/icons';

interface FileDownloaderProps {
  questions: Question[];
}

const FileDownloader: React.FC<FileDownloaderProps> = ({ questions }) => {
  const [s3Integration, setS3Integration] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const validateS3Integration = (serviceValue: Record<string, string>): boolean => {
    const requiredFields = ['region', 'bucket_name'] as const;
    return requiredFields.every(field => {
      const value = serviceValue[field];
      return Boolean(value?.trim());
    });
  };

  const handleS3Export = async () => {
    try {
      setIsExporting(true);
      const response = await exportToS3(questions.map(q => q.id));
      const s3Uri = response.s3_uri;
      showToast('success', 'Exported to S3 ' + s3Uri);
    } catch (error) {
      showToast('error', 'Failed to export to S3');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchIntegration = async () => {
      try {
        const { service_value } =
          await thirdPartyIntegrationService.getPublicIntegrationByService('s3');
        setS3Integration(validateS3Integration(service_value));
      } catch (error) {
        setS3Integration(false);
      }
    };
    fetchIntegration();
  }, []);

  const isDisabled = questions.length === 0 || isExporting;

  return (
    <div className="flex items-center space-x-4">
      <p className="py-2 font-bold">Export as </p>
      <button
        onClick={() => downloadFile(questions, 'GIFT')}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-md transition-colors ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        GIFT
      </button>
      <button
        onClick={() => downloadFile(questions, 'Aiken')}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-md transition-colors ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-yellow-600 text-white hover:bg-yellow-700'
        }`}
      >
        Aiken
      </button>
      <button
        onClick={() => downloadFile(questions, 'docx')}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-md transition-colors ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Docx
      </button>
      {s3Integration && (
        <button
          onClick={handleS3Export}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
            isDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isExporting ? (
            <>
              <LoadingIcon />
              <span>Exporting...</span>
            </>
          ) : (
            'Export to S3'
          )}
        </button>
      )}
    </div>
  );
};

export default FileDownloader;
