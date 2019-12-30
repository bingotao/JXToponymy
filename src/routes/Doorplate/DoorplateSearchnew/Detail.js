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
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }} size='small'>
          <Descriptions.Item label="办件事项" span={2}>申请地名证明</Descriptions.Item>
          <Descriptions.Item label="申报行政区划">{DETAIL.NeighborhoodsID}</Descriptions.Item>
          <Descriptions.Item label="产权人">{DETAIL.PropertyOwner}</Descriptions.Item>
          <Descriptions.Item label="申报原标准地名地址">{DETAIL.OriginalMPAddress}</Descriptions.Item>
          <Descriptions.Item label="申报现地名地址">{DETAIL.StandardAddress}</Descriptions.Item>
        </Descriptions>
      </div>
    );
  }
}

export default Detail;
