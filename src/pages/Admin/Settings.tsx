import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle2, ChevronDown, FileJson, Plus, RefreshCw, Save, Send, Sparkles, Trash2, Users } from 'lucide-react';
import {
  getConfig,
  getSeasons,
  listConfigs,
  runPassSeasonTransition,
  saveConfig,
  saveSeason,
  seedPassSeasons,
  sendNotification,
  getBots,
  triggerBotSeeding,
  type AdminBotProfile,
  type AdminConfigSummary,
  type AdminSeason,
} from '../../services/adminApi';

type ConfigMap = Record<string, unknown>;

const asRecord = (value: unknown): ConfigMap => (value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as ConfigMap) } : {});
const asList = (value: unknown): ConfigMap[] => (Array.isArray(value) ? value.map(asRecord) : []);
const readString = (value: unknown, fallback = '') => (value == null ? fallback : String(value));
const readNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const readBool = (value: unknown, fallback = false) => (typeof value === 'boolean' ? value : fallback);

const sectionTitle = (id: string) => ({
  app_settings: 'App, Friends & Gifts',
  ad_settings: 'Ad Settings',
  coin_rewards_config: 'Coins, Missions & Streaks',
  spinner_config: 'Daily Spinner',
  store_config: 'Store Catalog',
  collection_config: 'Collection Catalog',
  achievements_config: 'Achievements',
  remote_config: 'Remote Config',
}[id] || id);

