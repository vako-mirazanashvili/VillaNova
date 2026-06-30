const KEY  = 'oa_pk_SxmeVQWtWUsOYEoUVboBtbVzKhSIbEcrWMAucBCSxpeKJyTXluwewJKrYDnlpzfi';
const UID  = '3831184';

const CATS = ['Musique', 'Art', 'Sport', 'Conférence', 'Atelier', 'Cinéma'];

let active = null;

function fmt(s) {
  const d = new Date(s);
  return {
    d: d.getDate().toString().padStart(2, '0'),
    m: d.toLocaleString('fr-FR', { month: 'short' }).toUpperCase().slice(0, 3)
  };
}

async function load(size, cat) {
  const url = new URL(`https://api.openagenda.com/v2/agendas/${UID}/events`);
  url.searchParams.set('key', KEY);
  url.searchParams.set('size', size);
  if (cat) url.searchParams.set('search', cat);
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

const PRICES = {
  47503799: '15 €',
  67342324: 'Gratuit',
  40371394: '25 €',
  82481236: 'Gratuit',
  56319159: 'Gratuit',
  96653328: '8 €',
  46566497: 'Gratuit',
  93053686: '10 €',
};

function map(e) {
  const d = fmt(e.firstTiming?.begin || '2025-01-01');
  const price = PRICES[e.uid] || '—';
  const isFree = price === 'Gratuit';
  return {
    uid:   e.uid,
    title: e.title?.fr || e.title?.en || '',
    loc:   e.location?.name || '',
    cat:   e.keywords?.fr?.[0] || '',
    img:   e.image?.base && e.image?.filename ? e.image.base + e.image.filename : '',
    free:  isFree,
    price: price,
    ...d
  };
}

async function renderCards() {
  const data = await load(8, null);
  const list = data?.events.map(map) ?? [];

  document.getElementById('cards').innerHTML = list.map(e => `
      <article class="card" role="listitem" tabindex="0" aria-label="${e.title}"
        onclick="location.href='/html/event.html?uid=${e.uid}'"
        onkeydown="if(event.key==='Enter')location.href='/html/event.html?uid=${e.uid}'">
        <img src="${e.img}" alt="${e.title}" loading="lazy">
        <div class="body">
          <div class="meta">${e.d} ${e.m} · ${e.cat}</div>
          <h3>${e.title}</h3>
          <p class="loc">${e.loc}</p>
        </div>
      </article>`).join('');

  const allCards = document.querySelectorAll('#cards .card');
  allCards.forEach((card, i) => {
    if (i >= 4) card.style.display = 'none';
  });

  let open = false;
  const btn = document.createElement('button');
  btn.id = 'voir-plus-cards';
  btn.textContent = 'Voir plus';
  btn.className = 'voir-plus';
  btn.onclick = () => {
    open = !open;
    allCards.forEach((card, i) => {
      if (i >= 4) card.style.display = open ? '' : 'none';
    });
    btn.textContent = open ? 'Voir moins' : 'Voir plus';
  };
  document.getElementById('cards').after(btn);
}

async function renderRows() {
  const existingBtn = document.getElementById('voir-plus-rows');
  if (existingBtn) existingBtn.remove();

  const data = await load(8, active);
  const list = data?.events.map(map) ?? [];

  document.getElementById('rows').innerHTML = list.map(e => {
    const p = e.free ? ['Gratuit', 'free'] : [e.price || '—', 'paid'];
    return `
      <article class="row" role="listitem" tabindex="0" aria-label="${e.title}"
        onclick="location.href='/html/event.html?uid=${e.uid}'"
        onkeydown="if(event.key==='Enter')location.href='/html/event.html?uid=${e.uid}'">
        <div class="date" aria-hidden="true">
          <span class="d">${e.d}</span>
          <span class="m">${e.m}</span>
        </div>
        <div class="info">
          <div class="title">${e.title}</div>
          <div class="sub">${e.loc}</div>
        </div>
        <div class="price" aria-label="${p[0]}">
          ${p[0]}
          <span class="${p[1]}">${p[1] === 'free' ? 'Gratuit' : 'Payant'}</span>
        </div>
      </article>`;
  }).join('');

  const allRows = document.querySelectorAll('#rows .row');
  allRows.forEach((row, i) => {
    if (i >= 4) row.style.display = 'none';
  });

  let open = false;
  const btn = document.createElement('button');
  btn.id = 'voir-plus-rows';
  btn.textContent = 'Voir plus';
  btn.className = 'voir-plus';
  btn.onclick = () => {
    open = !open;
    allRows.forEach((row, i) => {
      if (i >= 4) row.style.display = open ? '' : 'none';
    });
    btn.textContent = open ? 'Voir moins' : 'Voir plus';
  };
  document.getElementById('rows').after(btn);
}

function renderCats() {
  document.getElementById('cats').innerHTML = CATS.map(c =>
    `<button class="chip${active === c ? ' active' : ''}" aria-pressed="${active === c}"
      onclick="active=active===this.textContent?null:this.textContent;renderCats();renderRows()">
      ${c}
    </button>`
  ).join('');
}

renderCats();
renderCards();
renderRows();
