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
  Tooltip,
  Typography,
} from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import HelpIcon from '@mui/icons-material/Help';

export default function Settings() {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setInventoryWhitelistConfig, { isLoading }] = useSetInventoryWhitelistConfigMutation();
  const [separateList, setSeparateList] = useState(
    appData.AdServer.InventoryImportWhitelist?.length > 0 || appData.AdServer.InventoryExportWhitelist?.length > 0,
  );
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
    if (
      !appData.AdServer.InventoryPrivate &&
      (appData.AdServer.InventoryWhitelist?.length > 0 ||
        appData.AdServer.InventoryImportWhitelist?.length > 0 ||
        appData.AdServer.InventoryExportWhitelist?.length > 0)
    ) {
      return 'restricted';
    }
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
        ? separateList
          ? {
              InventoryPrivate: false,
              InventoryImportWhitelist,
              InventoryExportWhitelist,
            }
          : { InventoryPrivate: false, InventoryWhitelist }
        : {}),
    };
    const response = await setInventoryWhitelistConfig(body);
    if (response.data && response.data.message === 'OK') {
      dispatch(changeInventoryWhitelistInformation(body));
      createSuccessNotification();
    }
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
      return separateList
        ? (InventoryImportWhitelist.length === 0 || !isListValid.InventoryImportWhitelist || !isListWasChanged.InventoryImportWhitelist) &&
            (InventoryExportWhitelist.length === 0 || !isListValid.InventoryExportWhitelist || !isListWasChanged.InventoryExportWhitelist)
        : InventoryWhitelist.length === 0 || !isListValid.InventoryWhitelist || !isListWasChanged.InventoryWhitelist;
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
              <FormControlLabel
                value="public"
                control={<Radio />}
                label={
                  <Box className={`${commonStyles.flex}`}>
                    <Typography variant="body1">Public</Typography>
                    <Tooltip sx={{ ml: 0.5 }} title="The ad server will synchronize with all other ad servers.">
                      <HelpIcon color="primary" />
                    </Tooltip>
                  </Box>
                }
              />
              <FormControlLabel
                value="restricted"
                control={<Radio />}
                label={
                  <Box className={`${commonStyles.flex}`}>
                    <Typography variant="body1">Restricted</Typography>
                    <Tooltip sx={{ ml: 0.5 }} title="The ad server will only synchronize with listed as servers.">
                      <HelpIcon color="primary" />
                    </Tooltip>
                  </Box>
                }
              />
              <FormControlLabel
                value="private"
                control={<Radio />}
                label={
                  <Box className={`${commonStyles.flex}`}>
                    <Typography variant="body1">Private</Typography>
                    <Tooltip sx={{ ml: 0.5 }} title="The ad server will not synchronize with any other ad server.">
                      <HelpIcon color="primary" />
                    </Tooltip>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Box>

      <Collapse in={serverType === 'restricted'} timeout="auto" sx={{ overflow: 'auto' }}>
        <CardContent>
          <CardActions sx={{ paddingX: 0 }}>
            <FormControlLabel
              control={<Checkbox checked={separateList} onChange={() => setSeparateList((prevState) => !prevState)} />}
              label="Separate lists for inventory import and export"
            />
          </CardActions>
          <Collapse in={!separateList} timeout="auto">
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

          <Collapse in={separateList} timeout="auto">
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
