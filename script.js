/**
 * 1. UTILS & SHARED LOGIC
 */
function isMobile() {
  return window.innerWidth <= 768;
}

const cursor = document.getElementById("cursor");
const cursorLabel = document.getElementById("cursorLabel");
const cursorDesc = document.getElementById("cursorDesc");
const projectTitleOverlay = document.getElementById("activeProjectTitle");

// Standard Cursor Follow (Desktop only)
if (!isMobile() && cursor) {
  document.addEventListener("mousemove", (e) => {
    const halfW = cursor.offsetWidth / 2;
    const halfH = cursor.offsetHeight / 2;
    cursor.style.left = `${e.clientX - halfW}px`;
    cursor.style.top = `${e.clientY - halfH}px`;
    // ADD THIS: Project Title follow logic
   // Project Title with manual offset
// 2. Dynamic Project Title Offset
    if (projectTitleOverlay) {
        // Check if the cursor is currently in the 'grown' state
        const isGrown = cursor.classList.contains("video-hover");
        
        // Define your two offset distances
        // Small cursor = 25px offset | Large cursor = 50px offset
        const offset = isGrown ? 75 : 40; 
        
        projectTitleOverlay.style.left = `${e.clientX + offset}px`;
        projectTitleOverlay.style.top = `${e.clientY + offset}px`;
    }
  });
}

/**
 * 2. MOBILE SPECIFIC SCRIPT
 */
