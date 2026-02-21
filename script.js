
gsap.registerPlugin(ScrollTrigger);

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.2,        // scroll smoothness
  effects: true,
  normalizeScroll: true
});


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
    .from(".nav img, .nav h4, .floating, .fill-btn", {
      y: 80,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
    });

  gsap.set(".small-title", { opacity: 0, y: 40 });
  gsap.set(".about-text h1", { opacity: 0, y: 60 });
  gsap.set(".description", { opacity: 0, y: 40 });
  gsap.set(".card", { opacity: 0, y: 60 });

  const aboutTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".about",
      start: "top 20%",   // appears only after deep scroll
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
      start: "top 0%",
      toggleActions: "play none none none",
    }
  });

  // refresh after loader
  ScrollTrigger.refresh();

  const container = document.querySelector(".keydivs");
  const section = document.querySelector(".page2");

  if (container && section) {
    const scrollAmount = container.scrollWidth - window.innerWidth;

    gsap.to(container, {
      x: -scrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top -40%",
        end: () => "+=" + scrollAmount,
        scrub: 1.5,   // smoother feel
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
        start: "top 10%",
        toggleActions: "play reverse play reverse",
      }
    });

    // Key boxes animation
    gsap.from(".key-box", {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".page2",
        start: "top 0%",
        toggleActions: "play none none reverse",
      }
    });

  }
  const fileInput = document.getElementById("fileInput");
  const browse = document.querySelector(".browse");
  const fileList = document.getElementById("fileList");
  const uploadBtn = document.getElementById("uploadBtn");
  const successBox = document.getElementById("successBox");
  const uploadBox = document.getElementById("uploadBox");

  let selectedFiles = [];

  // Open file picker
  browse.addEventListener("click", () => fileInput.click());

  // Show selected files with progress bars
  fileInput.addEventListener("change", () => {
    selectedFiles = [...fileInput.files];
    fileList.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const div = document.createElement("div");
      div.className = "file-item";
      div.innerHTML = `
      ${file.name}
      <div class="progress-bar">
        <div class="progress-fill" id="progress-${index}"></div>
      </div>
    `;
      fileList.appendChild(div);
    });
  });

  // Upload with progress tracking
  uploadBtn.addEventListener("click", () => {
    if (!selectedFiles.length) return alert("Select files first");

    let uploadedCount = 0;

    selectedFiles.forEach((file, index) => {
      const formData = new FormData();
      formData.append("files", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:4000/upload");

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          document.getElementById(`progress-${index}`).style.width = percent + "%";
        }
      });

      xhr.onload = () => {
        uploadedCount++;
        if (uploadedCount === selectedFiles.length) {
          uploadBox.style.display = "none";
          successBox.style.display = "block";
        }
      };

      xhr.send(formData);
    });
  });

  gsap.from(".upload-box", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".upload-section",
      start: "top 10%",
      toggleActions: "play none none reverse",
    }
  });

  gsap.from(".contact-content, .contact-btn", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".contact",
      start: "top 20%",
      toggleActions: "play none none reverse",
    }
  });

  gsap.from(".services, .clients", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".contact",
      start: "top 5%",
      toggleActions: "play none none reverse",
    }
  });

});