import React, { useEffect, useState, useMemo } from 'react';
import { getModels } from '../services/api';
import { AIModel, ModelCategory } from '../types';

interface ModelSelectorProps {
  value?: string;
  onChange?: (modelId: string) => void;
  inputModality?: string[];
  outputModality?: string[];
  region?: string;
  className?: string;
  defaultModel?: string;
  category?: ModelCategory;
  supportsKnowledgeBase?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  inputModality = [],
  outputModality = ['Text'],
  region,
  className,
  defaultModel = 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  supportsKnowledgeBase,
  category,
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inputModalityString = useMemo(() => inputModality.join(','), [inputModality]);
  const outputModalityString = useMemo(() => outputModality.join(','), [outputModality]);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const response = await getModels({
          input_modality: inputModalityString,
          output_modality: outputModalityString,
          supports_knowledge_base: supportsKnowledgeBase,
          category,
        });
        setModels(response.models || []);
        setError(null);
      } catch (err) {
        setError('Failed to load AI models');
        setModels([]);
        console.error('Error loading models:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [region, inputModalityString, outputModalityString, category, supportsKnowledgeBase]);

  const groupedModels = useMemo(() => {
    return models.reduce(
      (acc, model) => {
        acc[model.provider] = acc[model.provider] || [];
        acc[model.provider].push(model);
        return acc;
      },
      {} as Record<string, AIModel[]>
    );
  }, [models]);

  if (loading) return <div className="model-selector-loading">Loading...</div>;
  if (error) return <div className="model-selector-error">{error}</div>;

  return (
    <div className={`model-selector-container ${className || ''}`}>
      <select
        value={value || defaultModel}
        onChange={e => onChange?.(e.target.value)}
        className="model-selector w-full text-gray-700 bg-white border border-gray-300 rounded-lg py-2.5 px-4 shadow-sm appearance-none cursor-pointer hover:border-blue-500 transition-colors"
        disabled={loading || !!error}
      >
        <option value="">Select an AI model</option>
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <optgroup key={provider} label={provider}>
            {providerModels.map(model => (
              <option key={model.identifier} value={model.identifier}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
