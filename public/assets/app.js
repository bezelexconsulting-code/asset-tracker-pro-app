// Basic client-side app + authentication/session gating
(function(){
  const CLIENTS_KEY = 'GLOBAL_CLIENTS_KEY';
  const SELECTED_KEY = 'SELECTED_CLIENT_KEY';
  const USERS_KEY = 'VS_USERS';
  const SESSION_KEY = 'VS_SESSION';
  const ASSIGNMENTS_KEY = 'VS_ASSIGNMENTS';

  const $ = (id) => /** @type {HTMLElement|null} */(document.getElementById(id));
  const readJSON = (key, def) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); } catch { return def; } };
  const writeJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const genId = (prefix='id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  function getSupabaseCreds(){
    return { url: '', key: '' };
  }

  async function ensureSupabaseConfig(){
    const existing = getSupabaseCreds();
    if (existing.url && existing.key) return existing;
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('config fetch failed');
      const cfg = await res.json();
      const url = String(cfg.SUPABASE_URL || cfg.supabaseUrl || '').trim();
      const key = String(cfg.Supabase_anon_key || cfg.SUPABASE_ANON_KEY || '').trim();
      if (url && key){
        localStorage.setItem('SUPABASE_URL', url);
        localStorage.setItem('SUPABASE_ANON_KEY', key);
        const ind = document.getElementById('sync-indicator');
        if (ind) ind.textContent = 'Backend connected';
        return { url, key };
      }
    } catch (e){
      const ind = document.getElementById('sync-indicator');
      if (ind) ind.textContent = 'Backend config unavailable';
    }
    return { url: '', key: '' };
  }

  // Seed a demo client and user when none exist so login works out of the box
  async function ensureDemoUser(){
    try {
      const users = readJSON(USERS_KEY, []);
      const clients = readJSON(CLIENTS_KEY, []);
      if (users && users.length) return; // already have users
      const clientId = 'cli_demo';
      const userId = 'usr_demo';
      const email = 'client@example.com';
      const password = 'demo123';
      const salt = Math.random().toString(36).slice(2,10);
      const passwordHash = await hashPassword(password, salt);
      const demoClient = { id: clientId, name: 'Demo Co', createdAt: Date.now() };
      const demoUser = { id: userId, clientId, email, role: 'client', salt, passwordHash, paused: false, name: 'Demo User' };
      clients.push(demoClient);
      users.push(demoUser);
      saveClients(clients);
      writeJSON(USERS_KEY, users);
      writeJSON(SELECTED_KEY, clientId);
    } catch {}
  }

  async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(String(password) + String(salt));
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function getSession() { return readJSON(SESSION_KEY, null); }
  function setSession(sess) { writeJSON(SESSION_KEY, sess); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function getAssignments(){ return readJSON(ASSIGNMENTS_KEY, []); }
  function saveAssignments(list){ 
    writeJSON(ASSIGNMENTS_KEY, list);
  }

  async function login(email, password) {
    const users = readJSON(USERS_KEY, []);
    const u = users.find(x => (x.email || '').toLowerCase() === String(email).toLowerCase());
    if (!u) throw new Error('Invalid email or password');
    if (u.paused) throw new Error('Pay now to resume operation');
    // Block by client pause
    const clients = readJSON(CLIENTS_KEY, []);
    const c = clients.find(x => x.id === u.clientId);
    if (c && c.paused) throw new Error('Pay now to resume operation');
    const digest = await hashPassword(password, u.salt);
    if (digest !== u.passwordHash) throw new Error('Invalid email or password');
    const session = { userId: u.id, role: u.role, clientId: u.clientId, email: u.email, name: u.name || '', signedInAt: new Date().toISOString() };
    setSession(session);
    writeJSON(SELECTED_KEY, u.clientId);
    return session;
  }

  function getClients() { return readJSON(CLIENTS_KEY, []); }
  function saveClients(list) { writeJSON(CLIENTS_KEY, list); }

  // Sub-clients (customers) per selected client
  function subKey(clientId){ return `SUBCLIENTS:${clientId}`; }
  function getSubclients(clientId){ return readJSON(subKey(clientId), []); }
  function saveSubclients(clientId, list){ writeJSON(subKey(clientId), list); }
  // Persist selected customer per client (shared with technician page)
  function getSelectedSubclientId(clientId){
    try { return JSON.parse(localStorage.getItem('SELECTED_SUBCLIENT:' + clientId) || 'null'); } catch { return null; }
  }
  function setSelectedSubclientId(clientId, id){
    localStorage.setItem('SELECTED_SUBCLIENT:' + clientId, JSON.stringify(id));
  }

  function populateClientsSelect() {
    const sel = /** @type {HTMLSelectElement|null} */($('client'));
    if (!sel) return;
    const clients = getClients();
    sel.innerHTML = '';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.name || c.businessName || c.id;
      sel.appendChild(opt);
    });
    // Try restore selection
    const selectedId = readJSON(SELECTED_KEY, null);
    if (selectedId) sel.value = selectedId;
  }

  function setClientLockByRole(session) {
    const sel = /** @type {HTMLSelectElement|null} */($('client'));
    const newName = /** @type {HTMLInputElement|null} */($('new-client-name'));
    const addBtn = $('add-client-btn');
    const delBtn = $('remove-client-btn');
    const labelEl = /** @type {HTMLLabelElement|null} */(document.querySelector('label[for="client"]'));
    const clientSelectContainer = /** @type {HTMLElement|null} */(document.querySelector('.client-select'));
    if (!sel) return;
    const isAdmin = !!(session && session.role === 'admin');
    // Toggle disabled state
    sel.disabled = !isAdmin;
    if (newName) newName.disabled = !isAdmin;
    if (addBtn) { if (isAdmin) addBtn.removeAttribute('disabled'); else addBtn.setAttribute('disabled','true'); }
    if (delBtn) { if (isAdmin) delBtn.removeAttribute('disabled'); else delBtn.setAttribute('disabled','true'); }
    // Toggle label text for clarity
    if (labelEl) labelEl.textContent = isAdmin ? 'Client' : 'Customer';
    // Hide entire top client selector for non-admin
    if (clientSelectContainer) clientSelectContainer.style.display = isAdmin ? '' : 'none';
    // Hide org-level controls for non-admins
    const showAdminCtrls = isAdmin ? '' : 'none';
    if (newName) newName.style.display = showAdminCtrls;
    if (addBtn) addBtn.style.display = showAdminCtrls;
    if (delBtn) delBtn.style.display = showAdminCtrls;
  }

  function updateSessionBanner(session) {
    const info = $('session-info');
    const loginCtrls = $('login-controls');
    const loginHero = document.getElementById('login-hero');
    const curUser = $('current-user');
    const main = $('main-content') || document.querySelector('main');
    if (!main) return;

    // If this page has client login controls, only treat CLIENT role as logged in
    const isClientPage = !!loginCtrls;
    const shouldShowLoggedIn = !!session && (!isClientPage || session.role === 'client');

    if (shouldShowLoggedIn) {
      if (loginCtrls) loginCtrls.style.display = 'none';
      if (loginHero) loginHero.style.display = 'none';
      if (info) info.style.display = '';
      if (curUser) curUser.textContent = `Signed in as ${session.email} (${session.role})`;
      main.style.display = '';
    } else {
      if (loginCtrls) loginCtrls.style.display = '';
      if (loginHero) loginHero.style.display = '';
      if (info) info.style.display = 'none';
      main.style.display = 'none';
    }
  }

  function populateAssignCustomers(session){
    const sel = /** @type {HTMLSelectElement|null} */($('assign-customer'));
    if (!sel) return;
    sel.innerHTML = '';
    const subs = (session && session.clientId) ? getSubclients(session.clientId) : [];
    subs.forEach(sc => {
      const opt = document.createElement('option');
      opt.value = sc.id;
      opt.textContent = sc.name || sc.id;
      sel.appendChild(opt);
    });
    const selected = session?.clientId ? getSelectedSubclientId(session.clientId) : null;
    if (selected) sel.value = selected;
  }

  function renderClientAssignments(session){
    const tbody = document.querySelector('#assign-table tbody');
    if (!tbody) return;
    const clientId = session?.clientId || readJSON(SELECTED_KEY, null);
    const list = getAssignments().filter(a => a.clientId === clientId);
    const subs = getSubclients(clientId);
    const assets = getAssets(clientId);
    tbody.innerHTML = '';
    list.forEach(a => {
      const tr = document.createElement('tr');
      const ts = a.timestamp ? new Date(a.timestamp) : new Date();
      const custName = a.subclientId ? (subs.find(sc => sc.id === a.subclientId)?.name || a.subclientId) : '';
      const asset = assets.find(x => String(x.id || x.name) === String(a.assetId)) || {};
      const thumb = asset.photo ? `<img class="asset-thumb" src="${asset.photo}" alt="">` : `<div class="asset-thumb" style="background:#f3f4f6; display:flex; align-items:center; justify-content:center; font-size:10px; color:#777;">No Image</div>`;
      // Add data-subclient-id for filtering
      tr.setAttribute('data-subclient-id', a.subclientId || '');
      tr.innerHTML = `
        <td>${ts.toLocaleString()}</td>
        <td><div class="asset-row">${thumb}<div><div><strong>${asset.name || a.assetId || ''}</strong></div><div class="muted">${asset.location || ''} · ${asset.category || ''} · ${asset.status || ''}</div></div></div></td>
        <td>${a.assignee || ''}</td>
        <td>${custName}</td>
        <td>${a.start || ''}</td>
        <td>${a.due || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function bindAssignmentForm(session){
    const form = /** @type {HTMLFormElement|null} */($('assign-form'));
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const assetSel = /** @type {HTMLSelectElement|null} */($('assign-asset'));
      const toEl = /** @type {HTMLInputElement|null} */($('assign-to'));
      const custSel = /** @type {HTMLSelectElement|null} */($('assign-customer'));
      const startEl = /** @type {HTMLInputElement|null} */($('assign-start'));
      const dueEl = /** @type {HTMLInputElement|null} */($('assign-due'));
      const clientId = session?.clientId || readJSON(SELECTED_KEY, null);
      const item = {
        id: genId('assign'),
        clientId,
        assetId: assetSel?.value || '',
        assignee: (toEl?.value || '').trim(),
        start: startEl?.value || '',
        due: dueEl?.value || '',
        subclientId: custSel?.value || null,
        timestamp: new Date().toISOString()
      };
      const list = getAssignments();
      list.push(item);
      saveAssignments(list);
      try { insertAssignmentRemote(session, item).catch(()=>{}); } catch {}
      try { form.reset(); } catch {}
      renderClientAssignments(session);
      const msg = document.getElementById('assign-status-msg');
      if (msg) { msg.textContent = 'Assignment added.'; setTimeout(() => { msg.textContent = ''; }, 3000); }
    });
  }

  function bindClientControls(session) {
    const sel = /** @type {HTMLSelectElement|null} */($('client'));
    if (sel) sel.addEventListener('change', () => {
      if (session && session.role !== 'admin') {
        // Prevent switching for non-admin
        sel.value = session.clientId || sel.value;
        return;
      }
      writeJSON(SELECTED_KEY, sel.value);
      // refresh subclients list when admin switches client
      populateSubclientsList();
      populateAssignCustomers(session);
    });

    const addBtn = $('add-client-btn');
    if (addBtn) addBtn.addEventListener('click', () => {
      if (session && session.role !== 'admin') return;
      const input = /** @type {HTMLInputElement|null} */($('new-client-name'));
      if (!input || !input.value.trim()) return;
      const clients = getClients();
      const id = genId('cli');
      clients.push({ id, name: input.value.trim(), createdAt: Date.now() });
      saveClients(clients);
      populateClientsSelect();
      const selEl = /** @type {HTMLSelectElement|null} */($('client'));
      if (selEl) { selEl.value = id; writeJSON(SELECTED_KEY, id); }
      input.value = '';
      populateSubclientsList();
      populateAssignCustomers(session);
    });

    const delBtn = $('remove-client-btn');
    if (delBtn) delBtn.addEventListener('click', () => {
      if (session && session.role !== 'admin') return;
      const selEl = /** @type {HTMLSelectElement|null} */($('client'));
      if (!selEl || !selEl.value) return;
      const id = selEl.value;
      let clients = getClients();
      clients = clients.filter(c => c.id !== id);
      saveClients(clients);
      // Clear selected if removed
      const selected = readJSON(SELECTED_KEY, null);
      if (selected === id) localStorage.removeItem(SELECTED_KEY);
      populateClientsSelect();
      populateSubclientsList();
      populateAssignCustomers(session);
    });
  }

  // Customers management (for client users)
  function populateSubclientsList(){
    const list = $('subclient-list');
    const status = $('subclient-status');
    const sess = getSession();
    if (!list) return;
    list.innerHTML = '';
    if (!sess || !sess.clientId){ if (status) status.textContent = 'Sign in to manage customers.'; return; }
    const items = getSubclients(sess.clientId);
    if (!items.length){ if (status) status.textContent = 'No customers yet. Add one above.'; return; }
    if (status) status.textContent = '';
    items.forEach(sc => {
      const li = document.createElement('li');
      li.textContent = sc.name;
      const btn = document.createElement('button');
      btn.textContent = 'Delete';
      btn.className = 'button btn-small danger';
      btn.style.marginLeft = '8px';
      btn.addEventListener('click', () => {
        const updated = getSubclients(sess.clientId).filter(x => x.id !== sc.id);
        saveSubclients(sess.clientId, updated);
        try { deleteSubclientRemote(sess, sc.id).catch(()=>{}); } catch {}
        populateSubclientsList();
        populateAssignCustomers(sess);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function bindSubclientControls(session){
    const addBtn = $('add-subclient-btn');
    const input = /** @type {HTMLInputElement|null} */($('new-subclient-name'));
    const status = $('subclient-status');
    const card = $('subclients-card');
    if (!card) return;
    // Only show to client users
    if (!session || session.role !== 'client') { card.style.display = 'none'; return; }
    card.style.display = '';
    if (addBtn) addBtn.addEventListener('click', () => {
      const name = (input?.value || '').trim();
      if (!name){ if (status) status.textContent = 'Enter a customer name.'; return; }
      const sess = getSession();
      if (!sess || !sess.clientId){ if (status) status.textContent = 'No client selected.'; return; }
      const list = getSubclients(sess.clientId);
      const id = genId('cust');
      list.push({ id, name, createdAt: Date.now() });
      saveSubclients(sess.clientId, list);
      try {
        insertSubclientRemote(sess, { id, name }).catch(()=>{});
        try { if (window.SupabaseSync) window.SupabaseSync.pullAllFromSupabase({ reload: false }); } catch {}
      } catch {}
      if (input) input.value = '';
      if (status) status.textContent = 'Customer added.';
      setSelectedSubclientId(sess.clientId, id);
      populateSubclientsList();
      populateAssignCustomers(sess);
      populateClientCustomerSelect(sess.clientId);
    });
  }

  // Populate the new Current Customer dropdown in client page
  function populateClientCustomerSelect(clientId){
     const select = document.getElementById('client-customer');
     if (!select) return;
     const list = getSubclients(clientId);
     select.innerHTML = '';
     
     // Placeholder first option
     const placeholderOpt = document.createElement('option');
     placeholderOpt.value = '';
     placeholderOpt.textContent = 'Select customer';
     select.appendChild(placeholderOpt);
     // Unassigned option
     const unassignedOpt = document.createElement('option');
     unassignedOpt.value = 'UNASSIGNED';
     unassignedOpt.textContent = 'Unassigned';
     select.appendChild(unassignedOpt);
     // Real customers
     list.forEach(sc => {
       const opt = document.createElement('option');
       opt.value = sc.id;
       opt.textContent = sc.name;
       select.appendChild(opt);
     });
     
     const saved = getSelectedSubclientId(clientId);
     if (saved && (saved === 'UNASSIGNED' || list.find(s => s.id === saved))) {
       select.value = saved;
     } else {
       select.value = '';
     }
     
    select.addEventListener('change', () => {
      setSelectedSubclientId(clientId, select.value);
      const sess = getSession();
      if (sess) populateAssignCustomers(sess);
      filterAssetsByCurrentCustomer(clientId);
      filterAssignmentsByCurrentCustomer(clientId);
      updateCustomerDependentVisibility(clientId);
      populateMaintAssetSelect();
      // Re-render assets to apply customer filtering
    });
  }
})()
