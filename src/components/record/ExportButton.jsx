import React from 'react';
import Button from '../ui/Button';
import { exportCsv } from '../../utils/exportCsv';

export default function ExportButton({ logs = [], cropName = '전체' }) {
  const handleExport = () => {
    if (logs.length === 0) return;

    const rows = logs.map((log) => ({
      날짜: log.date || '',
      작물: log.cropName || '',
      온도: log.temperature ?? '',
      습도: log.humidity ?? '',
      AI상태: log.aiStatus || '',
      키cm: log.heightCm ?? '',
      잎수: log.leafCount ?? '',
      줄기mm: log.stemMm ?? '',
      메모: log.memo || '',
    }));

    const today = new Date().toISOString().slice(0, 10);
    const filename = `자농_기록_${cropName}_${today}.csv`;
    exportCsv(rows, filename);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      disabled={logs.length === 0}
      className="export-btn"
    >
      엑셀 내보내기
    </Button>
  );
}
