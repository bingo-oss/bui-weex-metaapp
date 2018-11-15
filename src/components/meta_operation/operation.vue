<template>
    <div class="widget-operation" v-if="show||!hide">
        <component @triggered="triggered" @successed="successed" :btn-type="btnType" :is="operationComponent" :operation="extendedOperation" :widget-context="extendedWidgetContext">
            <slot></slot>
        </component>
    </div>
</template>
<script>
import propParser from '../../js/tool/prop_parser';
import _ from '../../js/tool/lodash';
import Utils from '../../js/tool/utils';
import OperationUtils from './js/operation_utils';
import factoryApi from '../../widgets/libs/factory-api.js';
//操作类型定义
var operationType={common:'common', toPage:'toPage', widget:'widget', popup:'popup',script:'script',openApp:'openApp',toOperation:"to_operation"};
/*
var permParser={
    //来自表单的取消、开启编辑、编辑、删除权限
    "formCancel":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.cancel;
    },
    "formOpenEdit":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.openEdit;
    },
    "formEdit":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.edit;
    },
    "formDel":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.del;
    },
    //来自当前数据的查看、编辑、删除权限
    "selectedItemView":function(widgetContext){
        return widgetContext.selectedItem&&Utils.hasPerm(widgetContext.selectedItem[Utils.dataPermField],Utils.permValues.view);
    },
    "selectedItemEdit":function(widgetContext){
        return widgetContext.selectedItem&&Utils.hasPerm(widgetContext.selectedItem[Utils.dataPermField],Utils.permValues.edit);
    },
    "selectedItemDel":function(widgetContext){
        return widgetContext.selectedItem&&Utils.hasPerm(widgetContext.selectedItem[Utils.dataPermField],Utils.permValues.del);
    }
};
*/
//将不同的部件操作类型转成实际的操作
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        },
        btnType:{//操作按钮的类型
            type:String
        }
    },
    watch:{
        "operation"(operation){
            OperationUtils.showOperation(this);
        }
    },
    computed:{
        operationComponent:function(){
            if(!this.operation.operationType){
                return;
            }
            return `${this.operation.operationType}Operation`;
        },
        extendedOperation:function(){
            var _this=this;
            var operation=OperationUtils.expandOperation(this.operation,this);
            return operation;
        },
        extendedWidgetContext:function(){
            var _this=this;
            var params={};
            _.each(this.operation.props,function(propValue,propKey){
                if(propValue.internal){//来自于context的属性，合并到widgetContext中
                    var parsedValue=propParser.parse(propValue,_this);
                    params[propKey]=parsedValue;
                }
            });
            //移动端配置的属性将覆盖上面的属性
            _.each(this.operation.mobileProps,function(propValue,propKey){
                if(propValue.internal){//来自于context的属性，合并到widgetContext中
                    var parsedValue=propParser.parse(propValue,_this);
                    params[propKey]=parsedValue;
                }
            });
            return _.extend(this.widgetContext,params);
        },
        showOperation:function(){//根据自定义操作权限表达式计算操作是否需要隐藏
            //只显示当前端的操作，目前只区分移动端和pcweb端
            //terminalType 1：pcweb 2：android 4：ios
            var operation=OperationUtils.expandOperation(this.operation,this);
            var terminalType=operation[Utils.operationTermimalTypeField];
            if(terminalType===1){
                return false;
            }
            var optPermValue=operation[Utils.operationDisplayField];
            if(!_.isPlainObject(optPermValue)){
                optPermValue=_.trim(optPermValue);
                if(_.isNil(optPermValue)||optPermValue===''){
                    return true;
                }
            }
            var ctx={
                ctx: this.widgetContext,
                opt:operation
            }
            if(_.startsWith(optPermValue,'${')){
                var compiled = _.template(optPermValue);
                var hasPerm=compiled(ctx);
                if(hasPerm==="true"){
                    return true;
                }
            }else if(_.isPlainObject(optPermValue)){
                var from=optPermValue.from;
                if(from){
                    var permParse=permParser[from];
                    if(permParse){
                        return !!permParse(this.widgetContext);
                    }
                }
            }
            return false;
        }
    },
    data(){
        return {
            show:true,//用于控制是否显示按钮
            hide:false//用于控制是否显示按钮
        };
    },
    methods:{
        triggered(optType){
            this.$emit("triggered",optType);
        },
        successed(optType){
            this.$emit("successed",optType);
        }
    },
    components:{
        commonOperation:require('./common_operation.vue'),
        widgetOperation:require('./widget_operation.vue'),
        toPageOperation:require('./to_page_operation.vue'),//跳转页面
        popupOperation:require('./popup_operation.vue'),//弹窗
        scriptOperation:require('./script_operation.vue'),//执行脚本
        execOperationOperation:require('./script_operation.vue'),
        toOperationOperation:require('./to_operation_operation.vue'),//跳入操作
        //columnOperation:require('./column_operation.vue'),//二级菜单
        toDynamicPageOperation:require('./to_dynamic_page_operation.vue')//动态跳入页面
    }
}
</script>
<style src="../../styles/common.css"></style>

