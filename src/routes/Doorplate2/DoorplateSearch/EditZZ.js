import React, { Component } from 'react';
import { Form, Row, Col, Button, Cascader, Select, Input, DatePicker, Divider, Checkbox, Upload, Icon, Modal } from 'antd';
import st from './EditZZ.less';
import Map from './Map';

const FormItem = Form.Item;
const Search = Input.Search;

class EditZZ extends Component {
    constructor(ps) {
        super(ps);
        this.state = {
            ...this.props.content,
            DistrictID: this.props.DistricData,
            isResidence: this.props.content.ResidenceName == null ? false : true,

            previewVisible_FCZ: false,
            previewImage_FCZ: '',
            fileList_FCZ: null,

            previewVisible_TDZ: false,
            previewImage_TDZ: '',
            fileList_TDZ: null,

            previewVisible_BDCZ: false,
            previewImage_BDCZ: '',
            fileList_BDCZ: null,

            previewVisible_HJ: false,
            previewImage_HJ: '',
            fileList_HJ: null,

            showMapEdit: false,
            showMapSearch: false,
            showMapState: null,
        };
    }
    componentDidMount = () => {

    }
    getFields = () => {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const formItemLayout2 = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 15 },
            },
        };
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传</div>
            </div>
        );

        var districID = ["1", this.state.CountyID, this.state.NeighborhoodsID, this.state.CommunityID];
        var StandardAddress = this.state.CountyName
            + this.state.NeighborhoodsName
            + this.state.CommunityName
            + (this.state.isResidence ?
                (this.state.ResidenceName != null ? this.state.ResidenceName : "")
                + (this.state.LZNumber != null ? this.state.LZNumber + "幢" : "")
                + (this.state.DYNumber != null ? this.state.DYNumber + "单元" : "")
                + (this.state.HSNumber != null ? this.state.HSNumber + "室" : "")
                :
                (this.state.RoadName != null ? this.state.RoadName : "")
                + (this.state.MPNumber != null ? this.state.MPNumber + "号" : "")
                + (this.state.Dormitory != null ? this.state.Dormitory : "")
                + (this.state.HSNumber != null ? this.state.HSNumber + "室" : "")
            );
        console.log(this.state);
        console.log(StandardAddress);
        const fields =
            <div>
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`行政区划`}>
                            {getFieldDecorator(`districID`, {
                                rules: [{
                                    required: true,
                                    message: '请选择行政区划',
                                }],
                                initialValue: districID,
                            })(
                                <Cascader
                                    options={this.state.DistrictID}
                                    onChange={(e, f) => this.setState({
                                        CountyID: e[1],
                                        NeighborhoodsID: e[2],
                                        CommunityID: e[3],
                                        CountyName: f[1].label,
                                        NeighborhoodsName: f[2].label,
                                        CommunityName: f[3].label,
                                    })}
                                    placeholder={'行政区划'}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`邮政编码`}>
                            {getFieldDecorator(`Postcode`, {
                                rules: [{
                                    required: true,
                                    message: '请选择邮政编码',
                                }],
                                initialValue: this.state.Postcode || '314000',
                            })(
                                <Select
                                    showSearch
                                    placeholder="请选择邮政编码"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    defaultValue={this.state.Postcode}
                                >
                                    <Option value="314000">314000</Option>
                                    <Option value="314001">314001</Option>
                                    <Option value="314002">314002</Option>
                                    <Option value="314003">314003</Option>
                                    <Option value="314004">314004</Option>
                                    <Option value="314005">314005</Option>
                                    <Option value="314006">314006</Option>
                                    <Option value="314007">314007</Option>
                                    <Option value="314008">314008</Option>
                                    <Option value="314009">314009</Option>
                                    <Option value="314011">314011</Option>
                                    <Option value="314012">314012</Option>
                                    <Option value="314013">314013</Option>
                                    <Option value="314014">314014</Option>
                                    <Option value="314015">314015</Option>
                                    <Option value="314016">314016</Option>
                                    <Option value="314017">314017</Option>
                                    <Option value="314018">314018</Option>
                                    <Option value="314019">314019</Option>
                                    <Option value="314021">314021</Option>
                                    <Option value="314022">314022</Option>
                                    <Option value="314023">314023</Option>
                                    <Option value="314024">314024</Option>
                                    <Option value="314025">314025</Option>
                                    <Option value="314026">314026</Option>
                                    <Option value="314027">314027</Option>
                                    <Option value="314031">314031</Option>
                                    <Option value="314033">314033</Option>
                                    <Option value="314036">314036</Option>
                                    <Option value="314050">314050</Option>
                                    <Option value="314051">314051</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`门牌规格`}>
                            {getFieldDecorator(`MPSize`, {
                                rules: [{
                                    required: true,
                                    message: '请选择门牌规格!',
                                }],
                                initialValue: this.state.MPSize,
                            })(
                                <Select
                                    showSearch
                                    placeholder="选择门牌规则"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    <Option value="30*20CM">30*20CM</Option>
                                    <Option value="40*60CM">40*60CM</Option>
                                    <Option value="21*15MM">21*15MM</Option>
                                    <Option value="18*14MM">18*14MM</Option>
                                    <Option value="15*10MM">15*10MM</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Divider orientation="left">
                    <Checkbox
                        onChange={(value) => this.setState({ isResidence: !value.target.checked })}
                        checked={!this.state.isResidence}>
                        非小区户室
                </Checkbox>
                </Divider>
                {
                    this.state.isResidence ?
                        (
                            <Row gutter={24}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label={`小区名称`}>
                                        {getFieldDecorator(`ResidenceName`, {
                                            rules: [{
                                                required: true,
                                                message: '请输入小区名称!',
                                            }],
                                            initialValue: this.state.ResidenceName,
                                        })(
                                            <Input
                                                placeholder='请输入小区名称'
                                                onChange={(e) => this.setState({ ResidenceName: e.target.value })}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8} >
                                    <FormItem {...formItemLayout} label={`幢号`}>
                                        {getFieldDecorator(`LZNumber`, {
                                            rules: [{
                                            }],
                                            initialValue: this.state.LZNumber,
                                        })(
                                            <Input
                                                addonAfter={<span>幢</span>}
                                                type='number'
                                                onChange={(e) => this.setState({ LZNumber: e.target.value })}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8} >
                                    <FormItem {...formItemLayout} label={`单元号`}>
                                        {getFieldDecorator(`DYNumber`, {
                                            rules: [{
                                            }],
                                            initialValue: this.state.DYNumber,
                                        })(
                                            <Input
                                                addonAfter={<span>单元</span>}
                                                type='number'
                                                onChange={(e) => this.setState({ DYNumber: e.target.value })}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        ) : (
                            <Row gutter={24}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label={`道路名`}>
                                        {getFieldDecorator(`RoadName`, {
                                            rules: [{
                                                required: true,
                                                message: '请选择道路!',
                                            }],
                                            initialValue: this.state.RoadName,
                                        })(
                                            <Search
                                                readonly='true'
                                                placeholder="选择道路"
                                                onSearch={() => this.setState({ showMapSearch: true })}
                                                onChange={(e) => this.setState({ RoadName: e.target.value })}
                                                enterButton
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label={`门牌号`}>
                                        {getFieldDecorator(`MPNumber`, {
                                            rules: [{
                                                required: true,
                                                message: '请输入门牌号!',
                                            }],
                                            initialValue: this.state.MPNumber,
                                        })(
                                            <Input
                                                addonAfter={<span>号</span>}
                                                type='number'
                                                onChange={(e) => this.setState({ MPNumber: e.target.value })}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label={`宿舍名称`}>
                                        {getFieldDecorator(`Dormitory`, {
                                            rules: [{
                                            }],
                                            initialValue: this.state.Dormitory,
                                        })(
                                            <Input
                                                placeholder='请输入宿舍名称'
                                                onChange={(e) => this.setState({ Dormitory: e.target.value })}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        )
                }
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`户室号`}>
                            {getFieldDecorator(`HSNumber`, {
                                rules: [{
                                    required: true,
                                    message: '请输入户室号!',
                                }],
                                initialValue: this.state.HSNumber,
                            })(
                                <Input
                                    addonAfter={<span>室</span>}
                                    type='number'
                                    onChange={(e) => this.setState({ HSNumber: e.target.value })}
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`经纬度`}>
                            {getFieldDecorator(`latlng`, {
                                initialValue: this.state.Lng && this.state.Lat ? this.state.Lng.toFixed(4) + '，' + this.state.Lat.toFixed(4) : null,
                            })(
                                <Search
                                    readonly='true'
                                    placeholder="打开地图进行定位"
                                    onSearch={() => this.setState({ showMapEdit: true })}
                                    enterButton
                                />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`标准地址`}>
                            {getFieldDecorator(`StandardAddress`, {
                                rules: [{
                                }],
                                initialValue: StandardAddress,

                            })(
                                <Input disabled={true} />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Divider style={{ margin: 0 }} />
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`产权人`}>
                            {getFieldDecorator(`PropertyOwner`, {
                                rules: [{
                                    required: true,
                                    message: '请输入产权人!',
                                }],
                                initialValue: this.state.PropertyOwner,
                            })(
                                <Input placeholder='请输入产权人' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`证件类型`}>
                            {getFieldDecorator(`IDType`, {
                                rules: [{
                                }],
                                initialValue: this.state.IDType,
                            })(
                                <Select
                                    showSearch
                                    placeholder="选择证件类型"
                                >
                                    <Option value="居民身份证">居民身份证</Option>
                                    <Option value="统一社会信用代码">统一社会信用代码</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`证件号码`}>
                            {getFieldDecorator(`IDNumber`, {
                                rules: [{
                                }],
                                initialValue: this.state.IDNumber,
                            })(
                                <Input placeholder='请输入证件号码' />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`申办人`}>
                            {getFieldDecorator(`Applicant`, {
                                rules: [{
                                }],
                                initialValue: this.state.Applicant,
                            })(
                                <Input placeholder='请输入申办人' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`联系电话`}>
                            {getFieldDecorator(`ApplicantPhone`, {
                                rules: [{
                                }],
                                initialValue: this.state.ApplicantPhone,
                            })(
                                <Input placeholder='请输入申办人联系电话' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`编制日期`}>
                            {getFieldDecorator(`CreateTime`, {
                                rules: [{
                                    type: 'object',
                                }],
                                initialValue: moment(this.state.CreateTime, 'YYYY-MM-DD'),
                            })(
                                <DatePicker onChange={(d, s) => this.setState({ CreateTime: s })} />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Divider style={{ margin: 0 }} />
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`房产证地址`}>
                            {getFieldDecorator(`FCZAddress`, {
                                rules: [{
                                }],
                                initialValue: this.state.FCZAddress,
                            })(
                                <Input placeholder='请输入房产证地址' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`房产证证号`}>
                            {getFieldDecorator(`FCZNumber`, {
                                rules: [{
                                }],
                                initialValue: this.state.FCZNumber,
                            })(
                                <Input placeholder='请输入房产证证号' />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`土地证地址`}>
                            {getFieldDecorator(`TDZAddress`, {
                                rules: [{
                                }],
                                initialValue: this.state.TDZAddress,
                            })(
                                <Input placeholder='请输入土地证地址' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`土地证证号`}>
                            {getFieldDecorator(`TDZNumber`, {
                                rules: [{
                                }],
                                initialValue: this.state.TDZNumber,
                            })(
                                <Input placeholder='请输入土地证证号' />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`不动产证地址`}>
                            {getFieldDecorator(`BDCZAddress`, {
                                rules: [{
                                }],
                                initialValue: this.state.BDCZAddress,
                            })(
                                <Input placeholder='请输入不动产证地址' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`不动产证证号`}>
                            {getFieldDecorator(`BDCZNumber`, {
                                rules: [{
                                }],
                                initialValue: this.state.BDCZNumber,
                            })(
                                <Input placeholder='请输入不动产证证号' />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`户籍地址`}>
                            {getFieldDecorator(`HJAddress`, {
                                rules: [{
                                }],
                                initialValue: this.state.HJAddress,
                            })(
                                <Input placeholder='请输入户籍地址' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`户籍证号`}>
                            {getFieldDecorator(`HJNumber`, {
                                rules: [{
                                }],
                                initialValue: this.state.HJNumber,
                            })(
                                <Input placeholder='请输入户籍证号' />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label={`其他地址`}>
                            {getFieldDecorator(`OtherAddress`, {
                                rules: [{
                                }],
                                initialValue: this.state.OtherAddress,
                            })(
                                <Input placeholder='请输入其他地址' />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <FormItem {...formItemLayout} label={`房产证文件`}>
                            {getFieldDecorator(`FCZFile`, {
                                rules: [{
                                }],
                                initialValue: this.state.FCZFile,
                            })(
                                <div className="clearfix">
                                    <Upload
                                        action="//jsonplaceholder.typicode.com/posts/"
                                        listType="picture-card"
                                        fileList={this.state.fileList_FCZ}
                                        onPreview={(file) => {
                                            this.setState({
                                                previewImage_FCZ: file.url || file.thumbUrl,
                                                previewVisible_FCZ: true,
                                            });
                                        }}
                                        onChange={({ fileList }) => this.setState({ fileList_FCZ: fileList })}
                                    >
                                        {uploadButton}
                                    </Upload>
                                    <Modal
                                        visible={this.state.previewVisible_FCZ}
                                        footer={null}
                                        onCancel={() => this.setState({ previewVisible_FCZ: false })}
                                    >
                                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage_FCZ} />
                                    </Modal>
                                </div>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...formItemLayout} label={`土地证文件`}>
                            {getFieldDecorator(`TDZFile`, {
                                rules: [{
                                }],
                                initialValue: this.state.TDZFile,
                            })(
                                <div className="clearfix">
                                    <Upload
                                        action="//jsonplaceholder.typicode.com/posts/"
                                        listType="picture-card"
                                        fileList={this.state.fileList_TDZ}
                                        onPreview={(file) => {
                                            this.setState({
                                                previewImage_TDZ: file.url || file.thumbUrl,
                                                previewVisible_TDZ: true,
                                            });
                                        }}
                                        onChange={({ fileList }) => this.setState({ fileList_TDZ: fileList })}
                                    >
                                        {uploadButton}
                                    </Upload>
                                    <Modal
                                        visible={this.state.previewVisible_TDZ}
                                        footer={null}
                                        onCancel={() => this.setState({ previewVisible_TDZ: false })}
                                    >
                                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage_TDZ} />
                                    </Modal>
                                </div>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <FormItem {...formItemLayout} label={`不动产证文件`}>
                            {getFieldDecorator(`BDCZFile`, {
                                rules: [{
                                }],
                                initialValue: this.state.BDCZFile,
                            })(
                                <div className="clearfix">
                                    <Upload
                                        action="//jsonplaceholder.typicode.com/posts/"
                                        listType="picture-card"
                                        fileList={this.state.fileList_BDCZ}
                                        onPreview={(file) => {
                                            this.setState({
                                                previewImage_BDCZ: file.url || file.thumbUrl,
                                                previewVisible_BDCZ: true,
                                            });
                                        }}
                                        onChange={({ fileList }) => this.setState({ fileList_BDCZ: fileList })}
                                    >
                                        {uploadButton}
                                    </Upload>
                                    <Modal
                                        visible={this.state.previewVisible_BDCZ}
                                        footer={null}
                                        onCancel={() => this.setState({ previewVisible_BDCZ: false })}
                                    >
                                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage_BDCZ} />
                                    </Modal>
                                </div>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem {...formItemLayout} label={`户籍文件`}>
                            {getFieldDecorator(`HJFile`, {
                                rules: [{
                                }],
                                initialValue: this.state.HJFile,
                            })(
                                <div className="clearfix">
                                    <Upload
                                        action="//jsonplaceholder.typicode.com/posts/"
                                        listType="picture-card"
                                        fileList={this.state.fileList_HJ}
                                        onPreview={(file) => {
                                            this.setState({
                                                previewImage_HJ: file.url || file.thumbUrl,
                                                previewVisible_HJ: true,
                                            });
                                        }}
                                        onChange={({ fileList }) => this.setState({ fileList_HJ: fileList })}
                                    >
                                        {uploadButton}
                                    </Upload>
                                    <Modal
                                        visible={this.state.previewVisible_HJ}
                                        footer={null}
                                        onCancel={() => this.setState({ previewVisible_HJ: false })}
                                    >
                                        <img alt="example" style={{ width: '100%' }} src={this.state.previewImage_HJ} />
                                    </Modal>
                                </div>
                            )}
                        </FormItem>
                    </Col>
                </Row>
            </div >;
        return fields;

    }

    handleSave = () => {

    }

    render() {
        return (
            <div className={st.editZZ}>
                <Form
                    className="formZZ"
                    onSubmit={this.handleSave}
                >
                    {this.getFields()}
                    <Row>
                        <Col span={15} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit">保存</Button>
                        </Col>
                    </Row>
                </Form>
                {
                    this.state.showMapEdit ? (<Modal
                        visible={true}
                        title="地图定位修改"
                        onCancel={() => this.setState({ showMapEdit: false })}
                    >
                        <Map pointPosition={this.props.content} MPType={"ZZ"} MPState={"edit"} />
                    </Modal>) : null
                }
                {
                    this.state.showMapSearch ? (<Modal
                        visible={true}
                        title="道路查询"
                        onCancel={() => this.setState({ showMapSearch: false })}
                    >
                        <Map pointPosition={this.props.content} MPType={"ZZ"} MPState={"search"} />
                    </Modal>) : null
                }
            </div>
        );
    }
}
const WrappedEditZZForm = Form.create()(EditZZ);

export default WrappedEditZZForm;
