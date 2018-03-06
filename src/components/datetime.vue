<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <div class="from-input-wrapper" @click="inputClicked">
            <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
            <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
        </div>
    </div>
</template>

<script>
import mixin from './component-mixin.js'
const picker = weex.requireModule('picker');

export default {
    componentType: 'DateTime',
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
        },
        valueText() {
            if (this.value) {
                let d = new Date(this.value);
                return d.toLocaleString(undefined, {hour12: false});
            }
            return '';
        }
    },
    methods: {
        inputClicked() {
            picker.pickDate({
                value: 'yyyy-MM-dd'
            }, (res) => {
                if (res.result === 'success') {
                    let d = res.data;
                    setTimeout(() => {
                        picker.pickTime({
                            value: 'HH:mm'
                        }, (res) => {
                            if (res.result === 'success') {
                                let t = res.data;
                                // 参考 ISO Date String
                                let date = new Date(`${d}T${t}:00+08:00`)
                                this.$emit('input', date.toISOString());
                            }
                        })
                    }, 500) // TODO: 这里需要延时，否则 pickTime 无法弹出

                    this.nextTick(() => {

                    })
                }
            })
        }
    },
}
</script>

<style src="../styles/common.css"></style>
