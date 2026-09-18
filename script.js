(()=>{"use strict";

const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const body=document.body,audio=$("#audio"),panel=$("#playerPanel"),play=$("#playBtn"),seek=$("#seek"),volume=$("#volume");
const current=$("#currentTime"),duration=$("#duration"),shuffle=$("#shuffleBtn"),repeat=$("#repeatBtn"),prev=$("#prevBtn"),next=$("#nextBtn");
const like=$("#likeTrack"),musicNav=$("#musicNav"),quickMusic=$("#quickMusic"),toast=$("#musicToast");
const musicPrompt=$("#musicPrompt"),promptPlay=$("#musicPromptPlay"),promptLater=$("#musicPromptLater");
const menu=$("#menuToggle")||$(".menu-toggle"),nav=$("#mainNav"),glow=$(".cursor-glow");
const lightbox=$("#lightbox"),modalMedia=$("#modalMedia"),modalCaption=$("#modalCaption"),charModal=$("#characterModal");
const charMedia=$("#characterModalMedia"),charName=$("#characterModalName"),charSub=$("#characterModalSub");

const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
const fmt=s=>!Number.isFinite(s)||s<0?"0:00":`${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
const progress=(el,v)=>el&&el.style.setProperty("--progress",`${clamp(Number(v)||0,0,100)}%`);

const closeMenu=()=>{if(!nav||!menu)return;nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open menu")};
menu?.addEventListener("click",()=>{const open=nav?.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Close menu":"Open menu")});
$$(".nav a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("click",e=>{if(nav?.classList.contains("open")&&!nav.contains(e.target)&&!menu?.contains(e.target))closeMenu()});
window.addEventListener("resize",()=>{if(innerWidth>820)closeMenu()});

if(glow&&!reduced()){let raf=0,x=innerWidth/2,y=innerHeight/2;addEventListener("pointermove",e=>{if(e.pointerType&&e.pointerType!=="mouse")return;x=e.clientX;y=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{raf=0;glow.style.left=`${x}px`;glow.style.top=`${y}px`})},{passive:true})}

const links=$$(".nav a[href^='#']"),sections=links.map(a=>$(a.getAttribute("href"))).filter(Boolean);
const setActive=id=>links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${id}`));

if("IntersectionObserver"in window){
const sectionObserver=new IntersectionObserver(es=>{
const v=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
if(v?.target.id)setActive(v.target.id)
},{rootMargin:"-25% 0px -55% 0px",threshold:[0,.15,.35,.6]});
sections.forEach(s=>sectionObserver.observe(s));
}

$$(".nav a,.quick-links a,.brand").forEach(a=>a.addEventListener("click",e=>{
const id=a.getAttribute("href");
if(!id?.startsWith("#"))return;
const t=$(id);
if(!t)return;
e.preventDefault();
t.scrollIntoView({behavior:reduced()?"auto":"smooth",block:"start"});
history.replaceState?.(null,"",id)
}));

let shuffleOn=false,repeatOn=false;
const SRC="assets/music.mp3";
const showToast=(msg,persist=false)=>{
if(!toast)return;
toast.innerHTML=msg;
toast.classList.add("show");
clearTimeout(showToast.t);
if(!persist)showToast.t=setTimeout(()=>toast.classList.remove("show"),4500)
};
const hideToast=()=>{
if(!toast)return;
clearTimeout(showToast.t);
toast.classList.remove("show")
};
const updatePlay=()=>{
if(!audio||!play)return;
const on=!audio.paused&&!audio.ended;
panel?.classList.toggle("is-playing",on);
play.textContent=on?"❚❚":"▶";
play.setAttribute("aria-label",on?"Pause music":"Play music")
};
const sync=()=>{
if(!audio)return;
const d=Number.isFinite(audio.duration)?audio.duration:0,c=Number.isFinite(audio.currentTime)?audio.currentTime:0;
if(current)current.textContent=fmt(c);
if(duration)duration.textContent=fmt(d);
if(seek){const p=d?c/d*100:0;seek.value=String(p);progress(seek,p)}
if(volume)progress(volume,Number(volume.value)*100)
};
const setSrc=()=>{
if(audio&&audio.getAttribute("src")!==SRC){
audio.src=SRC;
audio.load()
}};

