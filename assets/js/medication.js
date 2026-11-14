const STORAGE_KEY = 'hjk-medication-list';
const TYPES = ['醫師處方藥', '藥局買的藥', '保健食品', '中藥／草本'];

const form = document.querySelector('#med-form');
const list = document.querySelector('#med-list');
const empty = document.querySelector('#med-empty');
const allergy = document.querySelector('#allergy');
const status = document.querySelector('#med-status');
const count = document.querySelector('#med-count');

let state = { items: [], allergy: '' };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.items)) state = { items: saved.items, allergy: saved.allergy || '' };
  } catch { /* 無法讀取時從空白清單開始 */ }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* 私密瀏覽等情況只在本次使用 */ }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function render() {
  allergy.value = state.allergy;
  empty.hidden = state.items.length > 0;
  count.textContent = state.items.length ? `共 ${state.items.length} 項` : '';
  list.innerHTML = state.items.map((item, index) => `
    <li class="med-item">
      <div>
        <span class="badge">${escapeHtml(TYPES[item.type] || TYPES[0])}</span>
        <strong>${escapeHtml(item.name)}</strong>
        ${item.usage ? `<p><span>用法</span>${escapeHtml(item.usage)}</p>` : ''}
        ${item.purpose ? `<p><span>用途</span>${escapeHtml(item.purpose)}</p>` : ''}
      </div>
      <button class="text-button med-remove" type="button" data-index="${index}" aria-label="刪除 ${escapeHtml(item.name)}">刪除</button>
    </li>`).join('');
  list.querySelectorAll('.med-remove').forEach((button) => button.addEventListener('click', () => {
    state.items.splice(Number(button.dataset.index), 1);
    save();
    render();
    status.textContent = '已刪除一項。';
  }));
}

function listText() {
  const lines = state.items.map((item, index) => {
    const parts = [`${index + 1}. ${item.name}（${TYPES[item.type] || TYPES[0]}）`];
    if (item.usage) parts.push(`   用法：${item.usage}`);
    if (item.purpose) parts.push(`   用途：${item.purpose}`);
    return parts.join('\n');
  }).join('\n');
  return `禾佳康藥局｜我的用藥清單\n\n${lines || '（尚未填寫）'}\n\n過敏或曾有不良反應：${state.allergy.trim() || '無／未填寫'}\n\n想請藥師幫我確認：是否有重複成分、需要錯開時間或需要注意的搭配。`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  if (!name) {
    status.textContent = '請先填寫藥品或保健食品名稱。';
    form.querySelector('#med-name').focus();
    return;
  }
  state.items.push({
    name,
    type: Number(data.get('type')) || 0,
    usage: String(data.get('usage') || '').trim(),
    purpose: String(data.get('purpose') || '').trim()
  });
  save();
  render();
  form.reset();
  form.querySelector('#med-name').focus();
  status.textContent = `已加入「${name}」。`;
});

allergy.addEventListener('input', () => {
  state.allergy = allergy.value;
  save();
});

async function copyList() {
  if (!state.items.length) {
    status.textContent = '清單還是空的，請先加入至少一項。';
    return false;
  }
  try {
    await navigator.clipboard.writeText(listText());
    status.textContent = '已複製用藥清單。';
    return true;
  } catch {
    status.textContent = '瀏覽器無法自動複製，請改用「列印／存成 PDF」。';
    return false;
  }
}

document.querySelector('#med-copy').addEventListener('click', copyList);
document.querySelector('#med-line').addEventListener('click', async () => {
  if (!(await copyList())) return;
  status.textContent = '已複製用藥清單，正在開啟 LINE；可直接貼上請藥師確認。';
  window.open('https://lin.ee/Olm3eqO', '_blank', 'noopener');
});
document.querySelector('#med-print').addEventListener('click', () => {
  document.querySelector('#print-date').textContent = new Date().toLocaleDateString('zh-TW');
  window.print();
});
document.querySelector('#med-clear').addEventListener('click', () => {
  if (!state.items.length && !state.allergy) return;
  if (!window.confirm('確定要清除整份清單嗎？清除後無法復原。')) return;
  state = { items: [], allergy: '' };
  save();
  render();
  status.textContent = '已清除清單。';
});

load();
render();
