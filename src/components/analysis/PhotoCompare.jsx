import React, { useState, useMemo } from 'react';
import { photoStorage } from '../../services/dbService';

export default function PhotoCompare({ logs, crops, cropMap }) {
  const [selectedCropId, setSelectedCropId] = useState('');

  const photoLogs = useMemo(() => {
    const filtered = selectedCropId
      ? logs.filter((l) => l.cropId === selectedCropId)
      : logs;
    return filtered
      .filter((l) => l.photos?.length > 0)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [logs, selectedCropId]);

  return (
    <div className="photo-compare">
      <div className="dash-crop-chips" style={{ marginBottom: 16 }}>
        <button
          className={`dash-crop-chip ${!selectedCropId ? 'active' : ''}`}
          onClick={() => setSelectedCropId('')}
        >
          전체
        </button>
        {crops.map((c) => (
          <button
            key={c.id}
            className={`dash-crop-chip ${selectedCropId === c.id ? 'active' : ''}`}
            onClick={() => setSelectedCropId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {photoLogs.length === 0 ? (
        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
          사진이 있는 기록이 없습니다
        </p>
      ) : (
        <div className="photo-compare-grid">
          {photoLogs.map((log) => (
            <div key={log.id} className="photo-compare-item">
              <img
                src={photoStorage.getUrl(log.photos[0])}
                alt=""
                className="photo-compare-img"
                loading="lazy"
              />
              <div className="photo-compare-info">
                <span className="photo-compare-date">{log.date}</span>
                <span className="photo-compare-crop">{cropMap[log.cropId] || ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
