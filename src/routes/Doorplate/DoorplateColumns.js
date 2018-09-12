let GetHDColumns = e => {
    return [
      // { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
      { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
      {
        title: '镇街道',
        align: 'center',
        dataIndex: 'NeighborhoodsName',
        key: 'NeighborhoodsName',
      },
      { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
      { title: '小区名称', align: 'center', dataIndex: 'ResidenceName', key: 'ResidenceName' },
      { title: '标准地址', dataIndex: 'StandardAddress', key: 'StandardAddress' },
      { title: '产权人', align: 'center', dataIndex: 'PropertyOwner', key: 'PropertyOwner' },
      { title: '编制日期', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
    ];
  },
  GetRDColumns = e => {
    return [
      // { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
      { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
      {
        title: '镇街道',
        align: 'center',
        dataIndex: 'NeighborhoodsName',
        key: 'NeighborhoodsName',
      },
      { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
      { title: '道路名称', align: 'center', dataIndex: 'RoadName', key: 'RoadName' },
      { title: '门牌号码', align: 'center', dataIndex: 'MPNumber', key: 'MPNumber' },
      { title: '原门牌号码', align: 'center', dataIndex: 'OriginalNumber', key: 'OriginalNumber' },
      { title: '产权人', align: 'center', dataIndex: 'PropertyOwner', key: 'PropertyOwner' },
      { title: '商铺名称', align: 'center', dataIndex: 'ShopName', key: 'ShopName' },
      { title: '预留号段', align: 'center', dataIndex: 'MPNumberRange', key: 'MPNumberRange' },
      { title: '编制日期', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
    ];
  },
  GetVGColumns = e => {
    return [
      // { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
      { title: '市辖区', align: 'center', dataIndex: 'CountyName', key: 'CountyName' },
      {
        title: '镇街道',
        align: 'center',
        dataIndex: 'NeighborhoodsName',
        key: 'NeighborhoodsName',
      },
      { title: '村社区', align: 'center', dataIndex: 'CommunityName', key: 'CommunityName' },
      { title: '自然村名称', align: 'center', dataIndex: 'ViligeName', key: 'ViligeName' },
      { title: '门牌号码', align: 'center', dataIndex: 'MPNumber', key: 'MPNumber' },
      { title: '户室号', align: 'center', dataIndex: 'HSNumber', key: 'HSNumber' },
      { title: '原门牌号', align: 'center', dataIndex: 'OriginalNumber', key: 'OriginalNumber' },
      { title: '产权人', align: 'center', dataIndex: 'PropertyOwner', key: 'PropertyOwner' },
      { title: '编制日期', align: 'center', dataIndex: 'BZTime', key: 'BZTime' },
    ];
  };

export { GetHDColumns, GetRDColumns, GetVGColumns };
