// Setzt die E-Mail-Adresse erst im Browser zusammen, damit einfache Bots sie nicht im HTML finden.
document.querySelectorAll('a.email').forEach(function (a) {
  var rev = function (s) { return s.split('').reverse().join(''); };
  var addr = rev(a.dataset.u) + '@' + rev(a.dataset.d);
  a.href = 'mailto:' + addr;
  a.textContent = addr;
});
