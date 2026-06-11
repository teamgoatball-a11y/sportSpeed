self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10830835
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')

self.addEventListener('fetch', function(event) {
  // Required by Chrome to be considered installable
  // We just let the request pass through normally
});
