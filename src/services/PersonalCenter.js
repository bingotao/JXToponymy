import { baseUrl } from '../common/urls';
import { Post } from '../utils/request';

/*
说明：个人首页统计数据上
参数：HomePage/GetHomePageTotalData()
*/
export async function GetHomePageTotalData(sf, ef) {
  let rt = await Post(`${baseUrl}/HomePage/GetHomePageTotalData`, sf, ef);
  return rt;
}

/*
说明：个人首页统计数据下
参数：根据时间段
HomePage/GetHomePageDetailData(DateTime start, DateTime end)
*/
export async function GetHomePageDetailData(params, sf, ef) {
  let rt = await Post(`${baseUrl}/HomePage/GetHomePageDetailData`, params, sf, ef);
  return rt;
}

/*
说明：获取待办项目
参数：HomePage/GetTodoItems(string sbly, string lx)
*/
export async function GetTodoItems(params, sf, ef) {
  let rt = await Post(`${baseUrl}/HomePage/GetTodoItems`, params, sf, ef);
  return rt;
}

/*
说明：获取已办项目
参数：GetDoneItems(string sbly, string lx, DateTime start, DateTime end)
*/
export async function GetDoneItems(params, sf, ef) {
  let rt = await Post(`${baseUrl}/HomePage/GetDoneItems`, params, sf, ef);
  return rt;
}
