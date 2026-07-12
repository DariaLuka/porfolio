(function () {
  // --- DOM Elements ---
  const videoInner = document.getElementById("videoInner");
  const cornerText = document.getElementById("cornerText");
  const topBar = document.querySelector(".top-bar");
  const scrollText1 = document.getElementById("scrollText1"); // MOTION DESIGN
  const scrollText2 = document.getElementById("scrollText2"); // BRANDING
  const scrollVideosMotion = Array.from(document.querySelectorAll(".scroll-video.motion"));
  const scrollVideosBranding = Array.from(document.querySelectorAll(".scroll-video.branding"));
  const creativeCarousel = document.getElementById("creativeCarousel");
  const creativeTrack = document.getElementById("creativeTrack");
  const ccTitle = document.getElementById("ccTitle");

  // Duplicate the works so the auto-scrolling strip can loop seamlessly: clone
  // whole sets until the track is comfortably wider than the viewport, so there
  // is always content covering the screen at the wrap point. Done now, before
  // the inline IntersectionObserver in index.html runs, so the clones get
  // picked up and autoplay/pause with the originals.
  let creativeOrigCount = 0;
  let creativeSetWidth = 0;
  if (creativeTrack) {
    const originals = Array.from(creativeTrack.querySelectorAll(".creative-item"));
    creativeOrigCount = originals.length;
    const cloneSet = () => originals.forEach((v) => creativeTrack.appendChild(v.cloneNode(true)));
    cloneSet();
    let guard = 0;
    while (creativeTrack.scrollWidth < window.innerWidth * 2.5 && guard < 8) {
      cloneSet();
      guard++;
    }
  }
  // One set's exact repeat width = distance from item 0 to the first cloned item
  // (accounts for the flex gap; using scrollWidth/2 would include padding and
  // cause a tiny jump at the wrap). Recomputed on resize.
  const computeCreativeSetWidth = () => {
    if (creativeTrack && creativeTrack.children.length > creativeOrigCount) {
      creativeSetWidth =
        creativeTrack.children[creativeOrigCount].offsetLeft -
        creativeTrack.children[0].offsetLeft;
    }
  };
  computeCreativeSetWidth();
  window.addEventListener("resize", computeCreativeSetWidth);

  const creativeItems = Array.from(document.querySelectorAll(".creative-item"));
  const aboutSection = document.getElementById("aboutSection");
  const downArrow = document.getElementById("downArrow");
  const desktopAwards = document.querySelectorAll(".about-section .award-item");
  const desktopIndicator = document.getElementById("desktop-award-indicator");
  const projectTitleOverlay = document.getElementById("activeProjectTitle");
  const cursor = document.getElementById("cursor");
  const cursorLabel = document.getElementById("cursorLabel");
  const cursorDesc = document.getElementById("cursorDesc");
  const videoControlButton = document.getElementById("videoControlButton");
  const cooperationMessage = document.getElementById("cooperationMessage");

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
  const creativeTextRange = 1600; // CREATIVE CODING: shorter -> less scrolling to cross the whole strip
  const totalScroll =
    maxScroll + motionDelay + motionTextRange + brandingTextRange + creativeTextRange;

  // scrollProgress = smoothed/rendered value, recalculated every animation frame.
  // scrollTarget   = raw destination, nudged instantly by wheel/trackpad input.
  // Easing the gap between them each frame turns choppy, uneven wheel deltas
  // into fluid, weighted motion (the same lerp technique used by smooth-scroll
  // libraries like Lenis), instead of redrawing the whole scene on every event.
  let scrollProgress = 0;
  let scrollTarget = 0;
  let rafId = null;

  const SCROLL_EASE = 0.09; // lower = smoother/heavier, higher = snappier
  const SCROLL_SETTLE_EPSILON = 0.05;

  // Cubic ease-in-out for per-stage motion (video snap-in/out, main zoom) so
  // transitions accelerate/decelerate instead of moving at a constant rate.
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
  [...scrollVideosMotion, ...scrollVideosBranding, ...creativeItems].forEach((vid) => {
    vid.addEventListener("play", updateButtonText);
    vid.addEventListener("pause", updateButtonText);
  });

  // --- Track Mouse Position ---
  // Cursor position itself is rendered with a light lerp (see animateCursor
  // below) so the custom cursor glides rather than snapping frame to frame —
  // a small, tasteful touch that reads as more premium/modern.
  let cursorRenderX = 0;
  let cursorRenderY = 0;
  let cursorInitialized = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cursorInitialized) {
      cursorRenderX = mouseX;
      cursorRenderY = mouseY;
      cursorInitialized = true;
    }

    // Overlay follows cursor continuously
    if (projectTitleOverlay.classList.contains("show")) {
      const offset = cursor.classList.contains("video-hover") ? 40 : 20;
      projectTitleOverlay.style.left = `${mouseX + offset}px`;
      projectTitleOverlay.style.top = `${mouseY + offset}px`;
    }
  });

  const CURSOR_EASE = 0.22; // subtle — stays responsive, just loses the snap

  const animateCursor = () => {
    cursorRenderX += (mouseX - cursorRenderX) * CURSOR_EASE;
    cursorRenderY += (mouseY - cursorRenderY) * CURSOR_EASE;

    const halfW = cursor.offsetWidth / 2;
    const halfH = cursor.offsetHeight / 2;
    cursor.style.left = `${cursorRenderX - halfW}px`;
    cursor.style.top = `${cursorRenderY - halfH}px`;

    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

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
  [...scrollVideosMotion, ...scrollVideosBranding, ...creativeItems].forEach((v) => {
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
  initVideos(creativeItems);

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
      // Eased (not linear) so each video accelerates in and decelerates into
      // place instead of moving at a constant speed — reads as smoother/snappier.
      if (vP < 0.35) {
        const localProg = easeInOutCubic(vP / 0.35);
        curY = startY + (centerY - startY) * localProg;
        centerBoost = localProg * 0.5; // Płynne rośnięcie do +0.5
      } else if (vP <= 0.65) {
        curY = centerY;
        centerBoost = 0.5;             // Maksymalny rozmiar na środku (+0.5)
      } else {
        const localProg = easeInOutCubic((vP - 0.65) / 0.35);
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

  // --- Creative-Coding auto-scrolling carousel ---
  // The video strip and the big "CREATIVE CODING" title both drift sideways on
  // their own, forever, independent of the wheel. Each is duplicated, so once
  // one set scrolls off we wrap by a single-set width for a seamless loop.
  // (The wheel instead drives the whole panel UP and out — see positionCreativePanel.)
  let ccAuto = 0;
  const CC_TRACK_SPEED = 0.55; // px/frame for the videos
  const CC_TITLE_SPEED = 0.9; // px/frame for the title (a touch faster = parallax)

  // Vertical entrance offsets (px) added on top of the auto-scroll so the title
  // and the videos can rise in from the BOTTOM at DIFFERENT times: the title
  // leads, and the videos only start rising once the title is on screen.
  // Updated by positionCreativePanel (on scroll); read by the auto-scroll loop.
  let ccTitleEnterY = window.innerHeight;
  let ccTrackEnterY = window.innerHeight;

  const autoScrollCreative = () => {
    ccAuto += 1;
    if (creativeTrack && creativeSetWidth > 0) {
      const autoX = -((ccAuto * CC_TRACK_SPEED) % creativeSetWidth);
      creativeTrack.style.transform = `translate(${autoX}px, calc(-50% + ${ccTrackEnterY}px))`;
    }
    if (ccTitle && ccTitle.children.length >= 2) {
      const setW = ccTitle.children[1].offsetLeft - ccTitle.children[0].offsetLeft;
      if (setW > 0) {
        const autoX = -((ccAuto * CC_TITLE_SPEED) % setW);
        ccTitle.style.transform = `translate(${autoX}px, calc(-50% + ${ccTitleEnterY}px))`;
      }
    }
    requestAnimationFrame(autoScrollCreative);
  };
  requestAnimationFrame(autoScrollCreative);

  // Wheel-driven choreography of the creative section:
  //   1. the "CREATIVE CODING" title rises in from the bottom first;
  //   2. once it is on screen, the video carousel rises in from the bottom too
  //      (a short lag behind the title);
  //   3. the section holds while the carousel auto-scrolls sideways;
  //   4. the whole panel slides UP and out as you keep scrolling (reveals coop).
  const positionCreativePanel = (prog) => {
    if (!creativeCarousel) return;
    const H = window.innerHeight;
    const p = Math.min(Math.max(prog, 0), 1);
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

    // title rises over [0, 0.15]; videos rise over [0.1, 0.32] (start once the
    // title is mostly on screen). 1 = off-screen below, 0 = fully in place.
    ccTitleEnterY = (1 - easeInOutCubic(clamp01(p / 0.15))) * H;
    ccTrackEnterY = (1 - easeInOutCubic(clamp01((p - 0.1) / 0.22))) * H;

    // exit: slide the whole panel up and out after the hold.
    let y = 0;
    if (p >= 0.5) y = -easeInOutCubic((p - 0.5) / 0.5) * H * 1.25;
    creativeCarousel.style.transform = `translateY(${y}px)`;
  };

  // --- Scroll Engine ---
  // Normalize wheel input across browsers/devices: deltaMode 0 is pixels
  // (most trackpads/modern mice), 1 is "lines" (some mouse wheels), 2 is
  // "pages". Without this, the same physical scroll gesture moves the scene
  // at wildly different speeds depending on the input device.
  const normalizeWheelDelta = (e) => {
    if (e.deltaMode === 1) return e.deltaY * 18;
    if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
    return e.deltaY;
  };

  const render = (scrollProgress) => {
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

      // Main Video Transform (eased zoom-in, then eased slide-out)
      const vProg = Math.min(scrollProgress, maxScroll) / maxScroll;
      let s = 1,
        y = 0;
      if (vProg <= 0.5) s = 1 + easeInOutCubic(vProg / 0.5) * 2.5;
      else {
        s = 3.5;
        y = -window.innerHeight * 2 * easeInOutCubic((vProg - 0.5) * 2);
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
      const creativeTextStart = brandingTextStart + brandingTextRange;
      const creativeTextProg = Math.max(0, (scrollProgress - creativeTextStart) / creativeTextRange);

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
// Creative-Coding: the carousel auto-scrolls sideways on its own; the wheel
// only drives the panel's vertical position (up & out) and the coop reveal.
positionCreativePanel(creativeTextProg);

// Reveal the coop message as the panel slides up and out of view.
if (creativeTextProg >= 0.62) {
  cooperationMessage.classList.add("show");
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

  };

  // --- Animation Loop ---
  // Runs only while the smoothed value hasn't caught up to the target, so the
  // page stays idle (no wasted frames) between scroll gestures.
  const tick = () => {
    const diff = scrollTarget - scrollProgress;

    if (Math.abs(diff) < SCROLL_SETTLE_EPSILON) {
      scrollProgress = scrollTarget;
      render(scrollProgress);
      rafId = null;
      return;
    }

    scrollProgress += diff * SCROLL_EASE;
    render(scrollProgress);
    rafId = requestAnimationFrame(tick);
  };

  const requestTick = () => {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  };

  window.addEventListener(
    "wheel",
    (e) => {
      const delta = normalizeWheelDelta(e);
      scrollTarget = Math.max(0, Math.min(scrollTarget + delta, totalScroll));
      requestTick();
    },
    { passive: true }
  );
})();