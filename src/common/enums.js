// 门牌类型
let mpdsh = [
  { id: 1, name: '单号', value: 1 },
  { id: 2, name: '双号', value: 2 },
];

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

//门牌事项类型
let mpsqType = {
  NCFH: '农村分户',
  DPFG: '店铺分割',

  GRSQ: '个人申请门（楼）牌号码及门牌证',
  DWSQ: '单位申请门（楼）牌号码及门牌证',

  GRBG: '个人申请变更门牌证',
  DWBG: '单位申请变更门牌证',

  GRHB: '个人申请换（补）发门牌证',
  DWHB: '单位申请换（补）门牌证',

  GRZX: '个人申请注销门（楼）牌号码及门牌证',
  DWZX: '单位申请注销门（楼）牌号码及门牌证',
};
// //个人申请事项分类
// let mpgrsqType = { ncfh: '农村分户', dpfg: '店铺分割' };

// 门牌操作类型
let doorplateType = ['DoorplateAdd', 'DoorplateChange', 'DoorplateDelete', 'DoorplateReplace'];
// 门牌 FormType
let mpFormType = {
  门牌编制: 'DoorplateAdd',
  个人中心门牌: 'GrzxYwydMp',
  门牌变更: 'DoorplateChange',
  门牌换补: 'DoorplateReplace',
  门牌注销: 'DoorplateDelete',
  门牌维护: 'DoorplateManage',
  门牌证明: 'DoorplateProve',
  门牌详情: 'MPXQ',
  门牌编辑: 'DoorplateEdit',
};
// 门牌 route id
let mpRouteId = {
  门牌查询: 'pm.dpt.qr',
  门牌维护: 'pm.dpt.mdf',
  门牌编制: 'pm.dpt.add',
  门牌变更: 'pm.dpt.alt',
  门牌换补: 'pm.dpt.rep',
  门牌注销: 'pm.dpt.del',
  地名证明: 'pm.dpt.tpp',
  门牌制作: 'pm.dpt.mk',
  业务统计: 'pm.dpt.st',
  门牌编辑: 'pm.dpt.edit',
};
// 操作对象类型
let objectType = ['Residence', 'Country', 'Road'];

//门牌变更 不置灰项目
let MpbgDisabled = {
  PropertyOwner: false,
  IDType: false,
  IDNumber: false,
  BDCZAddress: false,
  BDCZNumber: false,
  Applicant: false,
  ApplicantPhone: false,
  ApplicantAddress: false,
  ApplicantType: false,
  ApplicantNumber: false,
  MPProduce: false,
  MPMail: false,
  MailAddress: false,
  BZTime: false,
  OriginalMPAddress: false,
  OtherAddress: false,
  Remarks: false,
  CommunityName: false,
  FCZAddress: false,
  FCZNumber: false,
  TDZNumber: false,
  TDZAddress: false,
  HJAddress: false,
  HJNumber: false,
};
//门牌证明 置灰项目
let MpzmDisabled = {
  StandardAddress: false,
};
//门牌换补 不置灰项目
let MphbDisabled = {
  Applicant: false,
  ApplicantPhone: false,
  ApplicantAddress: false,
  ApplicantType: false,
  ApplicantNumber: false,
  MPProduce: false,
  MPMail: false,
  MailAddress: false,
  BZTime: false,
};
//门牌注销 不置灰项目
let MpzxDisabled = {
  Applicant: false,
  ApplicantPhone: false,
  ApplicantAddress: false,
  ApplicantType: false,
  ApplicantNumber: false,
  MPProduce: false,
  MPMail: false,
  MailAddress: false,
  BZTime: false,
};
//门牌详情 不置灰项目
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
// 地名事项
let dmsx = {
  10: '住宅小区（楼）、建筑物预命名',
  11: '住宅小区（楼）、建筑物命名',
  12: '新建道路（含街、巷、桥梁、隧道、轨道交通线路）命名',
  13: '住宅小区（楼）、建筑物更名',
  14: '申请换（补）发地名核准书',
};
//地名事项类型
let dmsxType = {
  SL: '地名受理',
  YMM: '地名预命名',
  ZJMM: '住建命名',
  DLMM: '道路命名',
  // GRSQ: '地名命名',
  GM: '地名更名',
  HB: '地名换补',
  // GRSQ: '地名销名',
  // GRSQ: '地名证明',
  // GRSQ: '地名详情',
  // GRSQ: '地名编辑',

};
// 地名 FormType
let dmFormType = {
  地名受理: 'ToponymyAccept',
  地名预命名: 'ToponymyPreApproval',
  地名命名: 'ToponymyApproval',
  地名更名: 'ToponymyRename',
  地名换补: 'ToponymyReplace',
  地名销名: 'ToponymyCancel',
  地名证明: 'DMZM',
  地名详情: 'DMXQ',
  地名编辑: 'ToponymyEdit',
  个人中心地名: 'GrzxYwydDm',
};
// 地名 route id
let dmRouteId = {
  地名查询: 'pm.tpm.se',
  地名受理: 'pm.tpm.ac',
  地名预命名: 'pm.tpm.pa',
  地名命名: 'pm.tpm.ap',
  地名更名: 'pm.tpm.re',
  地名换补: 'pm.tpm.rp',
  地名销名: 'pm.tpm.ce',
  地名编辑: 'pm.tpm.edit',
  地名打印: 'pm.tpm.pr',
};

