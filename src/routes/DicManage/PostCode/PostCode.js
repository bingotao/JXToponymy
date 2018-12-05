import React, { Component } from 'react';
import st from './PostCode.less';
import {
    Spin,
    Table,
    Icon,
    Button,
    Form,
    Modal,
    Input,
    Select,
    notification,
    Cascader,
} from 'antd';
const FormItem = Form.Item;
import {
    url_getDistrictTreeFromPostcodeData,
    url_GetDistrictTree,
    url_getCommunityNames,
    url_GetPostcodes,
    url_GetPostcodeByID,
    url_GetPostcodeByDID,
    url_ModifyPostcode,
    url_DeletePostcode,
} from '../../../common/urls.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import { GetPostcodeColumns } from '../DicManageColumns';
import { getDistricts } from '../../../utils/utils.js';

class PostCode extends Component {
    constructor(ps) {
        super(ps);
        this.columns = GetPostcodeColumns();
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
        postcodes: [],
        showLoading: false,
        showModal: false,
        ModalTitle: '',
        entity: {},
        newForm: true,
        areas: [],
        communities: [],
        communityCondition: null,
        State: '',
        areasFromDist: [],
    };
    // 动态查询条件
    queryCondition = {};
    // 存储修改后的数据
    mObj = {};

    componentDidMount() {
        this.getDists();
        this.getDistsFromDist();
    }
    async onEdit(i) {
        let rt = await Post(url_GetPostcodeByID, { id: i.IndetityID });
        rtHandle(rt, d => {
            this.setState({ showModal: true, entity: d, ModalTitle: '邮政编码修改', State: 'modify' })
        });
    }
    addPostcodes() {
        this.setState({ showModal: true, ModalTitle: '邮政编码新增', State: 'add' });
    }

    showLoading() {
        this.setState({ showLoading: true });
    }
    hideLoading() {
        this.setState({ showLoading: false });
    }

