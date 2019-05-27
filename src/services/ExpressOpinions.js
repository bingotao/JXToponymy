import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：根据行政区划从地名表中获取地名类别
参数：
*/
export async function GetDMTypesFromData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/PlaceName/GetDMTypesFromData`, params, sf, ef);
  return rt;
}

export async function GetConditionOfPlaceName(params, sf, ef) {
  let rt = await Post(`${baseUrl}/PlaceName/GetConditionOfDMOfZYSS`, params, sf, ef);
  return rt;
}
