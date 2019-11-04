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
import { getDistrictsWithJX } from '../../../utils/utils.js';
import { getUser } from '../../../utils/login';
import { zjlx } from '../../../common/enums.js';
import AttachForm from './AttachForm';
import { GetNameRow } from './ComFormComponent.js';
const FormItem = Form.Item;
console.log();

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
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>地名代码
                        </span>
                      }
                    >
                      <Input
                        placeholder="地名代码"
                        onChange={e => {
                          this.mObj.DMDM = e.target.value;
                        }}
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
                          <span className={st.ired}>*</span>所跨行政区
                        </span>
                      }
                    >
                      <Select
                        mode="tags"
                        value={entity.ShowDistricts}
                        open={false}
                        placeholder="所跨行政区"
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="村社区">
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

                {GetNameRow(FormType, entity)}
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮政编码">
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="所在道路">
                      <Input
                        onChange={e => {
                          this.mObj.SZDL = e.target.value;
                          let { entity } = this.state;
                          entity.SZDL = e.target.value;
                          this.setState({ entity: entity });
                        }}
                        placeholder="所在道路"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="所跨河流道路">
                      <Input
                        onChange={e => {
                          this.mObj.SKHLDL = e.target.value;
                          let { entity } = this.state;
                          entity.SKHLDL = e.target.value;
                          this.setState({ entity: entity });
                        }}
                        placeholder="所跨河流道路"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="桥梁走向">
                      <Select
                        onChange={e => {
                          this.mObj.QLZX = e;
                          let { entity } = this.state;
                          entity.QLZX = e;
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.QLZX || undefined}
                        value={entity.QLZX || undefined}
                        placeholder="桥梁走向"
                      >
                        {['东西走向', '南北走向'].map(e => (
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
                      label="最大载重量（吨）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.ZDZZL = e;
                          let { entity } = this.state;
                          entity.ZDZZL = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="最大载重量（吨）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="长度（米）">
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.Length = e;
                          let { entity } = this.state;
                          entity.Length = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="长度（米）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="宽度（米）">
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.Width = e;
                          let { entity } = this.state;
                          entity.Width = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="宽度（米）"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="梁底标高（米）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.LDBG = e;
                          let { entity } = this.state;
                          entity.LDBG = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="梁底标高（米）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label="最大跨度（米）"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.mObj.ZDKD = e;
                          let { entity } = this.state;
                          entity.ZDKD = e;
                          this.setState({ entity: entity });
                        }}
                        placeholder="最大跨度（米）"
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="桥梁性质">
                      <Select
                        onChange={e => {
                          this.mObj.QLXZ = e;
                          let { entity } = this.state;
                          entity.QLXZ = e;
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.QLXZ || undefined}
                        value={entity.QLXZ || undefined}
                        placeholder="桥梁性质"
                      >
                        {['梁桥', '拱桥'].map(e => (
                          <Select.Option value={e}>{e}</Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="始建年月">
                      <MonthPicker
                        placeholder="始建年月"
                        format="YYYY年M月"
                        onChange={(date, dateString) => {
                          this.mObj.SJNY = dateString;
                          let { entity } = this.state;
                          entity.SJNY = dateString;
                          this.setState({ entity: entity });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="建成年月">
                      <MonthPicker
                        placeholder="建成年月"
                        format="YYYY年M月"
                        onChange={(date, dateString) => {
                          this.mObj.JCNY = dateString;
                          let { entity } = this.state;
                          entity.JCNY = dateString;
                          this.setState({ entity: entity });
                        }}
                      />
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
                        在
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
                          onChange={e => {
                            this.mObj.ApplicantNumber = e.target.value;
                            this.getDataShareDisable();
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
