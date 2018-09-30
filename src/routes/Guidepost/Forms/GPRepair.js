import React, { Component } from 'react';
import {
  Spin,
  Select,
  Cascader,
  Button,
  Row,
  Col,
  Form,
  DatePicker,
  Input,
  notification,
  Modal,
} from 'antd';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import LocateMap from '../../../components/Maps/LocateMap.js';
import st from './GPRepair.less';

import {
  baseUrl,
  url_GetNewGuid,
  url_GetDistrictTreeFromDistrict,
  url_GetNamesFromDic,
  url_GetRPBZDataFromData,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_SearchRPRepairByID,
  url_RepairOrChangeRP,
} from '../../../common/urls.js';

import { getDistricts } from '../../../utils/utils.js';
import { Post } from '../../../utils/request';

const FormItem = Form.Item;

let defaultValues = {
  RepairType: '维修',
  RepairTime: moment(),
};

class GPRepair extends Component {
  state = {
    showLocateMap: false,
    loading: false,
    entity: {},
    Intersection: [],
    Direction: [],
    Manufacturers: [],
    Model: [],
    Material: [],
    Size: [],
  };

  mObj = {};

  showLoading() {
    this.setState({ loading: true });
  }

  hideLoading() {
    this.setState({ loading: false });
  }

  async getCommunities(e) {
    let rt = await Post(url_GetNamesFromDic, { type: 4, NeighborhoodsID: e[1] }, d => {
      this.setState({ communities: d });
    });
  }

  async getRoads(e) {
    let rt = await Post(url_GetNamesFromDic, { type: 2, NeighborhoodsID: e[1] }, d => {
      this.setState({ roads: d });
    });
  }

  async getFormData(id) {
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    if (id) {
      await Post(url_SearchRPByID, { id: id }, d => {
        console.log(d);
        d.RepairTime = d.RepairTime ? moment(d.RepairTime) : null;
        d.FinishRepaireTime = d.FinishRepaireTime ? moment(d.FinishRepaireTime) : null;

        this.setState({ entity: d });
      });
    } else {
      // 获取一个新的guid
      await Post(url_GetNewGuid, null, d => {
        let entity = {
          ID: d,
          ...defaultValues,
        };
        this.mObj = { ...defaultValues };
        this.setState({ entity: entity });
      });
    }
    this.hideLoading();
  }

  // async getDirectionFromDic() {
  //   await Post(url_GetDirectionFromDic, null, d => {
  //     this.setState({ directions: d });
  //   });
  // }

  async getDistricts() {
    await Post(url_GetDistrictTreeFromDistrict, null, e => {
      let districts = getDistricts(e);
      this.setState({ districts: districts });
    });
  }

  async getDataFromData() {
    await Post(url_GetRPBZDataFromData, null, e => {
      this.setState({ ...e });
    });
  }

  async save(obj) {
    await Post(url_ModifyRP, { oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      this.mObj = {};
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
      this.getFormData(this.state.entity.ID);
    });
  }

