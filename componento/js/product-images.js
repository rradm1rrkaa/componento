// Local product photography and the page where each image was found.
(function () {
  'use strict';
  const photos = {
    'cpu-5600x': ['cpu-5600x.jpg', 'https://ibertronica.es/amd-ryzen-5-5600x-46ghz-socket-am4'],
    'cpu-7600': ['cpu-7600.jpg', 'https://ibertronica.es/amd-ryzen-5-7600-38ghz-socket-am5'],
    'cpu-12400f': ['cpu-12400f.jpg', 'https://duonglong.vn/cpu-intel-core-i5-12400f'],
    'cpu-13400f': ['cpu-13400f.jpg', 'https://www.mytek.tn/processeur-intel-core-i5-13400f-box-lga-1700.html'],
    'gpu-4060': ['gpu-4060.jpg', 'https://www.topachat.com/pages/detail2_cat_est_micro_puis_rubrique_est_wgfx_pcie_puis_ref_est_in20019027.html'],
    'gpu-4070': ['gpu-4070.png', 'https://www.asus.com/tw/motherboards-components/graphics-cards/dual/dual-rtx4070-12g-evo/'],
    'gpu-7600': ['gpu-7600.png', 'https://www.supertechtt.com/gigabyte-radeon-rx-7600-gaming-oc-8g-graphics-card.html'],
    'gpu-rx7800xt': ['gpu-rx7800xt.jpg', 'https://global.techradar.com/it-it/computing/gpu/recensione-amd-radeon-rx-7800-xt-review'],
    'ram-d4-16': ['ram-d4-16.jpg', 'https://www.jumbo-computer.com/en/products/kingston-16gb-kit-2x8gb-kf432c16bbk2-16-fury-beast-ddr4-3200mhz-memory'],
    'ram-d5-32': ['ram-d5-32.jpg', 'https://xstore.md/componente-pc/memorii-ram/kingston-fury-beast-kf560c36bbek232'],
    'ssd-980': ['ssd-980.jpg', 'https://my.rs-online.com/web/p/hard-drives/2842147'],
    'ssd-sn580': ['ssd-sn580.png', 'https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn580-nvme-ssd?sku=WDS100T3B0E-00CHF0'],
    'ssd-870evo-1tb': ['ssd-870evo-1tb.png', 'https://www.samsung.com/sec/memory-storage/MZ-77E1T0BW-d2c/MZ-77E1T0BW/'],
    'mb-b450': ['mb-b450.png', 'https://www.asus.com/uk/motherboards-components/motherboards/prime/prime-b450m-a-ii/'],
    'mb-b650': ['mb-b650.jpg', 'https://www.amazon.it/MSI-B650M-Scheda-madre-Micro-ATX/dp/B0BDS8TC1G'],
    'mb-b660': ['mb-b660.jpg', 'https://hacom.vn/mainboard-msi-pro-b660m-a-ddr4'],
    'psu-cv550': ['psu-cv550.jpg', 'https://www.neowin.net/news/pc-build-guide-budget-intel-10th-gen-pc-for-less-than-550/'],
    'psu-rm750e': ['psu-rm750e.jpg', 'https://www.shi.com/product/45905691/CORSAIR-RMe-Series-RM750e'],
    'psu-focus850': ['psu-focus850.png', 'https://www.cclonline.com/focus-gx-850-v4-850w-seasonic-focus-gx-atx-3-1-modular-80-plus-gold-psu-496473/'],
    'case-4000d': ['case-4000d.png', 'https://www.invidcomputers.com/gabinete-corsair-4000d-airflow-mid-tower-tg-fan-x2-black-1904---det--0413090'],
    'case-h510': ['case-h510.jpg', 'https://www.pccasegear.com/products/46863/nzxt-h510-mid-tower-case-matte-black-black'],
    'cool-ak400': ['cool-ak400.jpg', 'https://www.probitz.ro/pc-componente-software/cpu-cooler-deepcool-ak400.html'],
    'cool-pa120': ['cool-pa120.jpg', 'https://computerorbit.com/products/thermalright-peerless-assassin-120-se-dual-tower-air-cooler'],
    'monitor-lg-27gn800': ['monitor-lg-27gn800.jpg', 'https://www.lg.com/ca_en/monitors/gaming/27gn800-b/'],
    'mouse-g502x': ['mouse-g502x.jpg', 'https://www.logitechg.com/en-gb/products/gaming-mice/g502-x-wired-lightforce.910-006146.html'],
    'webcam-c920': ['webcam-c920.png', 'https://idea.uz/product/5147-veb-kamera-logitech-c920-hd-prowebcam'],
    'keyboard-g413se': ['keyboard-g413se.png', 'https://www.logitechg.com/it-it/shop/p/g413-se-gaming-keyboard'],
    'router-archer-ax55': ['router-archer-ax55.png', 'https://www.tp-link.com/uk/home-networking/wifi-router/archer-ax55/'],
    'hdd-barracuda-2tb': ['hdd-barracuda-2tb.png', 'https://www.reichelt.com/de/en/shop/product/2-tb_hard_drive_seagate_barracuda_-_desktop-219877'],
    'headset-cloud-iii': ['headset-cloud-iii.jpg', 'https://ca.hyperx.com/products/hyperx-cloud-iii-wired-gaming-headset'],
    'mic-wave3': ['mic-wave3.png', 'https://www.elgato.com/us/en/p/wave-3']
  };
  (window.COMPONENTO_CATALOG || []).forEach(product => {
    const photo = photos[product.id];
    if (!photo) return;
    product.image = 'assets/products/' + photo[0];
    product.imageSource = photo[1];
  });
})();
