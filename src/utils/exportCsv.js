/**
 * CSV export utility with BOM for Korean Excel compatibility.
 *
 * @param {Object[]} rows - Array of plain objects to export.
 * @param {string}   filename - Desired file name (e.g. "harvest_2026.csv").
 */
export function exportCsv(rows, filename = 'export.csv') {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (value) => {
    if (value == null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row =>
      headers.map(h => escapeCsvValue(row[h])).join(',')
    ),
  ];

  const csvString = csvLines.join('\r\n');

  // UTF-8 BOM so Korean characters display correctly in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
