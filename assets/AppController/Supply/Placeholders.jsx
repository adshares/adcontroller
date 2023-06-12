import React, { useEffect, useMemo, useState } from 'react';
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
  useGetVendorListQuery,
  useGetTaxonomyQuery,
  useGetPlaceholdersQuery,
  useUploadSupplyPlaceholdersMutation,
} from '../../redux/taxonomy/taxonomyApi';
import Spinner from '../../Components/Spinner/Spinner';
import { Select } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import TableData from '../../Components/TableData/TableData';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCreateNotification } from '../../hooks';

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
    cellWidth: '70%',
    alignContent: 'left',
  },
  {
    id: 'data',
    label: 'Data',
    cellWidth: '15%',
    alignContent: 'left',
  },
  {
    id: 'actions',
    label: 'Actions',
    cellWidth: '15%',
    alignContent: 'left',
    pinToRight: true,
  },
];

const PAGE = 'page';
const LIMIT = 'limit';
const FILTER_MEDIUM = 'filter[medium]';
const FILTER_VENDOR = 'filter[vendor]';

const PlaceholdersCard = (props) => {
  const { createSuccessNotification } = useCreateNotification();
  const [fileList, setFileList] = useState([]);
  const [selectedMedium, setMedium] = useState({
    medium: 'web',
    vendor: null,
  });
  const [queryConfig, setQueryConfig] = useState(() => ({
    page: 1,
    limit: 20,
    cursor: null,
    orderBy: null,
  }));
  const { data: media, isFetching: isMediaFetching } = useGetMediaQuery();
  const { data: vendors, isFetching: isVendorListFetching } = useGetVendorListQuery(
    { medium: selectedMedium.medium },
    {
      refetchOnMountOrArgChange: true,
      skip: selectedMedium.medium === 'web',
    },
  );
  // const { data: taxonomy, isFetching: isTaxonomyFetching } = useGetTaxonomyQuery(selectedMedium, {
  //   refetchOnMountOrArgChange: true,
  //   skip: selectedMedium.medium === 'metaverse' && !selectedMedium.vendor,
  // });

  const {
    data: placeholders,
    isFetching: isPlaceholdersFetching,
    refetch: refetchPlaceholders,
  } = useGetPlaceholdersQuery(
    {
      [FILTER_MEDIUM]: selectedMedium.medium,
      [FILTER_VENDOR]: selectedMedium.vendor,
      ...queryConfig,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: selectedMedium.medium === 'metaverse' && !selectedMedium.vendor,
    },
  );
  const [uploadSupplyPlaceholders] = useUploadSupplyPlaceholdersMutation();
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const memoizedMedia = useMemo(() => media?.data.data, [media]);
  const memoizedVendors = useMemo(() => {
    if (selectedMedium.medium === 'web') {
      return;
    }
    return vendors?.data.data && Array.isArray(vendors?.data.data) ? undefined : vendors?.data.data;
  }, [vendors, selectedMedium.medium]);
  const memoizedPlaceholders = useMemo(() => placeholders?.data, [placeholders]);

  useEffect(() => {
    if (memoizedVendors) {
      const vendor = Object.keys(memoizedVendors).find((vendor) => vendor === 'decentraland') || Object.keys(memoizedVendors)[0] || null;
      setMedium((prevState) => ({
        ...prevState,
        vendor,
      }));
    }
  }, [vendors, selectedMedium.medium]);

  const handleMediumChange = (event) => {
    const medium = event.target.value;
    setMedium((prevState) => ({
      ...prevState,
      medium,
      ...(medium === 'web' ? { vendor: null } : {}),
    }));
  };

  const handleVendorChange = (event) =>
    setMedium((prevState) => ({
      ...prevState,
      vendor: event.target.value,
    }));

  const handleFileChange = (event) => {
    const { files } = event.target;
    console.log(files);
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
    data.append('medium', selectedMedium.medium);
    data.append('type', 'image');
    if (selectedMedium.vendor) {
      data.append('vendor', selectedMedium.vendor);
    }

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
                  src={placeholder.url.replace('https://app.web3ads.net', 'http://localhost:8010')}
                  alt={placeholder.mime}
                  onClick={() => {
                    showPlaceholderPreview(placeholder.url.replace('https://app.web3ads.net', 'http://localhost:8010'));
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
            actions: <Box>Actions</Box>,
          };
        })
      : [];
  }, [placeholders]);

  const showPlaceholderPreview = (url) => {
    setPreviewOpen(true);
    setPreviewUrl(url);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  return (
    <>
      <Card {...props}>
        <CardHeader title="Placeholders" subheader="Set creatives which will be presented to the user in case of missing campaigns." />
        <CardContent>
          <Box className={`${commonStyles.flex}`}>
            {isMediaFetching && <Spinner />}

            <Box sx={{ width: '100%', maxWidth: '14.5rem', mr: 3 }}>
              {memoizedMedia && (
                <FormControl fullWidth customvariant="highLabel">
                  <InputLabel id="selectMedium">Medium</InputLabel>
                  <Select id="selectMedium" color="secondary" value={selectedMedium.medium} onChange={handleMediumChange}>
                    {Object.entries(memoizedMedia).map((medium) => (
                      <MenuItem key={medium[0]} value={medium[0]}>
                        {medium[1]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {(memoizedVendors || isVendorListFetching) && (
              <Box sx={{ width: '100%', maxWidth: '14.5rem', mr: 3 }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                {isVendorListFetching ? (
                  <Spinner sx={{ minWidth: '14.5rem', mr: 3, mt: 2 }} />
                ) : (
                  memoizedVendors &&
                  selectedMedium.vendor && (
                    <FormControl fullWidth customvariant="highLabel">
                      <InputLabel id="selectVendor">Vendor</InputLabel>
                      <Select id="selectVendor" color="secondary" value={selectedMedium.vendor} onChange={handleVendorChange}>
                        {Object.entries(memoizedVendors).map((vendor) => (
                          <MenuItem key={vendor[0]} value={vendor[0]}>
                            {vendor[1]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                )}
              </Box>
            )}
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

      <UploadFilesDialog files={fileList} setFiles={setFileList} onConfirm={handleUploadClick} />
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

const UploadFilesDialog = ({ files, setFiles, onConfirm }) => {
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
          <Button variant="contained" disabled={files.some((file) => !file.isImage || !file.isNameValid)} onClick={onConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    )
  );
};
