(() => {
  const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  async function getConfig() {
    let url = String(localStorage.getItem('SUPABASE_URL') || '').trim();
    let key = String(localStorage.getItem('SUPABASE_ANON_KEY') || '').trim();
    if (url && key) return { url, key };
    try {
      const r = await fetch('/api/config');
      if (!r.ok) return { url: '', key: '' };
      const j = await r.json();
      url = String(j.SUPABASE_URL || j.supabaseUrl || '').trim();
      key = String(j.SUPABASE_ANON_KEY || j.Supabase_anon_key || '').trim();
      if (url && key) {
        localStorage.setItem('SUPABASE_URL', url);
        localStorage.setItem('SUPABASE_ANON_KEY', key);
        const ind = document.getElementById('sync-indicator');
        if (ind) ind.textContent = 'Backend connected';
      }
      return { url, key };
    } catch {
      return { url: '', key: '' };
    }
  }
  async function ensureClient() {
    const cfg = await getConfig();
    if (!cfg.url || !cfg.key) return null;
    if (!window.supabase || !window.supabase.createClient) return null;
    const existing = window.__sbClient;
    if (existing) return existing;
    const client = window.supabase.createClient(cfg.url, cfg.key);
    window.__sbClient = client;
    return client;
  }
  function getClientId() {
    let s = readJSON('VS_SESSION', null);
    if (!s) s = readJSON('TECH_SESSION', null);
    return s && s.clientId ? s.clientId : null;
  }
  async function insertSubclientRemote(session, subclient) {
    const c = await ensureClient();
    if (!c) return;
    const clientId = session && session.clientId ? session.clientId : getClientId();
    if (!clientId) return;
    const payload = { id: subclient.id, name: subclient.name, client_id: clientId, created_at: new Date().toISOString() };
    await c.from('subclients').upsert(payload, { onConflict: 'id' });
  }
  async function deleteSubclientRemote(session, subclientId) {
    const c = await ensureClient();
    if (!c) return;
    const clientId = session && session.clientId ? session.clientId : getClientId();
    if (!clientId) return;
    await c.from('subclients').delete().eq('id', subclientId).eq('client_id', clientId);
  }
  async function insertAssignmentRemote(session, item) {
    const c = await ensureClient();
    if (!c) return;
    const clientId = session && session.clientId ? session.clientId : getClientId();
    if (!clientId) return;
    const payload = {
      id: item.id,
      client_id: clientId,
      asset_id: item.assetId || null,
      assignee: item.assignee || null,
      start: item.start || null,
      due: item.due || null,
      subclient_id: item.subclientId || null,
      timestamp: item.timestamp || new Date().toISOString()
    };
    await c.from('assignments').upsert(payload, { onConflict: 'id' });
  }
  async function pullAllFromSupabase(opts) {
    const c = await ensureClient();
    if (!c) return;
    const clientId = getClientId();
    if (!clientId) return;
    const subs = await c.from('subclients').select('*').eq('client_id', clientId).order('name', { ascending: true });
    if (subs && subs.data && Array.isArray(subs.data)) {
      const list = subs.data.map(x => ({ id: x.id, name: x.name, createdAt: x.created_at || Date.now() }));
      localStorage.setItem(`SUBCLIENTS:${clientId}`, JSON.stringify(list));
    }
  }
  window.SupabaseSync = { ensureClient, insertSubclientRemote, deleteSubclientRemote, insertAssignmentRemote, pullAllFromSupabase };
})();
