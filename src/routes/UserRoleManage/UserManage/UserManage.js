import React, { Component } from 'react';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';

import st from './UserManage.less';
import { Icon, Button, Form, Modal, notification, Tag, Cascader, Select } from 'antd';

import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import {
  url_SearchUser,
  url_DeleteUser,
  url_GetDistrictTree,
  url_GetUserWindows,
} from '../../../common/urls.js';
import { getDistrictsWithJX } from '../../../utils/utils.js';
import UserForm from './UserForm';
import { getUserName } from '../../../services/Common';

class UserManage extends Component {
  queryCondition = {};
  constructor(ps) {
    super(ps);
  }
  state = {
    showLoading: false,
    showModal: false,
    entity: {},
    areas: [],
    windows: [],
    createUsers: [],
    CreateUser: undefined,
    Window: undefined,
  };

  showUserForm(id) {
    this.userId = id;
    this.setState({ showModal: true });
  }

  closeUserForm() {
    this.userId = null;
    this.setState({ showModal: false });
  }
  showLoading() {
    this.setState({ showLoading: true });
  }

  hideLoading() {
    this.setState({ showLoading: false });
  }
  async componentDidMount() {
    let rt = await Post(url_GetDistrictTree);
    rtHandle(rt, d => {
      let areas = getDistrictsWithJX(d);
      this.setState({ areas: areas });
    });
    this.getUsers(this.queryCondition);
    this.getWindows(this.queryCondition);
    this.getCreateUsers(this.queryCondition);
  }

  async getUsers(queryCondition) {
    this.showLoading();
    let rt = await Post(url_SearchUser, queryCondition);
    rtHandle(rt, d => {
      let users = d.map((e, i) => {
        e.key = e.UserID;
        e.idx = i + 1;
        return e;
      });
      this.setState({ users: users });
      this.hideLoading();
    });
  }

  onEdit(i) {
    this.showUserForm(i.UserID);
  }

  onDel(i) {
    Modal.confirm({
      title: '提醒',
      content: '确定注销所选用户？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await Post(url_DeleteUser, { user: i }, e => {
          notification.success({ description: '注销成功！', message: '成功' });
          this.getUsers();
        });
      },
      onCancel() {},
    });
  }
  async getWindows(queryCondition) {
    await Post(url_GetUserWindows, queryCondition, e => {
      this.setState({ windows: e });
    });
  }
  async getCreateUsers(queryCondition) {
    await getUserName(queryCondition, d => {
      d = (d || []).map(function(x) {
        return {
          label: x,
          key: x,
        };
      });

      this.setState({ createUsers: d });
    });
  }

  getRowCss(row) {
    if (row.idx % 2 == 0) return { background: '#f3f5f7', fontSize: '14px' };
  }
  render() {
    let {
      showLoading,
      showModal,
      users,
      areas,
      windows,
      createUsers,
      CreateUser,
      Window,
    } = this.state;

    return (
      <div className={st.UserManage}>
        <div className={st.header}>
          <div>用户管理</div>
        </div>
        <div className={st.toolbar}>
          <Cascader
            changeOnSelect={true}
            options={areas}
            onChange={e => {
              this.queryCondition.DistrictID = e[e.length - 1];
              this.setState({
                windows: [],
                CreateUser: undefined,
                createUsers: [],
                Window: undefined,
              });
              if (e) {
                this.getWindows(this.queryCondition);
                this.getCreateUsers(this.queryCondition);
              }
            }}
            placeholder="请选择行政区"
            style={{ width: '220px' }}
            expandTrigger="hover"
          />
          &emsp;
          <Select
            allowClear
            style={{ width: 150 }}
            placeholder="受理窗口"
            value={Window || undefined}
            onChange={e => {
              this.queryCondition.Window = e;
              this.setState({ CreateUser: undefined, createUsers: [], Window: e });
              this.getCreateUsers(this.queryCondition);
            }}
          >
            {windows.map(i => <Select.Option value={i}>{i}</Select.Option>)}
          </Select>
          &emsp;
          <Select
            allowClear
            style={{ width: 250 }}
            labelInValue
            placeholder="经办人"
            onChange={e => {
              this.queryCondition.CreateUser = e && e.key;
              this.setState({ CreateUser: e });
            }}
            value={CreateUser || undefined}
          >
            {createUsers.map(i => <Select.Option value={i.key}>{i.label}</Select.Option>)}
          </Select>
          <Button icon="search" onClick={e => this.getUsers(this.queryCondition)}>
            查询
          </Button>
          <Button type="primary" icon="plus-circle" onClick={e => this.showUserForm()}>
            新增
          </Button>
        </div>
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <DataGrid data={users} style={{ height: '100%' }} rowCss={this.getRowCss}>
            <GridColumn field="idx" title="序号" align="center" width={60} />
            <GridColumn field="NeighborhoodsID" title="行政区" align="center" width={160} />
            <GridColumn field="UserName" title="用户名" align="center" width={160} />
            <GridColumn field="Window" title="所在窗口" align="center" width={160} />
            <GridColumn
              field="DistrictName"
              title="数据管理范围"
              align="center"
              width={260}
              render={({ value, row, rowIndex }) => {
                if (value) {
                  let vs = value.split('|');
                  return <div className={st.diss}>{vs.map(v => <span>{v}</span>)}</div>;
                }
              }}
            />
            <GridColumn
              field="RoleName"
              title="功能角色"
              align="center"
              width={160}
              render={({ value, row, rowIndex }) => {
                if (value) {
                  let vs = value.split('|');
                  return <div className={st.diss}>{vs.map(v => <span>{v}</span>)}</div>;
                }
              }}
            />
            <GridColumn field="Name" title="经办人" align="center" width={160} />
            {/* <GridColumn field="Email" title="邮箱" align="center" width={200} /> */}
            <GridColumn field="Telephone2" title="固定电话" align="center" width={160} />
            <GridColumn
              field="State"
              title="状态"
              align="center"
              width={60}
              render={({ value }) => {
                return (
                  <Tag color={value == 1 ? '#87d068' : '#f50'}>
                    {value == 1 ? '可用' : '已注销'}
                  </Tag>
                );
              }}
            />
            <GridColumn
              field="Id"
              title="操作"
              align="center"
              width={80}
              render={({ value, row, rowIndex }) => {
                return (
                  <div className={st.rowbtns}>
                    <Icon type="edit" title="编辑" onClick={e => this.onEdit(row)} />
                    <Icon type="user-delete" title="注销" onClick={e => this.onDel(row)} />
                  </div>
                );
              }}
            />
          </DataGrid>
        </div>
        <Modal
          width={1000}
          visible={showModal}
          destroyOnClose={true}
          onCancel={this.closeUserForm.bind(this)}
          title={this.userId ? '修改用户' : '新增用户'}
          footer={null}
        >
          <UserForm
            id={this.userId}
            onSaveSuccess={e => {
              this.getUsers();
            }}
            onCancel={this.closeUserForm.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

UserManage = Form.create()(UserManage);
export default UserManage;
