import React, { useState } from 'react';
import { Ai, Check, Circle, Delete, Dots, Edit, Reload, Save } from '../images/icons';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onSave: (updatedQuestion: Question) => Promise<void>;
  onDelete: (questionId: string) => Promise<void>;
  onReload: (question: Question, prompt: string) => Promise<void>;
  isSelected?: boolean;
  onSelect?: (questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSave,
  onDelete,
  onReload,
  isSelected = false,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger selection if clicking on action buttons
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea'))
    ) {
      return;
    }
    onSelect?.(question.id);
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    onSave(editedQuestion);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...(editedQuestion.options || [])];
    updatedOptions[index] = value;
    setEditedQuestion(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleCorrectAnswerChange = (correctAnswer: string) => {
    setEditedQuestion(prev => ({ ...prev, correct_answer: correctAnswer }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      onDelete(question.id);
    }
  };

  const handleReload = () => {
    setShowPromptInput(true);
  };

  const handleSubmitReload = async () => {
    setIsReloading(true);
    setShowPromptInput(false);
    await onReload(question, prompt);
    setPrompt('');
    setIsReloading(false);
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
      role="button"
      tabIndex={0}
      className={`p-4 border rounded-md shadow-md bg-white relative pr-24 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50'
          : 'hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      }`}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            name="question"
            value={editedQuestion.question}
            onChange={handleChange}
            className="font-semibold border p-1 w-full"
          />

          {(question.type === 'mcq' || question.type === 'tf') && (
            <div className="mt-2">
              {editedQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center mt-1">
                  <button onClick={() => handleCorrectAnswerChange(option)} className="mr-2">
                    {editedQuestion.correct_answer === option ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={e => handleOptionChange(index, e.target.value)}
                    className="border p-1 w-full mr-2"
                  />
                </div>
              ))}
              <div className="mt-2">
                <label className="text-sm text-gray-600">Remediation:</label>
                <textarea
                  name="reason"
                  value={editedQuestion.reason}
                  onChange={handleChange}
                  className="mt-1 italic text-gray-600 border p-1 w-full"
                />
              </div>
            </div>
          )}

          {question.type === 'open' && (
            <textarea
              name="reason"
              value={editedQuestion.reason}
              onChange={handleChange}
              className="mt-2 italic text-gray-600 border p-1 w-full"
            />
          )}

          <button
            onClick={handleSave}
            className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full"
          >
            <Save className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          {isReloading ? (
            <div>
              <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4"></div>
              {question.type !== 'open' && Array.isArray(question?.options) && (
                <div className="animate-pulse">
                  <div className="mt-2">
                    <ul className="list-none">
                      {Array(question?.options.length)
                        .fill('')
                        .map((_, idx) => (
                          <li key={idx} className="flex items-center p-1">
                            <div className="w-5 h-5 bg-gray-200 rounded-full dark:bg-gray-700 inline-block mr-2"></div>
                            <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4"></div>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="mt-2">
                    <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-2/3"></div>
                  </div>
                </div>
              )}

              {question.type === 'open' && question.reason && (
                <p className="mt-2">
                  <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="font-semibold">{question.question}</p>

              {question.type !== 'open' && Array.isArray(question?.options) && (
                <div>
                  <ul className="list-none mt-2">
                    {question?.options.map((option, idx) => (
                      <li key={idx} className="p-1 flex items-center">
                        {question.correct_answer === option ? (
                          <Check className="w-5 h-5 min-w-5 text-green-500 inline-block mr-2" />
                        ) : (
                          <Circle className="w-5 h-5 min-w-5 text-gray-500 inline-block mr-2" />
                        )}
                        {option}
                      </li>
                    ))}
                  </ul>

                  {question.reason && (
                    <p className="mt-2 italic text-gray-600">
                      <b>Remediation:</b> {question.reason}
                    </p>
                  )}
                </div>
              )}

              {question.type === 'open' && question.reason && (
                <p className="mt-2 italic text-gray-600">
                  <b>Answer Guide:</b> {question.reason}
                </p>
              )}
            </>
          )}

          {showPromptInput && (
            <div className="mt-4 w-full">
              <input
                type="text"
                placeholder="Enter a prompt for generating a new question"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full border p-1 rounded-md"
              />
              {prompt && (
                <button
                  onClick={handleSubmitReload}
                  className="absolute bottom-4 right-4 mt-2 bg-purple-500 text-white p-2 rounded-md"
                >
                  <Ai className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="absolute top-2 right-2">
            <button
              onClick={e => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 rounded-full focus:outline-none transition duration-200 ease-in-out hover:bg-gray-300"
            >
              <Dots className="w-6 h-6" />
            </button>

            <div
              className={`absolute -top-12 -right-2 flex flex-row gap-2 transition-all duration-300 ease-in-out ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
              style={{ zIndex: isExpanded ? '10' : '-1' }}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="p-2 bg-gray-200 rounded-full transform transition-transform duration-300 ease-in-out hover:bg-gray-300"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleReload();
                }}
                className="p-2 bg-blue-500 text-white rounded-full transform transition-transform duration-300 ease-in-out hover:bg-blue-600"
              >
                <Reload className="w-5 h-5" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-2 bg-red-500 text-white rounded-full transform transition-transform duration-300 ease-in-out hover:bg-red-600"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionCard;
