const categoryBtns = document.querySelectorAll('nav li[ctg]');
const postList = document.querySelectorAll('.category-post li[ctg]');

categoryBtns.forEach((btn) => {
  const btnCtg = btn.getAttribute('ctg');
  btn.addEventListener('click', function () {
    postList.forEach((p) => (p.style.display = 'block'));
    if (btn.className === 'active') {
      btn.className = '';
      return;
    }
    Array.from(postList)
      .filter((p) => p.getAttribute('ctg') !== btnCtg)
      .forEach((p) => (p.style.display = 'none'));
    categoryBtns.forEach((b) => (b.className = ''));
    btn.className = 'active';
  });
});
