import React, { useEffect, useState, useRef } from 'react';
const API = 'https://tw1.su';
const TYPE_LABELS = { single: 'Один ответ', multiple: 'Несколько ответов', text: 'Текстовый ответ' };
const TYPE_ICONS = { single: 'bi-record-circle', multiple: 'bi-check2-square', text: 'bi-pencil' };
const TYPE_COLORS = { single: { bg: '#e8f0fe', color: '#1a73e8' }, multiple: { bg: '#e6f4ea', color: '#1e8e3e' }, text: { bg: '#f3e8ff', color: '#7c3aed' } };
const EMPTY_FORM = { type: 'single', text: '', options: ['', '', '', ''], correctAnswers: [], textAnswer: '', attachment: null };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => fetch(`${API}/api/admin/questions`, { headers }).then(r => r.json()).then(setQuestions);
  useEffect(() => { load(); }, []);

  const handleOptionChange = (i, val) => {
    const opts = [...form.options]; opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  };
  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }));
  const removeOption = (i) => {
    const opts = form.options.filter((_, idx) => idx !== i);
    const correct = form.correctAnswers.filter(c => c !== i).map(c => c > i ? c - 1 : c);
    setForm(f => ({ ...f, options: opts, correctAnswers: correct }));
  };
  const toggleCorrect = (i) => {
    if (form.type === 'single') { setForm(f => ({ ...f, correctAnswers: [i] })); return; }
    const has = form.correctAnswers.includes(i);
    setForm(f => ({ ...f, correctAnswers: has ? f.correctAnswers.filter(c => c !== i) : [...f.correctAnswers, i] }));
  };
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setForm(f => ({ ...f, attachment: file }));
    if (file.type.startsWith('image/')) { const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(file); }
    else setPreview(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return setMsg('Введите текст вопроса');
    if (form.type !== 'text' && form.options.filter(o => o.trim()).length < 2) return setMsg('Добавьте минимум 2 варианта ответа');
    if (form.type !== 'text' && form.correctAnswers.length === 0) return setMsg('Укажите правильный ответ');
    setSaving(true); setMsg('');
    const fd = new FormData();
    fd.append('type', form.type);
    fd.append('text', form.text);
    fd.append('options', JSON.stringify(form.options.filter(o => o.trim())));
    fd.append('correctAnswers', JSON.stringify(form.type === 'text' ? [form.textAnswer] : form.correctAnswers.map(String)));
    if (form.attachment) fd.append('attachment', form.attachment);
    const res = await fetch(`${API}/api/admin/questions`, { method: 'POST', headers, body: fd });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data.message);
    setMsg('ok');
    setForm(EMPTY_FORM); setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    load();
    setTimeout(() => { setMsg(''); setShowForm(false); }, 1200);
  };
  const deleteQ = async (id) => {
    if (!confirm('Удалить вопрос?')) return;
    await fetch(`${API}/api/admin/questions/${id}`, { method: 'DELETE', headers });
    load();
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="fw-bold mb-1">Банк вопросов</h5>
          <p className="text-muted small mb-0">Всего вопросов: {questions.length}</p>
        </div>
        <button className={`btn btn-sm px-3 ${showForm ? 'btn-outline-secondary' : 'btn-primary'}`}
          onClick={() => { setShowForm(v => !v); setMsg(''); }}>
          {showForm
            ? <><i className="bi bi-x me-1"></i>Отмена</>
            : <><i className="bi bi-plus-lg me-1"></i>Добавить вопрос</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border mb-4" style={{ background: '#f8f9fa' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-plus-circle-fill text-primary"></i>Новый вопрос
            </h6>
            <form onSubmit={handleSubmit}>

              {/* Type */}
              <div className="mb-4">
                <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>Тип вопроса</label>
                <div className="d-flex gap-2 flex-wrap">
                  {Object.entries(TYPE_LABELS).map(([val, label]) => {
                    const active = form.type === val;
                    const c = TYPE_COLORS[val];
                    return (
                      <button key={val} type="button"
                        className="btn btn-sm d-flex align-items-center gap-1"
                        style={{ border: `2px solid ${active ? c.color : '#dee2e6'}`, background: active ? c.bg : '#fff', color: active ? c.color : '#6c757d', fontWeight: active ? 600 : 400 }}
                        onClick={() => setForm(f => ({ ...f, type: val, correctAnswers: [] }))}>
                        <i className={`bi ${TYPE_ICONS[val]}`}></i>{label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text */}
              <div className="mb-4">
                <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>
                  Текст вопроса <span className="text-danger">*</span>
                </label>
                <textarea className="form-control" rows={3} placeholder="Введите текст вопроса..." value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required />
              </div>

              {/* Options */}
              {form.type !== 'text' && (
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted d-flex align-items-center gap-1" style={{ letterSpacing: '.05em' }}>
                    Варианты ответов
                    <span className="badge bg-light text-muted border fw-normal ms-1" style={{ fontSize: '.7rem' }}>нажмите ✓ чтобы отметить правильный</span>
                  </label>
                  {form.options.map((opt, i) => (
                    <div key={i} className="d-flex align-items-center gap-2 mb-2">
                      <button type="button"
                        className="d-flex align-items-center justify-content-center flex-shrink-0 rounded fw-bold"
                        style={{ width: 34, height: 34, border: `2px solid ${form.correctAnswers.includes(i) ? '#1e8e3e' : '#dee2e6'}`, background: form.correctAnswers.includes(i) ? '#e6f4ea' : '#f8f9fa', color: form.correctAnswers.includes(i) ? '#1e8e3e' : '#adb5bd', cursor: 'pointer', fontSize: '.85rem' }}
                        onClick={() => toggleCorrect(i)}>
                        {form.correctAnswers.includes(i) ? '✓' : String.fromCharCode(65 + i)}
                      </button>
                      <input className="form-control form-control-sm" placeholder={`Вариант ${String.fromCharCode(65 + i)}`}
                        value={opt} onChange={e => handleOptionChange(i, e.target.value)} />
                      {form.options.length > 2 && (
                        <button type="button" className="btn btn-sm btn-outline-danger flex-shrink-0" onClick={() => removeOption(i)}>
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-outline-secondary mt-1" onClick={addOption}>
                    <i className="bi bi-plus me-1"></i>Добавить вариант
                  </button>
                </div>
              )}

              {/* Text answer */}
              {form.type === 'text' && (
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>
                    Правильный ответ <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" placeholder="Введите правильный ответ..." value={form.textAnswer}
                    onChange={e => setForm(f => ({ ...f, textAnswer: e.target.value }))} />
                </div>
              )}

              {/* Attachment */}
              <div className="mb-4">
                <label className="form-label fw-semibold small text-uppercase text-muted" style={{ letterSpacing: '.05em' }}>Прикрепить файл</label>
                <div>
                  <label className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-paperclip me-1"></i>Выбрать файл
                    <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" className="d-none" onChange={handleFile} />
                  </label>
                </div>
                {form.attachment && (
                  <div className="d-flex align-items-center gap-2 mt-2 p-2 border rounded bg-white">
                    {preview
                      ? <img src={preview} alt="preview" className="rounded" style={{ maxHeight: 72, maxWidth: 100, objectFit: 'cover' }} />
                      : <span className="small text-muted"><i className="bi bi-file-earmark me-1"></i>{form.attachment.name}</span>}
                    <button type="button" className="btn btn-sm btn-outline-danger ms-auto"
                      onClick={() => { setForm(f => ({ ...f, attachment: null })); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}
              </div>

              {msg && msg !== 'ok' && <div className="alert alert-danger py-2 small mb-3">{msg}</div>}
              {msg === 'ok' && <div className="alert alert-success py-2 small mb-3"><i className="bi bi-check-circle me-1"></i>Вопрос успешно добавлен</div>}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Сохранение...</> : <><i className="bi bi-check-lg me-1"></i>Сохранить вопрос</>}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowForm(false); setMsg(''); setForm(EMPTY_FORM); }}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox text-muted d-block mb-3" style={{ fontSize: '3rem' }}></i>
          <div className="fw-semibold text-dark mb-1">Вопросы ещё не добавлены</div>
          <div className="text-muted small mb-3">Нажмите «Добавить вопрос» чтобы создать первый вопрос</div>
          <button className="btn btn-primary btn-sm px-4" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-1"></i>Добавить вопрос
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {questions.map((q, i) => {
            const tc = TYPE_COLORS[q.type];
            return (
              <div key={q.id} className="card border">
                <div className="card-body py-3 px-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-muted small fw-medium">#{i + 1}</span>
                    <span className="badge rounded-pill d-flex align-items-center gap-1"
                      style={{ background: tc.bg, color: tc.color, fontSize: '.72rem', fontWeight: 600 }}>
                      <i className={`bi ${TYPE_ICONS[q.type]}`}></i>{TYPE_LABELS[q.type]}
                    </span>
                    <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => deleteQ(q.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  <p className="fw-semibold mb-2" style={{ fontSize: '.95rem' }}>{q.text}</p>
                  {q.attachment && (
                    q.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                      ? <img src={q.attachment} alt="attachment" className="rounded mb-2" style={{ maxWidth: 180, maxHeight: 110, objectFit: 'cover', display: 'block' }} />
                      : <a href={q.attachment} target="_blank" rel="noreferrer" className="small d-block mb-2 text-primary">
                          <i className="bi bi-file-earmark me-1"></i>Прикреплённый файл
                        </a>
                  )}
                  {q.options.length > 0 && (
                    <div className="d-flex flex-column gap-1 mt-1">
                      {q.options.map((opt, oi) => {
                        const correct = q.correctAnswers.includes(String(oi));
                        return (
                          <div key={oi} className="d-flex align-items-center gap-2 px-2 py-1 rounded small"
                            style={{ background: correct ? '#e6f4ea' : '#f8f9fa', color: correct ? '#1e8e3e' : '#6c757d' }}>
                            <span className="fw-bold flex-shrink-0">{String.fromCharCode(65 + oi)}</span>
                            <span className="flex-grow-1">{opt}</span>
                            {correct && <i className="bi bi-check-lg fw-bold"></i>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'text' && q.correctAnswers[0] && (
                    <div className="small mt-2 text-muted">
                      Правильный ответ: <strong className="text-success">{q.correctAnswers[0]}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
