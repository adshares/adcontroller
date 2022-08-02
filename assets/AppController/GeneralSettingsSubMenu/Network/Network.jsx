import React, { useRef, useState } from 'react';
import { validateAddress } from '@adshares/ads';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../commonStyles.scss';

const all = ['0023-00000000-D758', '0023-00000001-C779', '0023-00000002-F71A'];
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

      <Collapse in={!isPrivateAdserver} timeout="auto">
        <CardActions>
          <FormControlLabel
            control={<Checkbox checked={separateNetworkList} onChange={() => setSeparateNetworkList((prevState) => !prevState)} />}
            label="Separate list"
          />
        </CardActions>
        <CardContent>
          <Collapse in={!separateNetworkList} timeout="auto">
            <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
              <CardList
                listTitle="Address list:"
                listSubHeader={
                  // eslint-disable-next-line max-len
                  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt, ea incidunt modi porro sequi veniam voluptate! Accusamus assumenda autem facilis fuga, harum hic maxime odio optio quisquam?'
                }
                list={addressList}
                setListFn={setAddressList}
              />
            </Box>
          </Collapse>

          <Collapse in={separateNetworkList} timeout="auto">
            <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween}`}>
              <CardList
                listTitle="Supply address list:"
                listSubHeader={
                  // eslint-disable-next-line max-len
                  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt,'
                }
                list={supplyAddressList}
                setListFn={setSupplyAddressList}
              />

              <CardList
                listTitle="Demand address list:"
                listSubHeader={
                  // eslint-disable-next-line max-len
                  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur assumenda blanditiis deserunt,'
                }
                list={demandAddressList}
                setListFn={setDemandAddressList}
              />
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

const CardList = ({ listSubHeader, listTitle, list, setListFn }) => {
  const [addMore, setAddMore] = useState(false);
  const [textareaList, setTextAreaList] = useState([]);
  const textAreaRef = useRef(null);

  const handleChange = (e, idx, list, setListFn) => {
    const newList = [...list];
    newList[idx] = e.target.value;
    setListFn(newList);
  };

  const onRemoveClick = (idx, list, setListFn) => {
    const newList = [...list];
    newList.splice(idx, 1);
    setListFn(newList);
  };

  const createFields = (list, setListFn) => {
    const inputs = [];
    const duplicatedValues = list.filter((item, index) => list.indexOf(item) !== index);
    for (let index = 0; index <= list.length; index++) {
      const isAddressValid = list[index] ? validateAddress(list[index]) : true;
      const isDuplicated = duplicatedValues.some((el) => el === list[index]);
      const isValidationError = list[index] === '' || (list.length > 0 && !isAddressValid) || isDuplicated;
      let helperText = ' ';

      if (isValidationError) {
        helperText = isDuplicated ? 'Duplicated value' : 'Invalid address';
      }

      inputs.push(
        <Box key={index}>
          <TextField
            error={isValidationError}
            helperText={helperText}
            fullWidth
            name={`${index}`}
            variant="outlined"
            size="small"
            value={list[index] || ''}
            onChange={(e) => handleChange(e, index, list, setListFn)}
            InputProps={
              index === list.length
                ? {}
                : {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="button" onClick={() => onRemoveClick(index, list, setListFn)}>
                          <CloseIcon color="error" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
            }
          />
        </Box>,
      );
    }
    return inputs;
  };

  const onTextareaChange = (e) => {
    const newList = e.target.value.split(/[.,:;\[\]'"{}()|/\\\s]/).filter(Boolean);
    setTextAreaList(newList);
  };

  const onSaveClick = () => {
    setListFn((prevState) => [...prevState, ...textareaList]);
    setTextAreaList([]);
    textAreaRef.current.value = '';
    setAddMore((prevState) => !prevState);
  };

  return (
    <Card raised className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween} ${commonStyles.halfCard}`}>
      <Box>
        <CardHeader title={listTitle} subheader={listSubHeader} />

        <CardActions>
          <FormControlLabel
            label="Paste a few"
            control={<Checkbox checked={addMore} onChange={() => setAddMore((prevState) => !prevState)} />}
          />
        </CardActions>
      </Box>

      <Box>
        <Collapse in={!addMore} timeout="auto">
          <CardContent sx={{ overflow: 'auto', height: '20rem' }}>{createFields(list, setListFn)}</CardContent>
        </Collapse>

        <Collapse in={addMore} timeout="auto">
          <CardContent>
            <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
              <TextField multiline rows={8} onChange={onTextareaChange} inputRef={textAreaRef} />
              <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
                <Button type="button" variant="contained" sx={{ mr: 1 }} onClick={onSaveClick}>
                  Save
                </Button>
                <Button type="button" variant="outlined" onClick={() => setAddMore((prevState) => !prevState)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Collapse>
      </Box>
    </Card>
  );
};
