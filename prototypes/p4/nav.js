document.querySelectorAll('.navtoggle').forEach(function(btn){
  btn.addEventListener('click', function(){
    var sec = btn.closest('.navsec');
    var open = sec.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

// mobile drawer
var burger = document.querySelector('.menubtn');
var backdrop = document.querySelector('.nav-backdrop');
function closeNav(){ document.body.classList.remove('nav-open'); if(burger) burger.setAttribute('aria-expanded','false'); }
if(burger && backdrop){
  burger.addEventListener('click', function(){
    var open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  backdrop.addEventListener('click', closeNav);
  document.querySelectorAll('.rail a').forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNav(); });
}
