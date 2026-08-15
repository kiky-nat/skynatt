window.SKY_CONFIG = {
  supabaseUrl: 'https://fslcpzwnribbbprnbslc.supabase.co',
  supabaseAnonKey: 'sb_publishable_eMzZKx55m4Xm2hGPyE1I9w_ew42KK3s',
  links: {
    vgen: 'https://vgen.co/',
    etsy: 'https://www.etsy.com/',
    kofi: 'https://ko-fi.com/',
    wishlist: '#',
    twitch: 'https://www.twitch.tv/',
    twitter: 'https://x.com/SkyNattArts',
    instagram: 'https://www.instagram.com/',
    discord: '#'
  },
  assets: {
    hero: 'assets/hero-pose.png',
    logo: 'assets/logo.svg',
    easterEgg: 'assets/easter.png',
    floating: {
      star: 'assets/floating/star.png',
      moon: 'assets/floating/moon.png',
      sparkle: 'assets/floating/sparkle.png',
      diamond: 'assets/floating/diamond.png',
      starSmall: 'assets/floating/star-small.png'
    }
  },
  floatingDecor: [
    { id: 'star', src: 'assets/floating/star.png', fallback: '✦', className: 'float-star', left: '7%', top: '24vh' },
    { id: 'sparkle', src: 'assets/floating/sparkle.png', fallback: '✧', className: 'float-sparkle', right: '12%', top: '58vh' },
    { id: 'moon', src: 'assets/floating/moon.png', fallback: '☾', className: 'float-moon', left: '3%', top: '115vh' },
    { id: 'starSmall', src: 'assets/floating/star-small.png', fallback: '✦', className: 'float-star-small', right: '6%', top: '170vh' },
    { id: 'diamond', src: 'assets/floating/diamond.png', fallback: '♢', className: 'float-diamond', right: '21%', top: '80vh' }
  ],
  slots: {
    '2026-08-22': 'OPEN',
    '2026-08-29': 'RESERVED'
  },
  gallery: Array.from({ length: 6 }, (_, i) => ({
    id: `work-${i + 1}`,
    src: `assets/gallery/work-${i + 1}.svg`,
    alt: `SkyNatt artwork ${i + 1}`,
    titleEs: `Creación ${i + 1}`,
    titleEn: `Creation ${i + 1}`,
    tags: ['art']
  })),
  resources: [
    { id: 'agenda', cat: 'planning', nameEs: 'Agenda digital', nameEn: 'Digital planner', descEs: 'Agenda fija con opción de personalización futura.', descEn: 'Fixed planner with a future customization option.', image: 'assets/products/product-1.svg', vgen: 'https://vgen.co/', etsy: 'https://www.etsy.com/', tags: ['agenda', 'planning'], customizable: true },
    { id: 'notion', cat: 'planning', nameEs: 'Plantillas Notion', nameEn: 'Notion templates', descEs: 'Sistemas para estudio, trabajo y organización diaria.', descEn: 'Systems for study, work and everyday organization.', image: 'assets/products/product-2.svg', vgen: 'https://vgen.co/', etsy: 'https://www.etsy.com/', tags: ['notion', 'planning'], customizable: true },
    { id: 'goodnotes', cat: 'study', nameEs: 'Plantillas GoodNotes', nameEn: 'GoodNotes templates', descEs: 'Plantillas digitales para planificar y estudiar.', descEn: 'Digital templates for planning and study.', image: 'assets/products/product-3.svg', vgen: 'https://vgen.co/', etsy: 'https://www.etsy.com/', tags: ['goodnotes', 'study'], customizable: true },
    { id: 'emotes', cat: 'stream', nameEs: 'Emotes chibi custom', nameEn: 'Custom chibi emotes', descEs: 'Comisiones custom disponibles próximamente.', descEn: 'Custom commissions coming soon.', image: 'assets/products/product-4.svg', vgen: 'https://vgen.co/', etsy: 'https://www.etsy.com/', tags: ['emotes', 'stream'], customizable: false },
    { id: 'stream', cat: 'stream', nameEs: 'Widgets & overlays', nameEn: 'Widgets & overlays', descEs: 'Productos prediseñados para streamers.', descEn: 'Ready-made products for streamers.', image: 'assets/products/product-5.svg', vgen: 'https://vgen.co/', etsy: 'https://www.etsy.com/', tags: ['widgets', 'overlay', 'stream'], customizable: false },
    { id: 'study', cat: 'study', nameEs: 'Study & organización', nameEn: 'Study & organization', descEs: 'Recursos para estudiantes, profesores y organización.', descEn: 'Resources for students, teachers and organization.', image: 'assets/products/product-6.svg', vgen: 'https://vgen.co/', etsy: 'https://www.etsy.com/', tags: ['study', 'teacher', 'planning'], customizable: false }
  ],
  setup: [
    ['Laptop', '13th Gen Intel(R) Core(TM) i5-13500H · 2.60 GHz · 16 GB RAM · NVIDIA GeForce RTX 4060'],
    ['Graphics tablet', 'XP-Pen Artist 15.6 Pro'],
    ['Microphone', 'FIFINE K688'],
    ['Creative setup', 'Art · VTubing · streaming · digital products']
  ],
  lastStream: { titleEs: 'Añade tu último directo', titleEn: 'Add your latest stream', textEs: 'Conecta Twitch desde Admin para automatizar esta información.', textEn: 'Connect Twitch from Admin to automate this information.' },
  nextStream: { titleEs: 'Añade tu próximo stream', titleEn: 'Add your next stream', textEs: 'Puedes definirlo desde Admin mientras conectas la automatización.', textEn: 'You can set it from Admin while the automation is being connected.' },
  socialPosts: [],
  testimonials: []
};
