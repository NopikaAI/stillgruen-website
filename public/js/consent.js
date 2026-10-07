// Einwilligungs-Banner für Google Analytics und Google Ads.
// Google wird erst geladen, nachdem eine Einwilligung erteilt wurde (Consent Mode v2, Standard: abgelehnt).
(function () {
  var box = document.getElementById('consent');
  if (!box) return;
  var GA = box.dataset.ga, ADS = box.dataset.ads, KEY = 'sg-consent', VERSION = 1;
  var $ = function (id) { return document.getElementById(id); };

  function read() { try { var c = JSON.parse(localStorage.getItem(KEY)); return c && c.v === VERSION ? c : null; } catch (e) { return null; } }
  function write(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  var loaded = false;
  function apply(c) {
    if (!c.stats && !c.ads) {
      if (loaded) gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      return;
    }
    if (!loaded) {
      gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });
      gtag('js', new Date());
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA || ADS);
      document.head.appendChild(s);
      loaded = true;
    }
    gtag('consent', 'update', {
      analytics_storage: c.stats ? 'granted' : 'denied',
      ad_storage: c.ads ? 'granted' : 'denied',
      ad_user_data: c.ads ? 'granted' : 'denied',
      ad_personalization: 'denied'
    });
    if (GA && c.stats) gtag('config', GA, { anonymize_ip: true });
    if (ADS && c.ads) gtag('config', ADS);
  }

  function save(stats, ads) {
    var c = { v: VERSION, stats: !!(GA && stats), ads: !!(ADS && ads), t: new Date().toISOString() };
    var before = read();
    write(c); box.hidden = true;
    // Wurde eine Einwilligung zurückgenommen, Seite neu laden, damit Google nicht weiterläuft.
    if (before && ((before.stats && !c.stats) || (before.ads && !c.ads))) { location.reload(); return; }
    apply(c);
  }
  function open(full) {
    var c = read() || {};
    if ($('cStats')) $('cStats').checked = !!c.stats;
    if ($('cAds')) $('cAds').checked = !!c.ads;
    $('consentOpts').hidden = !full; $('cSave').hidden = !full; $('cMore').setAttribute('aria-expanded', String(!!full));
    box.hidden = false;
  }

  $('cAll').addEventListener('click', function () { save(true, true); });
  $('cNone').addEventListener('click', function () { save(false, false); });
  $('cMore').addEventListener('click', function () { open(true); });
  $('cSave').addEventListener('click', function () { save($('cStats') && $('cStats').checked, $('cAds') && $('cAds').checked); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-consent-open]');
    if (a) { e.preventDefault(); open(true); }
  });

  var c = read();
  if (c) apply(c); else open(false);
})();
