import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';
import { success } from '../utils/notification';

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
说明：查看看批量导入已制作
参数：int PageSize, int PageNum
*/
export async function getProducedPLMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedPLMP`, params, sf, ef);
  return rt;
}
/*
说明：查看批量导入已制作总表
参数：int PageSize, int PageNum
*/
export async function getProducedPLMP_T(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedPLMP_T`, params, sf, ef);
  return rt;
}

/*
说明：查看批量导入已制作详细信息
参数：int PageSize, int PageNum
*/
export async function getProducedPLMP_D(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetProducedPLMP_D`, params, sf, ef);
  return rt;
}



/*
说明：查看批量导入未制作信息
参数：int PageSize, int PageNum
*/
export async function getNotProducedPLMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetNotProducedPLMP`, params, sf, ef);
  return rt;
}

/*
说明：查看批量导入未制作总表
参数：int PageSize, int PageNum
*/
export async function getNotProducedPLMP_T(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetNotProducedPLMP_T`, params, sf, ef);
  return rt;
}

/*
说明：查看批量导入未制作详细信息
参数：int PageSize, int PageNum
*/
export async function getNotProducedPLMP_D(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetNotProducedPLMP_D`, params, sf, ef);
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

/*
零星门牌制作，条件上传
List<string> MPIDs, string MPType:住宅门牌、道路门牌 、农村门牌
*/
export async function GetConditionForProduceLXMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetConditionForProduceLXMP`, params, sf, ef);
  return rt;
}

let urlProduceLXMP = `${baseUrl}/MPProduce/ProduceLXMP`;

/*
零星门牌制作
*/
export function ProduceLXMP(params, sf, ef) {
  GetConditionForProduceLXMP(
    params,
    e => {
      success('制作表生成完毕，马上前往下载！');
      setTimeout(e => {
        window.open(urlProduceLXMP);
      }, 2000);
      sf && sf();
    },
    ef
  );
}

/*
查看零星门牌制作表
*/
export function GetProducedLXMPDetails(id) {
  window.open(`${baseUrl}/MPProduce/GetProducedLXMPDetails?LXProduceID=${id}`);
}

/*
批量门牌制作，条件上传
List<string> PLIDs, string MPType
*/
export async function GetConditionForProducePLMP(params, sf, ef) {
  let rt = await Post(`${baseUrl}/MPProduce/GetConditionForProducePLMP`, params, sf, ef);
  return rt;
}

let urlProducePLMP = `${baseUrl}/MPProduce/ProducePLMP`;

/*
批量门牌制作
*/
export function ProducePLMP(params, sf, ef) {
  GetConditionForProducePLMP(
    params,
    e => {
      success('制作表生成完毕，马上前往下载！');
      setTimeout(e => {
        window.open(urlProducePLMP);
      }, 2000);
      sf && sf();
    },
    ef
  );
}

/*
查看批量门牌制作表
*/
export function GetProducedPLMPDetails(id) {
  window.open(`${baseUrl}/MPProduce/GetProducedPLMPDetails?PLProduceID=${id}`);
}
