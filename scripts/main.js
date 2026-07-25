(function() {
  'use strict';
  var posts = [], currentTag = null;
  var homeView = document.getElementById('home-view');
  var postView = document.getElementById('post-view');
  var aboutView = document.getElementById('about-view');
  var changelogView = document.getElementById('changelog-view');
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
      h += '<a href="#/post/' + prev.slug + '" class="post-nav-link prev">';
      h += '<span class="post-nav-label">&larr; 上一篇</span>';
      h += '<span class="post-nav-title">' + esc(prev.title) + '</span></a>';
    } else {
      h += '<div class="post-nav-empty"></div>';
    }
    if (next) {
      h += '<a href="#/post/' + next.slug + '" class="post-nav-link next">';
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
      h += '<article class="post-card" onclick="window.location.hash=\'/post/' + p.slug + '\'">';
      h += '<h2 class="post-card-title"><a href="#/post/' + p.slug + '">' + esc(p.title) + '</a></h2>';
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

  function showHome() { homeView.classList.remove('hidden'); postView.classList.add('hidden'); aboutView.classList.add('hidden'); changelogView.classList.add('hidden'); window.scrollTo(0, 0); }
  function showAbout() {
    homeView.classList.add('hidden'); postView.classList.add('hidden'); aboutView.classList.remove('hidden'); changelogView.classList.add('hidden'); window.scrollTo(0, 0);
    fetch('posts/about.md').then(function(r) { return r.text(); }).then(function(md) { aboutContent.innerHTML = marked.parse(md); }).catch(function() { aboutContent.innerHTML = '<p class="empty-state">加载失败</p>'; });
  }

  function showPost(slug) {
    homeView.classList.add('hidden'); aboutView.classList.add('hidden'); changelogView.classList.add('hidden'); postView.classList.remove('hidden');
    postContent.innerHTML = '<p class="loading">加载中...</p>'; window.scrollTo(0, 0);
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
      highlightCodeBlocks();
      addCopyButtons();
      generateTOC(slug);
      renderPostNav(slug);
      updateScrollUI();
    }).catch(function() { postContent.innerHTML = '<p class="empty-state">文章加载失败</p>'; });
  }

  function showChangelog() {
    homeView.classList.add('hidden'); postView.classList.add('hidden'); aboutView.classList.add('hidden'); changelogView.classList.remove('hidden'); window.scrollTo(0, 0);
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
      if (e.slug) h += ' <a href="#/post/' + esc(e.slug) + '" class="changelog-item-link">查看 →</a>';
      h += '</div></div>';
    });
    if (lastMonth) h += '</div>';
    changelogList.innerHTML = h;
  }

  function handleRoute() {
    var hash = window.location.hash.slice(1) || '/';
    if (hash.startsWith('/post/')) showPost(hash.replace('/post/', ''));
    else if (hash === '/about') showAbout();
    else if (hash === '/changelog') showChangelog();
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
    handleRoute();
  }

  document.addEventListener('DOMContentLoaded', init);
})();