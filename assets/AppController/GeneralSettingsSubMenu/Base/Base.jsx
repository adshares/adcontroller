import React, { useState } from 'react';
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
  const { fields, errorObj, onFormChange } = useForm({
    adserverName: '',
    technicalEmail: '',
    supportEmail: '',
    supportChat: '',
    supportTelegram: '',
  });

  const onSaveClick = () => {
    console.log(fields);
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Base information" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="adserverName"
            variant="outlined"
            label="Adserver's name"
            onChange={onFormChange}
            error={!!errorObj.adserverName}
            helperText={errorObj.adserverName}
            value={fields.adserverName}
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
            onChange={onFormChange}
            error={!!errorObj.technicalEmail}
            helperText={errorObj.technicalEmail}
            value={fields.technicalEmail}
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
            onChange={onFormChange}
            error={!!errorObj.supportEmail}
            helperText={errorObj.supportEmail}
            value={fields.supportEmail}
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
            onChange={onFormChange}
            error={!!errorObj.supportChat}
            helperText={errorObj.supportChat}
            value={fields.supportChat}
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
            onChange={onFormChange}
            error={!!errorObj.supportTelegram}
            helperText={errorObj.supportTelegram}
            value={fields.supportTelegram}
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
