<template>

    <div>
        <!--       <bui-header title="emoji" :leftItem="leftItem"
                           @leftClick="back">
               </bui-header>-->
        <slider class="slider" interval="4500" @change="onchange">
            <div class="flex-column" v-for="(item,index) in pageNo">
                <waterfall column-count="8" style="width: 750px;padding: 10px">
                    <cell v-for="(j,k) in 40">
                        <div style="background-color: #ecf0f1">
                            <bui-image v-if="" style="height: 60px;width: 60px;margin-top: 8px"
                                       @click="onFaceClick(index,k)"
                                       :src="k==39?'/image/emoji/face_delete.png':'/image/emoji/'+getImageIndex(index,k)+'.png'"></bui-image>
                        </div>
                    </cell>
                </waterfall>
            </div>

            <indicator class="indicator"></indicator>
        </slider>
    </div>
</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss">
</style>
<style>
    .slider {
        height: 450px;
        background-color: #ecf0f1;
        width: 750px;
    }

    .indicator {
        width: 750px;
        height: 70px;
        item-color: #ede9ea;
        item-selected-color: #b7b7b7;
        item-size: 16px;
        position: absolute;
        bottom: 10px;

    }
</style>
<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    module.exports = {
        components: {},
        data () {
            return {
                leftItem: {
                    icon: 'ion-ios-arrow-left',
                },
                faces: "微笑,呲牙,害羞,色,苦笑,酷,发怒,飞吻,大舌头,抠鼻,偷笑,嘘,得意,享受,生病,顽皮,鄙视,难过,怒,惊呆了,擦汗,流泪,大笑,惊讶,迷茫,嘟嘴,眨眼,天使,吐舌,糟糕,不爽,傲慢,困,打瞌睡,不开心,好吧,呆,发呆,恶魔,担忧,可爱,怎么办,可怜,无表情,唉,OK,握手,抱拳,强,胜利,奋斗,鼓掌,祈祷,握拳,手掌,no,爱心,心碎,拥抱,礼花,玫瑰,礼物,奖杯,红旗,高铁,地铁,单车,步行,飞机,互联网,公告,电脑,电话,公文包,钢笔,满分,对,错,感叹,警告,疑问,top,结束,向上,向下,向左,向右,拳头,不要,不要不要,不赞,吻,睡觉,太阳,便便,爆筋,白天,夜晚,多云,彩虹,下雨,闪电,中国,蛋糕,炸弹,邮箱,刀,高跟鞋,唱歌,钓鱼,画画,酒杯,咖啡,麻将,射箭,足球,放大镜,录像,南瓜,圣诞老人,沙漏,手表,西瓜,回形针,枪,小狗,小猪,音乐,上,下,雪人",
            }
        },
        methods: {
            "back": function () {
                this.$pop();
            },
            "rightclick": function () {
                var params = {'name': 'yulsh', 'company': 'BingoSoft'}
                var url = this.$getContextPath() + "/list.weex.js";
                this.$push(url, params);
            },
            getPageFaceArray(index){
                let faceArray = this.faces.split(",");
                let start = index * 40;
                let end = start + 39;
                return faceArray.slice(start, end);
            },
            getImageIndex(pageNo, i){
                return pageNo * 39 + i;
            },
            onFaceClick(pageNo, i){
                if (i == 39) {
              //      this.$alert('delete');
                    return;
                }
                let index = pageNo * 39 + i;
                let faceArray = this.faces.split(",");
                if (index < faceArray.length) {
                    this.$emit('faceSelected', '[' + faceArray[index] + ']');
                }
            }
        },
        computed: {
            /*           pageFaceArray(index) {
             this.$alert(index)
             let faceArray = this.faces.split(",");
             let start = index * 40;
             let end = start + 39;
             return faceArray.slice(start,end);
             },
             */
            pageNo(){
                return Math.ceil(this.faces.split(",").length / 39);
            }
        },
        mounted()
        {
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        }
    }
</script>