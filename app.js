var koa = require('koa');
var app = koa();
/*路由中间件*/
var controller = require('koa-route');
/*访问模板中间件*/
var co = require('co');
var coViews = require('co-views');
var render = coViews('./view',{
    map:{html:'ejs'}
});
/*访问静态资源中间件*/
var koa_static = require('koa-static-server');


/*跑通路由*/
app.use(controller.get('/route_test',function*(){
    this.set('Cache-Controller','no-cache');
    this.body = 'hello koa';
}));
/*路由跑通模板*/
app.use(controller.get('/ejs_test',function*(){
    this.set('Cache-Control','no-cache');
    // yeild ES6 generator语法
    this.body = yield render('test.html',{title:'title_test'});
}));
/*跑通静态资源*/
app.use(koa_static({
    rootDir:'./static/', // 查找静态资源文件目录
    rootPath:'/static/', // 查找静态资源路径
    maxage:0
}));

app.listen(3001);

console.log('koa server is stated!');

