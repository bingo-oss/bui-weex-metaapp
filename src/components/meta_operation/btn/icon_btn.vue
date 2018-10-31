<template>
    <icon v-if="operation.icon" color="white" :name="ion"></icon>
</template>
<script>
export default {
    props:{
        operation:{
            type:Object
        }
    },
    data(){
      return {
          ion:"ion-plus"
      }
    },
    watch:{
        "operation"(val){
            if(val.icon){
                this.ion = val.icon;
            }
        }
    }
}
</script>

