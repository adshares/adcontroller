import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import {
  useDeletePanelAssetsMutation,
  useGetPanelAssetsQuery,
  useSetPlaceholdersConfigMutation,
  useUploadPanelAssetsMutation,
} from '../../redux/config/configApi';
import { changePlaceholdersInformation } from '../../redux/config/configSlice';
import { useCreateNotification, useForm, useSkipFirstRenderEffect } from '../../hooks';
import configuration from '../../controllerConfig/configuration';
import CollapsibleTextarea from '../../Components/CollapsibleTextarea/CollapsibleTextarea';
import Spinner from '../../Components/Spinner/Spinner';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  SvgIcon,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useSnackbar } from 'notistack';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UndoIcon from '@mui/icons-material/Undo';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import commonStyles from '../../styles/commonStyles.scss';

export default function Panel() {
  return (
    <>
      <PlaceholdersCard />
      <RebrandingCard />
    </>
  );
}

const PlaceholdersCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setPlaceholdersConfig, { isLoading }] = useSetPlaceholdersConfigMutation();
  const form = useForm({
    initialFields: {
      PlaceholderIndexDescription: appData.AdPanel.PlaceholderIndexDescription || '',
      PlaceholderIndexKeywords: appData.AdPanel.PlaceholderIndexKeywords || '',
      PlaceholderIndexMetaTags: appData.AdPanel.PlaceholderIndexMetaTags || '',
      PlaceholderIndexTitle: appData.AdPanel.PlaceholderIndexTitle || '',
      PlaceholderLoginInfo: appData.AdPanel.PlaceholderLoginInfo || '',
      PlaceholderRobotsTxt: appData.AdPanel.PlaceholderRobotsTxt || '',
      PlaceholderStyleCss: appData.AdPanel.PlaceholderStyleCss || '',
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  useSkipFirstRenderEffect(() => {
    form.resetForm();
  }, [appData.AdPanel]);

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = !!form.fields[field].trim() ? form.fields[field] : null;
      }
    });
    const response = await setPlaceholdersConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changePlaceholdersInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card className={commonStyles.card} width="mainContainer">
      <CardHeader title="Panel metadata" subheader="Set the ad server panel metadata" />
      <CardContent>
        <Box component="form" onChange={(e) => form.onChange(e)} onFocus={(e) => form.setTouched(e)}>
          <TextField
            value={form.fields.PlaceholderIndexTitle}
            name="PlaceholderIndexTitle"
            label="Title"
            size="small"
            margin="dense"
            fullWidth
          />
          <CollapsibleTextarea
            collapsible
            value={form.fields.PlaceholderIndexDescription}
            name="PlaceholderIndexDescription"
            label="Description"
            multiline
            rows={8}
            margin="dense"
            fullWidth
            size="small"
          />
          <TextField
            value={form.fields.PlaceholderIndexKeywords}
            name="PlaceholderIndexKeywords"
            label="Keywords"
            size="small"
            margin="dense"
            fullWidth
          />
          <CollapsibleTextarea
            collapsible
            value={form.fields.PlaceholderIndexMetaTags}
            name="PlaceholderIndexMetaTags"
            label="Custom meta tags"
            multiline
            rows={8}
            margin="dense"
            fullWidth
            size="small"
          />
          <CollapsibleTextarea
            collapsible
            value={form.fields.PlaceholderRobotsTxt}
            name="PlaceholderRobotsTxt"
            label="robots.txt"
            multiline
            rows={8}
            margin="dense"
            fullWidth
            size="small"
          />
          <CollapsibleTextarea
            collapsible
            value={form.fields.PlaceholderLoginInfo}
            name="PlaceholderLoginInfo"
            label="Login page info (HTML)"
            multiline
            rows={20}
            margin="dense"
            fullWidth
            size="small"
          />
          <CollapsibleTextarea
            collapsible
            value={form.fields.PlaceholderStyleCss}
            name="PlaceholderStyleCss"
            label="AdPanel styles (CSS)"
            multiline
            rows={20}
            margin="dense"
            fullWidth
            size="small"
          />
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const RebrandingCard = () => {
  const [activeTab, setActiveTab] = React.useState('requiredAssets');
  const requiredFavicons = ['Favicon16x16', 'Favicon32x32', 'Favicon48x48', 'Favicon96x96'];
  const requiredLogos = ['LogoH30', 'LogoH60', 'LogoH90'];

  const handleTabChange = (e, newActiveTab) => {
    setActiveTab(newActiveTab);
  };

  return (
    <Card className={commonStyles.card} width="mainContainer">
      <CardHeader title="Rebranding" subheader="Customize the ad server panel." />
      <TabContext value={activeTab}>
        <CardContent>
          <TabList onChange={handleTabChange}>
            <Tab label="Required assets" value="requiredAssets" sx={{ padding: 0 }} />
            <Tab label="Additional assets" value="additionalAssets" />
          </TabList>
        </CardContent>
        <TabPanel value="requiredAssets" sx={{ padding: 0 }}>
          <RequiredAssetsTable requiredFavicons={requiredFavicons} requiredLogos={requiredLogos} />
        </TabPanel>
        <TabPanel value="additionalAssets" sx={{ padding: 0 }}>
          <AdditionalAssets rejectedAssets={[...requiredLogos, ...requiredFavicons]} />
        </TabPanel>
      </TabContext>
    </Card>
  );
};

