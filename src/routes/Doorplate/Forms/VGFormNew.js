/*
自然村类必填项：行政区划、自然村名称、门牌号、门牌规格
门牌号、户室号只能是数字
标准地址：嘉兴市/市辖区/镇街道/村社区/自然村名称/门牌号/户室号
*/
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  DatePicker,
  Cascader,
  Select,
  Tooltip,
  Modal,
  Spin,
  notification,
  Checkbox,
} from 'antd';
import {
  zjlx,
  MpbgDisabled,
  MpzxDisabled,
  MphbDisabled,
  MpxqDisabled,
  MpzmDisabled,
} from '../../../common/enums.js';
import st from './HDFormNew.less';
const { TextArea } = Input;

import {
  baseUrl,
  url_SearchCountryMPID,
  url_GetMPSizeByMPType,
  url_GetDistrictTreeFromDistrict,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_CheckCountryMPIsAvailable,
  url_ModifyCountryMP,
  url_CancelCountryMP,
  url_CancelCountryMPByList,
  url_SearchCountryMPByAddressCoding,
  url_DeletePersonMP,
  url_GetPersonDoneMPBusiness,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistricts } from '../../../utils/utils.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import ProveForm from '../../../routes/ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import MPZForm_cj from '../../ToponymyProve/MPZForm_cj';
import Authorized from '../../../utils/Authorized4';
import AttachForm from './AttachForm';
import { getDivIcons } from '../../../components/Maps/icons';
import { printMPZ_cj } from '../../../common/Print/LodopFuncs';
import { getUser } from '../../../utils/login';

