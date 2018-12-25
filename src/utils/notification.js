import { notification } from 'antd';

export function warn(message, cfg) {
  notification.warn({
    description: message,
    message: '警告',
    ...cfg,
  });
}

export function error(message, cfg) {
  notification.error({
    description: message,
    message: '错误',
    ...cfg,
  });
}

export function success(message, cfg) {
  notification.success({
    description: message,
    message: '成功',
    ...cfg,
  });
}
