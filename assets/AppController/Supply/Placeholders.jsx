import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useGetMediaQuery,
  useGetPlaceholdersQuery,
  useUploadSupplyPlaceholdersMutation,
  useDeleteSupplyPlaceholderMutation,
} from '../../redux/taxonomy/taxonomyApi';
import Spinner from '../../Components/Spinner/Spinner';
import { Select } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import TableData from '../../Components/TableData/TableData';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCreateNotification } from '../../hooks';
import RestoreIcon from '@mui/icons-material/Restore';

export default function Placeholders() {
  return (
    <>
      <PlaceholdersCard />
    </>
  );
}

const headCells = [
  {
    id: 'placeholder',
    label: 'Placeholder',
    cellWidth: '85%',
    alignContent: 'left',
  },
  {
    id: 'data',
    label: 'Data',
    cellWidth: '10%',
    alignContent: 'left',
  },
  {
    id: 'actions',
    label: 'Actions',
    cellWidth: '5%',
    alignContent: 'left',
    pinToRight: true,
  },
];

const PAGE = 'page';
const LIMIT = 'limit';
const FILTER_MEDIUM = 'filter[medium]';

const PlaceholdersCard = (props) => {
  const { createSuccessNotification } = useCreateNotification();
  const [fileList, setFileList] = useState([]);
  const [medium, setMedium] = useState('web');
  const [queryConfig, setQueryConfig] = useState(() => ({
    page: 1,
    limit: 20,
    cursor: null,
    orderBy: null,
  }));
  const { data: media, isFetching: isMediaFetching } = useGetMediaQuery();

  const {
    data: placeholders,
    isFetching: isPlaceholdersFetching,
    refetch: refetchPlaceholders,
  } = useGetPlaceholdersQuery(
    {
      [FILTER_MEDIUM]: medium,
      ...queryConfig,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [uploadSupplyPlaceholders, { isLoading: uploadingInProgress }] = useUploadSupplyPlaceholdersMutation();
  const [deleteSupplyPlaceholder, { isLoading: deletingInProgress }] = useDeleteSupplyPlaceholderMutation();
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [restoreDefaultConfirmation, setRestoreDefaultConfirmation] = useState({ isOpen: false, uuid: null });

  const memoizedMedia = useMemo(() => media?.data.data, [media]);
  const memoizedPlaceholders = useMemo(() => placeholders?.data, [placeholders]);

  const handleMediumChange = (event) => {
    setMedium(() => event.target.value);
  };

  const handleFileChange = (event) => {
    const { files } = event.target;
    setFileList((prevState) => {
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
            },
          ],
          [],
        ),
      ];
    });
    event.target.value = '';
  };

  const handleUploadClick = async () => {
    if (!fileList.length) {
      return;
    }

    const data = new FormData();
    fileList.forEach((file, i) => {
      data.append(`file-${i}`, file.file, file.name);
    });
    data.append('medium', medium);
    data.append('type', 'image');

    const response = await uploadSupplyPlaceholders(data);

    if (response.data && response.data.message === 'OK') {
      setFileList([]);
      refetchPlaceholders();
      createSuccessNotification();
    }
  };

  const handleTableChanges = (event) => {
    setQueryConfig({
      cursor: event.page === 1 ? null : memoizedPlaceholders?.meta.cursor,
      limit: event.rowsPerPage,
      page: event.page,
    });
  };

  const showPlaceholderPreview = (url) => {
    setPreviewOpen(true);
    setPreviewUrl(url);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  const handleRestoreDefaultClick = (uuid) => {
    setRestoreDefaultConfirmation({ isOpen: true, uuid });
  };

  const closeConfirmationDialog = () => {
    setRestoreDefaultConfirmation({ isOpen: false, uuid: null });
  };

  const confirmRestoreDefault = async (uuid) => {
    const response = await deleteSupplyPlaceholder({ uuid });

    if (response.data && response.data.message === 'OK') {
      closeConfirmationDialog();
      refetchPlaceholders();
      createSuccessNotification();
    }
  };

  const rows = useMemo(() => {
    return memoizedPlaceholders
      ? memoizedPlaceholders.data.map((placeholder) => {
          return {
            id: placeholder.id,
            placeholder: (
              <Box sx={{ height: '100px' }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <Box
                  sx={{ maxHeight: '100%', maxWidth: '100%' }}
                  component="img"
                  src={placeholder.url}
                  alt={placeholder.mime}
                  onClick={() => {
                    showPlaceholderPreview(placeholder.url);
                  }}
                />
              </Box>
            ),
            data: (
              <>
                <Typography component="p" variant="tableText2">
                  {placeholder.type}
                </Typography>
                <Typography component="p" variant="tableText2">
                  {placeholder.scope}
                </Typography>
              </>
            ),
            actions: (
              <Tooltip title="Restore default">
                <IconButton
                  component="label"
                  color="error"
                  disabled={placeholder.isDefault}
                  onClick={() => handleRestoreDefaultClick(placeholder.id)}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            ),
          };
        })
      : [];
  }, [placeholders]);

  return (
    <>
      <Card {...props}>
        <CardHeader
          title="Placeholders"
          subheader={
            <>
              <Typography>Set creatives which will be presented to the user in case of missing campaigns.</Typography>
              <Link
                underline="hover"
                color="secondary"
                href="https://docs.adshares.net/protocol/taxonomy/index.html"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                See available placeholders properties
              </Link>
            </>
          }
        />

        <CardContent>
          <Box className={`${commonStyles.flex}`}>
            {isMediaFetching && <Spinner />}

            <Box sx={{ width: '100%', maxWidth: '14.5rem', mr: 3 }}>
              {memoizedMedia && (
                <FormControl fullWidth customvariant="highLabel">
                  <InputLabel id="selectMedium">Medium</InputLabel>
                  <Select id="selectMedium" color="secondary" value={medium} onChange={handleMediumChange}>
                    {Object.entries(memoizedMedia).map((medium) => (
                      <MenuItem key={medium[0]} value={medium[0]}>
                        {medium[1]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            <Box className={`${commonStyles.flex} ${commonStyles.alignEnd}`} sx={{ pb: 1 }}>
              <Button variant="contained" component="label">
                <FileUploadIcon />
                Upload
                <input hidden accept="image/*" type="file" multiple onChange={handleFileChange} />
              </Button>
            </Box>
          </Box>

          <TableData
            headCells={headCells}
            rows={rows}
            onTableChange={handleTableChanges}
            isDataLoading={isPlaceholdersFetching}
            paginationParams={{
              page:
                (queryConfig[PAGE] > memoizedPlaceholders?.meta.lastPage
                  ? memoizedPlaceholders?.meta.lastPage
                  : memoizedPlaceholders?.meta.currentPage) || queryConfig[PAGE],
              lastPage: memoizedPlaceholders?.meta.lastPage || 1,
              rowsPerPage: queryConfig[LIMIT] || 20,
              count: memoizedPlaceholders?.meta.total || 0,
              showFirstButton: true,
              showLastButton: true,
            }}
          />
        </CardContent>
      </Card>

      <PreviewDialog isOpen={isPreviewOpen} previewUrl={previewUrl} onClose={handlePreviewClose} />

      <UploadFilesDialog files={fileList} setFiles={setFileList} onConfirm={handleUploadClick} inProgress={uploadingInProgress} />

      <ConfirmationDialog
        confirmationObject={restoreDefaultConfirmation}
        onClose={closeConfirmationDialog}
        onConfirm={confirmRestoreDefault}
        inProgress={deletingInProgress}
      />
    </>
  );
};

const PreviewDialog = ({ isOpen, previewUrl, onClose }) => {
  return (
    previewUrl && (
      <Modal open={isOpen} onClose={onClose} className={`${commonStyles.flex} ${commonStyles.justifyCenter} ${commonStyles.alignCenter}`}>
        <Box component="img" src={previewUrl} alt="Placeholder preview" sx={{ maxWidth: '80%' }} />
      </Modal>
    )
  );
};

const UploadFilesDialog = ({ files, setFiles, onConfirm, inProgress }) => {
  return (
    files.length > 0 && (
      <Dialog fullWidth maxWidth="md" open={files.length > 0} onClose={() => setFiles([])}>
        <DialogTitle component="div">
          <Typography variant="h3">Selected files</Typography>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.name}>
                  <TableCell width="10%">
                    <Box component="img" height="40px" src={URL.createObjectURL(file.file)}></Box>
                  </TableCell>
                  <TableCell width="85%" align="left">
                    <Box display="grid">
                      <Typography variant="tableText1" noWrap>
                        {file.name}
                      </Typography>
                      {!file.isImage && <Typography color="error">File must be image</Typography>}
                      {file.isImage && !file.isNameValid && (
                        <Typography color="error">File name cannot contain blank characters</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell width="5%">
                    <Tooltip title="Remove file">
                      <IconButton color="primary" onClick={() => setFiles((prevState) => prevState.filter((el) => el.name !== file.name))}>
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
          <Button variant="outlined" onClick={() => setFiles([])}>
            Close
          </Button>
          <Button variant="contained" disabled={files.some((file) => !file.isImage || !file.isNameValid) || inProgress} onClick={onConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    )
  );
};

const ConfirmationDialog = ({ confirmationObject, onClose, onConfirm, inProgress }) => {
  return (
    <Dialog open={confirmationObject.isOpen} onClose={onClose}>
      <DialogTitle component="div">
        <Typography variant="h6">Confirm restore default? Saved placeholder will be deleted</Typography>
      </DialogTitle>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" color="error" onClick={() => onConfirm(confirmationObject.uuid)} disabled={!!inProgress}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
