var protocol = location.protocol + '//'
var hostname = typeof CURRENT_IP === 'string' ? CURRENT_IP : location.hostname
var port = location.port ? ':' + location.port : ''
var pageTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/page.weex.js?pageId=demo_page');
var activityListTestUrl = protocol + hostname + port + location.pathname.replace(/\/index\.html$/, '/')
    .replace(/\/$/, '/dist/list.weex.js?viewId=n34Zs9i2qAeEeqnZvfwUnW');
