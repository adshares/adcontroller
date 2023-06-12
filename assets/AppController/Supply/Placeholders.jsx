import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Typography,
} from '@mui/material';
import { useGetMediaQuery, useGetVendorListQuery, useGetTaxonomyQuery, useGetPlaceholdersQuery } from '../../redux/taxonomy/taxonomyApi';
import Spinner from '../../Components/Spinner/Spinner';
import { Select } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import TableData from '../../Components/TableData/TableData';

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
  const [fileList, setFileList] = useState(null);
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

  const { data: placeholders, isFetching: isPlaceholdersFetching } = useGetPlaceholdersQuery(
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
    setFileList(event.target.files);
  };

  const handleUploadClick = () => {
    if (!fileList) {
      return;
    }

    const data = new FormData();
    files.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });
    data.append('medium', 'web');
    // data.append('vendor', null);
    data.append('type', 'image');

    // upload
    fetch('http://localhost:8030/api/supply-placeholders', {
      method: 'POST',
      body: data,
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  const files = fileList ? [...fileList] : [];

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

            <Box sx={{ width: '100%', maxWidth: '14.5rem' }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
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

          <div>
            <input type="file" onChange={handleFileChange} multiple />
            <ul>
              {files.map((file, i) => (
                <li key={i}>
                  {file.name} - {file.type}
                </li>
              ))}
            </ul>
            <button onClick={handleUploadClick}>Upload</button>
          </div>
        </CardContent>
      </Card>

      <PreviewDialog isOpen={isPreviewOpen} previewUrl={previewUrl} onClose={handlePreviewClose} />
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
