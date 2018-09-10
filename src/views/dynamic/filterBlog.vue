<template>

    <div style="background-color: #efefef">
        <bui-header title="高级筛选" :leftItem="leftItem" :rightItem="rightItem" @rightClick="onSubmit"
                    @leftClick="back" :backgroundColor="themeBg">
        </bui-header>

        <div class="item-box" style="margin-top: 30px">
            <div class="flex-row center">
                <text class="title">关键字</text>
                <input type="text" return-key-type="send" class="input keyword-input"
                       v-model="form.keyword"/>
            </div>
        </div>

        <div class="item-box" style="margin-top: 50px;">
            <div class="flex-row center">
                <text class="title">开始时间</text>
                <div class="flex1 flex-row row-right-bottom" @click="onTimeClick(1)">
                    <text class="text-value">{{form.startTime==''?'请选择':form.startTime}}</text>
                    <bui-icon name="ion-ios-arrow-right" size="45px" color="#818181"  @click="onTimeClick(1)"></bui-icon>
                </div>
            </div>
        </div>
        <div class="item-box border">
            <div class="flex-row center">
                <text class="title">结束时间</text>
                <div class="flex1 flex-row row-right-bottom" @click="onTimeClick(2)">
                    <text class="text-value">{{form.endTime==''?'请选择':form.endTime}}</text>
                    <bui-icon name="ion-ios-arrow-right" size="45px" color="#818181" @click="onTimeClick(2)"></bui-icon>
                </div>
            </div>
        </div>


        <div class="item-box" style="margin-top: 50px;">
            <div class="flex-row center">
                <text class="title">发表人</text>
                <div class="flex1 flex-row row-right-bottom" style="margin-left: 50px" @click="onSelectUserClick">
                    <text class="text-value" style="lines:1;text-overflow: ellipsis;flex:1;text-align: right">{{form.userName==''?'请选择':form.userName}}</text>
                    <bui-icon name="ion-ios-arrow-right" size="45px" color="#818181" @click="onSelectUserClick"></bui-icon>
                </div>
            </div>
        </div>
        <div class="item-box border">
            <div class="flex-row center">
                <text class="title">所属部门</text>
                <div class="flex1 flex-row row-right-bottom" @click="onSelectOrgClick">
                    <text class="text-value">{{form.orgName==''?'请选择':form.orgName}}</text>
                    <bui-icon name="ion-ios-arrow-right" size="45px" color="#818181" @click="onSelectOrgClick"></bui-icon>
                </div>
            </div>
        </div>
        <div class="item-box border">
            <div class="flex-row center">
                <text class="title">类型</text>
                <div class="flex1 flex-row row-right-bottom" @click="onTypeClick">
                    <text class="text-value">{{form.labelName==''?'请选择':form.labelName}}</text>
                    <bui-icon name="ion-ios-arrow-right" size="45px" color="#818181" @click="onTypeClick"></bui-icon>
                </div>
            </div>
        </div>

        <bui-actionsheet
                :items="actionsheetItems"
                v-model="showBar"
                title="请选择类型"
                @itemClick="actionsheetItemClick"
                ref="actionsheet"
        ></bui-actionsheet>

        <div class="item-box center" style="margin-top: 80px;font-size: 32px"
             @click="reset">
            <text style="color: red;font-size: 32px">重置</text>
        </div>
    </div>
</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss">

</style>
<style>
    .title {
        color: #848484;
        font-size: 30px
    }

    .keyword-input {
        height: 60px;
        flex: 1;
        margin-left: 25px;
        font-size: 32px;
    }

    .text-value {
        color: #bdbdbd;
        font-size: 32px
    }

    .item-box {
        padding: 20px;
        height: 100px;
        background-color: #fff;
        justify-content: center;
    }

    .border {
        border-top-width: 1px;
        border-top-color: #dcdcdc;
        border-top-style: solid;
    }

</style>
<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    var picker = weex.requireModule('picker');
    const storage = weex.requireModule('storage')
    let _this;
    module.exports = {
        data () {
            return {
                _this: '',
                leftItem: {
                    icon: 'ion-ios-arrow-left',
                },
                rightItem: {
                    text: '确定',
                },
                showBar: false,
                form: {
                    keyword: '',
                    startTime: '',
                    endTime: '',
                    responsiblePersonId: '',
                    userName: '',
                    orgName: '',
                    orgId: '',
                    type: '',
                    labelId: '',
                    labelName: ''
                },
                blogTabItems: [{title: '全部', target: ''}]
            }
        },
        methods: {
            back () {
                this.$pop();

            },
            onSubmit(){
                storage.setItem("filterParams", this.form);
                this.$pop();
            },
            onTimeClick(type){
                picker.pickDate({
                    value: _this.date
                }, function (event) {
                    if (event.result == 'success') {
                        if (type == 1) {
                            _this.form.startTime = event.data;
                        } else {
                            _this.form.endTime = event.data;
                        }
                    }
                });
            },
            onSelectUserClick(){
                linkapi.startContactMulitSelector("选择发表人", 1, null, function (result) {
                    if (!result || JSON.stringify(result) == "{}") {
                        return;
                    }
                    let userArray = result.user;
                    for (let itme of userArray) {
                        if (_this.form.userName == "") {
                            _this.form.userName = itme.name;
                            _this.form.responsiblePersonId = itme.userId;
                        } else {
                            _this.form.userName = _this.form.userName + "," + itme.name;
                            _this.form.responsiblePersonId = _this.form.responsiblePersonId + "," + itme.userId;
                        }
                    }

                }, function (error) {
                })
            },
            onSelectOrgClick(){
                linkapi.startContactSingleSelector("选择所属部门", 4, null, function (result) {
                    if (result.id != undefined && result.id != '') {
                        _this.form.orgName = result.name;
                        _this.form.orgId = result.id;
                    }
                }, function (error) {
                })
            },
            onTypeClick(){
                this.showBar = true;
                this.$refs.actionsheet.show();
            },
            reset(){
                this.form = {
                    keyword: '',
                    startTime: '',
                    endTime: '',
                    responsiblePersonId: '',
                    userName: '',
                    orgName: '',
                    orgId: '',
                    labelName: '',

                }
            },
            actionsheetItemClick(item) {
                this.showBar = false;
                this.form.labelName = item;
                let index = this.actionsheetItems.indexOf(item);
                this.form.labelId = this.blogTabItems[index].target;
            },
        },
        computed: {
            actionsheetItems(){
                let _array = [];
                for (let item of this.blogTabItems) {
                    _array.push(item.title)
                }
                return _array;
            }
        },
        mounted(){
            _this = this;
            let params = this.$getPageParams();
            this.blogTabItems = this.blogTabItems.concat(JSON.parse(params.data));
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        }
    }
</script>