import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

export async function Login(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/Login`, params, sf, ef);
  return rt;
}

export async function Logout(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/Logout`, null, sf, ef);
  return rt;
}

export async function GetUser(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetUser`, null, sf, ef);
  return rt;
}
