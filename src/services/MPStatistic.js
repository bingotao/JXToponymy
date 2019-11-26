import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：个人统计
参数：int PageSize, int PageNum, DateTime? start, DateTime? end, string Window, string CreateUser, int CertificateType = Enums.CertificateType.All
CertificateType=0 所有；CertificateType=1地名证明开具；CertificateType=2 门牌证打印
*/
export async function getMPBusinessUserTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetMPBusinessUserTJ`, params, sf, ef);
  return rt;
}
export async function GetConditionOfMPBusinessUserTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetConditionOfMPBusinessUserTJ`, params, sf, ef);
  return rt;
}


/*
说明：数量统计
参数：int PageSize, int PageNum, DateTime? start, DateTime? end, string DistrictID, int CertificateType = Enums.CertificateType.All)
CertificateType=0 所有；CertificateType=1地名证明开具；CertificateType=2 门牌证打印
*/
export async function getMPBusinessNumTJ(params, sf, ef) {
    let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetMPBusinessNumTJ`, params, sf, ef);
    return rt;
}
export async function GetConditionOfMPBusinessNumTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetConditionOfMPBusinessNumTJ`, params, sf, ef);
  return rt;
}

/*
说明：地名统计
参数：int PageSize, int PageNum,string DMType,string ItemType, DateTime? start, DateTime? end, string DistrictID
*/
export async function GetDMBusinessTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/DMBusinessStatistic/GetDMBusinessTJ`, params, sf, ef);
  return rt;
}
export async function GetConditionOfDMBusinessTJ(params, sf, ef) {
let rt = await Post(`${baseUrl}/DMBusinessStatistic/GetConditionOfDMBusinessTJ`, params, sf, ef);
return rt;
}

/*
说明：门牌统计
参数：int PageSize, int PageNum, string DistrictID, string CommunityName, DateTime? start, DateTime? end
*/
export async function getMPProduceTJ(params, sf, ef) {
    let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetMPProduceTJ`, params, sf, ef);
    return rt;
}
export async function GetConditionOfMPProduceTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetConditionOfMPProduceTJ`, params, sf, ef);
  return rt;
}
