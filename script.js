(function () {
  // --- DOM Elements ---
  const videoInner = document.getElementById("videoInner");
  const cornerText = document.getElementById("cornerText");
  const topBar = document.querySelector(".top-bar");
  const scrollText1 = document.getElementById("scrollText1"); // MOTION DESIGN
  const scrollText2 = document.getElementById("scrollText2"); // BRANDING
  const scrollVideosMotion = Array.from(document.querySelectorAll(".scroll-video.motion"));
  const scrollVideosBranding = Array.from(document.querySelectorAll(".scroll-video.branding"));
  const aboutSection = document.getElementById("aboutSection");
  const downArrow = document.getElementById("downArrow");
  const desktopAwards = document.querySelectorAll(".about-section .award-item");
  const desktopIndicator = document.getElementById("desktop-award-indicator");
  const projectTitleOverlay = document.getElementById("activeProjectTitle");
  const cursor = document.getElementById("cursor");
  const cursorLabel = document.getElementById("cursorLabel");
  const cursorDesc = document.getElementById("cursorDesc");
  const videoControlButton = document.getElementById("videoControlButton");

  projectTitleOverlay.textContent = "";
  projectTitleOverlay.classList.remove("show");

  // --- Desktop Award Video ---
  let desktopVideo = document.createElement("video");
  desktopVideo.autoplay = true;
  desktopVideo.muted = true;
  desktopVideo.loop = true;
  desktopVideo.playsInline = true;
  if (desktopIndicator) desktopIndicator.appendChild(desktopVideo);

  // --- Scroll Parameters ---
  const maxScroll = 2000;
  const motionDelay = 500;
  const motionTextRange = 3200;
  const brandingTextRange = 3200;
  const totalScroll = maxScroll + motionDelay + motionTextRange + brandingTextRange;

  let scrollProgress = 0;
  let currentAboutOpacity = 0;
  let mouseX = 0;
  let mouseY = 0;
  let currentActiveVideo = null;

  // Button click handler
  videoControlButton.addEventListener("click", () => {
    if (currentActiveVideo) {
      const url = currentActiveVideo.dataset.behance;
      if (url) {
        window.open(url, "_blank");
      }
    }
  });

  const updateButtonText = () => {
    if (videoControlButton.classList.contains("show")) {
      videoControlButton.textContent = "details";
    }
  };

  // Keep the overlay button label static for the active project
  [...scrollVideosMotion, ...scrollVideosBranding].forEach((vid) => {
    vid.addEventListener("play", updateButtonText);
    vid.addEventListener("pause", updateButtonText);
  });

  // --- Track Mouse Position ---
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Move custom cursor
    const halfW = cursor.offsetWidth / 2;
    const halfH = cursor.offsetHeight / 2;
    cursor.style.left = `${mouseX - halfW}px`;
    cursor.style.top = `${mouseY - halfH}px`;

    // Overlay follows cursor continuously
    if (projectTitleOverlay.classList.contains("show")) {
      const offset = cursor.classList.contains("video-hover") ? 40 : 20;
      projectTitleOverlay.style.left = `${mouseX + offset}px`;
      projectTitleOverlay.style.top = `${mouseY + offset}px`;
    }
  });

  // --- Initialize Videos ---
  const initVideos = (videos) => {

    videos.forEach((vid) => {
      // USUNIĘTO Math.random() -> teraz każdy film startuje z tą samą bazową skalą
      vid.dataset.scale = "1.0"; 
      
      vid.addEventListener("loadedmetadata", () => {
        vid.currentTime = 0.1;
        vid.pause();
      });

      const projectTitle = vid.getAttribute("data-desc") || "PROJECT";

      vid.addEventListener("mouseenter", () => {
        cursor.classList.add("video-hover");
        cursorLabel.textContent = vid.paused ? "Play" : "Stop";
        cursorDesc.textContent = projectTitle;
      });

      vid.addEventListener("mouseleave", () => {
        cursor.classList.remove("video-hover");
        cursorLabel.textContent = "";
        cursorDesc.textContent = "";
      });

vid.addEventListener("click", () => {
  // Pause all other videos
  [...scrollVideosMotion, ...scrollVideosBranding].forEach((v) => {
    if (v !== vid) {
      v.pause();
      v.muted = true;
      v.dataset.playing = "false";
    }
  });

  // Toggle clicked video manually
  const isPlaying = vid.dataset.playing === "true";

  if (!isPlaying) {
    vid.muted = false;
    vid.play();
    vid.dataset.playing = "true";
    cursorLabel.textContent = "Stop";
  } else {
    vid.pause();
    vid.dataset.playing = "false";
    cursorLabel.textContent = "Play";
  }
});
    });
  };

  initVideos(scrollVideosMotion);
  initVideos(scrollVideosBranding);

  // --- Award Hover Logic ---
  desktopAwards.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      if (currentAboutOpacity < 0.5) return;
      const rect = item.getBoundingClientRect();
      let y = rect.top + rect.height / 2 - 210;
      y = Math.max(10, Math.min(y, window.innerHeight - 430));

      const indicatorWidth = desktopIndicator.offsetWidth || 240;
      const xOffset = 100;
      let x = e.clientX + xOffset;
      if (x + indicatorWidth > window.innerWidth - 10) {
        x = e.clientX - indicatorWidth - xOffset;
      }
      if (x < 10) {
        x = 10;
      }

      desktopIndicator.style.top = `${y}px`;
      desktopIndicator.style.left = `${x}px`;
      desktopIndicator.classList.add("show");

      const videoSrc = item.getAttribute("data-video");
      if (desktopVideo.src.indexOf(videoSrc) === -1) {
        desktopVideo.src = videoSrc;
        desktopVideo.play();
      }
    });
    item.addEventListener("mouseleave", () => {
      desktopIndicator.classList.remove("show");
    });
  });

  // --- Move Videos Helper ---
