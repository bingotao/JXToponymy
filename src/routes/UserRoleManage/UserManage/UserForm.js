import { Component } from 'react';
import {
  Checkbox,
  Tooltip,
  Input,
  Button,
  Select,
  Form,
  Row,
  Col,
  DatePicker,
  Popover,
  Icon,
  Tree,
  Cascader,
} from 'antd';
import st from './UserForm.less';
import { url_GetDistrictTreeFromDistrict } from '../../../common/urls.js';
import { GetUserWithPrivs, GetCRoles, GetDistrictTree, ModifyUser } from '../../../services/Login';
import { error, success } from '../../../utils/notification';
import { windows } from '../../../common/enums';
import { getDistricts } from '../../../utils/utils.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import { Post } from '../../../utils/request.js';

let FormItem = Form.Item;

class UserForm extends Component {
  state = { passwordConfirmed: true, entity: {}, reload: false, roles: [], districts: [] };
  mObj = {};

  getFormData(id) {
    GetUserWithPrivs(id, entity => {
      if (entity.NeighborhoodsID) {
        let x = entity.NeighborhoodsID.split('.');
        entity.NeighborhoodsID = [[x[0], x[1]].join('.'), entity.NeighborhoodsID];
      }
      entity.CreateTime = entity.CreateTime ? moment(entity.CreateTime) : null;
      entity.Birthday = entity.Birthday ? moment(entity.Birthday) : null;
      this.setState({ reload: true, entity }, e => this.setState({ reload: false }));
    });
  }

  getRoles() {
    GetCRoles(roles => {
      this.setState({ roles });
    });
  }

  getDistrictTree() {
    GetDistrictTree(districts => {
      this.setState({ districts });
    });
  }

  save() {
    let { passwordConfirmed, entity } = this.state;
    if (!passwordConfirmed) {
      error('请确认密码！');
      return;
    }
    let obj = {
      ...this.mObj,
      UserID: entity.UserID,
      DistrictName: entity.DistrictName,
      RoleName: entity.RoleName,
    };
    if (obj.Password) {
      obj.Password = md5(obj.Password);
    }
    // console.log(obj);
    ModifyUser(obj, e => {
      let { onSaveSuccess } = this.props;
      onSaveSuccess && onSaveSuccess();
      success('保存成功！');
      this.getFormData(this.state.entity.UserID);
    });
  }

  cancel() {
    let { onCancel } = this.props;
    onCancel && onCancel();
  }

  tree() {
    let loop = x => {
      return (
        <Tree.TreeNode
          key={x.Id}
          value={x.Id}
          title={
            <span>
              {x.Name}&emsp;<Icon onClick={e => this.addDistrict(x.Id)} type="plus-circle" />
            </span>
          }
        >
          {x.Children ? x.Children.map(loop) : null}
        </Tree.TreeNode>
      );
    };
    return <Tree>{this.state.districts.map(loop)}</Tree>;
  }

  getRolesCmp() {
    let { entity, roles } = this.state;
    let { RoleName } = entity;
    let rs = [];

    if (RoleName) {
      rs = RoleName.split('|');
    }

    return roles.map(r => (
      <Checkbox
        defaultChecked={rs.includes(r.Id)}
        onChange={e => {
          this.refreshRoles(r.Id, e.target.checked);
        }}
      >
        {r.Name}
      </Checkbox>
    ));
  }

  refreshRoles(id, checked) {
    let { entity } = this.state;
    let { RoleName } = entity;
    let rs = [];
    if (RoleName) {
      rs = RoleName.split('|');
    }

    if (checked) {
      rs.push(id);
      entity.RoleName = rs.join('|');
    } else {
      entity.RoleName = rs.filter(i => i !== id).join('|');
    }
    this.setState({});
  }

  addDistrict(i) {
    let { entity } = this.state;
    let { DistrictName } = entity;

    let ds = null;

    if (!entity.DistrictName) {
      ds = [];
    } else {
      ds = DistrictName.split('|');
    }
    let t = ds.filter(x => x === i);
    if (t && t.length) {
      // 已经包含了
    } else {
      ds.push(i);
      DistrictName = ds.sort((a, b) => a > b).join('|');
      entity.DistrictName = DistrictName;
      this.setState({});
    }
  }

  removeDistrict(i) {
    let { entity } = this.state;
    let { DistrictName } = entity;
    if (DistrictName) {
      let ds = DistrictName.split('|');
      DistrictName = ds
        .filter(d => d !== i)
        .sort((a, b) => a > b)
        .join('|');
      entity.DistrictName = DistrictName;
      this.setState({});
    }
  }
  // 获取行政区数据
  async getDistricts() {
    let rt = await Post(url_GetDistrictTreeFromDistrict);
    rtHandle(rt, d => {
      let districts = getDistricts(d);
      this.setState({ districts: districts });
    });
  }

