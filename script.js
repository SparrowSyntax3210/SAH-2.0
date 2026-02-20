gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

window.addEventListener("load", () => {

  // ✅ CREATE SMOOTH SCROLL
  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,        // scroll smoothness
    effects: true,
    normalizeScroll: true
  });

  // =============================
  // LOADER + HERO REVEAL
  // =============================
  const tl = gsap.timeline();

  tl.set(".loader-container", { autoAlpha: 1 })
    .to({}, { duration: 1 })
    .to(".loader-text-fill", {
      y: -60,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    })
    .to(".loader-container", {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut",
    })
    .set(".loader-container", { display: "none" })
    .from(".nav img, .nav h4, .floating, .fill-btn", {
      y: 80,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
    });

  // =========================
  // INITIAL STATES
  // =========================
  gsap.set(".small-title", { opacity: 0, y: 40 });
  gsap.set(".about-text h1", { opacity: 0, y: 60 });
  gsap.set(".description", { opacity: 0, y: 40 });
  gsap.set(".card", { opacity: 0, y: 60 });

  // =========================
  // HEADINGS ANIMATION
  // =========================
  const aboutTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".about",
      start: "top 10%",   // starts when section enters view
      toggleActions: "play reverse play reverse",
    }
  });

  aboutTimeline
    .to(".small-title", { opacity: 1, y: 0, duration: 0.6 })
    .to(".about-text h1", { opacity: 1, y: 0, duration: 0.8 }, "-=0.2")
    .to(".description", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

  // =========================
  // CARDS ANIMATION
  // =========================
  gsap.to(".card", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about",
      start: "top 30%",
      toggleActions: "play reverse play reverse",
    }
  });

    // =============================
  // HORIZONTAL SCROLL
  // =============================
  const container = document.querySelector(".keydivs");
  const section = document.querySelector(".page2");

  if (container && section) {
    const scrollAmount = container.scrollWidth - window.innerWidth;

    gsap.to(container, {
      x: -scrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + scrollAmount,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }


});