import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useSetInventoryWhitelistConfigMutation } from '../../redux/config/configApi';
import { changeInventoryWhitelistInformation } from '../../redux/config/configSlice';
import { useCreateNotification } from '../../hooks';
import ListOfInputs from '../common/ListOfInputs/ListOfInputs';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Checkbox, Collapse, FormControlLabel } from '@mui/material';
import commonStyles from '../common/commonStyles.scss';

export default function Settings() {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setInventoryWhitelistConfig, { isLoading }] = useSetInventoryWhitelistConfigMutation();
  const [InventoryPrivate, setInventoryPrivate] = useState(appData.AdServer.InventoryPrivate);
  const [separateList, setSeparateList] = useState(
    !!appData.AdServer.InventoryExportWhitelist?.length || !!appData.AdServer.InventoryImportWhitelist?.length,
  );
  const [InventoryWhitelist, setInventoryWhitelist] = useState([]);
  const [InventoryImportWhitelist, setInventoryImportWhitelist] = useState([]);
  const [InventoryExportWhitelist, setInventoryExportWhitelist] = useState([]);
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
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {
      ...(InventoryPrivate && appData.AdServer.InventoryPrivate !== InventoryPrivate
        ? {
            InventoryPrivate,
            InventoryWhitelist: [],
            InventoryImportWhitelist: [],
            InventoryExportWhitelist: [],
          }
        : { InventoryPrivate }),
      ...(!InventoryPrivate && !separateList && { InventoryWhitelist }),
      ...(!InventoryPrivate && separateList && { InventoryImportWhitelist, InventoryExportWhitelist }),
    };

    try {
      const response = await setInventoryWhitelistConfig(body).unwrap();
      dispatch(changeInventoryWhitelistInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  const fieldsHandler = (event) => {
    const { listName, isValuesValid, isListWasChanged, createdList } = event;

    switch (listName) {
      case 'InventoryWhitelist':
        setInventoryWhitelist(createdList);
        setIsListValid((prevState) => ({
          ...prevState,
          [listName]: createdList.length > 0 ? isValuesValid : true,
        }));
        setIsListWasChanged((prevState) => ({
          ...prevState,
          [listName]: isListWasChanged,
        }));
        break;

      case 'InventoryImportWhitelist':
        setInventoryImportWhitelist(createdList);
        setIsListValid((prevState) => ({
          ...prevState,
          [listName]: createdList.length > 0 ? isValuesValid : true,
        }));
        setIsListWasChanged((prevState) => ({
          ...prevState,
          [listName]: isListWasChanged,
        }));
        break;

      case 'InventoryExportWhitelist':
        setInventoryExportWhitelist(createdList);
        setIsListValid((prevState) => ({
          ...prevState,
          [listName]: createdList.length > 0 ? isValuesValid : true,
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

  return (
    <Card className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
      <CardHeader
        title="AdServer's whitelist"
        // eslint-disable-next-line max-len
        subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt, ea incidunt modi porro sequi veniam voluptate!"
      />
      <FormControlLabel
        label="Private AdServer"
        sx={{ pl: 2, whiteSpace: 'nowrap' }}
        control={<Checkbox checked={InventoryPrivate} onChange={() => setInventoryPrivate((prevState) => !prevState)} />}
      />

      <Collapse in={!InventoryPrivate} timeout="auto" sx={{ overflow: 'auto' }}>
        <CardContent>
          <CardActions sx={{ padding: 0 }}>
            <FormControlLabel
              control={<Checkbox checked={separateList} onChange={() => setSeparateList((prevState) => !prevState)} />}
              label="Separate list"
            />
          </CardActions>
          <Collapse in={!separateList} timeout="auto">
            <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
              <Card className={`${commonStyles.halfCard}`} raised>
                <CardHeader
                  title="Address list:"
                  subheader={
                    // eslint-disable-next-line max-len
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt,'
                  }
                />
                <CardContent>
                  <ListOfInputs
                    initialList={appData.AdServer.InventoryWhitelist}
                    fieldsHandler={fieldsHandler}
                    listName="InventoryWhitelist"
                    type="wallet"
                    maxHeight="calc(100vh - 38rem)"
                  />
                </CardContent>
              </Card>
            </Box>
          </Collapse>

          <Collapse in={separateList} timeout="auto">
            <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween}`}>
              <Card className={`${commonStyles.halfCard}`} raised>
                <CardHeader
                  title="Supply address list:"
                  subheader={
                    // eslint-disable-next-line max-len
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. '
                  }
                />
                <CardContent>
                  <ListOfInputs
                    initialList={appData.AdServer.InventoryImportWhitelist}
                    fieldsHandler={fieldsHandler}
                    listName="InventoryImportWhitelist"
                    type="wallet"
                    maxHeight="calc(100vh - 38rem)"
                  />
                </CardContent>
              </Card>

              <Card className={`${commonStyles.halfCard}`} raised>
                <CardHeader
                  title="Demand address list:"
                  subheader={
                    // eslint-disable-next-line max-len
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt,'
                  }
                />
                <CardContent>
                  <ListOfInputs
                    initialList={appData.AdServer.InventoryExportWhitelist}
                    fieldsHandler={fieldsHandler}
                    listName="InventoryExportWhitelist"
                    type="wallet"
                    maxHeight="calc(100vh - 38rem)"
                  />
                </CardContent>
              </Card>
            </Box>
          </Collapse>
        </CardContent>
      </Collapse>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={
              (appData.AdServer.InventoryPrivate === InventoryPrivate &&
                (separateList
                  ? (InventoryImportWhitelist.length === 0 ||
                      !isListValid.InventoryImportWhitelist ||
                      !isListWasChanged.InventoryImportWhitelist) &&
                    (InventoryExportWhitelist.length === 0 ||
                      !isListValid.InventoryExportWhitelist ||
                      !isListWasChanged.InventoryExportWhitelist)
                  : InventoryWhitelist.length === 0 || !isListValid.InventoryWhitelist || !isListWasChanged.InventoryWhitelist)) ||
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
}
