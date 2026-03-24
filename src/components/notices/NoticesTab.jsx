import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, FileText } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { fetchAgriNotices } from '../../services/bizinfoService';

export default function NoticesTab() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAgriNotices();
      setNotices(data);
    } catch (err) {
      setError(err.message || '공고 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="notices-tab">
      <div className="page-header">
        <div className="notices-title-row">
          <h2 className="page-title">농업 사업공고</h2>
          <button className="notices-refresh-btn" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
        <p className="page-subtitle">기업지원플러스 농업 관련 공고</p>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="notices-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={load}>다시 시도</button>
        </div>
      ) : notices.length === 0 ? (
        <div className="notices-empty">
          <FileText size={40} strokeWidth={1.5} />
          <p className="notices-empty-title">현재 농업 관련 공고가 없습니다</p>
          <p className="notices-empty-desc">새로운 공고가 등록되면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="notices-list">
          {notices.map((notice) => (
            <a
              key={notice.id}
              href={notice.url}
              target="_blank"
              rel="noopener noreferrer"
              className="notice-card"
            >
              <div className="notice-card-top">
                <span className="notice-card-org">{notice.org}</span>
                <ExternalLink size={14} className="notice-card-link-icon" />
              </div>
              <h3 className="notice-card-title">{notice.title}</h3>
              {notice.period && (
                <p className="notice-card-period">{notice.period}</p>
              )}
              {notice.tags && (
                <div className="notice-card-tags">
                  {notice.tags.split(',').slice(0, 3).map((tag, i) => (
                    <span key={i} className="notice-tag">{tag.trim()}</span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
