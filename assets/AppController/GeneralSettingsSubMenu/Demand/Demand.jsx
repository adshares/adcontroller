import React, { useState } from 'react';
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
import ListOfInputs from '../../common/ListOfInputs/ListOfInputs';
import commonStyles from '../../common/commonStyles.scss';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../../hooks';
import { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces } from '../../../utils/helpers';
import { useSetCampaignSettingsConfigMutation } from '../../../redux/config/configApi';
import { changeCampaignSettingsInformation } from '../../../redux/config/configSlice';

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
  const [uploadLimitImage, setUploadLimitImage] = useState(0);
  const [uploadLimitModel, setUploadLimitModel] = useState(0);
  const [uploadLimitVideo, setUploadLimitVideo] = useState(0);
  const [uploadLimitHtml, setUploadLimitHtml] = useState(0);

  const onSaveClick = () => {
    console.log({
      uploadLimitImage,
      uploadLimitModel,
      uploadLimitVideo,
      uploadLimitHtml,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Banner settings" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitImage">Image size limit</InputLabel>
            <OutlinedInput
              id="uploadLimitImage"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Image size limit"
              value={Number(uploadLimitImage).toString()}
              onChange={(e) => setUploadLimitImage(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitVideo">Video size limit</InputLabel>
            <OutlinedInput
              id="uploadLimitVideo"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Video size limit"
              value={Number(uploadLimitVideo).toString()}
              onChange={(e) => setUploadLimitVideo(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitModel">Upload model limit</InputLabel>
            <OutlinedInput
              id="uploadLimitModel"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Upload model limit"
              value={Number(uploadLimitModel).toString()}
              onChange={(e) => setUploadLimitModel(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitHtml">Upload HTML limit</InputLabel>
            <OutlinedInput
              id="uploadLimitHtml"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Upload model limit"
              value={Number(uploadLimitHtml).toString()}
              onChange={(e) => setUploadLimitHtml(Number(e.target.value).toFixed(2))}
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

const RejectedDomainsCard = () => {
  const [rejectedDomains, setRejectedDomains] = useState([]);
  const [isFieldsValid, setFieldsValid] = useState(true);

  const onSaveClick = () => {
    console.log(rejectedDomains);
    //TODO: send data
  };

  const fieldsHandler = (fields) => {
    if (fields.length > 0) {
      setRejectedDomains(fields.map((field) => field.field));
      setFieldsValid(fields.some((field) => field.isValueValid));
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rejected domains:" subheader="Here you can define domains. All subdomains will be rejected." />
      <CardContent>
        <ListOfInputs initialList={rejectedDomains} fieldsHandler={fieldsHandler} type="domain" maxHeight="calc(100vh - 22rem)" />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={!isFieldsValid} type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
