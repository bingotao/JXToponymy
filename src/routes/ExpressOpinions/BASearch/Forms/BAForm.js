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
const { TextArea } = Input;

import { zjlx } from '../../../../common/enums.js';
import st from './BAForm.less';

import {
  baseUrl,
  url_SearchPlaceNameByID,
  url_ModifyPlaceName,
  url_GetMPSizeByMPType,
  url_GetDistrictTreeFromDistrict,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
} from '../../../../common/urls';
import { Post } from '../../../../utils/request.js';
import { rtHandle } from '../../../../utils/errorHandle.js';
import LocateMap from '../../../../components/Maps/LocateMap2.js';
import { getDistricts } from '../../../../utils/utils.js';
import UploadPicture from '../../../../components/UploadPicture/UploadPicture.js';
import ProveForm from '../../../../routes/ToponymyProve/ProveForm';
import MPZForm from '../../../ToponymyProve/MPZForm';
import { getDivIcons } from '../../../../components/Maps/icons';
import { debug } from 'util';

const FormItem = Form.Item;
const { mp } = getDivIcons();

class BAForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }
  ZYSSTypes = ['交通设施类', '水利电力设施类', '纪念地旅游地类', '亭台碑塔'];
  DMTypes = {
    交通设施类: ['铁路', '公路', '港口', '站'],
    水利电力设施类: ['蓄水区', '堤堰', '运河', '电力设施'],
    纪念地旅游地类: ['纪念地', '公园', '风景名胜区(点)'],
    亭台碑塔: ['亭台碑塔'],
  };
  SmallTypes = {
    铁路: ['铁路'],
    公路: ['国道', '省道', '县道', '乡道'],
    港口: ['海港', '河港'],
    站: ['长途汽车站', '公共交通车站', '火车站', '收费站', '检查站', '管站', '加油站'],
    蓄水区: ['蓄洪区', '泄洪区'],
    堤堰: ['海堤', '河堤', '湖堤', '闸坝'],
    运河: ['运河'],
    电力设施: ['发电站', '输变电站'],
    纪念地: ['人物', '事件', '宗教'],
    公园: ['公园'],
    '风景名胜区(点)': ['风景名胜区（点）'],
    亭台碑塔: ['亭', '台', '碑', '塔'],
  };
  state = {
    showMPZForm: false,
    showProveForm: false,
    showLocateMap: false,
    districts: [],
    entity: { ApplicantDate: moment(), RecordDate: moment(), ZYSSType: '交通设施类' },
    mpTypes: [],
    newForm: true,
    communities: [],
    DMTypeValues: ['铁路', '公路', '港口', '站'],
    SmallTypeValues: ['铁路'],
    postCodes: [],
  };
  ChangeZYSSTypes(e) {
    let { entity, DMTypeValues, SmallTypeValues } = this.state;
    DMTypeValues = this.DMTypes[e];
    SmallTypeValues = [];
    entity.DMType = null;
    entity.SmallType = null;
    this.setState({ DMTypeValues, SmallTypeValues });
  }
  ChangeDMTypes(e) {
    let { entity, SmallTypeValues } = this.state;
    SmallTypeValues = this.SmallTypes[e];
    entity.SmallType = null;
    this.setState({ SmallTypeValues, entity });
  }

  // 存储修改后的数据
  mObj = { ZYSSType: '交通设施类' };

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

  async getFormData(id) {
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取门牌数据
    if (id) {
      let rt = await Post(url_SearchPlaceNameByID, { id: id });
      rtHandle(rt, d => {
        let districts = [d.CountyID, d.NeighborhoodsID];
        d.Districts = districts;
        d.ApplicantDate = d.ApplicantDate ? moment(d.ApplicantDate) : null;
        d.RecordDate = d.RecordDate ? moment(d.RecordDate) : null;

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
    if (saveObj.ApplicantDate) {
      saveObj.ApplicantDate = saveObj.ApplicantDate.format();
    }
    if (saveObj.RecordDate) {
      saveObj.RecordDate = saveObj.RecordDate.format();
    }

    let validateObj = {
      ...entity,
      ...saveObj,
    };

    // 行政区必填
    if (!(validateObj.CountyID && validateObj.NeighborhoodsID)) {
      errs.push('请选择行政区');
    }
    // 地名类别
    if (!validateObj.DMType) {
      errs.push('请选择地名类别');
    }
    // 小类类别
    if (!validateObj.SmallType) {
      errs.push('请选择小类类别');
    }
    // 标准名称
    if (!validateObj.Name) {
      errs.push('请输入标准名称');
    }
    // 申报单位
    if (!validateObj.SBDW) {
      errs.push('请输入申报单位');
    }
    // 项目地址
    if (!validateObj.XMAddress) {
      errs.push('请输入项目地址');
    }
    // 地名含义
    if (!validateObj.DMHY) {
      errs.push('请输入地名含义');
    }
    // 地理实体概况
    if (!validateObj.DLST) {
      errs.push('请输入地理实体概况');
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
    await Post(url_ModifyPlaceName, { oldDataJson: JSON.stringify(obj) }, e => {
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
      mpTypes,
      districts,
      communities,
      postCodes,
      DMTypeValues,
      SmallTypeValues,
    } = this.state;
    const { edit } = this;

    return (
      <div className={st.BAForm}>
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
                          <span className={st.ired}>*</span>专业设施类别
                        </span>
                      }
                    >
                      <Select
                        onChange={e => {
                          this.mObj.ZYSSType = e;
                          let { entity } = this.state;
                          entity.ZYSSType = e;
                          this.setState({ entity });
                          this.ChangeZYSSTypes(e);
                        }}
                        placeholder="专业设施类别"
                        defaultValue={entity.ZYSSType || undefined}
                        value={entity.ZYSSType || undefined}
                      >
                        {this.ZYSSTypes.map(e => (
                          <Select.Option value={e} key={e}>
                            {e}
                          </Select.Option>
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
                          this.setState({ entity: entity });
                        }}
                        onSelect={e => {
                          this.mObj.CommunityName = e;
                          let { entity } = this.state;
                          entity.CommunityName = e;
                          this.getPostCodes(e);
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.CommunityName || undefined}
                        value={entity.CommunityName || undefined}
                      >
                        {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
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
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>地名类别
                        </span>
                      }
                    >
                      <Select
                        onChange={e => {
                          this.mObj.DMType = e;
                          let { entity } = this.state;
                          entity.DMType = e;
                          this.setState({ entity });
                          this.ChangeDMTypes(e);
                        }}
                        placeholder="地名类别"
                        defaultValue={entity.DMType || undefined}
                        value={entity.DMType || undefined}
                      >
                        {DMTypeValues.map(e => (
                          <Select.Option value={e} key={e}>
                            {e}
                          </Select.Option>
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
                          <span className={st.ired}>*</span>小类类别
                        </span>
                      }
                    >
                      <Select
                        onChange={e => {
                          this.mObj.SmallType = e;
                          let { entity } = this.state;
                          entity.SmallType = e;
                          this.setState({ entity });
                        }}
                        placeholder="地名类别"
                        defaultValue={entity.SmallType || undefined}
                        value={entity.SmallType || undefined}
                      >
                        {SmallTypeValues.map(e => (
                          <Select.Option value={e} key={e}>
                            {e}
                          </Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>

                <Row />
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>标准名称
                        </span>
                      }
                    >
                      <Input
                        onChange={e => {
                          this.mObj.Name = e.target.value;
                        }}
                        placeholder="标准名称"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="罗马字母拼写">
                      {getFieldDecorator('Pinyin', {
                        initialValue: entity.Pinyin,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.Pinyin = e.target.value;
                          }}
                          placeholder="罗马字母拼写"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="专名罗马字母拼写"
                    >
                      {getFieldDecorator('ZMPinyin', {
                        initialValue: entity.ZMPinyin,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ZMPinyin = e.target.value;
                          }}
                          placeholder="专名罗马字母拼写"
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
                          <span className={st.ired}>*</span>申报单位
                        </span>
                      }
                    >
                      <Input
                        onChange={e => {
                          this.mObj.MPNumber = e.target.value;
                        }}
                        placeholder="申报单位"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="统一社会信用代码"
                    >
                      {getFieldDecorator('XYDM', {
                        initialValue: entity.XYDM,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.XYDM = e.target.value;
                          }}
                          placeholder="统一社会信用代码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="项目地址">
                      {getFieldDecorator('XMAddress', {
                        initialValue: entity.XMAddress,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.XMAddress = e.target.value;
                          }}
                          placeholder="项目地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={5}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="东至">
                      {getFieldDecorator('East', {
                        initialValue: entity.East,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.East = e.target.value;
                          }}
                          placeholder="东至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={5}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="南至">
                      {getFieldDecorator('South', {
                        initialValue: entity.South,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.South = e.target.value;
                          }}
                          placeholder="南至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={5}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="西至">
                      {getFieldDecorator('West', {
                        initialValue: entity.West,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.West = e.target.value;
                          }}
                          placeholder="西至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={5}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="北至">
                      {getFieldDecorator('North', {
                        initialValue: entity.North,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.North = e.target.value;
                          }}
                          placeholder="北至"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={3} style={{ marginLeft: 40 }}>
                    <FormItem>
                      <Button
                        type="primary"
                        icon="environment"
                        onClick={this.showLocateMap.bind(this)}
                      >
                        定位
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 22 }} label="地名含义">
                    {getFieldDecorator('DMHY', {
                      initialValue: entity.DMHY,
                    })(
                      <TextArea
                        autosize={{ minRows: 3}}
                        onChange={e => {
                          this.mObj.DMHY = e.target.value;
                        }}
                        placeholder="地名含义"
                      />
                    )}
                  </FormItem>
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
                      {getFieldDecorator('ApplicantDate', {
                        initialValue: entity.ApplicantDate,
                      })(
                        <DatePicker
                          onChange={e => {
                            this.mObj.ApplicantDate = e;
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
                <div className={st.picgroup}>
                  <div>申请表：</div>
                  <div>
                    <UploadPicture
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.SQB}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'SQB', FileType: 'Residence' }}
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
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.FCZ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'FCZ', FileType: 'Residence' }}
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
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.TDZ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'TDZ', FileType: 'Residence' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>不动产证文件：</div>
                  <div>
                    <UploadPicture
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.BDCZ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'BDCZ', FileType: 'Residence' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>户籍文件：</div>
                  <div>
                    <UploadPicture
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.HJ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: 'HJ', FileType: 'Residence' }}
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
      </div>
    );
  }
}

BAForm = Form.create()(BAForm);
export default BAForm;
