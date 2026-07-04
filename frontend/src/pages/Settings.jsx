import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  Globe,
  Lock,
  User,
  ChevronRight,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Reusable section wrapper ────────────────────────────────────────────────
const SettingsSection = ({ icon: Icon, title, description, children }) => (
  <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {description && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      </div>
    </div>
    <div className="divide-y divide-white/5">{children}</div>
  </div>
);

// ─── Row inside a section ─────────────────────────────────────────────────────
const SettingsRow = ({ label, description, children, onClick }) => (
  <div
    className={`flex items-center justify-between px-6 py-4 gap-4 ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className="min-w-0">
      <span className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {description && <span className="text-[11px] leading-relaxed block mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</span>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ enabled, onChange }) => (
  <button
    role="switch"
    aria-checked={enabled}
    onClick={() => onChange(!enabled)}
    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
      enabled ? 'bg-purple-600' : 'bg-slate-700'
    }`}
    style={{ width: 40, height: 22 }}
  >
    <span
      className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
      style={{ transform: enabled ? 'translateX(18px)' : 'translateX(0)' }}
    />
  </button>
);

// ─── Theme pill button ────────────────────────────────────────────────────────
const ThemePill = ({ mode, label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
      active
        ? 'border-purple-500 bg-purple-500/15 text-purple-400 shadow-lg shadow-purple-500/10'
        : 'border-white/10 bg-white/5 hover:border-purple-500/30 hover:text-white'
    }`}
    style={{ color: active ? undefined : 'var(--text-secondary)' }}
    aria-pressed={active}
  >
    <Icon className="w-5 h-5" />
    {label}
    {active && <Check className="w-3 h-3 text-purple-400" />}
  </button>
);

// ─── Main Settings Page ───────────────────────────────────────────────────────
export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [notifPrefs, setNotifPrefs] = useState({
    guardianAlerts: true,
    sosAlerts: true,
    systemUpdates: false,
    emailDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    shareLocation: true,
    allowAnalytics: false,
    publicProfile: false,
  });

  const handleNotifToggle = (key) => {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
    toast.success('Notification preference updated.');
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));
    toast.success('Privacy setting updated.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your theme, notifications, privacy, and account preferences.</p>
      </div>

      {/* 1. Theme */}
      <SettingsSection icon={Sun} title="Appearance" description="Choose how SafeHer AI looks for you.">
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            <ThemePill mode="dark"   label="Dark"   icon={Moon}    active={theme === 'dark'}   onClick={() => setTheme('dark')} />
            <ThemePill mode="light"  label="Light"  icon={Sun}     active={theme === 'light'}  onClick={() => setTheme('light')} />
            <ThemePill mode="system" label="System" icon={Monitor} active={theme === 'system'} onClick={() => setTheme('system')} />
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
            "System" automatically follows your device's OS preference. Theme is saved across sessions.
          </p>
        </div>
      </SettingsSection>

      {/* 2. Notifications */}
      <SettingsSection icon={Bell} title="Notification Preferences" description="Control which alerts you receive.">
        <SettingsRow
          label="Guardian Alerts"
          description="Receive notifications when a guardian request is sent or accepted."
        >
          <Toggle enabled={notifPrefs.guardianAlerts} onChange={() => handleNotifToggle('guardianAlerts')} />
        </SettingsRow>
        <SettingsRow
          label="SOS Alerts"
          description="Receive emergency SOS broadcasts from your wards (Guardian mode)."
        >
          <Toggle enabled={notifPrefs.sosAlerts} onChange={() => handleNotifToggle('sosAlerts')} />
        </SettingsRow>
        <SettingsRow
          label="System Updates"
          description="Product updates, announcements, and new feature releases."
        >
          <Toggle enabled={notifPrefs.systemUpdates} onChange={() => handleNotifToggle('systemUpdates')} />
        </SettingsRow>
        <SettingsRow
          label="Email Digest"
          description="Weekly summary of your safety reports and guardian activity."
        >
          <Toggle enabled={notifPrefs.emailDigest} onChange={() => handleNotifToggle('emailDigest')} />
        </SettingsRow>
      </SettingsSection>

      {/* 3. Privacy */}
      <SettingsSection icon={Lock} title="Privacy & Security" description="Control your data and visibility.">
        <SettingsRow
          label="Share Location with Guardians"
          description="Guardians can see your approximate location during active SOS events."
        >
          <Toggle enabled={privacy.shareLocation} onChange={() => handlePrivacyToggle('shareLocation')} />
        </SettingsRow>
        <SettingsRow
          label="Allow Anonymous Analytics"
          description="Help improve SafeHer AI by sharing anonymous usage data."
        >
          <Toggle enabled={privacy.allowAnalytics} onChange={() => handlePrivacyToggle('allowAnalytics')} />
        </SettingsRow>
        <SettingsRow
          label="Public Community Profile"
          description="Allow your incident reports to show your display name on the community map."
        >
          <Toggle enabled={privacy.publicProfile} onChange={() => handlePrivacyToggle('publicProfile')} />
        </SettingsRow>
      </SettingsSection>

      {/* 4. Language (Future Ready) */}
      <SettingsSection icon={Globe} title="Language & Region" description="Language support is coming soon.">
        <SettingsRow
          label="Display Language"
          description="Currently only English is supported. More languages coming soon."
        >
          <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-white/10 font-medium" style={{ color: 'var(--text-secondary)' }}>
            English (en)
          </span>
        </SettingsRow>
      </SettingsSection>

      {/* 5. Account */}
      <SettingsSection icon={User} title="Account Information" description="Your linked account details.">
        <SettingsRow label="Email Address" description="Used for login and emergency notifications.">
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>
        </SettingsRow>
        <SettingsRow label="Account ID" description="Your unique SafeHer user identifier.">
          <code className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 border border-white/10 max-w-[120px] truncate block" style={{ color: 'var(--text-secondary)' }}>
            {user?.id}
          </code>
        </SettingsRow>
        <SettingsRow
          label="Manage Profile"
          description="Update name, phone, avatar, and guardian role."
          onClick={() => window.location.href = '/profile'}
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </SettingsRow>
      </SettingsSection>

      <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
        SafeHer AI v1.0 · All settings are saved locally unless otherwise noted.
      </p>
    </div>
  );
};

export default Settings;
