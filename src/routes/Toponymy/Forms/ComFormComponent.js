import React, { useEffect } from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import { url_SearchPinyinDM } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import st from './SettlementForm.less';
const FormItem = Form.Item;

const GetNameRow = (FormType, entity, cThis, getFieldDecorator) => {
  let { HYPYgroup } = cThis.state;

  // useEffect(() => {
  //   console.log('111111');
  // }, []);

  const getPinyin = async name => {
    let rt = await Post(url_SearchPinyinDM, { Name: name });
    rtHandle(rt, d => {
      // 给拼音select下拉列表赋值，并将第一个值设为默认值
      let { entity } = cThis.state;
      cThis.mObj.Pinyin = d.name[0];
      entity.Pinyin = d.name[0];
      cThis.setState({ entity: entity, HYPYgroup: d });
      cThis.props.form.setFieldsValue({
        Pinyin: d.name[0],
      });
    });
  };

  if (FormType === 'ToponymyAccept') {
    //地名受理的拟用名称1-3
    return (
      <Row>
        <Col span={6}>
          <FormItem
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            label={
              <span>
                <span className={st.ired}>*</span>拟用名称1
              </span>
            }
          >
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name1 = e.target.value;
                }}
                placeholder="拟用名称1"
                style={{ width: '83%', marginRight: '5%' }}
                disabled={cThis.isDisabeld('Name1')}
              />
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThis.CheckName(
                    $(e.target)
                      .parent()
                      .find('input')
                      .val()
                  );
                }}
              />
            </div>
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="拟用名称2">
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name2 = e.target.value;
                }}
                placeholder="拟用名称2"
                style={{ width: '83%', marginRight: '5%' }}
                disabled={cThis.isDisabeld('Name2')}
              />
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThis.CheckName(
                    $(e.target)
                      .parent()
                      .find('input')
                      .val()
                  );
                }}
              />
            </div>
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="拟用名称3">
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name3 = e.target.value;
                }}
                placeholder="拟用名称3"
                style={{ width: '83%', marginRight: '5%' }}
                disabled={cThis.isDisabeld('Name3')}
              />
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThis.CheckName(
                    $(e.target)
                      .parent()
                      .find('input')
                      .val()
                  );
                }}
              />
            </div>
          </FormItem>
        </Col>
      </Row>
    );
  } else if (FormType === 'ToponymyPreApproval') {
    //预命名的拟用名称
    return (
      <Row>
        <Col span={6}>
          <FormItem
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            label={
              <span>
                <span className={st.ired}>*</span>
                拟用名称
              </span>
            }
          >
            <div className={st.nameCheck}>
              {getFieldDecorator('Name1', {
                initialValue: entity.Name1,
              })(
                <Input
                  onBlur={e => {
                    cThis.mObj.Name1 = e.target.value;
                    let { entity } = cThis.state;
                    entity.Name1 = e.target.value;
                    cThis.setState({
                      entity: entity,
                    });
                    getPinyin(e.target.value);
                  }}
                  placeholder="拟用名称"
                  style={{
                    width: '83%',
                    marginRight: '5%',
                  }}
                />
              )}
            </div>
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="汉语拼音">
            <div className={st.nameCheck}>
              {getFieldDecorator('Pinyin', {
                initialValue: entity.Pinyin,
              })(
                <Select
                  style={{
                    width: '84%',
                    marginRight: '5px',
                  }}
                  onChange={e => {
                    cThis.mObj.Pinyin = e;
                    let { entity } = cThis.state;
                    entity.Pinyin = e;
                    cThis.setState({
                      entity: entity,
                    });
                  }}
                  placeholder="汉语拼音"
                >
                  {HYPYgroup.value.map((e, index) => (
                    <Select.Option value={HYPYgroup.name[index]}>{e}</Select.Option>
                  ))}
                </Select>
              )}
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThis.CheckName(cThis.state.entity.Pinyin, cThis.state.entity.Name1);
                }}
              />
            </div>
          </FormItem>
        </Col>
      </Row>
    );
  } else if (
    FormType === 'ToponymyApproval' ||
    FormType === 'ToponymyRename' ||
    FormType === 'ToponymyReplace' ||
    FormType === 'ToponymyCancel'
  ) {
    //命名的标准名称
    return (
      <Row>
        <Col span={6}>
          <FormItem
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            label={
              <span>
                <span className={st.ired}>*</span>
                标准名称
              </span>
            }
          >
            <div className={st.nameCheck}>
              {getFieldDecorator('Name1', {
                initialValue: entity.Name1,
              })(
                <Input
                  onBlur={e => {
                    cThis.mObj.Name1 = e.target.value;
                    let { entity } = cThis.state;
                    entity.Name1 = e.target.value;
                    if (FormType == 'ToponymyRename') {
                      cThis.props.form.setFieldsValue({
                        LSYG:
                          '原为' +
                          entity.Name1 +
                          ', ' +
                          (entity.PFTime ? entity.PFTime : '') +
                          '更名',
                      });
                    }
                    cThis.setState({
                      entity: entity,
                    });
                    getPinyin(e.target.value);
                  }}
                  placeholder="标准名称"
                  style={{
                    width: '83%',
                    marginRight: '5%',
                  }}
                  disabled={cThis.isDisabeld('Name1')}
                />
              )}
            </div>
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            label={
              <span>
                <span className={st.ired}>*</span>
                汉语拼音
              </span>
            }
          >
            <div className={st.nameCheck}>
              {getFieldDecorator('Pinyin', {
                initialValue: entity.Pinyin,
              })(
                <Select
                  style={{
                    width: '84%',
                    marginRight: '5px',
                  }}
                  onChange={e => {
                    cThis.mObj.Pinyin = e;
                    let { entity } = cThis.state;
                    entity.Pinyin = e;
                    cThis.setState({
                      entity: entity,
                    });
                  }}
                  placeholder="汉语拼音"
                  disabled={cThis.isDisabeld('Pinyin')}
                >
                  {HYPYgroup.value.map((e, index) => (
                    <Select.Option value={HYPYgroup.name[index]}>{e}</Select.Option>
                  ))}
                </Select>
              )}
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThis.CheckName(cThis.state.entity.Pinyin, cThis.state.entity.Name1);
                }}
              />
            </div>
          </FormItem>
        </Col>
      </Row>
    );
  }
};
export { GetNameRow };
