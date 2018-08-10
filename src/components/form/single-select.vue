<template lang="html">
    <div v-if="showComponent" class="form-group">
        <template v-if="viewMode||forceView">
            <div class="label-wrapper">
                <text class="form-label view-label">{{definition.componentParams.title}}</text>
                <text class="view-text" :value="valueText"></text>
            </div>
        </template>
        <template v-else>
            <div class="label-wrapper">
                <text class="form-label">{{definition.componentParams.title}}</text>
                <text class="required-mark" v-if="definition.componentParams.required">*</text>
            </div>
            <div class="from-input-wrapper" @click="inputClicked">
                <text class="form-input" :style="inputStyle">{{valueText || '选择选项...'}}</text>
                <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
            </div>
        </template>
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
            return ""//opt && opt.text;
        }
    },
    methods: {
        inputClicked() {
            if(this.readonly){
                return;
            }
            picker.pick({
                items: this.definition.componentParams.options.map(option => option.text)
            }, (res) => {
                if (res.result === 'success') {
                    let id = this.definition.componentParams.options[res.data].id;
                    this.$emit('input', id);
                    if(this.valueText){
                        let text = this.valueText
                        this.emitExData(id,text);
                    }
                }
            })
        },
        emitExData:function(id,text){
            var exData={};
            exData[id]=this.buildExData(text);
            let _dataField = this.definition.dataField;
            this.$emit("exDataChanged",exData,_dataField);
        }
    },
}
</script>

<style src="../../styles/common.css" scoped="false"></style>