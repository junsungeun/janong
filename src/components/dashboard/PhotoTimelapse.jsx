import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function PhotoTimelapse({ logs = [], getPhotoUrl }) {
  const [viewIdx, setViewIdx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  const photos = logs
    .filter((l) => l.photos?.length > 0)
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
        if (next >= photos.length) { stopPlay(); return null; }
        return next;
      });
    }, 500);
  }, [photos.length, stopPlay]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goPrev = (e) => {
    e.stopPropagation();
    setViewIdx((prev) => (prev != null && prev > 0 ? prev - 1 : prev));
  };

  const goNext = (e) => {
    e.stopPropagation();
    setViewIdx((prev) => (prev != null && prev < photos.length - 1 ? prev + 1 : prev));
  };

  if (photos.length === 0) {
    return (
      <div className="timelapse">
        <div className="timelapse-header">
          <span className="section-title">사진 기록</span>
        </div>
        <div className="timelapse-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="timelapse-empty-text">등록된 사진이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timelapse">
      <div className="timelapse-header">
        <span className="section-title">사진 기록</span>
        {photos.length >= 2 && (
          <button
            className={`timelapse-play-btn ${playing ? 'timelapse-play-btn--active' : ''}`}
            onClick={playing ? stopPlay : startPlay}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
            <span>{playing ? '정지' : '재생'}</span>
          </button>
        )}
      </div>

      {viewIdx !== null && (
        <div className="timelapse-lightbox" onClick={() => { stopPlay(); setViewIdx(null); }}>
          {viewIdx > 0 && (
            <button className="timelapse-lb-arrow timelapse-lb-arrow--left" onClick={goPrev} aria-label="이전 사진">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <img src={getPhotoUrl(photos[viewIdx].photos?.[0])} alt={photos[viewIdx].date} className="timelapse-lightbox-img" />
          <p className="timelapse-lightbox-date">{photos[viewIdx].date}</p>
          <p className="timelapse-lightbox-counter">{viewIdx + 1} / {photos.length}</p>
          {viewIdx < photos.length - 1 && (
            <button className="timelapse-lb-arrow timelapse-lb-arrow--right" onClick={goNext} aria-label="다음 사진">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}
        </div>
      )}

      <div className="timelapse-strip">
        {photos.map((p, i) => (
          <div
            key={p.id || i}
            className={`timelapse-thumb ${viewIdx === i ? 'timelapse-thumb-active' : ''}`}
            onClick={() => setViewIdx(i)}
          >
            <img src={getPhotoUrl(p.photos?.[0])} alt={p.date} className="timelapse-thumb-img" loading="lazy" />
            <span className="timelapse-thumb-date">{p.date?.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
