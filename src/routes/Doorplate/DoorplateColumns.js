let GetHDColumns = e => {
    return [
      { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
      { title: '市辖区', dataIndex: 'name', key: 'name' },
      { title: '镇（街道）', dataIndex: 'age', key: 'age' },
      { title: '村（社区）', dataIndex: 'address', key: '1' },
      { title: '小区名称', dataIndex: 'address', key: '2' },
      { title: '标准地址', dataIndex: 'address', key: '3' },
      { title: '产权人', dataIndex: 'address', key: '4' },
      { title: '编制日期', dataIndex: 'address', key: '5' },
    ];
  },
  GetRDColumns = e => {
    return [
      { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
      { title: '市辖区', dataIndex: 'name', key: 'name' },
      { title: '镇（街道）', dataIndex: 'age', key: 'age' },
      { title: '村（社区）', dataIndex: 'address', key: '1' },
      { title: '道路名称', dataIndex: 'address', key: '2' },
      { title: '门牌号码', dataIndex: 'address', key: '3' },
      { title: '原门牌号码', dataIndex: 'address', key: '4' },
      { title: '产权人', dataIndex: 'address', key: '5' },
      { title: '商铺名称', dataIndex: 'address', key: '6' },
      { title: '预留号段', dataIndex: 'address', key: '7' },
      { title: '编制日期', dataIndex: 'address', key: '8' },
    ];
  },
  GetVGColumns = e => {
    return [
      { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
      { title: '市辖区', dataIndex: 'name', key: 'name' },
      { title: '镇（街道）', dataIndex: 'age', key: 'age' },
      { title: '村（社区）', dataIndex: 'address', key: '1' },
      { title: '自然村名称', dataIndex: 'address', key: '2' },
      { title: '门牌号码', dataIndex: 'address', key: '3' },
      { title: '户室号', dataIndex: 'address', key: '4' },
      { title: '原门牌号', dataIndex: 'address', key: '4' },
      { title: '产权人', dataIndex: 'address', key: '4' },
      { title: '编制日期', dataIndex: 'address', key: '5' },
    ];
  };

export { GetHDColumns, GetRDColumns, GetVGColumns };
