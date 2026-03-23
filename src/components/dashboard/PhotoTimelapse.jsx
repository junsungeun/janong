import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function PhotoTimelapse({ logs = [], getPhotoUrl }) {
  const [viewIdx, setViewIdx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);
  const stripRef = useRef(null);

  // Filter logs that have photos, sorted by date ascending
  const photos = logs
    .filter((l) => l.photoPath)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const stopPlay = useCallback(() => {
    setPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPlay = useCallback(() => {
    if (photos.length < 2) return;
    setPlaying(true);
    setViewIdx(0);
    intervalRef.current = setInterval(() => {
      setViewIdx((prev) => {
        const next = (prev ?? 0) + 1;
        if (next >= photos.length) {
          stopPlay();
          return null;
        }
        return next;
      });
    }, 500);
  }, [photos.length, stopPlay]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className="timelapse">
      <div className="timelapse-header">
        <span className="section-title">사진 기록</span>
        {photos.length >= 2 && (
          <button
            className="btn-secondary btn-sm"
            onClick={playing ? stopPlay : startPlay}
          >
            {playing ? '정지' : '재생'}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {viewIdx !== null && (
        <div className="timelapse-lightbox" onClick={() => { stopPlay(); setViewIdx(null); }}>
          <img
            src={getPhotoUrl(photos[viewIdx].photoPath)}
            alt={photos[viewIdx].date}
            className="timelapse-lightbox-img"
          />
          <p className="timelapse-lightbox-date">{photos[viewIdx].date}</p>
        </div>
      )}

      {/* Horizontal strip */}
      <div className="timelapse-strip" ref={stripRef}>
        {photos.map((p, i) => (
          <div
            key={p.id || i}
            className="timelapse-thumb"
            onClick={() => setViewIdx(i)}
          >
            <img
              src={getPhotoUrl(p.photoPath)}
              alt={p.date}
              className="timelapse-thumb-img"
              loading="lazy"
            />
            <span className="timelapse-thumb-date">{p.date?.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
