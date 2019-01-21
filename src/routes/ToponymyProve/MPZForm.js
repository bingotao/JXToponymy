import { Component } from 'react';
import { Button, Spin, notification } from 'antd';

import st from './MPZForm.less';
import { MPZPrint } from '../../services/MP';

import {
  url_SearchResidenceMPByID,
  url_SearchRoadMPByID,
  url_SearchCountryMPID,
} from '../../common/urls.js';

import { Post } from '../../utils/request';

import { getCommunityStandardAddress } from '../../utils/utils';

class MPZForm extends Component {
  state = { loading: false, entity: {} };

  onOKClick() {
    let {
      entity: { ID },
    } = this.state;
    if (ID) this.onPrintMPZ([ID]);

    let { onOKClick } = this.props;
    onOKClick && onOKClick(ID);
  }

  onCancelClick() {
    let { onCancel } = this.props;
    onCancel && onCancel();
  }

  async getFormData() {
    this.setState({ loading: true });
    let { id, type } = this.props;
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
        break;
    }
    if (id && url) {
      await Post(url, { ID: id }, e => {
        this.setState({ entity: e });
      });
    } else {
      notification.error({
        message: '错误',
        description: '未传入有效参数，未能获取有效数据！',
      });
    }
    this.setState({ loading: false });
  }

  onPrintMPZ(ids) {
    if (ids && ids.length) {
      let { type } = this.props;
      MPZPrint({
        ids: ids,
        mptype: type === 'ResidenceMP' ? '住宅门牌' : type === 'RoadMP' ? '道路门牌' : '农村门牌',
        CertificateType: '门牌证',
      });
    } else {
      error('请选择要打印的数据！');
    }
  }

  componentDidMount() {
    this.getFormData();
  }

  render() {
    let { loading, entity } = this.state;
    let { type } = this.props;
    let t = moment();
    let year = t.year(),
      month = t.month() + 1,
      date = t.date();
    month = (month > 9 ? '' : '0') + month;
    date = (date > 9 ? '' : '0') + date;

    return (
      <div className={st.MPZForm}>
        <Spin spinning={loading}>
          <div className={st.content}>
            <div className={st.modal}>
              <div>
                <div>证号_________________</div>
                <div>产权人______________________</div>
                <div>__________（县、市、区）__________（街道、乡、镇）</div>
                <div>___________________（路、街、巷、弄）_________号</div>
                <div>___________________________（小区、幢、单元、室）</div>
              </div>
              <div>
                <div>原门牌地址______________________________________</div>
                <div>
                  {year}&ensp;年&ensp;{month}&ensp;月&ensp;{date}&ensp;日&emsp;&emsp;&emsp;&emsp;发证机关（章）
                </div>
              </div>
            </div>
            <div className={st.details}>
              <div className={st.zh}>{entity.AddressCoding}</div>
              <div className={st.cqr}>{entity.PropertyOwner}</div>
              <div className={st.xzq}>{entity.CountyName}</div>
              <div className={st.jd}>{entity.NeighborhoodsName}</div>
              <div className={st.dl}>{entity.RoadName}</div>
              <div className={st.mph}>{type === 'CountryMP' ? '' : entity.MPNumber}</div>
              <div className={st.dz}>{getCommunityStandardAddress(entity, type)}</div>
              <div className={st.ydz}>{entity.OriginalMPAddress}</div>
            </div>
          </div>
          <div className={st.btns}>
            <Button onClick={this.onOKClick.bind(this)} type="primary">
              打印门牌证
            </Button>&ensp;<Button onClick={this.onCancelClick.bind(this)}>取消</Button>{' '}
          </div>
        </Spin>
      </div>
    );
  }
}

export default MPZForm;
