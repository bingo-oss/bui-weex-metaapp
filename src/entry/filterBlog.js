import filterBlog from '../views/dynamic/filterBlog.vue'
import buiweex from 'bui-weex'
import mixins from '../js/mixins.js'

Vue.mixin(mixins);
Vue.use(buiweex);

filterBlog.el = '#root'

new Vue(filterBlog)