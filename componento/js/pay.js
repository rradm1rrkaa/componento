// Local-only demonstration checkout. No payment card details are collected.
(function () {
  'use strict';
  const C = window.CMP;
  const $ = selector => document.querySelector(selector);
  const catalog = window.COMPONENTO_CATALOG || [];
  const get = key => C.ls.get(key, null);
  const cart = get('cart') && typeof get('cart') === 'object' ? get('cart') : {};
  const items = Object.entries(cart).map(([id, qty]) => ({ product: catalog.find(item => item.id === id), qty: Number(qty) })).filter(item => item.product && item.qty > 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const city = get('city') || 'Астана';
  const money = C.fmt;
  const make = (tag, cls, value) => { const node = document.createElement(tag); if (cls) node.className = cls; if (value != null) node.textContent = value; return node; };

  document.documentElement.dataset.theme = get('theme') === 'dark' ? 'dark' : 'light';
  $('#cityBtn').textContent = `Город: ${city}`;
  $('#cityBtn').onclick = () => { window.location.href = 'shop.html'; };
  $('#orderCity').value = city;
  const summary = $('#sum');
  if (!items.length) {
    summary.append(make('div', 'empty-state', 'Корзина пуста.'), make('a', 'btn', 'Перейти в каталог'));
    summary.lastElementChild.href = 'shop.html';
    $('#orderBtn').disabled = true;
  } else {
    items.forEach(({ product, qty }) => {
      const row = make('div', 'order-line');
      const info = make('div'); info.append(make('strong', null, product.name), make('span', 'muted', `${qty} × ${money(product.price)}`));
      row.append(info, make('strong', null, money(product.price * qty))); summary.append(row);
    });
    summary.append(make('div', 'order-subtotal', 'Демо-сумма'), make('strong', 'order-total', money(subtotal)));
  }

  function validate() {
    const name = $('#customerName').value.trim();
    const contact = $('#customerContact').value.trim();
    const consent = $('#localConsent').checked;
    $('#eName').textContent = name.length >= 2 ? '' : 'Укажите имя (минимум 2 символа).';
    $('#eContact').textContent = contact.length >= 5 ? '' : 'Укажите телефон или другой контакт.';
    $('#eConsent').textContent = consent ? '' : 'Подтвердите, что понимаете демонстрационный характер заказа.';
    return name.length >= 2 && contact.length >= 5 && consent && items.length > 0;
  }

  $('#orderForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!validate()) return;
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const order = {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}-${suffix}`,
      date: Date.now(), demo: true, city: $('#orderCity').value.trim() || city,
      fulfillment: $('#fulfillment').value,
      customer: { name: $('#customerName').value.trim(), contact: $('#customerContact').value.trim() },
      comment: $('#orderComment').value.trim(),
      items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, price: product.price, qty })),
      subtotal, total: subtotal
    };
    C.addOrder(order);
    C.ls.set('cart', {});
    const success = $('#orderSuccess');
    success.replaceChildren(make('div', 'success-mark', '✓'), make('p', 'eyebrow', 'ДЕМО-ЗАКАЗ СОХРАНЁН'), make('h2', null, 'Готово, заказ никуда не отправлен.'),
      make('p', 'muted', `Номер заказа: ${order.id}`), make('p', 'muted', `Состав и сумма ${money(subtotal)} сохранены только в этом браузере.`));
    const buttons = make('div', 'hero-actions');
    const catalogLink = make('a', 'btn', 'Продолжить покупки'); catalogLink.href = 'shop.html';
    const profile = make('a', 'btn ghost', 'Вернуться на главную'); profile.href = 'index.html';
    buttons.append(catalogLink, profile); success.append(buttons); success.hidden = false;
    $('#orderForm').hidden = true;
    window.scrollTo({ top: success.offsetTop - 24, behavior: 'smooth' });
  });
})();
