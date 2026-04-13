'use strict';

(function () {
  /* Hero entrance animation */
  var heroTitle = document.getElementById('hero-heading');
  var heroSubtext = document.querySelector('.hero__subtext');
  var heroActions = document.querySelector('.hero__actions');
  var heroMedia = document.querySelector('.hero__media');

  if (heroTitle) {
    setTimeout(function () {
      heroTitle.classList.add('hero__title--visible');
    }, 0);
  }
  if (heroSubtext) {
    setTimeout(function () {
      heroSubtext.classList.add('hero__subtext--visible');
    }, 100);
  }
  if (heroActions) {
    setTimeout(function () {
      heroActions.classList.add('hero__actions--visible');
    }, 200);
  }
  if (heroMedia) {
    setTimeout(function () {
      heroMedia.classList.add('hero__media--visible');
    }, 150);
  }

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        /* View Work button scale pulse */
        var el = this;
        if (el.classList.contains('hero__btn--primary')) {
          el.classList.add('hero__btn--pulse');
          setTimeout(function () {
            el.classList.remove('hero__btn--pulse');
          }, 100);
        }
      }
    });
  });

  /* Mobile nav overlay */
  var navToggle = document.querySelector('.site-nav__toggle');
  var navOverlay = document.querySelector('.site-nav__overlay');

  function setNavOpen(isOpen) {
    if (!navToggle || !navOverlay) return;
    navToggle.classList.toggle('site-nav__toggle--open', isOpen);
    navOverlay.classList.toggle('site-nav__overlay--open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navOverlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  if (navToggle && navOverlay) {
    navToggle.addEventListener('click', function () {
      var isOpen = navOverlay.classList.contains('site-nav__overlay--open');
      setNavOpen(!isOpen);
    });

    navOverlay.addEventListener('click', function (event) {
      var target = event.target;
      var clickedLink = target.closest('[data-nav-link]');
      var clickedOutside = !target.closest('.site-nav__overlay-menu');
      if (clickedLink || clickedOutside) {
        setNavOpen(false);
      }
    });

    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setNavOpen(false);
      }
    });

    if (window.matchMedia) {
      window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
        if (e.matches) setNavOpen(false);
      });
    }
  }

  /* Case study scroll reveal – trigger slightly early for smoother transition */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px 60px 0px' }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* Page scroll progress bar (about page) */
  var progressBar = document.querySelector('.page-progress__bar');
  if (progressBar) {
    var lastProgress = -1;
    var ticking = false;

    function updateProgress() {
      ticking = false;
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop || 0;
      var docHeight = doc.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      if (Math.abs(progress - lastProgress) > 0.001) {
        progressBar.style.transform = 'scaleX(' + progress + ')';
        lastProgress = progress;
      }
    }

    function onScrollOrResize() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScrollOrResize);
    window.addEventListener('resize', onScrollOrResize);
    updateProgress();
  }

  /* Copy Email */
  var copyBtn = document.getElementById('copy-email');
  var email = 'yudian_dong15@yahoo.co.nz';

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () {
            copyBtn.textContent = 'Copy Email';
          }, 2000);
        }).catch(function () {
          copyBtn.textContent = 'Copy Email';
        });
      } else {
        copyBtn.textContent = 'Copy Email';
      }
    });
  }

  /* Chat widget (homepage only) */
  var chatWidget = document.getElementById('chat-widget');
  var chatTrigger = document.getElementById('chat-trigger');
  var chatPopup = document.getElementById('chat-popup');
  var chatClose = document.getElementById('chat-close');
  var chatOverlay = document.getElementById('chat-overlay');

  if (chatWidget && chatTrigger && chatPopup && chatClose) {
    function openChat() {
      chatPopup.classList.add('is-open');
      if (chatOverlay) chatOverlay.classList.add('is-open');
      chatTrigger.setAttribute('aria-expanded', 'true');
      chatPopup.setAttribute('aria-hidden', 'false');
      if (chatOverlay) chatOverlay.setAttribute('aria-hidden', 'false');
    }

    function closeChat() {
      chatPopup.classList.remove('is-open');
      if (chatOverlay) chatOverlay.classList.remove('is-open');
      chatTrigger.setAttribute('aria-expanded', 'false');
      chatPopup.setAttribute('aria-hidden', 'true');
      if (chatOverlay) chatOverlay.setAttribute('aria-hidden', 'true');
    }

    chatTrigger.addEventListener('click', function () {
      if (chatPopup.classList.contains('is-open')) {
        closeChat();
      } else {
        openChat();
      }
    });

    chatClose.addEventListener('click', closeChat);

    if (chatOverlay) {
      chatOverlay.addEventListener('click', closeChat);
    }

    document.addEventListener('click', function (e) {
      if (!chatPopup.classList.contains('is-open')) return;
      if (e.target.closest('.chat-popup') || e.target.closest('.chat-trigger')) return;
      closeChat();
    });
  }

  /* Tennis photo lightbox (about page) */
  var tennisLightbox = document.getElementById('tennis-lightbox');
  var tennisLightboxImg = document.getElementById('tennis-lightbox-img');
  var tennisLightboxClose = document.getElementById('tennis-lightbox-close');
  var tennisLightboxPrev = document.getElementById('tennis-lightbox-prev');
  var tennisLightboxNext = document.getElementById('tennis-lightbox-next');
  var bounceCardsContainer = document.getElementById('bounce-cards-container');

  if (
    tennisLightbox &&
    tennisLightboxImg &&
    tennisLightboxClose &&
    tennisLightboxPrev &&
    tennisLightboxNext &&
    bounceCardsContainer
  ) {
    var tennisSlides = [];
    bounceCardsContainer.querySelectorAll('.bounce-card').forEach(function (card) {
      var img = card.querySelector('img');
      if (!img) return;
      var cropPx = card.getAttribute('data-lightbox-crop-src-px');
      tennisSlides.push({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        cropSrcPx: cropPx ? parseFloat(cropPx, 10) : 0
      });
    });

    var tennisIndex = 0;
    var tennisFocusBefore = null;

    function clearTennisLightboxCrop() {
      tennisLightboxImg.style.clipPath = '';
      tennisLightboxImg.style.webkitClipPath = '';
    }

    function applyTennisLightboxCrop() {
      clearTennisLightboxCrop();
      var s = tennisSlides[tennisIndex];
      if (!s || !s.cropSrcPx || s.cropSrcPx <= 0) return;

      function setClipFromNatural() {
        var h = tennisLightboxImg.naturalHeight;
        if (!h) return;
        var pct = (s.cropSrcPx / h) * 100;
        var v = 'inset(' + pct + '% 0 0 0)';
        tennisLightboxImg.style.clipPath = v;
        tennisLightboxImg.style.webkitClipPath = v;
      }

      if (tennisLightboxImg.complete && tennisLightboxImg.naturalHeight) {
        setClipFromNatural();
      } else {
        tennisLightboxImg.onload = function () {
          tennisLightboxImg.onload = null;
          setClipFromNatural();
        };
      }
    }

    function showTennisSlide(i) {
      if (!tennisSlides.length) return;
      tennisIndex = (i + tennisSlides.length) % tennisSlides.length;
      var s = tennisSlides[tennisIndex];
      clearTennisLightboxCrop();
      tennisLightboxImg.setAttribute('src', s.src);
      tennisLightboxImg.setAttribute('alt', s.alt);
      applyTennisLightboxCrop();
    }

    function openTennisLightbox(startIndex) {
      if (!tennisSlides.length) return;
      tennisFocusBefore = document.activeElement;
      showTennisSlide(startIndex);
      tennisLightbox.classList.add('is-open');
      tennisLightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tennis-lightbox-open');
      tennisLightboxClose.focus();
    }

    function closeTennisLightbox() {
      tennisLightbox.classList.remove('is-open');
      tennisLightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tennis-lightbox-open');
      tennisLightboxImg.onload = null;
      clearTennisLightboxCrop();
      tennisLightboxImg.removeAttribute('src');
      if (tennisFocusBefore && typeof tennisFocusBefore.focus === 'function') {
        tennisFocusBefore.focus();
      }
      tennisFocusBefore = null;
    }

    bounceCardsContainer.querySelectorAll('.bounce-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        var idx = parseInt(card.getAttribute('data-index'), 10);
        if (isNaN(idx)) idx = 0;
        openTennisLightbox(idx);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        var idx = parseInt(card.getAttribute('data-index'), 10);
        if (isNaN(idx)) idx = 0;
        openTennisLightbox(idx);
      });
    });

    tennisLightboxClose.addEventListener('click', closeTennisLightbox);
    tennisLightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeTennisLightbox);
    });
    tennisLightboxPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      showTennisSlide(tennisIndex - 1);
    });
    tennisLightboxNext.addEventListener('click', function (e) {
      e.stopPropagation();
      showTennisSlide(tennisIndex + 1);
    });

    document.addEventListener(
      'keydown',
      function (e) {
        if (!tennisLightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeTennisLightbox();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          showTennisSlide(tennisIndex - 1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          showTennisSlide(tennisIndex + 1);
        }
      },
      true
    );
  }

})();
