import businessList from '../views/business/businessList.vue'
import buiweex from 'bui-weex'
import mixins from '../js/mixins.js'

Vue.mixin(mixins);
Vue.use(buiweex);

businessList.el = '#root'

new Vue(businessList)