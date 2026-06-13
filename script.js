(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      document.body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  window.addEventListener("scroll", () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 32);
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-e][data-d]").forEach((link) => {
    link.addEventListener("click", function () {
      this.href = "mailto:" + this.dataset.e + "@" + this.dataset.d;
    });
  });

  const form = document.querySelector(".contact-form");
  const formNote = document.querySelector(".form-note");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (formNote) formNote.classList.add("visible");
    });
  }

  const slider = document.querySelector(".visual-slider");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".visual-slide"));
    const prevButton = slider.querySelector(".slider-prev");
    const nextButton = slider.querySelector(".slider-next");
    const dotsWrap = slider.querySelector(".slider-dots");
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let touchStartX = 0;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((slide, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show " + slide.querySelector("figcaption").textContent);
        dot.addEventListener("click", () => showSlide(index));
        dotsWrap.appendChild(dot);
      });
    }

    function showSlide(nextIndex) {
      if (!slides.length || nextIndex === activeIndex) return;
      const previousSlide = slides[activeIndex];
      activeIndex = (nextIndex + slides.length) % slides.length;

      previousSlide.classList.remove("is-active");
      previousSlide.classList.add("is-leaving");
      slides[activeIndex].classList.add("is-active");
      window.setTimeout(() => previousSlide.classList.remove("is-leaving"), 430);
      updateDots();
    }

    function updateDots() {
      if (!dotsWrap) return;
      Array.from(dotsWrap.children).forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
        dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
      });
    }

    renderDots();
    updateDots();

    if (prevButton) prevButton.addEventListener("click", () => showSlide(activeIndex - 1));
    if (nextButton) nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

    slider.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 44) return;
      showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }, { passive: true });
  }

  function animateCounter(el, target, suffix) {
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }

    let current = 0;
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.55 });

  counters.forEach((counter) => counterObserver.observe(counter));

  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(".hero-copy > *", { opacity: 0, y: 28 });
    gsap.set(".hero-panel", { opacity: 0, y: 36, rotate: 0.5 });
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".hero-copy > *", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 })
      .to(".hero-panel", { opacity: 1, y: 0, rotate: 0, duration: 0.9 }, "-=0.5");

    gsap.to(".ring-one", {
      rotate: 360,
      duration: 32,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%"
    });

    gsap.to(".ring-two", {
      rotate: -360,
      duration: 44,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%"
    });

    gsap.utils.toArray(".reveal-section").forEach((section) => {
      gsap.from(section.querySelectorAll(".section-heading, .section-header, .copy-stack, .equipment-board, .timeline article, .industry-cloud span, .client-wall span, .contact-card"), {
        scrollTrigger: {
          trigger: section,
          start: "top 76%",
          once: true
        },
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.07,
        ease: "power3.out"
      });
    });

    gsap.utils.toArray(".reveal-stagger").forEach((group) => {
      gsap.from(group.children, {
        scrollTrigger: {
          trigger: group,
          start: "top 78%",
          once: true
        },
        opacity: 0,
        y: 24,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out"
      });
    });

    gsap.utils.toArray(".image-animate").forEach((imagePanel) => {
      if (imagePanel.closest(".visual-grid")) return;
      gsap.from(imagePanel, {
        scrollTrigger: {
          trigger: imagePanel,
          start: "top 82%",
          once: true
        },
        opacity: 0,
        y: 34,
        scale: 0.96,
        duration: 0.9,
        ease: "power3.out"
      });
    });
  } else {
    document.querySelectorAll(".hero-copy > *, .hero-panel, .reveal-section, .reveal-stagger > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }
})();
