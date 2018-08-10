import React, { Component } from 'react';
import { Tabs, Button, Icon, Upload, message } from 'antd';
import Navs from '../../../common/Navs/Navs';
import Panel from '../../../common/Panel/Panel';
import st from './DoorplateManage.less';
import EditZZ from '../DoorplateSearch/EditZZ';

const TabPane = Tabs.TabPane;

class DoorplateManage extends Component {
    state = {
        showButtons: false,
        uploadDataStatus: <span><Icon type="exclamation-circle" />尚未检查</span>,
        fileList: [],
    }
    uploadFileZZonChange = (info) => {
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        fileList = fileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });
        fileList = fileList.filter((file) => {
            if (file.response) {
                return file.response.status === 'success';
            }
            return true;
        });
        this.setState({ fileList });

        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if(info.file.status === 'uploading'){
            this.setState({uploadDataStatus:<span><Icon type="exclamation-circle" />正在上传。。。</span>})
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功，请确认无误后进行数据更新！`);
            this.setState({uploadDataStatus:<span><Icon type="exclamation-circle" />上传成功，正在检查数据。。。</span>})
            $.post(
                "http://localhost:52141/MPModify/GetUploadResidenceMP",
                {
                    PageSize: 10,
                    PageNum: 1,
                },
                rt => {
                    debugger
                    if (rt.ErrorMessage) {
                        message.error(rt.ErrorMessage);
                    }
                    else if (rt.Data) {

                    }
                },
                'json'
            )

        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败！`);
        }
    }
    render() {
        const props = {
            name: 'ZZMP',
            action: 'http://localhost:52141/MPModify/UploadResidenceMP',
            accept: '.xls,.xlsx',
        };
        return (
            <div className={st.doorplatemanage} >
                <Navs />
                <div className={st.body}>
                    <Panel defaultSelectedKeys={["2"]}/>
                    <div className={st.content}>
                        <div className={st.tab}>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="住宅门牌" key="1">
                                    <div className={st.button}>
                                        {
                                            this.state.showButtons ? null :
                                                <Button type="primary" icon="form">编制申请</Button>
                                        }
                                        <Button type="normal" icon="table" onClick={() => { var showButtons = !this.state.showButtons; this.setState({ showButtons: showButtons }) }}>批量导入</Button>
                                        {
                                            this.state.showButtons ? (
                                                <div className={st.showbuttons}>
                                                    <Button type="normal" icon="download" onClick={() => {
                                                        window.open("http://localhost:52141/Files/UploadFiles/住宅门牌上传模板.xlsx");
                                                    }}>模板下载</Button>
                                                    <Upload {...props}
                                                        onChange={(file) => this.uploadFileZZonChange(file)}
                                                        beforeUpload={(file, fileList) => {
                                                            if (file.name.indexOf("xls") != -1 || file.name.indexOf("xlsx") != -1) {
                                                            } else {
                                                                message.error("只允许xls或xlsx格式的文件，请重新上传");
                                                                return false;
                                                            }
                                                        }}
                                                        fileList={this.state.fileList}
                                                    >
                                                        <Button>
                                                            <Icon type="upload" />
                                                            点击上传
                                                        </Button>
                                                    </Upload>
                                                    <div className={st.updatebutton}>
                                                        <Button type="normal" icon="upload" onClick={() => {

                                                        }}>数据更新</Button>
                                                        <div style={{ display: 'inline', color: 'red' }}>数据状态：{this.state.uploadDataStatus}</div>
                                                    </div>
                                                </div>) : null

                                        }
                                    </div>
                                    <div>

                                    </div>
                                </TabPane>
                                <TabPane tab="道路门牌" key="2">
                                    Content of Tab Pane 2
                                </TabPane>
                                <TabPane tab="农村门牌" key="3">
                                    Content of Tab Pane 3
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}
export default DoorplateManage;