<template>
  <div class="widget-con">
    <scroller class="scroller">
      <input
        id="input_1"
        type="number"
        placeholder="请输入加数"
        return-key-type="next"
        @input="onTextChanged1"
        v-model="value1"
      />

      <p>+</p>

      <input
        type="number"
        v-model="value2"
        placeholder="请输入被加数"
        return-key-type="next"
        @input="onTextChanged2"
      />
      <p>--------------------------------</p>

      <text>{{res}}</text>

      <bui-button
        value="Normal"
        @click="onClick"
      ></bui-button>

      <!-- <div v-if="widgetParams">
      <text>{{showContent()}}</text>
    </div> -->

      <!-- <div v-if="widgetParams">
        <text>{{widgetParams}}</text>
      </div> -->

      <div
        v-if="widgetParams"
        v-for="(commonOpt,index) in widgetParams"
        :key="index"
      >
        <div
          v-for="(button,index) in commonOpt"
          :key="index"
        >
          <meta-operation
            v-if="button.btnType"
            :operation="button"
            :widget-context="getWidgetContext()"
          ></meta-operation>

        </div>
      </div>

      <!-- <text>{{result}}</text> -->
      {{widgetParams}}

    </scroller>
  </div>
</template>
<script>
export default {
  props: {
    widgetParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      value1: "",
      value2: "",
      result: 0
    };
  },
  methods: {
    getWidgetContext(index) {
      //var metaEntity=this.$metaBase.findMetaEntity("Activity");
      var metaEntity = { name: "Activity" };
      return {
        selectedId: index % 2 ? "K1rwgeV7D" : "2ywLEmlpZ",
        selectedItem: "",
        selectedItems: "",
        metaEntity: metaEntity,
        grid: ""
      };
    },
    showContent: function() {
      if (
        this.widgetParams != null &&
        this.widgetParams.content != null &&
        this.widgetParams.content.contentText != null
      ) {
        return this.widgetParams.content.contentText;
      } else {
        return "你都没有传值！！！";
      }
    },
    onTextChanged1: function(event) {
      this.value1 = event.value;
    },
    onTextChanged2: function(event) {
      this.value2 = event.value;
    },
    onClick: function() {
      this.value1++;
    },
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
    exportParams() {
      //本部件暴露的参数
      return Object.assign(
        { result: this.result },
        this.widgetParams,
        this.result
      );
    }
  },
  computed: {
    res: function() {
      this.value1 = this.value1 * 1;
      this.value2 = this.value2 * 1;
      this.result = this.value1 * 1 + this.value2 * 1;
      return this.result;
    }
  }
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
.scroller {
  width: auto;
  height: 1100px;
  border-width: 3px;
  border-style: solid;
  border-color: rgb(162, 217, 192);
  margin-left: 25px;
}
</style>


