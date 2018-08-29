/*
自然村类必填项：行政区划、自然村名称、门牌号、门牌规格
门牌号、户室号只能是数字
标准地址：嘉兴市/市辖区/镇街道/村社区/自然村名称/门牌号/户室号
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
} from 'antd';
import { zjlx } from '../../../common/enums.js';
import st from './VGForm.less';

import {
  url_SearchCountryMPID,
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

let defaultValues = { MPProduce: 1, MPMail: 1, BZTime: moment() };

class VGForm extends Component {
  state = {
    showLocateMap: false,
    districts: [],
    entity: { ...defaultValues },
    mpTypes: [],
    newForm: true,
  };
  // 存储修改后的数据
  mObj = { ...defaultValues };

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

  async getFormData() {
    this.showLoading();

    // 获取门牌规格
    let rt = await Post(url_GetMPSizeByMPType, { mpType: 3 });
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
      let rt = await Post(url_SearchCountryMPID, { id: id });
      rtHandle(rt, d => {
        console.log(d);
        let districts = ['1', d.CountyID, d.NeighborhoodsID];
        // 填了社区
        if (d.CommunityID) {
          districts.push(d.CommunityID);
        }
        d.Districts = districts;
        d.BZTime = d.bzTime ? moment(d.bzTime) : null;

        this.setState({ entity: d, newForm: false });
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
    let ept = '';

    // 如果行政区修改过
    if (ds) {
      entity.StandardAddress = `嘉兴市${ds[1].label}${ds[2].label}${ds[3] ? ds[3].label : ept}`;
    } else {
      entity.StandardAddress = `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName ||
        ept}${obj.CommunityName || ept}`;
    }

    entity.StandardAddress += `${obj.CountryName || ept}${
      obj.MPNumber ? obj.MPNumber + '号' : ept
    }${obj.HSNumber ? obj.HSNumber + '室' : ept}`;
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
    this.getFormData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { newForm, showLoading, showLocateMap, entity, mpTypes, districts } = this.state;

    return (
      <div className={st.VGForm}>
        <div className={st.body}>
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
                            this.mObj.Postcode = e.target.value;
                          }}
                          placeholder="邮政编码"
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
                          <span className={st.ired}>*</span>自然村名称
                        </span>
                      }
                    >
                      {getFieldDecorator('ViligeName', {
                        initialValue: entity.ViligeName,
                        rules: [{ require: true }],
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.ViligeName = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="自然村名称"
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
                          <span className={st.ired}>*</span>门牌号码
                        </span>
                      }
                    >
                      {getFieldDecorator('MPNumber', {
                        initialValue: entity.MPNumber,
                        rules: [{ require: true }],
                      })(
                        <Input
                          type="number"
                          onChange={e => {
                            this.mObj.MPNumber = e.target.value;
                            this.combineStandard();
                          }}
                          placeholder="门牌号码"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="经度">
                      {getFieldDecorator('Lng', { initialValue: entity.Lng })(
                        <Input disabled type="number" placeholder="经度" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={3}>
                    <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="纬度">
                      {getFieldDecorator('Lat', { initialValue: entity.Lat })(
                        <Input disabled type="number" placeholder="纬度" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={2}>
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
                      {' '}
                      {getFieldDecorator('MPSize', {
                        initialValue: entity.MPSize,
                      })(
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
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="户室号">
                      {getFieldDecorator('HSNumber', {
                        initialValue: entity.HSNumber,
                      })(
                        <Input
                          type="number"
                          onChange={e => {
                            this.mObj.HSNumber = e.target.value;
                          }}
                          placeholder="户室号"
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
                            this.mObj.MProduce = e.target.value ? 1 : 0;
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
                            this.mObj.MPMail = e.target.value ? 1 : 0;
                          }}
                        >
                          邮寄门牌
                        </Checkbox>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮寄地址">
                      {getFieldDecorator('MailAddress', {
                        initialValue: entity.MailAddress,
                      })(
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
              <div className={st.grouptitle}>产证信息</div>
              <div className={st.groupcontent}>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="产权人">
                      {getFieldDecorator('MailAddress', {
                        initialValue: entity.MailAddress,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.MailAddress = e.target.value;
                          }}
                          placeholder="邮寄地址"
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="土地证地址">
                      {getFieldDecorator('TDZAddress', {
                        initialValue: entity.TDZAddress,
                      })(
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
                      {getFieldDecorator('TDZNumber', {
                        initialValue: entity.TDZNumber,
                      })(
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确权证地址">
                      {getFieldDecorator('QQZAddress', {
                        initialValue: entity.QQZAddress,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.QQZAddress = e.target.value;
                          }}
                          placeholder="确权证地址"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确权证证号">
                      {getFieldDecorator('QQZNumber', {
                        initialValue: entity.QQZNumber,
                      })(
                        <Input
                          onChange={e => {
                            this.mObj.QQZNumber = e.target.value;
                          }}
                          placeholder="确权证证号"
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
                    <FormItem label="土地证文件">
                      <UploadPicture
                        id={entity.ID}
                        data={{ zjlx: 'tdz', type: 'Country' }}
                        uploadAction={url_UploadPicture}
                        removeAction={url_RemovePicture}
                      />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="确权证文件">
                      <UploadPicture
                        id={entity.ID}
                        data={{ zjlx: 'qqz', type: 'Country' }}
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
          {newForm ? null : (
            <div style={{ float: 'left' }}>
              <Button type="primary">打印门牌证</Button>
              &emsp;
              <Button type="primary">开具地名证明</Button>
            </div>
          )}
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

VGForm = Form.create()(VGForm);
export default VGForm;
