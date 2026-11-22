(() => {
  const path = location.pathname.split('/').filter(Boolean).at(-1) || 'index.html';
  const directory = /\/hgw\/(?:index\.html)?$/.test(location.pathname);
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem('hgw-unified-language'); } catch {}
  const language = ['ar', 'en', 'sv'].includes(requested) ? requested :
    ['ar', 'en', 'sv'].includes(saved) ? saved : 'ar';
  const copy = recentTranslations[language];
  const routes = {
    'housing.html': 'housing', 'food.html': 'food', 'mobility.html': 'mobility',
    'education.html': 'education', 'health.html': 'health', 'rights.html': 'rights',
    'governance.html': 'governance', 'communications.html': 'communications',
    'communications-plan.html': 'communications', 'hgw-disclosures.html': 'finance'
  };
  function pick(selected) {
    try { localStorage.setItem('hgw-unified-language', selected); } catch {}
    const next = new URL(location.href);
    next.searchParams.set('lang', selected);
    location.assign(next.href);
  }
  const picker = directory ? document.querySelector('#language') : document.querySelector('#recent-language');
  if (picker) {
    picker.value = language;
    picker.addEventListener('change', () => pick(picker.value));
  }

  function node(tag, text) {
    const item = document.createElement(tag);
    item.textContent = text;
    return item;
  }
  function body(key, headingTag, headingId) {
    const [title, ...groups] = copy[key];
    const section = document.createDocumentFragment();
    const heading = node(headingTag, title);
    if (headingId) heading.id = headingId;
    section.append(heading);
    for (const [label, ...paragraphs] of groups) {
      if (paragraphs.length) section.append(node(headingTag === 'h1' ? 'h2' : 'h3', label));
      else section.append(node('p', label));
      for (const paragraph of paragraphs) section.append(node('p', paragraph));
    }
    return section;
  }

  function localize(selector, key, headingTag = 'h2', headingId) {
    const target = document.querySelector(selector);
    if (!target) return;
    const figures = Array.from(target.querySelectorAll(':scope > figure'));
    target.lang = language;
    target.dir = 'ltr';
    target.replaceChildren(body(key, headingTag, headingId));
    for (const figure of figures) {
      const image = figure.querySelector('img');
      if (image) image.alt = copy[key][0];
      const caption = figure.querySelector('figcaption');
      if (caption) caption.textContent = language === 'sv' ? 'Konceptillustration' : 'Concept illustration';
      target.append(figure);
    }
  }

  if (copy) {
    const labels = language === 'sv' ?
      {sections:'Avsnitt', portfolio:'HGW:s projekt', operations:'Ren energi', circular:'Cirkulär ekonomi och återbruk', agriculture:'Smart jordbruk och livsmedelstrygghet', commerce:'Handel och logistik', research:'Forskning och avancerad tillverkning', digital:'Kommunikation och digital säkerhet', open:'Läs de strategiska målen', demo:'Identitet och kassa i testmiljö', home:'HGW:s startsida'} :
      {sections:'Sections', portfolio:'HGW projects', operations:'Clean energy', circular:'Circular economy and reuse', agriculture:'Smart agriculture and food security', commerce:'Commerce and logistics', research:'Research and advanced manufacturing', digital:'Communications and digital security', open:'Read the strategic goals', demo:'Identity and checkout sandbox', home:'HGW home'};
    const vision = document.querySelector('#vision');
    if (vision) {
      document.querySelector('a[href="./hgw/"]').textContent = language === 'sv' ? 'HGW:s projektkatalog' : 'HGW project directory';
      const emblem = vision.querySelector('.hgw-concept-emblem');
      const goals = vision.querySelector('#strategic-goals');
      vision.lang = language;
      vision.dir = 'ltr';
      vision.replaceChildren(...(emblem ? [emblem] : []), body('vision', 'h1', 'vision-title'), goals);
      if (emblem) emblem.alt = 'HGW';
    }
    localize('#strategic-goals', 'strategy', 'h2', 'strategic-title');
    const key = routes[path];
    if (['housing','food','mobility','education','health','rights'].includes(key)) {
      localize('main', key, 'h1');
      document.documentElement.lang = language;
      document.documentElement.dir = 'ltr';
      document.title = copy[key][0] + ' | HGW';
      const navigation = document.querySelector('header a[href="./hgw/"]');
      if (navigation) navigation.textContent = labels.sections;
      const brand = document.querySelector('header .brand');
      if (brand) brand.setAttribute('aria-label', labels.home);
      if (key === 'mobility' || key === 'rights') {
        const link = node('a', key === 'mobility' ? (language === 'sv' ? 'Kvantmattan' : 'Quantum Carpet') : copy.governance[0]);
        link.href = key === 'mobility' ? './project-carpet.html' : './governance.html#liquid-democracy';
        document.querySelector('main').append(link);
      }
    }
    localize('#liquid-democracy', 'governance', 'h2', 'liquid-democracy-title');
    localize('#real-value-finance', 'finance', 'h2', 'real-value-finance-title');
    localize('#funding-readiness', 'funding', 'h2', 'funding-readiness-title');
    const commsHeading = document.querySelector('#hybrid-quantum-lines');
    if (commsHeading) {
      const translations = copy.communications.slice(1).map(group => group[1]);
      commsHeading.textContent = copy.communications[0];
      commsHeading.lang = language;
      commsHeading.dir = 'ltr';
      let paragraph = commsHeading.nextElementSibling;
      for (const translation of translations) {
        while (paragraph?.tagName === 'FIGURE') {
          paragraph.lang = language;
          paragraph.querySelector('img').alt = copy.communications[0];
          paragraph = paragraph.nextElementSibling;
        }
        if (!paragraph || paragraph.tagName !== 'P') break;
        paragraph.textContent = translation;
        paragraph.lang = language;
        paragraph.dir = 'ltr';
        paragraph = paragraph.nextElementSibling;
      }
    }
    const gallery = document.querySelector('#projects-3d');
    if (gallery) {
      gallery.lang = language;
      gallery.dir = 'ltr';
      gallery.querySelector('h2').textContent = labels.portfolio;
      for (const link of gallery.querySelectorAll('.project-art-card')) {
        const cardKey = routes[link.getAttribute('href').replace('./', '')];
        const image = link.querySelector('img').src.split('/').at(-1).replace('.webp','');
        const title = cardKey ? copy[cardKey][0] : labels[image === 'energy' ? 'operations' : image];
        if (title) link.querySelector('span').textContent = title;
        link.querySelector('img').alt = '';
      }
    }
    for (const link of document.querySelectorAll('a[href]')) {
      const dest = new URL(link.href);
      if (dest.origin !== location.origin) continue;
      const linkKey = routes[dest.pathname.split('/').at(-1)];
      if (vision && linkKey === 'rights') link.textContent = copy.rights[0];
      if (vision && linkKey === 'health' && !link.closest('.project-art-card')) link.textContent = copy.health[0];
      if (directory && linkKey && link.closest('main') && !link.closest('#modules')) {
        link.textContent = copy[linkKey][0];
      }
      if (!link.closest('header') && dest.hash === '#liquid-democracy' && !link.closest('main')) {
        link.textContent = copy.governance[0];
      }
    }
  }

  function carryLanguage(event) {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const dest = new URL(link.href);
    if (dest.origin !== location.origin || (dest.pathname === url.pathname && dest.hash)) return;
    const filename = dest.pathname.split('/').at(-1);
    if (routes[filename] || dest.pathname === '/' || /\/hgw\/(?:index\.html)?$/.test(dest.pathname)) {
      dest.searchParams.set('lang', language);
      link.href = dest.href;
    }
  }
  document.addEventListener('click', carryLanguage);
})();
