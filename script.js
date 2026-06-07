const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.menu');
const popBoxes = Array.from(document.querySelectorAll('.pop-box'));

let lastPointerX = null;
let lastPointerY = null;

function isPointerInside(element) {
  if (lastPointerX === null || lastPointerY === null) return false;
  const rect = element.getBoundingClientRect();
  return lastPointerX >= rect.left
    && lastPointerX <= rect.right
    && lastPointerY >= rect.top
    && lastPointerY <= rect.bottom;
}

function refreshHoverState() {
  popBoxes.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const localX = lastPointerX === null ? 50 : ((lastPointerX - rect.left) / rect.width) * 100;
    const localY = lastPointerY === null ? 50 : ((lastPointerY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, localX));
    const clampedY = Math.max(0, Math.min(100, localY));

    card.style.setProperty('--mx', `${clampedX}%`);
    card.style.setProperty('--my', `${clampedY}%`);

    const inside = isPointerInside(card) || card.matches(':hover');
    card.classList.toggle('cursor-hover', inside);

    if (!inside && card.getAttribute('data-details-open') !== 'true') {
      card.classList.remove('force-hover');
    }
  });
}

function trackPointer(event) {
  if (event.pointerType === 'touch') return;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  refreshHoverState();
}

function trackMouse(event) {
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  refreshHoverState();
}

document.addEventListener('pointermove', trackPointer);
document.addEventListener('pointerdown', trackPointer);
document.addEventListener('mousemove', trackMouse);
document.addEventListener('mousedown', trackMouse);
window.addEventListener('scroll', () => requestAnimationFrame(refreshHoverState), { passive: true });
window.addEventListener('resize', refreshHoverState);

popBoxes.forEach((card) => {
  const markHover = () => {
    card.classList.add('cursor-hover');
  };

  const clearHover = () => {
    card.classList.remove('cursor-hover');
    if (card.getAttribute('data-details-open') !== 'true') {
      card.classList.remove('force-hover');
    }
  };

  card.addEventListener('pointerenter', markHover);
  card.addEventListener('pointerleave', clearHover);
  card.addEventListener('mouseenter', markHover);
  card.addEventListener('mouseleave', clearHover);
});

