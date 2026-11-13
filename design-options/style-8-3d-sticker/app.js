const GAMES_FALLBACK = [
  {id:'com.itcgamestudio.arcane.hunter.soul.survivor.monster.action.shooter.rpg',name:'Arcane Hunter: Soul Survivor',link_android:'https://play.google.com/store/apps/details?id=com.itcgamestudio.arcane.hunter.soul.survivor.monster.action.shooter.rpg',link_ios:'https://apps.apple.com/vn/app/arcane-hunter-soul-survivor/id6740374474',thumbnail:'Logo_ArcaneHunter.png'},
  {id:'com.itcgamestudio.vampirehunter.legends.rising',name:'Vampire Hunter: Legends Rising',link_android:'https://play.google.com/store/apps/details?id=com.itcgamestudio.vampirehunter.legends.rising',link_ios:'https://apps.apple.com/vn/app/vampire-hunter-legends-rising/id6503144798',thumbnail:'Logo_VampireHunter.png'},
  {id:'com.itcgamestudio.backpack.apocalypse',name:'Backpack Apocalypse',link_android:'https://play.google.com/store/apps/details?id=com.itcgamestudio.backpackapocalypse.merge.war.battle.brawl',link_ios:'',thumbnail:'Logo_BackpackApocalypse.jpg'},
  {id:'com.itcgamestudio.chocobento.puzzle',name:'ChocoBento Puzzle',link_android:'https://play.google.com/store/apps/details?id=com.itcgamestudio.chocobento.puzzle',link_ios:'https://apps.apple.com/vn/app/chocobento-puzzle/id6755371072',thumbnail:'Logo_ChocoBento.png'},
  {id:'com.itcgamestudio.roomdecor.simulation',name:'My Tiny Shop: Relaxing Decor',link_android:'https://play.google.com/store/apps/details?id=com.itcgamestudio.roomdecor.simulation',link_ios:'https://apps.apple.com/vn/app/my-tiny-shop-relaxing-decor/id6755370982',thumbnail:'Logo_MyTinyShop.png'},
  {id:'com.itcgamestudio.space.astro.cat.brick.breaker',name:'Space Astro Cat: Brick Breaker',link_android:'',link_ios:'https://apps.apple.com/vn/app/space-astro-cat-brick-breaker/id6504403514',thumbnail:'Logo_SpaceAstroCat.png'},
  {id:'com.itcgamestudio.cat.screw.puzzle.nuts.bolts',name:'Cat Screw Puzzle: Nuts & Bolts',link_android:'',link_ios:'https://apps.apple.com/vn/app/cat-screw-puzzle-nuts-bolts/id6480040525',thumbnail:'Logo_CatScrewPuzzle.png'},
  {id:'com.itcgamestudio.my.perfect.sushi.drop.merge',name:'My Perfect Sushi: Drop & Merge',link_android:'',link_ios:'https://apps.apple.com/vn/app/my-perfect-sushi-drop-merge/id6479974597',thumbnail:'Logo_MyPerfectSushi.png'}
];

const FEATURED = [
  ['Arcane Hunter: Soul Survivor','Action RPG · Mobile','Game hành động sinh tồn theo phong cách roguelike, chiến đấu dồn dập với bầy quái vật và hệ thống nâng cấp nhân vật.','Logo_ArcaneHunter.png','https://play.google.com/store/apps/details?id=com.itcgamestudio.arcane.hunter.soul.survivor.monster.action.shooter.rpg'],
  ['Vampire Hunter: Legends Rising','Action RPG · Mobile','Game hành động RPG sinh tồn, đối đầu với bầy quái vật và thu thập trang bị để nâng cấp sức mạnh.','Logo_VampireHunter.png','https://play.google.com/store/apps/details?id=com.itcgamestudio.vampirehunter.legends.rising'],
  ['Backpack Apocalypse','Action · Mobile','Game hành động sinh tồn với cơ chế merge trang bị, sắp xếp balo và chiến đấu chống lại quái vật.','Logo_BackpackApocalypse.jpg','https://play.google.com/store/apps/details?id=com.itcgamestudio.backpackapocalypse.merge.war.battle.brawl']
];

