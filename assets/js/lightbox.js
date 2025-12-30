let lightboxState = {
  items: [],
  index: 0,
};

function mountLightbox() {
  let lb = document.querySelector('.lightbox');
  if (lb) return lb;

  lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox__content">
      <button class="lightbox__nav prev" aria-label="Previous">‹</button>
      <img class="lightbox__img" alt="reference preview" />
      <button class="lightbox__nav next" aria-label="Next">›</button>
      <button class="lightbox__close" aria-label="Close">✕</button>
    </div>
  `;
  document.body.appendChild(lb);

  lb.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
  lb.querySelector('.lightbox__nav.prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lightbox__nav.next').addEventListener('click', () => step(1));

  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  let startX = 0;
  lb.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
  });
  lb.addEventListener('pointerup', (e) => {
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) {
      step(delta > 0 ? -1 : 1);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  return lb;
}

function renderLightbox() {
  const lb = mountLightbox();
  const img = lb.querySelector('.lightbox__img');
  const { items, index } = lightboxState;
  if (!items.length) return;
  const item = items[index];
  img.src = item.src;
  img.alt = item.alt || 'reference image';
}

function step(delta) {
  const { items } = lightboxState;
  if (!items.length) return;
  lightboxState.index = (lightboxState.index + delta + items.length) % items.length;
  renderLightbox();
}

function openLightbox(items, index = 0) {
  lightboxState = { items, index };
  const lb = mountLightbox();
  lb.classList.add('open');
  document.body.classList.add('lock-scroll');
  renderLightbox();
}

function closeLightbox() {
  const lb = mountLightbox();
  lb.classList.remove('open');
  document.body.classList.remove('lock-scroll');
}

window.openLightbox = openLightbox;

