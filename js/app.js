let currentMode = 'price';
let currentCategory = 'food';
let currentKanaRow = 'all';
let currentShoppingStore = 'all';
let products = [];
let shoppingItems = [];

const listEl = document.getElementById('product-list');
const emptyMsg = document.getElementById('empty-msg');
const modal = document.getElementById('edit-modal');
const form = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');
const modalIllust = document.getElementById('modal-illust');
const deleteBtn = document.getElementById('delete-btn');

const priceView = document.getElementById('price-view');
const shoppingView = document.getElementById('shopping-view');
const shoppingListEl = document.getElementById('shopping-list');
const shoppingEmptyMsg = document.getElementById('shopping-empty-msg');
const shoppingModal = document.getElementById('shopping-modal');
const shoppingForm = document.getElementById('shopping-form');
const shoppingModalTitle = document.getElementById('shopping-modal-title');
const sStoreSelect = document.getElementById('s-store-select');
const sStoreOtherLabel = document.getElementById('s-store-other-label');
const sStoreOtherInput = document.getElementById('s-store-other');
const sDeleteBtn = document.getElementById('s-delete-btn');

const CATEGORY_ICON = { food: '🍎', other: '🧴' };
const STORE_OPTIONS = ['マルショク新守恒', 'コスモス', 'ココカラ', 'ハローデイ', 'トライアル', 'サンリブ守恒', 'ヨドバシ'];
const MEDALS = ['🥇', '🥈', '🥉'];

const KANA_MAP = {
  あ: 'あ', い: 'あ', う: 'あ', え: 'あ', お: 'あ',
  か: 'か', き: 'か', く: 'か', け: 'か', こ: 'か',
  が: 'か', ぎ: 'か', ぐ: 'か', げ: 'か', ご: 'か',
  さ: 'さ', し: 'さ', す: 'さ', せ: 'さ', そ: 'さ',
  ざ: 'さ', じ: 'さ', ず: 'さ', ぜ: 'さ', ぞ: 'さ',
  た: 'た', ち: 'た', つ: 'た', て: 'た', と: 'た',
  だ: 'た', ぢ: 'た', づ: 'た', で: 'た', ど: 'た', っ: 'た',
  な: 'な', に: 'な', ぬ: 'な', ね: 'な', の: 'な',
  は: 'は', ひ: 'は', ふ: 'は', へ: 'は', ほ: 'は',
  ば: 'は', び: 'は', ぶ: 'は', べ: 'は', ぼ: 'は',
  ぱ: 'は', ぴ: 'は', ぷ: 'は', ぺ: 'は', ぽ: 'は',
  ま: 'ま', み: 'ま', む: 'ま', め: 'ま', も: 'ま',
  や: 'や', ゆ: 'や', よ: 'や', ゃ: 'や', ゅ: 'や', ょ: 'や',
  ら: 'ら', り: 'ら', る: 'ら', れ: 'ら', ろ: 'ら',
  わ: 'わ', を: 'わ', ん: 'わ', ゐ: 'わ', ゑ: 'わ',
};
const KANA_TABS = ['all', 'あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', '他'];
const KANA_LABEL = { all: 'すべて' };
KANA_TABS.forEach((r) => { if (!KANA_LABEL[r]) KANA_LABEL[r] = r; });

function kanaRowOf(kana) {
  if (!kana) return '他';
  const c = kana.trim()[0];
  return KANA_MAP[c] || '他';
}

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    render();
  });
});

document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    priceView.hidden = currentMode !== 'price';
    shoppingView.hidden = currentMode !== 'shopping';
  });
});

function buildKanaTabs() {
  const nav = document.getElementById('kana-tabs');
  nav.innerHTML = KANA_TABS.map(
    (r) => `<button class="kana-btn${r === 'all' ? ' active' : ''}" data-row="${r}">${KANA_LABEL[r]}</button>`
  ).join('');
  nav.querySelectorAll('.kana-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.kana-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentKanaRow = btn.dataset.row;
      render();
    });
  });
}

function buildPriceSlots() {
  const container = document.getElementById('price-slots');
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'price-slot';
    wrap.innerHTML = `
      <div class="price-slot-title">価格 ${i + 1}</div>
      <label>
        🏪 店舗
        <select class="slot-store">
          <option value="">選ばない</option>
          ${STORE_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('')}
          <option value="__other__">その他（入力する）</option>
        </select>
      </label>
      <label class="slot-store-other-label" hidden>
        🏪 店舗名を入力
        <input type="text" class="slot-store-other" placeholder="例：〇〇スーパー">
      </label>
      <div class="price-slot-row">
        <label>
          💴 価格（円）
          <input type="number" class="slot-price" min="0" inputmode="numeric" placeholder="例：198">
        </label>
        <label>
          📅 日付
          <input type="date" class="slot-date">
        </label>
      </div>
    `;
    container.appendChild(wrap);
  }
  container.querySelectorAll('.slot-store').forEach((sel) => {
    sel.addEventListener('change', () => {
      const otherLabel = sel.closest('.price-slot').querySelector('.slot-store-other-label');
      otherLabel.hidden = sel.value !== '__other__';
    });
  });
}

