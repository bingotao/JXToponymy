import React, { Component } from 'react';
import { Descriptions } from 'antd';
import st from './Detail.less';
import {
  mpsqType,
  dmsxType,
} from '../../../common/enums.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';

class Detail extends Component {

  componentDidMount() {

  }

  // 返回证件类型-中文
  // 1身份证/2户籍证明/3营业执照/4组织机构代码证
  // getIDType(i){
  //   switch (i) {
  //     case '':
  //       身份证
  //       break;

  //     default:
  //       break;
  //   }
  // }

  // 返回状态-中文-1未处理 2已处理 0已删除 4回退
  getStateVal(i) {
    var val = '';
    switch (i) {
      case 0:
        val = '已删除';
        break;
      case 1:
        val = '未处理';
        break;
      case 2:
        val = '已处理';
        break;
      case 4:
        val = '回退';
        break;
      default:
        val = '暂无';
        break;
    }
    return val;
  }
  // 返回门牌类型-中文-1道路门牌Road/2农村门牌Country/3楼幢门牌Residence
  getMPTypeVal(i) {
    var val = '';
    switch (i) {
      case 'Road':
        val = '道路门牌';
        break;
      case 'Country':
        val = '农村门牌';
        break;
      case 'Residence':
        val = '楼幢门牌';
        break;
      default:
        val = '暂无';
        break;
    }
    return val;
  }
  // 返回地名类型-中文-Settlement/Building/Road/Bridge
  getDMTypeVal(i) {
    var val = '';
    switch (i) {
      case 'Settlement':
        val = '居名点';
        break;
      case 'Building':
        val = '建筑物';
        break;
      case 'Road':
        val = '道路街巷';
        break;
      case 'Bridge':
        val = '桥梁';
        break;
      default:
        val = '暂无';
        break;
    }
    return val;
  }

