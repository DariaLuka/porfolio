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
  item.addEventListener('pointerdown', () => {
    // Highlight clicked award
    item.classList.add('is-active');

    // Position indicator
    const rect = item.getBoundingClientRect();
    let verticalCenter = rect.top + (rect.height / 2) - (indicator.offsetHeight / 2);

    // Clamp so indicator stays inside viewport
    const minY = 0; // top limit
    const maxY = window.innerHeight - indicator.offsetHeight; // bottom limit
    verticalCenter = Math.max(minY, Math.min(verticalCenter, maxY));

    indicator.style.transform = `translateY(${verticalCenter}px) scale(1)`;
    indicator.classList.add('show');

    // Change video
    const videoSrc = item.getAttribute('data-video');
    if (indicatorVideo.src !== videoSrc) {
      indicatorVideo.src = videoSrc;
      indicatorVideo.load();
      indicatorVideo.play().catch(() => {});
    }
  });

  // Hide on release / pointer leave
  const hideIndicator = () => {
    item.classList.remove('is-active');
    indicator.classList.remove('show');
    indicatorVideo.pause();
  };

  item.addEventListener('pointerup', hideIndicator);
  item.addEventListener('pointerleave', hideIndicator);
});