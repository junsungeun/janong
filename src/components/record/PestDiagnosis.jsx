import React, { useState, useRef } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { Select } from '../ui/Input';
import { diagnosePest } from '../../services/geminiService';

export default function PestDiagnosis({ crops = [], onSave, onClose }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropId, setCropId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await diagnosePest(file);
      setResult(data);
    } catch (err) {
      setError(err.message || '진단 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLog = () => {
    if (!result || !cropId) return;
    onSave?.({
      cropId,
      aiStatus: '주의',
      aiAnalysis: `[병해충] ${result.pest}\n원인: ${result.cause}\n방제: ${result.solutions?.join(', ')}`,
      memo: result.warning || '',
      photos: file ? [file] : [],
    });
  };

  const cropOptions = crops.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="pest-diagnosis page-slide-in">
      <div className="pest-diagnosis-header">
        <h2 className="section-title">병해충 진단</h2>
        <Button variant="ghost" onClick={onClose}>닫기</Button>
      </div>

      {/* Photo upload - prominent area */}
      <div
        className={`pest-photo-upload ${preview ? 'has-photo' : ''}`}
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="진단 사진" className="pest-photo-preview" />
        ) : (
          <div className="pest-photo-placeholder">
            <div className="pest-photo-placeholder-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <span className="pest-photo-placeholder-text">
              증상 사진 촬영/선택
            </span>
            <span className="pest-photo-placeholder-hint">
              잎, 줄기, 열매의 이상 부위를 촬영해주세요
            </span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          hidden
        />
      </div>

      {/* Analyze button */}
      {file && !result && !loading && (
        <Button
          variant="primary"
          className="pest-analyze-btn"
          onClick={handleAnalyze}
        >
          AI 진단 시작
        </Button>
      )}

      {/* Loading state */}
      {loading && (
        <div className="pest-loading">
          <Spinner />
          <p className="text-sm text-muted">AI가 분석 중입니다...</p>
        </div>
      )}

      {error && <p className="pest-error">{error}</p>}

      {/* Results in structured cards */}
      {result && (
        <div className="pest-results">
          <Card variant="warning" className="pest-result-card">
            <div className="pest-result-header">
              <Badge variant="danger">{result.pest}</Badge>
            </div>

            <div className="pest-result-section">
              <p className="pest-result-label">발생 원인</p>
              <p className="pest-result-text">{result.cause}</p>
            </div>

            {/* Solutions as numbered list with green bullets */}
            {result.solutions?.length > 0 && (
              <div className="pest-result-section">
                <p className="pest-result-label">자연농업 방제법</p>
                <ul className="pest-solutions-list">
                  {result.solutions.map((s, i) => (
                    <li key={i} className="pest-solution-item">
                      <span className="pest-solution-num">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.warning && (
              <div className="pest-result-section">
                <p className="pest-result-label">주의사항</p>
                <p className="pest-result-text">{result.warning}</p>
              </div>
            )}
          </Card>

          {/* Save to log */}
          <div className="pest-save-section">
            <Select
              options={cropOptions}
              placeholder="작물 선택"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={handleSaveToLog}
              disabled={!cropId}
              className="pest-save-btn"
            >
              일지에 저장
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
