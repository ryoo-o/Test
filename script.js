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
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, {rootMargin:'-35% 0px -55% 0px', threshold:0});
  sections.forEach(s => observer.observe(s));

  // Subtle cursor glow on desktop.
  const glow = $('.cursor-glow');
  window.addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, {passive:true});

  // Music player. Put the user's file at assets/music.mp3.
  const audio = $('#audio'), playBtn = $('#playBtn'), seek = $('#seek'), volume = $('#volume');
  const currentTime = $('#currentTime'), duration = $('#duration');
  const toast = $('#musicToast');
  let hasMusic = true;
  audio.addEventListener('error', () => { hasMusic = false; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 6500); });
  const fmt = sec => { sec = Number.isFinite(sec) ? Math.floor(sec) : 0; return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`; };
  const setProgress = pct => { seek.style.setProperty('--progress', `${pct}%`); };
  audio.volume = .85;
  volume.value = audio.volume;
  audio.addEventListener('loadedmetadata', () => { duration.textContent = fmt(audio.duration); setProgress(0); });
  audio.addEventListener('timeupdate', () => { if (!audio.duration) return; const pct = audio.currentTime / audio.duration * 100; seek.value = pct; setProgress(pct); currentTime.textContent = fmt(audio.currentTime); });
  audio.addEventListener('play', () => playBtn.textContent = 'Ⅱ');
  audio.addEventListener('pause', () => playBtn.textContent = '▶');
  const play = async () => {
    if (!hasMusic) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4000); return; }
    try { audio.paused ? await audio.play() : audio.pause(); } catch { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4000); }
  };
  playBtn.addEventListener('click', play);
  $('#quickMusic').addEventListener('click', play);
  $('#musicNav').addEventListener('click', () => document.querySelector('#playerPanel').scrollIntoView({behavior:'smooth', block:'center'}));
  seek.addEventListener('input', () => { if (!audio.duration) return; audio.currentTime = (Number(seek.value)/100) * audio.duration; setProgress(Number(seek.value)); });
  volume.addEventListener('input', () => audio.volume = Number(volume.value));
  $('#prevBtn').addEventListener('click', () => { audio.currentTime = 0; });
  $('#nextBtn').addEventListener('click', () => { if(audio.duration) audio.currentTime = Math.max(0,audio.duration-2); });
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
