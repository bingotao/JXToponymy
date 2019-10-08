import { error } from '../../utils/notification';
import { SubmitMPZPrint, GetMPZPrint_cj } from '../../services/MP';
import { message } from 'antd';

// 单例模式，不存在时只新建一次
var CreatedOKLodop7766 = null;

var paths = {
  Lodop32Exe: `${window._g.assetsUrl}/install_lodop32.exe`,
  Lodop64Exe: `${window._g.assetsUrl}/install_lodop64.exe`,
  CLodopExe: `${window._g.assetsUrl}/CLodop_Setup_for_Win32NT.exe`,
  mpzbg: `${window._g.assetsUrl}/mpzbg.jpg`,
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
    function (msg) {
      alert(msg);
    };
  var strHtmInstall = (
    <font color="red">
      打印控件未安装！点击这里<a href={paths.Lodop32Exe} target="_blank">
        执行安装
      </a>，安装后请刷新页面或重新进入。
    </font>
  );
  var strHtmUpdate = (
    <font color="red">
      打印控件需要升级！点击这里<a href={paths.Lodop32Exe} target="_blank">
        执行升级
      </a>，升级后请重新进入。
    </font>
  );
  var strHtm64_Install = (
    <font color="red">
      打印控件未安装！点击这里<a href={paths.Lodop64Exe} target="_blank">
        执行安装
      </a>，安装后请刷新页面或重新进入。
    </font>
  );
  var strHtm64_Update = (
    <font color="red">
      打印控件需要升级!点击这里<a href={paths.Lodop64Exe} target="_blank">
        执行升级
      </a>，升级后请重新进入。
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
      CLodop云打印服务(localhost本地)未安装启动!点击这里<a
        href={paths.CLodopExe}
        target="_blank"
      >
        执行安装
      </a>，安装后请刷新页面。
    </font>
  );
  var strCLodopUpdate = (
    <font color="red">
      CLodop云打印服务需升级！点击这里<a href={paths.CLodopExe} target="_blank">
        执行升级
      </a>，升级后请刷新页面。
    </font>
  );
  var LODOP;
  try {
    var isIE =
      navigator.userAgent.indexOf('MSIE') >= 0 || navigator.userAgent.indexOf('Trident') >= 0;
    if (needCLodop()) {
      try {
        LODOP = getCLodop();
      } catch (err) { }
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

export function printMPZ(mpzs, LODOP) {
  if (!mpzs || mpzs.length == 0) {
    error('没有要打印的门牌证！');
    return;
  }
  LODOP = LODOP || CreatedOKLodop7766;
  let xo = -0.5;
  let yo = -0.3;
  for (let mpz of mpzs) {
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

    LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', 1);
    LODOP.NEWPAGE();
    LODOP.SET_PRINT_STYLE('FontName', '仿宋');
    LODOP.SET_PRINT_STYLE('FontSize', 10);
    LODOP.SET_PRINT_STYLE('Bold', 1);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(1.2 + yo + 'cm', 8.0 + xo + 'cm', '3.5cm', '1.0cm', AddressCoding);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(2.7 + yo + 'cm', 3.0 + xo + 'cm', '9.0cm', '1.0cm', PropertyOwner);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(4.3 + yo + 'cm', 1.3 + xo + 'cm', '2.0cm', '1.0cm', County);
    LODOP.ADD_PRINT_TEXT(4.3 + yo + 'cm', 6.0 + xo + 'cm', '3.0cm', '1.0cm', Neighborhoods);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(5.8 + yo + 'cm', 1.3 + xo + 'cm', '4.5cm', '1.0cm', Road);
    LODOP.SET_PRINT_STYLE('Alignment', 2);
    LODOP.ADD_PRINT_TEXT(5.8 + yo + 'cm', 9.3 + xo + 'cm', '1.8cm', '1.0cm', MPNumber);
    LODOP.SET_PRINT_STYLE('Alignment', 1);
    LODOP.ADD_PRINT_TEXT(7.3 + yo + 'cm', 1.3 + xo + 'cm', '6.5cm', '1.0cm', CommunityStandardAddress);
    LODOP.ADD_PRINT_TEXT(11.0 + yo + 'cm', 3.8 + xo + 'cm', '8.0cm', '1.0cm', OriginalAddress);
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
  LODOP.SET_PRINT_PAGESIZE(1, 0, 0, "A4");
  LODOP.PREVIEW();
  LODOP.On_Return = (function (mpzs) {
    return function (TaskID, Value) {
      if (Value !== '0') {
        SubmitMPZPrint({ print: mpzs });
      }
    };
  })(mpzs);
}

export function printMPZ_cj(ids, type) {
  if (ids && ids.length && type) {
    if (!CreatedOKLodop7766) {
      getLodop(
        null,
        null,
        LODOP => {
          CreatedOKLodop7766 = LODOP;
          print_cj(ids, type);
        },
        LODOPError => {
          Modal.error({ title: '错误', content: LODOPError });
        }
      );
    } else {
      print_cj(ids, type);
    }
  } else {
    error('请选择要打印的数据！');
  }
}

export function print_cj(ids, type) {
  message.info('门牌证生成中，请稍后...', 3);
  GetMPZPrint_cj({ ids, type }, data => {
    message.info('正在启动打印，请稍后...', 3);
    printMPZ(data);
  });
}
