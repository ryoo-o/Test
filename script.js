(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Mobile menu
  const menu = $('.menu-toggle');
  const nav = $('.nav');

  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));

  // Active nav based on the visible section.
  const navLinks = $$('.nav a');
  const sections = $$('main section[id]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      navLinks.forEach(a =>
        a.classList.toggle(
          'active',
          a.getAttribute('href') === '#' + entry.target.id
        )
      );
    });
  }, {
    rootMargin:'-35% 0px -55% 0px',
    threshold:0
  });

  sections.forEach(s => observer.observe(s));

  // Subtle cursor glow on desktop.
  const glow = $('.cursor-glow');

  window.addEventListener('pointermove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, {
    passive:true
  });

  // Music player
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

  let musicAvailable = true;
  let shuffle = false;
  let repeat = false;
  let toastTimer;

  const fmt = sec => {
    sec = Number.isFinite(sec)
      ? Math.max(0, Math.floor(sec))
      : 0;

    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  // Main song progress bar.
  const setProgress = pct => {
    seek.style.setProperty(
      '--progress',
      `${Math.max(0, Math.min(100, pct))}%`
    );
  };

  // Volume progress bar.
  const setVolumeProgress = value => {
    volume.style.setProperty(
      '--progress',
      `${Math.max(0, Math.min(100, value * 100))}%`
    );
  };

  const showToast = () => {
    clearTimeout(toastTimer);

    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  };

  // Initial values
  audio.volume = .85;
  volume.value = audio.volume;

  setProgress(0);
  setVolumeProgress(audio.volume);

  audio.addEventListener('error', () => {
    musicAvailable = false;
  });

  audio.addEventListener('loadedmetadata', () => {
    musicAvailable = true;

    duration.textContent = fmt(audio.duration);
    currentTime.textContent = '0:00';

    seek.value = 0;
    setProgress(0);
  });

  // Update song progress as music plays.
  audio.addEventListener('timeupdate', () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const pct = audio.currentTime / audio.duration * 100;

    seek.value = pct;
    setProgress(pct);

    currentTime.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('play', () => {
    player.classList.add('is-playing');

    playBtn.textContent = 'Ⅱ';
    playBtn.setAttribute('aria-label', 'Pause music');
  });

  audio.addEventListener('pause', () => {
    player.classList.remove('is-playing');

    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-label', 'Play music');
  });

  audio.addEventListener('ended', () => {
    if (repeat) {
      audio.currentTime = 0;

      audio.play().catch(() => {});
      return;
    }

    player.classList.remove('is-playing');
  });

  const play = async () => {
    if (!musicAvailable) {
      showToast();
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      showToast();
    }
  };

  playBtn.addEventListener('click', play);
  $('#quickMusic').addEventListener('click', play);

  $('#musicNav').addEventListener('click', () => {
    document
      .querySelector('#playerPanel')
      .scrollIntoView({
        behavior:'smooth',
        block:'center'
      });
  });

  // Main progress bar seeking.
  seek.addEventListener('input', () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime =
      (Number(seek.value) / 100) * audio.duration;

    setProgress(Number(seek.value));
  });

  // Volume bar + pink filled section.
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    setVolumeProgress(audio.volume);
  });

  $('#prevBtn').addEventListener('click', () => {
    audio.currentTime = 0;

    if (audio.paused && musicAvailable) {
      play();
    }
  });

  $('#nextBtn').addEventListener('click', () => {
    // There is one supplied track, so Next restarts it.
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

  $('#likeTrack').addEventListener('click', e => {
    e.currentTarget.classList.toggle('active');
  });

  // Character modal
  const characterModal = $('#characterModal');
  const cImage = $('#characterModalImage');
  const cName = $('#characterModalName');
  const cSub = $('#characterModalSub');

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

  $$('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      cImage.src = card.dataset.image;
      cImage.alt = card.dataset.name;
      cName.textContent = card.dataset.name;
      cSub.textContent = card.dataset.sub;

      openModal(characterModal);
    });
  });

  // Gallery lightbox
  const lightbox = $('#lightbox');
  const modalImage = $('#modalImage');
  const modalCaption = $('#modalCaption');

  $$('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      modalImage.src = item.dataset.lightbox;

      modalCaption.textContent =
        item.dataset.caption || '';

      modalImage.alt =
        item.dataset.caption || '';

      openModal(lightbox);
    });
  });

  $$('.modal-close').forEach(b =>
    b.addEventListener('click', closeAll)
  );

  $$('.modal').forEach(m =>
    m.addEventListener('click', e => {
      if (e.target === m) {
        closeAll();
      }
    })
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAll();
    }
  });

  // Message form is intentionally local-only for GitHub Pages.
  const box = $('#messageBox');
  const count = $('#charCount');
  const send = $('#sendMessage');
  const status = $('#messageStatus');

  box.addEventListener('input', () => {
    count.textContent = `${box.value.length} / 500`;
  });

  send.addEventListener('click', () => {
    if (!box.value.trim()) {
      status.textContent =
        'Write a little something first ✦';
      return;
    }

    status.textContent =
      'Message saved for this visit. ✦';

    send.textContent = 'SENT ✓';

    setTimeout(() => {
      send.textContent = 'SEND MESSAGE ✦';
    }, 1800);
  });
})();    setProgress(Number(seek.value));
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value); });

  $('#prevBtn').addEventListener('click', () => {
    audio.currentTime = 0;
    if (audio.paused && musicAvailable) play();
  });
  $('#nextBtn').addEventListener('click', () => {
    // There is one supplied track, so Next cleanly restarts it instead of pretending another track exists.
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

  // Character modal
  const characterModal = $('#characterModal');
  const cImage = $('#characterModalImage'), cName = $('#characterModalName'), cSub = $('#characterModalSub');
  const openModal = el => { el.classList.add('open'); el.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); };
  const closeAll = () => { $$('.modal.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); }); document.body.classList.remove('modal-open'); };
  $$('.character-card').forEach(card => card.addEventListener('click', () => { cImage.src=card.dataset.image; cImage.alt=card.dataset.name; cName.textContent=card.dataset.name; cSub.textContent=card.dataset.sub; openModal(characterModal); }));

  // Gallery lightbox
  const lightbox = $('#lightbox'), modalImage = $('#modalImage'), modalCaption = $('#modalCaption');
  $$('.gallery-item').forEach(item => item.addEventListener('click', () => { modalImage.src=item.dataset.lightbox; modalCaption.textContent=item.dataset.caption || ''; modalImage.alt=item.dataset.caption || ''; openModal(lightbox); }));
  $$('.modal-close').forEach(b => b.addEventListener('click', closeAll));
  $$('.modal').forEach(m => m.addEventListener('click', e => { if(e.target === m) closeAll(); }));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeAll(); });

  // Message form is intentionally local-only for GitHub Pages: it confirms the message without pretending to send anywhere.
  const box = $('#messageBox'), count = $('#charCount'), send = $('#sendMessage'), status = $('#messageStatus');
  box.addEventListener('input', () => count.textContent = `${box.value.length} / 500`);
  send.addEventListener('click', () => {
    if(!box.value.trim()) { status.textContent = 'Write a little something first ✦'; return; }
    status.textContent = 'Message saved for this visit. ✦';
    send.textContent = 'SENT ✓';
    setTimeout(() => { send.textContent='SEND MESSAGE ✦'; }, 1800);
  });
})();
