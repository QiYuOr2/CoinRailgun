const clipboard = new ClipboardJS('.copy-btn');

clipboard.on('success', (e) => {
  console.log('复制成功');
});

clipboard.on('error', (e) => {
  console.log('复制失败');
});
