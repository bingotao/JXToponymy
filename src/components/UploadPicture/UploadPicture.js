import { Upload, Icon, Modal, Spin } from 'antd';

class UploadPicture extends React.Component {
  constructor(ps) {
    super(ps);
    this.state.fileList = ps.fileList || [];
  }
  state = {
    showLoading: false,
    previewVisible: false,
    previewImage: '',
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  onRemove = file => {
    const { removeAction } = this.props;
    const { id } = file;
    this.setState({ showLoading: true });
    // 删除
    $.post(removeAction, { id: id }, e => {
      // 删除后获取新的数据
      // setState

      this.setState({ showLoading: false });
    }).fail(e => {
      this.setState({ showLoading: false });
    });
  };

  beforeUpload = file => {
    const { uploadAction } = this.props;
    const { id, data } = this.props;

    // 构造Form数据
    var formData = new FormData();
    var datas = { id: id, ...data };

    for (let i in datas) {
      formData.append(i, datas[i]);
    }

    formData.append('file', file);
    this.setState({ showLoading: true });
    $.ajax({
      url: uploadAction,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      //   xhr: () => {
      //     let myXhr = $.ajaxSettings.xhr();
      //     if (myXhr.upload) {
      //       myXhr.upload.addEventListener(
      //         'progress',
      //         e => {
      //           if (e.lengthComputable) {
      //             var percent = Math.floor((e.loaded / e.total) * 100);
      //             console.log(percent);
      //             if (percent <= 100) {
      //               this.setState({ progressContent: percent.toFixed(2) + '%' });
      //             }
      //             if (percent >= 100) {
      //               this.setState({ progressContent: '上传完成...' });
      //             }
      //           }
      //         },
      //         false
      //       );
      //     }
      //     return myXhr;
      //   },
      success: res => {
        this.setState({ showLoading: false });
      },
      error: res => {
        this.setState({ showLoading: false });
      },
    });
    return false;
  };

  render() {
    const { showLoading, previewVisible, previewImage, fileList, progressContent } = this.state;

    return (
      <div className="clearfix">
        <Upload
          disabled={showLoading}
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          beforeUpload={this.beforeUpload}
          onRemove={this.onRemove}
        >
          <div>
            <Spin spinning={showLoading} tip={progressContent}>
              <Icon type="plus" />
              <div className="ant-upload-text">上传</div>
            </Spin>
          </div>
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

export default UploadPicture;
