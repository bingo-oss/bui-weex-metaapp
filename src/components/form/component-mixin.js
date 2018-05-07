import EventBus from '../../js/bus.js'

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
        // value 与 filterValue 只能二选一，通过 filterMode 决定用哪个。
        // 对应 emit 的事件分别是 input 和 filterInput
        value: {
            required: false,
        },
        filterValue: {
            type: String,
            required: false,
        },
        filterMode: false,
    },
    methods: {
        validate() {
            if (this.definition.componentParams.required && this.value === undefined) {
                this.$toast(`${this.definition.componentParams.title} 的输入不能为空`)
                return false;
            }
            return true;
        },
        log(any) {
            if (typeof any !== 'string') {
                console.log(JSON.stringify(any));
            } else {
                console.log(any);
            }
        },
    },
    mounted() {
        if (this.definition.id) {
            EventBus.$on(this.definition.id, (visible) => {
                // 表单里的 RadioButton 可以控制别的组件的显示与隐藏
                // 目前以组件 id 作为事件名，各自监听自身的显示与隐藏事件
                this.showComponent = visible;
            })
        }
    }
}
