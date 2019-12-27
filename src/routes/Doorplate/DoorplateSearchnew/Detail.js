import React, { Component } from 'react';
import { Descriptions } from 'antd';
import st from './Detail.less';

class Detail extends Component {

  componentDidMount() {

  }

  render() {
    const { DETAIL } = this.props;
    return (
      <div>
        <Descriptions
          // title={<div className={st.detailTitle}>地名证明信息</div>}
          bordered
          column={2}
          size='small'>
          <Descriptions.Item label="申报行政区划">{DETAIL.PropertyOwner}</Descriptions.Item>
          <Descriptions.Item label="产权人">{DETAIL.PropertyOwner}</Descriptions.Item>
          <Descriptions.Item label="申报原标准地名地址">{DETAIL.IDType}</Descriptions.Item>
          <Descriptions.Item label="申报现地名地址">{DETAIL.IDNumber}</Descriptions.Item>
        </Descriptions>
      </div>

    );
  }
}

export default Detail;
