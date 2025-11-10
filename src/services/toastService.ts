// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { toast } from 'react-toastify';

export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning' | 'default',
  message: string
) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'warning':
      toast.warn(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast.info(message);
      break;
    default:
      toast(message);
      break;
  }
};
