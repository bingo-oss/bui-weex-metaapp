<template>
  <div
    @click="openApp"
    class="full-column"
  >
    <slot>
      <meta-opt-btn
        @on_btn_click="openApp"
        :uiType="uiType"
        :btn-type="btnType"
        :operation="operation"
      ></meta-opt-btn>
    </slot>
  </div>
</template>
<script>
const linkapi = require("linkapi");
var pathToRegexp = require("path-to-regexp");
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
    return {};
  },
  methods: {
    openApp() {
      this.$emit("on_btn_click");
      var app = this.operation.app;
      var appCode = app.appCode;
      var appUrl = app.appUrl;
      var appData = app.appData;
      var appParams = this.operation.appParams;
      if (appUrl) {
        appUrl = pathToRegexp.compile(appUrl)(appParams);
      }
      if (appData) {
        appData = pathToRegexp.compile(appData)(appParams);
      }
      let params = {
        appCode: appCode,
        appUrl: appUrl,
        data: appData
      };
      linkapi.runApp(params);
      this.$emit("triggered", "openApp");
    }
  }
};
</script>
<style src="../../styles/common.css"></style>