// ==UserScript==
// @name         youtube helpers
// @namespace    http://tampermonkey.net/
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      file:///Users/justin/Code/tamper-scripts/youtube-helpers.js
// ==/UserScript==

function getPlayer() {
  return document.querySelector("#movie_player");
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

const container = document.createElement("div");
container.style.position = "absolute";
container.style.top = 0;
container.style.left = 0;
container.style.color = "white";
container.style.fontSize = "14px";
container.style.zIndex = 999999;
document.body.appendChild(container);

const statusDisplay = document.createElement("span");
container.appendChild(statusDisplay);

function refreshstatusDisplay() {
  const player = getPlayer();
  const rate = player?.getPlaybackRate();
  statusDisplay.innerText = !!rate ? `Current rate: ${rate}` : "Missing player";
}

setInterval(refreshstatusDisplay, 1000);

const span = document.createElement("span");
span.style.marginLeft = "4px";
span.style.color = "white";
span.style.fontSize = "14px";
span.style.opacity = 0;
container.appendChild(span);

let timeout;

function msg(text) {
  span.innerText = "- " + text;
  span.style.opacity = 1;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    span.style.opacity = 0;
  }, 5000);
}

function applyPlaybackRate(rate = 1.5) {
  const liveBadge = document.querySelector(".ytp-live-badge");
  const isLive =
    liveBadge &&
    !liveBadge.getAttribute("disabled") &&
    liveBadge.checkVisibility();
  if (isLive) {
    msg("setting live rate 1.0");
    rate = 1.0;
  } else {
    msg("applying rate: " + rate);
  }

  getPlayer()?.setPlaybackRate(rate);
  refreshstatusDisplay();
}

function shiftTime(shift) {
  const videos = document.querySelectorAll("video");
  msg("shift " + shift);
  Array.prototype.map.call(videos, (x) => {
    x.currentTime += shift;
  });
}

function redirectFromShortsDelayed() {
  redirectFromShorts();
  setTimeout(redirectFromShorts, 1000);
}

function selectCorrectAudioTrackDelayed() {
  correctAudioTrack();
  setTimeout(correctAudioTrack, 1000);
}

function correctAudioTrack() {
  const player = getPlayer();
  if (!player) return;
  if (!player.getAvailableAudioTracks) return;

  const tracks = player.getAvailableAudioTracks();
  if (tracks.length === 1) return;

  const originalTrack = tracks.find((r) => {
    for (const key in r) {
      if (
        r.hasOwnProperty(key) &&
        typeof r[key] === "object" &&
        r[key] &&
        r[key].name &&
        r[key].name.includes("original")
      ) {
        return true;
      }
    }
  });

  if (!originalTrack) return;

  console.log("Setting original track:", originalTrack);
  player.setAudioTrack(originalTrack);
  player.audioUntranslated = true;
}

function redirectFromShorts() {
  const split = window.location.href.split("shorts/");

  if (split.length > 1) {
    const rest = split[1];

    console.log("redirecting from shorts:", rest);

    window.location.replace(`https://youtube.com/watch?v=${rest}`);
  }
}

function syncYouTubeTitle() {
  const titleElem = document.querySelector('#title > h1 > yt-formatted-string');
  const player = document.querySelector('#movie_player');
  const playerTitle = player?.getPlayerResponse?.()?.videoDetails?.title;

  if (playerTitle) {
    if (titleElem && titleElem.innerText !== playerTitle) {
      titleElem.innerText = playerTitle;
    }
    if (document.title !== playerTitle) {
      document.title = playerTitle;
    }
  }
}

(function () {
  "use strict";

  window.navigation.addEventListener("navigate", () => {
    console.info("navigate");
    msg("navigate");
    applyPlaybackRate();

    console.info("navigate: calling redirect from shorts");
    redirectFromShortsDelayed();

    console.info("navigate: correcting audio track as needed");
    selectCorrectAudioTrackDelayed();
  });

  applyPlaybackRate();

  window.addEventListener("keydown", (e) => {
    if (e.key === ";") applyPlaybackRate();
    if (e.key === ":") applyPlaybackRate(1.0);

    if (e.key === "z") shiftTime(-4);
    if (e.key === "x") shiftTime(4);

    if (e.key === "'") {
      correctAudioTrack();
      syncYouTubeTitle();
    }
  });

  redirectFromShortsDelayed();
  selectCorrectAudioTrackDelayed();
})();