const Settings: React.FC = () => {
  const [configs, setConfigs] = useState<AdminConfigSummary[]>([]);
  const [selectedId, setSelectedId] = useState('app_settings');
  const [settings, setSettings] = useState<ConfigMap>({});
  const [jsonText, setJsonText] = useState('{}');
  const [showJson, setShowJson] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [seasons, setSeasons] = useState<AdminSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [seasonWarnings, setSeasonWarnings] = useState<ConfigMap[]>([]);
  const [notification, setNotification] = useState({ title: '', body: '', targetEmails: '', inApp: true, push: true, inAppStyle: 'popup' as 'popup' | 'banner' });
  const [bots, setBots] = useState<AdminBotProfile[]>([]);

  const loadList = useCallback(async () => {
    const response = await listConfigs();
    setConfigs(response.configs);
  }, []);

  const loadConfig = useCallback(async (id = selectedId) => {
    setLoading(true);
    setMessage('');
    try {
      await loadList();
      const response = await getConfig(id);
      const next = asRecord(response.settings);
      setSettings(next);
      setJsonText(JSON.stringify(next, null, 2));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load config.');
    } finally {
      setLoading(false);
    }
  }, [loadList, selectedId]);

  const loadSeasons = useCallback(async () => {
    try {
      const response = await getSeasons();
      setSeasons(response.seasons || []);
    } catch {
      setSeasons([]);
    }
  }, []);

  const loadBots = useCallback(async () => {
    try {
      const response = await getBots();
      setBots(response.bots || []);
    } catch {
      setBots([]);
    }
  }, []);

  useEffect(() => {
    void loadConfig(selectedId);
  }, [loadConfig, selectedId]);

  useEffect(() => {
    void loadSeasons();
    void loadBots();
  }, [loadSeasons, loadBots]);

  const updateSettings = (next: ConfigMap) => {
    setSettings(next);
    setJsonText(JSON.stringify(next, null, 2));
  };

  const saveCurrent = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveConfig(selectedId, settings);
      await loadList();
      setMessage('Config saved to MongoDB.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const applyJson = () => {
    try {
      const parsed = asRecord(JSON.parse(jsonText));
      setSettings(parsed);
      setMessage('Advanced JSON applied. Press Save to persist it.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Invalid JSON.');
    }
  };

  const sendCurrentNotification = async () => {
    setMessage('');
    try {
      const result = await sendNotification(notification);
      setMessage(`Notification queued for ${result.targetUserCount} users, ${result.successCount} push successes.`);
      setNotification((current) => ({ ...current, title: '', body: '' }));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Notification failed.');
    }
  };

  const transitionPass = async () => {
    const result = await runPassSeasonTransition();
    await loadSeasons();
    setMessage(`Season transition complete. Archived: ${result.transitioned.join(', ') || 'none'}.`);
  };

  const seedSeasons = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await seedPassSeasons(7);
      setSeasons(response.seasons || []);
      setSelectedSeason(0);
      setSeasonWarnings([]);
      setMessage(`Seeded ${response.seasons?.length || 0} UNO Pass seasons.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Season seed failed.');
    } finally {
      setSaving(false);
    }
  };

  const saveCurrentSeason = async (season: AdminSeason) => {
    setSaving(true);
    setMessage('');
    try {
      const response = await saveSeason(season);
      const next = [...seasons];
      next[selectedSeason] = response.season;
      setSeasons(next);
      const warnings = asList(response.season.rewardWarnings);
      setSeasonWarnings(warnings);
      setMessage(warnings.length > 0 ? `Season saved with ${warnings.length} reward replacement warning(s).` : 'Season saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Season save failed.');
    } finally {
      setSaving(false);
    }
  };

  const seedBots = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await triggerBotSeeding(true);
      setMessage(`Bots seeded: ${response.message}`);
      await loadBots();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Bot seed failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tight">Admin <span className="text-uno-red">Settings</span></h1>
        <p className="text-sm text-gray-500">Manage production config without hand-editing JSON. Advanced JSON remains available for rare fields.</p>
      </div>

      {message && <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white"><CheckCircle2 size={16} className="text-uno-green" /> {message}</div>}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400"><FileJson size={16} /> Configs</h2>
          <div className="space-y-2">
            {configs.map((config) => (
              <button
                key={config.id}
                onClick={() => setSelectedId(config.id)}
                className={`w-full rounded-lg px-3 py-3 text-left text-sm font-bold ${selectedId === config.id ? 'bg-uno-red text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
              >
                <span className="block">{config.label || config.id}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-70">{config.source}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-black">{sectionTitle(selectedId)}</h2>
              <p className="text-xs text-gray-500">{selectedId}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void loadConfig()} className="rounded-lg bg-white/5 p-3 hover:bg-white/10" title="Reload">
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={saveCurrent} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-uno-red px-4 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50">
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          <StructuredConfigEditor id={selectedId} value={settings} onChange={updateSettings} />

          <div className="mt-5 rounded-lg border border-white/10 bg-black/20">
            <button onClick={() => setShowJson((current) => !current)} className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-300">
              Advanced JSON <ChevronDown size={16} className={showJson ? 'rotate-180' : ''} />
            </button>
            {showJson && (
              <div className="space-y-3 p-4 pt-0">
                <textarea
                  value={jsonText}
                  onChange={(event) => setJsonText(event.target.value)}
                  spellCheck={false}
                  className="min-h-[300px] w-full resize-y rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs leading-6 text-gray-100 outline-none focus:border-uno-red/60"
                />
                <button onClick={applyJson} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/15">
                  Apply JSON To Form
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <NotificationPanel notification={notification} setNotification={setNotification} sendCurrentNotification={sendCurrentNotification} />
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Sparkles className="text-uno-blue" /> UNO Pass Seasons</h2>
            <SeasonEditor
              seasons={seasons}
              selectedSeason={selectedSeason}
              setSelectedSeason={setSelectedSeason}
              setSeasons={setSeasons}
              saveCurrentSeason={saveCurrentSeason}
              rewardWarnings={seasonWarnings}
            />
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => void seedSeasons()} disabled={saving} className="rounded-lg bg-uno-yellow px-4 py-3 text-xs font-black uppercase tracking-widest text-black disabled:opacity-50">
              Seed 7 Seasons
            </button>
            <button onClick={() => void transitionPass()} className="rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10">
              Run Season Transition
            </button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-1">
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Users className="text-uno-green" /> Bot AI Players</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {bots.map((bot) => (
              <div key={bot.botId} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <h3 className="font-bold text-white">{bot.name} <span className="text-xs text-gray-500">#{bot.botId}</span></h3>
                <p className="mt-1 text-xs text-gray-400">Personality: {bot.personality}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={bot.isActive ? "text-uno-green" : "text-gray-500"}>{bot.isActive ? "Active" : "Inactive"}</span>
                  <span className="text-gray-400">Win: {(bot.baseWinRate * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
          {bots.length === 0 && <p className="text-sm text-gray-500">No bots loaded.</p>}
          <div className="mt-4 flex gap-2">
            <button onClick={() => void seedBots()} disabled={saving} className="rounded-lg bg-uno-green px-4 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50">
              Re-seed All Bots
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

function StructuredConfigEditor({ id, value, onChange }: { id: string; value: ConfigMap; onChange: (next: ConfigMap) => void }) {
  if (id === 'app_settings') return <AppSettingsEditor value={value} onChange={onChange} />;
  if (id === 'ad_settings') return <AdSettingsEditor value={value} onChange={onChange} />;
  if (id === 'coin_rewards_config') return <CoinRewardsEditor value={value} onChange={onChange} />;
  if (id === 'spinner_config') return <SpinnerEditor value={value} onChange={onChange} />;
  if (['store_config', 'collection_config', 'achievements_config'].includes(id)) return <CatalogEditor value={value} onChange={onChange} id={id} />;
  return <KeyValueEditor value={value} onChange={onChange} />;
}

function AppSettingsEditor({ value, onChange }: EditorProps) {
  const featureFlags = asRecord(value.featureFlags);
  const supportLinks = asRecord(value.supportLinks);
  const supportSettings = asRecord(value.supportSettings);
  const achievementSettings = asRecord(value.achievementSettings);
  const friendSettings = asRecord(value.friendSettings);
  const giftSettings = asRecord(value.giftSettings);
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  const setNested = (group: string, key: string, next: unknown) => onChange({ ...value, [group]: { ...asRecord(value[group]), [key]: next } });

  return (
    <div className="space-y-5">
      <Panel title="App switches">
        <ToggleGrid>
          {['maintenanceMode', 'guestLogin', 'playGamesSignIn', 'newRegistration', 'forceUpdate', 'useSocket'].map((key) => (
            <Toggle key={key} label={key} checked={readBool(value[key])} onChange={(next) => set(key, next)} />
          ))}
        </ToggleGrid>
        <TextField label="Force update version" value={readString(value.forceUpdateVersion)} onChange={(next) => set('forceUpdateVersion', next)} />
      </Panel>

      <Panel title="Feature flags">
        <ToggleGrid>
          {['unoPassEnabled', 'seasonSystemEnabled', 'levelsXpEnabled', 'friendsTabEnabled', 'giftsEnabled'].map((key) => (
            <Toggle key={key} label={key} checked={readBool(featureFlags[key])} onChange={(next) => setNested('featureFlags', key, next)} />
          ))}
        </ToggleGrid>
      </Panel>

      <Panel title="Support links">
        <Toggle checked={readBool(supportSettings.enabled, true)} label="support tickets enabled" onChange={(next) => setNested('supportSettings', 'enabled', next)} />
        <FieldGrid>
          {['helpCenter', 'contactUs', 'reportProblem', 'privacyPolicy', 'termsOfService'].map((key) => (
            <TextField key={key} label={key} value={readString(supportLinks[key])} onChange={(next) => setNested('supportLinks', key, next)} />
          ))}
        </FieldGrid>
      </Panel>

      <Panel title="Achievement settings">
        <ToggleGrid>
          {['enabled', 'popupsEnabled', 'rewardClaimingEnabled', 'secretRevealEnabled', 'animationsEnabled'].map((key) => (
            <Toggle key={key} label={key} checked={readBool(achievementSettings[key], true)} onChange={(next) => setNested('achievementSettings', key, next)} />
          ))}
        </ToggleGrid>
        <FieldGrid>
          <NumberField label="Recent achievements count" value={readNumber(achievementSettings.recentAchievementsCount, 3)} onChange={(next) => setNested('achievementSettings', 'recentAchievementsCount', next)} />
        </FieldGrid>
      </Panel>

      <Panel title="Friends">
        <ToggleGrid>
          {['enabled', 'searchByEmail', 'searchByName', 'pushNotifications', 'inAppNotifications'].map((key) => (
            <Toggle key={key} label={key} checked={readBool(friendSettings[key], true)} onChange={(next) => setNested('friendSettings', key, next)} />
          ))}
        </ToggleGrid>
        <FieldGrid>
          <NumberField label="Max pending requests" value={readNumber(friendSettings.maxPendingRequests, 25)} onChange={(next) => setNested('friendSettings', 'maxPendingRequests', next)} />
          <TextField label="Request title" value={readString(friendSettings.requestTitle, 'New friend request')} onChange={(next) => setNested('friendSettings', 'requestTitle', next)} />
          <TextField label="Request body" value={readString(friendSettings.requestBody, 'A player wants to add you as a friend.')} onChange={(next) => setNested('friendSettings', 'requestBody', next)} />
        </FieldGrid>
      </Panel>

      <Panel title="Gifts">
        <Toggle checked={readBool(giftSettings.enabled, true)} label="enabled" onChange={(next) => setNested('giftSettings', 'enabled', next)} />
        <FieldGrid>
          <NumberField label="Default gift coins" value={readNumber(giftSettings.defaultGiftCoins, 25)} onChange={(next) => setNested('giftSettings', 'defaultGiftCoins', next)} />
          <NumberField label="Max gift coins" value={readNumber(giftSettings.maxGiftCoins, 100)} onChange={(next) => setNested('giftSettings', 'maxGiftCoins', next)} />
          <TextField label="Sent gift title" value={readString(giftSettings.sentGiftTitle, 'Friend gift')} onChange={(next) => setNested('giftSettings', 'sentGiftTitle', next)} />
          <TextField label="Sent gift message" value={readString(giftSettings.sentGiftMessage, 'A friend sent you a gift.')} onChange={(next) => setNested('giftSettings', 'sentGiftMessage', next)} />
        </FieldGrid>
      </Panel>
    </div>
  );
}

function AdSettingsEditor({ value, onChange }: EditorProps) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5">
      <Panel title="Ad switches">
        <ToggleGrid>
          {['adsEnabled', 'bannerEnabled', 'interstitialEnabled', 'rewardedEnabled', 'testMode', 'unityGdprConsent', 'unityCcpaConsent'].map((key) => (
            <Toggle key={key} label={key} checked={readBool(value[key], key !== 'testMode')} onChange={(next) => set(key, next)} />
          ))}
        </ToggleGrid>
      </Panel>
      <Panel title="Frequency">
        <FieldGrid>
          <NumberField label="Interstitial frequency" value={readNumber(value.interstitialFrequency, 3)} onChange={(next) => set('interstitialFrequency', next)} />
          <NumberField label="Guest frequency override" value={readNumber(value.guestFrequencyOverride, 2)} onChange={(next) => set('guestFrequencyOverride', next)} />
        </FieldGrid>
      </Panel>
    </div>
  );
}

function CoinRewardsEditor({ value, onChange }: EditorProps) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5">
      <Panel title="Rewards">
        <FieldGrid>
          <TextField label="Streak rewards comma-separated" value={(Array.isArray(value.streakRewards) ? value.streakRewards : []).join(',')} onChange={(next) => set('streakRewards', next.split(',').map((entry) => readNumber(entry)).filter((entry) => entry > 0))} />
          {['dailyMissionBonusReward', 'weeklyMissionBonusReward', 'gameCompleteReward', 'multiplayerWinBonus', 'computerWinBonus', 'firstGameDailyMultiplier', 'rewardedAdCoinReward', 'extraMatchCost', 'standardRoomCoinCost', 'largeRoomCoinCost', 'standardRoomWinBonus', 'largeRoomWinBonus', 'suspiciousMinuteThreshold'].map((key) => (
            <NumberField key={key} label={key} value={readNumber(value[key])} onChange={(next) => set(key, next)} />
          ))}
        </FieldGrid>
      </Panel>
      <MissionListEditor title="Daily missions" rows={asList(value.dailyMissions)} onChange={(rows) => set('dailyMissions', rows)} />
      <MissionListEditor title="Weekly missions" rows={asList(value.weeklyMissions)} onChange={(rows) => set('weeklyMissions', rows)} />
    </div>
  );
}

function SpinnerEditor({ value, onChange }: EditorProps) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5">
      <Panel title="Spinner rules">
        <FieldGrid>
          <NumberField label="Free spin interval hours" value={readNumber(value.freeSpinIntervalHours, 24)} onChange={(next) => set('freeSpinIntervalHours', next)} />
          <Toggle label="Require rewarded ad for extra spin" checked={readBool(value.requireRewardedAdForExtraSpin, true)} onChange={(next) => set('requireRewardedAdForExtraSpin', next)} />
        </FieldGrid>
      </Panel>
      <SpinnerSegmentsEditor rows={asList(value.spinnerSegments)} onChange={(rows) => set('spinnerSegments', rows)} />
    </div>
  );
}

function CatalogEditor({ value, onChange, id }: EditorProps & { id: string }) {
  const items = asList(value.items);
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  const updateItem = (index: number, key: string, next: unknown) => set('items', items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: next } : item)));
  const addItem = () => set('items', [...items, { id: `new_${items.length + 1}`, title: 'New item', enabled: true, sortOrder: items.length + 1 }]);
  const itemKeys = id === 'achievements_config'
    ? ['id', 'title', 'category', 'triggerKey', 'targetProgress', 'rewardCoins', 'enabled', 'sortOrder']
    : ['id', 'title', 'category', 'price', 'rarity', 'enabled', 'sortOrder'];

  return (
    <div className="space-y-5">
      <Panel title="Catalog controls">
        <FieldGrid>
          <NumberField label="Version" value={readNumber(value.version, 1)} onChange={(next) => set('version', next)} />
          <TextField label="Enabled categories" value={(Array.isArray(value.enabledCategories) ? value.enabledCategories : []).join(',')} onChange={(next) => set('enabledCategories', next.split(',').map((entry) => entry.trim()).filter(Boolean))} />
          <TextField label="Category order" value={(Array.isArray(value.categoryOrder) ? value.categoryOrder : []).join(',')} onChange={(next) => set('categoryOrder', next.split(',').map((entry) => entry.trim()).filter(Boolean))} />
        </FieldGrid>
      </Panel>
      <Panel title={`Items (${items.length})`}>
        <button onClick={addItem} className="mb-3 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/15">
          <Plus size={14} /> Add Item
        </button>
        <div className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div key={`${item.id || index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{readString(item.id, `item ${index + 1}`)}</span>
                <button onClick={() => set('items', items.filter((_, itemIndex) => itemIndex !== index))} className="rounded bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"><Trash2 size={14} /></button>
              </div>
              <FieldGrid>
                {itemKeys.map((key) => key === 'enabled'
                  ? <Toggle key={key} label={key} checked={readBool(item[key], true)} onChange={(next) => updateItem(index, key, next)} />
                  : ['price', 'sortOrder', 'targetProgress', 'rewardCoins'].includes(key)
                    ? <NumberField key={key} label={key} value={readNumber(item[key])} onChange={(next) => updateItem(index, key, next)} />
                    : <TextField key={key} label={key} value={readString(item[key])} onChange={(next) => updateItem(index, key, next)} />)}
              </FieldGrid>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function KeyValueEditor({ value, onChange }: EditorProps) {
  const entries = Object.entries(value);
  return (
    <Panel title="Simple fields">
      <div className="space-y-3">
        {entries.map(([key, entry]) => (
          <TextField key={key} label={key} value={readString(entry)} onChange={(next) => onChange({ ...value, [key]: next })} />
        ))}
        <button onClick={() => onChange({ ...value, [`newKey${entries.length + 1}`]: '' })} className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/15">
          <Plus size={14} /> Add Field
        </button>
      </div>
    </Panel>
  );
}

type EditorProps = { value: ConfigMap; onChange: (next: ConfigMap) => void };

function MissionListEditor({ title, rows, onChange }: { title: string; rows: ConfigMap[]; onChange: (rows: ConfigMap[]) => void }) {
  const update = (index: number, key: string, next: unknown) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: next } : row)));
  const addMission = () => onChange([...rows, { id: `mission_${rows.length + 1}`, title: 'New mission', target: 1, reward: 10 }]);
  return (
    <Panel title={title}>
      <button onClick={addMission} className="mb-3 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/15"><Plus size={14} /> Add Mission</button>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={`${row.id || index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <FieldGrid>
              <TextField label="ID" value={readString(row.id)} onChange={(next) => update(index, 'id', next)} />
              <TextField label="Title" value={readString(row.title)} onChange={(next) => update(index, 'title', next)} />
              <NumberField label="Target" value={readNumber(row.target, 1)} onChange={(next) => update(index, 'target', next)} />
              <NumberField label="Reward" value={readNumber(row.reward, 10)} onChange={(next) => update(index, 'reward', next)} />
            </FieldGrid>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SpinnerSegmentsEditor({ rows, onChange }: { rows: ConfigMap[]; onChange: (rows: ConfigMap[]) => void }) {
  const update = (index: number, key: string, next: unknown) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: next } : row)));
  const remove = (index: number) => onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  return (
    <Panel title="Spinner wheel rewards">
      <p className="mb-3 text-xs font-semibold text-gray-500">Configure the exact wheel values used by the app. Type must be coins, solo, or quick.</p>
      <button onClick={() => onChange([...rows, { type: 'coins', amount: 10, label: '+10 COINS' }])} className="mb-3 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/15"><Plus size={14} /> Add Segment</button>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row, index) => (
          <div key={`${row.label || index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Segment {index + 1}</span>
              <button onClick={() => remove(index)} className="rounded bg-white/5 p-2 text-red-300 hover:bg-red-500/10" title="Remove segment">
                <Trash2 size={14} />
              </button>
            </div>
            <FieldGrid>
              <SelectField label="Type" value={readString(row.type, 'coins')} options={['coins', 'solo', 'quick']} onChange={(next) => update(index, 'type', next)} />
              <NumberField label="Amount" value={readNumber(row.amount, 10)} onChange={(next) => update(index, 'amount', next)} />
              <TextField label="Label" value={readString(row.label)} onChange={(next) => update(index, 'label', next)} />
            </FieldGrid>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PurchaseOptionsEditor({ options, onChange }: { options: any[]; onChange: (next: any[]) => void }) {
  const updateOption = (index: number, key: string, val: any) => {
    onChange(options.map((opt, i) => i === index ? { ...opt, [key]: val } : opt));
  };
  const updatePrice = (index: number, region: string, val: string) => {
    const opt = options[index];
    const nextPrice = { ...asRecord(opt.iapPrice), [region]: val };
    updateOption(index, 'iapPrice', nextPrice);
  };
  const addOption = () => {
    onChange([...options, { id: 'custom_pass', productId: 'uno.pass.current', label: 'UNO Pass', levelSkips: 0, iapPrice: { IN: '₹199', US: '$2.99' } }]);
  };
  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <Panel title="Purchase Options">
      <div className="space-y-3">
        {options.map((opt, index) => (
          <div key={index} className="rounded border border-white/10 bg-black/20 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-uno-blue">Option #{index + 1}</h4>
              <button onClick={() => removeOption(index)} className="text-red-400 hover:text-red-300 text-xs"><Trash2 size={14} /></button>
            </div>
            <FieldGrid>
              <TextField label="ID (e.g. pass)" value={readString(opt.id)} onChange={(val) => updateOption(index, 'id', val)} />
              <TextField label="Product ID" value={readString(opt.productId)} onChange={(val) => updateOption(index, 'productId', val)} />
              <TextField label="Label" value={readString(opt.label)} onChange={(val) => updateOption(index, 'label', val)} />
              <NumberField label="Level Skips" value={readNumber(opt.levelSkips)} onChange={(val) => updateOption(index, 'levelSkips', val)} />
              <TextField label="Price IN (e.g. ₹199)" value={readString(asRecord(opt.iapPrice).IN)} onChange={(val) => updatePrice(index, 'IN', val)} />
              <TextField label="Price US (e.g. $2.99)" value={readString(asRecord(opt.iapPrice).US)} onChange={(val) => updatePrice(index, 'US', val)} />
            </FieldGrid>
          </div>
        ))}
        <button onClick={addOption} className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/15"><Plus size={12} /> Add Option</button>
      </div>
    </Panel>
  );
}

function SeasonRewardsEditor({ rewards, onChange, totalLevels }: { rewards: any[]; onChange: (next: any[]) => void; totalLevels: number }) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  // Normalize rewards so we have exactly the count of totalLevels
  const normalizedRewards = Array.from({ length: totalLevels }, (_, i) => {
    const lvlNum = i + 1;
    const existing = rewards.find(r => readNumber(r.level) === lvlNum) || {};
    return {
      level: lvlNum,
      freeReward: asRecord(existing.freeReward || existing),
      premiumReward: asRecord(existing.premiumReward)
    };
  });

  const updateReward = (key: 'freeReward' | 'premiumReward', field: string, val: any) => {
    const nextRewards = normalizedRewards.map((r, idx) => {
      if (idx === selectedLevel - 1) {
        const rewardObj = { ...asRecord(r[key]), [field]: val };
        return { ...r, [key]: rewardObj };
      }
      return r;
    });
    onChange(nextRewards);
  };

  const initializeDefaultRewards = () => {
    const defaultRewards = Array.from({ length: totalLevels }, (_, i) => {
      const lvl = i + 1;
      return {
        level: lvl,
        freeReward: { type: 'coins', amount: 50, label: '50 Coins', assetPath: 'assets/images/store/coins.svg' },
        premiumReward: { type: 'coins', amount: 200, label: '200 Coins', assetPath: 'assets/images/store/coins.svg' }
      };
    });
    onChange(defaultRewards);
  };

  const activeRow = normalizedRewards[selectedLevel - 1] || { level: selectedLevel, freeReward: {}, premiumReward: {} };
  const free = activeRow.freeReward || {};
  const premium = activeRow.premiumReward || {};

  const rewardTypes = ['coins', 'powerUp', 'cardSkin', 'avatarFrame', 'badge', 'title', 'victoryAnimation', 'fragment'];

  return (
    <Panel title="Rewards Editor (Per-Level)">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Edit Level:</span>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))} className="rounded border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white outline-none">
              {Array.from({ length: totalLevels }, (_, i) => (
                <option key={i} value={i + 1}>Level {i + 1}</option>
              ))}
            </select>
          </div>
          <button onClick={initializeDefaultRewards} className="rounded bg-white/10 px-2 py-1.5 text-[10px] font-black uppercase hover:bg-white/15">Initialize All {totalLevels} Levels</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Free Reward Column */}
          <div className="rounded border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-green-400">Free Reward</h4>
            <SelectField label="Type" value={readString(free.type, 'coins')} options={rewardTypes} onChange={(val) => updateReward('freeReward', 'type', val)} />
            <TextField label="Item ID (e.g. fire-frame)" value={readString(free.itemId)} onChange={(val) => updateReward('freeReward', 'itemId', val)} />
            <NumberField label="Amount" value={readNumber(free.amount)} onChange={(val) => updateReward('freeReward', 'amount', val)} />
            <TextField label="Label" value={readString(free.label)} onChange={(val) => updateReward('freeReward', 'label', val)} />
            <TextField label="Asset Path" value={readString(free.assetPath)} onChange={(val) => updateReward('freeReward', 'assetPath', val)} />
          </div>

          {/* Premium Reward Column */}
          <div className="rounded border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-uno-yellow">Premium Reward</h4>
            <SelectField label="Type" value={readString(premium.type, 'coins')} options={rewardTypes} onChange={(val) => updateReward('premiumReward', 'type', val)} />
            <TextField label="Item ID (e.g. neon-glow)" value={readString(premium.itemId)} onChange={(val) => updateReward('premiumReward', 'itemId', val)} />
            <NumberField label="Amount" value={readNumber(premium.amount)} onChange={(val) => updateReward('premiumReward', 'amount', val)} />
            <TextField label="Label" value={readString(premium.label)} onChange={(val) => updateReward('premiumReward', 'label', val)} />
            <TextField label="Asset Path" value={readString(premium.assetPath)} onChange={(val) => updateReward('premiumReward', 'assetPath', val)} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SeasonMissionsEditor({ missions, onChange }: { missions: any[]; onChange: (next: any[]) => void }) {
  const updateMission = (index: number, key: string, val: any) => {
    onChange(missions.map((m, i) => i === index ? { ...m, [key]: val } : m));
  };
  const addMission = () => {
    onChange([...missions, { id: 'new_mission', title: 'New Mission', description: 'Mission description.', triggerKey: 'games_played', target: 10, xpReward: 100, sortOrder: missions.length + 1, enabled: true }]);
  };
  const removeMission = (index: number) => {
    onChange(missions.filter((_, i) => i !== index));
  };

  const triggerKeys = ['games_played', 'games_won', 'draw_four_played', 'uno_called'];

  return (
    <Panel title="Missions">
      <div className="space-y-4">
        {missions.map((m, index) => (
          <div key={index} className="rounded border border-white/10 bg-black/20 p-3 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-uno-red">Mission #{index + 1}</h4>
              <button onClick={() => removeMission(index)} className="text-red-400 hover:text-red-300 text-xs"><Trash2 size={14} /></button>
            </div>
            <FieldGrid>
              <TextField label="ID" value={readString(m.id)} onChange={(val) => updateMission(index, 'id', val)} />
              <TextField label="Title" value={readString(m.title)} onChange={(val) => updateMission(index, 'title', val)} />
              <TextField label="Description" value={readString(m.description)} onChange={(val) => updateMission(index, 'description', val)} />
              <SelectField label="Trigger Key" value={readString(m.triggerKey, 'games_played')} options={triggerKeys} onChange={(val) => updateMission(index, 'triggerKey', val)} />
              <NumberField label="Target Quantity" value={readNumber(m.target)} onChange={(val) => updateMission(index, 'target', val)} />
              <NumberField label="XP Reward" value={readNumber(m.xpReward || m.xp)} onChange={(val) => updateMission(index, 'xpReward', val)} />
              <NumberField label="Sort Order" value={readNumber(m.sortOrder)} onChange={(val) => updateMission(index, 'sortOrder', val)} />
              <Toggle label="Enabled" checked={m.enabled !== false} onChange={(val) => updateMission(index, 'enabled', val)} />
            </FieldGrid>
          </div>
        ))}
        <button onClick={addMission} className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/15"><Plus size={12} /> Add Mission</button>
      </div>
    </Panel>
  );
}

function SeasonEditor({ seasons, selectedSeason, setSelectedSeason, setSeasons, saveCurrentSeason, rewardWarnings }: {
  seasons: AdminSeason[];
  selectedSeason: number;
  setSelectedSeason: (index: number) => void;
  setSeasons: (seasons: AdminSeason[]) => void;
  saveCurrentSeason: (season: AdminSeason) => Promise<void>;
  rewardWarnings: ConfigMap[];
}) {
  const season = seasons[selectedSeason] || { seasonId: `season_${selectedSeason + 1}`, title: 'New Season', rewards: [], missions: [], purchaseOptions: [] };
  const rewards = asList(season.rewards);
  const missions = asList(season.missions);
  const purchaseOptions = asList(season.purchaseOptions);
  
  const updateSeason = (next: AdminSeason) => {
    const copy = [...seasons];
    copy[selectedSeason] = next;
    setSeasons(copy.length ? copy : [next]);
  };
  
  const set = (key: string, next: unknown) => updateSeason({ ...season, [key]: next });
  
  const addSeason = () => {
    const nextNum = seasons.length + 1;
    const defaultOptions = [
      {
        id: 'pass',
        productId: 'uno.pass.current',
        label: 'UNO Pass',
        iapPrice: { IN: '₹199', US: '$2.99' },
        levelSkips: 0
      }
    ];
    const newSeason: AdminSeason = {
      seasonId: `season_${nextNum}_custom`,
      title: `Season ${nextNum}`,
      seasonNumber: nextNum,
      isActive: false,
      theme: 'fire',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gracePeriodDays: 7,
      xpPerLevel: 100,
      totalLevels: 50,
      purchaseOptions: defaultOptions,
      rewards: Array.from({ length: 50 }, (_, i) => ({
        level: i + 1,
        freeReward: { type: 'coins', amount: 50, label: '50 Coins', assetPath: 'assets/images/store/coins.svg' },
        premiumReward: { type: 'coins', amount: 200, label: '200 Coins', assetPath: 'assets/images/store/coins.svg' }
      })),
      missions: [
        { id: `season_${nextNum}_play_25`, title: 'Play 25 games', description: 'Complete games during the season.', triggerKey: 'games_played', target: 25, xpReward: 250, sortOrder: 1, enabled: true },
        { id: `season_${nextNum}_win_10`, title: 'Win 10 games', description: 'Win games in any mode.', triggerKey: 'games_won', target: 10, xpReward: 300, sortOrder: 2, enabled: true }
      ]
    };
    setSeasons([...seasons, newSeason]);
    setSelectedSeason(seasons.length);
  };

  const formatDate = (val: unknown): string => {
    if (!val) return '';
    try {
      const d = new Date(typeof val === 'number' ? val : String(val));
      if (!Number.isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (_) {}
    return String(val);
  };

  return (
    <div className="space-y-4">
      <select value={selectedSeason} onChange={(event) => setSelectedSeason(Number(event.target.value))} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none">
        {seasons.map((entry, index) => <option key={entry.seasonId || index} value={index}>{entry.title || entry.seasonId || `Season ${index + 1}`}</option>)}
      </select>
      <button onClick={addSeason} className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/15"><Plus size={14} /> New Season</button>
      
      <FieldGrid>
        <TextField label="Season ID" value={readString(season.seasonId || season.id)} onChange={(next) => set('seasonId', next)} />
        <TextField label="Title" value={readString(season.title)} onChange={(next) => set('title', next)} />
        <NumberField label="Season Number" value={readNumber(season.seasonNumber, selectedSeason + 1)} onChange={(next) => set('seasonNumber', next)} />
        <SelectField label="Theme" value={readString(season.theme, 'fire')} options={['fire', 'ocean', 'space', 'neon', 'gold']} onChange={(next) => set('theme', next)} />
        <TextField label="Starts At (YYYY-MM-DD)" value={formatDate(season.startDate || season.startDateMs || season.startsAt)} onChange={(next) => set('startDate', next)} />
        <TextField label="Ends At (YYYY-MM-DD)" value={formatDate(season.endDate || season.endDateMs || season.endsAt)} onChange={(next) => set('endDate', next)} />
        <NumberField label="Grace Period (Days)" value={readNumber(season.gracePeriodDays, 7)} onChange={(next) => set('gracePeriodDays', next)} />
        <NumberField label="XP Per Level" value={readNumber(season.xpPerLevel, 100)} onChange={(next) => set('xpPerLevel', next)} />
        <NumberField label="Total Levels" value={readNumber(season.totalLevels, 50)} onChange={(next) => set('totalLevels', next)} />
        <Toggle label="Active" checked={readBool(season.isActive)} onChange={(next) => set('isActive', next)} />
      </FieldGrid>

      <PurchaseOptionsEditor options={purchaseOptions} onChange={(rows) => set('purchaseOptions', rows)} />

      <SeasonRewardsEditor rewards={rewards} onChange={(rows) => set('rewards', rows)} totalLevels={readNumber(season.totalLevels, 50)} />

      {rewardWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="mb-2 font-black uppercase tracking-widest">Reward replacements applied</p>
          <div className="space-y-1">
            {rewardWarnings.map((warning, index) => {
              const replacement = asRecord(warning.replacement);
              return (
                <p key={index}>
                  Level {readNumber(warning.level)} {readString(warning.track, 'free')}: {readString(warning.itemId, 'missing item')} was disabled or missing, replaced with {readNumber(replacement.amount, 100)} coins.
                </p>
              );
            })}
          </div>
        </div>
      )}

      <SeasonMissionsEditor missions={missions} onChange={(rows) => set('missions', rows)} />

      <button onClick={() => void saveCurrentSeason(season)} className="inline-flex items-center gap-2 rounded-lg bg-uno-blue px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
        <Save size={16} /> Save Season
      </button>
    </div>
  );
}

function NotificationPanel({ notification, setNotification, sendCurrentNotification }: {
  notification: { title: string; body: string; targetEmails: string; inApp: boolean; push: boolean; inAppStyle: 'popup' | 'banner' };
  setNotification: React.Dispatch<React.SetStateAction<{ title: string; body: string; targetEmails: string; inApp: boolean; push: boolean; inAppStyle: 'popup' | 'banner' }>>;
  sendCurrentNotification: () => Promise<void>;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Bell className="text-uno-yellow" /> Broadcast Notification</h2>
      <div className="space-y-3">
        <input value={notification.title} onChange={(event) => setNotification((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-uno-red/60" placeholder="Title" />
        <textarea value={notification.body} onChange={(event) => setNotification((current) => ({ ...current, body: event.target.value }))} className="min-h-28 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-uno-red/60" placeholder="Body" />
        <input value={notification.targetEmails} onChange={(event) => setNotification((current) => ({ ...current, targetEmails: event.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-uno-red/60" placeholder="Optional target emails, comma separated" />
        <div className="flex flex-wrap gap-3 text-sm font-bold text-gray-300">
          <Toggle label="In-app" checked={notification.inApp} onChange={(next) => setNotification((current) => ({ ...current, inApp: next }))} />
          <Toggle label="Push" checked={notification.push} onChange={(next) => setNotification((current) => ({ ...current, push: next }))} />
          <select value={notification.inAppStyle} onChange={(event) => setNotification((current) => ({ ...current, inAppStyle: event.target.value as 'popup' | 'banner' }))} className="rounded bg-white/5 px-3 py-2">
            <option value="popup">Popup</option>
            <option value="banner">Banner</option>
          </select>
        </div>
        <button onClick={() => void sendCurrentNotification()} className="inline-flex items-center gap-2 rounded-lg bg-uno-yellow px-4 py-3 text-xs font-black uppercase tracking-widest text-black">
          <Send size={16} /> Send Notification
        </button>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">{title}</h3>
      {children}
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function ToggleGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-uno-red/60" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (next: number) => void }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
      {label}
      <input type="number" value={value} onChange={(event) => onChange(readNumber(event.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-uno-red/60" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (next: string) => void }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-uno-red/60">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-gray-200">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export default Settings;
