import React, { Component } from 'react';
import { Icon, Input } from 'antd';
import { Link } from 'dva/router';
import st from './Home.less';

class Home extends Component {
  state = {
    time: moment(),
  };

  setTime() {
    this.setState({ time: moment() });
  }

  getTime() {
    let { time } = this.state;
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

  startRefreshTime() {
    this.interval = setInterval(this.setTime.bind(this), 1000);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  componentDidMount() {
    this.startRefreshTime();
  }

  render() {
    let { year, month, date, day, hour, minute } = this.getTime();

    return (
      <div className={st.home}>
        {' '}
        <div className={st.bg} />
        <div className={st.sider}>
          <div className={st.title}>
            <div className={st.logo} />
            嘉兴区划地名<br />
            业务平台
          </div>
          <ul className={st.navs}>
            <li>
              <Link to="/placemanage">
                <Icon type="profile" theme="outlined" />&ensp;区划地名管理
              </Link>
            </li>
            <li>
              <a>
                <Icon type="global" theme="outlined" />&ensp;地理信息服务
              </a>
            </li>
            <li>
              <a>
                <Icon type="area-chart" theme="outlined" />&ensp;数据统计分析
              </a>
            </li>
            <li>
              <a>
                <Icon type="setting" theme="outlined" />&ensp;系统维护管理
              </a>
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
              <span>
                {hour} : {minute}
              </span>&emsp;
              <span>
                {year}/{month + 1}/{date}&ensp;周{day}
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
              <Link to="/placemanage">
                <div className={st.bg1} />
                <div>
                  <Icon type="profile" theme="outlined" />&ensp;区划地名管理
                </div>
                <div>说明性文字</div>
              </Link>
            </div>
            <div>
              <div className={st.noauth}>
                <div>
                  <Icon type="exclamation-circle" theme="filled" />无访问权限
                </div>
              </div>
              <Link to="/placemanage">
                <div className={st.bg2} />
                <div>
                  <Icon type="global" theme="outlined" />&ensp;地理信息服务
                </div>
                <div>说明性文字</div>
              </Link>
            </div>
            <div>
              <div className={st.noauth}>
                <div>
                  <Icon type="exclamation-circle" theme="filled" />无访问权限
                </div>
              </div>
              <Link to="/placemanage">
                <div className={st.bg3} />
                <div>
                  <Icon type="area-chart" theme="outlined" />&ensp;数据统计分析
                </div>
                <div>说明性文字</div>
              </Link>
            </div>
            <div>
              <div className={st.noauth}>
                <div>
                  <Icon type="exclamation-circle" theme="filled" />无访问权限
                </div>
              </div>

              <Link to="/placemanage">
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
