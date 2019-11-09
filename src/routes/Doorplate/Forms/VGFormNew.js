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
  Checkbox,
  Modal,
  Spin,
  notification,
} from 'antd';
const { TextArea } = Input;
import { zjlx, MpbgDisabled, MpzxDisabled, MpxqDisabled } from '../../../common/enums.js';
import st from './HDFormNew.less';

import {
  baseUrl,
  url_SearchCountryMPID,
  url_GetMPSizeByMPType,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_GetDistrictTreeFromDistrict,
  url_GetPostCodes,
  url_ModifyCountryMP,
  url_CancelCountryMP,
  url_GetNamesFromDic,
  url_CheckCountryMPIsAvailable,
  url_CancelCountryMPByList,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistricts } from '../../../utils/utils.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import ProveForm from '../../../routes/ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import MPZForm_cj from '../../ToponymyProve/MPZForm_cj';
import { getDivIcons } from '../../../components/Maps/icons';
import { printMPZ_cj } from '../../../common/Print/LodopFuncs';
import AttachForm from './AttachForm';
import Authorized from '../../../utils/Authorized4';
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
    entity: { ...defaultValues, CreateTime: moment() },
    mpTypes: [],
    newForm: true,
    viliges: [],
    communities: [],
    postCodes: [],
  };

  mObj = {};

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
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取门牌数据
    if (id) {
      let rt = await Post(url_SearchCountryMPID, { id: id });
      rtHandle(rt, d => {
        let districts = [d.CountyID, d.NeighborhoodsID];

        d.Districts = districts;
        d.BZTime = d.BZTime ? moment(d.BZTime) : null;
        d.ArchiveFileTime = d.ArchiveFileTime ? moment(d.ArchiveFileTime) : null;
        d.CancelTime = d.CancelTime ? moment(d.CancelTime) : null;
        d.CreateTime = d.CreateTime ? moment(d.CreateTime) : null;
        d.DataPushTime = d.DataPushTime ? moment(d.DataPushTime) : null;
        d.DelTime = d.DelTime ? moment(d.DelTime) : null;
        d.InfoReportTime = d.InfoReportTime ? moment(d.InfoReportTime) : null;
        d.LastModifyTime = d.LastModifyTime ? moment(d.LastModifyTime) : null;
        d.MPProduceTime = d.MPProduceTime ? moment(d.MPProduceTime) : null;

        this.setState({ entity: d, newForm: false });
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

  validate(errs, bAdrress) {
    errs = errs || [];
    let { entity, newForm } = this.state;

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

    let validateObj = {
      ...entity,
      ...saveObj,
    };

    if (this.props.doorplateType != 'DoorplateBatchDelete') {
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
      if (!bAdrress) {
        if (!validateObj.MPSize) {
          errs.push('请选择门牌规格');
        }
      }
    }

    // 邮寄地址验证
    if (validateObj.MPMail && !validateObj.MailAddress) {
      errs.push('请填写邮寄地址');
    }
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

    return { errs, saveObj, validateObj };
  }

  onSaveClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function(err, values) {
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

  async save(obj, item, cThis) {
    await Post(url_ModifyCountryMP, { oldDataJson: JSON.stringify(obj), item: item }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      cThis.mObj = {};
      if (cThis.props.onSaveSuccess) {
        cThis.props.onSaveSuccess();
      }
      cThis.getFormData(cThis.state.entity.ID);

      if (
        cThis.props.doorplateType == 'DoorplateChange' ||
        cThis.props.doorplateType == 'DoorplateDelete'
      ) {
        cThis.props.history.push({
          pathname: '/placemanage/doorplate/doorplatesearchnew',
          state: {
            activeTab: 'VillageDoorplate',
          },
        });
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

        if (
          cThis.props.doorplateType == 'DoorplateChange' ||
          cThis.props.doorplateType == 'DoorplateDelete'
        ) {
          cThis.props.history.push({
            pathname: '/placemanage/doorplate/doorplatesearchnew',
            state: {
              activeTab: 'HouseDoorplate',
            },
          });
        }
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
    if (this.isSaved()) {
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
    if (this.isSaved()) {
      printMPZ_cj([this.state.entity.ID], 'CountryMP', '地名证明');
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  closeProveForm() {
    this.setState({ showProveForm: false });
  }

  closeMPZForm_cj() {
    this.setState({ showMPZForm_cj: false });
  }

  closeMPZForm() {
    this.setState({ showMPZForm: false });
  }

  onCancel() {
    if (!this.isSaved()) {
      Modal.confirm({
        title: '提醒',
        content: '是否放弃所做的修改？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          this.props.onCancel && this.props.onCancel();
        },
        onCancel() {},
      });
    } else {
      this.props.onCancel && this.props.onCancel();
    }
  }

  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }

  componentDidMount() {
    this.getDistricts();
    this.getMPSizeByMPType();
    this.getFormData();
    if (this.props.doorplateType != undefined && this.props.doorplateType != 'DoorplateBatchDelete')
      this.props.onRef(this);
    let user = getUser();

    let { entity } = this.state;
    entity.CreateUser = user.userName;
    this.setState({ entity: entity });
  }

  //设置证件类型数据
  setZjlxData(val) {
    this.props.form.setFieldsValue({
      IDType: val,
    });
  }

  //获取不置灰数组
  getDontDisabledGroup() {
    if (this.props.doorplateType == 'DoorplateChange') {
      return MpbgDisabled;
    }
    if (this.props.doorplateType == 'DoorplateDelete') {
      return MpzxDisabled;
    }
    if (this.props.showDetailForm) {
      return MpxqDisabled;
    }
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
    } = this.state;
    const { edit } = this;
    const { doorplateType, showDetailForm } = this.props;
    var highlight = doorplateType == 'DoorplateChange' ? true : false; //门牌变更某些字段需要高亮
    var dontDisabledGroup = this.getDontDisabledGroup();
    var hasItemDisabled =
      doorplateType == 'DoorplateChange' || doorplateType == 'DoorplateDelete' || showDetailForm
        ? true
        : false; // form中需要有项目置灰

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
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Districts'] == undefined
                                ? true
                                : false
                              : false
                          }
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
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['CommunityName'] == undefined
                                ? true
                                : false
                              : false
                          }
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
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Postcode'] == undefined
                                ? true
                                : false
                              : false
                          }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['PropertyOwner'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                          initialValue: entity.IDType != undefined ? entity.IDType : '居民身份证',
                        })(
                          <Select
                            allowClear
                            onChange={e => {
                              this.mObj.IDType = e || '';
                            }}
                            placeholder="证件类型"
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['IDType'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          >
                            {zjlx.map(d => (
                              <Select.Option key={d} value={d}>
                                {d}
                              </Select.Option>
                            ))}
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['IDNumber'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ViligeName'] == undefined
                                ? true
                                : false
                              : false
                          }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['MPNumber'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['HSNumber'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['MPSize'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['OriginalMPAddress'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['AddressCoding2'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={16}>
                      <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="标准地址">
                        {getFieldDecorator('StandardAddress', {
                          initialValue: entity.StandardAddress,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem>
                        <Button
                          icon="check-circle"
                          onClick={this.checkMP.bind(this)}
                          style={{ marginLeft: '20px' }}
                          type="primary"
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['StandardAddress'] == undefined
                                ? true
                                : false
                              : false
                          }
                        >
                          验证地址
                        </Button>
                        &emsp;
                        <Button
                          type="primary"
                          icon="environment"
                          onClick={this.showLocateMap.bind(this)}
                          disabled={hasItemDisabled}
                        >
                          空间定位
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
            {/* 产证信息 */}
            {doorplateType == 'DoorplateBatchDelete' ? null : (
              <div className={st.group}>
                <div className={st.grouptitle}>产证信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证地址">
                        {getFieldDecorator('TDZAddress', {
                          initialValue: entity.TDZAddress,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.TDZAddress = e.target.value;
                            }}
                            placeholder="土地证地址"
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['TDZAddress'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证号">
                        {getFieldDecorator('TDZNumber', {
                          initialValue: entity.TDZNumber,
                        })(
                          <Input
                            onChange={e => {
                              this.mObj.TDZNumber = e.target.value;
                            }}
                            placeholder="土地证号"
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['TDZNumber'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['QQZAddress'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['QQZNumber'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['OtherAddress'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['Remarks'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
            {/* 申办人信息 */}
            {showDetailForm == true ? null : (
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['Applicant'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['ApplicantPhone'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['ApplicantAddress'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                          initialValue: entity.ApplicantType,
                        })(
                          <Select
                            allowClear
                            onChange={e => {
                              this.mObj.ApplicantType = e || '';
                            }}
                            placeholder="证件类型"
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['ApplicantType'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          >
                            {zjlx.map(d => (
                              <Select.Option key={d} value={d}>
                                {d}
                              </Select.Option>
                            ))}
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['ApplicantNumber'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['BZTime'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['MPProduce'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['MPMail'] == undefined
                                  ? true
                                  : false
                                : false
                            }
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
                            <span className={st.ired}>*</span>
                            <span className={highlight ? st.labelHighlight : null}>邮寄地址</span>
                          </span>
                        }
                      >
                        {getFieldDecorator('MailAddress', { initialValue: entity.MailAddress })(
                          <Input
                            onChange={e => {
                              this.mObj.MailAddress = e.target.value;
                            }}
                            placeholder="邮寄地址"
                            disabled={
                              hasItemDisabled
                                ? dontDisabledGroup['MailAddress'] == undefined
                                  ? true
                                  : false
                                : false
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="受理人">
                        {getFieldDecorator('CreateUser', {
                          initialValue: entity.CreateUser,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="受理日期">
                        {getFieldDecorator('CreateTime', {
                          initialValue: entity.CreateTime,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
            {/* 附件上传 */}
            {showAttachment === false ? null : (
              <Authorized>
                <AttachForm
                  FormType={this.props.FormType}
                  MPGRSQType={this.props.MPGRSQType}
                  entity={entity}
                  FileType="Country"
                  doorplateType={this.props.doorplateType}
                />
              </Authorized>
            )}
          </Form>
        </div>
        {showDetailForm == true ? null : (
          <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
            {newForm
              ? null
              : this.getEditComponent(
                  <div style={{ float: 'left' }}>
                    {/* <Button type="primary" onClick={this.onPrintMPZ.bind(this)}>
                      打印门牌证
                    </Button>
                    &emsp; */}
                    <Button type="primary" onClick={this.onPrintMPZ_cj.bind(this)}>
                      打印门牌证
                    </Button>
                    &emsp;
                    {/* <Button type="primary" onClick={this.onPrintDMZM.bind(this)}>
                      开具地名证明
                    </Button>
                    &emsp; */}
                    <Button type="primary" onClick={this.onPrintDMZM_cj.bind(this)}>
                      开具地名证明
                    </Button>
                  </div>
                )}
            <div style={{ float: 'right' }}>
              {this.getEditComponent(
                <Button onClick={this.onSaveClick.bind(this)} type="primary">
                  {doorplateType == 'DoorplateDelete' ? '注销' : '保存'}
                </Button>
              )}
              &emsp;
              <Button type="default" onClick={this.onCancel.bind(this)}>
                取消
              </Button>
            </div>
          </div>
        )}
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
              entity.MPPositionY = null;
              entity.MPPositionX = null;
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

                  this.mObj.MPPositionY = entity.MPPositionY;
                  this.mObj.MPPositionX = entity.MPPositionX;

                  this.setState({
                    entity: entity,
                  });
                  this.closeLocateMap();
                },
              },
            ]}
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
