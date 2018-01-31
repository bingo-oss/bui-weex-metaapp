import EventBus from '../js/bus.js'

export default {
    data() {
        return {
            showComponent: true,  // 每个组件都可以被控制展示与否
        }
    },
    props: {
        definition: {
            type: Object,
            required: true,
        },
        value: {
            required: false,
        }
    },
    methods: {
        validate() {
            return true;
        },
        log(any) {
            if (typeof any === 'object') {
                console.log(JSON.stringify(any));
            } else {
                console.log(any);
            }
        }
    },
    mounted() {
        EventBus.$on(this.definition.id, (visible) => {
            // 表单里的 RadioButton 可以控制别的组件的显示与隐藏
            // 目前以组件 id 作为事件名，各自监听自身的显示与隐藏事件
            this.showComponent = visible;
        })
    }
}
