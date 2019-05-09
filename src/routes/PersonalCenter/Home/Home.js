import { Component } from 'react';
import { Row, Col, DatePicker, Button } from 'antd';
import st from './Home.less';

import { GetHomePageTotalData, GetHomePageDetailData } from '../../../services/PersonalCenter';

function createPie(chart, sum) {
  let { MP, DMZM, DMHZ, CJYJ, YC, ZXSB, ZLB } = sum;

  let option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 20,
      data: ['一窗受理', '网上申报', '浙里办', '门牌编制', '地名证明', '地名核准', '出具意见'],
    },
    series: [
      {
        name: '申报来源',
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
          { value: YC, name: '一窗受理', itemStyle: { color: 'rgb(250,133,100)' } },
          { value: ZXSB, name: '网上申报', itemStyle: { color: 'rgb(44,181,172)' } },
          { value: ZLB, name: '浙里办', itemStyle: { color: 'rgb(56,197,241)' } },
        ],
      },
      {
        name: '业务类别',
        type: 'pie',
        radius: ['40%', '55%'],
        data: [
          { value: MP, name: '门牌编制', itemStyle: { color: '#7cb5ec' } },
          { value: DMZM, name: '地名证明', itemStyle: { color: '#2b908f' } },
          { value: DMHZ, name: '地名核准', itemStyle: { color: '#90ed7d' } },
          { value: CJYJ, name: '出具意见', itemStyle: { color: '#f7a35c' } },
        ],
      },
    ],
  };

  chart.setOption(option);
}

let end = moment();
let start = moment().subtract(7, 'day');

class Class extends Component {
  state = {
    allTodo: {
      MP_YC: 0,
      MP_ZXSB: 0,
      MP_ZLB: 0,
      MP: 0,
      DMHZ_YC: 0,
      DMHZ_ZXSB: 0,
      DMHZ_ZLB: 0,
      DMHZ: 0,
      CJYJ_YC: 0,
      CJYJ_ZXSB: 0,
      CJYJ_ZLB: 0,
      CJYJ: 0,
      DMZM_YC: 0,
      DMZM_ZXSB: 0,
      DMZM_ZLB: 0,
      DMZM: 0,
    },
    todo: {
      MP_YC: 0,
      MP_ZXSB: 0,
      MP_ZLB: 0,
      MP: 0,
      DMHZ_YC: 0,
      DMHZ_ZXSB: 0,
      DMHZ_ZLB: 0,
      DMHZ: 0,
      CJYJ_YC: 0,
      CJYJ_ZXSB: 0,
      CJYJ_ZLB: 0,
      CJYJ: 0,
      DMZM_YC: 0,
      DMZM_ZXSB: 0,
      DMZM_ZLB: 0,
      DMZM: 0,
    },
    done: {
      MP_YC: 0,
      MP_ZXSB: 0,
      MP_ZLB: 0,
      MP: 0,
      DMHZ_YC: 0,
      DMHZ_ZXSB: 0,
      DMHZ_ZLB: 0,
      DMHZ: 0,
      CJYJ_YC: 0,
      CJYJ_ZXSB: 0,
      CJYJ_ZLB: 0,
      CJYJ: 0,
      DMZM_YC: 0,
      DMZM_ZXSB: 0,
      DMZM_ZLB: 0,
      DMZM: 0,
    },
    sum: {
      MP: 0,
      DMZM: 0,
      DMHZ: 0,
      CJYJ: 0,
      YC: 0,
      ZXSB: 0,
      ZLB: 0,
    },
  };

  condition = {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
  };

  toTodo(SBLY, LX) {
    this.props.history.push({
      pathname: '/placemanage/personalcenter/todo',
      state: {
        SBLY: SBLY,
        LX: LX,
      },
    });
  }

  getTodoData() {
    GetHomePageTotalData(d => {
      let { toDoItem } = d;
      if (toDoItem) this.setState({ allTodo: toDoItem });
    });
  }

