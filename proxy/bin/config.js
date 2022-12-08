const ua = require('default-user-agent');
const targetJiraUrl = 'https://jira.domain.io';
const corsOptions = {
  origin: '*',
};
const proxyOptionsFun = (app) => {
  return {
    target: targetJiraUrl,
    changeOrigin: true,
    logs: true,
    events: {
      proxyReq: (proxyReq, req, res) => {
        proxyReq.removeHeader('cookie');
        proxyReq.setHeader('user-agent', ua());
        if (app.context.customStorage && app.context.customStorage.loginInfo) {
          const { username, password } = app.context.customStorage.loginInfo;
          const basic = new Buffer.from(`${username}:${password}`).toString(
            'base64'
          );
          proxyReq.setHeader('Authorization', `Basic ${basic}`);
        }
      },
    },
  };
};
module.exports = { targetJiraUrl, corsOptions, proxyOptionsFun };
