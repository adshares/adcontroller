import React, { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Checkbox, Collapse, FormControlLabel } from '@mui/material';
import ListOfInputs from '../../common/ListOfInputs/ListOfInputs';
import commonStyles from '../../common/commonStyles.scss';
import { validateAddress } from '@adshares/ads';

const all = [];
const supply = [];
const demand = [];

export default function Network() {
  const [isPrivateAdserver, setIsPrivateAdserver] = useState(false);
  const [addressList, setAddressList] = useState(all);
  const [supplyAddressList, setSupplyAddressList] = useState(supply);
  const [demandAddressList, setDemandAddressList] = useState(demand);
  const [isFieldsValid, setFieldsValid] = useState(true);
  const [separateNetworkList, setSeparateNetworkList] = useState(!!supplyAddressList.length || !!demandAddressList.length);

  const onSaveClick = () => {
    //TODO: add send function and send this lists
    if (supplyAddressList.length || demandAddressList.length) {
      console.log(supplyAddressList);
      console.log(demandAddressList);
      setAddressList([]);
      //TODO: send empty address list
      return;
    }
    console.log(addressList);
  };

  const fieldsHandler = (fields, listName) => {
    let isAddressListValid = true;
    let isSupplyAddressListValid = true;
    let isDemandAddressListValid = true;
    if (fields.length > 0) {
      switch (listName) {
        case 'addressList':
          setAddressList(fields.map((field) => field.field));
          isAddressListValid = fields.some((field) => field.isValueValid);
          break;

        case 'supplyAddressList':
          setSupplyAddressList(fields.map((field) => field.field));
          isSupplyAddressListValid = fields.some((field) => field.isValueValid);
          break;

        case 'demandAddressList':
          setDemandAddressList(fields.map((field) => field.field));
          isDemandAddressListValid = fields.some((field) => field.isValueValid);
          break;

        default:
          break;
      }
    }
    //TODO: setFieldsValid, when get fields from server
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
        control={<Checkbox checked={isPrivateAdserver} onChange={() => setIsPrivateAdserver((prevState) => !prevState)} />}
      />

      <Collapse in={!isPrivateAdserver} timeout="auto" sx={{ overflow: 'auto' }}>
        <CardContent>
          <CardActions sx={{ padding: 0 }}>
            <FormControlLabel
              control={<Checkbox checked={separateNetworkList} onChange={() => setSeparateNetworkList((prevState) => !prevState)} />}
              label="Separate list"
            />
          </CardActions>
          <Collapse in={!separateNetworkList} timeout="auto">
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
                    initialList={addressList}
                    fieldsHandler={fieldsHandler}
                    listName="addressList"
                    type="wallet"
                    maxHeight="calc(100vh - 38rem)"
                  />
                </CardContent>
              </Card>
            </Box>
          </Collapse>

          <Collapse in={separateNetworkList} timeout="auto">
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
                    initialList={supplyAddressList}
                    fieldsHandler={fieldsHandler}
                    listName="supplyAddressList"
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
                    initialList={demandAddressList}
                    fieldsHandler={fieldsHandler}
                    listName="demandAddressList"
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
          <Button disabled={!isFieldsValid} type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
