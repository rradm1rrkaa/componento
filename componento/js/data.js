// Демо-каталог: реальные модели, технические данные из открытых спецификаций производителей.
// Цены в тенге — УСЛОВНЫЕ, не отражают реальные цены магазинов.
(function(){
const cpu=(id,brand,name,price,o)=>({id,cat:'Процессоры',brand,name,price,icon:'🧠',specs:{
 'Процессор':{'Сокет':o.socket,'Число ядер':o.c,'Число потоков':o.t,'Базовая частота, ГГц':o.base,'Макс. частота, ГГц':o.boost,'Кэш L3, МБ':o.l3,'TDP, Вт':o.tdp},
 'Основные характеристики':{'Производитель':brand,'Модель':o.model,'Поколение':o.gen,'Техпроцесс, нм':o.nm,'Дата выпуска':o.date},
 'Память':{'Тип памяти':o.mem},
 'Графика':{'Интегрированная графика':o.igpu}}});
window.COMPONENTO_CATALOG=[
 cpu('cpu-5600x','AMD','AMD Ryzen 5 5600X (6C/12T, 3.7–4.6 ГГц) AM4 OEM',89990,{socket:'AM4',c:6,t:12,base:3.7,boost:4.6,l3:32,tdp:65,model:'Ryzen 5 5600X',gen:'Zen 3',nm:7,date:'2020 Q4',mem:'DDR4',igpu:'Отсутствует'}),
 cpu('cpu-7600','AMD','AMD Ryzen 5 7600 (6C/12T, 3.8–5.1 ГГц) AM5',119990,{socket:'AM5',c:6,t:12,base:3.8,boost:5.1,l3:32,tdp:65,model:'Ryzen 5 7600',gen:'Zen 4',nm:5,date:'2023 Q1',mem:'DDR5',igpu:'AMD Radeon Graphics'}),
 cpu('cpu-12400f','Intel','Intel Core i5-12400F (6C/12T, до 4.4 ГГц) LGA1700',84990,{socket:'LGA1700',c:6,t:12,base:2.5,boost:4.4,l3:18,tdp:65,model:'Core i5-12400F',gen:'Alder Lake',nm:10,date:'2022 Q1',mem:'DDR4, DDR5',igpu:'Отсутствует'}),
 cpu('cpu-13400f','Intel','Intel Core i5-13400F (10C/16T, до 4.6 ГГц) LGA1700',109990,{socket:'LGA1700',c:10,t:16,base:2.5,boost:4.6,l3:20,tdp:65,model:'Core i5-13400F',gen:'Raptor Lake',nm:10,date:'2023 Q1',mem:'DDR4, DDR5',igpu:'Отсутствует'}),
 ...[['gpu-4060','NVIDIA','NVIDIA GeForce RTX 4060 8 ГБ',169990,'RTX 4060',8,'GDDR6',115,'1×8-pin'],
     ['gpu-4070','NVIDIA','NVIDIA GeForce RTX 4070 12 ГБ',329990,'RTX 4070',12,'GDDR6X',200,'1×16-pin (12VHPWR)'],
     ['gpu-7600','AMD','AMD Radeon RX 7600 8 ГБ',149990,'RX 7600',8,'GDDR6',165,'1×8-pin']].map(g=>({id:g[0],cat:'Видеокарты',brand:g[1],name:g[2],price:g[3],icon:'🎮',specs:{
   'Графический процессор':{'Модель GPU':g[4],'Объём VRAM, ГБ':g[5],'Тип памяти':g[6]},
   'Питание':{'TDP / board power, Вт':g[7],'Разъём питания':g[8]}}})),
 ...[['ram-d4-16','Kingston','Kingston FURY Beast 16 ГБ (2×8) DDR4-3200',24990,'DDR4',16,2,3200],
     ['ram-d5-32','Kingston','Kingston FURY Beast 32 ГБ (2×16) DDR5-6000',54990,'DDR5',32,2,6000]].map(r=>({id:r[0],cat:'Оперативная память',brand:r[1],name:r[2],price:r[3],icon:'▤',specs:{
   'Память':{'Тип':r[4],'Объём комплекта, ГБ':r[5],'Модулей':r[6],'Частота, МТ/с':r[7]}}})),
 ...[['ssd-980','Samsung','Samsung 980 1 ТБ M.2 NVMe',49990,'M.2 NVMe PCIe 3.0',1000],
     ['ssd-sn580','Western Digital','WD Blue SN580 1 ТБ M.2 NVMe',44990,'M.2 NVMe PCIe 4.0',1000]].map(s=>({id:s[0],cat:'SSD',brand:s[1],name:s[2],price:s[3],icon:'💾',specs:{
   'Накопитель':{'Интерфейс':s[4],'Объём, ГБ':s[5],'Форм-фактор':'M.2 2280'}}}))
];
const cpu5600x=window.COMPONENTO_CATALOG.find(p=>p.id==='cpu-5600x');
if(cpu5600x){
 cpu5600x.sourceUrl='https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html';
 cpu5600x.specs['Кэш и тепловые характеристики']={'Кэш L2, МБ':3,'Максимальная рабочая температура': '95 °C','Техпроцесс':'TSMC 7nm FinFET'};
 cpu5600x.specs['Память']={'Тип памяти':'DDR4','Максимальная скорость памяти':'3200 MT/s'};
 cpu5600x.specs['Интерфейсы и технологии']={'PCI Express':'PCIe 4.0','Поддерживаемые технологии':'AMD Zen 3, StoreMI, Ryzen Master','Артикул (tray)':'100-000000065'};
}
window.COMPONENTO_VERSION=2;
})();