const SHOPPING_TABS = ['all', ...STORE_OPTIONS, '他'];
const SHOPPING_LABEL = { all: 'すべて', 他: 'その他' };

function buildShoppingStoreOptions() {
  const opts = STORE_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('');
  const otherOpt = sStoreSelect.querySelector('option[value="__other__"]');
  otherOpt.insertAdjacentHTML('beforebegin', opts);
}

function buildShoppingTabs() {
  const nav = document.getElementById('shopping-store-tabs');
  nav.innerHTML = SHOPPING_TABS.map(
    (s) => `<button class="kana-btn${s === 'all' ? ' active' : ''}" data-store="${s}">${SHOPPING_LABEL[s] || s}</button>`
  ).join('');
  nav.querySelectorAll('.kana-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.kana-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentShoppingStore = btn.dataset.store;
      renderShopping();
    });
  });
}

sStoreSelect.addEventListener('change', () => {
  sStoreOtherLabel.hidden = sStoreSelect.value !== '__other__';
  if (!sStoreOtherLabel.hidden) sStoreOtherInput.focus();
});

document.getElementById('s-cancel-btn').addEventListener('click', closeShoppingModal);

shoppingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const store = sStoreSelect.value === '__other__' ? sStoreOtherInput.value.trim() : sStoreSelect.value;
  if (!store) {
    sStoreOtherInput.focus();
    return;
  }
  const id = document.getElementById('s-id').value || crypto.randomUUID();
  const item = {
    id,
    name: document.getElementById('s-name').value.trim(),
    store,
    createdAt: Date.now(),
  };
  await dbPut(item, SHOPPING_STORE_NAME);
  await loadShoppingItems();
  closeShoppingModal();
});

sDeleteBtn.addEventListener('click', async () => {
  const id = document.getElementById('s-id').value;
  if (!id) return;
  if (!confirm('この買い物メモを削除しますか？')) return;
  await dbDelete(id, SHOPPING_STORE_NAME);
  await loadShoppingItems();
  closeShoppingModal();
});

function openShoppingModal(item) {
  shoppingForm.reset();
  sStoreOtherLabel.hidden = true;
  sStoreOtherInput.value = '';
  if (item) {
    shoppingModalTitle.textContent = '買うものを編集';
    document.getElementById('s-id').value = item.id;
    document.getElementById('s-name').value = item.name;
    if (STORE_OPTIONS.includes(item.store)) {
      sStoreSelect.value = item.store;
    } else {
      sStoreSelect.value = '__other__';
      sStoreOtherLabel.hidden = false;
      sStoreOtherInput.value = item.store;
    }
    sDeleteBtn.hidden = false;
  } else {
    shoppingModalTitle.textContent = '買うものを追加';
    document.getElementById('s-id').value = '';
    sStoreSelect.value = currentShoppingStore !== 'all' && currentShoppingStore !== '他' ? currentShoppingStore : '';
    sDeleteBtn.hidden = true;
  }
  shoppingModal.hidden = false;
}

function closeShoppingModal() {
  shoppingModal.hidden = true;
}

async function toggleBought(item) {
  await dbDelete(item.id, SHOPPING_STORE_NAME);
  await loadShoppingItems();
}

function renderShopping() {
  const items = shoppingItems
    .filter((it) => {
      if (currentShoppingStore === 'all') return true;
      if (currentShoppingStore === '他') return !STORE_OPTIONS.includes(it.store);
      return it.store === currentShoppingStore;
    })
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  shoppingListEl.innerHTML = '';
  shoppingEmptyMsg.hidden = items.length > 0;

  items.forEach((it) => {
    const li = document.createElement('li');
    li.className = 'shopping-item';
    li.innerHTML = `
      <label class="shopping-check">
        <input type="checkbox" class="shopping-checkbox">
        <span class="checkmark"></span>
      </label>
      <span class="shopping-name"></span>
      <span class="shopping-store-tag"></span>
    `;
    li.querySelector('.shopping-name').textContent = it.name;
    li.querySelector('.shopping-store-tag').textContent = it.store;
    li.querySelector('.shopping-checkbox').addEventListener('change', () => toggleBought(it));
    li.querySelector('.shopping-name').addEventListener('click', () => openShoppingModal(it));
    shoppingListEl.appendChild(li);
  });
}

async function loadShoppingItems() {
  shoppingItems = await dbGetAll(SHOPPING_STORE_NAME);
  renderShopping();
}

