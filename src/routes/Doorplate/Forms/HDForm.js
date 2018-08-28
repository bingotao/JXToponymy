/*
住宅类必填项：行政区划（行政区划的村社区不是必填的）、小区名称(行政区划、小区名称、户室号)
楼幢号、单元号、户室号、门牌号都只能是数字

标准地址：嘉兴市/市辖区/镇街道/小区名/门牌号/宿舍名/幢号/单元号 /户室号

*/
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
  InputNumber,
  notification,
} from 'antd';
import { zjlx } from '../../../common/enums.js';
import st from './HDForm.less';

import {
  url_SearchResidenceMPByID,
  url_GetMPSizeByMPType,
  url_GetUserDistrictsTree,
  url_UploadPicture,
  url_RemovePicture,
  url_GetNewGuid,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap.js';
import { getDistricts } from '../../../utils/utils.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';

const FormItem = Form.Item;

class HDForm extends Component {
  state = {
    showLocateMap: false,
    districts: [],
    entity: {},
    mpTypes: [],
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

  async getHDFormData() {
    this.showLoading();

    // 获取门牌规格
    let rt = await Post(url_GetMPSizeByMPType, { mpType: 1 });
    rtHandle(rt, d => {
      this.setState({ mpTypes: d });
    });

    // 获取行政区数据
    rt = await Post(url_GetUserDistrictsTree);
    rtHandle(rt, d => {
      let districts = getDistricts(d);
      this.setState({ districts: districts });
    });
    let { id } = this.props;
    // 获取门牌数据
    if (id) {
      let rt = await Post(url_SearchResidenceMPByID, { id: id });
      rtHandle(rt, d => {
        console.log(d);
        let districts = ['1', d.CountyID, d.NeighborhoodsID];
        // 填了社区
        if (d.CommunityID) {
          districts.push(d.CommunityID);
        }
        d.Districts = districts;
        this.setState({ entity: d });
      });
    } else {
      // 获取一个新的guid
      let rt = await Post(url_GetNewGuid);
      rtHandle(rt, d => {
        this.state.entity.ID = d;
        this.setState({ entity: entity });
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
    // 如果行政区修改过
    if (ds) {
      entity.StandardAddress = `${ds[1].label}${ds[2].label}${
        ds[3] ? ds[3].label : ''
      }${obj.ResidenceName || ''}${obj.MPNumber ? obj.MPNumber + '号' : ''}${obj.Dormitory || ''}${
        obj.LZNumber
      }幢${obj.DYNumber}单元${obj.HSNumber}室`;
    } else {
      entity.StandardAddress = `${obj.CountyName}${obj.NeighborhoodsName}${
        obj.CommunityName
      }${obj.ResidenceName || ''}${obj.MPNumber ? obj.MPNumber + '号' : ''}${obj.Dormitory || ''}${
        obj.LZNumber
      }幢${obj.DYNumber}单元${obj.HSNumber}室`;
    }

    this.setState({ entity: entity });
  }

  onSaveClick = e => {
    e.preventDefault();
    this.props.form.validateFields(
      async function(err, values) {
        console.log(this.mObj);
        let errs = [];
        let errMsgs = '';

        if (err) {
          for (let i in err) {
            let i = err[i];
            if (i.errors) {
              errs = errs.concat(i.errors.map(item => item.message));
            }
          }

          for (let i = 0; i < errs.length; i++) {
            errMsgs += `${i + 1}、${errs[i]}；\n`;
          }
        }

        if (this.mObj.districts && this.mObj.districts.length < 2) {
          errMsgs += `${errs.length}、“行政区划”请选择“街道”或“社区”；\n`;
        }

        if (errs.length) {
          Modal.error({
            title: '错误',
            content: errMsgs,
          });
        } else {
          // 修改的数据，携带ID，传给后台
          let saveObj = {
            ID: this.state.entity.ID,
            ...this.mObj,
          };
          if (saveObj.districts) {
            let ds = saveObj.districts;
            saveObj.CountyID = ds[1].value;
            saveObj.CountyName = ds[1].label;
            saveObj.NeighborhoodsID = ds[2].value;
            saveObj.NeighborhoodsName = ds[2].label;

            if (ds.length == 4) {
              saveObj.CommunityID = ds[3].value;
              saveObj.CommunityName = ds[3].label;
            }

            delete saveObj.districts;
          }
          if (saveObj.BZTime) {
            saveObj.BZTime = saveObj.toISOString();
          }

          this.save(saveObj);
        }
      }.bind(this)
    );
  };

  save(obj) {
    console.log(obj);
  }

  componentDidMount() {
    this.getHDFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { showLoading, showLocateMap, entity, mpTypes, districts } = this.state;

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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="行政区划">
                      <Cascader
                        value={entity.Districts}
                        changeOnSelect={true}
                        expandTrigger="hover"
                        options={districts}
                        placeholder="行政区划"
                        onChange={(a, b) => {
                          if (b.length > 2) {
                            this.mObj.districts = b;
                            let { entity } = this.state;
                            entity.Districts = a;
                            this.setState({ entity: entity });
                            this.combineStandard();
                          } else {
                            notification.error({
                              message: '错误',
                              description: '请选择“街道”或“社区”',
                            });
                          }
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮政编码">
                      {getFieldDecorator('Postcode', {
                        initialValue: entity.Postcode,
                      })(
                        <Input
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.Postcode = b;
                          }}
                          placeholder="邮政编码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌规格">
                      {getFieldDecorator('MPSize', {})(
                        <Select
                          onChange={e => {
                            this.mObj.MPSize = e;
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="小区名称">
                      <Select
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
                        defaultValue={entity.ResidenceName}
                        value={entity.ResidenceName}
                        placeholder="小区名称"
                        showSearch
                      >
                        <Select.Option value="小区1">小区1</Select.Option>
                        <Select.Option value="小区2">小区2</Select.Option>
                        <Select.Option value="小区3">小区3</Select.Option>
                        <Select.Option value="小区4">小区4</Select.Option>
                        <Select.Option value="小区5">小区5</Select.Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="幢号">
                      {getFieldDecorator('LZNumber', {
                        initialValue: entity.LZNumber,
                      })(
                        <InputNumber
                          step={1}
                          onChange={e => {
                            this.mObj.LZNumber = e;
                            this.combineStandard();
                          }}
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
                        <InputNumber
                          step={1}
                          onChange={e => {
                            this.mObj.DYNumber = e;
                            this.combineStandard();
                          }}
                          addonAfter="单元"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="门牌号">
                      {getFieldDecorator('MPNumber', {
                        initialValue: entity.MPNumber,
                      })(
                        <InputNumber
                          step={1}
                          onChange={e => {
                            this.mObj.MPNumber = e;
                            this.combineStandard();
                          }}
                          placeholder="门牌号"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="宿舍名称">
                      {getFieldDecorator('Dormitory', {
                        initialValue: entity.Dormitory,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.Dormitory = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="宿舍名称"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户室号">
                      {getFieldDecorator('HSNumber', {
                        initialValue: entity.HSNumber,
                      })(
                        <InputNumber
                          step={1}
                          onChange={e => {
                            this.mObj.HSNumber = e;
                            this.combineStandard();
                          }}
                          placeholder="户室号"
                          addonAfter="室"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="经度">
                      {getFieldDecorator('Lng', { initialValue: entity.Lng })(
                        <Input disabled type="number" placeholder="经度" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="纬度">
                      {getFieldDecorator('Lat', { initialValue: entity.Lat })(
                        <Input disabled type="number" placeholder="纬度" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem>
                      <Tooltip placement="right" title="定位">
                        <Button
                          style={{ marginLeft: '20px' }}
                          type="primary"
                          shape="circle"
                          icon="environment"
                          size="small"
                          onClick={this.showLocateMap.bind(this)}
                        />
                      </Tooltip>
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
                </Row>
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
                        initialValue: entity.BZTime || (entity.ID ? entity.BZTime : moment()),
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
              <div className={st.grouptitle}>产证信息</div>
              <div className={st.groupcontent}>
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
                          onChange={e => {
                            this.mObj.IDType = e;
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
              <div className={st.grouptitle}>附件上传</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={12}>
                    <FormItem label="房产证文件">
                      <UploadPicture
                        id={entity.ID}
                        data={{ zjlx: 'fcz', type: 'Residence' }}
                        uploadAction={url_UploadPicture}
                        removeAction={url_RemovePicture}
                      />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="土地证文件">
                      <UploadPicture
                        id={entity.ID}
                        data={{ zjlx: 'tdz', type: 'Residence' }}
                        uploadAction={url_UploadPicture}
                        removeAction={url_RemovePicture}
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem label="不动产证文件">
                      <UploadPicture
                        id={entity.ID}
                        data={{ zjlx: 'bdcz', type: 'Residence' }}
                        uploadAction={url_UploadPicture}
                        removeAction={url_RemovePicture}
                      />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="户籍文件">
                      <UploadPicture
                        id={entity.ID}
                        data={{ zjlx: 'hjwj', type: 'Residence' }}
                        uploadAction={url_UploadPicture}
                        removeAction={url_RemovePicture}
                      />
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </div>
        <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <div style={{ float: 'left' }}>
            <Button type="primary">打印门牌证</Button>
            &emsp;
            <Button type="primary">开具地名证明</Button>
          </div>
          <div style={{ float: 'right' }}>
            <Button onClick={this.onSaveClick.bind(this)} type="primary">
              保存
            </Button>
            &emsp;
            <Button type="default">取消</Button>
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
            x={entity.Lng}
            y={entity.Lat}
            onSaveLocate={(lat, lng) => {
              let { entity } = this.state;

              entity.Lng = lng.toFixed(8) - 0;
              entity.Lat = lat.toFixed(8) - 0;

              this.mObj.Lng = entity.Lng;
              this.mObj.Lat = entity.Lat;

              this.setState({
                entity: entity,
              });
              this.closeLocateMap();
            }}
          />
        </Modal>
      </div>
    );
  }
}

HDForm = Form.create()(HDForm);
export default HDForm;
