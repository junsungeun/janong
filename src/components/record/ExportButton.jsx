import React from 'react';
import { Download } from 'lucide-react';
import Button from '../ui/Button';
import { exportCsv } from '../../utils/exportCsv';

export default function ExportButton({ logs = [], cropName = '전체' }) {
  const handleExport = () => {
    if (logs.length === 0) return;

    const rows = logs.map((log) => ({
      날짜: log.date || '',
      작물: log.cropName || '',
      재배단계: log.stage || '',
      '하우스온도': log.houseTemp ?? log.temperature ?? '',
      '하우스습도': log.houseHumidity ?? log.humidity ?? '',
      '실외온도': log.outdoorTemp ?? '',
      '실외습도': log.outdoorHumidity ?? '',
      '키(cm)': log.heightCm ?? '',
      '잎 수': log.leafCount ?? '',
      '줄기(mm)': log.stemMm ?? '',
      날씨: log.weather || '',
      메모: log.memo || '',
    }));

    const today = new Date().toISOString().slice(0, 10);
    const filename = `SeedLog_기록_${cropName}_${today}.csv`;
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
      <Download size={14} className="export-btn-icon" />
      <span>내보내기</span>
      {logs.length > 0 && (
        <span className="export-btn-count">{logs.length}</span>
      )}
    </Button>
  );
}
