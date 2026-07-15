(function () {
  "use strict";

  /* =========================================================
     UTIL
     ========================================================= */
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* =========================================================
     ANO NO RODAPÉ
     ========================================================= */
  const anoEl = qs("#anoAtual");
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* =========================================================
     FALLBACK DE IMAGENS
     Se uma imagem real falhar ao carregar, troca por outra
     foto real (nunca por um placeholder genérico/ilustração).
     ========================================================= */
  qsa("img[data-fallback]").forEach((img) => {
    img.addEventListener(
      "error",
      function onError() {
        const fallback = img.getAttribute("data-fallback");
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
        img.removeEventListener("error", onError);
      },
      { once: true }
    );
  });

  /* =========================================================
     HEADER — sombra ao rolar
     ========================================================= */
  const header = qs(".site-header");
  const updateHeaderState = () => {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* =========================================================
     BOTÃO VOLTAR AO TOPO
     ========================================================= */
  const backToTop = qs("#backToTop");
  const updateBackToTop = () => {
    if (window.scrollY > 600) backToTop.classList.add("is-visible");
    else backToTop.classList.remove("is-visible");
  };
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* =========================================================
     MENU MOBILE (hambúrguer)
     ========================================================= */
  const hamburgerBtn = qs("#hamburgerBtn");
  const mobileMenu = qs("#mobileMenu");
  const mobileOverlay = qs("#mobileOverlay");
  const mobileCloseBtn = qs("#mobileCloseBtn");
  const mobileLinks = qsa(".mobile-link, .mobile-cta");

  let lastFocusedEl = null;

  function openMobileMenu() {
    lastFocusedEl = document.activeElement;
    mobileMenu.classList.add("is-active");
    mobileOverlay.classList.add("is-active");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    hamburgerBtn.setAttribute("aria-label", "Fechar menu");
    document.body.style.overflow = "hidden";
    mobileCloseBtn.focus();
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-active");
    mobileOverlay.classList.remove("is-active");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "Abrir menu");
    // só libera o scroll se o catálogo também não estiver aberto
    if (!catalogOverlay.classList.contains("is-active")) {
      document.body.style.overflow = "";
    }
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("is-active");
    isOpen ? closeMobileMenu() : openMobileMenu();
  });
  mobileCloseBtn.addEventListener("click", closeMobileMenu);
  mobileOverlay.addEventListener("click", closeMobileMenu);

  // fecha ao selecionar qualquer opção do menu mobile
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  // fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-active")) {
      closeMobileMenu();
    }
  });

  /* =========================================================
     CATÁLOGO DE SERVIÇOS (modal fullscreen)
     ========================================================= */
  const catalogOverlay = qs("#catalogOverlay");
  const catalogPanel = qs("#catalogPanel");
  const catalogBackBtn = qs("#catalogBackBtn");
  const catalogCloseBtn = qs("#catalogCloseBtn");
  const catalogTabs = qsa(".catalog-tab");
  const catalogCategories = qsa(".catalog-category");
  const openCatalogTriggers = qsa("[data-open-catalog]");

  let catalogLastFocusedEl = null;

  function activateCategory(key) {
    if (!key) return;
    catalogTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.target === key);
    });
    catalogCategories.forEach((cat) => {
      cat.classList.toggle("is-active", cat.dataset.category === key);
    });
  }

  function openCatalog(category) {
    catalogLastFocusedEl = document.activeElement;

    // se o menu mobile estiver aberto, fecha antes de abrir o catálogo
    if (mobileMenu.classList.contains("is-active")) {
      mobileMenu.classList.remove("is-active");
      mobileOverlay.classList.remove("is-active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }

    activateCategory(category || "banho");
    catalogOverlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
    catalogBody.scrollTop = 0;
    catalogCloseBtn.focus();
  }

  function closeCatalog() {
    catalogOverlay.classList.remove("is-active");
    document.body.style.overflow = "";
    if (catalogLastFocusedEl) catalogLastFocusedEl.focus();
  }

  openCatalogTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openCatalog(trigger.dataset.category);
    });
  });

  catalogBackBtn.addEventListener("click", closeCatalog);
  catalogCloseBtn.addEventListener("click", closeCatalog);

  // fecha ao clicar fora do painel (no overlay escurecido)
  catalogOverlay.addEventListener("click", (e) => {
    if (e.target === catalogOverlay) closeCatalog();
  });

  const catalogBody = qs("#catalogBody");

  catalogTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateCategory(tab.dataset.target));
  });

  // fecha com ESC (prioriza o catálogo se ambos estiverem abertos)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && catalogOverlay.classList.contains("is-active")) {
      closeCatalog();
    }
  });

  /* =========================================================
     LIGHTBOX DA GALERIA
     ========================================================= */
  const lightbox = qs("#lightbox");
  const lightboxImg = qs("#lightboxImg");
  const lightboxClose = qs("#lightboxClose");
  const galleryItems = qsa(".gallery-item");

  let galleryLastFocusedEl = null;

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      galleryLastFocusedEl = document.activeElement;
      const full = item.dataset.full;
      const imgEl = qs("img", item);
      lightboxImg.src = full;
      lightboxImg.alt = imgEl ? imgEl.alt : "";
      lightbox.classList.add("is-active");
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("is-active");
    document.body.style.overflow = catalogOverlay.classList.contains("is-active") ? "hidden" : "";
    if (galleryLastFocusedEl) galleryLastFocusedEl.focus();
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-active")) {
      closeLightbox();
    }
  });

  /* =========================================================
     CARROSSEL DE DEPOIMENTOS
     ========================================================= */
  const track = qs("#testimonialTrack");
  const dotsWrap = qs("#testimonialDots");
  const prevBtn = qs("#testimonialPrev");
  const nextBtn = qs("#testimonialNext");
  const cards = qsa(".testimonial-card", track);

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w <= 720) return 1;
    if (w <= 960) return 2;
    return 3;
  }

  let currentIndex = 0;

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    const maxIndex = getMaxIndex();
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Ir para depoimento " + (i + 1));
      if (i === currentIndex) dot.classList.add("is-active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(index) {
    const maxIndex = getMaxIndex();
    currentIndex = Math.min(Math.max(index, 0), maxIndex);
    const card = cards[0];
    const gap = 24; // 1.5rem
    const cardWidth = card.getBoundingClientRect().width + gap;
    track.scrollTo({ left: currentIndex * cardWidth, behavior: "smooth" });
    qsa("button", dotsWrap).forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  buildDots();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentIndex = 0;
      track.scrollTo({ left: 0 });
      buildDots();
    }, 200);
  });

  /* =========================================================
     SCROLL REVEAL (animações discretas ao rolar)
     ========================================================= */
  const revealTargets = qsa(
    ".diff-card, .servico-card, .gallery-item, .about-copy, .about-visual, .hours-card, .map-card, .section-heading"
  );
  revealTargets.forEach((el) => el.setAttribute("data-reveal", ""));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     LINKS DE ÂNCORA — fecha menu mobile antes de rolar
     (evita "salto" de layout com o menu ainda aberto)
     ========================================================= */
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length > 1) {
        const targetEl = qs(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerHeight = header.offsetHeight;
          const top = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
          window.scrollTo({ top, behavior: "smooth" });
          history.pushState(null, "", targetId);
        }
      }
    });
  });
})();