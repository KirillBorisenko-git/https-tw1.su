const { users, assignments, tests, testResults, getNextAssignId } = require('../db');

// GET /api/admin/employees
function getEmployees(req, res) {
  const employees = users
    .filter(u => u.role !== 'admin')
    .map(u => {
      const userAssignments = assignments.filter(a => a.username === u.username);
      const userResults = testResults.filter(r => r.username === u.username);
      return {
        username: u.username,
        position: u.position || '—',
        createdAt: u.createdAt || null,
        assignments: userAssignments.map(a => ({
          ...a,
          testTitle: tests.find(t => t.id === a.testId)?.title || '—',
          testIcon: tests.find(t => t.id === a.testId)?.icon || '📋',
        })),
        completedCount: userResults.length,
      };
    });
  res.json(employees);
}

// POST /api/admin/assign  { username, testId }
function assignTest(req, res) {
  const { username, testId } = req.body;
  if (!username || !testId) return res.status(400).json({ message: 'username и testId обязательны' });

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

  const test = tests.find(t => t.id === parseInt(testId));
  if (!test) return res.status(404).json({ message: 'Тест не найден' });

  // Prevent duplicate active assignment
  const exists = assignments.find(a => a.username === username && a.testId === parseInt(testId) && !a.doneAt);
  if (exists) return res.status(409).json({ message: 'Тест уже назначен' });

  const a = { id: getNextAssignId(), username, testId: parseInt(testId), assignedAt: new Date().toISOString(), doneAt: null, seen: false };
  assignments.push(a);
  res.json(a);
}

// DELETE /api/admin/assign/:id
function removeAssignment(req, res) {
  const id = parseInt(req.params.id);
  const idx = assignments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Назначение не найдено' });
  assignments.splice(idx, 1);
  res.json({ message: 'Удалено' });
}

// GET /api/assignments  — for current user
function getMyAssignments(req, res) {
  const mine = assignments
    .filter(a => a.username === req.user.username)
    .map(a => ({
      ...a,
      testTitle: tests.find(t => t.id === a.testId)?.title || '—',
      testIcon: tests.find(t => t.id === a.testId)?.icon || '📋',
    }));
  res.json(mine);
}

// POST /api/assignments/:id/seen
function markSeen(req, res) {
  const id = parseInt(req.params.id);
  const a = assignments.find(a => a.id === id && a.username === req.user.username);
  if (!a) return res.status(404).json({ message: 'Не найдено' });
  a.seen = true;
  res.json(a);
}

// POST /api/assignments/:id/done  (called after test completion)
function markDone(req, res) {
  const id = parseInt(req.params.id);
  const a = assignments.find(a => a.id === id && a.username === req.user.username);
  if (!a) return res.status(404).json({ message: 'Не найдено' });
  a.doneAt = new Date().toISOString();
  res.json(a);
}

module.exports = { getEmployees, assignTest, removeAssignment, getMyAssignments, markSeen, markDone };
