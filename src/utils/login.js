import { Login, Logout, GetUser } from '../services/Login';

let user = null;

// 异步获取当前session中是否存在用户
async function getCurrentUser() {
  if (!user) {
    let rt = await GetUser();
    if (rt && rt.data) {
      user = rt.data.Data;
    }
  }
  return user;
}

// 获取内存中的用户
function getUser() {
  return user;
}

// 登录
function login(userName, password, sf, ef) {
  Login(
    { userName, password },
    e => {
      user = e;
      console.log(e);
      sf(e);
    },
    ef
  );
}

function logout() {
  user = null;
  Logout(e => {
    window.location.reload();
  });
}

export { getUser, login, logout, getCurrentUser };
