import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
List<string> IDs, string MPType, string CertificateType
MPType:住宅门牌、道路门牌 、农村门牌；CertificateType：门牌证、地址证明
*/
export async function MPCertificate(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPModify/MPCertificate`, params, sf, ef);
  return rt;
}

/*
List<string> IDs, string MPType
*/
export async function DZZMPrint(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPModify/DZZMPrint`, params, sf, ef);
  return rt;
}

/*
List<string> IDs, string MPType
*/
export async function MPZPrint(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPModify/MPZPrint`, params, sf, ef);
  return rt;
}
