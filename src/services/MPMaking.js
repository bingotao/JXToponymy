import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：获取门牌制作数据
参数：int PageSize, int PageNum, int LXMPProduceComplete
LXMPProduceComplete=1 已制作；LXMPProduceComplete=0 未制作
*/
export async function getLXMPProduce(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetLXMPProduce`, params, sf, ef);
  return rt;
}

/*
说明：多条选中后制作，生成零星门牌汇总表
参数：List<LXMPProduceList> mpLists
*/
export async function produceLXMP() {
  let rt = await Post(`${baseUrl}/MPProduce/ProduceLXMP`, params, sf, ef);
  return rt;
}

/*
说明：获取门牌制作数据
参数：int PageSize, int PageNum, int LXMPProduceComplete
PLMPProduceComplete=1 PLMPProduceComplete=0 未制作
*/
export async function getPLMPProduce(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetPLMPProduce`, params, sf, ef);
  return rt;
}

/*
说明：批量选中后制作，生成零星门牌汇总表
参数：List<LXMPProduceList> mpLists
*/
export async function producePLMP() {
  let rt = await Post(`${baseUrl}/MPProduce/ProducePLMP`, params, sf, ef);
  return rt;
}
