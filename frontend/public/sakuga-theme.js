// Rak Kata theme bridge for <sakuga-button>.
// Recolors the canvas effects to the site palette (cherry / navy / cream / tan).
// This does not modify button.js: it only overrides the exposed SakugaFX palette object.
(function () {
  var P = window.SakugaFX && window.SakugaFX.P;
  if (!P) return;
  P.fill = '#FFFDF8'; // light tone
  P.shade = '#E6DFD3'; // shadow tone (--line)
  P.line = '#14213D'; // outline (--navy)
  P.accent = '#B3173B'; // accents, needles, check (--cherry)
  P.ink = '#14213D';
  // Keep the impact animation, but draw no sound-effect lettering.
  // The checkbox's ズザッ is filtered separately because its dotted style
  // hardcodes an edge colour and ignores this palette.
  P.sfx = ['transparent', 'transparent'];
})();
