import React, { useEffect, useRef, useState } from 'react';
import { validateAddress } from '@adshares/ads';
import { Box, Button, Collapse, IconButton, InputAdornment, List, ListItem, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';

const formatValue = (value, type) => {
  const sliceDomain = (value) => {
    const isValidUrl = (() => {
      try {
        new URL(value);
      } catch {
        sliceDomain('https://' + value);
        return false;
      }
      return true;
    })();

    if (isValidUrl) {
      const url = new URL(value);
      return url.hostname;
    }
    return value;
  };

  switch (type) {
    case 'domain':
      return sliceDomain(value);

    default:
      return value;
  }
};

const validateValue = (list, value, type) => {
  const duplicatedValues = list.filter((item, index) => list.indexOf(item) !== index);
  const isDuplicated = duplicatedValues.includes(value);
  let helperText = '';

  if (isDuplicated) {
    helperText = 'Duplicated value';
  }

  const validateDomain = (list, value) => {
    const isValidUrl = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))', // OR ip (v4) address
      'i',
    ).test(value);
    const isValueValid = !isDuplicated && isValidUrl;

    if (!isValidUrl) {
      helperText = 'Field must be a domain';
    }
    return {
      isValueValid,
      helperText,
    };
  };

  const validateWallet = (list, value) => {
    const isAddressValid = validateAddress(value);
    const isValueValid = !isDuplicated && isAddressValid;

    if (!isAddressValid) {
      helperText = 'Invalid address';
    }
    return {
      isValueValid,
      helperText,
    };
  };

  switch (type) {
    case 'domain':
      return validateDomain(list, value);

    case 'wallet':
      return validateWallet(list, value);

    default:
      return {
        isValueValid: true,
        helperText: '',
      };
  }
};

const compareArray = (arr1, arr2) => {
  return Array.isArray(arr1) && Array.isArray(arr2) && arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
};

export default function ListOfInputs({ initialList = null, fieldsHandler, listName = undefined, type = 'text', maxHeight = '50vh' }) {
  const [list, setList] = useState(initialList || []);
  const [inputs, setInputs] = useState([]);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    const { inputs, fields } = createFields(list);
    setInputs(inputs);
    const createdList = fields.map((field) => field.field);
    const isValuesValid = fields.every((field) => field.isValueValid);
    const isListWasChanged = !compareArray(initialList || [], createdList);
    fieldsHandler({
      listName,
      isValuesValid,
      isListWasChanged,
      createdList,
    });
  }, [list, initialList]);

  const onTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };

  const onSaveClick = () => {
    const newList = textareaValue.split(/[,;\s]/).filter(Boolean);
    setList((prevState) => [...prevState, ...newList.map((item) => formatValue(item, type))]);
    setTextareaValue('');
    setBulkAdding((prevState) => !prevState);
  };

  const handleChange = (e, idx) => {
    setList((prevState) => {
      const newList = [...prevState];
      newList[idx] = e.target.value;
      return newList.filter(Boolean);
    });
  };

  const onRemoveClick = (idx) => {
    setList((prevState) => {
      const newList = [...prevState];
      newList.splice(idx, 1);
      return newList;
    });
  };

  const formatValueOnBlur = (e, index) => {
    if (!e.target.value) {
      return;
    }
    setList((prevState) => {
      const newList = [...prevState];
      newList[index] = formatValue(e.target.value, type);
      return newList;
    });
  };

  const createFields = (list) => {
    const inputs = [];
    const fields = [];
    for (let index = 0; index <= list.length; index++) {
      const validationResult = list.length !== index && validateValue(list, list[index], type);
      const isValidationError = list.length !== index && !validationResult.isValueValid;

      if (validationResult) {
        fields.push({ field: list[index], ...validationResult });
      }

      inputs.push(
        <ListItem disableGutters disablePadding key={index}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            margin="dense"
            error={isValidationError}
            helperText={validationResult.helperText}
            name={`${index}`}
            value={list[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onBlur={(e) => formatValueOnBlur(e, index)}
            InputProps={
              index === list.length
                ? undefined
                : {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="button" onClick={() => onRemoveClick(index)}>
                          <CloseIcon color="error" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
            }
            inputProps={{ autoComplete: 'off' }}
          />
        </ListItem>,
      );
    }
    return { inputs: inputs.reverse(), fields };
  };

  return (
    <Box className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
      <Collapse in={!bulkAdding} timeout="auto">
        <Box className={`${commonStyles.card}`}>
          <Button type="button" variant="text" onClick={() => setBulkAdding((prevState) => !prevState)}>
            Bulk adding
          </Button>
        </Box>

        <List sx={{ overflow: 'auto', maxHeight: maxHeight, minHeight: '5rem' }}>{inputs}</List>
      </Collapse>

      <Collapse in={bulkAdding} timeout="auto">
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
          <TextField value={textareaValue} multiline rows={8} onChange={onTextareaChange} inputRef={textAreaRef} />
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button type="button" variant="contained" sx={{ mr: 1 }} onClick={onSaveClick} disabled={!textareaValue}>
              Paste
            </Button>

            <Button type="button" variant="outlined" onClick={() => setBulkAdding((prevState) => !prevState)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