  render() {
    const { rcdItem, DETAIL_INFO } = this.props;
    return (
      <div>
        {rcdItem == '门牌管理' || rcdItem == '地名证明' ? (
          <Descriptions title={<div className={st.detailTitle}>门牌信息</div>} bordered column={3} size='small'>
            {/* <Descriptions.Item label="基本信息" span={3}></Descriptions.Item> */}
            <Descriptions.Item label="事项名称" span={2}>{mpsqType[DETAIL_INFO.ItemType]}</Descriptions.Item>
            <Descriptions.Item label="门牌类型" span={1}>{this.getMPTypeVal(DETAIL_INFO.MPType)}</Descriptions.Item>
            <Descriptions.Item label="行政区划">{DETAIL_INFO.NeighborhoodsID}</Descriptions.Item>
            <Descriptions.Item label="状态">{this.getStateVal(DETAIL_INFO.state)}</Descriptions.Item>
            <Descriptions.Item label="产权人（产权单位）">{DETAIL_INFO.PropertyOwner}</Descriptions.Item>
            <Descriptions.Item label="证件类型">{DETAIL_INFO.IDType}</Descriptions.Item>
            <Descriptions.Item label="产权人身份证号码">{DETAIL_INFO.IDNumber}</Descriptions.Item>

            <Descriptions.Item label="当前门牌地址">{DETAIL_INFO.StandardAddress}</Descriptions.Item>
            <Descriptions.Item label="原门牌地址">{DETAIL_INFO.OriginalMPAddress}</Descriptions.Item>
            {/* <Descriptions.Item label="">{DETAIL_INFO.CQNumber}</Descriptions.Item> */}
            <Descriptions.Item label="备注">{DETAIL_INFO.Remarks}</Descriptions.Item>

            <Descriptions.Item label="申办人">{DETAIL_INFO.Applicant}</Descriptions.Item>
            <Descriptions.Item label="申办人证件类型">{DETAIL_INFO.ApplicantType}</Descriptions.Item>
            <Descriptions.Item label="申办人证件号码">{DETAIL_INFO.ApplicantNumber}</Descriptions.Item>
            <Descriptions.Item label="申办人联系电话">{DETAIL_INFO.ApplicantPhone}</Descriptions.Item>
            <Descriptions.Item label="申办人联系地址">{DETAIL_INFO.ApplicantAddress}</Descriptions.Item>
            {/* <Descriptions.Item label="申办用户ID">{DETAIL_INFO.CreateID}</Descriptions.Item> */}
            <Descriptions.Item label="申报来源">{DETAIL_INFO.SBLY}</Descriptions.Item>
            <Descriptions.Item label="一网一端接收时间">{DETAIL_INFO.ImportTime}</Descriptions.Item>

            <Descriptions.Item label="填报用户">{DETAIL_INFO.SLUser}</Descriptions.Item>
            <Descriptions.Item label="填报时间">{moment(DETAIL_INFO.SLTime).format('YYYY-MM-DD')}</Descriptions.Item>
            {/* <Descriptions.Item label="业务事件标识">{DETAIL_INFO.PLID}</Descriptions.Item> */}

            {/* <Descriptions.Item label="附件信息" span={3}></Descriptions.Item> */}
            <Descriptions.Item label="申请登记表" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.DJB}
              // fileList={[{
              //   "FileID": "6468fac3-82a7-4a4f-b74b-7a8605ac3e45",
              //   "Name": "test111.docx",
              //   "RelativePath": "Files\\DMFile\\居民点\\b81f8b4e-f824-489d-bf28-88998314f2fe\\命名审批表/6468fac3-82a7-4a4f-b74b-7a8605ac3e45.docx",
              //   "TRelativePath": "Files\\DMFile\\居民点\\b81f8b4e-f824-489d-bf28-88998314f2fe\\命名审批表/t-6468fac3-82a7-4a4f-b74b-7a8605ac3e45.docx"
              // }]}
              />
            </Descriptions.Item>
            <Descriptions.Item label="产权所有人身份证或户籍凭证" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.HJZ}
              />
            </Descriptions.Item>
            <Descriptions.Item label="购房合同或不动产登记证或规划许可证" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.BDC}
              /></Descriptions.Item>
            <Descriptions.Item label="其它相关证明附件" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.QTFJ}
              /></Descriptions.Item>
          </Descriptions>
        ) : null}
        {rcdItem == '地名管理' ? (
          // 地名
          <Descriptions title={<div className={st.detailTitle}>地名信息</div>} bordered column={3} size='small'>
            {/* <Descriptions.Item label="基本信息" span={3}></Descriptions.Item> */}
            <Descriptions.Item label="事项名称" span={2}>{dmsxType[DETAIL_INFO.ItemType]}</Descriptions.Item>
            <Descriptions.Item label="行政区划" span={1}>{DETAIL_INFO.DistrictID}</Descriptions.Item>
            <Descriptions.Item label="地名类别">{this.getDMTypeVal(DETAIL_INFO.DMType)}</Descriptions.Item>
            <Descriptions.Item label="状态">{this.getStateVal(DETAIL_INFO.state)}</Descriptions.Item>
            <Descriptions.Item label="标准地名">{DETAIL_INFO.Name}</Descriptions.Item>
            <Descriptions.Item label="汉语拼音">{DETAIL_INFO.Pinyin}</Descriptions.Item>
            <Descriptions.Item label="罗马字母拼写">{DETAIL_INFO.RomanSpell}</Descriptions.Item>
            <Descriptions.Item label="组团名">{DETAIL_INFO.CommunityName}</Descriptions.Item>

            <Descriptions.Item label="项目地理位置">{DETAIL_INFO.DLSTGK}</Descriptions.Item>
            <Descriptions.Item label="地名的来历">{DETAIL_INFO.DMLL}</Descriptions.Item>
            <Descriptions.Item label="地名的含义">{DETAIL_INFO.DMHY}</Descriptions.Item>
            <Descriptions.Item label="备注">{DETAIL_INFO.Remarks}</Descriptions.Item>

            <Descriptions.Item label="申办人">{DETAIL_INFO.Applicant}</Descriptions.Item>
            <Descriptions.Item label="申办人证件类型">{DETAIL_INFO.ApplicantType}</Descriptions.Item>
            <Descriptions.Item label="申办人证件号码">{DETAIL_INFO.ApplicantNumber}</Descriptions.Item>
            <Descriptions.Item label="申办人联系电话">{DETAIL_INFO.ApplicantPhone}</Descriptions.Item>
            {/* <Descriptions.Item label="申办人联系地址">{DETAIL_INFO.ApplicantAddress}</Descriptions.Item> */}
            {/* <Descriptions.Item label="申办用户ID">{DETAIL_INFO.CreateID}</Descriptions.Item> */}
            <Descriptions.Item label="申报来源">{DETAIL_INFO.SBLY}</Descriptions.Item>
            <Descriptions.Item label="一网一端接收时间">{DETAIL_INFO.ImportTime}</Descriptions.Item>

            <Descriptions.Item label="填报用户">{DETAIL_INFO.SLUser}</Descriptions.Item>
            <Descriptions.Item label="填报时间">{moment(DETAIL_INFO.SLTime).format('YYYY-MM-DD')}</Descriptions.Item>
            {/* <Descriptions.Item label="业务事件标识">{DETAIL_INFO.PLID}</Descriptions.Item> */}

            {/* <Descriptions.Item label="附件信息" span={3}></Descriptions.Item> */}
            <Descriptions.Item label="申请审批（登记）表" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.SPB}
              // fileList={[{
              //   "FileID": "6468fac3-82a7-4a4f-b74b-7a8605ac3e45",
              //   "Name": "test111.docx",
              //   "RelativePath": "Files\\DMFile\\居民点\\b81f8b4e-f824-489d-bf28-88998314f2fe\\命名审批表/6468fac3-82a7-4a4f-b74b-7a8605ac3e45.docx",
              //   "TRelativePath": "Files\\DMFile\\居民点\\b81f8b4e-f824-489d-bf28-88998314f2fe\\命名审批表/t-6468fac3-82a7-4a4f-b74b-7a8605ac3e45.docx"
              // }]}
              />
            </Descriptions.Item>
            <Descriptions.Item label="建设工程规划许可证、项目总平面图" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.PMT}
              />
            </Descriptions.Item>
            <Descriptions.Item label="其它相关证明附件" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.QTFJ}
              /></Descriptions.Item>
            <Descriptions.Item label="业主大会决议" span={3}>
              <UploadPicture
                fileBasePath={'api'}
                disabled={true}
                listType="picture"
                fileList={DETAIL_INFO.YZDH}
              /></Descriptions.Item>
          </Descriptions>
        ) : null}
      </div>

    );
  }
}

export default Detail;
