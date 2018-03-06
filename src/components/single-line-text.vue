<template lang="html">
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper">
            <text class="form-label">{{definition.componentParams.title}}:</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <input @input="input" class="form-input-native" type="text" :value="value" :placeholder="definition.componentParams.placeholder"/>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'SingleLineText',
    extends: mixin,
    data() {
        return {
        }
    },
    watch: {
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    let ret = /%(\S)*%/.exec(val);
                    if (ret) this.value = ret[1];
                }
            }
        }
    },
    methods: {
        input(e) {
            if (!this.filterMode) {
                this.$emit('input', e.value);
            } else {
                this.$emit('filterInput', `${this.definition.dataField} like %${e.value}%`)
            }
        },

        validate() {
            let patternOk = true;
            let lengthOk = true;

            if (this.definition.componentParams.validation.validate) {
                let pattern = this.definition.componentParams.validation.rule.pattern;
                let r = new RegExp(pattern);
                patternOk = r.test(this.value);
                console.log('pattern test: ' + patternOk);
            }

            let limitLength = this.definition.componentParams.limitLength;
            if (limitLength.limit) {
                if (!this.value) {
                    lengthOk = false;
                } else {
                    lengthOk = this.value.length >= limitLength.min && this.value.length <= limitLength.max;
                }
                console.log('length test: ' + lengthOk);
            }

            let validated = lengthOk && patternOk;
            if (!validated) {
                this.$toast(`${this.definition.componentParams.title} 输入验证失败`);
            }
            return validated;
        },
    },
}
</script>

<style src="../styles/common.css"></style>
