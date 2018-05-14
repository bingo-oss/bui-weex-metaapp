<template>
    <div v-if="operation" class="bui-list-swipe-btn full-column" :style="{'background-color':bgColor}">
        <text class="bui-list-swipe-btn-text">{{operation.title}}</text>
    </div>
</template>
<script>
import btnStyle from '../js/btn_style';
export default {
    props:{
        operation:{
            type:Object
        }
    },
    computed:{
        bgColor(){
            var btnType=this.operation.btnType;
            if(btnType&&btnStyle[btnType]){
                 return btnStyle[btnType]&&btnStyle[btnType].bgcolor
            }
            return btnStyle.default.bgcolor;
        }
    }
}
</script>
<style lang="sass" src="bui-weex/src/css/list.scss"></style>
<style src="../../../styles/common.css"></style>


