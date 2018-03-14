<template>
    <refresh class="refresh-wrapper" @refresh="onrefresh" @pullingdown="onpullingdown" :display="display">
        <loading-indicator class="indicator"></loading-indicator>
        <text class="refresh-title">{{title}}</text>
    </refresh>
</template>

<script>

const step1Tips = '下拉以刷新';
const step2Tips = '松开以刷新';
const step3Tips = '刷新中...';

export default {
    props: {
         isRefreshing: false,
    },
    data() {
        return {
            title: step1Tips,
            display: 'hide',
        }
    },
    watch: {
        isRefreshing(isRefreshing) {
            if (isRefreshing) {
                this.display = 'show';
                this.title = step3Tips;
            } else {
                this.display = 'hide';
                this.title = step1Tips;
            }
        }
    },
    methods: {
        onrefresh() {
            this.$emit('refresh')
        },
        onpullingdown (event) {
            if (this.isRefreshing) return;
            if (Math.abs(event.pullingDistance) > event.viewHeight) {
                this.title = step2Tips;
            } else {
                this.title = step1Tips;
            }
        }
    }
}
</script>

<style lang="css">
.refresh-wrapper {
    flex-direction: row;
    justify-content: center;
    width: 750px;
    padding-top: 20px;
    padding-bottom: 20px;
}
.refresh-title {
    margin-left: 30px;
    font-size: 32px;
    text-align: center;
}
.indicator {
    color: black;
}
</style>
