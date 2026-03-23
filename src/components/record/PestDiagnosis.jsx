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

      {/* Photo upload */}
      <div
        className="pest-photo-upload"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="진단 사진" className="pest-photo-preview" />
        ) : (
          <div className="pest-photo-placeholder">
            <span className="pest-photo-icon">+</span>
            <span>사진 촬영/선택</span>
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

      {file && !result && !loading && (
        <Button variant="primary" className="pest-analyze-btn" onClick={handleAnalyze}>
          AI 진단 시작
        </Button>
      )}

      {loading && (
        <div className="pest-loading">
          <Spinner />
          <p className="text-sm text-muted">AI가 분석 중입니다...</p>
        </div>
      )}

      {error && <p className="pest-error">{error}</p>}

      {/* Results */}
      {result && (
        <div className="pest-results">
          <Card variant="warning">
            <div className="pest-result-header">
              <Badge variant="danger">{result.pest}</Badge>
            </div>
            <div className="pest-result-section">
              <p className="pest-result-label">발생 원인</p>
              <p className="pest-result-text">{result.cause}</p>
            </div>
            {result.solutions?.length > 0 && (
              <div className="pest-result-section">
                <p className="pest-result-label">자연농업 방제법</p>
                <ol className="pest-solutions-list">
                  {result.solutions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
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
