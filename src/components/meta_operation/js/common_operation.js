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
        buiweex.alert(i18n.dataIdNotSet);
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
        buiweex.alert(i18n.dataIdNotSet);
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
 * 保存数据（表单保存）
 * @param {*} context 
 */
function save(){
  var operation= {
    id:"save",
    title:"保存",
    icon:"",
    onclick:function(context,$optInst){
      var form=context.form;
      if(_.isEmpty(form)){
        buiweex.alert(`表单保存操作必须传入表单实例参数`);
        return;
      }
      form.doSaveModel();
    }
  };
  return operation;
}

var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel,
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



