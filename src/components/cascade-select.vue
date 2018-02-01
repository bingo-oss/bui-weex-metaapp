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
    componentType: 'CascadeSelect',
    extends: mixin,
    data() {
        return {
            valueText: '',
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
            let pickOptions = (options) => {
                picker.pick({
                    items: options.map(option => option.text)
                }, (res) => {
                    if (res.result === 'success') {
                        let children = options[res.data].children;
                        if (!children.length) {
                            let opt = options[res.data];
                            this.$emit('input', opt.id);
                            this.valueText = opt.__label;
                        } else {
                            // TODO: 如果在 picker.pick() 的 callback 里调用 picker.pick() 会失效，因此这里在 setTimeout 递归调用
                            setTimeout(() => {
                                pickOptions(children);
                            }, 400);
                        }

                    }
                })
            }
            let options = this.definition.componentParams.cascadeOptions.options;
            pickOptions(options);

        },
    },
}
</script>

<style src="../styles/common.css"></style>
