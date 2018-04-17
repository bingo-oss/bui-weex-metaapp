<template>
    <div class="division-line-wrapper">
        <bui-tip type="warning" :value="definition.componentParams.title"></bui-tip>
        <text :style="desStyle">可是看看{{definition.componentParams.description}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'DivisionLine',
    extends: mixin,
    data() {
        return {
        }
    },
    computed: {
        titleStyle() {
            return {
                'font-size':32,
                'text-align': this.definition.componentParams.titleAlign
            }
        },
        desStyle() {
            return {
                'font-size':32,
                'color':'#c0c0c0',
                'text-align': this.definition.componentParams.descriptionAlign
            }
        },
    },
}
</script>

<style>
    .division-line-wrapper {
        padding-bottom: 10px;
        padding-top: 10px;
    }
    .splitter {
        margin-top: 20px;
        margin-bottom: 20px;
        border-bottom-color: #BEBCBC;
        border-bottom-width: 1px;
        border-bottom-style:dashed;
    }
    .desc{

    }
</style>
