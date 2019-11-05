import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Cascader,
  Select,
  Modal,
  Spin,
  notification,
  Table,
} from 'antd';
import st from './SettlementForm.less';

const { TextArea } = Input;

import {
  baseUrl,
  url_GetDistrictTreeFromDistrict,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_SettlementNameDM,
  url_SearchSettlementDMByID,
  url_ModifySettlementDM,
  url_DeleteSettlementDM,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { getUser } from '../../../utils/login';
import AttachForm from './AttachForm';
import { getDivIcons } from '../../../components/Maps/icons';
import { zjlx, DmxqDisabled, DmhbDisabled, DmxmDisabled } from '../../../common/enums.js';
import { GetNameRow } from './ComFormComponent.js';
const FormItem = Form.Item;
const { mp } = getDivIcons();
const columns = [
  {
    title: '行政区',
    dataIndex: 'CountyName',
  },
  {
    title: '镇街道',
    dataIndex: 'NeighborhoodsName',
  },
  {
    title: '村社区',
    dataIndex: 'CommunityName',
  },
  {
    title: '小类类别',
    dataIndex: 'Type',
  },
  ,
  {
    title: '拟用名称',
    dataIndex: 'Name',
  },
];
let data = [];

//地名管理，居民点表单
class SettlementForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }
  state = {
    showLoading: true,
    showLocateMap: false,
    districts: [],
    entity: {
      CreateTime: moment(),
      ApplicantTime: moment(),
      Districts: [],
      ShowDistricts: [],
    },
    newForm: true,
    communities: [],
    postCodes: [],
    showNameCheckModal: false,
    //表单创建时间
    FormTime: moment().format('YYYYMMDDhhmms'),
    choseSzxzq: undefined, //选择了所在行政区
  };
  // 存储修改后的数据
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
      let districts = getDistrictsWithJX(d);
      this.setState({ districts: districts });
    });
  }

  async getPostCodes(e) {
    let { entity } = this.state;
    this.setState({
      postCodes: [],
      entity: entity,
    });
    let rt = await Post(url_GetPostCodes, {
      NeighborhoodsID: entity.Districts[entity.Districts.length - 1],
      CommunityName: e,
    });
    rtHandle(rt, d => {
      this.setState({ postCodes: d });
    });
  }

  async getCommunities(e) {
    let { entity, communities } = this.state;
    if (communities.count > 0) return;
    this.setState({
      communities: [],
      entity: entity,
    });

    let rt = await Post(url_GetNamesFromDic, { type: 4, DistrictID: e[e.length - 1] });
    rtHandle(rt, d => {
      this.setState({ communities: d });
    });
  }

  //获取表单数据
  async getFormData(id) {
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取地名数据
    if (id) {
      let rt = await Post(url_SearchSettlementDMByID, { id: id });
      rtHandle(rt, d => {
        let districts = [d.CountyID, d.NeighborhoodsID];
        d.Districts = districts;

        d.ApplicantTime = d.ApplicantTime ? moment(d.ApplicantTime) : null;
        d.ArchiveFileTime = d.ArchiveFileTime ? moment(d.ArchiveFileTime) : null;
        d.CreateTime = d.CreateTime ? moment(d.CreateTime) : null;
        d.DataPushTime = d.DataPushTime ? moment(d.DataPushTime) : null;
        d.GMTime = d.GMTime ? moment(d.GMTime) : null;
        d.HBTime = d.HBTime ? moment(d.HBTime) : null;
        d.ImportTime = d.ImportTime ? moment(d.ImportTime) : null;
        d.InfoReportTime = d.InfoReportTime ? moment(d.InfoReportTime) : null;
        d.LastModifyTime = d.LastModifyTime ? moment(d.LastModifyTime) : null;
        d.PFTime = d.PFTime ? moment(d.PFTime) : null;
        d.SHTime = d.SHTime ? moment(d.SHTime) : null;
        d.SLTime = d.SLTime ? moment(d.SLTime) : null;
        d.SPTime = d.SPTime ? moment(d.SPTime) : null;
        d.UsedTime = d.UsedTime ? moment(d.UsedTime) : null;
        d.XMTime = d.XMTime ? moment(d.XMTime) : null;

        var choseSzxzq = undefined;
        //判断行政区数据是所在行政区还是所跨行政区
        if (d.DistrictID.indexOf('|') != -1) {
          // 是所跨行政区
          d.ShowDistricts = d.DistrictID.split('.')
            .join(' / ')
            .split('|');
          choseSzxzq = false;
        } else {
          // 是所在行政区
          var dList = d.DistrictID.split('.'),
            xzq = '',
            xzqList = [];
          dList.map((val, index) => {
            xzq = xzq == '' ? xzq + val : xzq + '.' + val;
            xzqList.push(xzq);
          });
          d.SZXZQ = xzqList;
          choseSzxzq = true;
        }

        this.setState({ entity: d, newForm: false, choseSzxzq: choseSzxzq });
      });
    } else {
      // 获取一个新的guid
      let rt = await Post(url_GetNewGuid);
      rtHandle(rt, d => {
        let { entity } = this.state;
        entity.ID = d;
        this.setState({ entity: entity, newForm: true });
      });
    }
    this.hideLoading();
  }

  validate(errs, bAdrress) {
    errs = errs || [];
    console.dir(errs);
    let { entity } = this.state;
    let saveObj = {
      ID: entity.ID,
      ...this.mObj,
    };

    if (saveObj.districts) {
      let ds = saveObj.districts;
      saveObj.DistrictID = ds[saveObj.districts.length - 1].value;
      delete saveObj.districts;
    }

    if (saveObj.SZXZQ) {
      saveObj.DistrictID = saveObj.SZXZQ[saveObj.SZXZQ.length - 1];
      delete saveObj.SZXZQ;
    }

    if (saveObj.SKXZQ) {
      if (saveObj.SKXZQ.length > 1) {
        saveObj.DistrictID = saveObj.SKXZQ.join('|')
          .split(' / ')
          .join('.');
      } else if (saveObj.SKXZQ.length == 1) {
        errs.push('请选择至少两个所跨行政区');
      }
      delete saveObj.SKXZQ;
    }

    if (saveObj.BZTime) {
      saveObj.BZTime = saveObj.BZTime.format();
    }

    let validateObj = {
      ...entity,
      ...saveObj,
    };
    // console.dir(validateObj);
    // 小类类别
    if (!validateObj.Type) {
      errs.push('请选择小类类别');
    }
    // 行政区必填
    if (!validateObj.DistrictID) {
      errs.push('请选择行政区');
    }
    // 地名代码必填
    if (!validateObj.DMCode) {
      errs.push('请输入地名代码');
    }
    // 地名含义必填
    if (!validateObj.DMHY) {
      errs.push('请输入地名含义');
    }
    // 申报单位必填
    if (!validateObj.SBDW) {
      errs.push('请输入申报单位');
    }
    // 拟用名称1
    if (!validateObj.Name1) {
      errs.push('请输入拟用名称1');
    }
    return { errs, saveObj, validateObj };
  }
  onSaveClick = (e, pass) => {
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
          if (this.props.FormType == 'ToponymyAccept') {
            this.save(saveObj, 'sl', 'Pass', '');
          }
          if (this.props.FormType == 'ToponymyPreApproval') {
            this.save(saveObj, 'ymm', pass == 'Fail' ? 'Fail' : 'Pass', '');
          }
          if (this.props.FormType == 'ToponymyApproval') {
            this.save(saveObj, 'zjmm', pass == 'Fail' ? 'Fail' : 'Pass', '');
          }
          if (this.props.FormType == 'ToponymyRename') {
            this.save(saveObj, 'gm', 'Pass', '');
          }
          if (this.props.FormType == 'ToponymyReplace') {
            this.save(saveObj, 'hb', 'Pass', '');
          }
          if (this.props.FormType == 'ToponymyCancel') {
            this.delete(saveObj, '');
          }
        }
      }.bind(this)
    );
  };
  async save(obj, item, pass, opinion) {
    await Post(
      url_ModifySettlementDM,
      { oldDataJson: JSON.stringify(obj), item: item, pass: pass, opinion: opinion },
      e => {
        notification.success({ description: '保存成功！', message: '成功' });
        this.mObj = {};
        if (this.props.onSaveSuccess) {
          this.props.onSaveSuccess();
        }
        this.getFormData(this.state.entity.ID);
      }
    );
  }
  // 地名销名
  async delete(obj, opinion) {
    await Post(url_DeleteSettlementDM, { ID: obj.ID, opinion: opinion }, e => {
      notification.success({ description: '注销成功！', message: '成功' });
      this.mObj = {};
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
      this.getFormData(this.state.entity.ID);
    });
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
  isSaved() {
    let saved = true;
    for (let i in this.mObj) {
      saved = false;
      break;
    }
    return saved;
  }

  CheckName(v) {
    if (!v) {
      Modal.confirm({
        title: '错误',
        okText: '确定',
        cancelText: '取消',
        content: '名称不能为空',
      });
    } else {
      this.getNameCheck(v).then(rt => {
        console.dir(rt);
        data = rt.Data;
        this.setState({ showNameCheckModal: true });
      });
    }
  }

  // 检查拟用名称
  async getNameCheck(name) {
    const rt = await Post(url_SettlementNameDM, {
      NameX: name,
    });
    return rt;
  }

  componentDidMount() {
    this.getDistricts();
    this.getFormData();
    let user = getUser();

    let { entity } = this.state;
    entity.CreateUser = user.userName;
    this.setState({ entity: entity });
  }

  tempSave(field, value) {
    this.mObj[field] = value;
    let { entity } = this.state;
    console.log(entity);
    entity[field] = value;
    console.log(entity);

    this.setState({ entity: entity });
  }

  //获取不置灰数组
  getDontDisabledGroup() {
    let { showDetailForm, FormType } = this.props;
    if (showDetailForm) {
      console.log(DmxqDisabled);
      return DmxqDisabled;
    }
    if (FormType == 'ToponymyReplace') {
      return DmhbDisabled;
    }
    if (FormType == 'ToponymyCancel') {
      return DmxmDisabled;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { FormType } = this.props;
    let {
      newForm,
      showLoading,
      showLocateMap,
      entity,
      districts,
      communities,
      postCodes,
      showNameCheckModal,
      FormTime,
      choseSzxzq, //所在行政区有值为true, 默认不选为undefined, 选择了所跨行政区为false
    } = this.state;
    const { edit } = this;
    const { showDetailForm } = this.props;
    var dontDisabledGroup = this.getDontDisabledGroup();
    var hasItemDisabled =
      FormType == 'ToponymyReplace' || FormType == 'ToponymyCancel' || showDetailForm
        ? true
        : false; // form中需要有项目置灰

    return (
      <div className={st.SettlementForm}>
        <Spin
          className={showLoading ? 'active' : ''}
          spinning={showLoading}
          size="large"
          tip="数据加载中..."
        />
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <Form>
            {/* 基本信息 */}
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
                          <span className={st.ired}>*</span>小类类别
                        </span>
                      }
                    >
                      {getFieldDecorator('Type', {
                        initialValue: entity.Type,
                      })(
                        <Select
                          onChange={e => {
                            this.mObj.Type = e;
                            let { entity } = this.state;
                            entity.Type = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="小类类别"
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Type'] == undefined
                                ? true
                                : false
                              : false
                          }
                        >
                          {['城镇居民点', '农村居民点'].map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
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
                          <span className={st.ired}>*</span>地名代码
                        </span>
                      }
                    >
                      {getFieldDecorator('DMCode', {
                        initialValue: entity.DMCode,
                      })(
                        <Input
                          placeholder="地名代码"
                          onChange={e => {
                            this.mObj.DMCode = e.target.value;
                          }}
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['DMCode'] == undefined
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
                          <span className={st.ired}>*</span>所跨行政区
                        </span>
                      }
                    >
                      {getFieldDecorator('ShowDistricts', {
                        initialValue: entity.ShowDistricts,
                      })(
                        <Select
                          mode="tags"
                          open={false}
                          placeholder="所跨行政区"
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ShowDistricts'] == undefined
                                ? true
                                : false
                              : choseSzxzq == undefined
                              ? false
                              : choseSzxzq == true
                              ? true
                              : false
                          }
                          onDeselect={value => {
                            // 减行政区
                            let { entity } = this.state;
                            entity.ShowDistricts = entity.ShowDistricts.filter(v => {
                              return v != value;
                            });
                            this.mObj.SKXZQ = entity.ShowDistricts;
                            if (entity.ShowDistricts.length == 0) {
                              this.setState({ entity: entity, choseSzxzq: undefined });
                            } else {
                              this.setState({ entity: entity, choseSzxzq: false });
                            }
                          }}
                        />
                      )}
                      <Cascader
                        value={null}
                        allowClear
                        expandTrigger="hover"
                        options={districts}
                        placeholder="请选择所跨行政区"
                        changeOnSelect
                        disabled={
                          hasItemDisabled
                            ? dontDisabledGroup['districts'] == undefined
                              ? true
                              : false
                            : choseSzxzq == undefined
                            ? false
                            : choseSzxzq == true
                            ? true
                            : false
                        }
                        onChange={(value, selectedOptions) => {
                          // 加行政区
                          console.log(value);
                          this.mObj.districts = selectedOptions;
                          let { entity } = this.state;
                          entity.Districts.push(value);
                          const showValue = value[value.length - 1].split('.').join(' / '); //输入框显示的值
                          debugger;
                          entity.ShowDistricts.push(showValue);
                          this.mObj.SKXZQ = entity.ShowDistricts;

                          this.getCommunities(value);
                          if (entity.ShowDistricts.length == 0) {
                            this.setState({ entity: entity, choseSzxzq: undefined });
                          } else {
                            this.setState({ entity: entity, choseSzxzq: false });
                          }
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>所在行政区
                        </span>
                      }
                    >
                      {getFieldDecorator('SZXZQ', {
                        initialValue: entity.SZXZQ,
                      })(
                        <Cascader
                          changeOnSelect
                          options={districts}
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['SZXZQ'] == undefined
                                ? true
                                : false
                              : choseSzxzq == undefined
                              ? false
                              : choseSzxzq == true
                              ? false
                              : true
                          }
                          onChange={(value, selectedOptions) => {
                            this.mObj.SZXZQ = value;
                            entity.SZXZQ = value;
                            this.getCommunities(value);
                            if (value.length == 0) {
                              this.setState({ entity: entity, choseSzxzq: undefined });
                            } else {
                              this.setState({ entity: entity, choseSzxzq: true });
                            }
                          }}
                          placeholder="请选择所在行政区"
                          expandTrigger="hover"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="村社区">
                      {getFieldDecorator('CommunityName', {
                        initialValue: entity.CommunityName,
                      })(
                        <Select
                          allowClear
                          placeholder="村社区"
                          showSearch={true}
                          mode={'combobox'}
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['CommunityName'] == undefined
                                ? true
                                : false
                              : choseSzxzq == true
                              ? false
                              : true
                          }
                          onSearch={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
                            this.setState({ entity: entity });
                          }}
                          onChange={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
                            this.setState({ entity: entity });
                          }}
                          onSelect={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
                            this.getPostCodes(e);
                            this.setState({ entity: entity });
                          }}
                        >
                          {communities.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>

                {GetNameRow(
                  FormType,
                  entity,
                  this,
                  getFieldDecorator,
                  hasItemDisabled,
                  dontDisabledGroup
                )}

                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮政编码">
                      {getFieldDecorator('Postcode', {
                        initialValue: entity.Postcode,
                      })(
                        <Select
                          allowClear
                          placeholder="邮政编码"
                          showSearch={true}
                          mode={'combobox'}
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Postcode'] == undefined
                                ? true
                                : false
                              : false
                          }
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
                        >
                          {postCodes.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
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
                          <span className={st.ired}>*</span>申报单位
                        </span>
                      }
                    >
                      {getFieldDecorator('SBDW', {
                        initialValue: entity.SBDW,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['SBDW'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.SBDW = e.target.value;
                          }}
                          placeholder="申报单位"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="统一社会信用代码"
                    >
                      {getFieldDecorator('SHXYDM', {
                        initialValue: entity.SHXYDM,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['SHXYDM'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.SHXYDM = e.target.value;
                          }}
                          placeholder="统一社会信用代码"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="东至">
                      {getFieldDecorator('East', {
                        initialValue: entity.East,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['East'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.East = e.target.value;
                            let { entity } = this.state;
                            entity.East = e.target.value;
                            this.setState({ entity: entity });
                          }}
                          placeholder="东至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="南至">
                      {getFieldDecorator('South', {
                        initialValue: entity.South,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['South'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.South = e.target.value;
                            let { entity } = this.state;
                            entity.South = e.target.value;
                            this.setState({ entity: entity });
                          }}
                          placeholder="南至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="西至">
                      {getFieldDecorator('West', {
                        initialValue: entity.West,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['West'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.West = e.target.value;
                            let { entity } = this.state;
                            entity.West = e.target.value;
                            this.setState({ entity: entity });
                          }}
                          placeholder="西至"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="北至">
                      {getFieldDecorator('North', {
                        initialValue: entity.North,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['North'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.North = e.target.value;
                            let { entity } = this.state;
                            entity.North = e.target.value;
                            this.setState({ entity: entity });
                          }}
                          placeholder="北至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="占地面积（平方米）"
                    >
                      {getFieldDecorator('ZDArea', {
                        initialValue: entity.ZDArea,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ZDArea'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.ZDArea = e;
                            let { entity } = this.state;
                            entity.ZDArea = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="占地面积（平方米）"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="建筑面积（平方米）"
                    >
                      {getFieldDecorator('JZArea', {
                        initialValue: entity.JZArea,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['JZArea'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.JZArea = e;
                            let { entity } = this.state;
                            entity.JZArea = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="建筑面积（平方米）"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="容积率（%）">
                      {getFieldDecorator('RJL', {
                        initialValue: entity.RJL,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['RJL'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.RJL = e;
                            let { entity } = this.state;
                            entity.RJL = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="容积率（%）"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="绿化率（%）">
                      {getFieldDecorator('LHL', {
                        initialValue: entity.LHL,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['LHL'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.LHL = e;
                            let { entity } = this.state;
                            entity.LHL = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="绿化率（%）"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="幢数">
                      {getFieldDecorator('LZNum', {
                        initialValue: entity.LZNum,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['LZNum'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.LZNum = e;
                            let { entity } = this.state;
                            entity.LZNum = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="幢数"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户数">
                      {getFieldDecorator('HSNum', {
                        initialValue: entity.HSNum,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['HSNum'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.HSNum = e;
                            let { entity } = this.state;
                            entity.HSNum = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="户数"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    <FormItem
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>地理实体概况
                        </span>
                      }
                    >
                      <div
                        style={{
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          padding: '4px 11px',
                        }}
                      >
                        位于
                        <span>
                          {entity.ShowDistricts && entity.ShowDistricts.length > 0 ? (
                            <span className={st.hasValue}>{entity.ShowDistricts.join('和')}</span>
                          ) : (
                            <span className={st.hasNoValue}>&行政区划</span>
                          )}
                        </span>
                        <span>
                          {entity.CommunityName ? (
                            <span className={st.hasValue}>{entity.CommunityName}</span>
                          ) : (
                            <span className={st.hasNoValue}>&村社区</span>
                          )}
                        </span>
                        ，东至
                        <span>
                          {entity.East ? (
                            <span className={st.hasValue}>{entity.East}</span>
                          ) : (
                            <span className={st.hasNoValue}>&东至</span>
                          )}
                        </span>
                        ，南至
                        <span>
                          {entity.South ? (
                            <span className={st.hasValue}>{entity.South}</span>
                          ) : (
                            <span className={st.hasNoValue}>&南至</span>
                          )}
                        </span>
                        ，西至
                        <span>
                          {entity.West ? (
                            <span className={st.hasValue}>{entity.West}</span>
                          ) : (
                            <span className={st.hasNoValue}>&西至</span>
                          )}
                        </span>
                        ，北至
                        <span>
                          {entity.North ? (
                            <span className={st.hasValue}>{entity.North}</span>
                          ) : (
                            <span className={st.hasNoValue}>&北至</span>
                          )}
                        </span>
                        。占地面积
                        <span>
                          {entity.ZDArea ? (
                            <span className={st.hasValue}>{entity.ZDArea}</span>
                          ) : (
                            <span className={st.hasNoValue}>&占地面积</span>
                          )}
                        </span>
                        平方米，建筑面积
                        <span>
                          {entity.JZArea ? (
                            <span className={st.hasValue}>{entity.JZArea}</span>
                          ) : (
                            <span className={st.hasNoValue}>&建筑面积</span>
                          )}
                        </span>
                        平方米，容积率
                        <span>
                          {entity.RJL ? (
                            <span className={st.hasValue}>{entity.RJL}</span>
                          ) : (
                            <span className={st.hasNoValue}>&容积率</span>
                          )}
                        </span>
                        %，绿化率
                        <span>
                          {entity.LHL ? (
                            <span className={st.hasValue}>{entity.LHL}</span>
                          ) : (
                            <span className={st.hasNoValue}>&绿化率</span>
                          )}
                        </span>
                        %，共
                        <span>
                          {entity.LZNum ? (
                            <span className={st.hasValue}>{entity.LZNum}</span>
                          ) : (
                            <span className={st.hasNoValue}>&幢数</span>
                          )}
                        </span>
                        幢、
                        <span>
                          {entity.HSNum ? (
                            <span className={st.hasValue}>{entity.HSNum}</span>
                          ) : (
                            <span className={st.hasNoValue}>&户数</span>
                          )}
                        </span>
                        户。
                      </div>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    <FormItem
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>地名含义
                        </span>
                      }
                    >
                      {getFieldDecorator('DMHY', {
                        initialValue: entity.DMHY,
                      })(
                        <TextArea
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['DMHY'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.DMHY = e.target.value;
                          }}
                          placeholder="地名含义"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem>
                      <Button
                        type="primary"
                        icon="environment"
                        onClick={this.showLocateMap.bind(this)}
                        disabled={hasItemDisabled}
                        style={{ marginLeft: '20px' }}
                      >
                        空间定位
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            {/* 申办信息 */}
            <div className={st.group}>
              <div className={st.grouptitle}>申办信息</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>申办人
                        </span>
                      }
                    >
                      {getFieldDecorator('Applicant', {
                        initialValue: entity.Applicant,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Applicant'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.Applicant = e.target.value;
                          }}
                          placeholder="申办人"
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
                          <span className={st.ired}>*</span>联系电话
                        </span>
                      }
                    >
                      {getFieldDecorator('ApplicantPhone', {
                        initialValue: entity.ApplicantPhone,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ApplicantPhone'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.ApplicantPhone = e.target.value;
                          }}
                          placeholder="联系电话"
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
                          <span className={st.ired}>*</span>联系地址
                        </span>
                      }
                    >
                      {getFieldDecorator('ApplicantAddress', {
                        initialValue: entity.ApplicantAddress,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ApplicantAddress'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.ApplicantAddress = e.target.value;
                          }}
                          placeholder="联系地址"
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
                          <span className={st.ired}>*</span>证件类型
                        </span>
                      }
                    >
                      {getFieldDecorator('ApplicantType', {
                        initialValue:
                          entity.ApplicantType != undefined ? entity.ApplicantType : '居民身份证',
                      })(
                        <Select
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ApplicantType'] == undefined
                                ? true
                                : false
                              : false
                          }
                          allowClear
                          onChange={e => {
                            this.mObj.ApplicantType = e || '';
                          }}
                          placeholder="证件类型"
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
                          <span className={st.ired}>*</span>证件号码
                        </span>
                      }
                    >
                      {getFieldDecorator('ApplicantNumber', {
                        initialValue: entity.ApplicantNumber,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ApplicantNumber'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.ApplicantNumber = e.target.value;
                          }}
                          placeholder="证件号码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="申请日期">
                      {getFieldDecorator('ApplicantTime', {
                        initialValue: entity.ApplicantTime,
                      })(
                        <DatePicker
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['ApplicantTime'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.ApplicantTime = e;
                          }}
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
            <AttachForm FormType={FormType} entity={entity} FileType="DM_Settlement" />
          </Form>
        </div>
        <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <div style={{ float: 'right' }}>
            {edit ? (
              <Button onClick={this.onSaveClick.bind(this)} type="primary">
                {FormType == 'ToponymyCancel' ? '注销' : '保存'}
              </Button>
            ) : null}
            &emsp;
            {FormType == 'ToponymyPreApproval' || FormType == 'ToponymyApproval' ? (
              <span>
                <Button onClick={e => this.onSaveClick(e, 'Fail').bind(this)} type="primary">
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
              let { DYPositionX, DYPositionY } = this.state.entity;
              if (DYPositionY && DYPositionX) {
                lm.mpLayer = L.marker([DYPositionY, DYPositionX], { icon: mp }).addTo(lm.map);
                lm.map.setView([DYPositionY, DYPositionX], 16);
              }
            }}
            onMapClear={lm => {
              lm.mpLayer && lm.mpLayer.remove();
              lm.mpLayer = null;
              let { entity } = this.state;
              entity.DYPositionY = null;
              entity.DYPositionX = null;
              this.mObj.DYPositionX = entity.DYPositionX;
              this.mObj.DYPositionY = entity.DYPositionY;
            }}
            beforeBtns={[
              {
                id: 'locate',
                name: '地名定位',
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

                  entity.DYPositionX = lng.toFixed(8) - 0;
                  entity.DYPositionY = lat.toFixed(8) - 0;

                  this.mObj.DYPositionY = entity.DYPositionY;
                  this.mObj.DYPositionX = entity.DYPositionX;

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
          title="名称检查"
          visible={showNameCheckModal}
          onOk={() => {
            this.setState({ showNameCheckModal: false });
          }}
          onCancel={() => {
            this.setState({ showNameCheckModal: false });
          }}
        >
          <Table columns={columns} dataSource={data} size="small" />
        </Modal>
      </div>
    );
  }
}

SettlementForm = Form.create()(SettlementForm);
export default SettlementForm;
