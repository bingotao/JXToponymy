let GetUserColumns = e => {
    return [
        {
            title: '用户名',
            width: 100,
            align: 'center',
            dataIndex: 'UserName',
            key: 'UserName',
        },
        {
            title: '所在窗口',
            width: 100,
            align: 'center',
            dataIndex: 'Window',
            key: 'Window',
        },
        {
            title: '数据管理范围',
            width: 200,
            align: 'center',
            dataIndex: 'DistrictName',
            key: 'DistrictName',
        },
        {
            title: '功能角色',
            width: 200,
            align: 'center',
            dataIndex: 'RoleName',
            key: 'RoleName',
        },
        {
            title: '真实姓名',
            width: 100,
            align: 'center',
            dataIndex: 'Name',
            key: 'Name',
        },
        {
            title: '性别',
            width: 50,
            align: 'center',
            dataIndex: 'Gender',
            key: 'Gender',
        },
        {
            title: '邮箱',
            width: 100,
            align: 'center',
            dataIndex: 'Email',
            key: 'Email',
        },
        {
            title: '联系电话',
            width: 100,
            align: 'center',
            dataIndex: 'Telephone',
            key: 'Telephone',
        },
        {
            title: '出生年月',
            width: 100,
            align: 'center',
            dataIndex: 'Birthday',
            key: 'Birthday',
        },
    ];
}, GetRoleColumns = e => {
    return [
        {
            title: '角色名称',
            width: 100,
            align: 'center',
            dataIndex: 'RoleName',
            key: 'RoleName',
        },
        {
            title: '角色描述',
            width: 100,
            align: 'center',
            dataIndex: 'RoleDescription',
            key: 'RoleDescription',
        },
        {
            title: '所有权限',
            width: 100,
            align: 'center',
            dataIndex: 'PriviligeNames',
            key: 'PriviligeNames',
        },
    ];
};

export { GetUserColumns, GetRoleColumns };