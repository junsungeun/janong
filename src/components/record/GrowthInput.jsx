import React from 'react';
import { Field, Input } from '../ui/Input';

export default function GrowthInput({ values = {}, onChange }) {
  const handleChange = (key) => (e) => {
    const val = e.target.value;
    onChange({ ...values, [key]: val === '' ? '' : Number(val) });
  };

  return (
    <div className="growth-input-row">
      <Field label="키 (cm)">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={values.heightCm ?? ''}
          onChange={handleChange('heightCm')}
          min="0"
          step="0.1"
        />
      </Field>
      <Field label="잎 수">
        <Input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={values.leafCount ?? ''}
          onChange={handleChange('leafCount')}
          min="0"
          step="1"
        />
      </Field>
      <Field label="줄기 (mm)">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={values.stemMm ?? ''}
          onChange={handleChange('stemMm')}
          min="0"
          step="0.1"
        />
      </Field>
    </div>
  );
}
