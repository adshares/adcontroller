import React from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, TextField } from '@mui/material';
import { useForm } from '../../../hooks';
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
  const form = useForm({
    initialFields: {
      adserverName: '',
      technicalEmail: '',
      supportEmail: '',
      supportChat: '',
      supportTelegram: '',
    },
    validation: {
      technicalEmail: ['email'],
      supportEmail: ['email'],
      supportChat: ['domain'],
    },
  });

  const onSaveClick = () => {
    console.log(form.fields);
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
            name="adserverName"
            variant="outlined"
            label="Adserver's name"
            error={form.touchedFields.adserverName && !form.errorObj.adserverName.isValid}
            helperText={form.touchedFields.adserverName && form.errorObj.adserverName.helperText}
            value={form.fields.adserverName}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="technicalEmail"
            variant="outlined"
            label="Technicals email"
            error={form.touchedFields.technicalEmail && !form.errorObj.technicalEmail.isValid}
            helperText={form.touchedFields.technicalEmail && form.errorObj.technicalEmail.helperText}
            value={form.fields.technicalEmail}
            type="email"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="supportEmail"
            variant="outlined"
            label="Support email"
            error={form.touchedFields.supportEmail && !form.errorObj.supportEmail.isValid}
            helperText={form.touchedFields.supportEmail && form.errorObj.supportEmail.helperText}
            value={form.fields.supportEmail}
            type="email"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="supportChat"
            variant="outlined"
            label="Support chat"
            error={form.touchedFields.supportChat && !form.errorObj.supportChat.isValid}
            helperText={form.touchedFields.supportChat && form.errorObj.supportChat.helperText}
            value={form.fields.supportChat}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="supportTelegram"
            variant="outlined"
            label="Support telegram"
            error={form.touchedFields.supportTelegram && !form.errorObj.supportTelegram.isValid}
            helperText={form.touchedFields.supportTelegram && form.errorObj.supportTelegram.helperText}
            value={form.fields.supportTelegram}
            type="text"
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
