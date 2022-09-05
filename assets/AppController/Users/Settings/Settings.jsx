import React, { useState } from 'react';
import commonStyles from '../../common/commonStyles.scss';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../../hooks';
import { useSetRegistrationModeConfigMutation } from '../../../redux/config/configApi';
import { changeRegistrationModeInformation } from '../../../redux/config/configSlice';

export default function Settings() {
  return (
    <>
      <RegistrationModeCard />
      <AutoWithdrawalCard />
      <PrivacyCard />
      <TermAndConditionCard />
    </>
  );
}

const RegistrationModeCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRegistrationModeConfig, { isLoading }] = useSetRegistrationModeConfigMutation();
  const [RegistrationMode, setRegistrationMode] = useState(appData.AdServer.RegistrationMode || 'public');
  const [EmailVerificationRequired, setEmailVerificationRequired] = useState(
    RegistrationMode === 'private' ? false : appData.AdServer.EmailVerificationRequired || false,
  );
  const [AutoConfirmationEnabled, setAutoConfirmationEnabled] = useState(
    RegistrationMode === 'private' ? false : appData.AdServer.AutoConfirmationEnabled || false,
  );
  const [AutoRegistrationEnabled, setAutoRegistrationEnabled] = useState(
    RegistrationMode === 'private' ? false : appData.AdServer.AutoRegistrationEnabled || false,
  );
  const form = useForm({
    initialFields: {
      AdvertiserApplyFormUrl: '',
      PublisherApplyFormUrl: '',
    },
    validation: {
      AdvertiserApplyFormUrl: ['url'],
      PublisherApplyFormUrl: ['url'],
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const handleSelectChange = (event) => {
    setRegistrationMode(event.target.value);
  };

  const onSaveClick = async () => {
    if (RegistrationMode === 'private') {
      setEmailVerificationRequired(false);
      setAutoRegistrationEnabled(false);
      setAutoConfirmationEnabled(false);
    }
    const body = {
      ...(RegistrationMode === 'public' && {
        RegistrationMode,
        EmailVerificationRequired,
        AutoConfirmationEnabled,
        AutoRegistrationEnabled,
      }),
      ...(RegistrationMode === 'restricted' && {
        RegistrationMode,
        EmailVerificationRequired,
        AutoConfirmationEnabled,
        AutoRegistrationEnabled,
        AdvertiserApplyFormUrl: form.fields.AdvertiserApplyFormUrl,
        PublisherApplyFormUrl: form.fields.PublisherApplyFormUrl,
      }),
      ...(RegistrationMode === 'private' && {
        RegistrationMode,
        EmailVerificationRequired: false,
        AutoConfirmationEnabled: false,
        AutoRegistrationEnabled: false,
      }),
    };

    try {
      const response = await setRegistrationModeConfig(body).unwrap();
      dispatch(changeRegistrationModeInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Registration mode" subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit." />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={commonStyles.halfCard}>
          <FormControl fullWidth>
            <InputLabel id="registrationModeLabel">Set registration mode</InputLabel>
            <Select
              size="small"
              labelId="registrationModeLabel"
              id="registrationMode"
              value={RegistrationMode}
              label="Set registration mode"
              onChange={handleSelectChange}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          <Collapse in={RegistrationMode === 'restricted'} timeout="auto">
            <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                margin="dense"
                label="Advertiser apply form URL"
                name="AdvertiserApplyFormUrl"
                error={form.touchedFields.AdvertiserApplyFormUrl && !form.errorObj.AdvertiserApplyFormUrl.isValid}
                helperText={form.touchedFields.AdvertiserApplyFormUrl && form.errorObj.AdvertiserApplyFormUrl.helperText}
                value={form.fields.AdvertiserApplyFormUrl}
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                margin="dense"
                label="Publisher apply form URL"
                name="PublisherApplyFormUrl"
                error={form.touchedFields.PublisherApplyFormUrl && !form.errorObj.PublisherApplyFormUrl.isValid}
                helperText={form.touchedFields.PublisherApplyFormUrl && form.errorObj.PublisherApplyFormUrl.helperText}
                value={form.fields.PublisherApplyFormUrl}
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
          </Collapse>

          <Collapse in={RegistrationMode !== 'private'} timeout="auto">
            <FormControl>
              <FormControlLabel
                label="E-mail verification required"
                control={
                  <Checkbox checked={EmailVerificationRequired} onChange={() => setEmailVerificationRequired((prevState) => !prevState)} />
                }
              />
              <FormControlLabel
                label="Auto account confirmation"
                control={
                  <Checkbox checked={AutoConfirmationEnabled} onChange={() => setAutoConfirmationEnabled((prevState) => !prevState)} />
                }
              />
              <FormControlLabel
                label="Auto registration allowed"
                control={
                  <Checkbox checked={AutoRegistrationEnabled} onChange={() => setAutoRegistrationEnabled((prevState) => !prevState)} />
                }
              />
            </FormControl>
          </Collapse>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={
              isLoading ||
              (appData.AdServer.RegistrationMode === RegistrationMode &&
                appData.AdServer.EmailVerificationRequired === EmailVerificationRequired &&
                appData.AdServer.AutoConfirmationEnabled === AutoConfirmationEnabled &&
                appData.AdServer.AutoRegistrationEnabled === AutoRegistrationEnabled)
            }
            onClick={onSaveClick}
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const AutoWithdrawalCard = () => {
  const [adsWithdrawal, setAdsWithdrawal] = useState(0);
  const [bscWithdrawal, setBscWithdrawal] = useState(0);
  const onSaveClick = () => {
    console.log({ adsWithdrawal: Number(adsWithdrawal), bscWithdrawal: Number(bscWithdrawal) });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Auto withdrawal" subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit." />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <FormControl margin="dense">
            <InputLabel htmlFor="adsWithdrawal">ADS minimum withdrawal</InputLabel>
            <OutlinedInput
              id="adsWithdrawal"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="ADS minimum withdrawal"
              value={Number(adsWithdrawal).toString()}
              onChange={(e) => setAdsWithdrawal(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
          <FormControl margin="dense">
            <InputLabel htmlFor="bscWithdrawal">BSC minimum withdrawal</InputLabel>
            <OutlinedInput
              id="bscWithdrawal"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="BSC minimum withdrawal"
              value={Number(bscWithdrawal).toString()}
              onChange={(e) => setBscWithdrawal(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const PrivacyCard = () => {
  const [privacyTextField, setPrivacyTextField] = useState('');

  const onSaveClick = () => {
    console.log(privacyTextField);
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Privacy" subheader="Here you can read and edit your privacy settings" />
      <CardContent>
        <TextField
          value={privacyTextField}
          onChange={(e) => setPrivacyTextField(e.target.value)}
          fullWidth
          multiline
          rows={8}
          label="Privacy"
        />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const TermAndConditionCard = () => {
  const [termsAndConditionTextField, setTermsAndConditionTextField] = useState('');

  const onSaveClick = () => {
    console.log(termsAndConditionTextField);
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Terms and conditions" subheader="Here you can read and edit your terms and conditions" />
      <CardContent>
        <TextField
          value={termsAndConditionTextField}
          onChange={(e) => setTermsAndConditionTextField(e.target.value)}
          fullWidth
          multiline
          rows={8}
          label="Terms and conditions"
        />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
