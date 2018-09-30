<template>
    <div v-if="value">
        <div class="bg" @click="maskClick"></div>
        <div ref="popupBox" class="popupBox" :hack="hackShow"
             :style="{bottom:bottom,left:left,'background-color': bgColor }">
            <div class="popupContent">
                <slot></slot>
            </div>
            <!--
                        <bui-icon name="ion-arrow-down-b" class="arrow" :color="bgColor" size="60px"></bui-icon>
            -->
        </div>
    </div>
</template>

<style scoped>
    .bg {
        position: fixed;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        background-color: rgba(0, 0, 0, 0.2);
    }

    .popupBox {
        position: fixed;
        border-radius: 10px;
    }

    .popupContent {
        padding: 10px;
        align-items: center;
    }

    .arrow {
        position: fixed;
        left: 80px;
        bottom: -40px;
    }
</style>

<script>
    const animation = weex.requireModule('animation');
    export default {
        props: {
            value: {
                type: Boolean,
                default: false
            },
            bgColor: {
                type: String,
                default: '#ffffff'
            },
            bottom: {
                type: [Number, String],
                default: 50
            },
            left: {
                type: [Number, String],
                default: 0
            }
        },
        data: {
            position: {
                top: 0,
                left: 0,
            }
        },
        watch: {
            value(val){
                this.$emit("input", val);
            }
        },
        computed: {
            hackShow () {
                setTimeout(()=> {
                    this.appear();
                }, 50);
                return this.value;
            },
        },
        methods: {
            show(){

            },
            maskClick () {
                this.dismiss();
            },
            appear(){
                var popupEl = this.$refs.popupBox;
                animation.transition(popupEl, {
                    styles: {
                        transform: `translate(0px,-${50}px)`
                    },
                    duration: 300,
                    timingFunction: 'ease-in',
                    delay: 0,
                }, () => {

                });
            },
            dismiss(){
                var popupEl = this.$refs.popupBox;
                animation.transition(popupEl, {
                    styles: {
                        opacity: 0,
                        transform: `translate(0px,0px)`
                    },
                    duration: 200,
                    timingFunction: 'ease-out',
                    delay: 0,
                }, () => {
                    this.$emit("input", false);
                });
            }
        }
    }
</script>