import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, Leaf, AlertCircle, Info } from 'lucide-react';
import { analyzeCrop, MOCK_CROP_ANALYSIS } from '../services/geminiService';

// ── 결과 텍스트를 라인별로 파싱해 렌더링 ────────────────────────────
function ResultView({ text }) {
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {lines.map((line, i) => {
        const isSection = /^[🌱📊💡🌿📍📋⚠️✅]/.test(line);
        const isList    = /^\s{2,}[-\d]/.test(line);
        return (
          <p
            key={i}
            style={{
              fontSize: isSection ? '14px' : '13px',
              fontWeight: isSection ? 600 : 400,
              color: isSection ? 'var(--text)' : 'var(--text-muted)',
              lineHeight: 1.85,
              marginTop: isSection && i !== 0 ? '10px' : 0,
              paddingLeft: isList ? '4px' : 0,
            }}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function CropMonitor() {
  const [image, setImage]       = useState(null);   // { file, url }
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [isMock, setIsMock]     = useState(false);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage({ file, url: URL.createObjectURL(file) });
    setResult(null);
    setError(null);
    setIsMock(false);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await analyzeCrop(image.file);
      setResult(text);
      setIsMock(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsMock(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <span className="section-title">작물 성장 분석</span>
        <span className="badge badge-info">Gemini AI</span>
      </div>

      {/* 사진 업로드 영역 */}
      {!image ? (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '12px',
            padding: '48px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg-subtle)',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        >
          <Leaf size={36} color="var(--color-primary)" strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            작물 사진을 올려주세요
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            카메라 촬영 또는 갤러리에서 선택<br />
            AI가 생태 건강 상태를 분석해드려요
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              padding: '7px 14px', borderRadius: '100px',
            }}>
              <Camera size={14} strokeWidth={1.5} /> 카메라
            </span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '7px 14px', borderRadius: '100px',
            }}>
              <Upload size={14} strokeWidth={1.5} /> 갤러리
            </span>
          </div>
        </div>
      ) : (
        <div>
          {/* 이미지 미리보기 */}
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
            <img
              src={image.url}
              alt="분석할 작물"
              style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={reset}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '100px',
                color: '#fff', fontSize: '12px', cursor: 'pointer',
                padding: '5px 12px', backdropFilter: 'blur(4px)',
              }}
            >
              다시 선택
            </button>
          </div>

          {/* 분석 버튼 */}
          {!result && !loading && (
            <button
              className="btn-primary"
              onClick={analyze}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px', marginBottom: '12px' }}
            >
              <Leaf size={16} strokeWidth={1.5} /> 작물 상태 분석하기
            </button>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <RefreshCw size={28} color="var(--color-primary)" strokeWidth={1.5}
                style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>작물 상태 분석 중...</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Gemini AI가 생태 건강 상태를 살피고 있어요</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* 오류 */}
          {error && (
            <div className="card-warning" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} color="var(--color-terra)" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-terra)', marginBottom: '4px' }}>분석 오류</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{error}</p>
                <button className="btn-ghost" onClick={analyze} style={{ marginTop: '8px', fontSize: '12px' }}>다시 시도</button>
              </div>
            </div>
          )}

          {/* 결과 */}
          {result && !loading && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>분석 결과</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isMock && (
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                      borderRadius: '100px', background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)', border: '1px solid var(--border)',
                    }}>
                      예시 결과
                    </span>
                  )}
                  <button className="btn-ghost" onClick={reset} style={{ fontSize: '12px' }}>새 사진</button>
                </div>
              </div>
              <ResultView text={result} />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {/* API 키 안내 */}
      <div style={{
        display: 'flex', gap: '8px', alignItems: 'flex-start',
        marginTop: '16px', padding: '12px 14px',
        background: 'var(--bg-subtle)', borderRadius: '8px',
      }}>
        <Info size={14} color="var(--text-muted)" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          설정에서 Gemini API 키를 입력하면 실제 AI 분석이 작동해요.
          키가 없으면 예시 결과가 표시됩니다.
        </p>
      </div>
    </div>
  );
}
