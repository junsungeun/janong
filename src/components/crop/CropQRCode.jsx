import React, { useState } from 'react';
import { QrCode, Copy, Check } from 'lucide-react';

// QR 코드 대신 딥링크 URL 생성 + 복사 기능
export default function CropQRCode({ crop }) {
  const [copied, setCopied] = useState(false);

  // 앱 내부 딥링크 형식 (향후 실제 도메인으로 변경)
  const url = `${window.location.origin}?crop=${crop.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 시 fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // API 기반 QR 이미지
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <div className="crop-qr">
      <div className="crop-qr-image-wrap">
        <img src={qrImageUrl} alt="QR Code" className="crop-qr-image" width="160" height="160" />
      </div>
      <p className="crop-qr-desc">이 QR을 스캔하면 <strong>{crop.name}</strong> 기록 화면으로 이동합니다</p>
      <button className="crop-qr-copy" onClick={handleCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? '복사됨' : '링크 복사'}
      </button>
    </div>
  );
}
