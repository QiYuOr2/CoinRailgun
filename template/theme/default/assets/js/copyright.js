const author = document.querySelector('meta[name="author"]');
const cr = document.createElement('blockquote');
cr.innerHTML = ` <p><span>本文作者：</span><span>${author.getAttribute(
  'content'
)}</span></p>
<p><span>本文链接：</span><a href="${decodeURI(
  window.location.href
)}">${decodeURI(window.location.href)}</a></p>
<p><span>版权声明：</span><span>本博客所有文章除特别声明外，均采用<i class="fa fa-cc" aria-hidden="true"></i>BY-NC-SA 许可协议。转载请注明出处！</span></p>`;

document.getElementsByClassName('post')[0].appendChild(cr);
