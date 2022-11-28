import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../hooks';
import { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces } from '../../utils/helpers';
import {
  useSetBannerSettingsConfigMutation,
  useSetCampaignSettingsConfigMutation,
  useSetRejectedDomainsSettingsConfigMutation,
} from '../../redux/config/configApi';
import {
  changeBannerSettingsInformation,
  changeCampaignSettingsInformation,
  changeRejectedDomainsInformation,
} from '../../redux/config/configSlice';
import ListOfInputs from '../../Components/ListOfInputs/ListOfInputs';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
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
      <RejectedDomainsCard sx={{ mt: 3 }} />
    </>
  );
}

const CampaignSettingsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setCampaignSettingsConfig, { isLoading }] = useSetCampaignSettingsConfigMutation();
  const form = useForm({
    initialFields: {
      CampaignMinBudget: clicksToAds(appData.AdServer.CampaignMinBudget || 0).toString(),
      CampaignMinCpa: clicksToAds(appData.AdServer.CampaignMinCpa || 0).toString(),
      CampaignMinCpm: clicksToAds(appData.AdServer.CampaignMinCpm || 0).toString(),
    },
    validation: {
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
      dispatch(changeCampaignSettingsInformation(response.data.data));
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
            <FormHelperText id="CampaignMinBudget">
              {form.touchedFields.CampaignMinBudget && form.errorObj.CampaignMinBudget.helperText}
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
            <FormHelperText id="CampaignMinCpa">
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
            <FormHelperText id="CampaignMinCpm">
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
      dispatch(changeBannerSettingsInformation(response.data.data));
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

const RejectedDomainsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRejectedDomainsSettings, { isLoading }] = useSetRejectedDomainsSettingsConfigMutation();
  const { createSuccessNotification } = useCreateNotification();

  const [RejectedDomains, setRejectedDomains] = useState([]);
  const [isListValid, setListValid] = useState(true);
  const [isListWasChanged, setListWasChanged] = useState(false);

  const onSaveClick = async () => {
    const body = {
      ...(isListWasChanged ? { RejectedDomains: RejectedDomains } : {}),
    };

    const response = await setRejectedDomainsSettings(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeRejectedDomainsInformation(response.data.data));
      createSuccessNotification();
    }
  };

  const fieldsHandler = (event) => {
    const { isValuesValid, isListWasChanged, list } = event;
    setRejectedDomains(list);
    setListValid(list.length > 0 ? isValuesValid : true);
    setListWasChanged(isListWasChanged);
  };

  return (
    <Card {...props}>
      <CardHeader
        title="Rejected domains"
        subheader="Set domains on which campaigns will not be displayed. All subdomains will be rejected."
      />
      <CardContent>
        <ListOfInputs
          initialList={appData.AdServer.RejectedDomains}
          fieldsHandler={fieldsHandler}
          listName="RejectedDomains"
          type="domain"
        />
      </CardContent>
      <CardActions>
        <Button disabled={isLoading || !isListWasChanged || !isListValid} type="button" variant="contained" onClick={onSaveClick}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
