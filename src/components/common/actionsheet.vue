<template>
    <div v-if="value">
        <bui-mask @click="_maskClick"></bui-mask>

        <div class="bui-actionsheet-box" :style="{'bottom': '-'+bottom+'px'}" ref="actionsheetBox">
            <div class="bui-actionsheet-top">
                <text class="bui-actionsheet-title" v-if="title">{{title}}</text>
                <div class="bui-actionsheet-content">
                    <slot></slot>
                    <!--<text v-if="item.length" class="bui-actionsheet-list" :key="index" v-for="(item,index) in items" @click="_itemClick(item,index)">{{item}}</text>-->
                </div>
            </div>
            <div class="bui-actionsheet-bottom">
                <text class="bui-actionsheet-btn" @click="_btnClick">{{button}}</text>
            </div>
        </div>
    </div>

</template>

<script>
    const animation = weex.requireModule('animation');
    import buiweex from "bui-weex";
    module.exports = {
        props: {
            title: {
                default: "请选择"
            },
            items: {
                type: Array,
                default:function(){
                    return []
                }
            },
            button: {
                default: "取消"
            },
            value: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            value(val) {
                this.$emit('input', val);
                setTimeout(()=>{
                    if(val){
                        this._open();
                    }
                },50);
            }
        },
        computed: {
            bottom () {
                return (this.items.length + 1) * 100 + 80;
            }
        },
        methods: {
            hide(){
                let translate = 'translate(0px, ' + (this.bottom + 80) + 'px, 0px)';
                this._animationFn(translate);
            },
            _animationFn: function (translate, fn) {
                let el = this.$refs.actionsheetBox;
                animation.transition(el, {
                    styles: {
                        transform: translate,
                        transformOrigin: 'center center'
                    },
                    duration: 200,
                    timingFunction: "ease-in",
                    delay: 0
                }, () => {
                    fn && fn();
            })
            },
            _open() {
                let translate = 'translate(0px, -' + (this.bottom + 20) + 'px, 0px)';
                this._animationFn(translate)
            },
            _maskClick () {
                let translate = 'translate(0px, ' + (this.bottom + 20) + 'px, 0px)';
                this._animationFn(translate, () => {
                    this.$emit('input', false);
                this.$emit("maskClick");
            });
            },
            _itemClick(item,index) {
                let translate = 'translate(0px, ' + (this.bottom + 20) + 'px, 0px)';
                this._animationFn(translate, () => {
                    this.$emit('input', false);
                this.$emit('itemClick', item,index);
            });
            },
            _btnClick() {
                let translate = 'translate(0px, ' + (this.bottom + 20) + 'px, 0px)';
                this._animationFn(translate, () => {
                    this.$emit('input', false);
                this.$emit('cancel');
            });
            }
        }
    }
</script>

<style lang="css">
    .bui-actionsheet-box {
        position: fixed;
        left: 0px;
        right: 0px;
        margin: 50px;
        margin-top: 0px;
        flex-direction: column;
        overflow: hidden; }

    .bui-actionsheet-top {
        border-radius: 10px;
        overflow: hidden;
        background-color: #ffffff; }

    .bui-actionsheet-bottom {
        margin-top: 15px; }

    .bui-actionsheet-title {
        padding: 30px;
        text-align: center;
        font-size: 28px;
        color: #9ea7b4; }

    .bui-actionsheet-content {
        flex-direction: column;
        flex: 1; }

    .bui-actionsheet-list {
        border-top-width: 1px;
        border-top-color: #d7dde4;
        padding: 30px;
        text-align: center;
        font-size: 34px;
        color: #3399ff; }

    .bui-actionsheet-list:active {
        background-color: #f5f5f5; }

    .bui-actionsheet-btn {
        font-size: 34px;
        color: #3399ff;
        font-weight: bold;
        background-color: #ffffff;
        padding: 30px;
        text-align: center;
        border-radius: 10px; }

    .bui-actionsheet-btn:active {
        background-color: #f5f5f5; }
</style>