let enabled = true;
let lastHex = '';

const host = document.createElement('div');
host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none';
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = `<style>
  div{font:12px/1.4 system-ui;background:#1A1A1A;color:#fff;padding:6px 8px;
      border-radius:6px;white-space:pre}
</style><div id="t"></div>`;
document.documentElement.appendChild(host);
const tip = shadow.getElementById('t');

// small colour name list [name, r, g, b]
const NAMES = [
  ['Black',0,0,0],['White',255,255,255],['Grey',128,128,128],['Light grey',200,200,200],
  ['Dark grey',64,64,64],['Red',220,30,40],['Dark red',139,0,0],['Maroon',128,0,32],
  ['Pink',255,150,180],['Salmon',250,128,114],['Orange',255,140,0],['Brown',120,70,30],
  ['Beige',225,205,170],['Yellow',255,230,0],['Gold',212,175,55],['Olive',128,128,0],
  ['Lime',120,230,40],['Green',34,160,60],['Dark green',0,90,40],['Mint',170,235,200],
  ['Teal',0,128,128],['Cyan',0,200,230],['Sky blue',135,206,235],['Blue',30,90,220],
  ['Navy',0,0,128],['Purple',128,0,128],['Violet',150,90,220],['Lavender',200,180,240],
  ['Magenta',220,0,200],['Light yellow',255,250,170]
];

const toRGB = c => c.match(/[\d.]+/g).slice(0, 3).map(n => Math.round(+n));
const toHex = rgb => '#' + rgb.map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();

function nearestName(rgb) {
  let best = '', bestDist = Infinity;
  for (const [name, r, g, b] of NAMES) {
    const d = (rgb[0]-r)**2 + (rgb[1]-g)**2 + (rgb[2]-b)**2;
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return best;
}

// WCAG contrast ratio
function luminance([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function bgOf(el) {
  while (el) {
    const c = getComputedStyle(el).backgroundColor;
    if (!c.startsWith('rgba(0, 0, 0, 0') && c !== 'transparent') return c;
    el = el.parentElement;
  }
  return 'rgb(255, 255, 255)';
}

document.addEventListener('mouseover', e => {
  if (!enabled) return;
  const fg = toRGB(getComputedStyle(e.target).color);
  const bg = toRGB(bgOf(e.target));
  lastHex = toHex(fg);
  tip.textContent =
    `Text  ${toHex(fg)}  rgb(${fg})  ${nearestName(fg)}\n` +
    `Back  ${toHex(bg)}  rgb(${bg})  ${nearestName(bg)}\n` +
    `Contrast ${contrast(fg, bg).toFixed(2)}:1\n` +
    `Alt+click copies the text colour`;
});

document.addEventListener('mousemove', e => {
  host.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
});

// Click to copy: Alt+click, so normal clicks on links still work
document.addEventListener('click', e => {
  if (!enabled || !e.altKey) return;
  e.preventDefault();
  navigator.clipboard.writeText(lastHex).catch(() => {});
}, true);

// On/off switch from the popup
function applyEnabled(value) {
  enabled = value;
  host.style.display = enabled ? '' : 'none';
}

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get({ enabled: true }, r => applyEnabled(r.enabled));
  chrome.storage.onChanged.addListener(ch => {
    if (ch.enabled) applyEnabled(ch.enabled.newValue);
  });
}