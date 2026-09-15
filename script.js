const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);

const menu=$(".menu"),nav=$("nav");
menu?.addEventListener("click",()=>nav?.classList.toggle("open"));

const links=$$("nav a"),sections=$$("section");
new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")=="#"+e.target.id))}}),{threshold:.35}).observe(...sections);

const audio=$("#audio"),play=$("#play"),seek=$("#seek"),volume=$("#volume"),current=$("#currentTime"),duration=$("#duration"),prev=$("#prev"),next=$("#next"),shuffle=$("#shuffle"),repeat=$("#repeat"),like=$("#like");

function fmt(t){if(!isFinite(t))return"0:00";return`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,"0")}`}
function setProgress(p){p=Math.max(0,Math.min(100,p));seek?.style.setProperty("--progress",`${p}%`)}
function setVolumeProgress(v){v=Math.max(0,Math.min(1,v));volume?.style.setProperty("--progress",`${v*100}%`)}

if(audio){
audio.volume=.85;
if(volume){volume.value=.85;setVolumeProgress(.85)}
setProgress(0);
audio.addEventListener("loadedmetadata",()=>{if(duration)duration.textContent=fmt(audio.duration)});
audio.addEventListener("timeupdate",()=>{let p=audio.duration?audio.currentTime/audio.duration*100:0;if(seek){seek.value=p;setProgress(p)}if(current)current.textContent=fmt(audio.currentTime)});
audio.addEventListener("play",()=>{if(play)play.textContent="Ⅱ"});
audio.addEventListener("pause",()=>{if(play)play.textContent="▶"});
play?.addEventListener("click",()=>audio.paused?audio.play():audio.pause());
seek?.addEventListener("input",()=>{audio.currentTime=audio.duration*seek.value/100;setProgress(seek.value)});
volume?.addEventListener("input",()=>{audio.volume=volume.value;setVolumeProgress(volume.value)});
prev?.addEventListener("click",()=>audio.currentTime=0);
next?.addEventListener("click",()=>{audio.currentTime=audio.duration||0});
shuffle?.addEventListener("click",()=>shuffle.classList.toggle("active"));
repeat?.addEventListener("click",()=>repeat.classList.toggle("active"));
like?.addEventListener("click",()=>like.classList.toggle("active"));
audio.addEventListener("ended",()=>{if(repeat?.classList.contains("active")){audio.currentTime=0;audio.play()}});
}

const toast=m=>{let t=$(".toast");if(!t)return;t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)};

$$("[data-modal]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.modal)?.classList.add("show")));
$$(".modal").forEach(m=>{m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("show")});m.querySelector(".close")?.addEventListener("click",()=>m.classList.remove("show"))});

$$(".gallery img").forEach(img=>img.addEventListener("click",()=>{let m=$("#galleryModal"),x=$("#galleryPreview");if(m&&x){x.src=img.src;m.classList.add("show")}}));

$("#messageForm")?.addEventListener("submit",e=>{e.preventDefault();toast("Message sent ♡");e.target.reset()});
