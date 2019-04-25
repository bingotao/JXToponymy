// let baseUrl = 'http://localhost:52141';
let baseUrl = 'api';
let fileBasePath = `${baseUrl}/Files`;

let url_GetUserDistrictsTree = `${baseUrl}/Common/GetUserDistrictsTree`,
  url_GetNewGuid = `${baseUrl}/Common/GetGUID`,
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
  url_GetPictureUrls = `${baseUrl}/File/GetPictureUrls`,
  // 门牌统计
  url_GetUserWindows = `${baseUrl}/Common/GetUserWindows`,
  url_GetCreateUsers = `${baseUrl}/Common/GetCreateUsers`,
  url_GetMPBusinessDatas = `${baseUrl}/MPBusinessStatistic/GetMPBusinessDatas`,
  url_GetMPBusinessNumTJ = `${baseUrl}/MPBusinessStatistic/GetMPBusinessNumTJ`,
  url_GetMPProduceTJ = `${baseUrl}/Common/GetMPProduceTJ`,
  url_GetDistrictTreeFromData = `${baseUrl}/Common/getDistrictTreeFromData`,
  url_GetCommunityNamesFromData = `${baseUrl}/Common/getCommunityNamesFromData`,
  url_GetResidenceNamesFromData = `${baseUrl}/Common/getResidenceNamesFromData`,
  url_GetRoadNamesFromData = `${baseUrl}/Common/getRoadNamesFromData`,
  url_GetViligeNamesFromData = `${baseUrl}/Common/getViligeNamesFromData`,
  url_GetDistrictTreeFromDistrict = `${baseUrl}/Common/getDistrictTreeFromDistrict`,
  url_GetNamesFromDic = `${baseUrl}/Common/getNamesFromDic`,
  url_GetPostCodes = `${baseUrl}/Common/GetPostcodeByDID`,
  url_CheckResidenceMPIsAvailable = `${baseUrl}/MPModify/CheckResidenceMPIsAvailable`,
  url_CheckRoadMPIsAvailable = `${baseUrl}/MPModify/CheckRoadMPIsAvailable`,
  url_CheckCountryMPIsAvailable = `${baseUrl}/MPModify/CheckCountryMPIsAvailable`,
  url_ModifyResidenceMP = `${baseUrl}/MPModify/ModifyResidenceMP`,
  url_ModifyRoadMP = `${baseUrl}/MPModify/ModifyRoadMP`,
  url_ModifyCountryMP = `${baseUrl}/MPModify/ModifyCountryMP`,
  url_CancelResidenceMP = `${baseUrl}/MPModify/CancelResidenceMP`,
  url_CancelRoadMP = `${baseUrl}/MPModify/CancelRoadMP`,
  url_CancelCountryMP = `${baseUrl}/MPModify/CancelCountryMP`,
  url_GetConditionOfResidenceMP = `${baseUrl}/MPSearch/GetConditionOfResidenceMP`,
  url_ExportResidenceMP = `${baseUrl}/MPSearch/ExportResidenceMP`,
  url_GetConditionOfRoadMP = `${baseUrl}/MPSearch/GetConditionOfRoadMP`,
  url_ExportRoadMP = `${baseUrl}/MPSearch/ExportRoadMP`,
  url_GetConditionOfCountryMP = `${baseUrl}/MPSearch/GetConditionOfCountryMP`,
  url_ExportCountryMP = `${baseUrl}/MPSearch/ExportCountryMP`,
  url_GetLXMPProduce = `${baseUrl}/MPProduce/GetLXMPProduce`,
  url_ProduceLXMP = `${baseUrl}/MPProduce/ProduceLXMP`,
  url_GetPLMPProduce = `${baseUrl}/MPProduce/GetPLMPProduce`,
  url_ProducePLMP = `${baseUrl}/MPProduce/ProducePLMP`,
  // 路牌
  url_GetDirectionFromDic = `${baseUrl}/Common/GetDirectionFromDic`,
  url_GetRPBZDataFromData = `${baseUrl}/Common/GetRPBZDataFromData`,
  url_SearchRP = `${baseUrl}/RPSearch/SearchRP`,
  url_SearchRPByID = `${baseUrl}/RPSearch/SearchRPByID`,
  url_ModifyRP = `${baseUrl}/RPModify/ModifyRP`,
  url_SearchRPRepairByID = `${baseUrl}/RPModify/SearchRPRepairByID`,
  url_RepairOrChangeRP = `${baseUrl}/RPModify/RepairOrChangeRP`,
  //系统维护
  //字典维护
  url_SearchDist = `${baseUrl}/Common/SearchDist`,
  url_SearchDistByID = `${baseUrl}/Common/SearchDistByID`,
  url_ModifyDist = `${baseUrl}/Common/ModifyDist`,
  url_GetCountys = `${baseUrl}/Common/GetCountys`,
  url_DeleteDist = `${baseUrl}/Common/DeleteDist`,
  url_getDistrictTreeFromPostcodeData = `${baseUrl}/Common/getDistrictTreeFromPostcodeData`,
  url_getCommunityNames = `${baseUrl}/Common/getCommunityNames`,
  url_GetPostcodes = `${baseUrl}/Common/GetPostcodes`,
  url_GetPostcodeByID = `${baseUrl}/Common/GetPostcodeByID`,
  url_GetPostcodeByDID = `${baseUrl}/Common/GetPostcodeByDID`,
  url_ModifyPostcode = `${baseUrl}/Common/ModifyPostcode`,
  url_DeletePostcode = `${baseUrl}/Common/DeletePostcode`,
  url_GetDMBZFromDic = `${baseUrl}/Common/GetDMBZFromDic`,
  url_GetDMBZFromDicByID = `${baseUrl}/Common/GetDMBZFromDicByID`,
  url_GetMPType = `${baseUrl}/Common/GetMPType`,
  url_ModifyDMBZ = `${baseUrl}/Common/ModifyDMBZ`,
  url_DeleteDMBZ = `${baseUrl}/Common/DeleteDMBZ`,
  url_GetRPBZFromDic = `${baseUrl}/Common/GetRPBZFromDic`,
  url_GetRPBZFromDicByID = `${baseUrl}/Common/GetRPBZFromDicByID`,
  url_GetRPCategory = `${baseUrl}/Common/GetRPCategory`,
  url_ModifyRPBZ = `${baseUrl}/Common/ModifyRPBZ`,
  url_DeleteRPBZ = `${baseUrl}/Common/DeleteRPBZ`,
  url_GetDistrictTree = `${baseUrl}/Common/GetDistrictTree`,
  url_GetDistrictTreeFromRole = `${baseUrl}/Common/GetDistrictTreeFromRole`,
  url_SearchUser = `${baseUrl}/Common/SearchUser`,
  url_GetRoleList = `${baseUrl}/Common/GetRoleList`,
  url_ModifyUser = `${baseUrl}/Common/ModifyUser`,
  url_DeleteUser = `${baseUrl}/Common/DeleteUser`,
  url_SearchUserByID = `${baseUrl}/Common/SearchUserByID`,
  url_SearchRole = `${baseUrl}/Common/SearchRole`,
  url_SearchRoleByID = `${baseUrl}/Common/SearchRoleByID`,
  url_SearchPrivilige = `${baseUrl}/Common/SearchPrivilige`,
  url_ModifyRole = `${baseUrl}/Common/ModifyRole`,
  url_GetWindows = `${baseUrl}/Common/GetWindows`,
  url_GetRoleNames = `${baseUrl}/Common/GetRoleNames`,
  url_DeleteRole = `${baseUrl}/Common/DeleteRole`,
  //出具意见
  url_SearchPlaceName = `${baseUrl}/PlaceName/SearchDMOfZYSS`,
  url_CancelPlaceName = `${baseUrl}/PlaceName/CancelDMOfZYSS`,
  url_SearchPlaceNameByID = `${baseUrl}/PlaceName/SearchDMOfZYSSByID`,
  url_ModifyPlaceName = `${baseUrl}/PlaceName/ModifyDMOfZYSS`,
  url_GetPinyin = `${baseUrl}/PlaceName/GetPinyin`;

