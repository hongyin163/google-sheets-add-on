// preload.js
const initServer = require('./proxy/bin/server');

// 所有Node.js API都可以在预加载过程中使用。
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
  const server = initServer();
  console.log(server.address());

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      replaceText(
        'server-status',
        'Something (another process) is already listening on port 15050. Find the service and stop/kill it.'
      );
    } else {
      replaceText('server-status', JSON.stringify(err));
    }
  });
  server.on('listening', (err) => {
    server &&
      replaceText(
        'server-status',
        `The service is running at 127.0.0.1:${server.address().port}`
      );
  });
});