    onDel(i) {
        Modal.confirm({
            title: '提醒',
            content: '确定删除所选社区的邮政编码？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                await Post(url_DeletePostcode, { post: i }, e => {
                    notification.success({ description: '删除成功！', message: '成功' });
                    this.getPostcodes();
                });
            },
            onCancel() { },
        });
    }
    closeModal() {
        this.setState({ showModal: false, entity: {}, addState: '' });
    }
    validate(errs, bAdrress) {
        errs = errs || [];
        let { entity } = this.state;
        let saveObj = entity;
        return { errs, saveObj };
    }
    savePostcodeClick = e => {
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
                if (entity.NeighborhoodsID === undefined || entity.NeighborhoodsID === '')
                    errors = errors.concat('行政区划不能为空');
                if (entity.CommunityName === undefined || entity.CommunityName === '')
                    errors = errors.concat('社区不能为空');

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
        await Post(url_ModifyPostcode, { oldDataJson: JSON.stringify(obj) }, e => {
            notification.success({ description: '保存成功！', message: '成功' });
            this.setState({ showModal: false, entity: {}, addState: '', ModalTitle: '' })
            this.getPostcodes();
        });
    }

    async getPostcodes() {
        this.showLoading();
        let newCondition = this.queryCondition;
        let rt = await Post(url_GetPostcodes, newCondition);
        rtHandle(rt, d => {
            let postcodes = d.map((e, i) => {
                e.key = e.IndetityID;
                return e;
            })
            this.setState({ postcodes: postcodes });
            this.hideLoading();
        });
    }
    async getPostcodeStr() {
        let { entity } = this.state;
        if (!(!entity.NeighborhoodsID && !entity.CommunityName)) {
            let rt = await Post(url_GetPostcodeByDID, entity);
            rtHandle(rt, d => {
                entity.Postcode = d;
                this.setState({ entity: entity });
            });
        }
    }
    async getDists() {
        let rt = await Post(url_getDistrictTreeFromPostcodeData);
        rtHandle(rt, d => {
            let areas = getDistricts(d);
            this.setState({ areas: areas });
        });
    }

    async getDistsFromDist() {
        let rt = await Post(url_GetDistrictTree);
        rtHandle(rt, d => {
            let areas = getDistricts(d);
            this.setState({ areasFromDist: areas });
        });
    }

    async getCommunities(e) {
        // 获取社区时清空原有条件
        if (this.state.State === '')
            this.queryCondition.CommunityName = null;
        this.setState({
            communities: [],
            communityCondition: null,
        });
        let { entity } = this.state;
        entity.CommunityName = null;
        entity.Postcode = null;
        this.setState({ entity: entity });

        let rt = await Post(url_getCommunityNames, { NeighborhoodsID: e });
        rtHandle(rt, d => {
            this.setState({
                communities: d,
            });
        });

    }

    changeDist(a, b) {
        this.queryCondition.NeighborhoodsID = a[1];
        this.getCommunities(a[1]);
    }
    changeComun(e) {
        this.queryCondition.CommunityName = e;
        this.setState({ communityCondition: e });

    }
    changeModifyDist(a, b) {
        let { entity } = this.state;
        entity.NeighborhoodsID = a[1];
        entity.CountyID = a[0];
        this.getCommunities(a[1]);
        this.setState({ entity: entity });
    }
    changeModifyComun(e) {
        let { entity } = this.state;
        entity.CommunityName = e;
        this.setState({ entity: entity }, () => this.getPostcodeStr());
    }
    changeModifyPost(e) {
        let { entity } = this.state;
        entity.Postcode = e;
        this.setState({ entity: entity });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        let {
            postcodes,
            showLoading,
            showModal,
            ModalTitle,
            entity,
            areas,
            communities,
            communityCondition,
            State,
            areasFromDist,
        } = this.state;
        console.log(entity)
        return (
            <div className={st.PostCode}>
                {/* <Spin
                    className={showLoading ? 'active' : ''}
                    spinning={showLoading}
                    size="large"
                    tip="数据加载中..."
                /> */}
                <div className={st.header}>
                    <Cascader
                        options={areas}
                        onChange={(a, b) => this.changeDist(a, b)}
                        placeholder="请选择行政区"
                        style={{ width: '160px' }}
                        expandTrigger="click"
                    />
                    <Select
                        allowClear
                        showSearch
                        placeholder="村社区"
                        value={communityCondition || undefined}
                        style={{ width: '160px' }}
                        onSearch={e => this.changeComun(e)}
                        onChange={e => this.changeComun(e)}
                    >
                        {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                    </Select>
                    <Button icon="search" onClick={e => this.getPostcodes()}>
                        搜索
                    </Button>
                    <Button type="primary" icon="plus" onClick={e => this.addPostcodes()}>
                        新增邮编
                    </Button>
                </div>
                <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
                    <Table
                        bordered={true}
                        pagination={false}
                        columns={this.columns}
                        dataSource={postcodes}
                        loading={showLoading}
                    />
                </div>
                <Modal
                    wrapClassName={st.modifyModal}
                    visible={showModal}
                    destroyOnClose={true}
                    onCancel={e => this.closeModal()}
                    onOk={this.savePostcodeClick.bind(this)}
                    title={ModalTitle}
                    okText="保存"
                    cancelText="取消"
                >
                    <Form>
                        <FormItem
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 16 }}
                            label={
                                <span>
                                    <span className={st.ired}>*</span>行政区划
                                </span>
                            }
                        >
                            <Cascader
                                value={[entity.CountyID, entity.NeighborhoodsID]}
                                expandTrigger="click"
                                options={areasFromDist}
                                placeholder="请选择行政区"
                                onChange={(a, b) => this.changeModifyDist(a, b)}
                                disabled={State === 'modify'}
                            />
                        </FormItem>
                        <FormItem
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 16 }}
                            label={
                                <span>
                                    <span className={st.ired}>*</span>村社区
                                </span>
                            }
                        >
                            <Select
                                allowClear
                                showSearch
                                placeholder="村社区"
                                value={entity.CommunityName}
                                onSearch={e => this.changeModifyComun(e)}
                                onChange={e => this.changeModifyComun(e)}
                                disabled={State === 'modify'}
                            >
                                {communities.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                            </Select>
                        </FormItem>
                        <FormItem
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 16 }}
                            label="邮政编码"
                        >
                            {getFieldDecorator('Postcode', {
                                rules: [{
                                    required: true, message: '邮政编码不能为空',
                                }],
                                initialValue: entity.Postcode,

                            })(
                                <Input onChange={e => this.changeModifyPost(e.target.value)}
                                    placeholder="邮政编码" />
                            )}
                        </FormItem>
                    </Form>
                </Modal>

            </div>
        );
    }
}
PostCode = Form.create()(PostCode);

export default PostCode;
