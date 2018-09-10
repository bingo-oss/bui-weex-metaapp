import appList from '../views/home.vue'
import buiweex from 'bui-weex'
import mixins from '../js/mixins.js'

Vue.mixin(mixins);
Vue.use(buiweex);

appList.el = '#root'

new Vue(appList)