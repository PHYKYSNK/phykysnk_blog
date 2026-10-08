'use strict';
// 最小 DOM 桩：用于在 Node 里真实执行 main.js 的舒尔特方格逻辑
const fs = require('fs');
const path = require('path');

class El {
  constructor(tag) {
    this.tagName = String(tag || 'div').toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.style = {};
    this._attrs = {};
    this._listeners = {};
    this._text = '';
    this._html = '';
    this._classes = new Set();
    this.disabled = false;
    this.type = '';
    this.className = '';
    this.nodeType = 1;
    const self = this;
    this.classList = {
      add: (...c) => c.forEach((x) => self._classes.add(x)),
      remove: (...c) => c.forEach((x) => self._classes.delete(x)),
      contains: (c) => self._classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          self._classes.has(c) ? self._classes.delete(c) : self._classes.add(c);
        } else {
          force ? self._classes.add(c) : self._classes.delete(c);
        }
      }
    };
  }
  get textContent() {
    if (this.childNodes.length) return this.childNodes.map((c) => c.textContent).join('');
    return this._text;
  }
  set textContent(v) { this._text = String(v); this.childNodes = []; }
  get innerHTML() { return this._html; }
  set innerHTML(v) {
    this._html = String(v);
    if (v === '') this.childNodes = [];
    this._text = v === '' ? '' : this._text;
  }
  appendChild(c) { c.parentNode = this; this.childNodes.push(c); return c; }
  removeChild(c) { this.childNodes = this.childNodes.filter((x) => x !== c); return c; }
  insertBefore(n) { n.parentNode = this; this.childNodes.push(n); return n; }
  replaceChild(n, o) { this.childNodes = this.childNodes.map((x) => (x === o ? n : x)); return o; }
  setAttribute(k, v) { this._attrs[k] = String(v); }
  getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; }
  addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); }
  removeEventListener() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  closest() { return null; }
  fire(type, ev) { (this._listeners[type] || []).forEach((fn) => fn(ev || { preventDefault() {}, stopPropagation() {} })); }
}

const registry = {};
function getEl(id) {
  if (!registry[id]) registry[id] = new El('div');
  return registry[id];
}

const documentElement = new El('html');
const domReadyHandlers = [];

global.document = {
  documentElement,
  getElementById: getEl,
  createElement: (t) => new El(t),
  createTextNode: (t) => { const e = new El('#text'); e.textContent = t; return e; },
  addEventListener: (t, fn) => { if (t === 'DOMContentLoaded') domReadyHandlers.push(fn); },
  querySelector: () => null,
  querySelectorAll: () => [],
  body: new El('body')
};

const hashListeners = [];
global.window = {
  location: { hash: '' },
  addEventListener: (t, fn) => { if (t === 'hashchange') hashListeners.push(fn); },
  scrollTo: () => {},
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} })
};
global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] === undefined ? null : this._d[k]; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; }
};
global.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([]),
  text: () => Promise.resolve('')
});
global.marked = undefined;
global.hljs = undefined;

// 执行 main.js
const src = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'main.js'), 'utf8');
new Function('document', 'window', 'localStorage', 'fetch', 'performance', 'setInterval', 'clearInterval', 'setTimeout', 'marked', 'hljs', src)(
  global.document, global.window, global.localStorage, global.fetch,
  global.performance, global.setInterval, global.clearInterval, global.setTimeout,
  global.marked, global.hljs
);

// 触发 DOMContentLoaded
domReadyHandlers.forEach((fn) => fn());

const results = [];
function check(name, cond, extra) {
  results.push({ name, pass: !!cond, extra: extra === undefined ? '' : String(extra) });
}

const grid = getEl('schulte-grid');
const overlay = getEl('schulte-overlay');
const overlayText = getEl('schulte-overlay-text');
const startBtn = getEl('schulte-start');
const timeEl = getEl('schulte-time');
const progEl = getEl('schulte-progress');
const errEl = getEl('schulte-errors');
const trainingView = getEl('training-view');

