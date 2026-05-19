import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.resolve(root, relativePath), 'utf8');
}

test('admin panel uses backend APIs instead of direct Firebase databases', () => {
  const files = [
    'src/App.tsx',
    'src/pages/Login.tsx',
    'src/pages/Admin/Dashboard.tsx',
    'src/pages/Admin/UsersManagement.tsx',
    'src/pages/Admin/RoomsManagement.tsx',
    'src/pages/Admin/Analytics.tsx',
    'src/pages/Admin/Settings.tsx',
    'src/services/adminApi.ts',
  ];

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /firebase\/firestore|firebase\/database/, file);
    assert.doesNotMatch(source, /\bgetFirestore\b|\bgetDatabase\b|\bcollection\(|\bref\(/, file);
  }

  const app = read('src/App.tsx');
  assert.match(app, /path="settings"/);
  assert.match(app, /<Settings \/>/);

  const api = read('src/services/adminApi.ts');
  assert.match(api, /getIdToken/);
  assert.match(api, /\/api\/admin\/overview/);
  assert.match(api, /\/api\/admin\/users/);
  assert.match(api, /\/api\/admin\/configs/);
  assert.match(api, /\/api\/admin\/notifications\/send/);
  assert.match(api, /cleanupInactiveRooms/);
  assert.match(api, /\/api\/admin\/live-rooms\/cleanup-inactive/);
});

test('admin panel exposes rich operational and player detail surfaces', () => {
  const api = read('src/services/adminApi.ts');
  const dashboard = read('src/pages/Admin/Dashboard.tsx');
  const userModal = read('src/components/Admin/UserProfileModal.tsx');

  assert.match(api, /getUserDetail/);
  assert.match(api, /UserDetail/);
  assert.match(api, /\/api\/admin\/users\/\$\{encodeURIComponent\(uid\)\}/);

  assert.match(dashboard, /domainCounts/);
  assert.match(dashboard, /Data Coverage/);
  assert.match(dashboard, /Economy Operations/);
  assert.match(dashboard, /quick_match_limits/);
  assert.match(dashboard, /store_items/);

  assert.match(userModal, /getUserDetail/);
  assert.match(userModal, /Coin History/);
  assert.match(userModal, /Inventory/);
  assert.match(userModal, /Daily Limits/);
  assert.match(userModal, /Match History/);
});

test('rooms admin page can manually clean inactive Redis rooms', () => {
  const rooms = read('src/pages/Admin/RoomsManagement.tsx');

  assert.match(rooms, /cleanupInactiveRooms/);
  assert.match(rooms, /4h Inactive/);
  assert.match(rooms, /inactiveRooms/);
});

test('settings admin page exposes structured no-json config editors', () => {
  const settings = read('src/pages/Admin/Settings.tsx');
  const api = read('src/services/adminApi.ts');

  assert.match(settings, /StructuredConfigEditor/);
  assert.match(settings, /AppSettingsEditor/);
  assert.match(settings, /AdSettingsEditor/);
  assert.match(settings, /CoinRewardsEditor/);
  assert.match(settings, /SpinnerEditor/);
  assert.match(settings, /CatalogEditor/);
  assert.match(settings, /SeasonEditor/);
  assert.match(settings, /Advanced JSON/);
  assert.match(settings, /giftSettings/);
  assert.match(settings, /friendSettings/);
  assert.match(settings, /achievementSettings/);
  assert.match(settings, /featureFlags/);
  assert.match(settings, /Spinner wheel rewards/);
  assert.match(settings, /SpinnerSegmentsEditor/);
  assert.match(settings, /SelectField/);
  assert.match(settings, /requireRewardedAdForExtraSpin/);

  assert.match(api, /getSeasons/);
  assert.match(api, /saveSeason/);
  assert.match(api, /\/api\/admin\/seasons/);
});
