let GetColumns = () => {
  return [
    { title: '序号', align: 'center', dataIndex: 'index', key: 'index' },
    { title: '标准地址', dataIndex: 'name', key: 'name' },
    { title: '房产证地址', dataIndex: 'age', key: 'age' },
    { title: '土地证地址', dataIndex: 'address', key: '1' },
    { title: '营业执照/户籍地址', dataIndex: 'address', key: '2' },
    { title: '其它地址', dataIndex: 'address', key: '3' },
  ];
}
export default GetColumns;
