const tagBtns = document.querySelectorAll('nav li[tg]');
const postList = document.querySelectorAll('.tag-post li[tg]');

postList.forEach((p) => (p.style.display = 'none'));

tagBtns.forEach((btn) => {
  const btnTg = btn.getAttribute('tg');
  btn.addEventListener('click', function () {
    postList.forEach((p) => (p.style.display = 'none'));
    if (btn.className === 'active') {
      btn.className = '';
      return;
    }
    Array.from(postList)
      .filter((p) => p.getAttribute('tg').split(',').includes(btnTg))
      .forEach((p) => (p.style.display = 'block'));
    tagBtns.forEach((b) => (b.className = ''));
    btn.className = 'active';
  });
});
