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
  Modal,
  Spin,
  notification,
} from 'antd';
const { TextArea } = Input;

import st from './BAForm.less';

import {
  baseUrl,
  url_SearchPlaceNameByID,
  url_ModifyPlaceName,
  url_GetDistrictTreeFromDistrict,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_GetPinyin,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistricts } from '../../../utils/utils.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import { getDivIcons } from '../../../components/Maps/icons';

const FormItem = Form.Item;
const { dm } = getDivIcons();

class BAForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }
  ZYSSTypes = ['交通设施', '水利电力设施', '纪念地旅游地', '亭台碑塔'];
  DMTypes = {
    交通设施: ['铁路', '公路', '港口', '站'],
    水利电力设施: ['蓄水区', '堤堰', '运河', '电力设施'],
    纪念地旅游地: ['纪念地', '公园', '风景名胜区(点)'],
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
    showLocateMap: false,
    districts: [],
    entity: { ApplicantDate: moment(), RecordDate: moment(), ZYSSType: '交通设施' },
    mpTypes: [],
    newForm: true,
    communities: [],
    DMTypeValues: ['铁路', '公路', '港口', '站'],
    SmallTypeValues: ['铁路'],
    postCodes: [],
    LMPY: null,
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
  async changeName(e) {
    let LMPY = pinyinUtil.getPinyin(e);
    let { entity } = this.state;
    entity.Pinyin = LMPY;
    entity.ZMPinyin = LMPY;
    this.setState({ entity });

    this.mObj.Pinyin = LMPY;
    this.mObj.ZMPinyin = LMPY;
    // let rt = await Post(url_GetPinyin, {
    //   strs: e,
    // });
    // rtHandle(rt, d => {
    //   debugger
    //   this.setState({ LMPY: d });
    // });
  }

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
      let districts = getDistricts(d);
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

    let rt = await Post(url_GetNamesFromDic, { type: 4, DistrictID: e[e.length-1] });
    rtHandle(rt, d => {
      this.setState({ communities: d });
    });
  }

  async getFormData(id) {
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取地名数据
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
        this.mObj.ApplicantDate = moment();
        this.mObj.RecordDate = moment();
        this.mObj.ZYSSType = '交通设施';
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

      saveObj.NeighborhoodsID = ds[1] && ds[1].value;
      saveObj.NeighborhoodsName = ds[1] && ds[1].label;

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
    if (!validateObj.CountyID) {
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

  componentDidMount() {
    this.getDistricts();
    this.getFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let {
      showLoading,
      showLocateMap,
      entity,
      districts,
      communities,
      postCodes,
      DMTypeValues,
      SmallTypeValues,
      LMPY,
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
                        changeOnSelect={true}
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
                          this.changeName(e.target.value);
                        }}
                        defaultValue={entity.Name || undefined}
                        placeholder="标准名称"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="罗马字母拼写">
                      <Input
                        onChange={e => {
                          this.mObj.Pinyin = e.target.value;
                          let { entity } = this.state;
                          entity.Pinyin = e.target.value;
                          this.setState({ entity });
                        }}
                        value={entity.Pinyin || undefined}
                        // defaultValue={entity.Pinyin || undefined}
                        placeholder="标准名称"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="专名罗马字母拼写"
                    >
                      <Input
                        onChange={e => {
                          this.mObj.ZMPinyin = e.target.value;
                          let { entity } = this.state;
                          entity.ZMPinyin = e.target.value;
                          this.setState({ entity });
                        }}
                        value={entity.ZMPinyin || undefined}
                        // defaultValue={entity.ZMPinyin || undefined}
                        placeholder="专名罗马字母拼写"
                      />
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
                          this.mObj.SBDW = e.target.value;
                        }}
                        defaultValue={entity.SBDW || undefined}
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
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>项目地址
                        </span>
                      }
                    >
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
                  <FormItem
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
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
                        autosize={{ minRows: 3 }}
                        onChange={e => {
                          this.mObj.DMHY = e.target.value;
                        }}
                        placeholder="地名含义"
                      />
                    )}
                  </FormItem>
                </Row>
                <Row>
                  <FormItem
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    label={
                      <span>
                        <span className={st.ired}>*</span>地理实体概况
                      </span>
                    }
                  >
                    {getFieldDecorator('DLST', {
                      initialValue: entity.DLST,
                    })(
                      <TextArea
                        autosize={{ minRows: 3 }}
                        onChange={e => {
                          this.mObj.DLST = e.target.value;
                        }}
                        placeholder="地理实体概况"
                      />
                    )}
                  </FormItem>
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
                      {getFieldDecorator('Telephone', {
                        initialValue: entity.Telephone,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.Telephone = e.target.value;
                          }}
                          placeholder="联系电话"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="联系地址">
                      {getFieldDecorator('ContractAddress', {
                        initialValue: entity.ContractAddress,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ContractAddress = e.target.value;
                          }}
                          placeholder="联系地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="主管单位">
                      {getFieldDecorator('ZGDW', {
                        initialValue: entity.ZGDW,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ZGDW = e.target.value;
                          }}
                          placeholder="主管单位"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="申请日期">
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
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="备案日期">
                      {getFieldDecorator('RecordDate', {
                        initialValue: entity.RecordDate,
                      })(
                        <DatePicker
                          onChange={e => {
                            this.mObj.RecordDate = e;
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
                  <div>申报表格：</div>
                  <div>
                    <UploadPicture
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.SBBG}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: '申报表格', FileType: 'PROFESSIONALDM' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>立项批复书：</div>
                  <div>
                    <UploadPicture
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.LXPFWJ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: '立项批复书', FileType: 'PROFESSIONALDM' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </div>
                </div>
                <div className={st.picgroup}>
                  <div>设计图：</div>
                  <div>
                    <UploadPicture
                      disabled={!edit}
                      listType="picture"
                      fileList={entity.SJT}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: -1, DOCTYPE: '设计图', FileType: 'PROFESSIONALDM' }}
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
              let { Lat, Lng } = this.state.entity;
              if (Lat && Lng) {
                lm.mpLayer = L.marker([Lat, Lng], { icon: dm }).addTo(lm.map);
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
                name: '地名定位',
                icon: 'icon-dingwei',
                onClick: (dom, i, lm) => {
                  if (!lm.locatePen) {
                    lm.locatePen = new L.Draw.Marker(lm.map, { icon: dm });
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
