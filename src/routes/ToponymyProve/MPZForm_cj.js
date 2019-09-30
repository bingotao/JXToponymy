import { Component } from 'react';
import { Checkbox, Button, Spin, notification } from 'antd';
import st from './MPZForm_cj.less';
import { getLodop } from '../../common/Print/LodopFuncs';
import { GetMPZPrint_cj } from '../../services/MP';

class MPZForm_cj extends Component {
  state = {
    loading: false,
    MPZPrintEntity: {},
    oldAddress: {
      OriginalMPAddress: true,
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
    let LODOP = getLodop();
    let { AddressCoding, PropertyOwner, County, Neighborhoods, Road, MPNumber, CommunityStandardAddress, OriginalMPAddress, Year, Month, Date } = this.state.MPZPrintEntity
    LODOP.ADD_PRINT_TEXT(10, 10, 50, 100, AddressCoding);
    LODOP.PREVIEW();
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
    await GetMPZPrint_cj({ ids: [id], type, otherAddresses: this.getAddesses() }, d => {
      this.setState({ MPZPrintEntity: d[0] })
    });
    this.setState({ loading: false });
  }

  getAddesses() {
    let {
      OriginalMPAddress,
      FCZAddress,
      TDZAddress,
      BDCZAddress,
      HJAddress,
      YYZZAddress,
      QQZAddress,
      OtherAddress,
    } = this.state.oldAddress;

    let addesses = [];
    if (OriginalMPAddress) addesses.push("OriginalMPAddress");
    if (FCZAddress) addesses.push("FCZAddress");
    if (TDZAddress) addesses.push("TDZAddress");
    if (BDCZAddress) addesses.push("BDCZAddress");
    if (HJAddress) addesses.push("HJAddress");
    if (YYZZAddress) addesses.push("YYZZAddress");
    if (QQZAddress) addesses.push("QQZAddress");
    if (OtherAddress) addesses.push("OtherAddress");
    return addesses;
  }

  getCommunityStandardAddress() {
    this.getFormData();
  }

  componentDidMount() {
    this.getFormData();
  }

  render() {
    let { loading, MPZPrintEntity, oldAddress } = this.state;
    let et = MPZPrintEntity;

    let {
      OriginalMPAddress,
      FCZAddress,
      TDZAddress,
      BDCZAddress,
      HJAddress,
      YYZZAddress,
      QQZAddress,
      OtherAddress,
    } = oldAddress;
    let { type } = this.props;

    return (
      <div className={st.MPZForm}>
        <Spin spinning={loading}>
          <div className={st.ydz}>{et.OriginalMPAddress}</div>
          <div className={st.setting}>
            <div>
              <Checkbox
                checked={OriginalMPAddress}
                onChange={e => {
                  let { oldAddress } = this.state;
                  oldAddress.OriginalMPAddress = e.target.checked;
                  this.setState(oldAddress, this.getCommunityStandardAddress);
                }}
              >
                原门牌证地址
              </Checkbox>
              {type == 'ResidenceMP' || type == 'RoadMP' ? (
                <Checkbox
                  checked={FCZAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.FCZAddress = e.target.checked;
                    this.setState(oldAddress, this.getCommunityStandardAddress);
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
                  this.setState(oldAddress, this.getCommunityStandardAddress);
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
                    this.setState(oldAddress, this.getCommunityStandardAddress);
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
                    this.setState(oldAddress, this.getCommunityStandardAddress);
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
                    this.setState(oldAddress, this.getCommunityStandardAddress);
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
                    this.setState(oldAddress, this.getCommunityStandardAddress);
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
                  this.setState(oldAddress, this.getCommunityStandardAddress);
                }}
              >
                其他地址
              </Checkbox>
            </div>
          </div>
          <div className={st.btns}>
            <Button onClick={this.onOKClick.bind(this)} type="primary">
              打印
            </Button>&ensp;<Button onClick={this.onCancelClick.bind(this)}>取消</Button>{' '}
          </div>
        </Spin>
      </div >
    );
  }
}

export default MPZForm_cj;
