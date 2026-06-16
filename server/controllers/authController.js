const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../db');

const JWT_SECRET = 'supersecretkey';

async function register(req, res) {
  const { username, password, position } = req.body;
  if (!username || !password || !position)
    return res.status(400).json({ message: 'Заполните все поля' });
  if (users.find(u => u.username === username))
    return res.status(409).json({ message: 'Пользователь уже существует' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, role: 'user', position, createdAt: new Date().toISOString() });

  // Auto-login after register
  const token = jwt.sign({ username, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, username, role: 'user', position });
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Неверный логин или пароль' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Неверный логин или пароль' });

  const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, username, role: user.role, position: user.position || '' });
}

module.exports = { register, login };
