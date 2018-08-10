import React, { Component } from 'react';
import { DatePicker, Input, Button } from 'antd';
import st from './ProveForm.less';

class ProveForm extends Component {
  render() {
    return (
      <div className={st.ProveForm}>
        <div className={st.title}>地名证明</div>
        <table>
          <tr>
            <th style={{width:'20%'}}>产权人</th>
            <td style={{width:'30%'}}>
              <Input />
            </td>
            <th style={{width:'20%'}}>标准地址</th>
            <td style={{width:'30%'}}>
              <Input />
            </td>
          </tr>
          <tr>
            <th>房产证地址</th>
            <td colSpan={3}>
              <Input />
            </td>
          </tr>
          <tr>
            <th>土地证地址</th>
            <td colSpan={3}>
              <Input />
            </td>
          </tr>
          <tr>
            <th>营业执照/户籍地址</th>
            <td colSpan={3}>
              <Input />
            </td>
          </tr>
          <tr>
            <th>其它地址</th>
            <td colSpan={3}>
              <Input />
            </td>
          </tr>
        </table>
        <div className={st.description}>
          &emsp;&emsp;兹证明上表中房屋权属人所登记各类地址指向同一不动产。<br />
          &emsp;&emsp;根据《浙江省地名管理办法》：依法命名、更名的地名为标准地名。国家机关、企业事业单位、人民团体制发的公文、证照及其他法律文书等使用的地名应当是标准地名。<br />
          &emsp;&emsp;凡户籍登记、房地产确认地址、工商登记和邮电通讯管理等，以上述标准地址栏为准。
        </div>
        <div className={st.footer}>
          （地址证明专用章）
          <div>
            <DatePicker />
          </div>
        </div>
        <div className={st.btns}>
          <Button type="primary">确定</Button>
          &emsp;
          <Button>取消</Button>
        </div>
      </div>
    );
  }
}

export default ProveForm;
