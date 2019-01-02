import React, { Component } from 'react';
import { DataGrid, GridColumn, GridColumnGroup, GridHeaderRow } from 'rc-easyui';

import st from './UserManage.less';
import { Icon, Button, Form, Modal, notification, Tree } from 'antd';

import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';
import { url_SearchUser, url_DeleteUser } from '../../../common/urls.js';
import UserForm from './UserForm';

class UserManage extends Component {
  constructor(ps) {
    super(ps);
  }
  state = {
    showLoading: false,
    showModal: false,
    entity: {},
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
  componentDidMount() {
    this.getUsers();
  }

  async getUsers() {
    this.showLoading();
    let rt = await Post(url_SearchUser);
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
      content: '确定删除所选用户？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await Post(url_DeleteUser, { user: i }, e => {
          notification.success({ description: '删除成功！', message: '成功' });
          this.getUsers();
        });
      },
      onCancel() {},
    });
  }

  render() {
    let { showLoading, showModal, users } = this.state;

    return (
      <div className={st.UserManage}>
        <div className={st.header}>
          <div>用户管理</div>
          <div>
            <Button type="primary" icon="plus" onClick={e => this.showUserForm()}>
              新增用户
            </Button>
          </div>
        </div>
        <div className={st.body} style={showLoading ? { filter: 'blur(2px)' } : null}>
          <DataGrid data={users} style={{ height: '100%' }}>
            <GridColumn field="idx" title="序号" align="center" width={60} />
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
            <GridColumn field="Name" title="真实姓名" align="center" width={160} />
            <GridColumn field="Gender" title="性别" align="center" width={60} />
            <GridColumn field="Email" title="邮箱" align="center" width={200} />
            <GridColumn field="Telephone" title="联系电话" align="center" width={160} />
            <GridColumn field="Birthday" title="出生年月" align="center" width={120} />
            <GridColumn
              field="Id"
              title="操作"
              align="center"
              width={80}
              render={({ value, row, rowIndex }) => {
                return (
                  <div className={st.rowbtns}>
                    <Icon type="edit" title="编辑" onClick={e => this.onEdit(row)} />
                    <Icon type="delete" title="删除" onClick={e => this.onDel(row)} />
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
