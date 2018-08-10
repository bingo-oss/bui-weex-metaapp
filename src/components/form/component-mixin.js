import EventBus from '../../js/bus.js';
import Utils from '../../js/tool/utils'
let constants = {
    entityModelRedundantKey:'_data',
    entityModelTitleKey:'title'
}
export default {
    data() {
        return {
            showComponent: true,  // 每个组件都可以被控制展示与否
            readonly:false, //组件只读模式
            forceView:false//组件视图模式
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
        fieldSetting:{
            type:Object,
            required: false,
            default(){
                return {};
            }
        },
        viewMode:{
            default(){
                //视图模式
                return false
            }
        },
        model:{
            type: Object,
            required: true,
        }
    },
    methods: {
        buildExData(value){//构造组件需要保存的冗余数据
            var exData={};
            exData[constants.entityModelTitleKey]=value;
            return exData;
        },
        getExData(id){//编辑模式获取当前表单数据字段id的冗余数据
            if(!id){
                return null;
            }
            var _data=this.model&&this.model[constants.entityModelRedundantKey];
            _data=_data||{};
            _data= _data[this.definition.dataField]||{};
            return _data[id]&&_data[id][constants.entityModelTitleKey];
        },
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
        fieldSettingApply(){//将字段的显示和隐藏等设置应用到当前字段组件
            this.showComponent=!(this.fieldSetting.mode===Utils.widgetMode.invisible);
            this.readonly=this.fieldSetting.mode===Utils.widgetMode.readonly;
            this.forceView=this.fieldSetting.mode===Utils.widgetMode.forceView;
        }
    },
    mounted() {
        if (this.definition.id) {
            EventBus.$on(this.definition.id, (visible) => {
                // 表单里的 RadioButton 可以控制别的组件的显示与隐藏
                // 目前以组件 id 作为事件名，各自监听自身的显示与隐藏事件
                this.showComponent = visible;
            })
        }
        this.fieldSettingApply();
    }
}
