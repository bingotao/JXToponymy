import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  DatePicker,
  Icon,
  Cascader,
  Select,
  Tooltip,
  Modal,
  Spin,
  notification,
} from 'antd';
import { zjlx } from '../../../common/enums.js';
import st from './HDForm.less';
const { TextArea } = Input;

import {
  baseUrl,
  url_SearchResidenceMPByID,
  url_GetMPSizeByMPType,
  url_GetDistrictTreeFromDistrict,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_CheckResidenceMPIsAvailable,
  url_ModifyResidenceMP,
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
import { GetHKXX, GetBDCXX } from '../../../services/MP';
import { printMPZ_cj } from '../../../common/Print/LodopFuncs';

const FormItem = Form.Item;
const { mp } = getDivIcons();
class HDForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    showMPZForm: false,
    showMPZForm_cj: false,
    showProveForm: false,
    showLocateMap: false,
    districts: [],
    entity: { BZTime: moment() },
    mpTypes: [],
    newForm: true,
    communities: [],
    residences: [],
    postCodes: [],
    dataShareDisable: true,
  };

  // 存储修改后的数据
  mObj = {};
  getDataShareDisable() {
    let t =
      (this.mObj.PropertyOwner != null || this.state.entity.PropertyOwner != null) &&
      (this.mObj.IDNumber != null || this.state.entity.IDNumber != null)
        ? false
        : true;
    this.setState({
      dataShareDisable: t,
    });
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
    let rt = await Post(url_GetMPSizeByMPType, { mpType: 1 });
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

  async getResidences(e) {
    let { entity } = this.state;
    this.setState({
      residences: [],
      entity: entity,
    });
    let rt = await Post(url_GetNamesFromDic, {
      type: 1,
      DistrictID: entity.Districts[1],
      CommunityName: e,
    });
    rtHandle(rt, d => {
      this.setState({ residences: d });
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
      let rt = await Post(url_SearchResidenceMPByID, { id: id });
      rtHandle(rt, d => {
        console.log(d);
        let districts = [d.CountyID, d.NeighborhoodsID];

        d.Districts = districts;
        d.BZTime = d.BZTime ? moment(d.BZTime) : null;

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
        ResidenceName,
        MPNumber,
        // Dormitory,
        HSNumber,
        LZNumber,
        DYNumber,
      } = validateObj;
      await Post(
        url_CheckResidenceMPIsAvailable,
        {
          ID,
          CountyID,
          NeighborhoodsID,
          CommunityName,
          ResidenceName,
          MPNumber,
          // Dormitory,
          HSNumber,
          LZNumber,
          DYNumber,
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
    // 标准地址格式：嘉兴市/市辖区/镇街道/小区名称/宿舍名/幢号/单元号/房室号
    if (ds) {
      entity.StandardAddress = `嘉兴市${ds.length ? ds[0].label + ds[1].label : ''}`;
    } else {
      entity.StandardAddress = `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName || ept}`;
    }
    entity.StandardAddress += `${obj.ResidenceName || ept}${
      obj.LZNumber ? obj.LZNumber + '幢' : ept
    }${obj.MPNumber ? obj.MPNumber + '号' : ept}${obj.DYNumber ? obj.DYNumber + '单元' : ept}${
      obj.HSNumber ? obj.HSNumber + '室' : ept
    }`;
    this.setState({ entity: entity });
  }

  validate(errs, bAdrress) {
    errs = errs || [];
    let { entity } = this.state;
    let saveObj = {
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

    // 行政区必填
    if (!(validateObj.CountyID && validateObj.NeighborhoodsID)) {
      errs.push('请选择行政区');
    }

    // 小区名
    if (!validateObj.ResidenceName) {
      errs.push('请填写小区名');
    }

    // 是否验证的是标准地址
    if (!bAdrress) {
      // 如果填了门牌号，则门牌规格必填
      if (validateObj.MPNumber && !validateObj.MPSize) {
        errs.push('请选择门牌规格');
      }
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
          this.save(saveObj);
        }
      }.bind(this)
    );
  };

  async save(obj) {
    await Post(url_ModifyResidenceMP, { oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
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
      printMPZ_cj([this.state.entity.ID], 'ResidenceMP', '地名证明');
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
  }
  getBDC() {
    this.showLoading();
    let errs = [];
    let PropertyOwner = null,
      IDNumber = null;
    if (this.mObj.PropertyOwner != null) PropertyOwner = this.mObj.PropertyOwner;
    else if (this.state.entity.PropertyOwner && this.state.entity.PropertyOwner != null)
      PropertyOwner = this.state.entity.PropertyOwner;
    else errs.push('请输入产权人');

    if (this.mObj.IDNumber != null) IDNumber = this.mObj.IDNumber;
    else if (this.state.entity.IDNumber && this.state.entity.IDNumber != null)
      IDNumber = this.state.entity.IDNumber;
    else errs.push('请输入证件号');
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
      GetBDCXX(
        {
          MPID: this.state.entity.ID,
          PropertyOwner,
          IDNumber,
        },
        e => {
          debugger;
        }
      );
    }
    this.hideLoading();
  }
  getHJ() {
    this.showLoading();
    let errs = [];
    let PropertyOwner = null,
      IDNumber = null;
    if (this.mObj.PropertyOwner != null) PropertyOwner = this.mObj.PropertyOwner;
    else if (this.state.entity.PropertyOwner && this.state.entity.PropertyOwner != null)
      PropertyOwner = this.state.entity.PropertyOwner;
    else errs.push('请输入产权人');

    if (this.mObj.IDNumber != null) IDNumber = this.mObj.IDNumber;
    else if (this.state.entity.IDNumber && this.state.entity.IDNumber != null)
      IDNumber = this.state.entity.IDNumber;
    else errs.push('请输入证件号');
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
      GetHKXX(
        {
          MPID: this.state.entity.ID,
          PropertyOwner,
          IDNumber,
        },
        e => {
          let HJ = e.files;
          let Info = e.info;
          this.mObj.HJAddress = Info.hjdz;
          this.mObj.HJNumber = Info.hjh;
          let entity = { ...this.state.entity, ...this.mObj };
          debugger;
          entity.HJ = HJ;
          this.setState({ entity });
        }
      );
    }
    this.hideLoading();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let {
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
      residences,
      postCodes,
      dataShareDisable,
    } = this.state;
    const { edit } = this;

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
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="村社区">
                      <Select
                        allowClear
                        placeholder="村社区"
                        showSearch={true}
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
                          this.getResidences(e);
                          this.getPostCodes(e);
                          this.setState({ entity: entity }, this.combineStandard.bind(this));
                        }}
                        defaultValue={entity.CommunityName || undefined}
                        value={entity.CommunityName || undefined}
                      >
                        {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮政编码">
                      <Select
                        allowClear
                        placeholder="邮政编码"
                        showSearch={true}
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
                      >
                        {postCodes.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="产权人">
                      {getFieldDecorator('PropertyOwner', {
                        initialValue: entity.PropertyOwner,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.PropertyOwner = e.target.value;
                            this.getDataShareDisable();
                          }}
                          placeholder="产权人"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="证件类型">
                      {getFieldDecorator('IDType', {
                        initialValue: entity.IDType,
                      })(
                        <Select
                          allowClear
                          onChange={e => {
                            this.mObj.IDType = e || '';
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="证件号码">
                      {getFieldDecorator('IDNumber', {
                        initialValue: entity.IDNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.IDNumber = e.target.value;
                            this.getDataShareDisable();
                          }}
                          placeholder="证件号码"
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
                          <span className={st.ired}>*</span>小区名称
                        </span>
                      }
                    >
                      <Select
                        allowClear
                        onSearch={e => {
                          this.mObj.ResidenceName = e;
                          let { entity } = this.state;
                          entity.ResidenceName = e;
                          this.setState({ entity: entity }, this.combineStandard.bind(this));
                        }}
                        onSelect={e => {
                          this.mObj.ResidenceName = e;
                          let { entity } = this.state;
                          entity.ResidenceName = e;
                          this.setState({ entity: entity }, this.combineStandard.bind(this));
                        }}
                        onChange={e => {
                          this.mObj.ResidenceName = e;
                          let { entity } = this.state;
                          entity.ResidenceName = e;
                          this.setState({ entity: entity }, this.combineStandard.bind(this));
                        }}
                        defaultValue={entity.ResidenceName || undefined}
                        value={entity.ResidenceName || undefined}
                        placeholder="小区名称"
                        showSearch
                      >
                        {residences.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌号">
                      {getFieldDecorator('MPNumber', {
                        initialValue: entity.MPNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.MPNumber = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="门牌号"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌规格">
                      {getFieldDecorator('MPSize', {
                        initialValue: entity.MPSize,
                      })(
                        <Select
                          allowClear
                          onChange={e => {
                            this.mObj.MPSize = e || '';
                          }}
                          placeholder="门牌规格"
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
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="幢号">
                      {getFieldDecorator('LZNumber', {
                        initialValue: entity.LZNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.LZNumber = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="幢号"
                          addonAfter="幢"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="单元号">
                      {getFieldDecorator('DYNumber', {
                        initialValue: entity.DYNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.DYNumber = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="单元号"
                          addonAfter="单元"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={<span>户室号</span>}
                    >
                      {getFieldDecorator('HSNumber', {
                        initialValue: entity.HSNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.HSNumber = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="户室号"
                          addonAfter="室"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
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
                      >
                        验证地址
                      </Button>
                      &emsp;
                      <Button
                        type="primary"
                        icon="environment"
                        onClick={this.showLocateMap.bind(this)}
                      >
                        空间定位
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={st.group}>
              <div className={st.grouptitle}>产证信息</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="房产证地址">
                      {getFieldDecorator('FCZAddress', { initialValue: entity.FCZAddress })(
                        <Input
                          onChange={e => {
                            this.mObj.FCZAddress = e.target.value;
                          }}
                          placeholder="房产证地址"
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
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="不动产证地址">
                      {getFieldDecorator('BDCZAddress', { initialValue: entity.BDCZAddress })(
                        <Input
                          onChange={e => {
                            this.mObj.BDCZAddress = e.target.value;
                          }}
                          placeholder="不动产证地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="不动产证号">
                      {getFieldDecorator('BDCZNumber', { initialValue: entity.BDCZNumber })(
                        <Input
                          onChange={e => {
                            this.mObj.BDCZNumber = e.target.value;
                          }}
                          placeholder="不动产证号"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem>
                      &emsp;
                      <Button
                        type="primary"
                        icon="bank"
                        onClick={this.getBDC.bind(this)}
                        disabled={dataShareDisable}
                      >
                        获取不动产数据
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户籍地址">
                      {getFieldDecorator('HJAddress', { initialValue: entity.HJAddress })(
                        <Input
                          onChange={e => {
                            this.mObj.HJAddress = e.target.value;
                          }}
                          placeholder="户籍地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户籍号">
                      {getFieldDecorator('HJNumber', { initialValue: entity.HJNumber })(
                        <Input
                          onChange={e => {
                            this.mObj.HJNumber = e.target.value;
                          }}
                          placeholder="户籍号"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem>
                      &emsp;
                      <Button
                        type="primary"
                        icon="contacts"
                        onClick={this.getHJ.bind(this)}
                        disabled={dataShareDisable}
                      >
                        获取户籍数据
                      </Button>
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
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={st.group}>
              <div className={st.grouptitle}>申办人信息</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="申办人">
                      {getFieldDecorator('Applicant', {
                        initialValue: entity.Applicant,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.Applicant = e.target.value;
                          }}
                          placeholder="申办人"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="联系电话">
                      {getFieldDecorator('ApplicantPhone', {
                        initialValue: entity.ApplicantPhone,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ApplicantPhone = e.target.value;
                          }}
                          placeholder="联系电话"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="编制日期">
                      {getFieldDecorator('BZTime', {
                        initialValue: entity.BZTime,
                      })(
                        <DatePicker
                          onChange={e => {
                            this.mObj.BZTime = e;
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={st.group}>
              <div className={st.grouptitle}>附件上传</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>居民身份证：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.SFZ}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '居民身份证', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>申请表：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.SQB}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '申请表', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>委托书：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.WTS}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '委托书', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>房产证文件：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.FCZ}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '房产证', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>土地证文件：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.TDZ}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '土地证', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>不动产证文件：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.BDCZ}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '不动产证', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>购房合同：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.GFHT}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '购房合同', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>法院判决书：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.FYPJS}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '法院判决书', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>测绘报告：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.CHBG}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '测绘报告', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className={st.picgroup}>
                      <div>其他文件：</div>
                      <div>
                        <UploadPicture
                          disabled={!edit}
                          listType="picture"
                          fileList={entity.QT}
                          id={entity.ID}
                          fileBasePath={baseUrl}
                          data={{ RepairType: -1, DOCTYPE: '其他文件', FileType: 'Residence' }}
                          uploadAction={url_UploadPicture}
                          removeAction={url_RemovePicture}
                          getAction={url_GetPictureUrls}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </div>
        <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
          {newForm ? null : edit ? (
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
          ) : null}
          <div style={{ float: 'right' }}>
            {edit ? (
              <Button onClick={this.onSaveClick.bind(this)} type="primary">
                保存
              </Button>
            ) : null}
            &emsp;
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
            type="ResidenceMP"
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
            type="ResidenceMP"
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
            type="ResidenceMP"
            PrintType="门牌证"
            onCancel={this.closeMPZForm_cj.bind(this)}
            onPrint={this.closeMPZForm_cj.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

HDForm = Form.create()(HDForm);
export default HDForm;
