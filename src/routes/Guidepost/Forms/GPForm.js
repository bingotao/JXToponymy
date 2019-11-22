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
import st from './GPForm.less';

import {
  baseUrl,
  url_GetNewGuid,
  url_GetDistrictTreeFromDistrict,
  url_GetNamesFromDic,
  url_GetRPBZDataFromData,
  url_SearchRPByID,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_ModifyRP,
  url_SearchRoadMPByName,
} from '../../../common/urls.js';

import { getDistricts } from '../../../utils/utils.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';

import GPRepair from './GPRepair.js';
import GPRepairList from './GPRepairList.js';

import { divIcons } from '../../../components/Maps/icons';
import { getRPBZDataFromDic } from '../../../services/Common';
import Authorized from '../../../utils/Authorized4';

let lpIcon = divIcons.lp;

const FormItem = Form.Item;
const defaultValues = {
  Management: '嘉兴市民政局',
  BZTime: moment(),
};

class GPForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }
  state = {
    isNew: true,
    showGPRepairList: false,
    showGPRepair: false,
    showLocateMap: false,
    loading: false,
    entity: {},
    communities: [],
    roads: [],
    Intersection: [],
    Direction: [],
    Manufacturers: [],
    Model: [],
    Material: [],
    Size: [],
    districts: [],
  };

  mObj = {};

  showLoading() {
    this.setState({ loading: true });
  }

  hideLoading() {
    this.setState({ loading: false });
  }
  getEditComponent(cmp) {
    return this.edit ? cmp : null;
  }
  async getCommunities(e) {
    let rt = await Post(url_GetNamesFromDic, { type: 4, DistrictID: e[e.length - 1] }, d => {
      this.mObj.CommunityName = null;
      let { entity } = this.state;
      entity.CommunityName = null;
      this.setState({ entity: entity, communities: d });
    });
  }

  async getRoads(e) {
    let rt = await Post(url_GetNamesFromDic, { type: 2, DistrictID: e[e.length - 1] }, d => {
      this.setState({ roads: d });
    });
  }

  async getFormData(id) {
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取门牌数据
    if (id) {
      await Post(url_SearchRPByID, { RPID: id }, d => {
        debugger;
        d.BZTime = d.BZTime ? moment(d.BZTime) : null;
        if (d.CountyID && d.NeighborhoodsID) d.Districts = [d.CountyID, d.NeighborhoodsID];
        this.setState({ isNew: false, entity: d });
        console.log(d);
      });
    } else {
      // 获取一个新的guid
      await Post(url_GetNewGuid, null, d => {
        let entity = {
          ID: d,
          ...defaultValues,
        };
        this.mObj = { ...defaultValues };
        this.setState({ isNew: true, entity: entity, loading: false });
      });
    }
    this.hideLoading();
  }

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

    await getRPBZDataFromDic(null, e => {
      this.setState({
        Material: e && e.filter(x => x.Category === '材质')[0].Data,
        Model: e && e.filter(x => x.Category === '样式')[0].Data,
        Manufacturers: e && e.filter(x => x.Category === '生产厂家')[0].Data,
        Size: e && e.filter(x => x.Category === '规格')[0].Data,
      });
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

    if (validateObj.Model === '基座式' && (!validateObj.FrontTagline || !validateObj.BackTagline)) {
      errs.push('“基座式”路牌“正面宣传语”、“反面宣传语”不能为空！');
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
    this.setState({ showLocateMap: true });
  }

  closeLocateMap() {
    this.setState({ showLocateMap: false });
  }

  showGPRepairList() {
    this.setState({ showGPRepairList: true });
  }

  closeGPRepairList() {
    this.setState({ showGPRepairList: false });
  }

  showGPRepair() {
    this.setState({ showGPRepair: true });
  }

  closeGPRepair() {
    this.setState({ showGPRepair: false });
  }

  refresh() {
    this.getFormData();
    this.getDistricts();
    this.getDataFromData();
  }

  componentDidMount() {
    this.refresh();
  }

  // 根据道路名称、行政区划获取道路开始，道路结束，编制规则字段并自动填充
  async searchRoadMPByName(name, e) {
    let rt = await Post(url_SearchRoadMPByName, { Name: name, DistrictID: e[e.length - 1] });
    var cThis = this;
    rtHandle(rt, d => {
      if (d != null) {
        let { entity } = this.state;
        entity.RoadStart = d.RoadStart;
        entity.RoadEnd = d.RoadEnd;
        entity.Rule = d.Rule;
        cThis.setState({ entity: entity });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let {
      isNew,
      showGPRepair,
      showGPRepairList,
      showLocateMap,
      loading,
      entity,
      communities,
      roads,
      Intersection,
      Direction,
      Model,
      Size,
      Manufacturers,
      Material,
      districts,
    } = this.state;

    return (
      <div className={st.GPForm + (loading ? ' loading' : '')}>
        <Spin spinning={true} size="large" tip="数据加载中..." />
        <div className={st.content}>
          <Form>
            <div className={st.group}>
              <div className={st.grouptitle}>
                基本信息<span>说明：“ * ”号标识的为必填项</span>
              </div>
              <div className={`${st.groupcontent} ${st.jbxx}`}>
                {entity.CodeFile ? (
                  <div>
                    <img
                      alt="二维码无法显示，请联系管理员"
                      src={baseUrl + '/' + entity.CodeFile.RelativePath}
                    />
                    <a href={baseUrl + '/' + entity.CodeFile.RelativePath} download={entity.Code}>
                      下载二维码（{entity.Code}）
                    </a>
                  </div>
                ) : (
                  <div>
                    <span>
                      保存后生成
                      <br />
                      二维码
                    </span>
                  </div>
                )}

                <div>
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
                            this.searchRoadMPByName(entity.RoadName, entity.Districts);
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
                          onChange={e => {
                            this.mObj.CommunityName = e;
                            let { entity } = this.state;
                            entity.CommunityName = e;
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
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置时间">
                        <DatePicker
                          placeholder="设置时间"
                          value={entity.BZTime}
                          onChange={v => {
                            this.mObj.BZTime = v;
                            let { entity } = this.state;
                            entity.BZTime = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="道路名称">
                        <Select
                          allowClear
                          onSearch={e => {
                            this.mObj.RoadName = e;
                            let { entity } = this.state;
                            entity.RoadName = e;
                            this.setState({ entity: entity });
                          }}
                          onChange={e => {
                            this.mObj.RoadName = e;
                            let { entity } = this.state;
                            entity.RoadName = e;
                            this.searchRoadMPByName(entity.RoadName, entity.Districts);
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.RoadName || undefined}
                          value={entity.RoadName || undefined}
                          placeholder="道路名称"
                          showSearch
                        >
                          {roads.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置路口">
                        <Select
                          allowClear
                          onSearch={e => {
                            this.mObj.Intersection = e;
                            let { entity } = this.state;
                            entity.Intersection = e;
                            this.setState({ entity: entity });
                          }}
                          onChange={e => {
                            this.mObj.Intersection = e;
                            let { entity } = this.state;
                            entity.Intersection = e;
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.Intersection || undefined}
                          value={entity.Intersection || undefined}
                          placeholder="设置路口"
                          showSearch
                        >
                          {Intersection.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="设置方位">
                        <Select
                          style={{ width: '70%' }}
                          allowClear
                          onSearch={e => {
                            this.mObj.Direction = e;
                            let { entity } = this.state;
                            entity.Direction = e;
                            this.setState({ entity: entity });
                          }}
                          onChange={e => {
                            this.mObj.Direction = e;
                            let { entity } = this.state;
                            entity.Direction = e;
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.Direction || undefined}
                          value={entity.Direction || undefined}
                          placeholder="设置方位"
                          showSearch
                        >
                          {Direction.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
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
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="起止号码">
                        <Input
                          placeholder="起止号码"
                          value={entity.StartEndNum}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.StartEndNum = v;
                            let { entity } = this.state;
                            entity.StartEndNum = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="道路起点">
                        <Input
                          placeholder="道路起点"
                          value={entity.RoadStart}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.RoadStart = v;
                            let { entity } = this.state;
                            entity.RoadStart = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="道路讫点">
                        <Input
                          placeholder="道路讫点"
                          value={entity.RoadEnd}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.RoadEnd = v;
                            let { entity } = this.state;
                            entity.RoadEnd = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="编制规则">
                        <Input
                          placeholder="编制规则"
                          value={entity.BZRules}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.BZRules = v;
                            let { entity } = this.state;
                            entity.BZRules = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="样式">
                        <Select
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
                          defaultValue={entity.Model || undefined}
                          value={entity.Model || undefined}
                          placeholder="样式"
                        >
                          {Model.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="材质">
                        <Select
                          allowClear
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
                          defaultValue={entity.Material || undefined}
                          value={entity.Material || undefined}
                          placeholder="材质"
                        >
                          {Material.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="规格（MM）">
                        <Select
                          allowClear
                          onSelect={e => {
                            this.mObj.Size = e;
                            let { entity } = this.state;
                            entity.Size = e;
                            this.setState({ entity: entity });
                          }}
                          onChange={e => {
                            this.mObj.Size = e || '';
                            let { entity } = this.state;
                            entity.Size = e;
                            this.setState({ entity: entity });
                          }}
                          defaultValue={entity.Size || undefined}
                          value={entity.Size || undefined}
                          placeholder="规格（MM）"
                        >
                          {Size.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="正面宣传语">
                        <Input
                          placeholder="正面宣传语"
                          value={entity.FrontTagline}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.FrontTagline = v;
                            let { entity } = this.state;
                            entity.FrontTagline = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="反面宣传语">
                        <Input
                          placeholder="反面宣传语"
                          value={entity.BackTagline}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.BackTagline = v;
                            let { entity } = this.state;
                            entity.BackTagline = v;
                            this.setState({ entity: entity });
                          }}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="生产厂家">
                        <Select
                          allowClear
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
                          defaultValue={entity.Manufacturers || undefined}
                          value={entity.Manufacturers || undefined}
                          placeholder="生产厂家"
                        >
                          {Manufacturers.map(e => (
                            <Select.Option value={e}>{e}</Select.Option>
                          ))}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="管理单位">
                        <Input
                          placeholder="管理单位"
                          value={entity.Management}
                          onChange={e => {
                            let v = e.target.value;
                            this.mObj.Management = v;
                            let { entity } = this.state;
                            entity.Management = v;
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
              <div className={st.grouptitle}>标志照片</div>
              <div className={st.groupcontent}>
                <UploadPicture
                  disabled={!this.edit}
                  fileList={entity.RPBZPhoto}
                  id={entity.ID}
                  fileBasePath={baseUrl}
                  data={{ RepairType: -1, DOCTYPE: null, FileType: 'RPBZPHOTO' }}
                  uploadAction={url_UploadPicture}
                  removeAction={url_RemovePicture}
                  getAction={url_GetPictureUrls}
                />
              </div>
            </div>
          </Form>
        </div>

        <div className={st.footer}>
          {isNew ? (
            <div />
          ) : (
            <div>
              <Button
                icon="profile"
                type="primary"
                onClick={e => {
                  this.setState({ showGPRepairList: true });
                }}
              >
                查看维修记录
              </Button>
              &emsp;
              {this.getEditComponent(
                <Button
                  icon="tool"
                  type="primary"
                  onClick={e => {
                    this.setState({ showGPRepair: true });
                  }}
                >
                  添加维修记录
                </Button>
              )}
            </div>
          )}
          <div>
            {this.getEditComponent(
              <Button type="primary" onClick={this.onSaveClick.bind(this)}>
                保存
              </Button>
            )}
            &emsp;
            <Button onClick={this.onCancelClick.bind(this)}>取消</Button>
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
              let { PositionX, PositionY } = this.state.entity;
              if (PositionX && PositionY) {
                lm.lpLayer = L.marker([PositionY, PositionX], { icon: lpIcon }).addTo(lm.map);
                lm.map.setView([PositionY, PositionX], 18);
              }
            }}
            onMapClear={lm => {
              lm.lpLayer && lm.lpLayer.remove();
              lm.lpLayer = null;
              let { entity } = this.state;
              entity.PositionX = null;
              entity.PositionY = null;
              this.mObj.PositionY = entity.PositionY;
              this.mObj.PositionX = entity.PositionX;
            }}
            beforeBtns={[
              {
                id: 'locate',
                name: '路牌定位',
                icon: 'icon-dingwei',
                onClick: (dom, i, lm) => {
                  if (!lm.locatePen) {
                    lm.locatePen = new L.Draw.Marker(lm.map, { icon: lpIcon });
                    lm.locatePen.on(L.Draw.Event.CREATED, e => {
                      lm.lpLayer && lm.lpLayer.remove();
                      var { layer } = e;
                      lm.lpLayer = layer;
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
                  let { lat, lng } = lm.lpLayer.getLatLng();
                  let { entity } = this.state;

                  entity.PositionX = lng.toFixed(8) - 0;
                  entity.PositionY = lat.toFixed(8) - 0;

                  this.mObj.PositionX = entity.PositionX;
                  this.mObj.PositionY = entity.PositionY;

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
          wrapClassName="fullmodal"
          title="路牌维修"
          destroyOnClose={true}
          centered={true}
          visible={showGPRepair}
          onCancel={e => this.closeGPRepair()}
          footer={null}
        >
          <Authorized>
            <GPRepair gpId={entity.ID} rpId={null} onCancelClick={e => this.closeGPRepair()} />
          </Authorized>
        </Modal>
        <Modal
          wrapClassName="smallmodal"
          title="路牌维修记录"
          destroyOnClose={true}
          centered={true}
          visible={showGPRepairList}
          onCancel={e => this.closeGPRepairList()}
          footer={null}
        >
          <Authorized>
            <GPRepairList gpId={entity.ID} onCancelClick={e => this.closeGPRepairList()} />
          </Authorized>
        </Modal>
      </div>
    );
  }
}

GPForm = Form.create()(GPForm);
export default GPForm;
