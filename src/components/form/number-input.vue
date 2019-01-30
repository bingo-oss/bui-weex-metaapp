<template lang="html">
    <div v-if="showComponent" class="" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" :value="valueText"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group form-hrb">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <input ref="input" @input="input" :disabled="readonly" :value="valueText"  class="form-input-native" type="number"/>
            </div>
        </template>
    </div>
</template>

<script>
    import mixin from './component-mixin.js'

    export default {
        componentType: 'NumberInput',
        extends: mixin,
        data() {
            return {
                valueText: '',
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(val) {
                    if (!this.filterMode) {
                        this.valueText = val;
                    }
                }
            },
            filterValue: {
                immediate: true,
                handler(val) {
                    if (this.filterMode) {
                        let ret = /%(\S*)%/.exec(val);
                        if (ret) this.valueText = ret[1];
                    }
                }
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

                if (this.definition.componentParams.required && this.value === undefined) {
                    this.validatorErrorBag = `${this.definition.componentParams.title} 的输入不能为空`;
                    this.$refs['input'].focus();
                    //this.$toast(`${this.definition.componentParams.title} 的输入不能为空`)
                    return false;
                }

                let pattern = /^-?\d+(\.\d+)?$/;
                let result = pattern.exec(this.value);
                if (!result) {
                    this.validatorErrorBag = `数字输入非法`;
                    this.$toast('数字输入非法');
                    return false;
                }
                let numberValue = parseFloat(this.value);

                if (result[1]) {
                    // 存在小数部分
                    if (!this.definition.componentParams.decimal.isAllowed) {
                        this.validatorErrorBag = `不允许小数输入`;
                        this.$toast('不允许小数输入');
                        return false;
                    } else {
                        // TODO: 保留小数位
                    }
                }

                if (!this.definition.componentParams.allowNegatived) {
                    if (numberValue < 0) {
                        this.validatorErrorBag = `不允许负数`;
                        this.$toast('不允许负数');
                        return false;
                    }
                }

                let limitRange = this.definition.componentParams.limitRange;
                if (limitRange.limit) {
                    if (typeof limitRange.max === 'number') {
                        if (numberValue > limitRange.max) {
                            this.validatorErrorBag = `超出最大值`;
                            this.$toast('超出最大值');
                            return false;
                        }
                    }
                    if (typeof limitRange.min === 'number') {
                        if (numberValue < limitRange.min) {
                            this.validatorErrorBag = `超出最小值`;
                            this.$toast('超出最小值');
                            return false;
                        }
                    }
                }
                this.validatorErrorBag = "";
                return true;
            },
        },
    }
</script>

<style src="../../styles/common.css" scoped="false"></style>