// --- Move Videos Helper ---
  const moveVideos = (videos, prog) => {
    const step = 1 / videos.length;
    let bestVideo = null;
    let minDistance = Infinity;

    videos.forEach((vid, i) => {
      let vP = Math.min(Math.max((prog - i * step) / step, 0), 1);

      const centerY = window.innerHeight * 0.25; 
      const startY = window.innerHeight + 100; 
      const endY = -window.innerHeight - 100;  
      
      let curY;
      let centerBoost = 0; 

      // --- SILNIK SNAPPINGU + SKALOWANIE ---
      if (vP < 0.35) {
        const localProg = vP / 0.35;
        curY = startY + (centerY - startY) * localProg;
        centerBoost = localProg * 0.5; // Płynne rośnięcie do +0.5
      } else if (vP <= 0.65) {
        curY = centerY;
        centerBoost = 0.5;             // Maksymalny rozmiar na środku (+0.5)
      } else {
        const localProg = (vP - 0.65) / 0.35;
        curY = centerY + (endY - centerY) * localProg;
        centerBoost = (1 - localProg) * 0.5; // Płynne zmniejszanie z powrotem do bazy
      }

      // Teraz baseScale to zawsze będzie 1.0
      const baseScale = parseFloat(vid.dataset.scale) || 1;
      
      // Wynikowa skala: na dole/górze to 1.0, na samym środku to dokładnie 1.5
      const scale = baseScale + centerBoost; 

      vid.style.transform = `translateX(-50%) translateY(${curY}px) scale(${scale})`;

      const dist = Math.abs(curY - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        bestVideo = vid;
      }
    });

    return { bestVideo, minDistance };
  };
  // --- Scroll Engine ---
  window.addEventListener(
    "wheel",
    (e) => {
      scrollProgress = Math.max(0, Math.min(scrollProgress + e.deltaY, totalScroll));

      // About Section Opacity
      const aInS = maxScroll - 400,
        aInE = maxScroll;
      const aOutS = maxScroll + motionDelay - 200,
        aOutE = maxScroll + motionDelay;

      if (scrollProgress < aInS) currentAboutOpacity = 0;
      else if (scrollProgress <= aInE)
        currentAboutOpacity = (scrollProgress - aInS) / (aInE - aInS);
      else if (scrollProgress < aOutS) currentAboutOpacity = 1;
      else if (scrollProgress <= aOutE)
        currentAboutOpacity = 1 - (scrollProgress - aOutS) / (aOutE - aOutS);
      else currentAboutOpacity = 0;

      aboutSection.style.opacity = currentAboutOpacity;
      aboutSection.style.pointerEvents = currentAboutOpacity > 0.5 ? "auto" : "none";
      if (downArrow) downArrow.style.opacity = currentAboutOpacity;

      // Main Video Transform
      const vProg = Math.min(scrollProgress, maxScroll) / maxScroll;
      let s = 1,
        y = 0;
      if (vProg <= 0.5) s = 1 + (vProg / 0.5) * 2.5;
      else {
        s = 3.5;
        y = -window.innerHeight * 2 * ((vProg - 0.5) * 2);
      }
      videoInner.style.transform = `translateY(${y}px) scale(${s})`;

      // Header Scaling
      const barProg = Math.min(scrollProgress / maxScroll, 1);
      topBar.style.setProperty("--bar-height", `${160 - barProg * 20}px`);
      cornerText.style.setProperty("--text-scale", Math.max(0.2, 1 - barProg * 1.2));

      // Scroll Text
      const motionTextStart = maxScroll + motionDelay;
      const motionTextProg = Math.max(0, (scrollProgress - motionTextStart) / motionTextRange);
      const brandingTextStart = motionTextStart + motionTextRange;
      const brandingTextProg = Math.max(0, (scrollProgress - brandingTextStart) / brandingTextRange);

      if (scrollText1) {
        const startX = window.innerWidth;
        const endX = -scrollText1.offsetWidth - 500;
        scrollText1.style.transform = `translateX(${startX + (endX - startX) * motionTextProg}px) translateY(-50%)`;
      }
    if (scrollText2) {
    const startX = window.innerWidth; // off-screen right
    const endX = -scrollText2.offsetWidth - 50; // off-screen left
    const progClamped = Math.min(Math.max(brandingTextProg, 0), 1);
    scrollText2.style.transform = `translateX(${startX + (endX - startX) * progClamped}px) translateY(-50%)`;
}
      const cooperationMessage = document.getElementById("cooperationMessage");

// Show message when branding is scrolled out
if (brandingTextProg >= 1) {
  // Calculate if last branding video is fully out of view
  const lastBrandingVideo = scrollVideosBranding[scrollVideosBranding.length - 1];
  const lastVideoRect = lastBrandingVideo.getBoundingClientRect();

  if (lastVideoRect.bottom < 0) {
    cooperationMessage.classList.add("show");
  } else {
    cooperationMessage.classList.remove("show");
  }
} else {
  cooperationMessage.classList.remove("show");
}

      // --- Motion Overlay ---
      const fadeDistance = window.innerHeight * 0.45;

      const motionFocus = moveVideos(scrollVideosMotion, motionTextProg);
      if (motionFocus.bestVideo && motionTextProg > 0) {
        if (motionFocus.minDistance < fadeDistance) {
          const newTitle = motionFocus.bestVideo.getAttribute("data-desc") || "";
          if (projectTitleOverlay.textContent !== newTitle) projectTitleOverlay.textContent = newTitle;
          projectTitleOverlay.classList.add("show");
          projectTitleOverlay.style.left = `${mouseX + 40}px`;
          projectTitleOverlay.style.top = `${mouseY + 20}px`;

          // Show button and set active video
          currentActiveVideo = motionFocus.bestVideo;
          const currentLink = currentActiveVideo.dataset.behance;
          if (currentLink) {
            videoControlButton.textContent = "details";
            videoControlButton.classList.add("show");
          } else {
            videoControlButton.classList.remove("show");
          }
        } else {
          projectTitleOverlay.classList.remove("show");
          videoControlButton.classList.remove("show");
          currentActiveVideo = null;
        }
      }

      // --- Branding Overlay ---
// --- Branding Overlay ---
      // WYCIĄGAMY ruch wideo przed warunek IF, żeby pozycja aktualizowała się ZAWSZE:
      const brandingFocus = moveVideos(scrollVideosBranding, brandingTextProg);

      if (motionTextProg >= 1) {
        if (brandingFocus.bestVideo) {
          if (brandingFocus.minDistance < fadeDistance) {
            const newTitle = brandingFocus.bestVideo.getAttribute("data-desc") || "";
            if (projectTitleOverlay.textContent !== newTitle) projectTitleOverlay.textContent = newTitle;
            projectTitleOverlay.classList.add("show");
            projectTitleOverlay.style.left = `${mouseX + 40}px`;
            projectTitleOverlay.style.top = `${mouseY + 20}px`;

            // Show button and set active video
            currentActiveVideo = brandingFocus.bestVideo;
            const currentLink = currentActiveVideo.dataset.behance;
            if (currentLink) {
              videoControlButton.textContent = "details";
              videoControlButton.classList.add("show");
            } else {
              videoControlButton.classList.remove("show");
            }
          } else {
            projectTitleOverlay.classList.remove("show");
            videoControlButton.classList.remove("show");
            currentActiveVideo = null;
          }
        } else {
          // No branding videos active, hide overlay and button
          projectTitleOverlay.classList.remove("show");
          videoControlButton.classList.remove("show");
          currentActiveVideo = null;
        }
      }
    },
    { passive: true }
  );
})();