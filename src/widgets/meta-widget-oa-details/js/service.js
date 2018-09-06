import ajax from '../../../js/ajax.js';
import buiweex from 'bui-weex';
import _ from '../../../js/tool/lodash';
const linkapi = require('linkapi');

const service={
    jzyXml(vue,data){
        //佳兆业企业oa-xml解析;
        let _t  = vue;
        vue.fields = [];vue.attachment = [];vue.trail = [];
        /*data+=`<gxatts><att><disname><![CDATA[合同1.doc]]></disname><url><![CDATA[https://www.bingolink.biz/uam/ui/download?filepath=/55530b6233c64201a8ce3c9e@278fa7f7,f701865f9f9e4b0$9a9a2eed30a8cabb9&diskId=f701865f9f9e4b0$9a9a2eed30a8cabb9&fileId=&name=商机_2017-12-01 17_34_05.xls]]></url></att><att><disname><![CDATA[合同2.doc]]></disname><url><![CDATA[https://www.bingolink.biz/uam/ui/download?filepath=/561ff@d662736454d9d654bf20e26ee1c,e1$a23641de184a13af4a6da446daa8dd&amp;diskId=e1$a23641de184a13af4a6da446daa8dd&amp;fileId=&amp;name=005(2).jpg]]></url></att></gxatts>`;*/
        if(data.indexOf("<type")!=-1) {
            _t.state = _t.liftOff(_t.getXmlTagNameContent(data, "type").join(""), "type");
        };//获取文档状态
        _.each(_t.getXmlTagNameContent(data,"field"),(field,index)=>{
            if(vue.hideFields.length&&vue.hideFields.indexOf(_t.liftOff(_t.getXmlTagNameContent(field, "disname").join(""),"disname"))!=-1)return;
            _t.fields.push({
                disname: _t.liftOff(_t.getXmlTagNameContent(field, "disname").join(""),"disname"),
                text:_t.liftOff(_t.getXmlTagNameContent(field,"text").join(""),"text")
            });//获取表单字段信息
        });
        _.each(_t.getXmlTagNameContent(data,"gxatts"),(gxatt,index)=>{
            _.each(_t.getXmlTagNameContent(gxatt,"att"),(att,index)=>{
                _t.attachment.push({
                    name: _t.liftOff(_t.getXmlTagNameContent(att, "disname").join(""),"disname"),
                    downloadUrl:_t.liftOff(_t.getXmlTagNameContent(att,"url").join(""),"url"),
                    download:true
                });
            });//获取表单附件字段信息
        });
        _.each(_t.getXmlTagNameContent(data,"gxoptions"),(gxatt,index)=>{
            _.each(_t.getXmlTagNameContent(gxatt,"gxoption"),(att,index)=>{
                if(!_t.getXmlTagNameContent(att, "para"))return true;
                let trail_data = {
                    name:_t.liftOff(_t.getXmlTagNameContent(att, "para").join(""),"para"),
                    content:[],
                    color:"#ccc",
                    textColor:"#ccc",
                    approvalTrailw:{},
                    dotStyle:{"background-color":"#DFDFDF"}
                }

                _.each(_t.getXmlTagNameContent(att,"content"),(content,index)=>{
                    let _name = _t.liftOff(_t.getXmlTagNameContent(content, "disname").join(""),"disname");
                    trail_data.content.push({
                        name:_name?_name.split(" ")[0]:"",
                        comm:_t.liftOff(_t.getXmlTagNameContent(content, "text").join(""),"text"),
                        time:_name?(_name.split(" ")[1]+" "+_name.split(" ")[2]):""
                    });//流程意见
                });
                _t.trail.push(trail_data);
            });//获取表单流程轨迹信息

            if(gxatt.indexOf("<option")==-1){
                //不存在选项集--对应当前用户无法处理
                _t.state = 2;
            }
        });
        if(_t.trail.length) {
            _t.trail.reverse();//数组执行下倒叙
            Object.assign(_t.trail[0], {
                select: true,
                color: "#5099F4",//高亮dot
                textColor: "#000",//高亮文字
                dotStyle: {"background-color": "#5099F4"}
            });
            _t.trail[(_t.trail.length - 1)].borderLeftWidth = {"border-left-width": 0};//不需要显示线条
        }else{
            _t.trail = [];
        }
    },
    myXml(vue,data){
        //明源結構處理
        data = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<HTML>
<HEAD>
    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8"/>
    <title>流程审批</title>
    <meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR">
    <meta content="Visual Basic .NET 7.1" name="CODE_LANGUAGE">
    <meta content="JavaScript" name="vs_defaultClientScript">
    <meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema">
    <LINK href="/_nav/menu.css" type="text/css" rel="stylesheet">
    <LINK href="/_common/styles/global.css" type="text/css" rel="stylesheet">
    <LINK href="/_forms/styles/form.css" type="text/css" rel="stylesheet">
    <LINK href="/_nav/tabs.css" type="text/css" rel="stylesheet">
    <LINK href="/_common/styles/select.css" type="text/css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/MyWorkflow/css/AttachMent_menu.css">
    <script language="javascript" src="/_common/scripts/global.js"></script>
    <script language="javascript" src="/_common/scripts/Details.js"></script>
    <script language="javascript" src="/_controls/settings.aspx"></script>
    <script language="javascript" src="/_controls/util/util.js"></script>
    <script language="javascript" src="/_controls/datetime/date.js"></script>
    <script language="javascript" src="/_controls/datetime/time.js"></script>
    <script language="javascript" src="/_controls/number/number.js"></script>
    <script language="javascript" src="/_controls/lookup/lookup.js"></script>
    <script language="javascript" src="/_controls/lookup/LookupDialogs.js"></script>
    <script language="javascript" src="/_nav/menu.js"></script>
    <script language="javascript" src="/_forms/FormBase.js"></script>
    <script language="javascript" src="/_common/scripts/Map.Extensions.js"></script>
    <script language="javascript" src="Workflow.js"></script>
    <script language="javascript" src="WF_CreateObject.js"></script>
    <script language="javascript" src="WF_ProcessHandle_Form.js"></script>
    <script language="javascript" src="SelectUsers.js"></script>
    <script language="javascript" src="ccSelect.js"></script>
    <!--<script language="javascript" src="/PubProject/js/PubProject_WF.js"></script>-->
    <script language="javascript" src="/_controls/upfile/UpFile.js"></script>
    <script language="javascript" src="WF_ProcessHandle_Document.js"></script>
    <script language="javascript" src="WF_AttachMent_menu.js"></script>
    <SCRIPT LANGUAGE=javascript FOR=oframe EVENT=NotifyCtrlReady>
        loadDoc();
    </SCRIPT>
    <style>
        span.tabOn{	filter: "";background-color: white;border-bottom: 1px solid white;padding-bottom: 5px;cursor: default;}
        div.left{float:left;clear:right;width:74%;height:100%;}
        div.center{float:left;clear:none;height:100%;}
        div.right{float:right;clear:left;width:25%;height:100%;}
        table{width:100%;height:100%;}
        iframe{OVERFLOW: auto; WIDTH: 100%; HEIGHT: 100%}
        a { text-decoration:none;}
        divArea{SCROLLBAR-FACE-COLOR:#d4ddef;SCROLLBAR-HIGHLIGHT-COLOR:#d4ddef;SCROLLBAR-SHADOW-COLOR:#d4ddef;	SCROLLBAR-3DLIGHT-COLOR:#d4ddef;SCROLLBAR-ARROW-COLOR:#3f6dad;SCROLLBAR-TRACK-COLOR:#f1f3f9;SCROLLBAR-DARKSHADOW-COLOR:#d4ddef;SCROLLBAR-BASE-COLOR:#000000;background-color:White;width:100%;height:100%;}
        .tipArrow
        {
            display:none;
            /*右边有颜色，其他透明*/
            border-color: #e00 transparent transparent #e00;
            border-style: solid;
            border-width: 16px 16px 16px 16px;
            padding: 0;
            width: 0;
            height: 0;
            /* ie6 height fix */
            font-size: 0;
            line-height: 0;
            /* ie6 transparent fix */
            _border-right-color: #dddddd;
            _border-bottom-color: #dddddd;
            _filter: chroma( color = #dddddd);
        }
        span.seltab{padding: 0; width:40px;text-align:center;background-image:url(images/seltab.gif);line-height:31px;cursor:hand;}
        span.seltabOn{padding: 0;width:40px;text-align:center;background-image:url(images/seltabon.gif);line-height:31px;color:White;cursor:hand;}
    </style>
    <script language="javascript">
        //在线帮助文件
        var _MyHelpfile = "/MyWorkflow/help/流程管理/我办理的流程/流程审批.htm";

        function setInterface(){
            sMode = $id("txtMode").value;
            $id("tab0_div").style.height = document.body.offsetHeight - $id("divMenu").offsetHeight;
            //RefleshFormWidth();
        }

        //控制文档/表单编辑区宽度
        function changeDivForm(){
            sDocType = appForm.DocumentType.getValue();
            if(sDocType == "1" || sDocType == "3"){
            }else{
                dyniframesize("appIframe_HtmlForm");
            }
        }

        //只有左右结构的流程才会用到此函数.
        function RefleshFormWidth() {
            dyniframe = $id("appIframe_HtmlForm");
            dyniframe = dyniframe == null ? $id("tab_0") : dyniframe;
            dyniframe.style.width = "100%"; //先让Iframe自适应，再设置它的宽度，解决Iframe无法出滚动条、无法根据窗口变大问题。
            setTimeout("dyniframesize(\"appIframe_HtmlForm\");", 1);
        }

        //重绘oframe控件大小
        function ResetOframeSize() {
            if (document.getElementById("oframe")) {
                if (document.getElementById("tab_0").style.width == "100%") {
                    document.getElementById("tab_0").style.width = "99%";
                }
                else {
                    document.getElementById("tab_0").style.width = "100%";
                }
            }
        }
        //加载第一个标签页
        function LoadFirtTab() {
            if ($id("tab_0").style.display != "none") return;
            loadTab('0');
            ResetOframeSize();
            setTimeout(ResetOframeSize, 1);
        }
    </script>
</HEAD>
<body onload="window_onload();" onunload="do_unload()">

<div id="divMenu" style="height:48px">
    <script type="text/javascript" language="javascript">(function(){var a = document.createElement('div');a.innerHTML = '<div id="__divLoadingappFormMenu" name="__divLoading" style="position:absolute;display:block;top:0px;left:0px;width:2000px;height:1000px;z-index:100;background-color:#CCCCCC;filter:Alpha(Opacity=60)"><table style="width:800px;height:600px"><tr><td style="vertical-align:middle" align="middle"><img alt="" src="/_imgs/progress.gif"><br/><div id="__divMessageappFormMenu" name="__divMessage">正在加载...</div></td></tr></table></div><iframe id="__ifrmLoadingappFormMenu" style="position:absolute;display:block;top:0px;left:0px;width:2000px;height:1000px;z-index:99;filter:Alpha(Opacity=0)"></iframe>';document.body.insertBefore(a.childNodes[1], document.body.firstChild);document.body.insertBefore(a.firstChild, document.body.firstChild);})();</script>
    <script type="text/javascript" language="javascript" src="/_nav/closeLoading.js" />
    <script type="text/javascript" language="javascript">
        window.__IsContainAppFormMenu = true;
    </script>
    <table cellspacing="0" cellpadding="0" class="mnubar"><tr><td width="9"><img src="/_imgs/mnu_vSpacer.gif" hspace="3"></td><td class="icMenu" noWrap><span  style="display:none"  _display="1"  _isDisplayed="0"  menu="__appFormMenu_m0"  tabIndex="0" class="menu">文件<table id="__appFormMenu_m0" class="mnuList" cellspacing="0" cellpadding="3"><COLGROUP><col class="mnuLeft"><col class="mnuItm"><col width="20" align="right"><tr  style="display:none"  _display="1"  _isDisplayed="0"  action="if (_iLocked<=0) {_lock();try{window.close()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  syslock="0"  _isshow="1"  act="if (_iLocked<=0) {_lock();try{window.close()} catch(e){showError(e);logException(e);	} finally{_unlock();}}"  tabIndex="0"><td></td><td noWrap colspan="2">关闭</td></tr></table></span><span  style="display:none"  _display="1"  _isDisplayed="0"  menu="__appFormMenu_m1"  tabIndex="0" class="menu">帮助<table id="__appFormMenu_m1" class="mnuList" cellspacing="0" cellpadding="3"><COLGROUP><col class="mnuLeft"><col class="mnuItm"><col width="20" align="right"><tr  style="display:none"  _display="1"  _isDisplayed="0"  action="if (_iLocked<=0) {_lock();try{window.document.fireEvent('onhelp');} catch(e){showError(e);logException(e);} finally{_unlock();}}"  syslock="0"  _isshow="1"  act="if (_iLocked<=0) {_lock();try{window.document.fireEvent('onhelp');} catch(e){showError(e);logException(e);	} finally{_unlock();}}"  tabIndex="0"><td></td><td noWrap colspan="2">帮助</td></tr></table></span></td></tr></table><table cellspacing="0" cellpadding="0" class="mnubar" style="height:26px; table-layout:fixed;"><tr><td width="9"><img src="/_imgs/mnu_vSpacer.gif" hspace="3"></td><td class="icMenu" noWrap><span  id="cSave"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{openWaiting();setTimeout(oprSave,10);} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{openWaiting();setTimeout(oprSave,10);} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="保存" ><img src="/images/workflow/Savef_16_blue.gif" class="mnuBtn"><span class="mnuBtn">保存</span></span><span  id="cWithdrawn"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprWithdrawn()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprWithdrawn()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="撤回" ><img src="/images/Cancel_16_blue.gif" class="mnuBtn"><span class="mnuBtn">撤回</span></span><span  id="cPrint"  style="display:none"  _display="1"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprPrint()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprPrint()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="打印" ><img src="/images/Print_16_blue.gif" class="mnuBtn"><span class="mnuBtn">打印</span></span><img  id="cLine1"  style="display:none"  _display="0"  _isDisplayed="0"  src="/_imgs/separator.gif"><span  id="cCollate"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprCollate()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprCollate()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="校稿" ><img src="images/collate.png" class="mnuBtn"><span class="mnuBtn">校稿</span></span><span  id="cUpdateBusinessData"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{UpdateBusinessData()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{UpdateBusinessData()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="修改业务数据" ><img src="images/ModifyData.gif" class="mnuBtn"><span class="mnuBtn">修改业务数据</span></span><span  id="cSD"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{sData()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{sData()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="同步表单" ><img src="images/synForm.gif" class="mnuBtn"><span class="mnuBtn">同步表单</span></span><img  id="cLine2"  style="display:none"  _display="0"  _isDisplayed="0"  src="/_imgs/separator.gif"><span  id="doc"  style="display:none"  _display="0"  _isDisplayed="0"  menu="__appFormMenu_mc8"  tabIndex="0" class="menu"><img src="/images/workflow/OpenDocument_16_blue.gif" class="mnuBtn"><span class="mnuBtn">打开文档</span><img src="/_nav/mnuDown.gif" class="mnuDown"><br><table id="__appFormMenu_mc8" class="mnuList" cellspacing="0" cellpadding="3"><COLGROUP><col class="mnuLeft"><col class="mnuItm"><col width="20" align="right"><tr  style="display:none"  _display="1"  _isDisplayed="0"  action="if (_iLocked<=0) {_lock();try{openDoc(0)} catch(e){showError(e);logException(e);} finally{_unlock();}}"  syslock="0"  _isshow="1"  act="if (_iLocked<=0) {_lock();try{openDoc(0)} catch(e){showError(e);logException(e);	} finally{_unlock();}}"  tabIndex="0"><td></td><td noWrap colspan="2">原稿</td></tr><tr  style="display:none"  _display="1"  _isDisplayed="0"  action="if (_iLocked<=0) {_lock();try{openDoc(1);if(_bCanFillDocument && appForm.LockUser.value==_UserGUID){oprCheckOut();}} catch(e){showError(e);logException(e);} finally{_unlock();}}"  syslock="0"  _isshow="1"  act="if (_iLocked<=0) {_lock();try{openDoc(1);if(_bCanFillDocument && appForm.LockUser.value==_UserGUID){oprCheckOut();}} catch(e){showError(e);logException(e);	} finally{_unlock();}}"  tabIndex="1"><td></td><td noWrap colspan="2">修改件</td></tr><tr  id="m0"  style="display:none"  _display="0"  _isDisplayed="0"  action="if (_iLocked<=0) {_lock();try{openDoc(2)} catch(e){showError(e);logException(e);} finally{_unlock();}}"  syslock="0"  _isshow="1"  act="if (_iLocked<=0) {_lock();try{openDoc(2)} catch(e){showError(e);logException(e);	} finally{_unlock();}}"  tabIndex="2"><td></td><td noWrap colspan="2">定稿件</td></tr></table></span><span  id="cPrintDoc"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{printDocContent(oFrame)} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{printDocContent(oFrame)} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="打印公文流程表单内容" ><img src="/images/Print_16_blue.gif" class="mnuBtn"><span class="mnuBtn">打印文档</span></span><span  id="cCheckOut"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprCheckOut();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprCheckOut();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="签出文档" ><img src="/images/workflow/checkout.gif" class="mnuBtn"><span class="mnuBtn">签出文档</span></span><span  id="cCheckIn"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprCheckIn();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprCheckIn();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="签出文档" ><img src="/images/workflow/checkin.gif" class="mnuBtn"><span class="mnuBtn">签入文档</span></span><span  id="cAddComment"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprAddComment();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprAddComment();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="批注文档" ><img src="/images/workflow/addcomment.gif" class="mnuBtn"><span class="mnuBtn">批注文档</span></span><span  id="cDelComment"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprDelComment();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprDelComment();} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/images/workflow/delcomment.gif" class="mnuBtn"><span class="mnuBtn">删除批注</span></span><span  id="cCreateFinalize"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprCreateFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprCreateFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/images/workflow/BuilddingDraft_16_blue.gif" class="mnuBtn"><span class="mnuBtn">生成定稿件</span></span><span  id="cDelFinalize"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprDelFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprDelFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/images/Del_16_blue.gif" class="mnuBtn"><span class="mnuBtn">取消定稿</span></span><span  id="cFinalize"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/images/workflow/Finalize_16_blue.gif" class="mnuBtn"><span class="mnuBtn">定稿</span></span><span  id="cCancelFinalize"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{oprCancelFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{oprCancelFinalize();} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/images/Cancel_16_blue.gif" class="mnuBtn"><span class="mnuBtn">取消</span></span><img  id="cLine3"  style="display:none"  _display="0"  _isDisplayed="0"  src="/_imgs/separator.gif"><span  id="cBusinessURL"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{openBusiness(1);} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{openBusiness(1);} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="业务模块" ><img src="/images/workflow/MapModel_16_blue.gif" class="mnuBtn"><span class="mnuBtn">业务模块</span></span><span  id="cReportURL"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{openBusiness(2);} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{openBusiness(2);} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="业务报表" ><img src="/images/workflow/ListModel_16_blue.gif" class="mnuBtn"><span class="mnuBtn">业务报表</span></span><img  id="cLine4"  style="display:none"  _display="0"  _isDisplayed="0"  src="/_imgs/separator.gif"><span  id="cHistory"  style="display:none"  _display="0"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{showHistory();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{showHistory();} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="历史流程" ><img src="/images/workflow/ListModel_16_blue.gif" class="mnuBtn"><span class="mnuBtn">历史流程</span></span><img  id="cLine5"  style="display:none"  _display="0"  _isDisplayed="0"  src="/_imgs/separator.gif"><span  id="cPrevious"  style="display:none"  _display="1"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{openNext(-1)} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{openNext(-1)} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/_imgs/ico/16_back.gif" class="mnuBtn"><span class="mnuBtn">上一条待办</span></span><span  id="cNext"  style="display:none"  _display="1"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{openNext(1)} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{openNext(1)} catch(e){showError(e);logException(e);} finally{_unlock();}}" ><img src="/_imgs/ico/16_forward.gif" class="mnuBtn"><span class="mnuBtn">下一条待办</span></span><img  id="cLine6"  style="display:none"  _display="1"  _isDisplayed="0"  src="/_imgs/separator.gif"><span  id="cClose"  style="display:none"  _display="1"  _isDisplayed="0"  syslock="0"  action="if (_iLocked<=0) {_lock();try{window.close()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  class="menu"  _isshow="1"  onclick="window.execScript(this.action);"  act="if (_iLocked<=0) {_lock();try{window.close()} catch(e){showError(e);logException(e);} finally{_unlock();}}"  title="关闭" ><img src="/images/Close_16_blue.gif" class="mnuBtn"><span class="mnuBtn">关闭</span></span><span  id="cNumber"  style="display:none"  _display="1"  _isDisplayed="0"  syslock="0"  action="undefined"  class="noactive"  _isshow="1" ><span class="mnuBtn"></span></span></td></tr></table><div style="BORDER-TOP:#969693 1px solid; BORDER-BOTTOM:#c2c2bf 1px solid"></div><script type="text/javascript" language="javascript">var __rMenu=["__htcMenu","menu.htc"];if(typeof window.__resourceListMenu=="undefined")window.__resourceListMenu=__rMenu;else window.__resourceListMenu=window.__resourceListMenu.concat(__rMenu);</script>

</div>

<div id="tab0_div" style="DISPLAY: inline;padding:4px;width:100%;height:100%;overflow-x:hidden;">
    <div id="tdDoc" class="left" onresize="RefleshFormWidth()">
        <table height="100%" cellspacing="0" cellpadding="0" width="100%">
            <tr>
                <td>
                    <table height="100%" cellSpacing="0" cellPadding="0" width="100%">
                        <tr id="Tr1" height="25">
                            <td>
                                <table cellspacing="0" cellpadding="0" class="tabBar" mode="noGlow">
                                    <tr>
                                        <td id="Td1" nowrap valign="bottom">
                                                <span id="Span1" tabID="tab_0" tabindex="0" class="tab tabOn" onclick="LoadFirtTab()">
                                                    业务信息 </span><span style="display:none;" id="Span4" tabID="tab_3" tabindex="0" class="tab" onclick="loadTab('3')">
                                                    附件及意见 </span><span id="Span2" tabID="tab_1" tabindex="1" class="tab" onclick="loadTab('1')">
                                                        审批流程 </span><span id="Span5" style="display:none" tabID="tab_5" tabindex="5" class="tab" onclick="loadTab('5')">
                                                相关流程 </span><span id="Span3" tabID="tab_2" tabindex="2" class="tab" onclick="loadTab('2')">
                                                            历史表单 </span>
                                        </td>
                                        <td></td>
                                    </tr>
                                </table>
                                <hr id="Hr1" class="tabGlow">
                                <hr id="Hr2" class="tabGlow">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div id="tab_0" class="tab" style="DISPLAY:inline;OVERFLOW:auto;SCROLLBAR-FACE-COLOR:#d4ddef;SCROLLBAR-HIGHLIGHT-COLOR:#d4ddef;SCROLLBAR-SHADOW-COLOR:#d4ddef;	SCROLLBAR-3DLIGHT-COLOR:#d4ddef;SCROLLBAR-ARROW-COLOR:#3f6dad;SCROLLBAR-TRACK-COLOR:#f1f3f9;SCROLLBAR-DARKSHADOW-COLOR:#d4ddef;SCROLLBAR-BASE-COLOR:#000000;background-color:White;position:absolute;padding:2px;width:100%">
                                    <div id="divLevel" class="tipArrow" title="紧急流程"></div><table id="tableForm" cellspacing="0" cellpadding="0" border="0" style="width:100%;height:100%;">
                                    <tr>
                                        <td valign="top">
                                            <iframe style="width: 100%;" scrolling="no" id="appIframe_HtmlForm" src="blank.htm"
                                                    frameborder="0"></iframe>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign="top"><div id="divReplyBiz" style="width: 100%;"></div></td>
                                    </tr>
                                </table>
                                </div>
                                <div id="tab_1" class="tab" style="padding:2px; ">
                                    <table height="100%" cellspacing="0" cellpadding="0" width="100%" border="0">
                                        <tr>
                                            <td valign="top">
                                                <iframe style="width: 100%; height: 100%" scrolling="no" id="tab1_div_if" src=""
                                                        frameborder="0"></iframe>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div id="tab_2" class="tab" style="padding:2px;">
                                    <table height="100%" cellspacing="0" cellpadding="0" width="100%" border="0">
                                        <tr>
                                            <td valign="top">
                                                <iframe style="width: 100%; height: 100%" scrolling="auto" id="tab2_div_if" src=""
                                                        frameborder="0"></iframe>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div id="tab_3" class="tab" style="padding:2px;width:100%;height:100%;overflow-y:auto;SCROLLBAR-FACE-COLOR:#d4ddef;SCROLLBAR-HIGHLIGHT-COLOR:#d4ddef;SCROLLBAR-SHADOW-COLOR:#d4ddef;SCROLLBAR-3DLIGHT-COLOR:#d4ddef;SCROLLBAR-ARROW-COLOR:#3f6dad;SCROLLBAR-TRACK-COLOR:#f1f3f9;SCROLLBAR-DARKSHADOW-COLOR:#d4ddef;SCROLLBAR-BASE-COLOR:#000000;">
                                    <table cellspacing="0" cellpadding="0" border="0" style="width:100%;height:100%;">
                                        <tr height="1px">
                                            <td valign="top"><div id="_divAttachMent" style="width: 100%;"></div><div id="divReplyOffice" style="width: 100%;"></div></td>
                                        </tr>
                                    </table>
                                </div>
                                <div id="tab_5" class="tab" style="padding:2px;">
                                    <table height="100%" cellspacing="0" cellpadding="0" width="100%" border="0">
                                        <tr>
                                            <td valign="top">
                                                <iframe style="width: 100%; height: 100%" scrolling="auto" id="tab5_div_if" src=""
                                                        frameborder="0"></iframe>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <!--提示框开始-->
                                <div id="divMsg" style="position:absolute;z-index:999;display:none;line-height:25px;background:url(images/bground.gif);padding:3px 8px 3px 8px;">
                                    <div style="text-align:left;width:100%;font-weight:bold;color:#15428b;">&nbsp;系统提示！</div>
                                    <div style="width:100%">
                                        <table style="table-layout:fixed;height:100%;font-size:9pt;width:100%">
                                            <tr>
                                                <td style="width:55px;" valign="middle" align="center"><img src="images/icon-question.gif" /></td>
                                                <td valign="middle">
                                                    <div style="height:60px;padding-top:16px;">&nbsp;&nbsp;&nbsp;&nbsp;业务数据发生变化，表单已自动同步，请确认是否要发起？</div>
                                                    <div style="text-align:center;">&nbsp;&nbsp;&nbsp;<button onclick="doOK()" type="button" >确 定</button>&nbsp;<button onclick="doCancel()" type="button" >取 消</button></div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                                <!--提示框结束-->
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <div id="tdSplit" class="center">
        <img id="imgSwitch" src="/_nav/imgs/nav0_hide_arrow_out.gif" style="CURSOR:hand;position: absolute;top:expression((this.parentElement.offsetHeight-this.offsetHeight)/2);" onclick="displayReply();">
    </div>

    <div id="divProperty" class="right">
        <table cellspacing="0" cellpadding="0" border="0" style="width:100%;height:100%;">
            <tr height="25">
                <td>
                    <table class="tabBar" cellSpacing="0" cellPadding="0" mode="noGlow">
                        <tr>
                            <td id="tabs" vAlign="bottom" noWrap>
                                <span class="tab" id="tab0" onclick="" tabIndex="0" tabID="tab_property">流程属性</span>
                            </td>
                        </tr>
                    </table>
                    <hr class="tabGlow" id="appForm_hrSelectedTab">
                    <hr class="tabGlow" id="appForm_hrGlowTab">
                </td>
            </tr>
            <tr>
                <td id="tab_iframes" vAlign="top">
                    <div class="tab" id="tab_property" style="background-color:white;PADDING-RIGHT: 3px; DISPLAY: inline; PADDING-LEFT: 3px; BORDER-LEFT-COLOR: #889dc2; BORDER-BOTTOM-COLOR: #889dc2; PADDING-BOTTOM: 3px; OVERFLOW: auto; BORDER-TOP-COLOR: #889dc2; PADDING-TOP: 3px; BORDER-RIGHT-COLOR: #889dc2">
                        <table id="tblProperty" width="100%" height="100%" cellpadding="0"
                               cellspacing="0">
                            <tr height="175px">
                                <td>
                                    <script type="text/javascript" language="javascript">
                                        window.__IsContainAppForm = true;
                                    </script>
                                    <table width="100%" height="100%" cellspacing="0" cellpadding="0"><form name="appForm" class="map2" ProcessType="xmlhttp" onbeforesave="try{oprBeforeSave()}catch(e){event.returnValue=false;showError(e);logException(e)}" onaftersave="oprAfterSave()"><input type="hidden" name="appForm_RootElem" value="v_myWorkflowRequest"><input type="hidden" name="appForm_KeyName" value="NodeGUID"><input type="hidden" name="appForm_AppName" value="Default"><tr><td valign="top"><div class="tab" id="appForm_tab0" style="display:inline;"><table width="100%" cellspacing="0" cellpadding="3" style="table-layout:fixed;" id="Section1"><col width="60"><col><input type="hidden" class="hid" name="ProcessGUID" value="fe5ae907-44af-e811-80fc-005056b036bb"><input type="hidden" class="hid" name="StepGUID" value="9806bd2c-44af-e811-80fc-005056b036bb"><input type="hidden" class="hid" name="StepPathGUID" value="dd06bd2c-44af-e811-80fc-005056b036bb"><input type="hidden" class="hid" name="NodeGUID" value="de06bd2c-44af-e811-80fc-005056b036bb"><input type="hidden" class="hid" name="HandleType" value="[审批]"><input type="hidden" class="hid" name="NodeStatus" value="2"><input type="hidden" class="hid" name="ProcessStatus" value="0"><input type="hidden" class="hid" name="ProcessModuleGUID" value="8642eaf5-7b5e-4d92-9de6-f113d16c714e"><input type="hidden" class="hid" name="IsHistory" value="0"><input type="hidden" class="hid" name="LockUser" value=""><input type="hidden" class="hid" name="LockUserName" value=""><input type="hidden" class="hid" name="CanUserModify" value="0"><input type="hidden" class="hid" name="StepType" value="1"><input type="hidden" class="hid" name="StepName" value="集团业务部门经理"><input type="hidden" class="hid" name="NodeType" value="0"><input type="hidden" class="hid" name="bExtend" value="0"><input type="hidden" class="hid" name="SysActiveDateTime" value="2018/9/3 14:40:07"><input type="hidden" class="hid" name="IsOnlyBookPrint" value="1"><input type="hidden" class="hid" name="IsSerial" value="1"><input type="hidden" class="hid" name="IsMulti" value="0"><input type="hidden" class="hid" name="DocumentType" value="0"><input type="hidden" class="hid" name="IsInitMemberAssign" value="0"><input type="hidden" class="hid" name="CanDocNumber" value="0"><input type="hidden" class="hid" name="CanDocComment" value="1"><input type="hidden" class="hid" name="CanDocModify" value="1"><input type="hidden" class="hid" name="CanDocFinalize" value="1"><input type="hidden" class="hid" name="CanCancel" value="0"><input type="hidden" class="hid" name="CanClose" value="0"><input type="hidden" class="hid" name="CanRollBack" value="1"><input type="hidden" class="hid" name="CanAssign" value="1"><input type="hidden" class="hid" name="ThreshodeValue" value="1"><input type="hidden" class="hid" name="D_Original" value="ff5ae907-44af-e811-80fc-005056b036bb"><input type="hidden" class="hid" name="D_Discuss" value=""><input type="hidden" class="hid" name="D_Finalize" value=""><input type="hidden" class="hid" name="BT_DomainXML" value="&lt;?xml version=&quot;1.0&quot;?&gt;
&lt;BusinessType businessAssembly=&quot;Mysoft.Cbgl.Business&quot; businessClassName=&quot;CbHTFkSP_HTML&quot; BusinessGUID=&quot;e85ae907-44af-e811-80fc-005056b036bb&quot;&gt;&lt;Item&gt;&lt;Domain name=&quot;公司GUID&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;11b11db4-e907-4f1f-8835-b9daab6e1f23&lt;/Domain&gt;&lt;Domain name=&quot;申请项目名称&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;申请公司名称&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;佳兆业集团控股&lt;/Domain&gt;&lt;Domain name=&quot;项目GUID&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;999999&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;00000000-0000-0000-0000-000000000000&lt;/Domain&gt;&lt;Domain name=&quot;申请主题&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;佳兆业集团工商管理平台项目开发合同第1笔付款&lt;/Domain&gt;&lt;Domain name=&quot;申请编号&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;zb-2018-09-03-0266&lt;/Domain&gt;&lt;Domain name=&quot;申请日期&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;8&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;2018-9-3&lt;/Domain&gt;&lt;Domain name=&quot;合同编号&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;200&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[JT-QTHT-2017-159]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;合同名称&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;80&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[佳兆业集团工商管理平台项目开发合同]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;合同类型&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;80&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;合同有效签约金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;95,000.00&lt;/Domain&gt;&lt;Domain name=&quot;合同有效签约金额（大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;玖万伍仟元整&lt;/Domain&gt;&lt;Domain name=&quot;所属项目&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;款项类型&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;80&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[行政类]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;款项名称&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;80&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[行政类]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;付款单位&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[今盛工程管理咨询（深圳）有限公司]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;申请类型&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;80&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;/&gt;&lt;Domain name=&quot;收款单位&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;广州睿策信息科技有限公司&lt;/Domain&gt;&lt;Domain name=&quot;申请金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;10.00&lt;/Domain&gt;&lt;Domain name=&quot;申请金额(￥)&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[10.00]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;审定金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[10.00]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;代付代扣&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;本次应付金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;10.00&lt;/Domain&gt;&lt;Domain name=&quot;本次实际需支付金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;10.00&lt;/Domain&gt;&lt;Domain name=&quot;本次扣回金额合计&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;已申请未支付&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;本次应付金额（大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;壹拾元整&lt;/Domain&gt;&lt;Domain name=&quot;开户银行&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;广州银行芳草支行&lt;/Domain&gt;&lt;Domain name=&quot;银行帐号&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;800236535602017&lt;/Domain&gt;&lt;Domain name=&quot;合同签约总价&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;95,000.00&lt;/Domain&gt;&lt;Domain name=&quot;保修金&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;累计已付金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[0.00]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;累计已付款（大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;零&lt;/Domain&gt;&lt;Domain name=&quot;累计已付比例&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;应付未付金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;累计未付金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;95,000.00&lt;/Domain&gt;&lt;Domain name=&quot;申请人&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;20&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[潘晓松]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;申请部门&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[集团控股网络信息部]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;冲账金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;结算金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;累计应付进度款&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;累计应付进度款（大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;零&lt;/Domain&gt;&lt;Domain name=&quot;累计已申请金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;累计申请付款金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;本次应付参考金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;95,000.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本合同计划付款金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本合同审批金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本合同已申请金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本合同可用金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本人计划付款金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本人审批金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本人已申请金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本人可用金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本部门计划付款金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本部门审批金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本部门已申请金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;当月本部门可用金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;付款说明&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;最小规划余量&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0&lt;/Domain&gt;&lt;Domain name=&quot;合同类别&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[综合类_深圳]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;合同金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;95,000.00&lt;/Domain&gt;&lt;Domain name=&quot;合同总金额（审批表单）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;95,000.00&lt;/Domain&gt;&lt;Domain name=&quot;合同总金额（审批表单大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;玖万伍仟元整&lt;/Domain&gt;&lt;Domain name=&quot;合同总金额&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[95000.00]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;合同总金额（大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;12&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;玖万伍仟元整&lt;/Domain&gt;&lt;Domain name=&quot;申请金额(￥大写)&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;![CDATA[壹拾元整]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;申请金额（大写）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;壹拾元整&lt;/Domain&gt;&lt;Domain name=&quot;分摊科目（金额）&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;8000&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;本期付款后尚欠_录入(￥)&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0.00&lt;/Domain&gt;&lt;Domain name=&quot;本期付款后尚欠_录入(￥大写)&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;零&lt;/Domain&gt;&lt;Domain name=&quot;本期付款后尚欠(￥)&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;94,990.00&lt;/Domain&gt;&lt;Domain name=&quot;本期付款后尚欠(￥大写)&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;玖万肆仟玖佰玖拾元整&lt;/Domain&gt;&lt;!--隐藏域--&gt;&lt;Domain name=&quot;收款人&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;联系电话&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;收款银行&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;银行分行&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;收款账号1&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;收款账号2&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;&lt;/Domain&gt;&lt;!--隐藏 域--&gt;&lt;Domain name=&quot;付款申请GUID&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;8&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;e85ae907-44af-e811-80fc-005056b036bb&lt;/Domain&gt;&lt;Domain name=&quot;合约规划使用明细数量&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0&lt;/Domain&gt;&lt;Domain name=&quot;中间科目使用明细数量&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0&lt;/Domain&gt;&lt;Domain name=&quot;部门费用使用明细数量&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0&lt;/Domain&gt;&lt;Domain name=&quot;合约规划列表比较域&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;300&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;371857150&lt;/Domain&gt;&lt;Domain name=&quot;中间科目列表比较域&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;300&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;371857150&lt;/Domain&gt;&lt;Domain name=&quot;部门费用列表比较域&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;300&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;371857150&lt;/Domain&gt;&lt;Domain name=&quot;代付代扣列表比较域&quot; isupdate=&quot;0&quot; isnull=&quot;0&quot; type=&quot;varchar&quot; len=&quot;300&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;371857150&lt;/Domain&gt;&lt;Domain name=&quot;是否特殊审批流程&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;100&quot; displaytype=&quot;hidden&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;&gt;0&lt;/Domain&gt;&lt;!-- 仅用于选择，指定审批时可修改的业务域 --&gt;&lt;Domain name=&quot;相关文档&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;/&gt;&lt;Domain name=&quot;合约规划&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;/&gt;&lt;Domain name=&quot;中间科目&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; isapprovemodify=&quot;1&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot;/&gt;&lt;Group name=&quot;合约规划列表&quot; RowCount=&quot;0&quot;&gt;&lt;Item&gt;&lt;Domain name=&quot;合约规划名称&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;科目名称&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;项目名称&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;合约规划金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;对应金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;生效后规划余量&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;/Item&gt;&lt;/Group&gt;&lt;Group name=&quot;中间科目列表&quot; RowCount=&quot;0&quot;&gt;&lt;Item&gt;&lt;Domain name=&quot;公司名称&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;中间科目名称&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;400&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;中间科目对应金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;/Item&gt;&lt;/Group&gt;&lt;Group name=&quot;部门费用列表&quot; RowCount=&quot;0&quot;&gt;&lt;Item&gt;&lt;Domain name=&quot;责任人&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;20&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;责任部门&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;50&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;部门费用科目名称&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;事项&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;40&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;部门费用对应金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;/Item&gt;&lt;/Group&gt;&lt;Group name=&quot;代付代扣列表&quot; RowCount=&quot;0&quot;&gt;&lt;Item&gt;&lt;Domain name=&quot;类型&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;20&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;总代扣代付金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;累计已扣回&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;本次扣回金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;剩余未扣回金额&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;money&quot; len=&quot;8&quot; displaytype=&quot;number&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;Domain name=&quot;未扣回说明&quot; isupdate=&quot;0&quot; isnull=&quot;1&quot; type=&quot;varchar&quot; len=&quot;20&quot; displaytype=&quot;text&quot; dropdownoptions=&quot;&quot; default=&quot;&quot; isuser=&quot;0&quot; businessdynamic=&quot;1&quot;&gt;&lt;/Domain&gt;&lt;/Item&gt;&lt;/Group&gt;&lt;Domain name=&quot;年度预算&quot; isupdate=&quot;0&quot; len=&quot;&quot; displaytype=&quot;select&quot; dropdownoptions=&quot;2016,2016|2017,2017|2018,2018|2019,2019|2020,2020&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[2018]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;款项分类&quot; isupdate=&quot;0&quot; len=&quot;&quot; displaytype=&quot;select&quot; dropdownoptions=&quot;01,行政类|02,人力类|03,品牌类&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[01]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;收款单位全称（必填）&quot; isupdate=&quot;0&quot; len=&quot;200&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[测试公司]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;开户银行（必填）&quot; isupdate=&quot;0&quot; len=&quot;200&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[中国银行]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;银行账号（必填）&quot; isupdate=&quot;0&quot; len=&quot;200&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[11]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;联系人电话（必填）&quot; isupdate=&quot;0&quot; len=&quot;200&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[11]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团业务部门意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[
潘晓松发起，意见：发起 2018-09-03 14:40]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团投资成本部门意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团业务分管高管意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团财务部门意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团财务分管高管意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团资金职能部门意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;集团资金分管高管意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;Domain name=&quot;主席意见&quot; isupdate=&quot;0&quot; len=&quot;2000&quot; displaytype=&quot;textarea&quot; dropdownoptions=&quot;&quot; isuser=&quot;1&quot; type=&quot;text&quot;&gt;&lt;![CDATA[]]&gt;&lt;/Domain&gt;&lt;/Item&gt;&lt;/BusinessType&gt;
"><input type="hidden" class="hid" name="BusinessGUID" value="e85ae907-44af-e811-80fc-005056b036bb"><input type="hidden" class="hid" name="BusinessTypeGUID" value="0b56e258-60a8-e111-a90a-00155d0ab806"><input type="hidden" class="hid" name="BusinessType" value="付款申请审批"><input type="hidden" class="hid" name="BusinessURL" value="javascript:openBusinessCB([oid],&quot;付款申请审批&quot;)"><input type="hidden" class="hid" name="ModifyURL" value="javascript:updateBusinessCB([oid],&quot;付款申请审批&quot;)"><input type="hidden" class="hid" name="ReportURL" value=""><input type="hidden" class="hid" name="ApproveModifyURL" value="javascript:updateBusinessApproveCB([oid],&quot;付款申请审批&quot;)"><input type="hidden" class="hid" name="BusinessScript" value="/Cbgl/Workflow/Cbgl_WF.js"><input type="hidden" class="hid" name="CanDataSave" value="1"><input type="hidden" class="hid" name="ExtendFormUrl" value=""><input type="hidden" class="hid" name="DispBusinessDomain" value=""><input type="hidden" class="hid" name="EditBusinessDomain" value=""><input type="hidden" class="hid" name="CanSameAuditorOverpass" value="1"><input type="hidden" class="hid" name="ModifyBusinessDataDomain" value=""><input type="hidden" class="hid" name="ApproveAttention" value=""><input type="hidden" class="hid" name="CanTransfer" value="1"><input type="hidden" class="hid" name="CanViewRelatedProcess" value="0"><input type="hidden" class="hid" name="CanDownLoadWord" value="0"><input type="hidden" class="hid" name="Transferor" value=""><input type="hidden" class="hid" name="OprType" value=""><input type="hidden" class="hid" name="Auditor" value="4431f37e-27af-e311-a9ca-005056b04a97"><input type="hidden" class="hid" name="ProcessCompareDomain" value="公司GUID,申请项目名称,申请公司名称,项目GUID,申请主题,申请编号,申请日期,合同编号,合同名称,合同类型,合同有效签约金额,合同有效签约金额（大写）,所属项目,款项类型,款项名称,付款单位,申请类型,收款单位,申请金额,申请金额(￥),审定金额,代付代扣,本次应付金额,本次应付金额（大写）,开户银行,银行帐号,合同签约总价,保修金,累计已付金额,累计已付款（大写）,累计已付比例,应付未付金额,累计未付金额,申请人,申请部门,冲账金额,结算金额,累计应付进度款,累计应付进度款（大写）,累计已申请金额,累计申请付款金额,本次应付参考金额,当月本合同计划付款金额,当月本合同审批金额,当月本合同已申请金额,当月本合同可用金额,当月本人计划付款金额,当月本人审批金额,当月本人已申请金额,当月本人可用金额,当月本部门计划付款金额,当月本部门审批金额,当月本部门已申请金额,当月本部门可用金额,付款说明,最小规划余量,合同类别,合同金额,合同总金额（审批表单）,合同总金额,申请金额(￥大写),申请金额（大写）,分摊科目（金额）,收款人,联系电话,收款银行,银行分行,收款账号1,收款账号2,付款申请GUID,合约规划使用明细数量,中间科目使用明细数量,部门费用使用明细数量,合约规划列表比较域,中间科目列表比较域,部门费用列表比较域,相关文档,合约规划,中间科目"><input type="hidden" class="hid" name="NodeNum" value="1"><input type="hidden" class="hid" name="PassValue" value=""><input type="hidden" class="hid" name="HandleText" value=""><input type="hidden" class="hid" name="StationName" value=""><input type="hidden" class="hid" name="StationGUID" value=""><input type="hidden" class="hid" name="BUGUID" value="11b11db4-e907-4f1f-8835-b9daab6e1f23"><input type="hidden" class="hid" name="Owner" value="4431f37e-27af-e311-a9ca-005056b04a97"><input type="hidden" class="hid" name="IsPathAgain" value=""><input type="hidden" class="hid" name="NextStepGUID" value=""><input type="hidden" class="hid" name="IsCollate" value=""><input type="hidden" class="hid" name="IdeapType" value="0"><input type="hidden" class="hid" name="IdeapBusinessDomain" value="集团业务部门意见"><input type="hidden" class="hid" name="IsAutoSave" value="0"><tr><td class="req">标题</td><td height="30px"><input type="text" class="txt" readOnly name="ProcessName" value="佳兆业集团工商管理平台项目开发合同-付款申请-2252" maxlength="200" forbiddenChars="" req="1"></td></tr><tr><td class="req">紧急程度</td><td height="30px"><table cellpadding="0" cellspacing="0"><tr><td><input type="radio" class="rad2" id="appForm_ProcessLevel0" name="appForm_ProcessLevel" value="1" disabled></td><td class="radioLabel"><label for="appForm_ProcessLevel0">紧急</label></td><td><input type="radio" class="rad2" id="appForm_ProcessLevel1" name="appForm_ProcessLevel" value="0" disabled></td><td class="radioLabel"><label for="appForm_ProcessLevel1">普通</label></td></tr></table><input class="rad3" type="hidden" name="ProcessLevel" value="0" readOnly req="1"></td></tr><tr><td class="req">编号</td><td height="30px"><input type="text" class="txt" readOnly name="ProcessNo" value="佳兆业集团工商管理平台项目开发合同-付款申请-2252" maxlength="200" forbiddenChars="" req="1"></td></tr><tr><td>发起人</td><td height="30px"><input type="text" class="txt" readOnly name="OwnerName" value="潘晓松"></td></tr><tr><td>监控人</td><td height="30px"><input type="text" class="txt" readOnly name="WatchMembersName" value="余学坪;裴安南"></td></tr><tr><td height="30px" colspan="2"><span style="width:60px">流程指引</span><label id="labDoc" ></label></td></tr><tr height="10"><td></td></tr></table></div></td></tr></form><form name="appForm_FormSubmit" method="post"><input type="hidden" name="mode" value="2"><input type="hidden" name="oid" value="de06bd2c-44af-e811-80fc-005056b036bb"><input type="hidden" name="mapFormSubmitXml"><input type="hidden" name="mapFormSubmitMode"><input type="hidden" name="mapFormSubmitId" value="de06bd2c-44af-e811-80fc-005056b036bb"><input type="hidden" name="mapFormSubmitParam" value=""></form></table><script type="text/javascript" language="javascript">var __rForm=["__jsGlobal","Global.js","__jsUtil","Util.js","__htcForm","表单控件HTC","__htcText","文本框控件HTC","__htcRadio1","单选控件HTC","__htcRadio2","单选控件HTC"];if(typeof window.__resourceListForm=="undefined")window.__resourceListForm=__rForm;else window.__resourceListForm=window.__resourceListForm.concat(__rForm);</script>

                                </td>
                            </tr>
                            <tr>
                                <td valign="top">
                                    <table id="divStation" style="BORDER: #889dc2 1px solid;WIDTH:100%;HEIGHT:100%;" cellspacing="0" cellpadding="0" border="0">
                                        <colgroup><col width="60px;" /><col /></colgroup>
                                        <tr id="trAppMenu" style="height:5px;">
                                            <td valign="top" colspan ="2">
                                                <table border="0" cellspacing="0" style="height:100%;width: 100%;background-color: #7288AC;border: #abc0e7 1px solid;border-right: #00377a 1px solid;border-bottom: #00377a 1px solid;">
                                                    <tr><td></td></tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td id="btnOperations" colspan="2" height="31px" style="filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=#ffffff,EndColorStr=#cecfde);"></td>
                                        </tr>

                                        <tr height="30px" id="trStation">
                                            <td class="req" style="padding-left:3px" align="left">岗  位</td>
                                            <td align="left" style="padding-right:3px" >
			                                            <span id="Station" name='Station' onblur="setValueToStation(this)" class="selectBox" typename="mapType" req="1" readOnly ro="0" value="">
											                <table id="_StationGUID_Table" cellspacing="0" cellpadding="2"style="display: none;">
                                                                <tr height="18">
                                                                    <td nowrap val="">
                                                                    </td>
                                                                </tr>
                                                            </table>
										                </span>
                                            </td>
                                        </tr>
                                        <tr height="20px">
                                            <td style="padding:0 3px 0 3px" align="left" colspan="2"  >
		                                            <span style="float:left;"><span id="handleTitle" style="position:relative;color:#990000; font-weight:bold;">处理意见</span>
		                                            <img id="_ApproveAttention" style="position:relative;display:none;border:0px;cursor:hand;vertical-align:middle;" src="images/help.gif" width="16" height="16" border="0"/>
		                                            </span><span id="_CommonOpinion" title="选择常用意见" style="position:relative;cursor:hand;float:right;" onclick="setCommonOpinion(this);" > 选择常用意见
		                                            <img style="border:0px;vertical-align:middle;" onmousemove="this.src='images/select1.gif'" onmouseout="this.src='images/select.gif'" src="images/select.gif" border="0"/></span>
                                            </td>
                                            </td>
                                        </tr>
                                        <tr height="200px">
                                            <td valign="top" align="left" colspan="2" style="padding:0 3px 0 3px">
                                                <textarea id="txtHandleText" style="HEIGHT:98%;word-break:break-all;" maxlength="1000"></textarea>
                                            </td>
                                        </tr>
                                        <tr id="trTransferor" style="display:none"  height="20px">
                                            <td class="req" style="padding-left:3px" align="left">交办给</td>
                                            <td style="padding-right:3px" >
                                                <table id="tbtrTransferor" style="TABLE-LAYOUT: fixed" cellSpacing="0" cellPadding="0" width="100%">
                                                    <COLGROUP>
                                                        <col>
                                                        <col width="28">
                                                    </COLGROUP>
                                                    <tr>
                                                        <td>
                                                            <input id="txtTransferorUserName" readonly="True" />
                                                            <input id="txtTransferorUserGUID" style="DISPLAY: none"/></td>
                                                        <td style="PADDING-LEFT: 6px" id="td3"><IMG class="lookup" id="img1" onclick="OpenSelectMultiUser(this)" src="../../_imgs/btn_off_lookup.gif" align="absMiddle" valueid="txtTransferorUserGUID" textid="txtTransferorUserName" ismultiselect="false" isallowsort="false">
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr height="20px" id="trCC" style="display:none" >
                                            <td style="padding-left:3px" align="left">抄送</td>
                                            <td style="padding-right:3px" >
                                                <table id="tbCC" style="TABLE-LAYOUT: fixed" cellSpacing="0" cellPadding="0" width="100%">
                                                    <COLGROUP>
                                                        <col>
                                                        <col width="55">
                                                    </COLGROUP>
                                                    <tr>
                                                        <td id="tdCCUser">
                                                            <input id="txtCCUserName" readonly="True" />
                                                            <input id="txtCCUserGUID" style="DISPLAY: none"/></td>
                                                        <td style="PADDING-LEFT: 6px" id="tdCCUser2"><img id="imgCCSelect" style="cursor:hand;" src="images/select.gif" align="absMiddle" onmousemove="this.src='images/select1.gif'" onmouseout="this.src='images/select.gif'" onclick="showAuditorType(this)" />
                                                            <IMG class="lookup" id="imgCC2" onclick="OpenSelectMultiUser(this)" src="../../_imgs/btn_off_lookup.gif" align="absMiddle" valueid="txtCCUserGUID" textid="txtCCUserName" ismultiselect="true" isallowsort="false">

                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr height="10px">
                                            <td></td><td></td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="top" colspan="2" id="tdButton"></td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" >
                                                <div id="divAttachMent" style="width: 100%;"></div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>
<div id="divApproveAttention" style="position:absolute;padding:5px 5px;background:#FFFFC2;font:12px courier;border:#5099DC solid 1px;width: 300px;display:none;" onmouseover="this.style.display='block';" onmouseout="this.style.display='none';$id('txtHandleText').focus();"></div>

<!-- 这里用来定义需要显示的流程附件右键菜单 -->
<div id='menu' class='skin1'>
    <div class='menuitems' action='select'>查看</div>
    <div class='menuitems' action='download'>下载</div>
    <div class='menuitems' action='checkOut'>签出编辑</div>
    <div class='menuitems' action='checkIn'>签入</div>
    <div class='menuitems' action='rename'>重命名</div>
    <div class='menuitems' action='del'>删除</div>
    <div class='menuitems' action='attribute'><span style='float: left'>属性 </span><span style='float: right; vertical-align: middle;'><img id='imgA' src='images/nav0_arrow_right.gif' /></span></div>
</div>
<div id="divAttribute" style="display:none;position: absolute;width:180px;height:75px">
    <table border="0" bgcolor="#FFFFFF" style="font-size: 12px;border: 1 solid black;" cellspacing="0">
        <tr>
            <td>修改人：</td>
            <td></td>
        </tr>
        <tr>
            <td nowrap>修改时间：</td>
            <td></td>
        </tr>
        <tr>
            <td>创建人：</td>
            <td></td>
        </tr>
        <tr>
            <td>创建时间：</td>
            <td></td>
        </tr>
    </table>
</div>
<!-- 右键菜单结束-->
<input id="inputHtmlForm" type="hidden" />
<form name="WFForm" method="post" action="WF_ProcessHandle_Form_lr.aspx?mode=2&amp;oid=de06bd2c-44af-e811-80fc-005056b036bb" id="WFForm">
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUKMTk0MTIwNTYyM2Rkt0q5uI8nBSbVlCxDeqtbcay+B14=" />

    <input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="97E69317" />
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEWBAKn6fWsAQKH1Iu/CgLV5P+0CwKek8uHAStuHZdUndnuiCO4IErXs7yUe0De" />
    <input id="txtMode" value='2' style="DISPLAY:none"/>
    <input name="txtStepSpStatus" type="hidden" id="txtStepSpStatus" />
    <input name="txtNextStepType" type="hidden" id="txtNextStepType" />
    <input name="txtUserGUID" type="hidden" id="txtUserGUID" value="4431f37e-27af-e311-a9ca-005056b04a97" />

    <Script language="Javascript"> var _hasHistory = 0; var _maskHtml = "<input type='checkbox' id='sendMail'  disabled ><label for='sendMail'>发邮件</label>&nbsp;<input type='checkbox' id='sendSMS'  disabled ><label for='sendSMS'>发短信</label>"; var _GUID = "a60cd23e-52af-e811-80fc-005056b036bb"; var _UserName="潘晓松";var _UserCode="panxiaosong"; var _UserGUID ="4431f37e-27af-e311-a9ca-005056b04a97";</Script></form>
</body>
<script language="javascript">
    //去掉“流程属性”appForm的边框和边距
    $id("appForm_tab0").style.padding = "0px";
    $id("appForm_tab0").style.border = "0px";
    $id("appForm_tab0").style.backgroundColor = "white";
    $id("tblProperty").style.display = "inline";

    if ($id("txtMode").value == "3")
    {
        if ($id("divProperty")) $id("divProperty").style.display="none";
        if ($id("divStation")) $id("divStation").style.display="none";
        $id("tdDoc").style.width="99%";
    }

    setInterface();
</script>

</HTML>
<script language="javascript">
    var iLeft = (document.body.clientWidth-200)/2;
    var iTop = (document.body.clientHeight-47)/2;
    document.writeln("<div id='__divRuning' style='POSITION: absolute; Z-INDEX: 108; Left:"+iLeft.toString()+"px; top:"+iTop.toString() + "px; width:223px; height:47px; BACKGROUND-COLOR: white; border:#9E9E9B 1px solid; font:bold 14px; color:#FF5A00; text-align:center; padding-top:16px; DISPLAY:none;'>处理中，请稍候...</div>");
    document.writeln("<input id='___MYSESSIONSTATE' value='04bfc401-4faf-e811-80fc-005056b036bb' style='display:none;'>");
    document.writeln("<input type=\"hidden\" id=\"__mode\" name=\"__mode\" value=\"2\">");
    document.writeln("<input type=\"hidden\" id=\"__oid\" name=\"__oid\" value=\"de06bd2c-44af-e811-80fc-005056b036bb\">");
    var __pageLoaded = true;
</script>
`;//先静态写入获取回来的html--方便解析
        let _inputs = data.match(new RegExp(`<input(.(?!<input))+>`, "ig")),ProcessGUID,BusinessGUID,___MYSESSIONSTATE,_t  = vue;//定义结构需要用到的参数
        vue.fields = [];vue.attachment = [];vue.trail = [];

        _.each(_inputs,(input,index)=>{
            if(input.indexOf("ProcessGUID")!=-1){
                ProcessGUID = vue.getXmlAttr(input,"input","value")[1]
            }else if(input.indexOf("BusinessGUID")!=-1){
                BusinessGUID = vue.getXmlAttr(input,"input","value")[1]
            }else if(input.indexOf("___MYSESSIONSTATE")!=-1){
                ___MYSESSIONSTATE = vue.getXmlAttr(input,"input","value")[1]
            }
        });//取值
        //获取表单xml
        /*ywonlyflag=> ProcessGUID
        ywtxt =>BusinessGUID
        MySessionState =>___MYSESSIONSTATE
        http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=SDBusinessE&ywonlyflag=fe5ae907-44af-e811-80fc-005056b036bb&ywtxt=e85ae907-44af-e811-80fc-005056b036bb&rdnum=0.5210671599574923&MySessionState=04bfc401-4faf-e811-80fc-005056b036bb*/
        ajax.request({
            url:`http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=SDBusinessE&ywonlyflag=${ProcessGUID}&ywtxt=${BusinessGUID}&MySessionState=${___MYSESSIONSTATE}`,
            method:'GET',
            body: {},
            type:"text"
        }).then(function(res){
            var data = res.data;
            _.each(_t.getXmlTagNameContent(data,"Domain",1),(field,index)=>{
                if(vue.hideFields.length&&vue.hideFields.indexOf(vue.getXmlAttr(field, "Domain", "name")[1])!=-1)return;
                _t.fields.push({
                    disname: vue.getXmlAttr(field, "Domain", "name")[1],
                    text:_t.liftOff(field,"Domain")
                });//获取表单字段信息
            });
        });

        //获取附件xml
        /*
         ywonlyflag =>ProcessGUID
         MySessionState=>___MYSESSIONSTATE
         http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=GetDocHTML&ywonlyflag=fe5ae907-44af-e811-80fc-005056b036bb&ywtxt=&rdnum=0.2579994478795364&MySessionState=04bfc401-4faf-e811-80fc-005056b036bb
         */
        ajax.request({
            url:`http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=GetDocHTML&ywonlyflag=${ProcessGUID}&ywtxt=&MySessionState=${___MYSESSIONSTATE}`,
            method:'GET',
            body: {},
            type:"text"
        }).then(function(res){
            var _attachmentXml = res.data;
            _.each(_t.getXmlTagNameContent(_attachmentXml,"table",1),(table,index)=>{
                _.each(_t.getXmlTagNameContent(table,"a"),(a,index)=>{
                    //console.log(a);
                    _t.attachment.push({
                        name: _t.liftOff(a,"a"),
                        downloadUrl:`http://192.168.1.98:8301/Download/download.doc?filepath=/`+vue.getXmlAttr(a, "a", "Location")[1],
                        download:true
                    });
                    //获取表单附件字段信息
                });
            });
        });


        //流程轨迹xml
        /*
         ywtxt =>ProcessGUID
         MySessionState=>___MYSESSIONSTATE
         http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=GetProcessReply&ywonlyflag=&ywtxt=fe5ae907-44af-e811-80fc-005056b036bb&rdnum=0.3988560133219182&MySessionState=04bfc401-4faf-e811-80fc-005056b036bb
         */
        ajax.request({
            url:`http://192.168.1.98:8301/MyWorkflow/WF_XmlHTTP.aspx?ywtype=GetProcessReply&ywonlyflag=&ywtxt=${ProcessGUID}&MySessionState=${___MYSESSIONSTATE}`,
            method:'GET',
            body: {},
            type:"text"
        }).then(function(res){
            var _trail = res.data;
            let spanIndex = 0;
            _.each(/*_trail.match(/<td([\s\S]*?)<\/td>/gi)*/_t.getXmlTagNameContent(_trail,"td",1),(td,index)=>{
                _.each(_t.getXmlTagNameContent(td,"span",1),(span,index)=>{
                    if(/(\d{4})-(\d{2})-(\d{2})/g.test(span)){
                        if(_t.trail[spanIndex-1]){
                            span = span/*.replace(/\n/g,"")*/.replace(/&gt;/g,">").replace(/\s+/g, " ").replace(/<.*?>/g, '');
                            let _span = span.split(" ");
                            _t.trail[spanIndex-1]["content"].push({
                                name:_span[0],
                                time:_span[3]+" "+_span[4]
                            })
                        }
                        /*span = _t.liftOff(span,"span").replace(/" "/g, '');
                         let _span = span.split(/\n/g);
                         console.log(_span);*/
                    }else{
                        let trail_data = {
                            name:_t.liftOff(span,"span"),
                            content:[],
                            color:"#ccc",
                            textColor:"#ccc",
                            approvalTrailw:{},
                            dotStyle:{"background-color":"#DFDFDF"}
                        }
                        _t.trail.push(trail_data);
                        spanIndex = spanIndex+1;
                    }

                    /*_.each(_t.getXmlTagNameContent(att,"content"),(content,index)=>{
                     let _name = _t.liftOff(_t.getXmlTagNameContent(content, "disname").join(""),"disname");
                     trail_data.content.push({
                     name:_name?_name.split(" ")[0]:"",
                     comm:_t.liftOff(_t.getXmlTagNameContent(content, "text").join(""),"text"),
                     time:_name?(_name.split(" ")[1]+" "+_name.split(" ")[2]):""
                     });//流程意见
                     });*/
                });//获取表单流程轨迹信息
            });

            if(_t.trail.length) {
                Object.assign(_t.trail[0], {
                    select: true,
                    color: "#5099F4",//高亮dot
                    textColor: "#000",//高亮文字
                    dotStyle: {"background-color": "#5099F4"}
                });
                _t.trail[(_t.trail.length - 1)].borderLeftWidth = {"border-left-width": 0};//不需要显示线条
            }else{
                _t.trail = [];
            }
        });




            var data = `<?xml version="1.0"?><BusinessType businessAssembly="Mysoft.Cbgl.Business" businessClassName="CbHTFkSP_HTML" BusinessGUID="e85ae907-44af-e811-80fc-005056b036bb"><Item><Domain name="公司GUID" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">11b11db4-e907-4f1f-8835-b9daab6e1f23</Domain><Domain name="申请项目名称" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="申请公司名称" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">佳兆业集团控股</Domain><Domain name="项目GUID" isupdate="0" isnull="0" type="varchar" len="999999" displaytype="text" dropdownoptions="" default="" isuser="0">00000000-0000-0000-0000-000000000000</Domain><Domain name="申请主题" isupdate="0" isnull="0" isapprovemodify="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">佳兆业集团工商管理平台项目开发合同第1笔付款</Domain><Domain name="申请编号" isupdate="0" isnull="0" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0">zb-2018-09-03-0266</Domain><Domain name="申请日期" isupdate="0" isnull="0" type="varchar" len="8" displaytype="text" dropdownoptions="" default="" isuser="0">2018-9-3</Domain><Domain name="合同编号" isupdate="0" isnull="0" type="varchar" len="200" displaytype="text" dropdownoptions="" default="" isuser="0">JT-QTHT-2017-159</Domain><Domain name="合同名称" isupdate="0" isnull="0" type="varchar" len="80" displaytype="text" dropdownoptions="" default="" isuser="0">佳兆业集团工商管理平台项目开发合同</Domain><Domain name="合同类型" isupdate="0" isnull="0" type="varchar" len="80" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="合同有效签约金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="合同有效签约金额（大写）" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">玖万伍仟元整</Domain><Domain name="所属项目" isupdate="0" isnull="0" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="款项类型" isupdate="0" isnull="0" type="varchar" len="80" displaytype="text" dropdownoptions="" default="" isuser="0">行政类</Domain><Domain name="款项名称" isupdate="0" isnull="0" type="varchar" len="80" displaytype="text" dropdownoptions="" default="" isuser="0">行政类</Domain><Domain name="付款单位" isupdate="0" isnull="1" isapprovemodify="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">今盛工程管理咨询（深圳）有限公司</Domain><Domain name="申请类型" isupdate="0" isnull="1" type="varchar" len="80" displaytype="text" dropdownoptions="" default="" isuser="0" /><Domain name="收款单位" isupdate="0" isnull="1" isapprovemodify="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">广州睿策信息科技有限公司</Domain><Domain name="申请金额" isupdate="0" isnull="1" isapprovemodify="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">10.00</Domain><Domain name="申请金额(￥)" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">10.00</Domain><Domain name="审定金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">10.00</Domain><Domain name="代付代扣" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="本次应付金额" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">10.00</Domain><Domain name="本次实际需支付金额" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">10.00</Domain><Domain name="本次扣回金额合计" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="已申请未支付" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="本次应付金额（大写）" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">壹拾元整</Domain><Domain name="开户银行" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">广州银行芳草支行</Domain><Domain name="银行帐号" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">800236535602017</Domain><Domain name="合同签约总价" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="保修金" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="累计已付金额" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="累计已付款（大写）" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">零</Domain><Domain name="累计已付比例" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="应付未付金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="累计未付金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="申请人" isupdate="0" isnull="1" type="varchar" len="20" displaytype="text" dropdownoptions="" default="" isuser="0">潘晓松</Domain><Domain name="申请部门" isupdate="0" isnull="1" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0">集团控股网络信息部</Domain><Domain name="冲账金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="结算金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="累计应付进度款" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="累计应付进度款（大写）" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">零</Domain><Domain name="累计已申请金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="累计申请付款金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="本次应付参考金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="当月本合同计划付款金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本合同审批金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本合同已申请金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本合同可用金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本人计划付款金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本人审批金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本人已申请金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本人可用金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本部门计划付款金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本部门审批金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本部门已申请金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="当月本部门可用金额" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="付款说明" isupdate="0" isnull="1" isapprovemodify="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="最小规划余量" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0</Domain><Domain name="合同类别" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">综合类_深圳</Domain><Domain name="合同金额" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="合同总金额（审批表单）" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="合同总金额（审批表单大写）" isupdate="0" isnull="0" type="varchar" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">玖万伍仟元整</Domain><Domain name="合同总金额" isupdate="0" isnull="0" type="money" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">95,000.00</Domain><Domain name="合同总金额（大写）" isupdate="0" isnull="0" type="varchar" len="12" displaytype="number" dropdownoptions="" default="" isuser="0">玖万伍仟元整</Domain><Domain name="申请金额(￥大写)" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">壹拾元整</Domain><Domain name="申请金额（大写）" isupdate="0" isnull="0" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0">壹拾元整</Domain><Domain name="分摊科目（金额）" isupdate="0" isnull="0" type="varchar" len="8000" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="本期付款后尚欠_录入(￥)" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0.00</Domain><Domain name="本期付款后尚欠_录入(￥大写)" isupdate="0" isnull="0" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0">零</Domain><Domain name="本期付款后尚欠(￥)" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">94,990.00</Domain><Domain name="本期付款后尚欠(￥大写)" isupdate="0" isnull="0" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0">玖万肆仟玖佰玖拾元整</Domain><!--隐藏域--><Domain name="收款人" isupdate="0" isnull="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="联系电话" isupdate="0" isnull="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="收款银行" isupdate="0" isnull="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="银行分行" isupdate="0" isnull="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="收款账号1" isupdate="0" isnull="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><Domain name="收款账号2" isupdate="0" isnull="1" type="varchar" len="100" displaytype="text" dropdownoptions="" default="" isuser="0"></Domain><!--隐藏 域--><Domain name="付款申请GUID" isupdate="0" isnull="0" type="varchar" len="8" displaytype="text" dropdownoptions="" default="" isuser="0">e85ae907-44af-e811-80fc-005056b036bb</Domain><Domain name="合约规划使用明细数量" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0</Domain><Domain name="中间科目使用明细数量" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0</Domain><Domain name="部门费用使用明细数量" isupdate="0" isnull="0" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0">0</Domain><Domain name="合约规划列表比较域" isupdate="0" isnull="0" type="varchar" len="300" displaytype="text" dropdownoptions="" default="" isuser="0">371857150</Domain><Domain name="中间科目列表比较域" isupdate="0" isnull="0" type="varchar" len="300" displaytype="text" dropdownoptions="" default="" isuser="0">371857150</Domain><Domain name="部门费用列表比较域" isupdate="0" isnull="0" type="varchar" len="300" displaytype="text" dropdownoptions="" default="" isuser="0">371857150</Domain><Domain name="代付代扣列表比较域" isupdate="0" isnull="0" type="varchar" len="300" displaytype="text" dropdownoptions="" default="" isuser="0">371857150</Domain><Domain name="是否特殊审批流程" isupdate="0" isnull="1" type="varchar" len="100" displaytype="hidden" dropdownoptions="" default="" isuser="0">0</Domain><!-- 仅用于选择，指定审批时可修改的业务域 --><Domain name="相关文档" isupdate="0" isnull="1" isapprovemodify="1" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0" /><Domain name="合约规划" isupdate="0" isnull="1" isapprovemodify="1" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0" /><Domain name="中间科目" isupdate="0" isnull="1" isapprovemodify="1" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0" /><Group name="合约规划列表" RowCount="0"><Item><Domain name="合约规划名称" isupdate="0" isnull="1" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="科目名称" isupdate="0" isnull="1" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="项目名称" isupdate="0" isnull="1" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="合约规划金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="对应金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="生效后规划余量" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain></Item></Group><Group name="中间科目列表" RowCount="0"><Item><Domain name="公司名称" isupdate="0" isnull="1" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="中间科目名称" isupdate="0" isnull="1" type="varchar" len="400" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="中间科目对应金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain></Item></Group><Group name="部门费用列表" RowCount="0"><Item><Domain name="责任人" isupdate="0" isnull="1" type="varchar" len="20" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="责任部门" isupdate="0" isnull="1" type="varchar" len="50" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="部门费用科目名称" isupdate="0" isnull="1" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="事项" isupdate="0" isnull="1" type="varchar" len="40" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="部门费用对应金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain></Item></Group><Group name="代付代扣列表" RowCount="0"><Item><Domain name="类型" isupdate="0" isnull="1" type="varchar" len="20" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="总代扣代付金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="累计已扣回" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="本次扣回金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="剩余未扣回金额" isupdate="0" isnull="1" type="money" len="8" displaytype="number" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain><Domain name="未扣回说明" isupdate="0" isnull="1" type="varchar" len="20" displaytype="text" dropdownoptions="" default="" isuser="0" businessdynamic="1"></Domain></Item></Group><Domain name="年度预算" isupdate="0" len="" displaytype="select" dropdownoptions="2016,2016|2017,2017|2018,2018|2019,2019|2020,2020" isuser="1" type="text"><![CDATA[2018]]></Domain><Domain name="款项分类" isupdate="0" len="" displaytype="select" dropdownoptions="01,行政类|02,人力类|03,品牌类" isuser="1" type="text"><![CDATA[01]]></Domain><Domain name="收款单位全称（必填）" isupdate="0" len="200" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[测试公司]]></Domain><Domain name="开户银行（必填）" isupdate="0" len="200" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[中国银行]]></Domain><Domain name="银行账号（必填）" isupdate="0" len="200" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[11]]></Domain><Domain name="联系人电话（必填）" isupdate="0" len="200" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[11]]></Domain><Domain name="集团业务部门意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[潘晓松发起，意见：发起 2018-09-03 14:40
潘晓松审批不通过打回（重走流程），意见：打回流程 2018-09-03 16:39]]></Domain><Domain name="集团投资成本部门意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain><Domain name="集团业务分管高管意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain><Domain name="集团财务部门意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain><Domain name="集团财务分管高管意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain><Domain name="集团资金职能部门意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain><Domain name="集团资金分管高管意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain><Domain name="主席意见" isupdate="0" len="2000" displaytype="textarea" dropdownoptions="" isuser="1" type="text"><![CDATA[]]></Domain></Item></BusinessType>`;//先静态写死结构

        var _attachmentXml  = `<?xml version="1.0" encoding="utf-16"?><div style="margin: 0px; padding: 10px 2px 2px 8px;"><span style="FONT-SIZE: 12px;font-weight:bold;">流程附件</span>  <a id="aUpFile" href="#" onclick="upFile()">上传</a><br /><input id="__isallowopenfile" type="hidden" value="true" /><table style="height:100%;width:100%"><tr><td id="tdForm" style="margin: 0px; padding:0px 2px 2px 15px"><table width="80%" cellspacing="0" cellpadding="0" border="0" id="tblAttachMent"><tr><td width="50%" height="18px"><img src="/_imgs/ico_16_1039_d.gif" align="absmiddle" /><a href="#" oncontextmenu="showMenu(this)" onclick="event.cancelBubble=true;showMenu(this);" oid="015be907-44af-e811-80fc-005056b036bb" docname="佳兆业集团工商管理平台项目开发合同.pdf" filename="/UpFiles/201710/合同管理2017_10_12(11_26_29_53)1829579008.pdf" createname="潘晓松" createby="4431f37e-27af-e311-a9ca-005056b04a97" modifieduser="" modifiedtime="" createon="2018-09-03 14:39" lockedby="" title="佳兆业集团工商管理平台项目开发合同.pdf" IsCreateByBMP="0" BPMHost="http://sso.kaisagroup.com:8088/" Location="/UpFiles/201710/">佳兆业集团工商管理平台项目开发合同.pdf</a></td><td width="50%" height="18px"><img src="/_imgs/ico_16_1039_d.gif" align="absmiddle" /><a href="#" oncontextmenu="showMenu(this)" onclick="event.cancelBubble=true;showMenu(this);" oid="b2de5820-44af-e811-80fc-005056b036bb" docname="计划管理系统考核细则.docx" filename="/UpFiles/201809/工作流2018_09_03(14_39_42_37)2109646336.docx" createname="潘晓松" createby="4431f37e-27af-e311-a9ca-005056b04a97" modifieduser="" modifiedtime="" createon="2018-09-03 14:39" lockedby="" title="计划管理系统考核细则.docx" IsCreateByBMP="0" BPMHost="http://sso.kaisagroup.com:8088/" Location="/UpFiles/201809/">计划管理系统考核细则.docx</a></td></tr></table></td></tr></table></div>`;//先寫死附件的結構

        var _trail=`<?xml version="1.0" encoding="utf-16"?><div style="margin: 0px; padding: 10px 2px 2px 8px;width:95%;"><span style="width:80px;float:left;FONT-SIZE: 12px;font-weight:bold;">审批记录</span><span style="width:50px;float:right;FONT-SIZE: 12px;font-weight:bold;"><img style="cursor:hand;margin-right:10px" src="\MyWorkflow\images\arrow_up.gif" onclick="parent.reloadReply('ASC');" title="按审批时间升序" /><img style="cursor:hand;" src="\MyWorkflow\images\arrow_down.gif" onclick="parent.reloadReply('DESC');" title="按审批时间降序" /></span><br /><br /><table style="FONT-SIZE:12px;BORDER-COLLAPSE:collapse;margin-left:15px;width:100%;" cellSpacing="0" cellPadding="1"><tr><td><span style="word-break:break-all;font-size:15px;">打回流程</span></td></tr><tr><td height="30px"><span style="width:100%;text-align:right; border-bottom-color:#D5D5D5;border-bottom-style:dashed;border-bottom-width:1px">佳兆业集团控股&gt;&gt;集团控股网络信息部&gt;&gt;潘晓松
                      (集团控股网络信息部职员)

                        打回(重走流程)
                       2018-09-03 17:57</span></td></tr><tr><td><span style="word-break:break-all;font-size:15px;">重新发起</span></td></tr><tr><td height="30px"><span style="width:100%;text-align:right; border-bottom-color:#D5D5D5;border-bottom-style:dashed;border-bottom-width:1px">佳兆业集团控股&gt;&gt;集团控股网络信息部&gt;&gt;潘晓松
                      (集团控股网络信息部职员)
                     重新发起 2018-09-03 16:52</span></td></tr><tr><td><span style="word-break:break-all;font-size:15px;">打回流程</span></td></tr><tr><td height="30px"><span style="width:100%;text-align:right; border-bottom-color:#D5D5D5;border-bottom-style:dashed;border-bottom-width:1px">佳兆业集团控股&gt;&gt;集团控股网络信息部&gt;&gt;潘晓松
                      (集团控股网络信息部职员)

                        打回(重走流程)
                       2018-09-03 16:39</span></td></tr><tr><td><span style="word-break:break-all;font-size:15px;">发起</span></td></tr><tr><td height="30px"><span style="width:100%;text-align:right; border-bottom-color:#D5D5D5;border-bottom-style:dashed;border-bottom-width:1px">佳兆业集团控股&gt;&gt;集团控股网络信息部&gt;&gt;潘晓松
                      (集团控股网络信息部职员)
                     发起 2018-09-03 14:40</span></td></tr></table></div>
`//審批記錄

        _.each(_t.getXmlTagNameContent(data,"Domain",1),(field,index)=>{
            if(vue.hideFields.length&&vue.hideFields.indexOf(vue.getXmlAttr(field, "Domain", "name")[1])!=-1)return;
            _t.fields.push({
                disname: vue.getXmlAttr(field, "Domain", "name")[1],
                text:_t.liftOff(field,"Domain")
            });//获取表单字段信息
        });

        _.each(_t.getXmlTagNameContent(_attachmentXml,"table",1),(table,index)=>{
            _.each(_t.getXmlTagNameContent(table,"a"),(a,index)=>{
                //console.log(a);
                _t.attachment.push({
                    name: _t.liftOff(a,"a"),
                    downloadUrl:`http://192.168.1.98:8301/Download/download.doc?filepath=/`+vue.getXmlAttr(a, "a", "Location")[1],
                    download:true
                });
                //获取表单附件字段信息
            });
        });

        let spanIndex = 0;
        _.each(/*_trail.match(/<td([\s\S]*?)<\/td>/gi)*/_t.getXmlTagNameContent(_trail,"td",1),(td,index)=>{
            _.each(_t.getXmlTagNameContent(td,"span",1),(span,index)=>{
                if(/(\d{4})-(\d{2})-(\d{2})/g.test(span)){
                    if(_t.trail[spanIndex-1]){
                        span = span/*.replace(/\n/g,"")*/.replace(/&gt;/g,">").replace(/\s+/g, " ").replace(/<.*?>/g, '');
                        let _span = span.split(" ");
                        _t.trail[spanIndex-1]["content"].push({
                            name:_span[0],
                            time:_span[3]+" "+_span[4]
                        })
                    }
                    /*span = _t.liftOff(span,"span").replace(/" "/g, '');
                    let _span = span.split(/\n/g);
                    console.log(_span);*/
                }else{
                    let trail_data = {
                        name:_t.liftOff(span,"span"),
                        content:[],
                        color:"#ccc",
                        textColor:"#ccc",
                        approvalTrailw:{},
                        dotStyle:{"background-color":"#DFDFDF"}
                    }
                    _t.trail.push(trail_data);
                    spanIndex = spanIndex+1;
                }

                /*_.each(_t.getXmlTagNameContent(att,"content"),(content,index)=>{
                    let _name = _t.liftOff(_t.getXmlTagNameContent(content, "disname").join(""),"disname");
                    trail_data.content.push({
                        name:_name?_name.split(" ")[0]:"",
                        comm:_t.liftOff(_t.getXmlTagNameContent(content, "text").join(""),"text"),
                        time:_name?(_name.split(" ")[1]+" "+_name.split(" ")[2]):""
                    });//流程意见
                });*/
            });//获取表单流程轨迹信息
        });

        if(_t.trail.length) {
            Object.assign(_t.trail[0], {
                select: true,
                color: "#5099F4",//高亮dot
                textColor: "#000",//高亮文字
                dotStyle: {"background-color": "#5099F4"}
            });
            _t.trail[(_t.trail.length - 1)].borderLeftWidth = {"border-left-width": 0};//不需要显示线条
        }else{
            _t.trail = [];
        }
        _t.state = 1;

    },
};
export default service;