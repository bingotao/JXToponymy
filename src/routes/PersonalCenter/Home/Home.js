import { Component } from 'react';
import { Row, Col, DatePicker, Button } from 'antd';
import st from './Home.less';

function createPie(chart) {
  let option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 20,
      data: ['一窗受理', '在线申报', '浙里办', '门牌办理', '地名证明', '地名核准', '出具意见'],
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: [0, '30%'],
        label: {
          normal: {
            position: 'inner',
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: [
          { value: 1000, name: '一窗受理', itemStyle: { color: 'rgb(250,133,100)' } },
          { value: 500, name: '在线申报', itemStyle: { color: 'rgb(44,181,172)' } },
          { value: 200, name: '浙里办', itemStyle: { color: 'rgb(56,197,241)' } },
        ],
      },
      {
        name: '访问来源',
        type: 'pie',
        radius: ['40%', '55%'],
        data: [
          { value: 200, name: '门牌办理', itemStyle: { color: '#7cb5ec' } },
          { value: 1200, name: '地名证明', itemStyle: { color: '#2b908f' } },
          { value: 150, name: '地名核准', itemStyle: { color: '#90ed7d' } },
          { value: 150, name: '出具意见', itemStyle: { color: '#f7a35c' } },
        ],
      },
    ],
  };

  chart.setOption(option);
}

let end = moment();
let start = moment().subtract(7, 'day');

class Class extends Component {
  condition = {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
  };

  toTodo(SQLX, QLSX) {
    this.props.history.push({
      pathname: '/placemanage/personalcenter/todo',
      state: {
        SQLX: SQLX,
        QLSX: QLSX,
      },
    });
  }

  componentDidMount() {
    this.chart = echarts.init(this.tb);
    createPie(this.chart);
  }

  render() {
    return (
      <div className={st.Home}>
        <div className={'ct-fm-grp ' + st.dbgk}>
          <div className="ct-fm-grp-hd">待办事项</div>
          <div className="ct-fm-grp-ctt">
            <div>
              <Row>
                <Col span={6}>
                  <img src={require('../../../assets/窗口办理.png')} />
                </Col>
                <Col span={18}>
                  <Row>
                    <Col span={6}>门牌办理</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '核发门牌证')}>12</span>件
                    </Col>
                    <Col span={6}>地名证明</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '地名证明')}>12</span>件
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>地名核准</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '地名核准')}>12</span>件
                    </Col>
                    <Col span={6}>出具意见</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '出具意见')}>12</span>件
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            <div>
              <Row>
                <Col span={6}>
                  <img src={require('../../../assets/网上申报.png')} />
                </Col>
                <Col span={18}>
                  <Row>
                    <Col span={6}>门牌办理</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '核发门牌证')}>12</span>件
                    </Col>
                    <Col span={6}>地名证明</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '地名证明')}>12</span>件
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>地名核准</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '地名核准')}>12</span>件
                    </Col>
                    <Col span={6}>出具意见</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '出具意见')}>12</span>件
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            <div>
              <Row>
                <Col span={6}>
                  <img src={require('../../../assets/浙里办.png')} />
                </Col>
                <Col span={18}>
                  <Row>
                    <Col span={6}>门牌办理</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '核发门牌证')}>12</span>件
                    </Col>
                    <Col span={6}>地名证明</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '地名证明')}>12</span>件
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>地名核准</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '地名核准')}>12</span>件
                    </Col>
                    <Col span={6}>出具意见</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '出具意见')}>12</span>件
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className={'ct-fm-grp ' + st.dbsx}>
          <div className="ct-fm-grp-hd">业务统计图</div>
          <div className="ct-fm-grp-ctt">
            <div className={st.daterange}>
              <DatePicker
                defaultValue={start}
                allowClear={false}
                onChange={e => {
                  this.condition.start = e && e.format('YYYY-MM-DD');
                }}
              />&ensp;-&ensp;<DatePicker
                defaultValue={end}
                allowClear={false}
                onChange={e => {
                  this.condition.end = e && e.format('YYYY-MM-DD');
                }}
              />&emsp;<Button icon="pie-chart">统计</Button>
            </div>
            <div ref={e => (this.tb = e)} className={st.tbpanel} />
          </div>
        </div>

        <div className={'ct-fm-grp ' + st.ybqk}>
          <div className="ct-fm-grp-hd">业务统计表</div>
          <div className="ct-fm-grp-ctt">
            <table>
              <tr>
                <th width="20%">业务来源</th>
                <th width="20%">办理事项</th>
                <th>已办数量</th>
                <th>待办数量</th>
                <th>合计</th>
              </tr>
              <tr>
                <td rowSpan="4">一窗受理</td>
                <td>门牌办理</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td rowSpan="4">网上申报</td>
                <td>门牌办理</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td rowSpan="4">浙里办</td>
                <td>门牌办理</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td rowSpan="4">小计</td>
                <td>门牌办理</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
              <tr>
                <td colSpan="2">合计</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Class;
