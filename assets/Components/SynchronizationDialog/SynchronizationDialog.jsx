import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setDataSynchronized } from '../../redux/synchronization/synchronizationSlice';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import Spinner from '../Spinner/Spinner';
import { useCreateNotification } from '../../hooks';
import StraightIcon from '@mui/icons-material/Straight';
import commonStyles from '../../styles/commonStyles.scss';

export default function SynchronizationDialog({ isSyncInProgress, isDataSynchronized, changedModules, isSynchronizationRequired }) {
  const dispatch = useDispatch();
  const { createSuccessNotification } = useCreateNotification();

  useEffect(() => {
    if (isSynchronizationRequired) {
      if (isDataSynchronized) {
        createSuccessNotification({ message: 'Configuration was synchronized' });
      }
    }
  }, [isDataSynchronized, isSynchronizationRequired]);

  const onCloseClick = () => {
    dispatch(setDataSynchronized());
  };
  return (
    <>
      {isSyncInProgress && (
        <Dialog open={isSyncInProgress}>
          <DialogTitle>Synchronization in progress</DialogTitle>

          <DialogContent>
            <Spinner />
          </DialogContent>
        </Dialog>
      )}

      {!isSyncInProgress && changedModules && (
        <Dialog open={!isDataSynchronized}>
          <DialogTitle>Configuration was synchronized. See what has changed:</DialogTitle>

          <DialogContent>
            <DialogContentText component="div">
              {Object.keys(changedModules).map((moduleName) => {
                return (
                  <Box key={moduleName}>
                    <Typography variant="h6">{moduleName}</Typography>

                    {changedModules[moduleName].some((change) => change.action === 'create') && (
                      <>
                        <Typography variant="body1">Created:</Typography>
                        <Box className={`${commonStyles.flex} ${commonStyles.flexColumn}`} sx={{ ml: 1 }}>
                          {changedModules[moduleName]
                            .filter((change) => change.action === 'create')
                            .map((change) => {
                              const { field, value } = change;
                              return (
                                <Box className={`${commonStyles.flex}`} key={field}>
                                  <Typography sx={{ mr: 1 }} variant="body1">
                                    {`${field.split('::')[0]} ${field.split('::')[1]}: `}
                                  </Typography>
                                  <Typography variant="body1">{`${value}`}</Typography>
                                </Box>
                              );
                            })}
                        </Box>
                      </>
                    )}

                    {changedModules[moduleName].some((change) => change.action === 'update') && (
                      <>
                        <Typography variant="body1">Updated:</Typography>
                        <Box className={`${commonStyles.flex} ${commonStyles.flexColumn}`} sx={{ ml: 1 }}>
                          {changedModules[moduleName]
                            .filter((change) => change.action === 'update')
                            .map((change) => {
                              const { field, previousValue, value } = change;
                              return (
                                <Box className={`${commonStyles.flex}`} key={field}>
                                  <Typography sx={{ mr: 1 }} variant="body1">
                                    {`${field.split('::')[0]} ${field.split('::')[1]}: `}
                                  </Typography>
                                  <Typography variant="body1">{`${previousValue}`}</Typography>
                                  <StraightIcon sx={{ transform: 'rotate(90deg)' }} />
                                  <Typography variant="body1">{`${value}`}</Typography>
                                </Box>
                              );
                            })}
                        </Box>
                      </>
                    )}

                    {changedModules[moduleName].some((change) => change.action === 'delete') && (
                      <>
                        <Typography variant="body1">Deleted:</Typography>
                        <Box className={`${commonStyles.flex} ${commonStyles.flexColumn}`} sx={{ ml: 1 }}>
                          {changedModules[moduleName]
                            .filter((change) => change.action === 'delete')
                            .map((change) => {
                              const { field, previousValue } = change;
                              return (
                                <Box className={`${commonStyles.flex}`} key={field}>
                                  <Typography sx={{ mr: 1 }} variant="body1">
                                    {`${field.split('::')[0]} ${field.split('::')[1]}: `}
                                  </Typography>
                                  <Typography variant="body1">{`${previousValue}`}</Typography>
                                </Box>
                              );
                            })}
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={onCloseClick}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
