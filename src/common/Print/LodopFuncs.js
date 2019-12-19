import React, { Component } from 'react';
import { Modal } from 'antd';
import { error } from '../../utils/notification';
import { SubmitMPZPrint, GetMPZPrint_cj } from '../../services/MP';
import {
  GetDMHZPrint_cj,
  GetDMYMMPrint_cj,
  SubmitDMHZPrint,
  SubmitDMYMMPrint,
} from '../../services/DM';
import { message } from 'antd';

// 单例模式，不存在时只新建一次
var CreatedOKLodop7766 = null;

var paths = {
  Lodop32Exe: `${window._g.assetsUrl}/install_lodop32.exe`,
  Lodop64Exe: `${window._g.assetsUrl}/install_lodop64.exe`,
  CLodopExe: `${window._g.assetsUrl}/CLodop_Setup_for_Win32NT.exe`,
  mpzbg: `${window._g.assetsUrl}/mpzbg.jpg`,
  dmhzsbg: `${window._g.assetsUrl}/dmhzsbg.jpg`,
};

//====判断是否需要安装CLodop云打印服务器:====
export function needCLodop() {
  try {
    var ua = navigator.userAgent;
    if (ua.match(/Windows\sPhone/i) != null) return true;
    if (ua.match(/iPhone|iPod/i) != null) return true;
    if (ua.match(/Android/i) != null) return true;
    if (ua.match(/Edge\D?\d+/i) != null) return true;

    var verTrident = ua.match(/Trident\D?\d+/i);
    var verIE = ua.match(/MSIE\D?\d+/i);
    var verOPR = ua.match(/OPR\D?\d+/i);
    var verFF = ua.match(/Firefox\D?\d+/i);
    var x64 = ua.match(/x64/i);
    if (verTrident == null && verIE == null && x64 !== null) return true;
    else if (verFF !== null) {
      verFF = verFF[0].match(/\d+/);
      if (verFF[0] >= 42 || x64 !== null) return true;
    } else if (verOPR !== null) {
      verOPR = verOPR[0].match(/\d+/);
      if (verOPR[0] >= 32) return true;
    } else if (verTrident == null && verIE == null) {
      var verChrome = ua.match(/Chrome\D?\d+/i);
      if (verChrome !== null) {
        verChrome = verChrome[0].match(/\d+/);
        if (verChrome[0] >= 42) return true;
      }
    }
    return false;
  } catch (err) {
    return true;
  }
}

//====页面引用CLodop云打印必须的JS文件：====
if (needCLodop()) {
  var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  var oscript = document.createElement('script');
  oscript.src = 'http://localhost:8000/CLodopfuncs.js?priority=1';
  head.insertBefore(oscript, head.firstChild);

  //引用双端口(8000和18000）避免其中某个被占用：
  oscript = document.createElement('script');
  oscript.src = 'http://localhost:18000/CLodopfuncs.js?priority=0';
  head.insertBefore(oscript, head.firstChild);
}

