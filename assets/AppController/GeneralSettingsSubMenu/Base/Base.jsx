import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import { useForm } from '../../../hooks';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import commonStyles from '../../common/commonStyles.scss';

export default function Base() {
  return (
    <>
      <BaseInformationCard />
      <CRMNotificationsCard />
    </>
  );
}

const BaseInformationCard = () => {
  const { fields, errorObj, onFormChange, setFields } = useForm({
    adserverName: '',
    technicalEmail: '',
    supportEmail: '',
    supportChat: '',
    supportTelegram: '',
  });

  const [editableField, setEditableField] = useState({
    adserverName: false,
    technicalEmail: false,
    supportEmail: false,
    supportChat: false,
    supportTelegram: false,
  });

  const [defFields, setDefFields] = useState({
    ...fields,
  });

  //TODO: Add service to read write and change base values
  useEffect(() => {
    setFields({
      adserverName: 'Adserver',
      technicalEmail: 'tech@domain.xyz',
      supportEmail: 'office@adshares.net',
      supportChat: 'https://t.me/adshares',
      supportTelegram: 'AdsharesNet',
    });
    setDefFields({
      adserverName: 'Adserver',
      technicalEmail: 'tech@domain.xyz',
      supportEmail: 'office@adshares.net',
      supportChat: 'https://t.me/adshares',
      supportTelegram: 'AdsharesNet',
    });
  }, []);

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
                Adserver's name
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
                Adserver's operator email
              </TableCell>
              <TableCell width="40%" align="left">
                {editableField.technicalEmail ? (
                  <TextField
                    autoFocus
                    onChange={onFormChange}
                    error={!!errorObj.technicalEmail}
                    helperText={errorObj.technicalEmail}
                    size="small"
                    name="technicalEmail"
                    value={fields.technicalEmail}
                    placeholder="tech@domain.xyz"
                    type="email"
                    variant="standard"
                    inputProps={{ autoComplete: 'off' }}
                  />
                ) : (
                  fields.technicalEmail
                )}
              </TableCell>
              <TableCell width="20%" align="center">
                <IconButton type="button" onClick={() => toggleEditableField('technicalEmail')}>
                  {editableField.technicalEmail ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
                </IconButton>
                {editableField.technicalEmail && (
                  <IconButton onClick={() => onSaveClick('technicalEmail', fields.technicalEmail)} type="button">
                    <CheckIcon color="success" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell width="40%" align="left">
                Support email
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

            <TableRow>
              <TableCell width="40%" align="left">
                Support chat
              </TableCell>
              <TableCell width="40%" align="left">
                {editableField.supportChat ? (
                  <TextField
                    autoFocus
                    onChange={onFormChange}
                    error={!!errorObj.supportChat}
                    helperText={errorObj.supportChat}
                    size="small"
                    name="supportChat"
                    value={fields.supportChat}
                    type="text"
                    variant="standard"
                    inputProps={{ autoComplete: 'off' }}
                  />
                ) : (
                  fields.supportChat
                )}
              </TableCell>
              <TableCell width="20%" align="center">
                <IconButton type="button" onClick={() => toggleEditableField('supportChat')}>
                  {editableField.supportChat ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
                </IconButton>
                {editableField.supportChat && (
                  <IconButton onClick={() => onSaveClick('supportChat', fields.supportChat)} type="button">
                    <CheckIcon color="success" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell width="40%" align="left">
                Support telegram
              </TableCell>
              <TableCell width="40%" align="left">
                {editableField.supportTelegram ? (
                  <TextField
                    autoFocus
                    onChange={onFormChange}
                    error={!!errorObj.supportTelegram}
                    helperText={errorObj.supportTelegram}
                    size="small"
                    name="supportTelegram"
                    value={fields.supportTelegram}
                    type="text"
                    variant="standard"
                    inputProps={{ autoComplete: 'off' }}
                  />
                ) : (
                  fields.supportTelegram
                )}
              </TableCell>
              <TableCell width="20%" align="center">
                <IconButton type="button" onClick={() => toggleEditableField('supportTelegram')}>
                  {editableField.supportTelegram ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
                </IconButton>
                {editableField.supportTelegram && (
                  <IconButton onClick={() => onSaveClick('supportTelegram', fields.supportTelegram)} type="button">
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
};

const CRMNotificationsCard = () => {
  /*
    public const CRM_MAIL_ADDRESS_ON_CAMPAIGN_CREATED = 'crm-mail-address-on-campaign-created';
    public const CRM_MAIL_ADDRESS_ON_SITE_ADDED = 'crm-mail-address-on-site-added';
    public const CRM_MAIL_ADDRESS_ON_USER_REGISTERED = 'crm-mail-address-on-user-registered';
  */
  const [mailOnCampaignCreated, setMailOnCampaignCreated] = useState('');
  const [mailOnSiteAdded, setMailOnSiteAdded] = useState('');
  const [mailOnUserRegistered, setMailOnUserRegistered] = useState('');

  const onSaveClick = () => {
    console.log({
      mailOnCampaignCreated,
      mailOnSiteAdded,
      mailOnUserRegistered,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="CRM notifications" subheader="lorem ipsum dolor set amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            size="small"
            type="email"
            label="CRM mail address on campaign created"
            value={mailOnCampaignCreated}
            onChange={(e) => setMailOnCampaignCreated(e.target.value)}
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            size="small"
            type="email"
            label="CRM mail address on site added"
            value={mailOnSiteAdded}
            onChange={(e) => setMailOnSiteAdded(e.target.value)}
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            size="small"
            type="email"
            label="CRM mail address on user registered"
            value={mailOnUserRegistered}
            onChange={(e) => setMailOnUserRegistered(e.target.value)}
            inputProps={{ autoComplete: 'off' }}
          />
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
