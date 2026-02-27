/* ================= GSAP SETUP ================= */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother;
let mm;

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ===== SHOW LOGOUT IF SESSION EXISTS ===== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn && document.cookie.includes("connect.sid")) {
    logoutBtn.style.display = "inline-block";
  }

  /* ================= LOADER ================= */
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

  /* ================= UPLOAD LOGIC ================= */
  const uploadBtn = document.getElementById("uploadBtn");
  const submitBtn = document.getElementById("submitBtn");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const browseText = document.querySelector(".browse");
  const uploadBox = document.getElementById("uploadBox");
  const successBox = document.getElementById("successBox");

  if (uploadBtn && submitBtn && fileInput) {

    let selectedFiles = [];

    submitBtn.style.display = "none";

    uploadBtn.addEventListener("click", () => fileInput.click());
    if (browseText) browseText.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files);
      if (!files.length) return;

      files.forEach(file => {
        selectedFiles.push(file);

        const item = document.createElement("div");
        item.className = "file-item";
        item.textContent = file.name;
        fileList.appendChild(item);
      });

      uploadBtn.textContent = "Upload More";
      submitBtn.style.display = "inline-block";
    });

    /* 🚀 SEND FILES TO BACKEND */
    submitBtn.addEventListener("click", async () => {
      if (!selectedFiles.length) return alert("Select files first");

      const formData = new FormData();
      selectedFiles.forEach(file => formData.append("resume", file));

      try {
        const res = await fetch("/upload", {
          method: "POST",
          body: formData
        });

        const text = await res.text();

        if (uploadBox) uploadBox.style.display = "none";
        if (successBox) successBox.style.display = "block";

        console.log("Server response:", text);

      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed");
      }
    });

    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    fetch("/upload", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(err => console.error(err));

    uploadBtn.addEventListener("click", async () => {
      if (fileInput.files.length === 0) {
        alert("Please select files first");
        return;
      }

      const formData = new FormData();

      for (let file of fileInput.files) {
        formData.append("resume", file);
      }

      try {
        const res = await fetch("/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        console.log("SERVER RESPONSE:", data);
        alert("Upload successful!");
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      }
    });

  }

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

  /* ===== MOBILE ===== */
  mm.add("(max-width: 767px)", () => {
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

  ScrollTrigger.refresh();
}

/* ================= RESIZE ================= */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initSmoothScroll, 300);
});

/* ================= MOBILE MENU ================= */
const toggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}