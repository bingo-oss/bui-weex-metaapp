<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <div class="from-input-wrapper" @click="inputClicked">
            <text class="form-input" :style="inputStyle">{{valueText || '选择选项...'}}</text>
            <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
        </div>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const picker = weex.requireModule('picker');

export default {
    componentType: 'SingleSelect',
    extends: mixin,
    computed: {
        inputStyle() {
            return {
                color: this.value ? 'black' : '#BEBCBC'
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
