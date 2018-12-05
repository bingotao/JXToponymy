import React, { Component } from 'react';
import { Icon, Input, Tooltip } from 'antd';
import { Link } from 'dva/router';
import st from './Home.less';
import Authorized from '../../utils/Authorized2';

class Home extends Component {
  // state = {
  //   time: moment(),
  // };

  constructor(ps) {
    super(ps);
    this.time = moment();
  }

  setTime() {
    this.time = moment();
    let { year, month, date, day, hour, minute } = this.getTime();
    $(this.t1).html(`${hour} : ${minute}`);
    $(this.t2).html(`${year}/${month + 1}/${date}&ensp;周${day}`);
    // this.setState({ time: moment() });
  }

  getTime() {
    let { time } = this;
    let year = time.year(),
      month = time.month(),
      date = time.date(),
      day = time.day(),
      hour = time.hour(),
      minute = time.minute();
    minute = minute < 10 ? '0' + minute : minute;
    switch (day) {
      case 0:
        day = '日';
        break;
      case 1:
        day = '一';
        break;
      case 2:
        day = '二';
        break;
      case 3:
        day = '三';
        break;
      case 4:
        day = '四';
        break;
      case 5:
        day = '五';
        break;
      case 6:
        day = '六';
        break;
      default:
        day = '';
        break;
    }
    return { year, month, date, day, hour, minute };
  }

  getNoneAuth() {
    return (
      <div className={st.noauth}>
        <div>
          <Icon type="exclamation-circle" theme="filled" />无访问权限
        </div>
      </div>
    );
  }

  startRefreshTime() {
    this.setTime();
    this.interval = setInterval(this.setTime.bind(this), 1000);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  componentDidMount() {
    this.startRefreshTime();
  }

  render() {
    return (
      <div className={st.home}>
        <div className={st.bg} />
        <div className={st.sider}>
          <div className={st.title}>
            <div className={st.logo} />
            嘉兴区划地名<br />
            业务平台
          </div>
          <ul className={st.navs}>
            <li>
              {Authorized.validateC_ID('pm') ? (
                <Link c_id="pm" to="/placemanage">
                  <Icon type="profile" theme="outlined" />&ensp;区划地名管理
                </Link>
              ) : (
                <a style={{ color: '#aaa', cursor: 'default' }}>
                  <Icon type="profile" theme="outlined" />&ensp;区划地名管理
                </a>
              )}
            </li>
            <li>
              {Authorized.validateC_ID('svs') ? (
                <Link c_id="svs" to="/services">
                  <Icon type="global" theme="outlined" />&ensp;地理信息服务
                </Link>
              ) : (
                <a style={{ color: '#aaa', cursor: 'default' }}>
                  <Icon type="global" theme="outlined" />&ensp;地理信息服务
                </a>
              )}
            </li>
            <li>
              {Authorized.validateC_ID('das') ? (
                <Link c_id="das" to="/dataanalysis">
                  <Icon type="area-chart" theme="outlined" />&ensp;数据统计分析
                </Link>
              ) : (
                <a style={{ color: '#aaa', cursor: 'default' }}>
                  <Icon type="area-chart" theme="outlined" />&ensp;数据统计分析
                </a>
              )}
            </li>
            <li>
              {Authorized.validateC_ID('ssm') ? (
                <Link c_id="ssm" to="/systemmaintain">
                  <Icon type="setting" theme="outlined" />&ensp;系统维护管理
                </Link>
              ) : (
                <a style={{ color: '#aaa', cursor: 'default' }}>
                  <Icon type="setting" theme="outlined" />&ensp;系统维护管理
                </a>
              )}
            </li>
          </ul>
        </div>
        <div className={st.content}>
          <div className={st.search}>
            <Input.Search
              placeholder="请输入关键字..."
              enterButton={<span>&ensp;检&ensp;索&ensp;</span>}
              onSearch={value => console.log(value)}
            />
          </div>
          <div className={st.timeuser}>
            <div className={st.time}>
              <span ref={e => (this.t1 = e)}>{/* {hour} : {minute} */}</span>&emsp;
              <span ref={e => (this.t2 = e)}>
                {/* {year}/{month + 1}/{date}&ensp;周{day} */}
              </span>&emsp;
              <span className={st.user}>
                <Icon type="user" />
              </span>
            </div>
          </div>
          <div className={st.tel}>
            <span>技术支持：嘉兴市规划设计研究院有限公司</span>
            <span>服务热线：0573-12345678</span>
          </div>
          <div className={st.panel}>
            <div>
              {Authorized.validateC_ID('pm') ? null : this.getNoneAuth()}
              <Link to="/placemanage">
                <div className={st.bg1} />
                <div>
                  <Icon type="profile" theme="outlined" />&ensp;区划地名管理
                </div>
                <div>实现对区划、地名空间数据和属性数据的一体化存储、管理、应用。</div>
              </Link>
            </div>
            <div>
              {Authorized.validateC_ID('svs') ? null : this.getNoneAuth()}
              <Link to="/services">
                <div className={st.bg2} />
                <div>
                  <Icon type="global" theme="outlined" />&ensp;地理信息服务
                </div>
                <div>
                  满足行政区划与地名信息进行查询、检索、排序、空间统计分析和专题制图的要求。
                </div>
              </Link>
            </div>
            <div>
              {Authorized.validateC_ID('das') ? null : this.getNoneAuth()}
              <Link to="/dataanalysis">
                <div className={st.bg3} />
                <div>
                  <Icon type="area-chart" theme="outlined" />&ensp;数据统计分析
                </div>
                <div>
                  借助独特的地理信息空间分析和快速查询、检索功能及可视化表达手段，为地名管理决策提供辅助信息和科学依据。
                </div>
              </Link>
            </div>
            <div>
              {Authorized.validateC_ID('ssm') ? null : this.getNoneAuth()}
              <Link to="/systemmaintain">
                <div className={st.bg4} />
                <div>
                  <Icon type="setting" theme="outlined" />&ensp;系统维护管理
                </div>
                <div>说明性文字</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Home;