const PLAYABLES = [
  ['Cocos Creator · HTML5','Arcane Hunter','Một mẫu quảng cáo tương tác định dạng dọc. Bạn có thể trải nghiệm trực tiếp trong khung bên cạnh hoặc mở ở chế độ toàn màn hình.','arcane-hunter'],
  ['Unity · HTML5','Match3','Một mẫu quảng cáo tương tác thể loại match-3. Bạn có thể trải nghiệm trực tiếp trong khung bên cạnh hoặc mở ở chế độ toàn màn hình.','match3'],
  ['Unity · HTML5','Bubble Shooter','Một mẫu quảng cáo tương tác thể loại bắn bóng. Bạn có thể trải nghiệm trực tiếp trong khung bên cạnh hoặc mở ở chế độ toàn màn hình.','bubbleshooter'],
  ['Unity · HTML5','Pet Shop','Một mẫu quảng cáo tương tác thể loại quản lý cửa hàng thú cưng. Bạn có thể trải nghiệm trực tiếp trong khung bên cạnh hoặc mở ở chế độ toàn màn hình.','petshop'],
  ['Unity · HTML5','Pet Shop 2','Một mẫu quảng cáo tương tác thể loại quản lý cửa hàng thú cưng, phiên bản mới. Bạn có thể trải nghiệm trực tiếp trong khung bên cạnh hoặc mở ở chế độ toàn màn hình.','petshop2'],
  ['Unity · HTML5','Spa Shop','Một mẫu quảng cáo tương tác thể loại quản lý cửa hàng spa thú cưng. Bạn có thể trải nghiệm trực tiếp trong khung bên cạnh hoặc mở ở chế độ toàn màn hình.','spashop']
];

const stations = [...document.querySelectorAll('.station')];
const dockButtons = [...document.querySelectorAll('.dock [data-go]')];
const root = document.documentElement;
const world = document.querySelector('#world');
const modal = document.querySelector('#game-modal');
const frame = modal.querySelector('iframe');
let activeIndex = 0;
let orbitIndex = 0;
let wheelLocked = false;
let dragged = false;

const modulo = (value, length) => ((value % length) + length) % length;
const shortestDelta = (from, to, length) => {
  let delta = modulo(to - from, length);
  if (delta > length / 2) delta -= length;
  return delta;
};

function updateStation(index, orbitTarget) {
  activeIndex = modulo(index, stations.length);
  if (typeof orbitTarget === 'number') orbitIndex = orbitTarget;
  root.style.setProperty('--turn', `${orbitIndex * -45}deg`);
  stations.forEach((station, i) => {
    const distance = Math.min(modulo(i - activeIndex, stations.length), modulo(activeIndex - i, stations.length));
    station.classList.toggle('active', i === activeIndex);
    station.classList.toggle('near', distance === 1);
    station.setAttribute('aria-hidden', i === activeIndex ? 'false' : 'true');
    station.querySelectorAll('a,button').forEach(control => {
      if (i !== activeIndex) {
        if (!control.hasAttribute('data-saved-tabindex')) control.dataset.savedTabindex = control.getAttribute('tabindex') || '';
        control.setAttribute('tabindex', '-1');
      } else {
        const saved = control.dataset.savedTabindex;
        if (saved === '') control.removeAttribute('tabindex');
        else if (saved !== undefined) control.setAttribute('tabindex', saved);
        delete control.dataset.savedTabindex;
      }
    });
  });
  dockButtons.forEach((button, i) => {
    button.classList.toggle('active', i === activeIndex);
    button.setAttribute('aria-current', i === activeIndex ? 'page' : 'false');
  });
  document.querySelector('#station-number').textContent = String(activeIndex + 1).padStart(2, '0');
  document.querySelector('#current-step').textContent = String(activeIndex + 1).padStart(2, '0');
  document.querySelector('#station-name').textContent = stations[activeIndex].dataset.title;
}

