<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <input @input="input" class="form-input" type="text" :value="value" :placeholder="definition.componentParams.placeholder"/>
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
    methods: {
        input(e) {
            this.$emit('input', e.value);
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
