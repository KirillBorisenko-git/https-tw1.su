import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { C } from './theme';

const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const API = '';

export default function AdminReports() {
  const [stats, setStats] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/admin/test-stats`, { headers: hdrs() })
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); });
  }, []);

  // ── EXCEL export (all tests summary)
  const exportExcel = () => {
    const summaryRows = stats.map(t => ({
      'Тест': t.title,
      'Попыток': t.attempts,
      'Успешно': t.passed,
      'Не сдали': t.failed,
      'Успешность (%)': t.successRate ?? '—',
      'Средний балл (%)': t.avgPct ?? '—',
    }));

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка');

    stats.forEach(t => {
      if (t.details.length === 0) return;
      const rows = t.details.map(d => ({
        'Пользователь': d.username,
        'Правильных': d.score,
        'Всего': d.total,
        'Балл (%)': d.pct,
        'Результат': d.pct >= 70 ? 'Сдал' : 'Не сдал',
        'Дата': new Date(d.date).toLocaleString('ru-RU'),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, t.title.slice(0, 31));
    });

    XLSX.writeFile(wb, `Отчёт_тесты_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`);
  };

  // ── PDF export (all tests summary + details)
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Title
    doc.setFontSize(16);
    doc.setTextColor(13, 27, 62);
    doc.text('Отчёт по тестированию', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Сформирован: ${new Date().toLocaleString('ru-RU')}`, 14, 22);

    // Summary table
    autoTable(doc, {
      startY: 28,
      head: [['Тест', 'Попыток', 'Успешно', 'Не сдали', 'Успешность %', 'Средний балл %']],
      body: stats.map(t => [t.title, t.attempts, t.passed, t.failed, t.successRate ?? '—', t.avgPct ?? '—']),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 246, 255] },
      styles: { fontSize: 9 },
    });

    // Per-test detail tables
    stats.forEach(t => {
      if (t.details.length === 0) return;
      doc.addPage();
      doc.setFontSize(13);
      doc.setTextColor(13, 27, 62);
      doc.text(`${t.icon} ${t.title}`, 14, 16);
      autoTable(doc, {
        startY: 22,
        head: [['Пользователь', 'Правильных', 'Всего', 'Балл %', 'Результат', 'Дата']],
        body: t.details.map(d => [
          d.username, d.score, d.total, d.pct,
          d.pct >= 70 ? 'Сдал' : 'Не сдал',
          new Date(d.date).toLocaleString('ru-RU'),
        ]),
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.column.index === 4 && data.section === 'body') {
            data.cell.styles.textColor = data.cell.raw === 'Сдал' ? [22, 163, 74] : [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        alternateRowStyles: { fillColor: [240, 246, 255] },
      });
    });

    doc.save(`Отчёт_тесты_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`);
  };

  // ── Single test PDF
  const exportTestPDF = (t) => {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.setTextColor(13, 27, 62);
    doc.text(`${t.icon} ${t.title}`, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Сформирован: ${new Date().toLocaleString('ru-RU')}`, 14, 22);

    // Mini summary
    autoTable(doc, {
      startY: 28,
      head: [['Попыток', 'Успешно', 'Не сдали', 'Успешность %', 'Средний балл %']],
      body: [[t.attempts, t.passed, t.failed, t.successRate ?? '—', t.avgPct ?? '—']],
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9 },
    });

    if (t.details.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Пользователь', 'Правильных', 'Всего', 'Балл %', 'Результат', 'Дата']],
        body: t.details.map(d => [
          d.username, d.score, d.total, d.pct,
          d.pct >= 70 ? 'Сдал' : 'Не сдал',
          new Date(d.date).toLocaleString('ru-RU'),
        ]),
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        didParseCell: (data) => {
          if (data.column.index === 4 && data.section === 'body') {
            data.cell.styles.textColor = data.cell.raw === 'Сдал' ? [22, 163, 74] : [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        alternateRowStyles: { fillColor: [240, 246, 255] },
        styles: { fontSize: 9 },
      });
    }
    doc.save(`${t.title}.pdf`);
  };

  // ── Single test Excel
  const exportTestExcel = (t) => {
    const wb = XLSX.utils.book_new();
    const summary = XLSX.utils.json_to_sheet([{
      'Тест': t.title, 'Попыток': t.attempts, 'Успешно': t.passed,
      'Не сдали': t.failed, 'Успешность (%)': t.successRate ?? '—', 'Средний балл (%)': t.avgPct ?? '—',
    }]);
    XLSX.utils.book_append_sheet(wb, summary, 'Сводка');
    if (t.details.length > 0) {
      const rows = t.details.map(d => ({
        'Пользователь': d.username, 'Правильных': d.score, 'Всего': d.total,
        'Балл (%)': d.pct, 'Результат': d.pct >= 70 ? 'Сдал' : 'Не сдал',
        'Дата': new Date(d.date).toLocaleString('ru-RU'),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Детали');
    }
    XLSX.writeFile(wb, `${t.title}.xlsx`);
  };

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" style={{ color: C.blue }}></div>Загрузка...
    </div>
  );

  const totalAttempts = stats.reduce((s, t) => s + t.attempts, 0);
  const totalPassed = stats.reduce((s, t) => s + t.passed, 0);
  const overallRate = totalAttempts ? Math.round((totalPassed / totalAttempts) * 100) : null;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-bold mb-1" style={{ color: C.text }}>Отчёты и статистика</h5>
          <p className="small mb-0" style={{ color: C.muted }}>Аналитика по всем тестам</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
            style={{ background: '#16a34a', color: '#fff', border: 'none' }}
            onClick={exportExcel}>
            <i className="bi bi-file-earmark-spreadsheet-fill"></i>Экспорт Excel
          </button>
          <button className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
            style={{ background: '#dc2626', color: '#fff', border: 'none' }}
            onClick={exportPDF}>
            <i className="bi bi-file-earmark-pdf-fill"></i>Экспорт PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Всего попыток', value: totalAttempts, icon: 'bi-clipboard-check', color: C.blue },
          { label: 'Успешно сдали', value: totalPassed, icon: 'bi-check-circle-fill', color: '#16a34a' },
          { label: 'Не сдали', value: totalAttempts - totalPassed, icon: 'bi-x-circle-fill', color: '#dc2626' },
          { label: 'Общая успешность', value: overallRate !== null ? `${overallRate}%` : '—', icon: 'bi-graph-up-arrow', color: '#7c3aed' },
        ].map((c, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm" style={{ borderTop: `3px solid ${c.color}` }}>
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, background: c.color + '18' }}>
                  <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '1.5rem', lineHeight: 1, color: C.text }}>{c.value}</div>
                  <div style={{ fontSize: '.75rem', color: C.muted }}>{c.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-test cards */}
      <div className="d-flex flex-column gap-3">
        {stats.map(t => (
          <div key={t.id} className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Test header row */}
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ color: C.text }}>{t.title}</div>
                  <div className="small" style={{ color: C.muted }}>{t.attempts} попыток</div>
                </div>

                {/* Mini stat pills */}
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <span className="badge px-3 py-2" style={{ background: C.blueBg, color: C.blue, fontSize: '.8rem' }}>
                    📊 Ср. балл: {t.avgPct !== null ? `${t.avgPct}%` : '—'}
                  </span>
                  <span className="badge px-3 py-2" style={{ background: '#dcfce7', color: '#16a34a', fontSize: '.8rem' }}>
                    ✓ Сдали: {t.passed}
                  </span>
                  <span className="badge px-3 py-2" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '.8rem' }}>
                    ✗ Не сдали: {t.failed}
                  </span>
                  {t.successRate !== null && (
                    <span className="badge px-3 py-2" style={{ background: '#f3e8ff', color: '#7c3aed', fontSize: '.8rem' }}>
                      🎯 {t.successRate}% успешность
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {t.attempts > 0 && (
                  <div style={{ width: 120 }}>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ fontSize: '.7rem', color: C.muted }}>Успешность</span>
                      <span style={{ fontSize: '.7rem', color: C.muted }}>{t.successRate}%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar"
                        style={{ width: `${t.successRate}%`, background: t.successRate >= 70 ? '#16a34a' : '#f59e0b' }}>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="d-flex gap-1">
                  <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#16a34a', border: 'none' }}
                    onClick={() => exportTestExcel(t)} title="Экспорт Excel">
                    <i className="bi bi-file-earmark-spreadsheet"></i>
                  </button>
                  <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
                    onClick={() => exportTestPDF(t)} title="Экспорт PDF">
                    <i className="bi bi-file-earmark-pdf"></i>
                  </button>
                  <button className="btn btn-sm" style={{ background: C.blueBg, color: C.blue, border: 'none' }}
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                    <i className={`bi bi-chevron-${expanded === t.id ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>

              {/* Expanded detail table */}
              {expanded === t.id && (
                <div className="mt-3 pt-3 border-top">
                  {t.details.length === 0 ? (
                    <div className="text-center py-3 small" style={{ color: C.muted }}>
                      <i className="bi bi-inbox d-block mb-1" style={{ fontSize: '1.5rem' }}></i>
                      Нет данных о прохождении
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover small mb-0">
                        <thead style={{ background: C.blueBg }}>
                          <tr>
                            <th style={{ color: C.text }}>Пользователь</th>
                            <th style={{ color: C.text }}>Правильных</th>
                            <th style={{ color: C.text }}>Балл</th>
                            <th style={{ color: C.text }}>Результат</th>
                            <th style={{ color: C.text }}>Дата</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.details.map((d, i) => (
                            <tr key={i}>
                              <td className="align-middle fw-medium">{d.username}</td>
                              <td className="align-middle">{d.score} / {d.total}</td>
                              <td className="align-middle">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="progress flex-grow-1" style={{ height: 5, width: 60 }}>
                                    <div className="progress-bar"
                                      style={{ width: `${d.pct}%`, background: d.pct >= 70 ? '#16a34a' : '#dc2626' }}>
                                    </div>
                                  </div>
                                  <span className="fw-semibold" style={{ color: d.pct >= 70 ? '#16a34a' : '#dc2626' }}>
                                    {d.pct}%
                                  </span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <span className={`badge ${d.pct >= 70 ? 'bg-success' : 'bg-danger'}`}>
                                  {d.pct >= 70 ? 'Сдал' : 'Не сдал'}
                                </span>
                              </td>
                              <td className="align-middle" style={{ color: C.muted }}>
                                {new Date(d.date).toLocaleString('ru-RU')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
