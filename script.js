(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

const menu=$('.menu-toggle'),nav=$('.nav');
menu?.addEventListener('click',()=>{let o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
$$('.nav a').forEach(a=>a.onclick=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')});

const links=$$('.nav a'),sections=$$('main section[id]');
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id)),{rootMargin:'-35% 0px -55% 0px'})).observe;
sections.forEach(s=>new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))),{rootMargin:'-35% 0px -55% 0px'}).observe(s));

const glow=$('.cursor-glow');
window.addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}},{passive:true});

const isImage=s=>IMAGE_EXTENSIONS.includes(getExtension(s));
const isVideo=s=>VIDEO_EXTENSIONS.includes(getExtension(s));

const createMediaElement=(s,o={})=>{
if(!s)return null;
const{autoplay=false,muted=true,loop=false,controls=false,playsInline=true,className='',alt=''}=o;
if(isVideo(s)){let v=document.createElement('video');Object.assign(v,{src:s,autoplay,muted,loop,controls,playsInline,preload:'metadata',className});return v}
if(isImage(s)){let i=document.createElement('img');Object.assign(i,{src:s,alt,className,loading:'lazy'});return i}
return null
};

const fallback=s=>{let f=document.createElement('div');f.className='media-fallback';f.textContent=`Unsupported media format: ${getExtension(s)||'unknown'}`;return f};

const setupMedia=(c,s,o={})=>{
if(!c||!s)return null;c.innerHTML='';
let m=createMediaElement(s,o);
if(!m){c.appendChild(fallback(s));return null}
m.onerror=()=>{if(!c.querySelector('.media-fallback')){c.innerHTML='';c.appendChild(fallback(s))}};
c.appendChild(m);return m
};

$$('.media-frame').forEach(c=>setupMedia(c,c.dataset.media,{
autoplay:!!c.closest('.hero-bg'),muted:true,loop:true,playsInline:true,alt:c.dataset.alt||''
}));

$$('.gallery-item').forEach(i=>{
let s=i.dataset.lightbox,c=$('.gallery-media',i);
if(c&&!c.children.length)setupMedia(c,s,{autoplay:isVideo(s),muted:true,loop:true,playsInline:true,alt:i.dataset.caption||''})
});

const cards=$$('.character-card');
cards.forEach(c=>{
let s=c.dataset.image,m=$('.character-media',c);
if(m&&!m.children.length)setupMedia(m,s,{autoplay:isVideo(s),muted:true,loop:true,playsInline:true,alt:c.dataset.name||''})
});

const audio=$('#audio'),player=$('#playerPanel'),playBtn=$('#playBtn'),seek=$('#seek'),volume=$('#volume'),
time=$('#currentTime'),duration=$('#duration'),toast=$('#musicToast'),shuffleBtn=$('#shuffleBtn'),repeatBtn=$('#repeatBtn');

let musicAvailable=false,shuffle=false,repeat=false,toastTimer;
const MUSIC_SOURCE='assets/music.mp3';
const fmt=s=>{s=Number.isFinite(s)?Math.max(0,Math.floor(s)):0;return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
const progress=p=>seek?.style.setProperty('--progress',`${Math.max(0,Math.min(100,Number(p)||0))}%`);
const showToast=m=>{if(!toast)return;if(m)toast.innerHTML=m;clearTimeout(toastTimer);toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),4200)};

if(audio){
audio.src=MUSIC_SOURCE;audio.preload='metadata';audio.volume=.85;
if(volume)volume.value=audio.volume;

audio.onloadedmetadata=()=>{musicAvailable=true;if(duration)duration.textContent=fmt(audio.duration);if(time)time.textContent='0:00';if(seek)seek.value=0;progress(0)};
audio.oncanplay=()=>musicAvailable=true;
audio.onerror=()=>musicAvailable=false;

audio.ontimeupdate=()=>{
if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
let p=audio.currentTime/audio.duration*100;
if(seek)seek.value=p;progress(p);if(time)time.textContent=fmt(audio.currentTime)
};

audio.onplay=()=>{player?.classList.add('is-playing');if(playBtn){playBtn.textContent='Ⅱ';playBtn.setAttribute('aria-label','Pause music')}};
audio.onpause=()=>{player?.classList.remove('is-playing');if(playBtn){playBtn.textContent='▶';playBtn.setAttribute('aria-label','Play music')}};

audio.onended=()=>{
if(repeat){audio.currentTime=0;audio.play().catch(()=>showToast('Tap the play button to continue the music. ✦'));return}
player?.classList.remove('is-playing');if(playBtn)playBtn.textContent='▶'
}
}

