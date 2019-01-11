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
    return {
      mustStopRepeatedClick: false, //阻止点击操作重复触发
      implCode: "" //存入执行代码
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
        var fun = this.operation.onClick;
        try{
          if (_.isFunction(fun)) {
            this.mustStopRepeatedClick = true;
            fun(_widgetCtx, factoryApp);
          } else {
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
    }
  }
};
</script>
<style src="../../styles/common.css"></style>