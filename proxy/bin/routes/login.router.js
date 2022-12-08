const Router = require('@koa/router');
const fetch = require('node-fetch');
const { targetJiraUrl } = require('../config');

const router = new Router({
  prefix: '/login',
});
router.get('/', (ctx) => {
  if (ctx.customStorage && ctx.customStorage.loginInfo) {
    ctx.body = { data: ctx.customStorage.loginInfo, code: 0 };
  } else {
    ctx.body = { code: 3, message: 'No login' };
  }
});
router.post('/', async (ctx) => {
  if (
    !ctx.request.body ||
    !ctx.request.body.username ||
    !ctx.request.body.password
  ) {
    ctx.body = { code: 2, message: 'User information cannot be empty' };
  }
  const loginInfo = { ...ctx.request.body };
  const { username, password } = loginInfo;
  const basic = new Buffer.from(`${username}:${password}`).toString('base64');
  const response = await fetch(`${targetJiraUrl}/rest/api/2/myself`, {
    method: 'GET',
    headers: { Authorization: `Basic ${basic}`, Accept: 'application/json' },
  });
  if (response.status === 200) {
    ctx.customStorage.loginInfo = { ...loginInfo };
    ctx.body = { code: 0, message: 'Login successfully' };
  } else {
    ctx.body = { code: 1, message: 'Login failed' };
  }
});

module.exports = router;
