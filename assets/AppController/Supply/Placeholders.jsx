import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem } from '@mui/material';
import { useGetMediaQuery, useGetVendorListQuery, useGetTaxonomyQuery } from '../../redux/taxonomy/taxonomyApi';
import Spinner from '../../Components/Spinner/Spinner';
import { Select } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';

export default function Placeholders() {
  return (
    <>
      <PlaceholdersCard />
    </>
  );
}

const PlaceholdersCard = (props) => {
  const [fileList, setFileList] = useState(null);
  const [selectedMedium, setMedium] = useState({
    medium: null,
    vendor: null,
  });
  const { data: media, isFetching: isMediaFetching, isSuccess: isMediaFetchingSuccess } = useGetMediaQuery();
  const {
    data: vendorList,
    isFetching: isVendorListFetching,
    isSuccess: isVendorListFetchingSuccess,
  } = useGetVendorListQuery(
    { medium: selectedMedium.medium },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedMedium.medium || selectedMedium.medium === 'web',
    },
  );
  const { data: taxonomy, isLoading: isTaxonomyLoading } = useGetTaxonomyQuery(selectedMedium, {
    refetchOnMountOrArgChange: true,
    skip: !selectedMedium.medium || (selectedMedium.medium === 'metaverse' && !selectedMedium.vendor),
  });

  useEffect(() => {
    if (media?.data?.data) {
      setMedium((prevState) => ({
        ...prevState,
        medium: Object.keys(media.data.data).find((medium) => medium === 'web') || Object.keys(media.data.data)[0],
      }));
    }
  }, [media]);

  useEffect(() => {
    if (selectedMedium.medium !== 'web' && vendorList?.data?.data) {
      setMedium((prevState) => ({
        ...prevState,
        vendor: Object.keys(vendorList.data.data).find((vendor) => vendor === 'decentraland') || Object.keys(vendorList.data.data)[0],
      }));
    }
  }, [vendorList, selectedMedium.medium]);

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
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  const files = fileList ? [...fileList] : [];

  return (
    <Card {...props}>
      <CardHeader title="Placeholders" subheader="Set creatives which will be presented to the user in case of missing campaigns." />
      <CardContent>
        <Box className={`${commonStyles.flex}`}>
          {isMediaFetching && <Spinner />}

          {selectedMedium.medium && isMediaFetchingSuccess && (
            <Box sx={{ minWidth: '14.5rem', mr: 3 }}>
              <FormControl fullWidth customvariant="highLabel">
                <InputLabel id="selectMedium">Medium</InputLabel>
                <Select
                  id="selectMedium"
                  color="secondary"
                  value={selectedMedium.medium}
                  onChange={(e) =>
                    setMedium((prevState) => ({
                      ...prevState,
                      medium: e.target.value,
                      ...(e.target.value === 'web' ? { vendor: null } : {}),
                    }))
                  }
                >
                  {Object.entries(media.data.data).map((medium) => (
                    <MenuItem key={medium[0]} value={medium[0]}>
                      {medium[1]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {selectedMedium.vendor && (
            <Box sx={{ minWidth: '14.5rem', mr: 3 }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              {isVendorListFetching ? (
                <Spinner sx={{ minWidth: '14.5rem', mr: 3, mt: 2 }} />
              ) : (
                <FormControl fullWidth customvariant="highLabel">
                  <InputLabel id="selectVendor">Vendor</InputLabel>
                  <Select
                    id="selectVendor"
                    color="secondary"
                    value={selectedMedium.vendor}
                    onChange={(e) =>
                      setMedium((prevState) => ({
                        ...prevState,
                        vendor: e.target.value,
                      }))
                    }
                  >
                    {Object.entries(vendorList.data.data).map((vendor) => (
                      <MenuItem key={vendor[0]} value={vendor[0]}>
                        {vendor[1]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </Box>

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
  );
};
