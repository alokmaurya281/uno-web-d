import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.resolve(root, relativePath), 'utf8');
}

test('uno-web admin exposes support tickets with reply and status controls', () => {
  const app = read('src/App.tsx');
  const layout = read('src/layouts/AdminLayout.tsx');
  const api = read('src/services/adminApi.ts');
  const page = read('src/pages/Admin/SupportTickets.tsx');

  assert.match(app, /path="support"/);
  assert.match(layout, /Support/);
  assert.match(api, /listSupportTickets/);
  assert.match(api, /updateSupportTicket/);
  assert.match(api, /\/api\/admin\/support-tickets/);
  assert.match(page, /Support Tickets/);
  assert.match(page, /reply/);
  assert.match(page, /status/);
  assert.match(page, /closed/);
});

test('uno-web serves the Flutter legal html as static policy content', () => {
  const candidatePaths = [
    path.resolve(root, '../uno-flutter-game/web/privacy-policy.html'),
    path.resolve(root, '../web/privacy-policy.html'),
  ];
  const sourceFile = candidatePaths.find(p => fs.existsSync(p));
  if (sourceFile) {
    const source = fs.readFileSync(sourceFile, 'utf8');
    const copied = read('public/privacy-policy.html');
    assert.equal(copied, source);
  }
  const copied = read('public/privacy-policy.html');
  assert.match(copied, /Privacy Policy/i);
  const app = read('src/App.tsx');

  assert.match(app, /PrivacyPolicy/);
  assert.match(app, /terms-of-service/);
});
