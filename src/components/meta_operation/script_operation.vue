<template>
<div @click="execScript">
    <slot>
        <div class="btn-block">
            <text class="btn-text">{{operation.title}}</text>
        </div>
    </slot>
</div>
</template>
<script>
import _ from '../../js/tool/lodash'
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        }
    },
    data(){
        return {

        };
    },
    methods:{
        execScript(){
            if(_.isFunction(this.operation.onclick)){
                this.operation.onclick(this.widgetContext);
            }else{
                var onclick=Function('"use strict";return ' + this.operation.onclick  )();
                onclick(this.widgetContext);
            }
        }
    }
}
</script>
<style lang="sass" src="../../styles/operation.scss"></style>
