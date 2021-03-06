// let baseUrl = 'http://localhost:52141';
let baseUrl = 'api';
let fileBasePath = `${baseUrl}/Files`;

let url_GetUserDistrictsTree = `${baseUrl}/Common/GetUserDistrictsTree`,
    url_GetNewGuid = `${baseUrl}/Common/GetGUID`,
    url_SearchResidenceMP = `${baseUrl}/MPSearch/SearchResidenceMP`,
    url_SearchRoadMP = `${baseUrl}/MPSearch/SearchRoadMP`,
    url_SearchResidenceMPByID = `${baseUrl}/MPSearch/SearchResidenceMPByID`,
    url_SearchRoadMPByID = `${baseUrl}/MPSearch/SearchRoadMPByID`,
    url_SearchCountryMPID = `${baseUrl}/MPSearch/SearchCountryMPID`,
    url_SearchCountryMP = `${baseUrl}/MPSearch/SearchCountryMP`,
    // 获取门牌规格，mpType：住宅1，道路2，农村3，全部0
    url_GetMPSizeByMPType = `${baseUrl}/Common/GetMPSizeByMPType`,
    url_UploadPicture = `${baseUrl}/File/UploadPicture`,
    url_RemovePicture = `${baseUrl}/File/RemovePicture`,
    url_GetPictureUrls = `${baseUrl}/File/GetPictureUrls`,
    // 门牌统计
    url_GetUserWindows = `${baseUrl}/Common/GetUserWindows`,
    url_GetCreateUsers = `${baseUrl}/Common/GetCreateUsers`,
    url_GetMPBusinessDatas = `${baseUrl}/MPBusinessStatistic/GetMPBusinessDatas`,
    url_GetMPBusinessNumTJ = `${baseUrl}/MPBusinessStatistic/GetMPBusinessNumTJ`, // 业务统计
    url_ExportMPBusinessUserTJ = `${baseUrl}/MPBusinessStatistic/ExportMPBusinessUserTJ`,
    url_ExportMPBusinessNumTJ = `${baseUrl}/MPBusinessStatistic/ExportMPBusinessNumTJ`,
    url_ExportMPProduceTJ = `${baseUrl}/MPBusinessStatistic/ExportMPProduceTJ`,
    url_GetCurrentUserInfo = `${baseUrl}/MPBusinessStatistic/GetCurrentUserInfo`,
    url_GetMPProduceTJ = `${baseUrl}/Common/GetMPProduceTJ`,
    url_GetDistrictTreeFromData = `${baseUrl}/Common/getDistrictTreeFromData`,
    url_GetCommunityNamesFromData = `${baseUrl}/Common/getCommunityNamesFromData`,
    url_GetResidenceNamesFromData = `${baseUrl}/Common/getResidenceNamesFromData`,
    url_GetRoadNamesFromData = `${baseUrl}/Common/getRoadNamesFromData`,
    url_GetViligeNamesFromData = `${baseUrl}/Common/getViligeNamesFromData`,
    url_GetDistrictTreeFromDistrict = `${baseUrl}/Common/getDistrictTreeFromDistrict`, // 返回三级树
    url_GetDistrictSecondFromData = `${baseUrl}/Common/getDistrictSecondFromData`, // 返回二级树
    url_GetDistrictTree = `${baseUrl}/Common/GetDistrictTree`, // 所跨行政区
    url_GetNamesFromDic = `${baseUrl}/Common/getNamesFromDic`,
    url_GetPostCodes = `${baseUrl}/Common/GetPostcodeByDID`,
    // 门牌-验证地址
    url_CheckResidenceMPIsAvailable = `${baseUrl}/MPModify/CheckResidenceMPIsAvailable`,
    url_CheckRoadMPIsAvailable = `${baseUrl}/MPModify/CheckRoadMPIsAvailable`,
    url_CheckCountryMPIsAvailable = `${baseUrl}/MPModify/CheckCountryMPIsAvailable`,
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
    url_ExportRPNumTJ = `${baseUrl}/RPBusinessStatistic/ExportRPNumTJ`,
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
    // url_GetDistrictTree = `${baseUrl}/Common/GetDistrictTree`,
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
    url_GetPinyin = `${baseUrl}/PlaceName/GetPinyin`,
    //地名-居民点
    //拟用名称查询
    url_SettlementNameDM = `${baseUrl}/DMModify/SettlementNameDM`,
    url_BuildingNameDM = `${baseUrl}/DMModify/BuildingNameDM`,
    url_RoadNameDM = `${baseUrl}/DMModify/RoadNameDM`,
    url_BridgeNameDM = `${baseUrl}/DMModify/BridgeNameDM`,
    /* 门牌申请、变更、编辑 MPModify */
    url_ModifyResidenceMP = `${baseUrl}/MPModify/ModifyResidenceMP`, // 修改住宅门牌
    url_ModifyRoadMP = `${baseUrl}/MPModify/ModifyRoadMP`, // 修改道路门牌
    url_ModifyCountryMP = `${baseUrl}/MPModify/ModifyCountryMP`, // 修改农村门牌

    url_ModifyResidenceMPByList = `${baseUrl}/MPModify/ModifyResidenceMPByList`, // 住宅门牌批量打印
    url_ModifyCountryMPByList = `${baseUrl}/MPModify/ModifyCountryMPByList`, // 农村门牌批量打印
    url_ModifyRoadMPByList = `${baseUrl}/MPModify/ModifyRoadMPByList`, // 住宅门牌批量打印

    url_CancelResidenceMP = `${baseUrl}/MPModify/CancelResidenceMP`, // 注销一个住宅门牌
    url_CancelResidenceMPByList = `${baseUrl}/MPModify/CancelResidenceMPByList`, // 批量注销住宅门牌
    url_CancelRoadMP = `${baseUrl}/MPModify/CancelRoadMP`, // 注销一个道路门牌
    url_CancelRoadeMPByList = `${baseUrl}/MPModify/CancelRoadeMPByList`, // 批量注销道路门牌
    url_CancelCountryMP = `${baseUrl}/MPModify/CancelCountryMP`, // 注销一个农村门牌
    url_CancelCountryMPByList = `${baseUrl}/MPModify/CancelCountryMPByList`, // 批量注销农村门牌
    /* 门牌搜索 MPSearch */
    url_SearchRoadMPByName = `${baseUrl}/MPSearch/SearchRoadMPByName`,
    // 根据门牌证号查询一条居民点门牌
    url_SearchResidenceMPByAddressCoding = `${baseUrl}/MPSearch/SearchResidenceMPByAddressCoding`,
    // 根据门牌证号查询一条道路门牌
    url_SearchRoadMPByAddressCoding = `${baseUrl}/MPSearch/SearchRoadMPByAddressCoding`,
    // 根据门牌证号查询一条农村门牌
    url_SearchCountryMPByAddressCoding = `${baseUrl}/MPSearch/SearchCountryMPByAddressCoding`,
    /* 地名管理 */
    url_SearchPinyinDM = `${baseUrl}/DMModify/SearchPinyinDM`, //查询拼音
    url_SearchSettlementDMByID = `${baseUrl}/DMModify/SearchSettlementDMByID`, //根据ID查询地名
    url_SearchBuildingDMByID = `${baseUrl}/DMModify/SearchBuildingDMByID`,
    url_SearchRoadDMByID = `${baseUrl}/DMModify/SearchRoadDMByID`,
    url_SearchBridgeDMByID = `${baseUrl}/DMModify/SearchBridgeDMByID`,
    // 地名查询
    url_SearchSettlementDM = `${baseUrl}/DMModify/SearchSettlementDM`, //居民点地名查询
    url_SearchBuildingDM = `${baseUrl}/DMModify/SearchBuildingDM`, //建筑物地名查询
    url_SearchRoadDM = `${baseUrl}/DMModify/SearchRoadDM`, //道路街巷地名查询
    url_SearchBridgeDM = `${baseUrl}/DMModify/SearchBridgeDM`, //桥梁地名查询
    // 地名受理
    url_ModifySettlementDM = `${baseUrl}/DMModify/ModifySettlementDM`, //地名受理-居民点-数据修改（包括新增和更新）
    url_ModifyBuildingDM = `${baseUrl}/DMModify/ModifyBuildingDM`, //地名受理-建筑物-数据修改（包括新增和更新）
    url_ModifyRoadDM = `${baseUrl}/DMModify/ModifyRoadDM`,
    url_ModifyBridgeDM = `${baseUrl}/DMModify/ModifyBridgeDM`,
    // 地名导出
    url_GetConditionOfSettlementDM = `${baseUrl}/DMModify/GetConditionOfSettlementDM`,
    url_GetConditionOfBuildingDM = `${baseUrl}/DMModify/GetConditionOfBuildingDM`,
    url_GetConditionOfRoadDM = `${baseUrl}/DMModify/GetConditionOfRoadDM`,
    url_GetConditionOfBridgeDM = `${baseUrl}/DMModify/GetConditionOfBridgeDM`,
    url_DownloadSettlementDM = `${baseUrl}/DMModify/DownloadSettlementDM`,
    url_DownloadBuildingDM = `${baseUrl}/DMModify/DownloadBuildingDM`,
    url_DownloadRoadDM = `${baseUrl}/DMModify/DownloadRoadDM`,
    url_DownloadBridgeDM = `${baseUrl}/DMModify/DownloadBridgeDM`,
    url_ExportBridgeDM = `${baseUrl}/DMModify/ExportBridgeDM`,
    url_ExportHouseDM = `${baseUrl}/DMModify/ExportHouseDM`,
    url_ExportSettlementDM = `${baseUrl}/DMModify/ExportSettlementDM`,
    url_ExportRoadDM = `${baseUrl}/DMModify/ExportRoadDM`,

    url_SearchSettlementDMByDMCode = `${baseUrl}/DMModify/SearchSettlementDMByDMCode`,
    url_SearchBridgeDMByDMCode = `${baseUrl}/DMModify/SearchBridgeDMByDMCode`,
    url_SearchRoadDMByDMCode = `${baseUrl}/DMModify/SearchRoadDMByDMCode`,
    url_SearchBuildingDMByDMCode = `${baseUrl}/DMModify/SearchBuildingDMByDMCode`,

    // 地名删除
    url_DeleteSettlementDM = `${baseUrl}/DMModify/DeleteSettlementDM`, // 删除居民点地名
    url_DeleteBuildingDM = `${baseUrl}/DMModify/DeleteBuildingDM`, // 删除建筑物地名
    url_DeleteRoadDM = `${baseUrl}/DMModify/DeleteRoadDM`,
    url_DeleteBridgeDM = `${baseUrl}/DMModify/DeleteBridgeDM`,
    // 地名统计
    url_ExportBusinessTJ = `${baseUrl}/DMBusinessStatistic/ExportBusinessTJ`,

    /* 个人中心 */
    // url_GetPersonTodoBusinessTJ = `${baseUrl}/Person/GetPersonTodoBusinessTJ`,
    url_GetPersonMPByID = `${baseUrl}/Person/GetPersonMPByID`,
    url_GetPersonDMByID = `${baseUrl}/Person/GetPersonDMByID`,
    // 个人中心-退件
    url_DeletePersonMP = `${baseUrl}/Person/DeletePersonMP`,
    url_DeletePersonDM = `${baseUrl}/Person/DeletePersonDM`,
    // 个人中心-一网一端-已办
    url_GetTJByDistinct = `${baseUrl}/Person/GetTJByDistinct`,
    url_GetPersonDoneMPBusiness = `${baseUrl}/Person/GetPersonDoneMPBusiness`,
    url_GetPersonDoneDMBusiness = `${baseUrl}/Person/GetPersonDoneDMBusiness`,
    url_GetFormFile = `${baseUrl}/Person/GetFormFile`;




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
    url_ExportMPBusinessUserTJ,
    url_ExportMPBusinessNumTJ,
    url_ExportMPProduceTJ,
    url_GetCurrentUserInfo,
    url_GetMPBusinessDatas,
    url_GetDistrictTreeFromData,
    url_GetCommunityNamesFromData,
    url_GetResidenceNamesFromData,
    url_GetRoadNamesFromData,
    url_GetViligeNamesFromData,
    url_GetDistrictTreeFromDistrict,
    url_GetDistrictSecondFromData,
    url_GetDistrictTree,
    url_GetNamesFromDic,
    url_GetPostCodes,
    url_CheckResidenceMPIsAvailable,
    url_CheckRoadMPIsAvailable,
    url_CheckCountryMPIsAvailable,
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
    url_ExportRPNumTJ,
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
    // url_GetDistrictTree,
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
    //地名
    url_SettlementNameDM,
    url_BuildingNameDM,
    url_RoadNameDM,
    url_BridgeNameDM,
    // 门牌申请、变更、编辑
    url_ModifyResidenceMP,
    url_ModifyRoadMP,
    url_ModifyCountryMP,

    url_CancelResidenceMP,
    url_CancelRoadMP,
    url_CancelCountryMP,
    url_CancelResidenceMPByList,
    url_CancelRoadeMPByList,
    url_CancelCountryMPByList,
    url_ModifyResidenceMPByList, url_ModifyCountryMPByList, url_ModifyRoadMPByList,
    // 门牌搜索
    url_SearchResidenceMPByAddressCoding,
    url_SearchRoadMPByAddressCoding,
    url_SearchCountryMPByAddressCoding,
    url_SearchRoadMPByName,
    //地名管理
    url_SearchSettlementDMByID,
    url_SearchBuildingDMByID,
    url_SearchRoadDMByID,
    url_SearchBridgeDMByID,

    url_SearchSettlementDM,
    url_SearchBuildingDM,
    url_SearchRoadDM,
    url_SearchBridgeDM,

    url_ModifySettlementDM,
    url_ModifyBuildingDM,
    url_ModifyRoadDM,
    url_ModifyBridgeDM,
    
    url_GetConditionOfSettlementDM,
    url_GetConditionOfBuildingDM,
    url_GetConditionOfRoadDM,
    url_GetConditionOfBridgeDM,
    url_DownloadSettlementDM,
    url_DownloadBuildingDM,
    url_DownloadRoadDM,
    url_DownloadBridgeDM,
    url_ExportBridgeDM,
    url_ExportHouseDM,
    url_ExportSettlementDM,
    url_ExportRoadDM,
    url_DeleteSettlementDM,
    url_DeleteBuildingDM,
    url_DeleteRoadDM,
    url_DeleteBridgeDM,
    url_SearchPinyinDM,
    // 地名统计
    url_ExportBusinessTJ,
    // 个人中心
    // url_GetPersonTodoBusinessTJ,
    url_GetPersonMPByID,
    url_GetPersonDMByID,
    url_SearchSettlementDMByDMCode, url_SearchBridgeDMByDMCode, url_SearchRoadDMByDMCode, url_SearchBuildingDMByDMCode,
    url_DeletePersonMP, url_DeletePersonDM,
    url_GetPersonDoneMPBusiness, url_GetPersonDoneDMBusiness,
    url_GetFormFile, url_GetTJByDistinct,
};