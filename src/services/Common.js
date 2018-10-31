import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

export async function getRoadNamesFromData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/Common/getRoadNamesFromData`, params, sf, ef);
  return rt;
}