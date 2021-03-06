import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Cascader,
  Select,
  Modal,
  Spin,
  notification,
  Table,
  Icon,
} from 'antd';
import st from './SettlementForm.less';

const { TextArea } = Input;
const { MonthPicker } = DatePicker;

import {
  url_GetDistrictTreeFromDistrict,
  url_GetDistrictTree,
  url_GetNewGuid,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_RoadNameDM,
  url_SearchRoadDMByID,
  url_ModifyRoadDM,
  url_DeleteRoadDM,
  url_CancelResidenceMPByList, //批量注销
  url_SearchPinyinDM,
  url_RemovePicture,
  url_SearchRoadDMByDMCode,
  url_DeletePersonDM,
  url_GetPersonDoneDMBusiness,
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import LocateMap from '../../../components/Maps/LocateMap2.js';
import UploadPicture from '../../../components/UploadPicture/UploadPicture.js';
import { getDistrictsWithJX, getDistricts1And2 } from '../../../utils/utils.js';
import { print_dmymm, print_dmhzs } from '../../../common/Print/LodopFuncs';
import { getUser } from '../../../utils/login';
import AttachForm from './AttachForm';
import { getDivIcons } from '../../../components/Maps/icons';
import {
  zjlx,
  DmxqDisabled,
  DmhbDisabled,
  DmxmDisabled,
  DmgmDisabled,
  DmbjDisabled,
  DmmmDisabled,
} from '../../../common/enums.js';
import { GetNameRow } from './ComFormComponent.js';
import moment from 'moment';
const FormItem = Form.Item;
const { touchIcon } = getDivIcons();
const columns = [
  {
    title: '行政区',
    dataIndex: 'CountyName',
  },
  {
    title: '镇街道',
    dataIndex: 'NeighborhoodsName',
  },
  {
    title: '村社区',
    dataIndex: 'CommunityName',
  },
  {
    title: '小类类别',
    dataIndex: 'Type',
  },
  ,
  {
    title: '拟用名称',
    dataIndex: 'Name',
  },
];
let data,
  CM,
  CY,
  GLC = [];

//地名管理，道路表单
class RoadForm extends Component {
  constructor(ps) {
    super(ps);
    this.edit = ps.edit;
    this.entityTextArea = React.createRef();
  }
  state = {
    showLoading: true,
    districts: [],
    entity: {
      SLRQ: moment(),
      ApplicantType: '居民身份证',
      ApplicantTime: moment(),
      PFTime: moment(),
      SZXZQ: [],
      entityText: null, //地理实体概况文本描述
    },
    newForm: true,
    communities: [],
    postCodes: [],
    showNameCheckModal: false,
    //表单创建时间
    FormTime: moment().format('YYYYMMDDHHmms'),
    choseSzxzq: undefined, //选择了所在行政区
    HYPYgroup: {
      // 汉语拼音 下拉列表
      name: [''],
      value: [''],
    },
    entityIsTextState: false, //地理实体概况处于自动填充状态时为true,文本手动编辑状态时为false。
    saveBtnClicked: false, // 点击保存后按钮置灰
    editBtnClicked: false, // 点击编辑后按钮置灰
  };
  // 存储修改后的数据
  mObj = {};
  removeFileInfo = { ID: [], FileType: '', ItemType: '', time: moment().format('YYYYMMDDHHmms') };

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

  // 打印 预命名使用书
  onPrint_dmymm() {
    if (this.state.saveBtnClicked) {
      print_dmymm([this.state.entity.ID], 'RoadDM');
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  // 打印 地名核准书
  onPrint_dmhzs() {
    if (this.state.saveBtnClicked) {
      print_dmhzs([this.state.entity.ID], 'RoadDM');
    } else {
      notification.warn({ description: '请先保存，再操作！', message: '警告' });
    }
  }

  // 获取行政区数据-三级-所在行政区
  async getDistricts() {
    let rt = await Post(url_GetDistrictTreeFromDistrict);
    rtHandle(rt, d => {
      let districts = getDistrictsWithJX(d);
      this.setState({ districts: districts });
    });
  }

  // 获取行政区数据-二级-所跨行政区
  async getSkzxqDistricts() {
    let rt = await Post(url_GetDistrictTree);
    rtHandle(rt, d => {
      let districts = getDistricts1And2(d);
      this.setState({ SKXZQ_districts: districts });
    });
  }

  async getPostCodes(e) {
    let { entity } = this.state;
    this.setState({
      postCodes: [],
    });
    let rt = await Post(url_GetPostCodes, {
      NeighborhoodsID: entity.SZXZQ[entity.SZXZQ.length - 1],
      CommunityName: e,
    });
    rtHandle(rt, d => {
      this.setState({ postCodes: d });
    });
  }

  async getCommunities(e) {
    let { entity, communities } = this.state;
    if (communities.count > 0) return;
    this.setState({
      communities: [],
      entity: entity,
    });

    let rt = await Post(url_GetNamesFromDic, { type: 4, DistrictID: e[e.length - 1] });
    rtHandle(rt, d => {
      this.setState({ communities: d });
    });
  }

  //获取表单数据
  async getFormData(id) {
    let { WSSQ_INFO } = this.props;
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取地名数据
    if (id || (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_DM_NEW') || (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_DM_OLD')) {
      let { choseSzxzq, entity } = this.state;
      let { FormType } = this.props;
      // 非个人中心
      var url = url_SearchRoadDMByID, query = { id: id };
      if (id) {
      } else {
        // 个人中心
        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_DM_NEW') {
          url = url_GetNewGuid, query = {};
        }
        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_DM_OLD') {
          url = url_SearchRoadDMByDMCode,
            query = { DMCode: WSSQ_INFO.DMCode };
        }
      }
      let rt = await Post(url, query);
      rtHandle(rt, d => {

        if (WSSQ_INFO && WSSQ_INFO.blType == 'WSSQ_DM_NEW') {
          // 从个人中心跳转过来-将已有数据填充到表单
          d = WSSQ_INFO.WSSQ_DATA;

          d.TMRomanSpell = d.RomanSpell;
          // d.WSSQ_DM_XZQH = d.DistrictID;
        }
        if (WSSQ_INFO && (WSSQ_INFO.blType == 'WSSQ_DM_NEW' || WSSQ_INFO.blType == 'WSSQ_DM_NEW')) {
          // 用一网一端数据-填入
          var YWYD_Data = WSSQ_INFO.WSSQ_DATA;
          d.Applicant = YWYD_Data.Applicant;
          d.ApplicantType = YWYD_Data.ApplicantType;
          d.ApplicantNumber = YWYD_Data.ApplicantNumber;
          d.ApplicantPhone = YWYD_Data.ApplicantPhone;
          d.ApplicantAddress = YWYD_Data.ApplicantAddress;
          d.Remarks = YWYD_Data.Remarks;
        }
        let districts = [d.CountyID, d.NeighborhoodsID];
        d.Districts = districts;

        d.ApplicantTime = d.ApplicantTime ? moment(d.ApplicantTime) : null;
        d.ArchiveFileTime = d.ArchiveFileTime ? moment(d.ArchiveFileTime) : null;
        d.CreateTime = d.CreateTime ? moment(d.CreateTime) : null;
        d.DataPushTime = d.DataPushTime ? moment(d.DataPushTime) : null;
        d.GMTime = d.GMTime ? moment(d.GMTime) : null;
        d.HBTime = d.HBTime ? moment(d.HBTime) : null;
        d.ImportTime = d.ImportTime ? moment(d.ImportTime) : null;
        d.InfoReportTime = d.InfoReportTime ? moment(d.InfoReportTime) : null;
        d.LastModifyTime = d.LastModifyTime ? moment(d.LastModifyTime) : null;
        d.PFTime = d.PFTime ? moment(d.PFTime) : moment();
        d.NamedYear = d.NamedYear ? moment(d.NamedYear) : null;
        d.SHTime = d.SHTime ? moment(d.SHTime) : null;
        d.SJTime = d.SJTime ? moment(d.SJTime, 'YYYY年MM月') : null;
        d.JCTime = d.JCTime ? moment(d.JCTime, 'YYYY年MM月') : null;
        d.SLRQ = d.SLRQ ? moment(d.SLRQ) : null;
        d.SPTime = d.SPTime ? moment(d.SPTime) : null;
        d.UsedTime = d.UsedTime ? moment(d.UsedTime) : null;
        d.XMTime = d.XMTime ? moment(d.XMTime) : null;

        if (entity.SLR) {
          d.SLR = entity.SLR;
          d.SLRQ = entity.SLRQ;
        }
        if (FormType == 'ToponymyEdit') {
          d.SLR = d.SLUser;
          d.SLRQ = moment(d.SLTime, 'YYYY-MM-DD HH:mm:ss.SSS');
        }
        if (FormType == 'ToponymyEdit' || FormType == 'ToponymyAccept') {
          d.CreateID = entity.CreateID;
        }
        if (FormType == 'ToponymyApproval') {
          d.NamedYear = moment();
        }

        if (id && FormType == 'ToponymyApproval') {
          d.Name = d.Name1;
          this.getPinyin(d.Name);
        }
        if (FormType == 'ToponymyRename') {
          d.CYM = d.Name;
          d.PFTime = moment();
          if (d.History && d.History.length > 0 && d.History.indexOf('沿袭至今') != -1) {
            // 如果读取到的“历史沿革”字段中有值，且有关键字“沿袭至今”，则直接填充
            var pfsj = d.PFTime ? d.PFTime.format('YYYY年MM月DD日') : '',
              slsj = d.NamedYear ? d.NamedYear.format('YYYY年MM月DD日') : '';
            d.LSYG = this.setLsyg(d.History, slsj, d.Name, pfsj);
          } else {
            d.LSYG = d.History && d.History.indexOf('|') != -1 ? d.History.split('|').join('\n') : d.History;
          }
        } else {
          d.History =
            d.History && d.History.indexOf('|') != -1 ? d.History.split('|').join('\n') : d.History;
        }
        if (FormType == 'ToponymyApproval' || FormType == 'ToponymyRename') {
          // 地名来历 无值时初始化
          if (d.DMLL == null) {
            d.DMLL = this.setDmll(
              d.SBDW,
              d.NamedYear ? d.NamedYear.format('YYYY年MM月DD日') : '',
              d.PZDW
            );
          }
        }

        if (FormType == 'ToponymyApproval') {
          // 从受理进入, 状态为'待审批 1', 读取受理日期
          if (d.Service == 1) {
            d.ApplicantTime = d.ApplicantTime;
          }
          // 从预命名进入，状态为'已审核 2', 当前日期
          if (d.Service == 2) {
            d.ApplicantTime = moment();
          }
          d.LSYG = '命名后一直沿袭至今。';
        }

        if (FormType == 'ToponymyRename' || FormType == 'ToponymyReplace') {
          d.ApplicantTime = moment();
        }

        if (FormType == 'ToponymyCancel') {
          d.UsedTime = '历史地名';
          d.XMTime = moment();
          d.ZLLY = this.setZlly(d.PFWH, d.XMWH);

          var pfsj = d.PFTime ? d.PFTime.format('YYYY年MM月DD日') : '',
            slsj = d.NamedYear ? d.NamedYear.format('YYYY年MM月DD日') : '',
            fzny = d.XMTime ? d.XMTime.format('YYYY年MM月') : '';
          d.LSYG = this.setLsyg(d.History, slsj, d.Name, pfsj, fzny);
        }

        //判断行政区数据是所在行政区还是所跨行政区
        if (d.DistrictID.indexOf('|') != -1) {
          // 是所跨行政区
          d.SKXZQ = d.DistrictID.split('.')
            .join(' / ')
            .split('|');
          choseSzxzq = false;
        } else {
          // 是所在行政区
          var dList = d.DistrictID.split('.'),
            xzq = '',
            xzqList = [];
          dList.map((val, index) => {
            xzq = xzq == '' ? xzq + val : xzq + '.' + val;
            xzqList.push(xzq);
          });
          d.SZXZQ = xzqList;
          choseSzxzq = true;
        }

        this.setState({
          entity: d,
          newForm: false,
          choseSzxzq,
          entityIsTextState: true,
        });
      });
    } else {
      // 获取一个新的guid
      let rt = await Post(url_GetNewGuid);
      rtHandle(rt, d => {
        let { entity } = this.state;
        entity.ID = d;
        this.setState({ entity: entity, newForm: true });
      });
    }
    this.hideLoading();
  }

  validate(errs, bAdrress) {
    errs = errs || [];
    let { FormType } = this.props;
    let { entity, entityIsTextState } = this.state;
    let saveObj = {
      ID: entity.ID,
      ...this.mObj,
    };

    saveObj.DistrictID = entity.DistrictID;
    if (saveObj.SZXZQ) {
      if (saveObj.SZXZQ.length > 1) {
        saveObj.DistrictID = saveObj.SZXZQ[saveObj.SZXZQ.length - 1];
      }
      delete saveObj.SZXZQ;
    }

    if (entity.SKXZQ) {
      if (entity.SKXZQ.length > 1) {
        saveObj.DistrictID = entity.SKXZQ.join('|')
          .split(' / ')
          .join('.');
      } else if (entity.SKXZQ.length == 1) {
        errs.push('请选择至少两个所跨行政区');
      }
    }
    //地理实体概况
    if (entityIsTextState === true) {
      saveObj.DLSTGK = this.props.form.getFieldValue('entityTextArea');
    } else {
      saveObj.DLSTGK = this.entityTextArea.current.textContent;
    }

    saveObj.ApplicantType =
      entity.ApplicantType == null ? saveObj.ApplicantType : entity.ApplicantType;
    saveObj.ApplicantTime = entity.ApplicantTime;

    if (entity.XMTime) {
      saveObj.XMTime = moment(entity.XMTime, 'YYYY年MM月').format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    if (entity.JCTime) {
      saveObj.JCTime = moment(entity.JCTime, 'YYYY年MM月').format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    if (entity.SJTime) {
      saveObj.SJTime = moment(entity.SJTime, 'YYYY年MM月').format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    if (entity.PFTime) {
      saveObj.PFTime = moment(entity.PFTime, 'YYYY年MM月DD日').format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    if(entity.NeighborhoodsID){
      saveObj.NeighborhoodsID = entity.NeighborhoodsID;
    }
    if (entity.UsedTime) {
      saveObj.UsedTime = entity.UsedTime;
    }
    if (FormType == 'ToponymyApproval' || FormType == 'ToponymyRename') {
      if (entity.DMLL) {
        saveObj.DMLL = entity.DMLL;
      }
    }
    if (FormType === 'ToponymyPreApproval') {
      saveObj.Name = entity.Name1;
    }

    if (FormType == 'ToponymyApproval') {
      if (entity.ZLLY) {
        saveObj.ZLLY = entity.ZLLY;
      }
      if (entity.Name) {
        saveObj.Name = entity.Name;
      }
      if (entity.LSYG) {
        saveObj.History = entity.LSYG;
      }
      if (entity.NamedYear) {
        saveObj.NamedYear = moment(entity.NamedYear, 'YYYY年MM月DD日').format('YYYY-MM-DD HH:mm:ss.SSS');
      }
    }
    if (FormType == 'ToponymyRename') {
      if (entity.CYM) {
        saveObj.UsedName = entity.CYM;
      }
      if (entity.LSYG) {
        saveObj.History =
          entity.LSYG.indexOf('\n') != -1 ? entity.LSYG.split('\n').join('|') : entity.LSYG;
        if (this.firstLsyg && this.firstLsyg.length > 0) {
          // 第一次更名返回的历史沿革，过滤掉命名时的'命名后一直沿袭至今。'
          saveObj.History = this.firstLsyg;
        }
      }
    }
    if (FormType == 'ToponymyCancel') {
      if (entity.LSYG) {
        saveObj.History =
          entity.LSYG.indexOf('\n') != -1 ? entity.LSYG.split('\n').join('|') : entity.LSYG;
      }
    }
    if (FormType == 'ToponymyEdit') {
      if (entity.PFTime) {
        saveObj.ALLTime = moment(entity.PFTime, 'YYYY年MM月DD日').format('YYYY-MM-DD HH:mm:ss.SSS');
      }
    }

    if (FormType == 'ToponymyEdit') {
      // 受理人、受理日期
      saveObj.SLUser = saveObj.SLR ? saveObj.SLR : entity.SLUser;
      saveObj.SLTime = saveObj.SLRQ
        ? saveObj.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS')
        : entity.SLTime;
      delete saveObj.SLR;
      delete saveObj.SLRQ;
    } else {
      // 受理人、受理日期
      saveObj.SLUser = entity.SLR;
      saveObj.SLTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    }

    if (FormType == 'ToponymyEdit' || FormType == 'ToponymyAccept') {
      saveObj.CreateID = entity.CreateID;
    }

    if (entity.SBLY && entity.SBLY.length > 0) {
      saveObj.SBLY = entity.SBLY;
    }

    let validateObj = {
      ...entity,
      ...saveObj,
    };
    if (FormType != 'ToponymyBatchDelete' && FormType != 'ToponymyCancel') {
      // 小类类别
      if (!validateObj.Type) {
        errs.push('请选择小类类别');
      }
      // 行政区必填
      if (!validateObj.DistrictID) {
        errs.push('请选择行政区');
      }
      // 地名含义必填
      if (!validateObj.DMHY) {
        errs.push('请输入地名含义');
      }
      // 申报单位必填
      // if (!validateObj.SBDW) {
      //   errs.push('请输入申报单位');
      // }

      if (FormType === 'ToponymyAccept') {
        // 拟用名称1
        if (!validateObj.Name1) {
          errs.push('请输入拟用名称1');
        }
      }
      if (
        FormType != 'ToponymyAccept' &&
        FormType != 'ToponymyPreApproval' &&
        FormType != 'ToponymyReplace'
      ) {
        // 批复时间
        if (!validateObj.PFTime) {
          errs.push('请选择批复时间');
        }
      }
    }

    // ToponymyRename暂时不校验申办人信息栏
    if (FormType != 'ToponymyCancel' && FormType != 'ToponymyEdit' && FormType != 'ToponymyRename') {
      // 申办人 必填
      if (!validateObj.Applicant) {
        errs.push('请填写申办人');
      }

      // 申办人-联系电话 必填
      if (!validateObj.ApplicantPhone) {
        errs.push('请填写申办人的联系电话');
      }

      // 申办人-证件类型 必填
      if (!validateObj.ApplicantType) {
        errs.push('请填写申办人的证件类型');
      }

      // 申办人-证件号码 必填
      if (!validateObj.ApplicantNumber) {
        errs.push('请填写申办人的证件号码');
      }
    }

    return { errs, saveObj, validateObj };
  }

  // 上翻下翻
  nextRcd(flag, IDGroup) {
    var cur = IDGroup.indexOf(this.props.id), len = IDGroup.length - 1, id = '';
    if (flag == 'before') {
      if (cur != 0) {
        // 不是第一个
        id = IDGroup[cur - 1];
      } else {
        notification.warn({ description: '已翻到第一条！', message: '提醒' });
      }
    } else {
      if (cur != len) {
        // 不是最后一个
        id = IDGroup[cur + 1];
      } else {
        notification.warn({ description: '已翻到最后一条！', message: '提醒' });
      }
    }
    if (id != '') {
      this.props.history.replace({
        pathname: '/placemanage/toponymy/toponymyedit',
        state: {
          id: id,
          activeTab: 'RoadForm',
          IDGroup: IDGroup,
        },
      });
    }
  }

  onSaveClick = (e, pass) => {
    if (pass == 'Fail') {
      Modal.confirm({
        title: '提醒',
        content: '是否确认退件？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          e.preventDefault();
          this.props.form.validateFields(
            async function (err, values) {
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

              let { saveObj } = this.validate(errors);

              if (this.props.FormType == 'ToponymyPreApproval') {
                this.save(saveObj, 'ymm', pass == 'Fail' ? 'Fail' : 'Pass', '');
              }
              if (this.props.FormType == 'ToponymyApproval') {
                this.save(saveObj, 'zjmm', pass == 'Fail' ? 'Fail' : 'Pass', '');
              }

              let { entity } = this.state;
              let { WSSQ_INFO } = this.props;
              if (WSSQ_INFO && WSSQ_INFO.blType && WSSQ_INFO.blType.length > 0) {
                this.deletePersonDM(WSSQ_INFO.WSSQ_DATA.ID, entity.SLR, 'Road');
              }
            }.bind(this)
          );
          this.backToSearch();
        },
      });
    } else {
      e.preventDefault();
      this.props.form.validateFields(
        async function (err, values) {
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
            if (this.props.FormType == 'ToponymyAccept') {
              this.save(saveObj, 'sl', 'Pass', '', this.Position);
            }
            if (this.props.FormType == 'ToponymyPreApproval') {
              this.save(saveObj, 'ymm', pass == 'Fail' ? 'Fail' : 'Pass', '', this.Position);
            }
            if (this.props.FormType == 'ToponymyApproval') {
              this.save(saveObj, 'zjmm', pass == 'Fail' ? 'Fail' : 'Pass', '', this.Position);
            }
            if (this.props.FormType == 'ToponymyRename') {
              // this.save(saveObj, 'gm', 'Pass', '', this.Position);
              this.save(saveObj, '', 'Pass', '', this.Position); // 暂时
            }
            if (this.props.FormType == 'ToponymyReplace') {
              this.save(saveObj, 'hb', 'Pass', '', this.Position);
            }
            if (this.props.FormType == 'ToponymyEdit') {
              this.save(saveObj, '', 'Pass', '', this.Position);
            }
            if (this.props.FormType == 'ToponymyCancel') {
              this.save(saveObj, 'zx', 'Pass', '', this.Position);
            }
            if (this.props.FormType == 'ToponymyBatchDelete') {
              this.batchDelete(this.props.ids, this.mObj.XMWH ? this.mObj.XMWH : '');
            }
          }
        }.bind(this)
      );
    }
  };
  // 网上申请-地名-退件
  async deletePersonDM(ID, SLUser, Type) {
    let rt = await Post(url_DeletePersonDM, { ID: ID, SLTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), SLUser: SLUser, Type: Type });
    rtHandle(rt, d => {
      notification.success({ description: '退件成功！', message: '成功' });
    });
  }
  // 网上申请-一网一端-已办
  async getPersonDoneDMBusiness(ID, SLUser) {
    let rt = await Post(url_GetPersonDoneDMBusiness, { ID: ID, DoneTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), DoneUser: SLUser });
    rtHandle(rt, d => {
      // notification.success({ description: '退件成功！', message: '成功' });
    });
  }
  async save(obj, item, pass, opinion, position) {
    await Post(
      url_ModifyRoadDM,
      { oldDataJson: JSON.stringify(obj), item: item, pass: pass, opinion: opinion, Position: position },
      e => {
        if (item == 'zx') {
          notification.success({ description: '注销成功！', message: '成功' });
        } else {
          notification.success({ description: '保存成功！', message: '成功' });
        }
        this.mObj = {};
        if (this.props.onSaveSuccess) {
          this.props.onSaveSuccess();
        }
        this.setState({ saveBtnClicked: true });
        if (this.props.FormType == 'ToponymyApproval') {
          this.props.clickSaveBtn();
        }
        // this.getFormData(this.state.entity.ID);
        // 如果是个人中心跳转过来的待办事项，要标记为已办
        let { entity } = this.state;
        let { WSSQ_INFO } = this.props;
        if (WSSQ_INFO && WSSQ_INFO.WSSQ_DATA) {
          this.getPersonDoneDMBusiness(WSSQ_INFO.WSSQ_DATA.ID, entity.SLR);
        }
      }
    );
  }
  // 批量删除
  async batchDelete(ids, obj, item) {
    await Post(
      url_DeleteRoadDM,
      { ID: obj, XMWH: XMWH },
      e => {
        notification.success({ description: '批量注销成功！', message: '成功' });
        this.props.onCancel();
      }
    );
  }
  // 取消
  onCancel() {
    if (this.state.saveBtnClicked) {
      // 已保存
      // Modal.confirm({
      //   title: '提醒',
      //   content: '是否放弃所做的修改？',
      //   okText: '确定',
      //   cancelText: '取消',
      //   onOk: async () => {
      //     this.backToSearch();
      //   },
      //   onCancel() { },
      // });
      this.backToSearch();
    } else {
      // 未保存
      if (this.removeFileInfo['ID'].length > 0) {
        this.deleteUploadFiles(this.removeFileInfo);
      } else {
        this.backToSearch();
      }
    }
  }

  // 未保存时删除上传的附件
  async deleteUploadFiles(info) {
    await Post(url_RemovePicture, info, d => {
      this.backToSearch();
    });
  }

  isSaved() {
    let saved = true;
    for (let i in this.mObj) {
      saved = false;
      break;
    }
    return saved;
  }

  backToSearch() {
    this.props.history.push({
      pathname: '/placemanage/toponymy/toponymysearch',
      state: {
        activeTab: 'RoadForm',
      },
    });
  }

  // 传入汉字返回拼音
  async getPinyin(name) {
    let rt = await Post(url_SearchPinyinDM, { Name: name });
    rtHandle(rt, d => {
      // 给拼音select下拉列表赋值，并将第一个值设为默认值
      let { entity } = this.state;
      var py = d.name[0];
      this.mObj.Pinyin = py;
      entity.Pinyin = py;
      this.setState({ entity: entity, HYPYgroup: d });
      this.props.form.setFieldsValue({
        Pinyin: d.value[0],
      });
    });
  }

  CheckName(namep, name) {
    if (!namep || !name) {
      Modal.confirm({
        title: '错误',
        okText: '确定',
        cancelText: '取消',
        content: '标准名称和汉语拼音不能为空',
      });
    } else {
      this.getNameCheck(namep, name).then(rt => {
        data = rt.data.Data;
        GLC = data[0];
        CM = data[1];
        CY = data[2];
        this.setState({ showNameCheckModal: true });
      });
    }
  }

  // 检查拟用名称
  async getNameCheck(namep, name) {
    const rt = await Post(url_RoadNameDM, {
      NameP: namep,
      Name: name,
    });
    return rt;
  }

  componentDidMount() {
    this.getDistricts();
    this.getSkzxqDistricts();
    this.getFormData();
    let user = getUser();

    let { entity } = this.state;
    entity.SLR = user.userName;
    entity.CreateID = user.userId;
    this.setState({ entity: entity });
  }

  // 获取不置灰数组
  getDontDisabledGroup() {
    let { showDetailForm, FormType } = this.props;
    if (showDetailForm) {
      return DmxqDisabled;
    }
    if (FormType == 'ToponymyReplace') {
      return DmhbDisabled;
    }
    if (FormType == 'ToponymyCancel') {
      return DmxmDisabled;
    }
    if (FormType == 'ToponymyRename') {
      return DmgmDisabled;
    }
    if (FormType == 'ToponymyEdit') {
      return DmbjDisabled;
    }
    if (FormType == 'ToponymyApproval') {
      return DmmmDisabled;
    }
  }
  // 是否置灰
  isDisabeld(name) {
    const { FormType, showDetailForm } = this.props;
    let { saveBtnClicked, choseSzxzq } = this.state;
    // form中有个别项目需要置灰
    var hasItemDisabled =
      FormType == 'ToponymyReplace' ||
        FormType == 'ToponymyCancel' ||
        FormType == 'ToponymyRename' ||
        FormType == 'ToponymyEdit' ||
        FormType == 'ToponymyApproval'
        ? true
        : false;
    // 不置灰字段group
    var dontDisabledGroup = this.getDontDisabledGroup();

    if (saveBtnClicked == true || showDetailForm == true) {
      return true;
    } else {
      if (hasItemDisabled == true) {
        if (FormType == 'ToponymyEdit' || FormType == 'ToponymyApproval') {
          // 有字段就置灰
          if (dontDisabledGroup[name] == undefined) {
            return false;
          } else {
            return true;
          }
        } else {
          // 有字段就不置灰
          if (dontDisabledGroup[name] == undefined) {
            return true;
          } else {
            return false;
          }
        }
      } else {
        // 大部分不置灰,仅'所跨行政区'等需要置灰
        if (name == 'SKXZQ' || name == 'districts' || name == 'SZXZQ') {
          if (choseSzxzq == undefined) {
            return false;
          } else {
            if (name == 'SKXZQ' || name == 'districts') {
              if (choseSzxzq == true) {
                return true;
              } else {
                return false;
              }
            }
            if (name == 'SZXZQ') {
              if (choseSzxzq == true) {
                return false;
              } else {
                return true;
              }
            }
          }
        }

        if (name == 'CommunityName') {
          if (choseSzxzq == true) {
            return false;
          } else {
            return true;
          }
        }

        return false;
      }
    }
  }

  // 空间定位是否可编辑
  getKjdwEdit() {
    let { FormType } = this.props;
    if (
      FormType == 'ToponymyAccept' ||
      FormType == 'ToponymyPreApproval' ||
      FormType == 'ToponymyApproval' ||
      FormType == 'ToponymyEdit' ||
      FormType == 'ToponymyRename'
    ) {
      return true;
    }
    if (FormType == 'DMXQ' || FormType == 'ToponymyReplace' || FormType == 'ToponymyCancel') {
      return false;
    }
  }

  /**
   * '历史沿革'生成规则：
   * 设立时间或标准名称或批复时间修改，历史沿革字段发生变化
   * @后台传入历史沿革 {*} history 
   * @设立时间 {*} slsj 
   * @标准名称 {*} bzmc 
   * @批复时间 {*} pfsj 
   * @废止年月 {*} fzny
   */
  setLsyg(history, slsj, bzmc, pfsj, fzny) {
    let { FormType } = this.props;
    var lsyg = '';
    if (FormType == 'ToponymyRename') {
      if (history && history.indexOf('调整地名要素') != -1) {
        // 多次更名时，直接在原“历史沿革”内容后附加
        // &批复时间更名（调整地名要素）
        history = history.split('|').join('\n');
        lsyg = history + '\n' + (pfsj) + '更名（调整地名要素）';
      } else {
        // &设立时间命名为&曾用名，&批复时间更名（调整地名要素）。
        lsyg = (slsj) + '命名为' + (bzmc) + '，' + (pfsj) + '更名（调整地名要素）';
        this.firstLsyg = lsyg;
      }
    }
    if (FormType == 'ToponymyCancel') {
      // 在原“历史沿革”内容后追加内容为，&废止年月废止
      if (history && history.indexOf('|') != -1) {
        history = history.split('|').join('\n');
      }
      lsyg = history + '\n' + (fzny) + '废止';
    }
    return lsyg;
  }
  /**
  * '地名来历'生成规则：
  * 返回格式：'&申报单位'申报，'&设立时间（年月）''&批准单位'命名
  * @申报单位 {*} sbdw 
  * @设立时间 {*} slsj 
  * @批准单位 {*} pzdw 
  */
  setDmll(sbdw, slsj, pzdw) {
    var dmll = (sbdw ? sbdw : '') + '申报，' + (slsj ? slsj : '') + (pzdw ? pzdw : '') + '命名';
    return dmll;
  }
  /**
   * '资料来源'生成规则：
   * 返回格式：批复文号、&销名文号。如果原内容为空，就不需要有顿号
   * @批复文号 {*} pfwh 
   * @销名文号 {*} xmwh 
   */
  setZlly(pfwh, xmwh) {
    var xmwh = xmwh == null ? '' : xmwh;
    if (pfwh && pfwh.length > 0) {
      return pfwh + '、' + xmwh;
    } else {
      return xmwh;
    }
  }

  // 根据当前事项返回对应label名称，如变更原因
  getReasonType(FormType) {
    var reason = '';
    if (FormType == 'ToponymyRename') {
      reason = '变更原因';
    }
    if (FormType == 'ToponymyReplace') {
      reason = '换补原因';
    }
    return reason;
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    const { FormType, showDetailForm, WSSQ_INFO, IDGroup } = this.props;
    let {
      showLoading,
      showLocateMap,
      entity,
      districts,
      SKXZQ_districts,
      communities,
      postCodes,
      showNameCheckModal,
      FormTime,
      choseSzxzq, //所在行政区有值为true, 默认不选为undefined, 选择了所跨行政区为false
      entityIsTextState,
      saveBtnClicked,
      editBtnClicked,
    } = this.state;
    var WSSQ_DATA = WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? WSSQ_INFO.WSSQ_DATA : {};
    const { edit } = this;
    var btnDisabled =
      FormType == 'ToponymyReplace' || FormType == 'ToponymyCancel' || showDetailForm
        ? true
        : false; // form中需要有项目置灰
    var allowEdit = this.getKjdwEdit();
    var reasonType = this.getReasonType(FormType);
    return (
      <div className={st.SettlementForm}>
        <Spin
          className={showLoading ? 'active' : ''}
          spinning={showLoading}
          size="large"
          tip="数据加载中..."
        />
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <Form>
            {/* 基本信息 */}
            {FormType == 'ToponymyBatchDelete' ? null : (
              <div className={st.group}>
                <div className={st.grouptitle}>
                  基本信息<span>说明：“ * ”号标识的为必填项</span>
                </div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>申报单位
                          </span>
                        }
                      >
                        {getFieldDecorator('SBDW', {
                          initialValue: entity.SBDW,
                        })(
                          <Input
                            disabled={this.isDisabeld('SBDW')}
                            onChange={e => {
                              this.mObj.SBDW = e.target.value;
                              entity.SBDW = e.target.value;
                              if (FormType == 'ToponymyApproval' || FormType == 'ToponymyRename') {
                                entity.DMLL = this.setDmll(
                                  this.mObj.SBDW,
                                  entity.NamedYear ? entity.NamedYear.format('YYYY年MM月DD日') : '',
                                  entity.PZDW
                                );
                                this.props.form.setFieldsValue({
                                  DMLL: entity.DMLL,
                                });
                              }
                              this.setState({ entity: entity });
                            }}
                            placeholder="申报单位"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="统一社会信用代码"
                      >
                        {getFieldDecorator('SHXYDM', {
                          initialValue: entity.SHXYDM,
                        })(
                          <Input
                            disabled={this.isDisabeld('SHXYDM')}
                            onChange={e => {
                              this.mObj.SHXYDM = e.target.value;
                            }}
                            placeholder="统一社会信用代码"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>小类类别
                          </span>
                        }
                      >
                        {getFieldDecorator('Type', {
                          initialValue: entity.Type,
                        })(
                          <Select
                            onChange={e => {
                              this.mObj.Type = e;
                              this.setState({ entity: { ...entity, Type: e } });
                            }}
                            placeholder="小类类别"
                            disabled={this.isDisabeld('Type')}
                          >
                            {['快速路', '主干路', '次干路', '支路'].map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    {FormType == 'ToponymyAccept' || FormType == 'ToponymyPreApproval' ? null : (
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label={
                            <span>
                              <span className={st.ired}>*</span>地名代码
                            </span>
                          }
                        >
                          {getFieldDecorator('DMCode', {
                            initialValue: entity.DMCode,
                          })(<Input placeholder="地名代码" disabled={this.isDisabeld('DMCode')} />)}
                        </FormItem>
                      </Col>
                    )}
                  </Row>

                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label='申报原标准地名'
                        >
                          {getFieldDecorator('SBBZDM', {
                            initialValue: WSSQ_DATA.Name_Origin,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label='申报拟更名标准地名'
                        >
                          {getFieldDecorator('SBNGMBZDM', {
                            initialValue: WSSQ_DATA.Name,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label='申报汉语拼音'
                        >
                          {getFieldDecorator('SBHYPY', {
                            initialValue: WSSQ_DATA.Pinyin,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}

                  {/* 名称检查 */}
                  {GetNameRow(FormType, entity, this, getFieldDecorator, saveBtnClicked, WSSQ_INFO)}

                  {FormType == 'ToponymyRename' ? (
                    <Row>
                      <Col span={8}>
                        <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="曾用名">
                          <div className={st.nameCheck}>
                            {getFieldDecorator('CYM', {
                              initialValue: entity.CYM,
                            })(<Input placeholder="曾用名" disabled={this.isDisabeld('CYM')} />)}
                          </div>
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {FormType == 'ToponymyReplace' ||
                    FormType == 'ToponymyCancel' ||
                    showDetailForm ? (
                      <Row>
                        <Col span={8}>
                          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="曾用名">
                            <div className={st.nameCheck}>
                              {getFieldDecorator('UsedName', {
                                initialValue: entity.UsedName,
                              })(
                                <Input placeholder="曾用名" disabled={this.isDisabeld('UsedName')} />
                              )}
                            </div>
                          </FormItem>
                        </Col>
                      </Row>
                    ) : null}

                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label='申报行政区划'
                        >
                          {getFieldDecorator('SBXZQH', {
                            initialValue: WSSQ_DATA.DistrictID,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>所在行政区
                          </span>
                        }
                      >
                        {getFieldDecorator('SZXZQ', {
                          initialValue: entity.SZXZQ,
                        })(
                          <Cascader
                            options={districts}
                            disabled={this.isDisabeld('SZXZQ')}
                            onChange={(value, selectedOptions) => {
                              this.mObj.SZXZQ = value;
                              entity.SZXZQ = value;
                              this.getCommunities(value);
                              if (value.length == 0) {
                                this.setState({ entity: entity, choseSzxzq: undefined });
                              } else {
                                this.setState({ entity: entity, choseSzxzq: true });
                              }
                            }}
                            placeholder="请选择所在行政区"
                            expandTrigger="hover"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="村社区">
                        {getFieldDecorator('CommunityName', {
                          initialValue: entity.CommunityName,
                        })(
                          <Select
                            allowClear
                            placeholder="村社区"
                            showSearch={true}
                            mode={'combobox'}
                            disabled={this.isDisabeld('CommunityName')}
                            onSearch={e => {
                              this.mObj.CommunityName = e;
                              this.setState({ entity: { ...entity, CommunityName: e } });
                            }}
                            onChange={e => {
                              this.mObj.CommunityName = e;
                              this.setState({ entity: { ...entity, CommunityName: e } });
                            }}
                            onSelect={e => {
                              this.mObj.CommunityName = e;
                              this.getPostCodes(e);
                              this.setState({ entity: { ...entity, CommunityName: e } });
                            }}
                          >
                            {communities.map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="邮政编码">
                        {getFieldDecorator('Postcode', {
                          initialValue: entity.Postcode,
                        })(
                          <Select
                            allowClear
                            placeholder="邮政编码"
                            showSearch={true}
                            mode={'combobox'}
                            disabled={this.isDisabeld('Postcode')}
                            onSearch={e => {
                              this.mObj.Postcode = e;
                              this.setState({ entity: { ...entity, Postcode: e } });
                            }}
                            onChange={e => {
                              this.mObj.Postcode = e;
                              this.setState({ entity: { ...entity, Postcode: e } });
                            }}
                            onSelect={e => {
                              this.mObj.Postcode = e;
                              this.setState({ entity: { ...entity, Postcode: e } });
                            }}
                          >
                            {postCodes.map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={16}>
                      <FormItem
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>所跨行政区
                          </span>
                        }
                      >
                        {getFieldDecorator('SKXZQ', {
                          initialValue: entity.SKXZQ,
                        })(
                          <Select
                            style={{ width: '37%', marginRight: '2%' }}
                            mode="multiple"
                            open={false}
                            placeholder="所跨行政区"
                            disabled={this.isDisabeld('SKXZQ')}
                            onDeselect={value => {
                              // 减行政区
                              entity.SKXZQ = entity.SKXZQ.filter(v => {
                                return v != value;
                              });
                              if (entity.SKXZQ && entity.SKXZQ.length > 0) {
                                this.setState({ entity: entity, choseSzxzq: false });
                              } else {
                                this.setState({ entity: entity, choseSzxzq: undefined });
                              }
                            }}
                          />
                        )}
                        <Cascader
                          value={null}
                          allowClear
                          expandTrigger="hover"
                          options={SKXZQ_districts}
                          placeholder="请选择所跨行政区"
                          // changeOnSelect
                          style={{ width: '37%' }}
                          disabled={this.isDisabeld('districts')}
                          onChange={(value, selectedOptions) => {
                            // 加行政区
                            const showValue = value[value.length - 1].split('.').join(' / '); //输入框显示的值
                            if (!entity.SKXZQ) entity.SKXZQ = [];
                            entity.SKXZQ.push(showValue);
                            this.props.form.setFieldsValue({
                              SKXZQ: entity.SKXZQ,
                            });

                            this.getCommunities(value);
                            if (entity.SKXZQ && entity.SKXZQ.length > 0) {
                              this.setState({ entity: entity, choseSzxzq: false });
                            }
                          }}
                        />
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="道路走向">
                        {getFieldDecorator('RoadDirection', {
                          initialValue: entity.RoadDirection,
                        })(
                          <Select
                            disabled={this.isDisabeld('RoadDirection')}
                            onChange={e => {
                              this.mObj.RoadDirection = e;
                              this.setState({ entity: { ...entity, RoadDirection: e } });
                            }}
                            placeholder="道路走向"
                          >
                            {['东西向', '南北向', '环路'].map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="起点">
                        {getFieldDecorator('RoadStart', {
                          initialValue: entity.RoadStart,
                        })(
                          <Input
                            disabled={this.isDisabeld('RoadStart')}
                            onChange={e => {
                              this.mObj.RoadStart = e.target.value;
                              this.setState({ entity: { ...entity, RoadStart: e.target.value } });
                            }}
                            placeholder="起点"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="止点">
                        {getFieldDecorator('RoadEnd', {
                          initialValue: entity.RoadEnd,
                        })(
                          <Input
                            disabled={this.isDisabeld('RoadEnd')}
                            onChange={e => {
                              this.mObj.RoadEnd = e.target.value;
                              this.setState({
                                entity: { ...this.state.entity, RoadEnd: e.target.value },
                              });
                            }}
                            placeholder="止点"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="编制规则">
                        {getFieldDecorator('Rule', {
                          initialValue: entity.Rule,
                        })(
                          <Input
                            disabled={this.isDisabeld('Rule')}
                            onChange={e => {
                              this.mObj.Rule = e.target.value;
                              this.setState({
                                entity: { ...this.state.entity, Rule: e.target.value },
                              });
                            }}
                            placeholder="编制规则"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="长度（米）"
                      >
                        {getFieldDecorator('Length', {
                          initialValue: entity.Length,
                        })(
                          <InputNumber
                            disabled={this.isDisabeld('Length')}
                            style={{ width: '100%' }}
                            onChange={e => {
                              this.mObj.Length = e;
                              this.setState({ entity: { ...this.state.entity, Length: e } });
                            }}
                            placeholder="长度（米）"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label="宽度（米）"
                      >
                        {getFieldDecorator('Width', {
                          initialValue: entity.Width,
                        })(
                          <InputNumber
                            disabled={this.isDisabeld('Width')}
                            style={{ width: '100%' }}
                            onChange={e => {
                              this.mObj.Width = e;
                              this.setState({ entity: { ...this.state.entity, Width: e } });
                            }}
                            placeholder="宽度（米）"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="路面性质">
                        {getFieldDecorator('RoadNature', {
                          initialValue: entity.RoadNature,
                        })(
                          <Select
                            disabled={this.isDisabeld('RoadNature')}
                            onChange={e => {
                              this.mObj.RoadNature = e;
                              this.setState({ entity: { ...this.state.entity, RoadNature: e } });
                            }}
                            placeholder="路面性质"
                          >
                            {['混凝土路面', '沥青路面', '碎石路面'].map(e => (
                              <Select.Option value={e}>{e}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="始建年月">
                        {getFieldDecorator('SJTime', {
                          initialValue: entity.SJTime,
                        })(
                          <MonthPicker
                            placeholder="始建年月"
                            format="YYYY年MM月"
                            onChange={(date, dateString) => {
                              this.mObj.SJTime = dateString;
                              this.setState({
                                entity: { ...this.state.entity, SJTime: dateString },
                              });
                            }}
                            disabled={this.isDisabeld('SJTime')}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="建成年月">
                        {getFieldDecorator('JCTime', {
                          initialValue: entity.JCTime,
                        })(
                          <MonthPicker
                            placeholder="建成年月"
                            format="YYYY年MM月"
                            onChange={(date, dateString) => {
                              this.mObj.JCTime = dateString;
                              this.setState({
                                entity: { ...this.state.entity, JCTime: dateString },
                              });
                            }}
                            disabled={this.isDisabeld('JCTime')}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>

                  {FormType != 'ToponymyAccept' && FormType != 'ToponymyPreApproval' ? (
                    <Row>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="批准单位"
                        >
                          {getFieldDecorator('PZDW', {
                            initialValue: entity.PZDW,
                          })(
                            <Input
                              disabled={this.isDisabeld('PZDW')}
                              onChange={e => {
                                this.mObj.PZDW = e.target.value;
                                entity.PZDW = e.target.value;
                                if (
                                  FormType == 'ToponymyApproval' ||
                                  FormType == 'ToponymyRename'
                                ) {
                                  entity.DMLL = this.setDmll(
                                    entity.SBDW,
                                    entity.NamedYear ? entity.NamedYear.format('YYYY年MM月DD日') : '',
                                    e.target.value
                                  );
                                  this.props.form.setFieldsValue({
                                    DMLL: entity.DMLL,
                                  });
                                }
                                this.setState({ entity: entity });
                              }}
                              placeholder="批准单位"
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label={
                            <span>
                              <span className={st.ired}>*</span>设立时间
                            </span>
                          }
                        >
                          {getFieldDecorator('NamedYear', {
                            initialValue: entity.NamedYear,
                          })(
                            <DatePicker
                              placeholder="设立时间"
                              format="YYYY年MM月DD日"
                              onChange={(date, dateString) => {
                                this.mObj.NamedYear = dateString;
                                entity.NamedYear = dateString;

                                if (FormType == 'ToponymyRename') {
                                  entity.LSYG = this.setLsyg(
                                    entity.History, dateString,
                                    entity.Name,
                                    entity.PFTime ? entity.PFTime.format('YYYY年MM月DD日') : '');
                                  this.props.form.setFieldsValue({
                                    LSYG: entity.LSYG,
                                  });
                                }
                                if (
                                  FormType == 'ToponymyApproval' ||
                                  FormType == 'ToponymyRename'
                                ) {
                                  entity.DMLL = this.setDmll(entity.SBDW, dateString, entity.PZDW);
                                  this.props.form.setFieldsValue({
                                    DMLL: entity.DMLL,
                                  });
                                }
                                this.setState({ entity: entity });
                              }}
                              disabled={this.isDisabeld('NamedYear')}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label={
                            <span>
                              <span className={st.ired}>*</span>批复时间
                            </span>
                          }
                        >
                          {getFieldDecorator('PFTime', {
                            initialValue: entity.PFTime,
                          })(
                            <DatePicker
                              placeholder="批复时间"
                              format="YYYY年MM月DD日"
                              onChange={(date, dateString) => {
                                this.mObj.PFTime = dateString;
                                entity.PFTime = dateString;

                                if (FormType == 'ToponymyRename') {
                                  entity.LSYG = this.setLsyg(
                                    entity.History,
                                    entity.NamedYear ? entity.NamedYear.format('YYYY年MM月DD日') : '',
                                    entity.Name, dateString);
                                  this.props.form.setFieldsValue({
                                    LSYG: entity.LSYG,
                                  });
                                }
                                this.setState({ entity: entity });
                              }}
                              disabled={this.isDisabeld('PFTime')}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={6}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="批复文号"
                        >
                          {getFieldDecorator('PFWH', {
                            initialValue: entity.PFWH,
                          })(
                            <Input
                              disabled={this.isDisabeld('PFWH')}
                              onChange={e => {
                                this.mObj.PFWH = e.target.value;
                                entity.PFWH = e.target.value;
                                entity.ZLLY = e.target.value;
                                this.props.form.setFieldsValue({
                                  ZLLY: this.setZlly(this.mObj.PFWH, entity.xmwh),
                                });
                                this.setState({ entity: entity });
                              }}
                              placeholder="批复文号"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {FormType == 'ToponymyCancel' || entity.Service == 5 ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="使用时间"
                        >
                          {getFieldDecorator('UsedTime', {
                            initialValue: entity.UsedTime,
                          })(
                            <Input
                              disabled={this.isDisabeld('UsedTime')}
                              onChange={e => {
                                this.mObj.UsedTime = e.target.value;
                              }}
                              placeholder="使用时间"
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="废止年月"
                        >
                          {getFieldDecorator('XMTime', {
                            initialValue: entity.XMTime,
                          })(
                            <MonthPicker
                              placeholder="废止年月"
                              format="YYYY年MM月"
                              disabled={this.isDisabeld('XMTime')}
                              onChange={(date, dateString) => {
                                this.mObj.XMTime = dateString;
                                entity.XMTime = dateString;
                                if (FormType == 'ToponymyCancel') {
                                  entity.LSYG = this.setLsyg(
                                    entity.History,
                                    entity.NamedYear ? entity.NamedYear.format('YYYY年MM月DD日') : '',
                                    entity.Name,
                                    entity.PFTime ? entity.PFTime.format('YYYY年MM月DD日') : '',
                                    dateString,
                                  );
                                  this.props.form.setFieldsValue({
                                    LSYG: entity.LSYG,
                                  });
                                }
                                this.setState({ entity: entity });
                              }}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 14 }}
                          label="销名文号"
                        >
                          {getFieldDecorator('XMWH', {
                            initialValue: entity.XMWH,
                          })(
                            <Input
                              disabled={this.isDisabeld('XMWH')}
                              onChange={e => {
                                this.mObj.XMWH = e.target.value;
                                this.props.form.setFieldsValue({
                                  ZLLY: this.setZlly(entity.PFWH, this.mObj.XMWH),
                                });
                              }}
                              placeholder="销名文号"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}

                  {FormType == 'ToponymyAccept' ||
                    FormType == 'ToponymyPreApproval' ||
                    FormType == 'ToponymyEdit' ? null : (
                      <Row>
                        <Col span={16}>
                          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="地名来历">
                            {getFieldDecorator('DMLL', {
                              initialValue: entity.DMLL,
                            })(
                              <TextArea
                                // disabled={this.isDisabeld('DMLL')}
                                disabled={true}
                                // onChange={e => {
                                //   this.mObj.DMLL = e.target.value;
                                // }}
                                placeholder="地名来历"
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    )}

                  {FormType == 'ToponymyEdit' ? (
                    <Row>
                      <Col span={16}>
                        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="地名来历">
                          {getFieldDecorator('DMLL', {
                            initialValue: entity.DMLL,
                          })(
                            <TextArea
                              disabled={saveBtnClicked}
                              onChange={e => {
                                this.mObj.DMLL = e.target.value;
                              }}
                              placeholder="地名来历"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}

                  <Row>
                    <Col span={16}>
                      <FormItem
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>地理实体概况
                          </span>
                        }
                      >
                        {entityIsTextState === false ? (
                          <div
                            style={{
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              padding: '4px 11px',
                            }}
                            ref={this.entityTextArea}
                            disabled={this.isDisabeld('DLSTGK')}
                          >
                            {/* 跨行政区时,隐藏这段话 */}
                            {choseSzxzq === false ? null : (
                              <>
                                位于
                                <span>
                                  {entity.SZXZQ && entity.SZXZQ.length > 0 ? (
                                    <span className={st.hasValue}>
                                      {entity.SZXZQ[entity.SZXZQ.length - 1].split('.').join('')}
                                    </span>
                                  ) : (
                                      <span className={st.hasNoValue}>&行政区划</span>
                                    )}
                                </span>
                                <span>
                                  {entity.CommunityName ? (
                                    <span className={st.hasValue}>{entity.CommunityName}</span>
                                  ) : (
                                      <span className={st.hasNoValue}>&村社区</span>
                                    )}
                                </span>
                                ,
                              </>
                            )}
                            为
                            <span>
                              {entity.RoadDirection ? (
                                <span className={st.hasValue}>{entity.RoadDirection}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&道路走向</span>
                                )}
                            </span>
                            <span>
                              {entity.Type ? (
                                <span className={st.hasValue}>{entity.Type}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&小类类别</span>
                                )}
                            </span>
                            。道路（起）
                            <span>
                              {entity.RoadStart ? (
                                <span className={st.hasValue}>{entity.RoadStart}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&起点</span>
                                )}
                            </span>
                            ，（至）
                            <span>
                              {entity.RoadEnd ? (
                                <span className={st.hasValue}>{entity.RoadEnd}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&止点</span>
                                )}
                            </span>
                            ，编制规则为
                            <span>
                              {entity.Rule ? (
                                <span className={st.hasValue}>{entity.Rule}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&编制规则</span>
                                )}
                            </span>
                            ,全长
                            <span>
                              {entity.Length ? (
                                <span className={st.hasValue}>{entity.Length}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&长度</span>
                                )}
                            </span>
                            米，宽
                            <span>
                              {entity.Width ? (
                                <span className={st.hasValue}>{entity.Width}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&宽度</span>
                                )}
                            </span>
                            米，
                            <span>
                              {entity.RoadNature ? (
                                <span className={st.hasValue}>{entity.RoadNature}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&路面性质</span>
                                )}
                            </span>
                            。
                            <span>
                              {entity.SJTime ? (
                                <span className={st.hasValue}>{entity.SJTime}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&始建年月</span>
                                )}
                            </span>
                            始建，
                            <span>
                              {entity.JCTime ? (
                                <span className={st.hasValue}>{entity.JCTime}</span>
                              ) : (
                                  <span className={st.hasNoValue}>&建成年月</span>
                                )}
                            </span>
                            建成。
                          </div>
                        ) : (
                            getFieldDecorator('entityTextArea', { initialValue: entity.DLSTGK })(
                              <TextArea
                                rows={4}
                                autoSize={false}
                                disabled={this.isDisabeld('DLSTGK')}
                              ></TextArea>
                            )
                          )}
                      </FormItem>
                    </Col>
                    {FormType == 'ToponymyAccept' ? (
                      <Col span={4}>
                        <FormItem>
                          <Button
                            type="primary"
                            icon="form"
                            style={{ marginLeft: '20px' }}
                            disabled={this.isDisabeld('DLSTGKBJ') || editBtnClicked}
                            onClick={() => {
                              if (entityIsTextState === true) return;
                              const entityAutoInputContent = this.entityTextArea.current
                                .textContent;
                              this.setState(
                                {
                                  ...this.state,
                                  entityIsTextState: true,
                                  editBtnClicked: true,
                                  entity: {
                                    ...entity,
                                    entityText: entityAutoInputContent, //将自动填充状态的文本复制至textArea
                                  },
                                },
                                () => {
                                  this.props.form.setFieldsValue({
                                    entityTextArea: entityAutoInputContent,
                                  });
                                }
                              );
                            }}
                          >
                            编辑
                          </Button>
                        </FormItem>
                      </Col>
                    ) : null}
                  </Row>
                  <Row>
                    <Col span={16}>
                      <FormItem
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>地名含义
                          </span>
                        }
                      >
                        {getFieldDecorator('DMHY', {
                          initialValue: entity.DMHY,
                        })(
                          <TextArea
                            disabled={this.isDisabeld('DMHY')}
                            onChange={e => {
                              this.mObj.DMHY = e.target.value;
                            }}
                            placeholder="地名含义"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem>
                        <Button
                          type="primary"
                          icon="environment"
                          onClick={this.showLocateMap.bind(this)}
                          disabled={false}
                          style={{ marginLeft: '20px' }}
                        >
                          空间定位
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={16}>
                        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="申报项目地理位置">
                          {getFieldDecorator('SBXMDLWZ', {
                            initialValue: WSSQ_DATA.DLSTGK,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA && reasonType != '' ? (
                    <Row>
                      <Col span={16}>
                        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label={reasonType}>
                          {getFieldDecorator('YY', {
                            initialValue: WSSQ_DATA.ModifyResult,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {FormType == 'ToponymyAccept' ||
                    FormType == 'ToponymyPreApproval' ||
                    FormType == 'ToponymyEdit' ? null : (
                      <Row>
                        <Col span={16}>
                          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="资料来源">
                            {getFieldDecorator('ZLLY', {
                              initialValue: entity.ZLLY,
                            })(
                              <TextArea
                                // disabled={this.isDisabeld('ZLLY')}
                                // onChange={e => {
                                //   this.mObj.ZLLY = e.target.value;
                                // }}
                                placeholder="资料来源"
                                disabled={true}
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                  {FormType == 'ToponymyEdit' ? (
                    <Row>
                      <Col span={16}>
                        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="资料来源">
                          {getFieldDecorator('ZLLY', {
                            initialValue: entity.ZLLY,
                          })(
                            <TextArea
                              disabled={saveBtnClicked}
                              onChange={e => {
                                this.mObj.ZLLY = e.target.value;
                              }}
                              placeholder="资料来源"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {FormType == 'ToponymyRename' ||
                    FormType == 'ToponymyCancel' ||
                    FormType == 'ToponymyApproval' ? (
                      <Row>
                        <Col span={16}>
                          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="历史沿革">
                            {getFieldDecorator('LSYG', {
                              initialValue: entity.LSYG,
                            })(
                              <TextArea
                                disabled={this.isDisabeld('LSYG')}
                                onChange={e => {
                                  this.mObj.LSYG = e.target.value;
                                }}
                                placeholder="历史沿革"
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    ) : null}
                  {FormType == 'ToponymyReplace' ||
                    showDetailForm ? (
                      <Row>
                        <Col span={16}>
                          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label="历史沿革">
                            {getFieldDecorator('History', {
                              initialValue: entity.History,
                            })(
                              <TextArea
                                disabled={this.isDisabeld('History')}
                                onChange={e => {
                                  this.mObj.History = e.target.value;
                                }}
                                placeholder="历史沿革"
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    ) : null}
                </div>
              </div>
            )}

            {/* 申办信息-需要-读取之前提交的信息-受理、预命名、命名-申办人、联系电话、联系地址、证件类型、证件号码为必填 */}
            {FormType == 'ToponymyAccept' || FormType == 'ToponymyPreApproval' || FormType == 'ToponymyApproval' ? (
              <div className={st.group}>
                <div className={st.grouptitle}>申办信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>申办人
                          </span>
                        }
                      >
                        {getFieldDecorator('Applicant', {
                          initialValue: entity.Applicant,
                        })(
                          <Input
                            disabled={this.isDisabeld('Applicant')}
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系电话
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantPhone', {
                          initialValue: entity.ApplicantPhone,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantPhone')}
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系地址
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantAddress', {
                          initialValue: entity.ApplicantAddress,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantAddress')}
                            onChange={e => {
                              this.mObj.ApplicantAddress = e.target.value;
                            }}
                            placeholder="联系地址"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件类型
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantType', {
                          initialValue: entity.ApplicantType,
                        })(
                          <Select
                            disabled={this.isDisabeld('ApplicantType')}
                            allowClear
                            onChange={e => {
                              this.mObj.ApplicantType = e || '';
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
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件号码
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantNumber', {
                          initialValue: entity.ApplicantNumber,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantNumber')}
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申请日期">
                        {getFieldDecorator('ApplicantTime', {
                          initialValue: entity.ApplicantTime,
                        })(
                          <DatePicker
                            disabled={this.isDisabeld('ApplicantTime')}
                            onChange={e => {
                              this.mObj.ApplicantTime = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理人">
                        {getFieldDecorator('SLR', {
                          initialValue: entity.SLR,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理日期">
                        {getFieldDecorator('SLRQ', {
                          initialValue: entity.SLRQ,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='领取方式'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiveWay,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收货人姓名'
                        >
                          {getFieldDecorator('SHRXM', {
                            initialValue: WSSQ_DATA.ReceiverName,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='联系方式（收货人）'
                        >
                          {getFieldDecorator('LXFS', {
                            initialValue: WSSQ_DATA.ReceiverPhone,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收件地址（收货人）'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiverAddress,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* 申办信息-需要-读取之前提交的信息-编辑-申办人、联系电话、联系地址、证件类型、证件号码不为必填 */}
            {FormType == 'ToponymyEdit' ? (
              <div className={st.group}>
                <div className={st.grouptitle}>申办信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申办人">
                        {getFieldDecorator('Applicant', {
                          initialValue: entity.Applicant,
                        })(
                          <Input
                            disabled={this.isDisabeld('Applicant')}
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="联系电话">
                        {getFieldDecorator('ApplicantPhone', {
                          initialValue: entity.ApplicantPhone,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantPhone')}
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="联系地址">
                        {getFieldDecorator('ApplicantAddress', {
                          initialValue: entity.ApplicantAddress,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantAddress')}
                            onChange={e => {
                              this.mObj.ApplicantAddress = e.target.value;
                            }}
                            placeholder="联系地址"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="证件类型">
                        {getFieldDecorator('ApplicantType', {
                          initialValue: entity.ApplicantType,
                        })(
                          <Select
                            disabled={this.isDisabeld('ApplicantType')}
                            allowClear
                            onChange={e => {
                              this.mObj.ApplicantType = e || '';
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
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="证件号码">
                        {getFieldDecorator('ApplicantNumber', {
                          initialValue: entity.ApplicantNumber,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantNumber')}
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申请日期">
                        {getFieldDecorator('ApplicantTime', {
                          initialValue: entity.ApplicantTime,
                        })(
                          <DatePicker
                            disabled={this.isDisabeld('ApplicantTime')}
                            onChange={e => {
                              this.mObj.ApplicantTime = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理人">
                        {getFieldDecorator('SLR', {
                          initialValue: entity.SLR,
                        })(
                          <Input
                            disabled={saveBtnClicked}
                            onChange={e => {
                              this.mObj.SLR = e.target.value;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理日期">
                        {getFieldDecorator('SLRQ', {
                          initialValue: entity.SLRQ,
                        })(
                          <DatePicker
                            disabled={saveBtnClicked}
                            onChange={e => {
                              this.mObj.SLRQ = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='领取方式'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiveWay,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收货人姓名'
                        >
                          {getFieldDecorator('SHRXM', {
                            initialValue: WSSQ_DATA.ReceiverName,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='联系方式（收货人）'
                        >
                          {getFieldDecorator('LXFS', {
                            initialValue: WSSQ_DATA.ReceiverPhone,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收件地址（收货人）'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiverAddress,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* 申办信息-不需要-读取之前提交的信息-更名、换补且不是从个人中心跳转而来-申办人、联系电话、联系地址、证件类型、证件号码为必填 */}
            {(FormType == 'ToponymyRename' || FormType == 'ToponymyReplace') && !(WSSQ_INFO && WSSQ_INFO.WSSQ_DATA) ? (
              <div className={st.group}>
                <div className={st.grouptitle}>申办信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>申办人
                          </span>
                        }
                      >
                        {getFieldDecorator(
                          'Applicant',
                          {}
                        )(
                          <Input
                            disabled={this.isDisabeld('Applicant')}
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系电话
                          </span>
                        }
                      >
                        {getFieldDecorator(
                          'ApplicantPhone',
                          {}
                        )(
                          <Input
                            disabled={this.isDisabeld('ApplicantPhone')}
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系地址
                          </span>
                        }
                      >
                        {getFieldDecorator(
                          'ApplicantAddress',
                          {}
                        )(
                          <Input
                            disabled={this.isDisabeld('ApplicantAddress')}
                            onChange={e => {
                              this.mObj.ApplicantAddress = e.target.value;
                            }}
                            placeholder="联系地址"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件类型
                          </span>
                        }
                      >
                        {getFieldDecorator('ApplicantType', {
                          initialValue: entity.ApplicantType,
                        })(
                          <Select
                            disabled={this.isDisabeld('ApplicantType')}
                            allowClear
                            onChange={e => {
                              this.mObj.ApplicantType = e || '';
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
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件号码
                          </span>
                        }
                      >
                        {getFieldDecorator(
                          'ApplicantNumber',
                          {}
                        )(
                          <Input
                            disabled={this.isDisabeld('ApplicantNumber')}
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申请日期">
                        {getFieldDecorator('ApplicantTime', {
                          initialValue: entity.ApplicantTime,
                        })(
                          <DatePicker
                            disabled={this.isDisabeld('ApplicantTime')}
                            onChange={e => {
                              this.mObj.ApplicantTime = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理人">
                        {getFieldDecorator('SLR', {
                          initialValue: entity.SLR,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理日期">
                        {getFieldDecorator('SLRQ', {
                          initialValue: entity.SLRQ,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </div>
            ) : null}

            {/* 申办信息-需要-读取之前提交的信息-更名、换补且是从个人中心跳转而来-申办人、联系电话、联系地址、证件类型、证件号码为必填 */}
            {(FormType == 'ToponymyRename' || FormType == 'ToponymyReplace') && (WSSQ_INFO && WSSQ_INFO.WSSQ_DATA) ? (
              <div className={st.group}>
                <div className={st.grouptitle}>申办信息</div>
                <div className={st.groupcontent}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>申办人
                     </span>
                        }
                      >
                        {getFieldDecorator('Applicant', {
                          initialValue: entity.Applicant,
                        })(
                          <Input
                            disabled={this.isDisabeld('Applicant')}
                            onChange={e => {
                              this.mObj.Applicant = e.target.value;
                            }}
                            placeholder="申办人"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系电话
                     </span>
                        }
                      >
                        {getFieldDecorator('ApplicantPhone', {
                          initialValue: entity.ApplicantPhone,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantPhone')}
                            onChange={e => {
                              this.mObj.ApplicantPhone = e.target.value;
                            }}
                            placeholder="联系电话"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>联系地址
                     </span>
                        }
                      >
                        {getFieldDecorator('ApplicantAddress', {
                          initialValue: entity.ApplicantAddress,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantAddress')}
                            onChange={e => {
                              this.mObj.ApplicantAddress = e.target.value;
                            }}
                            placeholder="联系地址"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件类型
                     </span>
                        }
                      >
                        {getFieldDecorator('ApplicantType', {
                          initialValue: entity.ApplicantType,
                        })(
                          <Select
                            disabled={this.isDisabeld('ApplicantType')}
                            allowClear
                            onChange={e => {
                              this.mObj.ApplicantType = e || '';
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
                      <FormItem
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
                        label={
                          <span>
                            <span className={st.ired}>*</span>证件号码
                     </span>
                        }
                      >
                        {getFieldDecorator('ApplicantNumber', {
                          initialValue: entity.ApplicantNumber,
                        })(
                          <Input
                            disabled={this.isDisabeld('ApplicantNumber')}
                            onChange={e => {
                              this.mObj.ApplicantNumber = e.target.value;
                            }}
                            placeholder="证件号码"
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="申请日期">
                        {getFieldDecorator('ApplicantTime', {
                          initialValue: entity.ApplicantTime,
                        })(
                          <DatePicker
                            disabled={this.isDisabeld('ApplicantTime')}
                            onChange={e => {
                              this.mObj.ApplicantTime = e;
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>

                  <Row>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理人">
                        {getFieldDecorator('SLR', {
                          initialValue: entity.SLR,
                        })(<Input disabled={true} />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="受理日期">
                        {getFieldDecorator('SLRQ', {
                          initialValue: entity.SLRQ,
                        })(<DatePicker disabled={true} />)}
                      </FormItem>
                    </Col>
                  </Row>
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='领取方式'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiveWay,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收货人姓名'
                        >
                          {getFieldDecorator('SHRXM', {
                            initialValue: WSSQ_DATA.ReceiverName,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='联系方式（收货人）'
                        >
                          {getFieldDecorator('LXFS', {
                            initialValue: WSSQ_DATA.ReceiverPhone,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                  {WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                    <Row>
                      <Col span={8}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          label='收件地址（收货人）'
                        >
                          {getFieldDecorator('LQFS', {
                            initialValue: WSSQ_DATA.ReceiverAddress,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* 地名详情-地名照片 */}
            {FormType == 'DMXQ' ? (
              <div className={st.group}>
                <div className={st.grouptitle}>标志照片</div>
                <div className={st.groupcontent}>
                  <UploadPicture
                    disabled={true}
                    listType="picture-card"
                    fileList={entity.DMTXX}
                    fileBasePath={'api'}
                  />
                </div>
              </div>
            ) : null}
            {/*  待办事项附件-展示  */}
            {
              WSSQ_INFO && WSSQ_INFO.WSSQ_DATA ? (
                <AttachForm
                  FormType={'GrzxYwydDm'}
                  entity={entity}
                  FileType="DM_Road"
                  saveBtnClicked={saveBtnClicked}
                  setDeleteFilesInfo={(ID, FileType, ItemType, time) => {
                    this.removeFileInfo['ID'].push(ID);
                    this.removeFileInfo['FileType'] = FileType;
                    this.removeFileInfo['ItemType'] = ItemType;
                    // this.removeFileInfo['time'] = time;
                  }}
                  WSSQ_INFO={WSSQ_INFO}
                />
              ) : null
            }
            
            {/* 附件 */}
            <AttachForm
              FormType={FormType}
              entity={entity}
              FileType="DM_Road"
              saveBtnClicked={saveBtnClicked}
              setDeleteFilesInfo={(ID, FileType, ItemType, time) => {
                this.removeFileInfo['ID'].push(ID);
                this.removeFileInfo['FileType'] = FileType;
                this.removeFileInfo['ItemType'] = ItemType;
                // this.removeFileInfo['time'] = time;
              }}
              WSSQ_INFO={WSSQ_INFO}
            />
          </Form>
        </div>
        {showDetailForm ? null : (
          <div className={st.footer} style={showLoading ? { filter: 'blur(2px)' } : null}>
            {saveBtnClicked ? (
              <div style={{ float: 'left' }}>
                {FormType == 'ToponymyPreApproval' ? (
                  <Button type="primary" onClick={this.onPrint_dmymm.bind(this)}>
                    打印地名预命名使用书
                  </Button>
                ) : null}
                &emsp;
                {FormType == 'ToponymyApproval' ||
                  FormType == 'ToponymyRename' ||
                  FormType == 'ToponymyReplace' ? (
                    <Button type="primary" onClick={this.onPrint_dmhzs.bind(this)}>
                      打印地名核准书
                  </Button>
                  ) : null}
              </div>
            ) : null}
            <div style={{ float: 'right' }}>
              {
                IDGroup && IDGroup.length > 0 ? (
                  <span>
                    <Button
                      onClick={e => this.nextRcd('before', IDGroup)}
                      type="primary"
                    // disabled={saveBtnClicked}
                    >
                      上一条
                  </Button>
                    &emsp;
                <Button
                      onClick={e => this.nextRcd('after', IDGroup)}
                      type="primary"
                    // disabled={saveBtnClicked}
                    >
                      下一条
                  </Button>
                  </span>
                ) : null
              }
              &emsp;
              {edit ? (
                <Button
                  onClick={this.onSaveClick.bind(this)}
                  type="primary"
                  disabled={saveBtnClicked}
                >
                  {FormType == 'ToponymyCancel' ? '注销' : '保存'}
                </Button>
              ) : null}
              &emsp;
              {FormType == 'ToponymyPreApproval' ||
                FormType == 'ToponymyApproval' ||
                WSSQ_INFO && WSSQ_INFO.blType && WSSQ_INFO.blType.length > 0 ? (
                  <span>
                    <Button
                      onClick={e => this.onSaveClick(e, 'Fail').bind(this)}
                      type="primary"
                      disabled={saveBtnClicked}
                    >
                      退件
                  </Button>
                    &emsp;
                </span>
                ) : null}
              <Button type="default" onClick={this.onCancel.bind(this)}>
                取消
              </Button>
            </div>
          </div>
        )}
        {/* 定位 */}
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
              let { Position } = this.state.entity;
              if (Position) {
                // 如果有值就显示在地图上
                Position = JSON.parse(Position);
                Position = Position.map(e => { return [e[1], e[0]]; });
                lm.mpLayer = L.polyline(Position, {
                  stroke: true,
                  color: 'green',
                  weight: 6,
                  opacity: 0.7,
                  fill: false,
                  clickable: true,
                }).addTo(lm.map);
                lm.map.fitBounds(lm.mpLayer.getBounds());
              }
            }}
            onMapClear={lm => {
              lm.mpLayer && lm.mpLayer.remove();
              lm.mpLayer = null;
              let { entity } = this.state;
              this.Position = null;
              entity.Position = null;
              // this.mObj.Position = entity.Position;
            }}
            beforeBtns={[
              {
                id: 'locate',
                name: '道路定位',
                icon: 'icon-dingwei',
                onClick: (dom, i, lm) => {
                  if (!lm.locatePen) {
                    lm.locatePen = new L.Draw.Polyline(lm.map, {
                      shapeOptions: {
                        stroke: true,
                        color: 'green',
                        weight: 6,
                        opacity: 0.7,
                        fill: false,
                        clickable: true,
                      },
                      icon: touchIcon,
                    });
                    lm.locatePen.on(L.Draw.Event.CREATED, e => {
                      lm.mpLayer && lm.mpLayer.remove();
                      var { layer } = e;
                      lm.mpLayer = layer;
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
                name: '保存道路定位',
                icon: 'icon-save',
                onClick: (dom, item, lm) => {
                  // let position = lm.mpLayer.getLatLngs();
                  let position = lm.mpLayer.toGeoJSON().geometry.coordinates;
                  let { entity } = this.state;

                  this.Position = position;
                  entity.Position = JSON.stringify(position);
                  // this.mObj.Position = entity.Position;

                  this.setState({
                    entity: entity,
                  });
                  this.closeLocateMap();
                },
              },
            ]}
            allowEdit={allowEdit}
          />
        </Modal>
        <Modal
          title="名称检查"
          visible={showNameCheckModal}
          onOk={() => {
            this.setState({ showNameCheckModal: false });
          }}
          onCancel={() => {
            this.setState({ showNameCheckModal: false });
          }}
        >
          {/* 过滤词 */}
          <div className={st.GlcDiv}>
            <span>
              <Icon type="exclamation-circle" style={{ color: 'red' }} />
              &emsp; 过滤词：
            </span>
            {GLC.length > 0 ? GLC.toString() : '无'}
          </div>
          {/* 重名 */}
          <Table
            className={st.nameCheckTb}
            title={() => (
              <span>
                <Icon type="exclamation-circle" style={{ color: 'red' }} />
                &emsp; 重名
              </span>
            )}
            columns={columns}
            dataSource={CM}
            size="small"
          />
          {/* 重音 */}
          <Table
            className={st.nameCheckTb}
            title={() => (
              <span>
                <Icon type="warning" style={{ color: 'orange' }} />
                &emsp; 重音
              </span>
            )}
            columns={columns}
            dataSource={CY}
            size="small"
          />
        </Modal>
      </div>
    );
  }
}

RoadForm = Form.create()(RoadForm);
export default withRouter(RoadForm);
