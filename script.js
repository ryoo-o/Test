(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const VIDEO_EXTENSIONS = ['mp4', 'webm'];
  const MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

  const getExtension = source => {
    if (!source) return '';

    const cleanSource = source
      .split('?')[0]
      .split('#')[0]
      .trim();

    const match = cleanSource.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
  };

  const isImage = source =>
    IMAGE_EXTENSIONS.includes(getExtension(source));

  const isVideo = source =>
    VIDEO_EXTENSIONS.includes(getExtension(source));

  const isMedia = source =>
    MEDIA_EXTENSIONS.includes(getExtension(source));

  const getMediaType = source => {
    if (isVideo(source)) return 'video';
    if (isImage(source)) return 'image';
    return null;
  };

  const getMimeType = source => {
    const extension = getExtension(source);

    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      webm: 'video/webm'
    };

    return mimeTypes[extension] || '';
  };

  const createVideo = (source, options = {}) => {
    const video = document.createElement('video');

    video.src = source;
    video.preload = options.preload || 'metadata';
    video.playsInline = true;
    video.controls = options.controls ?? false;
    video.loop = options.loop ?? false;
    video.muted = options.muted ?? true;

    if (options.autoplay) {
      video.autoplay = true;
    }

    if (options.className) {
      video.className = options.className;
    }

    if (options.alt) {
      video.setAttribute('aria-label', options.alt);
    }

    return video;
  };

  const createImage = (source, options = {}) => {
    const image = document.createElement('img');

    image.src = source;
    image.alt = options.alt || '';
    image.loading = options.loading || 'lazy';
    image.decoding = 'async';

    if (options.className) {
      image.className = options.className;
    }

    return image;
  };

  const createMedia = (source, options = {}) => {
    const type = getMediaType(source);

    if (type === 'video') {
      return createVideo(source, options);
    }

    if (type === 'image') {
      return createImage(source, options);
    }

    return null;
  };

  const setupAutomaticMedia = () => {
    $$('img').forEach(image => {
      const source = image.currentSrc || image.getAttribute('src');

      if (!source || !isVideo(source)) return;

      const video = createVideo(source, {
        controls: image.dataset.controls === 'true',
        autoplay: image.dataset.autoplay === 'true',
        loop: image.dataset.loop !== 'false',
        muted: image.dataset.muted !== 'false',
        className: image.className,
        alt: image.alt
      });

      if (image.dataset.poster) {
        video.poster = image.dataset.poster;
      }

      image.replaceWith(video);
    });

    $$('[data-media-src]').forEach(container => {
      const source = container.dataset.mediaSrc;

      if (!source || !isMedia(source)) return;

      const media = createMedia(source, {
        controls: container.dataset.controls === 'true',
        autoplay: container.dataset.autoplay === 'true',
        loop: container.dataset.loop !== 'false',
        muted: container.dataset.muted !== 'false',
        alt: container.dataset.alt || '',
        className: container.dataset.mediaClass || ''
      });

      if (!media) return;

      if (container.dataset.poster && media.tagName === 'VIDEO') {
        media.poster = container.dataset.poster;
      }

      container.replaceChildren(media);
    });
  };

  const setupDynamicMedia = () => {
    $$('.media-frame').forEach(frame => {
      const source =
        frame.dataset.src ||
        frame.dataset.mediaSrc ||
        frame.getAttribute('src');

      if (!source || !isMedia(source)) return;

      const existing = frame.querySelector('img, video');

      if (existing) {
        const existingSource =
          existing.currentSrc ||
          existing.getAttribute('src');

        if (existingSource === source) return;
      }

      const media = createMedia(source, {
        controls: frame.dataset.controls === 'true',
        autoplay: frame.dataset.autoplay === 'true',
        loop: frame.dataset.loop !== 'false',
        muted: frame.dataset.muted !== 'false',
        alt: frame.dataset.alt || '',
        className: frame.dataset.mediaClass || ''
      });

      if (!media) return;

      if (frame.dataset.poster && media.tagName === 'VIDEO') {
        media.poster = frame.dataset.poster;
      }

      frame.replaceChildren(media);
    });
  };

  const setupMediaFallbacks = () => {
    $$('img').forEach(image => {
      image.addEventListener('error', () => {
        image.classList.add('media-error');
      });
    });

    $$('video').forEach(video => {
      video.addEventListener('error', () => {
        video.classList.add('media-error');
      });
    });
  };

  const menuButton = $('.menu-toggle');
  const nav = $('.nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');

      menuButton.setAttribute(
        'aria-expanded',
        String(open)
      );
    });

    $$('.nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const sections = $$('main section[id], section[id]');
  const navLinks = $$('.nav a[href^="#"]');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0
      }
    );

    sections.forEach(section => observer.observe(section));
  }

  const cursorGlow = $('.cursor-glow');

  if (cursorGlow) {
    window.addEventListener(
      'pointermove',
      event => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      },
      { passive: true }
    );
  }

  const audio = $('#audio');
  const player = $('#playerPanel');
  const playBtn = $('#playBtn');
  const seek = $('#seek');
  const volume = $('#volume');
  const currentTime = $('#currentTime');
  const duration = $('#duration');
  const toast = $('#musicToast');

  let musicAvailable = false;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const showToast = message => {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  };

  const updatePlayButton = () => {
    if (!playBtn) return;

    const playing = audio && !audio.paused;

    playBtn.textContent = playing ? '❚❚' : '▶';
    playBtn.setAttribute(
      'aria-label',
      playing ? 'Pause music' : 'Play music'
    );

    if (player) {
      player.classList.toggle('is-playing', playing);
    }
  };

  const playMusic = async () => {
    if (!audio || !musicAvailable) {
      showToast('Music file is unavailable.');
      return;
    }

    try {
      await audio.play();
      updatePlayButton();
    } catch {
      showToast('Tap play to start the music.');
    }
  };

  const pauseMusic = () => {
    if (!audio) return;

    audio.pause();
    updatePlayButton();
  };

  const toggleMusic = () => {
    if (!audio) return;

    if (audio.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  };

  if (audio) {
    audio.addEventListener('loadedmetadata', () => {
      musicAvailable = true;

      if (duration) {
        duration.textContent = formatTime(audio.duration);
      }

      if (seek) {
        seek.max = audio.duration || 0;
      }
    });

    audio.addEventListener('canplay', () => {
      musicAvailable = true;
    });

    audio.addEventListener('timeupdate', () => {
      if (currentTime) {
        currentTime.textContent = formatTime(audio.currentTime);
      }

      if (seek && Number.isFinite(audio.duration)) {
        seek.value = audio.currentTime;
        seek.style.setProperty(
          '--progress',
          `${(audio.currentTime / audio.duration) * 100}%`
        );
      }
    });

    audio.addEventListener('play', updatePlayButton);
    audio.addEventListener('pause', updatePlayButton);

    audio.addEventListener('ended', () => {
      const repeatButton = $('#repeatBtn');

      if (repeatButton?.classList.contains('active')) {
        audio.currentTime = 0;
        playMusic();
      } else {
        updatePlayButton();
      }
    });

    audio.addEventListener('error', () => {
      musicAvailable = false;
      updatePlayButton();
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', toggleMusic);
  }

  if (seek && audio) {
    seek.addEventListener('input', () => {
      if (!Number.isFinite(audio.duration)) return;

      audio.currentTime = Number(seek.value);
    });
  }

  if (volume && audio) {
    audio.volume = Number(volume.value);

    volume.addEventListener('input', () => {
      audio.volume = Number(volume.value);
    });
  }

  const quickMusicButton = $('[data-music], .music-btn');

  if (quickMusicButton) {
    quickMusicButton.addEventListener('click', () => {
      if (player) {
        player.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      setTimeout(playMusic, 500);
    });
  }

  const musicNav = $('.music-nav');

  if (musicNav) {
    musicNav.addEventListener('click', event => {
      event.preventDefault();

      if (player) {
        player.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      setTimeout(playMusic, 500);
    });
  }

  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const shuffleBtn = $('#shuffleBtn');
  const repeatBtn = $('#repeatBtn');
  const likeBtn = $('#likeBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!audio) return;

      audio.currentTime = 0;
      showToast('Restarted track');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!audio) return;

      audio.currentTime = 0;
      playMusic();
      showToast('Playing track again');
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      shuffleBtn.classList.toggle('active');
      showToast(
        shuffleBtn.classList.contains('active')
          ? 'Shuffle on'
          : 'Shuffle off'
      );
    });
  }

  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      repeatBtn.classList.toggle('active');

      showToast(
        repeatBtn.classList.contains('active')
          ? 'Repeat on'
          : 'Repeat off'
      );
    });
  }

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('active');

      const liked = likeBtn.classList.contains('active');

      likeBtn.setAttribute(
        'aria-label',
        liked ? 'Unlike track' : 'Like track'
      );
    });
  }

  const characterModal = $('#characterModal');
  const characterModalMedia =
    $('#characterModalMedia') ||
    $('#characterModalImage');

  const characterModalName = $('#characterModalName');
  const characterModalSub = $('#characterModalSub');

  const closeCharacterModal = () => {
    if (!characterModal) return;

    characterModal.classList.remove('open');
    characterModal.setAttribute('aria-hidden', 'true');

    if (characterModalMedia) {
      if (characterModalMedia.tagName === 'VIDEO') {
        characterModalMedia.pause();
      }
    }
  };

  const openCharacterModal = card => {
    if (!characterModal) return;

    const source =
      card.dataset.media ||
      card.dataset.src ||
      card.querySelector('img, video')?.currentSrc ||
      card.querySelector('img, video')?.getAttribute('src');

    const name =
      card.dataset.name ||
      card.querySelector('.character-name, h3, h4')?.textContent ||
      '';

    const sub =
      card.dataset.sub ||
      card.querySelector('.character-sub, p')?.textContent ||
      '';

    if (!source || !isMedia(source)) return;

    if (characterModalName) {
      characterModalName.textContent = name;
    }

    if (characterModalSub) {
      characterModalSub.textContent = sub;
    }

    if (characterModalMedia) {
      const parent = characterModalMedia.parentElement;
      const newMedia = createMedia(source, {
        controls: isVideo(source),
        autoplay: isVideo(source),
        loop: true,
        muted: true,
        alt: name,
        className: characterModalMedia.className
      });

      if (newMedia) {
        characterModalMedia.replaceWith(newMedia);

        if (parent) {
          parent.dataset.currentSource = source;
        }
      }
    }

    characterModal.classList.add('open');
    characterModal.setAttribute('aria-hidden', 'false');
  };

  $$('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      openCharacterModal(card);
    });

    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCharacterModal(card);
      }
    });

    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
  });

  if (characterModal) {
    $$(
      '[data-close-character], .character-modal-close, #characterModal .modal-close',
      characterModal
    ).forEach(button => {
      button.addEventListener('click', closeCharacterModal);
    });

    characterModal.addEventListener('click', event => {
      if (event.target === characterModal) {
        closeCharacterModal();
      }
    });
  }

  const lightbox = $('#lightbox');
  const modalImage = $('#modalImage');
  const modalMedia = $('#modalMedia') || modalImage;
  const modalCaption = $('#modalCaption');

  const closeLightbox = () => {
    if (!lightbox) return;

    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');

    const video = lightbox.querySelector('video');

    if (video) {
      video.pause();
    }
  };

  const openLightbox = (source, caption = '') => {
    if (!lightbox || !source || !isMedia(source)) return;

    if (modalCaption) {
      modalCaption.textContent = caption;
    }

    const oldMedia =
      lightbox.querySelector('img, video');

    const parent =
      oldMedia?.parentElement ||
      modalMedia?.parentElement ||
      lightbox;

    const newMedia = createMedia(source, {
      controls: isVideo(source),
      autoplay: false,
      loop: true,
      muted: true,
      alt: caption,
      className: oldMedia?.className || 'modal-image'
    });

    if (newMedia) {
      oldMedia?.replaceWith(newMedia);

      if (!oldMedia && modalMedia) {
        modalMedia.replaceWith(newMedia);
      }

      if (parent) {
        parent.dataset.currentSource = source;
      }
    }

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  $$('.gallery-item, .gallery-card, [data-gallery]').forEach(item => {
    item.addEventListener('click', () => {
      const media =
        item.querySelector('img, video');

      const source =
        item.dataset.media ||
        item.dataset.src ||
        media?.currentSrc ||
        media?.getAttribute('src');

      const caption =
        item.dataset.caption ||
        item.querySelector('.gallery-caption')?.textContent ||
        media?.alt ||
        '';

      openLightbox(source, caption);
    });
  });

  if (lightbox) {
    $$(
      '[data-close-lightbox], .modal-close, #lightbox .close',
      lightbox
    ).forEach(button => {
      button.addEventListener('click', closeLightbox);
    });

    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    closeLightbox();
    closeCharacterModal();
  });

  const messageBox = $('#messageBox');
  const messageCounter = $('#messageCounter');
  const messageStatus = $('#messageStatus');
  const messageForm = $('#messageForm');
  const sendMessage = $('#sendMessage');

  const MESSAGE_LIMIT = 500;

  const updateMessageCount = () => {
    if (!messageBox) return;

    const length = messageBox.value.length;

    if (messageCounter) {
      messageCounter.textContent =
        `${length}/${MESSAGE_LIMIT}`;
    }

    if (length > MESSAGE_LIMIT) {
      messageBox.value =
        messageBox.value.slice(0, MESSAGE_LIMIT);
    }
  };

  if (messageBox) {
    messageBox.maxLength = MESSAGE_LIMIT;

    messageBox.addEventListener(
      'input',
      updateMessageCount
    );

    updateMessageCount();
  }

  const saveMessage = () => {
    if (!messageBox) return;

    const message = messageBox.value.trim();

    if (!message) {
      if (messageStatus) {
        messageStatus.textContent =
          'Write a message first ✦';
      }

      return;
    }

    try {
      sessionStorage.setItem(
        'rubyBirthdayMessage',
        message
      );
    } catch {}

    if (messageStatus) {
      messageStatus.textContent =
        'Your message has been saved for this visit ✦';
    }

    showToast('Message saved ✦');
  };

  if (messageForm) {
    messageForm.addEventListener('submit', event => {
      event.preventDefault();
      saveMessage();
    });
  }

  if (sendMessage) {
    sendMessage.addEventListener('click', event => {
      if (!messageForm) {
        event.preventDefault();
        saveMessage();
      }
    });
  }

  try {
    const savedMessage =
      sessionStorage.getItem('rubyBirthdayMessage');

    if (savedMessage && messageBox) {
      messageBox.value = savedMessage;
      updateMessageCount();

      if (messageStatus) {
        messageStatus.textContent =
          'Your message is saved for this visit ✦';
      }
    }
  } catch {}

  setupAutomaticMedia();
  setupDynamicMedia();
  setupMediaFallbacks();

  const mediaObserver = new MutationObserver(() => {
    setupAutomaticMedia();
    setupDynamicMedia();
    setupMediaFallbacks();
  });

  mediaObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    $$('.gallery-item video, .character-card video').forEach(
      video => {
        video.autoplay = false;
        video.pause();
      }
    );
  }
})();playBtn.addEventListener('click', play);
$('#quickMusic').addEventListener('click', play);
$('#musicNav').addEventListener('click', () => document.querySelector('#playerPanel').scrollIntoView({behavior:'smooth', block:'center'}));

