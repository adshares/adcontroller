import React, { useState } from 'react';
import configSelectors from '../../redux/config/configSelectors';
import { useDispatch, useSelector } from 'react-redux';
import { useSetSiteOptionsConfigMutation, useSetZoneOptionsConfigMutation } from '../../redux/config/configApi';
import { changeAdServerConfiguration } from '../../redux/config/configSlice';
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
  Collapse,
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
  const [AdsTxtCheckSupplyEnabled, setAdsTxtCheckSupplyEnabled] = useState(appData.AdServer.AdsTxtCheckSupplyEnabled);
  const [SiteAcceptBannersManually, setSiteAcceptBannersManually] = useState(appData.AdServer.SiteAcceptBannersManually);
  const [SiteClassifierLocalBanners, setSiteClassifierLocalBanners] = useState(appData.AdServer.SiteClassifierLocalBanners);
  const form = useForm({
    initialFields: {
      AdsTxtDomain: appData.AdServer.AdsTxtDomain,
    },
    validation: {
      AdsTxtDomain: ['domain'],
    },
  });

  const onSaveClick = async () => {
    const body = {
      ...(appData.AdServer.SiteAcceptBannersManually === SiteAcceptBannersManually ? {} : { SiteAcceptBannersManually }),
      ...(appData.AdServer.SiteClassifierLocalBanners === SiteClassifierLocalBanners ? {} : { SiteClassifierLocalBanners }),
      ...(appData.AdServer.AdsTxtCheckSupplyEnabled === AdsTxtCheckSupplyEnabled ? {} : { AdsTxtCheckSupplyEnabled }),
      ...(AdsTxtCheckSupplyEnabled && form.changedFields.AdsTxtDomain
        ? { AdsTxtDomain: 0 === form.fields.AdsTxtDomain.length ? null : form.fields.AdsTxtDomain }
        : {}),
    };

    const response = await setSiteOptionsConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeAdServerConfiguration(response.data.data));
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

        <FormControlLabel
          sx={{ display: 'block', mt: 3, mb: 3, ml: -1.5 }}
          label="Require ads.txt on sites"
          control={<Checkbox checked={AdsTxtCheckSupplyEnabled} onChange={() => setAdsTxtCheckSupplyEnabled((prevState) => !prevState)} />}
        />
        <Collapse in={AdsTxtCheckSupplyEnabled} timeout="auto">
          <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
            <TextField
              customvariant="highLabel"
              color="secondary"
              id="AdsTxtDomain"
              name="AdsTxtDomain"
              type="text"
              label="Required ads.txt domain"
              fullWidth
              value={form.fields.AdsTxtDomain}
              error={form.touchedFields.AdsTxtDomain && !form.errorObj.AdsTxtDomain.isValid}
              helperText={form.touchedFields.AdsTxtDomain && form.errorObj.AdsTxtDomain.helperText}
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
        </Collapse>
      </CardContent>

      <CardActions>
        <Button
          disabled={
            isLoading ||
            (AdsTxtCheckSupplyEnabled && form.isFormWasChanged && !form.isFormValid) ||
            (appData.AdServer.SiteAcceptBannersManually === SiteAcceptBannersManually &&
              appData.AdServer.SiteClassifierLocalBanners === SiteClassifierLocalBanners &&
              appData.AdServer.AdsTxtCheckSupplyEnabled === AdsTxtCheckSupplyEnabled &&
              !(AdsTxtCheckSupplyEnabled && form.isFormWasChanged))
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
    initialFields: {
      BannerRotateInterval: appData.AdServer.BannerRotateInterval.toString(),
      MaxPageZones: appData.AdServer.MaxPageZones.toString(),
    },
    validation: {
      BannerRotateInterval: ['required', 'number', 'integer'],
      MaxPageZones: ['required', 'number', 'integer'],
    },
  });

  const onSaveClick = async () => {
    const body = {
      ...(appData.AdServer.AllowZoneInIframe !== AllowZoneInIframe && { AllowZoneInIframe }),
      ...(form.changedFields.MaxPageZones ? { MaxPageZones: returnNumber(form.fields.MaxPageZones) } : {}),
      ...(form.changedFields.BannerRotateInterval ? { BannerRotateInterval: returnNumber(form.fields.BannerRotateInterval) } : {}),
    };

    const response = await setZoneOptionsConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeAdServerConfiguration(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Placement options" subheader="Set placement limitations" />

      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField
            customvariant="highLabel"
            color="secondary"
            id="MaxPageZones"
            name="MaxPageZones"
            type="number"
            label="Maximum placements per page"
            fullWidth
            value={form.fields.MaxPageZones}
            error={form.touchedFields.MaxPageZones && !form.errorObj.MaxPageZones.isValid}
            helperText={form.touchedFields.MaxPageZones && form.errorObj.MaxPageZones.helperText}
            inputProps={{ autoComplete: 'off', min: 0 }}
          />
          <TextField
            customvariant="highLabel"
            color="secondary"
            id="BannerRotateInterval"
            name="BannerRotateInterval"
            type="number"
            label="Period between changing creatives [seconds]"
            fullWidth
            value={form.fields.BannerRotateInterval}
            error={form.touchedFields.BannerRotateInterval && !form.errorObj.BannerRotateInterval.isValid}
            helperText={form.touchedFields.BannerRotateInterval && form.errorObj.BannerRotateInterval.helperText}
            inputProps={{ autoComplete: 'off', min: 10 }}
          />
        </Box>
        <FormControl margin="dense">
          <FormControlLabel
            label="Allow placement in the iframe"
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
