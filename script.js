/* SkyNatt Studio — single frontend controller.
 * Works in two modes:
 * 1) Production: Supabase configured -> shared data/auth/storage.
 * 2) Preview/offline: no Supabase -> localStorage fallback, so the site never hangs.
 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.SKY_CONFIG || {};
  const STORAGE = 'skynatt-site-data-v9';
  const LANG_KEY = 'sky-lang';
  const THEME_KEY = 'sky-theme';
  let lang = localStorage.getItem(LANG_KEY) || 'es';
  let db = null;
  let adminUser = null;
  let adminAllowed = false;
  let currentGalleryLimit = 6;
  let galleryExpanded = false;
  let currentCalendarDate = new Date();
  let adminCalendarDate = new Date();

  const T = {
    es: {
      navAbout:'Sobre mí',navCreations:'Creaciones',navShop:'Tienda',navCommissions:'Comisiones',navStudio:'Studio',navTerms:'Términos',navAccount:'Cuenta',navDownloads:'Descargas',
      heroEyebrow:'✦ ONI OF THE INTERSPACE ✦',heroTitle:'Hola, soy <span>SkyNatt</span>.',heroLead:'VTuber · Artista · Creadora',heroText:'Un pequeño rincón entre estrellas, arte, streams y recursos digitales.',heroWork:'Ver mis trabajos',heroShop:'Explorar tienda',heroMini:'2 slots de comisión al mes',heroMini2:'Arte · VTubing · Planning',
      aboutKicker:'SOBRE SKYNATT',aboutTitle:'Un pequeño mundo entre estrellas.',aboutText:'Soy SkyNatt, una VTuber oni y artista digital. Creo ilustraciones, emotes y recursos para streamers, pero también agendas, plantillas y herramientas digitales para estudiantes, profesores y cualquier persona que quiera organizarse a su manera.',aboutQuote:'Quiero crear cosas bonitas que también tengan un lugar útil en tu día a día.',
      creationKicker:'CREACIONES',creationTitle:'Cosas que he creado.',creationText:'Ilustraciones, overlays, emotes, agendas y proyectos desde el interspace.',viewMore:'Ver más creaciones ↓',viewLess:'Mostrar menos ↑',
      shopKicker:'SHOP',shopTitle:'Recursos para tu propio mundo.',shopText:'Productos fijos en Etsy y VGen. Algunas fichas tendrán una opción de personalización aparte.',filterAll:'Todo',filterStream:'Stream',filterPlanning:'Planning',filterStudy:'Estudio',buyVgen:'VGen ↗',buyEtsy:'Etsy ↗',customize:'Personalizar',fixedProduct:'Producto fijo',
      commissionKicker:'COMMISSIONS',commissionTitle:'Dos espacios cada mes.',commissionText:'Consulta aquí los días que están abiertos, reservados o cerrados.',commissionCardTitle:'Comisiona conmigo',commissionCardText:'Emotes chibi custom y otros encargos disponibles según calendario.',supportCardTitle:'Support SkyNatt',supportCardText:'VGen, Etsy, Ko-fi y wishlist para apoyar el proyecto.',
      streamKicker:'STREAM',streamTitle:'En directo.',lastStream:'ÚLTIMO DIRECTO',nextStream:'PRÓXIMO STREAM',moreStudio:'Ver más',
      testKicker:'TESTIMONIOS',testTitle:'Lo que dicen.',testText:'Solo aparecen comentarios que SkyNatt haya aprobado.',
      communityKicker:'COMUNIDAD',communityTitle:'Tu rincón dentro de SkyNatt.',communityText:'Todo lo que necesitas para participar, guardar tus compras y conocer un poco más del proyecto.',communityGuest:'Guestbook',communityGuestText:'Deja un mensaje para SkyNatt.',communityAccount:'Mi cuenta',communityAccountText:'Crea o inicia sesión cuando quieras.',communityDownloads:'Mis descargas',communityDownloadsText:'Accede a tus productos y herramientas.',communityCustomizer:'Personalización',communityCustomizerText:'Agenda y recursos personalizables · Coming soon.',communityTerms:'Términos y reglas',communityTermsText:'Consulta las condiciones antes de comprar.',communitySetup:'My Setup',communitySetupText:'Conoce las herramientas que uso para crear.',
      guestKicker:'GUESTBOOK',guestTitle:'Deja un mensajito.',guestText:'Los mensajes pasan primero por moderación.',nameLabel:'Nombre',messageLabel:'Mensaje',anonymous:'Mostrarme como anónimo',send:'Enviar ✦',guestNote:'Tu mensaje queda pendiente de moderación.',guestEmpty:'Todavía no hay mensajes aprobados. Sé el primero ✦',
      setupKicker:'MY SETUP',setupTitle:'El rincón donde creo.',downloadKicker:'MY DOWNLOADS',downloadTitle:'Tus compras, en un solo lugar.',downloadText:'Consulta tus productos y abre las herramientas disponibles.',accountBtn:'Crear / abrir mi cuenta',downloadsBtn:'Ver mis descargas',footerStudio:'Studio',footerTerms:'Términos',footerAccount:'Cuenta',footerDownloads:'Descargas',footerHome:'Home',
      accountKicker:'CUENTA',accountTitle:'Tu espacio personal.',accountText:'La cuenta es opcional. Puedes crearla con un usuario, correo y contraseña, sin pedirte datos personales innecesarios.',createAccountTab:'Crear cuenta',loginAccountTab:'Iniciar sesión',profileTab:'Mi perfil',usernameLabel:'Usuario',emailLabel:'Correo electrónico',passwordLabel:'Contraseña',createAccount:'Crear cuenta',loginAccount:'Iniciar sesión',logout:'Cerrar sesión',goDownloads:'Ir a mis descargas',loggedInAs:'CONECTADO COMO',accountPrivacy:'No necesitas introducir nombre real, dirección, teléfono ni otros datos que no sean necesarios para tu cuenta.',
      purchaseTitle:'Mis productos',demoBadge:'PREPARADO',purchaseNote:'Las compras de Etsy/VGen no se importan automáticamente desde el navegador. Cuando exista una integración autorizada, los productos podrán asignarse aquí.',
      termsTitle:'Términos de Servicio',termsIntro:'Actualizados el 06/12/2025 · Esta página puede actualizarse antes de futuras compras o encargos.',comingTitle:'Personalización, próximamente.',comingText:'La tienda seguirá siendo fija en VGen/Etsy. Cuando un producto tenga personalización, su botón te traerá aquí para configurar tu versión.',comingBadge:'COMING SOON',comingDetails:'La estructura está preparada para agendas, Notion, GoodNotes y otros productos. Esta parte se desarrollará aparte para que sea una experiencia completa.',backShop:'Volver a la tienda',
      adminTitle:'Tu panel de control.',adminText:'Gestiona calendario, Guestbook, testimonios, creaciones, recursos e integraciones desde un solo lugar.',adminQuick:'Acciones rápidas',adminOverview:'Resumen',adminCalendar:'Calendario',adminGuestbook:'Guestbook',adminTestimonials:'Testimonios',adminContent:'Contenido',adminIntegrations:'Conexiones',adminOpenCalendar:'Abrir calendario',adminModerate:'Moderar mensajes',adminManageTestimonials:'Gestionar testimonios',adminPublicMode:'Estado de conexión',
      authRequired:'Inicia sesión con tu cuenta de Admin para entrar.',notAdmin:'Esta cuenta no tiene permisos de administración.',supabaseReady:'Supabase conectado · datos compartidos',localMode:'Modo local · los cambios solo afectan a este navegador',save:'Guardar',delete:'Eliminar',edit:'Editar',newItem:'Nuevo',approved:'Aprobado',pending:'Pendiente',connected:'Conectado',notConnected:'No conectado',saved:'Guardado correctamente.',deleted:'Eliminado.',error:'Ha ocurrido un error.',
      egg1:'you found me ✦',egg2:'the interspace was hiding here',egg3:'a little secret for curious stars',egg4:'✨ thanks for exploring',egg5:'you found the fifth message ✧'
    },
    en: {
      navAbout:'About',navCreations:'Creations',navShop:'Shop',navCommissions:'Commissions',navStudio:'Studio',navTerms:'Terms',navAccount:'Account',navDownloads:'Downloads',
      heroEyebrow:'✦ ONI OF THE INTERSPACE ✦',heroTitle:"Hi, I'm <span>SkyNatt</span>.",heroLead:'VTuber · Artist · Creator',heroText:'A little corner between stars, art, streams and digital resources.',heroWork:'View my work',heroShop:'Explore the shop',heroMini:'2 commission slots / month',heroMini2:'Art · VTubing · Planning',
      aboutKicker:'ABOUT SKYNATT',aboutTitle:'A little world between stars.',aboutText:'I’m SkyNatt, an oni VTuber and digital artist. I create illustrations, emotes and stream assets, but also planners, templates and digital tools for students, teachers and anyone who wants to organize life their own way.',aboutQuote:'I want to make beautiful things that also have a useful place in your everyday life.',
      creationKicker:'CREATIONS',creationTitle:"Things I've made.",creationText:'Illustrations, overlays, emotes, planners and projects from the interspace.',viewMore:'View more creations ↓',viewLess:'Show less ↑',
      shopKicker:'SHOP',shopTitle:'Resources for your own world.',shopText:'Fixed products on Etsy and VGen. Selected listings may have a separate customization option.',filterAll:'All',filterStream:'Stream',filterPlanning:'Planning',filterStudy:'Study',buyVgen:'VGen ↗',buyEtsy:'Etsy ↗',customize:'Customize',fixedProduct:'Fixed product',
      commissionKicker:'COMMISSIONS',commissionTitle:'Two spaces each month.',commissionText:'Check which days are open, reserved or closed.',commissionCardTitle:'Commission me',commissionCardText:'Custom chibi emotes and other commissions according to the calendar.',supportCardTitle:'Support SkyNatt',supportCardText:'VGen, Etsy, Ko-fi and wishlist to support the project.',
      streamKicker:'STREAM',streamTitle:'On stream.',lastStream:'LAST STREAM',nextStream:'NEXT STREAM',moreStudio:'View more',testKicker:'TESTIMONIALS',testTitle:'What people say.',testText:'Only comments approved by SkyNatt are shown.',
      communityKicker:'COMMUNITY',communityTitle:'Your corner inside SkyNatt.',communityText:'Everything you need to participate, keep your purchases and explore the project.',communityGuest:'Guestbook',communityGuestText:'Leave a message for SkyNatt.',communityAccount:'My account',communityAccountText:'Create an account or sign in whenever you want.',communityDownloads:'My downloads',communityDownloadsText:'Access your products and tools.',communityCustomizer:'Customization',communityCustomizerText:'Planners and resources · Coming soon.',communityTerms:'Terms & rules',communityTermsText:'Read the conditions before buying.',communitySetup:'My Setup',communitySetupText:'See the tools I use to create.',
      guestKicker:'GUESTBOOK',guestTitle:'Leave a little message.',guestText:'Messages go through moderation first.',nameLabel:'Name',messageLabel:'Message',anonymous:'Show me as Anonymous',send:'Send ✦',guestNote:'Your message will wait for moderation.',guestEmpty:'No approved messages yet. Be the first ✦',setupKicker:'MY SETUP',setupTitle:'The corner where I create.',downloadKicker:'MY DOWNLOADS',downloadTitle:'Your purchases, in one place.',downloadText:'View your products and open available tools.',accountBtn:'Create / open my account',downloadsBtn:'View my downloads',footerStudio:'Studio',footerTerms:'Terms',footerAccount:'Account',footerDownloads:'Downloads',footerHome:'Home',
      accountKicker:'ACCOUNT',accountTitle:'Your personal space.',accountText:'An account is optional. Create one with a username, email and password without unnecessary personal information.',createAccountTab:'Create account',loginAccountTab:'Sign in',profileTab:'My profile',usernameLabel:'Username',emailLabel:'Email',passwordLabel:'Password',createAccount:'Create account',loginAccount:'Sign in',logout:'Sign out',goDownloads:'Go to my downloads',loggedInAs:'SIGNED IN AS',accountPrivacy:'You do not need to provide your real name, address, phone number or other unnecessary personal information.',
      purchaseTitle:'My products',demoBadge:'READY',purchaseNote:'Etsy/VGen purchases are not imported automatically by the browser. When an authorized integration exists, purchases can be assigned here.',
      termsTitle:'Terms of Service',termsIntro:'Updated 06/12/2025 · This page may be updated before future purchases or commissions.',comingTitle:'Customization, coming soon.',comingText:'The shop stays fixed on VGen/Etsy. When a product supports customization, its button will bring you here to configure your version.',comingBadge:'COMING SOON',comingDetails:'The structure is ready for planners, Notion, GoodNotes and other products. This part will be developed separately as a complete experience.',backShop:'Back to shop',
      adminTitle:'Your control panel.',adminText:'Manage the calendar, Guestbook, testimonials, creations, resources and integrations from one place.',adminQuick:'Quick actions',adminOverview:'Overview',adminCalendar:'Calendar',adminGuestbook:'Guestbook',adminTestimonials:'Testimonials',adminContent:'Content',adminIntegrations:'Integrations',adminOpenCalendar:'Open calendar',adminModerate:'Moderate messages',adminManageTestimonials:'Manage testimonials',adminPublicMode:'Connection status',
      authRequired:'Sign in with your Admin account to enter.',notAdmin:'This account does not have administrator permissions.',supabaseReady:'Supabase connected · shared data',localMode:'Local mode · changes affect this browser only',save:'Save',delete:'Delete',edit:'Edit',newItem:'New',approved:'Approved',pending:'Pending',connected:'Connected',notConnected:'Not connected',saved:'Saved successfully.',deleted:'Deleted.',error:'Something went wrong.',
      egg1:'you found me ✦',egg2:'the interspace was hiding here',egg3:'a little secret for curious stars',egg4:'✨ thanks for exploring',egg5:'you found the fifth message ✧'
    }
  };

  const text = k => (T[lang] && T[lang][k]) || k;
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeUrl = v => { try { const u = new URL(String(v || ''), location.href); return ['http:','https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
  const clone = v => JSON.parse(JSON.stringify(v));

  function localData() {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { return {}; }
  }
  function saveLocal(patch) {
    const d = { ...localData(), ...clone(patch) };
    localStorage.setItem(STORAGE, JSON.stringify(d));
    return d;
  }
  function baseData() {
    const d = localData();
    return {
      gallery: d.gallery || clone(CFG.gallery || []),
      resources: d.resources || clone(CFG.resources || []),
      slots: d.slots || clone(CFG.slots || {}),
      testimonials: d.testimonials || clone(CFG.testimonials || []),
      guestbook: d.guestbook || [],
      lastStream: d.lastStream || clone(CFG.lastStream || {}),
      nextStream: d.nextStream || clone(CFG.nextStream || {}),
      socialPosts: d.socialPosts || clone(CFG.socialPosts || []),
      setup: d.setup || clone(CFG.setup || []),
      links: d.links || clone(CFG.links || {})
    };
  }
  function isSupabaseConfigured() { return !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase?.createClient); }
  function initDb() { if (!db && isSupabaseConfigured()) db = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey); return db; }

  async function select(table, columns='*', queryFn) {
    if (!initDb()) return null;
    let q = db.from(table).select(columns);
    if (queryFn) q = queryFn(q);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
  async function upsert(table, rows) {
    if (!initDb()) return null;
    const { data, error } = await db.from(table).upsert(rows).select();
    if (error) throw error;
    return data;
  }
  async function remove(table, column, value) {
    if (!initDb()) return null;
    const { error } = await db.from(table).delete().eq(column, value);
    if (error) throw error;
  }
  async function settingGet(key) {
    if (!initDb()) return null;
    const { data, error } = await db.from('site_settings').select('value').eq('key', key).maybeSingle();
    if (error) throw error;
    return data?.value ?? null;
  }
  async function settingSet(key, value) {
    if (!initDb()) return;
    const { error } = await db.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  async function integrationGet(key) {
    if (!initDb()) return null;
    const { data, error } = await db.from('site_integrations').select('value').eq('key', key).maybeSingle();
    if (error) throw error;
    return data?.value ?? null;
  }
  async function integrationSet(key, value) {
    if (!initDb()) return;
    const { error } = await db.from('site_integrations').upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  async function uploadAsset(file, folder='uploads') {
    if (!initDb()) return await fileToDataUrl(file);
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g,'');
    const path = `${folder}/${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await db.storage.from('site-assets').upload(path, file, { upsert: false, cacheControl: '31536000' });
    if (error) throw error;
    const { data } = db.storage.from('site-assets').getPublicUrl(path);
    return data.publicUrl;
  }
  const fileToDataUrl = file => new Promise((resolve,reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });

  async function loadPublicData() {
    const local = baseData();
    if (!initDb()) return local;
    try {
      const [gallery, resources, slots, tests, links, lastStream, nextStream, socialPosts] = await Promise.all([
        select('creations','id,src,alt,title_es,title_en,tags,visible,created_at', q => q.eq('visible', true).order('sort_order',{ascending:true}).order('created_at',{ascending:false})),
        select('resources','id,cat,name_es,name_en,desc_es,desc_en,image,vgen,etsy,tags,customizable,visible,sort_order', q => q.eq('visible', true).order('sort_order',{ascending:true}).order('created_at',{ascending:false})),
        select('commission_slots','slot_date,status'),
        select('testimonials','id,name,message,commission,source,approved,created_at', q => q.eq('approved', true).order('created_at',{ascending:false})),
        settingGet('publicLinks'), settingGet('lastStream'), settingGet('nextStream'), settingGet('socialPosts')
      ]);
      return {
        ...local,
        gallery: gallery?.map(x=>({id:x.id,src:x.src,alt:x.alt,titleEs:x.title_es,titleEn:x.title_en,tags:x.tags||[]})) || local.gallery,
        resources: resources?.map(x=>({id:x.id,cat:x.cat,nameEs:x.name_es,nameEn:x.name_en,descEs:x.desc_es,descEn:x.desc_en,image:x.image,vgen:x.vgen,etsy:x.etsy,tags:x.tags||[],customizable:x.customizable})) || local.resources,
        slots: Object.fromEntries((slots||[]).map(x=>[x.slot_date,x.status])),
        testimonials: tests || [],
        links: links || local.links,
        lastStream: lastStream || local.lastStream,
        nextStream: nextStream || local.nextStream,
        socialPosts: socialPosts || local.socialPosts
      };
    } catch (e) { console.warn('Supabase public read failed; using local fallback.', e); return local; }
  }

  async function track(type) {
    const localKey='sky-analytics-local';
    const a=JSON.parse(localStorage.getItem(localKey)||'{}'); a[type]=(a[type]||0)+1; localStorage.setItem(localKey,JSON.stringify(a));
    if (initDb()) { try { await db.from('analytics_events').insert({event_type:type,page:location.pathname}); } catch(e) { console.debug('analytics',e); } }
  }

  function applyTheme() {
    const dark = localStorage.getItem(THEME_KEY)==='dark';
    document.body.classList.toggle('dark', dark);
    const b=$('#theme'); if(b) b.textContent=dark?'☀':'☾';
  }
  function applyLang() {
    document.documentElement.lang=lang;
    $$('[data-i18n]').forEach(el => { const k=el.dataset.i18n; if(T[lang][k]!==undefined) el.innerHTML=T[lang][k]; });
    const l=$('#lang'); if(l) l.textContent=lang==='es'?'EN':'ES';
    applyTheme();
  }
  function wireBasic() {
    $('#lang')?.addEventListener('click',()=>{lang=lang==='es'?'en':'es';localStorage.setItem(LANG_KEY,lang);applyLang();renderAll().catch(console.error);});
    $('#theme')?.addEventListener('click',()=>{localStorage.setItem(THEME_KEY,document.body.classList.contains('dark')?'light':'dark');applyTheme();});
    $('#menu')?.addEventListener('click',()=>document.body.classList.toggle('menu-open'));
    document.addEventListener('click',e=>{const a=e.target.closest('[data-link]'); if(a){e.preventDefault();const d=baseData();a.href=safeUrl(d.links?.[a.dataset.link]||CFG.links?.[a.dataset.link]); if(a.href!=='#') window.open(a.href,'_blank','noopener');}});
    document.addEventListener('click',e=>{const a=e.target.closest('a[data-track]'); if(a) track('click');});
  }

  function createFloatingDecor() {
    const root=$('.floating-decor'); if(!root || root.dataset.ready) return; root.dataset.ready='1'; root.innerHTML='';
    (CFG.floatingDecor||[]).forEach((d,i)=>{
      const el=document.createElement('span'); el.className=`drag-item ${d.className||''}`; el.dataset.drag=d.id; el.dataset.originalLeft=d.left||''; el.dataset.originalRight=d.right||''; el.dataset.originalTop=d.top||''; el.dataset.originalIndex=i;
      Object.assign(el.style,{left:d.left||'auto',right:d.right||'auto',top:d.top||'0'});
      const img=document.createElement('img'); img.src=d.src; img.alt=''; img.draggable=false;
      img.onerror=()=>{el.textContent=d.fallback||'✦';el.classList.add('fallback-glyph');}; el.appendChild(img); root.appendChild(el);
    });
    setupDrag(root);
  }
  function setupDrag(root) {
    let active=null,startX=0,startY=0,origX=0,origY=0;
    root.addEventListener('pointerdown',e=>{
      const el=e.target.closest('[data-drag]'); if(!el) return;
      active=el; active.setPointerCapture?.(e.pointerId); active.classList.add('dragging');
      const r=el.getBoundingClientRect(); startX=e.clientX;startY=e.clientY;origX=r.left;origY=r.top; e.preventDefault();
    });
    root.addEventListener('pointermove',e=>{if(!active)return;const dx=e.clientX-startX,dy=e.clientY-startY;active.style.left=`${origX+dx}px`;active.style.top=`${origY+dy+window.scrollY}px`;active.style.right='auto';active.style.transition='none';});
    const finish=()=>{if(!active)return;const el=active;el.classList.remove('dragging');el.style.transition='';el.style.left=el.dataset.originalLeft||'auto';el.style.right=el.dataset.originalRight||'auto';el.style.top=el.dataset.originalTop||'0';active=null;};
    root.addEventListener('pointerup',finish);root.addEventListener('pointercancel',finish);root.addEventListener('lostpointercapture',finish);
  }

  function setupCursor() {
    const c=$('#cursor'); if(!c || matchMedia('(pointer:coarse)').matches) return;
    let x=-100,y=-100; let raf=0;
    addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(!raf){raf=requestAnimationFrame(()=>{c.style.transform=`translate3d(${x}px,${y}px,0)`;raf=0;});} if(Math.random()<.16) spawnCursorSpark(x,y);});
  }
  function spawnCursorSpark(x,y){const s=document.createElement('span');s.className='cursor-spark';s.style.left=`${x}px`;s.style.top=`${y}px`;document.body.appendChild(s);setTimeout(()=>s.remove(),650);}
  function setupScrollStars(){const root=$('#stars');if(!root)return;let last=0;addEventListener('scroll',()=>{const now=performance.now();if(now-last<180)return;last=now;const s=document.createElement('span');s.textContent=['✦','✧','⋆'][Math.floor(Math.random()*3)];s.style.left=`${8+Math.random()*84}%`;s.style.top=`${window.scrollY+window.innerHeight-20}px`;root.appendChild(s);setTimeout(()=>s.remove(),1500);});}

  function setupEaster(){const e=$('.easter');if(!e)return;const img=$('img',e);if(img)img.onerror=()=>{img.src='assets/easter.svg';};const messages=[text('egg1'),text('egg2'),text('egg3'),text('egg4'),text('egg5')];let i=0;e.addEventListener('mouseenter',()=>{const span=$('.easter-message',e);if(span){span.textContent=messages[i%messages.length];i++;}});}

  function productText(x){return {name:lang==='es'?x.nameEs:x.nameEn,desc:lang==='es'?x.descEs:x.descEn};}
  function renderGallery(data) {
    const list = data.gallery || [];
    const visibleCount = galleryExpanded ? list.length : 6;
    const shown = list.slice(0, visibleCount);
    const masonry = $('#gallery');

    if (!masonry) return;

    masonry.innerHTML = shown.map((item, index) => `
      <figure class="masonry-item m${(index % 3) + 1}">
        <img
          loading="lazy"
          decoding="async"
          src="${safeUrl(item.src)}"
          alt="${esc(item.alt || 'SkyNatt creation')}"
        >
        <figcaption>
          <b>${esc(lang === 'es' ? item.titleEs : item.titleEn)}</b>
          <small>${esc((item.tags || []).join(' · '))}</small>
        </figcaption>
      </figure>
    `).join('');

    const button = $('#viewMoreCreations');

    if (!button) return;

    // Six or fewer creations: no button at all.
    if (list.length <= 6) {
      button.hidden = true;
      return;
    }

    button.hidden = false;
    button.textContent = galleryExpanded
      ? text('viewLess')
      : text('viewMore');

    button.onclick = () => {
      galleryExpanded = !galleryExpanded;
      renderGallery(data);
    };
  }
  function renderProducts(data){const root=$('#products');if(!root)return;const resources=data.resources||[];const filter=$('.filter.active')?.dataset.filter||'all';const list=filter==='all'?resources:resources.filter(x=>x.cat===filter);root.innerHTML=list.map(x=>{const p=productText(x);return `<article class="product"><img loading="lazy" decoding="async" src="${safeUrl(x.image)}" alt="${esc(p.name)}"><div class="product-body"><span class="product-cat">${esc(x.cat)}</span><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="tag-row">${(x.tags||[]).slice(0,5).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="product-actions">${x.vgen?`<a class="btn small primary" target="_blank" rel="noopener" href="${safeUrl(x.vgen)}">${text('buyVgen')}</a>`:''}${x.etsy?`<a class="btn small ghost" target="_blank" rel="noopener" href="${safeUrl(x.etsy)}">${text('buyEtsy')}</a>`:''}${x.customizable?`<a class="btn small ghost" href="customizer.html?product=${encodeURIComponent(x.id)}">${text('customize')}</a>`:`<span class="product-fixed">${text('fixedProduct')}</span>`}</div></div></article>`}).join('');
    $$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(data);});
  }
  function renderCalendar(data){const root=$('#calendarGrid');if(!root)return;const y=currentCalendarDate.getFullYear(),m=currentCalendarDate.getMonth();$('#calendarTitle').textContent=new Intl.DateTimeFormat(lang,{month:'long',year:'numeric'}).format(currentCalendarDate);const first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();let h='';for(let i=0;i<first;i++)h+='<div class="day blank"></div>';for(let d=1;d<=days;d++){const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,status=data.slots?.[key]||'CLOSED';h+=`<div class="day ${status.toLowerCase()}"><b>${d}</b><small>${status}</small></div>`;}root.innerHTML=h;$('#prevMonth')?.addEventListener('click',()=>{currentCalendarDate.setMonth(currentCalendarDate.getMonth()-1);renderCalendar(data)},{once:true});$('#nextMonth')?.addEventListener('click',()=>{currentCalendarDate.setMonth(currentCalendarDate.getMonth()+1);renderCalendar(data)},{once:true});}
  function renderStreams(data){const l=data.lastStream||{},n=data.nextStream||{};$('#lastStreamTitle')&&( $('#lastStreamTitle').textContent=lang==='es'?l.titleEs||'—':l.titleEn||l.titleEs||'—');$('#lastStreamText')&&( $('#lastStreamText').textContent=lang==='es'?l.textEs||'':l.textEn||l.textEs||'');$('#nextStreamTitle')&&( $('#nextStreamTitle').textContent=lang==='es'?n.titleEs||'—':n.titleEn||n.titleEs||'—');$('#nextStreamText')&&( $('#nextStreamText').textContent=lang==='es'?n.textEs||'':n.textEn||n.textEs||'');}
  function renderTestimonials(data){const root=$('#testimonialsList');if(!root)return;const list=(data.testimonials||[]).slice(0,6);root.innerHTML=list.map(x=>`<article class="testimonial"><div class="stars">★★★★★</div><p>“${esc(x.message)}”</p><small>— ${esc(x.name)}${x.source?` · ${esc(x.source)}`:''}</small></article>`).join('')||`<article class="testimonial"><p>${text('guestEmpty')}</p></article>`;}
  function renderSetup(data){const root=$('#setupGrid');if(!root)return;root.innerHTML=(data.setup||[]).map((x,i)=>`<article><span>${['💻','✎','🎙️','✦'][i]||'✦'}</span><b>${esc(x[0])}</b><p class="muted">${esc(x[1])}</p></article>`).join('');}
  function renderSocial(data) {
    const root = $('#socialPosts');
    if (!root) return;

    const posts = (data.socialPosts || []).slice(0, 6);

    if (!posts.length) {
      const fallback = [
        {
          label: 'Instagram',
          textEs: 'Aquí aparecerán mis últimos posts y novedades.',
          textEn: 'My latest posts and updates will appear here.',
          link: data.links?.instagram || '#'
        },
        {
          label: 'X / Twitter',
          textEs: 'Pequeños avances, dibujos y noticias del proyecto.',
          textEn: 'Little updates, drawings and project news.',
          link: data.links?.twitter || '#'
        },
        {
          label: 'Twitch',
          textEs: 'Directos, arte y momentos del interspace.',
          textEn: 'Streams, art and moments from the interspace.',
          link: data.links?.twitch || '#'
        }
      ];

      root.innerHTML = fallback.map(post => `
        <article class="social-post social-placeholder">
          <small>${esc(post.label)}</small>
          <p>${esc(lang === 'es' ? post.textEs : post.textEn)}</p>
          <a target="_blank" rel="noopener" href="${safeUrl(post.link)}">
            ${lang === 'es' ? 'Visitar ↗' : 'Visit ↗'}
          </a>
        </article>
      `).join('');
      return;
    }

    root.innerHTML = posts.map(post => `
      <article class="social-post">
        <small>${esc(post.date || '')}</small>
        <p>${esc(lang === 'es' ? post.textEs || post.textEn : post.textEn || post.textEs)}</p>
        <a
          target="_blank"
          rel="noopener"
          href="${safeUrl(post.url && data.links?.[post.url] || post.url)}"
        >↗</a>
      </article>
    `).join('');
  }
  function renderGuestbook(data){const root=$('#guestList');if(!root)return;selectApprovedGuests(data).then(list=>{root.innerHTML=list.map(x=>`<article class="guest"><b>${esc(x.name||'Anonymous')}</b><p>${esc(x.message)}</p><small>${new Date(x.created_at||Date.now()).toLocaleDateString(lang)}</small></article>`).join('')||`<article class="guest"><p>${text('guestEmpty')}</p></article>`;});}
  async function selectApprovedGuests(data){if(initDb()){try{return await select('guestbook','id,name,message,created_at',q=>q.eq('approved',true).order('created_at',{ascending:false}).limit(30))||[];}catch(e){console.warn(e)}}return data.guestbook||[];}

  async function setupGuestbook(){const form=$('#guestForm');if(!form)return;form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form);const name=f.get('anonymous')?'Anonymous':String(f.get('name')||'Anonymous').trim()||'Anonymous';const message=String(f.get('message')||'').trim();if(!message)return;try{if(initDb()) await db.from('guestbook').insert({name,message,approved:false});else {const d=baseData();d.guestbook=[...(d.guestbook||[]),{name,message,approved:false,created_at:new Date().toISOString()}];saveLocal({guestbook:d.guestbook});}form.reset();$('#guestStatus').textContent=text('guestNote');toast(text('saved'));track('guestbook_submit');}catch(err){console.error(err);toast(text('error'));}};}

  function toast(message){const t=$('#toast');if(!t)return;t.textContent=message;t.className='toast-show';clearTimeout(t._timer);t._timer=setTimeout(()=>t.className='',2400);}
  function observeReveals(){const els=$$('.reveal');if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});els.forEach(e=>io.observe(e));}

  async function renderAll(){const data=await loadPublicData();renderGallery(data);renderProducts(data);renderCalendar(data);renderStreams(data);renderTestimonials(data);renderSetup(data);renderSocial(data);renderGuestbook(data);wireLinks(data);return data;}
  function wireLinks(data=baseData()){$$('[data-link]').forEach(a=>{const u=data.links?.[a.dataset.link]||CFG.links?.[a.dataset.link]||'#';if(u&&u!=='#')a.href=safeUrl(u);});}

  async function setupAccount(){const create=$('#createAccountForm'),login=$('#loginForm');if(!create&&!login)return;const profilePane=$('#profilePane');
    const setTab=t=>{$$('.account-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));$('#createPane')&&( $('#createPane').hidden=t!=='create');$('#loginPane')&&( $('#loginPane').hidden=t!=='login');if(profilePane)profilePane.hidden=t!=='profile';};
    $$('.account-tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
    if(initDb()){
      const {data:{session}}=await db.auth.getSession();renderAuthProfile(session);db.auth.onAuthStateChange((_e,s)=>renderAuthProfile(s));
      create?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(create);try{const email=String(f.get('email')).trim().toLowerCase(),password=String(f.get('password')),username=String(f.get('username')).trim();const {data,error}=await db.auth.signUp({email,password,options:{data:{username}}});if(error)throw error;if(data.user&&!data.session){$('#createStatus').textContent=lang==='es'?'Revisa tu correo para confirmar la cuenta.':'Check your email to confirm your account.';}else{$('#createStatus').textContent=text('saved');setTab('profile');}create.reset();}catch(err){$('#createStatus').textContent=err.message||text('error');}});
      login?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(login);try{const {error}=await db.auth.signInWithPassword({email:String(f.get('email')).trim().toLowerCase(),password:String(f.get('password'))});if(error)throw error;setTab('profile');}catch(err){$('#loginStatus').textContent=err.message||text('error');}});
      $('#logoutAccount')?.addEventListener('click',async()=>{await db.auth.signOut();setTab('login');});
    } else {
      create?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(create),a={username:String(f.get('username')).trim(),email:String(f.get('email')).trim().toLowerCase(),passwordHash:await hashPassword(String(f.get('password')))};saveLocal({account:a,session:{username:a.username,email:a.email}});$('#createStatus').textContent=lang==='es'?'Cuenta creada en este dispositivo.':'Account created on this device.';create.reset();setTab('profile');renderAuthProfile({local:true});});
      login?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(login),d=baseData();if(d.account?.email===String(f.get('email')).trim().toLowerCase()&&d.account.passwordHash===await hashPassword(String(f.get('password')))){saveLocal({session:{username:d.account.username,email:d.account.email}});setTab('profile');renderAuthProfile({local:true});}else $('#loginStatus').textContent=lang==='es'?'Correo o contraseña incorrectos.':'Incorrect email or password.';});
      $('#logoutAccount')?.addEventListener('click',()=>{saveLocal({session:null});setTab('login');renderAuthProfile(null);});
    }
  }
  function renderAuthProfile(session){const user=session?.user||session;const meta=user?.user_metadata||{};if($('#accountUsernameView'))$('#accountUsernameView').textContent=meta.username||user?.username||'—';if($('#accountEmailView'))$('#accountEmailView').textContent=user?.email||'—';}
  async function hashPassword(value){const data=new TextEncoder().encode(value),buf=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');}

  async function setupDownloads() {
    const root = $('#purchaseList');
    if (!root) return;

    const claimForm = $('#purchaseClaimForm');
    const claimStatus = $('#purchaseClaimStatus');

    if (claimForm && initDb() && !claimForm.dataset.ready) {
      claimForm.dataset.ready = '1';
      claimForm.addEventListener('submit', async event => {
        event.preventDefault();
        const form = new FormData(claimForm);
        const reference = String(form.get('orderReference') || '').trim();

        try {
          const { data: sessionData } = await db.auth.getSession();

          if (!sessionData.session) {
            throw new Error(
              lang === 'es'
                ? 'Inicia sesión antes de vincular una compra.'
                : 'Sign in before linking a purchase.'
            );
          }

          const { data, error } = await db.rpc('claim_purchase', {
            order_reference: reference
          });

          if (error) throw error;

          claimStatus.textContent = data
            ? (lang === 'es'
              ? 'Compra vinculada correctamente ✦'
              : 'Purchase linked successfully ✦')
            : (lang === 'es'
              ? 'No encontramos una compra verificada con ese pedido y el correo de tu cuenta.'
              : 'No verified purchase matched that order and your account email.');

          if (data) {
            claimForm.reset();
            await setupDownloads();
          }
        } catch (error) {
          claimStatus.textContent = error.message || text('error');
        }
      });
    }

    let rows = [];

    if (initDb()) {
      const { data: sessionData } = await db.auth.getSession();

      if (sessionData.session) {
        try {
          rows = await select(
            'purchases',
            'id,product_name,description,download_url,source,created_at',
            query => query
              .eq('user_id', sessionData.session.user.id)
              .order('created_at', { ascending: false })
          );
        } catch (error) {
          console.warn(error);
        }
      }
    }

    // Preview fallback only. Real production purchases come from Supabase.
    if (!rows.length && !initDb()) {
      rows = (baseData().resources || [])
        .filter(item => ['agenda', 'notion', 'goodnotes'].includes(item.id))
        .map(item => ({
          id: item.id,
          product_name: lang === 'es' ? item.nameEs : item.nameEn,
          description: lang === 'es' ? item.descEs : item.descEn,
          download_url: item.customizable
            ? `customizer.html?product=${item.id}`
            : ''
        }));
    }

    root.innerHTML = rows.map(item => `
      <div class="purchase-row">
        <div>
          <b>${esc(item.product_name)}</b>
          <p>${esc(item.description || '')}</p>
          ${item.source ? `<small>${esc(item.source)}</small>` : ''}
        </div>
        ${item.download_url
          ? `<a class="btn small primary" href="${safeUrl(item.download_url)}">${lang === 'es' ? 'Abrir' : 'Open'}</a>`
          : ''}
      </div>
    `).join('') || (
      lang === 'es'
        ? '<p class="muted">No hay compras vinculadas a esta cuenta todavía.</p>'
        : '<p class="muted">No purchases are linked to this account yet.</p>'
    );
  }

  function adminGate(){const wrap=$('.admin-wrap');if(!wrap)return;let gate=$('#adminAuthGate');if(!gate){gate=document.createElement('div');gate.id='adminAuthGate';gate.className='admin-auth-gate';gate.innerHTML=`<div class="admin-card"><p class="eyebrow">PRIVATE STUDIO</p><h2>${text('authRequired')}</h2><p class="muted" id="adminAuthStatus"></p><form id="adminLoginForm" class="admin-form"><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label><button class="btn primary">${text('loginAccount')}</button></form><a class="btn ghost" href="account.html">${lang==='es'?'Crear cuenta / Cuenta':'Create account / Account'}</a></div>`;wrap.prepend(gate);}
    const grid=$('.admin-grid');if(grid)grid.hidden=true;return gate;
  }
  async function checkAdmin() {
    if (!$('.admin-page')) return true;

    const gate = adminGate();

    if (!initDb()) {
      gate.hidden = false;
      $('#adminAuthStatus').textContent = lang === 'es'
        ? 'Configura Supabase antes de utilizar el panel privado.'
        : 'Configure Supabase before using the private admin panel.';
      return false;
    }

    const { data: { session } } = await db.auth.getSession();

    if (!session) {
      gate.hidden = false;
      wireAdminLogin();
      return false;
    }

    try {
      const { data, error } = await db.rpc('is_skynatt_admin');
      if (error) throw error;

      if (!data) {
        $('#adminAuthStatus').textContent = text('notAdmin');
        return false;
      }

      adminUser = session.user;
      adminAllowed = true;
      gate.hidden = true;
      $('.admin-grid').hidden = false;
      $('#adminMode').textContent = text('supabaseReady');
      return true;
    } catch (error) {
      console.error(error);
      $('#adminAuthStatus').textContent = error.message || text('error');
      return false;
    }
  }
  function wireAdminLogin(){const f=$('#adminLoginForm');if(!f||f.dataset.ready)return;f.dataset.ready='1';f.onsubmit=async e=>{e.preventDefault();if(!initDb())return;const d=new FormData(f);const {error}=await db.auth.signInWithPassword({email:String(d.get('email')).trim().toLowerCase(),password:String(d.get('password'))});if(error){$('#adminAuthStatus').textContent=error.message;return;}location.reload();};}

  async function adminLoad(table, order='created_at'){if(initDb())return await select(table,'*',q=>q.order(order,{ascending:false}));const d=baseData();return d[table]||[];}
  async function adminRenderStats(){const a=JSON.parse(localStorage.getItem('sky-analytics-local')||'{}');let views=a.page_view||0,interactions=a.click||0,guests=0,tests=0;if(initDb()){try{const v=await db.from('analytics_events').select('id',{count:'exact',head:true}).eq('event_type','page_view');const c=await db.from('analytics_events').select('id',{count:'exact',head:true}).eq('event_type','click');const g=await db.from('guestbook').select('id',{count:'exact',head:true});const t=await db.from('testimonials').select('id',{count:'exact',head:true}).eq('approved',true);views=v.count||0;interactions=c.count||0;guests=g.count||0;tests=t.count||0;}catch(e){console.debug(e);}}else{guests=(baseData().guestbook||[]).length;tests=(baseData().testimonials||[]).filter(x=>x.approved).length;}if($('#statViews'))$('#statViews').textContent=views;if($('#statInteractions'))$('#statInteractions').textContent=interactions;if($('#statGuests'))$('#statGuests').textContent=guests;if($('#statTestimonials'))$('#statTestimonials').textContent=tests;}
  async function adminRenderGuests(){const root=$('#adminGuests');if(!root)return;let rows=[];if(initDb())rows=await adminLoad('guestbook');else rows=baseData().guestbook||[];root.innerHTML=rows.map(x=>`<div class="admin-row"><div><b>${esc(x.name)}</b><p>${esc(x.message)}</p><small>${x.approved?text('approved'):text('pending')}</small></div><div>${x.approved?'':`<button class="btn small primary" data-gapprove="${x.id}">${lang==='es'?'Aprobar':'Approve'}</button>`}</div><button class="btn small danger" data-gdelete="${x.id}">${text('delete')}</button></div>`).join('')||'<p class="muted">No hay mensajes.</p>';
    $$('[data-gapprove]').forEach(b=>b.onclick=async()=>{try{if(initDb())await db.from('guestbook').update({approved:true}).eq('id',b.dataset.gapprove);else{const d=baseData();const x=d.guestbook.find(x=>String(x.id)===b.dataset.gapprove);if(x)x.approved=true;saveLocal({guestbook:d.guestbook});}adminRenderGuests();adminRenderStats();toast(text('saved'));}catch(e){toast(e.message||text('error'));}});
    $$('[data-gdelete]').forEach(b=>b.onclick=async()=>{if(!confirm(lang==='es'?'¿Eliminar este mensaje?':'Delete this message?'))return;try{if(initDb())await remove('guestbook','id',b.dataset.gdelete);else{const d=baseData();d.guestbook=d.guestbook.filter(x=>String(x.id)!==b.dataset.gdelete);saveLocal({guestbook:d.guestbook});}adminRenderGuests();adminRenderStats();toast(text('deleted'));}catch(e){toast(e.message||text('error'));}});
  }
  async function adminRenderTestimonials(){const root=$('#adminTestimonials');if(!root)return;const rows=await adminLoad('testimonials');root.innerHTML=rows.map(x=>`<div class="admin-row"><div><b>${esc(x.name)}</b><p>${esc(x.message)}</p><small>${x.approved?text('approved'):text('pending')} · ${esc(x.source||'')}</small></div><div>${x.approved?'':`<button class="btn small primary" data-tapprove="${x.id}">${lang==='es'?'Aprobar':'Approve'}</button>`}</div><button class="btn small danger" data-tdelete="${x.id}">${text('delete')}</button></div>`).join('')||'<p class="muted">No hay testimonios.</p>';
    $$('[data-tapprove]').forEach(b=>b.onclick=async()=>{try{if(initDb())await db.from('testimonials').update({approved:true}).eq('id',b.dataset.tapprove);else{const d=baseData();const x=d.testimonials.find(x=>String(x.id)===b.dataset.tapprove);if(x)x.approved=true;saveLocal({testimonials:d.testimonials});}adminRenderTestimonials();adminRenderStats();renderTestimonials(baseData());toast(text('saved'));}catch(e){toast(e.message||text('error'));}});
    $$('[data-tdelete]').forEach(b=>b.onclick=async()=>{if(!confirm(lang==='es'?'¿Eliminar este testimonio?':'Delete this testimonial?'))return;try{if(initDb())await remove('testimonials','id',b.dataset.tdelete);else{const d=baseData();d.testimonials=d.testimonials.filter(x=>String(x.id)!==b.dataset.tdelete);saveLocal({testimonials:d.testimonials});}adminRenderTestimonials();adminRenderStats();toast(text('deleted'));}catch(e){toast(e.message||text('error'));}});
  }
  function renderAdminList(root,items,type){if(!root)return;root.innerHTML=items.map((x,i)=>{const title=type==='creation'?(lang==='es'?x.titleEs:x.titleEn):(lang==='es'?x.nameEs:x.nameEn);const img=type==='creation'?x.src:x.image;return `<div class="admin-row content-row"><div class="content-thumb"><img src="${safeUrl(img)}" alt=""></div><div><b>${esc(title)}</b><p>${esc((x.tags||[]).join(' · '))}${x.visible===false?` · <span class="form-note">${lang==='es'?'Oculto':'Hidden'}</span>`:''}</p></div><div><button class="btn small ghost" data-${type}-edit="${i}">${text('edit')}</button><button class="btn small danger" data-${type}-delete="${i}">${text('delete')}</button></div></div>`}).join('')||'<p class="muted">No hay elementos.</p>';}
  async function getAdminContent(table){if(initDb())return await adminLoad(table,'sort_order');const d=baseData();return table==='creations'?(d.gallery||[]):(d[table]||[]);}
  async function setupContentManagers(){const cf=$('#creationForm'),rf=$('#resourceForm');if(!cf||!rf)return;
    let creations=await getAdminContent('creations'),resources=await getAdminContent('resources');
    const refresh=async()=>{creations=await getAdminContent('creations');resources=await getAdminContent('resources');renderAdminList($('#adminCreations'),creations,'creation');renderAdminList($('#adminResources'),resources,'resource');bindEditDelete();};
    async function saveCreation(e){e.preventDefault();const f=new FormData(cf);let src=String(f.get('src')||'').trim();const file=f.get('imageFile');if(file?.size)src=await uploadAsset(file,'creations');const item={id:String(f.get('id')||crypto.randomUUID?.()||Date.now()),src,alt:String(f.get('alt')||f.get('titleEs')||''),titleEs:String(f.get('titleEs')||''),titleEn:String(f.get('titleEn')||f.get('titleEs')||''),tags:String(f.get('tags')||'').split(',').map(x=>x.trim()).filter(Boolean),visible:true};if(!src)throw new Error('Falta la imagen.');if(initDb()){await upsert('creations',{id:item.id,src:item.src,alt:item.alt,title_es:item.titleEs,title_en:item.titleEn,tags:item.tags,visible:f.get('visible')==='on'});}else{const idx=creations.findIndex(x=>x.id===item.id);if(idx>=0)creations[idx]=item;else creations.push(item);saveLocal({gallery:creations});}cf.reset();cf.elements.id.value='';await refresh();await renderAll();toast(text('saved'));}
    async function saveResource(e){e.preventDefault();const f=new FormData(rf);let image=String(f.get('image')||'').trim();const file=f.get('imageFile');if(file?.size)image=await uploadAsset(file,'resources');const item={id:String(f.get('id')||crypto.randomUUID?.()||Date.now()),cat:String(f.get('cat')||'other'),nameEs:String(f.get('nameEs')||''),nameEn:String(f.get('nameEn')||f.get('nameEs')||''),descEs:String(f.get('descEs')||''),descEn:String(f.get('descEn')||f.get('descEs')||''),image,vgen:String(f.get('vgen')||'').trim(),etsy:String(f.get('etsy')||'').trim(),tags:String(f.get('tags')||'').split(',').map(x=>x.trim()).filter(Boolean),customizable:f.get('customizable')==='on',visible:true};if(!image)throw new Error('Falta la imagen.');if(initDb()){await upsert('resources',{id:item.id,cat:item.cat,name_es:item.nameEs,name_en:item.nameEn,desc_es:item.descEs,desc_en:item.descEn,image:item.image,vgen:item.vgen,etsy:item.etsy,tags:item.tags,customizable:item.customizable,visible:item.visible});}else{const idx=resources.findIndex(x=>x.id===item.id);if(idx>=0)resources[idx]=item;else resources.push(item);saveLocal({resources});}rf.reset();rf.elements.id.value='';await refresh();await renderAll();toast(text('saved'));}
    cf.onsubmit=e=>saveCreation(e).catch(err=>toast(err.message||text('error')));rf.onsubmit=e=>saveResource(e).catch(err=>toast(err.message||text('error')));$('#creationReset')?.addEventListener('click',()=>{cf.reset();cf.elements.id.value='';});$('#resourceReset')?.addEventListener('click',()=>{rf.reset();rf.elements.id.value='';});
    window.__adminContent={get creations(){return creations},get resources(){return resources},refresh};await refresh();
  }
  function bindEditDelete(){
    $$('[data-creation-edit]').forEach(b=>b.onclick=()=>{const x=window.__adminContent.creations[+b.dataset.creationEdit],f=$('#creationForm');Object.entries({id:x.id,titleEs:x.titleEs||x.title_es||'',titleEn:x.titleEn||x.title_en||'',src:x.src,alt:x.alt||'',tags:(x.tags||[]).join(', ')}).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v});if(f.elements.visible)f.elements.visible.checked=x.visible!==false;f.scrollIntoView({behavior:'smooth',block:'center'});});
    $$('[data-creation-delete]').forEach(b=>b.onclick=async()=>{if(!confirm(lang==='es'?'¿Eliminar esta creación?':'Delete this creation?'))return;const x=window.__adminContent.creations[+b.dataset.creationDelete];try{if(initDb())await remove('creations','id',x.id);else{const d=baseData();d.gallery=d.gallery.filter(y=>y.id!==x.id);saveLocal({gallery:d.gallery});}await window.__adminContent.refresh();await renderAll();toast(text('deleted'));}catch(e){toast(e.message||text('error'));}});
    $$('[data-resource-edit]').forEach(b=>b.onclick=()=>{const x=window.__adminContent.resources[+b.dataset.resourceEdit],f=$('#resourceForm');Object.entries({id:x.id,nameEs:x.nameEs||x.name_es||'',nameEn:x.nameEn||x.name_en||'',cat:x.cat||'other',descEs:x.descEs||x.desc_es||'',descEn:x.descEn||x.desc_en||'',image:x.image||'',vgen:x.vgen||'',etsy:x.etsy||'',tags:(x.tags||[]).join(', ')}).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v});if(f.elements.visible)f.elements.visible.checked=x.visible!==false;if(f.elements.customizable)f.elements.customizable.checked=!!x.customizable;f.scrollIntoView({behavior:'smooth',block:'center'});});
    $$('[data-resource-delete]').forEach(b=>b.onclick=async()=>{if(!confirm(lang==='es'?'¿Eliminar este recurso?':'Delete this resource?'))return;const x=window.__adminContent.resources[+b.dataset.resourceDelete];try{if(initDb())await remove('resources','id',x.id);else{const d=baseData();d.resources=d.resources.filter(y=>y.id!==x.id);saveLocal({resources:d.resources});}await window.__adminContent.refresh();await renderAll();toast(text('deleted'));}catch(e){toast(e.message||text('error'));}});
  }
  async function setupAdminCalendar(){const root=$('#adminCalendarGrid');if(!root)return;async function data(){if(initDb()){const rows=await select('commission_slots','slot_date,status',q=>q);return Object.fromEntries((rows||[]).map(x=>[x.slot_date,x.status]));}return baseData().slots||{};}async function render(){const slots=await data(),y=adminCalendarDate.getFullYear(),m=adminCalendarDate.getMonth();$('#adminCalendarTitle').textContent=new Intl.DateTimeFormat(lang,{month:'long',year:'numeric'}).format(adminCalendarDate);const first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();let h='';for(let i=0;i<first;i++)h+='<div class="day blank"></div>';for(let d=1;d<=days;d++){const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,s=slots[key]||'CLOSED';h+=`<button class="day ${s.toLowerCase()} admin-day" data-date="${key}" data-status="${s}"><b>${d}</b><small>${s}</small></button>`;}root.innerHTML=h;$$('.admin-day',root).forEach(b=>b.onclick=async()=>{const next={CLOSED:'OPEN',OPEN:'RESERVED',RESERVED:'CLOSED'}[b.dataset.status];try{if(initDb())await upsert('commission_slots',{slot_date:b.dataset.date,status:next,updated_at:new Date().toISOString()});else{const d=baseData();d.slots[b.dataset.date]=next;saveLocal({slots:d.slots});}render();renderAll();}catch(e){toast(e.message||text('error'));}});}$('#adminPrevMonth')?.addEventListener('click',()=>{adminCalendarDate.setMonth(adminCalendarDate.getMonth()-1);render()});$('#adminNextMonth')?.addEventListener('click',()=>{adminCalendarDate.setMonth(adminCalendarDate.getMonth()+1);render()});render();}
  async function loadTwitchAutomation(data){
    const endpoint=data?.links?.twitchEndpoint || '';
    if(!endpoint)return;
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2500);
    try{const r=await fetch(endpoint,{headers:{'Accept':'application/json'},signal:controller.signal,cache:'no-store'});if(!r.ok)throw new Error('Twitch endpoint '+r.status);const j=await r.json();const merged={...data,lastStream:j.last||data.lastStream,nextStream:j.next||data.nextStream};renderStreams(merged);}catch(e){console.debug('Twitch automation unavailable',e)}finally{clearTimeout(timer)}
  }
  async function adminRenderPurchases() {
    const root = $('#adminPurchases');
    if (!root || !initDb()) return;

    try {
      const rows = await select(
        'purchases',
        'id,product_name,source,external_order_id,buyer_email,verified,user_id,created_at',
        query => query.order('created_at', { ascending: false }).limit(30)
      );

      root.innerHTML = rows.map(row => `
        <div class="admin-row">
          <div>
            <b>${esc(row.product_name)}</b>
            <p>${esc(row.source || 'manual')} · ${esc(row.external_order_id || '—')}</p>
            <small>${esc(row.buyer_email || 'Sin correo')} · ${row.user_id ? 'Vinculada' : 'Sin cuenta'}</small>
          </div>
          <span class="badge">${row.verified ? 'VERIFIED' : 'PENDING'}</span>
        </div>
      `).join('') || '<p class="muted">No hay compras importadas.</p>';
    } catch (error) {
      root.innerHTML = `<p class="muted">${esc(error.message || text('error'))}</p>`;
    }
  }

  async function setupPurchaseAdmin() {
    const form = $('#purchaseAdminForm');
    if (!form) return;

    await adminRenderPurchases();

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const values = new FormData(form);

      try {
        if (!initDb()) throw new Error('Supabase is required for purchases.');

        const { data, error } = await db.rpc('admin_add_purchase', {
          p_source: String(values.get('source') || 'manual'),
          p_order_id: String(values.get('orderId') || '').trim(),
          p_product_name: String(values.get('productName') || '').trim(),
          p_description: String(values.get('description') || '').trim(),
          p_download_url: String(values.get('downloadUrl') || '').trim() || null,
          p_buyer_email: String(values.get('buyerEmail') || '').trim().toLowerCase() || null,
          p_verified: values.get('verified') === 'on'
        });

        if (error) throw error;

        $('#purchaseAdminStatus').textContent = `${text('saved')} ${data || ''}`;
        form.reset();
        form.elements.verified.checked = true;
        await adminRenderPurchases();
      } catch (error) {
        $('#purchaseAdminStatus').textContent = error.message || text('error');
      }
    });
  }

  async function setupAdminGeneral(){await adminRenderStats();await adminRenderGuests();await adminRenderTestimonials();if($('#refreshGuests'))$('#refreshGuests').onclick=adminRenderGuests;$('#resetAnalytics')?.addEventListener('click',()=>{localStorage.removeItem('sky-analytics-local');adminRenderStats();});
    const tf=$('#twitchConnectForm'),ef=$('#etsyConnectForm');
    async function loadSettings(){const links=initDb()?(await settingGet('publicLinks'))||baseData().links:baseData().links;const integ=initDb()?(await integrationGet('connections'))||{}:{};if(tf){tf.twitchUrl.value=links.twitch||'';tf.twitchEndpoint.value=links.twitchEndpoint||'';$('#twitchOpen').href=links.twitch||'#';$('#twitchStatus').textContent=links.twitch?text('connected'):text('notConnected');}if(ef){ef.etsyUrl.value=links.etsy||'';ef.etsyWebhook.value=integ.etsyWebhook||'';$('#etsyOpen').href=links.etsy||'#';$('#etsyStatus').textContent=links.etsy?text('connected'):text('notConnected');}if($('#vgenUrl'))$('#vgenUrl').value=links.vgen||'';}
    tf?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(tf),url=String(f.get('twitchUrl')||'').trim(),endpoint=String(f.get('twitchEndpoint')||'').trim();try{if(initDb()){const links=(await settingGet('publicLinks'))||{};links.twitch=url;links.twitchEndpoint=endpoint;await settingSet('publicLinks',links);const integ=(await integrationGet('connections'))||{};integ.twitchConnectedAt=new Date().toISOString();await integrationSet('connections',integ);}else{const d=baseData();d.links.twitch=url;saveLocal({links:d.links,twitchEndpoint:endpoint});}$('#twitchOpen').href=url||'#';toast(text('saved'));}catch(e){toast(e.message||text('error'));}});
    ef?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(ef),url=String(f.get('etsyUrl')||'').trim(),webhook=String(f.get('etsyWebhook')||'').trim();try{if(initDb()){const links=(await settingGet('publicLinks'))||{};links.etsy=url;await settingSet('publicLinks',links);const integ=(await integrationGet('connections'))||{};integ.etsyWebhook=webhook;await integrationSet('connections',integ);}else{const d=baseData();d.links.etsy=url;saveLocal({links:d.links,etsyWebhook:webhook});}$('#etsyOpen').href=url||'#';toast(text('saved'));}catch(e){toast(e.message||text('error'));}});
    $('#saveVgen')?.addEventListener('click',async()=>{const url=$('#vgenUrl').value.trim();try{if(initDb()){const links=(await settingGet('publicLinks'))||{};links.vgen=url;await settingSet('publicLinks',links);}else{const d=baseData();d.links.vgen=url;saveLocal({links:d.links});}toast(text('saved'));}catch(e){toast(e.message||text('error'));}});
    const pl=$('#publicLinksForm');
    if(pl){
      const links=initDb()?(await settingGet('publicLinks'))||baseData().links:baseData().links;
      ['vgen','etsy','kofi','wishlist','twitch','instagram','twitter','discord','twitchEndpoint'].forEach(k=>{if(pl.elements[k])pl.elements[k].value=links[k]||''});
      pl.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(pl),links={};for(const k of ['vgen','etsy','kofi','wishlist','twitch','instagram','twitter','discord','twitchEndpoint'])links[k]=String(f.get(k)||'').trim();try{if(initDb())await settingSet('publicLinks',links);else saveLocal({links});toast(text('saved'));}catch(err){toast(err.message||text('error'));}});
    }
    const sp=$('#socialPostsForm'),spf=$('#socialPostFields');
    if(sp&&spf){
      const current=initDb()?(await settingGet('socialPosts'))||[]:baseData().socialPosts||[];
      spf.innerHTML=Array.from({length:6},(_,i)=>{const x=current[i]||{};return `<div class="social-editor"><b>Post ${i+1}</b><input name="date${i}" placeholder="Fecha" value="${esc(x.date||'')}"><input name="textEs${i}" placeholder="Texto ES" value="${esc(x.textEs||'')}"><input name="textEn${i}" placeholder="Text EN" value="${esc(x.textEn||'')}"><input name="url${i}" placeholder="URL o clave: twitter / instagram" value="${esc(x.url||'')}"></div>`}).join('');
      sp.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(sp),posts=[];for(let i=0;i<6;i++){const x={date:String(f.get('date'+i)||'').trim(),textEs:String(f.get('textEs'+i)||'').trim(),textEn:String(f.get('textEn'+i)||'').trim(),url:String(f.get('url'+i)||'').trim()};if(x.textEs||x.textEn||x.url)posts.push(x);}try{if(initDb())await settingSet('socialPosts',posts);else saveLocal({socialPosts:posts});await renderAll();toast(text('saved'));}catch(err){toast(err.message||text('error'));}});
    }
    const sf=$('#streamForm');sf?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(sf);const last={titleEs:f.get('lastTitle'),titleEn:f.get('lastTitle'),textEs:f.get('lastText'),textEn:f.get('lastText')},next={titleEs:f.get('nextTitle'),titleEn:f.get('nextTitle'),textEs:f.get('nextText'),textEn:f.get('nextText')};try{if(initDb()){await settingSet('lastStream',last);await settingSet('nextStream',next);}else saveLocal({lastStream:last,nextStream:next});await renderAll();toast(text('saved'));}catch(e){toast(e.message||text('error'));}});
    await loadSettings();
  }
  async function setupAdmin(){if(!$('.admin-page'))return;const ok=await checkAdmin();if(!ok)return;applyLang();const tabs=$$('.admin-tab'),panels=$$('.admin-panel');tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));b.classList.add('active');panels.forEach(x=>x.classList.remove('active'));$(`[data-panel-view="${b.dataset.panel}"]`)?.classList.add('active');});$$('[data-jump]').forEach(b=>b.onclick=()=>document.querySelector(`.admin-tab[data-panel="${b.dataset.jump}"]`)?.click());await setupAdminCalendar();await setupContentManagers();await setupPurchaseAdmin();await setupAdminGeneral();
    $('#testimonialForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);const row={name:String(f.get('name')||''),source:String(f.get('source')||''),commission:String(f.get('commission')||''),message:String(f.get('message')||''),approved:true};try{if(initDb())await upsert('testimonials',row);else{const d=baseData();d.testimonials=[row,...(d.testimonials||[])];saveLocal({testimonials:d.testimonials});}e.target.reset();await adminRenderTestimonials();await renderAll();toast(text('saved'));}catch(err){toast(err.message||text('error'));}});
  }

  function setupHeroAssets(){const hero=$('.hero-image');if(hero){hero.src=CFG.assets?.hero||'assets/hero-pose.png';hero.onerror=()=>{hero.src='assets/hero-pose.svg';};}const logo=CFG.assets?.logo||'assets/logo.svg';$$('img[src="assets/logo.svg"]').forEach(x=>{x.src=logo;});}

  async function init(){
    const loadingStartedAt = performance.now();

    wireBasic();applyLang();setupHeroAssets();createFloatingDecor();setupCursor();setupScrollStars();setupEaster();observeReveals();
    await setupAccount();await setupDownloads();await setupGuestbook();
    if($('.admin-page')){await setupAdmin();}
    const data = await renderAll();
    await loadTwitchAutomation(data);

    if ($('.admin-page')) {
      adminRenderStats();
    }

    track('page_view');

    // Keep the intro screen visible long enough to feel intentional,
    // while never allowing it to block the page indefinitely.
    const hideLoading = () => $('#loading')?.classList.add('hide');
    const minimumDisplay = 1100;
    const elapsed = performance.now() - loadingStartedAt;
    setTimeout(hideLoading, Math.max(0, minimumDisplay - elapsed));
  }
  init().catch(err=>{console.error(err);$('#loading')?.classList.add('hide');});
})();
