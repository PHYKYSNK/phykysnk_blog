(function() {
  'use strict';
  var posts = [], currentTag = null;
  var homeView = document.getElementById('home-view');
  var postView = document.getElementById('post-view');
  var aboutView = document.getElementById('about-view');
  var postList = document.getElementById('post-list');
  var postContent = document.getElementById('post-content');
  var aboutContent = document.getElementById('about-content');
  var tagFilter = document.getElementById('tag-filter');
  var searchInput = document.getElementById('search-input');
  var themeToggle = document.getElementById('theme-toggle');

  function initTheme() {
    var t = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  function esc(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

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

  function showHome() { homeView.classList.remove('hidden'); postView.classList.add('hidden'); aboutView.classList.add('hidden'); window.scrollTo(0, 0); }
  function showAbout() {
    homeView.classList.add('hidden'); postView.classList.add('hidden'); aboutView.classList.remove('hidden'); window.scrollTo(0, 0);
    fetch('posts/about.md').then(function(r) { return r.text(); }).then(function(md) { aboutContent.innerHTML = marked.parse(md); }).catch(function() { aboutContent.innerHTML = '<p class="empty-state">加载失败</p>'; });
  }

  function showPost(slug) {
    homeView.classList.add('hidden'); aboutView.classList.add('hidden'); postView.classList.remove('hidden');
    postContent.innerHTML = '<p class="loading">加载中...</p>'; window.scrollTo(0, 0);
    var post = posts.find(function(p) { return p.slug === slug; });
    if (!post) { postContent.innerHTML = '<p class="empty-state">文章未找到</p>'; return; }
    fetch('posts/' + slug + '.md').then(function(r) { return r.text(); }).then(function(md) {
      postContent.innerHTML = '<h1>' + esc(post.title) + '</h1><div class="post-meta-bar">' + post.date + (post.tags.length ? ' · ' + post.tags.map(function(t) { return '<span class="post-card-tag" data-tag="' + esc(t) + '">' + esc(t) + '</span>'; }).join(', ') : '') + '</div>' + marked.parse(md);
    }).catch(function() { postContent.innerHTML = '<p class="empty-state">文章加载失败</p>'; });
  }

  function handleRoute() {
    var hash = window.location.hash.slice(1) || '/';
    if (hash.startsWith('/post/')) showPost(hash.replace('/post/', ''));
    else if (hash === '/about') showAbout();
    else showHome();
  }

  function init() {
    initTheme();
    themeToggle.addEventListener('click', toggleTheme);
    fetch('posts/index.json').then(function(r) { return r.json(); }).then(function(data) { posts = data; renderTags(); renderPosts(); }).catch(function() { postList.innerHTML = '<p class="empty-state">文章列表加载失败</p>'; });
    searchInput.addEventListener('input', renderPosts);
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  document.addEventListener('DOMContentLoaded', init);
})();