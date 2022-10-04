import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useSetInventoryWhitelistConfigMutation } from '../../redux/config/configApi';
import { changeInventoryWhitelistInformation } from '../../redux/config/configSlice';
import { useCreateNotification } from '../../hooks';
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
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import FormControlLabelWithTooltip from '../../Components/FormControlLabelWithTooltip/FormControlLabelWithTooltip';

export default function Settings() {
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
    <Card className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
      <CardHeader
        title="AdServer's inventory"
        subheader="Set which ad servers your ad server can sync with. By default, it syncs with all available ad servers."
      />
      <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
        <CardContent sx={{ pt: 0, pb: 0 }}>
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
        </CardContent>
      </Box>

      <Collapse in={serverType === 'restricted'} timeout="auto" sx={{ overflow: 'auto' }}>
        <CardContent>
          <CardActions sx={{ paddingX: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={separateList.current}
                  onChange={() => setSeparateList((prevState) => ({ ...prevState, current: !prevState.current }))}
                />
              }
              label="Separate lists for inventory import and export"
            />
          </CardActions>
          <Collapse in={!separateList.current} timeout="auto">
            <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
              <Card className={`${commonStyles.halfCard}`} raised>
                <CardHeader title="Ad server addresses" subheader={'Synchronization will be limited to the following ad servers only.'} />
                <CardContent>
                  <ListOfInputs
                    initialList={appData.AdServer.InventoryWhitelist}
                    fieldsHandler={fieldsHandler}
                    listName="InventoryWhitelist"
                    type="wallet"
                    maxHeight="calc(100vh - 40rem)"
                  />
                </CardContent>
              </Card>
            </Box>
          </Collapse>

          <Collapse in={separateList.current} timeout="auto">
            <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween}`}>
              <Card className={`${commonStyles.halfCard}`} raised>
                <CardHeader
                  title="Demand ad server addresses"
                  subheader={'Inventory import will be limited to the following ad servers only.'}
                />
                <CardContent>
                  <ListOfInputs
                    initialList={appData.AdServer.InventoryImportWhitelist}
                    fieldsHandler={fieldsHandler}
                    listName="InventoryImportWhitelist"
                    type="wallet"
                    maxHeight="calc(100vh - 40rem)"
                  />
                </CardContent>
              </Card>

              <Card className={`${commonStyles.halfCard}`} raised>
                <CardHeader
                  title="Supply ad servers addresses"
                  subheader={'Inventory export will be limited to the following ad servers only.'}
                />
                <CardContent>
                  <ListOfInputs
                    initialList={appData.AdServer.InventoryExportWhitelist}
                    fieldsHandler={fieldsHandler}
                    listName="InventoryExportWhitelist"
                    type="wallet"
                    maxHeight="calc(100vh - 40rem)"
                  />
                </CardContent>
              </Card>
            </Box>
          </Collapse>
        </CardContent>
      </Collapse>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || checkIsButtonDisabled()} type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
