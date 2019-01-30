<template lang="html">
    <div v-if="showComponent" class="">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" :value="valueText"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group form-hrb" :style="{'background-color':(validatorErrorBag?'#FAA':'')}">
                <div class="label-wrapper">
                    <text class="form-label">{{definition.componentParams.title}}</text>
                    <text class="required-mark" v-if="definition.componentParams.required">*</text>
                </div>
                <div class="from-input-wrapper" @click="inputClicked">
                    <text class="form-input" :style="inputStyle">{{valueText || '请选择'}}</text>
                    <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
const linkapi = require("linkapi");
import mixin from './component-mixin.js'

export default {
    componentType: 'SingleOrgSelect',
    extends: mixin,
    data() {
        return {
            valueText: '',
        }
    },
    computed: {
        inputStyle() {
            return {
                color: this.valueText ? 'black' : '#BEBCBC'
            }
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(v) {
                if (!this.filterMode) {
                    linkapi.getDeptInfoById(v, (result) => {
                        this.valueText = result.name;
                        this.emitExData(v,this.valueText);
                    }, err => {
                        console.log(err)
                    })
                }
            }
        },
        filterValue: {
            immediate: true,
            handler(val) {
                if (this.filterMode) {
                    let ret = /eq\s(\S*)$/.exec(val);
                    if (ret) {
                        linkapi.getDeptInfoById(ret[1], (result) => {
                            this.valueText = result.name;
                        }, err => {
                            console.log(err)
                        })
                    }
                }
            }
        }
    },
    methods: {
        inputClicked(e) {
            if(this.readonly){
                return;
            }
            linkapi.startContactSingleSelector(this.definition.componentParams.title, 4, {}, (result) => {
                if (!result.id) return;
                if (this.filterMode) {
                    let v = `${this.definition.dataField} eq ${result.id}`;
                    this.$emit('filterInput', v);
                } else {
                    this.$emit('input', result.id);
                    /*if(this.valueText){
                        let text = this.valueText
                        this.emitExData(result.id,text);
                    }*/
                }
            }, (err) => {
                this.$alert(err);
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