function map(xs, fn) {
  return Array.prototype.map.call(xs, fn);
}

function applyPlaybackRate(rate = 1.5) {
  const videos = document.querySelectorAll("video");
  map(videos, (x) => {
    console.log("setting rate", x);
    x.playbackRate = rate;
  });
}

(function () {
  "use strict";

  window.addEventListener("keydown", (e) => {
    if (e.key === "'") applyPlaybackRate(2);
    if (e.key === ";") applyPlaybackRate(1.5);
    if (e.key === "l") applyPlaybackRate(1.0);
  });
})();
