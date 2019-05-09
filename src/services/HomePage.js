import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：数据同步
参数：CheckSBInformation(string ID, string lx)
*/
export async function CheckSBInformation(params, sf, ef) {
  let rt = await Post(`${baseUrl}/HomePage/CheckSBInformation`, params, sf, ef);
  return rt;
}