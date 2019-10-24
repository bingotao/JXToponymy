import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'antd';
import st from './HDFormNew.less';

import {
  baseUrl,
  url_UploadPictureMP,
  url_RemovePictureMP,
  url_GetPictureUrls,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import { getDistricts } from '../../../utils/utils.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import ProveForm from '../../ToponymyProve/ProveForm';
// import ProveForm from '../../../routes/ToponymyProve/ProveForm';
import MPZForm from '../../ToponymyProve/MPZForm';
import MPZForm_cj from '../../ToponymyProve/MPZForm_cj';
import { getDivIcons } from '../../../components/Maps/icons';
import { printMPZ_cj } from '../../../common/Print/LodopFuncs';

const FormItem = Form.Item;
let defaultValues = { MPProduce: 1, MPMail: 1, BZTime: moment() };
const { mp } = getDivIcons();
class AttachForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
  }

  state = {
    //是否显示附件
    showAttachment: this.props.showAttachment,
    showMPZForm: false,
    showMPZForm_cj: false,
    showProveForm: false,
    showLocateMap: false,
    districts: [],
    entity: { BZTime: moment() },
    mpTypes: [],
    newForm: true,
    communities: [],
    residences: [],
    roads: [],
    postCodes: [],
    dataShareDisable: true,
    FormTime: moment().format('YYYYMMDDhhmms'), //表单创建时间
    FormDate: moment().format('YYYYMMDDhhmms'),
  };

  // 存储修改后的数据
  mObj = {};

  componentDidMount() {}

  // 门牌编制-住宅-个人
  GetAddResGrAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>授权委托书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '授权委托书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grsq',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>被委托人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '被委托人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grsq',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  GetNCFHAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>申请门牌登记表：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.SFZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '申请门牌登记表',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'ncfh',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>产权人户口簿：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.SQB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '产权人户口簿',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'ncfh',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>宅基地批复：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.WTS}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '宅基地批复',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'ncfh',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>分户协议或离婚协议书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '分户协议或离婚协议书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'ncfh',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>授权委托书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '授权委托书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'ncfh',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>被委托人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '被委托人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'ncfh',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  GetDPFGAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>申请门牌登记表：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.SFZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '申请门牌登记表',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dpfg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>产权人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.SQB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '产权人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dpfg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>产权证或士地证成不动产证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.WTS}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '产权证或士地证成不动产证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dpfg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>测涂报告：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '测涂报告',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dpfg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>授权委托书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '授权委托书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dpfg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>被委托人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.FCZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '被委托人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dpfg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  GetDWSQAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>申请门牌登记表：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.SFZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '申请门牌登记表',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dwsq',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>规划许可证或不动产证或产权证或土地证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    fileList={entity.SQB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '规划许可证或不动产证或产权证或土地证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dwsq',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  //个人变更
  GetGRBGAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>原门牌证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '原门牌证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>产权人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '产权人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>产权证或土地证或不动产证或购房合同或法院判决书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '产权证或土地证或不动产证或购房合同或法院判决书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>授权委托书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '授权委托书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>被委托人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '被委托人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  //单位申请变更 dwbg
  GetDWBGAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>原门牌证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '原门牌证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dwbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>公司变更登记申请书或产权证或土地证或不动产证或法成判决书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '公司变更登记申请书或产权证或土地证或不动产证或法成判决书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'dwbg',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  //个人换补 grhb
  GetGRHBAttachment() {
    let { FormDate } = this.state;
    let { entity, FileType } = this.props;
    const { edit } = this;
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>产权人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '产权人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grhb',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>授权委托书：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '授权委托书',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grhb',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div className={st.picgroup}>
                <div>被委托人身份证：</div>
                <div>
                  <UploadPicture
                    disabled={!edit}
                    listType="picture"
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '被委托人身份证',
                      FileType: FileType,
                      time: FormDate,
                      ItemType: 'grhb',
                    }}
                    uploadAction={url_UploadPictureMP}
                    removeAction={url_RemovePictureMP}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
  getAttachment() {
    const { doorplateType, FileType, FormType, MPGRSQType } = this.props;
    // 门牌编制
    if (doorplateType == 'DoorplateAdd') {
      // 住宅
      if (FileType == 'Residence') {
        if (FormType === 'grsq') {
          if (MPGRSQType == null) return this.GetAddResGrAttachment();
        }
        //单位申请门牌
        if (FormType === 'dwsq') {
          return this.GetDWSQAttachment();
        }
      }
      // 道路
      if (FileType == 'Road') {
        if (FormType === 'grsq') {
          if (MPGRSQType === 'dpfg') return this.GetDPFGAttachment();
        }
        //单位申请门牌
        if (FormType === 'dwsq') {
          return this.GetDWSQAttachment();
        }
      }
      // 农村
      if (FileType == 'Country') {
        if (FormType === 'grsq') {
          if (MPGRSQType === 'ncfh') return this.GetNCFHAttachment();
        }
        //单位申请门牌
        if (FormType === 'dwsq') {
          return this.GetDWSQAttachment();
        }
      }
    }

    // 门牌变更
    if (doorplateType == 'DoorplateChange') {
      //个人申请变更
      if (FormType === 'grbg') return this.GetGRBGAttachment();
      //单位申请变更
      if (FormType === 'dwbg') return this.GetDWBGAttachment();
    }

    //门牌换补
    if (doorplateType == 'DoorplateReplace') {
      //个人换补
      if (FormType === 'grhb') return this.GetDWBGAttachment();
    }

    //门牌注销
    if (doorplateType == 'DoorplateDelete') {
    }
  }

  render() {
    return <div>{this.getAttachment()}</div>;
  }
}

export default AttachForm;