const AdditionalAssets = ({ rejectedAssets }) => {
  const { data, refetch, isFetching } = useGetPanelAssetsQuery();
  const [uploadAssets] = useUploadPanelAssetsMutation();
  const [deleteAssets] = useDeletePanelAssetsMutation();
  const [urlWasCopied, setUrlCopied] = useState(false);
  const [waitingForUploadFiles, setWaitingForUploadFiles] = useState([]);
  const [changedFiles, setChangedFiles] = useState([]);
  const { createSuccessNotification } = useCreateNotification();
  const { enqueueSnackbar } = useSnackbar();

  const assets = useMemo(
    () => (data && data.message === 'OK' ? data.data.assets.filter((img) => !rejectedAssets.includes(img.fileId)) : []),
    [data],
  );

  const existingFileNames = useMemo(() => {
    return !isFetching && !!assets.length ? assets.map((img) => img.fileName) : [];
  }, [assets]);

  const handleUploadInputChange = (e) => {
    const { files } = e.target;
    setWaitingForUploadFiles((prevState) => {
      const set = new Set();
      return [
        ...prevState,
        ...Object.keys(files).reduce(
          (acc, val) => [
            ...acc,
            {
              file: files[val],
              name: files[val].name,
              isImage: files[val].type.split('/')[0] === 'image',
              isNameValid: !files[val].name.includes(' '),
              isNameExistOnList: existingFileNames.includes(files[val].name),
            },
          ],
          [],
        ),
      ].filter((el) => {
        const isDuplicate = set.has(el.name);
        set.add(el.name);
        return !isDuplicate;
      });
    });
    e.target.value = '';
  };

  const onDialogConfirmClick = async () => {
    const formData = new FormData();
    waitingForUploadFiles.forEach((img) => formData.append(img.name, img.file));
    if (waitingForUploadFiles.length > 0) {
      const response = await uploadAssets(formData);

      if (response.data && response.data.message === 'OK') {
        setWaitingForUploadFiles([]);
        refetch();
        createSuccessNotification();
      }
    }
  };

  const handleEditFileInputChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const isFileIsImage = file && file.type.split('/')[0] === 'image';
    if (!isFileIsImage) {
      enqueueSnackbar('File must be image', { variant: 'error' });
      return;
    }
    const renameFile = (originalFile, newName) =>
      new File([originalFile], newName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified,
      });

    const newFile = renameFile(file, name);
    const newFileObject = {
      name: newFile.name,
      action: 'change',
      file: newFile,
      preview: URL.createObjectURL(newFile),
    };

    setChangedFiles((prevState) => {
      const existingChangedFile = prevState.find((fileObj) => fileObj.name === newFile.name);
      if (existingChangedFile) {
        const index = prevState.findIndex((obj) => obj.name === existingChangedFile.name);
        const newList = [...prevState];
        newList[index] = newFileObject;
        return newList;
      }
      return [...prevState, newFileObject];
    });
    e.target.value = '';
  };

  const onDeleteFileClick = (id) => () => {
    const newFileObject = { name: id, action: 'delete', file: null, preview: null };
    setChangedFiles((prevState) => {
      const existingChangedFile = prevState.find((fileObj) => fileObj.name === id);
      if (existingChangedFile) {
        const index = prevState.findIndex((obj) => obj.name === existingChangedFile.name);
        const newList = [...prevState];
        newList[index] = newFileObject;
        return newList;
      }
      return [...prevState, newFileObject];
    });
  };

  const onUndoClick = (id) => () => setChangedFiles((prevState) => prevState.filter((obj) => obj.name !== id));

  const onSaveClick = async () => {
    const changedImages = changedFiles.filter((fileObj) => fileObj.action === 'change');
    const deletedImages = changedFiles.filter((fileObj) => fileObj.action === 'delete');
    let changeResponse;
    let deleteResponse;

    if (!!changedImages.length) {
      const formData = new FormData();
      changedImages.forEach((img) => formData.append(img.name, img.file));
      changeResponse = await uploadAssets(formData);
    }

    if (!!deletedImages.length) {
      const body = { fileIds: deletedImages.map((img) => img.name) };
      deleteResponse = await deleteAssets(body);
    }

    if ((changeResponse && changeResponse.data.message === 'OK') || (deleteResponse && deleteResponse.data.message === 'OK')) {
      refetch();
      setChangedFiles([]);
      createSuccessNotification();
    }
  };

  return (
    <>
      <CardContent>
        <Button variant="contained" component="label">
          <FileUploadIcon />
          Upload
          <input hidden accept="image/*" type="file" multiple onChange={handleUploadInputChange} />
        </Button>
      </CardContent>

      <CardContent>
        {isFetching && <Spinner />}

        {!isFetching && !assets.length && (
          <Typography variant="body1" align="center">
            No assets added
          </Typography>
        )}

        {!isFetching && !!assets.length && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="10%" align="center" padding="none">
                  File
                </TableCell>
                <TableCell width="30%" align="center" padding="none">
                  Info
                </TableCell>
                <TableCell width="50%" align="center" padding="none">
                  URL
                </TableCell>
                <TableCell width="10%" align="center" padding="none">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((img) => {
                const isImgWasEdited = changedFiles.findIndex((obj) => obj.name === img.fileName) >= 0;
                const editedImgObj = changedFiles.find((file) => file.name === img.fileName);
                return (
                  <TableRow key={img.fileId}>
                    <TableCell width="10%" align="center">
                      {isImgWasEdited && editedImgObj.action === 'delete' ? (
                        <RemoveCircleOutlineOutlinedIcon color="error" />
                      ) : (
                        <Box
                          component="img"
                          height="40px"
                          src={isImgWasEdited ? editedImgObj.preview : `${configuration.baseUrl}/assets/panel/${img.fileId}?${Date.now()}`}
                        />
                      )}
                    </TableCell>
                    <TableCell width="30%" align="left">
                      <Box display="grid">
                        <Typography variant="body2" noWrap>
                          Name: {img.fileName}
                        </Typography>
                        <Typography variant="body2" noWrap>
                          Added: {new Date(img.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" noWrap>
                          Changed:
                          {isImgWasEdited ? (
                            <Typography sx={{ ml: 0.5 }} component="span" variant="body2" color="error">
                              Pending for save
                            </Typography>
                          ) : (
                            new Date(img.updatedAt).toLocaleDateString()
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell width="50%" align="left">
                      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                        {img.url}
                      </Typography>
                    </TableCell>
                    <TableCell width="10%" align="center">
                      <Box className={`${commonStyles.flex}`}>
                        <Tooltip
                          onClose={() => setTimeout(() => setUrlCopied(false), 100)}
                          title={urlWasCopied ? 'URL was copied' : 'Copy URL'}
                        >
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setUrlCopied(true);
                              return navigator.clipboard.writeText(img.url);
                            }}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Change file" component="label">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                            <input hidden accept="image/*" type="file" name={img.fileId} onChange={handleEditFileInputChange} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete file">
                          <IconButton size="small" color="error" onClick={onDeleteFileClick(img.fileId)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                        <IconButton disabled={!isImgWasEdited} size="small" color="primary" onClick={onUndoClick(img.fileId)}>
                          <Tooltip title="Undo changes">
                            <UndoIcon />
                          </Tooltip>
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={!changedFiles.length} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>

      {waitingForUploadFiles.length > 0 && (
        <Dialog fullWidth maxWidth="md" open={waitingForUploadFiles.length > 0} onClose={() => setWaitingForUploadFiles([])}>
          <DialogTitle>Selected files</DialogTitle>
          <DialogContent>
            <Table>
              <TableBody>
                {waitingForUploadFiles.map((img) => (
                  <TableRow key={img.name}>
                    <TableCell width="20%">
                      <Box component="img" height="40px" src={URL.createObjectURL(img.file)}></Box>
                    </TableCell>
                    <TableCell width="50%" align="center">
                      <Box display="grid">
                        <Typography variant="body2" noWrap>
                          {img.name}
                        </Typography>
                        {!img.isImage && <Typography color="error">File must be image</Typography>}
                        {img.isImage && !img.isNameValid && (
                          <Typography color="error">File name cannot contain blank characters</Typography>
                        )}
                        {img.isImage && img.isNameValid && img.isNameExistOnList && (
                          <Typography color="error">File with this name already exist. Uploading will overwrite it</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell width="20%">
                      <Tooltip title="Remove file">
                        <IconButton
                          color="primary"
                          onClick={() => setWaitingForUploadFiles((prevState) => prevState.filter((el) => el.name !== img.name))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setWaitingForUploadFiles([])}>
              Close
            </Button>
            <Button
              variant="contained"
              disabled={waitingForUploadFiles.some((file) => !file.isImage || !file.isNameValid)}
              onClick={onDialogConfirmClick}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

const RequiredAssetsTable = ({ requiredFavicons, requiredLogos }) => {
  const [uploadAssets, { isLoading }] = useUploadPanelAssetsMutation();
  const [deleteAssets] = useDeletePanelAssetsMutation();
  const [changedFiles, setChangedFiles] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const changedImages = Object.keys(changedFiles).filter((file) => changedFiles[file].action === 'change');
    const restoredImages = Object.keys(changedFiles).filter((file) => changedFiles[file].action === 'restoreDefault');
    let changeResponse;
    let restoreResponse;

    if (!!changedImages.length) {
      const formData = new FormData();
      changedImages.forEach((file) => formData.append(file, changedFiles[file].file));
      changeResponse = await uploadAssets(formData);
    }

    if (!!restoredImages.length) {
      const body = { fileIds: restoredImages };
      restoreResponse = await deleteAssets(body);
    }

    if ((changeResponse && changeResponse.data.message === 'OK') || (restoreResponse && restoreResponse.data.message === 'OK')) {
      setChangedFiles({});
      createSuccessNotification();
    }
  };

  const updateComponentState = (name, file) => {
    setChangedFiles((prevState) => ({
      ...prevState,
      [name]: { file, preview: URL.createObjectURL(file), action: 'change' },
    }));
  };

  const onInputChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const isFileIsImage = file && file.type.split('/')[0] === 'image';
    const isFileTypeIsPng = file && file.type.split('/')[1] === 'png';

    if (!isFileIsImage) {
      enqueueSnackbar('File must be image', { variant: 'error' });
      return;
    }

    const image = new Image();
    const fr = new FileReader();

    fr.onload = function () {
      if (fr !== null && typeof fr.result == 'string') {
        image.src = fr.result;
      }
    };
    fr.readAsDataURL(file);

    image.onload = () => {
      const width = image.width;
      const height = image.height;

      switch (name) {
        case 'Favicon16x16':
          if (width === 16 && height === 16 && isFileTypeIsPng) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be png with size 16x16', { variant: 'error', persist: true });
          }
          break;

        case 'Favicon32x32':
          if (width === 32 && height === 32 && isFileTypeIsPng) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be png with size 32x32', { variant: 'error' });
          }
          break;

        case 'Favicon48x48':
          if (width === 48 && height === 48 && isFileTypeIsPng) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be png with size 48x48', { variant: 'error' });
          }
          break;

        case 'Favicon96x96':
          if (width === 96 && height === 96 && isFileTypeIsPng) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be png with size 96x96', { variant: 'error' });
          }
          break;

        case 'LogoH30':
          if (height >= 30) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be with min height 30', { variant: 'error' });
          }
          break;
        case 'LogoH60':
          if (height >= 30) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be with min height 30', { variant: 'error' });
          }
          break;
        case 'LogoH90':
          if (height >= 30) {
            updateComponentState(name, file);
          } else {
            enqueueSnackbar('Image should be with min height 30', { variant: 'error' });
          }
          break;

        default:
          break;
      }
    };
    e.target.value = '';
  };

  const onUndoClick = (id) => () =>
    setChangedFiles((prevState) => {
      delete prevState[id];
      return { ...prevState };
    });

  const onRestoreDefaultClick = (id) => () => {
    const newImgObj = { file: null, preview: null, action: 'restoreDefault' };
    setChangedFiles((prevState) => ({ ...prevState, [id]: newImgObj }));
  };

  return (
    <>
      <CardContent>
        <Box className={commonStyles.card}>
          <Typography variant="h6">Favicons</Typography>
          <Typography variant="body2">You can add png files with sizes 16x16, 32x32, 48x48 and 96x96</Typography>
          <Table>
            <TableBody>
              {requiredFavicons.map((id) => {
                const width = id.match(/(\d+)/)[0];
                const height = id.match(/(\d+)/)[1];
                return (
                  <TableRow key={id}>
                    <TableCell width="40%">
                      {changedFiles.hasOwnProperty(id) && changedFiles[id]?.action === 'restoreDefault' ? (
                        <SvgIcon sx={{ fontSize: height + 'px' }}>
                          <RestoreIcon color="error" />
                        </SvgIcon>
                      ) : (
                        <Box
                          component="img"
                          src={changedFiles[id]?.preview || `${configuration.baseUrl}/assets/panel/${id}?${Date.now()}`}
                          height={height + 'px'}
                          width={width + 'px'}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" width="20%">
                      <Typography variant="body1">
                        {width}x{height}
                      </Typography>
                      {changedFiles.hasOwnProperty(id) && (
                        <Typography component="span" variant="body2" color="error">
                          Pending for save
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" width="40%">
                      <Tooltip title="Change image">
                        <IconButton component="label" color="primary">
                          <EditIcon />
                          <input hidden accept="image/*" type="file" name={id} onChange={onInputChange} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Restore default image">
                        <IconButton component="label" color="error" onClick={onRestoreDefaultClick(id)}>
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>

                      <IconButton disabled={!changedFiles.hasOwnProperty(id)} size="small" color="primary" onClick={onUndoClick(id)}>
                        <Tooltip title="Undo changes">
                          <UndoIcon />
                        </Tooltip>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        <Box className={commonStyles.card}>
          <Typography variant="h6">Logos</Typography>
          <Typography variant="body2">You can add png files with minimal height 30 px and optional @2x and @3x</Typography>
          <Table sx={{ mt: 1 }}>
            <TableBody>
              {requiredLogos.map((id) => {
                const height = id.match(/(\d+)/)[0];
                return (
                  <TableRow key={id}>
                    <TableCell width="40%" sx={{ backgroundColor: 'primary.main' }}>
                      {changedFiles.hasOwnProperty(id) && changedFiles[id]?.action === 'restoreDefault' ? (
                        <SvgIcon sx={{ fontSize: height + 'px' }}>
                          <RestoreIcon color="error" />
                        </SvgIcon>
                      ) : (
                        <Box
                          component="img"
                          src={changedFiles[id]?.preview || `${configuration.baseUrl}/assets/panel/${id}?${Date.now()}`}
                          height={height + 'px'}
                          maxWidth="100%"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" width="20%">
                      <Typography variant="body1">Min height {height}</Typography>
                      {changedFiles.hasOwnProperty(id) && (
                        <Typography component="span" variant="body2" color="error">
                          Pending for save
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" width="40%">
                      <Tooltip title="Change image">
                        <IconButton component="label" color="primary">
                          <EditIcon />
                          <input hidden accept="image/*" type="file" name={id} onChange={onInputChange} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Restore default image">
                        <IconButton component="label" color="error" onClick={onRestoreDefaultClick(id)}>
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>

                      <IconButton disabled={!changedFiles.hasOwnProperty(id)} size="small" color="primary" onClick={onUndoClick(id)}>
                        <Tooltip title="Undo changes">
                          <UndoIcon />
                        </Tooltip>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || Object.keys(changedFiles).length === 0} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </>
  );
};
