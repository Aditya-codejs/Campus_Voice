import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import app from './app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('health endpoint is available without a database connection', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'online');
});

test('admin APIs reject unauthenticated requests', async () => {
  const response = await fetch(`${baseUrl}/api/admin/dashboard-stats`);
  assert.equal(response.status, 401);
});

test('public Admin registration is not exposed', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'not-a-real-password' }),
  });
  assert.equal(response.status, 404);
});

test('student registration passes required-field validation without a Department', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student Example',
      email: 'student@example.edu',
      enrollment_number: 'ROLL-TEST-1',
      course: 'Test Course',
      academic_year: '1st Year',
      password: 'ThisIsATestPassword123!',
    }),
  });
  assert.notEqual(response.status, 400);
});

test('staff registration requires a Department before writing any account', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register-staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Staff Example',
      email: 'staff@example.edu',
      employee_id: 'EMP-TEST-1',
      password: 'ThisIsATestPassword123!',
    }),
  });
  assert.equal(response.status, 400);
});
