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
    { type: 'image', src: 'assets/images/test.jpg', title: 'WEC - Photo', alt: 'WEC media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'WEC - Video' }
  ],
  bec: [
    { type: 'image', src: 'assets/images/test.jpg', title: 'BEC - Photo', alt: 'BEC media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'BEC - Video' }
  ],
  capstone: [
    { type: 'image', src: 'assets/images/test.jpg', title: 'Supercritical CO2 Battery Recycling - Photo', alt: 'Capstone media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'Supercritical CO2 Battery Recycling - Video' }
  ],
  rccar: [
    { type: 'image', src: 'assets/images/test.jpg', title: 'Radio-Controlled Car - Photo', alt: 'RC car media preview' },
    { type: 'video', src: 'assets/images/test.mp4', title: 'Radio-Controlled Car - Video' }
  ]
};

function buildCardMediaItem(item) {
  const button = document.createElement('button');
  button.className = 'media-item inline-media';
  button.type = 'button';
  button.setAttribute('data-type', item.type);
  button.setAttribute('data-src', item.src);
  button.setAttribute('data-title', item.title || 'Media Viewer');

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

  return button;
}

function renderCardMedia() {
  const mediaContainers = document.querySelectorAll('.card-media[data-media-key]');
  mediaContainers.forEach((container) => {
    const key = container.getAttribute('data-media-key') || '';
    const items = cardMediaLibrary[key] || [];
    container.innerHTML = '';
    items.forEach((item) => {
      container.appendChild(buildCardMediaItem(item));
    });
  });
}

renderCardMedia();

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

const mediaItems = Array.from(document.querySelectorAll('.media-item'));
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxTitle = document.getElementById('lightbox-title');
const lbZoomIn = document.getElementById('lb-zoom-in');
const lbZoomOut = document.getElementById('lb-zoom-out');
const lbZoomReset = document.getElementById('lb-zoom-reset');
const lbClose = document.getElementById('lb-close');

let lightboxMedia = null;
let lightboxZoom = 1;

function applyLightboxZoom() {
  if (!lightboxMedia) return;
  lightboxMedia.style.transform = `scale(${lightboxZoom})`;
  lbZoomReset.textContent = `${Math.round(lightboxZoom * 100)}%`;
}

function closeLightbox() {
  if (!lightbox || !lightboxStage) return;
  if (lightboxMedia && lightboxMedia.tagName === 'VIDEO') {
    lightboxMedia.pause();
  }
  lightboxMedia = null;
  lightboxZoom = 1;
  lightboxStage.innerHTML = '';
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
}

function openLightbox(type, src, titleText) {
  if (!lightbox || !lightboxStage) return;

  lightboxZoom = 1;
  lightboxStage.innerHTML = '';

  if (type === 'video') {
    const video = document.createElement('video');
    video.className = 'lb-media video';
    video.controls = true;
    video.src = src;
    video.preload = 'metadata';
    video.playsInline = true;
    lightboxMedia = video;
  } else {
    const img = document.createElement('img');
    img.className = 'lb-media image';
    img.src = src;
    img.alt = titleText || 'Expanded gallery image';
    img.draggable = false;
    lightboxMedia = img;
  }

  lightboxStage.appendChild(lightboxMedia);
  applyLightboxZoom();

  if (lightboxTitle) {
    lightboxTitle.textContent = titleText || 'Media Viewer';
  }

  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
}

mediaItems.forEach((item) => {
  item.addEventListener('click', () => {
    const type = item.getAttribute('data-type') || 'image';
    const src = item.getAttribute('data-src') || '';
    const titleText = item.getAttribute('data-title') || 'Media Viewer';
    if (!src) return;
    openLightbox(type, src, titleText);
  });
});

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
    lightboxZoom = 1;
    applyLightboxZoom();
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
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
    closeLightbox();
  }
});