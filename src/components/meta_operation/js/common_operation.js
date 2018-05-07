/**
 * 提供grid内置的操作
 */
//import metabase from '../../../libs/metadata/metabase';
//import ExportCsv from './export_csv';
//import toolServices from '../../../services/tool/tool_service';
//var pathToRegexp = require('path-to-regexp');
import Utils from '../../../js/tool/utils'
import _ from '../../../js/tool/lodash'
import ajax from '../../../js/ajax.js';
import i18n from '../../../js/i18n/index';
import buiweex from 'bui-weex'
/**
 * 创建操作，跳转到新建表单页
 * @param context
 */
function operationForCreate(){
  var operation= {
    title:"添加",
    icon:"plus-round",
    onclick:function(context,$optInst){
      let pageId=$optInst.operation.page&&$optInst.operation.page.id;
      if(!pageId){
        buiweex.alert(i18n.pageIdNotSet);
        return;
      }
      let queryParam = {pageId: 'pageId'};
      let url = `${buiweex.getContextPath()}/page.weex.js${ajax.object2query(queryParam)}`;
      buiweex.push(url);
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.create;
  return operation;
}
function getIdFromContext(context){
  var id=context.selectedId;
  var metaEntity=context.metaEntity;
  if(!id){
    var selectedItem=context.selectedItem;
    if(selectedItem){
      //计算id字段
      var idField=null;
      if( !_.isEmpty(metaEntity)){
        idField=metaEntity.getIdField();
      }
      id=selectedItem[idField];
    }
  }
  return id;
}
/**
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit(){
  var operation= {
    id:"edit",
    title:"修改",
    icon:"edit",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        iview$Modal.error({content:i18n.dataIdNotSet});
        return;
      }
      let pageId=$optInst.operation.page&&$optInst.operation.page.id;
      if(!pageId){
        buiweex.alert(i18n.pageIdNotSet);
        return;
      }
      let queryParam = {pageId: 'pageId',dataId:id};
      let url = `${buiweex.getContextPath()}/page.weex.js${ajax.object2query(queryParam)}`;
      buiweex.push(url);
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.edit;;
  return operation;
}
/**
 * 查看操作，跳转到查看页面
 * @param context
 */
function operationForView(){
  var operation= {
    id:"view",
    title:"查看",
    icon:"ios-eye-outline",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        iview$Modal.error({content:i18n.dataIdNotSet});
        return;
      }
      let pageId=$optInst.operation.page&&$optInst.operation.page.id;
      if(!pageId){
        buiweex.alert(i18n.pageIdNotSet);
        return;
      }
      let queryParam = {pageId: 'pageId',dataId:id};
      let url = `${buiweex.getContextPath()}/page.weex.js${ajax.object2query(queryParam)}`;
      buiweex.push(url);
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.view;
  return operation;
}
/**
 * 删除操作
 * @param {*} context
 */
function operationForDel() {
  var operation= {
    id:"del",
    title:"删除",
    icon:"trash-a",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        iview$Modal.error({content:i18n.dataIdNotSet});
        return;
      }
      var metaEntity=context.metaEntity;
      resource=metaEntity.dataResource();
      buiweex.confirm(i18n.confirmDelete,function(ok){
        if(ok){
          resource.delete({id:id}).then(function (re) {
            context.grid&&context.grid.reload();
          });
        }
      });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.del;
  return operation;
}

/**
 * 批量删除操作
 * @param {*} context
 */
function operationForBatchDelete() {
  var operation= {
    id:"batchDelete",
    title:"批量删除",
    icon:"trash-a",
    onclick:function(context,$optInst){
    //   var metaEntity=context.metaEntity;
    //   //计算id字段
    //   var idField=null;
    //   if( !_.isEmpty(metaEntity)){
    //     idField=metaEntity.getIdField();
    //   }
    //   var resource=context.grid&&context.grid.queryResource;
    //   if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
    //     resource=metaEntity.dataResource();
    //   }
    //   //检查当前用户对每一行数据是否有删除权限
    //   let opt={},unpermedItems=[],permedItems=[],unpermedInfo='';
    //   opt[Utils.dataPermField]=Utils.permValues.del;
    //   var checkedRows=context.selectedItems;
    //   if(_.isEmpty(checkedRows)){
    //     iview$Modal.error({content:`必须传入选中的所有行数据`});
    //     return;
    //   }
    //   _.each(checkedRows,function(item){
    //     let has=Utils.hasDataPerm(item,opt); 
    //     if(!has){
    //       unpermedItems.push(item);
    //     }else{
    //       permedItems.push(item);
    //     }
    //   });
    //   if(!_.isEmpty(unpermedItems)){
    //     if(unpermedItems.length===checkedRows.length){
    //       iview$Modal.warning({
    //         title: '提示',
    //         content:'您对选中的数据没有删除权限'
    //       });
    //       return;
    //     }else{
    //       unpermedInfo=`您选中了${checkedRows.length}条数据，有${unpermedItems.length}条没有删除权限，继续删除剩下的${checkedRows.length-unpermedItems.length}条吗`;
    //     }
    //   }
    //   iview$Modal.confirm({
    //     title: '提示',
    //     content: unpermedInfo||'确定删除吗?',
    //     onOk: () => {
    //       _.each(permedItems,function(row){
    //         let id=row[idField.name];
    //         //,cascade_delete:true
    //         resource.delete({id:id}).then(function (re) {
    //           context.grid&&context.grid.reload();
    //         });
    //       });
    //     }
    //   });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.del;
  return operation;
}

/**
 * 数据导入操作
 */
function operationForImport(){
  var operation= {
    id:"import",
    title:"导入",
    icon:"ios-upload-outline",
    renderComponent:"meta-grid-import-data"
  };
  operation[Utils.dataPermField]=Utils.permValues.create;
  return operation;
}
/**
 * 导出
 * @param {*} context
 */
function operationForExport() {
  var operation= {
    id:"export",
    title:"导出",
    icon:"ios-download-outline",
    onclick:function(context,$optInst){
    //   var resource=context.grid&&context.grid.queryResource;
    //   var metaEntity=context.metaEntity;
    //   var grid=context.grid;
    //   if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
    //     resource=metaEntity.dataResource();
    //   }
    //   if(_.isEmpty(resource)){
    //     iview$Modal.error({content:`实体查询地址未设置`});
    //     return;
    //   }
    //   iview$Modal.confirm({
    //     title: '提示',
    //     content: '是否导出当前列表所有数据?',
    //     onOk: () => {
    //       var queryOptions={page_size:500};
    //       if(grid){
    //         queryOptions=grid.buildQueryOptions();
    //         queryOptions.page_size=grid.totalCount || queryOptions.page_size;
    //       }
    //       queryOptions.total=false;
    //       queryOptions.page=1;
    //       queryOptions.select="*";
    //       //获取当前项目的swagger地址
    //       metabase.currentSwagger(metaEntity.projectId).then(function(swagger){
    //         var exportTaskSetting={
    //           "entityName":metaEntity.name,
    //           "swagger":swagger,
    //           "options":queryOptions
    //         };
    //         var metaEntity=metabase.findMetaEntity(metaEntity.name);
    //         var query={};
    //         if(grid){
    //           query=grid.$route.query;
    //         }
    //         toolServices.doExport(query,exportTaskSetting).then(function (records) {
    //           ExportCsv.download(metaEntity.title+".csv", records.body.join("\r\n"));
    //         });
    //       });
    //     }
    //   });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.view;
  return operation;
}

/**
 * 返回到上一步路由
 * @param {*} context 
 */
function goback(){
  var operation= {
    id:"goback",
    title:"返回",
    icon:"",
    onclick:function(context,$optInst){
      //router.go(-1);
    }
  };
  return operation;
}

/**
 * 保存数据（表单保存）
 * @param {*} context 
 */
function save(){
  var operation= {
    id:"save",
    title:"保存",
    icon:"",
    onclick:function(context,$optInst){
    //   var form=context.form;
    //   if(_.isEmpty(form)){
    //     iview$Modal.error({content:`表单保存操作必须传入表单实例参数`});
    //     return;
    //   }
    //   form.doSaveModel();
    }
  };
  return operation;
}

var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel,
  import:operationForImport,
  exports:operationForExport,
  batchDelete:operationForBatchDelete,
  goback:goback,
  save:save
}

export default {
  /**
   * 根据操作中，创建一个默认的操作
   * @param context
   * @param operationName
   */
  createOperation:function (operationName) {
    if(_.isEmpty(operationName)){
      return null;
    }
    var func=null;
    _.forEach(operations,function (opFunc,key) {
      if(key.toLowerCase()==operationName.toLowerCase()){
        func=opFunc;
        return false;
      }
    });
    if(func!=null){
      return func();
    }
    return null;
  }
}


