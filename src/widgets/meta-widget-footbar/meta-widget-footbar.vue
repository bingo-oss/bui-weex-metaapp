<template>
    <div>
        <div class="fixedStyleDiv" v-if="widgetParams.isFixed"></div>
        <div class="fixedStyle" :style="fixedStyle">
            <div class="action-bar" v-if="widgetParams.commonOperations&&widgetParams.commonOperations.length">
                <meta-operation v-for="(commonOpt,index) in widgetParams.commonOperations" :operation="commonOpt" v-if="index<3" :widget-context="getWidgetContext()" :key="index" class="full-column"></meta-operation>

                <div class="full-column more" v-if="widgetParams.commonOperations.length>4">
                    <bui-icon name="ion-ios-more" color="#999" @click="showUp=!showUp"></bui-icon>
                </div>
            </div>
        </div>

        <bui-popupshow v-model="showUp" ref="upshow" bottom="50" left="560">
            <meta-operation v-for="(commonOpt,index) in widgetParams.commonOperations" v-if="index>2" :operation="commonOpt" btn-type="dropdown" :widget-context="getWidgetContext()" :key="index" class="full-column"></meta-operation>
            <!--<div class="center"
                 style="padding-bottom: 20px;padding-top: 20px;padding-left: 20px;padding-right: 20px;border-bottom-style: solid;border-bottom-color: #e7e7e7;border-bottom-width: 1px;width: 200px"
                 v-for="(item,i) in createMenuList" @click="onCreateMenuItemClick(item)">
                <text style="font-size: 30px;color: #515151" :value="item.title"></text>
            </div>-->
        </bui-popupshow>
    </div>
</template>
<script>
    import _ from '../../js/tool/lodash';
    import factoryApp from '../libs/factory-app.js';
    import popupmenu from './components/bui-popupmenu.vue'

    export default {
        props: {
            widgetParams: {
                type: Object,
                required: true
            },
            vueModal:{//弹窗模式传入的是存在弹窗的自身--方便控制弹窗的一些显隐
                type:Object,
                default(){
                    return {};
                }
            }
        },
        data(){
            return {
                fixedStyle:{
                    "position":""
                },
                showUp:false
            };
        },
        computed:{
        },
        watch:{
            widgetParams(val){}
        },
        methods:{
            getWidgetContext(){
                return {
                    widgetParams:this.widgetParams//部件参数
                };
            }
        },
        created(){
            if(this.widgetParams.isFixed){
                this.fixedStyle.position="fixed";//进行悬浮
            }
        },
        mounted(){
        },
        components: {'bui-popupshow': popupmenu}
    }
</script>
<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../../styles/common.css"></style>
<style lang="css">
    .fixedStyleDiv{ height: 160px;}
    .fixedStyle{ bottom: 0; /*position: fixed;*/ width: 750px;}
    .action-bar {
        background-color: #fff;
        border-top-color: #e6e4e4;
        border-top-width: 1px;
        border-top-style: solid;
        padding-top:15px;
        padding-bottom: 15px;
        padding-left: 10px;
        padding-right: 10px;
        flex-direction: row;
    }
    .process_foot{ padding-top: 15px; padding-left: 15px; padding-right: 15px;}
    .popup{
        padding-bottom: 20px;
        padding-top: 20px;
        padding-left: 20px;
        padding-right: 20px;
        border-bottom-style: solid;
        border-bottom-color: #e7e7e7;
        border-bottom-width: 1px;
        width: 200px;
    }
    .more{
        padding-top: 18px;
/*
        justify-content: center;
*/
        align-items: center;
    }
</style>
