import { Component } from 'react';
import { Radio, Checkbox, Button, Spin, notification } from 'antd';

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
  state = {
    loading: false,
    entity: {},
    oldAddressCoding: false,
    oldAddress: {
      FCZAddress: false,
      TDZAddress: false,
      BDCZAddress: false,
      HJAddress: false,
      YYZZAddress: false,
      QQZAddress: false,
      OtherAddress: false,
    },
  };

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
      let { oldAddressCoding } = this.state;
      let OriginalMPAddress = this.getOriginalMPAddress();
      MPZPrint({
        ids: ids,
        mptype: type === 'ResidenceMP' ? '住宅门牌' : type === 'RoadMP' ? '道路门牌' : '农村门牌',
        CertificateType: '门牌证',
        OriginalMPAddress: OriginalMPAddress,
        IsOriginalMP : oldAddressCoding ? 1 : 0,
      });
    } else {
      error('请选择要打印的数据！');
    }
  }

  getOriginalMPAddress() {
    let address = [];
    let { entity, oldAddress } = this.state;
    let {
      FCZAddress,
      TDZAddress,
      BDCZAddress,
      HJAddress,
      YYZZAddress,
      QQZAddress,
      OtherAddress,
    } = oldAddress;
    if (FCZAddress) address.push(entity.FCZAddress || '无“房产证地址”');
    if (TDZAddress) address.push(entity.TDZAddress || '无“土地证地址”');
    if (BDCZAddress) address.push(entity.BDCZAddress || '无“不动产地址”');
    if (HJAddress) address.push(entity.HJAddress || '无“户籍地址”');
    if (YYZZAddress) address.push(entity.YYZZAddress || '无“营业执照地址”');
    if (QQZAddress) address.push(entity.QQZAddress || '无“确权证地址”');
    if (OtherAddress) address.push(entity.OtherAddress || '无“其他地址”');
    return address.join('；');
  }

  componentDidMount() {
    this.getFormData();
  }

  render() {
    let { loading, entity, oldAddressCoding, oldAddress } = this.state;
    let {
      FCZAddress,
      TDZAddress,
      BDCZAddress,
      HJAddress,
      YYZZAddress,
      QQZAddress,
      OtherAddress,
    } = oldAddress;
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
              <div className={st.zh}>
                {(oldAddressCoding ? entity.AddressCoding2 : entity.AddressCoding) ||
                  '无“原门牌证号”'}
              </div>
              <div className={st.cqr}>{entity.PropertyOwner}</div>
              <div className={st.xzq}>{entity.CountyName}</div>
              <div className={st.jd}>{entity.NeighborhoodsName}</div>
              <div className={st.dl}>{entity.RoadName}</div>
              <div className={st.mph}>{type === 'CountryMP' ? '' : entity.MPNumber}</div>
              <div className={st.dz}>{getCommunityStandardAddress(entity, type)}</div>
              <div className={st.ydz}>{this.getOriginalMPAddress()}</div>
            </div>
          </div>
          <div className={st.setting}>
            <div>
              <label>原门牌证证号：</label>
              <Checkbox
                checked={oldAddressCoding}
                onChange={e => {
                  this.setState({ oldAddressCoding: e.target.checked });
                }}
              >
                使用原门牌证证号
              </Checkbox>
            </div>
            <div>
              <label>原门牌证地址：</label>
              {type == 'ResidenceMP' || type == 'RoadMP' ? (
                <Checkbox
                  checked={FCZAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.FCZAddress = e.target.checked;
                    this.setState(oldAddress);
                  }}
                >
                  房产证地址
                </Checkbox>
              ) : null}

              <Checkbox
                checked={TDZAddress}
                onChange={e => {
                  let { oldAddress } = this.state;
                  oldAddress.TDZAddress = e.target.checked;
                  this.setState(oldAddress);
                }}
              >
                土地证地址
              </Checkbox>
              {type == 'ResidenceMP' ? (
                <Checkbox
                  checked={BDCZAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.BDCZAddress = e.target.checked;
                    this.setState(oldAddress);
                  }}
                >
                  不动产证地址
                </Checkbox>
              ) : null}
              {type == 'ResidenceMP' ? (
                <Checkbox
                  checked={HJAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.HJAddress = e.target.checked;
                    this.setState(oldAddress);
                  }}
                >
                  户籍地址
                </Checkbox>
              ) : null}
              {type == 'RoadMP' ? (
                <Checkbox
                  checked={YYZZAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.YYZZAddress = e.target.checked;
                    this.setState(oldAddress);
                  }}
                >
                  营业执照地址
                </Checkbox>
              ) : null}
              {type == 'CountryMP' ? (
                <Checkbox
                  checked={QQZAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.QQZAddress = e.target.checked;
                    this.setState(oldAddress);
                  }}
                >
                  确权证地址
                </Checkbox>
              ) : null}
              <Checkbox
                checked={OtherAddress}
                onChange={e => {
                  let { oldAddress } = this.state;
                  oldAddress.OtherAddress = e.target.checked;
                  this.setState(oldAddress);
                }}
              >
                其他地址
              </Checkbox>
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
