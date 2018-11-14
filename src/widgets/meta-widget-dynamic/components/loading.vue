<template>
    <div class="loading size" v-if="isShow" :style="{position:'fixed',top:'500px',left:((750-140)/2)+'px'}">
        <!--        <div style="position: fixed;left: 0px;right: 0px;top: 0px;bottom: 0px;opacity: 0;"
                     @click="_maskClick"></div>-->
        <bui-icon style="position: absolute;top:-5px;right: -5px" size="48px" name="ion-ios-close-empty" color="#fff"
                  @click="close"></bui-icon>
        <div class="loading_radius size2">
            <div class="loading_bian radius size2"></div>
            <div ref="load" class="loading_turn radius size2"></div>
        </div>
        <text class="loading_text">{{title}}</text>
    </div>
</template>

<style>
    .size {
        width: 140px;
        height: 140px;
    }

    .size2 {
        width: 65px;
        height: 65px;
    }

    .radius {
        border-radius: 100px;
    }

    .loading {
        position: absolute;
        justify-content: center;
        align-items: center;
        background-color: #000;
        border-radius: 10px;
    }

    .loading_radius {
        position: relative;
    }

    .loading_bian {
        position: absolute;;
        border-top-width: 3px;
        border-top-color: #fff;
        border-top-style: solid;

        border-left-width: 3px;
        border-left-color: #fff;
        border-left-style: solid;

        border-right-width: 3px;
        border-right-color: #fff;
        border-right-style: solid;

        border-bottom-width: 3px;
        border-bottom-color: #fff;
        border-bottom-style: solid;
    }

    .loading_turn {
        position: absolute;
        width: 120px;
        height: 120px;
        border-left-width: 3px;
        border-left-color: #666;
        border-left-style: solid;
    }

    .loading_text {
        color: #fff;
        font-size: 24px;
        margin-top: 18px;
    }
</style>

<script>
    var animation = weex.requireModule('animation');
    module.exports = {
        data () {
            return {
                i: 0
            }
        },
        props: {
            show: {
                type: Boolean,
                default: true
            },
            title: {
                type: "string",
                default: ""
            }
        },
        computed: {
            isShow(){
                return this.show
            }
        },
        components: {},
        methods: {
            //动画操作
            animationFn: function (el) {
                let t = this;
                animation.transition(el, {
                    styles: {
                        transform: 'rotate(' + 360 * t.i + 'deg)'
                    },
                    duration: 1100, //ms
                    timingFunction: 'linear',
                    delay: 0 //ms
                }, function () {
                    t.i++;
                    t.animationFn(t.$refs.load)
                })
            },
            _maskClick(){
                this.show = false
            },
            close(){
                this.show = false
            },
            setShow(){
                this.show = true
                this.animationFn(this.$refs.load)
            }
        },
        mounted(){
        },
        watch: {
            show(val){
                this.i = 1;
            }
        }
    }
</script>