import React, { useState } from 'react';
import { Form, Row, Col, Input, Select, Button } from 'antd';
import { url_SearchPinyinDM } from '../../../common/urls.js';
import { Post } from '../../../utils/request.js';
import { rtHandle } from '../../../utils/errorHandle.js';
import st from './SettlementForm.less';
const FormItem = Form.Item;

const GetNameRow = (FormType, entity, cThis, getFieldDecorator, saveBtnClicked) => {
  let { HYPYgroup } = cThis.state;

  if (FormType === 'ToponymyAccept') {
    //地名受理的拟用名称1-3
    return (
      <Row>
        <Col span={8}>
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
                // style={{ width: '83%', marginRight: '2%' }}
                disabled={cThis.isDisabeld('Name1')}
              />
              {/* <span
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
              /> */}
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="拟用名称2">
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name2 = e.target.value;
                }}
                placeholder="拟用名称2"
                // style={{ width: '83%', marginRight: '2%' }}
                disabled={cThis.isDisabeld('Name2')}
              />
              {/* <span
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
              /> */}
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="拟用名称3">
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name3 = e.target.value;
                }}
                placeholder="拟用名称3"
                // style={{ width: '83%', marginRight: '2%' }}
                disabled={cThis.isDisabeld('Name3')}
              />
              {/* <span
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
              /> */}
            </div>
          </FormItem>
        </Col>
      </Row>
    );
  } else if (FormType === 'ToponymyPreApproval') {
    //预命名的拟用名称
    return (
      <Row>
        <Col span={8}>
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
                <Select
                  onChange={e => {
                    cThis.mObj.Name1 = e;
                    let { entity } = cThis.state;
                    entity.Name1 = e;
                    cThis.setState({
                      entity: entity,
                    });
                    // cThis.props.form.setFieldsValue({ Name1: e });
                    // cThis.getPinyin(e);
                  }}
                  disabled={cThis.isDisabeld('Name1')}
                  placeholder="拟用名称"
                  // style={{
                  //   width: '83%',
                  //   marginRight: '2%',
                  // }}
                >
                  {entity.Name1 != null ? (
                    <Select.Option value={entity.Name1}>{entity.Name1}</Select.Option>
                  ) : null}
                  {entity.Name2 != null ? (
                    <Select.Option value={entity.Name2}>{entity.Name2}</Select.Option>
                  ) : null}
                  {entity.Name3 != null ? (
                    <Select.Option value={entity.Name3}>{entity.Name3}</Select.Option>
                  ) : null}
                </Select>
              )}
            </div>
          </FormItem>
        </Col>
        {/* <Col span={8}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="汉语拼音">
            <div className={st.nameCheck}>
              {getFieldDecorator('Pinyin', {
                initialValue: entity.Pinyin,
              })(
                <Select
                  style={{
                    width: '83%',
                    marginRight: '2%',
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
        </Col> */}
      </Row>
    );
  } else if (
    FormType === 'ToponymyApproval' ||
    FormType === 'ToponymyReplace' ||
    FormType === 'ToponymyCancel' ||
    FormType === 'DMXQ'
  ) {
    //命名的标准名称
    return (
      <Row>
        <Col span={8}>
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
              {getFieldDecorator('Name', {
                initialValue: entity.Name,
              })(
                <Select
                  onChange={e => {
                    cThis.mObj.Name = e;
                    let { entity } = cThis.state;
                    entity.Name = e;
                    if (FormType == 'ToponymyRename') {
                      entity.CYM = entity.Name;
                      cThis.props.form.setFieldsValue({
                        LSYG: cThis.setLsyg(
                          entity.Name,
                          entity.PFTime ? entity.PFTime.format('YYYY年MM月DD日') : ''
                        ),
                      });
                    }
                    cThis.setState({ entity: entity });
                    cThis.getPinyin(e);
                  }}
                  placeholder="标准名称"
                  disabled={cThis.isDisabeld('Name')}
                >
                  {entity.Name1 != null ? (
                    <Select.Option value={entity.Name1}>{entity.Name1}</Select.Option>
                  ) : null}
                  {entity.Name2 != null ? (
                    <Select.Option value={entity.Name2}>{entity.Name2}</Select.Option>
                  ) : null}
                  {entity.Name3 != null ? (
                    <Select.Option value={entity.Name3}>{entity.Name3}</Select.Option>
                  ) : null}
                </Select>
              )}
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
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
                    width: 'auto',
                    minWidth: '80%',
                    marginRight: '2%',
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
              <Button
                title="名称检查"
                icon="check"
                onClick={e => {
                  cThis.CheckName(cThis.state.entity.Pinyin, cThis.state.entity.Name);
                }}
                type="primary"
                disabled={
                  saveBtnClicked ||
                  (FormType == 'DMXQ' ||
                  FormType === 'ToponymyReplace' ||
                  FormType === 'ToponymyCancel'
                    ? true
                    : false)
                }
              />
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="通名罗马字母拼写">
            <div className={st.nameCheck}>
              {getFieldDecorator('TMRomanSpell', {
                initialValue: entity.TMRomanSpell,
              })(
                <Input
                  onBlur={e => {
                    cThis.mObj.TMRomanSpell = e.target.value;
                    let { entity } = cThis.state;
                    entity.TMRomanSpell = e.target.value;
                    cThis.setState({
                      entity: entity,
                    });
                    cThis.getPinyin(e.target.value);
                  }}
                  placeholder="通名罗马字母拼写"
                  disabled={cThis.isDisabeld('TMRomanSpell')}
                />
              )}
            </div>
          </FormItem>
        </Col>
      </Row>
    );
  } else if (FormType === 'ToponymyRename') {
    //更名的标准名称
    return (
      <Row>
        <Col span={8}>
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
              {getFieldDecorator('Name', {
                initialValue: entity.Name,
              })(
                <Input
                  onBlur={e => {
                    cThis.mObj.Name = e.target.value;
                    let { entity } = cThis.state;
                    entity.Name = e.target.value;
                    cThis.props.form.setFieldsValue({
                      LSYG: cThis.setLsyg(
                        entity.Name,
                        entity.PFTime ? entity.PFTime.format('YYYY年MM月DD日') : ''
                      ),
                    });
                    cThis.setState({ entity: entity });
                    cThis.getPinyin(e.target.value);
                  }}
                  placeholder="标准名称"
                  disabled={cThis.isDisabeld('Name')}
                />
              )}
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
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
                    width: 'auto',
                    minWidth: '80%',
                    marginRight: '2%',
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
              <Button
                title="名称检查"
                icon="check"
                onClick={e => {
                  cThis.CheckName(cThis.state.entity.Pinyin, cThis.state.entity.Name);
                }}
                type="primary"
                disabled={
                  saveBtnClicked ||
                  (FormType == 'DMXQ' ||
                  FormType === 'ToponymyReplace' ||
                  FormType === 'ToponymyCancel'
                    ? true
                    : false)
                }
              />
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} label="通名罗马字母拼写">
            <div className={st.nameCheck}>
              {getFieldDecorator('TMRomanSpell', {
                initialValue: entity.TMRomanSpell,
              })(
                <Input
                  onBlur={e => {
                    cThis.mObj.TMRomanSpell = e.target.value;
                    let { entity } = cThis.state;
                    entity.TMRomanSpell = e.target.value;
                    cThis.setState({
                      entity: entity,
                    });
                    cThis.getPinyin(e.target.value);
                  }}
                  placeholder="通名罗马字母拼写"
                  disabled={cThis.isDisabeld('TMRomanSpell')}
                />
              )}
            </div>
          </FormItem>
        </Col>
      </Row>
    );
  }
};
export { GetNameRow };
