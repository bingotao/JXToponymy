import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

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
说明：查看所有已制作
参数：int PageSize, int PageNum
*/
export async function getProducedLXMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedLXMP`, params, sf, ef);
  return rt;
}

/*
说明：查看所有未制作
参数：int PageSize, int PageNum
*/
export async function getNotProducedLXMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetNotProducedLXMP`, params, sf, ef);
  return rt;
}

/*
说明：勾选进行制作
参数：List<NotProducedLXMPList> mpLists
*/
export async function produceLXMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/ProduceLXMP`, params, sf, ef);
  return rt;
}

/*
说明：操作里面查看一条已制作记录
参数：ProducedLXMPList producedLXMPList
*/
export async function getProducedLXMPDetails(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedLXMPDetails`, params, sf, ef);
  return rt;
}

/*
说明：查看所有已制作
参数：int PageSize, int PageNum
*/
export async function getProducedPLMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedPLMP`, params, sf, ef);
  return rt;
}

/*
说明：查看所有未制作
参数：int PageSize, int PageNum
*/
export async function getNotProducedPLMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetNotProducedPLMP`, params, sf, ef);
  return rt;
}


/*
说明：勾选进行制作
参数：List<NotProducedPLMPList> mpLists
*/
export async function producePLMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/ProducePLMP`, params, sf, ef);
  return rt;
}

/*
说明：操作里面查看一条已制作记录
参数：ProducedPLMPList producedPLMPList
*/
export async function getProducedPLMPDetails(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedPLMPDetails`, params, sf, ef);
  return rt;
}





