(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],menu=$('.menu-toggle'),nav=$('.nav');

menu?.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o))});
$$('.nav a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

const links=$$('.nav a'),sections=$$('main section[id]');
if('IntersectionObserver'in window){const ob=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{rootMargin:'-35% 0 -55%'});sections.forEach(s=>ob.observe(s))}

const glow=$('.cursor-glow');
addEventListener('pointermove',e=>{if(!glow)return;glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});

const hero=$('.hero-video');
const videos=$$('video');

const observeVideo=(v,ratio=.05)=>{
  if(!v||!'IntersectionObserver'in window)return;
  let visible=false;
  const io=new IntersectionObserver(es=>{const e=es[0];visible=e.isIntersecting&&e.intersectionRatio>=ratio;
    if(!visible){v.pause();return}
    if(!document.hidden&&v.paused)v.play().catch(()=>{});
  },{threshold:[0,.05,.25,.5]});
  io.observe(v);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else if(visible)v.play().catch(()=>{})});
};

if(hero){hero.muted=true;hero.playsInline=true;observeVideo(hero,.08);if(!document.hidden)hero.play().catch(()=>{})}
videos.forEach(v=>{if(v!==hero)observeVideo(v,.05)});

const ext=s=>{try{return new URL(s,location.href).pathname.split('.').pop().toLowerCase()}catch{return s?.split(/[?#]/)[0].split('.').pop().toLowerCase()||''}},isVideo=s=>['mp4','webm','ogg','mov'].includes(ext(s));

const setupMedia=(box,src,o={})=>{if(!box||!src)return null;box.innerHTML='';const v=isVideo(src),m=document.createElement(v?'video':'img');m.src=src;
if(v){m.autoplay=!!o.autoplay;m.muted=o.muted!==false;m.loop=!!o.loop;m.controls=!!o.controls;m.playsInline=true;m.preload='metadata'}else m.alt=o.alt||'';
m.onerror=()=>box.innerHTML='<div class="media-fallback">Unable to load this media file.</div>';box.appendChild(m);if(v&&o.autoplay)m.play().catch(()=>{});return m};

const audio=$('#audio'),player=$('#playerPanel'),playBtn=$('#playBtn'),seek=$('#seek'),volume=$('#volume'),muteBtn=$('#muteBtn'),volumeMax=$('#volumeMax'),time=$('#currentTime'),duration=$('#duration'),toast=$('#musicToast'),shuffleBtn=$('#shuffleBtn'),repeatBtn=$('#repeatBtn');
let musicAvailable=false,shuffle=false,repeat=false,toastTimer,volumeLevel=.85,muted=false;
const MUSIC_SOURCE='assets/music.mp3';

const fmt=s=>{s=Number.isFinite(s)?Math.max(0,Math.floor(s)):0;return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
const setProgress=(i,p)=>{if(!i)return;const n=Math.max(0,Math.min(100,Number(p)||0));i.style.setProperty('--progress',`${n}%`)};
const syncSeek=()=>{if(!audio||!seek)return;const d=audio.duration,p=Number.isFinite(d)&&d>0?audio.currentTime/d*100:0;seek.value=String(Math.max(0,Math.min(100,p)));setProgress(seek,p)};
const syncVolume=()=>{if(!volume)return;const v=Math.max(0,Math.min(1,Number(volume.value)||0));setProgress(volume,v*100)};
const setMuteUI=()=>{if(!muteBtn)return;muteBtn.classList.toggle('muted',muted);muteBtn.textContent=muted?'🔇':'🔊';muteBtn.setAttribute('aria-label',muted?'Unmute music':'Mute music');muteBtn.setAttribute('aria-pressed',String(muted))};
const updateVolume=()=>{if(!volume)return;const v=Math.max(0,Math.min(1,Number(volume.value)||0);volume.value=String(v);syncVolume()};
const showToast=m=>{if(!toast)return;toast.textContent=m;clearTimeout(toastTimer);toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),4200)};

if(seek){seek.min='0';seek.max='100';seek.step='0.1';seek.value='0';setProgress(seek,0)}
if(volume){volume.min='0';volume.max='1';volume.step='0.01';volume.value=String(volumeLevel);syncVolume()}

const resetPlayer=()=>{musicAvailable=false;if(seek)seek.value='0';if(time)time.textContent='0:00';if(duration)duration.textContent='0:00';setProgress(seek,0);player?.classList.remove('is-playing');if(playBtn){playBtn.textContent='▶';playBtn.setAttribute('aria-label','Play music')}};

if(audio){
 audio.src=MUSIC_SOURCE;audio.preload='metadata';audio.volume=volumeLevel;audio.muted=muted;
 audio.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(audio.duration)||audio.duration<=0)return;musicAvailable=true;if(duration)duration.textContent=fmt(audio.duration);if(time)time.textContent=fmt(audio.currentTime);syncSeek()});
 audio.addEventListener('durationchange',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0){musicAvailable=true;if(duration)duration.textContent=fmt(audio.duration);syncSeek()}});
 audio.addEventListener('canplay',()=>musicAvailable=true);
 audio.addEventListener('error',resetPlayer);
 audio.addEventListener('timeupdate',()=>{if(!Number.isFinite(audio.duration)||audio.duration<=0)return;if(time)time.textContent=fmt(audio.currentTime);syncSeek()});
 audio.addEventListener('play',()=>{player?.classList.add('is-playing');if(playBtn){playBtn.textContent='Ⅱ';playBtn.setAttribute('aria-label','Pause music')}});
 audio.addEventListener('pause',()=>{player?.classList.remove('is-playing');if(playBtn){playBtn.textContent='▶';playBtn.setAttribute('aria-label','Play music')}});
 audio.addEventListener('ended',async()=>{if(repeat){audio.currentTime=0;syncSeek();try{await audio.play()}catch{showToast('Tap play to continue the music. ✦')}return}if(seek){seek.value='100';setProgress(seek,100)}if(time&&Number.isFinite(audio.duration))time.textContent=fmt(audio.duration);setTimeout(resetPlayer,120)})
}

