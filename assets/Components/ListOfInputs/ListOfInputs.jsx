import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { validateAddress } from '@adshares/ads';
import { Box, Button, Collapse, IconButton, List, ListItem, TextField } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import commonStyles from '../../styles/commonStyles.scss';
import { compareArrays } from '../../utils/helpers';

const sliceDomain = (value, addProtocol = false) => {
  try {
    return new URL(addProtocol ? 'https://' + value : value).hostname;
  } catch {
    return addProtocol ? null : sliceDomain(value, true);
  }
};

const formatValue = (value, type) => {
  switch (type) {
    case 'domain':
      return sliceDomain(value) ?? value;

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
    const isValidUrl = null !== sliceDomain(value);
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

  const { inputs, fields } = useMemo(() => {
    const inputs = [];
    const fields = [];

    for (let index = 0; index <= list.length; index++) {
      const validationResult = list.length !== index && validateValue(list, list[index], type);
      const isValidationError = list.length !== index && !validationResult.isValueValid;

      if (validationResult) {
        fields.push({ field: list[index], ...validationResult });
      }

      inputs.push(
        <ListItem disableGutters disablePadding key={index} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
          <TextField
            color="secondary"
            sx={{ mt: 3 }}
            fullWidth
            variant="outlined"
            error={isValidationError}
            helperText={validationResult.helperText}
            name={`${index}`}
            value={list[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onBlur={(e) => formatValueOnBlur(e, index)}
            inputProps={{ autoComplete: 'off' }}
          />
          <IconButton
            color="error"
            sx={{
              mt: 3,
              ml: 2,
              visibility: index === list.length ? 'hidden' : 'visible',
            }}
            onClick={() => onRemoveClick(index)}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </ListItem>,
      );
    }

    return { inputs, fields };
  }, [list, initialList]);

  return { inputs, fields, list, setList };
};

function ListOfInputs({ initialList = null, fieldsHandler, listName = undefined, type = 'text', maxHeight = undefined }) {
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
          <Button variant="text" onClick={() => setBulkAdding((prevState) => !prevState)}>
            BULK ADDING
          </Button>
        </Box>

        <List sx={{ overflow: 'auto', maxHeight: maxHeight, minHeight: '5rem' }}>{inputs.reverse()}</List>
      </Collapse>

      <Collapse in={bulkAdding} timeout="auto">
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
          <TextField color="secondary" value={textareaValue} multiline rows={8} onChange={onTextareaChange} inputRef={textAreaRef} />
          <Box sx={{ mt: 2 }} className={`${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
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

export default memo(ListOfInputs);
