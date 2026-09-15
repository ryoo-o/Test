(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menu = $('.menu-toggle');
  const nav = $('.nav');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });

    $$('.nav a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const navLinks = $$('.nav a');
  const sections = $$('main section[id]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(a => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  const glow = $('.cursor-glow');

  if (glow) {
    window.addEventListener('pointermove', event => {
      glow.style.left = event.clientX + 'px';
      glow.style.top = event.clientY + 'px';
    }, {
      passive: true
    });
  }

  const IMAGE_EXTENSIONS = [
    'jpg',
    'jpeg',
    'jfif',
    'png',
    'gif',
    'webp',
    'avif',
    'bmp',
    'svg',
    'ico',
    'tif',
    'tiff'
  ];

  const VIDEO_EXTENSIONS = [
    'mp4',
    'webm',
    'ogg',
    'ogv',
    'mov',
    'm4v',
    'avi',
    'mkv'
  ];

  const AUDIO_EXTENSIONS = [
    'mp3',
    'wav',
    'ogg',
    'oga',
    'm4a',
    'aac',
    'flac',
    'opus',
    'weba'
  ];

  const getExtension = source => {
    if (!source) return '';

    const clean = source
      .split('?')[0]
      .split('#')[0];

    const parts = clean.split('.');
    return parts.length > 1
      ? parts.pop().toLowerCase()
      : '';
  };

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
