import React, { useEffect, useMemo, useRef, useState } from 'react';
import { validateAddress } from '@adshares/ads';
import { Box, Button, Collapse, IconButton, InputAdornment, List, ListItem, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';
import { compareArrays } from '../../utils/helpers';

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

const formatValue = (value, type) => {
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

const useCreateFields = (initialList, type) => {
  const [list, setList] = useState(initialList || []);

  useEffect(() => {
    if (!compareArrays(initialList || [], list)) {
      setList(initialList || []);
    }
  }, [initialList]);

  const inputs = [];
  const fields = [];

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
    if (type === 'wallet') return;
    if (!e.target.value) {
      return;
    }

    setList((prevState) => {
      const newList = [...prevState];
      newList[index] = formatValue(e.target.value, type);
      return newList;
    });
  };

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
  return { inputs, fields, list, setList };
};

export default function ListOfInputs({ initialList = null, fieldsHandler, listName = undefined, type = 'text', maxHeight = undefined }) {
  const { inputs, fields, list, setList } = useCreateFields(initialList, type);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const textAreaRef = useRef(null);
  const isValuesValid = useMemo(() => fields.every((field) => field.isValueValid), [fields]);
  const isListWasChanged = useMemo(() => !compareArrays(initialList || [], list), [initialList, list]);

  useEffect(() => {
    fieldsHandler({
      listName,
      isValuesValid,
      isListWasChanged,
      list,
    });
  }, [list, initialList]);

  const onTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };

  const onTextAreaSaveClick = () => {
    const newList = textareaValue.split(/[,;\s]/).filter(Boolean);
    setList((prevState) => [...prevState, ...newList.map((item) => formatValue(item, type))]);
    setTextareaValue('');
    setBulkAdding((prevState) => !prevState);
  };

  return (
    <Box className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
      <Collapse in={!bulkAdding} timeout="auto">
        <Box className={`${commonStyles.card}`}>
          <Button type="button" variant="text" onClick={() => setBulkAdding((prevState) => !prevState)}>
            Bulk adding
          </Button>
        </Box>

        <List sx={{ overflow: 'auto', maxHeight: maxHeight, minHeight: '5rem' }}>{inputs.reverse()}</List>
      </Collapse>

      <Collapse in={bulkAdding} timeout="auto">
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
          <TextField value={textareaValue} multiline rows={8} onChange={onTextareaChange} inputRef={textAreaRef} />
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button type="button" variant="contained" sx={{ mr: 1 }} onClick={onTextAreaSaveClick} disabled={!textareaValue}>
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
