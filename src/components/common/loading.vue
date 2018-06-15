<template>
    <loading class="loading-wrapper" @loading="onloading" @pullingdown="onpullingdown" :display="display">
        <loading-indicator v-if="status == 'loading'" class="indicator"></loading-indicator>
        <text class="loading-title">{{title}}</text>
    </loading>
</template>

<script>

const statusText = {
    'init': '加载更多',
    'loading': '加载中',
    'noMore': '没有更多数据',
}

export default {
    props: {
         isLoading: false,
         status: 'init', // 'loading', 'noMore'
    },
    data() {
        return {
            title: '加载更多',
            display: 'hide',
        }
    },
    watch: {
        isLoading(isLoading) {
            if (isLoading) {
                this.display = 'show';
                this.title = '加载中'
            } else {
                this.display = 'hide';
                this.title = '加载更多'
            }
        },
        status(s) {
            this.title = statusText[s];
            switch(s) {
                case 'init': {
                    this.display = 'hide';
                    break;
                }
                case 'loading': {
                    this.display = 'show';
                    break;
                }
                case 'noMore': {
                    this.display = 'show';
                    setTimeout(()=>{
                        this.display='hide';
                    },500);
                    break;
                }
            }
        }
    },
    methods: {
        onloading() {
            this.$emit('loading')
        },
    }
}
</script>

<style lang="css">
.loading-wrapper {
    flex-direction: row;
    justify-content: center;
    width: 750px;
    padding-top: 20px;
    padding-bottom: 20px;
}
.loading-title {
    margin-left: 30px;
    font-size: 32px;
    text-align: center;
}
.indicator {
    color: black;
}
</style>
