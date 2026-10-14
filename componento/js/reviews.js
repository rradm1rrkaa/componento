// Отзывы на товарах: только локальные отзывы пользователя в этом браузере, без вымышленных.
(function(){
'use strict';
const C=window.CMP,h=C.h,PHR=['Хорошее соотношение цены и качества','Хорошее качество сборки','Работает стабильно','Хорошо упаковано','Товар пришёл без видимых повреждений','Быстрая доставка','Соответствует описанию','Остался доволен покупкой'];
const all=()=>{const value=C.ls.get('reviews',{});return value&&typeof value==='object'&&!Array.isArray(value)?value:{}},list=id=>Array.isArray(all()[id])?all()[id].filter(x=>x&&Number.isFinite(+x.r)&&+x.r>=1&&+x.r<=5&&typeof x.t==='string').map(x=>Object.assign({},x,{r:+x.r})):[];
function stat(id){const l=list(id);return{n:l.length,avg:l.length?l.reduce((a,x)=>a+x.r,0)/l.length:0}}
C.ratingText=id=>{const s=stat(id);return s.n?'★ '+s.avg.toFixed(1)+' ('+s.n+' отз.)':'Отзывов пока нет'};
C.reviewsBlock=function(p){
 const box=h('div'),view=h('div'),sel=document.createElement('select');
 [['all','Все отзывы'],['5','Пять звёзд'],['4','Четыре звезды'],['low','Низкие оценки (1–2)'],['new','Сначала новые']].forEach(o=>sel.append(new Option(o[1],o[0])));
 function draw(){
  const l=list(p.id).slice().sort((a,b)=>b.d-a.d),s=stat(p.id),f=sel.value;
  view.replaceChildren(h('p',null,s.n?'Средняя оценка: '+s.avg.toFixed(1)+' из 5, отзывов: '+s.n:'Отзывов пока нет. Будьте первым.'));
  for(let i=5;i>=1;i--){const n=l.filter(x=>x.r===i).length,r=h('div','rb'),bar=h('div','bar'),b=document.createElement('i');
   b.style.width=(s.n?n/s.n*100:0)+'%';bar.append(b);r.append(h('span',null,i+' ★'),bar,h('span',null,n));view.append(r)}
  l.filter(x=>f==='all'||f==='new'||(f==='low'?x.r<=2:x.r===+f)).forEach(x=>{const d=h('div','rv');
   d.append(h('div','stars','★'.repeat(x.r)+'☆'.repeat(5-x.r)),h('p',null,x.t),h('small','muted',x.a+' · '+new Date(x.d).toLocaleDateString('ru-RU')+' · локальный отзыв'));view.append(d)})}
 sel.onchange=draw;
 // форма
 let val=0;const stars=h('div'),btns=[];stars.setAttribute('role','radiogroup');stars.setAttribute('aria-label','Оценка');
 const paint=n=>btns.forEach((b,i)=>b.classList.toggle('on',i<n));
 for(let i=0;i<5;i++){const b=h('button','star','★');b.type='button';b.setAttribute('aria-label','Оценка '+(i+1)+' из 5');
  b.onmouseenter=()=>paint(i+1);b.onfocus=()=>paint(i+1);b.onclick=()=>{val=i+1;paint(val)};btns.push(b);stars.append(b)}
 stars.onmouseleave=()=>paint(val);stars.addEventListener('focusout',()=>paint(val));
 stars.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();val=Math.max(1,Math.min(5,(val||0)+(e.key==='ArrowRight'?1:-1)));paint(val);btns[val-1].focus()}};
 const ta=document.createElement('textarea');ta.maxLength=500;ta.setAttribute('aria-label','Текст отзыва');ta.placeholder='Ваш отзыв (5–500 символов)';
 const chips=h('div','chips');PHR.forEach(t=>{const b=h('button',null,t);b.type='button';b.onclick=()=>{if(!ta.value.includes(t))ta.value=(ta.value?ta.value.trim()+' ':'')+t+'. '};chips.append(b)});
 const err=h('p','err'),send=h('button','btn','Отправить отзыв');
 send.onclick=()=>{const t=ta.value.trim(),u=C.user(),a=u?u.email:'Гость';
  if(!val)return err.textContent='Поставьте оценку от 1 до 5';
  if(t.length<5)return err.textContent='Напишите отзыв (минимум 5 символов)';
  if(list(p.id).some(x=>x.a===a&&x.t===t))return err.textContent='Такой отзыв уже отправлен';
  const m=all();(m[p.id]=Array.isArray(m[p.id])?m[p.id]:[]).push({r:val,t,d:Date.now(),a,local:true});C.ls.set('reviews',m);
  val=0;paint(0);ta.value='';err.textContent='';draw();if(C.render)C.render()};
 box.append(h('h3',null,'Отзывы'),sel,view,h('h4',null,'Оставить отзыв'),stars,chips,ta,err,send,
  h('p','muted','Отзыв сохраняется только в этом браузере и не публикуется на сервере. Это демо: настоящих отзывов покупателей здесь нет.'));
 draw();return box};
})();
