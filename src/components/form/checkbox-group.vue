<template lang="html">
    <div v-if="showComponent" class="">
        <template v-if="viewMode||forceView">
            <div class="form-group-vertical">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" :value="valueText"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group-vertical form-hrb">
                <div class="label-wrapper-vertical">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <bui-checkbox :items="items" @input="input" :value="value"></bui-checkbox>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import _ from '../../js/tool/lodash.js'

export default {
    componentType: 'Boolean',
    extends: mixin,
    props: {
        "value":{type:Array,default:function(){
            return [];
        }}
    },
    data() {
        return {
            valueText:""
        }
    },
    computed: {
        items() {
            return this.definition.componentParams.options.map(o => {
                return {
                    value: o.id,
                    title: o.text
                }
            })
        }
    },
    watch:{
        value(val){
            let _value=[];
            _.each(this.items,(item,index)=>{
                if(item.value==val){
                    _value.push(item.title)
                }
            });
            this.valueText = _value.join(",");
        }
    },
    methods: {
        input(value) {
            var emitValue=Object.assign([],this.value);
            this.$emit('input',emitValue);
            this.emitExData();
        },
        initDefault:function(){
            let _defaultSelected=[];
            if(this.definition.componentParams.options){
                _.each(this.definition.componentParams.options,function(option){
                    if(option.checked){
                        _defaultSelected.push(option.id);
                    }
                });
            }
            //如果当前选中的值和默认值不一样才变更
            if(this.value!=_defaultSelected){
                this.value=Object.assign([],_defaultSelected);
                this.$emit('input',_defaultSelected);
                this.emitExData();
            }
        },
        emitOthersValue:function(othersValue){
            this.emitExData(othersValue);
        },
        emitExData:function(othersValue){
            var _this=this;
            var exData={};
            var optionsMap= {};
            if(this.definition.componentParams.options){
                _.each(this.definition.componentParams.options,function(option){
                    optionsMap[option.id] = option.text;
                });
            }
            var othersId=this.definition.componentParams.otherOptions.id;
            _.each(this.value,function(selectedId){
                if(othersId!==selectedId){
                    exData[selectedId]=_this.buildExData(optionsMap[selectedId]);
                }
            });
            if(othersValue){
                exData[othersId]=_this.buildExData(othersValue);
            }
            this.$emit("exDataChanged",exData,this.definition.dataField);
        }
    },
    mounted:function(){
        if(_.isEmpty(this.value)){
            this.$emit('input',[]);
            this.initDefault();
        }
    }
}
</script>

<style src="../../styles/common.css" scoped="false"></style>