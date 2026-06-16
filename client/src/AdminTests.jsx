import React, { useEffect, useState } from 'react';
//const API = 'https://bb737bbar.tw1.su';
const API = '';
const ICONS = ['📋', '🔥', '⚡', '🦺', '🏗️', '⚙️', '🧯', '🔧', '🛡️', '☢️'];
const EMPTY_Q = { q: '', options: ['', '', '', ''], answer: 0 };
const EMPTY_FORM = { title: '', icon: '📋', description: '', timeLimitMin: '', shuffleQuestions: false, shuffleOptions: false, questions: [{ ...EMPTY_Q, options: ['', '', '', ''] }] };

const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = () =>
    fetch(`${API}/api/admin/tests`, { headers: headers() })
      .then(r => r.json()).then(setTests);

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setMsg({}); setMode('create'); };
  const openEdit = (t) => {
    setForm({
      title: t.title, icon: t.icon, description: t.description,
      timeLimitMin: t.timeLimitMin || '',
      shuffleQuestions: !!t.shuffleQuestions,
      shuffleOptions: !!t.shuffleOptions,
      questions: t.questions.map(q => ({ ...q, options: [...q.options] })),
    });
    setEditId(t.id); setMsg({}); setMode('edit');
  };
  const cancel = () => { setMode('list'); setMsg({}); };

  // Form helpers
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setQ = (qi, k, v) => setForm(f => {
    const qs = f.questions.map((q, i) => i === qi ? { ...q, [k]: v } : q);
    return { ...f, questions: qs };
  });
  const setOpt = (qi, oi, v) => setForm(f => {
    const qs = f.questions.map((q, i) => {
      if (i !== qi) return q;
      const opts = q.options.map((o, j) => j === oi ? v : o);
      return { ...q, options: opts };
    });
    return { ...f, questions: qs };
  });
  const addOption = (qi) => setForm(f => {
    const qs = f.questions.map((q, i) => i === qi ? { ...q, options: [...q.options, ''] } : q);
    return { ...f, questions: qs };
  });
  const removeOption = (qi, oi) => setForm(f => {
    const qs = f.questions.map((q, i) => {
      if (i !== qi) return q;
      const opts = q.options.filter((_, j) => j !== oi);
      const answer = q.answer >= opts.length ? opts.length - 1 : q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer;
      return { ...q, options: opts, answer: Math.max(0, answer) };
    });
    return { ...f, questions: qs };
  });
  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, { q: '', options: ['', '', '', ''], answer: 0 }] }));
  const removeQuestion = (qi) => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));

  const validate = () => {
    if (!form.title.trim()) return 'Введите название теста';
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.q.trim()) return `Вопрос ${i + 1}: введите текст`;
      const filled = q.options.filter(o => o.trim());
      if (filled.length < 2) return `Вопрос ${i + 1}: минимум 2 варианта ответа`;
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return setMsg({ type: 'danger', text: err });
    setSaving(true); setMsg({});
    const payload = { ...form, questions: form.questions.map(q => ({ ...q, options: q.options.filter(o => o.trim()) })) };
    const url = mode === 'edit' ? `/api/admin/tests/${editId}` : '/api/admin/tests';
    const method = mode === 'edit' ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg({ type: 'danger', text: data.message });
    setMsg({ type: 'success', text: mode === 'edit' ? 'Тест обновлён' : 'Тест создан' });
    load();
    setTimeout(() => { setMode('list'); setMsg({}); }, 900);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить тест?')) return;
    await fetch(`${API}/api/admin/tests/${id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  // ── LIST ──
  if (mode === 'list') return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="fw-bold mb-1">Управление тестами</h5>
          <p className="text-muted small mb-0">Всего тестов: {tests.length}</p>
        </div>
        <button className="btn btn-primary btn-sm px-3" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Создать тест
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-x text-muted d-block mb-3" style={{ fontSize: '3rem' }}></i>
          <div className="fw-semibold mb-1">Тестов пока нет</div>
          <div className="text-muted small mb-3">Создайте первый тест для сотрудников</div>
          <button className="btn btn-primary btn-sm px-4" onClick={openCreate}>Создать тест</button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {tests.map(t => (
            <div key={t.id} className="card border">
              <div className="card-body py-3 px-4">
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{t.title}</div>
                    <div className="text-muted small">{t.description}</div>
                  </div>
                  <span className="badge bg-light text-secondary border me-2">{t.questions.length} вопр.</span>
                  {t.timeLimitMin && <span className="badge me-2" style={{ background: '#fef3e2', color: '#f29900', border: '1px solid #fde68a' }}>⏱ {t.timeLimitMin} мин</span>}
                  {t.shuffleQuestions && <span className="badge me-1" style={{ background: '#f0f6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>🔀 вопросы</span>}
                  {t.shuffleOptions && <span className="badge me-2" style={{ background: '#f0f6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>🔀 варианты</span>}
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                    <i className={`bi bi-chevron-${expanded === t.id ? 'up' : 'down'}`}></i>
                  </button>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(t)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                {expanded === t.id && (
                  <div className="mt-3 pt-3 border-top">
                    {t.questions.map((q, qi) => (
                      <div key={qi} className="mb-3">
                        <div className="fw-medium small mb-1">{qi + 1}. {q.q}</div>
                        <div className="d-flex flex-column gap-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`d-flex align-items-center gap-2 px-2 py-1 rounded small ${q.answer === oi ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
                              <span className="fw-bold">{String.fromCharCode(65 + oi)}</span>
                              <span className="flex-grow-1">{opt}</span>
                              {q.answer === oi && <i className="bi bi-check-lg"></i>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── CREATE / EDIT FORM ──
  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-sm btn-outline-secondary" onClick={cancel}>
          <i className="bi bi-arrow-left me-1"></i>Назад
        </button>
        <div>
          <h5 className="fw-bold mb-0">{mode === 'edit' ? 'Редактировать тест' : 'Новый тест'}</h5>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type} py-2 small mb-3`}>{msg.text}</div>}

      {/* Basic info */}
      <div className="card border mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>Название теста *</label>
              <input className="form-control" placeholder="Например: Пожарная безопасность" value={form.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>Иконка</label>
              <select className="form-select" value={form.icon} onChange={e => setField('icon', e.target.value)}>
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>Описание</label>
              <input className="form-control" placeholder="Краткое описание теста" value={form.description} onChange={e => setField('description', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card border mb-3">
        <div className="card-header bg-white border-bottom py-2">
          <span className="fw-semibold small">⚙️ Настройки теста</span>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>
                <i className="bi bi-clock me-1"></i>Ограничение времени
              </label>
              <div className="input-group input-group-sm">
                <input type="number" className="form-control" placeholder="Без ограничения"
                  min="1" max="180" value={form.timeLimitMin}
                  onChange={e => setField('timeLimitMin', e.target.value)} />
                <span className="input-group-text">мин</span>
              </div>
              <div className="form-text">Оставьте пустым — без таймера</div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-uppercase text-muted d-block" style={{ letterSpacing: '.05em' }}>
                <i className="bi bi-shuffle me-1"></i>Случайный порядок
              </label>
              <div className="form-check form-switch mb-1">
                <input className="form-check-input" type="checkbox" id="shuffleQ"
                  checked={form.shuffleQuestions} onChange={e => setField('shuffleQuestions', e.target.checked)} />
                <label className="form-check-label small" htmlFor="shuffleQ">Перемешать вопросы</label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="shuffleO"
                  checked={form.shuffleOptions} onChange={e => setField('shuffleOptions', e.target.checked)} />
                <label className="form-check-label small" htmlFor="shuffleO">Перемешать варианты ответов</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="fw-semibold">Вопросы ({form.questions.length})</span>
        <button className="btn btn-sm btn-outline-primary" onClick={addQuestion}>
          <i className="bi bi-plus me-1"></i>Добавить вопрос
        </button>
      </div>

      <div className="d-flex flex-column gap-3 mb-4">
        {form.questions.map((q, qi) => (
          <div key={qi} className="card border" style={{ background: '#f8f9fa' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-semibold small text-muted">Вопрос {qi + 1}</span>
                {form.questions.length > 1 && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeQuestion(qi)}>
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>Текст вопроса *</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Введите вопрос..." value={q.q} onChange={e => setQ(qi, 'q', e.target.value)} />
              </div>

              <label className="form-label fw-semibold small text-uppercase text-muted d-flex align-items-center gap-1" style={{ letterSpacing: '.05em' }}>
                Варианты ответов
                <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '.7rem' }}>нажмите ● чтобы отметить правильный</span>
              </label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="d-flex align-items-center gap-2 mb-2">
                  <button type="button"
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded fw-bold"
                    style={{ width: 32, height: 32, border: `2px solid ${q.answer === oi ? '#1e8e3e' : '#dee2e6'}`, background: q.answer === oi ? '#e6f4ea' : '#fff', color: q.answer === oi ? '#1e8e3e' : '#adb5bd', cursor: 'pointer', fontSize: '.8rem' }}
                    onClick={() => setQ(qi, 'answer', oi)}>
                    {q.answer === oi ? '✓' : String.fromCharCode(65 + oi)}
                  </button>
                  <input className="form-control form-control-sm" placeholder={`Вариант ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => setOpt(qi, oi, e.target.value)} />
                  {q.options.length > 2 && (
                    <button type="button" className="btn btn-sm btn-outline-danger flex-shrink-0" onClick={() => removeOption(qi, oi)}>
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline-secondary mt-1" onClick={() => addOption(qi)}>
                <i className="bi bi-plus me-1"></i>Добавить вариант
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary px-4" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Сохранение...</> : <><i className="bi bi-check-lg me-1"></i>Сохранить тест</>}
        </button>
        <button className="btn btn-outline-secondary" onClick={cancel}>Отмена</button>
      </div>
    </div>
  );
}
