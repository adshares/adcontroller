import React from 'react';
import { useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useSetBaseInformationMutation } from '../../../redux/config/configApi';
import { useCreateNotification, useForm } from '../../../hooks';
import { Box, Button, Card, CardActions, CardContent, CardHeader, TextField } from '@mui/material';
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
  const appData = useSelector(configSelectors.getAppData);
  const [setBaseInformation, { isLoading }] = useSetBaseInformationMutation();
  const form = useForm({
    initialFields: {
      Name: appData.AdServer.Name || '',
      TechnicalEmail: appData.General.TechnicalEmail || '',
      SupportEmail: appData.General.SupportEmail || '',
      SupportChat: appData.General.SupportChat || '',
      SupportTelegram: appData.General.SupportTelegram || '',
    },
    validation: {
      Name: ['required'],
      TechnicalEmail: ['required', 'email'],
      SupportEmail: ['required', 'email'],
      SupportChat: ['required', 'url'],
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = form.fields[field];
      }
    });
    console.log(body);

    try {
      await setBaseInformation(body).unwrap();
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Base information" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box
          component="form"
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
          onChange={form.onChange}
          onFocus={form.setTouched}
        >
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="Name"
            variant="outlined"
            label="Adserver's name"
            error={form.changedFields.Name && !form.errorObj.Name.isValid}
            helperText={form.changedFields.Name && form.errorObj.Name.helperText}
            value={form.fields.Name}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="TechnicalEmail"
            variant="outlined"
            label="Technical email"
            error={form.changedFields.TechnicalEmail && !form.errorObj.TechnicalEmail.isValid}
            helperText={form.changedFields.TechnicalEmail && form.errorObj.TechnicalEmail.helperText}
            value={form.fields.TechnicalEmail}
            type="email"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SupportEmail"
            variant="outlined"
            label="Support email"
            error={form.changedFields.SupportEmail && !form.errorObj.SupportEmail.isValid}
            helperText={form.changedFields.SupportEmail && form.errorObj.SupportEmail.helperText}
            value={form.fields.SupportEmail}
            type="email"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SupportChat"
            variant="outlined"
            label="Support chat"
            error={form.changedFields.SupportChat && !form.errorObj.SupportChat.isValid}
            helperText={form.changedFields.SupportChat && form.errorObj.SupportChat.helperText}
            value={form.fields.SupportChat}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SupportTelegram"
            variant="outlined"
            label="Support telegram"
            error={form.changedFields.SupportTelegram && !form.errorObj.SupportTelegram.isValid}
            helperText={form.changedFields.SupportTelegram && form.errorObj.SupportTelegram.helperText}
            value={form.fields.SupportTelegram}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={!form.isFormWasChanged || isLoading || !form.isFormValid}
            type="button"
            variant="contained"
            onClick={onSaveClick}
          >
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const CRMNotificationsCard = () => {
  const form = useForm({
    initialFields: {
      mailOnCampaignCreated: '',
      mailOnSiteAdded: '',
      mailOnUserRegistered: '',
    },
    validation: {
      mailOnCampaignCreated: ['email'],
      mailOnSiteAdded: ['email'],
      mailOnUserRegistered: ['email'],
    },
  });

  const onSaveClick = () => {
    console.log(form.fields);
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="CRM notifications" subheader="lorem ipsum dolor set amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
          component="form"
          onChange={form.onChange}
          onFocus={form.setTouched}
        >
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            size="small"
            label="CRM mail address on campaign created"
            name="mailOnCampaignCreated"
            error={form.touchedFields.mailOnCampaignCreated && !form.errorObj.mailOnCampaignCreated.isValid}
            helperText={form.touchedFields.mailOnCampaignCreated && form.errorObj.mailOnCampaignCreated.helperText}
            value={form.fields.mailOnCampaignCreated}
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            size="small"
            label="CRM mail address on site added"
            name="mailOnSiteAdded"
            error={form.touchedFields.mailOnSiteAdded && !form.errorObj.mailOnSiteAdded.isValid}
            helperText={form.touchedFields.mailOnSiteAdded && form.errorObj.mailOnSiteAdded.helperText}
            value={form.fields.mailOnSiteAdded}
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            size="small"
            label="CRM mail address on user registered"
            name="mailOnUserRegistered"
            error={form.touchedFields.mailOnUserRegistered && !form.errorObj.mailOnUserRegistered.isValid}
            helperText={form.touchedFields.mailOnUserRegistered && form.errorObj.mailOnUserRegistered.helperText}
            value={form.fields.mailOnUserRegistered}
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
