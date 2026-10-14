// One-time intro and interactive tour over real controls in the interface.
(function () {
  'use strict';
  const C = window.CMP;
  const h = C.h;
  const modalBody = () => document.getElementById('mBody');
  const modal = () => document.getElementById('modal');
  let index = 0;
  let overlay = null;
  let target = null;
  let originalStyle = null;
  const steps = [
    ['[data-tour="logo"]', 'Componento', 'Нажмите на логотип, чтобы вернуться на главную страницу.'],
    ['[data-tour="catalog"]', 'Каталог', 'Откройте комплектующие, периферию и другие разделы каталога.'],
    ['[data-tour="search"]', 'Поиск', 'Поиск учитывает название, производителя, модель и характеристики.'],
    ['[data-tour="navigation"]', 'Разделы магазина', 'Переходите к категориям и готовым сборкам из главной навигации.'],
    ['[data-tour="favorites"]', 'Избранное', 'Сохраняйте товары в избранном на этом устройстве.'],
    ['[data-tour="comparison"]', 'Сравнение', 'Добавляйте модели одной категории и сопоставляйте их характеристики.'],
    ['[data-tour="cart"]', 'Корзина', 'Количество и сумма пересчитываются автоматически.'],
    ['[data-tour="theme"]', 'Тема оформления', 'Переключение темы сохраняется в браузере.'],
    ['[data-tour="consultant"]', 'Консультант по сборке', 'Локальные правила проверяют известные ограничения комплектующих.'],
    ['[data-tour="builds"]', 'Подбор сборки', 'Подберите демонстрационную сборку по бюджету и сценарию использования.']
  ];

  function maybeOnboard() {
    if (!C.ls.get('city', null)) return;
    const status = C.ls.get('onboarding', {});
    if (status && status.complete) return;
    const body = modalBody(); if (!body || !modal()) return;
    body.replaceChildren(h('p', 'eyebrow', 'ЗНАКОМСТВО С МАГАЗИНОМ'), h('h2', null, 'Хотите познакомиться с Componento?'),
      h('p', 'muted', 'Мы быстро покажем основные возможности магазина. Тур можно завершить в любой момент.'));
    const actions = h('div', 'city-actions');
    const start = h('button', 'btn', 'Да, показать'); start.onclick = startTour;
    const skip = h('button', 'btn ghost', 'Пропустить'); skip.onclick = () => { C.ls.set('onboarding', { complete: true, skipped: true }); modal().hidden = true; };
    actions.append(start, skip); body.append(actions); modal().hidden = false;
  }

  function startTour(restart = false) {
    if (!restart && C.ls.get('onboarding', {}).complete) return;
    if (modal()) modal().hidden = true;
    index = 0;
    if (!overlay) {
      overlay = h('div', 'tour-overlay'); overlay.setAttribute('role', 'presentation');
      overlay.addEventListener('click', event => { if (event.target === overlay) finishTour(); });
      document.body.append(overlay);
    }
    overlay.replaceChildren(); overlay.hidden = false;
    renderStep();
    document.addEventListener('keydown', onKeydown);
  }

  function onKeydown(event) { if (event.key === 'Escape' && overlay && !overlay.hidden) finishTour(); }

  function clearTarget() {
    if (!target) return;
    target.classList.remove('tour-highlight');
    if (originalStyle !== null) target.setAttribute('style', originalStyle); else target.removeAttribute('style');
    target = null; originalStyle = null;
  }

  function renderStep() {
    clearTarget();
    while (index < steps.length && !document.querySelector(steps[index][0])) index++;
    if (index >= steps.length) return finishTour();
    const [selector, title, description] = steps[index];
    target = document.querySelector(selector);
    originalStyle = target.getAttribute('style');
    target.classList.add('tour-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const card = h('section', 'tour-card'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
    const top = h('div', 'tour-card-top'); top.append(h('p', 'eyebrow', `${index + 1} ИЗ ${steps.length}`));
    const close = h('button', 'icon', '✕'); close.setAttribute('aria-label', 'Завершить обучение'); close.onclick = finishTour;
    top.append(close);
    card.append(top, h('h2', null, title), h('p', null, description));
    const progress = h('div', 'tour-progress'); const bar = h('span'); bar.style.width = `${(index + 1) / steps.length * 100}%`; progress.append(bar); card.append(progress);
    const actions = h('div', 'tour-actions');
    const back = h('button', 'btn ghost', 'Назад'); back.disabled = index === 0; back.onclick = () => { index = Math.max(0, index - 1); renderStep(); };
    const next = h('button', 'btn', index === steps.length - 1 ? 'Завершить' : 'Далее'); next.onclick = () => { if (index === steps.length - 1) finishTour(); else { index++; renderStep(); } };
    const finish = h('button', 'text-button', 'Пропустить тур'); finish.onclick = finishTour;
    actions.append(back, next, finish); card.append(actions); overlay.replaceChildren(card);
    positionCard(card, target);
    next.focus();
  }

  function positionCard(card, element) {
    const rect = element.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 28);
    card.style.width = `${width}px`;
    const left = Math.max(14, Math.min(window.innerWidth - width - 14, rect.left + rect.width / 2 - width / 2));
    let top = rect.bottom + 14;
    if (top + 260 > window.innerHeight) top = Math.max(14, rect.top - 260);
    card.style.left = `${left}px`; card.style.top = `${top}px`;
  }

  function finishTour() {
    clearTarget();
    if (overlay) { overlay.hidden = true; overlay.replaceChildren(); }
    document.removeEventListener('keydown', onKeydown);
    C.ls.set('onboarding', { complete: true, completedAt: Date.now() });
  }

  C.maybeOnboard = maybeOnboard;
  C.startTour = startTour;
})();
