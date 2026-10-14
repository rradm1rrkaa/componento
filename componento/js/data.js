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
window.COMPONENTO_VERSION=1;
})();
