/* =============================================================================
   Ambient — landing hero interactions
   1. "Just ask Ambient" prompt types and cycles through example questions.
   2. The product card "plays" a 28s clip: timecode + progress bar advance while
      Watch → Gather → Reason → Act light up in turn with their connectors.
   Pure DOM, no dependencies. Under prefers-reduced-motion the card stays
   static; the typing prompt still runs (the cursor just stops blinking).
   ============================================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. Typing prompt ------------------------------------------------------
  var typed = document.querySelector("[data-type]");
  var PROMPTS = [
    "score this robot run and explain the failures",
    "turn these demo videos into a computer-use training dataset",
    "annotate the defects in the footage and provide a report",
    "find every safety violation and return structured JSON",
    "show me where assembly went wrong",
    "extract the best demonstration from these recordedruns",
    "convert the walkthrough video into product documentation",
    "find where I left my keys",
  ];

  // Typing is a text change, not vestibular motion, so it runs even under
  // prefers-reduced-motion; only the card's movement below respects it.
  if (typed) {
    var p = 0, i = 0, deleting = false;
    var tick = function () {
      var text = PROMPTS[p];
      if (!deleting) {
        i++;
        typed.textContent = text.slice(0, i);
        if (i === text.length) { deleting = true; return setTimeout(tick, 1900); }
        return setTimeout(tick, 42 + Math.random() * 40);
      }
      i--;
      typed.textContent = text.slice(0, i);
      if (i === 0) { deleting = false; p = (p + 1) % PROMPTS.length; return setTimeout(tick, 350); }
      setTimeout(tick, 18);
    };
    typed.textContent = "";
    setTimeout(tick, 600);
  }

  // ---- 2. Product card playback ---------------------------------------------
  var pc = document.getElementById("pc");
  if (!pc) return;

  var steps = pc.querySelectorAll("[data-step]");
  var links = pc.querySelectorAll("[data-link]");
  var bar = pc.querySelector("[data-bar]");
  var time = pc.querySelector("[data-time]");
  var DURATION = 28; // seconds, matches the "0:28" label

  function setStep(n) {
    for (var s = 0; s < steps.length; s++) steps[s].classList.toggle("active", s === n);
    for (var l = 0; l < links.length; l++) links[l].classList.toggle("active", +links[l].getAttribute("data-link") === n);
  }

  if (reduce) { setStep(0); return; }

  var start = performance.now();
  var lastStep = -1, lastSec = -1;

  function frame(now) {
    var t = ((now - start) / 1000) % DURATION;
    if (bar) bar.style.width = ((t / DURATION) * 100).toFixed(2) + "%";

    var sec = Math.floor(t);
    if (sec !== lastSec && time) {
      time.textContent = "0:" + (sec < 10 ? "0" : "") + sec + " / 0:" + DURATION;
      lastSec = sec;
    }

    var n = Math.min(steps.length - 1, Math.floor(t / (DURATION / steps.length)));
    if (n !== lastStep) { setStep(n); lastStep = n; }

    requestAnimationFrame(frame);
  }
  setStep(0);
  requestAnimationFrame(frame);
})();
