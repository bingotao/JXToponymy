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
} from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
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
} from '../../../common/enums.js';
import { GetNameRow } from './ComFormComponent.js';
const FormItem = Form.Item;
const { mp } = getDivIcons();
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

  showLoading() {
    this.setState({ showLoading: true });
  }

  hideLoading() {
    this.setState({ showLoading: false });
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
    this.showLoading();
    if (!id) {
      id = this.props.id;
    }
    // 获取地名数据
    if (id) {
      let { choseSzxzq, entity } = this.state;
      let { FormType } = this.props;
      let rt = await Post(url_SearchRoadDMByID, { id: id });
      rtHandle(rt, d => {
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
        d.PFTime = d.PFTime ? moment(d.PFTime) : null;
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

        if (FormType == 'ToponymyApproval') {
          d.Name = d.Name1;
          this.getPinyin(d.Name);
        }
        if (FormType == 'ToponymyRename') {
          d.CYM = d.Name;
          d.LSYG = this.setLsyg(d.Name, d.PFTime ? d.PFTime.format('YYYY年MM月DD日') : '');
        } else {
          d.History =
            d.History && d.History.indexOf('|') != -1 ? d.History.split('|').join('\n') : d.History;
        }
        if (FormType == 'ToponymyApproval' || FormType == 'ToponymyRename') {
          // 地名来历 无值时初始化
          if (d.DMLL == null) {
            d.DMLL = this.setDmll(
              d.SBDW,
              d.PFTime ? d.PFTime.format('YYYY年MM月DD日') : '',
              d.PZDW
            );
          }
        }

        if (FormType == 'ToponymyRename' || FormType == 'ToponymyReplace') {
          d.ApplicantTime = moment();
        }

        if (FormType == 'ToponymyCancel') {
          d.UsedTime = '历史地名';
          d.XMTime = moment();
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
    saveObj.SLR = entity.SLR;

    // 时间格式转换成YYYY-MM-DD HH:mm:ss.SSS给后台
    if (entity.SLRQ) {
      saveObj.SLRQ = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    }
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
      saveObj.PFTime = moment(entity.PFTime, 'YYYY年MM月').format('YYYY-MM-DD HH:mm:ss.SSS');
    }

    if (entity.UsedTime) {
      saveObj.UsedTime = entity.UsedTime;
    }
    if (FormType == 'ToponymyApproval' || FormType == 'ToponymyRename') {
      if (entity.DMLL) {
        saveObj.DMLL = entity.DMLL;
      }
    }
    if (FormType == 'ToponymyApproval') {
      if (entity.ZLLY) {
        saveObj.ZLLY = entity.ZLLY;
      }
    }

    if (FormType == 'ToponymyApproval') {
      if (entity.Name) {
        saveObj.Name = entity.Name;
      }
    }
    if (FormType == 'ToponymyRename') {
      if (entity.CYM) {
        saveObj.UsedName = entity.CYM;
      }
      if (entity.LSYG) {
        saveObj.History =
          entity.LSYG.indexOf('\n') != -1 ? entity.LSYG.split('\n').join('|') : entity.LSYG;
        if (entity.History) {
          saveObj.History = entity.History + '|' + saveObj.History;
        }
      }
    }

    // 受理人、受理日期
    if (FormType == 'ToponymyAccept') {
      saveObj.SLUser = entity.SLR;
      saveObj.SLTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else if (FormType == 'ToponymyPreApproval') {
      saveObj.SHUser = entity.SLR;
      saveObj.SHTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else if (FormType == 'ToponymyApproval') {
      saveObj.SPUser = entity.SLR;
      saveObj.SPTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else if (FormType == 'ToponymyRename') {
      saveObj.GMUser = entity.SLR;
      saveObj.GMTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else if (FormType == 'ToponymyCancel') {
      saveObj.XMUser = entity.SLR;
      saveObj.XMTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else if (FormType == 'ToponymyReplace') {
      saveObj.HBUser = entity.SLR;
      saveObj.HBTime = entity.SLRQ.format('YYYY-MM-DD HH:mm:ss.SSS');
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
      if (!validateObj.SBDW) {
        errs.push('请输入申报单位');
      }
      if (FormType === 'ToponymyAccept') {
        // 拟用名称1
        if (!validateObj.Name1) {
          errs.push('请输入拟用名称1');
        }
      }
      if (FormType != 'ToponymyAccept' && FormType != 'ToponymyPreApproval') {
        // 批复时间
        if (!validateObj.PFTime) {
          errs.push('请选择批复时间');
        }
      }
    }

    if (FormType != 'ToponymyCancel') {
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

              let { saveObj } = this.validate(errors);

              if (this.props.FormType == 'ToponymyPreApproval') {
                this.save(saveObj, 'ymm', pass == 'Fail' ? 'Fail' : 'Pass', '');
              }
              if (this.props.FormType == 'ToponymyApproval') {
                this.save(saveObj, 'zjmm', pass == 'Fail' ? 'Fail' : 'Pass', '');
              }
            }.bind(this)
          );
          this.backToSearch();
        },
      });
    } else {
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
            if (this.props.FormType == 'ToponymyAccept') {
              this.save(saveObj, 'sl', 'Pass', '');
            }
            if (this.props.FormType == 'ToponymyPreApproval') {
              this.save(saveObj, 'ymm', pass == 'Fail' ? 'Fail' : 'Pass', '');
            }
            if (this.props.FormType == 'ToponymyApproval') {
              this.save(saveObj, 'zjmm', pass == 'Fail' ? 'Fail' : 'Pass', '');
            }
            if (this.props.FormType == 'ToponymyRename') {
              this.save(saveObj, 'gm', 'Pass', '');
            }
            if (this.props.FormType == 'ToponymyReplace') {
              this.save(saveObj, 'hb', 'Pass', '');
            }
            if (this.props.FormType == 'ToponymyCancel') {
              this.delete(saveObj, this.mObj.XMWH ? this.mObj.XMWH : '');
            }
            if (this.props.FormType == 'ToponymyBatchDelete') {
              this.batchDelete(this.props.ids, saveObj, '');
            }
          }
        }.bind(this)
      );
    }
  };
  async save(obj, item, pass, opinion) {
    await Post(
      url_ModifyRoadDM,
      { oldDataJson: JSON.stringify(obj), item: item, pass: pass, opinion: opinion },
      e => {
        notification.success({ description: '保存成功！', message: '成功' });
        this.mObj = {};
        if (this.props.onSaveSuccess) {
          this.props.onSaveSuccess();
        }
        this.setState({ saveBtnClicked: true });
        if (this.props.FormType == 'ToponymyApproval') {
          this.props.clickSaveBtn();
        }
        this.getFormData(this.state.entity.ID);
      }
    );
  }
  // 地名销名-单个
  async delete(obj, XMWH) {
    await Post(url_DeleteRoadDM, { ID: obj.ID, XMWH: XMWH }, e => {
      notification.success({ description: '注销成功！', message: '成功' });
      this.mObj = {};
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
      this.backToSearch();
    });
  }
  // 批量删除
  async batchDelete(ids, obj, item) {
    await Post(
      url_CancelResidenceMPByList,
      { ID: ids, oldDataJson: JSON.stringify(obj), item: item },
      e => {
        notification.success({ description: '批量注销成功！', message: '成功' });

        this.props.onCancel();
      }
    );
  }
  // 取消
  onCancel() {
    if (this.state.saveBtnClicked) {
      Modal.confirm({
        title: '提醒',
        content: '是否放弃所做的修改？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          this.backToSearch();
        },
        onCancel() {},
      });
    } else {
      if (this.removeFileInfo) {
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
        Pinyin: py,
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
  }
  // 是否置灰
  isDisabeld(name) {
    const { FormType, showDetailForm } = this.props;
    let { saveBtnClicked, choseSzxzq } = this.state;
    // form中有个别项目需要置灰
    var hasItemDisabled =
      FormType == 'ToponymyReplace' || FormType == 'ToponymyCancel' || FormType == 'ToponymyRename'
        ? true
        : false;
    // 不置灰字段group
    var dontDisabledGroup = this.getDontDisabledGroup();

    if (saveBtnClicked == true || showDetailForm == true) {
      return true;
    } else {
      if (hasItemDisabled == true) {
        if (dontDisabledGroup[name] == undefined) {
          return true;
        } else {
          return false;
        }
      } else {
        // 大部分不置灰，仅'所跨行政区'等需要置灰
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

  // 标准名称或批复时间修改，历史沿革字段发生变化
  setLsyg(bzmc, pfsj) {
    return '原为' + (bzmc ? bzmc : '') + '，' + (pfsj ? pfsj : '') + '更名。';
  }
  // '地名来历'生成规则：'申报单位'申报，'批复时间'（年月）'批准单位'命名
  setDmll(sbdw, pfsj, pzdw) {
    var dmll = (sbdw ? sbdw : '') + '申报，' + (pfsj ? pfsj : '') + (pzdw ? pzdw : '') + '命名';
    return dmll;
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    const { FormType, showDetailForm } = this.props;
    let {
      showLoading,
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
    const { edit } = this;
    var btnDisabled =
      FormType == 'ToponymyReplace' || FormType == 'ToponymyCancel' || showDetailForm
        ? true
        : false; // form中需要有项目置灰
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
                                  entity.PFTime,
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
                          })(<Input placeholder="地名代码" disabled={true} />)}
                        </FormItem>
                      </Col>
                    )}
                  </Row>
                  {/* 名称检查 */}
                  {GetNameRow(FormType, entity, this, getFieldDecorator, saveBtnClicked)}

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
                      <Col span={8}>
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
                                    entity.PFTime,
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
                      <Col span={8}>
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
                                  this.props.form.setFieldsValue({
                                    LSYG: this.setLsyg(entity.Name, dateString),
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
                              disabled={this.isDisabeld('PFTime')}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={8}>
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
                                  ZLLY: this.mObj.PFWH,
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
                              }}
                              placeholder="销名文号"
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  ) : null}

                  {FormType == 'ToponymyAccept' || FormType == 'ToponymyPreApproval' ? null : (
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
                            {/* 跨行政区时，隐藏这段话 */}
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
                                ，
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
                  </Row>
                  {FormType == 'ToponymyAccept' || FormType == 'ToponymyPreApproval' ? null : (
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
                  {FormType == 'ToponymyRename' ? (
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
                  FormType == 'ToponymyCancel' ||
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

            {/* 申办信息-需要-读取之前提交的信息 */}
            {FormType == 'ToponymyAccept' ||
            FormType == 'ToponymyPreApproval' ||
            FormType == 'ToponymyApproval' ? (
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
                </div>
              </div>
            ) : null}

            {/* 申办信息-不需要-读取之前提交的信息 */}
            {FormType == 'ToponymyRename' || FormType == 'ToponymyReplace' ? (
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
                        {getFieldDecorator('Applicant', {})(
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
                        {getFieldDecorator('ApplicantPhone', {})(
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
                        {getFieldDecorator('ApplicantAddress', {})(
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
                        {getFieldDecorator('ApplicantNumber', {})(
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

            {/* 附件 */}
            {saveBtnClicked ? null : (
              <AttachForm
                FormType={FormType}
                entity={entity}
                FileType="DM_Road"
                saveBtnClicked={saveBtnClicked}
                setDeleteFilesInfo={e => (this.removeFileInfo = e)}
              />
            )}
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
                {FormType == 'ToponymyApproval' || FormType == 'ToponymyRename' ? (
                  <Button type="primary" onClick={this.onPrint_dmhzs.bind(this)}>
                    打印地名核准书
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div style={{ float: 'right' }}>
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
              {FormType == 'ToponymyPreApproval' || FormType == 'ToponymyApproval' ? (
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
              {FormType == 'ToponymyPreApproval' && saveBtnClicked ? (
                <span>
                  &emsp;
                  <Button type="primary">打印地名预命名使用书</Button>
                </span>
              ) : null}
              {(FormType == 'ToponymyApproval' ||
                FormType == 'ToponymyReplace' ||
                FormType == 'ToponymyRename') &&
              saveBtnClicked ? (
                <span>
                  &emsp;
                  <Button type="primary">打印地名核准书</Button>
                </span>
              ) : null}
            </div>
          </div>
        )}
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
