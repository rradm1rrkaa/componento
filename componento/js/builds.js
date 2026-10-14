// Готовые сборки по бюджету: перебор комбинаций каталога + проверка CMPAT.
(function(){
'use strict';
const C=window.CMP,X=window.CMPAT,h=C.h,CAT=window.COMPONENTO_CATALOG;
const by=c=>CAT.filter(p=>p.cat===c),num=(p,g,k)=>+(p&&p.specs[g]&&p.specs[g][k])||0;
const OPT=[['cpu','Процессоры'],['mb','Материнские платы'],['ram','Оперативная память'],['gpu','Видеокарты'],['psu','Блоки питания'],['ssd','SSD'],['case','Корпуса'],['cooler','Кулеры']].map(x=>[x[0],by(x[1])]);
const readSaved=()=>{const value=C.ls.get('saved_builds',[]);return Array.isArray(value)?value.filter(x=>x&&x.ids&&typeof x.ids==='object'):[]};
const SC={
 'Игры':{cpu:.3,gpu:.5,ram:.1,ssd:.1,gpuReq:true},
 'Киберспорт':{cpu:.4,gpu:.4,ram:.1,ssd:.1,gpuReq:true},
 'Работа и офис':{cpu:.5,gpu:.05,ram:.25,ssd:.2},
 'Программирование':{cpu:.5,gpu:.1,ram:.3,ssd:.1},
 'Монтаж видео':{cpu:.4,gpu:.25,ram:.25,ssd:.1},
 '3D и графика':{cpu:.3,gpu:.45,ram:.15,ssd:.1,gpuReq:true},
 'Универсальный компьютер':{cpu:.4,gpu:.25,ram:.2,ssd:.15}
};
// Индекс производительности УСЛОВНЫЙ: по характеристикам (потоки×частота, мощность GPU, объёмы). Это не FPS и не бенчмарк.
const gpuPower=p=>num(p,'Питание','TDP / board power, Вт')||num(p,'Питание','Typical Board Power, Вт');
const feat=s=>({cpu:num(s.cpu,'Процессор','Число потоков')*num(s.cpu,'Процессор','Макс. частота, ГГц'),gpu:gpuPower(s.gpu),ram:num(s.ram,'Память','Объём комплекта, ГБ'),ssd:num(s.ssd,'Накопитель','Объём, ГБ'),power:num(s.cpu,'Процессор','TDP, Вт')+gpuPower(s.gpu)});
let valid=null;
function build(){const out=[];
 (function go(i,sel){
  if(i===OPT.length){const ids={};Object.keys(sel).forEach(k=>{if(sel[k])ids[k]=sel[k].id});
   const r=X.check(ids);if(r.status==='bad')return;
   const iGpu=(sel.cpu.specs['Графика']||{})['Интегрированная графика']!=='Отсутствует';
   out.push({ids,sel:Object.assign({},sel),total:X.total(ids),f:feat(sel),r,iGpu});return}
  const [k,opts]=OPT[i];(k==='gpu'?[null].concat(opts):opts).forEach(p=>{sel[k]=p;go(i+1,sel)});sel[k]=undefined})(0,{});
 return out}
function variants(budget,scn){
 if(!valid)valid=build();const w=SC[scn];
 const ok=valid.filter(b=>b.sel.gpu||(!w.gpuReq&&b.iGpu));
 const mx={};['cpu','gpu','ram','ssd'].forEach(k=>mx[k]=Math.max(1,...ok.map(b=>b.f[k])));
 ok.forEach(b=>b.score=['cpu','gpu','ram','ssd'].reduce((a,k)=>a+w[k]*b.f[k]/mx[k],0));
 const c=ok.filter(b=>b.total<=budget);
 if(!c.length)return{over:ok.slice().sort((a,b)=>a.total-b.total)[0],list:[]};
 const mxs=Math.max(...c.map(b=>b.score)),pick=(arr,fn)=>arr.reduce((a,b)=>fn(b)>fn(a)?b:a);
 const res=[['Самый доступный вариант без известных конфликтов',pick(c,b=>-b.total)],
  ['Оптимальный по цене и возможностям',pick(c.filter(b=>b.score>=.6*mxs),b=>b.score/b.total)],
  ['Максимум возможностей в бюджете',pick(c,b=>b.score)]];
 const seen=new Set();return{list:res.filter(x=>{const k=Object.values(x[1].ids).join();if(seen.has(k))return false;seen.add(k);return true})}}
C.variants=variants;
function card(label,b,budget,scn,res){
 const d=h('div','bcard');d.append(h('h3',null,label),h('p',null,'Итого: '+C.fmt(b.total)+' (бюджет '+C.fmt(budget)+')'));
 X.SLOTS.forEach(s=>{if(b.sel[s[0]])d.append(h('div','muted',s[1]+': '+b.sel[s[0]].name+' — '+C.fmt(b.sel[s[0]].price)))});
 const reason={
  'Игры':'баланс смещён к видеокарте','Киберспорт':'сбалансированы процессор и видеокарта','Работа и офис':'приоритет у процессора, памяти и SSD',
  'Программирование':'приоритет у процессора и объёма памяти','Монтаж видео':'учтены процессор, память и видеокарта',
  '3D и графика':'приоритет у видеокарты с учётом процессора','Универсальный компьютер':'сбалансированы основные компоненты'
 };
 const why=['Сценарий «'+scn+'»: '+reason[scn]+'.',
  'Проверены известные правила. Предупреждения ниже означают, что отдельные параметры нужно уточнить; результат не гарантирует совместимость.'];
 b.r.results.filter(x=>x.status==='warn').forEach(x=>why.push('Внимание: '+x.text));
 why.push('Индекс производительности условный (по характеристикам), это не FPS.');
 d.append(h('h4',null,'Почему эта сборка подходит'));why.forEach(t=>d.append(h('p','muted',t)));
 const add=h('button','btn','Добавить всю сборку в корзину');add.onclick=()=>Object.values(b.ids).forEach(id=>C.addCart(id));
 const save=h('button','btn ghost','Сохранить сборку');save.onclick=()=>{const l=readSaved();l.push({name:label+' · '+scn,ids:b.ids,date:Date.now()});C.ls.set('saved_builds',l);(C.toast||alert)('Сборка сохранена');saved(res)};
 const rep=h('button','btn ghost','Проверить / заменить комплектующее');rep.onclick=()=>C.openConsultant(b.ids);
 d.append(add,save,rep);return d}
function saved(box){
 const l=readSaved();box.replaceChildren();if(!l.length)return;box.append(h('h3',null,'Сохранённые сборки'));
 l.forEach((s,i)=>{const ids=Object.values(s.ids).filter(id=>X.byId(id)),d=h('div','bcard');
  d.append(h('div',null,s.name+' — '+C.fmt(X.total(s.ids))+' (по текущим ценам)'));
  const a=h('button','btn ghost','В корзину');a.onclick=()=>ids.forEach(id=>C.addCart(id));
  const o=h('button','btn ghost','Открыть в консультанте');o.onclick=()=>C.openConsultant(s.ids);
  const x=h('button','btn ghost','Удалить');x.onclick=()=>{l.splice(i,1);C.ls.set('saved_builds',l);saved(box)};d.append(a,o,x);box.append(d)})}
function open(){
 const b=document.getElementById('mBody');document.getElementById('modal').hidden=false;
 b.replaceChildren(h('h2',null,'Какой компьютер собрать под твой бюджет?'));
 const f=h('div','form'),num=document.createElement('input'),rg=document.createElement('input'),sc=document.createElement('select');
 num.type='number';num.min=0;num.step=10000;num.value=450000;rg.type='range';rg.min=150000;rg.max=1500000;rg.step=10000;rg.value=450000;
 num.setAttribute('aria-label','Бюджет, ₸');rg.setAttribute('aria-label','Бюджет, ползунок');
 num.oninput=()=>rg.value=num.value;rg.oninput=()=>num.value=rg.value;
 Object.keys(SC).forEach(k=>sc.append(new Option(k,k)));
 const priority=document.createElement('select'),priorityHint=h('p','muted');
 [['balanced','Баланс цены и возможностей'],['performance','Максимальная производительность'],['quiet','Низкий уровень шума'],['upgrade','Возможность апгрейда'],['compact','Компактный корпус'],['efficient','Энергоэффективность']].forEach(([v,n])=>priority.append(new Option(n,v)));
 const hints={balanced:'Сравнение оценивает параметры каталога и стоимость.',performance:'Варианты ранжируются по условному индексу из характеристик, это не FPS.',quiet:'Шумовые данные отсутствуют: можно лишь ориентироваться на меньший TDP CPU и GPU.',upgrade:'В каталоге недостаточно данных о слотах и поддержке будущих поколений для ранжирования апгрейда.',compact:'В каталоге недостаточно габаритов корпуса для ранжирования компактности.',efficient:'Варианты сортируются по меньшей сумме TDP процессора и видеокарты; фактическое потребление системы отличается.'};
 priority.onchange=()=>priorityHint.textContent=hints[priority.value];priorityHint.textContent=hints[priority.value];
 const l1=h('label',null,'Бюджет, ₸'),l2=h('label',null,'Сценарий использования'),l3=h('label',null,'Приоритет');l1.append(num,rg);l2.append(sc);l3.append(priority,priorityHint);
 const go=h('button','btn','Подобрать сборки'),err=h('p','err'),res=h('div'),sv=h('div');
 go.onclick=()=>{const bud=+num.value;res.replaceChildren();err.textContent='';
  if(!(bud>0))return err.textContent='Введите бюджет больше нуля';
  const r=variants(bud,sc.value);
  if(priority.value==='performance')r.list.sort((a,b)=>b[1].score-a[1].score);
  if(priority.value==='quiet'||priority.value==='efficient')r.list.sort((a,b)=>a[1].f.power-b[1].f.power||a[1].total-b[1].total);
  if(!r.list.length){res.append(h('p',null,'В бюджет '+C.fmt(bud)+' полная совместимая сборка не помещается. Ближайший вариант стоит '+C.fmt(r.over.total)+'.'));res.append(card('Ближайший вариант (выше бюджета)',r.over,bud,sc.value,sv));return}
  r.list.forEach(x=>res.append(card(x[0],x[1],bud,sc.value,sv)))};
 f.append(l1,l2,l3,err,go);b.append(f,res,sv);saved(sv)}
document.querySelectorAll('[data-open-builds]').forEach(button=>button.addEventListener('click',open));
C.openBuilds=open;
})();
