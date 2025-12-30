const state = {
  mode: 'designer',
  category: 'all',
  posts: [],
  references: [],
};

const modeButtons = {};
const categoryButtons = {};

async function loadData() {
  const [postsRes, refsRes] = await Promise.all([
    fetch('content/posts.json'),
    fetch('content/references.json'),
  ]);

  state.posts = await postsRes.json();
  state.references = await refsRes.json();
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/\s+/g, '-');
}

function setupControls() {
  modeButtons.designer = document.querySelector('[data-mode="designer"]');
  modeButtons.references = document.querySelector('[data-mode="references"]');

  document.querySelectorAll('[data-category]').forEach((btn) => {
    categoryButtons[btn.dataset.category] = btn;
  });

  Object.values(modeButtons).forEach((btn) =>
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      updateModeUI();
      render();
    }),
  );

  Object.values(categoryButtons).forEach((btn) =>
    btn.addEventListener('click', () => {
      state.category = btn.dataset.category;
      updateCategoryUI();
      render();
    }),
  );
}

function updateModeUI() {
  Object.values(modeButtons).forEach((btn) => btn.classList.remove('active'));
  modeButtons[state.mode].classList.add('active');

  const phrase = document.querySelector('.phrase');
  if (phrase) phrase.textContent = state.mode === 'designer' ? 'который умеет' : 'в которых';
}

function updateCategoryUI() {
  Object.values(categoryButtons).forEach((btn) => btn.classList.remove('active'));
  if (categoryButtons[state.category]) {
    categoryButtons[state.category].classList.add('active');
  }
}

function filterPosts() {
  if (state.category === 'all') return state.posts;
  return state.posts.filter((post) => {
    const tagMatch =
      (post.tags_hidden || []).map(normalize).includes(state.category) ||
      (post.tags_visible || []).map(normalize).includes(state.category);
    return tagMatch;
  });
}

function filterReferences() {
  if (state.category === 'all') return state.references;
  return state.references.filter((ref) => (ref.tags || []).map(normalize).includes(state.category));
}

// Throttled scroll handler for mobile video autoplay
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function handleMobileVideoScroll() {
  if (window.innerWidth > 1100) return;

  const videos = document.querySelectorAll('.card-video');
  const windowCenter = window.innerHeight / 2;
  let closestVideo = null;
  let minDistance = Infinity;

  // Find the video closest to the center of the viewport
  videos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    // Only consider videos that are actually visible
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const videoCenter = rect.top + rect.height / 2;
      const distance = Math.abs(windowCenter - videoCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestVideo = video;
      }
    }
  });

  // Update playback state for all videos
  videos.forEach((video) => {
    if (video === closestVideo) {
      if (video.paused) {
        if (video.readyState === 0) video.load();
        video
          .play()
          .then(() => video.classList.add('playing'))
          .catch(() => {});
      }
    } else {
      if (!video.paused || video.currentTime > 0) {
        video.pause();
        video.currentTime = 0;
        video.classList.remove('playing');
      }
    }
  });
}

// Add scroll listener
window.addEventListener('scroll', throttle(handleMobileVideoScroll, 200));
window.addEventListener('resize', throttle(handleMobileVideoScroll, 200));

function createBadge(label) {
  const el = document.createElement('span');
  el.className = 'badge';
  el.textContent = label;
  return el;
}

function renderPosts() {
  const container = document.querySelector('#content');
  container.className = 'cards-grid';
  container.innerHTML = '';

  const columns = [document.createElement('div'), document.createElement('div')];
  columns.forEach((col) => col.classList.add('cards-column'));

  const posts = filterPosts();
  posts.forEach((post, idx) => {
    const column = columns[idx % 2];
    const card = document.createElement('article');
    card.className = 'card';
    if (post.slug) {
      card.tabIndex = 0;
      card.addEventListener('click', () => (window.location.href = `posts/${post.slug}.html`));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') card.click();
      });
    } else if (post.link) {
      card.tabIndex = 0;
      card.addEventListener('click', () => window.open(post.link, '_blank'));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') card.click();
      });
    } else {
      card.classList.add('static');
    }

    const media = document.createElement('div');
    media.className = 'card-media';
    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.title;
    media.appendChild(img);

    if (post.video) {
      const video = document.createElement('video');
      video.src = post.video;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.preload = 'none';
      video.className = 'card-video';
      media.appendChild(video);

      // Trigger initial check for mobile
      if (window.innerWidth <= 1100) {
        setTimeout(handleMobileVideoScroll, 500);
      }

      card.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 1100) return;
        if (video.readyState === 0) video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              video.classList.add('playing');
            })
            .catch((error) => {
              console.log('Video play prevented', error);
            });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (window.innerWidth <= 1100) return;
        video.pause();
        video.currentTime = 0;
        video.classList.remove('playing');
      });
    }

    const info = document.createElement('div');
    info.className = 'info-section';

    const badges = document.createElement('div');
    badges.className = 'badge-row';
    if (post.badge_dprofile) {
      const icon = document.createElement('img');
      icon.src = 'images/placeholders/badge-icon.svg';
      icon.alt = '';
      icon.width = 20;
      icon.height = 20;
      icon.className = 'badge-icon';
      badges.appendChild(icon);
    }
    if (post.badge_madein) {
      const made = document.createElement('img');
      made.src = 'images/placeholders/badge-madein.svg';
      made.alt = 'MADE IN';
      made.width = 115;
      made.height = 28;
      badges.appendChild(made);
    }
    (post.tags_visible || []).forEach((t) => badges.appendChild(createBadge(t)));

    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = post.title;

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = post.description;

    info.append(badges, title, desc);
    card.append(media, info);
    column.appendChild(card);
  });

  container.append(columns[0], columns[1]);
}

function renderReferences() {
  const container = document.querySelector('#content');
  container.className = 'references-grid';
  container.innerHTML = '';
  const refs = filterReferences();
  const columns = [document.createElement('div'), document.createElement('div')];
  columns.forEach((col) => col.classList.add('references-column'));

  refs.forEach((ref, index) => {
    const column = columns[index % 2];
    const tile = document.createElement('div');
    tile.className = 'reference-tile';
    tile.dataset.index = index;
    const img = document.createElement('img');
    img.src = ref.src;
    img.alt = ref.alt || 'reference image';
    tile.appendChild(img);
    tile.addEventListener('click', () => openLightbox(refs, index));
    column.appendChild(tile);
  });

  container.append(columns[0], columns[1]);
}

function render() {
  if (state.mode === 'designer') {
    renderPosts();
  } else {
    renderReferences();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  setupControls();
  updateModeUI();
  updateCategoryUI();
  await loadData();
  render();
});

