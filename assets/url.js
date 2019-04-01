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
    .replace(/\/$/, '/dist/page.weex.js?pageId=8RsNiu5BT3QREDSmx6Sko5');
/*var viewPageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
        .replace(/\/$/, '/dist/page.weex.js?pageId=c053754b-bce5-404b-8b33-4b7ffaacce8c');*/
var activityListTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/page.weex.js?pageId=1e34f042-4b0f-4157-a264-1b9fa75426e6&id=HINvgvu_q');