  getDoneData() {
    GetHomePageDetailData(this.condition, d => {
      let { toDoItem, doneItem } = d;
      toDoItem.MP = toDoItem.MP_YC + toDoItem.MP_ZLB + toDoItem.MP_ZXSB;
      toDoItem.DMZM = toDoItem.DMZM_YC + toDoItem.DMZM_ZLB + toDoItem.DMZM_ZXSB;
      toDoItem.DMHZ = toDoItem.DMHZ_YC + toDoItem.DMHZ_ZLB + toDoItem.DMHZ_ZXSB;
      toDoItem.CJYJ = toDoItem.CJYJ_YC + toDoItem.CJYJ_ZLB + toDoItem.CJYJ_ZXSB;

      doneItem.MP = doneItem.MP_YC + doneItem.MP_ZLB + doneItem.MP_ZXSB;
      doneItem.DMZM = doneItem.DMZM_YC + doneItem.DMZM_ZLB + doneItem.DMZM_ZXSB;
      doneItem.DMHZ = doneItem.DMHZ_YC + doneItem.DMHZ_ZLB + doneItem.DMHZ_ZXSB;
      doneItem.CJYJ = doneItem.CJYJ_YC + doneItem.CJYJ_ZLB + doneItem.CJYJ_ZXSB;

      let sum = {};
      sum.MP = toDoItem.MP + doneItem.MP;
      sum.DMZM = toDoItem.DMZM + doneItem.DMZM;
      sum.DMHZ = toDoItem.DMHZ + doneItem.DMHZ;
      sum.CJYJ = toDoItem.CJYJ + doneItem.CJYJ;

      sum.ZXSB =
        toDoItem.MP_ZXSB +
        toDoItem.DMZM_ZXSB +
        toDoItem.DMHZ_ZXSB +
        toDoItem.CJYJ_ZXSB +
        doneItem.MP_ZXSB +
        doneItem.DMZM_ZXSB +
        doneItem.DMHZ_ZXSB +
        doneItem.CJYJ_ZXSB;

      sum.YC =
        toDoItem.MP_YC +
        toDoItem.DMZM_YC +
        toDoItem.DMHZ_YC +
        toDoItem.CJYJ_YC +
        doneItem.MP_YC +
        doneItem.DMZM_YC +
        doneItem.DMHZ_YC +
        doneItem.CJYJ_YC;

      sum.ZLB =
        toDoItem.MP_ZLB +
        toDoItem.DMZM_ZLB +
        toDoItem.DMHZ_ZLB +
        toDoItem.CJYJ_ZLB +
        doneItem.MP_ZLB +
        doneItem.DMZM_ZLB +
        doneItem.DMHZ_ZLB +
        doneItem.CJYJ_ZLB;

      this.setState({
        todo: toDoItem,
        done: doneItem,
        sum: sum,
      });

      createPie(this.chart, sum);
    });
  }

  componentDidMount() {
    this.chart = echarts.init(this.tb);
    this.getDoneData();
    this.getTodoData();
  }

