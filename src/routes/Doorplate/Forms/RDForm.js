/*
道路类必填项：行政区划、道路名称、门牌号、门牌规格
门牌号只能是数字
标准地址：嘉兴市/市辖区/镇街道/道路名/门牌号

1、如果选择了不制作门牌，就可以不用再勾选需不需要邮寄门牌了
2、点了邮寄门牌，邮寄地址必须要填
3、默认制作门牌和邮寄门牌都是选中的
4、在新增门牌表单没有填完数据进行过保存，就不允许点击门牌证打印和地名证明开具的按钮，保存成功后才可以使用这两个按钮

*/
import React, { Component } from 'react';
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

import {
  baseUrl,
  url_SearchRoadMPByID,
  url_GetMPSizeByMPType,
  url_GetDistrictTreeFromDistrict,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_CheckRoadMPIsAvailable,
  url_ModifyRoadMP,
  url_GetNamesFromDic,
  url_GetPostCodes,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistricts } from '../../../utils/utils.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import st from './RDForm.less';
import { zjlx } from '../../../common/enums.js';
import ProveForm from '../../../routes/ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import { getDivIcons } from '../../../components/Maps/icons';

const FormItem = Form.Item;
let defaultValues = { MPProduce: 1, MPMail: 1, BZTime: moment() };
const { mp } = getDivIcons();

class RDForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    showMPZForm: false,
    showProveForm: false,
    showLocateMap: false,
    districts: [],
    entity: { ...defaultValues },
    mpTypes: [],
    newForm: true,
    communities: [],
    postCodes: [],
    roads: [],
  };

  // 存储修改后的数据
  mObj = {};

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
      let { ID, CountyID, NeighborhoodsID, CommunityName, RoadName, MPNumber } = validateObj;
      await Post(
        url_CheckRoadMPIsAvailable,
        {
          ID,
          CountyID,
          NeighborhoodsID,
          CommunityName,
          RoadName,
          MPNumber,
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

  async getRoads(e) {
    let { entity } = this.state;
    this.setState({
      roads: [],
      entity: entity,
    });

    let rt = await Post(url_GetNamesFromDic, { type: 2, NeighborhoodsID: e[1] });
    rtHandle(rt, d => {
      this.setState({ roads: d });
    });
  }

  async getCommunities(e) {
    let { entity } = this.state;
    this.setState({
      communities: [],
      entity: entity,
    });

    let rt = await Post(url_GetNamesFromDic, { type: 4, NeighborhoodsID: e[1] });
    rtHandle(rt, d => {
      this.setState({ communities: d });
    });
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
    let rt = await Post(url_GetMPSizeByMPType, { mpType: 2 });
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

  async getFormData(id) {
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取门牌数据
    if (id) {
      let rt = await Post(url_SearchRoadMPByID, { id: id });
      rtHandle(rt, d => {
        console.log(d);
        let districts = [d.CountyID, d.NeighborhoodsID];

        d.Districts = districts;
        d.BZTime = d.BZTime ? moment(d.BZTime) : null;

        this.setState({ entity: d, newForm: false });
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

  combineStandard() {
    let { entity } = this.state;
    let obj = {
      ...entity,
      ...this.mObj,
    };
    let ds = obj.districts;
    let ept = '';

    // 如果行政区修改过
    if (ds) {
      entity.StandardAddress = `嘉兴市${ds.length ? ds[0].label + ds[1].label : ept}`;
    } else {
      entity.StandardAddress = `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName || ept}`;
    }
    entity.StandardAddress += `${obj.RoadName || ept}${obj.MPNumber ? obj.MPNumber + '号' : ept}`;
    this.setState({ entity: entity });
  }

  onSaveClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function(err, values) {
        console.log(this.mObj);
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

    if (!(validateObj.CountyID && validateObj.NeighborhoodsID)) {
      errs.push('请选择行政区');
    }

    if (!validateObj.RoadName) {
      errs.push('请填写道路名');
    }

    if (!validateObj.MPNumber) {
      errs.push('请填写门牌号码');
    }

    // 是否是标准地址验证
    if (!bAdrress) {
      if (!validateObj.MPSize) {
        errs.push('请选择门牌规格');
      }

      // 邮寄地址验证
      if (validateObj.MPMail && !validateObj.MailAddress) {
        errs.push('请填写邮寄地址');
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
    await Post(url_ModifyRoadMP, { oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      this.mObj = {};
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
      this.getFormData(this.state.entity.ID);
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

  onPrintDMZM() {
    if (this.isSaved()) {
      this.setState({ showProveForm: true });
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

  componentDidMount() {
    this.getDistricts();
    this.getMPSizeByMPType();
    this.getFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let {
      showMPZForm,
      showProveForm,
      newForm,
      showLoading,
      showLocateMap,
      entity,
      districts,
      mpTypes,
      communities,
      postCodes,
      roads,
    } = this.state;
    const { edit } = this;

    return (
      <div className={st.RDForm}>
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
                          this.getRoads(a);
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
                        onSelect={e => {
                          this.mObj.CommunityName = e;
                          let { entity } = this.state;
                          entity.CommunityName = e;
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
                          <span className={st.ired}>*</span>道路名称
                        </span>
                      }
                    >
                      <Select
                        allowClear
                        onSearch={e => {
                          this.mObj.RoadName = e;
                          let { entity } = this.state;
                          entity.RoadName = e;
                          this.setState({ entity: entity }, this.combineStandard.bind(this));
                        }}
                        onSelect={e => {
                          this.mObj.RoadName = e;
                          let { entity } = this.state;
                          entity.RoadName = e;
                          this.setState({ entity: entity }, this.combineStandard.bind(this));
                        }}
                        defaultValue={entity.RoadName || undefined}
                        value={entity.RoadName || undefined}
                        placeholder="道路名称"
                        showSearch
                      >
                        {roads.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="道路起点">
                      {getFieldDecorator('RoadStart', {
                        initialValue: entity.RoadStart,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.RoadStart = e.target.value;
                          }}
                          placeholder="道路起点"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="道路讫点">
                      {getFieldDecorator('RoadEnd', {
                        initialValue: entity.RoadEnd,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.RoadEnd = e.target.value;
                          }}
                          placeholder="道路讫点"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="编制规则">
                      {getFieldDecorator('MPRules', {
                        initialValue: entity.MPRules,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.MPRules = e.target.value;
                          }}
                          placeholder="编制规则"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌区段">
                      {getFieldDecorator('MPNumberRange', {
                        initialValue: entity.MPNumberRange,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.MPNumberRange = e.target.value;
                          }}
                          placeholder="门牌区段"
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
                          <span className={st.ired}>*</span>门牌号码
                        </span>
                      }
                    >
                      {getFieldDecorator('MPNumber', {
                        initialValue: entity.MPNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.MPNumber = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="门牌号码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  {/* <Col span={3}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="经度">
                      {getFieldDecorator('Lng', { initialValue: entity.Lng })(
                        <Input disabled placeholder="经度" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="纬度">
                      {getFieldDecorator('Lat', { initialValue: entity.Lat })(
                        <Input disabled placeholder="纬度" />
                      )}
                    </FormItem>
                  </Col> */}
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="预留号码">
                      {getFieldDecorator('ReservedNumber', {
                        initialValue: entity.ReservedNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ReservedNumber = e.target.value;
                          }}
                          placeholder="预留号码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="商铺名称">
                      {getFieldDecorator('ShopName', {
                        initialValue: entity.ShopName,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ShopName = e.target.value;
                          }}
                          placeholder="商铺名称"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="原门牌号码">
                      {getFieldDecorator('OriginalNumber', {
                        initialValue: entity.OriginalNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.OriginalNumber = e.target.value;
                          }}
                          placeholder="原门牌号码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="标准地址">
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
                      {getFieldDecorator('TDZAddress', { initialValue: entity.IDType })(
                        <Input
                          onChange={e => {
                            this.mObj.OtherAddress = e.target.value;
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="营业执照地址">
                      {getFieldDecorator('YYZZAddress', { initialValue: entity.YYZZAddress })(
                        <Input
                          onChange={e => {
                            this.mObj.YYZZAddress = e.target.value;
                          }}
                          placeholder="营业执照地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="营业执照证号">
                      {getFieldDecorator('YYZZNumber', { initialValue: entity.YYZZNumber })(
                        <Input
                          onChange={e => {
                            this.mObj.YYZZNumber = e.target.value;
                          }}
                          placeholder="营业执照证号"
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
                        >
                          制作门牌
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
                        >
                          邮寄门牌
                        </Checkbox>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮寄地址">
                      {getFieldDecorator('MailAddress', { initialValue: entity.MailAddress })(
                        <Input
                          onChange={e => {
                            this.mObj.MailAddress = e.target.value;
                          }}
                          placeholder="邮寄地址"
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
                <div className={st.picgroup}>
                  <div>申请表：</div>
                  <div>
                    <UploadPicture
                      listType="picture"
                      disabled={!edit}
                      fileList={entity.SQB}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'SQB', FileType: 'Road' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>房产证文件：</div>
                  <div>
                    <UploadPicture
                      listType="picture"
                      disabled={!edit}
                      fileList={entity.FCZ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'FCZ', FileType: 'Road' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>土地证文件：</div>
                  <div>
                    <UploadPicture
                      listType="picture"
                      disabled={!edit}
                      fileList={entity.TDZ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'TDZ', FileType: 'Road' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>营业执照文件：</div>
                  <div>
                    <UploadPicture
                      listType="picture"
                      disabled={!edit}
                      fileList={entity.YYZZ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'YYZZ', FileType: 'Road' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>
        <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
          {newForm
            ? null
            : this.getEditComponent(
                <div style={{ float: 'left' }}>
                  <Button type="primary" onClick={this.onPrintMPZ.bind(this)}>
                    打印门牌证
                  </Button>
                  &emsp;
                  <Button type="primary" onClick={this.onPrintDMZM.bind(this)}>
                    开具地名证明
                  </Button>
                </div>
              )}
          <div style={{ float: 'right' }}>
            {this.getEditComponent(
              <Button onClick={this.onSaveClick.bind(this)} type="primary">
                保存
              </Button>
            )}
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
              let { Lat, Lng } = this.state.entity;
              if (Lat && Lng) {
                lm.mpLayer = L.marker([Lat, Lng], { icon: mp }).addTo(lm.map);
                lm.map.setView([Lat, Lng], 16);
              }
            }}
            onMapClear={lm => {
              lm.mpLayer && lm.mpLayer.remove();
              lm.mpLayer = null;
              let { entity } = this.state;
              entity.Lat = null;
              entity.Lng = null;
              this.mObj.Lng = entity.Lng;
              this.mObj.Lat = entity.Lat;
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

                  entity.Lng = lng.toFixed(8) - 0;
                  entity.Lat = lat.toFixed(8) - 0;

                  this.mObj.Lng = entity.Lng;
                  this.mObj.Lat = entity.Lat;

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
            type="RoadMP"
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
            type="RoadMP"
            onCancel={this.closeMPZForm.bind(this)}
            onOKClick={this.closeMPZForm.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

RDForm = Form.create()(RDForm);
export default RDForm;
