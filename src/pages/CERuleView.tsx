import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout';
import { fetchComparisonEngineRuleData } from '../services/api';

const ComparisonEngineRuleView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  let source = searchParams.get('source') ?? '/comparison-engine';
  const { id } = useParams<{ id: string }>();
  const [comparisonData, setComparisonData] = useState<any>(null);

  const fetchComparisonsData = useCallback(async () => {
    try {
      if (!id) {
        console.error('ID is required.');
        return;
      }
      const data = await fetchComparisonEngineRuleData(id);

      if (!data) {
        console.error('No data found for the given ID.');
        return;
      }
      setComparisonData(data);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchComparisonsData();
  }, [fetchComparisonsData]);

  const handleBack = () => {
    if (source.startsWith('"') && source.endsWith('"')) {
      source = source.slice(1, -1);
    }

    navigate(source);
  };
  const [comparisonEngineRule, setComparisonEngineRule] = useState<any>({
    name: '',
    description: '',
    type: 'resume',
    data: {
      rules: [],
    },
  });

  useEffect(() => {
    if (comparisonData) {
      setComparisonEngineRule({
        name: comparisonData.name,
        description: comparisonData.description,
        type: comparisonData.type,
        data: comparisonData.data,
      });
    }
  }, [comparisonData]);
  return (
    <Layout title="Comparison Engine Rule View">
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <button
            className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md h-full w-full max-w-full p-4">
          <h2 className="text-xl font-semibold mb-4">Comparison Engine Rule Details</h2>
          {comparisonEngineRule && (
            <>
              <div className="mb-4">
                <p>
                  <strong>Name:</strong> {comparisonEngineRule.name}
                </p>
              </div>
              <div className="mb-4">
                <p>
                  <strong>Description:</strong> {comparisonEngineRule.description}
                </p>
              </div>
              <div className="mb-4">
                <p>
                  <strong>Type:</strong> {comparisonEngineRule.type}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Rules</h3>
                {comparisonEngineRule.data?.rules?.map((rule: any, index: number) => (
                  <div
                    key={`${rule.name}-${rule.description}-${index}`}
                    className="border p-4 rounded-md mb-4"
                  >
                    <h4 className="text-md font-semibold">Rule {index + 1}</h4>
                    <p>
                      <strong>Name:</strong> {rule.name}
                    </p>
                    <p>
                      <strong>Description:</strong> {rule.description}
                    </p>
                    <p>
                      <strong>Priority:</strong> {rule.priority}
                    </p>
                    <p>
                      <strong>Is Mandatory:</strong> {rule.isMandatory ? 'Yes' : 'No'}
                    </p>
                    {rule.subRules && rule.subRules.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold mt-2">Sub Rules:</h5>
                        {rule.subRules.map((subRule: any, subIndex: number) => (
                          <div
                            key={`${rule.name}-${rule.description}-${index}-${subRule.name}-${subRule.description}-${subIndex}`}
                            className="border p-2 rounded-md mt-2"
                          >
                            <h6 className="text-xs font-semibold">Sub Rule {subIndex + 1}</h6>
                            <p>
                              <strong>Name:</strong> {subRule.name}
                            </p>
                            <p>
                              <strong>Description:</strong> {subRule.description}
                            </p>
                            <p>
                              <strong>Priority:</strong> {subRule.priority}
                            </p>
                            <p>
                              <strong>Is Mandatory:</strong> {subRule.isMandatory ? 'Yes' : 'No'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComparisonEngineRuleView;
