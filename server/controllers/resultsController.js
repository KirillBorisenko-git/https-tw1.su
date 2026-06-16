const { testResults } = require('../db');

function saveResult(req, res) {
  const { testTitle, score, total } = req.body;
  if (!testTitle || score == null || !total)
    return res.status(400).json({ message: 'Заполните все поля' });

  const pct = Math.round((score / total) * 100);
  testResults.push({
    username: req.user.username,
    testTitle,
    score,
    total,
    pct,
    date: new Date().toISOString(),
  });
  res.json({ message: 'Результат сохранён' });
}

module.exports = { saveResult };
