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
