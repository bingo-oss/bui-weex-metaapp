<template>
  <div
    @click="execScript"
    class="full-column"
  >
    <slot>
      <meta-opt-btn
        @on_btn_click="execScript"
        :uiType="uiType"
        :btn-type="btnType"
        :operation="operation"
      ></meta-opt-btn>
    </slot>


    <!--脚本内调用跳转页面,类型为弹窗-->
    <div class="bui-dialog" :style="{top:top,width:modalInfo.width,left:(750-modalInfo.width)/2,opacity:(modalInfo.show?1:0)}">
      <div class="bui-dialog-title">
        <text class="dialog-title-text">{{modalInfo.title}} </text>
        <bui-icon class="dialog-close" @click="_maskClick" name="ion-ios-close" size=50></bui-icon>
      </div>
      <div class="bui-dialog-content" :style="{height:modalInfo.height}" v-if="modalInfo.show">
          <scroller :style="{height:modalInfo.height}">
            <div :style="{height:modalInfo.height}">
              <meta-widget-page :widget-params="modalInfo.pageParams"></meta-widget-page>
            </div>
          </scroller>
      </div>
    </div>

  </div>
</template>
<script>
import _ from "../../js/tool/lodash";
import ax from "../../js/ajax.js";
import config from "../../js/config.js";
import buiweex from "bui-weex";
import OperationUtils from "./js/operation_utils";
import factoryApp from "../../widgets/libs/factory-app.js";
export default {
  props: {
    widgetContext: {
      //由使用操作的部件传入的部件上下文
      type: Object,
      required: true
    },
    operation: {
      //操作的定义，必传参数
      type: Object,
      required: true
    },
    btnType: {
      //操作按钮的类型
      type: String
    },
    uiType: {}
  },
  data() {
    let _this = this;
    return {
      mustStopRepeatedClick: false, //阻止点击操作重复触发
      implCode: "", //存入执行代码
      //弹窗信息
      modalInfo:{
        width:500,
        height:340,
        title:_this.operation.title||"",
        show:false,
        pageParams:{}
      }
    };
  },
  created(){
    factoryApp.init(this);//初始化变量
  },
  methods: {
    execScript() {
      this.$emit("on_btn_click");
      let _t = this;
      if (this.mustStopRepeatedClick) {
        return;
      }
      if (this.operation.onClick) {
        var _widgetCtx = Object.assign(this.widgetContext, {
          buttonInfo: this.operation
        });
        this.mustStopRepeatedClick = true;
        _t.cellExecScript();
      } else {
        if (this.operation.onClick) {
          _t.cellExecScript();
        } else {
          //获取执行代码
          config.readRuntimeConfig().then(runtimeConfig => {
            ax.get(
              runtimeConfig["service.metabase.endpoint"] +
                `/meta_operation/${_t.operation.operationId}`
            ).then(({ data }) => {
              this.operation.onClick = data.implCode;
              _t.cellExecScript();
            });
          });
        }
      }
    },
    cellExecScript() {
      var _widgetCtx = Object.assign(this.widgetContext, {
        buttonInfo: this.operation
      });
      OperationUtils.execution(
        this.operation,
        _widgetCtx,
        "beforeExecCode",this
      ).then(res => {
        OperationUtils.setUrlParam(this.operation, this); //按钮输入参数处理
        var fun = this.operation.onClick;
        try{
          if (_.isFunction(fun)) {
            this.mustStopRepeatedClick = true;
            fun(_widgetCtx, factoryApp);
          } else if(fun){
            this.mustStopRepeatedClick = true;
            var onclick = Function('"use strict";return ' + fun)();
            onclick(_widgetCtx, factoryApp);
          }
        }catch (e){
          this.$toast("脚本语法有误");
        }
        this.mustStopRepeatedClick = false;
        this.$emit("triggered", "script");
        OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode",this); //执行后
      });
    },
    _maskClick(){
      //关闭弹出窗
      this.modalInfo.show = false;
      this.modalInfo.pageParams = {pageId:""};
    }
  }
};
</script>
<style src="../../styles/common.css"></style>
<style>
  .bui-dialog {
    position: fixed;
    background-color: #ffffff;
    border-radius: 10px;
    top: 300px;
    left: 50px;
    right: 50px; }
  .dialog-close{ position: absolute; right: 18px; top: 15px;}
  .bui-dialog-title {
    justify-content: center;
    height: 80px;
    padding-left: 30px;
    padding-right: 30px; }

  .dialog-title-text {
    color: #000000;
    font-size: 35px; }

  .bui-dialog-content {
    height: 220px;
    padding-left: 30px;
    padding-right: 30px;
    padding-bottom: 32px; }
</style>