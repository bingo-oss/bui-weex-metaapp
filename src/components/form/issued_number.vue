<template>
    <div v-if="showComponent" class="form-group">
        <div class="label-wrapper-vertical">
            <text class="form-label">{{definition.componentParams.title}}</text>
            <text class="required-mark" v-if="definition.componentParams.required">*</text>
        </div>
        <div class="from-input-wrapper" @click="inputClicked" v-if="definition.componentParams.standard=='standard2'">
            <text class="form-input" :style="inputStyle">{{valueText || '选择选项...'}}</text>
            <bui-icon slot="action" name="ion-ios-arrow-right"></bui-icon>
        </div>
        <input @input="input" :disabled="readonly" class="form-input-native" type="text" v-model="issuedObjcet.code" :placeholder="definition.componentParams.placeholder" v-if="definition.componentParams.standard!='standard2'" />
        <input @input="input" :disabled="readonly" class="form-input-native" type="text" v-model="issuedObjcet.year" :placeholder="definition.componentParams.placeholder"/>
        <input @input="input" :disabled="readonly" class="form-input-native" type="text" v-model="issuedObjcet.number" :placeholder="definition.componentParams.placeholder"/>
    </div>
</template>
<script>
    import mixin from './component-mixin.js';
    import buiweex from "bui-weex";
    import _ from '../../js/tool/lodash.js';
    const picker = weex.requireModule('picker');
    export default {
        componentType: 'IssuedNumber',
        extends: mixin,
        props: {
            "value":[Object,String]
        },
        data () {
            return {
                issuedObjcet:{
                    fullText:"",
                    code:"",
                    year:"",
                    number:""
                },
                inputStyle:{}
            }
        },
        watch:{
            "value":function(newV,oldV){
                //var _issuedObjcet=this.issuedObjcet
                if(newV){
                    this.issuedObjcet = newV;
                }
            }
        },
        methods: {
            enter () {
                alert(this.msg);
            },
            inputClicked() {
                if(this.readonly){
                    return;
                }
                picker.pick({
                    items: this.definition.componentParams.options.map(option => option.text)
                }, (res) => {
                    if (res.result === 'success') {
                        let id = this.definition.componentParams.options[res.data].id;
                        this.issuedObjcet.code = id;
                        this.input();
                    }
                })
            },
            input(){
                let _issuedObjcet = this.issuedObjcet,_vals=[],valueText = this.valueText;
                _issuedObjcet.fullText = "";
                _.each(_issuedObjcet,(val,key)=>{
                    if(val){
                        if(key=="code"&&valueText){
                          val = valueText;
                        }
                        _vals.push(val);
                    }
                });
                _issuedObjcet.fullText = _vals.join("");
                if(_vals.length){
                    this.$emit('input',this.issuedObjcet);
                }else{
                    this.$emit('input',"");
                }
            }
        },
        computed: {
            upper () {
                return this.msg.toUpperCase();
            },
            valueText() {
                let opt = this.definition.componentParams.options.find(o => o.id === this.issuedObjcet.code);
                return opt && opt.text;
            }
        },
        mounted:function(){
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../../styles/common.css" scoped="false"></style>
<style scoped="">
</style>