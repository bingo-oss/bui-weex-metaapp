var protocol = location.protocol + '//'
var hostname = typeof CURRENT_IP === 'string' ? CURRENT_IP : location.hostname
var port = location.port ? ':' + location.port : ''
var pageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/page.weex.js?pageId=view_page');
/*var viewPageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/page.weex.js?pageId=235a5bbd-94cd-4cc5-b6f2-743a70a3d867&taskId=c8bb4756-6eb6-11e8-b0e7-d00dfcedd441&procDefKey=leave');*/
/*var viewPageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
        .replace(/\/$/, '/dist/page.weex.js?pageId=onduty');*/
var viewPageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/page.weex.js?pageId=4ev9H8FWYhSXcQmkFmVEJW');
/*var viewPageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
        .replace(/\/$/, '/dist/page.weex.js?pageId=c053754b-bce5-404b-8b33-4b7ffaacce8c');*/
var activityListTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/list.weex.js?viewId=n34Zs9i2qAeEeqnZvfwUnW');