export {
  baseUrl,
  fileBasePath,
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
  url_GetPictureUrls,
  url_GetUserWindows,
  url_GetCreateUsers,
  url_GetMPBusinessDatas,
  url_GetDistrictTreeFromData,
  url_GetCommunityNamesFromData,
  url_GetResidenceNamesFromData,
  url_GetRoadNamesFromData,
  url_GetViligeNamesFromData,
  url_GetDistrictTreeFromDistrict,
  url_GetNamesFromDic,
  url_GetPostCodes,
  url_CheckResidenceMPIsAvailable,
  url_CheckRoadMPIsAvailable,
  url_CheckCountryMPIsAvailable,
  url_ModifyResidenceMP,
  url_ModifyRoadMP,
  url_ModifyCountryMP,
  url_CancelResidenceMP,
  url_CancelRoadMP,
  url_CancelCountryMP,
  url_GetConditionOfResidenceMP,
  url_ExportResidenceMP,
  url_GetConditionOfRoadMP,
  url_ExportRoadMP,
  url_GetConditionOfCountryMP,
  url_ExportCountryMP,
  url_GetLXMPProduce,
  url_ProduceLXMP,
  url_GetPLMPProduce,
  url_ProducePLMP,
  // 路牌
  url_GetDirectionFromDic,
  url_GetRPBZDataFromData,
  url_SearchRP,
  url_SearchRPByID,
  url_ModifyRP,
  url_SearchRPRepairByID,
  url_RepairOrChangeRP,
  url_GetMPBusinessNumTJ,
  url_GetMPProduceTJ,
  //系统维护
  url_SearchDist,
  url_SearchDistByID,
  url_ModifyDist,
  url_GetCountys,
  url_DeleteDist,
  url_getDistrictTreeFromPostcodeData,
  url_GetPostcodes,
  url_GetPostcodeByID,
  url_GetPostcodeByDID,
  url_getCommunityNames,
  url_ModifyPostcode,
  url_DeletePostcode,
  url_GetDMBZFromDic,
  url_GetDMBZFromDicByID,
  url_GetMPType,
  url_ModifyDMBZ,
  url_DeleteDMBZ,
  url_GetRPBZFromDic,
  url_GetRPBZFromDicByID,
  url_GetRPCategory,
  url_ModifyRPBZ,
  url_DeleteRPBZ,
  url_GetDistrictTree,
  url_SearchUser,
  url_GetRoleList,
  url_ModifyUser,
  url_DeleteUser,
  url_SearchUserByID,
  url_SearchRole,
  url_SearchRoleByID,
  url_SearchPrivilige,
  url_ModifyRole,
  url_GetWindows,
  url_GetRoleNames,
  url_DeleteRole,
  //出具意见
  url_SearchPlaceName,
  url_CancelPlaceName,
  url_SearchPlaceNameByID,
  url_ModifyPlaceName,
  url_GetPinyin,
};
