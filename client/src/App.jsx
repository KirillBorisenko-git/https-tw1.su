import React, { useState } from 'react';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import Landing from './Landing';
import { C } from './theme';

const API = '';


const POSITIONS = [
  'Электрик', 'Сварщик', 'Слесарь', 'Механик', 'Оператор', 'Технолог',
  'Инженер по ОТ', 'Мастер участка', 'Начальник цеха', 'Другое',
];

export default function App() {
  const [mode, setMode] = useState('landing');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(() => localStorage.getItem('username') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'user');

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role || 'user');
    setRole(data.role || 'user');
    setUser(data.username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const isRegister = mode === 'register';
    const body = isRegister ? { username, password, position } : { username, password };
    try {
      const res = await fetch(isRegister ? `${API}/api/register` : `${API}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      saveSession(data);
    } catch { setError('Ошибка сети'); }
  };

  const logout = () => {
    ['token', 'username', 'role'].forEach(k => localStorage.removeItem(k));
    setUser(null); setRole('user'); setUsername(''); setPassword(''); setPosition(''); setMode('landing');
  };

  if (user && role === 'admin') return <AdminDashboard user={user} onLogout={logout} />;
  if (user) return <Dashboard user={user} onLogout={logout} />;
  if (mode === 'landing') return <Landing onLogin={() => setMode('login')} />;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: C.blueBg }}>
      <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: 420, borderTop: `4px solid ${C.blue}` }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
              style={{ width: 56, height: 56, background: C.navy }}>
              <span style={{ fontSize: '1.6rem' }}>🏭</span>
            </div>
            <h4 className="fw-bold mb-0" style={{ color: C.text }}>ТехБезопасность</h4>
            <p className="small mb-0" style={{ color: C.muted }}>Система тестирования</p>
          </div>

          <ul className="nav nav-pills nav-fill mb-4">
            <li className="nav-item">
              <button className={`nav-link ${mode === 'login' ? 'active' : ''}`}
                style={mode === 'login' ? { background: C.blue } : {}}
                onClick={() => { setMode('login'); setError(''); }}>Вход</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${mode === 'register' ? 'active' : ''}`}
                style={mode === 'register' ? { background: C.blue } : {}}
                onClick={() => { setMode('register'); setError(''); }}>Регистрация</button>
            </li>
          </ul>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small" style={{ color: C.text }}>Логин</label>
              <input className="form-control" placeholder="Введите логин" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold small" style={{ color: C.text }}>Пароль</label>
              <input className="form-control" type="password" placeholder="Введите пароль" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {mode === 'register' && (
              <div className="mb-3">
                <label className="form-label fw-semibold small" style={{ color: C.text }}>Должность</label>
                <select className="form-select" value={position} onChange={e => setPosition(e.target.value)} required>
                  <option value="">— Выберите должность —</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            <button className="btn w-100 mt-1 fw-semibold text-white" type="submit"
              style={{ background: C.blue, border: 'none' }}>
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
          <button className="btn btn-link w-100 text-muted mt-2 small" onClick={() => { setMode('landing'); setError(''); }}>
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}
