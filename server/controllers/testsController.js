const { tests, getNextTestId } = require('../db');

function getTests(req, res) {
  res.json(tests);
}

function getTestsAdmin(req, res) {
  res.json(tests);
}

function createTest(req, res) {
  const { title, icon, description, questions, timeLimitMin, shuffleQuestions, shuffleOptions } = req.body;
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ message: 'Название и вопросы обязательны' });

  const test = {
    id: getNextTestId(),
    title,
    icon: icon || '📋',
    description: description || '',
    questions,
    timeLimitMin: timeLimitMin ? parseInt(timeLimitMin) : null,
    shuffleQuestions: !!shuffleQuestions,
    shuffleOptions: !!shuffleOptions,
  };
  tests.push(test);
  res.json(test);
}

function updateTest(req, res) {
  const id = parseInt(req.params.id);
  const idx = tests.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Тест не найден' });

  const { title, icon, description, questions, timeLimitMin, shuffleQuestions, shuffleOptions } = req.body;
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ message: 'Название и вопросы обязательны' });

  tests[idx] = {
    ...tests[idx], title,
    icon: icon || tests[idx].icon,
    description: description ?? tests[idx].description,
    questions,
    timeLimitMin: timeLimitMin ? parseInt(timeLimitMin) : null,
    shuffleQuestions: !!shuffleQuestions,
    shuffleOptions: !!shuffleOptions,
  };
  res.json(tests[idx]);
}

function deleteTest(req, res) {
  const id = parseInt(req.params.id);
  const idx = tests.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Тест не найден' });
  tests.splice(idx, 1);
  res.json({ message: 'Тест удалён' });
}

module.exports = { getTests, getTestsAdmin, createTest, updateTest, deleteTest };
