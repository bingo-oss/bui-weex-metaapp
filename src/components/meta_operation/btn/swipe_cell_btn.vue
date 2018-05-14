<template>
    <div v-if="operation" class="bui-list-swipe-btn full-column" :style="{'background-color':bgColor}">
        <text class="bui-list-swipe-btn-text">{{operation.title}}</text>
    </div>
</template>
<script>
var btnStyle={
    default:{
        bgcolor : '#c6c7c8'
    },
    danger:{
        bgcolor : '#fa3300'
    },
    error:{
        bgcolor : '#fa3300'
    },
    primary: {
        bgcolor: '#3399ff'
    },
    success: {
        bgcolor: '#00cc66'
    },
    warning: {
        bgcolor: '#ff9900'
    }
};
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
<style>
.full-column{
    flex:1;
    flex-direction: column;
}
</style>