  render() {
    let { allTodo, todo, done, sum } = this.state;

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
                    <Col span={6}>门牌编制</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '门牌编制')}>
                        {allTodo.MP_YC}
                      </span>件
                    </Col>
                    <Col span={6}>地名证明</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '地名证明')}>
                        {allTodo.DMZM_YC}
                      </span>件
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>地名核准</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '地名核准')}>
                        {allTodo.DMHZ_YC}
                      </span>件
                    </Col>
                    <Col span={6}>出具意见</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('一窗受理', '出具意见')}>
                        {allTodo.CJYJ_YC}
                      </span>件
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
                    <Col span={6}>门牌编制</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '门牌编制')}>
                        {allTodo.MP_ZXSB}
                      </span>件
                    </Col>
                    <Col span={6}>地名证明</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '地名证明')}>
                        {allTodo.DMZM_ZXSB}
                      </span>件
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>地名核准</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '地名核准')}>
                        {allTodo.DMHZ_ZXSB}
                      </span>件
                    </Col>
                    <Col span={6}>出具意见</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('网上申报', '出具意见')}>
                        {allTodo.CJYJ_ZXSB}
                      </span>件
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
                    <Col span={6}>门牌编制</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '门牌编制')}>{allTodo.MP_ZLB}</span>件
                    </Col>
                    <Col span={6}>地名证明</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '地名证明')}>
                        {allTodo.DMZM_ZLB}
                      </span>件
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6}>地名核准</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '地名核准')}>
                        {allTodo.DMHZ_ZLB}
                      </span>件
                    </Col>
                    <Col span={6}>出具意见</Col>
                    <Col span={6}>
                      <span onClick={e => this.toTodo('浙里办', '出具意见')}>
                        {allTodo.CJYJ_ZLB}
                      </span>件
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
              />&emsp;<Button
                icon="pie-chart"
                onClick={e => {
                  this.getDoneData();
                }}
              >
                统计
              </Button>
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
                <td>门牌编制</td>
                <td>{done.MP_YC}</td>
                <td>{todo.MP_YC}</td>
                <td>{done.MP_YC + todo.MP_YC}</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>{done.DMZM_YC}</td>
                <td>{todo.DMZM_YC}</td>
                <td>{done.DMZM_YC + todo.DMZM_YC}</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>{done.DMHZ_YC}</td>
                <td>{todo.DMHZ_YC}</td>
                <td>{done.DMHZ_YC + todo.DMHZ_YC}</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>{done.CJYJ_YC}</td>
                <td>{todo.CJYJ_YC}</td>
                <td>{done.CJYJ_YC + todo.CJYJ_YC}</td>
              </tr>
              <tr>
                <td rowSpan="4">网上申报</td>
                <td>门牌编制</td>
                <td>{done.MP_ZXSB}</td>
                <td>{todo.MP_ZXSB}</td>
                <td>{done.MP_ZXSB + todo.MP_ZXSB}</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>{done.DMZM_ZXSB}</td>
                <td>{todo.DMZM_ZXSB}</td>
                <td>{done.DMZM_ZXSB + todo.DMZM_ZXSB}</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>{done.DMHZ_ZXSB}</td>
                <td>{todo.DMHZ_ZXSB}</td>
                <td>{done.DMHZ_ZXSB + todo.DMHZ_ZXSB}</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>{done.CJYJ_ZXSB}</td>
                <td>{todo.CJYJ_ZXSB}</td>
                <td>{done.CJYJ_ZXSB + todo.CJYJ_ZXSB}</td>
              </tr>
              <tr>
                <td rowSpan="4">浙里办</td>
                <td>门牌编制</td>
                <td>{done.MP_ZLB}</td>
                <td>{todo.MP_ZLB}</td>
                <td>{done.MP_ZLB + todo.MP_ZLB}</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>{done.DMZM_ZLB}</td>
                <td>{todo.DMZM_ZLB}</td>
                <td>{done.DMZM_ZLB + todo.DMZM_ZLB}</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>{done.DMHZ_ZLB}</td>
                <td>{todo.DMHZ_ZLB}</td>
                <td>{done.DMHZ_ZLB + todo.DMHZ_ZLB}</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>{done.CJYJ_ZLB}</td>
                <td>{todo.CJYJ_ZLB}</td>
                <td>{done.CJYJ_ZLB + todo.CJYJ_ZLB}</td>
              </tr>
              <tr>
                <td rowSpan="4">小计</td>
                <td>门牌编制</td>
                <td>{done.MP}</td>
                <td>{todo.MP}</td>
                <td>{sum.MP}</td>
              </tr>
              <tr>
                <td>地名证明</td>
                <td>{done.DMZM}</td>
                <td>{todo.DMZM}</td>
                <td>{sum.DMZM}</td>
              </tr>
              <tr>
                <td>地名核准</td>
                <td>{done.DMHZ}</td>
                <td>{todo.DMHZ}</td>
                <td>{sum.DMHZ}</td>
              </tr>
              <tr>
                <td>出具意见</td>
                <td>{done.CJYJ}</td>
                <td>{todo.CJYJ}</td>
                <td>{sum.CJYJ}</td>
              </tr>
              <tr>
                <td colSpan="2">合计</td>
                <td>{done.MP + done.DMHZ + done.DMZM + done.CJYJ}</td>
                <td>{todo.MP + todo.DMHZ + todo.DMZM + todo.CJYJ}</td>
                <td>{sum.MP + sum.DMHZ + sum.DMZM + sum.CJYJ}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Class;
