// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Locomotive Scroll + ScrollTrigger
initSite();

window.addEventListener("load", () => {

    const master = gsap.timeline();

    master
        // Show loader
        .set(".loader-container", { autoAlpha: 1 })

        // Fake loading delay
        .to({}, { duration: 2 })

        // Loader text exit
        .to(".loader-text-fill", {
            y: -60,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in"
        })

        // Slide loader up
        .to(".loader-container", {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut"
        }, "-=0.2")

        // Main content reveal
        .from(".main", {
            y: 120,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        }, "<")

        .set(".loader-container", { display: "none" })

        // Hero elements entrance
        .from(".nav img, .nav h4, .hero-image, .floating", {
            opacity: 0,
            y: 80,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out"
        });
});

function initSite() {

    const locoScroll = new LocomotiveScroll({
        el: document.querySelector(".main"),
        smooth: true
    });

    locoScroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(".main", {
        scrollTop(value) {
            return arguments.length
                ? locoScroll.scrollTo(value, 0, 0)
                : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        pinType: document.querySelector(".main").style.transform
            ? "transform"
            : "fixed"
    });

    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();

    // 🔥 HERO SCROLL ANIMATION
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".page1",
            scroller: ".main",
            start: "top top",
            end: "bottom top",
            scrub: 2
        }
    });

    // Move floating text up & fade
    tl.to(".text1, .text2, .text3, .text4", {
        y: -150,
        opacity: 0,
        stagger: 0.1
    }, "move")

        // Move image down & fade
        .to(".hero-image", {
            y: 150,
            opacity: 0
        }, "move");
}
