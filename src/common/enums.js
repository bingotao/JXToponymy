// 门牌类型
let mpdsh = [{ id: 1, name: '单号', value: 1 }, { id: 2, name: '双号', value: 2 }];

// 证件类型
let zjlx = ['居民身份证', '统一社会信用代码证'];
// 办理类型
let bllx = ['门牌证打印', '地名证明开具'];
// 数据类型
let sjlx = [
  {
    id: 1,
    name: '正式数据',
    value: 1,
  },
  // {
  //   id: 0,
  //   name: '已删除',
  //   value: 0,
  // },
  {
    id: 2,
    name: '已注销',
    value: 2,
  },
];

let whfs = ['维修', '更换', '拆回'];
let windows = ['地名办公室', '审批窗口', '便民窗口'];
let bxfs = ['数字城管', '街道上报', '市民上报', '110应急联动', '巡查上报'];
let sbly = [
  { id: '一窗受理', name: '一窗受理' },
  { id: '网上申报', name: '网上申报' },
  { id: '浙里办', name: '浙里办' },
];
let qlsx = [
  { id: '门牌编制', name: '门牌编制' },
  { id: '地名证明', name: '地名证明' },
  { id: '地名核准', name: '地名核准' },
  { id: '出具意见', name: '出具意见' },
];

let baseUrl = 'http://localhost:16530';
let qlsxUrls = {
  核发门牌证_编制_道路类: `${baseUrl}/MP/MPSBOfRoad`,
  核发门牌证_编制_住宅类: `${baseUrl}/MP/MPSBOfResidence`,
  核发门牌证_编制_农村类: `${baseUrl}/MP/MPSBOfCountry`,

  核发门牌证_变更_道路类: `${baseUrl}/MP/MPBGOfRoad`,
  核发门牌证_变更_住宅类: `${baseUrl}/MP/MPBGOfResidence`,
  核发门牌证_变更_农村类: `${baseUrl}/MP/MPBGOfCountry`,

  地名证明_道路类: `${baseUrl}/DMZM/DMZMOfRoad`,
  地名证明_住宅类: `${baseUrl}/DMZM/DMZMOfResidence`,
  地名证明_农村类: `${baseUrl}/DMZM/DMZMOfCountry`,

  地名核准_居名点类: `${baseUrl}/DM/DMSBOfSettlement`,
  地名核准_道路街巷类: `${baseUrl}/DM/DMSBOfRoad`,
  地名核准_建筑物类: `${baseUrl}/DM/DMSBOfBuilding`,
  地名核准_桥梁类: `${baseUrl}/DM/DMSBOfBridge`,

  出具意见_专业设施地名: `${baseUrl}/DM/DMBAOfZYSS`,
};

let getQLSXUrl = type => {
  return qlsxUrls[type];
};

let loginUrl = '';
let selfSystemUrl = 'http://10.22.233.49/JXTopsystemSB/login/SelfSystem';

// //门牌事项类型
// let mpsqType = {
//   grsq: '个人申请门（楼）牌号码及门牌证',
//   dwsq: '单位申请门（楼）牌号码及门牌证',

//   grbg: '个人申请变更门牌证',
//   dwbg: '单位申请变更门牌证',

//   grhb: '个人申请换（补）发门牌证',
//   dwhb: '单位申请换（补）门牌证',

//   grzx: '个人申请注销门（楼）牌号码及门牌证',
//   dwzx: '单位申请注销门（楼）牌号码及门牌证',

// };
// //个人申请事项分类
// let mpgrsqType = { ncfh: '农村分户', dpfg: '店铺分割' };

// 门牌操作类型
let doorplateType = ['DoorplateAdd', 'DoorplateChange', 'DoorplateDelete', 'DoorplateReplace'];
// 操作对象类型
let objectType = ['Residence', 'Country', 'Road'];

//门牌变更不置灰项目
let MpbgDisabled = {
  PropertyOwner: false,
  IDType: false,
  IDNumber: false,
  BDCZAddress: false,
  BDCZNumber: false,
  Applicant: false,
  ApplicantPhone: false,
  BZTime: false,
};
//门牌注销不置灰项目
let MpzxDisabled = {
  Applicant: false,
  ApplicantPhone: false,
  BZTime: false,
};
//门牌详情不置灰项目
let MpxqDisabled = {};

/** 地名管理 */
// 审批状态（已命名/待审批）
let spztSelect = [
  { id: 0, name: '全部', value: 0 },
  { id: 1, name: '待审批', value: 1 },
  { id: 2, name: '已审核', value: 2 },
  { id: 3, name: '已审批', value: 3 },
  { id: 4, name: '已退件', value: 4 },
  { id: 5, name: '已注销', value: 5 },
];
let spzt = ['全部', '待审批', '已审核', '已审批', '已退件', '已注销'];

export {
  mpdsh,
  zjlx,
  bllx,
  sjlx,
  whfs,
  windows,
  bxfs,
  sbly,
  qlsx,
  qlsxUrls,
  getQLSXUrl,
  loginUrl,
  MpbgDisabled,
  MpzxDisabled,
  MpxqDisabled,
  // mpsqType,
  // mpgrsqType,
  //selfSystemUrl,
  // doorplateType,
  // objectType,

  spztSelect,
  spzt,
};