// Платформы, блоки питания и данные для проверки совместимости (демо-цены).
(function(){
const mb=(id,name,price,sock,chip,mem,m2)=>({id,cat:'Материнские платы',brand:name.split(' ')[0],name,price,icon:'🧩',specs:{
 'Платформа':{'Сокет':sock,'Чипсет':chip,'Форм-фактор':'mATX','Тип памяти':mem,'Слотов памяти':4,'Слотов M.2':m2}}});
const psu=(id,name,price,w,cert,conn)=>({id,cat:'Блоки питания',brand:'Corsair',name,price,icon:'🔌',specs:{
 'Питание':{'Мощность, Вт':w,'Сертификат':cert,'Разъёмы для видеокарты':conn}}});
window.COMPONENTO_CATALOG.push(
 mb('mb-b450','ASUS PRIME B450M-A II (AM4, B450, DDR4)',39990,'AM4','B450','DDR4',1),
 mb('mb-b650','MSI PRO B650M-A WIFI (AM5, B650, DDR5)',74990,'AM5','B650','DDR5',2),
 mb('mb-b660','MSI PRO B660M-A DDR4 (LGA1700, B660)',59990,'LGA1700','B660','DDR4',2),
 psu('psu-cv550','Corsair CV550 550 Вт',29990,550,'80 Plus Bronze','8-pin PCIe'),
 psu('psu-rm750e','Corsair RM750e 750 Вт',74990,750,'80 Plus Gold','8-pin PCIe, 16-pin (12VHPWR)'));
const cpu=(s,g,mem)=>({kind:'cpu',socket:s,tdp:65,gen:g,mem});
window.COMPONENTO_COMPAT={
 'cpu-5600x':cpu('AM4','Zen 3',['DDR4']),'cpu-7600':cpu('AM5','Zen 4',['DDR5']),
 'cpu-12400f':cpu('LGA1700','Alder Lake',['DDR4','DDR5']),'cpu-13400f':cpu('LGA1700','Raptor Lake',['DDR4','DDR5']),
 'mb-b450':{kind:'mb',socket:'AM4',mem:'DDR4',m2:1,sata:4,slots:4,maxMem:128,bios:{'Zen 3':'Для Ryzen 5000 на этой плате может потребоваться обновление BIOS.'}},
 'mb-b650':{kind:'mb',socket:'AM5',mem:'DDR5',m2:2,sata:4,slots:4,maxMem:128},
 'mb-b660':{kind:'mb',socket:'LGA1700',mem:'DDR4',m2:2,sata:4,slots:4,maxMem:128,bios:{'Raptor Lake':'Для Core 13-го поколения может потребоваться обновление BIOS.'}},
 'ram-d4-16':{kind:'ram',type:'DDR4',capacity:16,modules:2},'ram-d5-32':{kind:'ram',type:'DDR5',capacity:32,modules:2},
 'gpu-4060':{kind:'gpu',power:115,minPsu:550,conn:'8pin'},'gpu-4070':{kind:'gpu',power:200,minPsu:650,conn:'16pin'},'gpu-7600':{kind:'gpu',power:165,minPsu:550,conn:'8pin'},
 'psu-cv550':{kind:'psu',watts:550,conn:['8pin']},'psu-rm750e':{kind:'psu',watts:750,conn:['8pin','16pin'],eightPinCount:2},
 'ssd-980':{kind:'ssd',iface:'NVMe'},'ssd-sn580':{kind:'ssd',iface:'NVMe'}};
})();

