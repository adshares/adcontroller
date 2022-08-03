import React, { useEffect, useState } from 'react';
import commonStyles from '../../common/commonStyles.scss';
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
import { useForm } from '../../../hooks';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

function License() {
  const [licenseInfo, setLicenseInfo] = useState({
    owner: '',
    type: '',
    endDate: '',
    fixedFee: '',
    supplyFee: '',
    demandFee: '',
  });
  const [editMode, setEditMode] = useState(false);
  const { onFormChange, validate, fields, errorObj, isFormValid } = useForm({
    licenseKey: '',
  });

  //TODO: Add service to get license info
  useEffect(() => {
    setLicenseInfo({
      owner: 'Owner',
      type: 'COM',
      endDate: 'dd-mm-yyyy',
      fixedFee: 0,
      supplyFee: 1,
      demandFee: 1,
    });
  }, []);

  //TODO: Add service to get license
  const handleGetLicenseClick = () => {
    console.log('handleGetLicenseClick');
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader
          title="License"
          subheaderTypographyProps={{ color: 'error' }}
          //TODO: Add condition to display license error communicate
          subheader={!editMode && 'No license. Configure an open-source license'}
        />
        <IconButton type="button" onClick={() => setEditMode(!editMode)}>
          {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
        </IconButton>
      </Box>

      <Collapse in={!editMode} timeout="auto">
        <CardContent sx={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="left">License owner</TableCell>

                <TableCell align="left">{licenseInfo.owner}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">License type</TableCell>
                <TableCell align="left">{licenseInfo.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">License will expire</TableCell>
                <TableCell align="left">
                  {/*TODO: Add condition to change warning color*/}
                  <Typography variant="body2" color="warning.light">
                    {licenseInfo.endDate}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Fixed fee</TableCell>
                <TableCell align="left">{licenseInfo.fixedFee} ADS</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Supply fee / Demand fee</TableCell>

                <TableCell align="left">
                  {licenseInfo.supplyFee}% / {licenseInfo.demandFee}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Collapse>

      <Collapse in={editMode} timeout="auto">
        <CardContent>
          <Box
            className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexWrap} ${commonStyles.alignStart}`}
            component="form"
            onChange={onFormChange}
            onBlur={(e) => validate(e.target)}
            onSubmit={(e) => e.preventDefault()}
          >
            <Box sx={{ mr: 1 }} className={`${commonStyles.halfCard}`}>
              <TextField
                error={!!errorObj.licenseKey}
                helperText={errorObj.licenseKey}
                placeholder="XXX-xxxxxx-xxxxx-xxxxx-xxxx-xxxx"
                size="small"
                name="licenseKey"
                label="Your license key"
                value={fields.licenseKey}
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Button disabled={!isFormValid} type="button" variant="contained" onClick={handleGetLicenseClick}>
              Get license
            </Button>
          </Box>
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button variant="contained" type="button">
              Save
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default License;
