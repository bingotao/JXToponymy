import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：村社区名、自然村名从字典表中取
参数：int type, string CountyID, string NeighborhoodsID, string CommunityName
type=1 获取住字典表中的小区名；type=2 获取字典表中的道路名；type=3 获取字典表中的自然村名；type=4 获取字典表中的社区名（此时CommunityName参数为空）
*/
export async function getNamesFromDic(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/getNamesFromDic`, params, sf, ef);
  return rt;
}

/*
说明：道路名从已有数据中取
参数：int type, string CountyID, string NeighborhoodsID, string CommunityName
type=2 获取道路门牌中的道路名； type=5 获取路牌中的道路名
*/
export async function getRoadNamesFromData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/getRoadNamesFromData`, params, sf, ef);
  return rt;
}

/*
说明：获取受理窗口
参数：无
*/
export async function getUserWindows(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/GetUserWindows`, params, sf, ef);
  return rt;
}

/*
说明：获取用户
参数：string window
*/
export async function getCreateUsers(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/GetCreateUsers`, params, sf, ef);
  return rt;
}

/*
说明：个人统计
参数：int PageSize, int PageNum, DateTime? start, DateTime? end, string Window, string CreateUser, string CertificateType
CertificateType="地名证明"或者“门牌证”
*/
export async function getMPBusinessUserTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPBusinessStatistic/GetMPBusinessUserTJ`, params, sf, ef);
  return rt;
}

/*
说明：从数据中获取行政区（包含所有门牌的获取）
参数：int type
type=1 住宅   type=2 道路   type=3 农村   type=6 三类门牌所有  type=5 路牌    type=7 专业设施地名   
*/
export async function getDistrictTreeFromData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/getDistrictTreeFromData`, params, sf, ef);
  return rt;
}

/*
说明：从数据中获取行政区（所有门牌）
参数：int type,string NeighborhoodsID
type=1 住宅   type=2 道路   type=3 农村   type=6 三类门牌所有  type=5 路牌
*/
export async function getCommunityNamesFromData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/getCommunityNamesFromData`, params, sf, ef);
  return rt;
}

/*
说明：维修信息
参数：string Category
*/
export async function getRPBZDataFromDic(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/GetRPBZDataFromDic`, params, sf, ef);
  return rt;
}

/*
说明：维修内容
参数：无
*/
export async function getRepairContentFromDic(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/GetRepairContentFromDic`, params, sf, ef);
  return rt;
}


/*
说明：根据道路名，获取交叉路口
参数：GetIntersectionFromData(string RoadName)
*/
export async function getIntersectionFromData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/GetIntersectionFromData`, params, sf, ef);
  return rt;
}
// /*
// 说明：从数据中获取社区名称 type=5 从路牌数据库中筛选村社区
// 参数：Common/getCommunityNamesFromData(int type, string NeighborhoodsID) 
// */
// export async function getCommunityNamesFromData(params, sf, ef) {
//   let rt = await Post(`${baseUrl}/Common/getCommunityNamesFromData`, params, sf, ef);
//   return rt;
// }