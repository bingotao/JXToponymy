import React from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import st from './SettlementForm.less';
const FormItem = Form.Item;
const GetNameRow = (
  FormType,
  entity,
  cThis,
  getFieldDecorator,
  hasItemDisabled,
  dontDisabledGroup
) => {
  if (FormType === 'ToponymyAccept') {
    //地名受理的拟用名称1-3
    return (
      <Row>
        <Col span={8}>
          <FormItem
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
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
              />
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThisCheckName(
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
        <Col span={8}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="拟用名称2">
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name2 = e.target.value;
                }}
                placeholder="拟用名称2"
                style={{ width: '83%', marginRight: '5%' }}
              />
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThisCheckName(
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
        <Col span={8}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="拟用名称3">
            <div className={st.nameCheck}>
              <Input
                onChange={e => {
                  cThis.mObj.Name3 = e.target.value;
                }}
                placeholder="拟用名称3"
                style={{ width: '83%', marginRight: '5%' }}
              />
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThisCheckName(
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
        <Col span={8}>
          <FormItem
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
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
                  onChange={e => {
                    cThis.mObj.Name1 = e.target.value;
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
        <Col span={8}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="汉语拼音">
            <div className={st.nameCheck}>
              {getFieldDecorator('PinYin', {
                initialValue: entity.PinYin,
              })(
                <Select
                  style={{
                    width: '84%',
                    marginRight: '5px',
                  }}
                  onChange={e => {
                    cThis.mObj.PinYin = e;
                    let { entity } = cThisstate;
                    entity.PinYin = e;
                    cThissetState({
                      entity: entity,
                    });
                  }}
                  defaultValue={entity.PinYin || undefined}
                  value={entity.PinYin || undefined}
                  placeholder="汉语拼音"
                >
                  {['暂无', '暂无'].map(e => (
                    <Select.Option value={e}>{e}</Select.Option>
                  ))}
                </Select>
              )}
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThisCheckName(
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
  } else if (
    FormType === 'ToponymyApproval' ||
    FormType === 'ToponymyRename' ||
    FormType === 'ToponymyReplace' ||
    FormType === 'ToponymyCancel'
  ) {
    //命名的标准名称
    return (
      <Row>
        <Col span={8}>
          <FormItem
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
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
                  onChange={e => {
                    cThis.mObj.Name1 = e.target.value;
                  }}
                  placeholder="标准名称"
                  style={{
                    width: '83%',
                    marginRight: '5%',
                  }}
                  disabled={
                    hasItemDisabled
                      ? dontDisabledGroup['Name1'] == undefined
                        ? true
                        : false
                      : false
                  }
                />
              )}
            </div>
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            label={
              <span>
                <span className={st.ired}>*</span>
                汉语拼音
              </span>
            }
          >
            <div className={st.nameCheck}>
              {getFieldDecorator('PinYin', {
                initialValue: entity.PinYin,
              })(
                <Select
                  style={{
                    width: '84%',
                    marginRight: '5px',
                  }}
                  onChange={e => {
                    cThis.mObj.PinYin = e;
                    let { entity } = cThisstate;
                    entity.PinYin = e;
                    cThissetState({
                      entity: entity,
                    });
                  }}
                  placeholder="汉语拼音"
                  disabled={
                    hasItemDisabled
                      ? dontDisabledGroup['PinYin'] == undefined
                        ? true
                        : false
                      : false
                  }
                >
                  {['暂无', '暂无'].map(e => (
                    <Select.Option value={e}>{e}</Select.Option>
                  ))}
                </Select>
              )}
              <span
                title="名称检查"
                className="iconfont icon-check"
                onClick={e => {
                  cThisCheckName(
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
  }
};
export { GetNameRow };
