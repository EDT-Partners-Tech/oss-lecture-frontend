import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { fetchEvaluationById } from '../services/api';
import { showToast } from '../services/toastService';

const ViewEvaluation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      setLoading(true);
      try {
        if (!id) {
          showToast('error', 'Evaluation ID is undefined');
          return;
        }
        const data = await fetchEvaluationById(id);
        setEvaluation(data);
      } catch (error) {
        console.error('Error fetching evaluation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

  const handleBack = () => {
    navigate('/evaluations');
  };

  const calculateTotalScore = (criteriaEvaluation: any[]) => {
    const validCriteria = criteriaEvaluation.filter(
      criterion => !isNaN(parseInt(criterion.score.toString().match(/\d+/)?.[0] || ''))
    );

    if (validCriteria.length === 0) return 0;

    const totalValidWeight = validCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);

    const weightedScore = validCriteria.reduce((total, criterion) => {
      const score = parseInt(criterion.score.toString().match(/\d+/)?.[0] || '0');
      const adjustedWeight = criterion.weight / totalValidWeight;
      return total + score * adjustedWeight;
    }, 0);

    return weightedScore;
  };

  const parseSourceText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const pages: { [key: string]: string[] } = {};

    // Check if the text matches the expected format
    const isExpectedFormat = lines.some(line =>
      line.match(/^Page \d+: '.+' \[Font size: \d+\.\d+, Bold: (True|False)\]$/)
    );

    if (!isExpectedFormat) {
      // Simple fallback for plain text with escaped characters
      const cleanText = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

      pages['1'] = cleanText
        .split('\n')
        .map(line => `<div class="mb-1.5" style="font-size: 12px;">${line}</div>`);
      return pages;
    }

    // Original parsing logic for expected format
    let currentListType: null | 'ordered' | 'unordered' = null;
    let listItems: string[] = [];
    let currentPage: string | null = null;
    let skipNext = false;

    const standardizeFontSize = (size: number): number => {
      if (size <= 12) return 8;
      if (size <= 14) return 10;
      if (size <= 16) return 12;
      if (size <= 18) return 13;
      return 15;
    };

    for (let i = 0; i < lines.length; i++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const match = lines[i].match(
        /^Page (\d+): '(.+)' \[Font size: (\d+\.\d+), Bold: (True|False)\]$/
      );

      if (!match) continue;

      const [, page, content, fontSize, bold] = match;
      currentPage = page;

      if (!pages[page]) {
        pages[page] = [];
      }

      // Check for list markers
      const isNumberedList = content.match(/^\d+\.$/);
      const isBullet = content === '•' || content === 'o';

      if (isNumberedList || isBullet) {
        // Start new list if not already in one
        if (!currentListType) {
          currentListType = isNumberedList ? 'ordered' : 'unordered';
          listItems = [];
        }

        // Get next line's content
        const nextLine = lines[i + 1];
        if (nextLine) {
          const nextMatch = nextLine.match(
            /^Page (\d+): '(.+)' \[Font size: (\d+\.\d+), Bold: (True|False)\]$/
          );
          if (nextMatch && nextMatch[1] === page) {
            const [, , nextContent, nextFontSize, nextBold] = nextMatch;
            listItems.push(
              `<li style="font-size: ${standardizeFontSize(
                parseFloat(nextFontSize)
              )}px; font-weight: ${nextBold === 'True' ? 'bold' : 'normal'};">${nextContent}</li>`
            );
            skipNext = true;
          }
        }
      } else {
        // If we were building a list and encountered non-list content
        if (currentListType && listItems.length > 0) {
          const listTag = currentListType === 'ordered' ? 'ol' : 'ul';
          pages[page].push(`<${listTag} class="ml-5 list-disc">${listItems.join('')}</${listTag}>`);
          currentListType = null;
          listItems = [];
        }

        // Add regular content
        if (content.trim()) {
          pages[page].push(
            `<div class="mb-1.5" style="font-size: ${standardizeFontSize(
              parseFloat(fontSize)
            )}px; font-weight: ${bold === 'True' ? 'bold' : 'normal'};">${content}</div>`
          );
        }
      }
    }

    // Add any remaining list items
    if (currentListType && listItems.length > 0 && currentPage) {
      const listTag = currentListType === 'ordered' ? 'ol' : 'ul';
      pages[currentPage].push(`<${listTag} class="ml-20">${listItems.join('')}</${listTag}>`);
    }

    return pages;
  };

  return (
    <Layout title="View Evaluation">
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <button
            className="px-4 py-2 mb-4 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
            onClick={handleBack}
          >
            Back
          </button>
          <h1 className="text-2xl font-bold text-center w-full">Evaluation Details</h1>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : evaluation ? (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">General Information</h2>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p>
                      <strong>Course Name:</strong> {evaluation.course_name}
                    </p>
                    <p>
                      <strong>Student Name:</strong> {evaluation.student_name}{' '}
                      {evaluation.student_surname}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Exam Description:</strong> {evaluation.exam_description}
                    </p>
                    <p>
                      <strong>Total Score:</strong>{' '}
                      {calculateTotalScore(evaluation.criteria_evaluation)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Criteria Evaluation</h2>
                <div className="space-y-4 mt-2">
                  {evaluation.criteria_evaluation.map((criteria: any, index: number) => (
                    <div key={index} className="p-4 border rounded-md shadow-sm bg-gray-50">
                      <h3 className="text-lg font-bold mb-2">{criteria.name}</h3>
                      <p>
                        <strong>Score:</strong> {criteria.score}
                      </p>
                      <p>
                        <strong>Suggestions:</strong> {criteria.suggestions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold">Overall Comments</h2>
                <p className="mt-2">{evaluation.overall_comments || 'No additional comments.'}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold">Source Text</h2>
                <div className="mt-2 grid grid-cols-2 gap-4 overflow-hidden">
                  {Object.entries(parseSourceText(evaluation.source_text)).map(
                    ([page, contents]) => (
                      <div
                        key={page}
                        className="relative p-4 border rounded bg-white overflow-y-auto"
                        style={{
                          width: '140mm',
                          height: '180mm',
                          padding: '10mm',
                          margin: '0 auto',
                        }}
                      >
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: contents.join(''),
                          }}
                          style={{
                            lineHeight: '1.5',
                          }}
                        />
                        <div className="absolute top-2 left-0 right-0 text-xs font-bold text-gray-500 text-center">
                          Page {page}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Rubric ID */}
              <div className="mt-4 text-gray-500">
                <p>
                  <strong>Rubric ID:</strong> {evaluation.rubric_id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl font-semibold text-red-500">Evaluation not found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewEvaluation;
