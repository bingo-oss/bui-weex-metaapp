<template lang="html">
    <div v-if="showComponent" class="form-group-vertical">
        <template v-if="viewMode||forceView">
            <div class="label-wrapper">
                <text class="form-label view-label">{{definition.componentParams.title}}</text>
                <text class="view-text" :value="valueText"></text>
            </div>
        </template>
        <template v-else>
            <div class="label-wrapper-vertical">
                <text class="form-label">{{definition.componentParams.title}}</text>
                <text class="required-mark" v-if="definition.componentParams.required">*</text>
            </div>
            <bui-radio :items="items" @input="input" :value="filterMode ? radioValue : value"></bui-radio>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import EventBus from '../../js/bus.js'
import _ from '../../js/tool/lodash.js'

export default {
    componentType: 'Boolean',
    extends: mixin,
    props: {
        wholeDefinition: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            controlledComps: [],
            radioValue: null,
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
    watch: {
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    let ret = /eq\s(\S*)/.exec(val);
                    if (ret) this.radioValue = ret[1];
                }
            }
        },
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
            if (this.filterMode) {
                this.$emit('filterInput', `${this.definition.dataField} eq ${value}`);
            } else {
                this.$emit('input', value);
            }
            // if (this.controlledComps.length) {
            //     // 存在关联关系的 RadioButton，触发显示/隐藏事件
            //     let tmpMemo = {};
            //     this.config.toggleSetting[value].forEach(id => {
            //         tmpMemo[id] = true;
            //     })
            //     this.controlledComps.forEach(id => {
            //         if (tmpMemo[id]) {
            //             EventBus.$emit(id, true);
            //         } else {
            //             EventBus.$emit(id, false);
            //         }
            //     })
            // }
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>