const play=async()=>{if(!audio)return;if(!musicAvailable||audio.error){showToast('Add your music file at assets/music.mp3 to activate the player. ✦');return}try{audio.paused?await audio.play():audio.pause()}catch{showToast('Playback failed. Check your music file. ✦')}};

playBtn?.addEventListener('click',play);
$('#quickMusic')?.addEventListener('click',play);
$('#musicNav')?.addEventListener('click',()=>$('#playerPanel')?.scrollIntoView({behavior:'smooth',block:'center'}));

seek?.addEventListener('input',()=>{if(!audio||!musicAvailable||!Number.isFinite(audio.duration)||audio.duration<=0)return;const p=Math.max(0,Math.min(100,Number(seek.value)));audio.currentTime=p/100*audio.duration;setProgress(seek,p);if(time)time.textContent=fmt(audio.currentTime)});
seek?.addEventListener('change',()=>{if(audio&&musicAvailable&&Number.isFinite(audio.duration)&&audio.duration>0){audio.currentTime=Math.max(0,Math.min(100,Number(seek.value)))/100*audio.duration;syncSeek()}});

volume?.addEventListener('input',()=>{const v=Math.max(0,Math.min(1,Number(volume.value)||0));volumeLevel=v;if(audio){audio.volume=v;audio.muted=false}muted=false;updateVolume();setMuteUI()});

muteBtn?.addEventListener('click',()=>{muted=!muted;if(audio)audio.muted=muted;setMuteUI()});
volumeMax?.addEventListener('click',()=>{volumeLevel=1;muted=false;if(volume)volume.value='1';if(audio){audio.volume=1;audio.muted=false}syncVolume();setMuteUI()});

$('#prevBtn')?.addEventListener('click',()=>{if(!audio||!musicAvailable)return;audio.currentTime=0;syncSeek();if(audio.paused)play()});
$('#nextBtn')?.addEventListener('click',()=>{if(!audio||!musicAvailable)return;audio.currentTime=shuffle&&Number.isFinite(audio.duration)?Math.random()*Math.max(0,audio.duration-1):0;syncSeek();if(audio.paused)play()});

shuffleBtn?.addEventListener('click',()=>{shuffle=!shuffle;shuffleBtn.classList.toggle('active',shuffle);shuffleBtn.setAttribute('aria-pressed',String(shuffle))});
repeatBtn?.addEventListener('click',()=>{repeat=!repeat;repeatBtn.classList.toggle('active',repeat);repeatBtn.setAttribute('aria-pressed',String(repeat))});
$('#likeTrack')?.addEventListener('click',e=>{const a=e.currentTarget,b=!a.classList.contains('active');a.classList.toggle('active',b);a.setAttribute('aria-pressed',String(b))});

setMuteUI();

const characterModal=$('#characterModal'),characterModalMedia=$('#characterModalMedia'),characterModalName=$('#characterModalName'),characterModalSub=$('#characterModalSub'),lightbox=$('#lightbox'),modalMedia=$('#modalMedia'),modalCaption=$('#modalCaption');

const openModal=m=>{if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');m.querySelector('video')?.play().catch(()=>{})};
const closeAll=()=>{$$('.modal.open').forEach(m=>{m.classList.remove('open');m.setAttribute('aria-hidden','true');$$('video',m).forEach(v=>{v.pause();v.currentTime=0})});document.body.classList.remove('modal-open')};

$$('.character-card').forEach(card=>card.addEventListener('click',()=>{const s=card.dataset.image,n=card.dataset.name||'',sub=card.dataset.sub||'';setupMedia(characterModalMedia,s,{autoplay:isVideo(s),muted:true,loop:isVideo(s),controls:isVideo(s),alt:n});if(characterModalName)characterModalName.textContent=n;if(characterModalSub)characterModalSub.textContent=sub;openModal(characterModal)}));

$$('.gallery-item').forEach(item=>item.addEventListener('click',()=>{const s=item.dataset.lightbox,c=item.dataset.caption||'';setupMedia(modalMedia,s,{autoplay:isVideo(s),muted:true,loop:isVideo(s),controls:isVideo(s),alt:c});if(modalCaption)modalCaption.textContent=c;openModal(lightbox)}));

$$('.modal-close').forEach(b=>b.addEventListener('click',closeAll));
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeAll()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});

const box=$('#messageBox'),count=$('#charCount'),send=$('#sendMessage'),status=$('#messageStatus');
box?.addEventListener('input',()=>{if(count)count.textContent=`${box.value.length} / 500`});
send?.addEventListener('click',()=>{if(!box?.value.trim()){if(status)status.textContent='Write a little something first ✦';return}if(status)status.textContent='Message saved for this visit. ✦';send.textContent='SENT ✓';setTimeout(()=>send.textContent='SEND MESSAGE ✦',1800)})
})();
