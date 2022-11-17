import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../hooks';
import { useSetAutoWithdrawalConfigMutation, useSetRegistrationModeConfigMutation } from '../../redux/config/configApi';
import { changeAutoWithdrawalConfigInformation, changeRegistrationModeInformation } from '../../redux/config/configSlice';
import { adsToClicks, clicksToAds, compareArrays, returnNumber, setDecimalPlaces } from '../../utils/helpers';
import {
  Alert,
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
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import FormControlLabelWithTooltip from '../../Components/FormControlLabelWithTooltip/FormControlLabelWithTooltip';

export default function Settings() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <RegistrationModeCard />
      </Grid>
      <Grid item xs={6}>
        <AutoWithdrawalCard />
      </Grid>
    </Grid>
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
  const [DefaultUserRoles, setDefaultUserRoles] = useState(appData.AdServer.DefaultUserRoles || []);
  const form = useForm({
    initialFields: {
      AdvertiserApplyFormUrl: appData.AdServer.AdvertiserApplyFormUrl || '',
      PublisherApplyFormUrl: appData.AdServer.PublisherApplyFormUrl || '',
    },
    validation: {
      AdvertiserApplyFormUrl: ['url'],
      PublisherApplyFormUrl: ['url'],
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  const handleSelectChange = (event) => {
    setRegistrationMode(event.target.value);
  };

  const handleRolesChange = (e) => {
    setDefaultUserRoles(() => {
      if (e.target.value === 'advertiser') {
        return ['advertiser'];
      }
      if (e.target.value === 'publisher') {
        return ['publisher'];
      }
      if (e.target.value === 'both') {
        return ['advertiser', 'publisher'];
      }
    });
  };

  const onSaveClick = async () => {
    if (RegistrationMode === 'private') {
      setEmailVerificationRequired(false);
      setAutoRegistrationEnabled(false);
      setAutoConfirmationEnabled(false);
    }
    const body = {
      DefaultUserRoles: DefaultUserRoles.length ? DefaultUserRoles : null,
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
        AdvertiserApplyFormUrl: form.fields.AdvertiserApplyFormUrl || null,
        PublisherApplyFormUrl: form.fields.PublisherApplyFormUrl || null,
      }),
      ...(RegistrationMode === 'private' && {
        RegistrationMode,
        EmailVerificationRequired: false,
        AutoConfirmationEnabled: false,
        AutoRegistrationEnabled: false,
      }),
    };

    const response = await setRegistrationModeConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeRegistrationModeInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card>
      <CardHeader
        title="Registration mode"
        subheader="Set whether registration is to be available to the public, by invitation or only by a moderator."
      />
      <CardContent>
        <FormControl fullWidth>
          <FormLabel focused={false} sx={{ whiteSpace: 'nowrap' }}>
            Default user's role:
          </FormLabel>
          <RadioGroup row value={RegistrationMode} onChange={handleSelectChange}>
            <FormControlLabelWithTooltip value="public" control={<Radio />} label="Public" tooltip="Anyone can register." />
            <FormControlLabelWithTooltip
              value="restricted"
              control={<Radio />}
              label="Restricted"
              tooltip="Registration requires an invitation link."
            />
            <FormControlLabelWithTooltip
              value="private"
              control={<Radio />}
              label="Private"
              tooltip="Only the moderator can add new users."
            />
          </RadioGroup>
        </FormControl>
        <Collapse in={RegistrationMode === 'restricted'} timeout="auto">
          <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
            <TextField
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              fullWidth
              variant="outlined"
              margin="dense"
              label="Advertiser apply form URL"
              name="AdvertiserApplyFormUrl"
              error={form.touchedFields.AdvertiserApplyFormUrl && !form.errorObj.AdvertiserApplyFormUrl.isValid}
              helperText={form.touchedFields.AdvertiserApplyFormUrl && form.errorObj.AdvertiserApplyFormUrl.helperText}
              value={form.fields.AdvertiserApplyFormUrl}
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              sx={{ mb: 3 }}
              color="secondary"
              customvariant="highLabel"
              fullWidth
              variant="outlined"
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

        <Collapse in={RegistrationMode !== 'private'} timeout="auto" sx={{ mt: 2 }}>
          <FormControl>
            <FormControlLabel
              label="E-mail verification required"
              control={
                <Checkbox checked={EmailVerificationRequired} onChange={() => setEmailVerificationRequired((prevState) => !prevState)} />
              }
            />
          </FormControl>
          <FormControl margin="none">
            <FormControlLabelWithTooltip
              control={
                <Checkbox checked={AutoConfirmationEnabled} onChange={() => setAutoConfirmationEnabled((prevState) => !prevState)} />
              }
              label="Auto account confirmation"
              tooltip="Accounts will not require confirmation by a moderator."
            />
          </FormControl>
          <FormControl margin="none">
            <FormControlLabelWithTooltip
              control={
                <Checkbox checked={AutoRegistrationEnabled} onChange={() => setAutoRegistrationEnabled((prevState) => !prevState)} />
              }
              label="Auto registration allowed"
              tooltip="Accounts will be set up the first time the banner is displayed, without prior registration."
            />
          </FormControl>
        </Collapse>

        <Collapse in={RegistrationMode !== 'private'} timeout="auto" sx={{ mt: 2 }}>
          <FormControl>
            <FormLabel focused={false} sx={{ whiteSpace: 'nowrap' }}>
              Default user's role:
            </FormLabel>
            <RadioGroup
              row
              value={(() => {
                if (DefaultUserRoles.length === 2) {
                  return 'both';
                }
                return DefaultUserRoles[0];
              })()}
              onChange={handleRolesChange}
            >
              <FormControlLabel value="advertiser" control={<Radio />} label="Advertiser" />
              <FormControlLabel value="publisher" control={<Radio />} label="Publisher" />
              <FormControlLabel value="both" control={<Radio />} label="Advertiser & Publisher" />
            </RadioGroup>
          </FormControl>
        </Collapse>

        <Collapse in={RegistrationMode !== 'private' && AutoRegistrationEnabled && !DefaultUserRoles.includes('publisher')} timeout="auto">
          <Alert severity="warning">Automatic registration requires the publisher role.</Alert>
        </Collapse>
      </CardContent>

      <CardActions>
        <Button
          disabled={
            isLoading ||
            (appData.AdServer.RegistrationMode === RegistrationMode &&
              appData.AdServer.EmailVerificationRequired === EmailVerificationRequired &&
              appData.AdServer.AutoConfirmationEnabled === AutoConfirmationEnabled &&
              appData.AdServer.AutoRegistrationEnabled === AutoRegistrationEnabled &&
              compareArrays(appData.AdServer.DefaultUserRoles, DefaultUserRoles) &&
              (RegistrationMode === 'restricted' ? !form.isFormValid || !form.isFormWasChanged : true))
          }
          onClick={onSaveClick}
          variant="contained"
          type="button"
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );
};

const AutoWithdrawalCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setAutoWithdrawalConfig, { isLoading }] = useSetAutoWithdrawalConfigMutation();
  const form = useForm({
    initialFields: {
      AutoWithdrawalLimitAds: clicksToAds(appData.AdServer.AutoWithdrawalLimitAds || 0).toString(),
      AutoWithdrawalLimitBsc: clicksToAds(appData.AdServer.AutoWithdrawalLimitBsc || 0).toString(),
    },
    validation: {
      AutoWithdrawalLimitAds: ['number'],
      AutoWithdrawalLimitBsc: ['number'],
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = adsToClicks(returnNumber(form.fields[field]));
      }
    });

    const response = await setAutoWithdrawalConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeAutoWithdrawalConfigInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card>
      <CardHeader title="Auto withdrawal" subheader="Set minimum thresholds for automatic withdrawals." />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <FormControl
            fullWidth
            error={form.touchedFields.AutoWithdrawalLimitAds && !form.errorObj.AutoWithdrawalLimitAds.isValid}
            customvariant="highLabel"
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="AutoWithdrawalLimitAds">ADS minimum withdrawal</InputLabel>
            <OutlinedInput
              color="secondary"
              id="AutoWithdrawalLimitAds"
              name="AutoWithdrawalLimitAds"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={setDecimalPlaces(form.fields.AutoWithdrawalLimitAds, 4)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinBudget">
              {form.touchedFields.AutoWithdrawalLimitAds && form.errorObj.AutoWithdrawalLimitAds.helperText}
            </FormHelperText>
          </FormControl>
          <FormControl
            fullWidth
            error={form.touchedFields.AutoWithdrawalLimitBsc && !form.errorObj.AutoWithdrawalLimitBsc.isValid}
            customvariant="highLabel"
          >
            <InputLabel htmlFor="AutoWithdrawalLimitBsc">BSC minimum withdrawal</InputLabel>
            <OutlinedInput
              color="secondary"
              id="AutoWithdrawalLimitBsc"
              name="AutoWithdrawalLimitBsc"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={setDecimalPlaces(form.fields.AutoWithdrawalLimitBsc, 4)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinBudget">
              {form.touchedFields.AutoWithdrawalLimitBsc && form.errorObj.AutoWithdrawalLimitBsc.helperText}
            </FormHelperText>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Button disabled={isLoading || !form.isFormWasChanged || !form.isFormValid} onClick={onSaveClick} variant="contained" type="button">
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
