import { Upload, Icon, Modal, Spin } from 'antd';
import { Post } from '../../utils/request.js';
import st from './UploadPicture.less';
import { getFileIdList } from '../../../src/utils/utils.js';

//判断文件是否为图片
let isPic = fn => {
  let b = false;
  if (fn) {
    let ext = fn.split('.')[1];
    if (ext) {
      return ['jpg', 'gpeg', 'gif', 'bmp', 'png'].indexOf(ext.toLowerCase()) !== -1;
    }
  }
  return b;
};

class UploadPicture extends React.Component {
  constructor(ps) {
    super(ps);

    let files = this.getFilePaths(ps.fileList);

    this.state.fileList = files;
  }
  state = {
    showLoading: false,
    previewVisible: false,
    previewImage: '',
  };

  // 解决附件上传后点击基础表单，附件消失问题
  componentWillReceiveProps(ps) {
    let files = ps.fileList;
    if (files && files.length) {
      this.setState({ fileList: this.getFilePaths(files) });
    } else {
      this.setState({ fileList: [] });
    }
  }

  //获取文件真实路径
  getFilePaths(files) {
    const { fileBasePath } = this.props;
    return (files || []).map(e => {
      return {
        uid: e.FileID,
        name: e.Name,
        url: `${fileBasePath}/${e.RelativePath}`,
        previewUrl: `${fileBasePath}/${e.RelativePath}`,
      };
    });
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    if (isPic(file.url)) {
      this.setState({
        previewImage: file.previewUrl || file.url,
        previewVisible: true,
      });
    } else {
      window.open(file.previewUrl, '_blank');
    }
  };

  async getPictures() {
    const { getAction, id, data, setDeleteFilesInfo } = this.props;
    await Post(getAction, { id: id, ...data }, d => {
      let files = this.getFilePaths(d);
      this.setState({ fileList: files });

      // var removeFileInfo = data;
      // removeFileInfo['ID'] = getFileIdList(d);
      // setDeleteFilesInfo(removeFileInfo);
    });
  }

  async onRemove(file) {
    Modal.confirm({
      title: '提醒',
      content: '确定删除？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const { removeAction, data } = this.props;
        const { uid } = file;
        this.setState({ showLoading: true });
        await Post(removeAction, { ID: uid, ...data }, d => {
          this.getPictures();
        });
        this.setState({ showLoading: false });
      },
      onCancel() {},
    });
  }

  beforeUpload = file => {
    const { uploadAction, setDeleteFilesInfo } = this.props;
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
      success: res => {
        this.getPictures();
        this.setState({ showLoading: false });

        // 将上传的文件传入当前已上传队列
        res = JSON.parse(res).Data;
        setDeleteFilesInfo(res.ID, data.FileType, res.Item, res.time);
      },
      error: res => {
        alert('上传失败！');
        this.setState({ showLoading: false });
      },
    });
    return false;
  };

  // componentDidMount() {
  //   this.getPictures();
  // }

  render() {
    const { showLoading, previewVisible, previewImage, fileList, progressContent } = this.state;
    const { disabled, listType, saveBtnClicked } = this.props;
    return (
      <div className={`${st.uploadpicture} clearfix`}>
        <Upload
          disabled={showLoading || disabled || saveBtnClicked}
          listType={listType || 'picture-card'}
          fileList={fileList}
          onPreview={this.handlePreview}
          beforeUpload={this.beforeUpload}
          onRemove={this.onRemove.bind(this)}
        >
          <div>
            <Spin spinning={showLoading} tip={progressContent}>
              <Icon type="plus" />
              <div className="ant-upload-text">上传</div>
            </Spin>
          </div>
        </Upload>
        <Modal
          wrapClassName={st.upmodal}
          visible={previewVisible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img src={previewImage} />
        </Modal>
      </div>
    );
  }
}

export default UploadPicture;