// 1. 路由到 #/training
global.window.location.hash = '#/training';
hashListeners.forEach((fn) => fn());

check('路由 #/training 后训练视图可见', !trainingView.classList.contains('hidden'));
check('未开始时渲染 25 个占位格', grid.childNodes.length === 25, '实际 ' + grid.childNodes.length);
check('未开始时遮罩可见', !overlay.classList.contains('hidden'));
check('未开始时进度 0 / 25', progEl.textContent === '0 / 25', progEl.textContent);
check('未开始时按钮文案为「开始」', startBtn.textContent === '开始', startBtn.textContent);

// 2. 点开始
startBtn.fire('click');
const cells = grid.childNodes;
check('开始后渲染 25 个格子', cells.length === 25, '实际 ' + cells.length);
check('开始后遮罩隐藏', overlay.classList.contains('hidden'));
const nums = cells.map((c) => Number(c.textContent)).sort((a, b) => a - b);
check('数字为不重复的 1..25', JSON.stringify(nums) === JSON.stringify(Array.from({ length: 25 }, (_, i) => i + 1)));

// 3. 先点一个错的（值为 25 的格子，此时应点 1）
const wrongCell = cells.find((c) => Number(c.textContent) === 25);
wrongCell.fire('click');
check('点错时错误计数 +1', errEl.textContent === '1', errEl.textContent);
check('点错时格子带 wrong 类', wrongCell.classList.contains('wrong'));
check('点错不推进进度', progEl.textContent === '0 / 25', progEl.textContent);

// 4. 按顺序点击 1..25
for (let n = 1; n <= 25; n++) {
  const cell = cells.find((c) => Number(c.textContent) === n);
  if (!cell) { check('找到数字 ' + n + ' 的格子', false); break; }
  cell.fire('click');
}
check('依次点完后进度满 25 / 25', progEl.textContent === '25 / 25', progEl.textContent);
check('完成后遮罩重新显示', !overlay.classList.contains('hidden'));
check('完成后按钮文案为「再来一次」', startBtn.textContent === '再来一次', startBtn.textContent);
check('结果区含「用时」', overlayText.innerHTML.indexOf('用时') !== -1);
check('结果区含错误次数（1 次）', overlayText.innerHTML.indexOf('错误 1 次') !== -1, overlayText.innerHTML.slice(0, 80));
check('完成后已点格子有 done 类', cells.every((c) => c.classList.contains('done')));

// 5. 完成后继续点击不应改变状态
const before = errEl.textContent;
cells[0].fire('click');
check('完成后点击不再改变错误数', errEl.textContent === before, errEl.textContent);

// 6. 重新开始应重置
startBtn.fire('click');
check('重开后进度归零', progEl.textContent === '0 / 25', progEl.textContent);
check('重开后错误归零', errEl.textContent === '0', errEl.textContent);
check('重开后时间归零', timeEl.textContent === '0.00 秒', timeEl.textContent);

// 7. 离开再回来应重置
global.window.location.hash = '#/';
hashListeners.forEach((fn) => fn());
global.window.location.hash = '#/training';
hashListeners.forEach((fn) => fn());
check('重进训练页渲染占位格', grid.childNodes.length === 25, '实际 ' + grid.childNodes.length);
check('重进训练页遮罩可见', !overlay.classList.contains('hidden'));
check('重进训练页按钮回到「开始」', startBtn.textContent === '开始', startBtn.textContent);

// 8. 视图互斥：训练页可见时其他视图隐藏
['home-view', 'post-view', 'about-view', 'changelog-view'].forEach((id) => {
  check('训练视图显示时 ' + id + ' 隐藏', getEl(id).classList.contains('hidden'));
});

// 输出
let failed = 0;
results.forEach((r) => {
  if (!r.pass) failed++;
  console.log((r.pass ? 'PASS  ' : 'FAIL  ') + r.name + (r.extra ? '   [' + r.extra + ']' : ''));
});
console.log('\n合计 ' + results.length + ' 项，失败 ' + failed + ' 项');
process.exit(failed ? 1 : 0);
