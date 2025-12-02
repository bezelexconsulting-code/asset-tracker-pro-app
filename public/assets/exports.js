(function(){
  function download(name, content, mime = 'text/html') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function getClientContext() {
    let sess = null;
    try { sess = JSON.parse(localStorage.getItem('VS_SESSION')||'null'); } catch {}
    if (!sess) { try { sess = JSON.parse(localStorage.getItem('TECH_SESSION')||'null'); } catch {} }
    let clientId = sess && sess.clientId ? sess.clientId : null;
    if (!clientId) { try { clientId = JSON.parse(localStorage.getItem('SELECTED_CLIENT_KEY')||'null'); } catch {} }
    let clientName = 'Client';
    let brandLogoUrl = '';
    let brandColors = { primary: '#4B9CE2', secondary: '#6c757d' };
    try {
      const clients = JSON.parse(localStorage.getItem('GLOBAL_CLIENTS_KEY')||localStorage.getItem('clients')||'[]');
      const found = (Array.isArray(clients) ? clients : []).find(c => String(c.id) === String(clientId));
      if (found && found.name) clientName = found.name;
      if (found && found.brand) {
        brandLogoUrl = found.brand.logoUrl || '';
        const p = found.brand.primaryColor || found.brand.primary;
        const s = found.brand.secondaryColor || found.brand.secondary;
        if (p || s) brandColors = { primary: p || brandColors.primary, secondary: s || brandColors.secondary };
      }
    } catch {}
    return { clientId, clientName, brandLogoUrl, brandColors };
  }
  function getAssets() {
    if (typeof window.getAssets === 'function') return window.getAssets();
    const { clientId } = getClientContext();
    try {
      if (clientId) return JSON.parse(localStorage.getItem('assets:'+clientId)||'[]');
      return JSON.parse(localStorage.getItem('assets')||'[]');
    } catch { return []; }
  }
  function getMaintLogs() {
    if (typeof window.getMaintLogs === 'function') return window.getMaintLogs();
    const { clientId } = getClientContext();
    try {
      const ns = clientId ? JSON.parse(localStorage.getItem('maint:'+clientId)||'[]') : [];
      const plain = JSON.parse(localStorage.getItem('maintenance_logs')||'[]');
      return [...ns, ...plain];
    } catch { return []; }
  }
  function getAssignments() {
    if (typeof window.getAssignments === 'function') return window.getAssignments();
    const { clientId } = getClientContext();
    try {
      const ns = clientId ? JSON.parse(localStorage.getItem('assign:'+clientId)||'[]') : [];
      const plain = JSON.parse(localStorage.getItem('VS_ASSIGNMENTS')||'[]');
      return [...ns, ...plain].filter(a => !clientId || a.clientId === clientId);
    } catch { return []; }
  }
  function htmlHeader(title){ return `<html><head><meta charset="UTF-8"><title>${title}</title></head><body>`; }
  function htmlFooter(){ return `</body></html>`; }
  function exportAssetsExcel(){
    const assets = getAssets();
    const header = ['Asset Name','Category','Condition','Location','Delivered At','Maintained At','Status'];
    const rows = assets.map(a => [a.name||'', a.category||'', a.condition||a.status||'', a.location||'', a.createdAt ? new Date(a.createdAt).toLocaleString() : '', a.updatedAt ? new Date(a.updatedAt).toLocaleString() : '', a.status||'']);
    const { clientName, brandLogoUrl, brandColors } = getClientContext();
    fetch('/api/excel-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'assets', title: 'Assets', brand: clientName, brandLogoUrl, brandColors, header, rows, widths: [24,16,14,18,22,22,12] }) })
      .then(async r => { const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'assets.xlsx'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); })
      .catch(() => {});
  }
  function exportMaintenanceExcel(){
    const logs = getMaintLogs();
    const header = ['Asset Name','Description','Condition','Location','Maintained At','Status','Next Due'];
    const rows = logs.map(m => [m.assetName||m.assetId||'', m.desc||'', m.status||'', m.location||'', new Date(m.timestamp || m.time || Date.now()).toLocaleString(), m.status||'', m.next||m.next_due||'']);
    const { clientName, brandLogoUrl, brandColors } = getClientContext();
    fetch('/api/excel-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'maintenance', title: 'Maintenance Logs', brand: clientName, brandLogoUrl, brandColors, header, rows, widths: [24,26,14,18,22,12,16] }) })
      .then(async r => { const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'maintenance.xlsx'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); })
      .catch(() => {});
  }
  function exportAssignmentsExcel(){
    const list = getAssignments();
    const header = ['Asset','Assignee','Customer','Location','Delivered At','Due'];
    const rows = list.map(a => [a.assetName||a.assetId||'', a.assignee||'', a.customerName||a.subclientId||a.customerId||'', a.location||'', a.start ? new Date(a.start).toLocaleString() : '', a.due ? new Date(a.due).toLocaleString() : '']);
    const { clientName, brandLogoUrl, brandColors } = getClientContext();
    fetch('/api/excel-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'assignments', title: 'Assignments', brand: clientName, brandLogoUrl, brandColors, header, rows, widths: [24,18,22,18,22,22] }) })
      .then(async r => { const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'assignments.xlsx'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); })
      .catch(() => {});
  }
  function exportAssetsDocument(){
    const { clientName } = getClientContext();
    const assets = getAssets();
    const w = window.open('', '_blank');
    w.document.write(htmlHeader('Assets Document'));
    w.document.write('<div style="position:fixed;top:8px;right:8px;z-index:9999;"><button onclick="window.print()" style="padding:6px 10px;">Print</button></div>');
    w.document.write(`<h1>${clientName}</h1>`);
    assets.forEach(a => {
      w.document.write('<hr/>');
      w.document.write(`<h2>${a.name||'Asset'}</h2>`);
      if (a.photo) w.document.write(`<div><img src="${a.photo}" alt="photo" style="max-width:300px;border:1px solid #ccc;border-radius:8px;"/></div>`);
      w.document.write('<table border="1" cellspacing="0" cellpadding="6">');
      w.document.write(`<tr><th>Customer</th><td>${a.customerName||a.subclientId||a.customerId||''}</td></tr>`);
      w.document.write(`<tr><th>Category</th><td>${a.category||''}</td></tr>`);
      w.document.write(`<tr><th>Condition</th><td>${a.condition||a.status||''}</td></tr>`);
      w.document.write(`<tr><th>Location</th><td>${a.location||''}</td></tr>`);
      const delivered = a.createdAt ? new Date(a.createdAt).toLocaleString() : '';
      const maintained = a.updatedAt ? new Date(a.updatedAt).toLocaleString() : '';
      w.document.write(`<tr><th>Delivered At</th><td>${delivered}</td></tr>`);
      w.document.write(`<tr><th>Maintained At</th><td>${maintained}</td></tr>`);
      w.document.write(`<tr><th>Status</th><td>${a.status||''}</td></tr>`);
      w.document.write('</table>');
    });
    w.document.write(htmlFooter());
    w.document.close(); w.focus();
  }
  window.exportAssetsExcel = exportAssetsExcel;
  window.exportMaintenanceExcel = exportMaintenanceExcel;
  window.exportAssignmentsExcel = exportAssignmentsExcel;
  window.exportAssetsDocument = exportAssetsDocument;
})();
