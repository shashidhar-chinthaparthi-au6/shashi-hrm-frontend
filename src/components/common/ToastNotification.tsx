import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { hideToast } from '../../store/toastSlice';

const ToastNotification = () => {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((state: RootState) => state.toast);

  const handleClose = () => {
    dispatch(hideToast());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification; 