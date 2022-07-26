import React, { useState } from 'react';
import { Card, CardContent, CardHeader, IconButton, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import { useForm } from '../../../hooks';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import commonStyles from '../../commonStyles.scss';

function Base() {
  const { fields, errorObj, onFormChange, setFields } = useForm({
    adserverName: 'AdServer',
    contactEmail: 'contact@domain.xyz',
    supportEmail: 'support@domain.xyz',
  });

  const [editableField, setEditableField] = useState({
    adserverName: false,
    contactEmail: false,
    supportEmail: false,
  });

  const [defFields, setDefFields] = useState({
    ...fields,
  });

  const toggleEditableField = (field) => {
    setEditableField((prevState) => ({ ...prevState, [field]: !prevState[field] }));
    if (editableField[field]) {
      setFields((prevState) => ({ ...prevState, [field]: defFields[field] }));
    }
  };

  const onSaveClick = (field, value) => {
    if (value === defFields[field]) {
      setEditableField((prevState) => ({ ...prevState, [field]: !prevState[field] }));
      return;
    }
    setFields((prevState) => ({ ...prevState, [field]: value }));
    setDefFields((prevState) => ({ ...prevState, [field]: value }));
    setEditableField((prevState) => ({ ...prevState, [field]: !prevState[field] }));
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Base information" />

      <CardContent sx={{ width: '75%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell width="40%" align="left">
                AdServer name
              </TableCell>
              <TableCell width="40%" align="left">
                {editableField.adserverName ? (
                  <TextField
                    autoFocus
                    onChange={onFormChange}
                    error={!!errorObj.adserverName}
                    helperText={errorObj.adserverName}
                    size="small"
                    name="adserverName"
                    value={fields.adserverName}
                    type="text"
                    variant="standard"
                    inputProps={{ autoComplete: 'off' }}
                  />
                ) : (
                  fields.adserverName
                )}
              </TableCell>
              <TableCell width="20%" align="center">
                <IconButton type="button" onClick={() => toggleEditableField('adserverName')}>
                  {editableField.adserverName ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
                </IconButton>
                {editableField.adserverName && (
                  <IconButton onClick={() => onSaveClick('adserverName', fields.adserverName)} type="button">
                    <CheckIcon color="success" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell width="40%" align="left">
                Email to contact
              </TableCell>
              <TableCell width="40%" align="left">
                {editableField.contactEmail ? (
                  <TextField
                    autoFocus
                    onChange={onFormChange}
                    error={!!errorObj.contactEmail}
                    helperText={errorObj.contactEmail}
                    size="small"
                    name="contactEmail"
                    value={fields.contactEmail}
                    placeholder="contact@domain.xyz"
                    type="email"
                    variant="standard"
                    inputProps={{ autoComplete: 'off' }}
                  />
                ) : (
                  fields.contactEmail
                )}
              </TableCell>
              <TableCell width="20%" align="center">
                <IconButton type="button" onClick={() => toggleEditableField('contactEmail')}>
                  {editableField.contactEmail ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
                </IconButton>
                {editableField.contactEmail && (
                  <IconButton onClick={() => onSaveClick('contactEmail', fields.contactEmail)} type="button">
                    <CheckIcon color="success" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell width="40%" align="left">
                Email to support
              </TableCell>
              <TableCell width="40%" align="left">
                {editableField.supportEmail ? (
                  <TextField
                    autoFocus
                    onChange={onFormChange}
                    error={!!errorObj.supportEmail}
                    helperText={errorObj.supportEmail}
                    size="small"
                    name="supportEmail"
                    value={fields.supportEmail}
                    placeholder="support@domain.xyz"
                    type="email"
                    variant="standard"
                    inputProps={{ autoComplete: 'off' }}
                  />
                ) : (
                  fields.supportEmail
                )}
              </TableCell>
              <TableCell width="20%" align="center">
                <IconButton type="button" onClick={() => toggleEditableField('supportEmail')}>
                  {editableField.supportEmail ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
                </IconButton>
                {editableField.supportEmail && (
                  <IconButton onClick={() => onSaveClick('supportEmail', fields.supportEmail)} type="button">
                    <CheckIcon color="success" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default Base;
