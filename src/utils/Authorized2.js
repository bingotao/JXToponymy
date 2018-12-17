import React, { Component } from 'react';
import { getUser, getPrivilege } from './login';
/*
none:无权限
view:查看权限
edit:修改权限
*/
class Authorized extends Component {
  constructor(ps) {
    super(ps);

    let user = getUser();

    if (user) {
      let priv = user.privileges[ps.c_id] || null;
      // 如果设定了权限则采用该权限，否则使用上一组件权限
      if (priv) {
        ps.privilege = priv;
      }
      // 默认view，edit权限
      if (!ps.passPrivilege) ps.passPrivilege = 'view,edit';
      let { privilege, passPrivilege } = ps;
      this.pass = Authorized.validate(null, privilege, passPrivilege);
    } else {
      this.pass = false;
    }
  }

  render() {
    // 是否通过验证
    if (this.pass) {
      let { privilege, passPrivilege } = this.props;
      return React.Children.map(this.props.children, child => {
        // 通过验证后把权限传递给下一级
        return React.cloneElement(child, {
          privilege: privilege,
          passPrivilege: passPrivilege,
        });
      });
    } else {
      // 没有通过验证
      return this.props.noMatch !== undefined ? this.props.noMatch : <div>无权限</div>;
    }
  }
}

// Authorized.validate = (privilege, passPrivilege) => {
//   passPrivilege = passPrivilege || 'view,edit';
//   return !!(passPrivilege && passPrivilege.indexOf(privilege) !== -1);
// };

Authorized.validate = (c_id, privilege, passPrivilege) => {
  let prv = privilege;
  if (c_id) {
    prv = Authorized.getPrivilege(c_id);
    if (prv === undefined) {
      prv = privilege;
    }
  }
  passPrivilege = passPrivilege || 'view,edit';
  return !!(passPrivilege && passPrivilege.indexOf(prv) !== -1);
};

Authorized.validateC_ID = (c_id, passPrivilege) => {
  let user = getUser();
  let privilege = null;
  if (user) {
    privilege = user.privileges[c_id];
  } else {
    return false;
  }
  passPrivilege = passPrivilege || 'view,edit';
  return !!(passPrivilege && passPrivilege.indexOf(privilege) !== -1);
};

Authorized.getPrivilege = c_id => {
  let user = getUser();
  return user ? user.privileges[c_id] : null;
};

export default Authorized;
