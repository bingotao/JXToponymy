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

let loginUrl = 'http://localhost:16530/login/login';
let selfSystemUrl = 'http://10.22.112.200:16530/login/SelfSystem';

export {
  mpgg,
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
  selfSystemUrl,
};
