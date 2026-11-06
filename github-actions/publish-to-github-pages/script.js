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

  function updateProgress() {
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
  }

  checkboxes.forEach((cb) => {
    const step = cb.getAttribute("data-step");
    if (savedState[step]) {
      cb.checked = true;
    }
    cb.addEventListener("change", updateProgress);
  });

  resetBtn.addEventListener("click", () => {
    checkboxes.forEach((cb) => {
      cb.checked = false;
    });
    updateProgress();
  });

  updateProgress();
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
