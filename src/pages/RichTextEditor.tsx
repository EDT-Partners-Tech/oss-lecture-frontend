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

import React from 'react';
import Layout from '../components/layout';
import InlineTextEditor from '../components/inline-text-editor';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';

const RichTextEditor: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Layout title={t('rich_text_editor.title')}>
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/dashboard')}
        >
          {t('rich_text_editor.back')}
        </button>
      </div>
      <InlineTextEditor />
    </Layout>
  );
};

export default RichTextEditor;