seek.addEventListener('input', () => {
if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
audio.currentTime = (Number(seek.value) / 100) * audio.duration;
setProgress(Number(seek.value));
});

volume.addEventListener('input', () => {
audio.volume = Number(volume.value);
});

$('#prevBtn').addEventListener('click', () => {
audio.currentTime = 0;
if (audio.paused && musicAvailable) play();
});

$('#nextBtn').addEventListener('click', () => {
audio.currentTime = 0;
if (shuffle && Number.isFinite(audio.duration) && audio.duration > 0) {
audio.currentTime = Math.random() * Math.max(0, audio.duration - 1);
}
if (audio.paused && musicAvailable) play();
});

shuffleBtn.addEventListener('click', () => {
shuffle = !shuffle;
shuffleBtn.classList.toggle('active', shuffle);
shuffleBtn.setAttribute('aria-pressed', String(shuffle));
});

repeatBtn.addEventListener('click', () => {
repeat = !repeat;
repeatBtn.classList.toggle('active', repeat);
repeatBtn.setAttribute('aria-pressed', String(repeat));
});

$('#likeTrack').addEventListener('click', e => e.currentTarget.classList.toggle('active'));

const characterModal = $('#characterModal');
const cImage = $('#characterModalImage'), cName = $('#characterModalName'), cSub = $('#characterModalSub');

