import React from 'react';
import { Input } from '../ui/Input';

export default function GrowthInput({ values = {}, onChange }) {
  const handleChange = (key) => (e) => {
    const val = e.target.value;
    onChange({ ...values, [key]: val === '' ? '' : Number(val) });
  };

  return (
    <div className="growth-input-row">
      <div className="growth-input-field">
        <label className="growth-input-label">키</label>
        <div className="growth-input-wrap">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={values.heightCm ?? ''}
            onChange={handleChange('heightCm')}
            min="0"
            step="0.1"
          />
          <span className="growth-input-unit">cm</span>
        </div>
      </div>
      <div className="growth-input-field">
        <label className="growth-input-label">잎 수</label>
        <div className="growth-input-wrap">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={values.leafCount ?? ''}
            onChange={handleChange('leafCount')}
            min="0"
            step="1"
          />
          <span className="growth-input-unit">장</span>
        </div>
      </div>
      <div className="growth-input-field">
        <label className="growth-input-label">줄기</label>
        <div className="growth-input-wrap">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={values.stemMm ?? ''}
            onChange={handleChange('stemMm')}
            min="0"
            step="0.1"
          />
          <span className="growth-input-unit">mm</span>
        </div>
      </div>
    </div>
  );
}
