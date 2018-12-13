import React, { Component } from 'react';
import { getUser } from './login';
/*
none:无权限
view:查看权限
edit:修改权限
*/
let p_none = 'none',
  p_view = 'view',
  p_edit = 'edit';

// 组件默认权限
let defaultPassPrivilege = [p_view, p_edit].join(',');

let validate = prv => {
  return defaultPassPrivilege.indexOf(prv) !== -1;
};

class Authorized extends Component {
  pass = false;
  edit = false;

  constructor(ps) {
    super(ps);
    
    if (ps.c_id) {
      // 获取当前用户
      let user = getUser();
      if (user) {
        // 验证用户权限
        let prv = user.privileges[ps.c_id] || null;
        this.pass = !!(priv && validate(prv));
        this.edit = !!(priv && prv === p_edit);
      }
    }
  }

  render() {
    // 是否通过验证
    if (this.pass) {
      return React.Children.map(this.props.children, child => {
        // 通过验证后把edit传递给下一级
        return React.cloneElement(child, {
          edit: this.edit,
          getEditComponent: function(Cmp) {
            return this.edit ? <Cmp /> : null;
          },
        });
      });
    } else {
      // 没有通过验证时显示的组件
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
