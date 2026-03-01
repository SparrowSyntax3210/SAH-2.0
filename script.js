/* ================= GSAP SETUP ================= */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/* ================= LOADER ================= */
document.addEventListener("DOMContentLoaded", () => {

  const tl = gsap.timeline({
    onComplete: initSmoothScroll // start smoother AFTER loader
  });

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

/* ================= SCROLL SMOOTHER ================= */
function initSmoothScroll() {
  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
    normalizeScroll: true
  });

  initAnimations(); // start scroll animations
}

/* ================= SCROLL ANIMATIONS ================= */
function initAnimations() {

  /* ABOUT SECTION */
  gsap.set(".small-title", { opacity: 0, y: 40 });
  gsap.set(".about-text h1", { opacity: 0, y: 60 });
  gsap.set(".description", { opacity: 0, y: 40 });
  gsap.set(".card", { opacity: 0, y: 60 });

  const aboutTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".about",
      start: "top 70%",
      toggleActions: "play reverse play reverse",
    }
  });

  aboutTimeline
    .to(".small-title", { opacity: 1, y: 0, duration: 0.6 })
    .to(".about-text h1", { opacity: 1, y: 0, duration: 0.8 }, "-=0.2")
    .to(".description", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

  gsap.to(".card", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about",
      start: "top 60%",
    }
  });

  /* PAGE 2 HORIZONTAL SCROLL */
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
      },
    });

    gsap.from(".page2-text-left h1, .page2-text-right p", {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".page2",
        start: "top 70%",
      }
    });

    gsap.from(".key-box", {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".page2",
        start: "top 60%",
      }
    });
  }

  /* UPLOAD SECTION */
  gsap.from(".upload-box", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: ".upload-section",
      start: "top 70%",
    }
  });

  /* CONTACT */
  gsap.from(".contact-content, .contact-btn", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".contact",
      start: "top 70%",
    }
  });

  /* SERVICES & CLIENTS */
  gsap.from(".services, .clients", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: ".services",
      start: "top 80%",
    }
  });

  ScrollTrigger.refresh();
}

/* ================= PROFILE DROPDOWN ================= */
const avatar = document.querySelector(".avatar");
const dropdown = document.querySelector(".dropdown");

if (avatar) {
  avatar.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile")) {
      dropdown.style.display = "none";
    }
  });
}

/* ================= AUTH UI HANDLER ================= */
document.addEventListener("DOMContentLoaded", () => {
  const profile = document.getElementById("profileCircle");
  const getStartedBtn = document.querySelector(".fill-btn");

  if (!profile || !getStartedBtn) return;

  fetch("/auth/auth-status", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        profile.style.display = "flex";
        getStartedBtn.style.display = "none";
      } else {
        profile.style.display = "none";
        getStartedBtn.style.display = "inline-block";
      }
    })
    .catch(err => {
      console.error("Auth check failed", err);
      profile.style.display = "none";
      getStartedBtn.style.display = "inline-block";
    });
});

/* ================= LOGOUT ================= */
function logoutUser() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "/";
}

/* ================= UPLOAD LOGIC ================= */
// ================= UPLOAD LOGIC =================
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const browseBtn = document.getElementById("browseBtn");
const uploadBox = document.getElementById("uploadBox");
const successBox = document.getElementById("successBox");
const uploadForm = document.getElementById("uploadForm");

let selectedFiles = [];

// Browse click triggers file input
browseBtn.addEventListener("click", () => fileInput.click());

// File selection
fileInput.addEventListener("change", (e) => {
  selectedFiles = Array.from(e.target.files);
  renderFileList();
});

function renderFileList() {
  if (!selectedFiles.length) {
    fileList.innerHTML = "<p>No files selected</p>";
    return;
  }
  fileList.innerHTML = selectedFiles.map(f => `<p>${f.name}</p>`).join("");
}

// Drag & Drop
uploadBox.addEventListener("dragover", e => e.preventDefault());
uploadBox.addEventListener("drop", e => {
  e.preventDefault();
  selectedFiles = Array.from(e.dataTransfer.files);
  fileInput.files = e.dataTransfer.files; // sync hidden input
  renderFileList();
});

// Upload form submit
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedFiles.length) return alert("Please select files first");

  const formData = new FormData(uploadForm);
  selectedFiles.forEach(f => formData.append("resume", f));

  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    if (res.ok) {
      // hide upload form & show success
      uploadBox.style.display = "none";
      successBox.style.display = "block";
    } else {
      const text = await res.text();
      alert("Upload failed: " + text);
    }
  } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
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