let baseUrl = 'http://localhost:52141/';

let url_GetUserDistrictsTree = `${baseUrl}/Common/GetUserDistrictsTree`,
  url_GetNewGuid = `${baseUrl}/MPModify/GetGUID`,
  url_SearchResidenceMP = `${baseUrl}/MPSearch/SearchResidenceMP`,
  url_SearchResidenceMPByID = `${baseUrl}/MPSearch/SearchResidenceMPByID`,
  url_SearchRoadMP = `${baseUrl}/MPSearch/SearchRoadMP`,
  url_SearchRoadMPByID = `${baseUrl}/MPSearch/SearchRoadMPByID `,
  url_SearchCountryMP = `${baseUrl}/MPSearch/SearchCountryMP`,
  url_SearchCountryMPID = `${baseUrl}/MPSearch/SearchCountryMPID`,
  // 获取门牌规格，mpType：住宅1，道路2，农村3，全部0
  url_GetMPSizeByMPType = `${baseUrl}/Common/GetMPSizeByMPType`,
  url_UploadPicture = `${baseUrl}/File/UploadPicture`,
  url_RemovePicture = `${baseUrl}/File/RemovePicture`,

  url_GetUserWindows = `${baseUrl}/Common/GetUserWindows`,
  url_GetCreateUsers = `${baseUrl}/Common/GetCreateUsers`,
  url_GetMPBusinessDatas = `${baseUrl}/MPBusinessStatistic/GetMPBusinessDatas`;

export {
  baseUrl,
  url_GetUserDistrictsTree,
  url_GetNewGuid,
  url_SearchResidenceMP,
  url_SearchResidenceMPByID,
  url_SearchRoadMP,
  url_SearchRoadMPByID,
  url_SearchCountryMP,
  url_SearchCountryMPID,
  url_GetMPSizeByMPType,
  url_UploadPicture,
  url_RemovePicture,
  url_GetUserWindows, url_GetCreateUsers, url_GetMPBusinessDatas,
};
