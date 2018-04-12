<template>
    <div @viewappear="viewAppear">
        <bui-header :leftItem="{icon: 'ion-ios-arrow-back'}" @leftClick="pop">
            <div slot="center" class="page-title-wrapper" @click="titleClicked">
                <text class="page-title" @click="titleClicked">{{title}}</text>
                <!-- <bui-icon v-if="presetFilters.length" name="ion-chevron-down" color="white" size=36 @click="titleClicked"></bui-icon> -->
            </div>
            <div slot="right" class="header-right-wrapper">
                <div class="header-button" @click="filterClicked">
                    <bui-icon name="ion-funnel" color="white" @click="filterClicked"></bui-icon>
                </div>
                <div class="header-button" @click="create">
                    <bui-icon name="ion-plus" color="white" @click="create"></bui-icon>
                </div>
            </div>
        </bui-header>
        <bui-searchbar-center @search="onSearch" @clear="onSearchClear" placeholder="请输入搜索内容"></bui-searchbar-center>
        <scroller>
            <refresh-wrapper @refresh="onrefresh" :isRefreshing="isRefreshing">
            </refresh-wrapper>

            <div v-for="(o, index) in listData">
                <bui-swipe-cell height="200px" :items="swipeActions"
                    @actionClick="swipeActionClicked($event, o.id, index)"
                    @click="read(o.id)"
                    @swipeleft="cellSwiped(o.id)"
                    :ref="o.id"
                    >
                    <!-- 布局 0 默认 -->
                    <div class="list-item" v-if="layoutType == '0'" slot="content">
                        <div class="list-item-row">
                            <text class="title-text">{{o.id}}</text>
                        </div>
                    </div>
                    <!-- 布局 1 -->
                    <div class="list-item" v-if="layoutType == '1'" slot="content">
                        <div class="list-item-row">
                            <text class="title-text">{{getFieldValue(o, p1)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text">{{getFieldValue(o, p2)}}</text>
                            <text class="sub-text">{{getFieldValue(o, p3)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text">{{getFieldValue(o, p4)}}</text>
                            <text class="sub-text">{{getFieldValue(o, p5)}}</text>
                        </div>
                    </div>
                </bui-swipe-cell>
            </div>

            <div class="list-item" v-if="listData.length === 0">
                <text class="empty-tips">暂无数据</text>
            </div>
            <!-- 在数据长度小于 pageSize 时，说明已经没有更多数据了 -->
            <loading-wrapper v-if="listData.length && listData.length >= pageSize" @loading="onloading" :status="loadingStatus">
            </loading-wrapper>
        </scroller>

        <bui-dropdown v-model="showDropdown" ref="dropdown" :center=true>
            <bui-cell v-for="filter in presetFilters" :key="filter.id" :title="filter.title" @cellClick="presetFilterChosen(filter)"></bui-cell>
        </bui-dropdown>

        <bui-popup v-model="showPopup" pos="right" width=600>
            <filter-view :filters="filters" :viewDef="viewDef" :swaggerEntiyDef="swaggerEntiyDef" @filter="customFilterSet" @cancel="showPopup = false">
            </filter-view>
        </bui-popup>
    </div>
</template>

<script>

import service from '../js/service.js';
import ajax from '../js/ajax.js';
import config from '../js/config.js';
const linkapi = require('linkapi');

const globalEvent = weex.requireModule('globalEvent');

module.exports = {
    data() {
        return {
            engineUrl: '',
            entityName: '',
            dataUrlPath: '', // 获取 listData 的 url 路径，不包含 queryParam
            queryParam: {}, // 获取 listData 的 queryParam
            listData: [],
            viewDef: {},
            selectFields: [],
            quickSearchableField: [],
            swaggerEntiyDef: {},
            layoutType: "0",
            p1: 'title',
            p2: '2',
            p3: '3',
            p4: '4',
            p5: '5',
            presetFilters: [],
            filters: {}, // 高级搜索 filter
            quickSearchFilters: '', // 快捷搜索 filter
            selectedFilter: null, // 预设 filter
            showDropdown: false,
            showPopup: false,
            isRefreshing: false,
            loadingStatus: 'init',
            currentPage: 1,
            pageSize: 10,
            swipeActions: [
                {title: '查看', bgcolor: '#c6c7c8'},
                {title: '编辑', bgcolor: '#3091f2'},
                {title: '删除', bgcolor: '#ff4e24'}
            ],
            remainingPageParam: {},
        }
    },
    computed: {
        title() {
            if (this.selectedFilter) {
                return this.selectedFilter.title;
            }
            return '全部'; // 无可用分类时，默认显示‘全部’
        }
    },
    methods: {
        filterClicked() {
            this.showPopup = true;
        },
        customFilterSet(result) {
            // this.$alert(result);
            this.showPopup = false;
            this.filters = result;
            this.refreshData();
        },
        swipeActionClicked(actionIndex, id, listIndex) {
            switch (actionIndex) {
                case 0:
                    this.read(id)
                    break;
                case 1:
                    this.edit(id);
                    break;
                case 2:
                    this.delete(id, listIndex);
                    break
                default:
                    this.$alert('Not reached.')
            }
        },
        // 查看选中记录的主页
        read(id) {
            if (!this.viewDef.settings.mViewUrl) return;
            let url = this.viewDef.settings.mViewUrl.appUrl.replace(':id', id);
            let params = {
                appCode: this.viewDef.settings.mViewUrl.appCode,
                appUrl: url,
            };
            linkapi.runApp(params)
        },
        // 创建新记录
        create() {
            // 将页面参数传递给下一个页面
            let queryParam = Object.assign({formId: this.formId}, this.remainingPageParam);
            let url = `${this.contextPath}/form.weex.js${ajax.object2query(queryParam)}`;
            this.$push(url)
        },
        // 编辑选中记录
        edit(id) {
            // 将页面参数传递给下一个页面，必须带上 entityId
            let queryParam = Object.assign({formId: this.formId, entityId: id}, this.remainingPageParam);
            let url = `${this.contextPath}/form.weex.js${ajax.object2query(queryParam)}`;
            this.$push(url)
        },
        // 删除选中记录
        delete(id, index) {
            service.deleteEntity(this.engineUrl, this.entityName, id).then(() => {
                this.$toast('删除成功')
                this.listData.splice(index, 1);
            }).catch((resp, ...args) => {
                // this.$alert(resp);
                // BUG: 错误时无法获取 resp.data，所以写死
                if (resp.status == 500) {
                    this.$alert('数据已归档，不允许再进行修改');
                }
            })
        },
        titleClicked(e) {
            // 没有分类则无动作
            if (!this.presetFilters.length) return;
            this.$refs.dropdown.show(e);
            this.showDropdown = true;
        },
        presetFilterChosen(filter) {
            this.$refs.dropdown.hide();
            this.selectedFilter = filter;
            this.queryParam.viewId = filter.viewId;
            this.refreshData();
        },
        // 一些字段的值是 id，通过这个方法将其转换为对应的用于显示的值
        getFieldValue(obj, field) {
            if (obj._data && obj._data[field]) {
                // 对于引用实体字段，读取 _data 里的内容
                // 参考返回的数据结构
                let expandedData = obj._data[field];
                for (let k in expandedData) {
                    return expandedData[k].title;
                }
            } else {
                // 对于非引用实体字段，针对日期作处理
                let fieldDef = this.swaggerEntiyDef.properties[field];
                if (fieldDef) {
                    switch (fieldDef.format) {
                        case 'date-time':
                            let d = new Date(obj[field]);
                            return d.toLocaleString(undefined, {hour12: false})
                        default:

                    }
                }
                return obj[field];
            }
        },
        /**
         * 获取指定页数的数据
         * @param  {Number} page 页码
         */
        fetchData(page) {
            this.queryParam.page_size = this.pageSize;
            this.queryParam.page = page || 1;
            let filtersParts = [];
            // 最终参数里的 filters 由 this.filters, this.quickSearchFilters, this.selectedFilter 三大部分组成
            if (this.filters) {
                for (let k in this.filters) {
                    if (this.filters[k]) filtersParts.push(this.filters[k]);
                }
            }
            if (this.quickSearchFilters) {
                filtersParts.push(this.quickSearchFilters);
            }
            if (this.selectedFilter && this.selectedFilter.value) {
                filtersParts.push(this.selectedFilter.value)
            }
            this.queryParam.filters = filtersParts.join(' and ');
            return ajax.get(this.dataUrlPath, this.queryParam).then(resp => {
                return resp.data;
            })
        },
        refreshData() {
            if (this.isRefreshing) return;
            this.isRefreshing = true;
            this.fetchData(1).then(data => {
                this.dataInited = true; // 控制 viewAppear 时是否刷新页面，只有获取数据成功过才刷新
                this.listData = data;
                this.isRefreshing = false;
                this.currentPage = 1;
                this.loadingStatus = 'init';
            }).catch(err => {
                this.isRefreshing = false;
                this.$alert(err);
            })
        },
        loadMore() {
            if (this.loadingStatus == 'loading') return;
            this.loadingStatus = 'loading';
            this.fetchData(this.currentPage + 1).then(data => {
                if (data.length) {
                    this.listData = this.listData.concat(data);
                    this.loadingStatus = 'init';
                    this.currentPage++;
                } else {
                    this.loadingStatus = 'noMore';
                }
            }).catch(err => {
                this.loadingStatus = 'init';
            })
        },
        onrefresh() {
            this.refreshData();
        },
        onloading() {
            this.loadMore();
        },
        onSearch(keyword) {
            let filtersStr = keyword && this.quickSearchableField
                .map(name => `${name} like '%${keyword}%'`)
                .join(' or ')
            this.quickSearchFilters = filtersStr && `(${filtersStr})`; // and 优先级比 or 高，这里先用 () 包裹起来
            this.refreshData();
        },
        onSearchClear() {
            this.quickSearchFilters = '';
            this.refreshData();
        },
        pop() {
            this.$pop();
        },
        viewAppear() {
            // 只在获取过数据，且筛选页面未打开的时候才刷新
            if (this.dataInited && !this.showPopup) {
                this.refreshData();
            }
        },
        viewDisappear() {
            // BUG: Android 上如果绑定 viewdisappear，push 再 pop 页面会报错
        },
        cellSwiped(id) {
            if (this.lastSwipeCellId) {
                let ref = this.$refs[this.lastSwipeCellId][0]; // TODO: 不知道为什么 this.$refs[id] 获得的是一个数组……
                ref.close();
            }
            this.lastSwipeCellId = id;
        }
    },
    created() {
        this.contextPath = this.$getContextPath();
        globalEvent.addEventListener("androidback", e => {
            this.$pop();
        });

        let pageParam = this.$getPageParams();

        // 以下变量由外部配置
        // 获取这些变量之后，将其从 pageParam 里删除，pageParam 剩下的参数将会被透传
        let viewId = pageParam.viewId;
        delete pageParam.viewId;

        // TODO: 暂时写死删除 title 键
        delete pageParam.title;

        this.remainingPageParam = pageParam;

        let debug = config.debug;
        let readRuntimeConfigPromise;
        if (debug) {
            viewId = viewId || config.debugViewId;
            pageParam.activityId = 'jdgBczwGi';
            service.init(config.debugConfigUrl);
            readRuntimeConfigPromise = Promise.resolve();
        } else {
            if (!viewId) {
                this.$alert('缺少参数 viewId');
                return;
            }
            let contextPath = this.$getContextPath();
            readRuntimeConfigPromise = config.readRuntimeConfig(contextPath)
                .catch(err => {
                    this.$alert(err);
                    this.$toast('读取运行时配置失败');
                })
                .then(runtimeConfig => {
                    service.init(runtimeConfig.configServerUrl)
                })
        }

        readRuntimeConfigPromise.then(() => {
            // 获取视图定义
            return service.getMetaViewDef(viewId).catch((err) => {
                this.$toast('getMetaViewDef error')
                this.$alert(err)
            })
            .then(viewDef => {
                this.viewDef = viewDef;
                this.formId = viewDef.metaFormShortId;
                let params = {
                    filters: viewDef.config.filters, // 过滤
                };
                // 选择字段
                let fields = new Set();
                fields.add('_data'); // _data 字段里会有冗余信息
                fields.add('id'); // id 是一定要获取的，否则删改操作都无法进行
                viewDef.config.columns.forEach(col => {
                    fields.add(col.name)
                    if (col.quicksearchable) {
                        this.quickSearchableField.push(col.name);
                    }
                });
                if (viewDef.config.mLayout) {
                    // 处理手机端布局
                    this.layoutType = viewDef.config.mLayout.template;
                    if (this.layoutType == '1') {
                        let layout = viewDef.config.mLayout.params;
                        this.p1 = layout.p1;
                        this.p2 = layout.p2;
                        this.p3 = layout.p3;
                        this.p4 = layout.p4;
                        this.p5 = layout.p5;
                        fields.add(this.p1);
                        fields.add(this.p2);
                        fields.add(this.p3);
                        fields.add(this.p4);
                        fields.add(this.p5);
                    }
                }
                params.select = Array.from(fields).join(',');
                // 排序
                if (viewDef.config.orderby) {
                    params.orderby = viewDef.config.orderby.map(o => `${o.name} ${o.type}`).join(',')
                }
                // 预设的过滤器
                if (viewDef.config.multipleFilters.support) {
                    this.presetFilters = viewDef.config.multipleFilters.filters;
                    this.selectedFilter = this.presetFilters.find(f => f.checked);
                    if (this.selectedFilter) {
                        params.viewId = this.selectedFilter.viewId;
                    }
                }
                return service.getEngineUrl(viewDef.projectId)
                .catch(err => {
                    this.$toast('getEngineUrl error')
                    this.$alert(err)
                })
                .then(engineUrl => {
                    this.engineUrl = engineUrl;
                    this.entityName = viewDef.metaEntityName;
                    service.getSwaggerEntityDef(engineUrl, this.entityName).then(entityDef => {
                        this.swaggerEntiyDef = entityDef;
                        // 对于 pageParam 里的 query，遇到属于字段的 query 要在获取实体数据时带上
                        for (let k in this.swaggerEntiyDef.properties) {
                            if (pageParam[k]) {
                                params[k] = pageParam[k];
                            }
                        }
                    })
                    .catch(err => {
                        this.$toast('getSwagger error')
                        this.$alert(err)
                    })
                    .then(() => {
                        // 转成小写，否则不认
                        this.dataUrlPath = `${engineUrl}/${viewDef.metaEntityName.toLowerCase()}`;
                        this.queryParam = params;
                        return this.refreshData();
                    })
                    .catch(err => {
                        this.$alert('refreshData error')
                        this.$alert(err)
                    })
                });
            })
        }).catch(err => {
            console.log(err)
            this.$alert(err);
        });
    },
    components: {
        'filter-view': require('./filter.vue'),
        'refresh-wrapper': require('../components/common/refresh.vue'),
        'loading-wrapper': require('../components/common/loading.vue')
    }
}
</script>

<style lang="css">
.page-title-wrapper {
    flex-direction: row;
}

.header-right-wrapper {
    flex-direction: row;
    position: relative;
    left: 20px;
}

.page-title {
    color: white;
    font-size: 36px;
}

.header-button {
    padding-bottom: 20px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
}

.list-item {
    flex-direction: column;
    padding-bottom: 20px;
    padding-right: 40px;
}
.list-item-row {
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
}

.title-text {
    color: black;
    font-weight: 500;
    font-size: 32px;
    margin-bottom: 5px;
    flex: 1;
}

.sub-text {
    font-size: 32px;
    max-width: 400px;
    color: #BEBCBC;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.empty-tips {
    font-size: 40px;
    margin-top: 20px;
    width: 750px;
    text-align: center;
    color: #BEBCBC;
}
</style>
