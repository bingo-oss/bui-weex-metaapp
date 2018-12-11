<template>
  <div class="full-column">
    <div
      @click="gotoPage"
      class="full-column"
    >
      <slot>
        <meta-opt-btn
          @on_btn_click="gotoPage"
          :uiType="uiType"
          :btn-type="btnType"
          :operation="operation"
        ></meta-opt-btn>
      </slot>
    </div>
  </div>
</template>
<script>
import _ from "../../js/tool/lodash.js";
import Utils from "../../js/tool/utils";
import OperationUtils from "./js/operation_utils";
import linkapi from "linkapi";
import factoryApi from "../../widgets/libs/factory-api.js";
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
    if (!this.operation.operationId) {
      //this.$toast("page参数缺失");
    }
    return {};
  },
  methods: {
    gotoPage() {
      this.$emit("on_btn_click");
      var _widgetCtx = Object.assign(this.widgetContext, {
        buttonInfo: this.operation
      });
      OperationUtils.execution(
        this.operation,
        _widgetCtx,
        "beforeExecCode"
      ).then(res => {
        var pageParams = {};
        if (this.operation.dynamicPageFunc) {
          //进行数据解析
          if (_.isFunction(this.operation.dynamicPageFunc)) {
            this.mustStopRepeatedClick = true;
            pageParams = this.operation.dynamicPageFunc(_widgetCtx, factoryApi);
          } else {
            var dynamicPageFunc = Function(
              '"use strict";return ' + this.operation.dynamicPageFunc
            )();
            pageParams = dynamicPageFunc(
              Object.assign(_widgetCtx.operation),
              this,
              factoryApi
            );
          }
          OperationUtils.setUrlParam(this.operation, this); //按钮输入参数处理
        }
        OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode"); //执行后

        if (pageParams.type == "factoryApp") {
          //跳入的是应用工厂应用
          this.$push(
            Utils.pageEntry(),
            Object.assign({ pageId: pageParams.pageId }, pageParams.params)
          );
        } else if (pageParams.type == "openUrl") {
          //跳入的是第三方url
          let _urlParams = [];
          _.each(pageParams.params, (val, key) => {
            _urlParams.push(`${key}=${val}`);
          });
          if (pageParams.url.indexOf("?") == -1) {
            pageParams.url += "?";
          }
          linkapi.openLinkBroswer(pageParams.url + _urlParams.join("&"));
        }
        this.$emit("triggered", "toDynamicPage");
      });
    }
  }
};
</script>
<style src="../../styles/common.css"></style>