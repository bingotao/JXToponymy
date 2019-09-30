import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';
import { success } from '../utils/notification';
/*
List<string> IDs, string MPType, string CertificateType
MPType:住宅门牌、道路门牌 、农村门牌；CertificateType：门牌证、地址证明
*/
export async function MPCertificate(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPModify/MPCertificate`, params, sf, ef);
  return rt;
}

export async function MPZPrint_pdfjs(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPModify/MPZPrint_pdfjs`, params, sf, ef);
  return rt;
}


let urlDZZMPrint = `${baseUrl}/MPModify/DZZMPrint`;
let urlMPZPrint = `${baseUrl}/MPModify/MPZPrint`;

export function DZZMPrint(params, sf, ef) {
  MPCertificate(
    params,
    e => {
      success('地址证明文件生成成功，马上前往下载！');
      setTimeout(e => {
        window.open(urlDZZMPrint);
      }, 2000);
      sf && sf();
    },
    ef
  );
}

export function MPZPrint(params, sf, ef) {
  MPCertificate(
    params,
    e => {
      success('门牌证文件生成成功，马上前往下载！');
      setTimeout(e => {
        window.open(urlMPZPrint);
      }, 2000);
      sf && sf();
    },
    ef
  );
}

export async function GetMPZPrint_cj(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPModify/MPZPrint_cj`, params, sf, ef);
  return rt;
}

export async function GetCommunityStandardAddress(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPModify/GetCommunityStandardAddress`, params, sf, ef);
  return rt;
}

export async function GetHKXX(params, sf, ef) {
  let rt = await Post(`${baseUrl}/DataShare/GetHKXX`, params, sf, ef);
  return rt;
}
export async function GetYYZZXX(params, sf, ef) {
  let rt = await Post(`${baseUrl}/DataShare/GetYYZZXX`, params, sf, ef);
  return rt;
}
export async function GetBDCXX(params, sf, ef) {
  let rt = await Post(`${baseUrl}/DataShare/GetBDCXX`, params, sf, ef);
  return rt;
}
