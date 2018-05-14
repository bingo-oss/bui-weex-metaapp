<template>
    <div class="btn-block" v-if="operation">
        <text class="btn-text">{{operation.title}}</text>
    </div>
</template>
<script>
export default {
    props:{
        operation:{
            type:Object
        }
    }
}
</script>
<style lang="sass" src="../../../styles/operation.scss"></style>

