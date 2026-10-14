(function(){
'use strict';
const $=s=>document.querySelector(s),KEY='componento_';
const store={ // централизованный доступ к LocalStorage
 get(k,d){try{const v=localStorage.getItem(KEY+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
 set(k,v){try{localStorage.setItem(KEY+k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>new Intl.NumberFormat('ru-RU').format(n).replace(/\u00a0/g,' ')+' ₸';
const CAT=window.COMPONENTO_CATALOG,byId=id=>CAT.find(p=>p.id===id);
const CITIES=['Астана','Алматы','Шымкент','Караганда','Актобе','Атырау','Павлодар','Костанай'];
const st={cart:store.get('cart',{}),fav:store.get('favorites',[]),city:store.get('city',null),theme:store.get('theme','light'),q:''};
const esc=t=>{const d=document.createElement('div');d.textContent=t;return d.innerHTML};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1800)}
function counters(){$('#favCount').textContent=st.fav.length;$('#cartCount').textContent=Object.values(st.cart).reduce((a,b)=>a+b,0);$('#cityBtn').textContent='Город: '+(st.city||'не выбран')+' (изменить)'}
function toggleFav(id){const i=st.fav.indexOf(id);i<0?st.fav.push(id):st.fav.splice(i,1);store.set('favorites',st.fav);counters();render()}
function addCart(id){st.cart[id]=(st.cart[id]||0)+1;store.set('cart',st.cart);counters();toast('Добавлено в корзину');if(!$('#cart').hidden)drawCart()}
function setQty(id,d){st.cart[id]=(st.cart[id]||0)+d;if(st.cart[id]<=0)delete st.cart[id];store.set('cart',st.cart);counters();drawCart()}
function filtered(){
 const c=$('#fCat').value,b=$('#fBrand').value,mn=+$('#fMin').value||0,mx=+$('#fMax').value||Infinity,q=st.q.trim().toLowerCase();
 let r=CAT.filter(p=>(!c||p.cat===c)&&(!b||p.brand===b)&&p.price>=mn&&p.price<=mx&&(!$('#fFav').checked||st.fav.includes(p.id))&&
  (!q||(p.name+' '+p.brand+' '+JSON.stringify(p.specs)).toLowerCase().includes(q)));
 const s=$('#fSort').value;
 return r.sort(s==='asc'?(a,b)=>a.price-b.price:s==='desc'?(a,b)=>b.price-a.price:(a,b)=>a.name.localeCompare(b.name));}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function card(p){
 const c=el('article','card'),ph=el('div','ph',p.icon);
 const bt=(t,f,cls)=>{const b=el('button',cls||'btn ghost',t);b.addEventListener('click',f);return b};
 const row=el('div','row');
 const fav=bt('♥',()=>toggleFav(p.id),'btn ghost fav'+(st.fav.includes(p.id)?' on':''));fav.setAttribute('aria-label','В избранное');
 row.append(bt('Подробнее',()=>openModal(p)),bt('В корзину',()=>addCart(p.id),'btn'),fav);
 c.append(ph,el('div','brand',p.brand+' · '+p.cat),el('div','name',p.name),el('div','price',fmt(p.price)),row);return c}
function render(){
 const list=filtered(),g=$('#grid');g.replaceChildren(...list.map(card));
 $('#found').textContent=list.length?'Найдено товаров: '+list.length:'';
 if(!list.length){const e=el('p','muted','Ничего не найдено. Измените запрос или сбросьте фильтры.');g.append(e)}}
function openModal(p){
 const b=$('#mBody');b.replaceChildren(el('h2',null,p.name),el('p','muted',p.brand+' · '+p.cat+' · ID '+p.id),el('div','price',fmt(p.price)));
 const sp=el('div','spec');
 for(const [grp,rows] of Object.entries(p.specs)){sp.append(el('h4',null,grp));
  for(const [k,v] of Object.entries(rows)){const d=el('div');d.append(el('span',null,k),el('span',null,String(v)));sp.append(d)}}
 const add=el('button','btn','В корзину');add.addEventListener('click',()=>addCart(p.id));
 b.append(sp,el('p','muted','Цена демонстрационная.'),add);$('#modal').hidden=false;$('#mClose').focus()}
function drawCart(){
 const d=$('#cart');d.hidden=false;d.replaceChildren();
 const h=el('h3',null,'Корзина'),x=el('button','icon','✕');x.setAttribute('aria-label','Закрыть корзину');x.onclick=()=>d.hidden=true;d.append(x,h);
 const ids=Object.keys(st.cart).filter(byId);let total=0;
 if(!ids.length)d.append(el('p','muted','Корзина пуста. Добавьте товары из каталога.'));
 ids.forEach(id=>{const p=byId(id),n=st.cart[id];total+=p.price*n;
  const r=el('div','ci'),l=el('div');l.append(el('div',null,p.name),el('div','muted',fmt(p.price)+' × '+n+' = '+fmt(p.price*n)));
  const q=el('div','qty'),m=el('button',null,'−'),pl=el('button',null,'+');m.onclick=()=>setQty(id,-1);pl.onclick=()=>setQty(id,1);m.setAttribute('aria-label','Меньше');pl.setAttribute('aria-label','Больше');
  q.append(m,pl);r.append(l,q);d.append(r)});
 d.append(el('h3',null,'Итого: '+fmt(total)));if(ids.length){const a=el('a','btn pay','Перейти к оплате');a.href='pay.html';d.append(a)}}
function cityModal(){
 const b=$('#mBody');b.replaceChildren(el('h2',null,st.city?'Выберите город':'Ваш город — Астана, верно?'));
 if(!st.city){const y=el('button','btn','Да, верно');y.onclick=()=>setCity('Астана');b.append(y,el('p'))}
 CITIES.forEach(c=>{const k=el('button','btn ghost',c);k.style.margin='4px';k.onclick=()=>setCity(c);b.append(k)});
 $('#modal').hidden=false}
function setCity(c){st.city=c;store.set('city',c);$('#modal').hidden=true;counters();toast('Город: '+c)}
function theme(t){st.theme=t;document.documentElement.dataset.theme=t;store.set('theme',t)}
function init(){
 theme(st.theme);
 const fill=(sel,vals,all)=>{const s=$(sel);s.replaceChildren(new Option(all,''),...[...new Set(vals)].sort().map(v=>new Option(v,v)))};
 fill('#fCat',CAT.map(p=>p.cat),'Все категории');fill('#fBrand',CAT.map(p=>p.brand),'Все бренды');
 ['#fCat','#fBrand','#fMin','#fMax','#fSort','#fFav'].forEach(s=>$(s).addEventListener('input',render));
 let t;$('#search').addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>{st.q=e.target.value;render()},200)});
 $('#reset').onclick=()=>{['#fCat','#fBrand','#fMin','#fMax'].forEach(s=>$(s).value='');$('#fFav').checked=false;$('#search').value='';st.q='';render()};
 $('#themeBtn').onclick=()=>theme(st.theme==='dark'?'light':'dark');
 $('#cartBtn').onclick=drawCart;$('#profBtn').onclick=window.CMP.openProfile;$('#cityBtn').onclick=cityModal;
 $('#favBtn').onclick=()=>{$('#fFav').checked=!$('#fFav').checked;render()};
 $('#mClose').onclick=()=>$('#modal').hidden=true;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#modal').hidden=true;$('#cart').hidden=true}});
 counters();render();if(!st.city)cityModal()}
init();
})();