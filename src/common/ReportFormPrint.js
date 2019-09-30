import React, { Component } from 'react';
import { Button } from 'antd';
import { getLodop } from './Print/LodopFuncs';

class ReportFormPrint extends Component {
  printPageView() {
    let LODOP = getLodop();
    LODOP.PRINT_INIT('react使用打印插件CLodop'); //打印初始化
    let strStyle = `<style></style> `;
    LODOP.ADD_PRINT_HTM(
      100,
      '5%',
      '90%',
      450,
      strStyle + document.getElementById('print').innerHTML
    );
    LODOP.PREVIEW(); //最后一个打印(预览)语句
  }

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.printPageView}>
          打印
        </Button>
        <div id="print">打印的内容</div>
      </div>
    );
  }
}
export default ReportFormPrint;
