let parsedData = [];
let headers = [];

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadCard = document.getElementById('uploadCard');
const configCard = document.getElementById('configCard');
const previewCard = document.getElementById('previewCard');
const exportBtn = document.getElementById('exportBtn');

// Drag & drop events
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); });
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (raw.length < 2) { setStatus('الملف فارغ أو لا يحتوي بيانات كافية', 'error'); return; }

      headers = raw[0].map(h => String(h).trim()).filter(Boolean);
      parsedData = raw.slice(1)
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i] !== undefined ? String(row[i]).trim() : '');
          return obj;
        })
        .filter(r => Object.values(r).some(v => v !== ''));

      // Show file info
      document.getElementById('fileInfo').style.display = 'flex';
      document.getElementById('fileName').textContent = file.name;
      document.getElementById('fileRows').textContent = `${parsedData.length} صف`;

      populateSelects();
      configCard.classList.remove('disabled');
      configCard.classList.add('active');
      updateAll();
    } catch (err) {
      setStatus('خطأ في قراءة الملف: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function populateSelects() {
  const typeCol = document.getElementById('typeCol');
  const idCol = document.getElementById('idCol');
  typeCol.innerHTML = '';
  idCol.innerHTML = '';
  headers.forEach(h => {
    typeCol.innerHTML += `<option value="${h}">${h}</option>`;
    idCol.innerHTML += `<option value="${h}">${h}</option>`;
  });
  if (headers.length > 1) idCol.value = headers[1];
  typeCol.disabled = false;
  idCol.disabled = false;
  typeCol.addEventListener('change', updateAll);
  idCol.addEventListener('change', updateAll);
}

function getUniqueTypes() {
  const tc = document.getElementById('typeCol').value;
  return [...new Set(parsedData.map(r => r[tc]).filter(v => v && v.trim()))];
}

function updateAll() {
  const types = getUniqueTypes();

  // Update type tags
  const tp = document.getElementById('typesPreview');
  tp.innerHTML = types.map(t => `<span class="type-tag">${t}</span>`).join('');

  // Build preview of restructured output
  renderPreviewTable(types);

  previewCard.classList.remove('disabled');
  previewCard.classList.add('active');
  exportBtn.disabled = false;
}

function renderPreviewTable(types) {
  const tc = document.getElementById('typeCol').value;
  const ic = document.getElementById('idCol').value;
  const grouped = buildGrouped(types, tc, ic);
  const maxRows = Math.min(5, Math.max(...types.map(t => grouped[t].length)));

  let html = '<table><thead><tr>';
  types.forEach(t => { html += `<th>${t}</th>`; });
  html += '</tr></thead><tbody>';
  for (let i = 0; i < maxRows; i++) {
    html += '<tr>';
    types.forEach(t => { html += `<td>${grouped[t][i] || '—'}</td>`; });
    html += '</tr>';
  }
  if (Math.max(...types.map(t => grouped[t].length)) > 5) {
    html += `<tr><td colspan="${types.length}" style="text-align:center;color:var(--muted2);font-size:0.7rem;padding:8px">... المزيد من الصفوف</td></tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('tableWrap').innerHTML = html;
}

function buildGrouped(types, tc, ic) {
  const grouped = {};
  types.forEach(t => grouped[t] = []);
  parsedData.forEach(row => {
    const type = row[tc];
    if (type && grouped[type] !== undefined) grouped[type].push(row[ic]);
  });
  return grouped;
}

function processData() {
  const tc = document.getElementById('typeCol').value;
  const ic = document.getElementById('idCol').value;
  const types = getUniqueTypes();
  const grouped = buildGrouped(types, tc, ic);
  const maxRows = Math.max(...types.map(t => grouped[t].length));

  const outData = [];
  for (let i = 0; i < maxRows; i++) {
    const row = {};
    types.forEach(t => { row[t] = grouped[t][i] || ''; });
    outData.push(row);
  }

  const ws = XLSX.utils.json_to_sheet(outData, { header: types });

  // Style header row width
  const colWidths = types.map(t => ({ wch: Math.max(t.length, 12) }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Restructured');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'restructured_output.xlsx';
  a.click();
  URL.revokeObjectURL(url);

  setStatus(`✓ تم تحميل الملف — ${types.length} عمود`, 'success');
}

function setStatus(msg, type = '') {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className = 'status-msg ' + type;
}
