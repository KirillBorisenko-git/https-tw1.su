import React from 'react';

export default function Landing({ onLogin }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: '#1a1a1a' }}>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg sticky-top px-3 px-lg-5" style={{ background: '#0d1b3e', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white" href="#">
          <span style={logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#fff" opacity=".25"/>
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#fff" strokeWidth="1.5"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>Охрана труда</span>
        </a>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"
          style={{ filter: 'invert(1)' }}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto gap-1">
            {['Услуги', 'Обучение', 'Документы', 'Контакты'].map(item => (
              <li key={item} className="nav-item">
                <a className="nav-link fw-medium px-3" style={{ color: 'rgba(255,255,255,.75)' }} href="#">{item}</a>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
            <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem' }}>+7 (XXX) XXX-XX-XX</span>
            <button className="btn fw-semibold px-4" style={{ background: '#2563eb', color: '#fff', border: 'none' }} onClick={onLogin}>Войти</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #1e3a8a 60%, #1d4ed8 100%)', minHeight: 460 }} className="px-3 px-lg-5">
        <div className="container-xl py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 py-4">
              <span className="badge mb-3 px-3 py-2" style={{ background: 'rgba(255,255,255,.12)', color: '#93c5fd', fontSize: '.8rem', borderRadius: 20 }}>
                🛡️ Система охраны труда
              </span>
              <h1 className="fw-bold mb-3 text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.2 }}>
                Охрана труда<br />для вашего бизнеса
              </h1>
              <p className="mb-4" style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.7)' }}>
                Комплексные решения по охране труда<br />и технике безопасности
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <button className="btn fw-semibold px-4 py-2" style={{ background: '#2563eb', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(37,99,235,.5)' }} onClick={onLogin}>
                  Наши услуги
                </button>
                <button className="btn fw-semibold px-4 py-2" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(4px)' }} onClick={onLogin}>
                  Получить консультацию
                </button>
              </div>
            </div>
            <div className="col-lg-6 text-center pt-4 pt-lg-0">
              <div style={heroBg}>
                <div style={{ width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.07)', position: 'absolute' }}></div>
                <img
                  src="https://img.freepik.com/free-vector/safety-officer-concept-illustration_114360-9079.jpg"
                  alt="worker"
                  style={{ maxHeight: 340, maxWidth: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div style={{ fontSize: '8rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0 }}>👷</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-5 bg-white">
        <div className="container-xl px-3 px-lg-5">
          <div className="row g-4 text-center">
            {[
              { icon: '🛡️', title: 'Аудит и оценка рисков', desc: 'Проверки и анализ условий труда' },
              { icon: '🎓', title: 'Обучение и аттестация', desc: 'Курсы и инструктажи для сотрудников' },
              { icon: '📋', title: 'Документация по ОТ', desc: 'Разработка и ведение всех необходимых документов' },
            ].map((s, i) => (
              <div key={i} className="col-md-4">
                <div className="p-4 rounded-4 h-100" style={{ background: '#f0f6ff', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
                  <h6 className="fw-bold mb-2">{s.title}</h6>
                  <p className="text-muted small mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section style={{ background: '#f0f6ff' }} className="py-5">
        <div className="container-xl px-3 px-lg-5">
          <h4 className="text-center fw-bold mb-2">Преимущества работы с нами</h4>
          <p className="text-center text-muted small mb-5">Мы обеспечиваем полный цикл управления охраной труда</p>
          <div className="row g-4 text-center">
            {[
              { icon: '💼', title: 'Профессионализм', desc: 'Опытные эксперты по охране труда' },
              { icon: '⏱️', title: 'Эффективность', desc: 'Оперативное решение задач' },
              { icon: '🤝', title: 'Надёжность', desc: 'Гарантия качества и соблюдение сроков' },
            ].map((a, i) => (
              <div key={i} className="col-md-4">
                <div className="p-4 rounded-4 bg-white h-100" style={{ boxShadow: '0 2px 12px rgba(37,99,235,.08)' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{a.icon}</div>
                  <h6 className="fw-bold mb-2">{a.title}</h6>
                  <p className="text-muted small mb-0">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 text-center text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
        <div className="container-xl px-3">
          <h4 className="fw-bold mb-2">Готовы начать тестирование?</h4>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,.75)' }}>Войдите в систему для прохождения обязательных тестов по технике безопасности</p>
          <button className="btn btn-lg fw-semibold px-5" style={{ background: '#fff', color: '#1e3a8a', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,.2)' }} onClick={onLogin}>
            Войти в систему
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0d1b3e', color: 'rgba(255,255,255,.45)' }} className="py-4 text-center small">
        © 2025 ТехБезопасность. Все права защищены.
      </footer>
    </div>
  );
}

const logo = {
  width: 36, height: 36, background: '#2563eb', borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

const heroBg = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: 400,
  minHeight: 300,
};
