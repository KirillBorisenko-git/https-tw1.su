import React, { useEffect, useState } from 'react';
import AdminQuestions from './AdminQuestions';
import AdminTests from './AdminTests';
import AdminEmployees from './AdminEmployees';
import AdminReports from './AdminReports';
import { C, navStyle, activeTabStyle, inactiveTabStyle, footerStyle } from './theme';

const API = 'https://tw1.su';
const now = () => new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [time] = useState(now);

  const loadStats = () =>
    fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(data => { if (data.message) setError(data.message); else setStats(data); })
      .catch(() => setError('Ошибка загрузки'));

  useEffect(() => { if (tab === 'overview') loadStats(); }, [tab]);

  const TABS = [
    { id: 'overview',   icon: 'bi-bar-chart-line-fill', label: 'Обзор' },
    { id: 'employees',  icon: 'bi-people-fill',          label: 'Сотрудники' },
    { id: 'tests',      icon: 'bi-journal-text',         label: 'Тесты' },
    { id: 'questions',  icon: 'bi-patch-question-fill',  label: 'Вопросы' },
    { id: 'reports',    icon: 'bi-file-earmark-bar-graph-fill', label: 'Отчёты' },
  ];

  const QUICK = [
    { icon: 'bi-person-plus-fill', color: C.blueBg,   iconColor: C.blue,    label: 'Сотрудники',    sub: 'Список и назначения',    action: () => setTab('employees') },
    { icon: 'bi-journal-plus',     color: '#e6f4ea',  iconColor: '#1e8e3e', label: 'Создать тест',  sub: 'Добавить проверку знаний', action: () => setTab('tests') },
    { icon: 'bi-patch-question-fill', color: '#fef3e2', iconColor: '#f29900', label: 'Банк вопросов', sub: 'Управление вопросами',   action: () => setTab('questions') },
    { icon: 'bi-bar-chart-fill',   color: '#fce8e6',  iconColor: '#d93025', label: 'Отчёты',        sub: 'Статистика и аналитика', action: () => setTab('reports') },
  ];

  const STAT_CARDS = stats ? [
    { icon: 'bi-people-fill',        bg: C.blueBg,   ic: C.blue,    label: 'Пользователей',   value: stats.totalUsers },
    { icon: 'bi-journal-text',       bg: '#e6f4ea',  ic: '#1e8e3e', label: 'Тестов в системе', value: stats.totalTests },
    { icon: 'bi-patch-question-fill',bg: '#fef3e2',  ic: '#f29900', label: 'Вопросов в банке', value: stats.totalQuestions },
    { icon: 'bi-graph-up-arrow',     bg: '#f3e8ff',  ic: '#7c3aed', label: 'Средний балл',
      value: stats.top.length ? Math.round(stats.top.reduce((a, b) => a + b.pct, 0) / stats.top.length) + '%' : '—' },
  ] : [];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: C.blueBg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* NAVBAR */}
      <nav className="navbar navbar-dark px-4 py-0" style={navStyle}>
        <div className="d-flex align-items-center gap-2">
          <span className="d-inline-flex align-items-center justify-content-center rounded-2 me-1"
            style={{ width: 32, height: 32, background: C.blue, fontSize: '1rem' }}>🏭</span>
          <span className="fw-bold text-white" style={{ fontSize: '1rem' }}>ТехБезопасность</span>
          <span className="badge ms-1" style={{ background: '#7c3aed', fontSize: '0.7rem' }}>Администратор</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="small d-flex align-items-center gap-1" style={{ color: 'rgba(255,255,255,.6)' }}>
            <i className="bi bi-person-circle"></i>{user}
          </span>
          <button className="btn btn-sm fw-semibold text-white px-3"
            style={{ background: '#dc2626', border: 'none' }} onClick={onLogout}>Выйти</button>
        </div>
      </nav>

      {/* TABS */}
      <div className="bg-white border-bottom px-4 d-flex" style={{ flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={tab === t.id ? activeTabStyle : inactiveTabStyle}>
            <i className={`bi ${t.icon} me-2`}></i>{t.label}
          </button>
        ))}
      </div>

      <div className="flex-grow-1">
        <div className="container-xl py-4 px-4" style={{ maxWidth: 1200 }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              {error && <div className="alert alert-danger">{error}</div>}
              {!stats && !error && (
                <div className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" style={{ color: C.blue }}></div>Загрузка...
                </div>
              )}
              {stats && (
                <>
                  <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold mb-1" style={{ color: C.text }}>Панель управления</h5>
                      <p className="small mb-0" style={{ color: C.muted }}>Добро пожаловать, {user}! Вот что происходит с системой сегодня.</p>
                    </div>
                    <span className="small d-flex align-items-center gap-1 border rounded px-3 py-1 bg-white" style={{ color: C.muted }}>
                      <i className="bi bi-calendar3 me-1"></i>{time}
                    </span>
                  </div>

                  {/* Stat cards */}
                  <div className="row g-3 mb-4">
                    {STAT_CARDS.map((c, i) => (
                      <div key={i} className="col-6 col-lg-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderTop: `3px solid ${c.ic}` }}>
                          <div className="card-body d-flex align-items-center gap-3 py-3">
                            <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 44, height: 44, background: c.bg }}>
                              <i className={`bi ${c.icon}`} style={{ color: c.ic, fontSize: '1.2rem' }}></i>
                            </div>
                            <div>
                              <div className="fw-bold" style={{ fontSize: '1.6rem', lineHeight: 1, color: C.text }}>{c.value}</div>
                              <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: 2 }}>{c.label}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent + Top */}
                  <div className="row g-3 mb-4">
                    <div className="col-lg-7">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                          <span className="fw-semibold d-flex align-items-center gap-2" style={{ color: C.text }}>
                            <i className="bi bi-clock-history" style={{ color: C.blue }}></i>Последние пройденные тесты
                          </span>
                          <a href="#" className="small text-decoration-none" style={{ color: C.blue }}>Смотреть все →</a>
                        </div>
                        <div className="card-body">
                          {stats.recent.length === 0 ? (
                            <div className="text-center py-4">
                              <i className="bi bi-journal-x d-block mb-2" style={{ fontSize: '2.5rem', color: C.muted }}></i>
                              <div className="fw-semibold mb-1" style={{ color: C.text }}>Тесты ещё не проходились</div>
                              <div className="small mb-3" style={{ color: C.muted }}>Когда пользователи пройдут тесты — результаты появятся здесь</div>
                              <button className="btn btn-sm px-4 text-white fw-semibold"
                                style={{ background: C.blue, border: 'none' }} onClick={() => setTab('employees')}>
                                <i className="bi bi-plus me-1"></i>Назначить тест
                              </button>
                            </div>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-hover small mb-0">
                                <thead className="table-light">
                                  <tr><th>Пользователь</th><th>Тест</th><th>Результат</th><th>Дата</th></tr>
                                </thead>
                                <tbody>
                                  {stats.recent.map((r, i) => (
                                    <tr key={i}>
                                      <td className="align-middle fw-medium">{r.username}</td>
                                      <td className="align-middle text-muted">{r.testTitle}</td>
                                      <td className="align-middle">
                                        <span className={`badge ${r.pct >= 70 ? 'bg-success' : 'bg-danger'}`}>{r.score}/{r.total} ({r.pct}%)</span>
                                      </td>
                                      <td className="align-middle text-muted">{new Date(r.date).toLocaleString('ru-RU')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                          <span className="fw-semibold d-flex align-items-center gap-2" style={{ color: C.text }}>
                            <i className="bi bi-trophy-fill text-warning"></i>Топ результаты
                          </span>
                          <a href="#" className="small text-decoration-none" style={{ color: C.blue }}>Все результаты →</a>
                        </div>
                        <div className="card-body">
                          {stats.top.length === 0 ? (
                            <div className="text-center py-4">
                              <i className="bi bi-trophy d-block mb-2" style={{ fontSize: '2.5rem', color: C.muted }}></i>
                              <div className="fw-semibold mb-1" style={{ color: C.text }}>Нет данных</div>
                              <div className="small" style={{ color: C.muted }}>Результаты тестов появятся после прохождения</div>
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-2">
                              {stats.top.map((r, i) => (
                                <div key={i} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: C.blueBg }}>
                                  <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                                    style={{ width: 28, height: 28, fontSize: '.8rem', background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#dee2e6', color: i < 3 ? '#fff' : '#6c757d' }}>
                                    {i + 1}
                                  </div>
                                  <div className="flex-grow-1 overflow-hidden">
                                    <div className="fw-semibold small text-truncate" style={{ color: C.text }}>{r.username}</div>
                                    <div className="text-truncate" style={{ fontSize: '.72rem', color: C.muted }}>{r.testTitle}</div>
                                  </div>
                                  <span className={`fw-bold small ${r.pct >= 70 ? 'text-success' : 'text-danger'}`}>{r.pct}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom py-3">
                      <span className="fw-semibold" style={{ color: C.text }}>Быстрые действия</span>
                    </div>
                    <div className="card-body" style={{ background: C.blueBg }}>
                      <div className="row g-3">
                        {QUICK.map((q, i) => (
                          <div key={i} className="col-6 col-lg-3">
                            <button className="btn w-100 text-start p-3 border-0 rounded-3 bg-white shadow-sm"
                              style={{ transition: 'box-shadow .15s' }}
                              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 12px rgba(37,99,235,.15)`}
                              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)'}
                              onClick={q.action || undefined}>
                              <div className="rounded-3 d-flex align-items-center justify-content-center mb-2"
                                style={{ width: 40, height: 40, background: q.color }}>
                                <i className={`bi ${q.icon}`} style={{ color: q.iconColor, fontSize: '1.1rem' }}></i>
                              </div>
                              <div className="fw-semibold small" style={{ color: C.text }}>{q.label}</div>
                              <div style={{ fontSize: '.75rem', color: C.muted }}>{q.sub}</div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="card border-0 shadow-sm" style={{ borderLeft: `4px solid #16a34a` }}>
                    <div className="card-body py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-shield-fill-check text-success fs-5"></i>
                        <div>
                          <div className="fw-semibold small" style={{ color: C.text }}>Система работает в штатном режиме</div>
                          <div style={{ fontSize: '.75rem', color: C.muted }}>
                            Все сервисы доступны • Последнее обновление: сегодня в {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className="badge bg-success px-3 py-2">● Онлайн</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'employees' && <div className="card border-0 shadow-sm"><div className="card-body p-4"><AdminEmployees /></div></div>}
          {tab === 'tests'     && <div className="card border-0 shadow-sm"><div className="card-body p-4"><AdminTests /></div></div>}
          {tab === 'questions' && <div className="card border-0 shadow-sm"><div className="card-body p-4"><AdminQuestions /></div></div>}
          {tab === 'reports'   && <div className="card border-0 shadow-sm"><div className="card-body p-4"><AdminReports /></div></div>}
        </div>
      </div>

      <footer className="text-center py-3 small" style={footerStyle}>
        © 2026 ТехБезопасность. Панель администратора системы охраны труда.
      </footer>
    </div>
  );
}
