// Аккаунты, лояльность, заказы. MVP: всё в localStorage, пароли — только простой хэш (НЕ защита).
(function(){
'use strict';
const K='componento_';
const ls={get(k,d){try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
 set(k,v){try{localStorage.setItem(K+k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>new Intl.NumberFormat('ru-RU').format(n).replace(/\u00a0/g,' ')+' ₸';
const TIERS=[[0,0,'Базовый'],[100000,3,'Серебро'],[300000,5,'Золото'],[700000,7,'Платина'],[1500000,10,'Бриллиант']];
const BONUS_PCT=2; // 1 бонус = 1 ₸, начисляется 2% от оплаченной суммы
function tier(spent){let i=0;TIERS.forEach((t,k)=>{if(spent>=t[0])i=k});
 const n=TIERS[i+1];return{name:TIERS[i][2],pct:TIERS[i][1],from:TIERS[i][0],next:n?{at:n[0],name:n[2],pct:n[1]}:null}}
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 'h'+(h>>>0).toString(16)}
const users=()=>ls.get('users',{});
function user(){const e=ls.get('session',null),u=users()[e];return u?Object.assign({email:e},u):null}
function addOrder(o){
 const email=ls.get('session',null),all=users();
 if(email&&all[email]){const u=all[email];u.spent+=o.total;u.bonus=Math.max(0,u.bonus-o.bonusUsed)+Math.floor(o.total*BONUS_PCT/100);
  u.orders.unshift(o);ls.set('users',all)}
 else{const g=ls.get('guest_orders',[]);g.unshift(o);ls.set('guest_orders',g)}}
function h(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function field(label,type,name){const l=h('label',null,label),i=h('input');i.type=type;i.name=name;i.required=true;l.append(i);return l}
function authView(b,mode){
 b.replaceChildren(h('h2',null,mode==='login'?'Вход':'Регистрация'),h('p','muted','Сейчас вы гость. Войдите или зарегистрируйтесь, чтобы получать скидки и бонусы.'));
 const tabs=h('div','tabs');
 [['login','Вход'],['reg','Регистрация']].forEach(t=>{const k=h('button','btn'+(t[0]===mode?'':' ghost'),t[1]);k.type='button';k.onclick=()=>authView(b,t[0]);tabs.append(k)});
 const f=h('form','form'),err=h('p','err');f.noValidate=true;
 const go=h('button','btn',mode==='login'?'Войти':'Создать аккаунт');go.type='submit';
 f.append(field('Почта','email','email'),field('Пароль (от 6 символов)','password','pass'),err,go);
 f.onsubmit=ev=>{ev.preventDefault();
  const email=f.email.value.trim().toLowerCase(),pass=f.pass.value,all=users();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){err.textContent='Введите корректную почту';return}
  if(pass.length<6){err.textContent='Пароль — минимум 6 символов';return}
  if(mode==='reg'){if(all[email]){err.textContent='Эта почта уже зарегистрирована. Войдите.';return}
   all[email]={pass:hash(email+':'+pass),spent:0,bonus:0,orders:[],created:Date.now()};ls.set('users',all)}
  else if(!all[email]||all[email].pass!==hash(email+':'+pass)){err.textContent='Неверная почта или пароль';return}
  ls.set('session',email);profileView(b);if(window.CMP.onAuth)window.CMP.onAuth()};
 b.append(tabs,f)}
function profileView(b){
 const u=user();if(!u){authView(b,'login');return}
 const t=tier(u.spent);
 b.replaceChildren(h('h2',null,'Профиль'),h('p','muted',u.email));
 b.append(h('p',null,'Уровень: '+t.name+' · скидка постоянного клиента '+t.pct+'%'),
  h('p',null,'Потрачено: '+fmt(u.spent)+' · бонусы: '+fmt(u.bonus).replace('₸','')+'баллов'));
 if(t.next){const bar=h('div','bar'),i=h('i');i.style.width=Math.min(100,(u.spent-t.from)/(t.next.at-t.from)*100)+'%';bar.append(i);
  b.append(bar,h('p','muted','До уровня «'+t.next.name+'» ('+t.next.pct+'%) осталось '+fmt(t.next.at-u.spent)))}
 b.append(h('h3',null,'История покупок'));
 if(!u.orders.length)b.append(h('p','muted','Покупок пока нет.'));
 u.orders.forEach(o=>b.append(h('p',null,o.id+' · '+new Date(o.date).toLocaleDateString('ru-RU')+' · '+fmt(o.total)+' · '+o.items.map(x=>x.name+' ×'+x.qty).join(', '))));
 b.append(h('h3',null,'Избранное'));
 const cat=window.COMPONENTO_CATALOG||[],fav=ls.get('favorites',[]).map(id=>cat.find(p=>p.id===id)).filter(Boolean);
 if(!fav.length)b.append(h('p','muted','В избранном пока пусто.'));
 fav.forEach(p=>b.append(h('p',null,p.name+' — '+fmt(p.price))));
 const out=h('button','btn ghost','Выйти');out.onclick=()=>{ls.set('session',null);authView(b,'login');if(window.CMP.onAuth)window.CMP.onAuth()};b.append(out)}
function openProfile(){const b=document.getElementById('mBody'),m=document.getElementById('modal');if(!b||!m)return;
 user()?profileView(b):authView(b,'login');m.hidden=false}
window.CMP={ls,fmt,tier,user,addOrder,openProfile,BONUS_PCT};
})();