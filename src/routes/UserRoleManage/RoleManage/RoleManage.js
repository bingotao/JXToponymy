import React, { Component } from 'react';
import { DataGrid, GridColumn } from 'rc-easyui';

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
  Tree,
  Popconfirm,
} from 'antd';

import { GetCPrivileges, GetCRoles, DeleteCRole } from '../../../services/Login';
import PrivilegeForm from './PrivilegeForm';
import RoleForm from './RoleForm';

class RoleManage extends Component {
  constructor(ps) {
    super(ps);
  }

  state = {
    showPrivilegeForm: false,
    priviliges: [],
    roles: [],
  };

  showLoading() {
    this.setState({ showLoading: true });
  }

  hideLoading() {
    this.setState({ showLoading: false });
  }

  async getRoles() {
    await GetCRoles(e => {
      e.map((x, i) => {
        x.idx = i + 1;
      });
      this.setState({ roles: e });
    });
  }

  async getPriviliges() {
    await GetCPrivileges(e => {
      this.setState({ priviliges: e });
    });
  }

  getNodes() {
    let loop = x => {
      let node = (
        <Tree.TreeNode
          title={
            <span className={st.treenode}>
              {x.Name}
              {/* <span>
                <Icon type="edit" onClick={e => this.showPrivilegeForm(x.Id)} />
                <Icon type="minus-circle" />
              </span> */}
            </span>
          }
          key={x.Id}
        >
          {x.SubPrivileges && x.SubPrivileges.length ? x.SubPrivileges.map(loop) : null}
        </Tree.TreeNode>
      );
      return node;
    };
    let { priviliges } = this.state;

    let prvs = priviliges.map(loop);
    return prvs;
  }

  hidePrivilegeForm() {
    this.prvid = null;
    this.setState({ showPrivilegeForm: false });
  }

  showPrivilegeForm(id) {
    this.prvid = id;
    this.setState({ showPrivilegeForm: true });
  }

  hiddenRoleForm() {
    this.roleid = null;
    this.setState({ showRoleForm: false });
  }

  showRoleForm(id) {
    this.roleid = id;
    this.setState({ showRoleForm: true });
  }

  addPrivilege() {
    this.showPrivilegeForm(null);
  }

  addRole() {
    this.showRoleForm(null);
  }

  deleteRole(id) {
    console.log(id);
    DeleteCRole(id, e => {
      this.getRoles();
    });
  }

  componentDidMount() {
    this.getPriviliges();
    this.getRoles();
  }

  render() {
    let { showPrivilegeForm, showRoleForm, roles } = this.state;
    return (
      <div className={st.RoleManage}>
        <div className={st.header}>
          <div>角色管理</div>
          <div />
        </div>
        <div className={st.body}>
          <div className={st.sysprvs}>
            <div>
              <Icon type="schedule" />&ensp;系统权限
              {/* <Button
                style={{ float: 'right' }}
                size="small"
                type="primary"
                icon="plus"
                onClick={e => this.addPrivilege()}
              >
                新增权限
              </Button> */}
            </div>
            <div>
              <Tree>{this.getNodes()}</Tree>
            </div>
          </div>
          <div className={st.roles}>
            <div>
              <Icon type="table" />&ensp;系统角色
              <Button
                style={{ float: 'right' }}
                size="small"
                type="primary"
                icon="plus"
                onClick={e => this.addRole()}
              >
                新增角色
              </Button>
            </div>
            <div>
              <DataGrid data={roles} style={{ height: '100%' }}>
                <GridColumn field="idx" title="序号" align="center" width={80} />
                <GridColumn field="Name" title="名称" align="center" width={300} />
                <GridColumn field="Describe" title="描述" align="center" />
                <GridColumn
                  field="Id"
                  title="操作"
                  align="center"
                  width={160}
                  render={({ value, row, rowIndex }) => {
                    return (
                      <div className={st.rowbtns}>
                        <Icon type="edit" title="编辑" onClick={e => this.showRoleForm(value)} />
                        <Popconfirm
                          onConfirm={e => {
                            this.deleteRole(value);
                          }}
                          title="删除角色后会导致相关用户无法正常使用，确定删除该角色？"
                        >
                          <Icon type="delete" title="删除" />
                        </Popconfirm>
                      </div>
                    );
                  }}
                />
              </DataGrid>
            </div>
          </div>
        </div>
        <Modal
          title={this.prvid ? '修改权限' : '新增权限'}
          width={500}
          footer={null}
          visible={showPrivilegeForm}
          destroyOnClose={true}
          onCancel={this.hidePrivilegeForm.bind(this)}
        >
          <PrivilegeForm id={this.prvid} />
        </Modal>
        <Modal
          title={this.prvid ? '修改角色' : '新增角色'}
          width={600}
          footer={null}
          visible={showRoleForm}
          destroyOnClose={true}
          onCancel={this.hiddenRoleForm.bind(this)}
        >
          <RoleForm
            id={this.roleid}
            onCancel={this.hiddenRoleForm.bind(this)}
            onSaveSuccess={e => {
              this.getRoles();
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default RoleManage;
