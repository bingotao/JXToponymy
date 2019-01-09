import React, { Component } from 'react';
import { Spin, notification, Button } from 'antd';
import st from './ProveForm.less';

import {
  url_SearchResidenceMPByID,
  url_SearchRoadMPByID,
  url_SearchCountryMPID,
} from '../../common/urls';
import { Post } from '../../utils/request';
import { DZZMPrint } from '../../services/MP';

class ProveForm extends Component {
  state = { loading: false, entity: {} };

  async getFormData() {
    this.setState({ loading: true });
    let { id, type } = this.props;
    if (id && type) {
      let url = null;
      switch (type) {
        case 'ResidenceMP':
          url = url_SearchResidenceMPByID;
          break;
        case 'RoadMP':
          url = url_SearchRoadMPByID;
          break;
        case 'CountryMP':
          url = url_SearchCountryMPID;
          break;
        default:
          return;
      }
      await Post(url, { ID: id }, e => {
        this.setState({ loading: false, entity: e });
      });
    } else {
      notification.error({
        message: '错误',
        description: '未传入有效参数，未能获取有效数据！',
      });
      this.setState({ loading: false });
    }
  }

  getAddress() {
    let { entity } = this.state;
    switch (this.props.type) {
      case 'ResidenceMP':
        return entity.HJAddress;
      case 'RoadMP':
        return entity.YYZZAddress;
      default:
        return '';
    }
  }

  getDMZM() {
    let {
      entity: { ID },
    } = this.state;
    if (ID) this.onPrintDZZM([ID]);

    let { onOKClick } = this.props;
    onOKClick && onOKClick(ID);
  }

  onPrintDZZM(ids) {
    if (ids && ids.length) {
      let { type } = this.props;
      DZZMPrint({
        ids: ids,
        mptype: type === 'ResidenceMP' ? '住宅门牌' : type === 'RoadMP' ? '道路门牌' : '农村门牌',
        CertificateType: '地址证明',
      });
    } else {
      error('请选择要打印的数据！');
    }
  }

  onCancelClick() {
    let { onCancel } = this.props;
    onCancel && onCancel();
  }

  componentDidMount() {
    this.getFormData();
  }

  render() {
    let { loading, entity } = this.state;
    return (
      <div className={st.ProveForm}>
        <Spin spinning={loading}>
          <div className={st.title}>地名证明</div>
          <table>
            <tr>
              <th style={{ width: '20%' }}>产权人</th>
              <td style={{ width: '80%' }}>{entity.PropertyOwner}</td>
            </tr>
            <tr>
              <th>标准地址</th>
              <td>{entity.StandardAddress}</td>
            </tr>
            <tr>
              <th>房产证地址</th>
              <td colSpan={3}>{entity.FCZAddress}</td>
            </tr>
            <tr>
              <th>土地证地址</th>
              <td colSpan={3}>{entity.TDZAddress}</td>
            </tr>
            <tr>
              <th>营业执照/户籍地址</th>
              <td colSpan={3}>{this.getAddress()}</td>
            </tr>
            <tr>
              <th>其它地址</th>
              <td colSpan={3}>{entity.OtherAddress}</td>
            </tr>
          </table>
          <div className={st.description}>
            &emsp;&emsp;兹证明上表中房屋权属人所登记各类地址指向同一不动产。<br />
            &emsp;&emsp;根据《浙江省地名管理办法》：依法命名、更名的地名为标准地名。国家机关、企业事业单位、人民团体制发的公文、证照及其他法律文书等使用的地名应当是标准地名。<br />
            &emsp;&emsp;凡户籍登记、房地产确认地址、工商登记和邮电通讯管理等，以上述标准地址栏为准。
          </div>
          <div className={st.footer}>
            （地址证明专用章）
            <div>{moment().format('YYYY年MM月DD日')}</div>
          </div>
          <div className={st.btns}>
            <Button type="primary" onClick={e => this.getDMZM()}>
              开具证明
            </Button>
            &emsp;
            <Button onClick={e => this.onCancelClick()}>取消</Button>
          </div>
        </Spin>
      </div>
    );
  }
}

export default ProveForm;
