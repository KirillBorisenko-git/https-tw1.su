// Единая цветовая тема
export const C = {
  navy:    '#0d1b3e',   // navbar, footer
  blue:    '#2563eb',   // primary accent
  blueMid: '#1e3a8a',   // gradient mid
  blueBg:  '#f0f6ff',   // page background
  blueLt:  '#dbeafe',   // card border / light bg
  text:    '#1e293b',   // main text
  muted:   '#64748b',   // secondary text
  white:   '#ffffff',
};

export const navStyle = {
  background: C.navy, height: 56, flexShrink: 0,
};

export const activeTabStyle = {
  border: 'none', background: 'none', padding: '14px 20px', cursor: 'pointer',
  fontSize: '.9rem', fontWeight: 700, color: C.blue,
  borderBottom: `2px solid ${C.blue}`, marginBottom: -1,
};

export const inactiveTabStyle = {
  border: 'none', background: 'none', padding: '14px 20px', cursor: 'pointer',
  fontSize: '.9rem', fontWeight: 500, color: C.muted,
  borderBottom: '2px solid transparent', marginBottom: -1,
};

export const footerStyle = {
  background: C.navy, color: 'rgba(255,255,255,.45)', fontSize: '.78rem', flexShrink: 0,
};
