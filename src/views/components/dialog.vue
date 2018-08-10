<template>
    <div :value="value" v-if="visible">
        <bui-mask @click="_maskClick"></bui-mask>
        <div class="bui-dialog" :style="{'top':top,'margin-left':'50px','margin-right':'50px'}">
            <div style="font-size: 38px;align-items: center;justify-content: center;margin-top: 30px">
                <text style="font-size: 34px">{{title}}</text>
            </div>
            <div style="padding-top: 20px;padding-left: 20px;padding-right: 20px;padding-bottom: 20px">
                <text style="color: #353535;font-size: 30px;text-align: center" :value="dialogContent"></text>
            </div>
            <div class="bui-dialog-footer">
                <text class="dialog-action-text" v-for="btn in buttonArray" @click="_click(btn)">{{btn.title}}</text>
            </div>
        </div>
    </div>
</template>

<style lang="sass" src="bui-weex/src/css/dialog.scss"></style>
<script>
    module.exports = {
        props: {
            height: {
                type: String,
                default: "200px"
            },
            top: {
                type: String,
                default: "420px"
            },
            title: {
                type: String,
                default: "标题"
            },
            buttons: {
                type: String,
                default: "取消,确定"
            },
            buttonArray: {
                type: Object
            },
            value: {
                type: Boolean,
                default: false
            },
            dialogContent: {
                type: String
            }
        },
        data(){
            return {
                visible: false
            }
        },
        watch: {
            value(val) {
                this.visible = val;
            },
            visible(val) {
                this.$emit('input', val);
            }
        },
        mounted(){
            if (this.value) {
                this.visible = true;
            }
        },
        computed: {
            getButtons() {
                return this.buttons.split(',');
            }
        },
        methods: {
            _click(text) {
                this.$emit("btnClick", text);
            },
            _maskClick() {
            //    this.visible = false;
                this.$emit("maskClick");
            }
        }
    }
</script>