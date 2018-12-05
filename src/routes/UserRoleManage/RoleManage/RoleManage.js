import React, { Component } from 'react';
import st from './RoleManage.less';
import { GetRoleColumns } from '../UserRoleManageColumns';
import {
    Table,
    Icon,
    Button,
    Form,
    Modal,
    Input,
    notification,
    Tag,
    Checkbox,
    Row,
    Col,
} from 'antd';
const FormItem = Form.Item;

import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import {
    url_SearchRole,
    url_SearchRoleByID,
    url_SearchPrivilige,
    url_ModifyRole,
    url_GetWindows,
    url_GetRoleNames,
    url_DeleteRole,
} from '../../../common/urls.js';
import { getDistrictsWithJX, ConverStrToAyyary } from '../../../utils/utils.js';

class RoleManage extends Component {
    constructor(ps) {
        super(ps);
        this.columns = GetRoleColumns();
        this.columns.push({
            title: '操作',
            key: 'operation',
            width: 100,
            align: 'center',
            render: i => {
                return (
                    <div className={st.rowbtns}>
                        <Icon type="edit" title="编辑" onClick={e => this.onEdit(i)} />
                        <Icon type="rollback" title="删除" onClick={e => this.onDel(i)} />
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
        isModify: false,
        roles: [],
        priviliges: [],
    };


    showLoading() {
        this.setState({ showLoading: true });
    }
    hideLoading() {
        this.setState({ showLoading: false });
    }
    componentDidMount() {
        this.getRoles();
        this.getPriviliges();
    }

    async getRoles() {
        this.showLoading();
        let rt = await Post(url_SearchRole);
        rtHandle(rt, d => {
            let roles = d.map((e, i) => {
                e.key = e.RoleID;
                e.PriviligeNames = e.PriviligeNames.split(',').map(t => <Tag color="#87d068" className='roleTag'>{t}</Tag>);
                return e;
            })
            this.setState({ roles: roles });
            this.hideLoading();
        });
    }

    async getPriviliges() {
        let rt = await Post(url_SearchPrivilige);
        rtHandle(rt, d => {
            this.setState({ priviliges: d });
        });
    }

    addRole() {
        this.setState({ showModal: true, modalTitle: '角色新增' });
    }
    closeModal() {
        this.setState({ showModal: false, entity: {}, isModify: false });
    }
    validate(errs, bAdrress) {
        errs = errs || [];
        let { entity } = this.state;
        let saveObj = entity;
        return { errs, saveObj };
    }
    saveRoleClick = e => {
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
    async save(obj) {
        await Post(url_ModifyRole, { oldDataJson: JSON.stringify(obj) }, e => {
            notification.success({ description: '保存成功！', message: '成功' });
            this.setState({ showModal: false, entity: {}, isModify: false, modalTitle: '' })
            this.getRoles();
            this.getDistsFromData();
            this.getWindows();
            this.getRoleNames();
        });
    }
    async onEdit(i) {
        let rt = await Post(url_SearchRoleByID, { RoleID: i.RoleID });
        rtHandle(rt, d => {
            this.setState({ showModal: true, entity: d, modalTitle: '角色修改', isModify: true });
        });
    }
    onDel(i) {
        Modal.confirm({
            title: '提醒',
            content: '确定删除所选权限？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                await Post(url_DeleteRole, { role: i }, e => {
                    notification.success({ description: '删除成功！', message: '成功' });
                    this.getRoles();
                    this.getDistsFromData();
                    this.getWindows();
                    this.getRoleNames();
                });
            },
            onCancel() { },
        });
    }
    changeQX(e) {
        let { entity } = this.state;
        debugger
        let Privilige = e.target["date-type"];
        if (e.target.checked) {
            if (entity.PriviligeList)
                entity.PriviligeList.push(Privilige);
            else
                entity.PriviligeList = [Privilige];
        }
        else {
            entity.PriviligeList = entity.PriviligeList.filter(s => s.PriviligeID != role.PriviligeID);
        }
        this.setState({ entity });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let {
            showLoading,
            showModal,
            modalTitle,
            entity,
            isModify,
            roles,
            priviliges,
        } = this.state;

        return (
            <div className={st.RoleManage}>
                <div className={st.header}>
                    <Button type="primary" icon="plus-circle" onClick={e => this.addRole()}>
                        新增角色
                    </Button>
                </div>
                <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
                    <Table
                        bordered={true}
                        pagination={false}
                        columns={this.columns}
                        dataSource={roles}
                        loading={showLoading}
                    />
                </div>
                <Modal
                    className="RoleManageModal"
                    wrapClassName={st.rpbzModal}
                    visible={showModal}
                    destroyOnClose={true}
                    onCancel={e => this.closeModal()}
                    onOk={this.saveRoleClick.bind(this)}
                    title={modalTitle}
                    okText="保存"
                    cancelText="取消"
                >
                    <FormItem
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        label={
                            <span>
                                <span className={st.ired}>*</span>角色名称
                                        </span>
                        }
                    >
                        <Input onChange={e => this.changeRoleName(e.target.value)} placeholder="角色名称" defaultValue={entity.RoleName} />
                    </FormItem>
                    <FormItem
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        label="角色描述"
                    >
                        <Input onChange={e => this.changeRoleDescription(e.target.value)} placeholder="角色描述" defaultValue={entity.RoleDescription} />
                    </FormItem>
                    <FormItem
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        label={
                            <span>
                                <span className={st.ired}>*</span>权限选择
                                        </span>
                        }
                    >
                        <Row gutter={24}>
                            <Col span={12} className="privilige-check">
                                {priviliges.map(e =>
                                    <Checkbox date-type={e}
                                        onChange={(e) => { this.changeQX(e) }}
                                        checked={entity.PriviligeList && entity.PriviligeList.map(t => t.PriviligeName).indexOf(e.PriviligeName) >= 0 ? true : false}
                                    >
                                        {e.PriviligeName}
                                    </Checkbox>)}
                            </Col>
                            <Col span={12} className="privilige-tag">
                                {
                                    entity.PriviligeList ? entity.PriviligeList.map(t => <Tag color='#f50' >{t.PriviligeName}</Tag>) : null
                                }
                            </Col>
                        </Row>
                    </FormItem>
                </Modal>
            </div>
        );
    }
}


RoleManage = Form.create()(RoleManage);
export default RoleManage;