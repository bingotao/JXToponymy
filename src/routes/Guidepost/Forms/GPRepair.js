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
import LocateMap from '../../../components/Maps/LocateMap2.js';
import st from './GPRepair.less';

import {
  baseUrl,
  url_GetNamesFromDic,
  url_GetRPBZDataFromData,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
} from '../../../common/urls.js';

// import { getDistricts } from '../../../utils/utils.js';
import { Post } from '../../../utils/request';
import { whfs } from '../../../common/enums.js';
import { divIcons } from '../../../components/Maps/icons';

import { getRPRepair, getNewRPRepair, saveRPRepair } from '../../../services/RP';

let lpIcon = divIcons.lp;
const FormItem = Form.Item;

let defaultValues = {
  RepairType: '维修',
  RepairTime: moment(),
};

class GPRepair extends Component {
  state = {
    showLocateMap: false,
    loading: false,
    RPDetails: {},
    entity: {},
    Intersection: [],
    Direction: [],
    Manufacturers: [],
    Model: [],
    Material: [],
    Size: [],
  };

  mObj = {};

  // 保存原始材质等信息，当发生“维护方式”发生改变时复原
  oObj = {};

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
      id = this.props.rpId;
    }
    if (id) {
      await getRPRepair({ repairID: id }, d => {
        let { RP, RepairInfo } = d;

        RepairInfo.RepairTime = RepairInfo.RepairTime ? moment(RepairInfo.RepairTime) : null;
        RepairInfo.FinishRepaireTime = RepairInfo.FinishRepaireTime
          ? moment(RepairInfo.FinishRepaireTime)
          : null;

        this.oObj = {
          Model: RepairInfo.Model,
          Material: RepairInfo.Material,
          Size: RepairInfo.Size,
          Manufacturers: RepairInfo.Manufacturers,
        };

        this.setState({ RPDetails: RP, entity: RepairInfo });
      });
    } else {
      await getNewRPRepair({ rpId: this.props.gpId }, d => {
        let { NewGuid, RPDetails } = d;

        let entity = {
          ID: NewGuid,
          ...defaultValues,
        };
        this.oObj = {
          Model: entity.Model,
          Material: entity.Material,
          Size: entity.Size,
          Manufacturers: entity.Manufacturers,
        };

        this.mObj = { ...defaultValues };
        this.setState({ RPDetails: RPDetails, entity: entity });
      });
    }
    this.hideLoading();
  }

  async getDataFromData() {
    await Post(url_GetRPBZDataFromData, null, e => {
      this.setState({ ...e });
    });
  }

  async save(obj) {
    console.log(obj);
    await saveRPRepair({ oldDataJson: JSON.stringify(obj) }, e => {
      notification.success({ description: '保存成功！', message: '成功' });
      this.mObj = {};
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
      this.getFormData(this.state.entity.ID);
    });
  }

  resetoObj(rtype) {
    let { entity } = this.state;
    if (rtype === '维修') {
      // 维修状态下，这些字段设置为空（不填）
      this.mObj.Model = null;
      this.mObj.Material = null;
      this.mObj.Size = null;
      this.mObj.Manufacturers = null;
      entity.Model = null;
      entity.Material = null;
      entity.Size = null;
      entity.Manufacturers = null;
    } else {
      // 维修状态下，还原原来的信息
      entity = {
        ...entity,
        ...this.oObj,
      };

      this.mObj = {
        ...this.mObj,
        Model: null,
        Material: null,
        Size: null,
        Manufacturers: null,
      };
    }
    this.setState({ entity: entity });
  }

  validate(errs) {
    errs = errs || [];
    let { entity } = this.state;
    let saveObj = {
      ID: entity.ID,
      RPID: this.props.gpId,
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
    // “更换”验证
    if (validateObj.RepairType === '更换') {
      if (!validateObj.Model) {
        errs.push('“更换”状态下“样式”不能为空');
      }
      if (!validateObj.Material) {
        errs.push('“更换”状态下“材质”不能为空');
      }
      if (!validateObj.Size) {
        errs.push('“更换”状态下“规格”不能为空');
      }
      if (!validateObj.Manufacturers) {
        errs.push('“更换”状态下“生产厂家”不能为空');
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

  onCancelClick() {
    let { onCancelClick } = this.props;
    if (onCancelClick) onCancelClick();
  }

  showLocateMap() {
    let { RPDetails } = this.state;
    if (RPDetails && RPDetails.Lat) {
      this.setState({ showLocateMap: true });
    } else {
      notification.warn({ description: '该路牌尚未定位，请先进行定位！', message: '警告' });
    }
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  componentDidMount() {
    this.getFormData();
    this.getDataFromData();
  }

  render() {
    let {
      showLocateMap,
      loading,
      entity,
      RPDetails,
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
                {RPDetails.CodeFile ? (
                  <img
                    alt="二维码无法显示，请联系管理员"
                    src={baseUrl + RPDetails.CodeFile.RelativePath}
                  />
                ) : (
                  <span>
                    错误<br />无法正常显示二维码
                  </span>
                )}
              </div>
              <div>
                <Row>
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
                          this.resetoObj(e);
                        }}
                      >
                        {whfs.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维修次数">
                      <Input disabled placeholder="维修次数" value={RPDetails.RepairedCount} />
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="道路名称">
                      <Input disabled placeholder="道路名称" value={RPDetails.RoadName} />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置路口">
                      <Input disabled placeholder="设置路口" value={RPDetails.Intersection} />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置方位">
                      <Input
                        style={{ width: '70%' }}
                        disabled
                        placeholder="设置方位"
                        value={RPDetails.Direction}
                      />
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
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="维修内容">
                      <Input
                        placeholder="维修内容"
                        value={entity.RepairContent}
                        onChange={e => {
                          let v = e.target.value;
                          let { entity } = this.state;
                          entity.RepairContent = v;
                          this.mObj.RepairContent = v;
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
          <Button onClick={this.onCancelClick.bind(this)}>取消</Button>
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
              let { RPDetails } = this.state;
              if (RPDetails && RPDetails.Lat) {
                let center = [RPDetails.Lat, RPDetails.Lng];
                L.marker(center, { icon: lpIcon }).addTo(lm.map);
                lm.map.setView(center, 18);
              }
            }}
          />
        </Modal>
      </div>
    );
  }
}

GPRepair = Form.create()(GPRepair);
export default GPRepair;
