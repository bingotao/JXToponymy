import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：根据路牌ID获取未修复、已修复或者全部的的维修记录
参数：string ID, int RPRange = Enums.RPRange.All
RPRange =0为未修复，RPRange =1为已修复，RPRange =2为所有，默认为所有
*/
export async function getRPRepairList(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/SearchRPRepairByID`, params, sf, ef);
  return rt;
}

/*
说明：根据路牌维修ID获取路牌的维修记录详情及路牌的基本信息
参数：string RepairID
*/
export async function getRPRepair(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/SearchRPRepairDetailByID`, params, sf, ef);
  return rt;
}

/*
说明：获取新的RPRepair
参数：string RPID
*/
export async function getNewRPRepair(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/GetNewRPRepair`, params, sf, ef);
  return rt;
}

/*
说明：根据ID删除RPRepair
参数：string RepairID
*/
export async function deleteRPRepair(params, sf, ef)
{
  let rt = await Post(`${baseUrl}/RPRepair/DeleteRPRepairByID`, params, sf, ef);
  return rt;
}

/*
说明：维修或更换路牌
参数：string oldDataJson
*/
export async function saveRPRepair(params, sf, ef)
{
  let rt = await Post(`${baseUrl}/RPRepair/RepairOrChangeRP`, params, sf, ef);
  return rt;
}