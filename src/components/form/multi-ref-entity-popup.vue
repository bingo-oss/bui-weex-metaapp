<template>
    <div class="container">
        <bui-header :title="'请选择' + definition.componentParams.title"
                    :leftItem="{text: '取消'}" @leftClick="cancel"
                    :rightItem="{icon: 'ion-android-done'}" @rightClick="ok"
        >
        </bui-header>
        <bui-tabbar v-if="tabItems.length>1" :tabItems="tabItems" showSelectedLine=true @change="onItemChange" v-model="currentTab"></bui-tabbar>
        <bui-searchbar-center placeholder="请输入搜索内容" @search="onSearchInput" @clear="onSearchClear"></bui-searchbar-center>
        <scroller class="scroller">
            <bui-cell v-for="item in dataList" :key="item.id" :title="item[refEntitys[currentTab].titleField]||item.title" @cellClick="itemClicked(item)">
                <bui-icon slot="label" v-if="!item.selected" name="ion-ios-checkmark-outline" size=60></bui-icon>
                <bui-icon slot="label" v-if="item.selected" name="ion-ios-checkmark" size=60></bui-icon>
            </bui-cell>
            <loading-wrapper v-if="dataList.length && dataList.length >= pageSize" @loading="onloading" :status="loadingStatus">
            </loading-wrapper>
        </scroller>
    </div>
</template>

<script>
    import ajax from '../../js/ajax.js';
    import _ from '../../js/tool/lodash';

    export default {
        props: {
            definition: null,
            refEntitys: null,
            "selectedItem":{
                type:Array,
                default:function(){
                    return [];
                }
            }//选中数据
        },
        data() {
            return {
                currentTab:0,
                tabItems:[],
                dataList: [],
                dataUrlPath: '',
                queryObject: {},
                pageSize: 20,
                loadingStatus: 'init',
                currentPage: 1
            }
        },
        watch: {
            refEntitys:{
                immediate: true,
                handler(v) {
                    if (v) {
                        this.tabItems = [];
                        this.entityResourceUrl = this.refEntitys[0].entityResourceUrl;//默认显示第一个
                        _.each(v,(refEntity)=>{
                            this.tabItems.push({
                               title:refEntity.title,
                               entityResourceUrl:refEntity.entityResourceUrl,
                               filter:refEntity.filter
                            })
                        });//组装tab标签
                    }
                }
            },
            entityResourceUrl: {
                immediate: true,
                handler(v) {
                    if (v) {
                        this.dataUrlPath = v;
                        this.refresh();
                    }
                }
            }
        },
        methods: {
            fetchData(page) {
                this.queryObject.page = page || 1;
                this.queryObject.page_size = this.pageSize;
                if(this.tabItems[this.currentTab].filter){
                    if(this.queryObject.filters){
                        this.queryObject.filters += `and ${this.tabItems[this.currentTab].filter}`;
                    }else{
                        this.queryObject.filters = `${this.tabItems[this.currentTab].filter}`;
                    }
                }
                return ajax.get(this.dataUrlPath, this.queryObject).then(resp => {
                        return resp.data;
                });
            },
            refresh() {
                this.fetchData(1).then(data => {
                    this.dataList = data;
                    this.selectedChange(this.dataList);
                    this.loadingStatus = 'init';
                })
            },
            onSearchInput(v) {
                this.queryObject.filters = v && `title like %${v}%`;
                this.refresh();
            },
            onSearchClear() {
                this.queryObject.filters = '';
                this.refresh();
            },
            itemClicked(item) {
                let _index = this.selectedItem.findIndex((obj)=>{return obj==item.id});
                if(_index==-1){
                    this.selectedItem.push(item.id)
                    item.selected = true;
                }else{
                    this.selectedItem.splice(_index,1);//移除
                    item.selected = false;
                }
                this.$forceUpdate();//更新下视图
                //this.$emit('itemSelected', item);
            },
            cancel() {
                this.$emit('cancel');
            },
            ok(){
                //确定
                this.$emit('itemSelected', this.selectedItem);
            },
            onloading() {
                if (this.loadingStatus == 'loading') return;
                this.loadingStatus = 'loading';
                this.fetchData(this.currentPage + 1).then(data => {
                    if (data.length) {
                        this.dataList = this.dataList.concat(data);
                        this.selectedChange(this.dataList)
                        this.currentPage++;
                        this.loadingStatus = 'init';
                    } else {
                        this.loadingStatus = 'noMore';
                    }
                }).catch(err => {
                        this.$toast(err);
                    this.loadingStatus = 'init';
                })
            },
            onItemChange(val){
                //切换实体
                this.entityResourceUrl = this.tabItems[val].entityResourceUrl;
            },
            selectedChange(data){
                //检验是否选中
                _.each(data,(item)=>{
                   if(this.selectedItem.some(function(value){
                        return value==item.id //返回 true
                    })){
                        item.selected = true;
                    }else{
                        item.selected = false;
                    }
                });
                this.$forceUpdate();//更新下视图
            }
        }
    }
</script>

<style lang="css">
    .container {
        flex: 1;
    }
    .scroller {
        flex: 1;
    }
</style>
