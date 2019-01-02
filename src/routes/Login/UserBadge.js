import { Component } from 'react';
import st from './UserBadge.less';
import { Icon } from 'antd';
import { getUser, logout } from '../../utils/login';

class UserBadge extends Component {
  constructor(ps) {
    super(ps);
    this.user = getUser();
  }

  logout() {
    logout();
  }

  render() {
    let { user } = this;
    return (
      <div className={st.UserBadge}>
        <span className={st.icon}>
          <Icon type="user" />
        </span>
        <span>{user ? user.userName : '未登录'}</span>
        {user ? <span className={st.logout} onClick={this.logout.bind(this)}>注销</span> : null}
      </div>
    );
  }
}

export default UserBadge;
