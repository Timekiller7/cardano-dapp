import { useSelector, useDispatch} from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import { isNil } from 'lodash';
import { closeNotification } from '../../../store/slices/notifications/notificationsSlice';

const SnetSnackbar = () => {
  const dispatch = useDispatch();
  const message = useSelector(state => state.notifications.message);
  const type = useSelector(state => state.notifications.type);
  const isOpenSnackbar = useSelector(state => state.notifications.showNotification);

  const formatMessage = () => {
    return isNil(message) ? '' : JSON.stringify(message);
  };


  const closeSnetSnackbar = () => {
    dispatch(closeNotification());
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={isOpenSnackbar}
      autoHideDuration={30000}
      onClick={closeSnetSnackbar}
      onClose={closeSnetSnackbar}
    >
      <Alert onClose={closeSnetSnackbar} severity={type} sx={{ width: '100%', fontSize: "1.5rem" }}>
        {formatMessage()}
      </Alert>
    </Snackbar>
  );
};

export default SnetSnackbar;
