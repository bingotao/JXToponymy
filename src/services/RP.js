import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

export async function getRPRepairList(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/SearchRPRepairByID`, params, sf, ef);
  return rt;
}

export async function getRPRepair(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/SearchRPRepairDetailByID`, params, sf, ef);
  return rt;
}

export async function getNewRPRepair(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/GetNewRPRepair`, params, sf, ef);
  return rt;
}