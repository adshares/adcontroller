import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useSetBaseInformationMutation, useSetCrmNotificationsConfigMutation } from '../../redux/config/configApi';
import { changeBaseInformation, changeCrmNotificationsInformation } from '../../redux/config/configSlice';
import { useCreateNotification, useForm } from '../../hooks';
import { Box, Button, Card, CardActions, CardContent, CardHeader, TextField } from '@mui/material';

export default function Base() {
  return (
    <>
      <BaseInformationCard />
      <CRMNotificationsCard sx={{ mt: 3 }} />
    </>
  );
}

const BaseInformationCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setBaseInformation, { isLoading }] = useSetBaseInformationMutation();
  const form = useForm({
    initialFields: {
      Name: appData.AdServer.Name || '',
      LandingUrl: appData.AdServer.LandingUrl || '',
      TechnicalEmail: appData.General.TechnicalEmail || '',
      SupportEmail: appData.General.SupportEmail || '',
      SupportChat: appData.General.SupportChat || '',
      SupportTelegram: appData.General.SupportTelegram || '',
    },
    validation: {
      Name: ['required'],
      LandingUrl: ['required', 'url'],
      TechnicalEmail: ['required', 'email'],
      SupportEmail: ['required', 'email'],
      SupportChat: ['url'],
    },
  });
  const { createSuccessNotification } = useCreateNotification();
  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = form.fields[field] || null;
      }
    });

    const response = await setBaseInformation(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeBaseInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Base information" />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            name="Name"
            variant="outlined"
            color="secondary"
            label="Adserver's name"
            error={form.changedFields.Name && !form.errorObj.Name.isValid}
            helperText={form.changedFields.Name && form.errorObj.Name.helperText}
            value={form.fields.Name}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            name="LandingUrl"
            variant="outlined"
            color="secondary"
            label="Landing page URL"
            error={form.changedFields.LandingUrl && !form.errorObj.LandingUrl.isValid}
            helperText={form.changedFields.LandingUrl && form.errorObj.LandingUrl.helperText}
            value={form.fields.LandingUrl}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            name="TechnicalEmail"
            color="secondary"
            variant="outlined"
            label="Technical email"
            error={form.changedFields.TechnicalEmail && !form.errorObj.TechnicalEmail.isValid}
            helperText={form.changedFields.TechnicalEmail && form.errorObj.TechnicalEmail.helperText}
            value={form.fields.TechnicalEmail}
            type="email"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            name="SupportEmail"
            color="secondary"
            variant="outlined"
            label="Support email"
            error={form.changedFields.SupportEmail && !form.errorObj.SupportEmail.isValid}
            helperText={form.changedFields.SupportEmail && form.errorObj.SupportEmail.helperText}
            value={form.fields.SupportEmail}
            type="email"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            name="SupportChat"
            color="secondary"
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
            customvariant="highLabel"
            name="SupportTelegram"
            color="secondary"
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
        <Button disabled={!form.isFormWasChanged || isLoading || !form.isFormValid} type="button" variant="contained" onClick={onSaveClick}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
};

const CRMNotificationsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const form = useForm({
    initialFields: {
      CrmMailAddressOnCampaignCreated: appData.AdServer.CrmMailAddressOnCampaignCreated || '',
      CrmMailAddressOnSiteAdded: appData.AdServer.CrmMailAddressOnSiteAdded || '',
      CrmMailAddressOnUserRegistered: appData.AdServer.CrmMailAddressOnUserRegistered || '',
    },
    validation: {
      CrmMailAddressOnCampaignCreated: ['email'],
      CrmMailAddressOnSiteAdded: ['email'],
      CrmMailAddressOnUserRegistered: ['email'],
    },
  });
  const [setCrmNotificationsConfig, { isLoading }] = useSetCrmNotificationsConfigMutation();
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = form.fields[field] || null;
      }
    });

    const response = await setCrmNotificationsConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeCrmNotificationsInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader
        title="CRM notifications"
        subheader="Set up email addresses for sending notifications. The message will be sent each time the event occurs."
      />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            color="secondary"
            variant="outlined"
            label="Email address on campaign created"
            name="CrmMailAddressOnCampaignCreated"
            error={form.changedFields.CrmMailAddressOnCampaignCreated && !form.errorObj.CrmMailAddressOnCampaignCreated.isValid}
            helperText={form.changedFields.CrmMailAddressOnCampaignCreated && form.errorObj.CrmMailAddressOnCampaignCreated.helperText}
            value={form.fields.CrmMailAddressOnCampaignCreated}
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            customvariant="highLabel"
            color="secondary"
            variant="outlined"
            label="Email address on site added"
            name="CrmMailAddressOnSiteAdded"
            error={form.changedFields.CrmMailAddressOnSiteAdded && !form.errorObj.CrmMailAddressOnSiteAdded.isValid}
            helperText={form.changedFields.CrmMailAddressOnSiteAdded && form.errorObj.CrmMailAddressOnSiteAdded.helperText}
            value={form.fields.CrmMailAddressOnSiteAdded}
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            customvariant="highLabel"
            color="secondary"
            variant="outlined"
            label="Email address on user registered"
            name="CrmMailAddressOnUserRegistered"
            error={form.changedFields.CrmMailAddressOnUserRegistered && !form.errorObj.CrmMailAddressOnUserRegistered.isValid}
            helperText={form.changedFields.CrmMailAddressOnUserRegistered && form.errorObj.CrmMailAddressOnUserRegistered.helperText}
            value={form.fields.CrmMailAddressOnUserRegistered}
            inputProps={{ autoComplete: 'off' }}
          />
        </Box>
      </CardContent>

      <CardActions>
        <Button disabled={!form.isFormWasChanged || isLoading || !form.isFormValid} type="button" variant="contained" onClick={onSaveClick}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
