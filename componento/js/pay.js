(function(){
'use strict';
const $=s=>document.querySelector(s),C=window.CMP,CAT=window.COMPONENTO_CATALOG;
const th=C.ls.get('theme','light');document.documentElement.dataset.theme=th;
const cart=C.ls.get('cart',{});
const items=Object.keys(cart).map(id=>({p:CAT.find(x=>x.id===id),n:cart[id]})).filter(x=>x.p&&x.n>0);
const user=C.user(),subtotal=items.reduce((a,x)=>a+x.p.price*x.n,0);
const pct=user?C.tier(user.spent).pct:0,discount=Math.round(subtotal*pct/100);
const avail=user?Math.min(user.bonus,subtotal-discount):0;
let useBonus=false;
const total=()=>subtotal-discount-(useBonus?avail:0);
function p(text,cls){const e=document.createElement('p');if(cls)e.className=cls;e.textContent=text;return e}
function drawSummary(){
 const b=$('#sum');b.replaceChildren();
 if(!items.length){b.append(p('Корзина пуста.','muted'));$('#payBtn').disabled=true;return}
 items.forEach(x=>b.append(p(x.p.name+' × '+x.n+' — '+C.fmt(x.p.price*x.n))));
 b.append(p('Сумма: '+C.fmt(subtotal)));
 if(user)b.append(p('Скидка постоянного клиента '+pct+'%: −'+C.fmt(discount)));
 else b.append(p('Вы гость: войдите в профиль в магазине, чтобы получать скидку и бонусы.','muted'));
 if(avail>0){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.onchange=()=>{useBonus=c.checked;drawSummary()};c.checked=useBonus;
  l.append(c,' Списать бонусы: '+C.fmt(avail).replace('₸','')+'баллов');b.append(l)}
 const t=p('К оплате: '+C.fmt(total()));t.style.fontWeight='700';t.style.fontSize='20px';b.append(t)}
const digits=(el,n)=>el.addEventListener('input',()=>{el.value=el.value.replace(/\D/g,'').slice(0,n)});
digits($('#card'),16);digits($('#cvv'),3);
$('#exp').addEventListener('input',e=>{const d=e.target.value.replace(/\D/g,'').slice(0,4);e.target.value=d.length>2?d.slice(0,2)+'/'+d.slice(2):d});
function validate(){
 let ok=true;const set=(id,m)=>{$(id).textContent=m;if(m)ok=false};
 set('#eCard',/^\d{16}$/.test($('#card').value)?'':'Номер карты — ровно 16 цифр');
 const m=/^(\d{2})\/(\d{2})$/.exec($('#exp').value);
 if(!m)set('#eExp','Укажите срок в формате ММ/ГГ, например 10/29');
 else{const mo=+m[1],yr=+m[2],now=new Date(),cy=now.getFullYear()%100,cm=now.getMonth()+1;
  set('#eExp',mo<1||mo>12?'Месяц должен быть от 01 до 12':(yr<cy||(yr===cy&&mo<cm))?'Срок действия карты истёк':'')}
 set('#eCvv',/^\d{3}$/.test($('#cvv').value)?'':'CVV — 3 цифры');
 return ok}
$('#payForm').addEventListener('submit',e=>{
 e.preventDefault();if(!items.length||!validate())return;
 C.addOrder({id:'CMP-'+Date.now().toString(36).toUpperCase(),date:Date.now(),demo:true,
  items:items.map(x=>({id:x.p.id,name:x.p.name,price:x.p.price,qty:x.n})),
  subtotal,discount,bonusUsed:useBonus?avail:0,total:total()});
 C.ls.set('cart',{});
 alert('Успешная покупка!');location.href='shop.html'});
drawSummary();
})();