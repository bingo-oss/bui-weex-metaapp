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
            console.log(field);
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
        //获取表单xml


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


        let _t  = vue;
        vue.fields = [];vue.attachment = [];vue.trail = [];
        _.each(_t.getXmlTagNameContent(data,"Domain",1),(field,index)=>{
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
        _.each(/*_trail.match(/<td([\s\S]*?)<\/td>/gi)*/_t.getXmlTagNameContent(_trail,"td"),(td,index)=>{
            _.each(_t.getXmlTagNameContent(td,"span",1),(span,index)=>{
                if(/(\d{4})-(\d{2})-(\d{2})/g.test(span)){
                    if(_t.trail[spanIndex-1]){
                        span = span/*.replace(/\n/g,"")*/.replace(/&gt;/g,">").replace(/\s+/g, " ");
                        let _span = span.split(" ");
                        _t.trail[spanIndex-1]["content"].push({
                            name:_t.liftOff(_span[0]+_span[1],"span"),
                            time:_span[2]+" "+_span[3]
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

    }
};
export default service;