const playMusic=async()=>{
if(!audio)return;
setSrc();
try{
audio.muted=false;
await audio.play();
hideToast();
updatePlay();
sync()
}catch{
if(audio.error)showToast("Place your music file at <b>assets/music.mp3</b> to activate the player.",true)
}
};

const toggleMusic=()=>audio&&(audio.paused||audio.ended?playMusic():(audio.pause(),updatePlay()));
const seekTo=v=>{
if(!audio||!Number.isFinite(audio.duration)||audio.duration<=0)return;
audio.currentTime=audio.duration*clamp(Number(v)||0,0,100)/100;
sync()
};

if(audio){
setSrc();
audio.volume=clamp(Number(volume?.value??.3),0,1);
audio.addEventListener("loadedmetadata",()=>{hideToast();sync()});
audio.addEventListener("canplay",hideToast);
audio.addEventListener("timeupdate",sync);
audio.addEventListener("durationchange",sync);
audio.addEventListener("volumechange",sync);
audio.addEventListener("play",updatePlay);
audio.addEventListener("pause",updatePlay);
audio.addEventListener("ended",()=>{
updatePlay();
if(repeatOn){
audio.currentTime=0;
playMusic()
}
});
audio.addEventListener("error",()=>{
updatePlay();
if(!musicPrompt?.classList.contains("open"))showToast("Place your music file at <b>assets/music.mp3</b> to activate the player.",true)
});
setTimeout(()=>{
if(audio.error&&!musicPrompt?.classList.contains("open"))showToast("Place your music file at <b>assets/music.mp3</b> to activate the player.",true)
},1400)
}

play?.addEventListener("click",toggleMusic);
quickMusic?.addEventListener("click",toggleMusic);
musicNav?.addEventListener("click",()=>{
toggleMusic();
panel?.scrollIntoView({behavior:reduced()?"auto":"smooth",block:"center"})
});
prev?.addEventListener("click",()=>{
if(!audio)return;
audio.currentTime=0;
sync()
});
next?.addEventListener("click",()=>{
if(!audio)return;
audio.currentTime=0;
playMusic()
});
shuffle?.addEventListener("click",()=>{
shuffleOn=!shuffleOn;
shuffle.classList.toggle("active",shuffleOn);
shuffle.setAttribute("aria-pressed",String(shuffleOn));
showToast(shuffleOn?"Shuffle is on ✦":"Shuffle is off.")
});
repeat?.addEventListener("click",()=>{
repeatOn=!repeatOn;
repeat.classList.toggle("active",repeatOn);
repeat.setAttribute("aria-pressed",String(repeatOn));
showToast(repeatOn?"Repeat is on ✦":"Repeat is off.")
});
like?.addEventListener("click",()=>{
like.classList.toggle("active");
like.setAttribute("aria-pressed",String(like.classList.contains("active")));
try{localStorage.setItem("rubyBirthdayLikedTrack",String(like.classList.contains("active")))}catch{}
});
try{
const l=localStorage.getItem("rubyBirthdayLikedTrack")==="true";
like?.classList.toggle("active",l);
like?.setAttribute("aria-pressed",String(l))
}catch{}
seek?.addEventListener("input",()=>seekTo(seek.value));
volume?.addEventListener("input",()=>{
if(audio)audio.volume=clamp(Number(volume.value),0,1);
progress(volume,Number(volume.value)*100)
});
progress(seek,seek?.value||0);
progress(volume,Number(volume?.value||.3)*100);
updatePlay();
sync();

const closeMusicPrompt=()=>{
if(!musicPrompt)return;
musicPrompt.classList.remove("open");
musicPrompt.setAttribute("aria-hidden","true");
body.classList.remove("music-prompt-open")
};
const openMusicPrompt=()=>{
if(!musicPrompt)return;
hideToast();
musicPrompt.classList.add("open");
musicPrompt.setAttribute("aria-hidden","false");
body.classList.add("music-prompt-open")
};

