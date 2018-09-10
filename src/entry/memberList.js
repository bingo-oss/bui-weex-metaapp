import memberList from '../views/components/memberList.vue'
import buiweex from 'bui-weex'
import mixins from '../js/mixins.js'

Vue.mixin(mixins);
Vue.use(buiweex);

memberList.el = '#root';

new Vue(memberList)