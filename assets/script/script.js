import {logoData} from "../logo/logo.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";
import ScrollTrigger from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.js";
import Lenis from 'https://unpkg.com/@studio-freight/lenis@1.0.40/dist/lenis.mjs';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize smooth scrolling with Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Get all DOM elements
    const heroImgContainer = document.querySelector(".hero-img-container");
    const heroImgLogo = document.querySelector(".hero-img-logo");
    const heroImgCopy = document.querySelector(".hero-img-copy");
    const fadeOverlay = document.querySelector(".fade-overlay");
    const svgOverlay = document.querySelector(".overlay");
    const overlayCopy = document.querySelector("h1");

    // Responsive variables based on viewport size
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const initialOverlayScale = Math.min(Math.max(684, vw / 3), 1000); // Scale based on viewport width

    // Logo setup
    const logoContainer = document.querySelector(".logo-container");
    const logoMask = document.getElementById("logoMask");

    logoMask.setAttribute("d", logoData);

    // Calculate logo dimensions and position responsively
    const updateLogoPosition = () => {
        const logoDimensions = logoContainer.getBoundingClientRect();
        const logoBoundingBox = logoMask.getBBox();

        const horizontalScaleRatio = logoDimensions.width / logoBoundingBox.width;
        const verticalScaleRatio = logoDimensions.height / logoBoundingBox.height;
        const logoScaleFactor = Math.min(horizontalScaleRatio, verticalScaleRatio);

        const logoHorizontalPosition = logoDimensions.left +
            (logoDimensions.width - logoBoundingBox.width * logoScaleFactor) / 2 -
            logoBoundingBox.x * logoScaleFactor;

        const logoVerticalPosition = logoDimensions.top +
            (logoDimensions.height - logoBoundingBox.height * logoScaleFactor) / 2 -
            logoBoundingBox.y * logoScaleFactor;

        logoMask.setAttribute("transform", `translate(${logoHorizontalPosition}, ${logoVerticalPosition}) scale(${logoScaleFactor})`);
    };

    // Initial logo positioning
    updateLogoPosition();

    // Handle window resize events
    window.addEventListener('resize', () => {
        updateLogoPosition();
        ScrollTrigger.refresh(true);
    });

    // Dynamically adjust scroll length based on viewport height
    const scrollLength = Math.min(Math.max(window.innerHeight * 5, 2000), 8000);

    // Create the scroll-based animation
    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `${scrollLength}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
            const scrollProgress = self.progress;

            // Responsive animation timing based on device size
            const fadeOutPoint = vw < 768 ? 0.2 : 0.15;
            const overlayAnimEndPoint = vw < 768 ? 0.8 : 0.85;
            const copyRevealStart = vw < 768 ? 0.55 : 0.6;
            const copyRevealDuration = vw < 768 ? 0.3 : 0.25;

            // Logo and copy fade out
            if(scrollProgress <= fadeOutPoint) {
                const fadeOpacity = 1 - scrollProgress * (1 / fadeOutPoint);
                gsap.set([heroImgLogo, heroImgCopy], {
                    opacity: fadeOpacity,
                });
            } else {
                gsap.set([heroImgLogo, heroImgCopy], {
                    opacity: 0,
                });
            }

            // Main animation for scaling and overlay
            if(scrollProgress <= overlayAnimEndPoint) {
                const normalizedProgress = scrollProgress * (1 / overlayAnimEndPoint);

                // Scale container inversely with scroll progress (responsive scale based on device)
                const startScale = vw < 480 ? 1.3 : (vw < 768 ? 1.4 : 1.5);
                const heroImgContainerScale = startScale - (startScale - 1) * normalizedProgress;

                // Scale overlay based on scroll progress
                const overlayScale = initialOverlayScale * Math.pow(1 / initialOverlayScale, normalizedProgress);

                let fadeOverlayOpacity = 0;

                gsap.set(heroImgContainer, {
                    scale: heroImgContainerScale,
                });

                gsap.set(svgOverlay, {
                    scale: overlayScale,
                });

                // Control fade overlay opacity
                const fadeOverlayStart = vw < 768 ? 0.3 : 0.25;
                const fadeOverlayDuration = vw < 768 ? 0.3 : 0.4;

                if(scrollProgress >= fadeOverlayStart) {
                    fadeOverlayOpacity = Math.min(1, (scrollProgress - fadeOverlayStart) * (1 / fadeOverlayDuration));
                }

                gsap.set(fadeOverlay, {
                    opacity: fadeOverlayOpacity,
                });
            }

            // Overlay copy reveal animation
            if(scrollProgress >= copyRevealStart && scrollProgress <= overlayAnimEndPoint) {
                const overlayCopyRevealProgress = (scrollProgress - copyRevealStart) * (1 / copyRevealDuration);

                // Responsive gradient values based on screen size
                const gradientSpread = vw < 768 ? 80 : 100;
                const gradientBasePos = vw < 768 ? 220 : 240;
                const gradientMoveAmount = vw < 768 ? 260 : 280;

                const gradientBottomPosition = gradientBasePos - overlayCopyRevealProgress * gradientMoveAmount;
                const gradientTopPosition = gradientBottomPosition - gradientSpread;

                // Scale text slightly larger at start and reduce to normal
                const scaleFactor = vw < 768 ? 0.2 : 0.25;
                const overlayCopyScale = 1 + scaleFactor - scaleFactor * overlayCopyRevealProgress;

                overlayCopy.style.background = `linear-gradient(to bottom, #111117 0%, #111117 ${gradientTopPosition}%, #e66461 ${gradientBottomPosition}%, #e66461 100%)`;
                overlayCopy.style.backgroundClip = "text";
                overlayCopy.style.webkitBackgroundClip = "text";

                gsap.set(overlayCopy, {
                    scale: overlayCopyScale,
                    opacity: overlayCopyRevealProgress,
                });
            } else if(scrollProgress < copyRevealStart) {
                gsap.set(overlayCopy, {
                    opacity: 0,
                });
            }
        }
    });
});