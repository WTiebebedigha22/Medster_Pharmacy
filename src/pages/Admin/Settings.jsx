import React, { useState, useEffect } from 'react';

const API_BASE = '/api/admin';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('medster_access_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (err) { setMessage('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT', headers,
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const s = {
    title: { fontSize: '20px', fontWeight: '600', marginBottom: '24px' },
    card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' },
    sectionTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827' },
    field: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
    textarea: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', minHeight: '80px' },
    select: { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
    saveBtn: { padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
    message: { padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', background: '#ecfdf5', color: '#059669' },
    toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    toggle: { position: 'relative', display: 'inline-block', width: '48px', height: '26px' },
    toggleInput: { opacity: 0, width: 0, height: 0 },
    toggleSlider: {
      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
      background: '#e5e7eb', borderRadius: '26px', transition: '0.3s',
    },
  };

  const getSettingValue = (key, defaultValue = '') => {
    const val = settings[key];
    if (val === null || val === undefined) return defaultValue;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={s.title}>System Settings</h1>

      {message && <div style={s.message}>{message}</div>}

      <div style={s.card}>
        <h2 style={s.sectionTitle}>Maintenance Mode</h2>
        <div style={s.toggleRow}>
          <span>Enable Maintenance Mode</span>
          <label style={s.toggle}>
            <input
              type="checkbox"
              style={s.toggleInput}
              checked={settings.maintenance_mode?.enabled === true || settings.maintenance_mode?.enabled === 'true'}
              onChange={e => updateSetting('maintenance_mode', {
                enabled: e.target.checked,
                message: settings.maintenance_mode?.message || 'Site is under maintenance.',
                updated_at: new Date().toISOString(),
              })}
            />
            <span style={s.toggleSlider}></span>
          </label>
        </div>
        <div style={s.field}>
          <label style={s.label}>Maintenance Message</label>
          <input
            style={s.input}
            value={settings.maintenance_mode?.message || ''}
            onChange={e => updateSetting('maintenance_mode', {
              ...(settings.maintenance_mode || {}),
              enabled: settings.maintenance_mode?.enabled || false,
              message: e.target.value,
            })}
            placeholder="Enter maintenance message..."
          />
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.sectionTitle}>Store Information</h2>
        <div style={s.field}>
          <label style={s.label}>Store Name</label>
          <input style={s.input} value={getSettingValue('store_name', 'Medster Pharmacy')} onChange={e => updateSetting('store_name', e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Store Email</label>
          <input style={s.input} value={getSettingValue('store_email', 'info@medsterpharmacy.com')} onChange={e => updateSetting('store_email', e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Store Phone</label>
          <input style={s.input} value={getSettingValue('store_phone', '+234 800 MEDSTER')} onChange={e => updateSetting('store_phone', e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Store Address</label>
          <textarea style={s.textarea} value={getSettingValue('store_address', '123 Pharmacy Street, Lagos, Nigeria')} onChange={e => updateSetting('store_address', e.target.value)} />
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.sectionTitle}>Shipping Configuration</h2>
        <div style={s.field}>
          <label style={s.label}>Free Shipping Threshold (₦)</label>
          <input style={s.input} type="number" value={getSettingValue('free_shipping_threshold', '10000')} onChange={e => updateSetting('free_shipping_threshold', e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Standard Delivery Fee (₦)</label>
          <input style={s.input} type="number" value={getSettingValue('delivery_fee', '1500')} onChange={e => updateSetting('delivery_fee', e.target.value)} />
        </div>
      </div>

      <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default Settings;
