import { Component } from 'react';
import { Checkbox, Button, Spin, notification } from 'antd';
import st from './MPZForm_cj.less';
import { getLodop, printMPZ } from '../../common/Print/LodopFuncs';
import { GetMPZPrint_cj, GetOriginalAddress } from '../../services/MP';
import { error } from '../../utils/notification';

class MPZForm_cj extends Component {
  state = {
    showLODOPError: false,
    LODOPError: null,
    loading: false,
    MPZPrintEntity: {},
    oldAddress: {
      OriginalMPAddress: false,
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
    if (!this.LODOP) {
      error('获取打印控件失败，请查看控件是否安装或服务是否启动！');
      return;
    }
    printMPZ([this.state.MPZPrintEntity], this.LODOP);
    let { onOKClick } = this.props;
    onOKClick && onOKClick(this.state.MPZPrintEntity);
  }

  onCancelClick() {
    let { onCancel } = this.props;
    onCancel && onCancel();
  }

  async getFormData() {
    this.setState({ loading: true });
    let { id, type,PrintType } = this.props;
    await GetMPZPrint_cj({ ids: [id], type, otherAddresses: this.getAddesses(),PrintType }, d => {
      this.setState({ MPZPrintEntity: d[0] });
    });
    this.setState({ loading: false });
  }

  async getOriginalAddress() {
    this.setState({ loading: true });
    let { MPZPrintEntity } = this.state;
    await GetOriginalAddress({ MPZPrintEntity, otherAddresses: this.getAddesses() }, d => {
      MPZPrintEntity.OriginalAddress = d;
      this.setState({ MPZPrintEntity });
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
    if (OriginalMPAddress) addesses.push('OriginalMPAddress');
    if (FCZAddress) addesses.push('FCZAddress');
    if (TDZAddress) addesses.push('TDZAddress');
    if (BDCZAddress) addesses.push('BDCZAddress');
    if (HJAddress) addesses.push('HJAddress');
    if (YYZZAddress) addesses.push('YYZZAddress');
    if (QQZAddress) addesses.push('QQZAddress');
    if (OtherAddress) addesses.push('OtherAddress');
    return addesses;
  }

  componentDidMount() {
    this.getFormData();
    getLodop(
      null,
      null,
      LODOP => {
        this.LODOP = LODOP;
      },
      LODOPError => {
        this.setState({ showLODOPError: true, LODOPError });
      }
    );
  }

  render() {
    let { loading, MPZPrintEntity, oldAddress, showLODOPError, LODOPError } = this.state;
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
          {showLODOPError && <div className={st.lodoperror}>{LODOPError}</div>}
          <div className={st.ydz}>{et.OriginalAddress}</div>
          <div className={st.setting}>
            <div>
              <div className={st.settingitem}>
                <Checkbox
                  checked={OriginalMPAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.OriginalMPAddress = e.target.checked;
                    this.setState(oldAddress, this.getOriginalAddress);
                  }}
                >
                  原门牌证地址：<strong>{et.OriginalMPAddress}</strong>
                </Checkbox>
              </div>
              {type == 'ResidenceMP' || type == 'RoadMP' ? (
                <div className={st.settingitem}>
                  <Checkbox
                    checked={FCZAddress}
                    onChange={e => {
                      let { oldAddress } = this.state;
                      oldAddress.FCZAddress = e.target.checked;
                      this.setState(oldAddress, this.getOriginalAddress);
                    }}
                  >
                    房产证地址：<strong>{et.FCZAddress}</strong>
                  </Checkbox>
                </div>
              ) : null}

              <div className={st.settingitem}>
                <Checkbox
                  checked={TDZAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.TDZAddress = e.target.checked;
                    this.setState(oldAddress, this.getOriginalAddress);
                  }}
                >
                  土地证地址：<strong>{et.TDZAddress}</strong>
                </Checkbox>
              </div>
              {type == 'ResidenceMP' ? (
                <div className={st.settingitem}>
                  <Checkbox
                    checked={BDCZAddress}
                    onChange={e => {
                      let { oldAddress } = this.state;
                      oldAddress.BDCZAddress = e.target.checked;
                      this.setState(oldAddress, this.getOriginalAddress);
                    }}
                  >
                    不动产证地址：<strong>{et.BDCZAddress}</strong>
                  </Checkbox>
                </div>
              ) : null}
              {type == 'ResidenceMP' ? (
                <div className={st.settingitem}>
                  <Checkbox
                    checked={HJAddress}
                    onChange={e => {
                      let { oldAddress } = this.state;
                      oldAddress.HJAddress = e.target.checked;
                      this.setState(oldAddress, this.getOriginalAddress);
                    }}
                  >
                    户籍地址：<strong>{et.HJAddress}</strong>
                  </Checkbox>
                </div>
              ) : null}
              {type == 'RoadMP' ? (
                <div className={st.settingitem}>
                  <Checkbox
                    checked={YYZZAddress}
                    onChange={e => {
                      let { oldAddress } = this.state;
                      oldAddress.YYZZAddress = e.target.checked;
                      this.setState(oldAddress, this.getOriginalAddress);
                    }}
                  >
                    营业执照地址：<strong>{et.YYZZAddress}</strong>
                  </Checkbox>
                </div>
              ) : null}
              {type == 'CountryMP' ? (
                <div className={st.settingitem}>
                  <Checkbox
                    checked={QQZAddress}
                    onChange={e => {
                      let { oldAddress } = this.state;
                      oldAddress.QQZAddress = e.target.checked;
                      this.setState(oldAddress, this.getOriginalAddress);
                    }}
                  >
                    确权证地址：<strong>{et.QQZAddress}</strong>
                  </Checkbox>
                </div>
              ) : null}
              <div className={st.settingitem}>
                <Checkbox
                  checked={OtherAddress}
                  onChange={e => {
                    let { oldAddress } = this.state;
                    oldAddress.OtherAddress = e.target.checked;
                    this.setState(oldAddress, this.getOriginalAddress);
                  }}
                >
                  其他地址：<strong>{et.OtherAddress}</strong>
                </Checkbox>
              </div>
            </div>
          </div>
          <div className={st.btns}>
            <Button disabled={showLODOPError} onClick={this.onOKClick.bind(this)} type="primary">
              打印
            </Button>&ensp;<Button onClick={this.onCancelClick.bind(this)}>取消</Button>
          </div>
        </Spin>
      </div>
    );
  }
}

export default MPZForm_cj;
