import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../../hooks';
import { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces } from '../../../utils/helpers';
import {
  useSetBannerSettingsConfigMutation,
  useSetCampaignSettingsConfigMutation,
  useSetRejectedDomainsSettingsConfigMutation,
} from '../../../redux/config/configApi';
import {
  changeBannerSettingsInformation,
  changeCampaignSettingsInformation,
  changeRejectedDomainsInformation,
} from '../../../redux/config/configSlice';
import ListOfInputs from '../../common/ListOfInputs/ListOfInputs';
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
import commonStyles from '../../common/commonStyles.scss';

export default function Demand() {
  return (
    <>
      <CampaignSettingsCard />
      <BannerSettingsCard />
      <RejectedDomainsCard />
    </>
  );
}

const CampaignSettingsCard = () => {
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
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = adsToClicks(returnNumber(form.fields[field]));
      }
    });

    try {
      const response = await setCampaignSettingsConfig(body).unwrap();
      dispatch(changeCampaignSettingsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Campaign settings" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box
          component="form"
          onChange={form.onChange}
          onFocus={form.setTouched}
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
        >
          <FormControl error={form.touchedFields.CampaignMinBudget && !form.errorObj.CampaignMinBudget.isValid} margin="dense">
            <InputLabel htmlFor="CampaignMinBudget">Minimal campaign budget</InputLabel>
            <OutlinedInput
              id="CampaignMinBudget"
              name="CampaignMinBudget"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Minimal campaign budget"
              value={setDecimalPlaces(form.fields.CampaignMinBudget, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinBudget">
              {form.touchedFields.CampaignMinBudget && form.errorObj.CampaignMinBudget.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl error={form.touchedFields.CampaignMinCpa && !form.errorObj.CampaignMinCpa.isValid} margin="dense">
            <InputLabel htmlFor="CampaignMinCpa">Minimal campaign CPA</InputLabel>
            <OutlinedInput
              id="CampaignMinCpa"
              name="CampaignMinCpa"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Minimal campaign CPA"
              value={setDecimalPlaces(form.fields.CampaignMinCpa, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinCpa">
              {form.touchedFields.CampaignMinCpa && form.errorObj.CampaignMinCpa.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl error={form.touchedFields.CampaignMinCpm && !form.errorObj.CampaignMinCpm.isValid} margin="dense">
            <InputLabel htmlFor="CampaignMinCpm">Minimal campaign CPM</InputLabel>
            <OutlinedInput
              id="CampaignMinCpm"
              name="CampaignMinCpm"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Minimal campaign CPM"
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
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const BannerSettingsCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const [setBannerSettingsConfig, { isLoading }] = useSetBannerSettingsConfigMutation();
  const dispatch = useDispatch();
  const form = useForm({
    initialFields: {
      UploadLimitImage: appData.AdServer.UploadLimitImage / 1024 || 0,
      UploadLimitModel: appData.AdServer.UploadLimitModel / 1024 || 0,
      UploadLimitVideo: appData.AdServer.UploadLimitVideo / 1024 || 0,
      UploadLimitZip: appData.AdServer.UploadLimitZip / 1024 || 0,
    },
    validation: {
      UploadLimitImage: ['number'],
      UploadLimitModel: ['number'],
      UploadLimitVideo: ['number'],
      UploadLimitZip: ['number'],
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = returnNumber(form.fields[field]) * 1024;
      }
    });

    try {
      const response = await setBannerSettingsConfig(body).unwrap();
      dispatch(changeBannerSettingsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Banner settings" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box
          component="form"
          onChange={form.onChange}
          onFocus={form.setTouched}
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
        >
          <FormControl error={form.touchedFields.UploadLimitImage && !form.errorObj.UploadLimitImage.isValid} margin="dense">
            <InputLabel htmlFor="UploadLimitImage">Image size limit</InputLabel>
            <OutlinedInput
              id="UploadLimitImage"
              name="UploadLimitImage"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Image size limit"
              value={form.fields.UploadLimitImage}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitImage">
              {form.touchedFields.UploadLimitImage && form.errorObj.UploadLimitImage.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl error={form.touchedFields.UploadLimitVideo && !form.errorObj.UploadLimitVideo.isValid} margin="dense">
            <InputLabel htmlFor="UploadLimitVideo">Video size limit</InputLabel>
            <OutlinedInput
              id="UploadLimitVideo"
              name="UploadLimitVideo"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Video size limit"
              value={form.fields.UploadLimitVideo}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitImage">
              {form.touchedFields.UploadLimitVideo && form.errorObj.UploadLimitVideo.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl error={form.touchedFields.UploadLimitModel && !form.errorObj.UploadLimitModel.isValid} margin="dense">
            <InputLabel htmlFor="UploadLimitModel">Upload model limit</InputLabel>
            <OutlinedInput
              id="UploadLimitModel"
              name="UploadLimitModel"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Upload model limit"
              value={form.fields.UploadLimitModel}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="UploadLimitImage">
              {form.touchedFields.UploadLimitModel && form.errorObj.UploadLimitModel.helperText}
            </FormHelperText>
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="UploadLimitZip">Upload HTML limit</InputLabel>
            <OutlinedInput
              id="UploadLimitZip"
              name="UploadLimitZip"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Upload model limit"
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
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const RejectedDomainsCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRejectedDomainsSettings, { isLoading }] = useSetRejectedDomainsSettingsConfigMutation();
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const [RejectedDomains, setRejectedDomains] = useState([]);
  const [isListValid, setListValid] = useState(true);
  const [isListWasChanged, setListWasChanged] = useState(false);

  const onSaveClick = async () => {
    const body = {
      ...(isListWasChanged ? { RejectedDomains: RejectedDomains } : {}),
    };

    try {
      const response = await setRejectedDomainsSettings(body).unwrap();
      dispatch(changeRejectedDomainsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  const fieldsHandler = (event) => {
    const { isValuesValid, isListWasChanged, createdList } = event;
    setRejectedDomains(createdList);
    setListValid(createdList.length > 0 ? isValuesValid : true);
    setListWasChanged(isListWasChanged);
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rejected domains:" subheader="Here you can define domains. All subdomains will be rejected." />
      <CardContent>
        <ListOfInputs
          initialList={appData.AdServer.RejectedDomains}
          fieldsHandler={fieldsHandler}
          listName="RejectedDomains"
          type="domain"
          maxHeight="calc(100vh - 22rem)"
        />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !isListWasChanged || !isListValid} type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
