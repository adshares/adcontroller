import { useSnackbar } from 'notistack';

export default function useCreateNotification() {
  const { enqueueSnackbar } = useSnackbar();

  const createErrorNotification = (err) => {
    const defaultErrorTitle = 'Error';
    const defaultErrorMessage = 'Unknown error (XYZ)';
    const errorTitle = err.title || defaultErrorTitle;
    const errorBody = err.data?.message || defaultErrorMessage;
    return enqueueSnackbar(`${errorTitle}: ${errorBody}`, { variant: 'error' });
  };

  const createSuccessNotification = (options = { title: undefined, message: undefined }) => {
    const notificationTitle = typeof options.title === 'undefined' ? 'Success' : options.title;
    const notificationMessage = typeof options.message === 'undefined' ? '' : options.message;
    return enqueueSnackbar(notificationMessage ? `${notificationTitle}: ${notificationMessage}` : `${notificationTitle}`, {
      variant: 'success',
    });
  };

  return { createErrorNotification, createSuccessNotification };
}
