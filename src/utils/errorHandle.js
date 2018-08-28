import { notification } from 'antd';

function rtHandle(rt, success, error) {
  if (rt) {
    let er = rt.err || rt.data.ErrorMessage;
    if (er) {
      if (error) {
        error(er);
      } else {
        notification.error({
          message: '错误',
          description: er.message,
        });
      }
    } else if (success) {
      success(rt.data.Data);
    }
  }
}

export { rtHandle };