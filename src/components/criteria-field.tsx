import React from 'react';
import { Criteria } from '../types';
import { Close } from '../images/icons';
import { Input } from './ui/input';

const CriteriaField: React.FC<{
  criteria: Criteria;
  isEdit?: boolean;
  onChange: (field: keyof Criteria, value: any) => void;
  onRemove: () => void;
}> = ({ criteria, isEdit = false, onChange, onRemove }) => (
  <div className="flex gap-2 mb-2">
    {isEdit ? (
      <>
        <Input
          classes="w-48 px-3 py-2 border rounded text-center"
          placeholder="Percentage (0-100)"
          type="number"
          min={0}
          max={100}
          step={5}
          value={parseInt(criteria.key)}
          onChange={e => onChange('key', parseInt(e.target.value) || 0)}
        />
        <textarea
          className="flex-1 px-3 py-2 border rounded min-h-[80px] resize-y"
          placeholder="Description"
          value={criteria.description}
          onChange={e => onChange('description', e.target.value)}
        />
        <button className="text-red-500 flex-none" onClick={onRemove}>
          <Close className="w-8" />
        </button>
      </>
    ) : (
      <>
        <p className="w-48 px-3 py-2 border rounded text-center">{criteria.key}</p>
        <p className="flex-1 px-3 py-2 border rounded min-h-[80px]">{criteria.description}</p>
      </>
    )}
  </div>
);

export default CriteriaField;
