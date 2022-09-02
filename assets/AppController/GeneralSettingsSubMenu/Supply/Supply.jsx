import React, { useState } from 'react';
import configSelectors from '../../../redux/config/configSelectors';
import { useDispatch, useSelector } from 'react-redux';
import { useSetSiteOptionsConfigMutation, useSetZoneOptionsConfigMutation } from '../../../redux/config/configApi';
import { changeSiteOptionsInformation, changeZoneOptionsInformation } from '../../../redux/config/configSlice';
import { useCreateNotification, useForm } from '../../../hooks';
import { returnNumber } from '../../../utils/helpers';
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
  Icon,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import commonStyles from '../../common/commonStyles.scss';

export default function Supply() {
  return (
    <>
      <SiteOptions />
      <ZoneOptions />
    </>
  );
}

const SiteOptions = () => {
  const appData = useSelector(configSelectors.getAppData);
  const [setSiteOptionsConfig, { isLoading }] = useSetSiteOptionsConfigMutation();
  const dispatch = useDispatch();
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();
  const [SiteAcceptBannersManually, setSiteAcceptBannersManually] = useState(appData.AdServer.SiteAcceptBannersManually);
  const [SiteClassifierLocalBanners, setSiteClassifierLocalBanners] = useState(appData.AdServer.SiteClassifierLocalBanners);

  const onSaveClick = async () => {
    const body = {
      ...(appData.AdServer.SiteAcceptBannersManually === SiteAcceptBannersManually ? {} : { SiteAcceptBannersManually }),
      ...(appData.AdServer.SiteClassifierLocalBanners === SiteClassifierLocalBanners ? {} : { SiteClassifierLocalBanners }),
    };
    try {
      const response = await setSiteOptionsConfig(body).unwrap();
      dispatch(changeSiteOptionsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };
  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Site options" subheader="Site banners classifications settings." />
      <CardContent>
        <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceEvenly} ${commonStyles.alignStart}`}>
          <FormControlLabel
            label="Require banner acceptance by default"
            control={
              <Checkbox checked={SiteAcceptBannersManually} onChange={() => setSiteAcceptBannersManually((prevState) => !prevState)} />
            }
          />

          <FormControl>
            <FormLabel focused={false}>Classification of banners from the server</FormLabel>
            <RadioGroup value={SiteClassifierLocalBanners} onChange={(e) => setSiteClassifierLocalBanners(e.target.value)}>
              <FormControlLabel value="all-by-default" control={<Radio />} label="Default from all servers" />
              <FormControlLabel value="local-by-default" control={<Radio />} label="Default from local server" />
              <FormControlLabel value="local-only" control={<Radio />} label="Only from local server" />
            </RadioGroup>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
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
        </Box>
      </CardActions>
    </Card>
  );
};

const ZoneOptions = () => {
  const appData = useSelector(configSelectors.getAppData);
  const [setZoneOptionsConfig, { isLoading }] = useSetZoneOptionsConfigMutation();
  const dispatch = useDispatch();
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();
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
    try {
      const response = await setZoneOptionsConfig(body).unwrap();
      dispatch(changeZoneOptionsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Zone options" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            <FormControl margin="dense">
              <FormControlLabel
                label="Allow zone in IFRAME"
                control={<Checkbox checked={AllowZoneInIframe} onChange={() => setAllowZoneInIframe((prevState) => !prevState)} />}
              />
            </FormControl>
            <Tooltip title="lorem ipsum dolor set amet">
              <Icon>
                <HelpIcon color="primary" />
              </Icon>
            </Tooltip>
          </Box>

          <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
              <TextField
                id="MaxPageZones"
                name="MaxPageZones"
                size="small"
                type="number"
                label="Maximum zones per page"
                margin="dense"
                fullWidth
                value={form.fields.MaxPageZones}
                error={form.touchedFields.MaxPageZones && !form.errorObj.MaxPageZones.isValid}
                helperText={form.touchedFields.MaxPageZones && form.errorObj.MaxPageZones.helperText}
                inputProps={{ autoComplete: 'off', min: 0 }}
              />
            </Box>
            <Tooltip title="lorem ipsum dolor set amet" sx={{ ml: 1 }}>
              <Icon>
                <HelpIcon color="primary" />
              </Icon>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={isLoading || (appData.AdServer.AllowZoneInIframe === AllowZoneInIframe && !form.isFormWasChanged)}
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
