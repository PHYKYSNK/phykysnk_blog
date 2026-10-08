(function() {
  'use strict';
  var posts = [], currentTag = null;
  var homeView = document.getElementById('home-view');
  var postView = document.getElementById('post-view');
  var aboutView = document.getElementById('about-view');
  var changelogView = document.getElementById('changelog-view');
  var trainingView = document.getElementById('training-view');
  var postList = document.getElementById('post-list');
  var postContent = document.getElementById('post-content');
  var aboutContent = document.getElementById('about-content');
  var changelogList = document.getElementById('changelog-list');
  var tagFilter = document.getElementById('tag-filter');
  var searchInput = document.getElementById('search-input');
  var themeToggle = document.getElementById('theme-toggle');
  var tocSidebar = document.getElementById('post-toc');
  var tocToggle = document.getElementById('toc-toggle');
  var tocNav = document.getElementById('toc-nav');
  var progressBar = document.getElementById('reading-progress');
  var backToTop = document.getElementById('back-to-top');

  function initTheme() {
    var t = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
    setHLJSTheme(t);
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setHLJSTheme(next);
  }

  function setHLJSTheme(t) {
    var link = document.getElementById('hljs-theme-link');
    if (link) {
      link.href = t === 'dark'
        ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
  }

  function updateScrollUI() {
    if (!progressBar) return;
    if (postView.classList.contains('hidden')) {
      progressBar.style.width = '0%';
    } else {
      var st = window.scrollY || document.documentElement.scrollTop;
      var sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = Math.min(st / sh * 100, 100) + '%';
    }
    if (backToTop) {
      if ((window.scrollY || document.documentElement.scrollTop) > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }

  function esc(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

  // marked 会把属性值里的引号转成 &quot;，此处还原为可读文本
  function unescapeHTML(s) {
    if (!s) return '';
    var d = document.createElement('textarea');
    d.innerHTML = s;
    return d.value;
  }

  function initMarked() {
    if (typeof marked !== 'undefined' && typeof hljs !== 'undefined') {
      marked.setOptions({
        langPrefix: 'hljs language-',
        highlight: function(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try { return hljs.highlight(code, { language: lang }).value; } catch(e) { return code; }
          }
          return code;
        }
      });
    }
  }

  function highlightCodeBlocks() {
    postContent.querySelectorAll('pre code').forEach(function(block) {
      hljs.highlightElement(block);
    });
  }

  function addCopyButtons() {
    postContent.querySelectorAll('pre').forEach(function(pre) {
      if (pre.closest('.code-block-wrap')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrap';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      var toolbar = document.createElement('div');
      toolbar.className = 'code-block-toolbar';
      var code = pre.querySelector('code');
      if (code) {
        var langMatch = code.className.match(/language-(\w+)/);
        if (langMatch) {
          var label = document.createElement('span');
          label.className = 'code-lang-label';
          label.textContent = langMatch[1];
          toolbar.appendChild(label);
        }
      }
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = '复制';
      btn.addEventListener('click', function() {
        var text = pre.textContent;
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          setTimeout(function() { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
        }).catch(function() {
          btn.textContent = '复制失败';
        });
      });
      toolbar.appendChild(btn);
      wrapper.appendChild(toolbar);
    });
  }

  // === 下载按钮增强 ===
  // Markdown 语法：[按钮文字](assets/files/xxx.zip){download size="11.99 MB" note="Windows 免安装"}
  // marked 会把 {...} 原样保留为文本，且把内部的双引号转义成 &quot;，这里一并兼容。
  var DL_ATTR_RE = /\{download(\s+[^}]*)?\}/;
  var DL_SIZE_RE = /size\s*=\s*(?:"|&quot;)(.*?)(?:"|&quot;)/;
  var DL_NOTE_RE = /note\s*=\s*(?:"|&quot;)(.*?)(?:"|&quot;)/;

  function enhanceDownloadLinks() {
    // 1) 处理标准 Markdown 链接 + 紧跟的 {download ...} 花括号
    postContent.querySelectorAll('a').forEach(function(a) {
      var next = a.nextSibling;
      if (!next || next.nodeType !== 3) return; // 必须是紧邻的文本节点
      var m = next.nodeValue.match(DL_ATTR_RE);
      if (!m) return;

      var attrs = m[1] || '';
      var sizeM = attrs.match(DL_SIZE_RE);
      var noteM = attrs.match(DL_NOTE_RE);

      // 去掉花括号，只留干净链接
      next.nodeValue = next.nodeValue.replace(DL_ATTR_RE, '');

      buildDownloadButton(a, sizeM ? unescapeHTML(sizeM[1]) : '', noteM ? unescapeHTML(noteM[1]) : '');
    });

    // 2) 兜底：指向文件类后缀的普通链接，若未加属性也自动转成下载按钮
    var FILE_EXT_RE = /\.(zip|rar|7z|tar|gz|exe|msi|apk|dmg|pdf|docx?|xlsx?|pptx?)(\?.*)?$/i;
    postContent.querySelectorAll('a').forEach(function(a) {
      if (a.classList.contains('download-btn')) return; // 已处理
      var href = a.getAttribute('href') || '';
      if (!FILE_EXT_RE.test(href)) return;
      // 站外链不自动降级为按钮，避免误伤参考链接
      if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) return;
      buildDownloadButton(a, '', '');
    });
  }

  function buildDownloadButton(a, size, note) {
    var href = a.getAttribute('href');
    var label = (a.textContent || '下载').trim();

    var btn = document.createElement('a');
    btn.className = 'download-btn';
    btn.href = href;
    btn.setAttribute('download', ''); // 强制下载，而不是浏览器内预览
    btn.setAttribute('rel', 'noopener');

    var icon = document.createElement('span');
    icon.className = 'download-btn-icon';
    icon.setAttribute('aria-hidden', 'true');
    btn.appendChild(icon);

    var body = document.createElement('span');
    body.className = 'download-btn-body';

    var title = document.createElement('span');
    title.className = 'download-btn-title';
    title.textContent = label;
    body.appendChild(title);

    var metaParts = [];
    if (size) metaParts.push(size);
    if (note) metaParts.push(note);
    if (metaParts.length) {
      var meta = document.createElement('span');
      meta.className = 'download-btn-meta';
      meta.textContent = metaParts.join(' · ');
      body.appendChild(meta);
    }

    btn.appendChild(body);
    a.parentNode.replaceChild(btn, a);
  }

  function generateTOC(currentSlug) {
    if (!tocNav) return;
    tocNav.innerHTML = '';
    var headings = postContent.querySelectorAll('.post-content h2, .post-content h3');
    if (headings.length < 2) { tocSidebar.classList.add('hidden'); return; }
    tocSidebar.classList.remove('hidden');

    // Assign IDs to headings
    headings.forEach(function(h, i) {
      if (!h.id) h.id = 'toc-h-' + i;
    });

    // Build TOC nav links
    headings.forEach(function(h, i) {
      var link = document.createElement('a');
      link.className = 'toc-link';
      if (h.tagName === 'H3') link.style.paddingLeft = '20px';
      link.textContent = h.textContent;
      link.href = '#';
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById(h.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', window.location.pathname + window.location.search + '#/post/' + currentSlug);
        }
      });
      tocNav.appendChild(link);
    });

    // IntersectionObserver scroll spy
    if ('IntersectionObserver' in window) {
      var tocLinks = tocNav.querySelectorAll('.toc-link');
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function(l) { l.classList.remove('toc-active'); });
            var idx = Array.prototype.indexOf.call(headings, entry.target);
            if (idx >= 0 && tocLinks[idx]) tocLinks[idx].classList.add('toc-active');
          }
        });
      }, { rootMargin: '-60px 0px -80% 0px' });
      headings.forEach(function(h) { observer.observe(h); });
    }

    // Toggle expand/collapse
    var tocOverlay = document.getElementById('toc-overlay');
    function closeTOC() {
      tocSidebar.classList.remove('expanded');
      tocSidebar.classList.add('collapsed');
      tocToggle.textContent = '📖';
    }
    tocToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (tocSidebar.classList.contains('expanded')) {
        closeTOC();
      } else {
        tocSidebar.classList.remove('collapsed');
        tocSidebar.classList.add('expanded');
        tocToggle.textContent = '×';
      }
    });
    if (tocOverlay) {
      tocOverlay.addEventListener('click', closeTOC);
    }
  }

  function renderPostNav(currentSlug) {
    var idx = posts.findIndex(function(p) { return p.slug === currentSlug; });
    if (idx === -1) return;
    var prev = idx > 0 ? posts[idx - 1] : null;
    var next = idx < posts.length - 1 ? posts[idx + 1] : null;
    if (!prev && !next) return;
    var h = '<div class="post-nav">';
    if (prev) {
      h += '<a href="#/post/' + encodeURIComponent(prev.slug) + '" class="post-nav-link prev">';
      h += '<span class="post-nav-label">&larr; 上一篇</span>';
      h += '<span class="post-nav-title">' + esc(prev.title) + '</span></a>';
    } else {
      h += '<div class="post-nav-empty"></div>';
    }
    if (next) {
      h += '<a href="#/post/' + encodeURIComponent(next.slug) + '" class="post-nav-link next">';
      h += '<span class="post-nav-label">下一篇 &rarr;</span>';
      h += '<span class="post-nav-title">' + esc(next.title) + '</span></a>';
    } else {
      h += '<div class="post-nav-empty"></div>';
    }
    h += '</div>';
    postContent.insertAdjacentHTML('beforeend', h);
  }

  function animateCards() {
    var cards = document.querySelectorAll('.post-card');
    if (!cards.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    cards.forEach(function(card, i) { card.style.transitionDelay = (i * 0.08) + 's'; observer.observe(card); });
  }

  function renderPosts() {
    var list = posts.slice();
    if (currentTag) list = list.filter(function(p) { return p.tags.indexOf(currentTag) !== -1; });
    var q = searchInput.value.trim().toLowerCase();
    if (q) {
      list = list.filter(function(p) {
        return p.title.toLowerCase().indexOf(q) !== -1 || p.excerpt.toLowerCase().indexOf(q) !== -1 || p.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
      });
    }
    if (!list.length) { postList.innerHTML = '<p class="empty-state">没有找到文章</p>'; return; }
    var h = '';
    list.forEach(function(p) {
      h += '<article class="post-card" onclick="window.location.hash=\'/post/' + encodeURIComponent(p.slug) + '\'">';
      h += '<h2 class="post-card-title"><a href="#/post/' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a></h2>';
      h += '<div class="post-card-meta">' + p.date + ' · ';
      h += p.tags.map(function(t) { return '<span class="post-card-tag" data-tag="' + esc(t) + '">' + esc(t) + '</span>'; }).join(', ');
      h += '</div><p class="post-card-excerpt">' + esc(p.excerpt) + '</p></article>';
    });
    postList.innerHTML = h;
    document.querySelectorAll('.post-card-tag').forEach(function(el) {
      el.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); currentTag = el.getAttribute('data-tag'); renderTags(); renderPosts(); });
    });
    animateCards();
  }

  function renderTags() {
    var tags = [];
    posts.forEach(function(p) { p.tags.forEach(function(t) { if (tags.indexOf(t) === -1) tags.push(t); }); });
    tags.sort();
    var h = '<button class="tag-btn' + (currentTag ? '' : ' active') + '" data-tag="">全部</button>';
    tags.forEach(function(t) { h += '<button class="tag-btn' + (currentTag === t ? ' active' : '') + '" data-tag="' + t + '">' + t + '</button>'; });
    tagFilter.innerHTML = h;
    tagFilter.querySelectorAll('.tag-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { currentTag = btn.getAttribute('data-tag') || null; renderTags(); renderPosts(); });
    });
  }

  // === 视图切换（统一入口：新增视图只需在 views 里登记一项） ===
  var views = {
    home: homeView,
    post: postView,
    about: aboutView,
    changelog: changelogView,
    training: trainingView
  };

  function showView(name) {
    Object.keys(views).forEach(function(key) {
      var el = views[key];
      if (el) el.classList.toggle('hidden', key !== name);
    });
    window.scrollTo(0, 0);
  }

  function showHome() { showView('home'); }

  function showAbout() {
    showView('about');
    fetch('posts/about.md').then(function(r) { return r.text(); }).then(function(md) { aboutContent.innerHTML = marked.parse(md); }).catch(function() { aboutContent.innerHTML = '<p class="empty-state">加载失败</p>'; });
  }

  function showPost(slug) {
    showView('post');
    postContent.innerHTML = '<p class="loading">加载中...</p>';
    var post = posts.find(function(p) { return p.slug === slug; });
    if (!post) { postContent.innerHTML = '<p class="empty-state">文章未找到</p>'; return; }
    fetch('posts/' + slug + '.md').then(function(r) { return r.text(); }).then(function(md) {
      // Reset TOC to collapsed
      tocSidebar.classList.add('collapsed');
      tocSidebar.classList.remove('expanded');
      if (tocToggle) tocToggle.textContent = '📖';
      var metaHTML = '<span class="meta-date">' + post.date + '</span>';
      if (post.updatedAt && post.updatedAt !== post.date) {
        metaHTML += ' · <span class="meta-updated">更新于 ' + post.updatedAt + '</span>';
      }
      metaHTML += (post.tags.length ? ' · ' + post.tags.map(function(t) { return '<span class="post-card-tag" data-tag="' + esc(t) + '">' + esc(t) + '</span>'; }).join(', ') : '');
      postContent.innerHTML = '<h1>' + esc(post.title) + '</h1><div class="post-meta-bar">' + metaHTML + '</div>' + marked.parse(md);
      enhanceDownloadLinks();
      highlightCodeBlocks();
      addCopyButtons();
      generateTOC(slug);
      renderPostNav(slug);
      updateScrollUI();
    }).catch(function() { postContent.innerHTML = '<p class="empty-state">文章加载失败</p>'; });
  }

  function showChangelog() {
    showView('changelog');
    changelogList.innerHTML = '<p class="loading">加载中...</p>';
    fetch('posts/changelog.json').then(function(r) { return r.json(); }).then(function(data) { renderChangelog(data); }).catch(function() { changelogList.innerHTML = '<p class="empty-state">加载失败</p>'; });
  }

  function renderChangelog(data) {
    if (!data || !data.length) { changelogList.innerHTML = '<p class="empty-state">暂无记录</p>'; return; }
    var badgeMap = { '初始化': 'init', '新增': 'add', '修复': 'fix', '批量导入': 'batch', '更新': 'add', '优化': 'update', '删除': 'delete' };
    var h = '', lastMonth = '';
    data.slice().reverse().forEach(function(e) {
      var month = e.date.slice(0, 7);
      if (month !== lastMonth) { if (lastMonth) h += '</div>'; h += '<div class="changelog-month">' + month + '</div>'; lastMonth = month; }
      var badge = badgeMap[e.type] || 'add';
      h += '<div class="changelog-item">';
      h += '<div class="changelog-item-date">' + e.date + '</div>';
      h += '<div class="changelog-item-body">';
      h += '<span class="changelog-item-badge --' + badge + '">' + esc(e.type) + '</span>';
      h += '<span class="changelog-item-text">' + esc(e.description) + '</span>';
      if (e.slug) h += ' <a href="#/post/' + encodeURIComponent(e.slug) + '" class="changelog-item-link">查看 →</a>';
      h += '</div></div>';
    });
    if (lastMonth) h += '</div>';
    changelogList.innerHTML = h;
  }

  // === 舒尔特方格训练 ===
  // 玩法：N×N 方格随机填入 1~N²，按顺序依次点击，记录用时与错误数。
  // 边长可选 3 / 5 / 7（3×3 入门、5×5 经典、7×7 进阶）。
  var SCHULTE_SIZES = [3, 5, 7];
  var schulteSize = 5;                                // 当前边长，默认 5（经典）
  function schulteTotal() { return schulteSize * schulteSize; }

  var schulteGrid = document.getElementById('schulte-grid');
  var schulteOverlay = document.getElementById('schulte-overlay');
  var schulteOverlayText = document.getElementById('schulte-overlay-text');
  var schulteStartBtn = document.getElementById('schulte-start');
  var schulteTimeEl = document.getElementById('schulte-time');
  var schulteProgressEl = document.getElementById('schulte-progress');
  var schulteErrorsEl = document.getElementById('schulte-errors');
  var schulteSubtitleEl = document.getElementById('schulte-subtitle');

  var schulte = { next: 1, errors: 0, startAt: 0, timerId: null, running: false, elapsed: 0 };

  // 无偏洗牌（Fisher-Yates）；不要用 sort(() => Math.random()-0.5)，分布不均
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function fmtSeconds(ms) { return (ms / 1000).toFixed(2) + ' 秒'; }

  function updateSchulteStats() {
    if (schulteTimeEl) schulteTimeEl.textContent = fmtSeconds(schulte.elapsed);
    if (schulteProgressEl) schulteProgressEl.textContent = (schulte.next - 1) + ' / ' + schulteTotal();
    if (schulteErrorsEl) schulteErrorsEl.textContent = String(schulte.errors);
  }

  // 同步「尺寸」相关的界面：按钮高亮、方格列数、格内字号、副标题
  function updateSchulteSizeUI() {
    SCHULTE_SIZES.forEach(function(s) {
      var btn = document.getElementById('schulte-size-' + s);
      if (btn) btn.classList.toggle('is-active', s === schulteSize);
    });
    if (schulteGrid) {
      schulteGrid.style.gridTemplateColumns = 'repeat(' + schulteSize + ', 1fr)';
      schulteGrid.style.gridTemplateRows = 'repeat(' + schulteSize + ', 1fr)';
      schulteGrid.setAttribute('data-size', String(schulteSize));
    }
    if (schulteSubtitleEl) {
      schulteSubtitleEl.textContent = '按 1 → ' + schulteTotal() + ' 的顺序依次点击，训练注意力集中度';
    }
  }

  // 切换难度：直接清掉当前进度，回到待开始状态
  function setSchulteSize(size) {
    if (SCHULTE_SIZES.indexOf(size) === -1) return;
    if (size === schulteSize) return;
    schulteSize = size;
    resetSchulte();
  }

  function renderSchulteGrid() {
    var nums = [];
    for (var i = 1; i <= schulteTotal(); i++) nums.push(i);
    shuffle(nums);
    schulteGrid.innerHTML = '';
    nums.forEach(function(n) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'schulte-cell';
      cell.textContent = n;
      cell.setAttribute('aria-label', '数字 ' + n);
      cell.addEventListener('click', function() { onSchulteClick(cell, n); });
      schulteGrid.appendChild(cell);
    });
  }

  // 未开始时渲染占位格：保证方格区有高度，遮罩层不会塌陷
  function renderPlaceholderGrid() {
    if (!schulteGrid) return;
    schulteGrid.innerHTML = '';
    for (var i = 0; i < schulteTotal(); i++) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'schulte-cell placeholder';
      cell.disabled = true;
      cell.setAttribute('aria-hidden', 'true');
      schulteGrid.appendChild(cell);
    }
  }

  function onSchulteClick(cell, num) {
    if (!schulte.running || cell.classList.contains('done')) return;

    if (num === schulte.next) {
      cell.classList.add('done');
      schulte.next++;
      updateSchulteStats();
      if (schulte.next > schulteTotal()) finishSchulte();
    } else {
      schulte.errors++;
      updateSchulteStats();
      cell.classList.add('wrong');
      setTimeout(function() { cell.classList.remove('wrong'); }, 300);
    }
  }

  function tickSchulte() {
    if (!schulte.running) return;
    schulte.elapsed = performance.now() - schulte.startAt;
    updateSchulteStats();
  }

  function startSchulte() {
    if (schulte.timerId) { clearInterval(schulte.timerId); schulte.timerId = null; }
    schulte.next = 1;
    schulte.errors = 0;
    schulte.elapsed = 0;
    schulte.running = true;
    renderSchulteGrid();
    updateSchulteStats();
    if (schulteOverlay) schulteOverlay.classList.add('hidden');
    schulte.startAt = performance.now();
    schulte.timerId = setInterval(tickSchulte, 50);
  }

  function finishSchulte() {
    schulte.running = false;
    if (schulte.timerId) { clearInterval(schulte.timerId); schulte.timerId = null; }
    schulte.elapsed = performance.now() - schulte.startAt;
    updateSchulteStats();
    if (!schulteOverlay) return;
    schulteOverlay.classList.remove('hidden');
    var errLine = schulte.errors === 0
      ? '<span class="schulte-result-note">零失误</span>'
      : '<span class="schulte-result-note">错误 ' + schulte.errors + ' 次</span>';
    schulteOverlayText.innerHTML =
      '<span class="schulte-result-label">用时</span>' +
      '<span class="schulte-result-time">' + fmtSeconds(schulte.elapsed) + '</span>' +
      errLine;
    if (schulteStartBtn) schulteStartBtn.textContent = '再来一次';
  }

  // 每次进入训练页都重置，避免上一次的计时器残留
  function resetSchulte() {
    if (schulte.timerId) { clearInterval(schulte.timerId); schulte.timerId = null; }
    schulte.running = false;
    schulte.next = 1;
    schulte.errors = 0;
    schulte.elapsed = 0;
    updateSchulteSizeUI();
    updateSchulteStats();
    renderPlaceholderGrid();
    if (schulteOverlayText) schulteOverlayText.textContent = '准备好后点击开始';
    if (schulteStartBtn) schulteStartBtn.textContent = '开始';
    if (schulteOverlay) schulteOverlay.classList.remove('hidden');
  }

  function showTraining() {
    showView('training');
    resetSchulte();
  }

  function handleRoute() {
    var hash = window.location.hash.slice(1) || '/';
    if (hash.startsWith('/post/')) showPost(decodeURIComponent(hash.replace('/post/', '')));
    else if (hash === '/about') showAbout();
    else if (hash === '/changelog') showChangelog();
    else if (hash === '/training') showTraining();
    else showHome();
  }

  function init() {
    initTheme();
    initMarked();
    themeToggle.addEventListener('click', toggleTheme);
    fetch('posts/index.json').then(function(r) { return r.json(); }).then(function(data) { posts = data; renderTags(); renderPosts(); }).catch(function() { postList.innerHTML = '<p class="empty-state">文章列表加载失败</p>'; });
    searchInput.addEventListener('input', renderPosts);
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('scroll', updateScrollUI, { passive: true });
    if (backToTop) {
      backToTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    if (schulteStartBtn) schulteStartBtn.addEventListener('click', startSchulte);
    SCHULTE_SIZES.forEach(function(s) {
      var btn = document.getElementById('schulte-size-' + s);
      if (btn) btn.addEventListener('click', function() { setSchulteSize(s); });
    });
    handleRoute();
  }

  document.addEventListener('DOMContentLoaded', init);
})();