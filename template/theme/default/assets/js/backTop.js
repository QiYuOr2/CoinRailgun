const backTopBtn = document.createElement('button');

backTopBtn.innerHTML = '<i class="fa fa-arrow-up" aria-hidden="true"></i>';
backTopBtn.className = 'back-top';

backTopBtn.addEventListener('click', function () {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

document.getElementsByClassName('container')[0].appendChild(backTopBtn);