if (isMobile()) {
  (function () {
    const button = document.getElementById("infoToggle");
    button.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("info-open");
      button.classList.toggle("active");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    const awardItems = document.querySelectorAll('#awardsColumn .award-item');
    const indicator = document.getElementById('award-indicator');
    const indicatorVideo = indicator ? indicator.querySelector('video') || document.createElement('video') : null;

    if (indicator && !indicator.querySelector('video')) {
      indicatorVideo.autoplay = true;
      indicatorVideo.muted = true;
      indicatorVideo.loop = true;
      indicatorVideo.playsInline = true;
      indicatorVideo.style.width = "100%";
      indicatorVideo.style.height = "100%";
      indicatorVideo.style.objectFit = "cover";
      indicator.appendChild(indicatorVideo);
    }

    awardItems.forEach(item => {
      item.addEventListener('pointerdown', (e) => {
        item.classList.add('is-active');
        const iWidth = 150, iHeight = 266;
        let posX = e.clientX + 20;
        let posY = e.clientY - (iHeight / 2);
        if (posX + iWidth > window.innerWidth) posX = e.clientX - iWidth - 20;
        posY = Math.max(10, Math.min(posY, window.innerHeight - iHeight - 10));
        indicator.style.left = `${posX}px`;
        indicator.style.top = `${posY}px`;
        indicator.classList.add('show');

        const videoSrc = item.getAttribute('data-video');
        if (indicatorVideo.src !== videoSrc) {
          indicatorVideo.src = videoSrc;
          indicatorVideo.load();
          indicatorVideo.play().catch(() => {});
        }
      });

      const hide = () => {
        item.classList.remove('is-active');
        indicator.classList.remove('show');
        if (indicatorVideo) indicatorVideo.pause();
      };
      item.addEventListener('pointerup', hide);
      item.addEventListener('pointerleave', hide);
      item.addEventListener('pointercancel', hide);
    });
  })();

} else {
  /**
   * 3. DESKTOP SPECIFIC SCRIPT
   */
  (function () {
    const videoInner = document.getElementById("videoInner");
    const cornerText = document.getElementById("cornerText");
    const topBar = document.querySelector(".top-bar");
    const scrollText = document.getElementById("scrollText");
    const scrollVideos = document.querySelectorAll(".scroll-video");
    const aboutSection = document.getElementById("aboutSection");
    const downArrow = document.getElementById("downArrow");
    const desktopAwards = document.querySelectorAll(".about-section .award-item");
    const desktopIndicator = document.getElementById("desktop-award-indicator");

    let desktopVideo = document.createElement("video");
    desktopVideo.autoplay = true;
    desktopVideo.muted = true;
    desktopVideo.loop = true;
    desktopVideo.playsInline = true;
    if (desktopIndicator) desktopIndicator.appendChild(desktopVideo);

    const maxScroll = 2000;
    const motionDelay = 500;
    const textScrollRange = 3200;
    const totalScroll = maxScroll + motionDelay + textScrollRange;
    let scrollProgress = 0;
    let currentAboutOpacity = 0;

    // Video Initialization
    scrollVideos.forEach(vid => {
      vid.dataset.scale = (0.8 + Math.random() * 0.7).toFixed(2);
      vid.addEventListener("loadedmetadata", () => {
        vid.currentTime = 0.1; 
        vid.pause();
      });

      const projectTitle = vid.getAttribute('data-desc') || "PROJECT";

      vid.addEventListener("mouseenter", () => {
        cursor.classList.add("video-hover");
        if (cursorDesc) cursorDesc.textContent = projectTitle;
        cursorLabel.textContent = vid.paused ? "Play" : "Stop";
      });

      vid.addEventListener("mouseleave", () => {
        cursor.classList.remove("video-hover");
        cursorLabel.textContent = "";
        if (cursorDesc) cursorDesc.textContent = "";
      });

      vid.addEventListener("click", () => {
        if (vid.paused) {
          scrollVideos.forEach(v => { v.pause(); v.muted = true; });
          vid.muted = false;
          vid.play();
          cursorLabel.textContent = "Stop";
        } else {
          vid.pause();
          cursorLabel.textContent = "Play";
        }
      });
    });

    // Award Hover Logic
    desktopAwards.forEach(item => {
      item.addEventListener("mouseenter", (e) => {
        if (currentAboutOpacity < 0.5) return;
        const rect = item.getBoundingClientRect();
        let y = rect.top + rect.height / 2 - 210;
        y = Math.max(10, Math.min(y, window.innerHeight - 430));
        desktopIndicator.style.top = `${y}px`;
        desktopIndicator.style.left = `${e.clientX + 100}px`;
        desktopIndicator.classList.add("show");

        const videoSrc = item.getAttribute('data-video');
        if (desktopVideo.src.indexOf(videoSrc) === -1) {
          desktopVideo.src = videoSrc;
          desktopVideo.play();
        }
      });
      item.addEventListener("mouseleave", () => {
        desktopIndicator.classList.remove("show");
      });
    });

    // Main Scroll Engine
    window.addEventListener("wheel", e => {
      scrollProgress = Math.max(0, Math.min(scrollProgress + e.deltaY, totalScroll));

      // About Section Opacity
      const aInS = maxScroll - 400, aInE = maxScroll;
      const aOutS = maxScroll + motionDelay - 200, aOutE = maxScroll + motionDelay;

      if (scrollProgress < aInS) currentAboutOpacity = 0;
      else if (scrollProgress <= aInE) currentAboutOpacity = (scrollProgress - aInS) / (aInE - aInS);
      else if (scrollProgress < aOutS) currentAboutOpacity = 1;
      else if (scrollProgress <= aOutE) currentAboutOpacity = 1 - (scrollProgress - aOutS) / (aOutE - aOutS);
      else currentAboutOpacity = 0;

      aboutSection.style.opacity = currentAboutOpacity;
      aboutSection.style.pointerEvents = currentAboutOpacity > 0.5 ? "auto" : "none";
      if (downArrow) downArrow.style.opacity = currentAboutOpacity;

      // Main Video Transform
      const vProg = Math.min(scrollProgress, maxScroll) / maxScroll;
      let s = 1, y = 0;
      if (vProg <= 0.5) s = 1 + (vProg / 0.5) * 2.5;
      else { s = 3.5; y = -window.innerHeight * 2 * ((vProg - 0.5) * 2); }
      videoInner.style.transform = `translateY(${y}px) scale(${s})`;

      // Header Scale
      const barProg = Math.min(scrollProgress / maxScroll, 1);
      topBar.style.setProperty("--bar-height", `${160 - barProg * 20}px`);
      cornerText.style.setProperty("--text-scale", Math.max(0.2, 1 - barProg * 1.2));

      // Horizontal Scrolling Text
      const tStart = maxScroll + motionDelay;
      let tProg = Math.max(0, (scrollProgress - tStart) / textScrollRange);
      const startX = window.innerWidth;
      const endX = -scrollText.offsetWidth - 500;
      scrollText.style.transform = `translateX(${startX + (endX - startX) * tProg}px) translateY(-50%)`;

      // 5. Emerging Scroll Videos & Sticky Description Logic
      const step = 1 / scrollVideos.length;
      let bestFocusVideo = null;
      let minDistance = Infinity;
      const screenCenter = window.innerHeight / 2;

      scrollVideos.forEach((vid, i) => {
        let vP = Math.min(Math.max((tProg - i * step) / step, 0), 1);
        const startY = window.innerHeight + 150;
        const endY = -window.innerHeight - 350;
        const curY = startY + (endY - startY) * vP;
        
        const vidScale = vid.dataset.scale || 1;
        vid.style.transform = `translateX(-50%) translateY(${curY}px) scale(${vidScale})`;

        // Detection: Find which video is closest to the vertical center
        const distFromCenter = Math.abs(curY - screenCenter);
        if (distFromCenter < minDistance) {
          minDistance = distFromCenter;
          bestFocusVideo = vid;
        }
      });

      // Show title if we are in the video section and a video is relatively central
      if (tProg > 0.01 && tProg < 0.99 && minDistance < window.innerHeight * 0.45) {
        const newTitle = bestFocusVideo.getAttribute('data-desc');
        if (projectTitleOverlay.textContent !== newTitle) {
          projectTitleOverlay.textContent = newTitle;
        }
        projectTitleOverlay.classList.add("show");
      } else {
        projectTitleOverlay.classList.remove("show");
      }
      
    }, { passive: true });
  })();
}

window.addEventListener("resize", () => {
  location.reload();
});