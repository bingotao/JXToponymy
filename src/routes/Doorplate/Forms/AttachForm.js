import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
} from 'antd';
import { zjlx, mpsqType, mpgrsqType } from '../../../common/enums.js';
import st from './HDFormNew.less';

import {
  baseUrl,
  url_SearchRoadMPByID,
  url_SearchResidenceMPByID,
  url_GetMPSizeByMPType,
  url_GetDistrictTreeFromDistrict,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
  url_GetNewGuid,
  url_CheckRoadMPIsAvailable,
  url_ModifyRoadMP,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_CheckResidenceMPIsAvailable,
  url_ModifyResidenceMP,
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
import { GetHKXX, GetBDCXX, GetYYZZXX } from '../../../services/MP';
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
    //表单创建时间
    FormTime: moment().format('YYYYMMDDhhmms'),
  };

  // 存储修改后的数据
  mObj = {};

  componentDidMount() {
  
  }


  GetNCFHAttachment() {
    let { entity, FormDate } = this.state;
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
    let { entity, FormDate } = this.state;
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
    let { entity, FormDate } = this.state;
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
                      FileType: 'Residence',
                      time: FormDate,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
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
    // 个人申请门牌
    if (this.props.FormType === mpsqType.grsq) {
      // 农村分户
      if (this.props.MPGRSQType === mpgrsqType.ncfh) return this.GetNCFHAttachment();
      // 店铺分割
      else if (this.props.MPGRSQType === mpgrsqType.dpfg) return this.GetDPFGAttachment();
    }
    //单位申请门牌
    else if (this.props.FormType === mpsqType.dwsq) {
      return this.GetDWSQAttachment();
    }
  }

  render() {

    return (
      <div>
        {this.getAttachment()}
     </div>
    );
  }
}

export default AttachForm;
