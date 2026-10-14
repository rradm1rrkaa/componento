// Shared utilities and local profile data. This demo does not create accounts
// or collect passwords: all customer data stays in this browser.
(function () {
  'use strict';

  const PREFIX = 'componento_';
  const storage = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(PREFIX + key);
        return value === null ? fallback : JSON.parse(value);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (_) {
        return false;
      }
    },
    remove(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (_) { /* storage may be blocked */ }
    }
  };

  const h = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  };
  const fmt = value => new Intl.NumberFormat('ru-RU').format(Number(value) || 0).replace(/\u00a0/g, ' ') + ' ₸';
  const favKey = () => 'favorites';
  const validList = (value, max = 200) => Array.isArray(value) ? value.slice(0, max) : [];

  // Preserve portable guest data from the earlier demo schema while removing
  // its unused local account records and password hashes.
  if ((Number(storage.get('storage_version', 1)) || 1) < 2) {
    const favorites = validList(storage.get('favorites', []));
    const session = storage.get('session', null);
    const users = storage.get('users', {});
    const legacyUser = session && users && typeof users === 'object' ? users[session] : null;
    if (session) {
      const oldFavorites = validList(storage.get('fav_' + session, []));
      storage.set('favorites', [...new Set([...favorites, ...oldFavorites])]);
    }
    const oldOrders = validList(storage.get('guest_orders', []));
    const userOrders = validList(legacyUser && legacyUser.orders, 50);
    if (oldOrders.length || userOrders.length) {
      const currentOrders = validList(storage.get('orders', []), 50);
      const ids = new Set(currentOrders.map(order => order && order.id));
      storage.set('orders', [...currentOrders, ...userOrders, ...oldOrders].filter(order => order && !ids.has(order.id)).slice(0, 50));
    }
    ['users', 'session', 'guest_orders'].forEach(key => storage.remove(key));
    storage.set('storage_version', 2);
  }

  function profileView(container) {
    const city = storage.get('city', 'Астана');
    const theme = storage.get('theme', 'light') === 'dark' ? 'Тёмная' : 'Светлая';
    const recent = validList(storage.get('recently_viewed', []), 8);
    const favoriteIds = validList(storage.get(favKey(), []));
    const orders = validList(storage.get('orders', []), 30);
    const savedBuilds = validList(storage.get('saved_builds', []), 30);
    const reviews = storage.get('reviews', {});
    const myReviews = Object.values(reviews && typeof reviews === 'object' ? reviews : {}).flat().filter(item => item && item.local === true);

    container.replaceChildren(
      h('h2', null, 'Ваш профиль'),
      h('p', 'muted', 'Локальный профиль этого браузера. Данные не синхронизируются между устройствами.'),
      h('div', 'profile-grid')
    );
    const grid = container.lastElementChild;
    const summary = [
      ['Город', city], ['Тема', theme], ['Избранное', String(favoriteIds.length)],
      ['Недавно просмотрено', String(recent.length)], ['Сохранённые сборки', String(savedBuilds.length)],
      ['Демо-заказы', String(orders.length)], ['Ваши отзывы', String(myReviews.length)]
    ];
    summary.forEach(([label, value]) => {
      const tile = h('div', 'profile-stat');
      tile.append(h('span', 'muted', label), h('strong', null, value));
      grid.append(tile);
    });

    const sections = [
      ['Недавно просмотренные товары', recent.map(id => (window.COMPONENTO_CATALOG || []).find(item => item.id === id)).filter(Boolean).map(item => item.name)],
      ['Последние демо-заказы', orders.slice(0, 5).map(order => `${order.id} · ${new Date(order.date).toLocaleDateString('ru-RU')} · ${fmt(order.total)}`)],
      ['Сохранённые сборки', savedBuilds.map(build => `${build.name || 'Сборка'} · ${fmt((window.CMPAT && window.CMPAT.total(build.ids || {})) || 0)}`)]
    ];
    sections.forEach(([title, lines]) => {
      container.append(h('h3', null, title));
      if (!lines.length) container.append(h('p', 'muted', 'Пока здесь пусто.'));
      lines.forEach(line => container.append(h('p', 'profile-line', line)));
    });

    const actions = h('div', 'profile-actions');
    const cityButton = h('button', 'btn ghost', 'Изменить город');
    cityButton.onclick = () => window.CMP.openCity && window.CMP.openCity(true);
    const tourButton = h('button', 'btn ghost', 'Пройти обучение повторно');
    tourButton.onclick = () => window.CMP.startTour && window.CMP.startTour(true);
    const resetButton = h('button', 'btn danger', 'Сбросить демо-данные');
    resetButton.onclick = () => {
      if (!window.confirm('Будут удалены локальные избранные товары, сравнение, корзина, отзывы, город, настройки, сборки, история и демо-заказы. Продолжить?')) return;
      const keys = ['cart', 'favorites', 'comparison', 'reviews', 'city', 'theme', 'onboarding', 'saved_builds', 'recently_viewed', 'orders', 'search_history', 'consultant'];
      keys.forEach(key => storage.remove(key));
      window.location.reload();
    };
    actions.append(cityButton, tourButton, resetButton);
    container.append(actions, h('p', 'muted', 'Заказы, отзывы, корзина и настройки существуют только в этом браузере. Здесь нет настоящей регистрации, оплаты или серверной обработки.'));
  }

  function openProfile() {
    const body = document.getElementById('mBody');
    const modal = document.getElementById('modal');
    if (!body || !modal) return;
    profileView(body);
    modal.hidden = false;
    const close = document.getElementById('mClose');
    if (close) close.focus();
  }

  function addOrder(order) {
    const orders = validList(storage.get('orders', []), 50);
    orders.unshift(Object.assign({ demo: true }, order));
    storage.set('orders', orders.slice(0, 50));
  }

  window.CMP = Object.assign(window.CMP || {}, {
    ls: storage, h, fmt, favKey, user: () => null, openProfile, addOrder,
    profileView,
    toast(message) {
      const node = document.getElementById('toast');
      if (!node) return;
      node.textContent = message;
      node.classList.add('show');
      clearTimeout(window.CMP.toastTimer);
      window.CMP.toastTimer = setTimeout(() => node.classList.remove('show'), 2400);
    }
  });
})();
