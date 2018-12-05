import React, { Component } from 'react';
import st from './UserManage.less';
import { GetUserColumns } from '../UserRoleManageColumns';
import {
    Table,
    Icon,
    Button,
    Form,
    Modal,
    Input,
    Select,
    notification,
    Tree,
    DatePicker,
    Row,
    Col,
    Tag,
    Checkbox,
} from 'antd';
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import {
    url_SearchUser,
    url_GetRoleList,
    url_GetDistrictTree,
    url_ModifyUser,
    url_DeleteUser,
    url_SearchUserByID,
} from '../../../common/urls.js';
import { getDistrictsTreeWithJX, ConverStrToAyyary } from '../../../utils/utils.js';

class UserManage extends Component {
    constructor(ps) {
        super(ps);
        this.columns = GetUserColumns();
        this.columns.push({
            title: '操作',
            key: 'operation',
            width: 100,
            align: 'center',
            render: i => {
                return (
                    <div className={st.rowbtns}>
                        <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
                        <Icon type="delete" title="删除" onClick={e => this.onDel(i)} />
                    </div>
                );
            },
        });
    }
    state = {
        showLoading: false,
        showModal: false,
        modalTitle: '',
        entity: {},
        users: null,
        isModify: false,
        roleList: [],
        areasFromDist: [],
    };
    showLoading() {
        this.setState({ showLoading: true });
    }
    hideLoading() {
        this.setState({ showLoading: false });
    }
    componentDidMount() {
        this.getDistrictTree();
        this.getUsers();
        this.getRoleList();
    }
    async getUsers() {
        this.showLoading();
        let rt = await Post(url_SearchUser);
        rtHandle(rt, d => {
            let users = d.map((e, i) => {
                e.key = e.UserID;
                return e;
            })
            this.setState({ users: users });
            this.hideLoading();
        });
    }
    async save(obj) {
        await Post(url_ModifyUser, { oldDataJson: JSON.stringify(obj) }, e => {
            notification.success({ description: '保存成功！', message: '成功' });
            this.setState({ showModal: false, entity: {}, isModify: false, modalTitle: '' })
            this.getUsers();
        });
    }
    async getRoleList() {
        let rt = await Post(url_GetRoleList);
        rtHandle(rt, d => {
            this.setState({ roleList: d });
        });
    }
    async getDistrictTree() {
        let rt = await Post(url_GetDistrictTree);
        rtHandle(rt, d => {
            let areasFromDist = getDistrictsTreeWithJX(d);
            this.setState({ areasFromDist: areasFromDist });
        });
    }
    addUser() {
        this.setState({ showModal: true, modalTitle: '用户新增' });
    }
    addGLFW(e) {
        let { entity } = this.state;
        if (e.length > 0) {
            if (entity.DistrictIDList) {
                if (entity.DistrictIDList.indexOf(e[0]) < 0) {
                    entity.DistrictIDList.push(e[0]);
                }
            }
            else {
                entity.DistrictIDList = e;
            }
            this.setState({ entity });
        }
    }
    removeGLFW(e) {
        let { entity } = this.state;
        var index = entity.DistrictIDList.indexOf(e.target.innerText);
        if (index > -1) {
            entity.DistrictIDList.splice(index, 1);
        }
        this.setState({ entity });

    }
    changeGNJS(e) {
        let { entity } = this.state;
        let role = e.target["date-type"];
        if (e.target.checked) {
            if (entity.RoleList)
                entity.RoleList.push(role);
            else
                entity.RoleList = [role];
        }
        else {
            entity.RoleList = entity.RoleList.filter(s => s.RoleID != role.RoleID);
        }
        this.setState({ entity });
    }
    closeModal() {
        this.setState({ showModal: false, entity: {}, isModify: false });
    }
    validate(errs, bAdrress) {
        errs = errs || [];
        let { entity } = this.state;
        entity.Birthday = entity.Birthday.format();
        let saveObj = entity;
        return { errs, saveObj };
    }
    saveUserClick = e => {
        e.preventDefault();
        this.props.form.validateFields(
            async function (err, values) {
                let errors = [];
                let { entity } = this.state;
                if (err) {
                    for (let i in err) {
                        let j = err[i];
                        if (j.errors) {
                            errors = errors.concat(j.errors.map(item => item.message));
                        }
                    }
                }
                if (entity.DistrictIDList === undefined || entity.DistrictIDList.length == 0)
                    errors = errors.concat('管理范围不能为空');
                if (entity.RoleList === undefined || entity.RoleList.length == 0)
                    errors = errors.concat('功能角色不能为空');

                let { errs, saveObj } = this.validate(errors);
                if (errs.length) {
                    Modal.error({
                        title: '错误',
                        okText: '知道了',
                        content: errs.map((e, i) => (
                            <div>
                                {i + 1}、{e}；
                    </div>
                        )),
                    });
                } else {
                    this.save(saveObj);
                }
            }.bind(this)
        );
    }
    async onEdit(i) {
        let rt = await Post(url_SearchUserByID, { id: i.UserID });
        rtHandle(rt, d => {
            d.Birthday = d.Birthday ? moment(d.Birthday) : null
            this.setState({ showModal: true, entity: d, modalTitle: '用户修改', isModify: true });
        });
    }
    onDel(i) {
        Modal.confirm({
            title: '提醒',
            content: '确定删除所选用户？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                await Post(url_DeleteUser, { user: i }, e => {
                    notification.success({ description: '删除成功！', message: '成功' });
                    this.getUsers();
                });
            },
            onCancel() { },
        });
    }
    changeUserName(e) {
        let { entity } = this.state;
        entity.UserName = e;
        this.setState({ entity });
    }
    changePassword(e) {
        let { entity } = this.state;
        entity.Password = e;
        this.setState({ entity });
    }
    changeName(e) {
        let { entity } = this.state;
        entity.Name = e;
        this.setState({ entity });
    }
    changeGender(e) {
        let { entity } = this.state;
        entity.Gender = e;
        this.setState({ entity });
    }
    changeEmail(e) {
        let { entity } = this.state;
        entity.Email = e;
        this.setState({ entity });
    }
    changeBirthday(e) {
        let { entity } = this.state;
        entity.Birthday = e;
        this.setState({ entity });
    }
    changeTelephone(e) {
        let { entity } = this.state;
        entity.Telephone = e;
        this.setState({ entity });
    }
    renderGLFWTreeNodes(areasFromDist) {
        if (areasFromDist.length > 0) {
            return areasFromDist.map((item) => {
                if (item.children) {
                    return (
                        <TreeNode title={<div>{item.title}&emsp;<Icon type="plus-circle" /></div>} key={item.key} dataRef={item}>
                            {this.renderGLFWTreeNodes(item.children)}
                        </TreeNode>
                    );
                }
                return <TreeNode title={<div>{item.title}&emsp;<Icon type="plus-circle" /></div>} key={item.key} dataRef={item} ></TreeNode>;
            });
        }
        else
            return null;
    }
    renderGNJSTreeNodes() {
        let { entity, roleList } = this.state;
        var roleNames = entity.RoleList ? entity.RoleList.map(e => e.RoleName) : [];
        return roleList.map((item) => {
            return (
                <Checkbox date-type={item} onChange={(e) => { this.changeGNJS(e) }} checked={roleNames.indexOf(item.RoleName) >= 0 ? true : false}>{item.RoleName}</Checkbox>
            );
        });
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['Confirm Password'], { force: true });
        }
        callback();
    }
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('Password')) {
            callback('您两次输入的密码不一致!');
        } else {
            callback();
        }
    }
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let {
            showLoading,
            showModal,
            modalTitle,
            entity,
            users,
            isModify,
            roleList,
            areasFromDist,
        } = this.state;


        return (
            <div className={st.UserManage}>
                <div className={st.header}>
                    <Button type="primary" icon="plus-circle" onClick={e => this.addUser()}>
                        新增用户
                    </Button>
                </div>
                <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
                    <Table
                        bordered={true}
                        pagination={false}
                        columns={this.columns}
                        dataSource={users}
                        loading={showLoading}
                    />
                </div>
                <Modal
                    className="userManageModal"
                    wrapClassName={st.rpbzModal}
                    visible={showModal}
                    destroyOnClose={true}
                    onCancel={e => this.closeModal()}
                    onOk={this.saveUserClick.bind(this)}
                    title={modalTitle}
                    okText="保存"
                    cancelText="取消"
                >
                    <Form>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label='用户名'
                                >
                                    {getFieldDecorator('UserName', {
                                        rules: [{
                                            required: true, message: '用户名不能为空',
                                        }],
                                        initialValue: entity.UserName,

                                    })(
                                        <Input onChange={e => this.changeUserName(e.target.value)}
                                            placeholder="用户名" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="密码"
                                >
                                    {getFieldDecorator('Password', {
                                        rules: [{
                                            required: true, message: '密码不能为空',
                                        }, {
                                            validator: this.validateToNextPassword,
                                        }],
                                        initialValue: isModify ? entity.Password : null,
                                    })(
                                        <Input type="password" onChange={e => this.changePassword(e.target.value)}
                                            placeholder="密码" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="确认密码"
                                >
                                    {getFieldDecorator('Confirm Password', {
                                        rules: [{
                                            required: true, message: '请确认您的密码!',
                                        }, {
                                            validator: this.compareToFirstPassword,
                                        }],
                                        initialValue: isModify ? entity.Password : null,
                                    })(
                                        <Input type="password" onBlur={e => this.handleConfirmBlur(e)}
                                            placeholder="确认密码" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="姓名"
                                >
                                    {getFieldDecorator('Name', {
                                        initialValue: entity.Name,

                                    })(
                                        <Input onChange={e => this.changeName(e.target.value)}
                                            placeholder="姓名" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="性别"
                                >
                                    {getFieldDecorator('Gender', {
                                        initialValue: entity.Gender,
                                    })(
                                        <Select
                                            placeholder="性别"
                                            onChange={e => this.changeGender(e)}
                                        >
                                            {['男', '女'].map(e => <Select.Option value={e}>{e}</Select.Option>)}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="邮箱"
                                >
                                    {getFieldDecorator('Email', {
                                        rules: [{
                                            type: 'email', message: '邮箱格式不正确!',
                                        }],
                                        initialValue: entity.Email,
                                    })(
                                        <Input onChange={e => this.changeEmail(e.target.value)}
                                            placeholder="邮箱" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="生日"
                                >
                                    {getFieldDecorator('Birthday', {
                                        rules: [{ type: 'object' }],
                                        initialValue: entity.Birthday,
                                    })(
                                        <DatePicker onChange={e => {
                                            this.changeBirthday(e)
                                        }} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    label="联系电话"
                                >
                                    {getFieldDecorator('Telephone', {
                                        initialValue: entity.Telephone,
                                    })(
                                        <Input onChange={e => this.changeTelephone(e.target.value)}
                                            placeholder="联系电话" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={15}>
                                <FormItem
                                    labelCol={{ span: 5 }}
                                    wrapperCol={{ span: 19 }}
                                    label={
                                        <span>
                                            <span className={st.ired}>*</span>管理范围
                                        </span>
                                    }
                                >
                                    <div className='glfw'>
                                        <Tree className='glfw-tree'
                                            defaultExpandedKeys={["嘉兴市"]}
                                            onSelect={e => this.addGLFW(e)}
                                        >
                                            {this.renderGLFWTreeNodes(areasFromDist)}
                                        </Tree>
                                        <div className='glfw-icon'><Icon type="double-right" /></div>
                                        <div className='glfw-content'>{entity.DistrictIDList ? entity.DistrictIDList.map(e => {
                                            let color = "#2db7f5";
                                            if (e.split('.').length === 2)
                                                color = "#87d068";
                                            else if (e.split('.').length === 3)
                                                color = "#f50";
                                            return (
                                                <Tag color={color} onClick={(e) => { this.removeGLFW(e) }}>{e}</Tag>);
                                        }) : null}</div>
                                    </div>
                                </FormItem>
                            </Col>
                            <Col span={9}>
                                <FormItem
                                    labelCol={{ span: 6 }}
                                    wrapperCol={{ span: 18 }}
                                    label={
                                        <span>
                                            <span className={st.ired}>*</span>功能角色
                                        </span>
                                    }
                                >
                                    <div className='gnjs'>
                                        {this.renderGNJSTreeNodes()}
                                    </div>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        );
    }
}


UserManage = Form.create()(UserManage);
export default UserManage;