import React, { useState } from 'react';
import { Share2, Download, Check } from 'lucide-react';
import { GROWTH_STAGES } from '../../constants';

function generateHtml(logs, crops, cropMap, groupName) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = logs.slice(0, 50).map((l) => {
    const stage = GROWTH_STAGES.find((s) => s.value === l.stage);
    return `<tr>
      <td>${l.date || ''}</td>
      <td>${cropMap[l.cropId] || ''}</td>
      <td>${stage ? `${stage.icon} ${stage.label}` : ''}</td>
      <td>${l.houseTemp ?? l.temperature ?? ''}</td>
      <td>${l.heightCm ?? ''}</td>
      <td>${l.leafCount ?? ''}</td>
      <td>${(l.memo || '').slice(0, 50)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SeedLog 리포트${groupName ? ` - ${groupName}` : ''}</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1A1E27; }
  h1 { color: #2E7D32; font-size: 24px; }
  .meta { color: #8E95A3; font-size: 14px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: #F4F7FA; padding: 10px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #E8EBF0; }
  td { padding: 8px; border-bottom: 1px solid #E8EBF0; }
  .footer { margin-top: 32px; font-size: 12px; color: #8E95A3; }
</style>
</head>
<body>
  <h1>SeedLog 리포트</h1>
  <p class="meta">${groupName ? `${groupName} · ` : ''}${today} 기준 · 작물 ${crops.length}종 · 기록 ${logs.length}건</p>
  <table>
    <thead><tr><th>날짜</th><th>작물</th><th>단계</th><th>온도</th><th>키(cm)</th><th>잎 수</th><th>메모</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">SeedLog 농사 기록 플랫폼에서 생성됨</p>
</body>
</html>`;
}

export default function ShareReport({ logs, crops, cropMap, groupName }) {
  const [shared, setShared] = useState(false);

  const handleDownload = () => {
    const html = generateHtml(logs, crops, cropMap, groupName);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SeedLog_리포트_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const html = generateHtml(logs, crops, cropMap, groupName);
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'SeedLog_리포트.html', { type: 'text/html' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: 'SeedLog 리포트', files: [file] });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {}
    } else {
      handleDownload();
    }
  };

  return (
    <div className="share-report">
      <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
        전체 데이터를 HTML 리포트로 공유하거나 다운로드합니다.
      </p>
      <div className="share-report-btns">
        <button className="btn-primary" onClick={handleShare} style={{ flex: 1 }}>
          {shared ? <Check size={16} /> : <Share2 size={16} />}
          {shared ? '공유됨' : '공유하기'}
        </button>
        <button className="btn-secondary" onClick={handleDownload} style={{ flex: 1 }}>
          <Download size={16} />
          HTML 다운로드
        </button>
      </div>
    </div>
  );
}
