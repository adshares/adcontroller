import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../hooks';
import { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces } from '../../utils/helpers';
import {
  useSetBannerSettingsConfigMutation,
  useSetCampaignSettingsConfigMutation,
  useSetSettlementOptionsConfigMutation,
} from '../../redux/config/configApi';
import { changeAdServerConfiguration } from '../../redux/config/configSlice';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';

export default function Settings() {
  return (
    <>
      <CampaignSettingsCard />
      <BannerSettingsCard sx={{ mt: 3 }} />
      <SettlementOptionsCard sx={{ mt: 3 }} />
    </>
  );
}

const CampaignSettingsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setCampaignSettingsConfig, { isLoading }] = useSetCampaignSettingsConfigMutation();
  const form = useForm({
    initialFields: {
      CampaignBoostMinBudget: clicksToAds(appData.AdServer.CampaignBoostMinBudget || 0).toString(),
      CampaignMinBudget: clicksToAds(appData.AdServer.CampaignMinBudget || 0).toString(),
      CampaignMinCpa: clicksToAds(appData.AdServer.CampaignMinCpa || 0).toString(),
      CampaignMinCpm: clicksToAds(appData.AdServer.CampaignMinCpm || 0).toString(),
    },
    validation: {
      CampaignBoostMinBudget: ['number'],
      CampaignMinBudget: ['number'],
      CampaignMinCpa: ['number'],
      CampaignMinCpm: ['number'],
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

    const response = await setCampaignSettingsConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeAdServerConfiguration(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Campaign options" subheader="Set minimum campaign spend." />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <FormControl
            fullWidth
            error={form.touchedFields.CampaignMinBudget && !form.errorObj.CampaignMinBudget.isValid}
            customvariant="highLabel"
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="CampaignMinBudget">Minimal campaign budget</InputLabel>
            <OutlinedInput
              color="secondary"
              id="CampaignMinBudget"
              name="CampaignMinBudget"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={setDecimalPlaces(form.fields.CampaignMinBudget, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinBudgetHelper">
              {form.touchedFields.CampaignMinBudget && form.errorObj.CampaignMinBudget.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl
            fullWidth
            error={form.touchedFields.CampaignBoostMinBudget && !form.errorObj.CampaignBoostMinBudget.isValid}
            customvariant="highLabel"
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="CampaignBoostMinBudget">Minimal campaign boost budget</InputLabel>
            <OutlinedInput
              color="secondary"
              id="CampaignBoostMinBudget"
              name="CampaignBoostMinBudget"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={setDecimalPlaces(form.fields.CampaignBoostMinBudget, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignBoostMinBudgetHelper">
              {form.touchedFields.CampaignBoostMinBudget && form.errorObj.CampaignBoostMinBudget.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl
            fullWidth
            error={form.touchedFields.CampaignMinCpa && !form.errorObj.CampaignMinCpa.isValid}
            customvariant="highLabel"
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="CampaignMinCpa">Minimal campaign CPA</InputLabel>
            <OutlinedInput
              color="secondary"
              id="CampaignMinCpa"
              name="CampaignMinCpa"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={setDecimalPlaces(form.fields.CampaignMinCpa, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinCpaHelper">
              {form.touchedFields.CampaignMinCpa && form.errorObj.CampaignMinCpa.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl
            fullWidth
            error={form.touchedFields.CampaignMinCpm && !form.errorObj.CampaignMinCpm.isValid}
            customvariant="highLabel"
          >
            <InputLabel htmlFor="CampaignMinCpm">Minimal campaign CPM</InputLabel>
            <OutlinedInput
              color="secondary"
              id="CampaignMinCpm"
              name="CampaignMinCpm"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              value={setDecimalPlaces(form.fields.CampaignMinCpm, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinCpmHelper">
              {form.touchedFields.CampaignMinCpm && form.errorObj.CampaignMinCpm.helperText}
            </FormHelperText>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
          Save
        </Button>
      </CardActions>
    </Card>
  );
};

const BannerSettingsCard = (props) => {
  const megabyteInBytes = 1024 * 1024;
  const appData = useSelector(configSelectors.getAppData);
  const [setBannerSettingsConfig, { isLoading }] = useSetBannerSettingsConfigMutation();
  const dispatch = useDispatch();
  const form = useForm({
    initialFields: {
      UploadLimitImage: appData.AdServer.UploadLimitImage / megabyteInBytes || 0,
      UploadLimitModel: appData.AdServer.UploadLimitModel / megabyteInBytes || 0,
      UploadLimitVideo: appData.AdServer.UploadLimitVideo / megabyteInBytes || 0,
      UploadLimitZip: appData.AdServer.UploadLimitZip / megabyteInBytes || 0,
    },
    validation: {
      UploadLimitImage: ['number'],
      UploadLimitModel: ['number'],
      UploadLimitVideo: ['number'],
      UploadLimitZip: ['number'],
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = returnNumber(form.fields[field]) * megabyteInBytes;
      }
    });

    const response = await setBannerSettingsConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeAdServerConfiguration(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Ad options" subheader="Set an ad file size limit." />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <FormControl
            sx={{ mb: 3 }}
            fullWidth
            error={form.touchedFields.UploadLimitImage && !form.errorObj.UploadLimitImage.isValid}
            customvariant={'highLabel'}
          >
            <InputLabel htmlFor="UploadLimitImage">Image file size limit</InputLabel>
            <OutlinedInput
              color="secondary"
              id="UploadLimitImage"
              name="UploadLimitImage"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              value={form.fields.UploadLimitImage}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitImage">
              {form.touchedFields.UploadLimitImage && form.errorObj.UploadLimitImage.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl
            sx={{ mb: 3 }}
            fullWidth
            error={form.touchedFields.UploadLimitVideo && !form.errorObj.UploadLimitVideo.isValid}
            customvariant={'highLabel'}
          >
            <InputLabel htmlFor="UploadLimitVideo">Video file size limit</InputLabel>
            <OutlinedInput
              color="secondary"
              id="UploadLimitVideo"
              name="UploadLimitVideo"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              value={form.fields.UploadLimitVideo}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitImage">
              {form.touchedFields.UploadLimitVideo && form.errorObj.UploadLimitVideo.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl
            sx={{ mb: 3 }}
            fullWidth
            error={form.touchedFields.UploadLimitModel && !form.errorObj.UploadLimitModel.isValid}
            customvariant={'highLabel'}
          >
            <InputLabel htmlFor="UploadLimitModel">3D model file size limit</InputLabel>
            <OutlinedInput
              color="secondary"
              id="UploadLimitModel"
              name="UploadLimitModel"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              value={form.fields.UploadLimitModel}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitImage">
              {form.touchedFields.UploadLimitModel && form.errorObj.UploadLimitModel.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl fullWidth customvariant={'highLabel'}>
            <InputLabel htmlFor="UploadLimitZip">HTML file size limit</InputLabel>
            <OutlinedInput
              color="secondary"
              id="UploadLimitZip"
              name="UploadLimitZip"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              value={form.fields.UploadLimitZip}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitZip">
              {form.touchedFields.UploadLimitZip && form.errorObj.UploadLimitZip.helperText}
            </FormHelperText>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
          Save
        </Button>
      </CardActions>
    </Card>
  );
};

const SettlementOptionsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const [setSettlementOptionsConfig, { isLoading }] = useSetSettlementOptionsConfigMutation();
  const dispatch = useDispatch();
  const { createSuccessNotification } = useCreateNotification();
  const [AdsTxtCheckDemandEnabled, setAdsTxtCheckDemandEnabled] = useState(appData.AdServer.AdsTxtCheckDemandEnabled);

  const onSaveClick = async () => {
    const body = {
      ...(appData.AdServer.AdsTxtCheckDemandEnabled === AdsTxtCheckDemandEnabled ? {} : { AdsTxtCheckDemandEnabled }),
    };

    const response = await setSettlementOptionsConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeAdServerConfiguration(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Settlement options" />

      <CardContent>
        <FormControlLabel
          sx={{ display: 'block', mt: 3, mb: 3, ml: -1.5 }}
          label="Verify ads.txt on sites"
          control={<Checkbox checked={AdsTxtCheckDemandEnabled} onChange={() => setAdsTxtCheckDemandEnabled((prevState) => !prevState)} />}
        />
      </CardContent>

      <CardActions>
        <Button
          disabled={isLoading || appData.AdServer.AdsTxtCheckDemandEnabled === AdsTxtCheckDemandEnabled}
          type="button"
          variant="contained"
          onClick={onSaveClick}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