const openModal = el => {
el.classList.add('open');
el.setAttribute('aria-hidden','false');
document.body.classList.add('modal-open');
};

const closeAll = () => {
$$('.modal.open').forEach(m => {
m.classList.remove('open');
m.setAttribute('aria-hidden','true');
});
document.body.classList.remove('modal-open');
};

$$('.character-card').forEach(card => card.addEventListener('click', () => {
cImage.src = card.dataset.image;
cImage.alt = card.dataset.name;
cName.textContent = card.dataset.name;
cSub.textContent = card.dataset.sub;
openModal(characterModal);
}));

const lightbox = $('#lightbox'), modalImage = $('#modalImage'), modalCaption = $('#modalCaption');

$$('.gallery-item').forEach(item => item.addEventListener('click', () => {
modalImage.src = item.dataset.lightbox;
modalCaption.textContent = item.dataset.caption || '';
modalImage.alt = item.dataset.caption || '';
openModal(lightbox);
}));

$$('.modal-close').forEach(b => b.addEventListener('click', closeAll));
$$('.modal').forEach(m => m.addEventListener('click', e => {
if(e.target === m) closeAll();
}));

document.addEventListener('keydown', e => {
if(e.key === 'Escape') closeAll();
});

const box = $('#messageBox'), count = $('#charCount'), send = $('#sendMessage'), status = $('#messageStatus');

