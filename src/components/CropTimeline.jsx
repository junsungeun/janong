import { getCropTimeline, daysSincePlanting } from '../data/cropTimelines';

export default function CropTimeline({ cropName, plantingDate }) {
  if (!plantingDate) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '14px' }}>정식일을 입력하면 타임라인이 생성됩니다</p>
      </div>
    );
  }

  const items   = getCropTimeline(cropName, plantingDate);
  const elapsed = daysSincePlanting(plantingDate);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '14px' }}>「기타」 작물은 타임라인 자동 생성이 지원되지 않아요</p>
        <p style={{ fontSize: '12px', marginTop: '6px' }}>지원 작물: 고추, 토마토, 오이, 가지, 배추 등</p>
      </div>
    );
  }

  // 현재 시점에서 가장 가까운 미래 항목 인덱스
  const nextIdx = items.findIndex(i => !i.isPast);

  return (
    <div>
      {/* 경과일 배지 */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '13px', fontWeight: 700, padding: '5px 14px',
          borderRadius: '100px', background: 'var(--color-primary)',
          color: '#fff',
        }}>
          D+{elapsed}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {plantingDate.replace(/-/g, '.')} 정식
        </span>
      </div>

      {/* 타임라인 세로 목록 */}
      <div style={{ position: 'relative' }}>
        {/* 세로 연결선 */}
        <div style={{
          position: 'absolute',
          left: '19px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          background: 'var(--border-light)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {items.map((item, i) => {
            const isNext = i === nextIdx;
            let dotColor = 'var(--border)';
            let textColor = 'var(--text-muted)';
            let bgColor   = 'transparent';

            if (item.isPast) {
              dotColor  = 'var(--color-primary)';
              textColor = 'var(--text-muted)';
            } else if (item.isToday) {
              dotColor  = 'var(--color-earth)';
              textColor = 'var(--color-earth)';
              bgColor   = '#FFF8F0';
            } else if (isNext) {
              dotColor  = 'var(--color-primary)';
              textColor = 'var(--text)';
              bgColor   = 'var(--color-primary-light)';
            } else if (item.isSoon) {
              dotColor  = 'var(--color-terra)';
              textColor = 'var(--text)';
            }

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '10px 12px 10px 0',
                  borderRadius: '8px',
                  background: bgColor,
                  transition: 'background 0.15s',
                }}
              >
                {/* 점 */}
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: item.isPast ? dotColor : 'var(--bg)',
                  border: `2px solid ${dotColor}`,
                  flexShrink: 0,
                  marginTop: '3px',
                  marginLeft: '13px',
                  zIndex: 1,
                  position: 'relative',
                }}>
                  {item.isPast && (
                    <svg
                      viewBox="0 0 10 8"
                      width="7"
                      height="7"
                      style={{ position: 'absolute', top: '1px', left: '1px' }}
                    >
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>

                {/* 내용 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: isNext || item.isToday ? 700 : 500, color: textColor }}>
                      {item.label}
                    </span>
                    {item.isToday && (
                      <span className="badge badge-good" style={{ fontSize: '10px' }}>오늘</span>
                    )}
                    {isNext && !item.isToday && (
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>다음</span>
                    )}
                    {item.isSoon && !isNext && (
                      <span style={{
                        fontSize: '10px', padding: '1px 7px', borderRadius: '100px',
                        background: '#FFF8F5', color: 'var(--color-terra)',
                        border: '1px solid var(--color-terra)',
                      }}>D-{item.daysFromNow}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {item.date.replace(/-/g, '.')}
                    {item.isPast ? ` (D+${item.days})` : item.daysFromNow > 0 ? ` · ${item.daysFromNow}일 후` : ''}
                  </p>
                  {(isNext || item.isToday || !item.isPast) && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.7 }}>
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
