import { Component } from 'react';
import { Form, TreeSelect, Checkbox, Input, Button } from 'antd';

import { GetPrivilege, ModifyPrivilege, GetCPrivileges } from '../../../services/Login';

class PrivilegeForm extends Component {
  constructor(ps) {
    super(ps);
    let { id } = ps;
    this.pIdEdit = !id;
  }

  state = {
    reload: false,
    entity: {},
    priviliges: [],
  };

  mObj = {
    PId: 'g',
    PassPrivilege: 'view|edit',
  };

  getPrivs(passPrivilege) {
    let prv = [];
    if (passPrivilege) {
      let prvs = passPrivilege.split('|');
      prvs.map(x => {
        if (x === 'view') {
          prv.push('查看权限');
        } else if (x === 'edit') {
          prv.push('编辑权限');
        }
      });
    }
    return prv;
  }

  async getFormData() {
    let { id } = this.props;
    if (id) {
      await GetPrivilege(id, e => {
        this.setState({ reload: true, entity: e }, e => this.setState({ reload: false }));
      });
    } else {
      this.state.entity = {
        ...this.mObj,
      };
      this.setState({ reload: true }, e => this.setState({ reload: false }));
    }
  }

  async getPriviliges() {
    await GetCPrivileges(e => {
      this.setState({ priviliges: e });
    });
  }

  getTree() {
    let { entity } = this.state;
    let { PId } = entity;

    let loop = x => {
      if (x.Id === PId) {
        this.pnV = {
          value: x.Id,
          label: x.Name,
        };
      }
      let node = (
        <TreeSelect.TreeNode title={x.Name} key={x.Id} value={x.Id}>
          {x.SubPrivileges && x.SubPrivileges.length ? x.SubPrivileges.map(loop) : null}
        </TreeSelect.TreeNode>
      );
      return node;
    };

    let { priviliges } = this.state;
    let nodes = priviliges.map(loop);
    let tree = (
      <TreeSelect
        disabled={!this.pIdEdit}
        labelInValue={true}
        style={{ width: '100%' }}
        value={entity.PId === 'g' ? undefined : this.pnV}
        dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
        placeholder="父权限"
        allowClear
        treeDefaultExpandAll
        onChange={(v, l) => {
          this.mObj.PId = v ? v.value : 'g';
          this.state.entity.PId = v.value;
          this.setState({});
        }}
      >
        {nodes}
      </TreeSelect>
    );
    return tree;
  }

  componentDidMount() {
    this.getFormData();
    this.getPriviliges();
  }

  render() {
    let { reload, entity } = this.state;

    return (
      <div>
        {reload ? null : (
          <div>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label={
                <span>
                  <span style={{ color: 'red' }}>*</span>
                  组件名称
                </span>
              }
            >
              <Input
                placeholder="请输入组件名称"
                defaultValue={entity.Name}
                onChange={e => {
                  this.mObj.Name = e.target.value;
                }}
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label={
                <span>
                  <span style={{ color: 'red' }}>*</span>组件ID
                </span>
              }
            >
              <Input
                placeholder="请输入组件ID"
                defaultValue={
                  entity.Id
                    ? (e => {
                        let is = entity.Id.split('.');
                        return is.length && is[is.length - 1];
                      })()
                    : null
                }
                onChange={e => {
                  this.mObj.Id = e.target.value;
                }}
              />
            </Form.Item>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={<span>父组件</span>}>
              {this.getTree()}
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              label={
                <span>
                  <span style={{ color: 'red' }}>*</span>
                  准入权限
                </span>
              }
            >
              <Checkbox.Group
                onChange={e => {
                  let prv = [];
                  if (e && e.length) {
                    e.map(x => {
                      if (x == '查看权限') {
                        prv.push('view');
                      } else if (x == '编辑权限') {
                        prv.push('edit');
                      }
                    });
                  }
                  this.mObj.PassPrivilege = prv.join('|');
                }}
                options={['查看权限', '编辑权限']}
                defaultValue={this.getPrivs(entity.PassPrivilege)}
              />
            </Form.Item>
            <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1px solid #eee' }}>
              <Button
                type="primary"
                onClick={e => {
                  console.log(this.mObj);
                }}
              >
                保存
              </Button>
              &emsp;
              <Button>取消</Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PrivilegeForm;
