/* ================= GSAP SETUP ================= */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother;
let mm;

/* ================= LOADER ================= */
document.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline({ onComplete: initSmoothScroll });

  tl.set(".loader-container", { autoAlpha: 1 })
    .to({}, { duration: 0.8 })
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
});

/* ================= SMOOTH SCROLL ================= */
function initSmoothScroll() {

  if (smoother) smoother.kill();

  // Disable smoother on small screens
  if (window.innerWidth > 768) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.1,
      effects: true,
      normalizeScroll: true
    });
  }

  initAnimations();
}

/* ================= ANIMATIONS ================= */
function initAnimations() {

  // Kill old triggers before rebuilding
  ScrollTrigger.getAll().forEach(t => t.kill());

  if (mm) mm.kill();
  mm = gsap.matchMedia();

  /* ===== COMMON ANIMATIONS ===== */

  gsap.utils.toArray(".card").forEach(card => {
    gsap.from(card, {
      opacity: 0,
      y: 60,
      duration: 0.6,
      scrollTrigger: {
        trigger: card,
        start: "top 0%",
        invalidateOnRefresh: true
      }
    });
  });
  const uploadBtn = document.getElementById("uploadBtn");
  const submitBtn = document.getElementById("submitBtn");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const browseText = document.querySelector(".browse");

  let selectedFiles = [];

  // 🔒 Force hide submit button on load (overrides CSS issues)
  submitBtn.style.display = "none";

  // Open file picker
  uploadBtn.addEventListener("click", () => fileInput.click());
  if (browseText) browseText.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files);
    if (files.length === 0) return;

    files.forEach(file => {
      selectedFiles.push(file);

      const item = document.createElement("div");
      item.className = "file-item";
      item.textContent = file.name;
      fileList.appendChild(item);
    });

    // Change button text after first selection
    uploadBtn.textContent = "Upload More";

    // ✅ Show Upload button ONLY when at least 1 file selected
    if (selectedFiles.length > 0) {
      submitBtn.style.display = "inline-block";
    }
  });
  /* ===== DESKTOP ONLY ===== */
  mm.add("(min-width: 1025px)", () => {

    const container = document.querySelector(".keydivs");
    const section = document.querySelector(".page2");

    if (!container || !section) return;

    const getScrollAmount = () =>
      container.scrollWidth - document.documentElement.clientWidth;

    gsap.to(container, {
      x: () => -getScrollAmount(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + getScrollAmount(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
  });

  /* ===== TABLET ===== */
  mm.add("(min-width: 768px) and (max-width: 1024px)", () => {
    gsap.from(".key-box", {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".page2",
        start: "top 80%",
        invalidateOnRefresh: true
      }
    });
  });

  /* ===== MOBILE ===== */
  mm.add("(max-width: 767px)", () => {

    // Remove transforms from horizontal scroll
    gsap.set(".keydivs", { clearProps: "all" });

    gsap.from(".upload-box", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".upload-section",
        start: "top 90%",
        invalidateOnRefresh: true
      }
    });
  });

  /* ===== GLOBAL ANIMATIONS ===== */

  gsap.from(".contact-content, .contact-btn", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".contact",
      start: "top 70%",
      invalidateOnRefresh: true
    }
  });

  gsap.from(".services, .clients", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: ".services",
      start: "top 80%",
      invalidateOnRefresh: true
    }
  });

  ScrollTrigger.refresh();
}

/* ================= REBUILD ON RESIZE ================= */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    initSmoothScroll();
  }, 300);
});

/* ================= MOBILE MENU ================= */
const toggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}