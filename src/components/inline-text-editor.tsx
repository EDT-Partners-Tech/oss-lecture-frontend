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

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaCog,
} from 'react-icons/fa';
import { processText } from '../services/api';
import ToneAudienceModal from './tone-audience-modal';
import ModelSelector from './model-selector';
import { t } from 'i18next';

const InlineTextEditor = () => {
  const [hasSelection, setHasSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skeletonDivs, setSkeletonDivs] = useState<JSX.Element[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: t('rich_text_editor.type_here') }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-base focus:outline-none max-w-none text-black h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
      },
    },
    content: null,
  });

  useEffect(() => {
    if (!editor) return;

    const updateSelectionState = () => {
      const { from, to } = editor.state.selection;
      const selectionLength = to - from;

      setHasSelection(selectionLength > 2);
    };

    editor.on('selectionUpdate', updateSelectionState);
    return () => {
      editor.off('selectionUpdate', updateSelectionState);
    };
  }, [editor]);

  const getRandomWidth = () => {
    const widths = ['w-10/12', 'w-8/12', 'w-9/12', 'w-full', 'w-11/12'];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  const countTextLines = (text: string) => {
    const container = document.getElementById('editor-content');
    const containerWidth = container ? container.offsetWidth : 1150;
    const averageCharWidth = containerWidth * 0.14;
    const characterCount = text.length;
    const estimatedLines = Math.ceil(characterCount / averageCharWidth);

    const divs = Array.from({ length: estimatedLines }, (_, index) => (
      <div key={index} className={`h-3 bg-gray-200 rounded-full mb-3 ${getRandomWidth()}`}></div>
    ));

    setSkeletonDivs(divs);
  };

  const getSelectedIndices = (text: string, selection: Selection | null) => {
    if (!selection || selection.rangeCount === 0) {
      return { start: null, end: null };
    }

    const range = selection.getRangeAt(0);
    const selectedContent = range.cloneContents();
    const div = document.createElement('div');

    if (selectedContent) div.appendChild(selectedContent);
    const selectionHTML = div.innerHTML;
    const startIndex = text.indexOf(selectionHTML);
    const endIndex = startIndex !== -1 ? startIndex + selectionHTML.toString().length : -1;

    return { start: startIndex, end: endIndex };
  };

  const handleAIAction = async (action: string) => {
    if (!editor) {
      console.warn(t('rich_text_editor.editor_not_initialized'));
      return;
    }

    const fullText = editor.getHTML();
    const selection = window.getSelection();

    const { start, end } = getSelectedIndices(fullText, selection);

    setLoading(true);

    try {
      countTextLines(fullText);
      const processedText = await processText(
        fullText,
        action,
        start,
        end,
        selectedTones,
        selectedAudiences,
        selectedModel
      );
      editor.commands.setContent(processedText || fullText);
    } catch (error) {
      console.error(t('rich_text_editor.error_processing_ai_action'), error);
      editor.commands.setContent(fullText);
    } finally {
      setLoading(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative p-4 rounded-lg border border-gray-300 shadow-md bg-white mt-4">
      <div className="flex space-x-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          disabled={loading}
        >
          <FaBold className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          disabled={loading}
        >
          <FaItalic className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          disabled={loading}
        >
          <FaUnderline className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          <FaAlignLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          <FaAlignCenter className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          <FaAlignRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          <FaListUl className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          <FaListOl className="w-5 h-5" />
        </button>
        <div className="flex-grow"></div>
        <div>
          <ModelSelector value={selectedModel} onChange={modelId => setSelectedModel(modelId)} />
        </div>
        <button onClick={() => setModalOpen(true)} className="p-2 rounded">
          <FaCog className="w-5 h-5" />
        </button>
      </div>
      <div className="flex space-x-2 mb-2 pb-4">
        <button
          onClick={() => handleAIAction('summarize')}
          className={`p-2 rounded bg-blue-200 ${
            !hasSelection || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-300'
          }`}
          disabled={!hasSelection || loading}
        >
          {t('rich_text_editor.summarize')}
        </button>
        <button
          onClick={() => handleAIAction('rephrase')}
          className={`p-2 rounded bg-blue-200 ${
            !hasSelection || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-300'
          }`}
          disabled={!hasSelection || loading}
        >
          {t('rich_text_editor.rephrase')}
        </button>
        <button
          onClick={() => handleAIAction('expand')}
          className={`p-2 rounded bg-blue-200 ${
            !hasSelection || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-300'
          }`}
          disabled={!hasSelection || loading}
        >
          {t('rich_text_editor.expand')}
        </button>
        <button
          onClick={() => handleAIAction('format')}
          className={`p-2 rounded bg-blue-200 ${
            !hasSelection || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-300'
          }`}
          disabled={!hasSelection || loading}
        >
          {t('rich_text_editor.format')}
        </button>
      </div>

      <div className="overflow-hidden h-[65vh] relative">
        {loading ? (
          <div
            className="absolute inset-0 flex flex-col space-y-2 animate-pulse bg-white z-10 py-4 pointer-events-none"
            role="status"
          >
            {skeletonDivs}
            <span className="sr-only">{t('rich_text_editor.loading')}</span>
          </div>
        ) : (
          <EditorContent editor={editor} className="h-full w-full py-4" id="editor-content" />
        )}
      </div>
      <ToneAudienceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(tones: string[], audiences: string[]) => {
          setSelectedTones(tones);
          setSelectedAudiences(audiences);
        }}
      />
    </div>
  );
};

export default InlineTextEditor;
