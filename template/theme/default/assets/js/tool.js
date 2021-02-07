const tool = document.createElement('div');
tool.innerHTML = '<i class="fa fa-bars" aria-hidden="true"></i>';
tool.className = 'tool';

let open = false;
tool.addEventListener('click', function () {
  const sidebar = document.getElementsByClassName('sidebar')[0];

  if (!open) {
    sidebar.style.left = 0;
    tool.style.left = 'calc(15rem + 1.2rem)';
    tool.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
  } else {
    sidebar.style.left = '-15rem';
    tool.innerHTML = '<i class="fa fa-bars" aria-hidden="true"></i>';
    tool.style.left = '';
  }
  open = !open;
});

document.getElementsByClassName('container')[0].appendChild(tool);
