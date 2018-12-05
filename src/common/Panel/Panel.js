import { Link } from 'dva/router';
import React, { Component } from 'react';
import { Icon, Tabs, Menu } from 'antd';
import st from './Panel.less';

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Panel extends Component {
  render() {
    return (
      <div className={st.panel}>
        <Menu defaultSelectedKeys={this.props.defaultSelectedKeys} mode="inline" theme="light">
          <Menu.Item key="1">
            <Link to="/doorplate/doorplatesearch">
              <Icon type="search" />
              <span> 门牌查询 </span>
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/doorplate/doorplatemanage">
              <Icon type="tags" />
              <span> 门牌编制 </span>
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/doorplate/doorplatemaking">
              <Icon type="calendar" />
              <span> 门牌制作 </span>
            </Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Link to="/doorplate/doorplatestatistic">
              <Icon type="area-chart" />
              <span> 业务统计 </span>
            </Link>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
export default Panel;
