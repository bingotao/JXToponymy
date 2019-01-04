import { Component } from 'react';
import st from './UserBadge.less';
import { Icon, Modal, Popover, Button, Input, Form } from 'antd';
import { getUser, logout } from '../../utils/login';
import { ModifyPassword } from '../../services/Login';
import { success } from '../../utils/notification';

class UserBadge extends Component {
  constructor(ps) {
    super(ps);
    this.user = getUser();
  }

  state = {
    showModifyPassword: false,
  };
  logout() {
    Modal.confirm({
      title: '确定退出系统？',
      content: '',
      okText: '确认',
      cancelText: '取消',
      onOk: e => {
        logout();
      },
    });
  }

  hiddenModifyPassword() {
    this.setState({ showModifyPassword: false });
  }

  render() {
    let { user } = this;
    let { showModifyPassword } = this.state;
    return (
      <div className={st.UserBadge}>
        <span className={st.icon}>
          <Icon type="user" />
        </span>
        <Popover
          trigger="hover"
          placement="bottom"
          content={
            <div>
              <Button
                size="small"
                type="primary"
                onClick={e => this.setState({ showModifyPassword: true })}
              >
                修改密码
              </Button>
            </div>
          }
        >
          <span style={{ cursor: 'pointer' }}>{user ? user.userName : '未登录'}</span>
        </Popover>
        {user ? (
          <span className={st.logout} onClick={this.logout.bind(this)}>
            注销
          </span>
        ) : null}
        <Modal
          title="修改密码"
          onCancel={this.hiddenModifyPassword.bind(this)}
          visible={showModifyPassword}
          destroyOnClose={true}
          footer={null}
          // width={400}
        >
          <ModifyPasswordForm />
        </Modal>
      </div>
    );
  }
}

class CountDown extends Component {
  constructor(ps) {
    super(ps);
    this.state = {
      count: ps.count,
    };
  }

  start() {
    let { count } = this.state;
    let { callback } = this.props;
    let interval = setInterval(e => {
      count -= 1;
      if (count === 0) {
        clearInterval(interval);
        if (callback) callback();
      }
      this.setState({ count: count });
    }, 1000);
  }
  
  componentDidMount() {
    this.start();
  }

  render() {
    let { count } = this.state;
    return <div>{count}秒后自动退出登录</div>;
  }
}

class ModifyPasswordForm extends Component {
  mObj = {};

  handSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        ModifyPassword(
          { NPassword: md5(values.NPassword), OPassword: md5(values.OPassword) },
          e => {
            let m = Modal.success({
              centered: true,
              title: '修改密码成功，请重新登录！！',
              content: (
                <CountDown
                  count={6}
                  callback={e => {
                    m.destroy();
                    logout();
                  }}
                />
              ),
              onOk: e => {
                logout();
              },
            });
          }
        );
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const that = this;
    return (
      <Form onSubmit={this.handSubmit.bind(this)} className={st.ModifyPasswordForm}>
        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="原密码">
          {getFieldDecorator('OPassword', {
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请输入原密码！' }],
          })(
            <Input
              type="password"
              placeholder="原密码"
              onChange={e => {
                this.mObj.OPassword = e.target.value;
              }}
            />
          )}
        </Form.Item>
        <div style={{ margin: '20px' }} />
        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="新密码">
          {getFieldDecorator('NPassword', {
            validateTrigger: 'onBlur',
            rules: [
              {
                validator: (rule, value, callback, source, options) => {
                  var errors = [];
                  if (!that.mObj.NPassword) {
                    errors.push('请输入新密码！');
                  }
                  callback(errors);
                },
              },
            ],
          })(
            <Input
              type="password"
              placeholder="新密码"
              onChange={e => {
                this.mObj.NPassword = e.target.value;
              }}
            />
          )}
        </Form.Item>
        <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="确认新密码">
          {getFieldDecorator('CPassword', {
            validateTrigger: 'onBlur',
            rules: [
              {
                validator: (rule, value, callback, source, options) => {
                  var errors = [];
                  if (that.mObj.CPassword) {
                    if (that.mObj.NPassword !== that.mObj.CPassword) {
                      errors.push('两次输入的密码不一致！');
                    }
                  } else {
                    errors.push('请确认密码！');
                  }
                  callback(errors);
                },
              },
            ],
          })(
            <Input
              type="password"
              placeholder="确认密码"
              onChange={e => {
                this.mObj.CPassword = e.target.value;
              }}
            />
          )}
        </Form.Item>
        <div className={st.btns}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
          &emsp;
          <Button>取消</Button>
        </div>
      </Form>
    );
  }
}

ModifyPasswordForm = Form.create({})(ModifyPasswordForm);

export default UserBadge;
