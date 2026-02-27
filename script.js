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

/* ================= LOGIN STATE ================= */
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