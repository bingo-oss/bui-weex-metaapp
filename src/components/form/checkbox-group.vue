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
            <bui-checkbox :items="items" @input="input" :value="value"></bui-checkbox>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import _ from '../../js/tool/lodash.js'

export default {
    componentType: 'Boolean',
    extends: mixin,
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
            this.$emit('input', value);
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>