// Корпуса и охлаждение. Длина видеокарт в COMPAT — ориентировочная (зависит от конкретной модели производителя).
(function(){
const cs=(id,name,price,gpu,cool)=>({id,cat:'Корпуса',brand:name.split(' ')[0],name,price,icon:'🗄',specs:{
 'Корпус':{'Форматы плат':'ATX, mATX, ITX','Макс. длина видеокарты, мм':gpu,'Макс. высота кулера, мм':cool}}});
const cl=(id,name,price,tdp)=>({id,cat:'Кулеры',brand:name.split(' ')[0],name,price,icon:'❄',specs:{
 'Охлаждение':{'Тип':'Воздушный башенный','Высота, мм':155,'Сокеты':'AM4, AM5, LGA1700','Рассеиваемая мощность, Вт':tdp}}});
window.COMPONENTO_CATALOG.push(
 cs('case-4000d','Corsair 4000D Airflow',49990,360,170),cs('case-h510','NZXT H510',44990,381,165),
 cl('cool-ak400','DeepCool AK400',17990,220),cl('cool-pa120','Thermalright Peerless Assassin 120 SE',14990,245));
const C=window.COMPONENTO_COMPAT;
['mb-b450','mb-b650','mb-b660'].forEach(k=>C[k].ff='mATX');
C['gpu-4060'].len=240;C['gpu-4070'].len=300;C['gpu-7600'].len=270;
C['case-4000d']={kind:'case',ff:['ATX','mATX','ITX'],gpuMax:360,coolerMax:170};
C['case-h510']={kind:'case',ff:['ATX','mATX','ITX'],gpuMax:381,coolerMax:165};
['cool-ak400','cool-pa120'].forEach((k,i)=>C[k]={kind:'cooler',sockets:['AM4','AM5','LGA1700'],height:155,tdp:[220,245][i]});
})();

