import { Component } from 'react';
import { Form, Input, Button, Tree, Icon } from 'antd';

import st from './RoleForm.less';

import { ModifyCRole, GetCRole } from '../../../services/Login';
import { error, success } from '../../../utils/notification';

class RoleForm extends Component {
  state = {
    entity: {},
    reload: false,
  };

  mObj = {};

  priviliges = [];

  getTree() {
    let loop = x => {
      let node = (
        <Tree.TreeNode
          title={
            <span className={st.treenode}>
              {x.Name}
              <span
                className={x.Privilege === 'none' ? 'active' : null}
                onClick={e => {
                  if (x.Privilege && x.Privilege === 'none') {
                    x.Privilege = null;
                  } else {
                    x.Privilege = 'none';
                  }
                  this.setState({});
                }}
              >
                无权限
              </span>
              <span
                className={x.Privilege === 'view' ? 'active' : null}
                onClick={e => {
                  if (x.Privilege && x.Privilege === 'view') {
                    x.Privilege = null;
                  } else {
                    x.Privilege = 'view';
                  }
                  this.setState({});
                }}
              >
                查看
              </span>
              <span
                className={x.Privilege === 'edit' ? 'active' : null}
                onClick={e => {
                  if (x.Privilege && x.Privilege === 'edit') {
                    x.Privilege = null;
                  } else {
                    x.Privilege = 'edit';
                  }
                  this.setState({});
                }}
              >
                编辑
              </span>
            </span>
          }
          key={x.Id}
        >
          {x.SubPrivileges && x.SubPrivileges.length ? x.SubPrivileges.map(loop) : null}
        </Tree.TreeNode>
      );
      return node;
    };
    let { TPrivilege } = this.state.entity;
    if (TPrivilege) {
      return <Tree>{TPrivilege.SubPrivileges.map(loop)}</Tree>;
    } else {
      return null;
    }
  }

  async getFormData(id) {
    await GetCRole(id, e => {
      this.setState({ reload: true, entity: e }, e => this.setState({ reload: false }));
    });
  }

  getPrivileges() {
    let { entity } = this.state;
    let { TPrivilege } = entity;
    let prvs = [];
    let loop = x => {
      if (x.Privilege) {
        prvs.push({
          Id: x.Id,
          Privilege: x.Privilege,
        });
      }
      x.SubPrivileges && x.SubPrivileges.length ? x.SubPrivileges.map(loop) : null;
    };
    if (TPrivilege && TPrivilege.SubPrivileges) {
      TPrivilege.SubPrivileges.map(loop);
    }
    return prvs;
  }

  onSave() {
    let prvs = this.getPrivileges();
    let entity = {
      ...this.state.entity,
      ...this.mObj,
      TPrivileges: prvs,
      TPrivilege: null,
    };
    if (!entity.Name) {
      error('请填写角色名称！');
      return;
    }
    if (entity.TPrivileges.length === 0) {
      error('尚未为角色勾选任何权限！');
      return;
    }
    this.save(entity);
  }

  save(obj) {
    ModifyCRole(obj, e => {
      success('保存成功！');
      this.getFormData(obj.Id);
      let { onSaveSuccess } = this.props;
      onSaveSuccess && onSaveSuccess();
    });
  }

  onCancel() {
    let { onCanel } = this.props;
    onCancel && onCanel();
  }

  componentDidMount() {
    let { id } = this.props;
    this.getFormData(id);
  }

  render() {
    let { entity, reload } = this.state;
    return (
      <div className={st.RoleForm}>
        {reload ? (
          <div />
        ) : (
          <div>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label={
                <span>
                  <span style={{ color: 'red' }}>*</span>
                  角色名称
                </span>
              }
            >
              <Input
                onChange={e => {
                  let v = e.target.value;
                  this.mObj.Name = v;
                }}
                placeholder="角色名称"
                defaultValue={entity.Name}
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label={<span>角色描述</span>}
            >
              <Input.TextArea
                placeholder="角色描述"
                defaultValue={entity.Describe}
                onChange={e => {
                  let v = e.target.value;
                  this.mObj.Describe = v;
                }}
              />
            </Form.Item>
            <div className={st.prvs}>
              <div>权限列表</div>
              <div>{this.getTree()}</div>
            </div>
            <div className={st.btns}>
              <Button type="primary" onClick={this.onSave.bind(this)}>
                保存
              </Button>
              &ensp;
              <Button onCancel={this.onCancel.bind(this)}>取消</Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default RoleForm;