//地名详情 不置灰项目
let DmxqDisabled = {};

//地名换补 不置灰项目
let DmhbDisabled = {
  Applicant: false,
  ApplicantPhone: false,
  ApplicantAddress: false,
  ApplicantType: false,
  ApplicantNumber: false,
  ApplicantTime: false,
};

//地名更名 不置灰项目
let DmgmDisabled = {
  SBDW: false,
  SHXYDM: false,
  Name: false,
  Pinyin: false,
  TMRomanSpell: false,
  East: false,
  West: false,
  South: false,
  North: false,
  RJL: false,
  LHL: false,
  LZNum: false,
  HSNum: false,
  ZDArea: false,
  JZArea: false,
  DMLL: false,
  DMHY: false,
  ZLLY: false,
  LSYG: false,

  PZDW: false,
  PFTime: false,
  PFWH: false,
  DLSTGK: false,

  Applicant: false,
  ApplicantPhone: false,
  ApplicantAddress: false,
  ApplicantType: false,
  ApplicantNumber: false,
  ApplicantTime: false,
};

//地名编辑 置灰项目
let DmbjDisabled = {};
//地名命名 置灰项目
let DmmmDisabled = {
  DMCode: true,
  LSYG: true,
};

//地名销名 不置灰项目
let DmxmDisabled = {
  UsedTime: false,
  XMTime: false,
  XMWH: false,
};

/* 个人中心-待办事项 */
// 提交方式
let Tjfs = ['现场申请', '网上申请', '掌上申请', '其他申请'];
// 申请方式
let Sqfs = ['个人申请', '单位申请'];
// 事项类型
let Sxlx = ['门牌管理', '地名证明', '地名管理'];
// 办事事项-门牌管理
let Bssx_mpgl = [
  '申请门（楼）牌号码及门牌证',
  '申请变更门牌证',
  '申请换（补）发门牌证',
  '注销门（楼）牌号码及门牌证',
];
// 办事事项-地名证明
let Bssx_dmzm = ['门牌查询'];
// 办事事项-地名管理
let Bssx_dmgl = [
  '住宅小区（楼）、建筑物预命名',
  '住宅小区（楼）命名',
  '新建道路（含街、巷、桥梁、隧道、轨道交通线路）命名',
  '住宅小区（楼）更名',
  '申请换（补）发地名核准书',
];
let blType = [
  'WSSQ_MP_NEW', //网上申请-门牌-新数据
  'WSSQ_MP_OLD', //网上申请-门牌-老数据
  'WSSQ_DM_NEW', //网上申请-地名-新数据
  'WSSQ_DM_OLD', //网上申请-地名-老数据
];

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
  MphbDisabled,
  MpzxDisabled,
  MpxqDisabled,
  MpzmDisabled,
  mpRouteId,
  mpsqType,
  dmsxType,
  // mpgrsqType,
  //selfSystemUrl,
  // doorplateType,
  // objectType,

  spztSelect,
  spzt,
  dmsx,
  DmxqDisabled,
  DmhbDisabled,
  DmxmDisabled,
  DmgmDisabled,
  DmbjDisabled,
  DmmmDisabled,
  dmRouteId,
  Tjfs,
  Sqfs,
  Sxlx,
  Bssx_mpgl,
  Bssx_dmzm,
  Bssx_dmgl,
  mpFormType,
  dmFormType,
};
