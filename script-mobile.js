/**
 * UNIFIED MOBILE ENGINE - Daria Łuka Portfolio
 * This script handles: 
 * 1. The Morphing Info Button
 * 2. Background Video Grid
 * 3. Award Video Indicator (Long-press/Tap)
 */

(function() {
    // 1. UTILITY: Only run if screen is mobile-sized
    const isMobileView = () => window.innerWidth <= 768;

    function initMobile() {
        console.log("Mobile Script: Initializing...");

        const body = document.body;
        const button = document.getElementById("infoToggle");
        const mobileWrapper = document.getElementById("mobileWrapper");
        const videoContainer = document.getElementById("mobileVideosWrapper");
        const awardIndicator = document.getElementById("award-indicator");

        if (!button) {
            console.error("Mobile Script: #infoToggle not found.");
            return;
        }

        // --- A. THE MORPHING BUTTON LOGIC ---
        // State tracking
        let isPanelOpen = false;

        // Force-clear any previous listeners from desktop scripts
        const cleanButton = button.cloneNode(true);
        button.parentNode.replaceChild(cleanButton, button);

        cleanButton.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation(); // Stop desktop script from hearing this click

            isPanelOpen = !isPanelOpen;

            if (isPanelOpen) {
                body.classList.add("info-open");
                cleanButton.classList.add("active");
                body.style.overflow = "hidden"; // Lock background
                console.log("MOBILE: Panel is now OPEN");
            } else {
                body.classList.remove("info-open");
                cleanButton.classList.remove("active");
                body.style.overflow = ""; // Unlock background
                console.log("MOBILE: Panel is now CLOSED");
            }
        });

        // --- B. BACKGROUND VIDEO GENERATOR ---
        if (videoContainer && videoContainer.children.length === 0) {
            const SRC = "reel_small.mp4";
            for (let i = 0; i < 3; i++) {
                const v = document.createElement("video");
                v.src = SRC;
                v.muted = true;
                v.loop = true;
                v.playsInline = true;
                v.autoplay = true;
                v.setAttribute('webkit-playsinline', 'true');
                videoContainer.appendChild(v);
                v.play().catch(() => { /* Handle silent block */ });
            }
        }

        const indicatorVideo = document.createElement('video');
indicatorVideo.autoplay = true;
indicatorVideo.muted = true;
indicatorVideo.loop = true;
indicatorVideo.playsInline = true;

// Add proper sizing
indicatorVideo.style.width = "100%";
indicatorVideo.style.height = "100%";
indicatorVideo.style.objectFit = "cover";

awardIndicator.appendChild(indicatorVideo);

        // --- C. AWARD INDICATOR (POINTER EVENTS) ---
        const awardItems = document.querySelectorAll('#awardsColumn .award-item');
        if (awardIndicator && awardItems.length > 0) {
            let indicatorVideo = awardIndicator.querySelector('video');
            if (!indicatorVideo) {
                indicatorVideo = document.createElement('video');
                indicatorVideo.muted = true;
                indicatorVideo.loop = true;
                indicatorVideo.playsInline = true;
                awardIndicator.appendChild(indicatorVideo);
            }

            awardItems.forEach(item => {
                // Use pointerdown for instant response on mobile
                item.addEventListener('pointerdown', (e) => {
                    const videoSrc = item.getAttribute('data-video');
                    if (!videoSrc) return;

                    item.classList.add('is-active');
                    
                    // Center the indicator near the tap
                    const iWidth = 150;
                    const iHeight = 266;
                    let posX = e.clientX + 20;
                    let posY = e.clientY - (iHeight / 2);

                    // Keep it on screen
                    if (posX + iWidth > window.innerWidth) posX = e.clientX - iWidth - 20;
                    posY = Math.max(10, Math.min(posY, window.innerHeight - iHeight - 10));

                    awardIndicator.style.left = `${posX}px`;
                    awardIndicator.style.top = `${posY}px`;
                    awardIndicator.classList.add('show');

                    if (indicatorVideo.src.indexOf(videoSrc) === -1) {
                        indicatorVideo.src = videoSrc;
                        indicatorVideo.load();
                        indicatorVideo.play().catch(() => {});
                    }
                });

                const hide = () => {
                    item.classList.remove('is-active');
                    awardIndicator.classList.remove('show');
                    indicatorVideo.pause();
                };

                item.addEventListener('pointerup', hide);
                item.addEventListener('pointerleave', hide);
                item.addEventListener('pointercancel', hide);
            });
        }
    }

    // --- D. EXECUTION & RESIZE PROTECTION ---
    if (isMobileView()) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            initMobile();
        } else {
            document.addEventListener("DOMContentLoaded", initMobile);
        }
    }

    // Clean refresh on resize to avoid desktop logic leaking in
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isMobileView()) {
                // If we just entered mobile mode, reload to clear desktop state
                location.reload(); 
            }
        }, 250);
    });

})();