if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const cardMediaLibrary = {
  fsa: [
    { type: 'image', src: 'assets/images/test.jpg', title: 'FSA Student Researcher - Photo', alt: 'FSA media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'FSA Student Researcher - Video' }
  ],
  warehouse: [
    { type: 'image', src: 'assets/images/test.jpg', title: 'Warehouse Associate - Photo', alt: 'Warehouse media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'Warehouse Associate - Video' }
  ],
  wec: [
    { type: 'image', src: 'assets/images/WEC_2025/App.jpg', title: 'WEC - App', alt: 'WEC app photo' },
    { type: 'image', src: 'assets/images/WEC_2025/Team_Members.jpg', title: 'WEC - Team Members', alt: 'WEC team photo' }
  ],
  bec: [
    { type: 'image', src: 'assets/images/test.jpg', title: 'BEC - Photo', alt: 'BEC media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'BEC - Video' }
  ],
  capstone: [
    { type: 'image', src: 'assets/images/Capstone_2026/Entire_Group.jpg', title: 'Capstone - Entire Group', alt: 'Capstone group photo' },
    { type: 'image', src: 'assets/images/Capstone_2026/poster.jpg', title: 'Capstone - Poster', alt: 'Capstone poster photo' },
    { type: 'image', src: 'assets/images/Capstone_2026/Team_Members.jpg', title: 'Capstone - Team Members', alt: 'Capstone team photo' }
  ],
  rccar: [
    { type: 'image', src: 'assets/images/RC_Car_2024/Competition.jpg', title: 'RC Car - Competition', alt: 'RC car competition photo' },
    { type: 'image', src: 'assets/images/RC_Car_2024/Dynamic.jpg', title: 'RC Car - Dynamic', alt: 'RC car dynamic photo' },
    { type: 'image', src: 'assets/images/RC_Car_2024/PCB_Design.jpg', title: 'RC Car - PCB Design', alt: 'RC car PCB design photo' },
    { type: 'image', src: 'assets/images/RC_Car_2024/PCB_Wiring.jpg', title: 'RC Car - PCB Wiring', alt: 'RC car PCB wiring photo' },
    { type: 'image', src: 'assets/images/RC_Car_2024/Profile.jpg', title: 'RC Car - Profile', alt: 'RC car profile photo' }
  ]
};

document.querySelectorAll('.toggle-btn').forEach((button) => {
  button.addEventListener('click', (event) => {
    const targetId = button.getAttribute('data-target');
    if (!targetId) return;
    const panel = document.getElementById(targetId);
    if (!panel) return;

    const hidden = panel.classList.toggle('hidden');
    button.textContent = hidden ? 'More details' : 'Less details';
    button.setAttribute('aria-expanded', String(!hidden));

    const card = button.closest('article.card') || button.closest('.pop-box');
    const contentBlock = button.parentElement;
    const mediaBlock = contentBlock ? contentBlock.querySelector('.card-media') : null;

    // Layout behavior requested:
    // collapsed: More details button above media
    // expanded: details content -> Less details button -> media
    if (contentBlock && mediaBlock) {
      if (panel.contains(mediaBlock)) {
        contentBlock.insertBefore(mediaBlock, panel);
      }

      if (!hidden) {
        if (panel.parentElement === contentBlock && panel.nextElementSibling !== button) {
          contentBlock.insertBefore(panel, button);
        }

        if (button.nextElementSibling !== mediaBlock) {
          contentBlock.insertBefore(mediaBlock, button.nextSibling);
        }
      } else {
        if (button.nextElementSibling !== mediaBlock) {
          contentBlock.insertBefore(mediaBlock, button.nextSibling);
        }

        if (panel.parentElement === contentBlock && panel.previousElementSibling !== mediaBlock) {
          contentBlock.insertBefore(panel, mediaBlock.nextSibling);
        }
      }
    }

    if (card) {
      card.classList.toggle('details-open', !hidden);
      card.setAttribute('data-details-open', String(!hidden));

      // On collapse, keep raised state if cursor is still inside the card.
      if (hidden) {
        card.classList.add('force-hover');

        // Reconcile after layout and input state settle.
        requestAnimationFrame(() => {
          refreshHoverState();
          if (!card.classList.contains('cursor-hover')) {
            card.classList.remove('force-hover');
          }
        });

        setTimeout(() => {
          refreshHoverState();
          if (!card.classList.contains('cursor-hover')) {
            card.classList.remove('force-hover');
          }
        }, 140);
      } else {
        card.classList.remove('force-hover');
      }
    }

    // Mouse-triggered clicks should not leave focus stuck on the button,
    // otherwise :focus-within can keep the card in a raised state.
    if (event.detail > 0) {
      button.blur();
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16
});

document.querySelectorAll('.reveal').forEach((element) => {
  observer.observe(element);
});

const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxTitle = document.getElementById('lightbox-title');
const lbZoomIn = document.getElementById('lb-zoom-in');
const lbZoomOut = document.getElementById('lb-zoom-out');
const lbZoomReset = document.getElementById('lb-zoom-reset');
const lbClose = document.getElementById('lb-close');

const cardMediaState = new Map();
const lightboxState = {
  galleryKey: null,
  galleryIndex: 0,
  items: []
};
const galleryFrameRatios = new Map();

let lightboxMedia = null;
let lightboxZoom = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;
let lightboxDrag = null;
const frameHoverTimers = new WeakMap();

const lightboxControls = document.querySelector('.lightbox-controls');
const lbPrev = document.createElement('button');
lbPrev.type = 'button';
lbPrev.className = 'lb-btn lb-nav-btn';
lbPrev.setAttribute('aria-label', 'Previous photo');
lbPrev.textContent = '←';

const lbNext = document.createElement('button');
lbNext.type = 'button';
lbNext.className = 'lb-btn lb-nav-btn';
lbNext.setAttribute('aria-label', 'Next photo');
lbNext.textContent = '→';

function applyLightboxZoom() {
  if (!lightboxMedia) return;
  lightboxMedia.style.transform = `translate3d(${lightboxPanX}px, ${lightboxPanY}px, 0) scale(${lightboxZoom})`;
  if (lbZoomReset) {
    lbZoomReset.textContent = `${Math.round(lightboxZoom * 100)}%`;
  }
}

function resetLightboxTransform() {
  lightboxZoom = 1;
  lightboxPanX = 0;
  lightboxPanY = 0;
  applyLightboxZoom();
}

function measureMediaRatio(item) {
  return new Promise((resolve) => {
    if (item.type === 'video') {
      const video = document.createElement('video');
      const finish = () => {
        const width = video.videoWidth || 16;
        const height = video.videoHeight || 10;
        resolve(width / height);
      };

      video.preload = 'metadata';
      video.playsInline = true;
      video.addEventListener('loadedmetadata', finish, { once: true });
      video.addEventListener('error', () => resolve(16 / 10), { once: true });
      video.src = item.src;
      return;
    }

    const image = new Image();
    image.addEventListener('load', () => {
      const width = image.naturalWidth || 16;
      const height = image.naturalHeight || 10;
      resolve(width / height);
    }, { once: true });
    image.addEventListener('error', () => resolve(16 / 10), { once: true });
    image.src = item.src;
  });
}

function updateFrameRatio(frame, galleryKey, items) {
  if (!frame || !items.length) return;

  const applyRatio = (ratio) => {
    const safeRatio = Math.max(0.35, Math.min(2.5, ratio || 16 / 10));
    frame.style.setProperty('--media-frame-ratio', `${safeRatio}`);
  };

  if (galleryKey && galleryFrameRatios.has(galleryKey)) {
    applyRatio(galleryFrameRatios.get(galleryKey));
    return;
  }

  applyRatio(16 / 10);

  Promise.all(items.map(measureMediaRatio)).then((ratios) => {
    const maxHeightRatio = ratios.reduce((lowest, ratio) => Math.min(lowest, ratio), ratios[0] || 16 / 10);
    if (galleryKey) {
      galleryFrameRatios.set(galleryKey, maxHeightRatio);
    }
    applyRatio(maxHeightRatio);
  });
}

function bindFrameHoverState(frame) {
  if (!frame) return;

  const clearTimer = () => {
    const timerId = frameHoverTimers.get(frame);
    if (timerId) {
      clearTimeout(timerId);
      frameHoverTimers.delete(frame);
    }
  };

  const showBars = () => {
    clearTimer();
    frame.classList.add('is-hovering');
  };

  const hideBarsLater = () => {
    clearTimer();
    const timerId = window.setTimeout(() => {
      frame.classList.remove('is-hovering');
      frameHoverTimers.delete(frame);
    }, 1000);
    frameHoverTimers.set(frame, timerId);
  };

  frame.addEventListener('pointerenter', showBars);
  frame.addEventListener('pointermove', showBars);
  frame.addEventListener('pointerleave', hideBarsLater);
  frame.addEventListener('focusin', showBars);
  frame.addEventListener('focusout', hideBarsLater);
}

function getGalleryItems(galleryKey) {
  return galleryKey ? (cardMediaLibrary[galleryKey] || []) : [];
}

function updateLightboxNavState() {
  const hasGallery = lightboxState.items.length > 1;
  if (lbPrev) lbPrev.disabled = !hasGallery;
  if (lbNext) lbNext.disabled = !hasGallery;
}

function navigateGallery(step) {
  if (!lightboxState.items.length) return;
  const total = lightboxState.items.length;
  const nextIndex = (lightboxState.galleryIndex + step + total) % total;
  showLightboxItem(lightboxState.items[nextIndex], lightboxState.galleryKey, nextIndex, lightboxState.items);
}

function showLightboxItem(item, galleryKey = null, galleryIndex = 0, galleryItems = null) {
  if (!lightbox || !lightboxStage) return;

  lightboxState.galleryKey = galleryKey;
  lightboxState.galleryIndex = galleryIndex;
  lightboxState.items = galleryItems || getGalleryItems(galleryKey);

  resetLightboxTransform();
  lightboxStage.innerHTML = '';

  const frame = document.createElement('div');
  frame.className = 'lightbox-frame';

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.className = 'lb-media video';
    video.controls = true;
    video.src = item.src;
    video.preload = 'metadata';
    video.playsInline = true;
    lightboxMedia = video;
  } else {
    const img = document.createElement('img');
    img.className = 'lb-media image';
    img.src = item.src;
    img.alt = item.alt || item.title || 'Expanded gallery image';
    img.draggable = false;
    lightboxMedia = img;
  }

  frame.appendChild(lightboxMedia);

  if (lightboxState.items.length > 1) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'media-carousel-btn media-overlay media-prev';
    prev.setAttribute('aria-label', 'Previous photo');
    prev.addEventListener('click', () => navigateGallery(-1));

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'media-carousel-btn media-overlay media-next';
    next.setAttribute('aria-label', 'Next photo');
    next.addEventListener('click', () => navigateGallery(1));

    frame.appendChild(prev);
    frame.appendChild(next);
  }

  lightboxStage.appendChild(frame);
  bindFrameHoverState(frame);
  updateFrameRatio(frame, galleryKey, lightboxState.items.length ? lightboxState.items : [item]);

  if (lightboxState.items.length > 1) {
    const dots = document.createElement('div');
    dots.className = 'lightbox-dots';

    lightboxState.items.forEach((entry, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `lightbox-dot${index === lightboxState.galleryIndex ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Show photo ${index + 1} of ${lightboxState.items.length}`);
      dot.addEventListener('click', () => {
        showLightboxItem(entry, lightboxState.galleryKey, index, lightboxState.items);
      });
      dots.appendChild(dot);
    });

    lightboxStage.appendChild(dots);
  }

  applyLightboxZoom();

  if (lightboxTitle) {
    lightboxTitle.textContent = item.title || 'Media Viewer';
  }

  updateLightboxNavState();

  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  if (!lightbox || !lightboxStage) return;
  if (lightboxMedia && lightboxMedia.tagName === 'VIDEO') {
    lightboxMedia.pause();
  }
  lightboxMedia = null;
  lightboxDrag = null;
  lightboxState.galleryKey = null;
  lightboxState.galleryIndex = 0;
  lightboxState.items = [];
  resetLightboxTransform();
  lightboxStage.innerHTML = '';
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
}

function buildCardMediaItem(item, galleryKey, galleryIndex) {
  const button = document.createElement('button');
  button.className = 'media-item inline-media media-hero';
  button.type = 'button';
  button.setAttribute('data-type', item.type);
  button.setAttribute('data-src', item.src);
  button.setAttribute('data-title', item.title || 'Media Viewer');
  button.setAttribute('data-gallery-key', galleryKey);
  button.setAttribute('data-gallery-index', String(galleryIndex));
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    showLightboxItem(item, galleryKey, galleryIndex, cardMediaLibrary[galleryKey] || []);
  });

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    video.playsInline = true;
    const source = document.createElement('source');
    source.src = item.src;
    source.type = 'video/mp4';
    video.appendChild(source);
    button.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || item.title || 'Card media preview';
    img.loading = 'lazy';
    button.appendChild(img);
  }

  if (item.title) {
    const label = document.createElement('span');
    label.className = 'media-label';
    label.textContent = item.title;
    button.appendChild(label);
  }

  return button;
}

