import { ChangeEvent, useState } from 'react';
import { Close, Upload } from '../images/icons';

type MultiFileUploadProps = {
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  files: File[];
  formats: string[];
  text: string;
  clearFile: (index?: number) => void;
  className?: string;
};

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  handleFileChange,
  files,
  text,
  formats,
  clearFile,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const event = {
        target: {
          files: droppedFiles,
        },
      } as ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const acceptedFormats = formats.map(format => `.${format}`).join(',');

  const groupFormats = (formats: string[]) => {
    const groups: { [key: string]: string[] } = {
      Documents: ['pdf', 'docx', 'doc'],
      Spreadsheets: ['xlsx', 'xls'],
      Images: ['jpg', 'jpeg', 'png'],
      Audio: ['mp3', 'wav', 'ogg'],
      Video: ['mp4', 'mpeg', 'webm'],
    };

    const groupedFormats: { [key: string]: string[] } = {};
    formats.forEach(format => {
      for (const [groupName, groupFormats] of Object.entries(groups)) {
        if (groupFormats.includes(format.toLowerCase())) {
          if (!groupedFormats[groupName]) {
            groupedFormats[groupName] = [];
          }
          groupedFormats[groupName].push(format);
        }
      }
    });

    return groupedFormats;
  };

  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full min-h-64 rounded-lg cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'bg-blue-50 border-blue-400 border-2 shadow-lg'
            : 'bg-background hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center p-6">
          <Upload className="w-16 h-16 text-blue-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">{text}</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(groupFormats(formats)).map(([group, formats]) => (
              <div key={group} className="text-center">
                <span className="text-sm font-bold text-gray-600 block">{group}</span>
                <span className="text-sm text-gray-500">
                  {formats.map(f => f.toUpperCase()).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept={acceptedFormats}
          onChange={handleFileChange}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Upload className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium truncate">{file.name}</span>
                </div>
                <button
                  className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => clearFile(index)}
                >
                  <Close className="w-5 h-5 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => clearFile()}
            >
              Clear All Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;
