import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.resolve(root, relativePath), 'utf8');
}

test('public account deletion form submits backend deletion requests', () => {
  const page = read('src/pages/AccountDeletion.tsx');
  const api = read('src/services/adminApi.ts');

  assert.doesNotMatch(page, /mailto:/);
  assert.match(page, /createAccountDeletionRequest/);
  assert.match(page, /GoogleAuthProvider/);
  assert.match(page, /signInWithPopup/);
  assert.match(page, /sendEmailVerification/);
  assert.match(page, /emailVerified/);
  assert.match(page, /Verify with Firebase/);
  assert.match(page, /verifiedUser\.email/);
  assert.match(page, /Account deletion request submitted/);
  assert.match(page, /setSubmitting/);
  assert.match(page, /name="email"/);
  assert.match(page, /name="uid"/);
  assert.match(api, /createAccountDeletionRequest/);
  assert.match(api, /getIdToken/);
  assert.match(api, /Authorization: `Bearer \$\{token\}`/);
  assert.match(api, /\/api\/account-deletion-requests/);
});

test('admin panel lists deletion requests and can delete requested users', () => {
  const app = read('src/App.tsx');
  const layout = read('src/layouts/AdminLayout.tsx');
  const api = read('src/services/adminApi.ts');
  const page = read('src/pages/Admin/AccountDeletionRequests.tsx');

  assert.match(app, /AccountDeletionRequests/);
  assert.match(app, /path="account-deletion-requests"/);
  assert.match(layout, /Deletion Requests/);
  assert.match(api, /listAccountDeletionRequests/);
  assert.match(api, /deleteUserForAccountDeletionRequest/);
  assert.match(api, /updateAccountDeletionRequest/);
  assert.match(api, /\/api\/admin\/account-deletion-requests/);
  assert.match(page, /Account Deletion Requests/);
  assert.match(page, /deleteUserForAccountDeletionRequest/);
  assert.match(page, /Delete user/);
  assert.match(page, /statusOptions/);
});
