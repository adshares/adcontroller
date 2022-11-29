import React, { useState } from 'react';
import configSelectors from '../../redux/config/configSelectors';
import { useDispatch, useSelector } from 'react-redux';
import { useSetSiteOptionsConfigMutation, useSetZoneOptionsConfigMutation } from '../../redux/config/configApi';
import { changeSiteOptionsInformation, changeZoneOptionsInformation } from '../../redux/config/configSlice';
import { useCreateNotification, useForm } from '../../hooks';
import { returnNumber } from '../../utils/helpers';
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
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';

export default function Settings() {
  return (
    <>
      <SiteOptions />
      <ZoneOptions sx={{ mt: 3 }} />
    </>
  );
}

const SiteOptions = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const [setSiteOptionsConfig, { isLoading }] = useSetSiteOptionsConfigMutation();
  const dispatch = useDispatch();
  const { createSuccessNotification } = useCreateNotification();
  const [SiteAcceptBannersManually, setSiteAcceptBannersManually] = useState(appData.AdServer.SiteAcceptBannersManually);
  const [SiteClassifierLocalBanners, setSiteClassifierLocalBanners] = useState(appData.AdServer.SiteClassifierLocalBanners);

  const onSaveClick = async () => {
    const body = {
      ...(appData.AdServer.SiteAcceptBannersManually === SiteAcceptBannersManually ? {} : { SiteAcceptBannersManually }),
      ...(appData.AdServer.SiteClassifierLocalBanners === SiteClassifierLocalBanners ? {} : { SiteClassifierLocalBanners }),
    };

    const response = await setSiteOptionsConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeSiteOptionsInformation(response.data.data));
      createSuccessNotification();
    }
  };
  return (
    <Card {...props}>
      <CardHeader title="Site options" subheader="Set banner availability and classification." />
      <CardContent>
        <FormControlLabel
          sx={{ display: 'block', mb: 3, ml: -1.5 }}
          label="Require banner acceptance by default"
          control={
            <Checkbox checked={SiteAcceptBannersManually} onChange={() => setSiteAcceptBannersManually((prevState) => !prevState)} />
          }
        />

        <FormControl>
          <FormLabel focused={false}>Visibility of banners for classification</FormLabel>
          <RadioGroup value={SiteClassifierLocalBanners} onChange={(e) => setSiteClassifierLocalBanners(e.target.value)}>
            <FormControlLabel value="all-by-default" control={<Radio />} label="Default from all servers" />
            <FormControlLabel value="local-by-default" control={<Radio />} label="Default from local server" />
            <FormControlLabel value="local-only" control={<Radio />} label="Only from local server" />
          </RadioGroup>
        </FormControl>
      </CardContent>

      <CardActions>
        <Button
          disabled={
            (appData.AdServer.SiteAcceptBannersManually === SiteAcceptBannersManually &&
              appData.AdServer.SiteClassifierLocalBanners === SiteClassifierLocalBanners) ||
            isLoading
          }
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

const ZoneOptions = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const [setZoneOptionsConfig, { isLoading }] = useSetZoneOptionsConfigMutation();
  const dispatch = useDispatch();
  const { createSuccessNotification } = useCreateNotification();
  const [AllowZoneInIframe, setAllowZoneInIframe] = useState(appData.AdServer.AllowZoneInIframe);
  const form = useForm({
    initialFields: { MaxPageZones: appData.AdServer.MaxPageZones.toString() },
    validation: {
      MaxPageZones: ['required', 'number', 'integer'],
    },
  });

  const onSaveClick = async () => {
    const body = {
      ...(appData.AdServer.AllowZoneInIframe !== AllowZoneInIframe && { AllowZoneInIframe }),
      ...(form.changedFields.MaxPageZones ? { MaxPageZones: returnNumber(form.fields.MaxPageZones) } : {}),
    };

    const response = await setZoneOptionsConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeZoneOptionsInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Banner options" subheader="Set banner limitations" />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField
            customvariant="highLabel"
            color="secondary"
            id="MaxPageZones"
            name="MaxPageZones"
            type="number"
            label="Maximum banners per page"
            fullWidth
            value={form.fields.MaxPageZones}
            error={form.touchedFields.MaxPageZones && !form.errorObj.MaxPageZones.isValid}
            helperText={form.touchedFields.MaxPageZones && form.errorObj.MaxPageZones.helperText}
            inputProps={{ autoComplete: 'off', min: 0 }}
          />
        </Box>
        <FormControl margin="dense">
          <FormControlLabel
            label="Allow banners in the iframe"
            control={<Checkbox checked={AllowZoneInIframe} onChange={() => setAllowZoneInIframe((prevState) => !prevState)} />}
          />
        </FormControl>
      </CardContent>

      <CardActions>
        <Button
          disabled={isLoading || !form.isFormValid || (appData.AdServer.AllowZoneInIframe === AllowZoneInIframe && !form.isFormWasChanged)}
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
