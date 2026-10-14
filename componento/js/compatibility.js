// Правила совместимости. Чистая логика, без DOM. Проверяются только перечисленные правила.
(function(){
'use strict';
const SLOTS=[['cpu','Процессор','Процессоры'],['mb','Материнская плата','Материнские платы'],['ram','Оперативная память','Оперативная память'],
 ['gpu','Видеокарта','Видеокарты'],['psu','Блок питания','Блоки питания'],['ssd','SSD-накопитель','SSD'],['hdd','Жёсткий диск','Жёсткие диски'],['case','Корпус','Корпуса'],['cooler','Охлаждение','Кулеры']];
const byId=id=>window.COMPONENTO_CATALOG.find(p=>p.id===id);
const part=(sel,s)=>{const p=sel[s]&&byId(sel[s]);return p?{p,c:(window.COMPONENTO_COMPAT||{})[p.id]}:null};
function check(sel){
 const out=[],add=(status,text,slots)=>out.push({status,text,slots});
 const P={};SLOTS.forEach(s=>P[s[0]]=part(sel,s[0]));
 SLOTS.forEach(s=>{const x=P[s[0]];if(x&&!x.c){add('warn','Недостаточно данных о «'+x.p.name+'», проверьте совместимость вручную.',[s[0]]);P[s[0]]=null}});
 const {cpu,mb,ram,gpu,psu,ssd,hdd}=P,caze=P.case,cooler=P.cooler;
 if(cpu&&mb){
  if(cpu.c.socket!==mb.c.socket)add('bad','Материнская плата использует сокет '+mb.c.socket+', а процессор рассчитан на сокет '+cpu.c.socket+'.',['cpu','mb']);
  else{const n=mb.c.bios&&mb.c.bios[cpu.c.gen];n?add('warn','Сокет '+mb.c.socket+' совпадает. '+n,['mb']):add('ok','Сокет '+mb.c.socket+' у процессора и платы совпадает.',[])}}
 if(mb&&ram){
  if(mb.c.mem!==ram.c.type)add('bad','Материнская плата поддерживает '+mb.c.mem+', а выбран комплект '+ram.c.type+'.',['mb','ram']);
  else if(mb.c.slots&&ram.c.modules>mb.c.slots)add('bad','В комплекте памяти '+ram.c.modules+' модулей, а на плате только '+mb.c.slots+' слотов.',['mb','ram']);
  else if(mb.c.maxMem&&ram.c.capacity>mb.c.maxMem)add('bad','Объём памяти '+ram.c.capacity+' ГБ превышает лимит платы '+mb.c.maxMem+' ГБ.',['mb','ram']);
  else add('ok','Тип памяти '+ram.c.type+' подходит плате; число модулей и объём укладываются в известные ограничения.',[])}
 if(cpu&&ram&&!cpu.c.mem.includes(ram.c.type))add('bad','Процессор не поддерживает память '+ram.c.type+' (поддерживает: '+cpu.c.mem.join(', ')+').',['cpu','ram']);
 if(mb&&ssd){
  if(ssd.c.iface==='NVMe')mb.c.m2<1?add('bad','На плате нет слота M.2 для NVMe-накопителя.',['mb','ssd']):add('ok','Для NVMe-накопителя доступен слот M.2 (слотов на плате: '+mb.c.m2+').',[]);
  else if(ssd.c.iface==='SATA')mb.c.sata>0?add('ok','Плата имеет SATA-порты для подключения накопителя.',[]):add('warn','В каталоге не указано число SATA-портов на материнской плате.',['mb','ssd']);
  else add('warn','Интерфейс накопителя требует ручной проверки по спецификациям платы и устройства.',['mb','ssd'])}
 if(mb&&hdd){if(hdd.c.iface==='SATA'&&mb.c.sata>0)add('ok','Плата имеет SATA-порты для жёсткого диска.',[]);else add('warn','Подключение жёсткого диска требует проверки доступных SATA-портов и кабелей.',['mb','hdd'])}
 if(gpu&&psu){
  if(psu.c.watts<gpu.c.minPsu)add('bad','Для видеокарты рекомендуется блок питания от '+gpu.c.minPsu+' Вт, выбран на '+psu.c.watts+' Вт.',['psu','gpu']);
  else if(cpu&&psu.c.watts<(cpu.c.tdp+gpu.c.power+100)*1.3)add('warn','Запас мощности небольшой: оценка нагрузки ~'+(cpu.c.tdp+gpu.c.power+100)+' Вт (CPU+GPU+100 Вт на остальное).',['psu']);
  else add('ok','Мощность блока питания ('+psu.c.watts+' Вт) соответствует рекомендации для видеокарты.',[]);
  if(!Array.isArray(psu.c.conn))add('warn','В карточке блока питания не указаны кабели PCIe; проверьте комплект поставки конкретной версии.',['psu']);
  else if(!psu.c.conn.includes(gpu.c.conn))gpu.c.conn==='16pin'?add('warn','Для видеокарты нужен 16-pin, а в списке кабелей блока он не указан. Проверьте версию и штатный переходник.',['psu']):add('bad','Видеокарте нужен разъём '+gpu.c.conn+', которого нет в выбранном блоке питания.',['psu','gpu']);
  else if(gpu.c.conn==='2x8pin'&&psu.c.eightPinCount==null)add('warn','Тип PCIe 8-pin указан, но число разъёмов не подтверждено. Для этой видеокарты нужны два разъёма.',['psu']);
  else if(gpu.c.conn==='2x8pin'&&psu.c.eightPinCount<2)add('bad','Видеокарте нужны два PCIe 8-pin, у блока питания указано '+psu.c.eightPinCount+'.',['psu','gpu']);
  else add('ok','Требуемый тип и известное количество кабелей питания присутствуют.',[])}
 if(mb&&caze)caze.c.ff.includes(mb.c.ff)?add('ok','Корпус поддерживает формат платы '+mb.c.ff+'.',[]):add('bad','Корпус не рассчитан на формат платы '+mb.c.ff+'.',['mb','case']);
 if(gpu&&caze)gpu.c.len>caze.c.gpuMax?add('bad','Длина видеокарты (~'+gpu.c.len+' мм) превышает ограничение корпуса ('+caze.c.gpuMax+' мм).',['gpu','case']):add('ok','Видеокарта по длине помещается (~'+gpu.c.len+' мм при лимите '+caze.c.gpuMax+' мм; длину конкретной модели проверьте у производителя).',[]);
 if(cooler&&cpu){
  if(!cooler.c.sockets.includes(cpu.c.socket))add('bad','Кулер не поддерживает сокет '+cpu.c.socket+'.',['cooler','cpu']);
  else if(cooler.c.tdp<cpu.c.tdp)add('warn','Кулер рассчитан на '+cooler.c.tdp+' Вт, а TDP процессора '+cpu.c.tdp+' Вт.',['cooler']);
  else add('ok','Кулер подходит по сокету и тепловыделению.',[])}
 if(cooler&&caze)cooler.c.height>caze.c.coolerMax?add('bad','Высота кулера ('+cooler.c.height+' мм) больше допустимой в корпусе ('+caze.c.coolerMax+' мм).',['cooler','case']):add('ok','Кулер по высоте помещается в корпус ('+cooler.c.height+' из '+caze.c.coolerMax+' мм).',[]);
 const count=SLOTS.filter(s=>sel[s[0]]).length;
 const status=out.some(r=>r.status==='bad')?'bad':out.some(r=>r.status==='warn')?'warn':out.length?'ok':'none';
 return{results:out,status,count}}
function total(sel){return SLOTS.reduce((a,s)=>{const p=sel[s[0]]&&byId(sel[s[0]]);return a+(p?p.price:0)},0)}
// Альтернативы: товары той же категории, при замене на которые исчезают конфликты.
function alternatives(sel,slot){
 const cat=SLOTS.find(s=>s[0]===slot)[2],cur=byId(sel[slot]);
 return window.COMPONENTO_CATALOG.filter(p=>p.cat===cat&&p.id!==sel[slot]&&(window.COMPONENTO_COMPAT||{})[p.id])
  .map(p=>{const s2=Object.assign({},sel,{[slot]:p.id});return{p,r:check(s2),delta:p.price-(cur?cur.price:0)}})
  .filter(x=>!x.r.results.some(r=>r.status==='bad')).sort((a,b)=>a.p.price-b.p.price).slice(0,2)}
// Диагностика: window.CMPAT.selfTest() в консоли браузера
function selfTest(){
 const t=[[{cpu:'cpu-5600x',mb:'mb-b650'},'bad'],[{mb:'mb-b660',ram:'ram-d5-32'},'bad'],[{cpu:'cpu-5600x',mb:'mb-b450',ram:'ram-d4-16'},'warn'],
  [{cpu:'cpu-12400f',mb:'mb-b660',ram:'ram-d4-16',gpu:'gpu-4060',psu:'psu-cv550'},'ok'],[{gpu:'gpu-4070',psu:'psu-cv550'},'bad']];
 return t.map(x=>({sel:x[0],expected:x[1],got:check(x[0]).status,pass:check(x[0]).status===x[1]}))}
window.CMPAT={SLOTS,check,total,alternatives,selfTest,byId};
})();
