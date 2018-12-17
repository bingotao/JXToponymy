import React, { Component } from 'react';
import { getUser } from './login';
import { Redirect } from 'dva/router';

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

let validateC_ID = c_id => {
  let vObj = {
    pass: false,
    edit: false,
  };
  if (c_id) {
    // 获取当前用户
    let user = getUser();
    if (user) {
      // 验证用户权限
      let prv = user.privileges[c_id] || null;
      vObj.pass = !!(prv && validate(prv));
      vObj.edit = !!(prv && prv === p_edit);
    }
  }
  return vObj;
};

let RedirectToLogin = <Redirect to="/login" />;

class Authorized extends Component {
  pass = false;
  edit = false;

  constructor(ps) {
    super(ps);

    let v = validateC_ID(ps.c_id);
    this.pass = v.pass;
    this.edit = v.edit;
  }

  render() {
    // 是否通过验证
    if (this.pass) {
      return React.Children.map(this.props.children, child => {
        // 通过验证后把是否可编辑传递给下一级
        return React.cloneElement(child, {
          edit: this.edit,
        });
      });
    } else {
      // 没有通过验证时显示的组件
      // 为null的时候返回null，为undefined的时候返回<div>无权限</div>
      return this.props.noMatch !== undefined ? this.props.noMatch : Authorized.noMatch;
    }
  }
}

class DisableComponent extends Component {
  constructor(ps) {
    super(ps);

    let v = validateC_ID(ps.c_id);
    this.pass = v.pass;
    this.edit = v.edit;
  }

  render() {
    let { disabledField } = this.props;
    disabledField = disabledField || 'disabled';

    return React.Children.map(this.props.children, child => {
      let cfg = {};
      cfg[disabledField] = !this.edit;
      return React.cloneElement(child, cfg);
    });
  }
}

let getEditComponent = function(Cmp) {
  return this.props.edit ? Cmp : null;
};

let getDisabledComponent = function(Cmp, disabledField = 'disabled') {
  Cmp.props[disabledField] = !this.props.edit;
  return Cmp;
};

Authorized.noMatch = <div>无权限</div>;

let setNoMatch = cmp => {
  Authorized.noMatch = cmp;
};

export default Authorized;

export {
  getEditComponent,
  setNoMatch,
  getDisabledComponent,
  DisableComponent,
  Authorized,
  RedirectToLogin,
};
