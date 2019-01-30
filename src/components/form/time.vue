<template lang="html">
    <div v-if="showComponent" class="" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" :value="value"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group form-hrb">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <div class="from-input-wrapper" @click="inputClicked">
                    <text class="form-input" :style="inputStyle">{{value || '请选择'}}</text>
                    <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
/*
const picker = weex.requireModule('PickerModule');
*/
const picker = weex.requireModule('picker');

export default {
    componentType: 'Time',
    extends: mixin,
    data() {
        return {
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.value ? '' : '#BEBCBC'
            }
        }
    },
    methods: {
        inputClicked() {
            if(this.readonly){
                return;
            }
            picker.pickTime({
                value: 'HH:mm'
            }, (res) => {
                if (res.result === 'success') {
                    this.$emit('input', res.data);
                }
            })
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>