  validate(errs) {
    errs = errs || [];
    let { entity } = this.state;
    let saveObj = {
      ID: entity.ID,
      ...this.mObj,
    };

    if (saveObj.RepairTime) {
      saveObj.RepairTime = saveObj.RepairTime.toISOString();
    }
    if (saveObj.FinishRepaireTime) {
      saveObj.FinishRepaireTime = saveObj.FinishRepaireTime.toISOString();
    }

    let validateObj = {
      ...entity,
      ...saveObj,
    };

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
  showLocateMap() {
    this.setState({ showLocateMap: true });
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  componentDidMount() {
    this.getFormData();
    this.getDistricts();
    this.getDataFromData();
  }

  render() {
    let {
      showLocateMap,
      loading,
      entity,
      Intersection,
      Direction,
      Model,
      Size,
      Manufacturers,
      Material,
    } = this.state;

    let repair = entity.RepairType === '维修';
    return (
      <div className={st.GPRepair + (loading ? ' loading' : '')}>
        <Spin spinning={true} size="large" tip="数据加载中..." />
        <div className={st.content}>
          <div className={st.group}>
            <div className={st.grouptitle}>
              基本信息<span>说明：“ * ”号标识的为必填项</span>
            </div>
            <div className={`${st.groupcontent} ${st.jbxx}`}>
              <div>
                <img
                  alt="尚未生成二维码"
                  src={
                    entity.CodeFile
                      ? baseUrl + entity.CodeFile.RelativePath
                      : 'https://www.baidu.com/img/bd_logo1.png'
                  }
                />
              </div>
              <div>
                <Row>
                  <Col span={8}>
                    <FormItem
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      label={
                        <span>
                          <span className={st.ired}>*</span>二维码编号
                        </span>
                      }
                    >
                      <Input placeholder="二维码编号" />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维护方式">
                      <Select
                        style={{ width: '100%' }}
                        placeholder="维护方式"
                        value={entity.RepairType}
                        onSelect={e => {
                          let { entity } = this.state;
                          entity.RepairType = e;
                          this.mObj.RepairType = e;
                          this.setState({ entity: entity });
                        }}
                      >
                        {['维修', '更换'].map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="道路名称">
                      <Input disabled placeholder="道路名称" />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置路口">
                      <Input disabled placeholder="设置路口" />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置方位">
                      <Input style={{ width: '70%' }} disabled placeholder="设置方位" />
                      &ensp;
                      <Button
                        onClick={this.showLocateMap.bind(this)}
                        size="small"
                        shape="circle"
                        type="primary"
                        icon="environment"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="样式">
                      <Select
                        style={{ width: '100%' }}
                        disabled={repair}
                        allowClear
                        onSelect={e => {
                          this.mObj.Model = e;
                          let { entity } = this.state;
                          entity.Model = e;
                          this.setState({ entity: entity });
                        }}
                        onChange={e => {
                          this.mObj.Model = e || '';
                          let { entity } = this.state;
                          entity.Model = e;
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.Model}
                        value={entity.Model}
                        placeholder="样式"
                      >
                        {Model.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="材质">
                      <Select
                        style={{ width: '100%' }}
                        allowClear
                        disabled={repair}
                        onSelect={e => {
                          this.mObj.Material = e;
                          let { entity } = this.state;
                          entity.Material = e;
                          this.setState({ entity: entity });
                        }}
                        onChange={e => {
                          this.mObj.Material = e || '';
                          let { entity } = this.state;
                          entity.Material = e;
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.Material}
                        value={entity.Material}
                        placeholder="材质"
                      >
                        {Material.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="规格（MM）">
                      <Select
                        style={{ width: '100%' }}
                        allowClear
                        disabled={repair}
                        onSelect={e => {
                          this.mObj.Size = e;
                          let { entity } = this.state;
                          entity.Size = e;
                          this.setState({ entity: entity });
                        }}
                        onChange={e => {
                          this.mObj.Model = e || '';
                          let { entity } = this.state;
                          entity.Size = e;
                          this.setState({ entity: entity });
                        }}
                        defaultValue={entity.Size}
                        value={entity.Size}
                        placeholder="规格（MM）"
                      >
                        {Size.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="生产厂家">
                      <Select
                        style={{ width: '100%' }}
                        allowClear
                        disabled={repair}
                        onSelect={e => {
                          this.mObj.Manufacturers = e;
                          let { entity } = this.state;
                          entity.Manufacturers = e;
                          this.setState({ entity: entity });
                        }}
                        onSearch={e => {
                          this.mObj.Manufacturers = e;
                          let { entity } = this.state;
                          entity.Manufacturers = e;
                          this.setState({ entity: entity });
                        }}
                        onChange={e => {
                          this.mObj.Manufacturers = e;
                          let { entity } = this.state;
                          entity.Manufacturers = e;
                          this.setState({ entity: entity });
                        }}
                        showSearch
                        defaultValue={entity.Manufacturers}
                        value={entity.Manufacturers}
                        placeholder="生产厂家"
                      >
                        {Manufacturers.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维修次数">
                      <Input
                        placeholder="维修次数"
                        value={entity.RepairCount}
                        onChange={e => {
                          let v = e.target.value;
                          this.mObj.RepairCount = v;
                          let { entity } = this.state;
                          entity.RepairCount = v;
                          this.setState({ entity: entity });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维修部位">
                      <Input
                        placeholder="维修部位"
                        value={entity.RepairParts}
                        onChange={e => {
                          let v = e.target.value;
                          this.mObj.RepairParts = v;
                          let { entity } = this.state;
                          entity.RepairParts = v;
                          this.setState({ entity: entity });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维修厂家">
                      <Select
                        style={{ width: '100%' }}
                        allowClear
                        onSelect={e => {
                          this.mObj.RepairFactory = e;
                          let { entity } = this.state;
                          entity.RepairFactory = e;
                          this.setState({ entity: entity });
                        }}
                        onSearch={e => {
                          this.mObj.RepairFactory = e;
                          let { entity } = this.state;
                          entity.RepairFactory = e;
                          this.setState({ entity: entity });
                        }}
                        onChange={e => {
                          this.mObj.RepairFactory = e;
                          let { entity } = this.state;
                          entity.RepairFactory = e;
                          this.setState({ entity: entity });
                        }}
                        showSearch
                        defaultValue={entity.RepairFactory}
                        value={entity.RepairFactory}
                        placeholder="维修厂家"
                      >
                        {Manufacturers.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维修内容">
                      <Input
                        placeholder="维修内容"
                        value={entity.RepairContent}
                        onChange={e => {
                          let { entity } = this.state;
                          entity.RepairContent = e;
                          this.mObj.RepairContent = e;
                          this.setState({ entity: entity });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="报修日期">
                      <DatePicker
                        placeholder="报修日期"
                        value={entity.RepairTime}
                        onChange={e => {
                          let { entity } = this.state;
                          entity.RepairTime = e;
                          this.mObj.RepairTime = e;
                          this.setState({ entity: entity });
                        }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="修复日期">
                      <DatePicker
                        placeholder="修复日期"
                        value={entity.FinishRepaireTime}
                        onChange={e => {
                          let { entity } = this.state;
                          entity.FinishRepaireTime = e;
                          this.mObj.FinishRepaireTime = e;
                          this.setState({ entity: entity });
                        }}
                      />
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div className={st.group}>
            <div className={st.grouptitle}>附件</div>
            <div className={st.groupcontent}>
              <Row>
                <Col span={12}>
                  <FormItem label="维修前照片">
                    <UploadPicture
                      fileList={entity.HJ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: 0, DOCTYPE: null, FileType: 'RPPEPAIRPHOTO' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="维修后照片">
                    <UploadPicture
                      fileList={entity.HJ}
                      id={entity.ID}
                      fileBasePath={baseUrl}
                      data={{ RepairType: 1, DOCTYPE: null, FileType: 'RPPEPAIRPHOTO' }}
                      uploadAction={url_UploadPicture}
                      removeAction={url_RemovePicture}
                      getAction={url_GetPictureUrls}
                    />
                  </FormItem>
                </Col>
              </Row>
            </div>
          </div>
        </div>

        <div className={st.footer}>
          <Button type="primary" onClick={this.onSaveClick.bind(this)}>
            保存
          </Button>
          &emsp;
          <Button>取消</Button>
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

GPRepair = Form.create()(GPRepair);
export default GPRepair;
