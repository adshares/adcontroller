import { useSnackbar } from 'notistack';

export default function useErrorHandler() {
  const { enqueueSnackbar } = useSnackbar();

  const createErrorNotification = (err) => {
    const defaultErrorTitle = 'Error';
    const defaultErrorMessage = 'Unknown error (XYZ)';
    const errorTitle = err.title || defaultErrorTitle;
    const errorBody = err.data?.message || defaultErrorMessage;
    return enqueueSnackbar(`${errorTitle}: ${errorBody}`, { variant: 'error' });
  };

  return { createErrorNotification };
}
