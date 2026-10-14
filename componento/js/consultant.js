// Local rule-based component assistant. It is not an external AI service.
(function () {
  'use strict';
  const C = window.CMP;
  const X = window.CMPAT;
  const CAT = window.COMPONENTO_CATALOG || [];
  const storedSelection = C.ls.get('consultant', {});
  const selected = storedSelection && typeof storedSelection === 'object' && !Array.isArray(storedSelection) ? storedSelection : {};
  const storedHistory = C.ls.get('consultant_messages', []);
  const history = Array.isArray(storedHistory) ? storedHistory : [];
  const h = C.h;
  const label = { ok: 'Совместимо', warn: 'Возможна проблема', bad: 'Несовместимо', none: 'Недостаточно данных для проверки' };
  const color = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--danger)', none: 'var(--muted)' };
  const save = () => C.ls.set('consultant', selected);
  const getType = id => (window.COMPONENTO_COMPAT || {})[id]?.kind;
  X.SLOTS.forEach(([slot, , category]) => {
    const product = X.byId(selected[slot]);
    if (!product || product.cat !== category || getType(product.id) !== slot) delete selected[slot];
  });

  function open(initial) {
    if (initial) {
      Object.keys(selected).forEach(key => delete selected[key]);
      X.SLOTS.forEach(([slot]) => { if (initial[slot] && X.byId(initial[slot]) && getType(initial[slot]) === slot) selected[slot] = initial[slot]; }); save();
    }
    const body = document.getElementById('mBody'); const modal = document.getElementById('modal');
    if (!body || !modal) return;
    modal.hidden = false; draw(body);
  }

  function draw(body) {
    body.replaceChildren(h('p', 'eyebrow', 'ЛОКАЛЬНЫЙ ПОМОЩНИК'), h('h2', null, 'Консультант по сборке'),
      h('p', 'muted', 'Проверка работает на локальных правилах и заданных характеристиках. Это не нейросеть и не гарантия совместимости. Неизвестные спецификации требуют проверки по данным производителя.'));

    const searchLabel = h('label', 'filter-label', 'Найти компонент по названию');
    const search = document.createElement('input'); search.type = 'search'; search.placeholder = 'Например, Ryzen 5 5600X'; search.setAttribute('aria-label', 'Поиск комплектующего');
    const results = h('div', 'consultant-search-results'); searchLabel.append(search); body.append(searchLabel, results);
    search.oninput = () => renderSearch(search.value, results, body);

    const form = h('div', 'form component-selectors');
    X.SLOTS.forEach(([key, name, category]) => {
      const field = h('label', 'filter-label', name); const select = document.createElement('select');
      select.append(new Option('— не выбрано —', ''));
      CAT.filter(product => product.cat === category).forEach(product => select.append(new Option(product.name, product.id)));
      select.value = selected[key] || '';
      select.onchange = () => { select.value ? selected[key] = select.value : delete selected[key]; save(); draw(body); };
      field.append(select); form.append(field);
    });
    body.append(form);

    const quick = h('div', 'consultant-quick'); quick.append(h('strong', null, 'Быстрые вопросы'));
    ['Проверь всю мою сборку', 'Предложи альтернативу дешевле', 'Какой компонент не совместим?'].forEach(question => {
      const button = h('button', 'quick-question', question); button.type = 'button'; button.onclick = () => answer(question, body); quick.append(button);
    });
    body.append(quick);
    const chatForm = h('form', 'consultant-input-row');
    const chatInput = document.createElement('input'); chatInput.type = 'text'; chatInput.maxLength = 180; chatInput.placeholder = 'Задайте вопрос о выбранных компонентах'; chatInput.setAttribute('aria-label', 'Вопрос консультанту');
    const send = h('button', 'btn', 'Отправить'); send.type = 'submit';
    chatForm.append(chatInput, send); chatForm.onsubmit = event => { event.preventDefault(); const value = chatInput.value.trim(); if (value) answer(value, body); }; body.append(chatForm);
    const messages = h('div', 'consultant-messages'); messages.setAttribute('aria-live', 'polite');
    history.slice(-6).forEach(item => appendMessage(messages, item.role, item.text)); body.append(messages);

    const report = h('section', 'compat-report');
    const check = X.check(selected);
    const heading = h('h3', null, label[check.status]); heading.style.color = color[check.status]; report.append(heading);
    if (check.status === 'none') report.append(h('p', 'muted', 'Добавьте компоненты для проверки. Например, процессор, материнскую плату и память.'));
    check.results.forEach(result => {
      const line = h('p', 'compat-message', result.text); line.style.borderLeftColor = color[result.status]; report.append(line);
      if (result.status === 'bad') result.slots.forEach(slot => {
        X.alternatives(selected, slot).forEach(alternative => {
          const slotName = X.SLOTS.find(row => row[0] === slot)?.[1] || 'компонент';
          const button = h('button', 'btn ghost', `Заменить ${slotName.toLowerCase()} на ${alternative.p.name} (${alternative.delta < 0 ? '−' : '+'}${C.fmt(Math.abs(alternative.delta))})`);
          button.onclick = () => { selected[slot] = alternative.p.id; save(); draw(body); C.toast('Компонент заменён, проверка пересчитана'); };
          report.append(button);
        });
      });
    });
    report.append(h('p', 'consultant-total', `Стоимость выбранного: ${C.fmt(X.total(selected))}`));
    const actions = h('div', 'consultant-actions');
    const add = h('button', 'btn', 'Добавить выбранное в корзину'); add.disabled = !check.count;
    add.onclick = () => { Object.values(selected).forEach(id => C.addCart(id)); C.toast('Выбранные комплектующие добавлены в корзину'); };
    const clear = h('button', 'btn ghost', 'Очистить список'); clear.onclick = () => { Object.keys(selected).forEach(key => delete selected[key]); save(); draw(body); };
    actions.append(add, clear); report.append(actions); body.append(report);
  }

  function renderSearch(query, container, body) {
    container.replaceChildren();
    const normalized = query.trim().toLocaleLowerCase('ru');
    if (!normalized) return;
    CAT.filter(product => product.name.toLocaleLowerCase('ru').includes(normalized) && getType(product.id)).slice(0, 8).forEach(product => {
      const row = h('div', 'consultant-search-row'); row.append(h('span', null, product.name), h('span', 'muted', C.fmt(product.price)));
      const button = h('button', 'btn ghost', 'Добавить'); button.onclick = () => { const slot = getType(product.id); selected[slot] = product.id; save(); draw(body); C.toast('Комплектующее добавлено в конфигурацию'); };
      row.append(button); container.append(row);
    });
    if (!container.childElementCount) container.append(h('p', 'muted', 'Совместимые данные для этой позиции не заданы.'));
  }

  function appendMessage(container, role, message) {
    const line = h('p', 'consultant-message ' + (role === 'user' ? 'from-user' : 'from-assistant'), message); container.append(line);
  }

  function answer(question, body) {
    const stored = C.ls.get('consultant_messages', []);
    const messages = Array.isArray(stored) ? stored : [];
    const report = X.check(selected);
    let response;
    if (!report.count) response = 'Сначала выберите компоненты в списке — затем я смогу проверить их по локальным правилам.';
    else if (question.includes('дешевле')) {
      const options = X.SLOTS.flatMap(([slot, title]) => X.alternatives(selected, slot).filter(item => item.delta < 0).map(item => `${title}: ${item.p.name} (экономия ${C.fmt(-item.delta)})`));
      response = options.length ? 'Более дешёвые совместимые варианты: ' + options.slice(0, 3).join('; ') : 'Среди известных каталогу совместимых альтернатив дешевле выбранных не нашлось.';
    } else {
      const issues = report.results.filter(item => item.status === 'bad' || item.status === 'warn');
      response = issues.length ? issues.map(item => item.text).join(' ') : 'Известные правила не нашли конфликта. Некоторые характеристики могут отсутствовать, поэтому это не гарантия полной совместимости.';
    }
    messages.push({ role: 'user', text: question }, { role: 'assistant', text: response });
    C.ls.set('consultant_messages', messages.slice(-20));
    draw(body);
  }

  document.querySelectorAll('[data-open-consultant]').forEach(button => button.addEventListener('click', () => open()));
  C.openConsultant = open;
  C.getConsultantSelection = () => Object.assign({}, selected);
})();
