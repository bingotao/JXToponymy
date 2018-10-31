import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：根据ID注销门牌
参数：List<string> IDs
*/
export async function cancelRP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPModify/CancelRP`, params, sf, ef);
  return rt;
}