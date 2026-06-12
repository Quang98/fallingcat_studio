// ===== CONFIG =====
const API_BASE = 'https://nonbristled-shrinkable-kenton.ngrok-free.dev/api/v1';

// ===== POPUP =====
const POPUP_ICONS = { error:'⚠️', success:'✅', info:'ℹ️', warning:'🔔' };
/*
 * showPopup(title, message, type, options)
 *   type: 'error' | 'success' | 'info' | 'warning'  (default: 'error')
 *   options.primaryLabel  – text nút chính (default: 'Đã hiểu')
 *   options.onPrimary     – callback khi bấm nút chính
 *   options.secondaryLabel – text nút phụ (nếu có sẽ hiện thêm nút)
 *   options.onSecondary   – callback khi bấm nút phụ
 */
function showPopup(title, message, type = 'error', options = {}) {
  const overlay = document.getElementById('popup-overlay');
  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-msg').textContent = message;
  const icon = document.getElementById('popup-icon');
  icon.textContent = POPUP_ICONS[type] || POPUP_ICONS.error;
  icon.className = `popup-icon ${type}`;
  const btnPrimary = document.getElementById('popup-btn-primary');
  btnPrimary.textContent = options.primaryLabel || 'Đã hiểu';
  btnPrimary.onclick = () => { closePopup(); options.onPrimary?.(); };
  const btnSecondary = document.getElementById('popup-btn-secondary');
  if (options.secondaryLabel) {
    btnSecondary.textContent = options.secondaryLabel;
    btnSecondary.style.display = '';
    btnSecondary.onclick = () => { closePopup(); options.onSecondary?.(); };
  } else {
    btnSecondary.style.display = 'none';
  }
  overlay.classList.add('show');
}
function closePopup(e) {
  if (e && e.target !== document.getElementById('popup-overlay')) return;
  document.getElementById('popup-overlay').classList.remove('show');
}
const API_HEADERS = {'ngrok-skip-browser-warning': 'true'};

// ===== STATE =====
let currentUserId = 4;
let matchesData = [];
let currentMatchId = null;
let confidentSelected = false;
// Vé dự đoán — nguồn dữ liệu duy nhất phía client (chưa có API quản lý số dư vé).
let predictionTickets = 0;
const TICKET_PRICE_KIP = 500; // giá 1 vé dự đoán (Kip Lào)

// Outcome selection
let selectedOutcome = null; // 'home' | 'draw' | 'away'

function selectOutcome(outcome, btn) {
  selectedOutcome = outcome;
  ['home','draw','away'].forEach(o => document.getElementById('outcome-'+o)?.classList.remove('selected'));
  btn.classList.add('selected');
}

function outcomeLabel(outcome, ht, at) {
  if (outcome === 'home') return `${ht?.name||'Đội nhà'} thắng`;
  if (outcome === 'away') return `${at?.name||'Đội khách'} thắng`;
  return 'Hòa';
}

// Cập nhật số vé và đồng bộ ra mọi nơi hiển thị.
function setPredictionTickets(n){
  predictionTickets = Math.max(0, n|0);
  renderPredictionTickets();
}
function spendPredictionTickets(n){ setPredictionTickets(predictionTickets - (n||1)); }
function addPredictionTickets(n){ setPredictionTickets(predictionTickets + (n||0)); }
function renderPredictionTickets(){
  document.querySelectorAll('[data-ticket-balance]').forEach(el => el.textContent = predictionTickets);
}

// Vé tự tin — nguồn dữ liệu duy nhất phía client (chưa có API quản lý số dư).
let confidenceTickets = 2;
const CONFIDENCE_MULTIPLIER = 2; // trúng nhân đôi điểm
function setConfidenceTickets(n){ confidenceTickets = Math.max(0, n|0); renderConfidenceTickets(); }
function spendConfidenceTickets(n){ setConfidenceTickets(confidenceTickets - (n||1)); }
function addConfidenceTickets(n){ setConfidenceTickets(confidenceTickets + (n||0)); }
function renderConfidenceTickets(){
  document.querySelectorAll('[data-confidence-balance]').forEach(el => el.textContent = confidenceTickets);
}

// Vé may mắn — dùng cho vòng quay may mắn.
let luckyTickets = 18;
function setLuckyTickets(n){ luckyTickets = Math.max(0, n|0); renderLuckyTickets(); }
function spendLuckyTickets(n){ setLuckyTickets(luckyTickets - (n||1)); }
function addLuckyTickets(n){ setLuckyTickets(luckyTickets + (n||0)); }
function renderLuckyTickets(){
  document.querySelectorAll('[data-lucky-balance]').forEach(el => el.textContent = luckyTickets);
}

// Vé minigame — dùng khi hết quota miễn phí mỗi ngày.
let minigameTickets = 0;
function setMinigameTickets(n){ minigameTickets = Math.max(0, n|0); renderMinigameTickets(); }
function spendMinigameTickets(n){ setMinigameTickets(minigameTickets - (n||1)); }
function addMinigameTickets(n){ setMinigameTickets(minigameTickets + (n||0)); }
function renderMinigameTickets(){
  document.querySelectorAll('[data-minigame-balance]').forEach(el => el.textContent = minigameTickets);
}

// Điểm — tổng điểm tích lũy của người chơi.
let userPoints = 0;
function setUserPoints(n){ userPoints = Math.max(0, n|0); renderUserPoints(); }
function addUserPoints(n){ setUserPoints(userPoints + (n||0)); }
function renderUserPoints(){
  const s = userPoints.toLocaleString('vi-VN');
  document.querySelectorAll('[data-points-balance]').forEach(el => el.textContent = s);
}

// Đồng bộ toàn bộ số dư (vé dự đoán, vé tự tin, vé may mắn, vé minigame, điểm) ra mọi nơi hiển thị.
function renderBalances(){
  renderPredictionTickets();
  renderConfidenceTickets();
  renderLuckyTickets();
  renderMinigameTickets();
  renderUserPoints();
}

// Lấy số dư thực từ server — gọi sau khi load trang và sau mỗi giao dịch.
async function fetchWallet(){
  try {
    const res = await fetch(`${API_BASE}/me?user_id=${currentUserId}`, {headers: API_HEADERS});
    if (!res.ok) return;
    const d = (await res.json()).data;
    if (d.prediction_tickets != null) setPredictionTickets(d.prediction_tickets);
    if (d.lucky_tickets != null) setLuckyTickets(d.lucky_tickets);
    if (d.minigame_tickets != null) setMinigameTickets(d.minigame_tickets);
    if (d.accumulated_points != null) setUserPoints(d.accumulated_points);
  } catch(e) {}
}
const userPredictions = {};