box.addEventListener('input', () => count.textContent = `${box.value.length} / 500`);

send.addEventListener('click', () => {
if(!box.value.trim()) {
status.textContent = 'Write a little something first ✦';
return;
}

status.textContent = 'Message saved for this visit. ✦';
send.textContent = 'SENT ✓';

setTimeout(() => {
  send.textContent='SEND MESSAGE ✦';
}, 1800);

});
})();  };

  const isImage = source =>
    IMAGE_EXTENSIONS.includes(getExtension(source));

  const isVideo = source =>
    VIDEO_EXTENSIONS.includes(getExtension(source));

  const isAudio = source =>
    AUDIO_EXTENSIONS.includes(getExtension(source));

  const createMediaElement = (
    source,
    {
      autoplay = false,
      muted = true,
      loop = false,
      controls = false,
      playsInline = true,
      className = '',
      alt = ''
    } = {}
  ) => {
    if (!source) return null;

    if (isVideo(source)) {
      const video = document.createElement('video');

      video.src = source;
      video.autoplay = autoplay;
      video.muted = muted;
      video.loop = loop;
      video.controls = controls;
      video.playsInline = playsInline;
      video.preload = 'metadata';
      video.className = className;

      return video;
    }

    if (isImage(source)) {
      const img = document.createElement('img');

      img.src = source;
      img.alt = alt;
      img.className = className;
      img.loading = 'lazy';

      return img;
    }

    return null;
  };

  const createFallback = source => {
    const fallback = document.createElement('div');
    fallback.className = 'media-fallback';
    fallback.textContent = `Unsupported media format: ${getExtension(source) || 'unknown'}`;
    return fallback;
  };

  const setupMedia = (
    container,
    source,
    options = {}
  ) => {
    if (!container || !source) return null;

    container.innerHTML = '';

    const media = createMediaElement(source, options);

    if (!media) {
      container.appendChild(createFallback(source));
      return null;
    }

    media.addEventListener('error', () => {
      if (!container.querySelector('.media-fallback')) {
        container.innerHTML = '';
        container.appendChild(createFallback(source));
      }
    });

    container.appendChild(media);

    return media;
  };

  $$('.media-frame').forEach(container => {
    const source = container.dataset.media;

    setupMedia(container, source, {
      autoplay: container.closest('.hero-bg') ? true : false,
      muted: true,
      loop: true,
      playsInline: true,
      alt: container.dataset.alt || ''
    });
  });

  const heroBackground = $('.hero-bg');

  if (heroBackground) {
    const heroSource = heroBackground.dataset.media;

    if (isVideo(heroSource)) {
      heroBackground.querySelector('video')?.setAttribute('aria-hidden', 'true');
    }
  }

  const galleryItems = $$('.gallery-item');

  galleryItems.forEach(item => {
    const source = item.dataset.lightbox;
    const mediaContainer = $('.gallery-media', item);

    if (mediaContainer && !mediaContainer.children.length) {
      setupMedia(mediaContainer, source, {
        autoplay: isVideo(source),
        muted: true,
        loop: true,
        playsInline: true,
        alt: item.dataset.caption || ''
      });
    }
  });

  const characterCards = $$('.character-card');

  characterCards.forEach(card => {
    const source = card.dataset.image;
    const mediaContainer = $('.character-media', card);

    if (mediaContainer && !mediaContainer.children.length) {
      setupMedia(mediaContainer, source, {
        autoplay: isVideo(source),
        muted: true,
        loop: true,
        playsInline: true,
        alt: card.dataset.name || ''
      });
    }
  });

  const audio = $('#audio');
  const player = $('#playerPanel');
  const playBtn = $('#playBtn');
  const seek = $('#seek');
  const volume = $('#volume');
  const currentTime = $('#currentTime');
  const duration = $('#duration');
  const toast = $('#musicToast');
  const shuffleBtn = $('#shuffleBtn');
  const repeatBtn = $('#repeatBtn');

  let musicAvailable = false;
  let shuffle = false;
  let repeat = false;
  let toastTimer;

  const MUSIC_SOURCE = 'assets/music.mp3';

  const fmt = seconds => {
    seconds = Number.isFinite(seconds)
      ? Math.max(0, Math.floor(seconds))
      : 0;

    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const setProgress = percentage => {
    if (!seek) return;

    const value = Math.max(
      0,
      Math.min(100, Number(percentage) || 0)
    );

    seek.style.setProperty('--progress', `${value}%`);
  };

  const showToast = message => {
    if (!toast) return;

    if (message) {
      toast.innerHTML = message;
    }

    clearTimeout(toastTimer);

    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  };

  if (audio) {
    audio.src = MUSIC_SOURCE;
    audio.preload = 'metadata';
    audio.volume = 0.85;

    if (volume) {
      volume.value = audio.volume;
    }

    setProgress(0);

    audio.addEventListener('loadedmetadata', () => {
      musicAvailable = true;

      if (duration) {
        duration.textContent = fmt(audio.duration);
      }

      if (currentTime) {
        currentTime.textContent = '0:00';
      }

      if (seek) {
        seek.value = 0;
      }

      setProgress(0);
    });

    audio.addEventListener('canplay', () => {
      musicAvailable = true;
    });

    audio.addEventListener('error', () => {
      musicAvailable = false;
    });

    audio.addEventListener('timeupdate', () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
      }

      const percentage =
        (audio.currentTime / audio.duration) * 100;

      if (seek) {
        seek.value = percentage;
      }

      setProgress(percentage);

      if (currentTime) {
        currentTime.textContent = fmt(audio.currentTime);
      }
    });

    audio.addEventListener('play', () => {
      player?.classList.add('is-playing');

      if (playBtn) {
        playBtn.textContent = 'Ⅱ';
        playBtn.setAttribute('aria-label', 'Pause music');
      }
    });

    audio.addEventListener('pause', () => {
      player?.classList.remove('is-playing');

      if (playBtn) {
        playBtn.textContent = '▶';
        playBtn.setAttribute('aria-label', 'Play music');
      }
    });

    audio.addEventListener('ended', () => {
      if (repeat) {
        audio.currentTime = 0;

        audio.play().catch(() => {
          showToast('Tap the play button to continue the music. ✦');
        });

        return;
      }

      player?.classList.remove('is-playing');

      if (playBtn) {
        playBtn.textContent = '▶';
      }
    });
  }

  const play = async () => {
    if (!audio) return;

    if (!musicAvailable) {
      showToast(
        'Place a supported audio file at <b>assets/music.mp3</b> to activate the player. ✦'
      );
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      showToast('Your browser blocked playback. Tap play again. ✦');
    }
  };

  playBtn?.addEventListener('click', play);
  $('#quickMusic')?.addEventListener('click', play);

  $('#musicNav')?.addEventListener('click', () => {
    $('#playerPanel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  });

  seek?.addEventListener('input', () => {
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const value = Number(seek.value);

    audio.currentTime =
      (value / 100) * audio.duration;

    setProgress(value);
  });

  volume?.addEventListener('input', () => {
    if (!audio) return;

    audio.volume = Number(volume.value);
  });

  $('#prevBtn')?.addEventListener('click', () => {
    if (!audio) return;

    audio.currentTime = 0;

    if (audio.paused && musicAvailable) {
      play();
    }
  });

  $('#nextBtn')?.addEventListener('click', () => {
    if (!audio) return;

    audio.currentTime = 0;

    if (
      shuffle &&
      Number.isFinite(audio.duration) &&
      audio.duration > 0
    ) {
      audio.currentTime =
        Math.random() * Math.max(0, audio.duration - 1);
    }

    if (audio.paused && musicAvailable) {
      play();
    }
  });

  shuffleBtn?.addEventListener('click', () => {
    shuffle = !shuffle;

    shuffleBtn.classList.toggle('active', shuffle);
    shuffleBtn.setAttribute(
      'aria-pressed',
      String(shuffle)
    );
  });

  repeatBtn?.addEventListener('click', () => {
    repeat = !repeat;

    repeatBtn.classList.toggle('active', repeat);
    repeatBtn.setAttribute(
      'aria-pressed',
      String(repeat)
    );
  });

  $('#likeTrack')?.addEventListener('click', event => {
    event.currentTarget.classList.toggle('active');
  });

  const characterModal = $('#characterModal');
  const characterModalMedia = $('#characterModalMedia');
  const characterModalName = $('#characterModalName');
  const characterModalSub = $('#characterModalSub');

  const openModal = modal => {
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const video = modal.querySelector('video');

    if (video) {
      video.play().catch(() => {});
    }
  };

  const closeAll = () => {
    $$('.modal.open').forEach(modal => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');

      $$('.modal video', modal).forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
    });

    document.body.classList.remove('modal-open');
  };

  characterCards.forEach(card => {
    card.addEventListener('click', () => {
      const source = card.dataset.image;
      const name = card.dataset.name || '';
      const sub = card.dataset.sub || '';

      if (characterModalMedia) {
        setupMedia(characterModalMedia, source, {
          autoplay: isVideo(source),
          muted: true,
          loop: true,
          controls: isVideo(source),
          playsInline: true,
          alt: name
        });
      }

      if (characterModalName) {
        characterModalName.textContent = name;
      }

      if (characterModalSub) {
        characterModalSub.textContent = sub;
      }

      openModal(characterModal);
    });
  });

  const lightbox = $('#lightbox');
  const modalMedia = $('#modalMedia');
  const modalCaption = $('#modalCaption');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const source = item.dataset.lightbox;
      const caption = item.dataset.caption || '';

      if (modalMedia) {
        setupMedia(modalMedia, source, {
          autoplay: isVideo(source),
          muted: true,
          loop: isVideo(source),
          controls: isVideo(source),
          playsInline: true,
          alt: caption
        });
      }

      if (modalCaption) {
        modalCaption.textContent = caption;
      }

      openModal(lightbox);
    });
  });

  $$('.modal-close').forEach(button => {
    button.addEventListener('click', closeAll);
  });

  $$('.modal').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeAll();
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeAll();
    }
  });

  const box = $('#messageBox');
  const count = $('#charCount');
  const send = $('#sendMessage');
  const status = $('#messageStatus');

  box?.addEventListener('input', () => {
    if (count) {
      count.textContent = `${box.value.length} / 500`;
    }
  });

  send?.addEventListener('click', () => {
    if (!box?.value.trim()) {
      if (status) {
        status.textContent = 'Write a little something first ✦';
      }

      return;
    }

    if (status) {
      status.textContent = 'Message saved for this visit. ✦';
    }

    send.textContent = 'SENT ✓';

    setTimeout(() => {
      send.textContent = 'SEND MESSAGE ✦';
    }, 1800);
  });
})();
