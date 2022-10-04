import React from 'react';
import commonStyles from '../../styles/commonStyles.scss';
import { Box, Button, Card, CardActions, CardContent, CardHeader, TextField } from '@mui/material';
import { useCreateNotification, useForm } from '../../hooks';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useSetSmtpConfigMutation } from '../../redux/config/configApi';
import { changeSmtpConfigInformation } from '../../redux/config/configSlice';

export default function SMTP() {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setSmtpConfig, { isLoading }] = useSetSmtpConfigMutation();
  const smtpForm = useForm({
    initialFields: {
      SmtpHost: appData.General.SmtpHost || '',
      SmtpPort: appData.General.SmtpPort || '',
      SmtpSender: appData.General.SmtpSender || '',
      SmtpUsername: appData.General.SmtpUsername || '',
    },
    validation: {
      SmtpHost: ['required', 'domain'],
      SmtpPort: ['required', 'integer'],
      SmtpSender: ['required'],
      SmtpUsername: ['required'],
    },
  });
  const passwordForm = useForm({ initialFields: { SmtpPassword: !!appData.General.SmtpPassword?.length ? '↹↹↹↹↹↹↹↹' : '' } });
  const { createSuccessNotification } = useCreateNotification();

  const onPasswordChange = (e) => {
    if (e.target.value.includes('↹')) {
      passwordForm.setFields((prevState) => ({ ...prevState, [e.target.name]: e.target.value.replaceAll('↹', '') }));
      return;
    }
    passwordForm.onChange(e);
  };

  const onSaveClick = async () => {
    const body = {
      ...(smtpForm.isFormWasChanged || passwordForm.isFormWasChanged
        ? { ...smtpForm.fields, ...(passwordForm.isFormWasChanged ? { ...passwordForm.fields } : {}) }
        : {}),
    };
    const response = await setSmtpConfig(body);

    if (response.data?.message === 'OK') {
      dispatch(changeSmtpConfigInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="SMTP configuration" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter} `}>
        <Box
          component="form"
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
          onChange={smtpForm.onChange}
          onFocus={smtpForm.setTouched}
        >
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SmtpHost"
            label="SMTP host"
            error={smtpForm.touchedFields.SmtpHost && !smtpForm.errorObj.SmtpHost.isValid}
            helperText={smtpForm.touchedFields.SmtpHost && smtpForm.errorObj.SmtpHost.helperText}
            value={smtpForm.fields.SmtpHost}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            error={smtpForm.touchedFields.SmtpPort && !smtpForm.errorObj.SmtpPort.isValid}
            label="SMTP port"
            helperText={smtpForm.touchedFields.SmtpPort && smtpForm.errorObj.SmtpPort.helperText}
            name="SmtpPort"
            value={smtpForm.fields.SmtpPort}
            type="number"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SmtpSender"
            label="SMTP sender"
            error={smtpForm.touchedFields.SmtpSender && !smtpForm.errorObj.SmtpSender.isValid}
            helperText={smtpForm.touchedFields.SmtpSender && smtpForm.errorObj.SmtpSender.helperText}
            value={smtpForm.fields.SmtpSender}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SmtpUsername"
            label="SMTP username"
            error={smtpForm.touchedFields.SmtpUsername && !smtpForm.errorObj.SmtpUsername.isValid}
            helperText={smtpForm.touchedFields.SmtpUsername && smtpForm.errorObj.SmtpUsername.helperText}
            value={smtpForm.fields.SmtpUsername}
            type="text"
            inputProps={{ autoComplete: 'off' }}
          />
        </Box>
        <Box
          component="form"
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
          onChange={onPasswordChange}
          onFocus={passwordForm.setTouched}
        >
          <TextField
            fullWidth
            margin="dense"
            size="small"
            name="SmtpPassword"
            label="New password"
            type="password"
            value={passwordForm.fields.SmtpPassword}
            inputProps={{ autoComplete: 'off' }}
          />
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={isLoading || ((!smtpForm.isFormWasChanged || !smtpForm.isFormValid) && !passwordForm.isFormWasChanged)}
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
}
