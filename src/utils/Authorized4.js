import { Component } from 'react';
import { Redirect } from 'dva/router';
import { getUser } from './login';
import AuthorizedContext from './AuthorizedContext';

let validateC_ID = c_id => {
  let vObj = {
    pass: false,
    edit: false,
  };
  if (c_id) {
    // 获取当前用户
    let user = getUser();
    if (user && user.privileges) {
      // 验证用户权限
      let prv = user.privileges[c_id];
      if (prv !== undefined) {
        vObj = {
          ...prv,
        };
      }
    }
  }
  return vObj;
};

class Authorized extends Component {
  pass = false;
  edit = false;

  static contextType = AuthorizedContext;

  constructor(ps, context) {
    super(ps);

  }

  render() {
    let ps = this.props;
    if (ps.c_id !== undefined) {
      let v = validateC_ID(ps.c_id);
      this.pass = v.pass;
      this.edit = v.edit;
    } else if (ps.edit !== undefined && ps.pass !== undefined) {
      this.pass = ps.pass;
      this.edit = ps.edit;
    } else {
      this.pass = context.pass;
      this.edit = context.edit;
    }

    var v = {
      edit: this.edit,
      pass: this.pass,
    };

    // 是否通过验证
    if (this.pass) {
      return (
        <AuthorizedContext.Provider value={v}>
          {React.Children.map(this.props.children, child => {
            // 通过验证后把是否可编辑传递给下一级
            return React.cloneElement(child, {
              edit: this.edit,
              pass: this.pass
            });
          })}
        </AuthorizedContext.Provider>
      );
    } else {
      // 没有通过验证时显示的组件
      // 为null的时候返回null，为undefined的时候返回<div>无权限</div>
      return (
        <AuthorizedContext.Provider value={v}>
          {this.props.noMatch !== undefined ? this.props.noMatch : Authorized.noMatch}
        </AuthorizedContext.Provider>
      );
    }
  }
}

let RedirectToLogin = <Redirect to="/login" />;

Authorized.noMatch = <div>无权限</div>;

let setNoMatch = cmp => {
  Authorized.noMatch = cmp;
};

export default Authorized;

export {
  //   getEditComponent,
  setNoMatch,
  //   getDisabledComponent,
  //   DisableComponent,
  Authorized,
  RedirectToLogin,
  validateC_ID,
};
