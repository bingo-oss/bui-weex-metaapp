<template>

  <div
    class="btn-block"
    v-if="operation"
    :style="{'background-color':bgColor}"
  >
    <text class="btn-text">{{operation.title}}</text>

  </div>

</template>
<script>
import btnStyle from "../js/btn_style";
export default {
  props: {
    operation: {
      type: Object
    }
  },
  computed: {
    bgColor() {
      if (this.themeBg) {
        return this.themeBg;
      } else {
        var btnType = this.operation.btnType;
        if (btnType && btnStyle[btnType]) {
          return btnStyle[btnType] && btnStyle[btnType].bgcolor;
        }
        return "#4CA4FE";
      }
    }
  }
};
</script>
<style lang="sass" src="../../../styles/operation.scss"></style>

