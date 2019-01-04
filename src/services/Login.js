import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

export async function Login(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/LoginTmp`, params, sf, ef);
  return rt;
}

export async function Logout(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/Logout`, null, sf, ef);
  return rt;
}

export async function GetUser(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetCurrentUser`, null, sf, ef);
  return rt;
}

export async function GetUserWithPrivs(id, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetUserWithPrivs`, { id: id }, sf, ef);
  return rt;
}

export async function GetCPrivileges(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetCPrivileges`, null, sf, ef);
  return rt;
}

export async function GetPrivilege(id, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetPrivilege`, { id: id }, sf, ef);
  return rt;
}

export async function ModifyPrivilege(obj, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/ModifyPrivilege`, { json: JSON.stringify(obj) }, sf, ef);
  return rt;
}

export async function GetCRoles(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetCRoles`, null, sf, ef);
  return rt;
}

export async function GetCRole(id, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetCRole`, { id: id }, sf, ef);
  return rt;
}

export async function ModifyCRole(obj, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/ModifyCRole`, { json: JSON.stringify(obj) }, sf, ef);
  return rt;
}

export async function DeleteCRole(id, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/DeleteCRole`, { id: id }, sf, ef);
  return rt;
}

export async function GetDistrictTree(sf, ef) {
  let rt = await Post(`${baseUrl}/Login/GetDistrictTree`, null, sf, ef);
  return rt;
}

export async function ModifyUser(obj, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/ModifyUser`, { json: JSON.stringify(obj) }, sf, ef);
  return rt;
}

export async function ModifyPassword(obj, sf, ef) {
  let rt = await Post(`${baseUrl}/Login/ModifyPassword`, obj, sf, ef);
  return rt;
}
