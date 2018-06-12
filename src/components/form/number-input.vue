<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <input @input="input" :disabled="readonly" class="form-input-native" type="number" :value="value"/>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'NumberInput',
    extends: mixin,
    data() {
        return {
        }
    },
    methods: {
        input(e) {
            this.$emit('input', e.value);
        },

        validate() {
            if (!this.definition.componentParams.required && !this.value) {
                return true;
            }

            let pattern = /^-?\d+(\.\d+)?$/;
            let result = pattern.exec(this.value);
            if (!result) {
                this.$toast('数字输入非法');
                return false;
            }
            let numberValue = parseFloat(this.value);

            if (result[1]) {
                // 存在小数部分
                if (!this.definition.componentParams.decimal.isAllowed) {
                    this.$toast('不允许小数输入');
                    return false;
                } else {
                    // TODO: 保留小数位
                }
            }

            if (!this.definition.componentParams.allowNegatived) {
                if (numberValue < 0) {
                    this.$toast('不允许负数');
                    return false;
                }
            }

            let limitRange = this.definition.componentParams.limitRange;
            if (limitRange.limit) {
                if (typeof limitRange.max === 'number') {
                    if (numberValue > limitRange.max) {
                        this.$toast('超出最大值');
                        return false;
                    }
                }
                if (typeof limitRange.min === 'number') {
                    if (numberValue < limitRange.min) {
                        this.$toast('超出最小值');
                        return false;
                    }
                }
            }

            return true;
        },
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>