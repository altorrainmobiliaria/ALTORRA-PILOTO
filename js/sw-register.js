/* js/sw-register.js */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(()=>{});
}
