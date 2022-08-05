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

  const validateValue = (value) => {
    const isEmptyField = !value;
    const isAddressValid = value ? validateAddress(value) : false;
    const isValueValid = isAddressValid && !isEmptyField;
    let helperText = '';

    if (isEmptyField) {
      helperText = 'Field cannot be empty. Enter address or remove field';
    } else if (!isAddressValid) {
      helperText = 'Invalid address';
    }

    return {
      isValueValid,
      helperText,
    };
  };

  return (
    <Card className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
      <Box className={`${commonStyles.flex} ${commonStyles.alignBaseline}`}>
        <CardHeader
          title="AdServer white list"
          // eslint-disable-next-line max-len
          subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt, ea incidunt modi porro sequi veniam voluptate!"
        />
        <FormControlLabel
          label="Private AdServer"
          sx={{ whiteSpace: 'nowrap' }}
          control={<Checkbox checked={isPrivateAdserver} onChange={() => setIsPrivateAdserver((prevState) => !prevState)} />}
        />
      </Box>

      <Collapse in={!isPrivateAdserver} timeout="auto" sx={{ overflow: 'auto' }}>
        <CardActions>
          <FormControlLabel
            control={<Checkbox checked={separateNetworkList} onChange={() => setSeparateNetworkList((prevState) => !prevState)} />}
            label="Separate list"
          />
        </CardActions>

        <CardContent>
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
                  <ListOfInputs list={addressList} setListFn={setAddressList} validate={validateValue} maxHeight="calc(100vh - 38rem)" />
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
                    list={supplyAddressList}
                    setListFn={setSupplyAddressList}
                    validate={validateValue}
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
                    list={demandAddressList}
                    setListFn={setDemandAddressList}
                    validate={validateValue}
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
          <Button type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
