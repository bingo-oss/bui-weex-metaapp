import filterBlog from '../views/dynamic/filterBlog.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

filterBlog.el = '#root'

new Vue(filterBlog)