import React, { useState, useEffect, useRef } from 'react';
import { C, navStyle, footerStyle } from './theme';
const API = '';
const authHdr = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Fisher-Yates shuffle returning new array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prepare questions: shuffle questions and/or options, remap answer index
function prepareQuestions(test) {
  let qs = test.questions.map((q, origIdx) => ({ ...q, origIdx }));
  if (test.shuffleQuestions) qs = shuffle(qs);
  if (test.shuffleOptions) {
    qs = qs.map(q => {
      const correctText = q.options[q.answer];
      const shuffled = shuffle(q.options);
      return { ...q, options: shuffled, answer: shuffled.indexOf(correctText) };
    });
  }
  return qs;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Dashboard({ user, onLogout }) {
  const [tests, setTests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [view, setView] = useState('home');
  const [activeTest, setActiveTest] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [preparedQs, setPreparedQs] = useState([]); // shuffled questions for current test
  const [timeLeft, setTimeLeft] = useState(null);    // seconds remaining, null = no limit
  const timerRef = useRef(null);

  const loadAssignments = () =>
    fetch(`${API}/api/assignments`, { headers: authHdr() })
      .then(r => r.json()).then(data => Array.isArray(data) ? setAssignments(data) : []).catch(() => {});

  useEffect(() => {
    fetch(`${API}/api/tests`).then(r => r.json()).then(setTests).catch(() => {});
    loadAssignments();
  }, []);

  const unseenCount = assignments.filter(a => !a.seen && !a.doneAt).length;

  const markSeen = (id) => {
    fetch(`${API}/api/assignments/${id}/seen`, { method: 'POST', headers: authHdr() });
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, seen: true } : a));
  };

  const startAssignedTest = (a) => {
    markSeen(a.id);
    const test = tests.find(t => t.id === a.testId);
    if (test) startTest({ ...test, assignmentId: a.id });
    setShowNotif(false);
  };

  const startTest = (test) => {
    const qs = prepareQuestions(test);
    setActiveTest(test); setPreparedQs(qs);
    setCurrent(0); setSelected({}); setScore(0); setResults([]);
    const secs = test.timeLimitMin ? test.timeLimitMin * 60 : null;
    setTimeLeft(secs);
    setView('test');
  };

  // Timer effect
  useEffect(() => {
    if (view !== 'test' || timeLeft === null) return;
    if (timeLeft <= 0) { finishTest({}); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [view, timeLeft]);

  const finishTest = (sel) => {
    clearTimeout(timerRef.current);
    const selToUse = sel !== undefined ? sel : selected;
    let s = 0;
    const res = preparedQs.map((q, i) => {
      const correct = selToUse[i] === q.answer;
      if (correct) s++;
      return { question: q.q, chosen: q.options[selToUse[i]] ?? '(нет ответа)', correct: q.options[q.answer], isCorrect: correct };
    });
    setScore(s); setResults(res); setView('result');
    fetch(`${API}/api/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ testTitle: activeTest.title, score: s, total: preparedQs.length }),
    });
    if (activeTest.assignmentId) {
      fetch(`${API}/api/assignments/${activeTest.assignmentId}/done`, { method: 'POST', headers: authHdr() });
      loadAssignments();
    }
  };

  const handleNext = () => {
    if (current < preparedQs.length - 1) {
      setCurrent(c => c + 1);
    } else {
      finishTest(selected);
    }
  };

  const pct = activeTest ? Math.round((score / activeTest.questions.length) * 100) : 0;
  const passed = pct >= 70;

  const Navbar = ({ title, right }) => (
    <nav className="navbar navbar-dark px-3 sticky-top" style={navStyle}>
      <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
        <span className="d-inline-flex align-items-center justify-content-center rounded-2" style={{ width: 30, height: 30, background: C.blue, fontSize: '.9rem' }}>🏭</span>
        {title}
      </span>
      {right}
    </nav>
  );

  // --- TEST VIEW ---
  if (view === 'test' && activeTest) {
    const q = preparedQs[current];
    const total = preparedQs.length;
    const progress = Math.round(((current + 1) / total) * 100);
    const timerWarning = timeLeft !== null && timeLeft <= 60;
    return (
      <div className="min-vh-100" style={{ background: C.blueBg }}>
        <Navbar title={`${activeTest.icon} ${activeTest.title}`} right={
          <div className="d-flex align-items-center gap-2">
            {timeLeft !== null && (
              <span className="fw-bold px-3 py-1 rounded-pill d-flex align-items-center gap-1"
                style={{ background: timerWarning ? '#dc2626' : C.navy, color: '#fff', fontSize: '.95rem', border: `2px solid ${timerWarning ? '#fca5a5' : C.blue}`, minWidth: 80, justifyContent: 'center' }}>
                <i className="bi bi-clock-fill me-1" style={{ fontSize: '.8rem' }}></i>
                {formatTime(timeLeft)}
              </span>
            )}
            <button className="btn btn-sm btn-outline-light" onClick={() => { clearTimeout(timerRef.current); setView('home'); }}>
              <i className="bi bi-x-lg me-1"></i>Выйти
            </button>
          </div>
        } />
        <div className="container py-4" style={{ maxWidth: 700 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small style={{ color: C.muted }}>Вопрос {current + 1} из {total}</small>
            <small style={{ color: C.muted }}>{progress}%</small>
          </div>
          <div className="progress mb-4" style={{ height: 6 }}>
            <div className="progress-bar" style={{ width: `${progress}%`, background: C.blue }}></div>
          </div>
          <div className="card border-0 shadow-sm mb-4" style={{ borderLeft: `4px solid ${C.blue}` }}>
            <div className="card-body">
              <p className="fs-5 fw-semibold mb-0" style={{ color: C.text }}>{q.q}</p>
            </div>
          </div>
          <div className="d-flex flex-column gap-2 mb-4">
            {q.options.map((opt, i) => (
              <button key={i} className={`opt-btn ${selected[current] === i ? 'selected' : ''}`}
                onClick={() => setSelected(p => ({ ...p, [current]: i }))}>
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
          <button className="btn w-100 py-2 fw-semibold text-white" onClick={handleNext}
            disabled={selected[current] === undefined}
            style={{ background: selected[current] === undefined ? C.muted : C.blue, border: 'none' }}>
            {current < total - 1 ? 'Следующий вопрос →' : 'Завершить тест'}
          </button>
        </div>
        <footer className="text-center py-3 small" style={footerStyle}>© 2026 ТехБезопасность. Все права защищены.</footer>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (view === 'result' && activeTest) {
    return (
      <div className="min-vh-100" style={{ background: C.blueBg }}>
        <Navbar title="ТехБезопасность" right={null} />
        <div className="container py-4" style={{ maxWidth: 700 }}>
          <div className={`card border-0 shadow-sm mb-4 ${passed ? '' : ''}`}
            style={{ borderTop: `4px solid ${passed ? '#16a34a' : '#dc2626'}` }}>
            <div className="card-body text-center py-4">
              <div style={{ fontSize: '3rem' }}>{passed ? '✅' : '❌'}</div>
              <h4 className={`fw-bold mt-2 ${passed ? 'text-success' : 'text-danger'}`}>
                {passed ? 'Тест пройден' : 'Тест не пройден'}
              </h4>
              <div className={`display-5 fw-bold ${passed ? 'text-success' : 'text-danger'}`}>{pct}%</div>
              <p className="text-muted mb-1">{score} / {activeTest.questions.length} правильных ответов</p>
              <small className="text-muted">Минимальный проходной балл: 70%</small>
            </div>
          </div>
          <div className="d-flex flex-column gap-2 mb-4">
            {results.map((r, i) => (
              <div key={i} className="card border-0 shadow-sm"
                style={{ borderLeft: `4px solid ${r.isCorrect ? '#16a34a' : '#dc2626'}` }}>
                <div className="card-body py-2 px-3">
                  <p className="mb-1 fw-semibold small" style={{ color: C.text }}>{i + 1}. {r.question}</p>
                  <p className={`mb-0 small ${r.isCorrect ? 'text-success' : 'text-danger'}`}>
                    {r.isCorrect ? '✓ Верно: ' : '✗ Ваш ответ: '}{r.chosen}
                  </p>
                  {!r.isCorrect && <p className="mb-0 small text-success">✓ Правильно: {r.correct}</p>}
                </div>
              </div>
            ))}
          </div>
          <button className="btn w-100 py-2 fw-semibold text-white" onClick={() => setView('home')}
            style={{ background: C.navy, border: 'none' }}>← Вернуться к тестам</button>
        </div>
        <footer className="text-center py-3 small" style={footerStyle}>© 2026 ТехБезопасность. Все права защищены.</footer>
      </div>
    );
  }

  // --- HOME VIEW ---
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: C.blueBg }}>
      <nav className="navbar navbar-dark px-3 sticky-top" style={navStyle}>
        <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <span className="d-inline-flex align-items-center justify-content-center rounded-2" style={{ width: 30, height: 30, background: C.blue, fontSize: '.9rem' }}>🏭</span>
          ТехБезопасность
        </span>
        <div className="d-flex align-items-center gap-3">
          <span className="small d-flex align-items-center gap-1" style={{ color: 'rgba(255,255,255,.6)' }}>
            <i className="bi bi-person-circle"></i>{user}
          </span>
          {/* Bell */}
          <div className="position-relative">
            <button className="btn btn-sm btn-outline-light position-relative" onClick={() => setShowNotif(v => !v)}>
              <i className="bi bi-bell-fill"></i>
              {unseenCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '.6rem' }}>
                  {unseenCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow" style={{ width: 320, zIndex: 1000 }}>
                <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                  <span className="fw-semibold small" style={{ color: C.text }}>Назначенные тесты</span>
                  <button className="btn-close" style={{ fontSize: '.7rem' }} onClick={() => setShowNotif(false)}></button>
                </div>
                {assignments.filter(a => !a.doneAt).length === 0 ? (
                  <div className="text-center text-muted py-4 small">Нет активных назначений</div>
                ) : (
                  <div className="py-1">
                    {assignments.filter(a => !a.doneAt).map(a => (
                      <div key={a.id} className="px-3 py-2 d-flex align-items-center gap-2"
                        style={{ cursor: 'pointer', background: !a.seen ? C.blueBg : 'transparent' }}
                        onClick={() => startAssignedTest(a)}>
                        <span style={{ fontSize: '1.4rem' }}>{a.testIcon}</span>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small" style={{ color: C.text }}>{a.testTitle}</div>
                          <div className="text-muted" style={{ fontSize: '.72rem' }}>
                            Назначен {new Date(a.assignedAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        {!a.seen && <span className="badge" style={{ background: C.blue, fontSize: '.6rem' }}>Новый</span>}
                        <i className="bi bi-chevron-right text-muted small"></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="btn btn-sm fw-semibold text-white" onClick={onLogout}
            style={{ background: '#dc2626', border: 'none' }}>Выйти</button>
        </div>
      </nav>

      <div className="container py-4 flex-grow-1" style={{ maxWidth: 1100 }}>
        {/* Hero */}
        <div className="rounded-4 p-4 mb-4 text-white" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})` }}>
          <h4 className="fw-bold mb-1">Система тестирования по технике безопасности</h4>
          <p className="mb-0" style={{ opacity: .75 }}>Пройдите обязательные тесты для допуска к работе на предприятии</p>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { icon: 'bi-journal-check', label: 'Доступных тестов', value: tests.length },
            { icon: 'bi-patch-check', label: 'Проходной балл', value: '70%' },
            { icon: 'bi-question-circle', label: 'Макс. вопросов', value: tests.length ? Math.max(...tests.map(t => t.questions.length)) : '—' },
          ].map((s, i) => (
            <div key={i} className="col-sm-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderTop: `3px solid ${C.blue}` }}>
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48, background: C.blueBg }}>
                    <i className={`bi ${s.icon} fs-4`} style={{ color: C.blue }}></i>
                  </div>
                  <div>
                    <div className="fs-3 fw-bold" style={{ color: C.blue }}>{s.value}</div>
                    <div className="small" style={{ color: C.muted }}>{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assigned tests */}
        {assignments.filter(a => !a.doneAt).length > 0 && (
          <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: `4px solid ${C.blue}` }}>
            <div className="card-header border-0 d-flex align-items-center gap-2 py-2"
              style={{ background: C.blueBg }}>
              <i className="bi bi-bell-fill" style={{ color: C.blue }}></i>
              <span className="fw-semibold small" style={{ color: C.text }}>
                Назначенные тесты ({assignments.filter(a => !a.doneAt).length})
              </span>
            </div>
            <div className="card-body py-2 px-3">
              <div className="d-flex flex-wrap gap-2">
                {assignments.filter(a => !a.doneAt).map(a => (
                  <button key={a.id} className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                    style={{ background: C.blueBg, border: `1px solid ${C.blue}`, color: C.blue }}
                    onClick={() => startAssignedTest(a)}>
                    <span>{a.testIcon}</span><span>{a.testTitle}</span>
                    {!a.seen && <span className="badge bg-danger" style={{ fontSize: '.6rem' }}>Новый</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <h6 className="fw-bold mb-3" style={{ color: C.text }}>Доступные тесты</h6>
        <div className="row g-3 mb-4">
          {tests.map(test => (
            <div key={test.id} className="col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderTop: `3px solid ${C.blue}` }}>
                <div className="card-body d-flex flex-column">
                  <div style={{ fontSize: '2rem' }} className="mb-2">{test.icon}</div>
                  <h6 className="fw-bold" style={{ color: C.text }}>{test.title}</h6>
                  <p className="small flex-grow-1" style={{ color: C.muted }}>{test.description}</p>
                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <span className="badge" style={{ background: C.blueBg, color: C.blue, border: `1px solid ${C.blueLt}` }}>
                      📝 {test.questions.length} вопросов
                    </span>
                    <span className="badge" style={{ background: C.blueBg, color: C.blue, border: `1px solid ${C.blueLt}` }}>
                      ⏱ {test.timeLimitMin ? `${test.timeLimitMin} мин` : '~5 мин'}
                    </span>
                    {test.shuffleQuestions && <span className="badge" style={{ background: C.blueBg, color: C.blue, border: `1px solid ${C.blueLt}` }}>🔀 вопросы</span>}
                    {test.shuffleOptions && <span className="badge" style={{ background: C.blueBg, color: C.blue, border: `1px solid ${C.blueLt}` }}>🔀 варианты</span>}
                  </div>
                  <button className="btn w-100 fw-semibold text-white"
                    style={{ background: C.blue, border: 'none' }}
                    onClick={() => startTest(test)}>Начать тест →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="alert border-0 d-flex gap-2 align-items-start"
          style={{ background: C.blueBg, color: C.blue, border: `1px solid ${C.blueLt}` }}>
          <i className="bi bi-info-circle-fill mt-1"></i>
          <span>Все тесты обязательны для прохождения. При результате ниже 70% необходимо пройти повторный инструктаж.</span>
        </div>
      </div>

      <footer className="text-center py-3 small" style={footerStyle}>© 2026 ТехБезопасность. Все права защищены.</footer>
    </div>
  );
}
