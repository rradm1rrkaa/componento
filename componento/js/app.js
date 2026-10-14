// Shared storefront, catalog, product details and cart interactions.
(function () {
  'use strict';

  const C = window.CMP;
  const CAT = Array.isArray(window.COMPONENTO_CATALOG) ? window.COMPONENTO_CATALOG : [];
  const $ = selector => document.querySelector(selector);
  const byId = id => CAT.find(product => product.id === id);
  const validIds = value => Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && byId(id)))].slice(0, 200) : [];
  const state = {
    cart: C.ls.get('cart', {}), favorites: validIds(C.ls.get(C.favKey(), [])),
    query: '', page: 1, pageSize: 24, filters: {}, currentProduct: null
  };
  if (!state.cart || typeof state.cart !== 'object' || Array.isArray(state.cart)) state.cart = {};
  Object.keys(state.cart).forEach(id => {
    const quantity = Number(state.cart[id]);
    if (!byId(id) || !Number.isInteger(quantity) || quantity < 1) delete state.cart[id];
    else state.cart[id] = Math.min(quantity, 99);
  });
  C.ls.set('cart', state.cart);
  C.ls.set(C.favKey(), state.favorites);

  const h = C.h;
  const text = (node, value) => { if (node) node.textContent = value; };
  const PERIPHERAL_CATEGORIES = ['Мониторы', 'Клавиатуры', 'Мыши', 'Коврики', 'Гарнитуры', 'Наушники', 'Микрофоны', 'Веб-камеры', 'Колонки', 'Геймпады', 'Игровые кресла', 'Игровые столы', 'Маршрутизаторы'];
  const allCategories = () => [...new Set([...CAT.map(product => product.cat), 'Периферия'])].sort((a, b) => a.localeCompare(b, 'ru'));
  const matchesCategory = (product, selected) => !selected || (selected === 'Периферия' ? PERIPHERAL_CATEGORIES.includes(product.cat) : product.cat === selected);
  const getReviewCount = id => {
    const reviews = C.ls.get('reviews', {});
    return Array.isArray(reviews && reviews[id]) ? reviews[id].length : 0;
  };
  const countCart = () => Object.values(state.cart).reduce((sum, value) => sum + value, 0);

  function productVisual(product, decorative = false) {
    const visual = h('div', 'product-visual visual-' + categorySlug(product.cat));
    if (product.image) {
      visual.classList.add('has-photo');
      const photo = h('img', 'product-photo');
      photo.src = product.image;
      photo.alt = decorative ? '' : product.name;
      photo.loading = 'lazy';
      photo.decoding = 'async';
      photo.addEventListener('error', () => {
        visual.classList.remove('has-photo');
        photo.remove();
      }, { once: true });
      visual.append(photo);
    }
    visual.append(h('span', 'product-icon', product.icon || '▦'));
    visual.append(h('span', 'visual-label', product.cat));
    return visual;
  }

  function syncHeader() {
    text($('#favCount'), String(state.favorites.length));
    text($('#cartCount'), String(countCart()));
    const city = C.ls.get('city', null);
    text($('#cityBtn'), 'Доставка: ' + (typeof city === 'string' && city.trim() ? city : 'Астана') + ' · изменить');
    const compareCount = $('#compareCount');
    const comparison = C.ls.get('comparison', []);
    if (compareCount) compareCount.textContent = String(Array.isArray(comparison) ? comparison.length : 0);
    const favoriteLabel = $('#favBtn');
    if (favoriteLabel) favoriteLabel.setAttribute('aria-label', `Избранное: ${state.favorites.length}`);
  }

  function productCard(product, compact = false) {
    const card = h('article', 'card' + (compact ? ' card-compact' : ''));
    card.dataset.productId = product.id;
    const image = productVisual(product, true);
    image.setAttribute('aria-hidden', 'true');
    const meta = h('div', 'brand', `${product.brand} · ${product.cat}`);
    const name = h('button', 'product-title', product.name);
    name.type = 'button'; name.onclick = () => openProduct(product.id);
    const specs = firstSpecs(product);
    const short = h('p', 'card-specs', specs);
    const price = h('div', 'price', C.fmt(product.price));
    const rating = h('div', 'card-rating', C.ratingText ? C.ratingText(product.id) : 'Нет локальных отзывов');
    const badge = h('span', 'demo-badge', 'Демо-цена');
    const actions = h('div', 'card-actions');
    const details = h('button', 'btn ghost', 'Подробнее');
    details.type = 'button'; details.onclick = () => openProduct(product.id);
    const add = h('button', 'btn', 'В корзину');
    add.type = 'button'; add.onclick = () => addCart(product.id);
    const favorite = h('button', 'icon icon-action' + (state.favorites.includes(product.id) ? ' selected' : ''), state.favorites.includes(product.id) ? '♥' : '♡');
    favorite.type = 'button'; favorite.setAttribute('aria-label', state.favorites.includes(product.id) ? 'Убрать из избранного' : 'Добавить в избранное');
    favorite.onclick = () => toggleFavorite(product.id);
    const compare = h('button', 'icon icon-action', '⇄');
    compare.type = 'button'; compare.setAttribute('aria-label', 'Добавить к сравнению'); compare.onclick = () => C.toggleCmp && C.toggleCmp(product.id);
    actions.append(details, add, favorite, compare);
    card.append(image, meta, name, short, rating, price, badge, actions);
    return card;
  }

  function categorySlug(value) {
    return String(value || '').toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '');
  }

  function firstSpecs(product) {
    const rows = Object.values(product.specs || {}).flatMap(group => Object.entries(group || {}));
    return rows.slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(' · ') || 'Демонстрационная позиция';
  }

  function toggleFavorite(id) {
    state.favorites = state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id];
    C.ls.set(C.favKey(), state.favorites);
    syncHeader();
    if ($('#grid')) renderCatalog();
    if ($('#homePopular')) renderHomeCards();
    C.toast(state.favorites.includes(id) ? 'Добавлено в избранное' : 'Удалено из избранного');
  }

  function addCart(id, quantity = 1) {
    if (!byId(id)) return;
    state.cart[id] = Math.min(99, (state.cart[id] || 0) + Math.max(1, Number(quantity) || 1));
    C.ls.set('cart', state.cart);
    syncHeader();
    C.toast('Товар добавлен в корзину');
    if ($('#cart') && !$('#cart').hidden) drawCart();
  }

  function setQuantity(id, delta) {
    state.cart[id] = (state.cart[id] || 0) + delta;
    if (state.cart[id] <= 0) delete state.cart[id];
    C.ls.set('cart', state.cart);
    syncHeader();
    drawCart();
  }

  function openModal() {
    const modal = $('#modal');
    if (modal) modal.hidden = false;
    const close = $('#mClose');
    if (close) close.focus();
  }

  function closeModal() {
    const modal = $('#modal');
    if (modal) modal.hidden = true;
    state.currentProduct = null;
  }

  function openProduct(id) {
    const product = byId(id);
    if (!product) return;
    state.currentProduct = product.id;
    const recent = validIds(C.ls.get('recently_viewed', []));
    C.ls.set('recently_viewed', [product.id, ...recent.filter(item => item !== product.id)].slice(0, 12));
    const body = $('#mBody');
    body.replaceChildren();

    const header = h('div', 'product-detail-head');
    const image = productVisual(product);
    image.classList.add('detail-visual');
    const intro = h('div');
    intro.append(h('p', 'brand', `${product.brand} · ${product.cat}`), h('h2', null, product.name),
      h('p', 'muted', `${product.model || 'Демонстрационная модель'}${product.article ? ' · Артикул ' + product.article : ''}`));
    if (product.imageSource) {
      const photoSource = h('a', 'photo-source', 'Источник фото');
      photoSource.href = product.imageSource; photoSource.target = '_blank'; photoSource.rel = 'noopener noreferrer';
      intro.append(photoSource);
    }
    intro.append(
      h('div', 'price', C.fmt(product.price)), h('p', 'muted', 'Демо-цена в тенге. Наличие и условия покупки здесь не подключены.'));
    const actions = h('div', 'detail-actions');
    const add = h('button', 'btn', 'Добавить в корзину'); add.onclick = () => addCart(product.id);
    const favorite = h('button', 'btn ghost', state.favorites.includes(product.id) ? 'Убрать из избранного' : 'В избранное');
    favorite.onclick = () => { toggleFavorite(product.id); favorite.textContent = state.favorites.includes(product.id) ? 'Убрать из избранного' : 'В избранное'; };
    const compare = h('button', 'btn ghost', 'Сравнить'); compare.onclick = () => C.toggleCmp && C.toggleCmp(product.id);
    actions.append(add, favorite, compare); intro.append(actions); header.append(image, intro);

    const tabs = h('div', 'detail-tabs');
    const content = h('div', 'detail-content');
    const tabNames = ['Описание', 'Характеристики', 'Отзывы'];
    if (window.COMPONENTO_COMPAT && window.COMPONENTO_COMPAT[product.id]) tabNames.push('Совместимость');
    const showTab = tab => {
      content.replaceChildren();
      tabs.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
      if (tab === 'Описание') {
        content.append(h('p', null, product.description || `Демонстрационная карточка категории «${product.cat}». Технические данные и цена указаны для прототипа.`));
        content.append(h('p', 'muted', 'Отзывы, рейтинг и остатки реальных магазинов не заявляются. Цена условная.'));
        if (product.sourceUrl) {
          const source = h('a', 'text-button', 'Открыть спецификации производителя ↗');
          source.href = product.sourceUrl; source.target = '_blank'; source.rel = 'noopener noreferrer'; content.append(source);
        }
        const alternatives = CAT.filter(item => item.id !== product.id && item.cat === product.cat).slice(0, 4);
        if (alternatives.length) {
          content.append(h('h3', null, 'Похожие товары'));
          const list = h('div', 'recommendation-list');
          alternatives.forEach(item => {
            const line = h('button', 'recommendation-item');
            line.append(h('span', null, item.name), h('strong', null, C.fmt(item.price)));
            line.onclick = () => openProduct(item.id); list.append(line);
          }); content.append(list);
        }
      }
      if (tab === 'Характеристики') content.append(specificationTable(product));
      if (tab === 'Отзывы') content.append(C.reviewsBlock ? C.reviewsBlock(product) : h('p', 'muted', 'Отзывы недоступны.'));
      if (tab === 'Совместимость') {
        const compatibility = window.COMPONENTO_COMPAT[product.id];
        content.append(h('p', 'muted', 'Проверка использует только явно заданные демонстрационные параметры. Для полной проверки конфигурации откройте консультанта.'));
        const open = h('button', 'btn', 'Проверить в консультанте');
        open.onclick = () => { const parts = {}; parts[compatibility.kind] = product.id; C.openConsultant && C.openConsultant(parts); };
        content.append(open);
      }
    };
    tabNames.forEach((name, index) => {
      const button = h('button', 'tab-button' + (index === 0 ? ' active' : ''), name);
      button.type = 'button'; button.dataset.tab = name; button.onclick = () => showTab(name); tabs.append(button);
    });
    body.append(header, tabs, content);
    showTab(tabNames[0]);
    openModal();
  }

  function specificationTable(product) {
    const wrapper = h('div', 'specification-groups');
    Object.entries(product.specs || {}).forEach(([groupName, rows]) => {
      const section = h('section', 'spec-group');
      section.append(h('h3', null, groupName));
      const table = h('dl', 'spec-list');
      Object.entries(rows || {}).forEach(([key, value]) => {
        table.append(h('dt', null, key), h('dd', null, String(value)));
      });
      section.append(table); wrapper.append(section);
    });
    return wrapper;
  }

  function drawCart() {
    const drawer = $('#cart');
    if (!drawer) return;
    drawer.hidden = false;
    drawer.replaceChildren();
    const top = h('div', 'drawer-head'); top.append(h('h2', null, 'Корзина'));
    const close = h('button', 'icon', '✕'); close.setAttribute('aria-label', 'Закрыть корзину'); close.onclick = () => { drawer.hidden = true; };
    top.append(close); drawer.append(top);
    const entries = Object.entries(state.cart).map(([id, qty]) => ({ product: byId(id), qty })).filter(item => item.product);
    if (!entries.length) {
      drawer.append(h('div', 'empty-state'));
      const empty = drawer.lastElementChild; empty.append(h('span', 'empty-icon', '🛒'), h('h3', null, 'Корзина пока пуста'), h('p', 'muted', 'Добавьте комплектующие из каталога или подберите сборку.'), h('a', 'btn', 'Открыть каталог'));
      empty.lastElementChild.href = 'shop.html'; return;
    }
    let total = 0;
    entries.forEach(({ product, qty }) => {
      total += product.price * qty;
      const row = h('article', 'cart-item');
      row.append(h('div', 'cart-item-icon', product.icon || '▦'));
      const info = h('div', 'cart-item-info'); info.append(h('strong', null, product.name), h('span', 'muted', `${C.fmt(product.price)} за шт.`), h('strong', null, C.fmt(product.price * qty)));
      const controls = h('div', 'quantity-controls');
      const minus = h('button', 'qty-button', '−'); minus.setAttribute('aria-label', 'Уменьшить количество'); minus.onclick = () => setQuantity(product.id, -1);
      controls.append(minus, h('span', null, String(qty)));
      const plus = h('button', 'qty-button', '+'); plus.setAttribute('aria-label', 'Увеличить количество'); plus.onclick = () => setQuantity(product.id, 1);
      controls.append(plus);
      const remove = h('button', 'text-button', 'Удалить'); remove.onclick = () => { delete state.cart[product.id]; C.ls.set('cart', state.cart); syncHeader(); drawCart(); C.toast('Товар удалён из корзины'); };
      info.append(controls, remove); row.append(info); drawer.append(row);
    });
    const totalBox = h('div', 'cart-total');
    totalBox.append(h('div', 'muted', `Товаров: ${countCart()}`), h('div', null, 'Итого'), h('strong', null, C.fmt(total)),
      h('p', 'muted', `Демо-информация: условия получения для города ${C.ls.get('city', 'Астана')} задаются владельцем проекта.`));
    const checkout = h('a', 'btn checkout-link', 'Оформить демо-заказ'); checkout.href = 'pay.html';
    const clear = h('button', 'btn ghost clear-cart', 'Очистить корзину'); clear.onclick = () => { state.cart = {}; C.ls.set('cart', state.cart); syncHeader(); drawCart(); C.toast('Корзина очищена'); };
    totalBox.append(checkout, clear); drawer.append(totalBox);
  }

  function populateSelect(selector, values, firstLabel) {
    const select = $(selector); if (!select) return;
    const current = select.value;
    select.replaceChildren(new Option(firstLabel, ''), ...[...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'ru')).map(value => new Option(value, value)));
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }

  const FILTER_FIELDS = {
    'Процессоры': ['Сокет', 'Число ядер'], 'Материнские платы': ['Сокет', 'Чипсет', 'Форм-фактор', 'Тип памяти'],
    'Видеокарты': ['Модель GPU', 'Объём VRAM, ГБ', 'Тип памяти'], 'Оперативная память': ['Тип', 'Объём комплекта, ГБ', 'Частота, МТ/с'],
    SSD: ['Интерфейс', 'Форм-фактор'], 'Мониторы': ['Диагональ, дюймы', 'Разрешение', 'Частота обновления, Гц'],
    'Клавиатуры': ['Тип', 'Формат', 'Переключатели'], 'Мыши': ['Тип', 'Максимальное разрешение, DPI'],
    'Жёсткие диски': ['Интерфейс', 'Форм-фактор'], 'Гарнитуры': ['Подключение'], 'Микрофоны': ['Интерфейс']
  };

  function updateSpecialFilters() {
    const box = $('#specFilters'); if (!box) return;
    box.replaceChildren();
    const category = $('#fCat') && $('#fCat').value;
    (FILTER_FIELDS[category] || []).forEach(key => {
      const values = CAT.filter(item => matchesCategory(item, category)).map(item => Object.values(item.specs || {}).flatMap(group => Object.entries(group || {})).find(([name]) => name === key)?.[1]).filter(value => value !== undefined && value !== null);
      const unique = [...new Set(values.map(String))];
      if (!unique.length || unique.length > 40) return;
      const label = h('label', 'filter-label', key);
      const select = document.createElement('select'); select.dataset.specKey = key; select.append(new Option('Любое значение', ''));
      unique.sort((a, b) => a.localeCompare(b, 'ru', { numeric: true })).forEach(value => select.append(new Option(value, value)));
      select.value = state.filters[key] || '';
      select.onchange = () => { state.filters[key] = select.value; state.page = 1; renderCatalog(); };
      label.append(select); box.append(label);
    });
  }

  function getSpecValue(product, key) {
    for (const group of Object.values(product.specs || {})) if (Object.prototype.hasOwnProperty.call(group || {}, key)) return String(group[key]);
    return '';
  }

  function filteredProducts() {
    const category = $('#fCat')?.value || '';
    const brand = $('#fBrand')?.value || '';
    const min = Math.max(0, Number($('#fMin')?.value) || 0);
    const maxValue = Number($('#fMax')?.value);
    const max = maxValue > 0 ? maxValue : Infinity;
    const query = state.query.trim().toLocaleLowerCase('ru');
    const onlyFavorites = Boolean($('#fFav')?.checked);
    const minRating = Number($('#fRating')?.value) || 0;
    let list = CAT.filter(product => {
      const corpus = `${product.name} ${product.brand} ${product.model || ''} ${product.article || ''} ${JSON.stringify(product.specs || {})}`.toLocaleLowerCase('ru');
      return matchesCategory(product, category) && (!brand || product.brand === brand) && product.price >= min && product.price <= max &&
        (!onlyFavorites || state.favorites.includes(product.id)) && (!query || corpus.includes(query)) &&
        (!minRating || reviewAverage(product.id) >= minRating) &&
        Object.entries(state.filters).every(([key, value]) => !value || getSpecValue(product, key) === value);
    });
    const sort = $('#fSort')?.value || 'name';
    if (sort === 'asc') list.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, 'ru'));
    else if (sort === 'desc') list.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, 'ru'));
    else if (sort === 'rating') list.sort((a, b) => reviewAverage(b.id) - reviewAverage(a.id));
    else if (sort === 'reviews') list.sort((a, b) => getReviewCount(b.id) - getReviewCount(a.id));
    else list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return list;
  }

  function reviewAverage(id) {
    const allReviews = C.ls.get('reviews', {});
    const reviews = allReviews && typeof allReviews === 'object' && Array.isArray(allReviews[id]) ? allReviews[id] : [];
    return reviews.length ? reviews.reduce((sum, review) => sum + (Number(review.r) || 0), 0) / reviews.length : 0;
  }

  function renderActiveFilters() {
    const box = $('#activeFilters'); if (!box) return;
    box.replaceChildren();
    const specs = Object.entries(state.filters).filter(([, value]) => value);
    const pairs = [
      ['Категория', '#fCat'], ['Бренд', '#fBrand'], ['Цена от', '#fMin'], ['Цена до', '#fMax']
    ].map(([label, selector]) => [label, $(selector)?.value || '', () => { $(selector).value = ''; }]).filter(([, value]) => value);
    if ($('#fRating')?.value) pairs.push(['Рейтинг', `от ${$('#fRating').value} ★`, () => { $('#fRating').value = '0'; }]);
    if ($('#fFav')?.checked) pairs.push(['Избранное', 'только избранное', () => { $('#fFav').checked = false; }]);
    specs.forEach(([key, value]) => pairs.push([key, value, () => { delete state.filters[key]; }]));
    pairs.forEach(([label, value, remove]) => {
      const chip = h('button', 'filter-chip', `${label}: ${value} ×`); chip.onclick = () => { remove(); state.page = 1; updateSpecialFilters(); renderCatalog(); }; box.append(chip);
    });
  }

  function renderCatalog() {
    const grid = $('#grid'); if (!grid) return;
    const list = filteredProducts();
    const pageCount = Math.max(1, Math.ceil(list.length / state.pageSize));
    state.page = Math.min(state.page, pageCount);
    const visible = list.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    grid.replaceChildren(...visible.map(product => productCard(product)));
    text($('#found'), `Найдено товаров: ${list.length}`);
    renderActiveFilters(); renderPagination(pageCount);
    const empty = $('#emptyResults');
    if (empty) empty.hidden = Boolean(list.length);
  }

  function renderPagination(pageCount) {
    const box = $('#pagination'); if (!box) return;
    box.replaceChildren();
    if (pageCount <= 1) return;
    const prev = h('button', 'btn ghost', 'Назад'); prev.disabled = state.page <= 1; prev.onclick = () => { state.page--; renderCatalog(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const label = h('span', 'pagination-label', `Страница ${state.page} из ${pageCount}`);
    const next = h('button', 'btn ghost', 'Показать ещё'); next.disabled = state.page >= pageCount; next.onclick = () => { state.page++; renderCatalog(); window.scrollTo({ top: $('#grid').offsetTop - 100, behavior: 'smooth' }); };
    box.append(prev, label, next);
  }

  function initCatalog() {
    if (!$('#grid')) return;
    populateSelect('#fCat', allCategories(), 'Все категории');
    populateSelect('#fBrand', CAT.map(product => product.brand), 'Все бренды');
    ['#fCat', '#fBrand', '#fSort', '#fMin', '#fMax', '#fFav', '#fRating'].forEach(selector => {
      const element = $(selector); if (!element) return;
      element.addEventListener('input', () => { state.page = 1; if (selector === '#fCat') { state.filters = {}; updateSpecialFilters(); } renderCatalog(); });
      element.addEventListener('change', () => { state.page = 1; if (selector === '#fCat') { state.filters = {}; updateSpecialFilters(); } renderCatalog(); });
    });
    const search = $('#search');
    const suggestions = $('#searchSuggestions');
    const searchHistory = C.ls.get('search_history', []);
    if (suggestions) {
      suggestions.replaceChildren();
      [...new Set([...CAT.slice(0, 12).map(product => product.name), ...(Array.isArray(searchHistory) ? searchHistory : [])])].slice(0, 20).forEach(value => suggestions.append(new Option(value, value)));
    }
    let debounce;
    if (search) search.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { state.query = search.value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('ru'); state.page = 1; renderCatalog(); }, 160);
    });
    if (search) search.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      const value = search.value.trim(); if (!value) return;
      const history = C.ls.get('search_history', []);
      C.ls.set('search_history', [value, ...(Array.isArray(history) ? history.filter(item => item !== value) : [])].slice(0, 8));
      if (suggestions) { suggestions.replaceChildren(); C.ls.get('search_history', []).forEach(item => suggestions.append(new Option(item, item))); }
    });
    const reset = $('#reset'); if (reset) reset.onclick = () => {
      ['#fCat', '#fBrand', '#fMin', '#fMax', '#fRating'].forEach(selector => { if ($(selector)) $(selector).value = ''; });
      if ($('#fFav')) $('#fFav').checked = false;
      if (search) search.value = '';
      state.query = ''; state.filters = {}; state.page = 1; updateSpecialFilters(); renderCatalog();
    };
    const emptyReset = $('#emptyReset'); if (emptyReset && reset) emptyReset.onclick = () => reset.click();
    const mobileFilters = $('#mobileFiltersBtn');
    if (mobileFilters) mobileFilters.onclick = () => {
      const panel = $('#filters'); const open = !panel.classList.contains('open');
      panel.classList.toggle('open', open); mobileFilters.setAttribute('aria-expanded', String(open));
    };
    updateSpecialFilters(); renderCatalog();
  }

  function renderHomeCards() {
    const boxes = [$('#homePopular'), $('#homeRecommended')].filter(Boolean);
    const ordered = CAT.slice().sort((a, b) => a.price - b.price);
    if (boxes[0]) {
      const featureIds = ['cpu-5600x', 'gpu-4060', 'mb-b650', 'monitor-lg-27gn800'];
      const featured = featureIds.map(byId).filter(Boolean);
      boxes[0].replaceChildren(...(featured.length ? featured : ordered.slice(0, 4)).map(product => productCard(product, true)));
    }
    if (boxes[1]) {
      const viewed = validIds(C.ls.get('recently_viewed', [])).map(byId).filter(Boolean);
      boxes[1].replaceChildren(...viewed.map(product => productCard(product, true)));
      const section = boxes[1].closest('section'); if (section) section.hidden = viewed.length === 0;
    }
  }

  function updateCityLabel(city) {
    C.ls.set('city', city); syncHeader();
  }

  function bindShared() {
    const theme = C.ls.get('theme', 'light') === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    const themeButton = $('#themeBtn');
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
      themeButton.onclick = () => {
        document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        C.ls.set('theme', document.documentElement.dataset.theme);
        themeButton.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
      };
    }
    const cartButton = $('#cartBtn'); if (cartButton) cartButton.onclick = drawCart;
    const profileButton = $('#profBtn'); if (profileButton) profileButton.onclick = C.openProfile;
    const cityButton = $('#cityBtn'); if (cityButton) cityButton.onclick = () => C.openCity && C.openCity(true);
    const cityFooter = $('#cityFooter'); if (cityFooter) cityFooter.onclick = () => C.openCity && C.openCity(true);
    const favoritesButton = $('#favBtn'); if (favoritesButton) favoritesButton.onclick = () => {
      if ($('#fFav')) { $('#fFav').checked = !$('#fFav').checked; renderCatalog(); }
      else if ($('#homePopular')) { window.location.href = 'shop.html?favorites=1'; }
    };
    const close = $('#mClose'); if (close) close.onclick = closeModal;
    const modal = $('#modal'); if (modal) {
      modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
      modal.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const focusable = [...modal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(element => !element.hidden);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      const modalBody = $('#mBody');
      if (modalBody && window.MutationObserver) new MutationObserver(() => {
        const heading = modalBody.querySelector('h2');
        if (heading) { heading.id = 'mBodyTitle'; modal.querySelector('[role="dialog"]')?.setAttribute('aria-labelledby', 'mBodyTitle'); }
      }).observe(modalBody, { childList: true, subtree: true });
    }
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); const drawer = $('#cart'); if (drawer) drawer.hidden = true; const filters = $('#filters'); if (filters) filters.classList.remove('open'); if ($('#mobileFiltersBtn')) $('#mobileFiltersBtn').setAttribute('aria-expanded', 'false'); } });
    const startTour = $('#startTour'); if (startTour) startTour.onclick = () => C.startTour && C.startTour(true);
    const footerTour = $('#startTourFooter'); if (footerTour) footerTour.onclick = () => C.startTour && C.startTour(true);
    const mobileMenu = $('#mobileMenuBtn');
    if (mobileMenu) mobileMenu.onclick = () => {
      const nav = $('#mainNav'); const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open); mobileMenu.setAttribute('aria-expanded', String(open));
    };
    const nav = $('#mainNav'); if (nav) nav.addEventListener('click', event => {
      const link = event.target.closest('[data-category]'); if (!link) return;
      event.preventDefault(); window.location.href = `shop.html?category=${encodeURIComponent(link.dataset.category)}`;
    });
    syncHeader();
  }

  function init() {
    const storedCity = C.ls.get('city', null);
    if (storedCity && (typeof storedCity !== 'string' || (C.cities && !C.cities.includes(storedCity)))) C.ls.set('city', null);
    bindShared(); initCatalog(); renderHomeCards();
    const params = new URLSearchParams(location.search);
    if ($('#search') && params.has('q')) { $('#search').value = params.get('q'); state.query = params.get('q').replace(/\s+/g, ' ').trim().toLocaleLowerCase('ru'); renderCatalog(); }
    if ($('#fCat') && params.has('category')) { $('#fCat').value = params.get('category'); updateSpecialFilters(); renderCatalog(); }
    if ($('#fFav') && params.get('favorites') === '1') { $('#fFav').checked = true; renderCatalog(); }
    if (!C.ls.get('city', null) && C.openCity) setTimeout(() => C.openCity(false), 0);
    else if (C.ls.get('city', null) && C.maybeOnboard) setTimeout(C.maybeOnboard, 120);
  }

  Object.assign(C, {
    addCart, toggleFavorite, openProduct, drawCart, renderCatalog, render: renderCatalog, productCard,
    updateCityLabel, getCart: () => Object.assign({}, state.cart),
    setCart(next) { state.cart = next && typeof next === 'object' ? next : {}; C.ls.set('cart', state.cart); syncHeader(); },
    syncHeader, fmt: C.fmt
  });
  C.diagnostics = () => ({
    catalogCount: CAT.length,
    unknownFavoriteIds: validIds(C.ls.get(C.favKey(), [])).filter(id => !byId(id)).length,
    filteredCount: filteredProducts().length,
    cartTotal: Object.entries(state.cart).reduce((sum, [id, quantity]) => sum + (byId(id)?.price || 0) * quantity, 0),
    compatibility: window.CMPAT ? window.CMPAT.selfTest() : []
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