document.getElementById('add-btn').addEventListener('click', () => {
  if (currentMode === 'shopping') openShoppingModal();
  else openModal();
});
document.getElementById('cancel-btn').addEventListener('click', closeModal);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const slots = document.querySelectorAll('.price-slot');
  const entries = [];
  for (const slot of slots) {
    const sel = slot.querySelector('.slot-store');
    const otherInput = slot.querySelector('.slot-store-other');
    const priceInput = slot.querySelector('.slot-price');
    const dateInput = slot.querySelector('.slot-date');
    const store = sel.value === '__other__' ? otherInput.value.trim() : sel.value;
    const priceStr = priceInput.value;

    if (!store && !priceStr) continue;
    if (!store || !priceStr) {
      alert('価格を入力した欄には店舗も選んでね（店舗だけ選んだ場合は価格も入力してね）');
      return;
    }
    entries.push({
      store,
      price: Number(priceStr),
      date: dateInput.value || new Date().toISOString().slice(0, 10),
    });
  }

  if (entries.length === 0) {
    alert('少なくとも1つは価格を入力してね');
    return;
  }
  entries.sort((a, b) => a.price - b.price);

  const id = document.getElementById('f-id').value || crypto.randomUUID();
  const product = {
    id,
    category: document.getElementById('f-category').value,
    name: document.getElementById('f-name').value.trim(),
    kana: document.getElementById('f-kana').value.trim(),
    entries,
  };
  await dbPut(product);
  await loadProducts();
  closeModal();
});

deleteBtn.addEventListener('click', async () => {
  const id = document.getElementById('f-id').value;
  if (!id) return;
  if (!confirm('この商品を削除しますか？')) return;
  await dbDelete(id);
  await loadProducts();
  closeModal();
});

function openModal(product) {
  form.reset();
  document.querySelectorAll('.slot-store-other-label').forEach((l) => { l.hidden = true; });
  document.querySelectorAll('.slot-store-other').forEach((i) => { i.value = ''; });
  const today = new Date().toISOString().slice(0, 10);
  const slots = document.querySelectorAll('.price-slot');

  if (product) {
    modalTitle.textContent = '商品を編集';
    modalIllust.textContent = '✏️';
    document.getElementById('f-id').value = product.id;
    document.getElementById('f-category').value = product.category;
    document.getElementById('f-name').value = product.name;
    document.getElementById('f-kana').value = product.kana || '';

    (product.entries || []).forEach((entry, i) => {
      const slot = slots[i];
      if (!slot) return;
      const sel = slot.querySelector('.slot-store');
      const otherLabel = slot.querySelector('.slot-store-other-label');
      const otherInput = slot.querySelector('.slot-store-other');
      const priceInput = slot.querySelector('.slot-price');
      const dateInput = slot.querySelector('.slot-date');
      if (STORE_OPTIONS.includes(entry.store)) {
        sel.value = entry.store;
      } else {
        sel.value = '__other__';
        otherLabel.hidden = false;
        otherInput.value = entry.store;
      }
      priceInput.value = entry.price;
      dateInput.value = entry.date || today;
    });
    deleteBtn.hidden = false;
  } else {
    modalTitle.textContent = '商品を追加';
    modalIllust.textContent = CATEGORY_ICON[currentCategory];
    document.getElementById('f-id').value = '';
    document.getElementById('f-category').value = currentCategory;
    slots.forEach((slot) => {
      slot.querySelector('.slot-store').value = '';
      slot.querySelector('.slot-date').value = today;
    });
    deleteBtn.hidden = true;
  }
  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function render() {
  const items = products
    .filter((p) => p.category === currentCategory)
    .filter((p) => currentKanaRow === 'all' || kanaRowOf(p.kana) === currentKanaRow)
    .sort((a, b) => (a.kana || a.name).localeCompare(b.kana || b.name, 'ja'));

  listEl.innerHTML = '';
  emptyMsg.hidden = items.length > 0;

  items.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'product-item';
    const priceRows = (p.entries || []).map((entry, i) => `
      <div class="price-row">
        <span class="medal">${MEDALS[i] || '・'}</span>
        <span class="price-store">${escapeHtml(entry.store)}</span>
        <span class="price-date">${formatDate(entry.date)}</span>
        <span class="price-yen">¥${entry.price.toLocaleString()}</span>
      </div>
    `).join('');
    li.innerHTML = `
      <div class="product-top">
        <span class="product-icon">${CATEGORY_ICON[p.category]}</span>
        <span class="product-name">${escapeHtml(p.name)}</span>
      </div>
      <div class="price-list">${priceRows}</div>
    `;
    li.addEventListener('click', () => openModal(p));
    listEl.appendChild(li);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}`;
}

async function loadProducts() {
  products = await dbGetAll();
  render();
}

buildKanaTabs();
buildPriceSlots();
buildShoppingStoreOptions();
buildShoppingTabs();
loadProducts();
loadShoppingItems();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
