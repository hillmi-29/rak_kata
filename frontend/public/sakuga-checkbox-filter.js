// Rak Kata: drop the checkbox's ズザッ lettering.
// The checkbox draws that word with a hardcoded dotted edge colour that ignores
// the --sk-* palette, so it cannot be hidden with CSS. Filter just that word at
// load time; checkbox.js and every other Sakuga effect stay untouched.
(function () {
  var fx = window.SakugaFX;
  if (!fx || fx.__rakKataNoZuza) return;
  fx.__rakKataNoZuza = true;
  var sfx = fx.sfx;
  fx.sfx = function (name) {
    if (name === 'zuza') return;
    return sfx.apply(this, arguments);
  };
})();
