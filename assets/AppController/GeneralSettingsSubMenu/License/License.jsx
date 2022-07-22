import React, { useState } from 'react';
import commonStyles from '../../commonStyles.scss';
import { Box, Button, Card, CardContent, CardHeader, Collapse, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import { useForm } from '../../../hooks';

function License() {
  const [editMode, setEditMode] = useState(false);
  const { onFormChange, validate, fields, errorObj, isFormValid } = useForm({
    licenseKey: '',
  });

  const handleGetLicenseClick = () => {
    console.log('handleGetLicenseClick');
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader
          title="License"
          subheaderTypographyProps={{ color: 'error' }}
          subheader={!editMode && 'No license. Configure an open-source license'}
        />
        <Button variant="text" type="button" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </Box>
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

      <Collapse in={!editMode} timeout="auto">
        <CardContent sx={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="left">License owner</TableCell>
                <TableCell align="left">Owner</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">License type</TableCell>
                <TableCell align="left">COM</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">License will expire</TableCell>
                <TableCell align="left">dd-mm-yyyy</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Fixed fee</TableCell>
                <TableCell align="left">0 ADS</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">Supply fee / Demand fee</TableCell>
                <TableCell align="left">1% / 1%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default License;
