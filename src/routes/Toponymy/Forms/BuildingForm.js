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
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_ModifySettlementDM,
  url_SettlementNameDM,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
// import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { getUser } from '../../../utils/login';
import AttachForm from './AttachForm';
import { GetNameRow } from './ComFormComponent.js';

const FormItem = Form.Item;
// const { mp } = getDivIcons();

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

class SettlementForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }
  state = {
    showLoading: true,
    showLocateMap: false,
    districts: [],
    entity: { CreateTime: moment(), ApplicantTime: moment(), Districts: [], ShowDistricts: [] },
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
      // saveObj.CountyID = ds[0].value;
      // saveObj.CountyName = ds[0].label;
      // saveObj.NeighborhoodsID = ds[1].value;
      // saveObj.NeighborhoodsName = ds[1].label;

      delete saveObj.districts;
    }
    if (saveObj.BZTime) {
      saveObj.BZTime = saveObj.BZTime.format();
    }

    let validateObj = {
      ...entity,
      ...saveObj,
    };
    console.dir(validateObj);
    // 小类类别
    if (!validateObj.Type) {
      errs.push('请选择小类类别');
    }
    // 行政区必填
    if (!validateObj.DistrictID) {
      errs.push('请选择行政区');
    }
    // 拟用名称1
    if (!validateObj.Name1) {
      errs.push('请输入拟用名称1');
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
    await Post(url_ModifySettlementDM, { oldDataJson: JSON.stringify(obj) }, e => {
      //await Post(url_ModifyResidenceMP, { oldDataJson: JSON.stringify(obj) }, e => {
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
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>小类类别
                        </span>
                      }
                    >
                      <Select
                        onChange={e => {
                          this.mObj.Type = e;
                          let { entity } = this.state;
                          entity.Type = e;
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.Type || undefined}
                        value={entity.Type || undefined}
                        placeholder="小类类别"
                      >
                        {['城镇居民点', '农村居民点'].map(e => (
                          <Select.Option value={e}>{e}</Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>所在行政区
                        </span>
                      }
                    >
                      <Cascader
                        changeOnSelect
                        options={districts}
                        disabled={
                          choseSzxzq == undefined ? false : choseSzxzq == true ? false : true
                        }
                        onChange={(value, selectedOptions) => {
                          console.log(value);
                          this.mObj.szxzq = value;
                          entity.szxzq = value;
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
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="村社区">
                      <Select
                        allowClear
                        placeholder="村社区"
                        showSearch={true}
                        mode={'combobox'}
                        disabled={choseSzxzq == true ? false : true}
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
                        defaultValue={entity.CommunityName || undefined}
                        value={entity.CommunityName || undefined}
                      >
                        {communities.map(e => (
                          <Select.Option value={e}>{e}</Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    <FormItem
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 14 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>所跨行政区
                        </span>
                      }
                    >
                      <Select
                        mode="tags"
                        value={entity.ShowDistricts}
                        open={false}
                        placeholder="所跨行政区"
                        style={{ width: '42%', marginRight: '2%' }}
                        disabled={
                          choseSzxzq == undefined ? false : choseSzxzq == true ? true : false
                        }
                        onDeselect={value => {
                          let { entity } = this.state;
                          entity.ShowDistricts = entity.ShowDistricts.filter(v => {
                            v !== value;
                          });
                          this.setState({
                            entity,
                          });
                          console.log(entity.ShowDistricts);
                          if (entity.ShowDistricts.length == 0) {
                            this.setState({ entity: entity, choseSzxzq: undefined });
                          } else {
                            this.setState({ entity: entity, choseSzxzq: false });
                          }
                        }}
                      />
                      <Cascader
                        value={null}
                        allowClear
                        expandTrigger="hover"
                        options={districts}
                        placeholder="请选择所跨行政区"
                        changeOnSelect
                        style={{ width: '40%' }}
                        disabled={
                          choseSzxzq == undefined ? false : choseSzxzq == true ? true : false
                        }
                        onChange={(value, selectedOptions) => {
                          console.log(value);
                          this.mObj.districts = selectedOptions;
                          let { entity } = this.state;
                          entity.Districts.push(value);
                          const showValue = value[value.length - 1].split('.').join('');
                          entity.ShowDistricts.push(showValue);

                          this.getCommunities(value);
                          this.setState({ entity: entity });
                          if (entity.ShowDistricts.length == 0) {
                            this.setState({ entity: entity, choseSzxzq: undefined });
                          } else {
                            this.setState({ entity: entity, choseSzxzq: false });
                          }
                        }}
                      />
                    </FormItem>
                  </Col>
                </Row>

                {GetNameRow(FormType, entity)}
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="邮政编码">
                      <Select
                        allowClear
                        placeholder="邮政编码"
                        showSearch={true}
                        mode={'combobox'}
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
                        {postCodes.map(e => (
                          <Select.Option value={e}>{e}</Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
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
                        placeholder="申报单位"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label="统一社会信用代码"
                    >
                      <Input
                        onChange={e => {
                          this.mObj.SHXYDM = e.target.value;
                        }}
                        placeholder="统一社会信用代码"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="东至">
                      <Input
                        onChange={e => {
                          this.mObj.East = e.target.value;
                          let { entity } = this.state;
                          entity.East = e.target.value;
                          this.setState({ entity: entity });
                        }}
                        placeholder="东至"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="南至">
                      <Input
                        onChange={e => {
                          this.mObj.South = e.target.value;
                          let { entity } = this.state;
                          entity.South = e.target.value;
                          this.setState({ entity: entity });
                        }}
                        placeholder="南至"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="西至">
                      <Input
                        onChange={e => {
                          this.mObj.West = e.target.value;
                          let { entity } = this.state;
                          entity.West = e.target.value;
                          this.setState({ entity: entity });
                        }}
                        placeholder="西至"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="北至">
                      <Input
                        onChange={e => {
                          this.mObj.North = e.target.value;
                          let { entity } = this.state;
                          entity.North = e.target.value;
                          this.setState({ entity: entity });
                        }}
                        placeholder="北至"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label="占地面积（平方米）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.ZDArea = e;
                          let { entity } = this.state;
                          entity.ZDArea = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="占地面积（平方米）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label="建筑面积（平方米）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.JZArea = e;
                          let { entity } = this.state;
                          entity.JZArea = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="建筑面积（平方米）"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label="主体高度（米）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.ZTGD = e;
                          let { entity } = this.state;
                          entity.ZTGD = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="主体高度（米）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 10 }}
                      wrapperCol={{ span: 14 }}
                      label="主体层数（层）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.ZTCS = e;
                          let { entity } = this.state;
                          entity.ZTCS = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="主体层数（层）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="建成年月">
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.JCNY = e;
                          let { entity } = this.state;
                          entity.JCNY = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="建成年月"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    <FormItem
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 19 }}
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
                        平方米，主体高度
                        <span>
                          {entity.ZTGD ? (
                            <span className={st.hasValue}>{entity.ZTGD}</span>
                          ) : (
                            <span className={st.hasNoValue}>&主体高度</span>
                          )}
                        </span>
                        米，主体层数
                        <span>
                          {entity.ZTCS ? (
                            <span className={st.hasValue}>{entity.ZTCS}</span>
                          ) : (
                            <span className={st.hasNoValue}>&主体层数</span>
                          )}
                        </span>
                        层，
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
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 19 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>地名含义
                        </span>
                      }
                    >
                      <TextArea
                        onChange={e => {
                          this.mObj.DMHY = e.target.value;
                        }}
                        placeholder="地名含义"
                      />
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="联系地址">
                      {getFieldDecorator('ApplicantAddress', {
                        initialValue: entity.ApplicantAddress,
                      })(
                        <Input
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="申请日期">
                      {getFieldDecorator('ApplicantTime', {
                        initialValue: entity.ApplicantTime,
                      })(
                        <DatePicker
                          onChange={e => {
                            this.mObj.ApplicantTime = e;
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
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
            <AttachForm FormType={FormType} entity={entity} FileType="DM_Building" />
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
