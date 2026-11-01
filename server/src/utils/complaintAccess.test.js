import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessComplaint } from './complaintAccess.js';

const complaint = {
  student: { _id: 'student-1' },
  department: { _id: 'department-1' },
  assigned_to: { _id: 'staff-2' },
};

test('students can access only their own complaints', () => {
  assert.equal(canAccessComplaint(complaint, { role: 'student', _id: 'student-1' }), true);
  assert.equal(canAccessComplaint(complaint, { role: 'student', _id: 'student-2' }), false);
});

test('staff can access department complaints and direct assignments only', () => {
  assert.equal(
    canAccessComplaint(complaint, { role: 'staff', _id: 'staff-1', department: 'department-1' }),
    true
  );
  assert.equal(
    canAccessComplaint(complaint, { role: 'staff', _id: 'staff-2', department: 'department-2' }),
    true
  );
  assert.equal(
    canAccessComplaint(complaint, { role: 'staff', _id: 'staff-3', department: 'department-2' }),
    false
  );
});

test('sensitive complaints are visible to staff only when directly assigned', () => {
  const sensitiveComplaint = { ...complaint, category: { is_sensitive: true } };
  assert.equal(
    canAccessComplaint(sensitiveComplaint, {
      role: 'staff',
      _id: 'staff-1',
      department: 'department-1',
    }),
    false
  );
  assert.equal(
    canAccessComplaint(sensitiveComplaint, {
      role: 'staff',
      _id: 'staff-2',
      department: 'department-2',
    }),
    true
  );
});

test('admins can access complaints while unknown roles are denied', () => {
  assert.equal(canAccessComplaint(complaint, { role: 'admin', _id: 'admin-1' }), true);
  assert.equal(canAccessComplaint(complaint, { role: 'superadmin', _id: 'admin-2' }), true);
  assert.equal(canAccessComplaint(complaint, { role: 'guest', _id: 'guest-1' }), false);
});
