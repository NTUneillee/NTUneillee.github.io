document.addEventListener("DOMContentLoaded", () => {
  const explanationButtons = [...document.querySelectorAll('[data-expl-scene]')];
  const explanationPanels = [...document.querySelectorAll('[data-expl-panel]')];
  explanationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      explanationButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      explanationPanels.forEach((panel) => { panel.hidden = panel.dataset.explPanel !== button.dataset.explScene; });
    });
  });
  const lazyVideos = [...document.querySelectorAll("video[data-lazy-video]")];
  const heroVideos = [...document.querySelectorAll('video[data-hero-video]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibleVideos = new Set();

  // Do not fetch the ten study videos merely because the reader scrolls past.
  lazyVideos.forEach((video) => {
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach((other) => {
        if (other !== video) other.pause();
      });
    });
  });
  const updateHero = (video) => {
    if (!visibleVideos.has(video) || document.hidden || reduceMotion.matches || document.querySelector('dialog[open]')) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  };
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) visibleVideos.add(video);
        else { visibleVideos.delete(video); video.pause(); }
        if (video.hasAttribute('data-hero-video')) updateHero(video);
      });
    }, { threshold: 0.15 });
    [...heroVideos, ...lazyVideos].forEach((video) => videoObserver.observe(video));
  } else {
    heroVideos.forEach((video) => { visibleVideos.add(video); updateHero(video); });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('video').forEach((video) => video.pause());
    else heroVideos.forEach(updateHero);
  });
  reduceMotion.addEventListener('change', () => heroVideos.forEach(updateHero));

  const benchmarkButtons = [...document.querySelectorAll("[data-benchmark]")];
  const benchmarkImages = [...document.querySelectorAll(".pg-benchmark-gallery img[data-fcdb]")];

  benchmarkButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const benchmark = button.dataset.benchmark;
      benchmarkButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      benchmarkImages.forEach((image) => {
        image.classList.add("is-switching");
        window.setTimeout(() => {
          const card = image.closest("[data-benchmark-card]");
          const name = card?.querySelector("[data-benchmark-name]");
          const iou = card?.querySelector("[data-benchmark-iou]");
          image.src = image.dataset[benchmark];
          image.alt = `${benchmark.toUpperCase()} crop comparison with PhotoGuider in orange and ground truth in green`;
          if (name) name.textContent = benchmark.toUpperCase();
          if (iou && card) iou.textContent = card.dataset[`${benchmark}Iou`];
          image.classList.remove("is-switching");
        }, 90);
      });
    });
  });

  const sceneCards = [...document.querySelectorAll("[data-scene-card]")];
  const filterButtons = [...document.querySelectorAll("[data-scene-filter]")];
  const searchInput = document.querySelector("[data-scene-search]");
  const sceneStatus = document.querySelector("[data-scene-status]");
  let activeFilter = "all";

  const filterScenes = () => {
    const query = searchInput?.value.trim().toLowerCase() || "";
    let visible = 0;

    sceneCards.forEach((card) => {
      const matchesFilter = activeFilter === "all" || card.dataset.group === activeFilter;
      const matchesSearch = !query || card.dataset.name.includes(query);
      const show = matchesFilter && matchesSearch;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (sceneStatus) sceneStatus.textContent = `Showing ${visible} ${visible === 1 ? "scene" : "scenes"}`;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.sceneFilter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      filterScenes();
    });
  });

  searchInput?.addEventListener("input", filterScenes);

  const dialog = document.querySelector("[data-scene-dialog]");
  const closeButton = dialog?.querySelector("[data-dialog-close]");
  const dialogTitle = dialog?.querySelector("[data-dialog-title]");
  const dialogRank = dialog?.querySelector("[data-dialog-rank]");
  const dialogMeta = dialog?.querySelector("[data-dialog-meta]");
  const dialogExplanation = dialog?.querySelector("[data-dialog-explanation]");
  const dialogScores = dialog?.querySelector("[data-dialog-scores]");
  const dialogVideo = dialog?.querySelector("[data-dialog-video]");

  const setDialogImage = (selector, src, alt) => {
    const image = dialog?.querySelector(selector);
    if (!image) return;
    image.src = src;
    image.alt = alt;
  };

  sceneCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!dialog) return;
      document.querySelectorAll('video').forEach((video) => video.pause());
      if (dialogVideo) {
        dialogVideo.src = card.dataset.video;
        dialogVideo.poster = card.querySelector('img')?.src || '';
        dialogVideo.load();
      }
      const { title, rank, rankings, ours, venus, cacnet, s, c, a, i, explanation, root } = card.dataset;
      if (dialogTitle) dialogTitle.textContent = title;
      if (dialogRank) dialogRank.textContent = `Study rank ${rank}`;
      if (dialogMeta) dialogMeta.textContent = `${rankings} rankings. PhotoGuider ${Number(ours).toFixed(1)}%, Venus ${Number(venus).toFixed(1)}%, CACNet ${Number(cacnet).toFixed(1)}% ranked first.`;
      if (dialogExplanation) dialogExplanation.textContent = explanation;

      if (dialogScores) {
        dialogScores.replaceChildren();
        [["S", s], ["C", c], ["I", i], ["A", a]].forEach(([label, value]) => {
          const pill = document.createElement("span");
          const key = document.createElement("b");
          key.textContent = label;
          pill.append(key, document.createTextNode(value));
          dialogScores.appendChild(pill);
        });
      }

      setDialogImage('[data-dialog-image="ours"]', `${root}crop_ours.webp`, `PhotoGuider crop for ${title}`);
      setDialogImage('[data-dialog-image="venus"]', `${root}crop_venus.webp`, `Venus crop for ${title}`);
      setDialogImage('[data-dialog-image="cacnet"]', `${root}crop_cacnet.webp`, `CACNet crop for ${title}`);
      setDialogImage('[data-dialog-heatmap="ours"]', `${root}heatmap_ours.webp`, `PhotoGuider view preference heatmap for ${title}`);
      setDialogImage('[data-dialog-heatmap="venus"]', `${root}heatmap_venus.webp`, `Venus view preference heatmap for ${title}`);
      setDialogImage('[data-dialog-heatmap="cacnet"]', `${root}heatmap_cacnet.webp`, `CACNet view preference heatmap for ${title}`);
      dialog.showModal();
    });
  });

  closeButton?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("close", () => {
    if (!dialogVideo) return;
    dialogVideo.pause();
    dialogVideo.removeAttribute('src');
    dialogVideo.load();
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});
