const C='bollette-v1';
const PRE=['./','./index.html','./manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://unpkg.com/megajs@1/dist/main.browser-umd.js'];
const CDN=['cdnjs.cloudflare.com','unpkg.com'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>Promise.allSettled(PRE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // pagina: prima la rete (così ricevi gli aggiornamenti), se offline usa la copia
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else if(CDN.includes(u.hostname)){
    // librerie: prima la copia salvata
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res})));
  }
  // tutto il resto (MEGA) passa normalmente
});