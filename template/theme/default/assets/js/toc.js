const toc = document.getElementById('toc');
const tocParent = toc.parentElement;
const sidebarToc = document.getElementById('catalogue');

tocParent.removeChild(toc);

sidebarToc.appendChild(toc);

const links = toc.querySelectorAll('li a');

links.forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = this.getAttribute('href').replace('#', '');
    const anchor = document.querySelector(`*[id="${target}"]`);
    window.scrollTo({
      top: anchor.offsetTop,
      behavior: 'smooth',
    });
  });
});

if (!toc.innerText) {
  sidebarToc.style.display = 'none';
}
