import { Component } from 'react';
import { getLodop, printDMZM } from '../../common/Print/LodopFuncs';

class Test extends Component {
  constructor(props) {
    super(props);
  }

  testClick() {
    // this.LODOP.SET_PRINT_STYLE('FontName', '仿宋');
    // this.LODOP.SET_PRINT_STYLE('FontSize', 12.5);
    // this.LODOP.SET_PRINT_STYLE('Bold', 1);

    // this.LODOP.ADD_PRINT_TEXT('1.3cm', '8.0cm', '3.5cm', '1.0cm', '证号');
    // this.LODOP.ADD_PRINT_TEXT('2.8cm', '3.0cm', '9.0cm', '1.0cm', '产权人');
    // this.LODOP.ADD_PRINT_TEXT('4.3cm', '1.3cm', '2.0cm', '1.0cm', '县市区');
    // this.LODOP.ADD_PRINT_TEXT('4.3cm', '6.0cm', '3.0cm', '1.0cm', '街道');
    // this.LODOP.ADD_PRINT_TEXT('5.8cm', '1.3cm', '4.5cm', '1.0cm', '路街巷');
    // this.LODOP.ADD_PRINT_TEXT('5.8cm', '9.3cm', '1.8cm', '1.0cm', '号');
    // this.LODOP.ADD_PRINT_TEXT('7.3cm', '1.3cm', '6.5cm', '1.0cm', '小区');
    // this.LODOP.ADD_PRINT_TEXT('11.0cm', '3.8cm', '8.0cm', '1.0cm', '原门牌证地址');
    // this.LODOP.ADD_PRINT_TEXT('16.2cm', '1.2cm', '1.0cm', '1cm', '年');
    // this.LODOP.ADD_PRINT_TEXT('16.2cm', '2.8cm', '1.0cm', '1cm', '月');
    // this.LODOP.ADD_PRINT_TEXT('16.2cm', '4.2cm', '1.0cm', '1cm', '日');

    // this.LODOP.ADD_PRINT_SETUP_BKIMG(
    //   "<img border='0' style='height:18cm;width:13cm' src='http://localhost/门牌证.jpg'>"
    // );
    // this.LODOP.SET_SHOW_MODE('BKIMG_IN_PREVIEW', 1);
    // this.LODOP.PREVIEW();

    printDMZM([{}], this.LODOP);
  }

  componentDidMount() {
    setTimeout(() => {
      getLodop(
        null,
        null,
        LODOP => {
          this.LODOP = LODOP;
        },
        null
      );
    }, 3000);
  }

  render() {
    // console.log(this.props);
    return (
      <div>
        <button onClick={this.testClick.bind(this)}>测试</button>
      </div>
    );
  }
}

export default Test;
