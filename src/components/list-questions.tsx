// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import QuestionCard from './question-card';
import { deleteQuestion, refreshQuestion, updateQuestion } from '../services/api';
import { showToast } from '../services/toastService';
import FileDownloader from './file-downloader';

interface ListQuestionsProps {
  questions: Question[];
  isClearButton?: boolean;
  onClear?: () => void;
  linkTo?: string;
  title?: string;
}

const ListQuestions: React.FC<ListQuestionsProps> = ({
  questions,
  isClearButton,
  onClear,
  linkTo,
  title,
}) => {
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(questionId)) {
        newSelected.delete(questionId);
      } else {
        newSelected.add(questionId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === localQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(localQuestions.map(q => q.id)));
    }
  };

  const handleSave = async (updatedQuestion: Question) => {
    try {
      const response = await updateQuestion(updatedQuestion.id, updatedQuestion);
      if (response) {
        showToast('success', 'Question Saved!');
        setLocalQuestions(prevQuestions =>
          prevQuestions.map(question =>
            question.id === updatedQuestion.id ? updatedQuestion : question
          )
        );
      }
    } catch (error) {
      console.error('Failed to update question:', error);
      showToast('error', 'Failed to save question. Please try again.');
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await deleteQuestion(questionId);
      if (response) {
        showToast('success', 'Question Deleted!');
        setLocalQuestions(prevQuestions =>
          prevQuestions.filter(question => question.id !== questionId)
        );
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      showToast('error', 'Failed to delete question. Please try again.');
    }
  };

  const handleReload = async (reloadedQuestion: Question, prompt: string) => {
    try {
      const kbId = title?.includes('Knowledge base: ') ? extractKnowledgeBaseId(title) : undefined;

      const response = kbId
        ? await refreshQuestion(reloadedQuestion, prompt, kbId)
        : await refreshQuestion(reloadedQuestion, prompt, '');

      if (response) {
        const updatedQuestions = questions.map(q =>
          q.id === reloadedQuestion.id ? { ...q, ...response } : q
        );
        setLocalQuestions(updatedQuestions);
        showToast('success', 'Question reloaded successfully!');
      }
    } catch (error) {
      console.error('Failed to reload question:', error);
      showToast('error', 'Failed to reload question. Please try again.');
    }
  };

  const extractKnowledgeBaseId = (title: string): string => {
    if (title.includes('Knowledge base: ')) {
      const parts = title.split(':');
      return parts.length > 1 ? parts[1].trim() : '';
    }
    return '';
  };

  const validQuestions = Array.isArray(localQuestions) ? localQuestions : [];
  const mcqQuestions = validQuestions.filter(q => q.type === 'mcq');
  const tfQuestions = validQuestions.filter(q => q.type === 'tf');
  const openQuestions = validQuestions.filter(q => q.type === 'open');

  const selectedQuestionsList = validQuestions.filter(q => selectedQuestions.has(q.id));

  return (
    <div>
      <div className="mt-8 space-y-8 bg-white p-6 shadow rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {isClearButton ? (
              <button
                onClick={onClear}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-foreground"
              >
                Clear
              </button>
            ) : (
              linkTo && <div></div>
            )}

            {title && <p className="text-2xl font-semibold">{title}</p>}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {selectedQuestions.size === localQuestions.length ? 'Deselect All' : 'Select All'}
            </button>
            <FileDownloader questions={selectedQuestionsList} />
          </div>
        </div>

        {selectedQuestions.size > 0 && (
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">{selectedQuestions.size}</span>
            </div>
            <span className="font-medium">
              {selectedQuestions.size === 1 ? 'Question' : 'Questions'} selected
            </span>
          </div>
        )}

        {mcqQuestions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Multiple Choice Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mcqQuestions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onReload={handleReload}
                  isSelected={selectedQuestions.has(question.id)}
                  onSelect={handleQuestionSelect}
                />
              ))}
            </div>
          </div>
        )}

        {tfQuestions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">True/False Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tfQuestions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onReload={handleReload}
                  isSelected={selectedQuestions.has(question.id)}
                  onSelect={handleQuestionSelect}
                />
              ))}
            </div>
          </div>
        )}

        {openQuestions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Open Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openQuestions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onReload={handleReload}
                  isSelected={selectedQuestions.has(question.id)}
                  onSelect={handleQuestionSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListQuestions;