  getDistrictsCmp() {
    let { entity } = this.state;

    let { DistrictName } = entity;
    if (DistrictName) {
      let dis = DistrictName.split('|').sort((a, b) => a > b);
      return dis.map(d => (
        <span>
          {d}&emsp;<Icon onClick={e => this.removeDistrict(d)} type="minus" />
        </span>
      ));
    } else {
      return null;
    }
  }

  componentDidMount() {
    let { id } = this.props;
    this.getFormData(id);
    this.getDistrictTree();
    this.getRoles();
    this.getDistricts();
  }

  render() {
    let { passwordConfirmed, entity, districts, reload } = this.state;

    return (
      <div className={st.UserForm}>
        {reload ? (
          <div />
        ) : (
          <div>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  label={
                    <span>
                      <span style={{ color: 'red' }}>*</span>用户名
                    </span>
                  }
                >
                  <Input
                    placeholder="用户名"
                    defaultValue={entity.UserName}
                    onChange={e => {
                      this.mObj.UserName = e.target.value;
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  label={
                    <span>
                      <span style={{ color: 'red' }}>*</span>密码
                    </span>
                  }
                >
                  <Input
                    type="password"
                    placeholder="密码"
                    defaultValue={entity.Password}
                    onChange={e => {
                      this.mObj.Password = e.target.value;
                    }}
                    onBlur={e => {
                      this.state.passwordConfirmed =
                        this.mObj.ConfirmPassword === this.mObj.Password;
                      this.setState({});
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="确认密码">
                  <Tooltip
                    visible={!passwordConfirmed}
                    placement="right"
                    title="两次输入的密码不一致"
                    overlayClassName={st.tooltip}
                  >
                    <Input
                      type="password"
                      placeholder="确认密码"
                      defaultValue={entity.Password}
                      onChange={e => {
                        this.mObj.ConfirmPassword = e.target.value;
                      }}
                      onBlur={e => {
                        this.state.passwordConfirmed =
                          this.mObj.ConfirmPassword === this.mObj.Password;
                        this.setState({});
                      }}
                    />
                  </Tooltip>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="经办人">
                  <Input
                    placeholder="经办人"
                    defaultValue={entity.Name}
                    onChange={e => {
                      this.mObj.Name = e.target.value;
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="行政区">
                  <Cascader
                    style={{ width: '100%' }}
                    value={entity.NeighborhoodsID}
                    expandTrigger="hover"
                    options={districts}
                    placeholder="行政区划"
                    onChange={(a, b) => {
                      this.mObj.NeighborhoodsID = a.length ? a[1] : null;
                      entity.NeighborhoodsID = a;
                      this.setState({ entity: entity });
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="所在窗口">
                  <Select
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="所在窗口"
                    defaultValue={entity.Window || undefined}
                    onChange={e => {
                      this.mObj.Window = e || null;
                    }}
                  >
                    {windows.map(e => <Select.Option value={e}>{e}</Select.Option>)}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="邮箱">
                  <Input
                    placeholder="邮箱"
                    defaultValue={entity.Email}
                    onChange={e => {
                      this.mObj.Email = e.target.value;
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="手机号码">
                  <Input
                    placeholder="手机号码"
                    defaultValue={entity.Telephone}
                    onChange={e => {
                      this.mObj.Telephone = e.target.value;
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="固定电话">
                  <Input
                    placeholder="固定电话"
                    defaultValue={entity.Telephone2}
                    onChange={e => {
                      this.mObj.Telephone2 = e.target.value;
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="办公地址">
                  <Input
                    placeholder="办公地址"
                    defaultValue={entity.BGDZ}
                    onChange={e => {
                      this.mObj.BGDZ = e.target.value;
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={4} />
              <Col span={4} />
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="性别">
                  <Select
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="性别"
                    defaultValue={entity.Gender || undefined}
                    onChange={e => {
                      this.mObj.Gender = e || null;
                    }}
                  >
                    {['男', '女'].map(e => <Select.Option value={e}>{e}</Select.Option>)}
                  </Select>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="生日">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="生日"
                    defaultValue={entity.Birthday}
                    onChange={e => {
                      this.mObj.Birthday = e && e.format();
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="注册时间">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="注册时间"
                    defaultValue={entity.CreateTime}
                    onChange={e => {
                      this.mObj.CreateTime = e && e.format();
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="数据权限">
                  <div className={st.prvs}>
                    <div>
                      <Popover
                        overlayClassName={st.ctpopover}
                        placement="rightTop"
                        trigger="click"
                        content={this.tree()}
                      >
                        <Button shape="circle" icon="plus" type="primary" size="small" />
                      </Popover>
                    </div>
                    <div>{this.getDistrictsCmp()}</div>
                  </div>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="功能权限">
                  <div className={st.prvs}>
                    <div />
                    <div>{this.getRolesCmp()}</div>
                  </div>
                </FormItem>
              </Col>
            </Row>
            <div className={st.btns}>
              <Button type="primary" onClick={e => this.save()}>
                保存
              </Button>
              &ensp;
              <Button
                onClick={e => {
                  this.cancel();
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default UserForm;