function goTo(index) {
  const target = modulo(Number(index), stations.length);
  orbitIndex += shortestDelta(activeIndex, target, stations.length);
  updateStation(target, orbitIndex);
}

function step(direction) {
  orbitIndex += direction;
  updateStation(orbitIndex, orbitIndex);
}

document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  goTo(button.dataset.go);
}));
document.querySelector('#prev-station').addEventListener('click', () => step(-1));
document.querySelector('#next-station').addEventListener('click', () => step(1));
stations.forEach((station, index) => station.addEventListener('click', event => {
  if (index !== activeIndex && !dragged && !event.target.closest('a,button')) goTo(index);
}));

window.addEventListener('wheel', event => {
  if (modal.open) return;
  event.preventDefault();
  if (wheelLocked || Math.abs(event.deltaY) + Math.abs(event.deltaX) < 4) return;
  wheelLocked = true;
  step((Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX) > 0 ? 1 : -1);
  window.setTimeout(() => { wheelLocked = false; }, 520);
}, {passive:false});

window.addEventListener('keydown', event => {
  if (modal.open || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); step(1); }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); step(-1); }
  if (event.key === 'Home') { event.preventDefault(); goTo(0); }
  if (event.key === 'End') { event.preventDefault(); goTo(stations.length - 1); }
});

let pointerStart = null;
document.querySelector('#viewport').addEventListener('pointerdown', event => {
  if (event.target.closest('a,button')) return;
  pointerStart = {x:event.clientX,y:event.clientY,id:event.pointerId};
  dragged = false;
  event.currentTarget.setPointerCapture(event.pointerId);
  document.documentElement.classList.add('dragging');
});
document.querySelector('#viewport').addEventListener('pointermove', event => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const delta = event.clientX - pointerStart.x;
  if (Math.abs(delta) > 6) dragged = true;
  root.style.setProperty('--turn', `${orbitIndex * -45 + delta * .08}deg`);
});
function releasePointer(event) {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  document.documentElement.classList.remove('dragging');
  if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY)) step(deltaX < 0 ? 1 : -1);
  else root.style.setProperty('--turn', `${orbitIndex * -45}deg`);
  pointerStart = null;
  window.setTimeout(() => { dragged = false; }, 0);
}
document.querySelector('#viewport').addEventListener('pointerup', releasePointer);
document.querySelector('#viewport').addEventListener('pointercancel', releasePointer);

const helpToggle = document.querySelector('#help-toggle');
const helpPanel = document.querySelector('#help-panel');
helpToggle.addEventListener('click', () => {
  const willOpen = helpPanel.hidden;
  helpPanel.hidden = !willOpen;
  helpToggle.setAttribute('aria-expanded', String(willOpen));
});

let featuredIndex = 0;
function renderFeatured() {
  const item = FEATURED[featuredIndex];
  document.querySelector('#featured-stage').innerHTML = `<article class="feature-card"><div class="feature-visual"><img src="../../logothumbnail/${item[3]}" alt="${item[0]}"></div><div class="feature-copy"><span>0${featuredIndex + 1} / 03 · ${item[1]}</span><h3>${item[0]}</h3><p>${item[2]}</p><a href="${item[4]}" target="_blank" rel="noopener">Khám phá dự án ↗</a></div></article>`;
  document.querySelector('.featured-pager').innerHTML = FEATURED.map((_, i) => `<button type="button" class="${i === featuredIndex ? 'active' : ''}" aria-label="Dự án ${i + 1}" aria-current="${i === featuredIndex ? 'true' : 'false'}" data-feature="${i}"></button>`).join('');
  document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => { featuredIndex = Number(button.dataset.feature); renderFeatured(); }));
}

