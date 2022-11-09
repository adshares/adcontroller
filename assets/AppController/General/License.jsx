import React, { useEffect, useState } from 'react';
import { useGetLicenseDataQuery, useSetExistingLicenseMutation } from '../../redux/config/configApi';
import { useCreateNotification, useForm } from '../../hooks';
import Spinner from '../../Components/Spinner/Spinner';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import commonStyles from '../../styles/commonStyles.scss';

function License() {
  const { data, error, isLoading, refetch } = useGetLicenseDataQuery();
  const [setExistingLicense, { isLoading: setLicenseLoading }] = useSetExistingLicenseMutation();
  const [LicenseData, setLicenseData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const form = useForm({
    initialFields: {
      LicenseKey: '',
    },
    validation: {
      LicenseKey: ['required', 'licenseKey'],
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  useEffect(() => {
    if (data?.data) {
      setLicenseData(data.data.LicenseData);
    }
  }, [data, error]);

  const toggleEditMode = () => {
    setEditMode((prevState) => !prevState);
    form.resetForm();
  };

  const handleGetLicenseClick = async () => {
    const body = { LicenseKey: form.fields.LicenseKey };
    const response = await setExistingLicense(body);

    if (response.data && response.data.message === 'OK') {
      createSuccessNotification();
      toggleEditMode();
      refetch();
    }
  };

  return (
    <Card className={`${commonStyles.card}`} width="mainContainer">
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader
          title="License"
          subheaderTypographyProps={{ color: 'error' }}
          subheader={!isLoading && error && 'No license. Configure an open-source license'}
        />
        <IconButton type="button" onClick={toggleEditMode}>
          {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
        </IconButton>
      </Box>

      <Collapse in={!editMode} timeout="auto">
        <CardContent sx={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          {isLoading && <Spinner />}
          {LicenseData && (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell align="left">License owner</TableCell>

                  <TableCell align="left">{LicenseData.Owner}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">License type</TableCell>
                  <TableCell align="left">{LicenseData.Type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">License will expire</TableCell>
                  <TableCell align="left">
                    <Typography variant="body2" color="warning.light">
                      {new Date(LicenseData.DateEnd).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">Fixed fee</TableCell>
                  <TableCell align="left">{LicenseData.FixedFee} ADS</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left">Supply fee / Demand fee</TableCell>

                  <TableCell align="left">
                    {LicenseData.SupplyFee * 100}% / {LicenseData.DemandFee * 100}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Collapse>

      <Collapse in={editMode} timeout="auto">
        <CardContent>
          <Box
            className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexWrap} ${commonStyles.alignStart}`}
            component="form"
            onChange={form.onChange}
            onFocus={form.setTouched}
          >
            <Box sx={{ mr: 1 }} className={`${commonStyles.halfCard}`}>
              <TextField
                error={form.changedFields.LicenseKey && !form.errorObj.LicenseKey.isValid}
                helperText={form.changedFields.LicenseKey && form.errorObj.LicenseKey.helperText}
                placeholder="XXX-xxxxxx-xxxxx-xxxxx-xxxx-xxxx"
                size="small"
                name="LicenseKey"
                label="Your license key"
                value={form.fields.LicenseKey}
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Button disabled={!form.isFormValid || setLicenseLoading} type="button" variant="contained" onClick={handleGetLicenseClick}>
              Get license
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default License;
