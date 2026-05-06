import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PRODUCTS, GROUPS } from '../../data/products';
import ShopDetailView from './ShopDetailView';

const won = (n) => n.toLocaleString('ko-KR') + '원';

const totalStock = PRODUCTS.reduce((s, p) => s + (p.stock || 0), 0);
const productCount = PRODUCTS.length;
const groupCount = 4;

// ── 인트로 화면 ──────────────────────────────────────────
function IntroView({ onStart }) {
  return (
    <div className="intro-root">

      {/* COVER */}
      <div className="intro-hero">
        <img src="/assets/hero-rachel.jpg" alt="seedlog" className="intro-hero-img" />
        <div className="intro-hero-overlay" />
        <div className="intro-hero-content">
          <span className="intro-eyebrow">청년귀농장기교육 1기 허브과정</span>
          <img src="/assets/seedlog-logo-white.svg" alt="seedlog" className="intro-logo" />
          <p className="intro-hero-sub">판매 현장 · 2026</p>
          <div className="intro-cover-stats">
            {[
              [totalStock, '총 판매 수량'],
              [productCount, '작물 종류'],
              [groupCount, '판매 조'],
              [14, '교육생'],
            ].map(([n, l]) => (
              <div key={l} className="ics">
                <div className="ics-n">{n}</div>
                <div className="ics-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 01 BRAND */}
      <div className="sp-section sp-section--off">
        <span className="sp-lbl">01 / Brand</span>
        <span className="sp-rule" />
        <div className="sp-brand-grid">
          <div>
            <h2 className="sp-h2">seedlog</h2>
            <p className="sp-desc">
              <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>씨앗(seed)</strong>의 시작부터
              자라는 모든 과정을{' '}
              <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>기록(log)</strong>하는 브랜드입니다.
            </p>
            <p className="sp-desc">
              청년귀농장기교육 1기 허브과정 14명의 교육생이 직접 재배하고
              데이터로 기록한 작물을 판매합니다.
            </p>
          </div>
          <div className="sp-brand-img-wrap">
            <img src="/assets/brand.png" alt="seedlog brand" className="sp-brand-img" />
          </div>
        </div>
        <div className="sp-callout">
          <p>
            작물의 시작부터 자라나는 과정을 모두 기록하고,<br />
            <strong>데이터로 농업에 접근한 첫 번째 허브 판매.</strong>
          </p>
        </div>
      </div>

      {/* 02 CROPS */}
      <div className="sp-section sp-section--white">
        <span className="sp-lbl">02 / Crops</span>
        <span className="sp-rule" />
        <h2 className="sp-h2">조별 판매 작물</h2>

        <div className="sp-stat-row">
          <div className="sp-stat-box">
            <div className="sp-stat-n">{totalStock}</div>
            <div className="sp-stat-l">총 수량</div>
          </div>
          <div className="sp-stat-box">
            <div className="sp-stat-n">{productCount}</div>
            <div className="sp-stat-l">작물 종류</div>
          </div>
          <div className="sp-stat-box">
            <div className="sp-stat-n">{groupCount}</div>
            <div className="sp-stat-l">판매 조</div>
          </div>
        </div>

        <table className="sp-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>조</th>
              <th>작물명</th>
              <th>규격</th>
              <th className="c" style={{ width: 56 }}>가격</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id}>
                <td className="zo">{p.group}</td>
                <td>{p.name}</td>
                <td>{p.size}</td>
                <td className="num">{won(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 주문 방법 */}
      <div className="sp-section sp-section--dark">
        <span className="sp-lbl sp-lbl--light">How to Order</span>
        <span className="sp-rule" />
        <h2 className="sp-h2 sp-h2--light">주문 방법</h2>
        <div className="sp-qr-steps">
          {[
            { n: '01', title: '작물 선택', desc: '원하는 작물을 눌러 상세 정보를 확인 후 장바구니에 담아주세요.' },
            { n: '02', title: '계좌 입금', desc: '카카오뱅크 7942-30-78712\n입금자명을 주문자 이름과 동일하게 입력해주세요.' },
            { n: '03', title: '입금 확인 후 안내', desc: '입금 확인 후 수령 방법을 안내드립니다.' },
          ].map((s) => (
            <div key={s.n} className="sp-qr-step">
              <span className="sp-qr-num">{s.n}</span>
              <div>
                <div className="sp-qr-title">{s.title}</div>
                <div className="sp-qr-desc" style={{ whiteSpace: 'pre-line' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="intro-bottom-spacer" />

      <div className="intro-bottom-bar">
        <button className="intro-cta-btn" onClick={onStart}>
          지금 주문하기
          <span className="intro-cta-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

// ── 주문 화면 ──────────────────────────────────────────
function OrderView({ qty, onChangeQty, onViewDetail, onDone }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', memo: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedItems = PRODUCTS.filter((p) => qty[p.id] > 0).map((p) => ({
    ...p, qty: qty[p.id], subtotal: p.price * qty[p.id],
  }));
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = selectedItems.reduce((s, i) => s + i.subtotal, 0);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('주문자 이름을 입력해주세요.'); return; }
    setSubmitting(true); setError('');
    try {
      const items = selectedItems.map(({ id, name, size, price, qty: q, subtotal }) => ({
        productId: id, name, size, price, qty: q, subtotal,
      }));
      const { error: dbErr } = await supabase.from('orders').insert({
        orderer_name: form.name.trim(),
        orderer_phone: form.phone.trim() || null,
        orderer_memo: form.memo.trim() || null,
        items, total_price: totalPrice, status: 'pending', channel: 'web',
      });
      if (dbErr) throw dbErr;
      onDone({ name: form.name.trim(), items, totalPrice });
      setShowModal(false);
    } catch {
      setError('주문 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="order-root">
      <header className="order-header">
        <div className="order-header-brand">
          <img src="/assets/seedlog-logo-white.svg" alt="seedlog" style={{ height: 20, width: 'auto' }} />
          <span className="order-header-tag">주문서</span>
        </div>
        {totalQty > 0 && (
          <div className="order-header-cart">
            <span>담은 항목</span>
            <span className="order-header-cart-count">{totalQty}</span>
          </div>
        )}
      </header>

      <div className="order-body">
        <div className="order-intro">
          <h2 className="order-intro-title">작물 선택</h2>
          <p className="order-intro-desc">작물을 눌러 상세 정보를 확인하고 장바구니에 담아주세요.</p>
        </div>

        {GROUPS.map(({ key, label }) => {
          const items = PRODUCTS.filter((p) => p.group === key);
          return (
            <div key={key} className="order-group">
              <div className="order-group-header">
                <span className="order-group-badge">{key}</span>
                {label !== key && <span className="order-group-name">{label}</span>}
              </div>
              <div className="order-product-grid">
                {items.map((product) => {
                  const count = qty[product.id] || 0;
                  return (
                    <div
                      key={product.id}
                      className={`order-product-card${count > 0 ? ' selected' : ''}`}
                      onClick={() => onViewDetail(product)}
                    >
                      {/* 장바구니 뱃지 */}
                      {count > 0 && (
                        <div className="order-cart-badge">{count}개</div>
                      )}

                      {/* 이미지 영역 */}
                      <div className="order-product-thumb" style={{ background: product.color + '18' }}>
                        {product.image
                          ? <img src={product.image} alt={product.name} />
                          : <div className="order-product-thumb-dot" style={{ background: product.color }} />
                        }
                      </div>

                      {/* 정보 */}
                      <div className="order-product-info-block">
                        <div className="order-product-name">{product.name}</div>
                        <div className="order-product-meta">
                          <span className="order-product-size">{product.size}</span>
                          {product.note && <span className="order-product-note">{product.note}</span>}
                        </div>
                        <div className="order-product-price">{won(product.price)}</div>
                      </div>

                      {/* 상세 보기 링크 */}
                      <div className="order-product-detail-link">
                        상세 보기 →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="order-bottom-bar">
        {selectedItems.length > 0 && (
          <div className="order-bottom-chips">
            {selectedItems.map((item) => (
              <div key={item.id} className="order-bottom-chip">
                <span>{item.name}</span>
                <span className="order-bottom-chip-qty">{item.qty}</span>
              </div>
            ))}
          </div>
        )}
        <div className="order-bottom-inner">
          <div className="order-bottom-summary">
            <div className="order-bottom-count">{totalQty > 0 ? `${totalQty}개 선택` : '작물을 선택해주세요'}</div>
            <div className="order-bottom-total">{totalQty > 0 ? won(totalPrice) : '—'}</div>
          </div>
          <button className="order-submit-btn" disabled={totalQty === 0} onClick={() => setShowModal(true)}>주문하기</button>
        </div>
      </div>

      {showModal && (
        <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-handle" />
            <h3 className="order-modal-title">주문 확인</h3>
            <div className="order-modal-section">
              <div className="order-modal-section-title">선택 상품</div>
              {selectedItems.map((item) => (
                <div key={item.id} className="order-item-row">
                  <span className="order-item-name">{item.name} ({item.size})</span>
                  <span className="order-item-qty-price">{item.qty}개 · {won(item.subtotal)}</span>
                </div>
              ))}
              <div className="order-total-row"><span>합계</span><span>{won(totalPrice)}</span></div>
            </div>
            <div className="order-modal-section">
              <div className="order-modal-section-title">주문자 정보</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label className="order-input-label">이름 *</label><input className="order-input" placeholder="홍길동" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="order-input-label">연락처</label><input className="order-input" placeholder="010-0000-0000" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label className="order-input-label">메모 (선택)</label><input className="order-input" placeholder="요청사항" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /></div>
              </div>
              {error && <p className="order-error">{error}</p>}
            </div>
            <div className="order-modal-actions">
              <button className="order-cancel-btn" onClick={() => setShowModal(false)}>취소</button>
              <button className="order-confirm-btn" onClick={handleSubmit} disabled={submitting}>{submitting ? '주문 중...' : '주문 완료'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 완료 화면 ──────────────────────────────────────────
function SuccessView({ data, onReset }) {
  return (
    <div className="order-root">
      <div className="order-success">
        <div className="order-success-icon">🌱</div>
        <h1 className="order-success-title">주문이 접수됐어요!</h1>
        <p className="order-success-desc">
          {data.name}님의 주문이 정상적으로 접수되었습니다.<br />
          확인 후 수령 방법 안내드리겠습니다.
        </p>
        <div className="order-success-info">
          {data.items.map((item) => (
            <div key={item.productId} className="order-success-info-row">
              <span>{item.name} ({item.size}) × {item.qty}</span>
              <span>{won(item.subtotal)}</span>
            </div>
          ))}
          <div className="order-success-info-row"><span>합계</span><span>{won(data.totalPrice)}</span></div>
        </div>
        <button className="order-new-btn" onClick={onReset}>처음으로 돌아가기</button>
      </div>
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────
export default function OrderApp() {
  const [view, setView] = useState('intro');
  const [doneData, setDoneData] = useState(null);
  const [qty, setQty] = useState({});
  const [detailProduct, setDetailProduct] = useState(null);

  // qty 업데이트 (장바구니 담기)
  const handleAddToCart = (productId, count) => {
    setQty((prev) => {
      if (count <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: count };
    });
  };

  // 상세 페이지 열기
  const handleViewDetail = (product) => {
    setDetailProduct(product);
    setView('detail');
  };

  if (view === 'success') {
    return <SuccessView data={doneData} onReset={() => { setView('intro'); setQty({}); }} />;
  }

  if (view === 'detail' && detailProduct) {
    return (
      <ShopDetailView
        product={detailProduct}
        currentQty={qty[detailProduct.id] || 0}
        onBack={() => setView('order')}
        onAddToCart={handleAddToCart}
      />
    );
  }

  if (view === 'order') {
    return (
      <OrderView
        qty={qty}
        onChangeQty={handleAddToCart}
        onViewDetail={handleViewDetail}
        onDone={(d) => { setDoneData(d); setView('success'); }}
      />
    );
  }

  return <IntroView onStart={() => setView('order')} />;
}
