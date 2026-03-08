// AI 결과 텍스트 파서 — Gemini 응답을 구조화 렌더링
export default function ResultView({ text, size = 'sm' }) {
  const lines = text.split('\n').filter(l => l.trim());
  const isLg = size === 'lg';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {lines.map((line, i) => {
        const isSection = /^[📍🌿⚠️✅📊💡🌱📋]/.test(line);
        const isList    = /^\s{2,}[-\d]/.test(line);
        return (
          <p key={i} style={{
            fontSize: isSection ? (isLg ? '14px' : '13px') : (isLg ? '13px' : '12px'),
            fontWeight: isSection ? 600 : 400,
            color: isSection ? 'var(--text)' : 'var(--text-muted)',
            lineHeight: 1.85,
            marginTop: isSection && i !== 0 ? (isLg ? '10px' : '8px') : 0,
            paddingLeft: isList ? '4px' : 0,
          }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
