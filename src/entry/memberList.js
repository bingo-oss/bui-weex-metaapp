import memberList from '../views/components/memberList.vue'
import buiweex from 'bui-weex'

Vue.use(buiweex);

memberList.el = '#root';

new Vue(memberList)