//====获取LODOP对象的主过程：====
export function getLodop(oOBJECT, oEMBED, sf, ef) {
  ef =
    ef ||
    function(msg) {
      alert(msg);
    };
  var strHtmInstall = (
    <font color="red">
      打印控件未安装！点击这里
      <a href={paths.Lodop32Exe} target="_blank">
        执行安装
      </a>
      ，安装后请刷新页面或重新进入。
    </font>
  );
  var strHtmUpdate = (
    <font color="red">
      打印控件需要升级！点击这里
      <a href={paths.Lodop32Exe} target="_blank">
        执行升级
      </a>
      ，升级后请重新进入。
    </font>
  );
  var strHtm64_Install = (
    <font color="red">
      打印控件未安装！点击这里
      <a href={paths.Lodop64Exe} target="_blank">
        执行安装
      </a>
      ，安装后请刷新页面或重新进入。
    </font>
  );
  var strHtm64_Update = (
    <font color="red">
      打印控件需要升级!点击这里
      <a href={paths.Lodop64Exe} target="_blank">
        执行升级
      </a>
      ，升级后请重新进入。
    </font>
  );
  var strHtmFireFox = (
    <font color="red">
      （注意：如曾安装过Lodop旧版附件npActiveXPLugin，请在【工具】->【附加组件】->【扩展】中先卸它）
    </font>
  );
  var strHtmChrome = (
    <font color="red">(如果此前正常，仅因浏览器升级或重安装而出问题，需重新执行以上安装）</font>
  );
  var strCLodopInstall = (
    <font color="red">
      CLodop云打印服务(localhost本地)未安装启动!点击这里
      <a href={paths.CLodopExe} target="_blank">
        执行安装
      </a>
      ，安装后请刷新页面。
    </font>
  );
  var strCLodopUpdate = (
    <font color="red">
      CLodop云打印服务需升级！点击这里
      <a href={paths.CLodopExe} target="_blank">
        执行升级
      </a>
      ，升级后请刷新页面。
    </font>
  );
  var LODOP;
  try {
    var isIE =
      navigator.userAgent.indexOf('MSIE') >= 0 || navigator.userAgent.indexOf('Trident') >= 0;
    if (needCLodop()) {
      try {
        LODOP = getCLodop();
      } catch (err) {}
      if (!LODOP && document.readyState !== 'complete') {
        alert('C-Lodop没准备好，请稍后再试！');
        return;
      }
      if (!LODOP) {
        ef(strCLodopInstall);
        return;
      } else {
        if (CLODOP.CVERSION < '3.0.0.2') {
          ef(strCLodopUpdate);
        }
        if (oEMBED && oEMBED.parentNode) oEMBED.parentNode.removeChild(oEMBED);
        if (oOBJECT && oOBJECT.parentNode) oOBJECT.parentNode.removeChild(oOBJECT);
      }
    } else {
      var is64IE = isIE && navigator.userAgent.indexOf('x64') >= 0;
      //=====如果页面有Lodop就直接使用，没有则新建:==========
      if (oOBJECT != undefined || oEMBED != undefined) {
        if (isIE) LODOP = oOBJECT;
        else LODOP = oEMBED;
      } else if (CreatedOKLodop7766 == null) {
        LODOP = document.createElement('object');
        LODOP.setAttribute('width', 0);
        LODOP.setAttribute('height', 0);
        LODOP.setAttribute('style', 'position:absolute;left:0px;top:-100px;width:0px;height:0px;');
        if (isIE) LODOP.setAttribute('classid', 'clsid:2105C259-1E0C-4534-8141-A753534CB4CA');
        else LODOP.setAttribute('type', 'application/x-print-lodop');
        document.documentElement.appendChild(LODOP);
        CreatedOKLodop7766 = LODOP;
      } else {
        LODOP = CreatedOKLodop7766;
      }
      //=====Lodop插件未安装时提示下载地址:==========
      if (LODOP == null || typeof LODOP.VERSION == 'undefined') {
        if (navigator.userAgent.indexOf('Chrome') >= 0) {
          ef(strHtmChrome);
        }
        if (navigator.userAgent.indexOf('Firefox') >= 0) {
          ef(strHtmFireFox);
        }
        if (is64IE) {
          ef(strHtm64_Install);
        } else {
          ef(strHtmInstall);
        }
        sf && sf(LODOP);
      }
    }
    if (LODOP.VERSION < '6.0') {
      if (!needCLodop()) {
        if (is64IE) {
          ef(strHtm64_Update);
        } else {
          ef(strHtmUpdate);
        }
      }
      sf && sf(LODOP);
    }
    //===如下空白位置适合调用统一功能(如注册语句、语言选择等):===
    //LODOP.SET_LICENSES("北京XXXXX公司","8xxxxxxxxxxxxx5","","");

    //===========================================================
    sf && sf(LODOP);
  } catch (err) {
    console.log(err);
    alert('getLodop出错:' + err);
  }
}

export function printMPZ(mpzs, LODOP, callback) {
  if (!mpzs || mpzs.length == 0) {
    error('没有要打印的数据！');
    return;
  }
  LODOP = LODOP || CreatedOKLodop7766;
  let xo = -0.5;
  let yo = -0.3;
  for (let mpz of mpzs) {
    mpz.PrintType = '门牌证';
    let {
      AddressCoding,
      PropertyOwner,
      County,
      Neighborhoods,
      Road,
      MPNumber,
      CommunityStandardAddress,
      OriginalAddress,
      Year,
      Month,
      Date,
    } = mpz;

    LODOP.NEWPAGE();
    LODOP.SET_PRINT_STYLE('FontName', '仿宋');
    LODOP.SET_PRINT_STYLE('FontSize', 12);
    LODOP.SET_PRINT_STYLE('Bold', 1);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(1.2 + yo + 'cm', 8.0 + xo + 'cm', '4.5cm', '1.0cm', AddressCoding);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(2.7 + yo + 'cm', 3.0 + xo + 'cm', '9.0cm', '1.0cm', PropertyOwner);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(4.3 + yo + 'cm', 1.3 + xo + 'cm', '2.0cm', '1.0cm', County);
    LODOP.ADD_PRINT_TEXT(4.3 + yo + 'cm', 6.0 + xo + 'cm', '3.0cm', '1.0cm', Neighborhoods);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(5.8 + yo + 'cm', 1.3 + xo + 'cm', '5.0cm', '1.0cm', Road);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(5.8 + yo + 'cm', 9.3 + xo + 'cm', '2.0cm', '1.0cm', MPNumber);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(
      7.3 + yo + 'cm',
      1.3 + xo + 'cm',
      '7.0cm',
      '1.0cm',
      CommunityStandardAddress
    );
    LODOP.ADD_PRINT_TEXT(11.0 + yo + 'cm', 3.8 + xo + 'cm', '8.0cm', '3.0cm', OriginalAddress);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(16.2 + yo + 'cm', 0.9 + xo + 'cm', '1.5cm', '1cm', Year);
    LODOP.ADD_PRINT_TEXT(16.2 + yo + 'cm', 2.8 + xo + 'cm', '1.0cm', '1cm', Month);
    LODOP.ADD_PRINT_TEXT(16.2 + yo + 'cm', 4.2 + xo + 'cm', '1.0cm', '1cm', Date);
    LODOP.SET_PRINT_STYLE('Alignment', 1);

    LODOP.ADD_PRINT_SETUP_BKIMG(
      `<img border='0' style='height:18cm;width:12.7cm' src='${paths.mpzbg}'>`
    );
  }
  LODOP.SET_SHOW_MODE('BKIMG_IN_PREVIEW', 1);
  LODOP.SET_SHOW_MODE('BKIMG_LEFT', xo + 'cm');
  LODOP.SET_SHOW_MODE('BKIMG_TOP', yo - 0.2 + 'cm');
  LODOP.SET_PRINT_PAGESIZE(1, 0, 0, 'A4');
  LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', 1);
  LODOP.PREVIEW();
  LODOP.On_Return = (function(mpzs, callback) {
    return function(TaskID, Value) {
      if (Value !== '0') {
        message.info('正在打印中，请稍后...', 3);
        callback && callback();
        SubmitMPZPrint({ print: mpzs });
      }
    };
  })(mpzs, callback);
}

export function printDMZM(mpzs, LODOP) {
  if (!mpzs || mpzs.length == 0) {
    error('没有要打印的数据！');
    return;
  }
  LODOP = LODOP || CreatedOKLodop7766;
  let none = '无';

  for (let mpz of mpzs) {
    mpz.PrintType = '地址证明';

    mpz.PropertyOwner = mpz.PropertyOwner || none;
    mpz.StandardAddress = mpz.StandardAddress || none;
    mpz.FCZAddress = mpz.FCZAddress || none;
    mpz.TDZAddress = mpz.TDZAddress || none;
    mpz.BDCZAddress = mpz.BDCZAddress || none;
    mpz.YYZZOrHJAddress = mpz.YYZZOrHJAddress || none;
    mpz.OtherAddress = mpz.OtherAddress || none;
    mpz.Year = mpz.Year || '';
    mpz.Month = mpz.Month || '';
    mpz.Date = mpz.Date || '';

    let {
      PropertyOwner,
      StandardAddress,
      FCZAddress,
      TDZAddress,
      BDCZAddress,
      YYZZOrHJAddress,
      OtherAddress,
      Year,
      Month,
      Date,
    } = mpz;

    let content = `
    <div style="width:100%;font-family:仿宋;">
      <h2 style="padding:10px;text-align:center;font-family:黑体;">地名证明</h2>
        <table style="border:1px solid black;border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:10px;width:30%;text-align:center;border:1px solid black;">产权人</td>
            <td style="padding:10px;width:70%">${PropertyOwner || none}</td>
          </tr>
          <tr>
            <td style="padding:10px;text-align:center;border:1px solid black;">标准地址</td>
            <td style="padding:10px;border:1px solid black;">${StandardAddress || none}</td>
          </tr>
          <tr>
            <td style="padding:10px;text-align:center;border:1px solid black;">房产证地址</td>
            <td style="padding:10px;border:1px solid black;">${FCZAddress || none}</td>
          </tr>
          <tr>
            <td style="padding:10px;text-align:center;border:1px solid black;">土地证地址</td>
            <td style="padding:10px;border:1px solid black;">${TDZAddress || none}</td>
          </tr>
          <tr>
            <td style="padding:10px;text-align:center;border:1px solid black;">不动产证地址</td>
            <td style="padding:10px;border:1px solid black;">${BDCZAddress || none}</td>
          </tr>
          <tr>
            <td style="padding:10px;text-align:center;border:1px solid black;">营业执照/户籍地址</td>
            <td style="padding:10px;border:1px solid black;">${YYZZOrHJAddress || none}</td>
          </tr>
          <tr>
            <td style="padding:10px;text-align:center;border:1px solid black;">其他地址</td>
            <td style="padding:10px;border:1px solid black;">${OtherAddress || none}</td>
          </tr>
        </table>
        <div style="padding-top:20px;line-height:30px;text-indent:2em;">
        兹证明上表中房屋权属人所登记各类地址指向同一不动产。
        </div>
        <div style="padding:0;line-height:30px;text-indent:2em;">
        根据《浙江省地名管理办法》：依法命名、更名的地名为标准地名。国家机关、企业事业单位、人民团体制发的公文、证照及其他法律文书等使用的地名应当是标准地名。
        </div>
        <div style="padding:0;line-height:30px;text-indent:2em;">
        凡户籍登记、房地产确认地址、工商登记和邮电通讯管理等，以上述标准地址栏为准。
        </div>
        <div style="margin-top:60px;padding:10px;text-align:right;">（地址证明专用章）</div>
        <div style="padding:10px;text-align:right;">${Year || ''}年${Month || ''}月${Date ||
      ''}日</div>
    </div>`;
    LODOP.ADD_PRINT_HTM('3cm', '3cm', '14cm', '22cm', content);
    LODOP.NEWPAGE();
  }
  LODOP.SET_PRINT_PAGESIZE(1, 0, 0, 'A4');
  LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', 1);
  LODOP.PREVIEW();
  LODOP.On_Return = (function(mpzs) {
    return function(TaskID, Value) {
      if (Value !== '0') {
        message.info('正在打印中，请稍后...', 3);
        SubmitMPZPrint({ print: mpzs });
      }
    };
  })(mpzs);
}

export function printMPZ_cj(ids, type, printType, callback) {
  printType = printType || '门牌证';
  if (ids && ids.length && type) {
    if (!CreatedOKLodop7766) {
      getLodop(
        null,
        null,
        LODOP => {
          CreatedOKLodop7766 = LODOP;
          printType === '门牌证' ? print_cj(ids, type, callback) : print_dmzm(ids, type, callback);
        },
        LODOPError => {
          Modal.error({ title: '错误', content: LODOPError });
        }
      );
    } else {
      printType === '门牌证' ? print_cj(ids, type, callback) : print_dmzm(ids, type, callback);
    }
  } else {
    error('请选择要打印的数据！');
  }
}

export function print_cj(ids, type, callback) {
  message.info('门牌证生成中，请稍后...', 3);
  GetMPZPrint_cj({ ids, type }, data => {
    message.info('正在启动打印，请稍后...', 3);
    printMPZ(data, null, callback);
  });
}

export function print_dmzm(ids, type) {
  message.info('地名证明生成中，请稍后...', 3);
  GetMPZPrint_cj({ ids, type }, data => {
    message.info('正在启动打印，请稍后...', 3);
    printDMZM(data);
  });
}

// 地名预命名打印
export function printDMYMM(dms, LODOP) {
  if (!dms || dms.length == 0) {
    error('没有要打印的数据！');
    return;
  }
  LODOP = LODOP || CreatedOKLodop7766;
  let none = '无';

  for (let dm of dms) {
    let { WH_M, WH_Z, WH_H, SBDW, DMName, DistrictID, DLWZ, Year, Month, Date } = dm;
    let content = `
    <div style="width:100%;font-family:仿宋;">
      <h1 style="padding:10px;text-align:center;font-family:黑体;">地名预命名使用书</h1>
      <h3 style="text-align:center;font-family:黑体;">${WH_M || none}名〔${WH_Z ||
      none}〕字第${WH_H || none}号</h3>
      <div style="font-size:20px">
        <div>${SBDW || none}：</div>
        <div style="text-indent:2em;line-height:34px;">
        根据《地名管理条例》《地名管理条例实施细则》《浙江省地名管理办法》和《嘉兴市地名管理办法》的相关规定，经初步审核，拟同意暂用“${DMName ||
          none}”，有效期为半年。
        </div>
        <div style="text-indent:2em;line-height:34px;">请你单位及时按规定流程正式申报。</div>
        <div style="text-indent:2em;line-height:34px;">附信息表：</div>
        <table style="border:1px solid black;border-collapse:collapse;width:110%;margin-left:-5%;font-size:18px;">
          <tr>
              <td style="padding:10px 0;width:25%;text-align:center;border:1px solid black;font-family:黑体;">预命名地名</td>
              <td style="padding:10px 0;width:25%;text-align:center;border:1px solid black;font-family:黑体;">所在行政区</td>
              <td style="padding:10px 0;width:50%;text-align:center;border:1px solid black;font-family:黑体;">地理实体概况</td>
          </tr>
          <tr>
              <td style="padding:10px 0;width:25%;text-align:center;border:1px solid black;">${DMName ||
                none}</td>
              <td style="padding:10px 0;width:25%;text-align:center;border:1px solid black;">${DistrictID ||
                none}</td>
              <td style="padding:10px 0;width:50%;text-align:center;border:1px solid black;">${DLWZ ||
                none}</td>
          </tr>
        </table>
        <div style="margin-top:60px;padding:10px;text-align:right;">审核机关（印）</div>
        <div style="padding:10px;text-align:right;">${Year || ''}年${Month || ''}月${Date ||
      ''}日</div>
      </div>
    </div>`;
    LODOP.ADD_PRINT_HTM('3cm', '3cm', '14cm', '22cm', content);
    LODOP.NEWPAGE();
  }
  LODOP.SET_PRINT_PAGESIZE(1, 0, 0, 'A4');
  LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', 1);
  LODOP.PREVIEW();
  LODOP.On_Return = (function(dms) {
    return function(TaskID, Value) {
      if (Value !== '0') {
        message.info('正在打印中，请稍后...', 3);
        SubmitDMYMMPrint({ print: dms });
      }
    };
  })(dms);
}

// 地名核准书打印
export function printDMHZS(dms, LODOP) {
  if (!dms || dms.length == 0) {
    error('没有要打印的数据！');
    return;
  }
  LODOP = LODOP || CreatedOKLodop7766;
  // LODOP.SET_PRINT_PAGESIZE(1, '340mm', '240mm', '');
  let xo = 2.1;
  let yo = 1.5;

  for (let dm of dms) {
    let {
      DMName,
      Pinyin,
      DMType,
      DistrictID,
      SBDW,
      DLWZ,
      Remark,
      WH_M,
      WH_Z,
      WH_H,
      Year,
      Month,
      Date,
    } = dm;

    LODOP.NEWPAGE();
    LODOP.ADD_PRINT_SETUP_BKIMG(
      `<img border='0' style='height:24cm;width:34cm' src='${paths.dmhzsbg}'>`
    );
    LODOP.SET_PRINT_STYLE('FontName', '仿宋');
    LODOP.SET_PRINT_STYLE('FontSize', 14);
    LODOP.SET_PRINT_STYLE('Bold', 1);
    LODOP.SET_PRINT_STYLE('Alignment', 3);
    LODOP.ADD_PRINT_TEXT(6.4 + yo + 'cm', 1.8 + xo + 'cm', '2cm', '1.0cm', WH_M);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.SET_PRINT_STYLE('FontSize', 12);
    LODOP.ADD_PRINT_TEXT(6.4 + yo + 'cm', 4.3 + xo + 'cm', '1.0cm', '1.0cm', '〔');
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(6.4 + yo + 'cm', 3.7 + xo + 'cm', '3.0cm', '1.0cm', WH_Z);
    LODOP.SET_PRINT_STYLE('Alignment', 3);
    LODOP.ADD_PRINT_TEXT(6.4 + yo + 'cm', 5.1 + xo + 'cm', '1.0cm', '1.0cm', '〕');
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(6.4 + yo + 'cm', 7.2 + xo + 'cm', '1.2cm', '1.0cm', WH_H);
    LODOP.SET_PRINT_STYLE('FontSize', 14);
    LODOP.ADD_PRINT_TEXT(11.0 + yo + 'cm', 3.5 + xo + 'cm', '4.0cm', '1.0cm', DMName);
    LODOP.SET_PRINT_STYLE('Alignment', 3);
    LODOP.ADD_PRINT_TEXT(17.7 + yo + 'cm', 5.0 + xo + 'cm', '1.5cm', '1.0cm', Year);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(17.7 + yo + 'cm', 7.3 + xo + 'cm', '1.0cm', '1.0cm', Month);
    LODOP.ADD_PRINT_TEXT(17.7 + yo + 'cm', 9.0 + xo + 'cm', '1.0cm', '1.0cm', Date);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.SET_PRINT_STYLE('FontSize', 10);
    LODOP.ADD_PRINT_TEXT(2.3 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '1.2cm', DMName);
    LODOP.ADD_PRINT_TEXT(4.3 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '1.2cm', Pinyin);
    LODOP.ADD_PRINT_TEXT(6.0 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '1.2cm', DMType);
    LODOP.ADD_PRINT_TEXT(8.0 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '1.2cm', DistrictID);
    LODOP.ADD_PRINT_TEXT(10.0 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '1.2cm', SBDW);
    LODOP.ADD_PRINT_TEXT(11.8 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '3.5cm', DLWZ);
    LODOP.ADD_PRINT_TEXT(16.0 + yo + 'cm', 20.3 + xo + 'cm', '9.0cm', '3.5cm', Remark);
  }
  LODOP.SET_SHOW_MODE('BKIMG_IN_PREVIEW', 1);
  LODOP.SET_SHOW_MODE('BKIMG_LEFT', '0cm');
  LODOP.SET_SHOW_MODE('BKIMG_TOP', '0cm');

  LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', 1);
  LODOP.PREVIEW();
  LODOP.On_Return = (function(dms) {
    return function(TaskID, Value) {
      if (Value !== '0') {
        message.info('正在打印中，请稍后...', 3);
        SubmitDMYMMPrint({ print: dms });
      }
    };
  })(dms);
}

/**
 * 地名预命名打印
 * @param {主键数组} ids
 * @param {地名类型} type
 */
export function print_dmymm(ids, type) {
  print_dmzs(ids, type, '地名预命名');
}

export function print_dmhzs(ids, type) {
  print_dmzs(ids, type, '地名核准书');
}

export function print_dmzs(ids, type, printType) {
  if (ids && ids.length && type) {
    if (!CreatedOKLodop7766) {
      getLodop(
        null,
        null,
        LODOP => {
          CreatedOKLodop7766 = LODOP;
          printType === '地名核准书' ? print_dmhzs_cj(ids, type) : print_dmymm_cj(ids, type);
        },
        LODOPError => {
          Modal.error({ title: '错误', content: LODOPError });
        }
      );
    } else {
      printType === '地名核准书' ? print_dmhzs_cj(ids, type) : print_dmymm_cj(ids, type);
    }
  } else {
    error('请选择要打印的数据！');
  }
}

export function print_dmymm_cj(ids, type) {
  message.info('地名预命名使用书生成中，请稍后...', 3);
  GetDMYMMPrint_cj({ ids, type }, data => {
    message.info('正在启动打印，请稍后...', 3);
    printDMYMM(data);
  });
}

/**
 * 核准书打印
 * @param {主键数组} ids
 * @param {地名类型} type
 */
export function print_dmhzs_cj(ids, type) {
  message.info('地名核准书生成中，请稍后...', 3);
  GetDMHZPrint_cj({ ids, type }, data => {
    message.info('正在启动打印，请稍后...', 3);
    printDMHZS(data);
  });
}
