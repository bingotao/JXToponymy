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
const { MonthPicker } = DatePicker;
import {
  baseUrl,
  url_GetDistrictTreeFromDistrict,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_SettlementNameDM,
  url_SearchRoadDMByID,
  url_ModifyRoadDM,
  url_DeleteRoadDM,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
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

//地名管理，道路表单
class SettlementForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }
  state = {
    showLoading: true,
    districts: [],
    entity: {
      CreateTime: moment(),
      ApplicantType: '居民身份证',
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
    HYPYgroup: {
      // 汉语拼音 下拉列表
      name: [''],
      value: [''],
    },
  };
  // 存储修改后的数据
  mObj = {};

  showLoading() {
    this.setState({ showLoading: true });
  }

  hideLoading() {
    this.setState({ showLoading: false });
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
        debugger;
        let districts = [d.CountyID, d.NeighborhoodsID];
        d.Districts = districts;
        d.BZTime = d.BZTime ? moment(d.BZTime) : null;

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
    let { FormType } = this.props;
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

    saveObj.ApplicantType = entity.ApplicantType;
    saveObj.ApplicantTime = entity.ApplicantTime;
    saveObj.CreateUser = entity.CreateUser;
    saveObj.CreateTime = entity.CreateTime;

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
    if (FormType != 'ToponymyAccept' && FormType != 'ToponymyPreApproval') {
      // 地名代码必填
      if (!validateObj.DMCode) {
        errs.push('请输入地名代码');
      }
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
      url_ModifyRoadDM,
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
    await Post(url_DeleteRoadDM, { ID: obj.ID, opinion: opinion }, e => {
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
  async getNameCheck(namep, name) {
    const rt = await Post(url_SettlementNameDM, {
      NameP: namep,
      Name: name,
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
                  {FormType == 'ToponymyAccept' || FormType == 'ToponymyPreApproval' ? null : (
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
                            disabled={true}
                          />
                        )}
                      </FormItem>
                    </Col>
                  )}
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="道路走向">
                      {getFieldDecorator('DLZX', {
                        initialValue: entity.DLZX,
                      })(
                        <Select
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['DLZX'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.DLZX = e;
                            let { entity } = this.state;
                            entity.DLZX = e;
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.DLZX || undefined}
                          value={entity.DLZX || undefined}
                          placeholder="道路走向"
                        >
                          {['东西向', '南北向', '环路'].map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="起点">
                      {getFieldDecorator('StartPoint', {
                        initialValue: entity.StartPoint,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['StartPoint'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.StartPoint = e.target.value;
                            let { entity } = this.state;
                            entity.StartPoint = e.target.value;
                            this.setState({ entity: entity });
                          }}
                          placeholder="起点"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="止点">
                      {getFieldDecorator('EndPoint', {
                        initialValue: entity.EndPoint,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['EndPoint'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.EndPoint = e.target.value;
                            let { entity } = this.state;
                            entity.EndPoint = e.target.value;
                            this.setState({ entity: entity });
                          }}
                          placeholder="止点"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="编制规则">
                      {getFieldDecorator('BZGZ', {
                        initialValue: entity.BZGZ,
                      })(
                        <Input
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['BZGZ'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.BZGZ = e.target.value;
                            let { entity } = this.state;
                            entity.BZGZ = e.target.value;
                            this.setState({ entity: BZGZ });
                          }}
                          placeholder="编制规则"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="长度（米）">
                      {getFieldDecorator('Length', {
                        initialValue: entity.Length,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Length'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.Length = e;
                            let { entity } = this.state;
                            entity.Length = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="长度（米）"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="宽度（米）">
                      {getFieldDecorator('Width', {
                        initialValue: entity.Width,
                      })(
                        <InputNumber
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['Width'] == undefined
                                ? true
                                : false
                              : false
                          }
                          style={{ width: '100%' }}
                          onChange={e => {
                            this.mObj.Width = e;
                            let { entity } = this.state;
                            entity.Width = e;
                            this.setState({ entity: entity });
                          }}
                          placeholder="宽度（米）"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="路面性质">
                      {getFieldDecorator('LMXZ', {
                        initialValue: entity.LMXZ,
                      })(
                        <Select
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['LMXZ'] == undefined
                                ? true
                                : false
                              : false
                          }
                          onChange={e => {
                            this.mObj.LMXZ = e;
                            let { entity } = this.state;
                            entity.LMXZ = e;
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.LMXZ || undefined}
                          value={entity.LMXZ || undefined}
                          placeholder="路面性质"
                        >
                          {['混凝土路面', '沥青路面', '碎石路面'].map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>

                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="始建年月">
                      {getFieldDecorator('SJNY', {
                        initialValue: entity.SJNY,
                      })(
                        <MonthPicker
                          placeholder="始建年月"
                          format="YYYY年M月"
                          onChange={(date, dateString) => {
                            this.mObj.SJNY = dateString;
                            let { entity } = this.state;
                            entity.SJNY = dateString;
                            this.setState({ entity: entity });
                          }}
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['SJNY'] == undefined
                                ? true
                                : false
                              : false
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="建成年月">
                      {getFieldDecorator('JCNY', {
                        initialValue: entity.JCNY,
                      })(
                        <MonthPicker
                          placeholder="建成年月"
                          format="YYYY年M月"
                          onChange={(date, dateString) => {
                            this.mObj.JCNY = dateString;
                            let { entity } = this.state;
                            entity.JCNY = dateString;
                            this.setState({ entity: entity });
                          }}
                          disabled={
                            hasItemDisabled
                              ? dontDisabledGroup['JCNY'] == undefined
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
                          {entity.Districts && entity.Districts.length > 0 ? (
                            <span className={st.hasValue}>
                              {entity.Districts[entity.Districts.length - 1][
                                entity.Districts[entity.Districts.length - 1].length - 1
                              ]
                                .split('.')
                                .join('')}
                            </span>
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
                        ，为
                        <span>
                          {entity.DLZX ? (
                            <span className={st.hasValue}>{entity.DLZX}</span>
                          ) : (
                            <span className={st.hasNoValue}>&道路走向</span>
                          )}
                        </span>
                        <span>
                          {entity.Type ? (
                            <span className={st.hasValue}>{entity.Type}</span>
                          ) : (
                            <span className={st.hasNoValue}>&小类类别</span>
                          )}
                        </span>
                        。道路（起）
                        <span>
                          {entity.StartPoint ? (
                            <span className={st.hasValue}>{entity.StartPoint}</span>
                          ) : (
                            <span className={st.hasNoValue}>&起点</span>
                          )}
                        </span>
                        ，（至）
                        <span>
                          {entity.EndPoint ? (
                            <span className={st.hasValue}>{entity.EndPoint}</span>
                          ) : (
                            <span className={st.hasNoValue}>&止点</span>
                          )}
                        </span>
                        ，编制规则为
                        <span>
                          {entity.BZGZ ? (
                            <span className={st.hasValue}>{entity.BZGZ}</span>
                          ) : (
                            <span className={st.hasNoValue}>&编制规则</span>
                          )}
                        </span>
                        ,全长
                        <span>
                          {entity.Length ? (
                            <span className={st.hasValue}>{entity.Length}</span>
                          ) : (
                            <span className={st.hasNoValue}>&长度</span>
                          )}
                        </span>
                        米，宽
                        <span>
                          {entity.Width ? (
                            <span className={st.hasValue}>{entity.Width}</span>
                          ) : (
                            <span className={st.hasNoValue}>&宽度</span>
                          )}
                        </span>
                        米，
                        <span>
                          {entity.LMXZ ? (
                            <span className={st.hasValue}>{entity.LMXZ}</span>
                          ) : (
                            <span className={st.hasNoValue}>&路面性质</span>
                          )}
                        </span>
                        。
                        <span>
                          {entity.SJNY ? (
                            <span className={st.hasValue}>{entity.SJNY}</span>
                          ) : (
                            <span className={st.hasNoValue}>&始建年月</span>
                          )}
                        </span>
                        始建，
                        <span>
                          {entity.JCNY ? (
                            <span className={st.hasValue}>{entity.JCNY}</span>
                          ) : (
                            <span className={st.hasNoValue}>&建成年月</span>
                          )}
                        </span>
                        建成。
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
                        initialValue: entity.ApplicantType,
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
            <AttachForm FormType={FormType} entity={entity} FileType="DM_Road" />
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
            &emsp;
            <Button type="primary">打印</Button>
          </div>
        </div>
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
