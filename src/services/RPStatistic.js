import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：数量统计
参数：int PageSize, int PageNum, string start, string end, string DistrictID, string CommunityName, string RoadName, string Model, string Material, string Size
*/
export async function getRPNumTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPBusinessStatistic/GetRPNumTJ`, params, sf, ef);
  return rt;
}

/*
说明：维护统计
参数：int PageSize, int PageNum, string DistrictID, string CommunityName, int RepairMode, int RepairedCount, string RepairParts, string RepairContent, string RepairFactory, int isFinishRepair, string FinishTimeStart, string FinishTimeEnd
*/
export async function getRPRepairTJ(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPBusinessStatistic/GetRPRepairTJ`, params, sf, ef);
  return rt;
}