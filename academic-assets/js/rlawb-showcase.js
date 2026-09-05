document.addEventListener("DOMContentLoaded", () => {
  const compare = document.querySelector("[data-image-compare]");
  const compareRange = compare?.querySelector(".image-compare__range");

  if (compare && compareRange) {
    const updateCompare = () => compare.style.setProperty("--reveal", `${compareRange.value}%`);
    compareRange.addEventListener("input", updateCompare);
    updateCompare();
  }

  const datasetButtons = [...document.querySelectorAll("[data-dataset-mode]")];
  const datasetImages = [...document.querySelectorAll(".dataset-gallery img[data-input]")];

  datasetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.datasetMode;
      datasetButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      datasetImages.forEach((image) => {
        image.classList.add("is-switching");
        window.setTimeout(() => {
          image.src = image.dataset[mode];
          image.alt = mode === "mask" ? "ColorChecker mask annotation" : "LEVI nighttime input sample";
          image.classList.remove("is-switching");
        }, 90);
      });
    });
  });

  const processButtons = [...document.querySelectorAll("[data-process-scene]")];
  const processImages = [...document.querySelectorAll("[data-process-stage]")];

  processButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const scene = button.dataset.processScene;
      processButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      processImages.forEach((image) => image.classList.add("is-switching"));
      window.setTimeout(() => {
        processImages.forEach((image) => {
          const stage = image.dataset.processStage;
          const label = image.closest(".process-stage")?.querySelector("figcaption")?.textContent.trim() || `Stage ${stage}`;
          image.src = `${image.dataset.base}scene-${scene}-stage-${stage}.webp?v=5`;
          image.alt = `${label} for RL-AWB adaptive-process scene ${scene}`;
          image.classList.remove("is-switching");
        });
      }, 90);
    });
  });

  const methodButtons = [...document.querySelectorAll("[data-method]")];
  const qualitativeScenes = [...document.querySelectorAll("[data-qual-scene]")];
  const methodLabels = {
    c4: "C⁴",
    c5: "C⁵",
    fc4: "FC⁴",
    pcc: "PCC",
    gcc: "GCC",
    rlawb: "RL-AWB",
    "ground-truth": "Ground truth",
  };
  let activeMethod = "rlawb";

  const updateQualitative = () => {
    qualitativeScenes.forEach((sceneBlock) => {
      const scene = sceneBlock.dataset.qualScene;
      const output = sceneBlock.querySelector(".qualitative-output");
      const label = sceneBlock.querySelector(".qualitative-output-label");
      if (output) {
        output.src = `${output.dataset.base}scene-${scene}-${activeMethod}.webp?v=3`;
        output.alt = `${methodLabels[activeMethod]} output for qualitative scene ${scene}`;
      }
      if (label) label.textContent = methodLabels[activeMethod];
    });
  };

  methodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeMethod = button.dataset.method;
      methodButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      updateQualitative();
    });
  });

  const resultButtons = [...document.querySelectorAll("[data-results-tab]")];
  const resultsContent = document.querySelector(".results-content");
  const resultPanels = resultsContent ? [...resultsContent.querySelectorAll(":scope > .results-table-wrapper")].slice(0, 3) : [];

  if (resultsContent && resultPanels.length) {
    resultsContent.classList.add("results-ready");
    resultPanels.forEach((panel, index) => panel.classList.toggle("is-active", index === 0));

    resultButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedIndex = Number(button.dataset.resultsTab);
        resultButtons.forEach((item, index) => {
          const active = index === selectedIndex;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        resultPanels.forEach((panel, index) => panel.classList.toggle("is-active", index === selectedIndex));
      });
    });
  }

  const copyButton = document.querySelector("[data-copy-bibtex]");
  const bibtex = document.querySelector(".bibtex-section code");
  const copyStatus = document.querySelector(".copy-status");

  if (copyButton && bibtex) {
    copyButton.addEventListener("click", async () => {
      const text = bibtex.textContent.trim();
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch (_) {
          copied = false;
        }
      }

      if (!copied) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand("copy");
        textarea.remove();
      }

      if (copyStatus) copyStatus.textContent = copied ? "BibTeX copied." : "Copy failed. Please select the text manually.";
      if (copied) window.setTimeout(() => { if (copyStatus) copyStatus.textContent = ""; }, 2200);
    });
  }
});
