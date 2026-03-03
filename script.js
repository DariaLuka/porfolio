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
vid.dataset.scale = (1 + Math.random() * 0.7).toFixed(2);
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
      desktopIndicator.style.top = `${y}px`;
      desktopIndicator.style.left = `${e.clientX + 100}px`;
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
const moveVideos = (videos, prog) => {
  const step = 1 / videos.length;
  let bestVideo = null;
  let minDistance = Infinity;
  const screenCenter = window.innerHeight / 2;

  videos.forEach((vid, i) => {
    // Determine how far the video is into its scroll animation
    let vP = Math.min(Math.max((prog - i * step) / step, 0), 1);

    // Start Y position further below viewport so videos are hidden initially
    const startY = window.innerHeight + 500; // increased to push videos fully off-screen
    const endY = -window.innerHeight - 350;
    const curY = startY + (endY - startY) * vP;

    // Make videos slightly bigger overall, plus subtle growth as they scroll in
    const baseScale = parseFloat(vid.dataset.scale) || 1;
    const scale = baseScale + 0.2 * vP; // grows slightly as it moves up

    vid.style.transform = `translateX(-50%) translateY(${curY}px) scale(${scale})`;

    // Find the video closest to the vertical center of the screen
    const dist = Math.abs(curY - screenCenter);
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
        } else {
          projectTitleOverlay.classList.remove("show");
        }
      }

      // --- Branding Overlay ---
      if (motionTextProg >= 1) {
        const brandingFocus = moveVideos(scrollVideosBranding, brandingTextProg);
        if (brandingFocus.bestVideo) {
          if (brandingFocus.minDistance < fadeDistance) {
            const newTitle = brandingFocus.bestVideo.getAttribute("data-desc") || "";
            if (projectTitleOverlay.textContent !== newTitle) projectTitleOverlay.textContent = newTitle;
            projectTitleOverlay.classList.add("show");
            projectTitleOverlay.style.left = `${mouseX + 40}px`;
            projectTitleOverlay.style.top = `${mouseY + 20}px`;
          } else {
            projectTitleOverlay.classList.remove("show");
          }
        }
      }
    },
    { passive: true }
  );
})();