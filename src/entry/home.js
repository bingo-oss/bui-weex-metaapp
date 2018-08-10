import appList from '../views/home.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

appList.el = '#root'

new Vue(appList)