import React, { useEffect, useMemo, useState } from 'react';
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useSnackbar } from 'notistack';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
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
      <RebrandingCard sx={{ mt: 3 }} />
    </>
  );
}

const PlaceholdersCard = (props) => {
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
  const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false);

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
    <>
      <Card {...props}>
        <CardHeader title="Panel metadata" subheader="Set the ad server panel metadata" />
        <CardContent>
          <Box component="form" onChange={(e) => form.onChange(e)} onFocus={(e) => form.setTouched(e)}>
            <TextField
              sx={{ mb: 3 }}
              value={form.fields.PlaceholderIndexTitle}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderIndexTitle"
              label="Title"
              fullWidth
            />
            <CollapsibleTextarea
              collapsible
              value={form.fields.PlaceholderIndexDescription}
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderIndexDescription"
              label="Description"
              multiline
              rows={8}
              fullWidth
            />
            <TextField
              value={form.fields.PlaceholderIndexKeywords}
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderIndexKeywords"
              label="Keywords"
              fullWidth
            />
            <CollapsibleTextarea
              collapsible
              value={form.fields.PlaceholderIndexMetaTags}
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderIndexMetaTags"
              label="Custom meta tags"
              multiline
              rows={8}
              fullWidth
            />
            <CollapsibleTextarea
              collapsible
              value={form.fields.PlaceholderRobotsTxt}
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderRobotsTxt"
              label="robots.txt"
              multiline
              rows={8}
              fullWidth
            />
            <CollapsibleTextarea
              collapsible
              value={form.fields.PlaceholderLoginInfo}
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderLoginInfo"
              label="Login page info (HTML)"
              multiline
              rows={20}
              fullWidth
            />
            <CollapsibleTextarea
              collapsible
              value={form.fields.PlaceholderStyleCss}
              color="secondary"
              customvariant="highLabel"
              name="PlaceholderStyleCss"
              label="AdPanel styles (CSS)"
              multiline
              rows={20}
              fullWidth
            />
          </Box>
        </CardContent>

        <CardActions>
          <Button
            disabled={isLoading || !form.isFormWasChanged}
            onClick={() => {
              if (form.changedFields.PlaceholderStyleCss) {
                setConfirmationDialogOpen(true);
              } else {
                onSaveClick();
              }
            }}
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </CardActions>
      </Card>

      <ConfirmationDialog open={confirmationDialogOpen} setOpen={setConfirmationDialogOpen} onConfirm={onSaveClick} />
    </>
  );
};

const RebrandingCard = (props) => {
  const [activeTab, setActiveTab] = React.useState('requiredAssets');
  const [saveButton, setSaveButton] = React.useState({});
  const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false);
  const requiredFavicons = {
    Favicon16x16: { name: 'favicon-16x16.png', desc: '16x16' },
    Favicon32x32: { name: 'favicon-32x32.png', desc: '32x32' },
    Favicon48x48: { name: 'favicon-48x48.png', desc: '48x48' },
    Favicon96x96: { name: 'favicon-96x96.png', desc: '96x96' },
  };
  const requiredLogos = {
    LogoH30: { name: 'logo.png', desc: 'Logo' },
    LogoSimpleH30: { name: 'logo-simple.png', desc: 'Simple logo' },
    LogoDarkModeH30: { name: 'logo-dark-mode.png', desc: 'Dark mode logo' },
    LogoSimpleDarkModeH30: { name: 'logo-simple-dark-mode.png', desc: 'Simple dark mode logo' },
  };

  const handleTabChange = (e, newActiveTab) => {
    setActiveTab(newActiveTab);
  };

  const setBtnConfig = (conf) => {
    if (conf.tab === activeTab) {
      setSaveButton(conf);
    }
  };

  return (
    <>
      <Card {...props}>
        <CardHeader title="Rebranding" subheader="Customize the ad server panel." />
        <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <TabContext value={activeTab}>
            <TabList onChange={handleTabChange}>
              <Tab label="Required assets" value="requiredAssets" />
              <Tab label="Additional assets" value="additionalAssets" />
            </TabList>
            <TabPanel value="requiredAssets">
              <RequiredAssetsTable actions={{ setBtnConfig }} requiredFavicons={requiredFavicons} requiredLogos={requiredLogos} />
            </TabPanel>
            <TabPanel value="additionalAssets">
              <AdditionalAssets
                actions={{ setBtnConfig }}
                rejectedAssets={[...Object.keys(requiredLogos), ...Object.keys(requiredFavicons)]}
              />
            </TabPanel>
          </TabContext>
        </CardContent>
        <CardActions>
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button
              variant="contained"
              type="button"
              disabled={saveButton.disabled}
              onClick={() => {
                if (saveButton.tab === 'requiredAssets') {
                  setConfirmationDialogOpen(true);
                } else {
                  saveButton.onSaveClick();
                }
              }}
            >
              Save
            </Button>
          </Box>
        </CardActions>
      </Card>
      <ConfirmationDialog open={confirmationDialogOpen} setOpen={setConfirmationDialogOpen} onConfirm={saveButton.onSaveClick} />
    </>
  );
};

