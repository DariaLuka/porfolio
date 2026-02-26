function isMobile() {
  return window.innerWidth <= 768;
}

if (isMobile()) {
  console.log("Desktop script disabled (mobile mode)");
} else {

  // ========================
  // ===== DOM ELEMENTS =====
  // ========================
  const videoInner = document.getElementById("videoInner");
  const cornerText = document.getElementById("cornerText");
  const topBar = document.querySelector(".top-bar");
  const scrollText = document.getElementById("scrollText");
  const cursor = document.getElementById("cursor");
  const scrollVideos = document.querySelectorAll(".scroll-video");
  const aboutSection = document.getElementById("aboutSection");
  const downArrow = document.getElementById("downArrow");

  const desktopAwards = document.querySelectorAll(".about-section .award-item");
  const desktopIndicator = document.getElementById("desktop-award-indicator");

  // ========================
  // ===== SETTINGS =========
  // ========================
  const minVideoScale = 1.0;
  const maxVideoScale = 3.5;
  const moveUpDistance = window.innerHeight * 2;

  const maxBarHeight = 160;
  const minBarHeight = 120;

  const maxTextScale = 1;
  const minTextScale = 0.2;

  const maxScroll = 2000;
  const motionDelay = 500;
  const textScrollRange = 3200;
  const totalScroll = maxScroll + motionDelay + textScrollRange;

  let scrollProgress = 0;
  // We track this globally so the Hover events can see it
  let currentAboutOpacity = 0; 

  // ========================
  // ===== DESKTOP AWARDS ===
  // ========================
  let desktopVideo = document.createElement("video");
  desktopVideo.autoplay = true;
  desktopVideo.muted = true;
  desktopVideo.loop = true;
  desktopVideo.playsInline = true;
  if(desktopIndicator) desktopIndicator.appendChild(desktopVideo);

  desktopAwards.forEach(item => {
    item.addEventListener("mouseenter", (e) => {
      // --- NEW CHECK ---
      // Only trigger if the section is mostly visible (opacity > 0.5)
      if (currentAboutOpacity < 0.5) return;

      const rect = item.getBoundingClientRect();
      let y = rect.top + rect.height / 2 - desktopIndicator.offsetHeight / 2;
      y = Math.max(0, Math.min(y, window.innerHeight - desktopIndicator.offsetHeight));
      desktopIndicator.style.top = `${y}px`;

      const offsetX = 150;
      desktopIndicator.style.left = `${e.clientX + offsetX}px`;
      desktopIndicator.classList.add("show");

      const videoSrc = item.getAttribute("data-video");
      if (desktopVideo.src !== videoSrc) {
        desktopVideo.src = videoSrc;
        desktopVideo.load();
        desktopVideo.play().catch(() => {});
      }
    });

    item.addEventListener("mouseleave", () => {
      desktopIndicator.classList.remove("show");
      desktopVideo.pause();
    });
  });

  // ========================
  // ===== SCROLL VIDEOS =====
  // ========================
  scrollVideos.forEach(vid => {
    const randomScale = 0.8 + Math.random() * (1.5 - 0.8);
    vid.dataset.scale = randomScale.toFixed(2);
    vid.addEventListener("loadedmetadata", () => { vid.currentTime = 1; vid.pause(); });
    vid.addEventListener("click", e => {
      e.stopPropagation();
      if (vid.paused) {
        scrollVideos.forEach(v => v !== vid && v.pause());
        vid.muted = false;
        vid.play();
      } else { vid.pause(); }
    });
  });

  // ========================
  // ======= SCROLL EVENT ===
  // ========================
  window.addEventListener("wheel", e => {
    scrollProgress += e.deltaY;
    scrollProgress = Math.max(0, Math.min(scrollProgress, totalScroll));

    const globalProgress = scrollProgress / maxScroll; 

    // ------------------------
    // --- About Section Logic
    // ------------------------
    const aboutFadeInStart  = maxScroll - 400; 
    const aboutFadeInEnd    = maxScroll; 
    const aboutFadeOutStart = maxScroll + motionDelay - 200; 
    const aboutFadeOutEnd   = maxScroll + motionDelay; 

    if (scrollProgress < aboutFadeInStart) {
      currentAboutOpacity = 0;
    } else if (scrollProgress <= aboutFadeInEnd) {
      currentAboutOpacity = (scrollProgress - aboutFadeInStart) / (aboutFadeInEnd - aboutFadeInStart);
    } else if (scrollProgress < aboutFadeOutStart) {
      currentAboutOpacity = 1;
    } else if (scrollProgress <= aboutFadeOutEnd) {
      currentAboutOpacity = 1 - ((scrollProgress - aboutFadeOutStart) / (aboutFadeOutEnd - aboutFadeOutStart));
    } else {
      currentAboutOpacity = 0;
    }

    aboutSection.style.opacity = currentAboutOpacity;
    // pointer-events: none ensures clicks/hovers don't bleed through when invisible
    aboutSection.style.pointerEvents = currentAboutOpacity > 0.5 ? "auto" : "none";
    if (downArrow) downArrow.style.opacity = currentAboutOpacity;

    // ------------------------
    // --- Main Video Transform
    // ------------------------
    const videoProgress = Math.min(scrollProgress, maxScroll) / maxScroll;
    let currentScale, currentYMove;

    if (videoProgress <= 0.5) {
      const scaleProg = videoProgress / 0.5;
      currentScale = minVideoScale + scaleProg * (maxVideoScale - minVideoScale);
      currentYMove = 0;
    } else {
      const moveProg = (videoProgress - 0.5) * 2;
      currentScale = maxVideoScale;
      currentYMove = -moveUpDistance * moveProg;
    }
    videoInner.style.transform = `translateY(${currentYMove}px) scale(${currentScale})`;

    // ------------------------
    // --- Top Bar & Corner Text
    // ------------------------
    const barProgress = Math.min(globalProgress, 1);
    const barHeight = maxBarHeight - barProgress * (maxBarHeight - minBarHeight) * 0.5;
    topBar.style.setProperty("--bar-height", `${barHeight}px`);

    const textScale = Math.max(minTextScale, maxTextScale - barProgress * (maxTextScale - minTextScale) * 1.5);
    cornerText.style.setProperty("--text-scale", textScale);

    // ------------------------
    // --- Motion Design Text
    // ------------------------
    const textStartPos = maxScroll + motionDelay;
    const textEndPos = textStartPos + textScrollRange;
    let textProgress = Math.max(0, (scrollProgress - textStartPos) / (textEndPos - textStartPos));

    const startX = window.innerWidth;
    const endX = -scrollText.offsetWidth - 200; 
    scrollText.style.transform = `translateX(${startX + (endX - startX) * textProgress}px) translateY(-50%)`;

    // ------------------------
    // --- Scroll Videos
    // ------------------------
    const step = 1 / scrollVideos.length;
    scrollVideos.forEach((vid, i) => {
      let vProg = Math.min(Math.max((textProgress - i * step) / step, 0), 1); 
      const startY = window.innerHeight + 150;
      const endY = -window.innerHeight - 200; 
      const currentY = startY + (endY - startY) * vProg;
      const vidScale = parseFloat(vid.dataset.scale);
      vid.style.transform = `translateX(-50%) translateY(${currentY}px) scale(${vidScale})`;

      const videoHeight = vid.offsetHeight * vidScale;
      const isVisible = (currentY + videoHeight / 2 > 0) && (currentY - videoHeight / 2 < window.innerHeight);
      if (!isVisible && !vid.paused) {
        vid.pause();
        vid.currentTime = 1;
        vid.muted = true;
      }
    });
  }, { passive: true });
}