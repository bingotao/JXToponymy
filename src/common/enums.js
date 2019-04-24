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
  { id: '在线申报', name: '在线申报' },
  { id: '浙里办', name: '浙里办' },
];
let qlsx = [
  { id: '核发门牌证', name: '核发门牌证' },
  { id: '地名证明', name: '地名证明' },
  { id: '地名核准', name: '地名核准' },
  { id: '出具意见', name: '出具意见' },
];
export { mpgg, mpdsh, zjlx, bllx, sjlx, whfs, windows, bxfs, sbly, qlsx };
