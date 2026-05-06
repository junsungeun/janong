import { useState } from 'react';
import { CROP_INFO } from '../../data/products';

const won = (n) => n.toLocaleString('ko-KR') + '원';

export default function ShopDetailView({ product, currentQty, onBack, onAddToCart }) {
  const [qty, setQty] = useState(currentQty > 0 ? currentQty : 1);
  const info = CROP_INFO[product.id] || {};

  const handleAdd = () => {
    onAddToCart(product.id, qty);
    onBack();
  };

  return (
    <div className="shop-detail-root">

      {/* ── Header ── */}
      <header className="shop-detail-header">
        <button className="shop-detail-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="shop-detail-header-title">작물 상세</span>
        <div style={{ width: 36 }} />
      </header>

      {/* ── SD-01 HERO ── */}
      <div className="sd-hero">
        {/* 이미지 영역 — 내일 촬영 예정 */}
        <div className="sd-hero-img-wrap">
          <div className="sd-hero-img-placeholder">
            <div className="sd-placeholder-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="sd-placeholder-label">촬영 예정</span>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="sd-hero-info">
          <div className="sd-hero-badge">{product.group} · 자연농업</div>
          <h1 className="sd-hero-name">{product.name}</h1>
          <div className="sd-hero-price">{won(product.price)}</div>
          <div className="sd-hero-sub">
            {product.size} 포트
            {product.note && <span className="sd-hero-note">{product.note}</span>}
          </div>
        </div>
      </div>

      {/* ── SD-02 HOOK ── */}
      {info.tagline && (
        <div className="sd-hook">
          <div className="sd-hook-eyebrow">CROP STORY</div>
          <div className="sd-hook-copy">{info.tagline}</div>
          {info.description && (
            <div className="sd-hook-sub">{info.description}</div>
          )}
        </div>
      )}

      {/* ── 이미지 B — 스토리 (촬영 예정) ── */}
      <div className="sd-story-img-wrap">
        <div className="sd-story-img-placeholder">
          <div className="sd-placeholder-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="sd-placeholder-label" style={{ fontSize: 10 }}>재배 현장 · 촬영 예정</span>
          </div>
        </div>
      </div>

      {/* ── SD-04 CARE GUIDE ── */}
      {info.care && info.care.length > 0 && (
        <div className="sd-care">
          <div className="sd-care-title">재배 가이드</div>
          <div className="sd-care-list">
            {info.care.map((item, i) => (
              <div key={i} className="sd-care-item">
                <div className="sd-care-num">{i + 1}</div>
                <div>
                  <div className="sd-care-item-title">{item.title}</div>
                  <div className="sd-care-item-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SD-06 SPEC TABLE ── */}
      <div className="sd-spec">
        <div className="sd-spec-label">PRODUCT INFO</div>
        <table className="sd-spec-table">
          <tbody>
            <tr><th>규격</th><td>{product.size} 포트</td></tr>
            <tr><th>판매 조</th><td>{product.group}</td></tr>
            <tr><th>원산지</th><td>국내산</td></tr>
            <tr><th>재배 방식</th><td>자연농업 (무화학비료)</td></tr>
            <tr><th>재배 주체</th><td>청년귀농장기교육 1기 허브과정</td></tr>
            {product.stock != null && (
              <tr><th>재고</th><td>{product.stock}개</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── 하단 여백 ── */}
      <div style={{ height: 120 }} />

      {/* ── 고정 하단 바 ── */}
      <div className="sd-bottom-bar">
        <div className="sd-bottom-stepper">
          <button
            className="sd-qty-btn"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
          >−</button>
          <span className="sd-qty-num">{qty}</span>
          <button
            className="sd-qty-btn plus"
            onClick={() => setQty(qty + 1)}
          >+</button>
        </div>
        <div className="sd-bottom-right">
          <div className="sd-bottom-total">{won(product.price * qty)}</div>
          <button className="sd-cart-btn" onClick={handleAdd}>
            장바구니 담기
          </button>
        </div>
      </div>

    </div>
  );
}
