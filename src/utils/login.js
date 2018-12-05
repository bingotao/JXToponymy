import { Login, Logout, GetUser } from '../services/Login';

let user = null;

function getUser() {
  if (!user) {
    user = {
      id: 'test001',
      name: '测试用户001',
      department: 'XXX部门',
      privileges: {
        pm: 'edit',
        pm_dpt: 'edit',
        // pm_dpt_qr: 'edit',
        // pm_dpt_mdf: 'edit',
        // pm_dpt_mk: 'edit',
        pm_dpt_st: 'view',
        pm_tpp: 'edit',
        pm_gdp: 'view',
        // pm_gdp_qr: 'edit',
        pm_gdp_mdf: 'edit',
        // pm_gdp_st: 'edit',
      },
    };
    // user = GetUser().Data;
  }
  return user;
}

function login(userName, password) {
  user = Login({ userName, password }).Data;
}

function logout() {
  user = null;
  Logout();
}

export { getUser, login, logout };
