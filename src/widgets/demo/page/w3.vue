<template>
  <div class="widget-con">
    <!-- <div>{{getDefinition()}}</div> -->
    <div
      v-if="widgetParams&&widgetParams.commonOperations"
      v-for="(commonOpt,index) in widgetParams.commonOperations"
      :key="index"
      class="common-operation"
    >

      <single-line-text
        :showComponent="true"
        :viewMode="true"
        :definition="commonOpt.props.definition"
      >

      </single-line-text>

      <!-- <div v-if="commonOpt.showComponent">
        <div v-if="commonOpt.props">
          <div v-if="commonOpt.props.definition">
            {{commonOpt.props.definition}}
          </div>
          <div v-else>
            commonOpt.props.definition is empty
          </div>
        </div>
        <div v-else>
          commonOpt.props is empty
        </div>
      </div> -->

      <meta-operation
        :operation="commonOpt"
        :widget-context="getWidgetContext()"
      ></meta-operation>

      <meta-operation
        :operation="commonOpt"
        :widget-context="getWidgetContext()"
      ></meta-operation>
    </div>
    <div style="text-align:center;">
      <!-- ==============================================
      <ol
        v-for='(commonOpt,index) in widgetParams.commonOperations'
        v-bind:key='index'
      >
        <li>{{commonOpt}} </li>
        <li>========== {{index}} =========</li>
      </ol> -->
    </div>
  </div>
</template>
<script>
import SingleLineText from "../../../components/form/single-line-text.vue";
export default {
  components: {
    "single-line-text": SingleLineText
  },
  props: {
    widgetParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    getWidgetContext() {
      //var metaEntity=this.$metaBase.findMetaEntity("Activity");
      var metaEntity = { name: "Activity" };
      return {
        selectedItem: "",
        selectedItems: "",
        metaEntity: metaEntity,
        grid: ""
      };
    },
    getDefinition() {
      for (var i = 0; i < this.widgetParams.commonOperations.length; i++) {
        var commonOpt = this.widgetParams.commonOperations[i];
        if (commonOpt.showComponent) {
          break;
        }
      }
      return "111";
    }
  }
  // components: {
  //   commonOperation: require("./common_operation.vue"),
  // }
};
</script>
<style lang="css" scoped>
.common-operation {
  display: inline-block;
  vertical-align: middle;
  padding: 5px;
}
.widget-con {
  border: 1px solid #ccc;
  margin: 5px 5px 5px 5px;
  padding: 10px;
}
</style>