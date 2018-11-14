import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：根据ID注销路牌
参数：List<string> IDs
*/
export async function cancelRP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPModify/CancelRP`, params, sf, ef);
  return rt;
}

/*
说明：传递参数给后台供门牌下载使用
参数：同路牌查询参数
*/
export async function upRPDownloadCondition(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPSearch/GetConditionOfRP`, params, sf, ef);
  return rt;
}

/*
说明：传递参数给后台供二维码下载使用
参数：List<string> rpids
*/
export async function upQRDownloadCondition(params, sf, ef) {
  let rt = await Post(`${baseUrl}/RPSearch/GetConditionOfRPIDS`, params, sf, ef);
  return rt;
}
