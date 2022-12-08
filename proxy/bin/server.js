const Koa = require('koa');
const proxy = require('koa-proxies');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const path = require('path');
const LoginRoutes = require('./routes/login.router');
const { corsOptions, proxyOptionsFun } = require('./config');
const app = new Koa();
app.context.customStorage = {};

// 响应
const initServer = () => {
  // cors,log配置
  app.use(logger());
  app.use(cors(corsOptions));
  app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE,OPTION');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    await next();
  });

  // proxy server 和 static server
  app.use(proxy('/rest/api', proxyOptionsFun(app)));
  app.use(serve(path.resolve(__dirname, '../../static')));

  // restful api server
  app.use(bodyParser());
  app.use(LoginRoutes.routes()).use(LoginRoutes.allowedMethods());

  return app.listen(15050, (e) => console.log(e || 'listening at port 15050'));
};

module.exports = initServer;