const AdditionalAssets = ({ rejectedAssets, actions }) => {
  const { data, refetch, isFetching } = useGetPanelAssetsQuery();
  const [uploadAssets] = useUploadPanelAssetsMutation();
  const [deleteAssets] = useDeletePanelAssetsMutation();
  const [pathWasCopied, setPathCopied] = useState(false);
  const [waitingForUploadFiles, setWaitingForUploadFiles] = useState([]);
  const [changedFiles, setChangedFiles] = useState([]);
  const { createSuccessNotification } = useCreateNotification();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    actions.setBtnConfig({
      tab: 'additionalAssets',
      disabled: !changedFiles.length,
      onSaveClick,
    });
  }, [changedFiles]);

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
    <Box sx={{ height: '856px', overflow: 'auto' }}>
      <Button variant="contained" component="label">
        <FileUploadIcon />
        Upload
        <input hidden accept="image/*" type="file" multiple onChange={handleUploadInputChange} />
      </Button>
      {isFetching && <Spinner />}

      {!isFetching && !assets.length && (
        <Typography variant="body1" align="left">
          No assets added
        </Typography>
      )}

      {!isFetching && !!assets.length && (
        <Table sx={{ mt: 3 }}>
          <TableBody>
            {assets.map((img) => {
              const isImgWasEdited = changedFiles.findIndex((obj) => obj.name === img.fileName) >= 0;
              const editedImgObj = changedFiles.find((file) => file.name === img.fileName);
              const imgPath = new URL(img.url).pathname;
              return (
                <TableRow key={img.fileId}>
                  <TableCell width="10%" align="left">
                    {isImgWasEdited && editedImgObj.action === 'delete' ? (
                      <RemoveCircleOutlineOutlinedIcon color="error" />
                    ) : (
                      <Box
                        component="img"
                        height="40px"
                        src={isImgWasEdited ? editedImgObj.preview : `${configuration.basePath}/assets/panel/${img.fileId}?${Date.now()}`}
                      />
                    )}
                  </TableCell>
                  <TableCell width="27%" align="left">
                    <Box>
                      <Typography variant="body2">Name: {img.fileName}</Typography>
                      <Typography variant="body2">Added: {new Date(img.createdAt).toLocaleDateString()}</Typography>
                      <Typography variant="body2">
                        Changed:{' '}
                        {isImgWasEdited ? (
                          <Typography component="span" variant="body2" color="error">
                            pending for save
                          </Typography>
                        ) : (
                          new Date(img.updatedAt).toLocaleDateString()
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell width="58%" align="left">
                    <Typography variant="tableText1" sx={{ overflowWrap: 'anywhere' }}>
                      {imgPath}
                    </Typography>
                  </TableCell>
                  <TableCell width="5%" align="left">
                    <Box className={`${commonStyles.flex}`}>
                      <Tooltip
                        onClose={() => setTimeout(() => setPathCopied(false), 100)}
                        title={pathWasCopied ? 'Path was copied' : 'Copy path'}
                      >
                        <IconButton
                          size="small"
                          color="freshGrass"
                          onClick={() => {
                            setPathCopied(true);
                            return navigator.clipboard.writeText(imgPath);
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Change file" component="label">
                        <IconButton size="small" color="secondary">
                          <CreateOutlinedIcon />
                          <input hidden accept="image/*" type="file" name={img.fileId} onChange={handleEditFileInputChange} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box className={`${commonStyles.flex}`}>
                      <Tooltip title="Delete file">
                        <IconButton size="small" color="error" onClick={onDeleteFileClick(img.fileId)}>
                          <RemoveCircleOutlineOutlinedIcon />
                        </IconButton>
                      </Tooltip>

                      <IconButton disabled={!isImgWasEdited} size="small" color="black" onClick={onUndoClick(img.fileId)}>
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

      {waitingForUploadFiles.length > 0 && (
        <Dialog fullWidth maxWidth="md" open={waitingForUploadFiles.length > 0} onClose={() => setWaitingForUploadFiles([])}>
          <DialogTitle component="div">
            <Typography variant="h3">Selected files</Typography>
          </DialogTitle>
          <DialogContent>
            <Table>
              <TableBody>
                {waitingForUploadFiles.map((img) => (
                  <TableRow key={img.name}>
                    <TableCell width="10%">
                      <Box component="img" height="40px" src={URL.createObjectURL(img.file)}></Box>
                    </TableCell>
                    <TableCell width="85%" align="left">
                      <Box display="grid">
                        <Typography variant="tableText1" noWrap>
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
                    <TableCell width="5%">
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
    </Box>
  );
};

const RequiredAssetsTable = ({ requiredFavicons, requiredLogos, actions }) => {
  const [uploadAssets, { isLoading }] = useUploadPanelAssetsMutation();
  const [deleteAssets] = useDeletePanelAssetsMutation();
  const [changedFiles, setChangedFiles] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const { createSuccessNotification } = useCreateNotification();

  useEffect(() => {
    actions.setBtnConfig({
      tab: 'requiredAssets',
      disabled: isLoading || Object.keys(changedFiles).length === 0,
      onSaveClick,
    });
  }, [isLoading, changedFiles]);

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
        case 'LogoSimpleH30':
        case 'LogoDarkModeH30':
        case 'LogoSimpleDarkModeH30':
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
    <Box sx={{ height: '856px', overflow: 'auto' }}>
      <Box>
        <Typography variant="h3" component="h3">
          Favicons
        </Typography>
        <Typography sx={{ mt: 1 }} variant="body2">
          You can add png files with sizes 16x16, 32x32, 48x48 and 96x96
        </Typography>
        <Table sx={{ mt: 3 }}>
          <TableBody>
            {Object.entries(requiredFavicons).map(([id, { name, desc }]) => {
              const width = desc.match(/(\d+)/)[0];
              const height = desc.match(/(\d+)/)[1];
              const isWasChanged = changedFiles.hasOwnProperty(id);
              return (
                <TableRow key={id}>
                  <TableCell width="45%">
                    {isWasChanged && changedFiles[id]?.action === 'restoreDefault' ? (
                      <SvgIcon sx={{ fontSize: height + 'px' }}>
                        <RestoreIcon color="error" />
                      </SvgIcon>
                    ) : (
                      <Box
                        component="img"
                        src={isWasChanged ? changedFiles[id]?.preview : `${configuration.basePath}/build/assets/${name}`}
                        height={height + 'px'}
                        width={width + 'px'}
                      />
                    )}
                  </TableCell>
                  <TableCell align="left" width="35%">
                    <Typography variant="tableText1" component="p">
                      {desc}
                    </Typography>
                    {isWasChanged && (
                      <Typography component="p" variant="body2" color="error">
                        pending for save
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="left" width="20%">
                    <Tooltip title="Change image">
                      <IconButton component="label" color="secondary">
                        <CreateOutlinedIcon />
                        <input hidden accept="image/*" type="file" name={id} onChange={onInputChange} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Restore default image">
                      <IconButton component="label" color="error" onClick={onRestoreDefaultClick(id)}>
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>

                    <IconButton disabled={!isWasChanged} size="small" color="black" onClick={onUndoClick(id)}>
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" component="h3">
          Logo
        </Typography>
        <Typography sx={{ mt: 1 }} variant="body2">
          You can add png file with minimal height 30 px
        </Typography>
        <Table sx={{ mt: 3, backgroundColor: 'primary.main' }}>
          <TableBody>
            {Object.entries(requiredLogos).map(([id, { name, desc }]) => {
              const isWasChanged = changedFiles.hasOwnProperty(id);
              return (
                <TableRow key={id}>
                  <TableCell width="45%">
                    {isWasChanged && changedFiles[id]?.action === 'restoreDefault' ? (
                      <SvgIcon>
                        <RestoreIcon color="error" />
                      </SvgIcon>
                    ) : (
                      <Box
                        component="img"
                        src={isWasChanged ? changedFiles[id]?.preview : `${configuration.basePath}/build/assets/${name}`}
                        onError={(e) => {
                          e.target.src = `${configuration.basePath}/build/assets/${
                            (id === 'LogoDarkModeH30' && 'logo.png') || (id === 'LogoSimpleDarkModeH30' && 'logo-simple.png')
                          }`;
                        }}
                        maxWidth="100%"
                        height="30px"
                      />
                    )}
                  </TableCell>
                  <TableCell align="left" width="35%">
                    <Typography variant="tableText1" color="secondary.main" component="p">
                      {desc}
                    </Typography>
                    {changedFiles.hasOwnProperty(id) && (
                      <Typography component="p" variant="body2" color="error.main">
                        pending for save
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="left" width="20%">
                    <Tooltip title="Change image">
                      <IconButton component="label" color="secondary">
                        <CreateOutlinedIcon />
                        <input hidden accept="image/*" type="file" name={id} onChange={onInputChange} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Restore default image">
                      <IconButton component="label" color="error" onClick={onRestoreDefaultClick(id)}>
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>

                    <IconButton disabled={!changedFiles.hasOwnProperty(id)} size="small" color="white" onClick={onUndoClick(id)}>
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
    </Box>
  );
};

const ConfirmationDialog = ({ open, setOpen, onConfirm }) => {
  const [isPending, setIsPending] = useState(false);
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>Saving will reload the page. Do you want to continue?</DialogTitle>
      {isPending ? (
        <DialogContent>
          <Spinner />
        </DialogContent>
      ) : (
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              setIsPending(true);
              await onConfirm();
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
