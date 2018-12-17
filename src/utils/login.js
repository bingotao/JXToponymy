import { Login, Logout, GetUser } from '../services/Login';

let user = null;

async function getCurrentUser() {
  if (!user) {
    let rt = await GetUser();
    if (rt && rt.data) {
      user = rt.data.Data;
      if (user) {
        user.privileges = {
          hm: 'view',
          pm: 'view',
          pm_dpt: 'none',
          // pm_dpt_qr: 'edit',
          // pm_dpt_mdf: 'edit',
          // pm_dpt_mk: 'edit',
          // pm_dpt_st: 'view',
          pm_tpp: 'none',
          pm_gdp: 'edit',
          // pm_gdp_qr: 'edit',
          // pm_gdp_mdf: 'edit',
          // pm_gdp_st: 'view',
        };
      }
    }
  }
  return user;
}

function getUser() {
  return user;
  // return {
  //   privileges: {
  //     t: 'edit',
  //     't.a': 'none',
  //     't.b': 'view',
  //     't.c': 'none',
  //   },
  // };
}

function getPrivilege(c_id) {
  if (user && c_id) {
    user.privileges[c_id];
  }
  return 'none';
}

function login(userName, password, sf) {
  Login({ userName, password }, e => {
    user = e;
    user.privileges = {
      hm: 'view',
      pm: 'view',
      pm_dpt: 'none',
      // pm_dpt_qr: 'edit',
      // pm_dpt_mdf: 'edit',
      // pm_dpt_mk: 'edit',
      // pm_dpt_st: 'view',
      pm_tpp: 'none',
      pm_gdp: 'edit',
      // pm_gdp_qr: 'edit',
      // pm_gdp_mdf: 'edit',
      // pm_gdp_st: 'edit',
    };

    sf(e);
  });
  // if (userName == 'test001' && password === md5('@123456')) {
  //   user = {
  //     id: 'test001',
  //     name: '测试用户',
  //     department: '无',
  //     privileges: {
  //       hm: 'view',
  //       pm: 'view',
  //       pm_dpt: 'none',
  //       // pm_dpt_qr: 'edit',
  //       // pm_dpt_mdf: 'edit',
  //       // pm_dpt_mk: 'edit',
  //       // pm_dpt_st: 'view',
  //       pm_tpp: 'none',
  //       pm_gdp: 'edit',
  //       // pm_gdp_qr: 'edit',
  //       // pm_gdp_mdf: 'edit',
  //       // pm_gdp_st: 'edit',
  //     },
  //   };
  // } else {
  //   user = null;
  // }

  return user;
}

function logout() {
  user = null;
  Logout(e => {
    window.location.reload();
  });
}

export { getUser, login, logout, getCurrentUser };