promptPlay?.addEventListener("click",()=>{
closeMusicPrompt();
playMusic()
});
promptLater?.addEventListener("click",closeMusicPrompt);
musicPrompt?.addEventListener("click",e=>{
if(e.target===musicPrompt)closeMusicPrompt()
});
addEventListener("keydown",e=>{
if(e.key==="Escape"&&musicPrompt?.classList.contains("open"))closeMusicPrompt()
});
setTimeout(openMusicPrompt,500);

const closeModal=m=>{
if(!m)return;
m.classList.remove("open");
m.setAttribute("aria-hidden","true");
$$("video",m).forEach(v=>{
try{
v.pause();
v.removeAttribute("src");
v.load()
}catch{}
});
if(![lightbox,charModal].some(x=>x?.classList.contains("open")))body.classList.remove("modal-open")
};

const openModal=m=>{
if(!m)return;
m.classList.add("open");
m.setAttribute("aria-hidden","false");
body.classList.add("modal-open")
};

const openLightbox=(src,caption="")=>{
if(!lightbox||!modalMedia)return;
modalMedia.innerHTML="";
if(modalCaption)modalCaption.textContent=caption;
const video=/\.(mp4|webm|ogg)(\?.*)?$/i.test(src);

if(video){
const v=document.createElement("video");
v.src=src;
v.controls=v.autoplay=true;
v.loop=true;
v.playsInline=true;
v.preload="metadata";
v.setAttribute("aria-label",caption||"Gallery video");
v.onerror=()=>{modalMedia.innerHTML='<div class="media-fallback">This media could not be loaded.</div>'};
modalMedia.appendChild(v);
openModal(lightbox);
v.play().catch(()=>{})
}else{
const img=document.createElement("img");
img.src=src;
img.alt=caption||"Gallery image";
img.onerror=()=>{modalMedia.innerHTML='<div class="media-fallback">This image could not be loaded.</div>'};
modalMedia.appendChild(img);
openModal(lightbox)
}
};

$$(".gallery-item[data-lightbox]").forEach(i=>i.addEventListener("click",()=>openLightbox(i.dataset.lightbox,i.dataset.caption||"")));
$$(".gallery-item video").forEach(v=>{
v.muted=true;
v.addEventListener("mouseenter",()=>v.play().catch(()=>{}));
v.addEventListener("mouseleave",()=>v.pause())
});
$$(".modal").forEach(m=>{
$(".modal-close",m)?.addEventListener("click",()=>closeModal(m));
m.addEventListener("click",e=>{
if(e.target===m)closeModal(m)
})
});
addEventListener("keydown",e=>{
if(e.key==="Escape"){
closeModal(lightbox);
closeModal(charModal)
}
});

const openCharacterModal=({name="Ruby Hoshino",sub="",media="",type="image"}={})=>{
if(!charModal)return;
if(charName)charName.textContent=name;
if(charSub)charSub.textContent=sub;

if(charMedia){
charMedia.innerHTML="";
if(media){
const el=document.createElement(type==="video"?"video":"img");
el.src=media;

if(type==="video"){
el.controls=true;
el.playsInline=true;
el.preload="metadata"
}else el.alt=name;

el.onerror=()=>{
charMedia.innerHTML='<div class="media-fallback">Character media could not be loaded.</div>'
};
charMedia.appendChild(el)
}
}

openModal(charModal)
};

$$("[data-character-name]").forEach(e=>e.addEventListener("click",()=>openCharacterModal({
name:e.dataset.characterName||"Ruby Hoshino",
sub:e.dataset.characterSub||"",
media:e.dataset.characterMedia||"",
type:e.dataset.characterType||"image"
})));

$$("img,video").forEach(e=>e.setAttribute("draggable","false"));

const syncHash=()=>{
const id=location.hash.replace(/^#/,"");
setActive(id&&$(location.hash)?id:"home")
};

addEventListener("hashchange",syncHash);
syncHash();

})();
