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
            <div class="form-group form-hrb" style="padding-top:10px; padding-bottom: 10px;">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <input style="padding-top:30px; padding-bottom: 30px;"  ref="input" @input="input" :disabled="readonly" class="form-input-native" type="text" :value="valueText" :placeholder="definition.componentParams.placeholder" />
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'SingleLineText',
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
            if (this.filterMode) {
                this.$emit('filterInput', `${this.definition.dataField} like %${e.value}%`)
            } else {
                this.$emit('input', e.value);
            }
        },

        validate() {
            let patternOk = true;
            let lengthOk = true;
            let errorTips = ''
            if (this.definition.componentParams.required && !this.value/*this.value === undefined*/) {
                this.validatorErrorBag = `${this.definition.componentParams.title} 的输入不能为空`;
                this.$refs['input'].focus();
                //this.$toast(`${this.definition.componentParams.title} 的输入不能为空`)
                return false;
            }

            if (this.definition.componentParams.validation.validate) {
                let pattern = this.definition.componentParams.validation.rule.pattern;
                let r = new RegExp(pattern);
                if (!patternOk) errorTips = '非法格式';
                patternOk = r.test(this.value);
            }

            let limitLength = this.definition.componentParams.limitLength;
            if (limitLength.limit) {
                if (!this.value && limitLength.min > 0) {
                    lengthOk = false;
                    errorTips = '不能为空';
                } else if (this.value) {
                    lengthOk = this.value.length >= limitLength.min && this.value.length <= limitLength.max;
                    if (!lengthOk) {
                        errorTips = `字数范围为 ${limitLength.min} - ${limitLength.max}`;
                    }
                }
            }

            let validated = lengthOk && patternOk;
            if (!validated) {
                this.validatorErrorBag = `${this.definition.componentParams.title}: ${errorTips}`
                this.$refs['input'].focus();
                //this.$toast(`${this.definition.componentParams.title}: ${errorTips}`);
            }else{
                this.validatorErrorBag = null;
            }
            return validated;
        },
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>