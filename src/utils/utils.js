import moment from 'moment';
import { parse, stringify } from 'qs';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

function accMul(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  m += s1.split('.').length > 1 ? s1.split('.')[1].length : 0;
  m += s2.split('.').length > 1 ? s2.split('.')[1].length : 0;
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / 10 ** m;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟', '万']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(accMul(num, 10 * 10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function getDistricts(data) {
  let getSub = p => {
    let obj = {
      label: p.Name,
      value: p.ID,
    };
    if (p.SubDistrict) {
      obj.children = p.SubDistrict.map(getSub);
    }
    return obj;
  };

  return data.length ? data[0].SubDistrict.map(getSub) : [];
}

export function getDistrictsWithJX(data) {
  let getSub = p => {
    let obj = {
      label: p.Name,
      value: p.ID,
    };
    if (p.SubDistrict) {
      obj.children = p.SubDistrict.map(getSub);
    }
    return obj;
  };

  return data.length ? [getSub(data[0])] : [];
}
export function getDistrictsTreeWithJX(data) {
  let getSub = p => {
    let obj = {
      title: p.Name,
      key: p.ID,
    };
    if (p.SubDistrict) {
      obj.children = p.SubDistrict.map(getSub);
    }
    return obj;
  };

  return data.length ? [getSub(data[0])] : [];
}

export function getDistricts2(data) {
  let getSub = p => {
    let obj = {
      label: p.Name,
      value: p.ID,
    };
    if (p.SubDistrict && p.ID.split('.').length < 3) {
      obj.children = p.SubDistrict.map(getSub);
    }
    return obj;
  };

  return data.map(getSub);
}

export function convertNeighborhoodsIDToCascaderValue(NeighborhoodsID) {
  let dist = NeighborhoodsID.split('.');
  let value = null;
  if (dist.length == 1) value = [NeighborhoodsID];
  else if (dist.length == 2) value = [dist[0], NeighborhoodsID];
  else if (dist.length == 3) value = [dist[0], dist[0] + '.' + dist[1], NeighborhoodsID];
  return value;
}

export function findStrIndex(str, cha, num) {
  var x = str.indexOf(cha);
  for (var i = 0; i < num; i++) {
    x = str.indexOf(cha, x + 1);
  }
  return x;
}
export function ConverStrToAyyary(str, cha) {
  let distValue = [];
  let distArray = str.split(cha);
  for (let i = 0; i < distArray.length - 1; i++) {
    distValue.push(
      str
        .substr(0, findStrIndex(str, cha, i))
        .split(cha)
        .join('.')
    );
  }
  distValue.push(str.split(cha).join('.'));
  return distValue;
}

export function getStandardAddress(entity, type) {
  if (entity && type) {
    let ept = '',
      obj = entity;
    switch (type) {
      // 格式：嘉兴市/市辖区/镇街道/小区名称/门牌号/宿舍名/幢号/单元号/房室号
      case 'ResidenceMP':
        return `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName || ept}${obj.ResidenceName ||
          ept}${obj.MPNumber ? obj.MPNumber + '号' : ept}${
          obj.LZNumber ? obj.LZNumber + '幢' : ept
        }${obj.DYNumber ? obj.DYNumber + '单元' : ept}${obj.HSNumber ? obj.HSNumber + '室' : ept}`;
      // 格式：嘉兴市/市辖区/镇街道/道路名称/门牌号码
      case 'RoadMP':
        return `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName || ept}${obj.RoadName ||
          ept}${obj.MPNumber ? obj.MPNumber + '号' : ept}`;
      // 格式：嘉兴市/市辖区/镇街道/村社区/自然村名称/门牌号码/户室号
      case 'CountryMP':
        return `嘉兴市${obj.CountyName || ept}${obj.NeighborhoodsName || ept}${obj.CommunityName ||
          ept}${obj.ViligeName || ept}${obj.MPNumber ? obj.MPNumber + '号' : ept}${
          obj.HSNumber ? obj.HSNumber + '室' : ept
        }`;
      default:
        return null;
    }
  }
  return null;
}

export function getCommunityStandardAddress(entity, type) {
  if (entity && type) {
    let ept = '',
      obj = entity;
    switch (type) {
      case 'ResidenceMP':
        return `${obj.ResidenceName || ept}${obj.LZNumber ? obj.LZNumber + '幢' : ept}${
          obj.DYNumber ? obj.DYNumber + '单元' : ept
        }${obj.HSNumber ? obj.HSNumber + '室' : ept}`;
      case 'CountryMP':
        return `${obj.CommunityName || ept}${obj.ViligeName || ept}${
          obj.MPNumber ? obj.MPNumber + '号' : ept
        }${obj.HSNumber ? obj.HSNumber + '室' : ept}`;
      default:
        return null;
    }
  }
  return null;
}
