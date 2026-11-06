import "@folkehelseinstituttet/designsystem/fhi-tag";
import "@folkehelseinstituttet/designsystem/fhi-checkbox";
import "@folkehelseinstituttet/designsystem/fhi-button";
import "@folkehelseinstituttet/designsystem/fhi-icon-copy";
import "@folkehelseinstituttet/designsystem/fhi-icon-check";
import "@folkehelseinstituttet/designsystem/fhi-callout";
import "@folkehelseinstituttet/designsystem/fhi-icon-circle-info";
import "@folkehelseinstituttet/designsystem/fhi-link";

// Nøkkel for lagring av fremgang i nettleserens localStorage
const CHECKLIST_STORAGE_KEY = "gh_pages_guide_progress";

const colors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#4caf50",
  "#ffeb3b",
  "#ff9800",
];

function createConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;
  const particleCount = 750;

  for (let i = 0; i < particleCount; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti-piece");

    // Halvparten fra nederst til venstre (1), halvparten fra nederst til høyre (-1)
    const fromLeft = i % 2 === 0;
    const direction = fromLeft ? 1 : -1;

    const size = Math.random() * 8 + 6; // 6px to 14px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 1.5 + 2.2; // 2.2s to 3.7s
    const delay = Math.random() * 0.35;

    // Vinkel mellom 35° og 75° oppover inn i skjermen
    const angleDeg = Math.random() * 40 + 35;
    const angleRad = (angleDeg * Math.PI) / 180;
    const distance = Math.random() * 55 + 35; // hvor langt skuddet rekker (i vh/vw)

    const peakX = Math.cos(angleRad) * distance * direction;
    const peakY = -Math.sin(angleRad) * (distance * 1.2);
    const endX = peakX * 1.35;
    const rotation = (Math.random() * 720 + 360) * direction;

    confetti.style.width = `${size}px`;
    confetti.style.height = `${size * 0.45}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = fromLeft ? "0%" : "100%";
    confetti.style.setProperty("--peak-x", `${peakX}vw`);
    confetti.style.setProperty("--peak-y", `${peakY}vh`);
    confetti.style.setProperty("--end-x", `${endX}vw`);
    confetti.style.setProperty("--rot", `${rotation}deg`);
    confetti.style.animationDuration = `${duration}s`;
    confetti.style.animationDelay = `${delay}s`;

    container.appendChild(confetti);

    setTimeout(
      () => {
        confetti.remove();
      },
      (duration + delay) * 650,
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initStepProgress();
  initCopyButtons();
});

/**
 * Synkroniserer avkrysning i seksjonene (<fhi-checkbox data-step="...">)
 * med listen i den klebrige sidemenyen (<li data-sidebar-step="...">)
 * og lagrer fremgangen i localStorage.
 */
function initStepProgress() {
  const checkboxes = document.querySelectorAll("fhi-checkbox[data-step]");
  const progressBadge = document.getElementById("progress-badge");
  const resetBtn = document.getElementById("reset-checklist");

  if (!checkboxes.length || !progressBadge || !resetBtn) return;

  let savedState = {};
  try {
    savedState = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY)) || {};
  } catch {
    savedState = {};
  }

  let wasObligatoryDone = false;
  let wasAllDone = false;

  function updateProgress(triggerCelebration = false) {
    const total = checkboxes.length;
    let completed = 0;

    checkboxes.forEach((cb) => {
      const step = cb.getAttribute("data-step");
      const isChecked = Boolean(cb.checked);
      savedState[step] = isChecked;

      if (isChecked) {
        completed += 1;
      }

      const sidebarItem = document.querySelector(
        `[data-sidebar-step="${step}"]`,
      );
      if (sidebarItem) {
        sidebarItem.classList.toggle("is-completed", isChecked);
      }
    });

    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(savedState));
    progressBadge.textContent = `${completed} / ${total} fullført`;
    progressBadge.setAttribute(
      "color",
      completed === total ? "success" : "neutral",
    );

    const obligatoryDone = ["1", "2", "3", "4"].every((step) =>
      Boolean(savedState[step]),
    );
    const allDone = ["1", "2", "3", "4", "5"].every((step) =>
      Boolean(savedState[step]),
    );

    if (
      triggerCelebration &&
      ((obligatoryDone && !wasObligatoryDone) || (allDone && !wasAllDone))
    ) {
      createConfetti();
    }

    wasObligatoryDone = obligatoryDone;
    wasAllDone = allDone;
  }

  checkboxes.forEach((cb) => {
    const step = cb.getAttribute("data-step");
    if (savedState[step]) {
      cb.checked = true;
    }
    cb.addEventListener("change", () => updateProgress(true));
  });

  resetBtn.addEventListener("click", () => {
    checkboxes.forEach((cb) => {
      cb.checked = false;
    });
    updateProgress(false);
  });

  updateProgress(false);
}

/**
 * Håndterer kopiering av kodeeksempler til utklippstavlen
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll("[data-copy-target]");

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-copy-target");
      const codeElement = document.getElementById(targetId);
      if (!codeElement) return;

      const textToCopy = codeElement.textContent ?? "";
      const labelSpan = btn.querySelector(".copy-btn-text");
      const iconElement = btn.querySelector("fhi-icon-copy, fhi-icon-check");

      try {
        await navigator.clipboard.writeText(textToCopy);

        if (labelSpan) {
          labelSpan.textContent = "Kopiert!";
        }
        if (
          iconElement &&
          iconElement.tagName.toLowerCase() === "fhi-icon-copy"
        ) {
          const checkIcon = document.createElement("fhi-icon-check");
          iconElement.replaceWith(checkIcon);
        }

        setTimeout(() => {
          if (labelSpan) {
            labelSpan.textContent = "Kopier kode";
          }
          const currentIcon = btn.querySelector("fhi-icon-check");
          if (currentIcon) {
            const copyIcon = document.createElement("fhi-icon-copy");
            currentIcon.replaceWith(copyIcon);
          }
        }, 2000);
      } catch (err) {
        console.error("Kunne ikke kopiere kode:", err);
      }
    });
  });
}
