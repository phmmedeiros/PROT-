const CACHE='prot-plus-v2';
const ASSETS=['./','./index.html','./style.css','./app.js','./manifest.json','../dados/receitas.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('fetch',event=>event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>event.request.url.endsWith('.png')?Response.error():caches.match('./index.html')))));
