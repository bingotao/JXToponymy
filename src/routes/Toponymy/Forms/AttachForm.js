import React, { Component } from 'react';
import { Row, Col } from 'antd';
import st from './SettlementForm.less';

import {
  baseUrl,
  url_UploadPicture,
  url_RemovePicture,
  url_GetPictureUrls,
} from '../../../common/urls.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';

class AttachForm extends Component {
  constructor(ps) {
    super(ps);
  }

  state = {
    FormTime: moment().format('YYYYMMDDHHmms'), //表单创建时间
  };

  //地名受理 ToponymyAcceptAttachment
  GetToponymyAcceptAttachment() {
    let { FormTime } = this.state;
    let { entity, FileType } = this.props;
    var ItemType = 'sl';
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>命名审批表：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.MMSPB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '命名审批表',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
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
  //地名预命名 ToponymyPreApproval
  GetToponymyPreApprovalAttachment() {
    let { FormTime } = this.state;
    let { entity, FileType } = this.props;
    var ItemType = 'ymm';
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>命名审批表：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.MMSPB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '命名审批表',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>土地拍卖凭证或建设用地规划许可证：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSYDXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '土地拍卖凭证或建设用地规划许可证',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
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
  //地名命名 ToponymyApproval
  GetToponymyApprovalAttachment() {
    let { FormTime } = this.state;
    let { entity, FileType } = this.props;
    var ItemType = FileType == 'DM_Settlement' || FileType == 'DM_Building' ? 'zjmm' : 'dlmm';
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>命名审批表：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.MMSPB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '命名审批表',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>立项批复文件：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSYDGHXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '立项批复文件',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>多媒体：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSGCGHXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '多媒体',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
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
            <Col span={8}>
              <div className={st.picgroup}>
                <div>总平面图或效果图：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.XGT}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '总平面图或效果图',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
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
  //地名更名 ToponymyRename
  GetToponymyRenameAttachment() {
    let { FormTime } = this.state;
    let { entity, FileType } = this.props;
    var ItemType = 'gm';
    return (
      <div className={st.group}>
        <div className={st.grouptitle}>附件上传</div>
        <div className={st.groupcontent}>
          <Row>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>更名审批表：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.SQB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '更名审批表',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>业主大会决议：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSYDGHXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '业主大会决议',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
                    }}
                    uploadAction={url_UploadPicture}
                    removeAction={url_RemovePicture}
                    getAction={url_GetPictureUrls}
                  />
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={st.picgroup}>
                <div>多媒体：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSGCGHXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '多媒体',
                      FileType: FileType,
                      time: FormTime,
                      ItemType: ItemType,
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
  //地名注销 ToponymyCancel
  GetToponymyCancelAttachment() {
    return null;
  }

  getAttachment() {
    //地名受理
    if (this.props.FormType === 'ToponymyAccept') {
      return this.GetToponymyAcceptAttachment();
    }
    //地名预命名
    else if (this.props.FormType === 'ToponymyPreApproval') {
      return this.GetToponymyPreApprovalAttachment();
    }
    //地名命名
    else if (this.props.FormType === 'ToponymyApproval') {
      return this.GetToponymyApprovalAttachment();
    }
    //地名更名
    else if (this.props.FormType === 'ToponymyRename') {
      return this.GetToponymyRenameAttachment();
    }
    //地名注销
    else if (this.props.FormType === 'ToponymyCancel') {
      return this.GetToponymyCancelAttachment();
    }
  }

  render() {
    return <div>{this.getAttachment()}</div>;
  }
}

export default AttachForm;