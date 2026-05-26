import { useState } from "react";
import { Button, Input, Toggle } from "../components/UI";

function Section({ title, desc, children }) {
  return (
    <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/40">
        <h3 className="text-sm font-bold text-[#111111]">{title}</h3>
        {desc && <p className="text-xs text-stone-500 mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#111111]">{label}</p>
        {desc && <p className="text-xs text-stone-500 mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage({ user }) {
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "Admin User",
    username:  user?.username  || "admin",
    email:     "admin@saveur.com",
  });
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [notifications, setNotifications] = useState({
    new_order:      true,
    status_change:  true,
    payment_alert:  true,
    daily_summary:  false,
    sound:          true,
  });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPw, setSavedPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!passwords.old || !passwords.new || !passwords.confirm) { setPwError("All fields are required."); return; }
    if (passwords.new !== passwords.confirm) { setPwError("New passwords do not match."); return; }
    if (passwords.new.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setSavingPw(true);
    await new Promise(r => setTimeout(r, 700));
    setSavingPw(false);
    setSavedPw(true);
    setPasswords({ old: "", new: "", confirm: "" });
    setTimeout(() => setSavedPw(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile */}
      <Section title="Profile Information" desc="Update your display name and account details">
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-[#0F766E] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {profile.full_name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">{profile.full_name}</p>
              <p className="text-xs text-stone-500 capitalize">{user?.role || "admin"} account</p>
              <button className="text-xs text-teal-700 font-medium mt-1 hover:underline">Change avatar</button>
            </div>
          </div>

          <Input label="Full Name" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
          <Input label="Username" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
          <Input label="Email Address" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />

          <div className="flex items-center gap-3 pt-1">
            <Button variant="primary" onClick={handleSaveProfile} loading={saving}>
              Save Profile
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Saved!
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" desc="Choose a strong password for your account">
        <div className="space-y-4">
          <Input label="Current Password" type="password" value={passwords.old}
            onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))} placeholder="Enter current password" />
          <Input label="New Password" type="password" value={passwords.new}
            onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} placeholder="Min. 6 characters" />
          <Input label="Confirm New Password" type="password" value={passwords.confirm}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />

          {pwError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs text-red-700">{pwError}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button variant="dark" onClick={handleChangePassword} loading={savingPw}>
              Update Password
            </Button>
            {savedPw && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Password updated!
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences" desc="Control which alerts you receive">
        <div>
          <ToggleRow label="New Order Alert" desc="Notify when a new order is created"
            checked={notifications.new_order} onChange={v => setNotifications(p => ({ ...p, new_order: v }))} />
          <ToggleRow label="Status Change" desc="Notify when order status changes"
            checked={notifications.status_change} onChange={v => setNotifications(p => ({ ...p, status_change: v }))} />
          <ToggleRow label="Payment Alerts" desc="Notify on payment updates and overdue orders"
            checked={notifications.payment_alert} onChange={v => setNotifications(p => ({ ...p, payment_alert: v }))} />
          <ToggleRow label="Daily Summary" desc="Receive end-of-day order summary"
            checked={notifications.daily_summary} onChange={v => setNotifications(p => ({ ...p, daily_summary: v }))} />
          <ToggleRow label="Sound Effects" desc="Play audio for new orders and alerts"
            checked={notifications.sound} onChange={v => setNotifications(p => ({ ...p, sound: v }))} />
        </div>
      </Section>

      {/* Theme */}
      <Section title="Appearance" desc="Customize the look and feel">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-stone-700 mb-3">Color Theme</p>
            <div className="flex gap-3">
              {[
                { name: "Saveur", bg: "#F5F0E6", accent: "#0F766E" },
                { name: "Midnight", bg: "#1a1a2e", accent: "#e94560" },
                { name: "Sand", bg: "#fdf6ec", accent: "#c77d20" },
              ].map(theme => (
                <button key={theme.name} className="flex flex-col items-center gap-1.5 group">
                  <div className="w-12 h-12 rounded-xl border-2 border-stone-200 group-hover:border-teal-400 transition-colors overflow-hidden shadow-sm"
                    style={{ background: theme.bg }}>
                    <div className="w-full h-5" style={{ background: theme.accent }} />
                  </div>
                  <span className="text-xs text-stone-500 font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">Additional themes coming soon</p>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Sidebar Position</p>
            <div className="flex gap-2">
              {["Left", "Right"].map(pos => (
                <button key={pos} className={`px-4 py-2 rounded-xl border text-xs font-medium transition-colors ${pos === "Left" ? "bg-[#0F766E] text-white border-[#0F766E]" : "bg-white border-stone-300 text-stone-600 hover:bg-stone-50"}`}>
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Account" desc="Manage your account access">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-red-800">Sign Out</p>
              <p className="text-xs text-red-600 mt-0.5">Sign out from this device</p>
            </div>
            <Button variant="danger" size="sm">Sign Out</Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
