// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { FaFileAlt, FaBook } from 'react-icons/fa';

const cardComparisonData = [
  {
    id: 'document-comparison',
    name: 'Document Comparison',
    code: 'document_comparison',
    icon: FaFileAlt,
    title: 'Document Comparison',
    description: 'Compare two documents side by side',
    bgColor: 'bg-red-200',
    url: '/comparison-engine/document',
    isKnowledgebase: false,
    isknowledgebase: false,
  },
  {
    id: 'curriculum-job',
    name: 'Curriculum vs Job Position',
    code: 'curriculum_job',
    icon: FaBook,
    title: 'Curriculum vs Job Position',
    description: 'Compare a curriculum with a job position to determine suitability.',
    bgColor: 'bg-orange-200',
    url: '/comparison-engine/resume',
    isKnowledgebase: false,
    isknowledgebase: false,
  },
];

export default cardComparisonData;