function renderCardMedia() {
  const mediaContainers = document.querySelectorAll('.card-media[data-media-key]');
  mediaContainers.forEach((container) => {
    const galleryKey = container.getAttribute('data-media-key') || '';
    const items = cardMediaLibrary[galleryKey] || [];
    container.innerHTML = '';

    if (!items.length) {
      return;
    }

    const total = items.length;
    const currentIndex = Math.min(cardMediaState.get(galleryKey) || 0, total - 1);
    cardMediaState.set(galleryKey, currentIndex);

    const shell = document.createElement('div');
    shell.className = 'card-media-shell';

    const frame = document.createElement('div');
    frame.className = 'card-media-frame';
    frame.appendChild(buildCardMediaItem(items[currentIndex], galleryKey, currentIndex));

    if (total > 1) {
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'media-carousel-btn media-overlay media-prev';
      prev.setAttribute('aria-label', `Previous ${galleryKey} photo`);
      prev.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        cardMediaState.set(galleryKey, (currentIndex - 1 + total) % total);
        renderCardMedia();
      });

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'media-carousel-btn media-overlay media-next';
      next.setAttribute('aria-label', `Next ${galleryKey} photo`);
      next.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        cardMediaState.set(galleryKey, (currentIndex + 1) % total);
        renderCardMedia();
      });

      frame.appendChild(prev);
      frame.appendChild(next);

      const dots = document.createElement('div');
      dots.className = 'card-media-dots';
      items.forEach((item, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `card-media-dot${index === currentIndex ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Show photo ${index + 1} of ${total}`);
        dot.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          cardMediaState.set(galleryKey, index);
          renderCardMedia();
        });
        dots.appendChild(dot);
      });

      shell.appendChild(frame);
      shell.appendChild(dots);
    } else {
      shell.appendChild(frame);
    }

    bindFrameHoverState(frame);
    updateFrameRatio(frame, galleryKey, items);

    container.appendChild(shell);
  });
}

