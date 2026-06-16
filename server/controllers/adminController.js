const { users, testResults, questions, getNextId, tests } = require('../db');

function getStats(req, res) {
  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const recent = [...testResults].reverse().slice(0, 10);
  const top = [...testResults].sort((a, b) => b.pct - a.pct).slice(0, 10);
  res.json({ totalUsers, totalTests: tests.length, totalQuestions: questions.length, recent, top });
}

function getTestStats(req, res) {
  const perTest = tests.map(t => {
    const results = testResults.filter(r => r.testTitle === t.title);
    const attempts = results.length;
    const passed = results.filter(r => r.pct >= 70).length;
    const avgPct = attempts ? Math.round(results.reduce((s, r) => s + r.pct, 0) / attempts) : null;
    const details = [...results].reverse().map(r => ({
      username: r.username, score: r.score, total: r.total, pct: r.pct, date: r.date,
    }));
    return {
      id: t.id, title: t.title, icon: t.icon,
      attempts, passed, failed: attempts - passed,
      successRate: attempts ? Math.round((passed / attempts) * 100) : null,
      avgPct,
      details,
    };
  });
  res.json(perTest);
}

function getQuestions(req, res) {
  res.json(questions);
}

function addQuestion(req, res) {
  const { type, text, options, correctAnswers } = req.body;
  if (!type || !text)
    return res.status(400).json({ message: 'Тип и текст обязательны' });

  const q = {
    id: getNextId(),
    type,
    text,
    options: options ? JSON.parse(options) : [],
    correctAnswers: correctAnswers ? JSON.parse(correctAnswers) : [],
    attachment: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
  };
  questions.push(q);
  res.json(q);
}

function deleteQuestion(req, res) {
  const id = parseInt(req.params.id);
  const idx = questions.findIndex(q => q.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Вопрос не найден' });
  questions.splice(idx, 1);
  res.json({ message: 'Удалён' });
}

module.exports = { getStats, getTestStats, getQuestions, addQuestion, deleteQuestion };
