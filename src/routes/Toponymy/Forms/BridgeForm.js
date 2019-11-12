import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
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
  Icon,
} from 'antd';
import st from './SettlementForm.less';

const { TextArea } = Input;
const { MonthPicker } = DatePicker;
import {
  url_GetDistrictTreeFromDistrict,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_BridgeNameDM,
  url_SearchBridgeDMByID,
  url_ModifyBridgeDM,
  url_DeleteBridgeDM,
  url_CancelResidenceMPByList, //批量注销
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { getUser } from '../../../utils/login';
import AttachForm from './AttachForm';
import { getDivIcons } from '../../../components/Maps/icons';
import {
  zjlx,
  DmxqDisabled,
  DmhbDisabled,
  DmxmDisabled,
  DmgmDisabled,
} from '../../../common/enums.js';
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
let data,
  sameName,
  sameYin = [];

//地名管理，桥梁表单
class BridgeForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
    this.entityTextArea = React.createRef();
  }
  state = {
    showLoading: true,
    districts: [],
    entity: {
      SLTime: moment(),
      ApplicantType: '居民身份证',
      ApplicantTime: moment(),
      SZXZQ: [],
      entityText: null, //地理实体概况文本描述
      XMTime: moment(),
    },
    newForm: true,
    communities: [],
    postCodes: [],
    showNameCheckModal: false,
    //表单创建时间
    FormTime: moment().format('YYYYMMDDHHmms'),
    choseSzxzq: undefined, //选择了所在行政区
    HYPYgroup: {
      // 汉语拼音 下拉列表
      name: [''],
      value: [''],
    },
    entityIsTextState: false, //地理实体概况处于自动填充状态时为true,文本手动编辑状态时为false。
    saveBtnClicked: false, // 点击保存后按钮置灰
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
    });
    let rt = await Post(url_GetPostCodes, {
      NeighborhoodsID: entity.SZXZQ[entity.SZXZQ.length - 1],
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
      let { choseSzxzq } = this.state;
      let rt = await Post(url_SearchBridgeDMByID, { id: id });
      rtHandle(rt, d => {
        debugger;
        let districts = [d.CountyID, d.NeighborhoodsID];
        d.Districts = districts;

        d.LSYG = '原为' + d.Name1 + ', ' + (d.PFTime ? d.PFTime.format('YYYY年M月') : '') + '更名';
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

        this.setState({
          entity: d,
          newForm: false,
          choseSzxzq,
          entityIsTextState: true,
        });
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
    let { FormType } = this.props;
    let { entity, entityIsTextState } = this.state;
    let saveObj = {
      ID: entity.ID,
      ...this.mObj,
    };

    if (saveObj.SZXZQ) {
      if (saveObj.SZXZQ.length > 1) {
        saveObj.DistrictID = saveObj.SZXZQ[saveObj.SZXZQ.length - 1];
      }
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
    //地理实体概况
    if (entityIsTextState === true) {
      saveObj.DLSTGK = this.props.form.getFieldValue('entityTextArea');
    } else {
      saveObj.DLSTGK = this.entityTextArea.current.textContent;
    }

    saveObj.ApplicantType =
      entity.ApplicantType == null ? saveObj.ApplicantType : entity.ApplicantType;
    saveObj.ApplicantTime = entity.ApplicantTime;
    saveObj.SLUser = entity.SLUser;
    if (saveObj.SLTime) {
      saveObj.SLTime = entity.SLTime.format('YYYY-MM-DD HH:mm:ss.SSS');
    }

    let validateObj = {
      ...entity,
      ...saveObj,
    };
    if (FormType != 'ToponymyBatchDelete' && FormType != 'ToponymyCancel') {
      // 小类类别
      if (!validateObj.Type) {
        errs.push('请选择小类类别');
      }
      // 行政区必填
      if (!validateObj.DistrictID) {
        errs.push('请选择行政区');
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
    }

    if (FormType != 'ToponymyCancel') {
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
          if (this.props.FormType == 'ToponymyBatchDelete') {
            this.batchDelete(this.props.ids, saveObj, '');
          }
        }
      }.bind(this)
    );
  };
  async save(obj, item, pass, opinion) {
    await Post(
      url_ModifyBridgeDM,
      { oldDataJson: JSON.stringify(obj), item: item, pass: pass, opinion: opinion },
      e => {
        notification.success({ description: '保存成功！', message: '成功' });
        this.mObj = {};
        if (this.props.onSaveSuccess) {
          this.props.onSaveSuccess();
        }
        this.setState({ saveBtnClicked: true });
        this.getFormData(this.state.entity.ID);
      }
    );
  }
  // 地名销名
  async delete(obj, opinion) {
    await Post(url_DeleteBridgeDM, { ID: obj.ID, opinion: opinion }, e => {
      notification.success({ description: '注销成功！', message: '成功' });
      this.mObj = {};
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
      this.backToSearch();
    });
  }
  // 批量删除
  async batchDelete(ids, obj, item) {
    await Post(
      url_CancelResidenceMPByList,
      { ID: ids, oldDataJson: JSON.stringify(obj), item: item },
      e => {
        notification.success({ description: '批量注销成功！', message: '成功' });

        this.props.onCancel();
      }
    );
  }
  onCancel() {
    if (!this.isSaved()) {
      Modal.confirm({
        title: '提醒',
        content: '是否放弃所做的修改？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          // this.props.onCancel && this.props.onCancel();
          this.backToSearch();
        },
        onCancel() {},
      });
    } else {
      // this.props.onCancel && this.props.onCancel();
      this.backToSearch();
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

  backToSearch() {
    this.props.history.push({
      pathname: '/placemanage/toponymy/toponymysearch',
    });
  }

  CheckName(namep, name) {
    if (!namep || !name) {
      Modal.confirm({
        title: '错误',
        okText: '确定',
        cancelText: '取消',
        content: '标准名称和汉语拼音不能为空',
      });
    } else {
      this.getNameCheck(namep, name).then(rt => {
        data = rt.data.Data;
        sameName = data[0];
        sameYin = data[1];
        this.setState({ showNameCheckModal: true });
      });
    }
  }

  // 检查拟用名称
  async getNameCheck(namep, name) {
    const rt = await Post(url_BridgeNameDM, {
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
    entity.SLUser = user.userName;
    this.setState({ entity: entity });
  }

  // 获取不置灰数组
  getDontDisabledGroup() {
    let { showDetailForm, FormType } = this.props;
    if (showDetailForm) {
      return DmxqDisabled;
    }
    if (FormType == 'ToponymyReplace') {
      return DmhbDisabled;
    }
    if (FormType == 'ToponymyCancel') {
      return DmxmDisabled;
    }
    if (FormType == 'ToponymyRename') {
      return DmgmDisabled;
    }
  }
  // 是否置灰
  isDisabeld(name) {
    const { FormType, showDetailForm } = this.props;
    let { saveBtnClicked, choseSzxzq } = this.state;
    // form中有个别项目需要置灰
    var hasItemDisabled =
      FormType == 'ToponymyReplace' || FormType == 'ToponymyCancel' || FormType == 'ToponymyRename'
        ? true
        : false;
    // 不置灰字段group
    var dontDisabledGroup = this.getDontDisabledGroup();

    if (saveBtnClicked == true || showDetailForm == true) {
      return true;
    } else {
      if (hasItemDisabled == true) {
        if (dontDisabledGroup[name] == undefined) {
          return true;
        } else {
          return false;
        }
      } else {
        // 大部分不置灰，仅'所跨行政区'等需要置灰
        if (name == 'SKXZQ' || name == 'districts' || name == 'SZXZQ') {
          if (choseSzxzq == undefined) {
            return false;
          } else {
            if (name == 'SKXZQ' || name == 'districts') {
              if (choseSzxzq == true) {
                return true;
              } else {
                return false;
              }
            }
            if (name == 'SZXZQ') {
              if (choseSzxzq == true) {
                return false;
              } else {
                return true;
              }
            }
          }
        }

        if (name == 'CommunityName') {
          if (choseSzxzq == true) {
            return false;
          } else {
            return true;
          }
        }

        return false;
      }
    }
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    const { FormType, showDetailForm } = this.props;
    let {
      showLoading,
      showLocateMap,
      entity,
      districts,
      communities,
      postCodes,
      showNameCheckModal,
      FormTime,
      choseSzxzq, //所在行政区有值为true, 默认不选为undefined, 选择了所跨行政区为false
      entityIsTextState,
      saveBtnClicked,
    } = this.state;
    const { edit } = this;
    var btnDisabled =
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
            {FormType == 'ToponymyBatchDelete' ? null : (
              <div className={st.group}>
                <div className={st.grouptitle}>
                  基本信息<span>说明：“ * ”号标识的为必填项</span>
                </div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('SBDW')}
                            onChange={e => {
                              this.mObj.SBDW = e.target.value;
                            }}
                            placeholder="申报单位"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="统一社会信用代码"
                      >
                        {getFieldDecorator('SHXYDM', {
                          initialValue: entity.SHXYDM,
                        })(
                          <Input
                            disabled={this.isDisabeld('SHXYDM')}
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
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                              this.setState({ entity: { ...entity, Type: e } });
                            }}
                            placeholder="小类类别"
                            disabled={this.isDisabeld('Type')}
                          >
                            {['铁路桥', '公路桥', '人行桥'].map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    {FormType == 'ToponymyAccept' || FormType == 'ToponymyPreApproval' ? null : (
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label={
                            <span>
                              <span className={st.ired}>*</span>地名代码
                            </span>
                          }
                        >
                          {getFieldDecorator('DMCode', {
                            initialValue: entity.DMCode,
                          })(<Input placeholder="地名代码" disabled={true} />)}
                        </FormItem>
                      </Col>
                    )}
                  </Row>

                  {GetNameRow(FormType, entity, this, getFieldDecorator)}

                  <Row>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            options={districts}
                            disabled={this.isDisabeld('SZXZQ')}
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
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="村社区">
                        {getFieldDecorator('CommunityName', {
                          initialValue: entity.CommunityName,
                        })(
                          <Select
                            allowClear
                            placeholder="村社区"
                            showSearch={true}
                            mode={'combobox'}
                            disabled={this.isDisabeld('CommunityName')}
                            onSearch={e => {
                              this.mObj.CommunityName = e;
                              this.setState({ entity: { ...entity, CommunityName: e } });
                            }}
                            onChange={e => {
                              this.mObj.CommunityName = e;
                              this.setState({ entity: { ...entity, CommunityName: e } });
                            }}
                            onSelect={e => {
                              this.mObj.CommunityName = e;
                              this.getPostCodes(e);
                              this.setState({ entity: { ...entity, CommunityName: e } });
                            }}
                          >
                            {communities.map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="邮政编码">
                        {getFieldDecorator('Postcode', {
                          initialValue: entity.Postcode,
                        })(
                          <Select
                            allowClear
                            placeholder="邮政编码"
                            showSearch={true}
                            mode={'combobox'}
                            disabled={this.isDisabeld('Postcode')}
                            onSearch={e => {
                              this.mObj.Postcode = e;
                              this.setState({ entity: { ...entity, Postcode: e } });
                            }}
                            onChange={e => {
                              this.mObj.Postcode = e;
                              this.setState({ entity: { ...entity, Postcode: e } });
                            }}
                            onSelect={e => {
                              this.mObj.Postcode = e;
                              this.setState({ entity: { ...entity, Postcode: e } });
                            }}
                          >
                            {postCodes.map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      <FormItem
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>所跨行政区
                          </span>
                        }
                      >
                        {getFieldDecorator('SKXZQ', {
                          initialValue: this.mObj.SKXZQ,
                        })(
                          <Select
                            style={{ width: '37%', marginRight: '2%' }}
                            mode="multiple"
                            open={false}
                            placeholder="所跨行政区"
                            disabled={this.isDisabeld('SKXZQ')}
                            onDeselect={value => {
                              // 减行政区
                              this.mObj.SKXZQ = this.mObj.SKXZQ.filter(v => {
                                return v != value;
                              });
                              if (this.mObj.SKXZQ && this.mObj.SKXZQ.length > 0) {
                                this.setState({ choseSzxzq: false });
                              } else {
                                this.setState({ choseSzxzq: undefined });
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
                          // changeOnSelect
                          style={{ width: '37%' }}
                          disabled={this.isDisabeld('districts')}
                          onChange={(value, selectedOptions) => {
                            // 加行政区
                            const showValue = value[value.length - 1].split('.').join(' / '); //输入框显示的值
                            if (!this.mObj.SKXZQ) this.mObj.SKXZQ = [];
                            this.mObj.SKXZQ.push(showValue);
                            this.props.form.setFieldsValue({
                              SKXZQ: this.mObj.SKXZQ,
                            });

                            this.getCommunities(value);
                            if (this.mObj.SKXZQ && this.mObj.SKXZQ.length > 0) {
                              this.setState({ choseSzxzq: false });
                            }
                          }}
                        />
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="所在道路">
                        {getFieldDecorator('SZDL', {
                          initialValue: entity.SZDL,
                        })(
                          <Input
                            disabled={this.isDisabeld('SZDL')}
                            onChange={e => {
                              this.mObj.SZDL = e.target.value;
                              this.setState({ entity: { ...entity, SZDL: e.target.value } });
                            }}
                            placeholder="所在道路"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="所跨河流道路"
                      >
                        {getFieldDecorator('SKHLDL', {
                          initialValue: entity.SKHLDL,
                        })(
                          <Input
                            disabled={this.isDisabeld('SKHLDL')}
                            onChange={e => {
                              this.mObj.SKHLDL = e.target.value;
                              this.setState({
                                entity: {
                                  ...entity,
                                  SKHLDL: e.target.value,
                                },
                              });
                            }}
                            placeholder="所跨河流道路"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="桥梁走向">
                        {getFieldDecorator('QLZX', {
                          initialValue: entity.QLZX,
                        })(
                          <Select
                            disabled={this.isDisabeld('QLZX')}
                            onChange={e => {
                              this.mObj.QLZX = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  QLZX: e,
                                },
                              });
                            }}
                            placeholder="桥梁走向"
                          >
                            {['东西走向', '南北走向'].map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="长度（米）"
                      >
                        {getFieldDecorator('Length', {
                          initialValue: entity.Length,
                        })(
                          <InputNumber
                            disabled={this.isDisabeld('Length')}
                            style={{ width: '100%' }}
                            onChange={e => {
                              this.mObj.Length = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  Length: e,
                                },
                              });
                            }}
                            placeholder="长度（米）"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="宽度（米）"
                      >
                        {getFieldDecorator('Width', {
                          initialValue: entity.Width,
                        })(
                          <InputNumber
                            disabled={this.isDisabeld('Width')}
                            style={{ width: '100%' }}
                            onChange={e => {
                              this.mObj.Width = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  Width: e,
                                },
                              });
                            }}
                            placeholder="宽度（米）"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="梁底标高（米）"
                      >
                        {getFieldDecorator('LDBG', {
                          initialValue: entity.LDBG,
                        })(
                          <InputNumber
                            disabled={this.isDisabeld('LDBG')}
                            style={{ width: '100%' }}
                            onChange={e => {
                              this.mObj.LDBG = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  LDBG: e,
                                },
                              });
                            }}
                            placeholder="梁底标高（米）"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="最大跨度（米）"
                      >
                        {getFieldDecorator('ZDKD', {
                          initialValue: entity.ZDKD,
                        })(
                          <InputNumber
                            disabled={this.isDisabeld('ZDKD')}
                            style={{ width: '100%' }}
                            onChange={e => {
                              this.mObj.ZDKD = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  ZDKD: e,
                                },
                              });
                            }}
                            placeholder="最大跨度（米）"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="最大载重量（吨）"
                      >
                        {getFieldDecorator('ZDZZL', {
                          initialValue: entity.ZDZZL,
                        })(
                          <InputNumber
                            style={{ width: '100%' }}
                            disabled={this.isDisabeld('ZDZZL')}
                            onChange={e => {
                              this.mObj.ZDZZL = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  ZDZZL: e,
                                },
                              });
                            }}
                            placeholder="最大载重量（吨）"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="桥梁性质">
                        {getFieldDecorator('QLXZ', {
                          initialValue: entity.QLXZ,
                        })(
                          <Select
                            disabled={this.isDisabeld('QLXZ')}
                            onChange={e => {
                              this.mObj.QLXZ = e;
                              this.setState({
                                entity: {
                                  ...entity,
                                  QLXZ: e,
                                },
                              });
                            }}
                            placeholder="桥梁性质"
                          >
                            {['梁桥', '拱桥'].map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="始建年月">
                        {getFieldDecorator('SJNY', {
                          initialValue: entity.SJNY,
                        })(
                          <MonthPicker
                            placeholder="始建年月"
                            format="YYYY年M月"
                            onChange={(date, dateString) => {
                              this.mObj.SJNY = dateString;
                              this.setState({
                                entity: {
                                  ...this.state.entity,
                                  SJNY: dateString,
                                },
                              });
                            }}
                            disabled={this.isDisabeld('SJNY')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="建成年月">
                        {getFieldDecorator('JCNY', {
                          initialValue: entity.JCNY,
                        })(
                          <MonthPicker
                            placeholder="建成年月"
                            format="YYYY年M月"
                            onChange={(date, dateString) => {
                              this.mObj.JCNY = dateString;
                              this.setState({
                                entity: {
                                  ...this.state.entity,
                                  JCNY: dateString,
                                },
                              });
                            }}
                            disabled={this.isDisabeld('JCNY')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="批准单位">
                        {getFieldDecorator('PZDW', {
                          initialValue: entity.PZDW,
                        })(
                          <Input
                            disabled={this.isDisabeld('PZDW')}
                            onChange={e => {
                              this.mObj.PZDW = e.target.value;
                            }}
                            placeholder="批准单位"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="批复时间">
                        {getFieldDecorator('PFTime', {
                          initialValue: entity.PFTime,
                        })(
                          <MonthPicker
                            placeholder="批复时间"
                            format="YYYY年M月"
                            onChange={(date, dateString) => {
                              this.mObj.PFTime = dateString;
                              this.setState({
                                entity: {
                                  ...this.state.entity,
                                  PFTime: dateString,
                                },
                              });
                              if (FormType == 'ToponymyRename') {
                                this.props.form.setFieldsValue({
                                  LSYG: '原为' + entity.Name1 + ', ' + dateString + '更名',
                                });
                              }
                            }}
                            disabled={this.isDisabeld('PFTime')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="批复文号">
                        {getFieldDecorator('PFWH', {
                          initialValue: entity.PFWH,
                        })(
                          <Input
                            disabled={this.isDisabeld('PFWH')}
                            onChange={e => {
                              this.mObj.PFWH = e.target.value;
                            }}
                            placeholder="批复文号"
                            suffix="号"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  {FormType == 'ToponymyCancel' ? (
                    <Row>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="使用时间"
                        >
                          {getFieldDecorator('UseState', {
                            initialValue: entity.UseState,
                          })(
                            <Input
                              disabled={this.isDisabeld('UseState')}
                              onChange={e => {
                                this.mObj.UseState = e.target.value;
                              }}
                              placeholder="使用时间"
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="废止年月"
                        >
                          {getFieldDecorator('XMTime', {
                            initialValue: entity.XMTime,
                          })(
                            <MonthPicker
                              placeholder="废止年月"
                              format="YYYY年M月"
                              disabled={this.isDisabeld('XMTime')}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="销名文号"
                        >
                          {getFieldDecorator('XMWH', {
                            initialValue: entity.XMWH,
                          })(
                            <Input
                              disabled={this.isDisabeld('XMWH')}
                              onChange={e => {
                                this.mObj.XMWH = e.target.value;
                              }}
                              placeholder="销名文号"
                              suffix="号"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}

                  {FormType == 'ToponymyRename' ? (
                    <Row>
                      <Col span={6}>
                        <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="曾用名">
                          <div className={st.nameCheck}>
                            {getFieldDecorator('Name1', {
                              initialValue: entity.Name1,
                            })(
                              <Input
                                // onBlur={e => {
                                //   this.mObj.Name1 = e.target.value;
                                //   let { entity } = this.state;
                                //   entity.Name1 = e.target.value;
                                //   this.setState({
                                //     entity: entity,
                                //   });
                                //   getPinyin(e.target.value);
                                // }}
                                placeholder="曾用名"
                                disabled={this.isDisabeld('Name1')}
                              />
                            )}
                          </div>
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  <Row>
                    <Col span={20}>
                      <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="地名来历">
                        {getFieldDecorator('DMLL', {
                          initialValue: entity.DMLL,
                        })(
                          <TextArea
                            disabled={this.isDisabeld('DMLL')}
                            onChange={e => {
                              this.mObj.DMLL = e.target.value;
                            }}
                            placeholder="地名来历"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={20}>
                      <FormItem
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 19 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>地理实体概况
                          </span>
                        }
                      >
                        {entityIsTextState === false ? (
                          <div
                            style={{
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              padding: '4px 11px',
                            }}
                            ref={this.entityTextArea}
                            disabled={this.isDisabeld('DLSTGK')}
                          >
                            {/* 跨行政区时，隐藏这段话 */}
                            {choseSzxzq === false ? null : (
                              <>
                                位于
                                <span>
                                  {entity.SZXZQ && entity.SZXZQ.length > 0 ? (
                                    <span className={st.hasValue}>
                                      {entity.SZXZQ[entity.SZXZQ.length - 1].split('.').join('')}
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
                                ，
                              </>
                            )}
                            为
                            <span>
                              {entity.Type ? (
                                <span className={st.hasValue}>{entity.Type}</span>
                              ) : (
                                <span className={st.hasNoValue}>&小类类别</span>
                              )}
                            </span>
                            。位于
                            <span>
                              {entity.SZDL ? (
                                <span className={st.hasValue}>{entity.SZDL}</span>
                              ) : (
                                <span className={st.hasNoValue}>&所在道路</span>
                              )}
                            </span>
                            ，跨
                            <span>
                              {entity.SKHLDL ? (
                                <span className={st.hasValue}>{entity.SKHLDL}</span>
                              ) : (
                                <span className={st.hasNoValue}>&所跨河流道路</span>
                              )}
                            </span>
                            ，
                            <span>
                              {entity.QLZX ? (
                                <span className={st.hasValue}>{entity.QLZX}</span>
                              ) : (
                                <span className={st.hasNoValue}>&走向</span>
                              )}
                            </span>
                            。为
                            <span>
                              {entity.QLXZ ? (
                                <span className={st.hasValue}>{entity.QLXZ}</span>
                              ) : (
                                <span className={st.hasNoValue}>&桥梁性质</span>
                              )}
                            </span>
                            ，桥梁全长
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
                            米，梁底标高
                            <span>
                              {entity.LDBG ? (
                                <span className={st.hasValue}>{entity.LDBG}</span>
                              ) : (
                                <span className={st.hasNoValue}>&梁底标高</span>
                              )}
                            </span>
                            米，最大跨度
                            <span>
                              {entity.ZDKD ? (
                                <span className={st.hasValue}>{entity.ZDKD}</span>
                              ) : (
                                <span className={st.hasNoValue}>&最大跨度</span>
                              )}
                            </span>
                            米，最大载重量
                            <span>
                              {entity.ZDZZL ? (
                                <span className={st.hasValue}>{entity.ZDZZL}</span>
                              ) : (
                                <span className={st.hasNoValue}>&最大载重量</span>
                              )}
                            </span>
                            吨。
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
                        ) : (
                          getFieldDecorator('entityTextArea', { initialValue: entity.DLSTGK })(
                            <TextArea
                              rows={4}
                              autoSize={false}
                              disabled={this.isDisabeld('DLSTGK')}
                            ></TextArea>
                          )
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem>
                        <Button
                          type="primary"
                          icon="form"
                          style={{ marginLeft: '20px' }}
                          disabled={this.isDisabeld('DLSTGKBJ')}
                          onClick={() => {
                            if (entityIsTextState === true) return;
                            const entityAutoInputContent = this.entityTextArea.current.textContent;
                            this.setState(
                              {
                                ...this.state,
                                entityIsTextState: true,
                                entity: {
                                  ...entity,
                                  entityText: entityAutoInputContent, //将自动填充状态的文本复制至textArea
                                },
                              },
                              () => {
                                this.props.form.setFieldsValue({
                                  entityTextArea: entityAutoInputContent,
                                });
                              }
                            );
                          }}
                        >
                          编辑
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={20}>
                      <FormItem
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 19 }}
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
                            disabled={this.isDisabeld('DMHY')}
                            onChange={e => {
                              this.mObj.DMHY = e.target.value;
                            }}
                            placeholder="地名含义"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem>
                        <Button
                          type="primary"
                          icon="environment"
                          onClick={this.showLocateMap.bind(this)}
                          disabled={btnDisabled}
                          style={{ marginLeft: '20px' }}
                        >
                          空间定位
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={20}>
                      <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="资料来源">
                        {getFieldDecorator('ZLLY', {
                          initialValue: entity.ZLLY,
                        })(
                          <TextArea
                            disabled={this.isDisabeld('ZLLY')}
                            onChange={e => {
                              this.mObj.ZLLY = e.target.value;
                            }}
                            placeholder="资料来源"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  {FormType == 'ToponymyRename' ? (
                    <Row>
                      <Col span={20}>
                        <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="历史沿革">
                          {getFieldDecorator('LSYG', {
                            initialValue: entity.LSYG,
                          })(
                            <TextArea
                              disabled={this.isDisabeld('LSYG')}
                              onChange={e => {
                                this.mObj.LSYG = e.target.value;
                              }}
                              placeholder="历史沿革"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                </div>
              </div>
            )}

            {/* 申办信息-需要-读取之前提交的信息 */}
            {FormType == 'ToponymyAccept' ||
            FormType == 'ToponymyPreApproval' ||
            FormType == 'ToponymyApproval' ? (
              <div className={st.group}>
                <div className={st.grouptitle}>申办信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('Applicant')}
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('ApplicantPhone')}
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('ApplicantAddress')}
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
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('ApplicantType')}
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
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('ApplicantNumber')}
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申请日期">
                        {getFieldDecorator('ApplicantTime', {
                          initialValue: entity.ApplicantTime,
                        })(
                          <DatePicker
                            disabled={this.isDisabeld('ApplicantTime')}
                            onChange={e => {
                              this.mObj.ApplicantTime = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理人">
                        {getFieldDecorator('SLUser', {
                          initialValue: entity.SLUser,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理日期">
                        {getFieldDecorator('SLTime', {
                          initialValue: entity.SLTime,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            ) : null}

            {/* 申办信息-不需要-读取之前提交的信息 */}
            {FormType == 'ToponymyRename' || FormType == 'ToponymyReplace' ? (
              <div className={st.group}>
                <div className={st.grouptitle}>申办信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>申办人
                          </span>
                        }
                      >
                        {getFieldDecorator('Applicant', {})(
                          <Input
                            disabled={this.isDisabeld('Applicant')}
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系电话
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantPhone', {})(
                          <Input
                            disabled={this.isDisabeld('ApplicantPhone')}
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系地址
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantAddress', {})(
                          <Input
                            disabled={this.isDisabeld('ApplicantAddress')}
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
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                            disabled={this.isDisabeld('ApplicantType')}
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
                    <Col span={6}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件号码
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantNumber', {})(
                          <Input
                            disabled={this.isDisabeld('ApplicantNumber')}
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申请日期">
                        {getFieldDecorator('ApplicantTime', {
                          initialValue: entity.ApplicantTime,
                        })(
                          <DatePicker
                            disabled={this.isDisabeld('ApplicantTime')}
                            onChange={e => {
                              this.mObj.ApplicantTime = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理人">
                        {getFieldDecorator('SLUser', {
                          initialValue: entity.SLUser,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理日期">
                        {getFieldDecorator('SLTime', {
                          initialValue: entity.SLTime,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            ) : null}

            <AttachForm FormType={FormType} entity={entity} FileType="DM_Bridge" />
          </Form>
        </div>
        {showDetailForm ? null : (
          <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
            <div style={{ float: 'right' }}>
              {edit ? (
                <Button
                  onClick={this.onSaveClick.bind(this)}
                  type="primary"
                  disabled={saveBtnClicked}
                >
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
              {FormType == 'ToponymyPreApproval' && saveBtnClicked ? (
                <span>
                  &emsp;
                  <Button type="primary">打印地名预命名使用书</Button>
                </span>
              ) : null}
              {(FormType == 'ToponymyApproval' ||
                FormType == 'ToponymyReplace' ||
                FormType == 'ToponymyRename') &&
              saveBtnClicked ? (
                <span>
                  &emsp;
                  <Button type="primary">打印地名核准书</Button>
                </span>
              ) : null}
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
          {/* 重名 */}
          <Table
            className={st.nameCheckTb}
            title={() => (
              <span>
                <Icon type="exclamation-circle" style={{ color: 'red' }} />
                &emsp; 重名
              </span>
            )}
            columns={columns}
            dataSource={sameName}
            size="small"
          />
          {/* 重音 */}
          <Table
            className={st.nameCheckTb}
            title={() => (
              <span>
                <Icon type="warning" style={{ color: 'orange' }} />
                &emsp; 重音
              </span>
            )}
            columns={columns}
            dataSource={sameYin}
            size="small"
          />
        </Modal>
      </div>
    );
  }
}

BridgeForm = Form.create()(BridgeForm);
export default withRouter(BridgeForm);