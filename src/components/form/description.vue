<template>
    <div class="">
        <template v-if="viewMode||forceView">
            <div class="form-group">
                <div class="label-wrapper">
                    <text class="form-label view-label">{{definition.componentParams.title}}</text>
                    <text class="view-text" :value="definition.componentParams.content"></text>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-group form-hrb">
                <text :style="contentStyle">{{definition.componentParams.content}}</text>
            </div>
        </template>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'Description',
    extends: mixin,
    data() {
        return {
        }
    },
    computed: {
        contentStyle() {
            return {
                'text-align': this.definition.componentParams.align
            }
        }
    },
}
</script>
<style src="../../styles/common.css" scoped="false"></style>