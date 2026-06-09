const KEY  = 'oa_pk_SxmeVQWtWUsOYEoUVboBtbVzKhSIbEcrWMAucBCSxpeKJyTXluwewJKrYDnlpzfi';
const UID  = '3831184';

async function loadEvent(uid) {
  const url = new URL(`https://api.openagenda.com/v2/agendas/${UID}/events/${uid}`);
  url.searchParams.set('key', KEY);
  const r = await fetch(url);
  if (!r.ok) return null;
  const json = await r.json();
  const e = json.event;
  return {
    title: e.title?.fr || e.title?.en || '',
    loc:   e.location?.name || '',
    date:  e.firstTiming?.begin?.slice(0, 10) || '',
    time:  e.firstTiming?.begin?.slice(11, 16) || '',
    cat:   e.keywords?.fr?.[0] || '',
    img:   e.image?.variants?.find(v => v.type === 'full')
             ? e.image.base + e.image.variants.find(v => v.type === 'full').filename
             : e.image?.base && e.image?.filename ? e.image.base + e.image.filename : '',
    desc:  e.longDescription?.fr || e.longDescription?.en || e.description?.fr || '',
    price:         e.conditions?.fr || e.conditions?.en || '—',
    free:          e.conditions?.fr?.toLowerCase().includes('gratuit') || e.conditions?.fr?.toLowerCase().includes('libre') || false,
    address:       e.location?.address || '',
    age:           e.age?.min && e.age?.max ? `De ${e.age.min} à ${e.age.max} ans` : '',
    registration:  e.registration?.[0]?.value || '',
    accessibility: e.accessibility?.ii || e.accessibility?.hi || e.accessibility?.vi || e.accessibility?.pi || e.accessibility?.mi || false,
  };
}

function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('fr-FR', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });
}

async function init() {
  const uid  = new URLSearchParams(window.location.search).get('uid');
  const main = document.getElementById('main');

  if (!uid) {
    window.location.href = '../index.html';
    return;
  }

  const e = await loadEvent(uid);

  if (!e) {
    main.innerHTML = `
      <div class="event-body">
        <p>Événement introuvable.</p>
        <a href="../index.html" class="back">← Retour</a>
      </div>`;
    return;
  }

  document.title = `${e.title} — VillaNova`;

  main.innerHTML = `
    ${e.img ? `<img src="${e.img}" alt="${e.title}" class="event-hero">` : ''}
    <div class="event-body">
      ${e.cat ? `<span class="badge">${e.cat}</span>` : ''}
      <h1>${e.title}</h1>
      <div class="metas">
        <span><strong>Date :</strong> ${fmtDate(e.date)}${e.time ? ' à ' + e.time : ''}</span>
        <span><strong>Lieu :</strong> ${e.loc}</span>
        <span><strong>Tarif :</strong> ${e.price}</span>
      </div>
      ${e.desc ? `<p class="desc">${e.desc}</p>` : ''}
      <div class="event-details">
        ${e.address ? `<div class="detail-row"><strong>Adresse</strong><span>${e.address}</span></div>` : ''}
        ${e.age ? `<div class="detail-row"><strong>Public ciblé</strong><span>${e.age}</span></div>` : ''}
        ${e.registration ? `<div class="detail-row"><strong>Inscription</strong><span>${e.registration}</span></div>` : ''}
        ${e.accessibility ? `<div class="detail-row"><strong>Accessibilité</strong><span>Cet événement inclut des aménagements à l'accessibilité</span></div>` : ''}
      </div>
      <a href="../index.html" class="back">← Retour aux événements</a>
    </div>`;
}

init();
