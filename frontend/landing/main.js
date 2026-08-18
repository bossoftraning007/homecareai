(function () {
  'use strict';

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function countUp(element, target, decimals, duration, startOffset) {
    const startTime = Date.now() + startOffset;

    function step() {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(step);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = target * eased;
      element.textContent = value.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const statValues = entry.target.querySelectorAll('.stat-value');
          statValues.forEach(function (el, i) {
            var target = parseFloat(el.dataset.target);
            var decimals = parseInt(el.dataset.decimals) || 0;
            var duration = 1500 + i * 80;
            var startOffset = 480 + i * 90;
            countUp(el, target, decimals, duration, startOffset);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      var stats = document.querySelector('.stats');
      if (stats) statsObserver.observe(stats);
    });
  } else {
    var stats = document.querySelector('.stats');
    if (stats) statsObserver.observe(stats);
  }

  var burger = document.querySelector('.burger');
  var overlay = document.querySelector('.mobile-overlay');

  var video = document.querySelector('.bg-video');
  if (video) {
    var onVideoReady = function () {
      document.body.classList.add('bg-video-loaded');
      video.removeEventListener('playing', onVideoReady);
      video.removeEventListener('canplay', onVideoReady);
    };
    video.addEventListener('playing', onVideoReady);
    video.addEventListener('canplay', onVideoReady);
  }

  if (burger && overlay) {
    function closeMenu() {
      burger.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('hidden', '');
      document.body.classList.remove('menu-open');
    }

    function openMenu() {
      burger.setAttribute('aria-expanded', 'true');
      overlay.removeAttribute('hidden');
      document.body.classList.add('menu-open');
    }

    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    var menuLinks = overlay.querySelectorAll('.mobile-link, .mobile-sign-in');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  }
})();