let games = GAMES_FALLBACK;
let platform = 'android';
let storePage = 0;
const normalizeGames = data => data.map(game => ({...game,thumbnail:(game.thumbnail || '').split('/').pop()}));
function renderGames() {
  const filtered = games.filter(game => platform === 'android' ? game.link_android : game.link_ios);
  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  storePage = modulo(storePage, pages);
  const visible = filtered.slice(storePage * pageSize, storePage * pageSize + pageSize);
  document.querySelector('#store-grid').innerHTML = visible.map(game => `<article class="store-card"><img src="../../logothumbnail/${game.thumbnail}" alt="${game.name}" loading="lazy"><div><small>QUANGDM · MOBILE GAME</small><h3>${game.name}</h3><a href="${platform === 'android' ? game.link_android : game.link_ios}" target="_blank" rel="noopener">${platform === 'android' ? 'Google Play' : 'App Store'} ↗</a></div></article>`).join('');
  document.querySelector('#store-count').textContent = `${games.length} sản phẩm · ${filtered.length} trên ${platform === 'android' ? 'Android' : 'iOS'}`;
  document.querySelector('#store-page').textContent = `${String(storePage + 1).padStart(2,'0')} / ${String(pages).padStart(2,'0')}`;
}
document.querySelectorAll('[data-platform]').forEach(button => button.addEventListener('click', () => {
  platform = button.dataset.platform;
  storePage = 0;
  document.querySelectorAll('[data-platform]').forEach(tab => {
    const selected = tab === button;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  renderGames();
}));
document.querySelector('[data-page-prev="store"]').addEventListener('click', () => { storePage--; renderGames(); });
document.querySelector('[data-page-next="store"]').addEventListener('click', () => { storePage++; renderGames(); });

let playableIndex = 0;
function renderPlayable() {
  const playable = PLAYABLES[playableIndex];
  document.querySelector('#playable-deck').innerHTML = `<article class="playable-card"><div class="playable-orb"><b>${String(playableIndex + 1).padStart(2,'0')}</b></div><div class="playable-copy"><span>${playable[0]}</span><h3>${playable[1]}</h3><p>${playable[2]}</p><div class="play-actions"><button type="button" class="play-button" data-src="../../playables/${playable[3]}/index.html" data-title="${playable[1]}">▶ Chơi tại đây</button><a href="../../playables/${playable[3]}/index.html" target="_blank" rel="noopener">Toàn màn hình ↗</a></div></div></article>`;
  document.querySelector('#playable-page').textContent = `${String(playableIndex + 1).padStart(2,'0')} / ${String(PLAYABLES.length).padStart(2,'0')}`;
  document.querySelector('.play-button').addEventListener('click', openPlayable);
}
function openPlayable(event) {
  frame.src = event.currentTarget.dataset.src;
  frame.title = event.currentTarget.dataset.title;
  document.querySelector('#modal-title').textContent = event.currentTarget.dataset.title;
  modal.showModal();
}
function closePlayable() {
  modal.close();
  frame.src = 'about:blank';
}
document.querySelector('[data-page-prev="playable"]').addEventListener('click', () => { playableIndex = modulo(playableIndex - 1, PLAYABLES.length); renderPlayable(); });
document.querySelector('[data-page-next="playable"]').addEventListener('click', () => { playableIndex = modulo(playableIndex + 1, PLAYABLES.length); renderPlayable(); });
document.querySelector('.modal-close').addEventListener('click', closePlayable);
modal.addEventListener('click', event => { if (event.target === modal) closePlayable(); });
modal.addEventListener('cancel', event => { event.preventDefault(); closePlayable(); });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
window.addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType === 'touch') return;
  const x = ((event.clientX / window.innerWidth) - .5) * 24;
  const y = ((event.clientY / window.innerHeight) - .5) * 18;
  root.style.setProperty('--px', `${x}px`);
  root.style.setProperty('--py', `${y}px`);
}, {passive:true});

if (!CSS.supports('transform-style', 'preserve-3d') || !CSS.supports('perspective', '1000px')) document.body.classList.add('flat-mode');
renderFeatured();
renderGames();
renderPlayable();
updateStation(0, 0);
fetch('../../games_store.json').then(response => response.ok ? response.json() : Promise.reject()).then(data => { games = normalizeGames(data); renderGames(); }).catch(() => { games = GAMES_FALLBACK; renderGames(); });
