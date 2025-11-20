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

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { ComparisonEngineRule, Rule, SubRule } from '../types';
import { createComparisonRule } from '../services/api';
import { showToast } from '../services/toastService';
import { FaInfoCircle } from 'react-icons/fa';
import Tooltip from '../components/ui/tooltip';
import { useTranslation } from 'react-i18next';

type Priority = 'high' | 'medium' | 'low';

const ComparisonEngineRuleCreator: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const type = searchParams.get('type');
  const source = searchParams.get('source') ?? '/comparison-engine';
  const [comparisonEngineRule, setComparisonEngineRule] = React.useState<ComparisonEngineRule>({
    name: '',
    description: '',
    type: 'resume',
    data: {
      rules: [],
    },
  });

  const [ruleToAdd, setRuleToAdd] = React.useState<Rule>();

  const [subRuleToAdd, setSubRuleToAdd] = React.useState<SubRule>();

  const createRuleToAdd = () => {
    setRuleToAdd({
      name: '',
      description: '',
      priority: 'medium',
      isMandatory: false,
      subRules: [],
    });
  };

  const createSubRuleToAdd = () => {
    setSubRuleToAdd({
      name: '',
      description: '',
      priority: 'medium',
      isMandatory: false,
    });
  };

  const initData = useCallback(() => {
    if (type) {
      setComparisonEngineRule(prev => ({ ...prev, type }));
    }
  }, [type]);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleAddRule = async () => {
    if (!type) {
      showToast('error', t('comparison_engine.invalid_comparison_type'));
      return;
    }
    if (!comparisonEngineRule.name || !comparisonEngineRule.description) {
      showToast('error', t('comparison_engine.name_and_description_are_required'));
      return;
    }
    if (!comparisonEngineRule.data.rules || comparisonEngineRule.data.rules.length === 0) {
      showToast('error', t('comparison_engine.at_least_one_rule_is_required'));
      return;
    }

    try {
      const data = await createComparisonRule(type, comparisonEngineRule);
      if (!data) {
        showToast('error', t('comparison_engine.failed_to_create_rule'));
        return;
      }
      navigate(source.replace('pre_source', 'source'));
    } catch (error) {
      showToast('error', 'Failed to create rule');
    }
  };

  const handleBack = () => {
    navigate(source.replace('pre_source', 'source'));
  };

  const handleAddSubRule = () => {
    if (!subRuleToAdd?.name || !subRuleToAdd?.description) {
      showToast('error', t('comparison_engine.sub_rule_name_and_description_are_required'));
      return;
    }
    if (!ruleToAdd) {
      showToast('error', t('comparison_engine.no_rule_selected_for_sub_rule'));
      return;
    }
    if (!ruleToAdd.subRules) {
      ruleToAdd.subRules = [];
    }
    if (ruleToAdd.subRules.length >= 5) {
      showToast('error', t('comparison_engine.maximum_5_sub_rules_allowed_per_rule'));
      return;
    }

    setRuleToAdd(prev => ({ ...prev!, subRules: [...(prev?.subRules || []), subRuleToAdd] }));
    setSubRuleToAdd(undefined);
  };

  const handleAddRuleToComparison = () => {
    if (!ruleToAdd?.name || !ruleToAdd?.description) {
      showToast('error', t('comparison_engine.rule_name_and_description_are_required'));
      return;
    }
    if (!comparisonEngineRule.data.rules) {
      comparisonEngineRule.data.rules = [];
    }
    if (comparisonEngineRule.data.rules.length >= 5) {
      showToast('error', t('comparison_engine.maximum_5_rules_allowed'));
      return;
    }

    setComparisonEngineRule(prev => ({
      ...prev,
      data: { rules: [...(prev.data.rules || []), ruleToAdd] },
    }));
    setRuleToAdd(undefined);
    setSubRuleToAdd(undefined);
  };

  return (
    <Layout title={t('comparison_engine.rule_comparison_creator')}>
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <button
            className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
            onClick={handleBack}
          >
            {t('comparison_engine.back')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md h-full w-full max-w-full p-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              {t('comparison_engine.name')}:
            </label>
            <input
              type="text"
              id="name"
              value={comparisonEngineRule.name}
              onChange={e =>
                setComparisonEngineRule(prev => ({
                  ...prev,
                  name: e.target.value.replace(/\s+/g, ' '),
                }))
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              {t('comparison_engine.description')}:
            </label>
            <textarea
              id="description"
              value={comparisonEngineRule.description}
              onChange={e =>
                setComparisonEngineRule(prev => ({
                  ...prev,
                  description: e.target.value.replace(/\s+/g, ' '),
                }))
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <div className="mb-4 border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">
                {t('comparison_engine.rules')}
                <Tooltip
                  className="text-wrap min-w-[40vw]"
                  content={t('comparison_engine.rule_description')}
                  position="top"
                >
                  <FaInfoCircle className="ml-2 text-gray-500" />
                </Tooltip>
              </h3>
              {comparisonEngineRule.data.rules.map((rule, index) => (
                <div
                  key={`${rule.name}-${rule.description}-${index}`}
                  className="border p-2 rounded-md mb-2 relative"
                >
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => {
                      const newRules = [...comparisonEngineRule.data.rules];
                      newRules.splice(index, 1);
                      setComparisonEngineRule(prev => ({ ...prev, rules: newRules }));
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p>{t('comparison_engine.name')}: {rule.name}</p>
                  <p>{t('comparison_engine.description')}: {rule.description}</p>
                  <p>{t('comparison_engine.priority')}: {rule.priority}</p>
                  <p>{t('comparison_engine.is_mandatory')}: {rule.isMandatory ? 'Yes' : 'No'}</p>
                  <h4 className="text-md font-semibold mt-2">{t('comparison_engine.sub_rules')}:</h4>
                  {rule.subRules.map((subRule, subIndex) => (
                    <div
                      key={`${rule.name}-${rule.description}-${index}-${subRule.name}-${subIndex}`}
                      className="border p-1 rounded-md mb-1"
                    >
                      <p>{t('comparison_engine.name')}: {subRule.name}</p>
                      <p>{t('comparison_engine.description')}: {subRule.description}</p>
                      <p>{t('comparison_engine.priority')}: {subRule.priority}</p>
                      <p>{t('comparison_engine.is_mandatory')}: {subRule.isMandatory ? 'Yes' : 'No'}</p>
                    </div>
                  ))}
                </div>
              ))}
              {ruleToAdd && (
                <div className="mb-4 border p-4 rounded-md">
                  <h4 className="text-md font-semibold mb-2">{t('comparison_engine.add_rule')}</h4>
                  <div className="mb-2">
                    <label
                      htmlFor="ruleName"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      {t('comparison_engine.name')}:
                    </label>
                    <input
                      type="text"
                      id="ruleName"
                      value={ruleToAdd?.name || ''}
                      onChange={e =>
                        setRuleToAdd(prev => ({
                          ...(prev
                            ? { ...prev, name: e.target.value }
                            : {
                                name: e.target.value,
                                description: '',
                                priority: 'medium',
                                isMandatory: false,
                                subRules: [],
                              }),
                        }))
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor="ruleDescription"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      {t('comparison_engine.description')}:
                    </label>
                    <textarea
                      id="ruleDescription"
                      value={ruleToAdd?.description || ''}
                      onChange={e =>
                        setRuleToAdd(prev => ({
                          ...(prev
                            ? { ...prev, description: e.target.value }
                            : {
                                name: '',
                                description: e.target.value,
                                priority: 'medium',
                                isMandatory: false,
                                subRules: [],
                              }),
                        }))
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor="rulePriority"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      {t('comparison_engine.priority')}:
                    </label>
                    <select
                      id="rulePriority"
                      value={ruleToAdd?.priority}
                      onChange={e =>
                        setRuleToAdd(prev => ({
                          ...prev!,
                          priority: e.target.value as Priority,
                        }))
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="high">{t('comparison_engine.high')}</option>
                      <option value="medium">{t('comparison_engine.medium')}</option>
                      <option value="low">{t('comparison_engine.low')}</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={ruleToAdd?.isMandatory ?? false}
                        onChange={e =>
                          setRuleToAdd(prev => ({
                            ...prev!,
                            isMandatory: e.target.checked,
                          }))
                        }
                      />
                      <span className="ml-2 text-gray-700">{t('comparison_engine.is_mandatory')}</span>
                    </label>
                  </div>
                  <h4 className="text-md font-semibold mt-2">
                    {t('comparison_engine.sub_rules')}
                    <Tooltip
                      className="text-wrap min-w-[40vw]"
                      content={t('comparison_engine.sub_rule_description')}
                      position="top"
                    >
                      <FaInfoCircle className="ml-2 text-gray-500" />
                    </Tooltip>
                  </h4>
                  {ruleToAdd?.subRules?.map((subRule, subIndex) => (
                    <div
                      key={`subrule-${subRule.name}-${subRule.description}-${subIndex}`}
                      className="border p-2 rounded-md mb-2 relative"
                    >
                      <button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => {
                          const newSubRules = [...(ruleToAdd?.subRules ?? [])];
                          newSubRules.splice(subIndex, 1);
                          setRuleToAdd(prev => ({ ...prev!, subRules: newSubRules }));
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <p>{t('comparison_engine.name')}: {subRule.name}</p>
                      <p>{t('comparison_engine.description')}: {subRule.description}</p>
                      <p>{t('comparison_engine.priority')}: {subRule.priority}</p>
                      <p>{t('comparison_engine.is_mandatory')}: {subRule.isMandatory ? 'Yes' : 'No'}</p>
                    </div>
                  ))}
                  {subRuleToAdd && (
                    <div className="mb-4 border p-4 rounded-md">
                      <h4 className="text-md font-semibold mb-2">{t('comparison_engine.add_sub_rule')}</h4>
                      <div className="mb-2">
                        <label
                          htmlFor="subRuleName"
                          className="block text-gray-700 text-sm font-bold mb-2"
                        >
                          {t('comparison_engine.name')}:
                        </label>
                        <input
                          type="text"
                          id="subRuleName"
                          value={subRuleToAdd.name}
                          onChange={e =>
                            setSubRuleToAdd(prev => ({
                              ...(prev
                                ? { ...prev, name: e.target.value }
                                : {
                                    name: e.target.value,
                                    description: '',
                                    priority: 'medium',
                                    isMandatory: false,
                                  }),
                            }))
                          }
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor="subRuleDescription"
                          className="block text-gray-700 text-sm font-bold mb-2"
                        >
                          {t('comparison_engine.description')}:
                        </label>
                        <textarea
                          id="subRuleDescription"
                          value={subRuleToAdd?.description || ''}
                          onChange={e =>
                            setSubRuleToAdd(prev => ({
                              ...(prev
                                ? { ...prev, description: e.target.value }
                                : {
                                    name: '',
                                    description: e.target.value,
                                    priority: 'medium',
                                    isMandatory: false,
                                  }),
                            }))
                          }
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor="subRulePriority"
                          className="block text-gray-700 text-sm font-bold mb-2"
                        >
                          {t('comparison_engine.priority')}:
                        </label>
                        <select
                          id="subRulePriority"
                          value={subRuleToAdd?.priority ?? 'medium'}
                          onChange={e =>
                            setSubRuleToAdd(prev => ({
                              ...prev!,
                              priority: e.target.value as Priority,
                            }))
                          }
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="high">{t('comparison_engine.high')}</option>
                          <option value="medium">{t('comparison_engine.medium')}</option>
                          <option value="low">{t('comparison_engine.low')}</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={subRuleToAdd?.isMandatory ?? false}
                            onChange={e =>
                              setSubRuleToAdd(prev => ({
                                ...prev!,
                                isMandatory: e.target.checked,
                              }))
                            }
                          />
                          <span className="ml-2 text-gray-700">{t('comparison_engine.is_mandatory')}</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-end mt-4">
                        <button
                          className="mr-2 px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                          onClick={handleAddSubRule}
                        >
                          {t('comparison_engine.add_sub_rule_to_rule')}
                        </button>
                        <button
                          className="px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50"
                          onClick={() => {
                            setSubRuleToAdd(undefined);
                          }}
                        >
                          {t('comparison_engine.cancel_sub_rule')}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-end mt-4">
                    {!subRuleToAdd && (
                      <button
                        className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                        onClick={() => {
                          createSubRuleToAdd();
                        }}
                      >
                        {t('comparison_engine.create_new_sub_rule')}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {!subRuleToAdd && ruleToAdd && ruleToAdd.subRules.length < 5 ? (
                <div className="flex items-center justify-end mt-4">
                  <button
                    className="mr-2 px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                    onClick={handleAddRuleToComparison}
                  >
                    {t('comparison_engine.save_new_rule')}
                  </button>
                  <button
                    className="px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50"
                    onClick={() => {
                      setRuleToAdd(undefined);
                      setSubRuleToAdd(undefined);
                    }}
                  >
                    {t('comparison_engine.cancel_rule')}
                  </button>
                </div>
              ) : null}
              {!ruleToAdd && comparisonEngineRule.data.rules.length < 5 && (
                <div className="flex items-center justify-end mt-4">
                  <button
                    className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                    onClick={() => {
                      createRuleToAdd();
                    }}
                  >
                    {t('comparison_engine.create_new_rule')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end">
            {!subRuleToAdd &&
            !ruleToAdd &&
            comparisonEngineRule.data.rules.length &&
            comparisonEngineRule.name.length > 0 &&
            comparisonEngineRule.description.length > 0 ? (
              <button
                className="px-4 py-2 text-green-500 border border-green-500 rounded hover:bg-green-50"
                onClick={handleAddRule}
              >
                {t('comparison_engine.save_new_rule')}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComparisonEngineRuleCreator;
