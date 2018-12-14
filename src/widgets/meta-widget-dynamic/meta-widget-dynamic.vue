<template>
    <div class="flex-column" style="flex: 1;">
        <bui-header v-if="!widgetParams.hideHeader" title="动态" :leftItem="leftItem"
                    @leftClick="back" :backgroundColor="themeBg">
                <div slot="right" class="header-right-wrapper">
                    <div class="header-button" @click="filterClicked">
                        <bui-icon name="ion-funnel" color="white" @click="filterClicked"></bui-icon>
                    </div>
                </div>
        </bui-header>
        <div class="flex1">
            <!--筛选-->
            <div v-if="isShowFilter" class="flex-row filter">
                <div class="flex1" style="margin-left: 30px;">
                    <text style="font-size: 25px;color: #9d9d9d">以下是根据条件筛选的结果</text>
                </div>
                <div>
                    <bui-icon name="ion-close-circled" size="30px"
                              style="margin-right: 20px" @click="clearFilter"></bui-icon>
                </div>
            </div>

            <!--动态tab栏-->
            <!--<div v-if="!isShowFilter&&tabItems.length>0" class="flex-row tab_list">
                <div class="flex-row flex1 center" v-for="(item,index) in tabItems" style=""
                     @click="onTabClick(index,item,$event)">
                    <div class="flex1 center flex-row">
                        <div class="center flex-row"
                             :style="{'margin-top':'4px','height': '80px','border-bottom-width': '6px','border-bottom-style': 'solid','padding-left': '5px','padding-right': '5px','border-bottom-color': tabActive==index?'#0088fb':'transparent'}">
                            <text :class="[tabTextStyle(index)]">{{item.title}}</text>
                        </div>
                        <bui-icon v-if="index==5" name="ion-ios-arrow-down" size="30"></bui-icon>
                        &lt;!&ndash;index==5为更多菜单更多菜单时显示&ndash;&gt;
                    </div>
                    &lt;!&ndash;<div class="separator_line2"></div>&ndash;&gt;
                </div>
            </div>-->

            <!--更多-下拉菜单-->
            <bui-dropdown v-model="showDropdown" ref="dropdown">
                <div class="center dropDown-cell" v-for="(item,i) in tabMoreMenuList" @click="onMoreMenuClick(i)">
                    <text class="dropDown-text" :value="item.title"></text>
                </div>
            </bui-dropdown>


            <bui-actionsheet
                    :items="shareItems"
                    v-model="showShareActionSheet"
                    title="请选择类型"
                    @itemClick="onSelectShareType"
                    ref="shareActionSheet"></bui-actionsheet>

            <!--置顶消息-->
            <div>
                <scroller style="max-height: 450px">
                    <div v-for="(item,i) in topMessageList"
                         style="margin-top: 2px;padding-left: 10px;background-color: #ffe3db;"
                         @click="onTopMessageClick(item,i)">
                        <div style="height:80px;align-items: center" class="flex-row"
                             v-if="(item.msgType==0||item.msgType==1)&&item.dataJson&&item.dataJson.blogInfo">
                            <div class="flex-row center flex1">
                                <text style="color:#0088fb;font-size: 30px"
                                      :value="item.msgType==0?item.dataJson.blogInfo.accountName:item.dataJson.currentCommentData.userName"></text>
                                <text style="color:#0088fb;font-size: 30px;margin-left:10px"
                                      :value="item.msgType==0?'@我':'回复我'"></text>
                                <div class="flex1" style="justify-content: center;">
                                    <text style="font-size: 30px;margin-left: 10px;color: #484848;lines:1;text-overflow: ellipsis;"
                                          :value="getBlogMsgContent(item)"></text>
                                </div>
                            </div>
                            <div class="row-right-bottom">
                                <bui-icon name="ion-ios-arrow-forward"></bui-icon>
                            </div>
                        </div>
                        <!--公告消息-->
                        <div style="height:100px;align-items: center" class="flex-row"
                             v-if="item.msgType==2&&item.dataJson">
                            <div>
                                <bui-image width="55px" height="55px" src="/image/notice2.png"></bui-image>
                            </div>
                            <div class="flex-column flex1" style="height: 100px;flex:1;justify-content:center;">
                                <div class="flex1 column-left-bottom">
                                    <text style="font-size: 32px;margin-left: 15px;color: #ff751f;lines:1;text-overflow: ellipsis;"
                                          :value="item.dataJson.title"></text>
                                </div>
                                <div class="flex1">
                                    <text style="font-size: 26px;margin-left: 15px;color: #727272;lines:1;text-overflow: ellipsis;"
                                          :value="item.dataJson.content"></text>
                                </div>
                            </div>
                            <div class="row-right-bottom" style="margin-right: 5px">
                                <bui-icon name="ion-ios-arrow-forward"></bui-icon>
                            </div>
                        </div>

                        <div style="background-color: #ffe3db;height:80px;align-items: center" class="flex-row"
                             v-if="item.msgType==3&&item.dataJson">
                            <div>
                                <text style="font-size: 30px;color: #0088fb"
                                      :value="item.dataJson.name+'通过分享链接申请加入'"></text>
                            </div>
                            <div class="flex1 row-right-bottom">
                                <bui-icon name="ion-ios-arrow-forward"></bui-icon>
                            </div>
                        </div>
                    </div>
                </scroller>
            </div>

            <list class="bui-list" loadmoreoffset="2" @scroll="onListScroll">
                <refresh class="bui-refresh" @refresh="onRefresh" @pullingdown="onPullingdown($event)"
                         :display="refreshing ? 'show' : 'hide'">
                    <bui-icon :name="refreshIcon" size="40px" style="margin-right: 5px;"></bui-icon>
                    <text class="bui-refresh-indicator" style="font-size: 30px;">{{refreshText}}</text>
                </refresh>

                <cell class="center" v-if="isShowEmpty">
                    <div class="center">
                        <text style="color: #656565;font-size: 32px;margin-top: 50px" value="暂无数据!"></text>
                    </div>
                </cell>

                <cell class="cell-box" v-for="(blogItem,index) in blogList" :ref="blogItem.blogInfo.blogId"
                      @click="onBlogItemClick(blogItem.blogInfo.blogId)" v-if="blogList.length>0">
                    <div :class="['flex-row','blog-div',getItemLabelStyle(blogItem)!=''?'instructions-label':'']"
                    ><!--  :style="{'border-left-color':'#'+getItemLabelStyle(blogItem).color}"-->
                        <div style="width: 80px;height: 80px;border-radius: 50px">
                            <bui-image width="80px" height="80px" radius="50px"
                                       :src="getImageUrl(blogItem.blogInfo.accountImage)+'&width=80&height=80'"
                                       placeholder="/image/usertp.png"></bui-image>
                        </div>
                        <div class="bui-list-main">
                            <div class="row-center-left flex-row">
                                <text class="blog-name"
                                      :value="blogItem.blogInfo.accountName"></text>
                                <text class="position"
                                      :value="blogItem.blogInfo&&blogItem.blogInfo.orgName?'('+blogItem.blogInfo.orgName+')':''"></text>
                            </div>
                            <!--正文 -->
                            <!--<text class="body-content" :value="getBlogText(blogItem.blogInfo.content)"></text>-->
                            <!--        <text style="font-size: 28px;color: #7776b4;margin-top: 15px" value="收起"
                                          @click="blogContentExpand(blogItem.blogInfo.content)"></text>-->
                            <bui-richcell class="body-content"
                                          :content='getBlogText(blogItem.blogInfo.content)'></bui-richcell>
                            <!-- 0图片或1视频 -->
                            <div v-if="blogItem.resourceList&&blogItem.resourceList.length>0" class="flex-row flex-fluid">
                                <div class="flex-fluid" v-for="(resourceItem,i) in blogItem.resourceList">
                                    <div class="blog-image-grid-item"
                                         v-if="resourceItem.resourceType==0||resourceItem.resourceType==1">
                                        <bui-image width="160px" height="160px"
                                                   :src="convertStore(resourceItem,resourceItem.resourceType)"
                                                   @click="onBlogItemClick(blogItem.blogInfo.blogId)"></bui-image>
                                        <bui-image v-if="resourceItem.resourceType==1"
                                                   width="160px" height="160px"
                                                   style="position: absolute;top: 50px;left: 50px"
                                                   src="/image/icon-video.png"></bui-image>
                                    </div>
                                </div>
                            </div>

                            <!--附件或链接-->
                            <div v-if="blogItem.resourceList&&blogItem.resourceList.length>0"
                                 v-for="(attachmentItem,i) in blogItem.resourceList"
                                 @click="onResourceTypeClick(attachmentItem,blogItem.blogInfo.blogId)">
                                <div v-if='attachmentItem.resourceType==3||attachmentItem.resourceType==4||attachmentItem.resourceType==5||attachmentItem.resourceType==6'
                                     class="flex-row row-center-left"
                                     style="background-color: #f2f2f2;margin-top: 10px;padding: 20px;margin-left: 5px">
                                    <bui-image width="60px" height="60px"
                                               :src="getImageUrl(attachmentItem.resourceThumb)"
                                               :placeholder="getAttachmentItemDefaultImage(attachmentItem.resourceType)"></bui-image>
                                    <text style="font-size: 25px;color: #696969;margin-left: 10px;flex: 1"
                                          :value="attachmentItem.resourceDescription">
                                    </text>
                                </div>
                            </div>
                            <!--位置-->
                            <div v-if="blogItem.blogInfo.location" class="flex-row row-center-left" style="margin-top: 20px"
                                 @click="onLocationClick(blogItem)">
                                <bui-image width="35px" height="35px"
                                           src="/image/location_mark_green.png"></bui-image>
                                <text style="font-size: 25px;color: #898989"
                                      :value="blogItem.blogInfo.location.addr"></text>
                            </div>


                            <!--时间 -->
                            <div class="flex-row center" style="margin-top: 20px;align-items: center;">
                                <div class="flex1 flex-row row-center-left">
                                    <text class="time">{{handleTime(blogItem.blogInfo.publishTime)}}</text>
                                    <!--         <text v-if="blogItem.blogInfo.accountId==currLoginInfo.userId" class="delete"
                                                   @click="onBlogDelete(blogItem)"
                                                   value="删除">
                                             </text>-->
                                </div>
                                <div v-if="!blogItem.blogInfo.isDeleted" class="image-box flex-row center"
                                     @click="onCommentMenuClick(index,blogItem,$event,1)">
                                    <bui-image style="width: 40px;height:25px;" src="/image/blog_ic_item_operate.png"
                                               @click="onCommentMenuClick(index,blogItem,$event,2)"></bui-image>
                                </div>
                            </div>

                            <div v-if="isShowPopupMenu&&currClickIndex==index">
                                <div style="position: fixed;left: 0px;right: 0px;top: 0px;bottom: 0px;opacity: 0;"
                                     @click="_maskClick"></div>
                                <div class="flex-row center popup" :style="popupStyle">
                                    <div class="flex1 flex-row center" @click="onPraiseClick(index,blogItem)"
                                         style="padding-left: 15px;padding-right: 15px">
                                        <bui-image width="30px" height="30px" @click="onPraiseClick(index,blogItem)"
                                                   src="/image/blog_item_operate_ic_praise.png"></bui-image>
                                        <text class="popup-item-text">赞</text>
                                    </div>
                                    <div class="flex1 flex-row center" @click="onCommentClick(index,blogItem)"
                                         style="border-left-color: #2e2e2e;border-left-style: solid;border-left-width: 2px;padding-left: 15px;padding-right: 15px">
                                        <bui-image width="30px" height="30px" @click="onCommentClick(index,blogItem)"
                                                   src="/image/blog_item_operate_ic_comment.png"></bui-image>
                                        <text class="popup-item-text">评论</text>
                                    </div>
                                    <div v-if="blogItem.blogInfo.accountId==currLoginInfo.userId||isAdmin"
                                         class="flex1 flex-row center" @click="onBlogDeleteConfirm(blogItem)"
                                         style="border-left-color: #2e2e2e;border-left-style: solid;border-left-width: 2px;padding-left: 15px;padding-right: 15px">
                                        <!-- <bui-image style="width: 30px;height:30px" @click="onBlogDelete(blogItem)"
                                                    src="/image/blog_item_operate_ic_comment.png"></bui-image>-->
                                        <bui-icon name="ion-ios-trash-outline" size="40" color="#ffffff"
                                                  @click="onBlogDeleteConfirm(blogItem)"></bui-icon>
                                        <text class="popup-item-text"
                                              value="删除">
                                        </text>
                                        <!--<text class="popup-item-text">评论</text>-->
                                    </div>
                                </div>
                            </div>

                            <div class="flex-column comment-box"
                                 v-if="(blogItem.praiseList&& blogItem.praiseList.length>0)||(blogItem.commentList&&blogItem.commentList.length>0)">
                                <!--点赞-->
                                <div v-if="blogItem.praiseList&& blogItem.praiseList.length>0"
                                     class="flex-row row-center-left" style="padding:10px;">
                                    <bui-image style="width: 25px;height:25px;"
                                               src="/image/blog_icon_praise.png"></bui-image>
                                    <text class="praise-text">{{getPraiseText(blogItem.praiseList)}}</text>
                                </div>
                                <div v-if="blogItem.praiseList&&blogItem.commentList&&blogItem.praiseList.length>0&&blogItem.commentList.length>0"
                                     class="line"></div>
                                <!--评论-->
                                <div v-if="blogItem.commentList&&blogItem.commentList.length>0"
                                     style="padding-left: 10px;padding-bottom: 10px">
                                    <div class="flex-column" style="margin-top:15px;"
                                         @click="onReplyClick(blogItem,commentItem)"
                                         v-for="(commentItem,i) in blogItem.commentList">
                                        <text class="comment-text">{{getCommentContent(commentItem)}}</text>
                                    </div>
                                </div>
                            </div>
                            <!--领导批示-->
                        </div>
                        <div class="bui-list-right">
                        </div>
                    </div>
                    <div style="position: absolute;top: 30px;right: 50px" v-if="getItemLabelStyle(blogItem)!=''">
                        <bui-image width="150px" height="110px"
                                   :src="getImageUrl(getItemLabelStyle(blogItem).pic)"></bui-image>
                    </div>
                </cell>
                <!--加载更多-->
                <loading class="bui-loading" @loading="onLoading" :display="showLoading ? 'show' : 'hide'">
                    <text class="bui-loading-indicator" v-if="showLoading">{{loadingText}}</text>
                    <loading-indicator class="bui-indicator"></loading-indicator>
                </loading>
            </list>

            <div class="flex-row" style="padding: 10px;background-color: #f1f1f1;align-items: center"
                 v-if="isShowComment">
                <div class="flex1">
                    <input type="text"
                           ref="input"
                           style="height: 80px ;background-color: #FFFFFF;padding: 20px;border-color:#bababa;border-width: 1px;border-style: solid"
                           autofocus="true"
                           :placeholder="placeholder" return-key-type="send" class="input"
                           v-model="commentContent"
                           @change="onInputChange"
                           @input="onInput"
                           @return="onSendComment"/>
                </div>
                <div>
                    <bui-image
                            v-if="inputButtonState"
                            width="60px" height="60px" style="margin-left: 10px" @click="onFaceClick"
                            src="/image/mb_btn_face_selector0.png"></bui-image>
                    <!--       <bui-image
                                   v-if="!inputButtonState"
                                   style="height: 60px;width: 60px;margin-left: 10px" @click="onFaceClick"
                                   src="/image/mb_btn_keyboard_selector0.png"></bui-image>-->
                </div>
            </div>

            <emoji-express v-if="isShowExpression" @faceSelected="onFaceSelected"></emoji-express>

<!--
            <bui-loading :show="isShowLoading" loading-text="加载中..."></bui-loading>
-->

            <dialog v-model="showDialog" @btnClick="onDialogCallback" title="提示" :buttonArray="buttonArray"
                    :dialogContent="dialogContent">
            </dialog>

            <div v-if="isShowTopBottom"
                 style="position: absolute;bottom: 20px;right: 20px;padding:20px;background-color: #ededed"
                 @click="toTopClick">
                <bui-image width="40px" height="40px" src="/image/toTop.png" @click="toTopClick"></bui-image>
            </div>


        </div>

        <!--底部菜单-->
        <div class="flex-row bottom-box" v-if="isShowBottomMenu">
            <div class="flex1 flex-row center" @click="onWriteClick">
                <bui-icon name="ion-navicon" size="30"></bui-icon>
                <text class="bottom-text">撰写</text>
            </div>
            <div class="separator_line3" v-if="createMenuList.length>0"></div>
            <div class="flex1 flex-row center" @click="add" v-if="createMenuList.length>0">
                <bui-icon name="ion-ios-arrow-right" size="30" v-if="createMenuList.length>1"></bui-icon>
                <text class="bottom-text" :value="createMenuList.length==1?createMenuList[0].title:'更多'"></text>
            </div>
        </div>

        <!--撰写菜单-->
        <div v-if="isShowWriteMenu" @click="onWriteMenuClick"
             class="write-menu-box">

<!--            <div class="center" v-for="(item,index) in writeMenuList" :style="{'width': 750/4+'px'}"
                 @click="onWriteMenuItemClick(item.target)">
                <bui-image style="margin: 20px" width="120px" height="120px"
                           @click="onWriteMenuItemClick(item.target)"
                           :src="getWriteMenuImage(item.target)"></bui-image>
                <text style="font-size: 28px" :value="item.title"></text>
            </div>-->
            <div style="flex-direction: row;flex-wrap: wrap;">
                <div class="center" v-for="(item,index) in writeMenuList" :style="{'width': 750/4+'px'}"
                     @click="onWriteMenuItemClick(item.target)">
                    <bui-image style="margin: 20px" width="120px" height="120px"
                               @click="onWriteMenuItemClick(item.target)"
                               :src="getWriteMenuImage(item.target)"></bui-image>
                    <text style="font-size: 28px" :value="item.title"></text>
                </div>
            </div>

            <div class="write-menu-close">
                <bui-icon name="ion-ios-close-outline" size="45px" color="#818181"
                          @click="onWriteMenuClose"></bui-icon>
            </div>
        </div>

        <bui-popupshow v-model="showUp" ref="upshow" bottom="50" left="475">
            <div class="center"
                 style="padding-bottom: 20px;padding-top: 20px;padding-left: 20px;padding-right: 20px;border-bottom-style: solid;border-bottom-color: #e7e7e7;border-bottom-width: 1px;width: 200px"
                 v-for="(item,i) in createMenuList" @click="onCreateMenuItemClick(item)">
                <text style="font-size: 30px;color: #515151" :value="item.title"></text>
            </div>
        </bui-popupshow>

    </div>

</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style>
    .blog-image-grid-item {
        margin: 5px;
        background-color: #cfcfcf;
    }

    .position {
        font-size: 28px;
        color: #c4c4c4;
        margin-left: 5px;
        lines: 1;
        flex: 1;
        text-overflow: ellipsis
    }

    .body-content {
        font-size: 28px;
        color: #585858;
        margin-top: 10px;
        lines: 0
    }

    .time {
        font-size: 25px;
        color: #cacaca
    }

    .delete {
        font-size: 25px;
        color: #9792f3;
        margin-left: 20px
    }

    .image-box {
        justify-content: center;
        align-items: flex-end;
        padding-right: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        padding-right: 10px
    }

    .comment-box {
        /*background-color: #e6e6e6;*/
        background-color: #f4f4f4;
        margin-top: 20px;
    }

    .praise-text {
        font-size: 25px;
        color: #8782a7;
        flex: 1;
        margin: 5px;
    }

    .line {
        height: 1px;
        background-color: #dcdcdc
    }

    .comment-text {
        font-size: 25px;
        color: #6d6d6d;
    }

    .cell-box {
        border-bottom-style: solid;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        background-color: #ffffff;
    }

    .blog-div {
        padding-bottom: 20px;
        padding-top: 20px;
        padding-left: 20px;
        border-left-style: solid;
        border-left-color: transparent;
        border-left-width: 10px;
    }

    .instructions-label {
        border-left-color: #ec6560;
    }

    .popup {
        padding-top: 20px;
        padding-bottom: 20px;
        background-color: #424242;
        border-radius: 10px;
        margin-right: 10px;
    }

    .blog-name {
        color: #4f53b0;
        font-size: 32px
    }

    .popup-item-text {
        color: #fff;
        font-size: 25px;
        margin-left: 5px
    }



    .wrapper {
        margin: 0;
        padding: 0;
    }

    .header-color {
        background-color: #4ca4fe
    }

    .header-content {
        height: 90px
    }

    .header-right {
        padding-right: 20px
    }

    .header-left {
        padding-left: 20px;
    }

    .circle {
        width: 120px;
        height: 120px;
        background-color: #9f83ff;
        -moz-border-radius: 60px;
        -webkit-border-radius: 60px;
        border-radius: 60px;
        margin: 20px;
    }

    .head_content {
        margin-top: 10px;
        margin-left: 50px
    }

    .separator_line1 {
        width: 1px;
        height: 30px;
        background-color: #dddddd;
        margin-top: 8px;
    }

    .separator_line2 {
        width: 3px;
        height: 40px;
        background-color: #ffffff;
        margin-top: 8px;
    }

    .dropDown-cell {
        height: 60px;
    }

    .dropDown-text {
        font-size: 28px;
        color: #313131;
    }

    .separator_line3 {
        width: 2px;
        background-color: #dddddd;
        text-align: center;
        align-items: center;
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .head_content_title {
        color: #ffffff;
        font-size: 40px;
        lines: 1;
        text-overflow: ellipsis;
        flex: 1;
    }

    .head_content_subTitle {
        color: #e6e6e6;
        font-size: 25px;
        margin-top: 15px
    }

    .option_list {
        margin-top: 40px;
        margin-bottom: 20px;
    }

    .tab_list {
        background-color: #fff;
        height: 80px;
        align-items: center;
        border-bottom-color: #f3f3f3;
        border-bottom-width: 2px;
        border-bottom-style: solid;
    }

    .option_font {
        color: #fff;
        font-size: 26px
    }

    .tab_title_text {
        color: #8f8f8f;
        font-size: 28px
    }

    .tab_title_text_checked {
        color: #067ffb;
        font-size: 28px
    }

    .bottom-box {
        /*   position: fixed;
           bottom: 0px;
           left: 0px;
           right: 0px;*/
        border-width: 2px;
        height: 100px;
        border-color: #eeeaeb;
        margin-bottom: 1px;
        background-color: #fcfcfc
    }

    .bottom-text {
        font-size: 30px;
        color: #727272
    }

    .filter {
        background-color: #dbe8f2;
        height: 70px;
        align-items: center
    }

    .write-menu-close {
        position: absolute;
        top: 0;
        right: 0;
        padding-right: 20px;
        padding-top: 20px;
    }

    .write-menu-box {
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        width: 750px;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.9);
    }

    .members-img {
        margin-right: 5px
    }

    .border-right {
        border-right-color: #dddddd;
        border-right-style: solid;
        border-right-width: 1px
    }

    .apply-join-button {
        width: 600px;
        background-color: #3399ff;
        border-radius: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
        margin-top: 100px
    }

    .apply-join-button:active {
        background-color: #3181ff;
    }

    .no-join-button {
        width: 600px;
        background-color: #c1c1c1;
        border-radius: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
        margin-top: 50px
    }

    .no-join-button:active {
        background-color: #c1c1c1;
    }
</style>

<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    var storage = weex.requireModule('storage');
    import emojiExpression from './components/emojiExpression.vue'
    const linkapi = require("linkapi");
    var moment = require('moment');
    const link = weex.requireModule("LinkModule");
    const stream = weex.requireModule('stream');
    import Util from '../../js/utils'
    import Config from '../../js/config'
    import loading from '../../components/common/bui-loading.vue'
    import dialog from '../../components/common/dialog.vue'
    import buiweex from "bui-weex"
    import factoryApi from '../libs/factory-api.js';
    import popupmenu from './components/bui-popupmenu.vue'
    import service from './js/service'
    import _ from '../../js/tool/lodash';

    module.exports = {
        props: {
            widgetParams: {
                type: Object,
                required: true
            },
            /*isArchive: {
                type: Boolean,
                default: false
            },*/
            isAdmin: {
                type: Boolean,
                default: false
            }
        },
        components: {'emoji-express': emojiExpression, 'bui-loading': loading, 'dialog': dialog,'bui-popupshow': popupmenu},
        data () {
            return {
                praiseList: [],
                isShowComment: false,
                isShowExpression: false,
                inputButtonState: true,
                leftItem: {
                    icon: 'ion-ios-arrow-left',
                },
                info: {
                    dataId: '',//数据id
                    name: '',
                    channelName: '',
                    startTime: '',
                    createdBy: '',
                    icon: '',
                    projectId: '',
                    formShortId: '',
                    entityId: ''//实体id
                },
                commentContent: '',
                lastInputContent: '',
                placeholder: '输入评论内容',
                blogItem: null,
                currClickIndex: -1,
                replyCommentItem: null,
                blogList: [],
                pageSize: 10,
                pageNo: 1,
                showDropdown: false,
                refreshing: false,
                showLoading: false,
                refreshIcon: "icon-todown",
                refreshText: "下拉刷新...",
                loadingText: "加载更多数据...",
                currLoginInfo: {
                    userId: '',
                    userName: '',
                    orgId: '',
                    orgName: '',
                },
                atArray: [],
                atAccountIds: [],
                filterParams: {},
                isSearching: false,
                isShowPopupMenu: false,
                popupStyle: {
                    'position': 'fixed',
                    'right': '0px',
                    'top': '0px',
                    'border-radius': '10px'
                },
                currLabeId: '',
                labelStyle: {},
                isShowEmpty: false,
                //isShowLoading: false,
                showDialog: false,
                buttonArray: [],
                dialogContent: '',
                dialogType: 0,
                isShowTopBottom: false,
                isShowBottomMenu: true,
                createMenuList: [],
                isShowFilter: false,
                //当前选择的tab
                tabItems: [],
                writeMenuList: [],
                showUp:false,
                metaSuite:{},
                isAdmin:null,
                tools:[],
                tabActive:0//默认选择动态的tap1
            }
        },
        methods: {
            "back": function () {
                this.$pop();
            },
            _maskClick(){
                this.isShowPopupMenu = false;
            },
            onResourceTypeClick(item, id){
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!")
                    return;
                }
                if (item.resourceType == 5) {
                    let params = item.resourceUrl;
                    link.launchLinkService([params], null, null);
                } else if (item.resourceType == 6) {
                    this.isAccessApp(item);
                } else {
                    this.$toast("请在动态详情打开此文件")
                    this.openMicroblogDetail(id);
                }
            },
            openMicroblogDetail(id){
                link.registerSendBlogCommentReceiver(['onBlogDetailCommentedCallback', id], error=> {
                });
                linkapi.openMicroblogDetail(id);
            },
            isAccessApp(item){
                if (Util.isEmpty(item.extraInfo) || Util.isEmpty(item.resourceUrl)) {
                    this.$toast("参数错误");
                    return;
                }
                let id = JSON.parse(item.extraInfo).id;
                let actionParams;
                if(weex.config.env.deviceModel.indexOf("iPhone")==-1){
                    actionParams = JSON.parse(item.resourceUrl).ios;
                }else{
                    actionParams = JSON.parse(item.resourceUrl).android;
                }
                let params = {
                    url: Config.serverConfig.uamUrl + '/esService/canBeUse/' + id,
                    data: {}
                };
                if (!Util.isEmpty(actionParams)) {
                    actionParams = actionParams.replace("{parentId}", this.info.dataId);
                    actionParams = actionParams.replace("{parentEntityName}", this.info.entityId);
                    actionParams = actionParams.replace("{parentText}", this.info.name);
                    actionParams = actionParams.replace("{closePage}", true);
                    link.launchLinkService([actionParams], null, null);
                } else {
                    this.$toast("不支持打开此应用!");
                }
/*                linkapi.get(params).then((result) => {
                    if (result.success && result.result) {
                        if (!Util.isEmpty(actionParams)) {
                            actionParams = actionParams.replace("{parentId}", this.info.dataId);
                            actionParams = actionParams.replace("{parentEntityName}", this.info.entityId);
                            actionParams = actionParams.replace("{parentText}", this.info.name);
                            actionParams = actionParams.replace("{closePage}", true);
                            link.launchLinkService([actionParams], null, null);
                        } else {
                            this.$toast("不支持打开此应用!");
                        }
                    } else {
                        this.$toast("您没有权限查看此应用!");
                    }
                }, error => {
                    this.$toast(Util.handleException(error))
                });*/
            },
            blogContentExpand(content){
                let count = (weex.config.env.deviceWidth - 140) / 28;

            },
            getBytesLength(str){
                return str.replace(/[^\x00-\xff]/g, 'xx').length;
            },
            onFaceClick(){
                this.isShowExpression = true;
                this.closeKeyboard();
                /*         if (this.inputButtonState) {
                 this.inputButtonState = false
                 } else {
                 this.inputButtonState = true
                 }*/
            },
            onFaceSelected(val){
                this.$refs.input.getSelectionRange((e) => {
                    if (this.commentContent.length != 0) {
                        if (e.selectionStart == 0) {
                            this.commentContent = this.commentContent + val;
                            return;
                        }
                        let prefix = this.commentContent.substring(0, e.selectionStart);
                        let suffix = this.commentContent.substring(e.selectionStart + 1, this.commentContent.length);
                        this.commentContent = prefix + val + suffix
                    } else {
                        this.commentContent = val;
                    }
                });
            },
            onBlogItemClick(id){//动态详情
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!")
                    return;
                }
                this.openMicroblogDetail(id);
            },
            toTopClick(){
                let id = this.blogList[0].blogInfo.blogId;
                let el = this.$refs[id][0];
                weex.requireModule('dom').scrollToElement(el, {offset: 0});
            },
            onListScroll(event){
                let offsetY = event.contentOffset.y;
                if (Math.abs(offsetY) > 300) {
                    this.isShowTopBottom = true;
                } else {
                    this.isShowTopBottom = false;
                }
//                     this.isShowComment = false;
            },
            onLocationClick(item){
            },
            onPraiseClick(index, blogItem){
                this.isShowPopupMenu = false;
                this.blogItem = blogItem;
                let datas = {
                    blogId: this.blogItem.blogInfo.blogId,
                }
                let params = {
                    url: Config.serverConfig.blogApi + '/v1/info/praise',
                    data: Util.toHttpRequestParams(datas)
                }
                linkapi.post(params).then((result) => {
                    if (result.code == 200) {
                        datas.userName = this.currLoginInfo.userName;
                        this.blogItem.praiseList.push(datas)
                    } else {
                        this.$toast("点赞失败");
                    }
                }).catch((error)=> {
                    this.$toast(Util.handleException(error));
                });
            },
            onInput(event){//监听输入
                let newContent = event.value;
                let len = newContent.length - this.lastInputContent.length;
                let _this = this;
                let params = {
                    idForAtProjectMembers: this.info.dataId,
                    onlyAtProjectMembers: true
                };
                this.$refs.input.getSelectionRange((e) => {
                    if (len > 0) {
                        let text = newContent.substring(e.selectionStart - 1, e.selectionStart);
                        if (text == '@') {//at选人
                            linkapi.startContactMulitSelector("选择@对象", 1, params, function (result) {
                                if (result.user) {
                                    for (let i in result.user) {
                                        if (result.user[i].userId == "all") {
                                            result.user[i].name = "全体成员"
                                        }
                                        _this.atArray.push(result.user[i]);
                                        if (i == 0) {
                                            _this.commentContent = _this.commentContent + result.user[i].name + " ";
                                        } else {
                                            _this.commentContent = _this.commentContent + "@" + result.user[i].name + " ";
                                        }
                                    }
                                }
                                setTimeout(function () {
                                    _this.isShowComment = true;
                                }, 1000);
                            }, function (error) {
                            })
                        }
                    }
                });
                this.lastInputContent = newContent;
            },
            onCommentClick(index, blogItem){
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!")
                    return;
                }
                this.isShowPopupMenu = false;
                this.placeholder = "输入评论内容"
                this.blogItem = blogItem;
                this.replyCommentItem = null;
                this.isShowComment = true;
            },
            onCommentMenuClick(index, blogItem, $event, type){
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!");
                    return;
                }
                this.currClickIndex = index;
                this.isShowPopupMenu = true;
                this.popupStyle.right = 750 - $event.position.x + 10;
                if (type == 1) {
                    this.popupStyle.top = $event.position.y - 60;
                } else {
                    this.popupStyle.top = $event.position.y - 60 - $event.position.height / 2;
                }
            },
            closeKeyboard(){
                this.$refs.input.blur()
            },
            onSendComment(){//发送评论
                this.isShowComment = false;
                this.isShowExpression = false;
                this.closeKeyboard();
                let datas = {
                    commentId: "",
                    blogId: this.blogItem.blogInfo.blogId,
                    content: this.handleCommentContent(),
                    atAccountIds: this.atAccountIds,
                    replyCommentId: this.replyCommentItem == null ? "" : this.replyCommentItem.commentId,
                    userName: this.currLoginInfo.userName
                };
                let params = {
                    url: Config.serverConfig.blogApi + '/v1/info/comment',
                    headers: {'Content-Type': 'application/json'},
                    data: datas
                };
                linkapi.post(params).then((result) => {
                    // this.blogList.push()
                    if (result.code == 200) {
                        this.commentContent = "";
                        this.lastInputContent = "";
                        this.blogItem.commentList.push(datas)
                        this.$toast("评论发送成功");
                    } else {
                        this.$toast("评论发送失败");
                    }
                }).catch((error)=> {
                    //this.$toast(Util.handleException(error));
                });
            },
            handleCommentContent(){
                let content = this.commentContent;
                this.atAccountIds = [];
                for (let item of this.atArray) {
                    let json = {
                        id: item.userId,
                        name: item.name,
                        type: 0
                    };
                    let text = "@" + item.name;
                    let index = content.indexOf(text);
                    if (index > -1) {
                        content = content.replace(text, "@" + JSON.stringify(json));
                        if (item.userId == "all") {
                            this.atAll = true;
                        } else {
                            this.atAccountIds.push(item.userId);
                        }
                    }
                }
                return content;
            },
            onDialogCallback(val){
                this.showDialog = false;
                if (this.dialogType == 1) {//申请加入
                    if (val.type == 1) {//返回
                    } else if (val.type == 2) {
                        if (this.isAdmin && this.blogItem.blogInfo.accountId != this.currLoginInfo.userId) {
                            this.deleteBlogForAdmin(this.blogItem);
                        } else {
                            this.deleteBlog(this.blogItem);
                        }
                    }
                }
            },
            onBlogDeleteConfirm(blogItem){
                this.isShowPopupMenu = false;
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!");
                    return;
                }
                this.blogItem = blogItem;
                this.dialogContent = "你是否确定要删除该动态？";
                this.buttonArray = [{type: 1, title: '取消'}, {type: 2, title: '确定'}];
                this.dialogType = 1;
                this.showDialog = true;
            },
            deleteBlogForAdmin(item){
                factoryApi.startLoading(this);//显示加载圈
                //this.isShowLoading = true;
                let datas = {
                    blogId: item.blogInfo.blogId,
                    dataId: this.info.dataId,
                    entityId: this.info.entityId
                };
                let params = {
                    url:  `${Config.serverConfig.engineService}/metaservice/meta_blog/deleteBlogOrComment`,
                    data: Util.toHttpRequestParams(datas)
                }
                linkapi.post(params).then((result) => {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    if (result.s == 1) {
                        this.$toast("删除成功");
                        this.pageNo = 1;
                        this.initData(1)
                    } else {
                        this.$toast(result.m);
                    }
                }).catch((error)=> {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    //this.$toast(Util.handleException(error));
                });
            },
            deleteBlog(item){
                factoryApi.startLoading(this);//显示加载圈
                //this.isShowLoading = true;
                let params = {
                    url: Config.serverConfig.blogApi + '/v1/info?blogId=' + item.blogInfo.blogId,
                }
                linkapi.delete(params).then((result) => {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    if (result.code == 200) {
                        this.$toast("删除成功");
                        this.pageNo = 1;
                        this.initData(1)
                    } else {
                        this.$toast(result.message);
                    }
                }).catch((error)=> {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    //this.$toast(Util.handleException(error));
                });
            },
            getImageUrl(url){
                if (Util.isEmpty(url)) {
                    return "";
                }
                let _array = url.split("||");
                if (Array.isArray(_array)) {
                    if (_array.length > 0) {
                        return Config.serverConfig.uamUrl + "/ui/download?filepath=" + _array[0];
                    } else {
                        return Config.serverConfig.uamUrl + "/ui/download?filepath=" + url;
                    }
                } else {
                    return url;
                }
            },
            getPraiseText(praiseList){
                if (praiseList == undefined || praiseList.length == 0) {
                    return;
                }
                let str = "";
                let len = praiseList.length;
                for (let i in praiseList) {
                    if (str == "") {
                        str = str + praiseList[i].userName;
                    } else {
                        str = str + ',  ' + praiseList[i].userName;
                    }
                    if (i > 9) {
                        str = str + ' 等' + len + '人'
                        return str;
                    }
                }
                return str;
            },
            getBlogText(str){
                return this.handleContent(str);
            },
            getCommentContent(item){
                let content = ""
                let authorName = item.userName;
                var reg = new RegExp("@(\\{[\\s\\S]*?\\})", "g")
                var s = item.content;
                s.replace(reg, function (a, b) {
                    var b;
                    b = a.replace("@", "");
                    if (typeof b == "string") {
                        b = eval('(' + b + ')')
                    }
                    s = s.replace(a, '@' + b.name);//先把匹配到的替换成数组标记
                });
                if (!Util.isEmpty(item.replyUserName)) {
                    content = authorName + "回复" + item.replyUserName + ":" + s;
                } else {
                    content = authorName + ":" + s;
                }
                return content;
            },
            convertStore(obj, type){//转换地址
                //type:0图片 1视频
                if (typeof obj == "string")obj = eval('(' + obj + ')');
                var imgUrl, objReg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/, str1 = "";
                var reg1 = /groupbox\?copy_ref=/;
                //4.0改造后的动态
                imgUrl = obj.resourceUrl;
                if (type == 0) {
                    imgUrl = obj.resourceUrl;
                } else if (type == 1) {
                    imgUrl = obj.resourceThumb;
                }
                if (imgUrl) {
                    if (!objReg.test(imgUrl)) {
                        var key;
                        if (/store:/.test(imgUrl)) {
                            key = imgUrl.replace(/store:\/\/|dropbox:\/\//g, "");
                            str1 = Config.serverConfig.uamUrl + "/ui/download?usedisk=1&fileId=" + key;
                        } else if (/disk:/.test(imgUrl)) {
                            key = imgUrl.replace(/disk:\/\//g, "");
                            str1 = Config.serverConfig.uamUrl + "/ui/download?usedisk=1&diskId=" + key
                        } else if (/dropbox:/.test(imgUrl)) {
                            str1 = imgUrl.split(",")[1];
                            /*if(str1.split("open_sharepage/")[0].indexof("pan.bingosoft.net:81")!=-1){
                             _diskServiceUrl = "http:pan.bingosoft.net:81";
                             }//品高私有云盘校验*/
                            str1 = str1.replace("/drive/share/open_sharepage/", "/openapi/stream/share/download?shareId=")
                            /*str1 = _diskServiceUrl+"/openapi/stream/share/download?shareId="+str1.split("open_sharepage/")[1];*/
                        } else {
                            str1 = diskService + imgUrl;
                        }
                        //str1=diskService+imgUrl;
                    } else {
                        str1 = imgUrl;
                    }
                    /*if(reg1.test(imgUrl)){
                     str1 = str1.replace(/^.*groupbox\?copy_ref=/, uamUrl+"imDisk/DownloadFile?groupId=&name=&fileId=");
                     }*/
                    str1 = str1.replace(/@/g, "$");
                }
                return str1;
            },
            handleContent(str){//处理@Json数据
                /*       let _this = this;
                 var subArray = [];
                 var reg = new RegExp("@(\\{[\\s\\S]*?\\})", "g")
                 var s = str;
                 s.replace(reg, function (a, b) {
                 var b;
                 b = a.replace("@", "");
                 if (typeof b == "string") {
                 b = eval('(' + b + ')')
                 }
                 s = s.replace(a, '@' + b.name);//先把匹配到的替换成数组标记
                 });
                 return s;*/
                let _array = [];
                let reg = new RegExp("@(\\{[\\s\\S]*?\\})|#[^#|^(@\\{*?\\})]+#|\\[.*?\\]", "g");//匹配"@{id:123,name:456}"或"#test#"或"[test]"

                if (reg.test(str)) {
                    let matchArray = str.match(reg);
                    for (let j in matchArray) {
                        let item = matchArray[j];
                        let i = str.indexOf(item);
                        if (i >= 0) {
                            if (item.startsWith('@')) {
                                let temp = item.replace("@", "");
                                if (typeof temp == "string") {
                                    temp = eval('(' + temp + ')');
                                }
                                let prefix = str.substring(0, i);
                                let content = '@' + temp.name;
                                str = str.substring(i + item.length);
                                _array = _array.concat(this.convertText(prefix));
                                _array.push({
                                    type: 'text',
                                    value: content,
                                    theme: 'blue',
                                });
                            } else if (item.startsWith('#')) {
                                let prefix = str.substring(0, i);
                                str = str.substring(i + item.length);
                                _array = _array.concat(this.convertText(prefix));
                                _array.push({
                                    type: 'text',
                                    value: item,
                                    theme: 'blue',
                                });
                            } else if (item.startsWith('[')) {
                                let prefix = str.substring(0, i);
                                str = str.substring(i + item.length);
                                _array = _array.concat(this.convertText(prefix));
                                let faces = "微笑,呲牙,害羞,色,苦笑,酷,发怒,飞吻,大舌头,抠鼻,偷笑,嘘,得意,享受,生病,顽皮,鄙视,难过,怒,惊呆了,擦汗,流泪,大笑,惊讶,迷茫,嘟嘴,眨眼,天使,吐舌,糟糕,不爽,傲慢,困,打瞌睡,不开心,好吧,呆,发呆,恶魔,担忧,可爱,怎么办,可怜,无表情,唉,OK,握手,抱拳,强,胜利,奋斗,鼓掌,祈祷,握拳,手掌,no,爱心,心碎,拥抱,礼花,玫瑰,礼物,奖杯,红旗,高铁,地铁,单车,步行,飞机,互联网,公告,电脑,电话,公文包,钢笔,满分,对,错,感叹,警告,疑问,top,结束,向上,向下,向左,向右,拳头,不要,不要不要,不赞,吻,睡觉,太阳,便便,爆筋,白天,夜晚,多云,彩虹,下雨,闪电,中国,蛋糕,炸弹,邮箱,刀,高跟鞋,唱歌,钓鱼,画画,酒杯,咖啡,麻将,射箭,足球,放大镜,录像,南瓜,圣诞老人,沙漏,手表,西瓜,回形针,枪,小狗,小猪,音乐,上,下,雪人";
                                let faceArray = faces.split(",");
                                let faceStr = item.substring(1, item.length - 1)
                                let index = faceArray.indexOf(faceStr);
                                if (index > -1) {
                                    _array.push({
                                        type: 'image',
                                        value: item,
                                        src: '/image/emoji/' + index + ".png",
                                        width: '32px',
                                        height: '32px',
                                    });
                                } else {
                                    _array.push({
                                        type: 'text',
                                        value: item,
                                    });
                                }
                            }
                            if (j == matchArray.length - 1) {
                                _array = _array.concat(this.convertText(str));
                            }
                            /*                   if (!reg.test(str)) {
                             _array = _array.concat(this.convertText(str));

                             }*/
                        }
                    }
                } else {
                    _array = _array.concat(this.convertText(str));

                }
                return _array;
            },
            convertText(text){
                let _array = [];
                for (var i = 0; i < text.length; i++) {
                    var obj = {
                        type: 'text',
//                       style: {'font-size': '28px', 'color': '#585858', 'margin-left': '0', 'margin-right': '0'},
//                        style: { 'color': '#585858'},
                        theme: 'black',
                        value: text.charAt(i)

                    }
                    if (text.charCodeAt(i) == 10) {//换行符，为了能换行故此处理
                        obj.style = {
                            width: 750,
                            height: 1
                        }
                        obj.value = " ";
                    }
                    _array.push(obj);
                }
                return _array;
            },
            openDropdown(event) {
                this.showDropdown = true;
                this.$refs.dropdown.show(event);
            },
            getLoginInfo(){
                let _this = this;
                linkapi.getLoginInfo(function (data) {
                    if (data != null) {
                        _this.currLoginInfo = data
                        _this.getArchive(true);//获取是否归档
                        if (data.userId == this.info.createdBy) {//创建人即管理员
                            this.isAdmin = true;
                        }else{
                            this.getAdminInfo();
                        }
                    }
                }, function (error) {
                });
            },
            /*refreshData(){
                if (this.info == null || Util.isEmpty(this.info.entityId)) {
                    return;
                }
                let startTime = 0;
                if (this.blogList.length > 0) {
                    startTime = this.blogList[0].blogInfo.publishTime + 1;
                }
                let params = {
                    url:  `${Config.serverConfig.engineService}/metaservice/meta_blog/getHomePageBlogList`,
                    data: {
                        sourceModule: this.info.entityId,
                        offset: this.pageNo,
                        limit: this.pageSize,
                        isRefresh: 1,
                        startTime: startTime,
                        sourceId: this.info.dataId,
                    }
                };
                if (this.currLabeId != '') {
                    params.data.labelId = this.currLabeId;
                }
                linkapi.get(params).then((result) => {
                    if (result.code == 200 && result.data.length > 0) {
                        let datas = result.data;
                        let _array = [];
                        for (let item of datas) {
                            if (!this.isExitsBlog(item.blogInfo.blogId) && this.blogList.length > 0) {
                                _array.push(item)
                            }
                        }
                        if (_array.length > 0) {
                            this.blogList = _array.concat(this.blogList);
                        }else{
                            this.blogList = datas;
                        }
                    }
                    factoryApi.stopLoading(this);//关闭加载圈
                }, error=> {
                })
            },*/
            isExitsBlog(id){
                for (let item of this.blogList) {
                    if (id == item.blogInfo.blogId) {
                        return true;
                    }
                }
                return false;
            },
            initData(type){//获取动态数据 type1 刷新数据 type2加载更多
                this.isShowEmpty = false;
                if (Util.isEmpty(this.info) || Util.isEmpty(this.info.entityId)) {
                    factoryApi.stopLoading(this);//关闭加载圈
                    //this.isShowLoading = false;
                    return;
                }
                let params = {
                    url:  `${Config.serverConfig.engineService}/metaservice/meta_blog/getHomePageBlogList`,
                    data: {
                        sourceModule: this.info.entityId,
                        offset: this.pageNo,
                        limit: this.pageSize,
                        startTime:0,
                        isRefresh:1,
                        sourceId: this.info.dataId,
                    }
                }

                params.data.labelId = this.currLabeId;
                if (this.isSearching) {
                    params = {
                        url:  `${Config.serverConfig.engineService}/metaservice/meta_blog/getHomePageBlogList`,
                        data: {
                            sourceModule: this.info.entityId,
                            ignoreEcode: 1,
                            offset: this.pageNo,
                            limit: this.pageSize,
                            sourceId: this.info.dataId,
                            keyword: this.filterParams.keyword ? this.filterParams.keyword : '',
                            userId: this.filterParams.responsiblePersonId ? this.filterParams.responsiblePersonId : '',
                            startTime: this.filterParams.startTime ? this.filterParams.startTime : '',
                            endTime: this.filterParams.endTime ? this.filterParams.endTime : '',
                            labelId: this.filterParams.labelId ? this.filterParams.labelId : '',
                            orgId: this.filterParams.orgId ? this.filterParams.orgId : '',
                            sourceType: 2,//（1、分享动态，2、工作动态）
                            isRefresh:1
                        }
                    }
                    if(this.filterParams.labelId){
                        this.currLabeId = this.filterParams.labelId;
                    }
                }
                linkapi.get(params).then((result) => {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    if (result.code == 200) {
                        if (result.labelStyle != null && JSON.stringify(result.labelStyle) != "{}") {
                            this.labelStyle = result.labelStyle;
                        }
                        if (type == 1) {
                            let datas = result.data;
                            if (params.data.labelId == this.currLabeId) {
                                this.blogList = datas;
                                if (datas.length == 0) {
                                    this.isShowEmpty = true;
                                } else {
                                    this.isShowEmpty = false;
                                }
                            }
                            this.refreshIcon = "icon-checkbox-on";
                            this.refreshText = "刷新成功";
                            this.refreshing = false;
                        } else if (type == 2) {
                            this.showLoading = false;
                            const length = result.data.length;
                            if (length > 0) {
                                let datas = result.data
                                this.blogList = this.blogList.concat(datas)
                            } else {
                                this.refreshing = false;
                                this.showLoading = false;
                                this.loadingText = '没有更多数据了';
                                this.$toast('没有更多数据了');
                            }
                        }
                    } else {
                        this.refreshing = false;
                        this.showLoading = false;
                        this.$toast(result.message);
                    }
                }).catch((error)=> {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    this.refreshing = false;
                    this.showLoading = false;
                    //this.$toast("获取动态数据失败:" + Util.handleException(error));
                });
            },
            convertBlogData(blogData){//评论倒叙
                for (let i = 0; i < blogData.length; i++) {
                    blogData[i].commentList = blogData[i].commentList.reverse();
                }
                return blogData;
            },
            //refresh下拉放手后的文字与图标
            "onRefresh": function (e) {
                this.refreshText = "刷新中...";
                this.refreshing = true;
                this.pageNo = 1;
                this.initData(1);
                //this.$emit("refresh")
            },
            //refresh下拉放手前的文字与图标
            "onPullingdown": function (e) {
                //默认refresh文字与图标
                this.refreshIcon = "icon-todown";
                this.refreshText = "下拉可以刷新...";
                //下拉一定距离时文字与图标
                if (Math.abs(e.pullingDistance) > 60) {
                    this.refreshIcon = "icon-toup";
                    this.refreshText = "松开即可刷新...";
                }
            },
            "onLoading": function (e) {
                //  this.$toast("loading");
                if (!this.showLoading) {
                    this.showLoading = true;
                    this.loadingText = '加载更多数据...';
                    this.pageNo++;
                    this.initData(2)
                }
            },
            onReplyClick(blogItem, commentItem){
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!")
                    return;
                }
                this.placeholder = '回复' + commentItem.userName;
                this.replyCommentItem = commentItem;
                this.blogItem = blogItem;
                this.isShowComment = true;
            },
            requestData(val, labelId){
                if (this.currLabeId != labelId) {
                    this.blogList = []
                }
                factoryApi.startLoading(this);//显示加载圈
                //this.isShowLoading = true;
                this.currLabeId = labelId;
                //this.info = val;
                //this.info.
                this.getLoginInfo();
                this.initData(1);
            },
            searchBlogData(val){
                this.filterParams = val;
                this.pageNo = 1;
                this.blogList = [];
                this.isSearching = true;
                //this.isShowLoading = true;
                factoryApi.startLoading(this);//显示加载圈
                this.initData(1);
            },
            clearFilterData(){
                this.isSearching = false;
                this.onTabClick(0,this.tabItems[0]);//默认选择第一个tap
                //this.currLabeId = "";
                this.pageNo = 1;
                this.blogList = [];
                this.initData(1);
            },
            handleTime(time){
                return moment(time).utc().zone(-8).format('YYYY-MM-DD HH:mm');
            },
            getItemLabelStyle(item){
                if (item.labelList == undefined || item.labelList == null || this.labelStyle == null || this.labelStyle == undefined) {
                    return ''
                }
                if (item.labelList.length > 0) {
                    for (let label of item.labelList) {
                        let json = this.labelStyle[label.labelId];
                        if (!Util.isEmpty(json) && !Util.isEmpty(json.color)) {
                            return json
                        }
                    }
                }
                return ''
            },
            getAttachmentItemDefaultImage(type){
                let url = "";
                switch (type) {
                    case 3:
                        url = '/image/icon-diskFile.png';
                        break;
                    case 4:
                        url = '/image/icon-urlLink.png';
                        break;
                    case 5:
                        url = '/image/app_default.png';
                        break;
                    case 6:
                        url = '/image/app_default.png';
                        break;
                }
                return url;
            },
            onWriteMenuClick(){
                this.isShowWriteMenu=false
            },
            onCreateMenuItemClick(item){
                this.showUp = false;
                let target = item.settings.target;
                switch (target) {
                    case 'Milestone':
                        var params = {
                            activityId: this.info.dataId
                        };
                        var url = this.$getContextPath() + "/milestoneForm.weex.js";
                        this.$push(url, params);
                        break;
                    case 'Archive':
                        this.confirmArchive();
                        break;
                    case 'ExtendPublicNotice':
                        this.createBulletin();
                        break;
                }
            },
            add(){
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                if (this.createMenuList.length == 1) {
                    let target = this.createMenuList[0].settings.target;
                    switch (target) {
                        case 'Milestone':
                            var params = {
                                activityId: this.info.dataId
                            };
                            var url = this.$getContextPath() + "/milestoneForm.weex.js";
                            this.$push(url, params);
                            break;
                        case 'Archive':
                            this.confirmArchive();
                            break;
                        case 'ExtendPublicNotice':
                            this.createBulletin();
                            break;
                    }
                } else {
                    this.showUp = true;
                }
            },
            onWriteClick(){//打开撰写菜单
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.isShowWriteMenu = true;
                this.$nextTick(()=> {
                this.$forceUpdate();
                /*weex.requireModule('animation').transition(this.$refs.writeMenu, {
                        styles: {
                            opacity: 1
                        },
                        duration: 1000, //ms
                        timingFunction: 'ease',
                        needLayout: false,
                        delay: 0 //ms
                        }, ()=> {
                        })*/
                });

            },
            onWriteMenuClose(){//关闭撰写菜单
                this.isShowWriteMenu = false;
                this.$forceUpdate();
            },
            onWriteMenuItemClick(val){//撰写菜单item点击
                this.isShowWriteMenu = false;
                if (val === 'ExtendComment') {
                    this.publishBlog()
                } else if (val === 'ExtendQianDao') {
                    let params = {
                        appCode: 'crm',
                        appUrl: 'LinkOl/Modular/quick/quickForm.html',
                        data: {
                            parentId: this.info.dataId,
                            parentEntityName: this.info.entityId,
                            parentText: this.info.name,
                            quick: true,
                            closePage: true,
                            E: 'ExtendQianDao'
                        }
                    }
                    linkapi.runApp(params, null, null)
                } else {
                    var params = {};
                    var url = this.$getContextPath() + "/publishForm.weex.js";
                    params.entityName = val;
                    if (this.topicData != null) {
                        params.sourceId = this.topicData.sourceId;
                    }
                    params.info = JSON.stringify(this.info)
                    this.$push(url, params);
                }
            },
            getWriteMenuImage(entityName){
                let url = ""
                switch (entityName) {
                    case 'ExtendWorktask':
                        url = '/image/publish_task.png';
                        break;
                    case 'ExtendSchedule':
                        url = '/image/publish_schedule.png';
                        break;
                    case 'ExtendNotify':
                        url = '/image/publish_notify.png';
                        break;
                    case 'ExtendDocument':
                        url = '/image/publish_document.png';
                        break;
                    case 'ExtendQingShi':
                        url = '/image/publish_qingshi.png';
                        break;
                    case 'ExtendHuiBao':
                        url = '/image/publish_huibao.png';
                        break;
                    case 'ExtendQianDao':
                        url = '/image/publish_qiaodao.png';
                        break;
                    case 'ExtendComment':
                        url = '/image/publish_comment.png';
                        break;
                }
                return url;
            },
            getArchive(isQuit){//是否归档
                let params = {
                    url: Config.serverConfig.engineService + '/metaservice/meta_suite_data_setting/' + this.info.dataId,
                };
                linkapi.get(params).then((result) => {
                    if (result) {
                        this.isArchive = result.isArchive;
                    }
                }).catch((error)=> {
                });
            },
            openDropdown(event) {//更多下拉菜单
                this.showDropdown = true;
                this.$refs.dropdown.show(event);
            },
            tabTextStyle(index){//tab选中样式
                if (index == this.tabActive) {
                    return 'tab_title_text_checked';
                } else {
                    return 'tab_title_text';
                }
            },
            onTabClick(index, item, event){
                if (this.isArchive && !this.isAdmin) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.tabActive = index;
                if (index == 0) {
                    this.currLabeId = ''
                    this.requestData(this.info, this.currLabeId)
                } else if (index == 5) {
                    this.openDropdown(event);
                } else if(item.target=="filter"){
                    let _array = this.tools.filter(item => {
                        return item.createBlog;
                    });
                    let params = {
                        data: JSON.stringify(_array)
                    };
                    let url = this.$getContextPath() + "/filterBlog.weex.js";
                    this.$push(url, params);
                } else {
                    this.currLabeId = item.target;
                    this.requestData(this.info, this.currLabeId);
                }
            },
            filterClicked(){
                //直接执行筛选操作
                this.onTabClick(null,{
                    title: '高级筛选',
                    createBlog: true,
                    target: 'filter'
                });
            },
            getTopicInfo(){//用于发送动态的数据
                let params = {
                    url:`${Config.serverConfig.engineService}/metaservice/link_blog/${this.info.entityId}/${this.info.dataId}/topic`,
                    data: {
                    }
                };
                linkapi.get(params).then((result) => {
                    if (result) {
                        this.topicData = result;
                    } else {
                        this.$toast("获取topic数据失败：" + JSON.stringify(result));
                    }
                }).catch((error)=> {
                });
            },
            publishBlog(){//发送评论
                if (this.topicData == null) {
                    this.getTopicInfo();
                    return;
                }
                let labelIds = "";
                if (this.topicData.labels != null) {
                    labelIds = this.topicData.labels.join(",")
                }
                var params = {
                    blogScopeType: 5,
                    privateType: 3,
                    content: '',
                    labelIds: labelIds,
                    privateInstanceID: this.topicData.sourceId,
                    privateName: this.topicData.sourceName,
                    enableAtProjectMembers: true,
                    topicId:this.topicData.sourceId,
                    title:this.topicData.sourceName
                };
                let datas = Object.assign({}, this.topicData, params);
                linkapi.publishMicroblog(datas, result => {
                    this.initData(1);//更新列表数据
                }, (result) => {
                })
            },
            onMoreMenuClick(index){//tab更多菜单
                this.showDropdown = false;
                let _array = this.metaSuite.relations.filter(item => {
                            return item.createBlog;
            });
                if (index == this.tabMoreMenuList.length - 1) {
                    let params = {
                        data: JSON.stringify(_array)
                    };
                    let url = this.$getContextPath() + "/filterBlog.weex.js";
                    this.$push(url, params);
                } else {
                    this.currLabeId = this.tabMoreMenuList[index].target;
                    this.requestData(this.info, this.currLabeId)
                }
            },
            clearFilter(){
                this.isShowFilter = false;
                this.clearFilterData();
                storage.removeItem("filterParams");//删除记录的过滤条件
            },
            onViewAppear(){
                storage.getItem("filterParams", event => {//不为空时，则为筛选条件页面回来的
                        if (event.result == "success" && event.data != null && event.data != '') {
                        this.filterParams = JSON.parse(event.data);
                        this.isShowFilter = true;
                        this.searchBlogData(this.filterParams);
                    }
                });
                storage.getItem("blogRefreshList", event => {//
                    if (event.result == "success" && event.data != null && event.data != '') {
                        this.requestData(this.info, this.currLabeId);
                    }
                });
                storage.getItem("exit", event => {//
                    if (event.result == "success") {
                        this.$pop();
                    }
                });
            },
            handleWriteMenu(){
                let _array = this.tools//this.metaSuite.settings.tools;
                this.writeMenuList = _array.filter(item => {//过滤需要显示tab菜单的数据
                    return item.terminal == 2 || item.terminal == 3;
                });
                let commentItem = {
                    title: "评论",
                    target: "ExtendComment",
                    terminal: 2,
                    icon: "social-twitch-outline",
                    color: "rgb(238, 126, 115)"
                };
                this.writeMenuList.unshift(commentItem);//固定第一个菜单为评论
            },
            handleTabMenu(){//初始化tab菜单数据与更多菜单数据
                let val = this.tools//this.metaSuite.relations;
                //获取通用协作的过滤条件--------------------------------
                let _array = val.filter(item => {//过滤需要显示tab菜单的数据
                    return item.createBlog;
                });
                //固定第一个菜单为全部，最后一个菜单为高级选筛选
                _array.unshift({
                    title: '全部',
                    createBlog: true,
                    target: "all"
                });
                _array.push({
                    title: '高级筛选',
                    createBlog: true,
                    target: "filter"
                });
                let len = _array.length;
                this.tabItems = _array.splice(0, 5);
                if (len > 5) {//tab菜单数量超过5个则添加更多菜单，以下拉菜单方式展示剩余菜单数据
                    this.tabItems.push({title: '更多'});
                    this.tabMoreMenuList = _array.splice(0, _array.length);
                }
            },
            handleCreateMenu(){
                let _array = this.tools;
                this.createMenuList = _array.filter(item => {//过滤需要显示tab菜单的数据
                    return item.terminalType == 2 || item.terminalType == 3;
                });
                if (this.isAdmin) {//管理员才有归档权限
                    this.createMenuList.push({
                        title: '归档',
                        settings: {
                            target: "Archive",
                            title: "归档",
                        },
                    })
                }
            },
            getMetaEntity(fun){//获取实体信息
                let params = {
                    url: Config.serverConfig.engineService + '/metaservice/meta_entity/' + this.info.entityId,
                };
                linkapi.get(params).then((result) => {
                    factoryApi.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false;
                    if (result.id) {
                        if(fun){fun(result)}
                        this.metaSuite = result;
                        this.metaSuite.metaEntityName = result.name;//存储实体名称
                        this.metaSuite.relations = [];//用于动态过滤
                        this.metaSuite.settings= {tools:[]};//存快捷
                        this.getTopicInfo();
                        //this.handleTabMenu();
                        //this.handleWriteMenu();
                        //this.handleCreateMenu();
                    }
                }).catch((error)=> {
                    factoryApi.stopLoading(this);//关闭加载圈
                    //this.$toast("获取信息失败：" + Util.handleException(error))
                });
            },
            getAdminInfo(){
                let params = {
                    url: `${Config.serverConfig.engineService}/metaservice/judge_has_permissions/is_admin`,
                    data: {
                        entityId: this.info.entityId,
                        dataId: this.info.dataId,
                    }
                };
                linkapi.get(params).then((result)=> {
                    this.isAdmin = result;
                    this.getArchive(true);
                    //this.getMetaEntity();
                }, error=> {
                    //this.getMetaEntity();
                });
            },
            getTopMessage(){//置顶消息数据
                let params = {
                    url: Config.serverConfig.uamUrl + '/webTopMessage/list',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        entityName: this.info.entityId,
                        sourceId: this.info.dataId,
                    }
                };
                linkapi.get(params).then((data) => {
                    if (data.success) {
                    this.topMessageList = data.result;
//                        this.setRead();
                }
            }).catch((error)=> {
//                    this.$toast(Util.handleException(error))
                });
            },
            onTopMessageClick(item, index){//置顶消息点击事件处理
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.setRead(item.id);
                if (item.msgType == 0 || item.msgType == 1) {//@我或回复我消息,跳转到动态
                    let id = '';
                    if (!Util.isEmpty(item.srcBlogId)) {
                        id = item.srcBlogId;
                    } else {
                        id = item.dataId;
                    }
                    linkapi.openMicroblogDetail(id);
                } else if (item.msgType == 2) {//公告
                    this.openNoticeDetail(item);
                } else if (item.msgType == 3) {//申请加入主页,审批
                    this.applyId = item.dataId;
                    let name = item.dataJson.name
                    this.dialogContent = "您是否同意" + name + "申请加入成为该数据成员？";
                    this.buttonArray = [{type: 1, title: '拒绝'}, {type: 2, title: '同意'}];
                    this.dialogType = 1;
                    this.showDialog = true;
                }
                if (!item.isLingering || item.isLingering == "false") {
                    this.topMessageList.splice(index, 1);
                }
            },
            openNoticeDetail(item){
                if (!this.isAccessAuthority)return;
                let params = item.actionParams;
                if (!Util.isEmpty(params)) {
                    let _array = params.split("\n");
                    _array.splice(3, 0, "param=");
                    params = _array.join("\n");
                    link.launchLinkService([params], result=> {
                    }, error=> {
                    });
                }
            }

        },
        mounted(){
            let params =this.widgetParams,_t = this;//页面参
            if (params != null && !Util.isEmpty(params.dataId) && !Util.isEmpty(params.entityId)) {
                this.info.dataId = params.dataId;
                this.info.entityId = params.entityId;
                factoryApi.startLoading(this);//显示加载圈
                _t.getMetaEntity(function(){
                    _t.initData(1);
                    //_t.refreshData();
                })
                service.getHomePage(params.homePageId||this.$getPageParams().homePageId).then((res)=>{
                    //获取主页配置
                    //快捷操作
                    if(!res){res={"mpHomePageOprationList":[]}}
                    _.each(res.mpHomePageOprationList,(e,i)=>{
                        e.target = e.collaborationToolId;
                        e.title = e.name;
                        if(e.type==1){
                            e.terminalType = 2;
                        }else{
                            e.terminal = 2;
                            e.createBlog = true;//支持过滤
                        }//0:通用,1:快捷
                    });
                    _t.tools = res.mpHomePageOprationList;
                    _t.getAdminInfo();
                    _t.handleTabMenu();
                    _t.handleCreateMenu();
                    _t.handleWriteMenu();
                });
            } else {
                this.$toast("参数未传递");
                //this.$pop();
            }

            globalEvent.addEventListener("resume", e => {
                this.onViewAppear();
            });
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
            globalEvent.addEventListener("keyboardStatus", e => {
                if (e.status == 'show') {
                    this.isShowExpression = false;
                    this.isShowBottomMenu = false;
                } else if (e.status == 'hide' && !this.isShowExpression) {
                    this.isShowComment = false;
                    this.isShowBottomMenu = true;
                }
            });
            globalEvent.addEventListener("onBlogDetailCommentedCallback", e => {
                if (e) {
                    let commentId = JSON.parse(e.result).commentId;
                }
            });

        },
        created(){
            factoryApi.init(this);//初始化全局api的指向
        }
    }
</script>