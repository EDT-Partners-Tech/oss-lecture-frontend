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
