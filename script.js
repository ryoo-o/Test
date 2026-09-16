(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],menu=$('.menu-toggle'),nav=$('.nav');

menu?.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o))});
$$('.nav a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

const links=$$('.nav a'),sections=$$('main section[id]');
if('IntersectionObserver'in window){const ob=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{rootMargin:'-35% 0 -55%'});sections.forEach(s=>ob.observe(s))}

const glow=$('.cursor-glow');
addEventListener('pointermove',e=>{if(!glow)return;glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});

const hero=$('.hero-video');
if(hero){hero.muted=hero.playsInline=true;hero.play().catch(()=>{});document.addEventListener('visibilitychange',()=>document.hidden?hero.pause():hero.play().catch(()=>{}))}

const ext=s=>{try{return new URL(s,location.href).pathname.split('.').pop().toLowerCase()}catch{return s?.split(/[?#]/)[0].split('.').pop().toLowerCase()||''}},isVideo=s=>['mp4','webm','ogg','mov'].includes(ext(s));

const setupMedia=(box,src,o={})=>{if(!box||!src)return null;box.innerHTML='';const v=isVideo(src),m=document.createElement(v?'video':'img');m.src=src;
if(v){m.autoplay=!!o.autoplay;m.muted=o.muted!==false;m.loop=!!o.loop;m.controls=!!o.controls;m.playsInline=true;m.preload='metadata'}else m.alt=o.alt||'';
m.onerror=()=>box.innerHTML='<div class="media-fallback">Unable to load this media file.</div>';box.appendChild(m);if(v&&o.autoplay)m.play().catch(()=>{});return m};

const audio=$('#audio'),player=$('#playerPanel'),playBtn=$('#playBtn'),seek=$('#seek'),volume=$('#volume'),time=$('#currentTime'),duration=$('#duration'),toast=$('#musicToast'),shuffleBtn=$('#shuffleBtn'),repeatBtn=$('#repeatBtn');
let musicAvailable=false,shuffle=false,repeat=false,toastTimer;
const MUSIC_SOURCE='assets/music.mp3';

const fmt=s=>{s=Number.isFinite(s)?Math.max(0,Math.floor(s)):0;return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`},
setProgress=(i,p)=>{if(i)i.style.setProperty('--progress',`${Math.max(0,Math.min(100,Number(p)||0))}%`)},
updateVolume=()=>{if(!volume)return;const v=Number(volume.value)||0,max=Number(volume.max)||1,min=Number(volume.min)||0;setProgress(volume,(v-min)/(max-min)*100)},
showToast=m=>{if(!toast)return;toast.textContent=m;clearTimeout(toastTimer);toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),4200)};

if(seek)seek.value=0,setProgress(seek,0);
if(volume)volume.value='0.85',updateVolume();

const resetPlayer=()=>{musicAvailable=false;if(seek)seek.value=0;if(time)time.textContent='0:00';if(duration)duration.textContent='0:00';setProgress(seek,0);player?.classList.remove('is-playing');if(playBtn)playBtn.textContent='▶',playBtn.setAttribute('aria-label','Play music')};

if(audio){
 audio.src=MUSIC_SOURCE;audio.preload='metadata';audio.volume=.85;
 audio.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(audio.duration))return;musicAvailable=true;if(duration)duration.textContent=fmt(audio.duration);if(time)time.textContent='0:00';if(seek)seek.value=0;setProgress(seek,0)});
 audio.addEventListener('canplay',()=>musicAvailable=true);
 audio.addEventListener('error',resetPlayer);
 audio.addEventListener('timeupdate',()=>{if(!Number.isFinite(audio.duration)||audio.duration<=0)return;const p=audio.currentTime/audio.duration*100;if(seek)seek.value=p;setProgress(seek,p);if(time)time.textContent=fmt(audio.currentTime)});
 audio.addEventListener('play',()=>{player?.classList.add('is-playing');if(playBtn)playBtn.textContent='Ⅱ',playBtn.setAttribute('aria-label','Pause music')});
 audio.addEventListener('pause',()=>{player?.classList.remove('is-playing');if(playBtn)playBtn.textContent='▶',playBtn.setAttribute('aria-label','Play music')});
 audio.addEventListener('ended',async()=>{if(repeat){audio.currentTime=0;try{await audio.play()}catch{showToast('Tap play to continue the music. ✦')}return}resetPlayer()})
}

const play=async()=>{if(!audio)return;if(!musicAvailable||audio.error){showToast('Add your music file at assets/music.mp3 to activate the player. ✦');return}try{audio.paused?await audio.play():audio.pause()}catch{showToast('Playback failed. Check your music file. ✦')}};

playBtn?.addEventListener('click',play);
$('#quickMusic')?.addEventListener('click',play);
$('#musicNav')?.addEventListener('click',()=>$('#playerPanel')?.scrollIntoView({behavior:'smooth',block:'center'}));

seek?.addEventListener('input',()=>{if(!audio||!musicAvailable||!Number.isFinite(audio.duration)||audio.duration<=0)return setProgress(seek,0);const p=Number(seek.value);audio.currentTime=p/100*audio.duration;setProgress(seek,p)});
volume?.addEventListener('input',()=>{if(audio)audio.volume=Number(volume.value);updateVolume()});

$('#prevBtn')?.addEventListener('click',()=>{if(!audio||!musicAvailable)return;audio.currentTime=0;if(audio.paused)play()});
$('#nextBtn')?.addEventListener('click',()=>{if(!audio||!musicAvailable)return;audio.currentTime=shuffle&&Number.isFinite(audio.duration)?Math.random()*Math.max(0,audio.duration-1):0;if(audio.paused)play()});

shuffleBtn?.addEventListener('click',()=>{shuffle=!shuffle;shuffleBtn.classList.toggle('active',shuffle);shuffleBtn.setAttribute('aria-pressed',String(shuffle))});
repeatBtn?.addEventListener('click',()=>{repeat=!repeat;repeatBtn.classList.toggle('active',repeat);repeatBtn.setAttribute('aria-pressed',String(repeat))});
$('#likeTrack')?.addEventListener('click',e=>e.currentTarget.classList.toggle('active'));

const characterModal=$('#characterModal'),characterModalMedia=$('#characterModalMedia'),characterModalName=$('#characterModalName'),characterModalSub=$('#characterModalSub'),lightbox=$('#lightbox'),modalMedia=$('#modalMedia'),modalCaption=$('#modalCaption');

const openModal=m=>{if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');m.querySelector('video')?.play().catch(()=>{})},
closeAll=()=>{$$('.modal.open').forEach(m=>{m.classList.remove('open');m.setAttribute('aria-hidden','true');$$('video',m).forEach(v=>{v.pause();v.currentTime=0})});document.body.classList.remove('modal-open')};

$$('.character-card').forEach(card=>card.addEventListener('click',()=>{const s=card.dataset.image,n=card.dataset.name||'',sub=card.dataset.sub||'';setupMedia(characterModalMedia,s,{autoplay:isVideo(s),muted:true,loop:isVideo(s),controls:isVideo(s),alt:n});if(characterModalName)characterModalName.textContent=n;if(characterModalSub)characterModalSub.textContent=sub;openModal(characterModal)}));

$$('.gallery-item').forEach(item=>item.addEventListener('click',()=>{const s=item.dataset.lightbox,c=item.dataset.caption||'';setupMedia(modalMedia,s,{autoplay:isVideo(s),muted:true,loop:isVideo(s),controls:isVideo(s),alt:c});if(modalCaption)modalCaption.textContent=c;openModal(lightbox)}));

$$('.modal-close').forEach(b=>b.addEventListener('click',closeAll));
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeAll()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});

const box=$('#messageBox'),count=$('#charCount'),send=$('#sendMessage'),status=$('#messageStatus');
box?.addEventListener('input',()=>{if(count)count.textContent=`${box.value.length} / 500`});
send?.addEventListener('click',()=>{if(!box?.value.trim()){if(status)status.textContent='Write a little something first ✦';return}if(status)status.textContent='Message saved for this visit. ✦';send.textContent='SENT ✓';setTimeout(()=>send.textContent='SEND MESSAGE ✦',1800)})
})();
