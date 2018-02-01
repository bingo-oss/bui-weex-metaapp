<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <text class="form-input" :style="inputStyle" @click="inputClicked">{{valueText || '选择选项...'}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
import EventBus from '../js/bus.js'
const picker = weex.requireModule('picker');

export default {
    componentType: 'SingleSelect',
    extends: mixin,
    computed: {
        inputStyle() {
            return {
                color: this.value ? '' : '#BEBCBC'
            }
        },
        valueText() {
            let opt = this.definition.componentParams.options.find(o => o.id === this.value);
            return opt && opt.text;
        }
    },
    methods: {
        inputClicked() {
            picker.pick({
                items: this.definition.componentParams.options.map(option => option.text)
            }, (res) => {
                if (res.result === 'success') {
                    let id = this.definition.componentParams.options[res.data].id;
                    this.$emit('input', id);
                }
            })
        },
    },
}
</script>

<style src="../styles/common.css"></style>
