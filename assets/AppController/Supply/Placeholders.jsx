import React, { useEffect, useMemo, useState } from 'react';
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
    medium: 'web',
    vendor: null,
  });
  const { data: media, isFetching: isMediaFetching } = useGetMediaQuery();
  const { data: vendors, isFetching: isVendorListFetching } = useGetVendorListQuery(
    { medium: selectedMedium.medium },
    {
      refetchOnMountOrArgChange: true,
      skip: selectedMedium.medium === 'web',
    },
  );
  const { data: taxonomy, isFetching: isTaxonomyFetching } = useGetTaxonomyQuery(selectedMedium, {
    refetchOnMountOrArgChange: true,
    skip: selectedMedium.medium === 'metaverse' && !selectedMedium.vendor,
  });

  const listOfMedia = useMemo(() => media?.data.data, [media]);
  const listOfVendors = useMemo(() => {
    if (selectedMedium.medium === 'web') {
      return;
    }
    return vendors?.data.data && Array.isArray(vendors?.data.data) ? undefined : vendors?.data.data;
  }, [vendors, selectedMedium.medium]);

  useEffect(() => {
    if (listOfVendors) {
      const vendor = Object.keys(listOfVendors).find((vendor) => vendor === 'decentraland') || Object.keys(listOfVendors)[0] || null;
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

          <Box sx={{ width: '100%', maxWidth: '14.5rem', mr: 3 }}>
            {listOfMedia && (
              <FormControl fullWidth customvariant="highLabel">
                <InputLabel id="selectMedium">Medium</InputLabel>
                <Select id="selectMedium" color="secondary" value={selectedMedium.medium} onChange={handleMediumChange}>
                  {Object.entries(listOfMedia).map((medium) => (
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
              listOfVendors &&
              selectedMedium.vendor && (
                <FormControl fullWidth customvariant="highLabel">
                  <InputLabel id="selectVendor">Vendor</InputLabel>
                  <Select id="selectVendor" color="secondary" value={selectedMedium.vendor} onChange={handleVendorChange}>
                    {Object.entries(listOfVendors).map((vendor) => (
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
