<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <bui-radio :items="items" @input="input" :value="value"></bui-radio>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import EventBus from '../js/bus.js'

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
            items: this.definition.componentParams.options.map(o => {
                return {
                    value: o.id,
                    title: o.text
                }
            })
        }
    },
    methods: {
        input(value) {
            this.$emit('input', value);
            if (this.controlledComps.length) {
                // 存在关联关系的 RadioButton，触发显示/隐藏事件
                let tmpMemo = {};
                this.config.toggleSetting[value].forEach(id => {
                    tmpMemo[id] = true;
                })
                this.controlledComps.forEach(id => {
                    if (tmpMemo[id]) {
                        EventBus.$emit(id, true);
                    } else {
                        EventBus.$emit(id, false);
                    }
                })
            }
        }
    },
    mounted() {
        // 处理关联关系，目前只有 RadioButton 能控制关联关系
        let config = this.config = this.wholeDefinition.logistics.optionsToggleComponentsConfig[this.definition.id];
        if (config) {
            let controlledComps = []; // 将受控制的组件 id 放这里
            let memo = {}; // 将不受控制的组件 id 放这里
            config.optionsToggleCommonShowFields.forEach(id => {
                memo[id] = true;
            })
            // 所有控件 - 不受控制控件 = 受控制控件
            this.wholeDefinition.layout.forEach(e => {
                if (!e.isDataField || memo[e.id] || e.id === this.definition.id) return;
                controlledComps.push(e.id);
            })
            this.controlledComps = controlledComps;
        }
    }
}
</script>

<style src="../styles/common.css"></style>
