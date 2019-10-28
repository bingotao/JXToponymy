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
    FormTime: this.props.time, //表单创建时间
  };

  //地名预命名 ToponymyPreApproval
  GetToponymyPreApprovalAttachment() {
    let { FormTime } = this.state;
    let { entity, FileType } = this.props;
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
                    fileList={entity.SQB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '命名审批表',
                      FileType: FileType,
                      time: FormTime,
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
                    fileList={entity.SQB}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '命名审批表',
                      FileType: FileType,
                      time: FormTime,
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
                <div>建设用地规划许可证：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSYDGHXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '建设用地规划许可证',
                      FileType: FileType,
                      time: FormTime,
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
                <div>建设工程规划许可证：</div>
                <div>
                  <UploadPicture
                    listType="picture"
                    fileList={entity.JSGCGHXKZ}
                    id={entity.ID}
                    fileBasePath={baseUrl}
                    data={{
                      RepairType: -1,
                      DOCTYPE: '建设工程规划许可证',
                      FileType: FileType,
                      time: FormTime,
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
    //地名预命名
    if (this.props.FormType === 'ToponymyPreApproval') {
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
  }

  render() {
    return <div>{this.getAttachment()}</div>;
  }
}

export default AttachForm;