// ===== HELPERS =====
function stageLabel(m_or_key) {
  if (typeof m_or_key === 'object') return m_or_key?.stage_label || m_or_key?.stage || m_or_key?.stage_key || '';
  return {group_stage:'Vòng bảng',round_of_16:'Vòng 16',quarter_final:'Tứ kết',semi_final:'Bán kết',final:'Chung kết'}[m_or_key] || m_or_key;
}
function fmtTime(d){return d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'})}
function fmtDate(d){return d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',timeZone:'Asia/Ho_Chi_Minh'})}

// Map tên đội (Anh/Việt) -> mã cờ ISO của flagcdn (gb-eng cho Anh)
const TEAM_ISO = {
  'brazil':'br','brasil':'br','argentina':'ar',
  'england':'gb-eng','anh':'gb-eng',
  'germany':'de','đức':'de','duc':'de',
  'france':'fr','pháp':'fr','phap':'fr',
  'spain':'es','tây ban nha':'es','tay ban nha':'es',
  'portugal':'pt','bồ đào nha':'pt','bo dao nha':'pt',
  'netherlands':'nl','hà lan':'nl','ha lan':'nl','holland':'nl',
  'italy':'it','ý':'it','y':'it','belgium':'be','bỉ':'be','bi':'be',
  'croatia':'hr','uruguay':'uy','japan':'jp','nhật bản':'jp','nhật':'jp','nhat':'jp',
  'south korea':'kr','hàn quốc':'kr','han quoc':'kr','korea':'kr',
  'usa':'us','mỹ':'us','my':'us','united states':'us','mexico':'mx','canada':'ca',
  'morocco':'ma','ma rốc':'ma','senegal':'sn','ghana':'gh','nigeria':'ng',
  'switzerland':'ch','thụy sĩ':'ch','denmark':'dk','đan mạch':'dk',
  'poland':'pl','ba lan':'pl','serbia':'rs','wales':'gb-wls','scotland':'gb-sct',
  'australia':'au','úc':'au','uc':'au','ecuador':'ec','qatar':'qa','iran':'ir',
  'saudi arabia':'sa','ả rập xê út':'sa','colombia':'co','chile':'cl','peru':'pe',
  'cameroon':'cm','egypt':'eg','ai cập':'eg','turkey':'tr','thổ nhĩ kỳ':'tr',
  'austria':'at','áo':'at','sweden':'se','thụy điển':'se','norway':'no','na uy':'no',
  'vietnam':'vn','việt nam':'vn','viet nam':'vn','thailand':'th','thái lan':'th','indonesia':'id'
};
function teamIso(team){
  if(!team) return null;
  const key=(team.flag_code||team.iso||team.code||team.name||'').toString().trim().toLowerCase();
  return TEAM_ISO[key]||null;
}
// Trả về HTML lá cờ (cao h px). Không có mã ISO -> ô màu + chữ viết tắt.
function flagInner(team, h){
  const iso=teamIso(team);
  if(iso) return `<img class="flag-ico" style="height:${h}px" src="https://flagcdn.com/${iso}.svg" alt="" loading="lazy">`;
  const c=team?.color||'#555';
  const s=(team?.name||'?').slice(0,3).toUpperCase();
  return `<span class="flag-ico flag-fb" style="height:${h}px;background:${c}">${s}</span>`;
}
// Set lá cờ vào một phần tử có sẵn (gỡ kiểu ô tròn cũ).
function setFlag(el, team, h){
  if(!el) return;
  el.classList.add('has-flag');
  el.innerHTML = flagInner(team, h);
}
// Dùng trong template match card.
function flagHtml(team){ return flagInner(team, 22); }

// ===== API =====
async function fetchMatches(tab = 'today') {
  const list = document.getElementById('matches-list');
  try {
    const url = `${API_BASE}/matches?tab=${tab}&user_id=${currentUserId}`;
    const res = await fetch(url, {headers: API_HEADERS});
    const json = await res.json();
    matchesData = json.data || [];
    matchesData.forEach(m => {
      if (m.prediction) {
        userPredictions[m.match_id] = {outcome: m.prediction.outcome, confident: !!m.prediction.use_confidence, editable: m.prediction.is_editable};
      } else {
        delete userPredictions[m.match_id]; // đồng bộ khi dự đoán bị xóa ở backend
      }
    });
    renderMatchList();
  } catch(e) {
    if (list) list.innerHTML = '<div style="text-align:center;color:var(--t2);padding:40px 0">Không thể tải dữ liệu. Kiểm tra kết nối.</div>';
  }
}

function matchSortPriority(m) {
  const isUpcoming = m.status === 'upcoming' || m.status === 'scheduled';
  const hasPred = !!userPredictions[m.match_id] || !!m.prediction;
  const isExpired = !isUpcoming; // live, finished, or past lock
  if (isUpcoming && !hasPred) return 0;
  if (isUpcoming && hasPred) return 1;
  return 2;
}

function renderMatchList() {
  const list = document.getElementById('matches-list');
  if (!list) return;
  const sorted = [...matchesData].sort((a, b) => matchSortPriority(a) - matchSortPriority(b));
  list.innerHTML = sorted.length ? sorted.map(renderMatchCard).join('') : '<div style="text-align:center;color:var(--t2);padding:40px 0">Không có trận nào</div>';
  updateHubLive();
  updateHubBanner();
}

let featuredMatch = null;
function updateHubBanner() {
  const banner = document.getElementById('hub-banner');
  if (!banner) return;
  // Trận tâm điểm: trận đầu tiên chưa bắt đầu (upcoming/scheduled), sắp diễn ra sớm nhất.
  featuredMatch = matchesData
    .filter(m => m.status === 'upcoming' || m.status === 'scheduled')
    .sort((a, b) => new Date(a.kickoff_at) - new Date(b.kickoff_at))[0] || null;
  if (!featuredMatch) { banner.style.display = 'none'; return; }
  banner.style.display = '';
  const ht = featuredMatch.home_team, at = featuredMatch.away_team;
  const kickoff = new Date(featuredMatch.kickoff_at);
  const eb = document.getElementById('hub-banner-eyebrow');
  const ti = document.getElementById('hub-banner-title');
  if (eb) eb.textContent = `TRẬN TÂM ĐIỂM · ${fmtTime(kickoff)}`;
  const shortName = t => (t?.code || t?.short || t?.name || 'TBD').toString().slice(0,3).toUpperCase();
  if (ti) ti.innerHTML = `${flagInner(ht, 26)} ${shortName(ht)} vs ${shortName(at)} ${flagInner(at, 26)}`;
}

function hubBannerClick() {
  if (featuredMatch) openPredict(featuredMatch.match_id);
}

function updateHubLive() {
  const liveMatch = matchesData.find(m => m.status === 'live');
  const card = document.getElementById('hub-live-card');
  if (!card) return;
  if (!liveMatch) { card.style.display = 'none'; return; }
  card.style.display = '';
  const ht = liveMatch.home_team, at = liveMatch.away_team;
  const hf = document.getElementById('hub-live-home-flag');
  const hn = document.getElementById('hub-live-home-name');
  const af = document.getElementById('hub-live-away-flag');
  const an = document.getElementById('hub-live-away-name');
  const sc = document.getElementById('hub-live-score');
  const inf = document.getElementById('hub-live-info');
  setFlag(hf, ht, 24);
  if (hn) hn.textContent = ht?.name||'TBD';
  setFlag(af, at, 24);
  if (an) an.textContent = at?.name||'TBD';
  const pred = userPredictions[liveMatch.match_id];
  const result = liveMatch.result;
  if (sc) sc.textContent = result ? `${result.home_score} – ${result.away_score}` : '– –';
  const totalPreds = liveMatch.total_predictions;
  const infoText = [stageLabel(liveMatch), totalPreds ? `${totalPreds.toLocaleString()} lượt dự đoán` : ''].filter(Boolean).join(' · ');
  if (inf) inf.textContent = infoText;
}

function hubLiveClick() {
  const liveMatch = matchesData.find(m => m.status === 'live');
  if (liveMatch) openPredict(liveMatch.match_id);
}

// ===== MATCH CARD =====
function renderMatchCard(m) {
  const ht = m.home_team, at = m.away_team;
  const hN = ht?.name||'TBD', aN = at?.name||'TBD';
  const rn = stageLabel(m);
  const kickoff = new Date(m.kickoff_at);
  const pred = userPredictions[m.match_id] || (m.prediction ? {outcome: m.prediction.outcome, confident: !!m.prediction.use_confidence, editable: m.prediction.is_editable} : null);
  const predCount = m.total_predictions ? `<span class="mc-pred-count">🏆 ${m.total_predictions.toLocaleString()} dự đoán</span>` : '';

  if (m.status === 'finished') {
    const hs = m.result?.home_score??'?', as_ = m.result?.away_score??'?';
    const outcome = m.result?.outcome; // 'won' | 'lost'
    const ocClass = outcome === 'won' ? 'won-btn' : outcome === 'lost' ? 'lost-btn' : 'view-btn';
    const footerBtn = pred
      ? `<button class="btn-place ${ocClass}" onclick="openResult('${m.match_id}')">Đã đoán: ${outcomeLabel(pred.outcome,ht,at)} · Xem kết quả</button>`
      : `<button class="btn-place done-btn" disabled>Đã kết thúc</button>`;
    return `<div class="mc">
      <div class="mc-top"><span class="mc-time">${fmtDate(kickoff)}</span></div>
      <div class="mc-teams">
        <div class="mc-team">${flagHtml(ht)}<div class="mc-name">${hN}</div></div>
        <div class="mc-score">${hs} – ${as_}</div>
        <div class="mc-team right"><div class="mc-name">${aN}</div>${flagHtml(at)}</div>
      </div>
      <div class="mc-info"><span class="mc-stage">${rn}</span>${predCount}</div>
      <div class="mc-action">${footerBtn}</div>
    </div>`;
  }

  const isLive = m.status === 'live';
  const timeStr = `<span class="mc-time">${fmtTime(kickoff)} · ${fmtDate(kickoff)}</span>`;
  const liveBadge = isLive ? `<span class="mc-live-badge">LIVE</span>` : '';

  let actionBtn;
  if (pred) {
    const label = `Đã đoán: ${outcomeLabel(pred.outcome,ht,at)} · Xem`;
    actionBtn = `<button class="btn-place done-btn" onclick="openPredict('${m.match_id}')">${label}</button>`;
  } else if (isLive) {
    actionBtn = `<button class="btn-place live-btn" onclick="openPredict('${m.match_id}')">Dự đoán nhanh · LIVE</button>`;
  } else {
    actionBtn = `<button class="btn-place gold-btn" onclick="openPredict('${m.match_id}')">Đặt dự đoán · ${m.tickets_per_prediction||1} <img src="assets/Ve_du_doan.png" style="height:15px;vertical-align:middle"></button>`;
  }

  return `<div class="mc${isLive?' mc-live':''}">
    <div class="mc-top">${timeStr}${liveBadge}</div>
    <div class="mc-teams">
      <div class="mc-team">${flagHtml(ht)}<div class="mc-name">${hN}</div></div>
      <div class="mc-vs">vs</div>
      <div class="mc-team right"><div class="mc-name">${aN}</div>${flagHtml(at)}</div>
    </div>
    <div class="mc-info"><span class="mc-stage">${rn}</span>${predCount}</div>
    <div class="mc-action">${actionBtn}</div>
  </div>`;
}

const TAB_MAP = {upcoming: 'today', all: 'week', group: 'group', knockout: 'knockout'};

function filterMatches(filter, btn) {
  if (btn) {document.querySelectorAll('#screen-matches .ftab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');}
  fetchMatches(TAB_MAP[filter] || 'today');
}

async function openPredict(matchId) {
  currentMatchId = matchId;

  let m;
  try {
    const res = await fetch(`${API_BASE}/matches/${matchId}?user_id=${currentUserId}`, {headers: API_HEADERS});
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showPopup('Không thể tải trận đấu', err.message || `Lỗi ${res.status}. Vui lòng thử lại.`, 'error', {primaryLabel: 'Thử lại'});
      return;
    }
    m = (await res.json()).data;
    // cập nhật cache local
    const idx = matchesData.findIndex(x => x.match_id === matchId);
    if (idx !== -1) matchesData[idx] = m; else matchesData.push(m);
    if (m.prediction) {
      userPredictions[matchId] = {outcome: m.prediction.outcome, confident: !!m.prediction.use_confidence, editable: m.prediction.is_editable};
    } else {
      delete userPredictions[matchId];
      confidentSelected = false;
      document.getElementById('confident-card')?.classList.remove('on','readonly');
      document.getElementById('conf-toggle')?.classList.remove('on');
    }
  } catch (e) {
    showPopup('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Kiểm tra mạng và thử lại.', 'error', {primaryLabel: 'Thử lại'});
    return;
  }

  const ht = m.home_team, at = m.away_team;
  const kickoff = new Date(m.kickoff_at), lock = new Date(m.lock_at);

  const hf=document.getElementById('predict-home-flag');
  const hn=document.getElementById('predict-home-name');
  const af=document.getElementById('predict-away-flag');
  const an=document.getElementById('predict-away-name');
  const rl=document.getElementById('predict-round-label');
  const ki=document.getElementById('predict-kickoff-info');
  const ct=document.getElementById('community-text');
  const cf=document.getElementById('community-fill');
  const ca=document.getElementById('community-away-pct');
  const ln=document.getElementById('predict-lock-note');

  setFlag(hf, ht, 26);
  if(hn)hn.textContent=ht?.name||'TBD';
  setFlag(af, at, 26);
  if(an)an.textContent=at?.name||'TBD';
  if(rl)rl.textContent=stageLabel(m);
  if(ki)ki.textContent=`Bắt đầu ${fmtTime(kickoff)} · Khóa ${fmtTime(lock)}`;
  if(ln)ln.textContent=`Khóa kéo lúc ${fmtTime(lock)}. Sau thời gian này không sửa được.`;

  // header meta: số dư vé/điểm lấy từ biến toàn cục
  renderBalances();

  // confident card — bật/tắt theo số vé tự tin còn lại (biến toàn cục)
  const cl=document.getElementById('predict-conf-label');
  const cs=document.getElementById('predict-conf-sub');
  const cc2=document.getElementById('confident-card');
  if(cl) cl.textContent = `SỰ TỰ TIN ×${CONFIDENCE_MULTIPLIER}`;
  if(cs) cs.textContent = m.confidence_ticket?.description || 'Dùng thêm 1 vé cược · Trúng nhân đôi điểm';
  if(cc2) cc2.style.opacity = confidenceTickets > 0 ? '1' : '0.4';

  // community bar
  const comm = m.crowd_stats;
  const homePct = comm?.home_win_pct ?? 0;
  const awayPct = comm?.away_win_pct ?? 0;
  const drawPct = Math.max(0, 100 - homePct - awayPct);
  const totalPreds = comm?.total_predictions ?? 0;
  const clbl = document.getElementById('community-lbl');
  if(clbl) clbl.textContent = totalPreds > 0 ? `💬 Cộng đồng đang chọn · ${totalPreds.toLocaleString()} người` : '💬 Cộng đồng đang chọn';
  const cfD=document.getElementById('community-fill-draw');
  const cfA=document.getElementById('community-fill-away');
  const ctD=document.getElementById('community-draw-pct');
  if(cf) cf.style.width = homePct + '%';
  if(cfD) cfD.style.width = drawPct + '%';
  if(cfA) cfA.style.width = awayPct + '%';
  if(ct) ct.textContent = `${ht?.name||'Đội nhà'} ${homePct}%`;
  if(ctD) ctD.textContent = `Hòa ${drawPct}%`;
  if(ca) ca.textContent = `${at?.name||'Đội khách'} ${awayPct}%`;

  // outcome buttons — populate flags, names, community pcts
  const ohIcon = document.getElementById('outcome-home-icon');
  const oaIcon = document.getElementById('outcome-away-icon');
  if(ohIcon){ohIcon.innerHTML='';setFlag(ohIcon,ht,28);}
  if(oaIcon){oaIcon.innerHTML='';setFlag(oaIcon,at,28);}
  const ohlb=document.getElementById('outcome-home-label');
  const oalb=document.getElementById('outcome-away-label');
  if(ohlb) ohlb.textContent=`${ht?.name||'Đội nhà'} thắng`;
  if(oalb) oalb.textContent=`${at?.name||'Đội khách'} thắng`;
  document.getElementById('outcome-home-pct').textContent=`💬 ${homePct}%`;
  document.getElementById('outcome-draw-pct').textContent=`💬 ${drawPct}%`;
  document.getElementById('outcome-away-pct').textContent=`💬 ${awayPct}%`;

  // points preview
  const basePts = m.tickets_per_prediction ? m.tickets_per_prediction * 50 : 50;
  const mult = m.confidence_ticket?.multiplier || 1;
  const pn=document.getElementById('pts-preview-num');
  const pf=document.getElementById('pts-preview-formula');
  const pb=document.getElementById('pts-breakdown');
  if(pn) pn.textContent = basePts;
  if(pf) pf.textContent = `= ${basePts} ×${mult}`;
  if(pb) pb.textContent = '+ Bonus bảng A ·+1\n+ Đoán sớm 24h ·+5';

  const pred = userPredictions[matchId];
  // Trận đã khóa kèo: quá giờ khóa mà người chơi chưa đặt dự đoán -> không cho đặt nữa.
  const isLocked = !pred && Date.now() >= lock.getTime();
  if (pred) {
    renderPlacedMode(m, pred, ht, at);
  } else if (isLocked) {
    renderLockedMode(m, lock);
  } else {
    renderEditMode(m);
  }
  goScreen('screen-predict');
}

// Chế độ "đã dự đoán" — chỉ đọc. Toggle vé tự tin phản ánh việc đã dùng hay chưa, không sửa được.
function renderPlacedMode(m, pred, ht, at){
  document.getElementById('locked-pred-card').style.display = 'none';
  ['score-section','confident-card','pts-prev-wrap'].forEach(id => document.getElementById(id)?.classList.remove('predict-dim'));
  const usedConf = !!pred.confident;
  confidentSelected = usedConf;

  // badge ĐÃ ĐẶT + ẩn ô nhập tỉ số, hiện thẻ dự đoán
  document.getElementById('predict-placed-badge').style.display = 'inline-block';
  document.getElementById('score-section').style.display = 'none';
  const placed = document.getElementById('placed-pred-card');
  placed.style.display = 'block';
  const pod = document.getElementById('placed-outcome-display');
  if(pod) pod.textContent = outcomeLabel(pred.outcome, ht, at);

  // outcome buttons: highlight selected, block interaction
  ['home','draw','away'].forEach(o => {
    const btn = document.getElementById('outcome-'+o);
    if(!btn) return;
    btn.classList.remove('selected');
    btn.classList.add('readonly');
    if(o === pred.outcome) btn.classList.add('selected');
  });
  const tickets = m.tickets_per_prediction || 1;
  document.getElementById('placed-meta').textContent =
    (usedConf ? `Sự tự tin ×${CONFIDENCE_MULTIPLIER} · ` : '') + `Đã trừ ${usedConf ? tickets + 1 : tickets} vé dự đoán`;

  // toggle vé tự tin: khóa, chỉ phản ánh trạng thái đã dùng
  const cc = document.getElementById('confident-card');
  const tog = document.getElementById('conf-toggle');
  cc.classList.add('readonly');
  cc.style.opacity = '1';
  cc.classList.toggle('on', usedConf);
  tog.classList.toggle('on', usedConf);

  // điểm preview theo hệ số đã chốt
  const basePts = tickets * 50;
  const mult = usedConf ? CONFIDENCE_MULTIPLIER : 1;
  document.getElementById('pts-preview-num').textContent = basePts * mult;
  document.getElementById('pts-preview-formula').textContent = `= ${basePts} ×${mult}`;

  // CTA khóa + ghi chú thời điểm đặt
  const ctaBtn = document.getElementById('predict-cta-btn');
  ctaBtn.textContent = 'ĐÃ DỰ ĐOÁN ✓';
  ctaBtn.classList.remove('locked');
  ctaBtn.classList.add('placed');
  ctaBtn.disabled = true;
  ctaBtn.onclick = null;
  const sub = m.prediction?.submitted_at ? `Đã đặt lúc ${fmtTime(new Date(m.prediction.submitted_at))} · ` : '';
  document.getElementById('predict-lock-note').textContent = `${sub}Chờ kết quả sau khi trận kết thúc.`;
}

// Chế độ đặt mới — cho phép nhập & bật/tắt vé tự tin.
function renderEditMode(m){
  document.getElementById('predict-placed-badge').style.display = 'none';
  document.getElementById('score-section').style.display = '';
  document.getElementById('placed-pred-card').style.display = 'none';
  document.getElementById('locked-pred-card').style.display = 'none';
  ['score-section','confident-card','pts-prev-wrap'].forEach(id => document.getElementById(id)?.classList.remove('predict-dim'));

  const ctaBtn = document.getElementById('predict-cta-btn');
  if(ctaBtn){
    ctaBtn.innerHTML = `ĐẶT DỰ ĐOÁN · ${m.tickets_per_prediction||1} <img src="assets/Ve_du_doan.png" style="height:16px;vertical-align:middle">`;
    ctaBtn.classList.remove('placed','locked');
    ctaBtn.disabled = false;
    ctaBtn.onclick = confirmPredict;
  }

  confidentSelected=false;
  const cc=document.getElementById('confident-card');
  const tog=document.getElementById('conf-toggle');
  if(cc){cc.classList.remove('on','readonly');}
  if(tog)tog.classList.remove('on');

  selectedOutcome=null;
  ['home','draw','away'].forEach(o => {
    const btn=document.getElementById('outcome-'+o);
    if(btn){btn.classList.remove('selected','readonly');}
  });
}

// Chế độ "trận đã khóa kèo" — quá giờ khóa, không cho đặt dự đoán nữa.
function renderLockedMode(m, lock){
  document.getElementById('predict-placed-badge').style.display = 'none';
  document.getElementById('placed-pred-card').style.display = 'none';

  // vẫn hiển thị ô nhập tỉ số nhưng làm mờ + chặn tương tác, kèm thẻ khóa kèo
  document.getElementById('score-section').style.display = '';
  document.getElementById('locked-pred-card').style.display = 'block';
  document.getElementById('locked-pred-sub').textContent = `Đã quá ${fmtTime(lock)} — không thể đặt dự đoán`;
  ['score-section','confident-card','pts-prev-wrap'].forEach(id => document.getElementById(id)?.classList.add('predict-dim'));

  const ctaBtn = document.getElementById('predict-cta-btn');
  ctaBtn.textContent = '🔒 ĐÃ KHÓA KÈO';
  ctaBtn.classList.remove('placed');
  ctaBtn.classList.add('locked');
  ctaBtn.disabled = true;
  ctaBtn.onclick = null;
  document.getElementById('predict-lock-note').textContent = 'Kèo đã đóng. Hẹn bạn ở trận tiếp theo!';
}

function confirmPredict() {
  const m = matchesData.find(x => x.match_id === currentMatchId);
  const ht = m?.home_team, at = m?.away_team;

  if (!selectedOutcome) {
    showPopup('Chưa chọn kết quả', 'Hãy chọn một trong ba kết quả: thắng, hòa hoặc thua trước khi đặt dự đoán.', 'info', {primaryLabel:'Đã hiểu'});
    return;
  }

  // kiểm tra số vé
  const cost = m?.tickets_per_prediction || 1;
  if (predictionTickets < cost) { showNoTickets(cost); return; }

  const el = id => document.getElementById(id);
  el('cf-outcome-label').textContent = outcomeLabel(selectedOutcome, ht, at);
  el('cf-match-label').textContent = `${ht?.name||''} vs ${at?.name||''}`;

  const confRow = document.getElementById('cf-conf-row');
  const cfConfVal = document.getElementById('cf-conf-val');
  if(confidentSelected){
    confRow.style.display='flex';
    cfConfVal.textContent=`×${CONFIDENCE_MULTIPLIER} (ĐẶT)`;
  } else {
    confRow.style.display='none';
  }

  const tickets = m?.tickets_per_prediction || 1;
  const totalCost = confidentSelected ? tickets + 1 : tickets;
  el('cf-cost').innerHTML = `${totalCost} vé dự đoán <img src="assets/Ve_du_doan.png" style="height:15px;vertical-align:middle">`;

  const baseMulti = confidentSelected ? CONFIDENCE_MULTIPLIER : 1;
  const pts = 50 * baseMulti;
  el('cf-pts').textContent = `+${pts} điểm`;

  document.getElementById('confirm-overlay').classList.add('show');
}

function closeConfirm(e) {
  if(e && e.target !== document.getElementById('confirm-overlay')) return;
  document.getElementById('confirm-overlay').classList.remove('show');
}

// ===== REWARD SEASON MODAL =====
function openRewards(){
  document.getElementById('reward-overlay').classList.add('show');
}
function closeRewards(e){
  if(e && e.target !== document.getElementById('reward-overlay')) return;
  document.getElementById('reward-overlay').classList.remove('show');
}

async function submitPredict() {
  document.getElementById('confirm-overlay').classList.remove('show');
  try {
    const res = await fetch(`${API_BASE}/predictions`, {
      method: 'POST',
      headers: {...API_HEADERS, 'Content-Type': 'application/json'},
      body: JSON.stringify({user_id: currentUserId, match_id: currentMatchId, outcome: selectedOutcome, use_confidence: confidentSelected})
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.message || `Lỗi ${res.status}. Vui lòng thử lại.`;
      showPopup('Không thể đặt dự đoán', msg, 'error', {primaryLabel: 'Thử lại'});
      return;
    }
  } catch (e) {
    showPopup('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Kiểm tra mạng và thử lại.', 'error', {primaryLabel: 'Thử lại'});
    return;
  }
  userPredictions[currentMatchId] = {outcome: selectedOutcome, confident: confidentSelected};
  const mSubmit = matchesData.find(x => x.match_id === currentMatchId);
  spendPredictionTickets(mSubmit?.tickets_per_prediction || 1);
  if(confidentSelected) spendConfidenceTickets(1);
  fetchWallet();
  showSuccessScreen(currentMatchId);
  filterMatches('upcoming');
  showPredictSuccess(currentMatchId);
}

function showPredictSuccess(matchId){
  const m = matchesData.find(x => x.match_id === matchId);
  const ht = m?.home_team, at = m?.away_team;
  const confLabel = confidentSelected ? ` · <span class="conf">Sự tự tin ×${CONFIDENCE_MULTIPLIER}</span>` : '';
  document.getElementById('ps-score').innerHTML =
    `<span style="font-weight:800">${outcomeLabel(selectedOutcome,ht,at)}</span>${confLabel}`;
  const tk = document.getElementById('ps-tickets');
  tk.innerHTML = `Vé dự đoán còn lại: ${predictionTickets} <img src="assets/Ve_du_doan.png" style="height:14px;vertical-align:middle">`;
  document.getElementById('success-overlay').classList.add('show');
}

function closeSuccess(){
  document.getElementById('success-overlay').classList.remove('show');
}

// Popup hết vé dự đoán — hiện khi số vé không đủ để đặt cược.
function showNoTickets(cost){
  const qty = cost || 1;
  const total = TICKET_PRICE_KIP * qty;
  document.getElementById('nt-qty').textContent = qty;
  document.getElementById('nt-price').textContent = total.toLocaleString();
  document.getElementById('nt-cta-price').textContent = total.toLocaleString();
  renderPredictionTickets(); // đồng bộ số dư hiển thị trong popup
  document.getElementById('notickets-overlay').classList.add('show');
}
function closeNoTickets(e){
  if(e && e.target !== document.getElementById('notickets-overlay')) return;
  document.getElementById('notickets-overlay').classList.remove('show');
}

async function openResult(matchId) {
  try {
    const res = await fetch(`${API_BASE}/matches/${matchId}?user_id=${currentUserId}`, {headers: API_HEADERS});
    if(res.ok) {
      const fresh = (await res.json()).data;
      const idx = matchesData.findIndex(x=>x.match_id===matchId);
      const cached = idx !== -1 ? matchesData[idx] : null;
      // giữ result từ cache nếu detail endpoint không trả về
      if(!fresh.result && cached?.result) fresh.result = cached.result;
      if(idx!==-1) matchesData[idx]=fresh; else matchesData.push(fresh);
      if(fresh.prediction) userPredictions[matchId]={outcome:fresh.prediction.outcome,confident:!!fresh.prediction.use_confidence,editable:fresh.prediction.is_editable};
    }
  } catch(e){}
  showSuccessScreen(matchId);
  goScreen('screen-success');
}

function showSuccessScreen(matchId) {
  const m=matchesData.find(x=>x.match_id===matchId);
  const pred=userPredictions[matchId];
  if(!pred||!m)return;
  const ht=m.home_team, at=m.away_team;

  const rb=document.getElementById('result-badge');
  const rc=document.querySelector('#screen-success .result-card');
  const rr=document.getElementById('result-round');
  const rhf=document.getElementById('result-home-flag');
  const rhs=document.getElementById('result-home-short');
  const raf=document.getElementById('result-away-flag');
  const ras=document.getElementById('result-away-short');
  const rs=document.getElementById('result-score');
  const rys=document.getElementById('result-your-score');
  const rcb=document.getElementById('result-conf-badge');
  const rpb=document.getElementById('result-pts-breakdown');
  const rpn=document.getElementById('result-pts');
  const ptsBox=document.querySelector('#screen-success .pts-result');

  if(rr)rr.textContent=stageLabel(m);
  setFlag(rhf, ht, 26);
  if(rhs)rhs.textContent=(ht?.name||'?').slice(0,3).toUpperCase();
  setFlag(raf, at, 26);
  if(ras)ras.textContent=(at?.name||'?').slice(0,3).toUpperCase();
  if(rcb){rcb.style.display=pred.confident?'inline-block':'none';}

  const isFinished = m.status === 'finished' && m.result;
  if(isFinished) {
    const r=m.result;
    const pts=r.points_earned||0;
    const isCorrect=pts>0;

    // card & badge
    if(rc){rc.className='result-card '+(isCorrect?'correct':'wrong');}
    if(rb){rb.textContent=isCorrect?'TRÚNG KẾT QUẢ':'ĐOÁN SAI';rb.className='result-badge'+(isCorrect?'':' wrong');}

    // hiển thị tỉ số thực tế
    if(rs)rs.textContent=`${r.home_score} – ${r.away_score}`;

    // dự đoán của người chơi + icon đúng/sai
    if(rys){
      rys.textContent=`${outcomeLabel(pred.outcome,ht,at)} ${isCorrect?'✓':'✗'}`;
      rys.className='result-your-val '+(isCorrect?'correct':'wrong');
    }

    // điểm
    if(rpn){rpn.textContent=isCorrect?`+${pts}`:`+0`;rpn.className='pts-result-num'+(isCorrect?'':' wrong');}
    if(ptsBox)ptsBox.className='pts-result'+(isCorrect?'':' wrong');
    if(rpb){
      if(isCorrect){
        const basePts = pred.confident ? Math.round(pts/2) : pts;
        let breakdown=`+${basePts} điểm cơ bản`;
        if(pred.confident)breakdown+=`\n+ Vé Tự Tin ×2`;
        rpb.textContent=breakdown;
      } else {
        rpb.textContent=pred.confident?'Sai kết quả · mất toàn bộ điểm thưởng':'Kết quả không khớp\ndự đoán của bạn';
      }
    }
  } else {
    // pending - chưa có kết quả
    if(rc)rc.className='result-card';
    if(rb){rb.textContent='ĐÃ GHI NHẬN';rb.className='result-badge pending';}
    if(rs)rs.textContent='–';
    if(rys){rys.textContent=outcomeLabel(pred.outcome,ht,at);rys.className='result-your-val';}
    if(rpn){rpn.innerHTML='+? <img src="assets/Ve_du_doan.png" style="height:16px;vertical-align:middle">';rpn.className='pts-result-num';}
    if(ptsBox)ptsBox.className='pts-result';
    if(rpb)rpb.textContent=pred.confident?'Điểm nhân đôi nếu trúng\n(VÉ TỰ TIN đã kích hoạt)':'Điểm sẽ cộng sau\nkhi có kết quả chính thức';
  }
}

function toggleConfident(el){
  if(el.classList.contains('readonly')) return;
  // chỉ cho bật khi còn vé tự tin
  if(!confidentSelected && confidenceTickets < 1){
    showPopup('Hết sự tự tin', 'Bạn đã dùng hết sự tự tin. Hãy để dành cho trận chắc thắng nhé!', 'info', {primaryLabel:'Đã hiểu'});
    return;
  }
  confidentSelected=!confidentSelected;
  const tog=document.getElementById('conf-toggle');
  el.classList.toggle('on',confidentSelected);
  if(tog)tog.classList.toggle('on',confidentSelected);
}

function changeScore(side,delta){
  const el=document.getElementById('score-'+side);
  let v=parseInt(el.textContent)+delta;
  if(v<0)v=0;if(v>9)v=9;
  el.textContent=v;
}

// Gọi API vòng quay — user_id truyền qua query param theo đặc tả backend.
async function callSpinApi(){
  const res = await fetch(`${API_BASE}/wheel/spin?user_id=${currentUserId}`, {
    method: 'POST',
    headers: API_HEADERS
  });
  if(!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()).data;
}

let wheelDeg = 0;
async function spinWheel(){
  if(spinning) return;
  if(luckyTickets < 1){ showNoTickets(1); return; }

  spinning = true;
  spendLuckyTickets(1);

  // Bật animation bánh xe — cộng dồn góc để lần nào cũng quay tiếp về phía trước
  const w = document.getElementById('wheel');
  wheelDeg += 1800 + Math.floor(Math.random() * 360);
  w.style.transform = `rotate(${wheelDeg}deg)`;
  // Counter-rotate label: vị trí đi theo vòng quay nhưng chữ/icon luôn đứng thẳng
  document.querySelectorAll('#wheel .spin-seg').forEach(s => {
    s.style.transform = `translate(-50%,-50%) rotate(${-wheelDeg}deg)`;
  });

  // Chạy song song: đợi animation (3s) + gọi API
  const animDone = new Promise(r => setTimeout(r, 3200));
  let prize = null;
  try {
    const [apiResult] = await Promise.all([callSpinApi(), animDone]);
    prize = apiResult;
  } catch(e) {
    await animDone;
    // API lỗi — hoàn trả vé và báo lỗi
    addLuckyTickets(1);
    spinning = false;
    showPopup('Lỗi kết nối', 'Không thể kết nối máy chủ. Vé may mắn đã được hoàn trả.', 'error', {primaryLabel:'Đã hiểu'});
    return;
  }

  spinning = false;
  showSpinResult(prize);
}

function showSpinResult(prize){
  const prizeType = prize.prize_type;
  const pointsAwarded = prize.points_awarded || 0;
  const prizeName = prize.prize_name || '';

  // Cộng điểm ngay lập tức cho trải nghiệm mượt, fetchWallet đồng bộ lại số thực từ server
  if(pointsAwarded > 0) addUserPoints(pointsAwarded);
  fetchWallet();

  const val = document.getElementById('spin-prize-value');
  const unit = document.getElementById('spin-prize-unit');
  const icon = document.getElementById('spin-prize-icon');
  const titleEl = document.getElementById('spin-result-title');
  const subtitleEl = document.getElementById('spin-result-subtitle');
  const addedEl = document.getElementById('spin-result-added');

  if(prizeType === 'points'){
    val.textContent = pointsAwarded.toLocaleString('vi-VN');
    unit.textContent = 'ĐIỂM';
    icon.style.background = 'var(--gold)';
    val.style.color = '#1a3a24';
    unit.style.color = '#1a3a24';
    if(titleEl) titleEl.textContent = '🎉 CHÚC MỪNG 🎉';
    if(subtitleEl) subtitleEl.textContent = 'Bạn đã trúng';
    if(addedEl) addedEl.textContent = 'Đã cộng vào ví điểm của bạn';
  } else if(prizeType === 'no_prize'){
    val.textContent = '😔';
    unit.textContent = 'Chúc may mắn';
    icon.style.background = 'rgba(255,255,255,0.08)';
    val.style.color = 'white';
    unit.style.color = 'rgba(255,255,255,0.6)';
    if(titleEl) titleEl.textContent = 'Tiếc quá!';
    if(subtitleEl) subtitleEl.textContent = prizeName || 'Chúc bạn may mắn lần sau';
    if(addedEl) addedEl.textContent = 'Vé may mắn đã được sử dụng';
  } else if(prizeType === 'physical_item'){
    val.textContent = '🎁';
    unit.textContent = pointsAwarded > 0 ? `+${pointsAwarded} điểm` : 'QUÀ';
    icon.style.background = '#9B59B6';
    val.style.color = 'white';
    unit.style.color = 'rgba(255,255,255,0.8)';
    if(titleEl) titleEl.textContent = '🎉 CHÚC MỪNG 🎉';
    if(subtitleEl) subtitleEl.textContent = prizeName;
    if(addedEl) addedEl.textContent = pointsAwarded > 0 ? 'Điểm đã cộng vào ví. Điền thông tin để nhận quà!' : 'Điền thông tin bên dưới để nhận quà!';
  } else {
    val.textContent = '?';
    unit.textContent = 'QUÀ BÍ MẬT';
    icon.style.background = '#9B59B6';
    val.style.color = 'white';
    unit.style.color = 'rgba(255,255,255,0.8)';
    if(titleEl) titleEl.textContent = '🎉 CHÚC MỪNG 🎉';
    if(subtitleEl) subtitleEl.textContent = prizeName || 'Bạn đã trúng';
    if(addedEl) addedEl.textContent = 'Đã cộng vào ví điểm của bạn';
  }

  // Nút nhận quà vật lý
  const claimBtn = document.getElementById('spin-claim-btn');
  if(claimBtn){
    if(prizeType === 'physical_item' && prize.requires_claim){
      claimBtn.style.display = 'block';
      claimBtn.onclick = () => { closeSpinResult(); openClaimForm(prize.spin_id, prizeName); };
    } else {
      claimBtn.style.display = 'none';
    }
  }

  // Ẩn nút quay tiếp nếu hết vé
  document.getElementById('spin-again-btn').style.display = luckyTickets > 0 ? 'block' : 'none';

  // Confetti
  const box = document.getElementById('spin-confetti');
  box.innerHTML = '';
  const emojis = prizeType === 'no_prize' ? ['💫','⭐'] : ['🎊','✨','🌟','🎉','💫'];
  for(let i=0;i<12;i++){
    const s = document.createElement('span');
    s.textContent = emojis[i%emojis.length];
    s.style.cssText = `position:absolute;top:${Math.random()*60}%;left:${Math.random()*90}%;font-size:${14+Math.random()*10}px;opacity:0;animation:fadeInOut 1.5s ${Math.random()*0.5}s forwards`;
    box.appendChild(s);
  }

  document.getElementById('spin-result-overlay').classList.add('show');
}

function closeSpinResult(){
  document.getElementById('spin-result-overlay').classList.remove('show');
}

// ===== CLAIM FORM =====
let currentClaimSpinId = null;

function openClaimForm(spinId, prizeName){
  currentClaimSpinId = spinId;
  document.getElementById('claim-prize-name').textContent = prizeName || 'Quà vật lý';
  ['claim-fullname','claim-phone','claim-address','claim-note'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('claim-overlay').classList.add('show');
}

function closeClaimForm(e){
  if(e && e.target !== document.getElementById('claim-overlay')) return;
  document.getElementById('claim-overlay').classList.remove('show');
}

async function submitClaim(){
  const fullName = document.getElementById('claim-fullname').value.trim();
  const phone = document.getElementById('claim-phone').value.trim();
  const address = document.getElementById('claim-address').value.trim();
  const note = document.getElementById('claim-note').value.trim();
  if(!fullName || !phone || !address){
    showPopup('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.', 'warning', {primaryLabel: 'Đã hiểu'});
    return;
  }
  const btn = document.getElementById('claim-submit-btn');
  btn.disabled = true; btn.textContent = 'Đang gửi…';
  try {
    const res = await fetch(`${API_BASE}/wheel/claims/${currentClaimSpinId}?user_id=${currentUserId}`, {
      method: 'POST',
      headers: {...API_HEADERS, 'Content-Type': 'application/json'},
      body: JSON.stringify({full_name: fullName, phone, address, note})
    });
    if(!res.ok){
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    document.getElementById('claim-overlay').classList.remove('show');
    showPopup('Đã ghi nhận!', 'Thông tin nhận quà đã được lưu. Chúng tôi sẽ liên hệ với bạn sớm nhất.', 'success', {primaryLabel: 'Tuyệt vời'});
  } catch(e){
    showPopup('Lỗi gửi thông tin', e.message || 'Không thể gửi thông tin. Vui lòng thử lại.', 'error', {primaryLabel: 'Thử lại'});
  } finally {
    btn.disabled = false; btn.textContent = 'GỬI THÔNG TIN';
  }
}

// ===== WHEEL PRIZES =====
async function fetchWheelPrizes(){
  try {
    const res = await fetch(`${API_BASE}/wheel/prizes`, {headers: API_HEADERS});
    if(!res.ok) return;
    const prizes = (await res.json()).data || [];
    renderPrizeGrid(prizes);
  } catch(e){}
}

function renderPrizeGrid(prizes){
  const grid = document.getElementById('wheel-prize-grid');
  if(!grid || !prizes.length) return;
  const typeIcon = {points:'⭐', no_prize:'😔', physical_item:'🎁'};
  grid.innerHTML = prizes.map(p => {
    const icon = typeIcon[p.prize_type] || '🎁';
    const label = p.prize_type === 'points' ? `${icon} ×${p.points_value}`
      : p.prize_type === 'no_prize' ? `${icon} Chúc may mắn`
      : `${icon} ${p.name}`;
    return `<div class="prize-row">${label}</div>`;
  }).join('');
}

function spinAgain(){
  closeSpinResult();
  // Không cần reset: góc quay cộng dồn (wheelDeg) nên luôn quay tiếp về phía trước
  spinWheel();
}

// Mở game Suica. Logic tiêu vé sẽ được xử lý ở game engine.
function openMinigame(){
  goScreen('screen-game');
}

function selectAnswer(btn){
  document.querySelectorAll('#screen-live button').forEach(b=>{b.style.background='rgba(255,255,255,0.06)';b.style.borderColor='rgba(255,255,255,0.15)';});
  btn.style.background='rgba(245,200,66,0.12)';btn.style.borderColor='var(--gold)';
}

function setSF(btn){
  document.querySelectorAll('.sftab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  // Lọc card theo data-cat của tab: all hiện tất cả
  const cat = btn.dataset.cat || 'all';
  document.querySelectorAll('.shop-grid .shop-card').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
}
function setLbTab(btn){document.querySelectorAll('.lb-ftab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');}
function selectPkg(el){document.querySelectorAll('.pkg-card').forEach(c=>c.classList.remove('selected'));el.classList.add('selected');updateTopupSummary();}

// Cập nhật tổng tiền & số vé theo gói đang chọn.
function updateTopupSummary(){
  const sel=document.querySelector('.pkg-card.selected');
  if(!sel)return;
  const tickets=+sel.dataset.tickets||0, bonus=+sel.dataset.bonus||0, price=+sel.dataset.price||0;
  const priceStr=price.toLocaleString('vi-VN')+'đ';
  const tt=document.getElementById('topup-total');
  const bd=document.getElementById('topup-breakdown');
  const pb=document.getElementById('topup-pay-btn');
  if(tt)tt.textContent=priceStr;
  if(bd)bd.textContent=bonus>0?`= ${tickets} vé + ${bonus} bonus`:`= ${tickets} vé`;
  if(pb)pb.textContent=`THANH TOÁN · ${priceStr}`;
}

// Thanh toán (giả lập) — cộng vé vào biến toàn cục, đồng bộ mọi nơi.
function payTopup(){
  const sel=document.querySelector('.pkg-card.selected');
  if(!sel)return;
  const total=(+sel.dataset.tickets||0)+(+sel.dataset.bonus||0);
  addPredictionTickets(total);
  showPopup('Nạp vé thành công', `Đã cộng ${total} vé dự đoán. Số dư hiện tại: ${predictionTickets}.`, 'success', {primaryLabel:'Tuyệt vời'});
}
function setPayMethod(btn){document.querySelectorAll('.pay-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}

// NAV
const TAB_ROOTS=['screen-hub','screen-lb','screen-shop','screen-profile'];
const tabStacks=TAB_ROOTS.map(r=>[r]);
let activeTab=0,spinning=false;

function showScreen(id){
  const cur=document.querySelector('.screen.active');
  if(cur&&cur.id==='screen-game'&&id!=='screen-game')destroySushiGame();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const t=document.getElementById(id);if(t)t.classList.add('active');
  document.getElementById('bottom-nav').style.display=id==='screen-game'?'none':'';
  if(id==='screen-game')initSushiGame();
}
function updateNav(){document.querySelectorAll('#bottom-nav .nav-item').forEach((item,i)=>item.classList.toggle('active',i===activeTab));}
function goTab(i){activeTab=i;tabStacks[i]=[TAB_ROOTS[i]];showScreen(TAB_ROOTS[i]);updateNav();}
function goScreen(id){
  const ti=TAB_ROOTS.indexOf(id);
  if(ti!==-1){goTab(ti);return;}
  tabStacks[activeTab].push(id);showScreen(id);updateNav();
}
function goBack(){
  const s=tabStacks[activeTab];
  if(s.length>1){s.pop();showScreen(s[s.length-1]);updateNav();}
  else if(activeTab!==0){goTab(0);}
}

// TIMER
let secs=Math.max(0,Math.floor((new Date('2026-07-05T21:45:00+07:00')-new Date())/1000));
setInterval(()=>{
  if(secs>0)secs--;
  const days=Math.floor(secs/86400),h=Math.floor((secs%86400)/3600),m=Math.floor((secs%3600)/60),s=secs%60;
  const el=document.getElementById('timer');
  if(el)el.textContent=days>0?`${days}n ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
},1000);

// LIVE TIMER
let liveSecs=8;
setInterval(()=>{
  if(liveSecs>0)liveSecs--;else liveSecs=10;
  const el=document.getElementById('live-timer');
  if(el)el.textContent=String(liveSecs).padStart(2,'0');
},1000);

// INIT
window.addEventListener('DOMContentLoaded',()=>{renderBalances();updateTopupSummary();fetchMatches('today');fetchWallet();fetchWheelPrizes();});

// UNITY
let gameInitialized=false,unityInstance=null;
function destroySushiGame(){
  if(unityInstance){unityInstance.Quit().catch(()=>{});unityInstance=null;}
  gameInitialized=false;
  const c=document.getElementById('unity-canvas');if(c){const ctx=c.getContext('2d');if(ctx)ctx.clearRect(0,0,c.width,c.height);}
  const l=document.getElementById('suica-loader');if(l)l.classList.remove('hide');
}
function initSushiGame(){
  if(gameInitialized)return;gameInitialized=true;
  const box=document.getElementById('sl-stars');
  if(box){let s='';for(let i=0;i<36;i++){const x=Math.random()*100,y=Math.random()*100,sz=(2+Math.random()*3).toFixed(1),op=(0.2+Math.random()*0.55).toFixed(2),gold=Math.random()<0.28;s+=`<div class="st" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;opacity:${op};background:${gold?'rgba(255,201,60,.8)':'rgba(255,255,255,.7)'}"></div>`;}box.innerHTML=s;}
  const fill=document.getElementById('sl-fill'),knob=document.getElementById('sl-knob'),pct=document.getElementById('sl-pct'),loader=document.getElementById('suica-loader');
  const stepLabel=document.getElementById('sl-step-label'),stepCounter=document.getElementById('sl-step-counter');
  const dots=[0,1,2,3,4].map(i=>document.getElementById('sl-dot-'+i));
  const STEPS=[{at:0,label:'Khởi động hệ thống…',counter:'BƯỚC 1 / 5'},{at:0.05,label:'Tải JavaScript framework…',counter:'BƯỚC 2 / 5'},{at:0.30,label:'Tải WebAssembly engine…',counter:'BƯỚC 3 / 5'},{at:0.65,label:'Tải dữ liệu game…',counter:'BƯỚC 4 / 5'},{at:0.90,label:'Khởi tạo game…',counter:'BƯỚC 5 / 5'}];
  let cs=0,shown=0;
  function updateStep(idx){if(idx===cs)return;cs=idx;if(stepLabel)stepLabel.textContent=STEPS[idx].label;if(stepCounter)stepCounter.textContent=STEPS[idx].counter;dots.forEach((d,i)=>{if(!d)return;d.classList.remove('active','done');if(i<idx)d.classList.add('done');if(i===idx)d.classList.add('active');});}
  function setP(p){p=Math.max(shown,Math.min(1,p));shown=p;const v=Math.round(p*100);if(fill)fill.style.width=v+'%';if(knob)knob.style.left=v+'%';if(pct)pct.textContent=v+'%';for(let i=STEPS.length-1;i>=0;i--){if(p>=STEPS[i].at){updateStep(i);break;}}}
  function finish(){setP(1);dots.forEach(d=>{if(d){d.classList.remove('active');d.classList.add('done');}});setTimeout(()=>{if(loader)loader.classList.add('hide');},450);}
  let fakeT=0;const fi=setInterval(()=>{fakeT+=0.005;setP(fakeT*0.04);if(fakeT>=1)clearInterval(fi);},40);
  let lastRU=Date.now();
  setInterval(()=>{if(shown>=0.99)return;if(Date.now()-lastRU<800)return;setP(shown+(0.99-shown)*0.04);},100);
  const script=document.createElement('script');script.src='minigame/Sushi_demo01.loader.js';
  script.onload=()=>{clearInterval(fi);lastRU=Date.now();
    const canvas=document.getElementById('unity-canvas');
    createUnityInstance(canvas,{dataUrl:'minigame/Sushi_demo01.data.unityweb',frameworkUrl:'minigame/Sushi_demo01.framework.js.unityweb',codeUrl:'minigame/Sushi_demo01.wasm.unityweb',streamingAssetsUrl:'minigame/StreamingAssets',companyName:'SimpStudio',productName:'Sushi Perfect',productVersion:'2.0.46'},p=>{const mapped=0.04+p*0.96;if(mapped>shown+0.015)lastRU=Date.now();setP(mapped);}).then(inst=>{unityInstance=inst;finish();},finish);
  };
  document.head.appendChild(script);
}
