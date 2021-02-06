const nav = document.getElementsByTagName('nav')[0];

const backIcon = document.createElement('i');
backIcon.className = 'fa fa-angle-left';
backIcon.setAttribute('aria-hidden', 'true');

const backButton = document.createElement('p');
backButton.innerHTML = '返回主页';
backButton.className = 'back-home';
backButton.insertBefore(backIcon, backButton.childNodes[0]);
backButton.addEventListener('click', () => {
  window.location.href = '/';
});

nav.insertBefore(backButton, nav.getElementsByTagName('ul')[0]);