const FormItem = Form.Item;
let defaultValues = { MPProduce: 1, MPMail: 1, BZTime: moment() };
const { mp } = getDivIcons();
class VGForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    showAttachment: this.props.showAttachment, //是否显示附件
    // showMPZForm: false,
    // showMPZForm_cj: false,
    showProveForm: false,
    showLocateMap: false,
    districts: [],
    // entity: { BZTime: moment() },
    entity: { ...defaultValues, SLRQ: moment() },
    mpTypes: [],
    newForm: true,
    communities: [],
    viliges: [],
    postCodes: [],
    saveBtnClicked: false, // 点击保存后按钮置灰
  };

  mObj = {};
  removeFileInfo = { ID: [], FileType: '', ItemType: '', time: moment().format('YYYYMMDDHHmms') };

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  showLoading() {
    this.setState({ showLoading: true });
  }

  hideLoading() {
    this.setState({ showLoading: false });
  }

  showLocateMap() {
    this.setState({ showLocateMap: true });
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }
  // 获取行政区数据
  async getDistricts() {
    let rt = await Post(url_GetDistrictTreeFromDistrict);
    rtHandle(rt, d => {
      let districts = getDistricts(d);
      this.setState({ districts: districts });
    });
  }

  async getMPSizeByMPType() {
    // 获取门牌规格
    let rt = await Post(url_GetMPSizeByMPType, { mpType: 3 });
    rtHandle(rt, d => {
      this.setState({ mpTypes: d });
    });
  }

  async getPostCodes(e) {
    let { entity } = this.state;
    this.setState({
      postCodes: [],
      entity: entity,
    });
    let rt = await Post(url_GetPostCodes, {
      NeighborhoodsID: entity.Districts[1],
      CommunityName: e,
    });
    rtHandle(rt, d => {
      this.setState({ postCodes: d });
    });
  }

  async getViliges(e) {
    let { entity } = this.state;
    this.setState({
      viliges: [],
      entity: entity,
    });
    let rt = await Post(url_GetNamesFromDic, {
      type: 3,
      DistrictID: entity.Districts[1],
      CommunityName: e,
    });
    rtHandle(rt, d => {
      this.setState({ viliges: d });
    });
  }

  async getCommunities(e) {
    let { entity } = this.state;
    this.setState({
      communities: [],
      entity: entity,
    });

    let rt = await Post(url_GetNamesFromDic, { type: 4, DistrictID: e[e.length - 1] });
    rtHandle(rt, d => {
      this.setState({ communities: d });
    });
  }

  async getFormData(id) {
    let { WSSQ_INFO } = this.props;
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取门牌数据
    var From_Grzx = WSSQ_INFO && WSSQ_INFO.blType; // 是否来自个人中心
    var Grzx_Item = From_Grzx ? (WSSQ_INFO.blType.indexOf('MP') != -1 ? '门牌管理' : '地名证明') : ''; // 个人中心-事项类型：门牌管理、地名证明
    if (id || From_Grzx) {
      let { entity } = this.state;
      let { doorplateType } = this.props;
      // 非个人中心
      var url = url_SearchCountryMPID, query = { id: id };
      if (id) {
      } else {
        // 个人中心
        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_MP_NEW') {
          url = url_GetNewGuid, query = {};
        }
        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_MP_OLD') {
          url = url_SearchCountryMPByAddressCoding,
            query = { AddressCoding: WSSQ_INFO.AddressCoding };
        }
        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_DMZM') {
          // 地名证明
        }
      }
      let rt = await Post(url, query);
      rtHandle(rt, d => {
        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_MP_NEW') {
          d = WSSQ_INFO.WSSQ_DATA;
        }
        if (From_Grzx) {
          var YWYD_Data = WSSQ_INFO.WSSQ_DATA;
        }
        if (Grzx_Item == '门牌管理') {
          // 用一网一端数据-填入
          d.Remarks = YWYD_Data.Remarks;
          d.PropertyOwner = YWYD_Data.PropertyOwner;
          d.IDType = YWYD_Data.IDType;
          d.IDNumber = YWYD_Data.IDNumber;
          d.Applicant = YWYD_Data.Applicant;
          d.ApplicantType = YWYD_Data.ApplicantType;
          d.ApplicantNumber = YWYD_Data.ApplicantNumber;
          d.ApplicantPhone = YWYD_Data.ApplicantPhone;
          d.ApplicantAddress = YWYD_Data.ApplicantAddress;
        }
        if (Grzx_Item == '地名证明') {
          // 用一网一端数据-填入
          d.PropertyOwner = YWYD_Data.PropertyOwner;
          d.IDType = YWYD_Data.IDType;
          d.IDNumber = YWYD_Data.IDNumber;
          d.Applicant = YWYD_Data.Applicant;
          d.ApplicantType = YWYD_Data.ApplicantType;
          d.ApplicantNumber = YWYD_Data.ApplicantNumber;
          d.ApplicantPhone = YWYD_Data.ApplicantPhone;
          d.ApplicantAddress = YWYD_Data.ApplicantAddress;
        }
        let districts = [d.CountyID, d.NeighborhoodsID];
        d.Districts = districts;
        // d.BZTime = d.BZTime ? moment(d.BZTime) : null;
        d.BZTime = moment();
        d.ArchiveFileTime = d.ArchiveFileTime ? moment(d.ArchiveFileTime) : null;
        d.CancelTime = d.CancelTime ? moment(d.CancelTime) : null;
        d.CreateTime = d.CreateTime ? moment(d.CreateTime) : null;
        d.DataPushTime = d.DataPushTime ? moment(d.DataPushTime) : null;
        d.DelTime = d.DelTime ? moment(d.DelTime) : null;
        d.InfoReportTime = d.InfoReportTime ? moment(d.InfoReportTime) : null;
        d.LastModifyTime = d.LastModifyTime ? moment(d.LastModifyTime) : null;
        d.MPProduceTime = d.MPProduceTime ? moment(d.MPProduceTime) : null;

        if (entity.SLR) {
          d.SLR = entity.SLR;
          d.SLRQ = entity.SLRQ;
        }

        let t =
          d.PropertyOwner != null && d.PropertyOwner != '' && d.IDNumber != null && d.IDNumber != ''
            ? false
            : true;

        this.setState({ entity: d, newForm: false, dataShareDisable: t });
      });
    } else {
      // 获取一个新的guid
      let rt = await Post(url_GetNewGuid);
      rtHandle(rt, d => {
        let { entity } = this.state;
        entity.ID = d;
        this.setState({ entity: entity, newForm: true });
        this.mObj = { BZTime: moment() };
      });
    }
    this.hideLoading();
  }

  async checkMP() {
    let { errs, validateObj } = this.validate([], true);
    if (errs.length) {
      Modal.error({
        title: '错误',
        okText: '知道了',
        content: errs.map((e, i) => (
          <div>
            {i + 1}、{e}；
          </div>
        )),
      });
    } else {
      let {
        ID,
        CountyID,
        NeighborhoodsID,
        CommunityName,
        ViligeName,
        MPNumber,
        HSNumber,
      } = validateObj;
      await Post(
        url_CheckCountryMPIsAvailable,
        {
          ID,
          CountyID,
          NeighborhoodsID,
          CommunityName,
          ViligeName,
          MPNumber,
          HSNumber,
        },
        e => {
          if (e) {
            notification.success({ description: '“标准地址”有效、可用！', message: '成功' });
          } else {
            notification.error({
              description: '已存在相同“标准地址”，请重新编制！',
              message: '失败',
            });
          }
        }
      );
    }
  }

  combineStandard() {
    let { entity } = this.state;
    let obj = {
      ...entity,
      ...this.mObj,
    };
    let ds = obj.districts;
    let ept = '';

    // 如果行政区修改过
    // 标准地址格式：嘉兴市/市辖区/镇街道/村社区/自然村名称/门牌号码/户室号
    if (ds) {
      entity.StandardAddress = `嘉兴市${ds.length ? ds[0].label + ds[1].label : ''}`;
    } else {
      entity.StandardAddress = `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName || ept}`;
    }
    entity.StandardAddress += `${obj.CommunityName || ept}${obj.ViligeName || ept}${
      obj.MPNumber ? obj.MPNumber + '号' : ept
      }${obj.HSNumber ? obj.HSNumber + '室' : ept}`;
    this.setState({ entity: entity });
  }

  validate(errs, checkMP) {
    errs = errs || [];
    let { entity, newForm } = this.state;
    let { doorplateType } = this.props;

    let saveObj = newForm
      ? {
        ID: entity.ID,
        ...defaultValues,
        ...this.mObj,
      }
      : {
        ID: entity.ID,
        ...this.mObj,
      };

    if (saveObj.districts) {
      let ds = saveObj.districts;
      saveObj.CountyID = ds[0].value;
      saveObj.CountyName = ds[0].label;
      saveObj.NeighborhoodsID = ds[1].value;
      saveObj.NeighborhoodsName = ds[1].label;

      delete saveObj.districts;
    }
    if (saveObj.BZTime) {
      saveObj.BZTime = saveObj.BZTime.format();
    }
    if (entity.ApplicantType) {
      saveObj.ApplicantType = entity.ApplicantType;
    }
    if (entity.SBLY && entity.SBLY.length > 0) {
      saveObj.SBLY = entity.SBLY;
    }
    if(entity.NeighborhoodsID){
      saveObj.NeighborhoodsID = entity.NeighborhoodsID;
    }

    // 受理人、受理日期
    saveObj.SLUser = entity.SLR;
    saveObj.SLTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');

    let validateObj = {
      ...entity,
      ...saveObj,
    };
    if (doorplateType != 'DoorplateBatchDelete') {
      // 行政区必填
      if (!(validateObj.CountyID && validateObj.NeighborhoodsID)) {
        errs.push('请选择行政区');
      }

      if (!validateObj.ViligeName) {
        errs.push('请填写自然村名');
      }

      if (!validateObj.MPNumber) {
        errs.push('请填写门牌号码');
      }

      // 是否是标准地址验证
      if (checkMP == true) {
        if (!validateObj.MPSize) {
          errs.push('请选择门牌规格');
        }
      }
    }

    // 邮寄地址验证
    // if (validateObj.MPMail && !validateObj.MailAddress) {
    //   errs.push('请填写邮寄地址');
    // }

    if (checkMP != true && doorplateType != 'DoorplateEdit') {
      // 申办人 必填
      if (!validateObj.Applicant) {
        errs.push('请填写申办人');
      }

      // 申办人-联系电话 必填
      if (!validateObj.ApplicantPhone) {
        errs.push('请填写申办人的联系电话');
      }

      // 申办人-证件类型 必填
      if (!validateObj.ApplicantType) {
        errs.push('请填写申办人的证件类型');
      }

      // 申办人-证件号码 必填
      if (!validateObj.ApplicantNumber) {
        errs.push('请填写申办人的证件号码');
      }

      // 申办人-编制日期 必填
      if (!validateObj.BZTime) {
        errs.push('请填写申办人的编制日期');
      }
    }

    return { errs, saveObj, validateObj };
  }

  onSaveClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function (err, values) {
        let errors = [];
        // form 的验证错误
        if (err) {
          for (let i in err) {
            let j = err[i];
            if (j.errors) {
              errors = errors.concat(j.errors.map(item => item.message));
            }
          }
        }

        let { errs, saveObj } = this.validate(errors);
        if (errs.length) {
          Modal.error({
            title: '错误',
            okText: '知道了',
            content: errs.map((e, i) => (
              <div>
                {i + 1}、{e}；
              </div>
            )),
          });
        } else {
          var cThis = this;
          if (this.props.doorplateType == 'DoorplateDelete') {
            this.destroy(
              saveObj,
              this.props.MPGRSQType == undefined ? this.props.FormType : this.props.MPGRSQType,
              cThis
            );
          } else if (this.props.doorplateType == 'DoorplateBatchDelete') {
            this.batchDelete(
              this.props.ids,
              saveObj,
              this.props.MPGRSQType == undefined ? this.props.FormType : this.props.MPGRSQType,
              cThis
            );
          } else if (this.props.doorplateType == 'DoorplateEdit') {
            let user = getUser();
            saveObj.Applicant = user.userName;
            saveObj.ApplicantType = user.ZZJGDM_Type;
            saveObj.ApplicantNumber = user.ZZJGDM;
            saveObj.ApplicantPhone = user.Telephone;
            saveObj.SLUser = user.userName;
            saveObj.SLTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
            this.save(saveObj, 'grbg', cThis);
          } else {
            this.save(
              saveObj,
              this.props.MPGRSQType == undefined ? this.props.FormType : this.props.MPGRSQType,
              cThis
            );
          }
        }
      }.bind(this)
    );
  };

  onReturnClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function (err, values) {
        let errors = [];
        // form 的验证错误
        if (err) {
          for (let i in err) {
            let j = err[i];
            if (j.errors) {
              errors = errors.concat(j.errors.map(item => item.message));
            }
          }
        }

        let { errs, saveObj } = this.validate(errors);
        if (errs.length) {
          Modal.error({
            title: '错误',
            okText: '知道了',
            content: errs.map((e, i) => (
              <div>
                {i + 1}、{e}；
              </div>
            )),
          });
        } else {
          Modal.confirm({
            title: '提醒',
            content: '是否确认退件？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
              let { entity } = this.state;
              let { WSSQ_INFO } = this.props;
              if (WSSQ_INFO && WSSQ_INFO.blType && WSSQ_INFO.blType.length > 0) {
                this.deletePersonMP(WSSQ_INFO.WSSQ_DATA.ID, entity.SLR, 'Country');
              }
            },
          });
        }
      }.bind(this)
    );
  };
  // 网上申请-门牌-退件
  async deletePersonMP(ID, SLUser, Type) {
    let rt = await Post(url_DeletePersonMP, { ID: ID, SLTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), SLUser: SLUser, Type: Type });
    rtHandle(rt, d => {
      notification.success({ description: '退件成功！', message: '成功' });
    });
  }
  // 网上申请-一网一端-已办
  async getPersonDoneMPBusiness(ID, SLUser) {
    let rt = await Post(url_GetPersonDoneMPBusiness, { ID: ID, DoneTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), DoneUser: SLUser });
    rtHandle(rt, d => {
      // notification.success({ description: '退件成功！', message: '成功' });
    });
  }

  // 保存
  async save(obj, item, cThis) {
    await Post(url_ModifyCountryMP, { oldDataJson: JSON.stringify(obj), item: item }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      cThis.mObj = {};
      if (cThis.props.onSaveSuccess) {
        cThis.props.onSaveSuccess();
      }
      this.setState({ saveBtnClicked: true });
      this.props.clickSaveBtn();
      // cThis.getFormData(cThis.state.entity.ID);
      // 如果是个人中心跳转过来的待办事项，要标记为已办
      let { entity } = cThis.state;
      let { WSSQ_INFO } = cThis.props;
      if (WSSQ_INFO && WSSQ_INFO.WSSQ_DATA) {
        cThis.getPersonDoneMPBusiness(WSSQ_INFO.WSSQ_DATA.ID, entity.SLR);
      }
    });
  }

  // 注销
  async destroy(obj, item, cThis) {
    await Post(
      url_CancelCountryMP,
      { ID: obj.ID, oldDataJson: JSON.stringify(obj), item: item },
      e => {
        notification.success({ description: '注销成功！', message: '成功' });
        cThis.mObj = {};
        cThis.backToSearch();
      }
    );
  }

  // 批量删除
  async batchDelete(ids, obj, item, cThis) {
    await Post(
      url_CancelCountryMPByList,
      { ID: ids, oldDataJson: JSON.stringify(obj), item: item },
      e => {
        notification.success({ description: '注销成功！', message: '成功' });

        this.props.onCancel();
      }
    );
  }

  // 取消
  onCancel() {
    if (this.state.saveBtnClicked) {
      Modal.confirm({
        title: '提醒',
        content: '是否放弃所做的修改？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          this.backToSearch();
        },
        onCancel() { },
      });
    } else {
      if (this.removeFileInfo['ID'].length > 0) {
        this.deleteUploadFiles(this.removeFileInfo);
      } else {
        this.backToSearch();
      }
    }
  }

  backToSearch() {
    this.props.history.push({
      pathname: '/placemanage/doorplate/doorplatesearchnew',
      state: {
        activeTab: 'VGForm',
      },
    });
  }

  // 未保存时删除上传的附件
  async deleteUploadFiles(info) {
    await Post(url_RemovePicture, info, d => {
      this.backToSearch();
    });
  }

  isSaved() {
    let saved = true;
    for (let i in this.mObj) {
      saved = false;
      break;
    }
    return saved;
  }

  onPrintMPZ() {
    if (this.isSaved()) {
      // 打印
      this.setState({ showMPZForm: true });
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  onPrintMPZ_cj() {
    if (this.state.saveBtnClicked) {
      this.setState({ showMPZForm_cj: true });
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  onPrintDMZM() {
    if (this.isSaved()) {
      this.setState({ showProveForm: true });
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  onPrintDMZM_cj() {
    if (this.state.saveBtnClicked) {
      printMPZ_cj([this.state.entity.ID], 'CountryMP', '地名证明');
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  closeProveForm() {
    this.setState({ showProveForm: false });
  }

  closeMPZForm() {
    this.setState({ showMPZForm: false });
  }

  closeMPZForm_cj() {
    this.setState({ showMPZForm_cj: false });
  }

  componentDidMount() {
    this.getDistricts();
    this.getMPSizeByMPType();
    this.getFormData();
    if (this.props.doorplateType != undefined && this.props.doorplateType != 'DoorplateBatchDelete')
      this.props.onRef(this);

    let user = getUser();
    let { entity } = this.state;
    entity.SLR = user.userName;
    this.setState({ entity: entity });
  }

  //设置证件类型数据
  setZjlxData(val) {
    this.props.form.setFieldsValue({
      // IDType: val,
      ApplicantType: val,
    });
  }
  //获取不置灰数组
  getDontDisabledGroup() {
    if (this.props.doorplateType == 'DoorplateChange') {
      return MpbgDisabled;
    }
    if (
      this.props.doorplateType == 'DoorplateDelete' ||
      this.props.doorplateType == 'DoorplateReplace'
    ) {
      return MpzxDisabled;
    }
    if (this.props.showDetailForm) {
      return MpxqDisabled;
    }
    if (this.props.doorplateType == 'DoorplateProve') {
      return MpzmDisabled;
    }
  }

  getZjlx(FormType, val) {
    if (FormType != undefined) {
      if (FormType.indexOf('gr') != -1) {
        return zjlx[0];
      } else if (FormType.indexOf('dw') != -1) {
        return zjlx[1];
      } else {
        return null;
      }
    } else {
      if (val != null) {
        return val;
      } else {
        return null;
      }
    }
  }

  getSelectGroup(val) {
    var sg = zjlx.map(d => (
      <Select.Option key={d} value={d}>
        {d}
      </Select.Option>
    ));
    if (val != null) {
      sg = <Select.Option value={val}>{val}</Select.Option>;
    }
    return sg;
  }

  // 是否置灰
  isDisabeld(name) {
    const { doorplateType, showDetailForm } = this.props;
    let { saveBtnClicked } = this.state;
    // form中有个别项目需要置灰
    var hasItemDisabled =
      doorplateType == 'DoorplateChange' ||
        doorplateType == 'DoorplateDelete' ||
        doorplateType == 'DoorplateReplace' ||
        doorplateType == 'DoorplateProve' ||
        showDetailForm
        ? true
        : false;
    // 不置灰字段group
    var dontDisabledGroup = this.getDontDisabledGroup();

    if (saveBtnClicked == true || showDetailForm == true) {
      return true;
    } else {
      if (hasItemDisabled == true) {
        if (doorplateType == 'DoorplateProve') {
          if (dontDisabledGroup[name] == undefined) {
            return false;
          } else {
            return true;
          }
        } else {
          if (dontDisabledGroup[name] == undefined) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  }

  // 空间定位是否可编辑
  getKjdwEdit() {
    let { doorplateType } = this.props;
    if (
      doorplateType == 'DoorplateAdd' ||
      doorplateType == 'DoorplateChange' ||
      doorplateType == 'DoorplateEdit'
    ) {
      return true;
    }
    if (
      doorplateType == 'DMXQ' ||
      doorplateType == 'DoorplateReplace' ||
      doorplateType == 'DoorplateDelete'
    ) {
      return false;
    }
  }

  // 根据当前事项返回对应label名称，如变更原因
  getReasonType(doorplateType) {
    var reason = '';
    if (doorplateType == 'DoorplateChange') {
      reason = '变更原因';
    }
    if (doorplateType == 'DoorplateDelete') {
      reason = '注销原因';
    }
    return reason;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let {
      showAttachment,
      showMPZForm,
      showMPZForm_cj,
      showProveForm,
      newForm,
      showLoading,
      showLocateMap,
      entity,
      mpTypes,
      districts,
      communities,
      viliges,
      postCodes,
      saveBtnClicked,
    } = this.state;
    const { edit } = this;
    const { doorplateType, showDetailForm, FormType, MPGRSQType, WSSQ_INFO } = this.props;
    var From_Grzx = WSSQ_INFO && WSSQ_INFO.blType; // 是否来自个人中心
    var Grzx_Item = From_Grzx ? (WSSQ_INFO.blType.indexOf('MP') != -1 ? '门牌管理' : '地名证明') : ''; // 个人中心-事项类型：门牌管理、地名证明
    var WSSQ_DATA = WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? WSSQ_INFO.WSSQ_DATA : {};
    var reasonType = this.getReasonType(doorplateType);
    var highlight = doorplateType == 'DoorplateChange' ? true : false; //门牌变更某些字段需要高亮
    var btnDisabled =
      doorplateType == 'DoorplateChange' ||
        doorplateType == 'DoorplateDelete' ||
        doorplateType == 'DoorplateReplace' ||
        doorplateType == 'DoorplateProve' ||
        showDetailForm
        ? true
        : false;

    // var jb_zjlx = this.getZjlx(FormType, entity.IDType);
    // this.mObj.IDType = jb_zjlx;
    // var jb_selectGroup = this.getSelectGroup(jb_zjlx);
    var jb_selectGroup = zjlx.map(d => (
      <Select.Option key={d} value={d}>
        {d}
      </Select.Option>
    ));
    var sb_zjlx = this.getZjlx(FormType, entity.ApplicantType);
    this.mObj.ApplicantType = sb_zjlx;
    var sb_selectGroup = this.getSelectGroup(sb_zjlx);
    var allowEdit = this.getKjdwEdit();

    return (
      <div className={st.HDForm}>
        <Spin
          className={showLoading ? 'active' : ''}
          spinning={showLoading}
          size="large"
          tip="数据加载中..."
        />
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <Form>
            {/* 基本信息 */}
            {doorplateType == 'DoorplateBatchDelete' ? null : (
              <div className={st.group}>
                <div className={st.grouptitle}>
                  基本信息<span>说明：“ * ”号标识的为必填项</span>
                </div>
                <div className={st.groupcontent}>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='申报行政区划'
                        >
                          {getFieldDecorator('SBXZQH', {
                            initialValue: WSSQ_DATA.NeighborhoodsID,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>行政区划
                          </span>
                        }
                      >
                        <Cascader
                          value={entity.Districts}
                          expandTrigger="hover"
                          options={districts}
                          placeholder="行政区划"
                          onChange={(a, b) => {
                            this.mObj.districts = b;
                            let { entity } = this.state;
                            entity.Districts = a;
                            this.getCommunities(a);
                            this.setState({ entity: entity });
                            this.combineStandard();
                          }}
                          disabled={this.isDisabeld('Districts')}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="村社区">
                        <Select
                          allowClear
                          placeholder="村社区"
                          showSearch={true}
                          mode="combobox"
                          onSearch={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
                            this.setState({ entity: entity }, this.combineStandard.bind(this));
                          }}
                          onChange={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
                            this.setState({ entity: entity }, this.combineStandard.bind(this));
                          }}
                          onSelect={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
                            this.getViliges(e);
                            this.getPostCodes(e);
                            this.setState({ entity: entity }, this.combineStandard.bind(this));
                          }}
                          defaultValue={entity.CommunityName || undefined}
                          value={entity.CommunityName || undefined}
                          disabled={this.isDisabeld('CommunityName')}
                        >
                          {communities.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮政编码">
                        <Select
                          allowClear
                          placeholder="邮政编码"
                          showSearch={true}
                          mode="combobox"
                          onSearch={e => {
                            this.mObj.Postcode = e;
                            let { entity } = this.state;
                            entity.Postcode = e;
                            this.setState({ entity: entity });
                          }}
                          onChange={e => {
                            this.mObj.Postcode = e;
                            let { entity } = this.state;
                            entity.Postcode = e;
                            this.setState({ entity: entity });
                          }}
                          onSelect={e => {
                            this.mObj.Postcode = e;
                            let { entity } = this.state;
                            entity.Postcode = e;
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.Postcode || undefined}
                          value={entity.Postcode || undefined}
                          disabled={this.isDisabeld('Postcode')}
                        >
                          {postCodes.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={<span className={highlight ? st.labelHighlight : null}>产权人</span>}
                      >
                        {getFieldDecorator('PropertyOwner', {
                          initialValue: entity.PropertyOwner,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.PropertyOwner = e.target.value;
                            }}
                            placeholder="产权人"
                            disabled={this.isDisabeld('PropertyOwner')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span className={highlight ? st.labelHighlight : null}>证件类型</span>
                        }
                      >
                        {getFieldDecorator('IDType', {
                          initialValue: entity.IDType,
                        })(
                          <Select
                            allowClear
                            onChange={e => {
                              this.mObj.IDType = e || '';
                            }}
                            placeholder="证件类型"
                            disabled={this.isDisabeld('IDType')}
                          >
                            {jb_selectGroup}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span className={highlight ? st.labelHighlight : null}>证件号码</span>
                        }
                      >
                        {getFieldDecorator('IDNumber', {
                          initialValue: entity.IDNumber,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.IDNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                            disabled={this.isDisabeld('IDNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>自然村名称
                          </span>
                        }
                      >
                        <Select
                          allowClear
                          mode="combobox"
                          onSearch={e => {
                            this.mObj.ViligeName = e;
                            let { entity } = this.state;
                            entity.ViligeName = e;
                            this.setState({ entity: entity }, this.combineStandard.bind(this));
                          }}
                          onChange={e => {
                            this.mObj.ViligeName = e;
                            let { entity } = this.state;
                            entity.ViligeName = e;
                            this.setState({ entity: entity }, this.combineStandard.bind(this));
                          }}
                          onSelect={e => {
                            this.mObj.ViligeName = e;
                            let { entity } = this.state;
                            entity.ViligeName = e;
                            this.setState({ entity: entity }, this.combineStandard.bind(this));
                          }}
                          defaultValue={entity.ViligeName || undefined}
                          value={entity.ViligeName || undefined}
                          placeholder="自然村名称"
                          showSearch
                          disabled={this.isDisabeld('ViligeName')}
                        >
                          {viliges.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>

                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>门牌号码
                          </span>
                        }
                      >
                        {getFieldDecorator('MPNumber', {
                          initialValue: entity.MPNumber,
                          rules: [{ require: true }],
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.MPNumber = e.target.value;
                              this.combineStandard();
                            }}
                            placeholder="门牌号码"
                            disabled={this.isDisabeld('MPNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户室号">
                        {getFieldDecorator('HSNumber', {
                          initialValue: entity.HSNumber,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.HSNumber = e.target.value;
                              this.combineStandard();
                            }}
                            placeholder="户室号"
                            disabled={this.isDisabeld('HSNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>门牌规格
                          </span>
                        }
                      >
                        {getFieldDecorator('MPSize', {
                          initialValue: entity.MPSize,
                        })(
                          <Select
                            allowClear
                            onChange={e => {
                              this.mObj.MPSize = e || '';
                            }}
                            placeholder="门牌规格"
                            disabled={this.isDisabeld('MPSize')}
                          >
                            {mpTypes.map(d => (
                              <Select.Option key={d} value={d}>
                                {d}
                              </Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="原门牌地址">
                        {getFieldDecorator('OriginalMPAddress', {
                          initialValue: entity.OriginalMPAddress,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.OriginalMPAddress = e.target.value;
                            }}
                            placeholder="原门牌地址"
                            disabled={this.isDisabeld('OriginalMPAddress')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="原门牌证号">
                        {getFieldDecorator('AddressCoding2', {
                          initialValue: entity.AddressCoding2,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.AddressCoding2 = e.target.value;
                            }}
                            placeholder="原门牌证号"
                            disabled={this.isDisabeld('AddressCoding2')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={16}>
                        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={Grzx_Item == '门牌管理' ? '申报现门牌地址' : '申报现地名地址'}>
                          {getFieldDecorator('SBXMPDZ', {
                            initialValue: WSSQ_DATA.StandardAddress,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  <Row>
                    <Col span={16}>
                      <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label='标准地址'>
                        {getFieldDecorator('StandardAddress', {
                          initialValue: entity.StandardAddress,
                        })(<Input disabled={true} className={st.bzdz_Style} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem>
                        <Button
                          icon="check-circle"
                          onClick={this.checkMP.bind(this)}
                          style={{ marginLeft: '20px' }}
                          type="primary"
                          disabled={btnDisabled || saveBtnClicked}
                        >
                          验证地址
                        </Button>
                        &emsp;
                        <Button
                          type="primary"
                          icon="environment"
                          onClick={this.showLocateMap.bind(this)}
                          disabled={false}
                        >
                          空间定位
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                  {Grzx_Item == '门牌管理' && reasonType != '' ? (
                    <Row>
                      <Col span={16}>
                        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={reasonType}>
                          {getFieldDecorator('BGYY', {
                            initialValue: WSSQ_DATA.ModifyResult,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                </div>
              </div>
            )}
            {/* 产证信息 */}
            {doorplateType == 'DoorplateBatchDelete' ? null : (
              <div className={st.group}>
                <div className={st.grouptitle}>产证信息</div>
                <div className={st.groupcontent}>
                  {Grzx_Item == '门牌管理' ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='产权证号'
                        >
                          {getFieldDecorator('CQZH', {
                            initialValue: WSSQ_DATA.CQNumber,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {Grzx_Item == '地名证明' ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='持证人'
                        >
                          {getFieldDecorator('CZR', {
                            initialValue: WSSQ_DATA.CertificateHolder,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="房产证地址">
                        {getFieldDecorator('FCZAddress', { initialValue: entity.FCZAddress })(
                          <Input
                            onChange={e => {
                              this.mObj.FCZAddress = e.target.value;
                            }}
                            placeholder="房产证地址"
                            disabled={this.isDisabeld('FCZAddress')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="房产证号">
                        {getFieldDecorator('FCZNumber', { initialValue: entity.FCZNumber })(
                          <Input
                            onChange={e => {
                              this.mObj.FCZNumber = e.target.value;
                            }}
                            placeholder="房产证号"
                            disabled={this.isDisabeld('FCZNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证地址">
                        {getFieldDecorator('TDZAddress', { initialValue: entity.TDZAddress })(
                          <Input
                            onChange={e => {
                              this.mObj.TDZAddress = e.target.value;
                            }}
                            placeholder="土地证地址"
                            disabled={this.isDisabeld('TDZAddress')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证号">
                        {getFieldDecorator('TDZNumber', { initialValue: entity.TDZNumber })(
                          <Input
                            onChange={e => {
                              this.mObj.TDZNumber = e.target.value;
                            }}
                            placeholder="土地证号"
                            disabled={this.isDisabeld('TDZNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确权证地址">
                        {getFieldDecorator('QQZAddress', {
                          initialValue: entity.QQZAddress,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.QQZAddress = e.target.value;
                            }}
                            placeholder="确权证地址"
                            disabled={this.isDisabeld('QQZAddress')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确权证证号">
                        {getFieldDecorator('QQZNumber', {
                          initialValue: entity.QQZNumber,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.QQZNumber = e.target.value;
                            }}
                            placeholder="确权证证号"
                            disabled={this.isDisabeld('QQZNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="其它地址">
                        {getFieldDecorator('OtherAddress', { initialValue: entity.OtherAddress })(
                          <Input
                            onChange={e => {
                              this.mObj.OtherAddress = e.target.value;
                            }}
                            placeholder="其它地址"
                            disabled={this.isDisabeld('OtherAddress')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="备注">
                        {getFieldDecorator('Remarks', { initialValue: entity.Remarks })(
                          <TextArea
                            onChange={e => {
                              this.mObj.Remarks = e.target.value;
                            }}
                            placeholder="备注"
                            autosize={{ minRows: 2 }}
                            disabled={this.isDisabeld('Remarks')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
            {/* 申办信息-每次都重新填入， 详情时不显示 */}
            {showDetailForm == true || doorplateType == 'DoorplateEdit' ? null : (
              <div className={st.group}>
                <div className={st.grouptitle}>申办人信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>
                            <span className={highlight ? st.labelHighlight : null}>申办人</span>
                          </span>
                        }
                      >
                        {getFieldDecorator('Applicant', {
                          initialValue: entity.Applicant,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                            disabled={this.isDisabeld('Applicant')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>
                            <span className={highlight ? st.labelHighlight : null}>联系电话</span>
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantPhone', {
                          initialValue: entity.ApplicantPhone,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                            disabled={this.isDisabeld('ApplicantPhone')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span className={highlight ? st.labelHighlight : null}>联系地址</span>
                        }
                      >
                        {getFieldDecorator('ApplicantAddress', {
                          initialValue: entity.ApplicantAddress,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.ApplicantAddress = e.target.value;
                            }}
                            placeholder="联系地址"
                            disabled={this.isDisabeld('ApplicantAddress')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>
                            <span className={highlight ? st.labelHighlight : null}>证件类型</span>
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantType', {
                          initialValue: sb_zjlx,
                        })(
                          <Select
                            allowClear
                            onChange={e => {
                              entity.ApplicantType = e || '';
                              this.setState({ entity: entity });
                            }}
                            placeholder="证件类型"
                            disabled={this.isDisabeld('ApplicantType')}
                          >
                            {jb_selectGroup}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>
                            <span className={highlight ? st.labelHighlight : null}>证件号码</span>
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantNumber', {
                          initialValue: entity.ApplicantNumber,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                            disabled={this.isDisabeld('ApplicantNumber')}
                          />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>
                            <span className={highlight ? st.labelHighlight : null}>编制日期</span>
                          </span>
                        }
                      >
                        {getFieldDecorator('BZTime', {
                          initialValue: entity.BZTime,
                        })(
                          <DatePicker
                            onChange={e => {
                              this.mObj.BZTime = e;
                            }}
                            disabled={this.isDisabeld('BZTime')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  {doorplateType == 'DoorplateAdd' ||
                    doorplateType == 'DoorplateChange' ||
                    doorplateType == 'DoorplateReplace' ? (
                      <Row>
                        <Col span={4}>
                          <FormItem style={{ textAlign: 'right' }}>
                            {getFieldDecorator('MPProduce', {
                              valuePropName: 'checked',
                              initialValue: entity.MPProduce === 1,
                            })(
                              <Checkbox
                                onChange={e => {
                                  this.mObj.MPProduce = e.target.checked ? 1 : 0;
                                }}
                                disabled={this.isDisabeld('MPProduce')}
                              >
                                <span className={highlight ? st.labelHighlight : null}>制作门牌</span>
                              </Checkbox>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem style={{ textAlign: 'right' }}>
                            {getFieldDecorator('MPMail', {
                              valuePropName: 'checked',
                              initialValue: entity.MPMail === 1,
                            })(
                              <Checkbox
                                onChange={e => {
                                  this.mObj.MPMail = e.target.checked ? 1 : 0;
                                }}
                                disabled={this.isDisabeld('MPMail')}
                              >
                                <span className={highlight ? st.labelHighlight : null}>邮寄门牌</span>
                              </Checkbox>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            label={
                              <span>
                                <span className={highlight ? st.labelHighlight : null}>邮寄地址</span>
                              </span>
                            }
                          >
                            {getFieldDecorator('MailAddress', {
                              initialValue: entity.MailAddress,
                            })(
                              <Input
                                onChange={e => {
                                  this.mObj.MailAddress = e.target.value;
                                }}
                                placeholder="邮寄地址"
                                disabled={this.isDisabeld('MailAddress')}
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    ) : null}

                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="受理人">
                        {getFieldDecorator('SLR', {
                          initialValue: entity.SLR,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="受理日期">
                        {getFieldDecorator('SLRQ', {
                          initialValue: entity.SLRQ,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='领取方式'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiveWay,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收货人姓名'
                        >
                          {getFieldDecorator('SHRXM', {
                            initialValue: WSSQ_DATA.ReceiverName,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='联系方式（收货人）'
                        >
                          {getFieldDecorator('LXFS', {
                            initialValue: WSSQ_DATA.ReceiverPhone,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收件地址（收货人）'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiverAddress,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                </div>
              </div>
            )}
            
            {/* 待办事项附件-展示 */}
            {showAttachment != false && WSSQ_INFO && WSSQ_INFO.blType ? (
              <Authorized>
                <AttachForm
                  FormType={FormType}
                  MPGRSQType={MPGRSQType}
                  entity={entity}
                  FileType="Country"
                  doorplateType='GrzxYwydMp'
                  setDeleteFilesInfo={(ID, FileType, ItemType, time) => {
                    this.removeFileInfo['ID'].push(ID);
                    this.removeFileInfo['FileType'] = FileType;
                    this.removeFileInfo['ItemType'] = ItemType;
                    // this.removeFileInfo['time'] = time;
                  }}
                  saveBtnClicked={saveBtnClicked}
                  WSSQ_INFO={WSSQ_INFO}
                />
              </Authorized>
            ) : null}

            {/* 附件上传 */}
            {showAttachment === false ? null : (
              <Authorized>
                <AttachForm
                  FormType={FormType}
                  MPGRSQType={MPGRSQType}
                  entity={entity}
                  FileType="Country"
                  doorplateType={doorplateType}
                  setDeleteFilesInfo={(ID, FileType, ItemType, time) => {
                    this.removeFileInfo['ID'].push(ID);
                    this.removeFileInfo['FileType'] = FileType;
                    this.removeFileInfo['ItemType'] = ItemType;
                    // this.removeFileInfo['time'] = time;
                  }}
                  saveBtnClicked={saveBtnClicked}
                  WSSQ_INFO={WSSQ_INFO}
                />
              </Authorized>
            )}
          </Form>
        </div>
        {showDetailForm == true ? null : (
          <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
            {edit && saveBtnClicked ? (
              <div style={{ float: 'left' }}>
                {doorplateType == 'DoorplateProve' ? null : (
                  <Button type="primary" onClick={this.onPrintMPZ_cj.bind(this)}>
                    打印门牌证
                  </Button>
                )}
                &emsp;
                <Button type="primary" onClick={this.onPrintDMZM_cj.bind(this)}>
                  开具地名证明
                </Button>
              </div>
            ) : null}
            <div style={{ float: 'right' }}>
              {edit ? (
                <Button
                  onClick={this.onSaveClick.bind(this)}
                  type="primary"
                  disabled={saveBtnClicked}
                >
                  {doorplateType == 'DoorplateDelete' ? '注销' : '保存'}
                </Button>
              ) : null}
              &emsp;
              {WSSQ_INFO && WSSQ_INFO.blType && WSSQ_INFO.blType.length > 0 ? (
                <span>
                  <Button
                    onClick={this.onReturnClick.bind(this)}
                    type="primary"
                    disabled={saveBtnClicked}
                  >
                    退件
                  </Button>
                  &emsp;
                </span>
              ) : null}
              <Button type="default" onClick={this.onCancel.bind(this)}>
                取消
              </Button>
            </div>
          </div>
        )}
        {/* 定位 */}
        <Modal
          wrapClassName={st.locatemap}
          visible={showLocateMap}
          destroyOnClose={true}
          onCancel={this.closeLocateMap.bind(this)}
          title="定位"
          footer={null}
        >
          <LocateMap
            onMapReady={lm => {
              let { MPPositionX, MPPositionY } = this.state.entity;
              if (MPPositionX && MPPositionY) {
                lm.mpLayer = L.marker([MPPositionY, MPPositionX], { icon: mp }).addTo(lm.map);
                lm.map.setView([MPPositionY, MPPositionX], 16);
              }
            }}
            onMapClear={lm => {
              lm.mpLayer && lm.mpLayer.remove();
              lm.mpLayer = null;
              let { entity } = this.state;
              entity.MPPositionX = null;
              entity.MPPositionY = null;
              this.mObj.MPPositionX = entity.MPPositionX;
              this.mObj.MPPositionY = entity.MPPositionY;
            }}
            beforeBtns={[
              {
                id: 'locate',
                name: '门牌定位',
                icon: 'icon-dingwei',
                onClick: (dom, i, lm) => {
                  if (!lm.locatePen) {
                    lm.locatePen = new L.Draw.Marker(lm.map, { icon: mp });
                    lm.locatePen.on(L.Draw.Event.CREATED, e => {
                      lm.mpLayer && lm.mpLayer.remove();
                      var { layer } = e;
                      lm.mpLayer = layer;
                      layer.addTo(lm.map);
                    });
                  }
                  lm.disableMSTools();
                  if (lm.locatePen._enabled) {
                    lm.locatePen.disable();
                  } else {
                    lm.locatePen.enable();
                  }
                },
              },
              {
                id: 'savelocation',
                name: '保存定位',
                icon: 'icon-save',
                onClick: (dom, item, lm) => {
                  let { lat, lng } = lm.mpLayer.getLatLng();
                  let { entity } = this.state;

                  entity.MPPositionX = lng.toFixed(8) - 0;
                  entity.MPPositionY = lat.toFixed(8) - 0;

                  this.mObj.MPPositionX = entity.MPPositionX;
                  this.mObj.MPPositionY = entity.MPPositionY;

                  this.setState({
                    entity: entity,
                  });
                  this.closeLocateMap();
                },
              },
            ]}
            allowEdit={allowEdit}
          />
        </Modal>
        <Modal
          visible={showProveForm}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeProveForm.bind(this)}
          title="开具地名证明"
          footer={null}
          width={800}
        >
          <ProveForm
            id={entity.ID}
            type="CountryMP"
            onCancel={this.closeProveForm.bind(this)}
            onOKClick={this.closeProveForm.bind(this)}
          />
        </Modal>
        <Modal
          visible={showMPZForm}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeMPZForm.bind(this)}
          title="打印门牌证"
          footer={null}
          width={800}
        >
          <MPZForm
            id={entity.ID}
            type="CountryMP"
            onCancel={this.closeMPZForm.bind(this)}
            onOKClick={this.closeMPZForm.bind(this)}
          />
        </Modal>
        <Modal
          visible={showMPZForm_cj}
          bodyStyle={{ padding: '10px 20px 0' }}
          destroyOnClose={true}
          onCancel={this.closeMPZForm_cj.bind(this)}
          title="设置原门牌证地址【打印门牌证】"
          footer={null}
          width={800}
        >
          <MPZForm_cj
            id={entity.ID}
            type="CountryMP"
            onCancel={this.closeMPZForm_cj.bind(this)}
            onPrint={this.closeMPZForm_cj.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

VGForm = Form.create()(VGForm);
export default withRouter(VGForm);
