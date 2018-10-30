import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

export async function getRPRepairList(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPRepair/SearchRPRepairByID`, params, sf, ef);
  return rt;
}
