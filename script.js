const btnMobile = document.getElementById('btn-mobile');
const nav = document.getElementById('nav');

function toggleMenu(event) {
  if (event.type === 'touchstart') event.preventDefault();
  nav.classList.toggle('active');
}

function closeMenu(event) {
  if (!nav.contains(event.target) && !btnMobile.contains(event.target)) {
    nav.classList.remove('active');
  }
}

btnMobile.addEventListener('click', toggleMenu);
btnMobile.addEventListener('touchstart', toggleMenu);
document.addEventListener('click', closeMenu);