// Additional curated demo items. Core component data is deliberately kept
// separate from compatibility rules; only explicitly mapped items are checked.
(function(){
 'use strict';
 const items=[
  {id:'gpu-rx7800xt',cat:'Видеокарты',brand:'AMD',name:'AMD Radeon RX 7800 XT 16 ГБ',model:'Radeon RX 7800 XT',price:399990,icon:'🎮',sourceUrl:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7800-xt.html',description:'Референсные характеристики GPU; размеры и охлаждение конкретной карты партнёра могут отличаться.',specs:{'Графический процессор':{'Модель GPU':'Radeon RX 7800 XT','Объём VRAM, ГБ':16,'Тип памяти':'GDDR6','Шина памяти, бит':256},'Питание':{'Typical Board Power, Вт':263,'Рекомендованный БП, Вт':700,'Разъёмы питания':'2 × 8-pin PCIe'},'Габариты':{'Длина референсной карты, мм':267,'Толщина':'2.5 слота'},'Интерфейсы':{'DisplayPort':'2.1','HDMI':'2.1'}}},
  {id:'psu-focus850',cat:'Блоки питания',brand:'Seasonic',name:'Seasonic FOCUS GX-850 ATX 3.1',model:'FOCUS GX-850 ATX 3.1',price:89990,icon:'🔌',sourceUrl:'https://seasonic.com/wp-content/uploads/2024/07/ATX3.1-FOCUS-GX.pdf',specs:{'Питание':{'Мощность, Вт':850,'Сертификат':'80 PLUS Gold','Форм-фактор':'ATX','Кабель GPU':'12V-2x6','Разъёмы PCIe 8-pin':'3'}}},
  {id:'ssd-870evo-1tb',cat:'SSD',brand:'Samsung',name:'Samsung 870 EVO 1 ТБ 2.5 SATA',model:'870 EVO 1TB',price:59990,icon:'💾',specs:{'Накопитель':{'Интерфейс':'SATA III 6 Гбит/с','Объём, ГБ':1000,'Форм-фактор':'2.5 дюйма'}}},
  {id:'monitor-lg-27gn800',cat:'Мониторы',brand:'LG',name:'LG UltraGear 27GN800-B 27″ QHD 144 Гц',model:'27GN800-B',price:179990,icon:'▣',sourceUrl:'https://www.lg.com/us/monitors/lg-27gn800-b-gaming-monitor',specs:{'Экран':{'Диагональ, дюймы':27,'Разрешение':'2560 × 1440','Частота обновления, Гц':144,'Тип матрицы':'IPS','Время отклика':'1 мс GtG'}}},
  {id:'mouse-g502x',cat:'Мыши',brand:'Logitech G',name:'Logitech G502 X Wired',model:'G502 X',price:44990,icon:'🖱',sourceUrl:'https://www.logitechg.com/en-gb/products/gaming-mice/g502-x-wired-lightforce.910-006146.html',specs:{'Сенсор':{'Максимальное разрешение, DPI':25600,'Вес, г':89},'Подключение':{'Тип':'Проводное USB','Переключатели':'LIGHTFORCE'}}},
  {id:'webcam-c920',cat:'Веб-камеры',brand:'Logitech',name:'Logitech C920 HD Pro Webcam',model:'C920',price:49990,icon:'◉',sourceUrl:'https://www.logitech.com/assets/52363/logitech-webcam-c920c-datasheetweb.pdf',specs:{'Видео':{'Максимальное разрешение':'1920 × 1080','Частота кадров':'До 30 кадров/с'},'Подключение':{'Тип':'USB-A'}}},
  {id:'keyboard-g413se',cat:'Клавиатуры',brand:'Logitech G',name:'Logitech G413 SE Full-Size',model:'G413 SE',price:49990,icon:'⌨',sourceUrl:'https://www.logitechg.com/en-us/shop/p/g413-se-gaming-keyboard',specs:{'Клавиатура':{'Формат':'Полноразмерная','Переключатели':'Механические тактильные','Подсветка':'Белая'},'Подключение':{'Тип':'Проводное USB'}}},
  {id:'router-archer-ax55',cat:'Маршрутизаторы',brand:'TP-Link',name:'TP-Link Archer AX55 Wi-Fi 6',model:'Archer AX55',price:69990,icon:'⌁',sourceUrl:'https://www.tp-link.com/uk/home-networking/wifi-router/archer-ax55/',specs:{'Беспроводная сеть':{'Стандарт':'Wi-Fi 6 (802.11ax)','Диапазоны':'2.4 ГГц и 5 ГГц','Заявленная суммарная скорость':'AX3000'},'Подключение':{'WAN':'Gigabit Ethernet','LAN':'Gigabit Ethernet'}}},
  {id:'hdd-barracuda-2tb',cat:'Жёсткие диски',brand:'Seagate',name:'Seagate BarraCuda 2 ТБ 3.5″ SATA',model:'ST2000DM008',price:39990,icon:'◉',sourceUrl:'https://www.seagate.com/content/dam/seagate/en/content-fragments/products/datasheets/barracuda-3-5-hdd/barracuda-3-5-hdd-DS17-2-2603US-en_US.pdf',specs:{'Накопитель':{'Интерфейс':'SATA 6 Гбит/с','Объём, ГБ':2000,'Форм-фактор':'3.5 дюйма','Скорость вращения, об/мин':7200,'Кэш, МБ':256,'Технология записи':'SMR'}}},
  {id:'headset-cloud-iii',cat:'Гарнитуры',brand:'HyperX',name:'HyperX Cloud III Wired',model:'Cloud III',price:59990,icon:'◖',sourceUrl:'https://hyperx.com/blogs/press/hyperx-announces-cloud-iii-gaming-headset',specs:{'Наушники':{'Излучатели':'Динамические, 53 мм','Конструкция':'Охватывающие, закрытые','Сопротивление':'64 Ом'},'Микрофон':{'Тип':'Электретный конденсаторный, 10 мм','Подключение':'3.5 мм, USB-C, USB-A'}}},
  {id:'mic-wave3',cat:'Микрофоны',brand:'Elgato',name:'Elgato Wave:3 MK.2 USB-C',model:'Wave:3 MK.2',price:89990,icon:'🎙',sourceUrl:'https://www.elgato.com/us/en/p/wave-3',specs:{'Капсюль':{'Тип':'Конденсаторный, 16 мм','Диаграмма направленности':'Кардиоидная','Разрядность':'24 бит','Частота дискретизации':'48 кГц'},'Подключение':{'Интерфейс':'USB-C','Выход на наушники':'3.5 мм'}}}
 ];
 items.forEach(item=>{item.demo=true;item.buildable=false;window.COMPONENTO_CATALOG.push(item)});
 Object.assign(window.COMPONENTO_COMPAT,{
  'gpu-rx7800xt':{kind:'gpu',power:263,minPsu:700,conn:'2x8pin',len:267},
  'psu-focus850':{kind:'psu',watts:850,conn:['8pin','16pin'],eightPinCount:3},
  'ssd-870evo-1tb':{kind:'ssd',iface:'SATA'},
  'hdd-barracuda-2tb':{kind:'hdd',iface:'SATA'}
 });
 window.COMPONENTO_CATALOG_VERSION=2;
})();

// Stable catalog metadata defaults shared by cards, search, and comparison.
window.COMPONENTO_CATALOG.forEach(product=>{
 if(!product.model)product.model=product.name;
 product.demo=true;
});