const play=async()=>{
if(!audio)return;
if(!musicAvailable){showToast('Place a supported audio file at <b>assets/music.mp3</b> to activate the player. ✦');return}
try{audio.paused?await audio.play():audio.pause()}catch{showToast('Your browser blocked playback. Tap play again. ✦')}
};

playBtn?.addEventListener('click',play);
$('#quickMusic')?.addEventListener('click',play);
$('#musicNav')?.addEventListener('click',()=>$('#playerPanel')?.scrollIntoView({behavior:'smooth',block:'center'}));

seek?.addEventListener('input',()=>{
if(!audio||!Number.isFinite(audio.duration)||audio.duration<=0)return;
let v=Number(seek.value);audio.currentTime=v/100*audio.duration;progress(v)
});

volume?.addEventListener('input',()=>audio&&(audio.volume=Number(volume.value)));

$('#prevBtn')?.addEventListener('click',()=>{
if(!audio)return;audio.currentTime=0;if(audio.paused&&musicAvailable)play()
});

$('#nextBtn')?.addEventListener('click',()=>{
if(!audio)return;audio.currentTime=0;
if(shuffle&&Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Math.random()*Math.max(0,audio.duration-1);
if(audio.paused&&musicAvailable)play()
});

shuffleBtn?.addEventListener('click',()=>{
shuffle=!shuffle;shuffleBtn.classList.toggle('active',shuffle);shuffleBtn.setAttribute('aria-pressed',String(shuffle))
});

repeatBtn?.addEventListener('click',()=>{
repeat=!repeat;repeatBtn.classList.toggle('active',repeat);repeatBtn.setAttribute('aria-pressed',String(repeat))
});

$('#likeTrack')?.addEventListener('click',e=>e.currentTarget.classList.toggle('active'));

const characterModal=$('#characterModal'),characterModalMedia=$('#characterModalMedia'),
characterModalName=$('#characterModalName'),characterModalSub=$('#characterModalSub');

const openModal=m=>{
if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
m.querySelector('video')?.play().catch(()=>{})
};

const closeAll=()=>{
$$('.modal.open').forEach(m=>{
m.classList.remove('open');m.setAttribute('aria-hidden','true');
$$('video',m).forEach(v=>{v.pause();v.currentTime=0})
});
document.body.classList.remove('modal-open')
};

cards.forEach(c=>c.addEventListener('click',()=>{
let s=c.dataset.image,n=c.dataset.name||'',sub=c.dataset.sub||'';
if(characterModalMedia)setupMedia(characterModalMedia,s,{autoplay:isVideo(s),muted:true,loop:true,controls:isVideo(s),playsInline:true,alt:n});
if(characterModalName)characterModalName.textContent=n;
if(characterModalSub)characterModalSub.textContent=sub;
openModal(characterModal)
}));

const lightbox=$('#lightbox'),modalMedia=$('#modalMedia'),modalCaption=$('#modalCaption');

$$('.gallery-item').forEach(i=>i.addEventListener('click',()=>{
let s=i.dataset.lightbox,c=i.dataset.caption||'';
if(modalMedia)setupMedia(modalMedia,s,{autoplay:isVideo(s),muted:true,loop:isVideo(s),controls:isVideo(s),playsInline:true,alt:c});
if(modalCaption)modalCaption.textContent=c;
openModal(lightbox)
}));

$$('.modal-close').forEach(b=>b.addEventListener('click',closeAll));
$$('.modal').forEach(m=>m.addEventListener('click',e=>e.target===m&&closeAll()));
document.addEventListener('keydown',e=>e.key==='Escape'&&closeAll());

const box=$('#messageBox'),count=$('#charCount'),send=$('#sendMessage'),status=$('#messageStatus');

box?.addEventListener('input',()=>count&&(count.textContent=`${box.value.length} / 500`));

send?.addEventListener('click',()=>{
if(!box?.value.trim()){if(status)status.textContent='Write a little something first ✦';return}
if(status)status.textContent='Message saved for this visit. ✦';
send.textContent='SENT ✓';
setTimeout(()=>send.textContent='SEND MESSAGE ✦',1800)
});
})();
