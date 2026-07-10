/* ===== 锈蚀深渊·连环画 运行时 ===== */
(function() {
  'use strict';

  // ===== 进度条 =====
  var progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.width = '0%';
  document.body.appendChild(progressBar);

  function updateProgress() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = Math.min(progress, 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ===== Intersection Observer 滚动入场 =====
  var observerOptions = {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  var panelObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 加载懒加载图片
        var imgs = entry.target.querySelectorAll('img[data-src]');
        imgs.forEach(function(img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll('.panel').forEach(function(panel) {
    panelObserver.observe(panel);
  });

  // ===== 章节导航高亮 =====
  var chapters = document.querySelectorAll('.chapter-anchor');
  var navLinks = document.querySelectorAll('.chapter-nav a');

  var chapterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        navLinks.forEach(function(link) {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  chapters.forEach(function(chapter) {
    chapterObserver.observe(chapter);
  });

  // ===== 全局懒加载（非panel内的图片） =====
  var lazyImages = document.querySelectorAll('img[data-src]:not(.panel img[data-src])');
  var imageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  }, observerOptions);

  lazyImages.forEach(function(img) {
    imageObserver.observe(img);
  });

  // ===== 平滑滚动 =====
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
