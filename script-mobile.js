function isMobile() {
  return window.innerWidth <= 768;
}

if (!isMobile()) {
  console.log("Mobile script disabled (desktop mode)");
   const cursor = document.getElementById("cursor");

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
} else {

  (function () {

    
console.log("Mobile script loaded");
  const mobileWrapper = document.getElementById("mobileVideosWrapper");
  const VIDEO_SRC = "reel.mp4"; // now safely scoped
  const VIDEO_COUNT = 3;

  const offsets = [0, 550, 1000];

  for (let i = 0; i < VIDEO_COUNT; i++) {
    const vid = document.createElement("video");
    vid.src = VIDEO_SRC;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.preload = "auto";
    vid.style.width = "100%";
    vid.style.height = "100%";
    vid.style.objectFit = "cover";

    mobileWrapper.appendChild(vid);

    vid.addEventListener("loadedmetadata", () => {
      vid.pause();
      setTimeout(() => {
        vid.play().catch(() => {});
      }, offsets[i]);
    });
  }

  //   const mobileVideosWrapper = document.getElementById("mobileVideosWrapper");

  // window.addEventListener("scroll", () => {
  //   const scrollY = window.scrollY;
  //   const windowH = window.innerHeight;

  //   let progress = Math.min(scrollY / windowH, 1);

  //   // Slide videos up
  //   mobileVideosWrapper.style.transform =
  //     `translateY(${-progress * 100}%)`;

const button = document.getElementById("infoToggle");

button.addEventListener("click", () => {
  button.classList.toggle("active");
  document.body.classList.toggle("info-open");
});


})();
}
window.addEventListener("resize", () => {
  location.reload();
});



const awardItems = document.querySelectorAll('.award-item');
const indicator = document.getElementById('award-indicator');

// Create video element inside the indicator
let indicatorVideo = document.createElement('video');
indicatorVideo.autoplay = true;
indicatorVideo.muted = true;
indicatorVideo.loop = true;
indicatorVideo.playsInline = true;
indicatorVideo.style.width = "100%";
indicatorVideo.style.height = "100%";
indicatorVideo.style.objectFit = "cover";
indicator.appendChild(indicatorVideo);

awardItems.forEach(item => {
  item.addEventListener('pointerdown', (e) => {
    // 1. Highlight clicked award
    item.classList.add('is-active');

    // 2. Position indicator near finger/cursor
    const indicatorWidth = indicator.offsetWidth;
    const indicatorHeight = indicator.offsetHeight;
    
    // Offset the indicator so it doesn't appear directly under the finger (blocking visibility)
    let posX = e.clientX + 20; 
    let posY = e.clientY - (indicatorHeight / 2);

    // 3. Clamping (Keep inside screen bounds)
    const padding = 10;
    // Right edge check
    if (posX + indicatorWidth > window.innerWidth - padding) {
      posX = e.clientX - indicatorWidth - 20; // Flip to left side if no room on right
    }
    // Top/Bottom edge check
    posY = Math.max(padding, Math.min(posY, window.innerHeight - indicatorHeight - padding));

    indicator.style.left = `${posX}px`;
    indicator.style.top = `${posY}px`;
    indicator.style.transform = `scale(1)`;
    indicator.classList.add('show');

    // 4. Change video
    const videoSrc = item.getAttribute('data-video');
    if (indicatorVideo.src !== videoSrc) {
      indicatorVideo.src = videoSrc;
      indicatorVideo.load();
      indicatorVideo.play().catch(() => {});
    }
  });

  const hideIndicator = () => {
    item.classList.remove('is-active');
    indicator.classList.remove('show');
    indicatorVideo.pause();
  };

  item.addEventListener('pointerup', hideIndicator);
  item.addEventListener('pointerleave', hideIndicator);
  // Important for mobile to prevent stuck indicators
  item.addEventListener('pointercancel', hideIndicator); 
});