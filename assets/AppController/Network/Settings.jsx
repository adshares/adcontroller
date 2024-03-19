import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useSetInventoryWhitelistConfigMutation, useSetJoiningFeeConfigMutation } from '../../redux/config/configApi';
import { changeAdServerConfiguration, changeInventoryWhitelistInformation } from '../../redux/config/configSlice';
import { useCreateNotification, useForm } from '../../hooks';
import ListOfInputs from '../../Components/ListOfInputs/ListOfInputs';
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
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
} from '@mui/material';
import FormControlLabelWithTooltip from '../../Components/FormControlLabelWithTooltip/FormControlLabelWithTooltip';
import { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces } from '../../utils/helpers';

export default function Settings() {
  return (
    <>
      <NetworkSettingsCard />
      <JoiningFeeSettings sx={{ mt: 3 }} />
    </>
  );
}

function NetworkSettingsCard(props) {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setInventoryWhitelistConfig, { isLoading }] = useSetInventoryWhitelistConfigMutation();
  const [separateList, setSeparateList] = useState({
    current: appData.AdServer.InventoryImportWhitelist?.length > 0 || appData.AdServer.InventoryExportWhitelist?.length > 0,
    prev: appData.AdServer.InventoryImportWhitelist?.length > 0 || appData.AdServer.InventoryExportWhitelist?.length > 0,
  });
  const [InventoryWhitelist, setInventoryWhitelist] = useState([]);
  const [InventoryImportWhitelist, setInventoryImportWhitelist] = useState([]);
  const [InventoryExportWhitelist, setInventoryExportWhitelist] = useState([]);
  const [serverType, setServerType] = useState(() => {
    if (appData.AdServer.InventoryPrivate) {
      return 'private';
    }
    if (
      !appData.AdServer.InventoryPrivate &&
      appData.AdServer.InventoryWhitelist?.length === 0 &&
      appData.AdServer.InventoryImportWhitelist?.length === 0 &&
      appData.AdServer.InventoryExportWhitelist?.length === 0
    ) {
      return 'public';
    }

    return 'restricted';
  });

  const [isListValid, setIsListValid] = useState({
    InventoryWhitelist: true,
    InventoryImportWhitelist: true,
    InventoryExportWhitelist: true,
  });
  const [isListWasChanged, setIsListWasChanged] = useState({
    InventoryWhitelist: false,
    InventoryImportWhitelist: false,
    InventoryExportWhitelist: false,
  });
  const { createSuccessNotification } = useCreateNotification();

  const handleServerTypeChange = (e) => {
    setServerType(e.target.value);
  };

  const fieldsHandler = (event) => {
    const { listName, isValuesValid, isListWasChanged, list } = event;

    switch (listName) {
      case 'InventoryWhitelist':
        setInventoryWhitelist(list);
        setIsListValid((prevState) => ({
          ...prevState,
          [listName]: list.length > 0 ? isValuesValid : true,
        }));
        setIsListWasChanged((prevState) => ({
          ...prevState,
          [listName]: isListWasChanged,
        }));
        break;

      case 'InventoryImportWhitelist':
        setInventoryImportWhitelist(list);
        setIsListValid((prevState) => ({
          ...prevState,
          [listName]: list.length > 0 ? isValuesValid : true,
        }));
        setIsListWasChanged((prevState) => ({
          ...prevState,
          [listName]: isListWasChanged,
        }));
        break;

      case 'InventoryExportWhitelist':
        setInventoryExportWhitelist(list);
        setIsListValid((prevState) => ({
          ...prevState,
          [listName]: list.length > 0 ? isValuesValid : true,
        }));
        setIsListWasChanged((prevState) => ({
          ...prevState,
          [listName]: isListWasChanged,
        }));

        break;

      default:
        break;
    }
  };

  const checkIsButtonDisabled = () => {
    if (serverType === 'private') {
      return appData.AdServer.InventoryPrivate === true;
    }
    if (serverType === 'public') {
      return !(
        appData.AdServer.InventoryWhitelist.length > 0 ||
        appData.AdServer.InventoryImportWhitelist.length > 0 ||
        appData.AdServer.InventoryExportWhitelist.length > 0
      );
    }
    if (serverType === 'restricted') {
      return separateList.current
        ? (InventoryImportWhitelist.length === 0 && InventoryExportWhitelist.length === 0) ||
            (!isListWasChanged.InventoryImportWhitelist && !isListWasChanged.InventoryExportWhitelist) ||
            !isListValid.InventoryImportWhitelist ||
            !isListValid.InventoryExportWhitelist
        : InventoryWhitelist.length === 0 ||
            !isListValid.InventoryWhitelist ||
            (separateList.current === separateList.prev && !isListWasChanged.InventoryWhitelist);
    }
  };

  const onSaveClick = async () => {
    const body = {
      ...(serverType === 'private' ? { InventoryPrivate: true, InventoryWhitelist: [appData.AdServer.WalletAddress] } : {}),
      ...(serverType === 'public'
        ? {
            InventoryPrivate: false,
            InventoryWhitelist: [],
            InventoryImportWhitelist: [],
            InventoryExportWhitelist: [],
          }
        : {}),
      ...(serverType === 'restricted'
        ? separateList.current
          ? {
              InventoryPrivate: false,
              InventoryImportWhitelist,
              InventoryExportWhitelist,
            }
          : { InventoryPrivate: false, InventoryWhitelist, InventoryImportWhitelist: [], InventoryExportWhitelist: [] }
        : {}),
    };
    const response = await setInventoryWhitelistConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeInventoryWhitelistInformation(body));
      setSeparateList((prevState) => ({
        ...prevState,
        prev: prevState.current !== prevState.prev ? !prevState.prev : prevState.prev,
      }));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader
        title="AdServer's inventory"
        subheader="Set which ad servers your ad server can sync with. By default, it syncs with all available ad servers."
      />
      <CardContent>
        <FormControl>
          <FormLabel focused={false}>Ad server's inventory visibility</FormLabel>
          <RadioGroup row value={serverType} onChange={handleServerTypeChange}>
            <FormControlLabelWithTooltip
              value="public"
              control={<Radio />}
              label="Public"
              tooltip="The ad server will synchronize with all other ad servers."
            />
            <FormControlLabelWithTooltip
              value="restricted"
              control={<Radio />}
              label="Restricted"
              tooltip="The ad server will only synchronize with listed as servers."
            />
            <FormControlLabelWithTooltip
              value="private"
              control={<Radio />}
              label="Private"
              tooltip="The ad server will not synchronize with any other ad server."
            />
          </RadioGroup>
        </FormControl>

        <Collapse in={serverType === 'restricted'} timeout="auto" sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={separateList.current}
                onChange={() => setSeparateList((prevState) => ({ ...prevState, current: !prevState.current }))}
              />
            }
            label="Separate lists for inventory import and export"
          />
          <Collapse in={!separateList.current} timeout="auto" sx={{ mt: 3 }}>
            <Card customvariant="outlined">
              <CardHeader
                titleTypographyProps={{ component: 'h3', variant: 'h3' }}
                subheaderTypographyProps={{ variant: 'body2' }}
                title="Ad server addresses"
                subheader={'Synchronization will be limited to the following ad servers only.'}
              />
              <CardContent>
                <ListOfInputs
                  initialList={appData.AdServer.InventoryWhitelist}
                  fieldsHandler={fieldsHandler}
                  listName="InventoryWhitelist"
                  type="wallet"
                  maxHeight="calc(100vh - 46rem)"
                />
              </CardContent>
            </Card>
          </Collapse>

          <Collapse in={separateList.current} timeout="auto">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card customvariant="outlined">
                  <CardHeader
                    titleTypographyProps={{ component: 'h3', variant: 'h3' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                    title="Demand ad server addresses"
                    subheader={'Inventory import will be limited to the following ad servers only.'}
                  />
                  <CardContent>
                    <ListOfInputs
                      initialList={appData.AdServer.InventoryImportWhitelist}
                      fieldsHandler={fieldsHandler}
                      listName="InventoryImportWhitelist"
                      type="wallet"
                      maxHeight="calc(100vh - 47rem)"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card customvariant="outlined">
                  <CardHeader
                    titleTypographyProps={{ component: 'h3', variant: 'h3' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                    title="Supply ad servers addresses"
                    subheader={'Inventory export will be limited to the following ad servers only.'}
                  />
                  <CardContent>
                    <ListOfInputs
                      initialList={appData.AdServer.InventoryExportWhitelist}
                      fieldsHandler={fieldsHandler}
                      listName="InventoryExportWhitelist"
                      type="wallet"
                      maxHeight="calc(100vh - 47rem)"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Collapse>
        </Collapse>
      </CardContent>
      <CardActions>
        <Button disabled={isLoading || checkIsButtonDisabled()} type="button" variant="contained" onClick={onSaveClick}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
}

const JoiningFeeSettings = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const [setJoiningFeeConfig, { isLoading }] = useSetJoiningFeeConfigMutation();
  const dispatch = useDispatch();
  const { createSuccessNotification } = useCreateNotification();
  const [JoiningFeeEnabled, setJoiningFeeEnabled] = useState(appData.AdServer.JoiningFeeEnabled);
  const joiningFeeMinValue = clicksToAds(appData.AdServer.JoiningFeeMinValue || 0);
  const form = useForm({
    initialFields: {
      JoiningFeeValue: clicksToAds(appData.AdServer.JoiningFeeValue || 0).toString(),
    },
    validation: {
      JoiningFeeValue: ['required', 'number'],
    },
  });

  const onSaveClick = async () => {
    const body = {
      JoiningFeeEnabled,
      JoiningFeeValue: adsToClicks(returnNumber(form.fields.JoiningFeeValue)),
    };

    const response = await setJoiningFeeConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeAdServerConfiguration(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Joining fee" subheader="Set fee required from SSP to accept inventory request." />

      <CardContent>
        <FormControl margin="dense">
          <FormControlLabel
            label="Joining fee enabled"
            control={<Checkbox checked={JoiningFeeEnabled} onChange={() => setJoiningFeeEnabled((prevState) => !prevState)} />}
          />
        </FormControl>

        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <FormControl
            fullWidth
            error={
              form.touchedFields.JoiningFeeValue &&
              (!form.errorObj.JoiningFeeValue.isValid || form.fields.JoiningFeeValue < joiningFeeMinValue)
            }
            customvariant="highLabel"
            sx={{ mb: 3 }}
          >
            <InputLabel htmlFor="JoiningFeeValue">Required joining fee [ADS]</InputLabel>
            <OutlinedInput
              color="secondary"
              id="JoiningFeeValue"
              name="JoiningFeeValue"
              type="number"
              value={setDecimalPlaces(form.fields.JoiningFeeValue, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="JoiningFeeValueHelper">
              {(form.touchedFields.JoiningFeeValue && form.errorObj.JoiningFeeValue.helperText) ||
                (form.fields.JoiningFeeValue < joiningFeeMinValue && `Value must be greater than the ${joiningFeeMinValue} ADS`)}
            </FormHelperText>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          disabled={
            isLoading ||
            !form.isFormValid ||
            form.fields.JoiningFeeValue < joiningFeeMinValue ||
            (appData.AdServer.JoiningFeeEnabled === JoiningFeeEnabled && !form.isFormWasChanged)
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
