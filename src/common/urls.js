let baseUrl = 'http://localhost:52141/';

let url_GetDistrictsTree = `${baseUrl}/Common/GetUserDistrictsTree`,
  url_SearchResidenceMP = `${baseUrl}/MPSearch/SearchResidenceMP`,
  url_SearchResidenceMPByID = `${baseUrl}/MPSearch/SearchResidenceMPByID`,
  // 获取门牌规格，mpType：住宅1，道路2，农村3，全部0
  url_GetMPSizeByMPType = `${baseUrl}/Common/GetMPSizeByMPType`,
  url;

export {
  baseUrl,
  url_GetDistrictsTree,
  url_SearchResidenceMP,
  url_SearchResidenceMPByID,
  url_GetMPSizeByMPType,
};
