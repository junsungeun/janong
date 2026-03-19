import { useState, useEffect } from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';
import { db, TABLES, photoStorage } from '../services/dbService';

export default function CropHistory({ cropId }) {
  const [logs, setLogs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [logData, photoData] = await Promise.all([
        db.getList(TABLES.DAILY_LOG, { cropId }),
        db.getList(TABLES.CROP_PHOTO, { cropId }),
      ]);
      // 날짜 오름차순 (오래된 것부터)
      setLogs(logData.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
      setPhotos(photoData.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
      setLoading(false);
    };
    load();
  }, [cropId]);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>불러오는 중...</p>;
  }

  // 일지 + 사진을 날짜별로 합침
  const dateMap = {};
  logs.forEach(log => {
    const d = log.date || 'unknown';
    if (!dateMap[d]) dateMap[d] = { date: d, logs: [], photos: [], logPhotos: [] };
    dateMap[d].logs.push(log);
    if (log.photos?.length) dateMap[d].logPhotos.push(...log.photos);
  });
  photos.forEach(photo => {
    const d = photo.date || 'unknown';
    if (!dateMap[d]) dateMap[d] = { date: d, logs: [], photos: [], logPhotos: [] };
    dateMap[d].photos.push(photo);
  });

  const timeline = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

  if (timeline.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
        <BookOpen size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>아직 기록이 없어요</p>
        <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
          농사 일지에서 이 작물을 선택하고<br />사진과 함께 기록을 남겨보세요
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '20px' }}>
      {/* 타임라인 세로선 */}
      <div style={{
        position: 'absolute', left: '7px', top: '8px', bottom: '8px',
        width: '2px', background: 'var(--border)', borderRadius: '1px',
      }} />

      {timeline.map((entry, idx) => {
        const allPhotoPaths = [
          ...entry.logPhotos,
          ...entry.photos.map(p => p.storagePath),
        ];

        return (
          <div key={entry.date} style={{ position: 'relative', marginBottom: '20px' }}>
            {/* 타임라인 점 */}
            <div style={{
              position: 'absolute', left: '-17px', top: '6px',
              width: '10px', height: '10px', borderRadius: '50%',
              background: idx === 0 ? 'var(--color-primary)' : 'var(--border)',
              border: '2px solid var(--bg)',
            }} />

            {/* 날짜 */}
            <p style={{
              fontSize: '12px', fontWeight: 700,
              color: idx === 0 ? 'var(--color-primary)' : 'var(--text-muted)',
              marginBottom: '8px', letterSpacing: '0.02em',
            }}>
              {entry.date.replace(/-/g, '.')}
            </p>

            {/* 사진 */}
            {allPhotoPaths.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {allPhotoPaths.map((path, i) => (
                  <img
                    key={i}
                    src={photoStorage.getUrl(path)}
                    alt=""
                    style={{
                      width: '100px', height: '100px', objectFit: 'cover',
                      borderRadius: '8px', border: '1px solid var(--border)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* 일지 내용 */}
            {entry.logs.map(log => (
              <div key={log.id} className="card" style={{ padding: '12px 14px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.weather}</span>
                  {log.workTypes?.map(t => (
                    <span key={t} className="badge badge-good" style={{ fontSize: '10px' }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
                  {log.content}
                </p>
                {log.memo && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                    {log.memo}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
