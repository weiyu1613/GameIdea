/* ===== 锈蚀深渊·连环画 运行时 (优化版) ===== */
(function() {
  'use strict';

  // ===== 进度条 =====
  var progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.width = '0%';
  document.body.appendChild(progressBar);

  var ticking = false;
  function updateProgress() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = Math.min(progress, 100) + '%';
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ===== 懒加载配置 =====
  var lazyObserverOptions = {
    rootMargin: '200px 0px',  // 提前200px预加载
    threshold: 0.01
  };

  // ===== 面板滚动入场 =====
  var panelObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 加载面板内懒加载图片
        var imgs = entry.target.querySelectorAll('img[data-src]');
        imgs.forEach(function(img) {
          loadImage(img);
        });
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.05
  });

  document.querySelectorAll('.panel').forEach(function(panel) {
    panelObserver.observe(panel);
  });

  // ===== 图片加载函数 =====
  function loadImage(img) {
    if (!img.dataset.src) return;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    // 加载完成后淡入
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';
    img.addEventListener('load', function() {
      img.style.opacity = '1';
    });
    // 如果图片已缓存，load事件可能不触发
    if (img.complete) {
      img.style.opacity = '1';
    }
  }

  // ===== 章节导航高亮 =====
  var chapters = document.querySelectorAll('.chapter-anchor');
  var navLinks = document.querySelectorAll('.chapter-nav a');

  if (chapters.length > 0 && navLinks.length > 0) {
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
  }

  // ===== 全局懒加载（非panel内的图片，如封面背景） =====
  var lazyImages = document.querySelectorAll('img[data-src]:not(.panel img[data-src])');
  if (lazyImages.length > 0) {
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, lazyObserverOptions);

    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ===== 原生懒加载降级 =====
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      img.setAttribute('loading', 'lazy');
    });
  }

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

  // ===== 移动端顶部快捷导航 =====
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    var navToggle = document.createElement('div');
    navToggle.style.cssText = 'position:fixed;bottom:1rem;right:1rem;width:44px;height:44px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;cursor:pointer;z-index:1001;box-shadow:0 4px 12px rgba(0,0,0,0.5);user-select:none;';
    navToggle.innerHTML = '☰';
    navToggle.title = '章节导航';

    var navPanel = document.createElement('div');
    navPanel.style.cssText = 'position:fixed;bottom:4rem;right:1rem;background:var(--bg-panel);border-radius:8px;padding:0.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.6);z-index:1001;display:none;max-height:60vh;overflow-y:auto;';
    
    var chapterTitles = [
      ['#cover', '封面'], ['#ch1', '灾变前史'], ['#ch2', '缝合日'],
      ['#ch3', '轮回纪元'], ['#ch4', '第一幕'], ['#ch5', '第二幕'],
      ['#ch6', '第三幕'], ['#ch7', '第四幕'], ['#ch8', '五结局'], ['#ch9', '尾声']
    ];
    
    chapterTitles.forEach(function(item) {
      var link = document.createElement('a');
      link.href = item[0];
      link.textContent = item[1];
      link.style.cssText = 'display:block;padding:0.6rem 1rem;color:var(--text-2);text-decoration:none;font-size:0.9rem;border-radius:4px;transition:background 0.2s;';
      link.addEventListener('mouseenter', function() { this.style.background = 'var(--bg-card)'; });
      link.addEventListener('mouseleave', function() { this.style.background = 'transparent'; });
      link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        navPanel.style.display = 'none';
      });
      navPanel.appendChild(link);
    });

    navToggle.addEventListener('click', function() {
      navPanel.style.display = navPanel.style.display === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(navToggle);
    document.body.appendChild(navPanel);
  }
})();