renderCardMedia();

if (lbZoomIn) {
  lbZoomIn.addEventListener('click', () => {
    lightboxZoom = Math.min(3, lightboxZoom + 0.2);
    applyLightboxZoom();
  });
}

if (lbZoomOut) {
  lbZoomOut.addEventListener('click', () => {
    lightboxZoom = Math.max(0.6, lightboxZoom - 0.2);
    applyLightboxZoom();
  });
}

if (lbZoomReset) {
  lbZoomReset.addEventListener('click', () => {
    resetLightboxTransform();
  });
}

if (lbPrev) {
  lbPrev.addEventListener('click', () => {
    navigateGallery(-1);
  });
}

if (lbNext) {
  lbNext.addEventListener('click', () => {
    navigateGallery(1);
  });
}

if (lbClose) {
  lbClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.close === 'true') {
      closeLightbox();
    }
  });
}

if (lightboxStage) {
  lightboxStage.addEventListener('wheel', (event) => {
    if (!lightboxMedia) return;
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    lightboxZoom = Math.max(0.6, Math.min(3, lightboxZoom + delta));
    applyLightboxZoom();
  }, { passive: false });

  lightboxStage.addEventListener('pointerdown', (event) => {
    if (!lightboxMedia || lightboxZoom <= 1) return;
    if (event.button !== 0 && event.button !== 1) return;

    event.preventDefault();
    lightboxDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: lightboxPanX,
      panY: lightboxPanY
    };
    lightboxStage.setPointerCapture(event.pointerId);
    lightboxStage.classList.add('is-dragging');
  });

  lightboxStage.addEventListener('pointermove', (event) => {
    if (!lightboxDrag || event.pointerId !== lightboxDrag.pointerId) return;

    event.preventDefault();
    lightboxPanX = lightboxDrag.panX + (event.clientX - lightboxDrag.startX);
    lightboxPanY = lightboxDrag.panY + (event.clientY - lightboxDrag.startY);
    applyLightboxZoom();
  });

  const endDrag = (event) => {
    if (!lightboxDrag || event.pointerId !== lightboxDrag.pointerId) return;
    lightboxDrag = null;
    lightboxStage.classList.remove('is-dragging');
  };

  lightboxStage.addEventListener('pointerup', endDrag);
  lightboxStage.addEventListener('pointercancel', endDrag);
  lightboxStage.addEventListener('lostpointercapture', endDrag);

  lightboxStage.addEventListener('mousedown', (event) => {
    if (event.button === 1 && lightboxZoom > 1) {
      event.preventDefault();
    }
  });

  lightboxStage.addEventListener('auxclick', (event) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
    closeLightbox();
    return;
  }

  if (!lightbox || lightbox.classList.contains('hidden')) return;

  if (event.key === 'ArrowLeft' && lightboxState.items.length > 1) {
    event.preventDefault();
    navigateGallery(-1);
  }

  if (event.key === 'ArrowRight' && lightboxState.items.length > 1) {
    event.preventDefault();
    navigateGallery(1);
  }
});