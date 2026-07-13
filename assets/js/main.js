const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.navlinks');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? '關閉選單' : '開啟選單');
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', '開啟選單');
    }
  });
}
