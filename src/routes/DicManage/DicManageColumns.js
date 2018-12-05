let GetDistrictColumns = e => {
    return [
        {
            title: '市辖区',
            width: 100,
            align: 'center',
            dataIndex: 'CountyName',
            key: 'CountyName',
        },
        {
            title: '镇街道',
            width: 100,
            align: 'center',
            dataIndex: 'NeighborhoodsName',
            key: 'NeighborhoodsName',
        },
        {
            title: '乡镇代码',
            width: 100,
            align: 'center',
            dataIndex: 'Code',
            key: 'Code',
        },
    ];
}, GetPostcodeColumns = e => {
    return [
        {
            title: '市辖区',
            width: 100,
            align: 'center',
            dataIndex: 'CountyName',
            key: 'CountyName',
        },
        {
            title: '镇街道',
            width: 100,
            align: 'center',
            dataIndex: 'NeighborhoodsName',
            key: 'NeighborhoodsName',
        },
        {
            title: '村社区',
            width: 100,
            align: 'center',
            dataIndex: 'CommunityName',
            key: 'CommunityName',
        },
        {
            title: '邮政编码',
            width: 300,
            align: 'center',
            dataIndex: 'Postcode',
            key: 'Postcode',
        },
    ];
}, GetMPBZColumns = e => {
    return [
        {
            title: '门牌类型',
            width: 100,
            align: 'Center',
            dataIndex: 'Type',
            key: 'Type',
        },
        {
            title: '门牌大小',
            width: 100,
            align: 'center',
            dataIndex: 'Size',
            key: 'Size',
        },
        {
            title: '门牌材质',
            width: 100,
            align: 'center',
            dataIndex: 'Material',
            key: 'Material',
        },
    ];
}, GetRPBZColumns = e => {
    return [
        {
            title: '路牌编制及维修相关类型',
            width: 100,
            align: 'Center',
            dataIndex: 'Category',
            key: 'Category',
        },
        {
            title: '内容',
            width: 100,
            align: 'center',
            dataIndex: 'Data',
            key: 'Data',
        },
    ];
};
export { GetDistrictColumns, GetMPBZColumns, GetPostcodeColumns, GetRPBZColumns };

