document.querySelectorAll('.navtoggle').forEach(function(btn){
  btn.addEventListener('click', function(){
    var sec = btn.closest('.navsec');
    var open = sec.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});
