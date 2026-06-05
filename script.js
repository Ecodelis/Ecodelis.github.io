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