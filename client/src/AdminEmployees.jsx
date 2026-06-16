import React, { useEffect, useState } from 'react';
const API = '';
const hdrs = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState('');
  const [posFilter, setPosFilter] = useState('');
  const [assignModal, setAssignModal] = useState(null); // username
  const [selectedTest, setSelectedTest] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () =>
    fetch(`${API}/api/admin/employees`, { headers: hdrs() }).then(r => r.json()).then(setEmployees);

  useEffect(() => {
    load();
    fetch(`${API}/api/admin/tests`, { headers: hdrs() }).then(r => r.json()).then(setTests);
  }, []);

  const positions = [...new Set(employees.map(e => e.position).filter(Boolean))];

  const filtered = employees.filter(e => {
    const matchName = e.username.toLowerCase().includes(filter.toLowerCase());
    const matchPos = !posFilter || e.position === posFilter;
    return matchName && matchPos;
  });

  const handleAssign = async () => {
    if (!selectedTest) return setMsg('Выберите тест');
    setAssigning(true); setMsg('');
    const res = await fetch(`${API}/api/admin/assign`, {
      method: 'POST', headers: hdrs(),
      body: JSON.stringify({ username: assignModal, testId: parseInt(selectedTest) }),
    });
    const data = await res.json();
    setAssigning(false);
    if (!res.ok) return setMsg(data.message);
    setMsg('ok');
    load();
    setTimeout(() => { setAssignModal(null); setMsg(''); setSelectedTest(''); }, 800);
  };

  const handleRemoveAssign = async (id) => {
    await fetch(`${API}/api/admin/assign/${id}`, { method: 'DELETE', headers: hdrs() });
    load();
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-1">Сотрудники</h5>
          <p className="text-muted small mb-0">Всего: {employees.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-4">
        <div className="col-md-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
            <input className="form-control" placeholder="Поиск по имени..." value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select form-select-sm" value={posFilter} onChange={e => setPosFilter(e.target.value)}>
            <option value="">Все должности</option>
            {positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {(filter || posFilter) && (
          <div className="col-auto">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setFilter(''); setPosFilter(''); }}>
              <i className="bi bi-x me-1"></i>Сбросить
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people text-muted d-block mb-2" style={{ fontSize: '3rem' }}></i>
          <div className="fw-semibold mb-1">Сотрудников нет</div>
          <div className="text-muted small">Зарегистрированные пользователи появятся здесь</div>
        </div>
      ) : (
        <div className="card border">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Сотрудник</th>
                  <th>Должность</th>
                  <th>Назначенные тесты</th>
                  <th>Пройдено</th>
                  <th className="text-end pe-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.username}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 36, height: 36 }}>
                          <i className="bi bi-person-fill text-primary"></i>
                        </div>
                        <div>
                          <div className="fw-semibold small">{emp.username}</div>
                          <div className="text-muted" style={{ fontSize: '.72rem' }}>
                            {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('ru-RU') : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{emp.position}</span>
                    </td>
                    <td>
                      {emp.assignments.length === 0 ? (
                        <span className="text-muted small">Нет назначений</span>
                      ) : (
                        <div className="d-flex flex-wrap gap-1">
                          {emp.assignments.map(a => (
                            <span key={a.id} className={`badge d-flex align-items-center gap-1 ${a.doneAt ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {a.testIcon} {a.testTitle}
                              {a.doneAt
                                ? <i className="bi bi-check-lg ms-1"></i>
                                : <button className="btn-close btn-close-white ms-1" style={{ fontSize: '.5rem' }} onClick={() => handleRemoveAssign(a.id)}></button>
                              }
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="fw-semibold">{emp.completedCount}</span>
                      <span className="text-muted small ms-1">тест(ов)</span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => { setAssignModal(emp.username); setSelectedTest(''); setMsg(''); }}>
                        <i className="bi bi-plus-lg me-1"></i>Назначить тест
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-journal-plus me-2 text-primary"></i>
                  Назначить тест — <span className="text-primary">{assignModal}</span>
                </h6>
                <button className="btn-close" onClick={() => setAssignModal(null)}></button>
              </div>
              <div className="modal-body">
                {msg && msg !== 'ok' && <div className="alert alert-danger py-2 small mb-3">{msg}</div>}
                {msg === 'ok' && <div className="alert alert-success py-2 small mb-3"><i className="bi bi-check-circle me-1"></i>Тест назначен</div>}
                <label className="form-label fw-semibold small">Выберите тест</label>
                <select className="form-select" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
                  <option value="">— Выберите тест —</option>
                  {tests.map(t => <option key={t.id} value={t.id}>{t.icon} {t.title}</option>)}
                </select>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setAssignModal(null)}>Отмена</button>
                <button className="btn btn-primary btn-sm px-4" onClick={handleAssign} disabled={assigning}>
                  {assigning ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-check-lg me-1"></i>}
                  Назначить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
