let GetColumns = () => {
  return [
    { title: '序号', width: 80, align: 'center', dataIndex: 'index', key: 'index' },
    { title: '标准地址', dataIndex: 'name', key: 'name' },
    { title: '房产证地址', dataIndex: 'FCZAddress', key: 'FCZAddress' },
    { title: '土地证地址', dataIndex: 'TDZAddress', key: 'TDZAddress' },
    { title: '营业执照/户籍地址', dataIndex: 'address', key: '2' },
    { title: '其它地址', dataIndex: 'OtherAddress', key: 'OtherAddress' },
  ];
};
export default GetColumns;
