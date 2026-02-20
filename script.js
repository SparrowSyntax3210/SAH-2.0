gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {

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
    .from(
      ".nav img, .nav h4, .hero-image, .floating, .fill-btn",
      {
        y: 80,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
      }
    );

  // =============================
  // HORIZONTAL SCROLL SECTION
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

  // =============================
// ABOUT SECTION SEQUENCE ANIMATION (HOVER SAFE)
// =============================
gsap.registerPlugin(ScrollTrigger);

// 🔹 Initial state (ONLY opacity)
gsap.set(".about .small-title, .about-text h1, .description", {
  opacity: 0,
  y: 40
});

// Cards: only hide opacity — DO NOT touch transform
gsap.set(".card", {
  opacity: 0
});

// =============================
// MASTER TIMELINE
// =============================
const aboutTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".about",
    start: "top 10%",   // starts when section is mostly visible
    toggleActions: "play reverse play reverse"
  }
});

// 🔹 Headings → one by one
aboutTL
.to(".about .small-title", {
  opacity: 1,
  y: 0,
  duration: 0.5,
  ease: "power2.out"
})
.to(".about-text h1", {
  opacity: 1,
  y: 0,
  duration: 0.6,
  ease: "power2.out"
})
.to(".description", {
  opacity: 1,
  y: 0,
  duration: 0.6,
  ease: "power2.out"
}, "-=0.2")

// 🔹 Cards → appear together WITHOUT breaking hover translate
.to(".card", {
  opacity: 1,
  duration: 0.6,
  ease: "power2.out",
  clearProps: "transform" // 🔥 keeps your CSS translateY & hover
}, "+=0.2");

});