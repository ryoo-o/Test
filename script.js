
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile navigation
  const menu = $('.menu-toggle');
  const nav = $('.nav');

  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  $$('.nav a').forEach(a => {
    a.addEventListener('click', () => {
      nav?.classList.remove('open');
      menu?.setAttribute('aria-expanded', 'false');
    });
  });

  // Active navigation link
  const links = $$('.nav a');
  const sections = $$('main section[id]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        links.forEach(a => {
          a.classList.toggle(
            'active',
            a.hash === '#' + entry.target.id
          );
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // Cursor glow
  const glow = $('.cursor-glow');

  window.addEventListener('pointermove', e => {
    if (!glow) return;

    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });

  // Hero video
  const heroVideo = $('.hero-video');

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;

    heroVideo.play().catch(() => {});

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        heroVideo.pause();
      } else {
        heroVideo.play().catch(() => {});
      }
    });
  }

  // Media helpers
  const getExtension = source => {
    try {
      return new URL(source, location.href)
        .pathname.split('.').pop().toLowerCase();
    } catch {
      return source?.split('?')[0]
        .split('#')[0].split('.').pop().toLowerCase() || '';
    }
  };

  const isVideo = source =>
    ['mp4', 'webm', 'ogg', 'mov'].includes(
      getExtension(source)
    );

  const setupMedia = (container, source, options = {}) => {
    if (!container || !source) return null;

    container.innerHTML = '';

    let media;

    if (isVideo(source)) {
      media = document.createElement('video');
      media.src = source;
      media.autoplay = !!options.autoplay;
      media.muted = options.muted !== false;
      media.loop = !!options.loop;
      media.controls = !!options.controls;
      media.playsInline = true;
      media.preload = 'metadata';
    } else {
      media = document.createElement('img');
      media.src = source;
      media.alt = options.alt || '';
    }

    media.onerror = () => {
      container.innerHTML =
        '<div class="media-fallback">' +
        'Unable to load this media file.' +
        '</div>';
    };

    container.appendChild(media);

    if (isVideo(source) && options.autoplay) {
      media.play().catch(() => {});
    }

    return media;
  };

  // Music player
  const audio = $('#audio');
  const player = $('#playerPanel');
  const playBtn = $('#playBtn');
  const seek = $('#seek');
  const volume = $('#volume');
  const time = $('#currentTime');
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

    return `${Math.floor(seconds / 60)}:${String(
      seconds % 60
    ).padStart(2, '0')}`;
  };

  // Set the actual pink progress percentage
  const setProgress = (input, percentage) => {
    if (!input) return;

    const value = Math.max(
      0,
      Math.min(100, Number(percentage) || 0)
    );

    input.style.setProperty('--progress', `${value}%`);
  };

  // Update the volume slider's pink fill
  const updateVolume = () => {
    if (!volume) return;

    const value = Number(volume.value) || 0;
    const max = Number(volume.max) || 1;
    const min = Number(volume.min) || 0;

    const percentage = ((value - min) / (max - min)) * 100;

    setProgress(volume, percentage);
  };

  // Toast message
  const showToast = message => {
    if (!toast) return;

    toast.textContent = message;

    clearTimeout(toastTimer);
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  };

  // Initial slider appearance
  // Music progress starts at ZERO.
  if (seek) {
    seek.value = 0;
    setProgress(seek, 0);
  }

  // Volume starts at 85%, and its fill matches.
  if (volume) {
    volume.value = '0.85';
    updateVolume();
  }

  // Reset player display
  const resetPlayer = () => {
    musicAvailable = false;

    if (seek) seek.value = 0;
    if (time) time.textContent = '0:00';
    if (duration) duration.textContent = '0:00';

    setProgress(seek, 0);

    player?.classList.remove('is-playing');

    if (playBtn) {
      playBtn.textContent = '▶';
      playBtn.setAttribute('aria-label', 'Play music');
    }
  };

  if (audio) {
    audio.src = MUSIC_SOURCE;
    audio.preload = 'metadata';
    audio.volume = 0.85;

    audio.addEventListener('loadedmetadata', () => {
      if (!Number.isFinite(audio.duration)) return;

      musicAvailable = true;

      if (duration) {
        duration.textContent = fmt(audio.duration);
      }

      if (time) time.textContent = '0:00';

      if (seek) seek.value = 0;

      setProgress(seek, 0);
    });

    audio.addEventListener('canplay', () => {
      musicAvailable = true;
    });

    audio.addEventListener('error', () => {
      resetPlayer();
    });

    audio.addEventListener('timeupdate', () => {
      if (
        !Number.isFinite(audio.duration) ||
        audio.duration <= 0
      ) return;

      const percentage =
        (audio.currentTime / audio.duration) * 100;

      if (seek) seek.value = percentage;

      setProgress(seek, percentage);

      if (time) {
        time.textContent = fmt(audio.currentTime);
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

    audio.addEventListener('ended', async () => {
      if (repeat) {
        audio.currentTime = 0;

        try {
          await audio.play();
        } catch {
          showToast('Tap play to continue the music. ✦');
        }

        return;
      }

      resetPlayer();
    });
  }

  // Play and pause
  const play = async () => {
    if (!audio) return;

    if (!musicAvailable || audio.error) {
      showToast(
        'Add your music file at assets/music.mp3 to activate the player. ✦'
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
      showToast('Playback failed. Check your music file. ✦');
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

  // Music progress slider
  seek?.addEventListener('input', () => {
    if (
      !audio ||
      !musicAvailable ||
      !Number.isFinite(audio.duration) ||
      audio.duration <= 0
    ) {
      setProgress(seek, 0);
      return;
    }

    const percentage = Number(seek.value);

    audio.currentTime =
      (percentage / 100) * audio.duration;

    setProgress(seek, percentage);
  });

  // Volume slider
  volume?.addEventListener('input', () => {
    if (audio) {
      audio.volume = Number(volume.value);
    }

    updateVolume();
  });

  // Previous: restart current track
  $('#prevBtn')?.addEventListener('click', () => {
    if (!audio || !musicAvailable) return;

    audio.currentTime = 0;

    if (audio.paused) play();
  });

  // Next: restart, or jump to a random position
  $('#nextBtn')?.addEventListener('click', () => {
    if (!audio || !musicAvailable) return;

    if (shuffle && Number.isFinite(audio.duration)) {
      audio.currentTime =
        Math.random() * Math.max(0, audio.duration - 1);
    } else {
      audio.currentTime = 0;
    }

    if (audio.paused) play();
  });

  // Shuffle
  shuffleBtn?.addEventListener('click', () => {
    shuffle = !shuffle;

    shuffleBtn.classList.toggle('active', shuffle);

    shuffleBtn.setAttribute(
      'aria-pressed',
      String(shuffle)
    );
  });

  // Repeat
  repeatBtn?.addEventListener('click', () => {
    repeat = !repeat;

    repeatBtn.classList.toggle('active', repeat);

    repeatBtn.setAttribute(
      'aria-pressed',
      String(repeat)
    );
  });

  // Favorite track
  $('#likeTrack')?.addEventListener('click', e => {
    e.currentTarget.classList.toggle('active');
  });

  // Modals
  const characterModal = $('#characterModal');
  const characterModalMedia = $('#characterModalMedia');
  const characterModalName = $('#characterModalName');
  const characterModalSub = $('#characterModalSub');

  const lightbox = $('#lightbox');
  const modalMedia = $('#modalMedia');
  const modalCaption = $('#modalCaption');

  const openModal = modal => {
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-open');

    modal.querySelector('video')?.play().catch(() => {});
  };

  const closeAll = () => {
    $$('.modal.open').forEach(modal => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');

      $$('video', modal).forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
    });

    document.body.classList.remove('modal-open');
  };

  // Character cards
  $$('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      const source = card.dataset.image;
      const name = card.dataset.name || '';
      const sub = card.dataset.sub || '';

      setupMedia(characterModalMedia, source, {
        autoplay: isVideo(source),
        muted: true,
        loop: isVideo(source),
        controls: isVideo(source),
        alt: name
      });

      if (characterModalName) {
        characterModalName.textContent = name;
      }

      if (characterModalSub) {
        characterModalSub.textContent = sub;
      }

      openModal(characterModal);
    });
  });

  // Gallery
  $$('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const source = item.dataset.lightbox;
      const caption = item.dataset.caption || '';

      setupMedia(modalMedia, source, {
        autoplay: isVideo(source),
        muted: true,
        loop: isVideo(source),
        controls: isVideo(source),
        alt: caption
      });

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
      if (event.target === modal) closeAll();
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAll();
  });

  // Birthday message
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
