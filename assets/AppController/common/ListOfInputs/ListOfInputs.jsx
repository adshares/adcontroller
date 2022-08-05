import React, { useRef, useState } from 'react';
import { Box, Button, Collapse, IconButton, InputAdornment, List, ListItem, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../commonStyles.scss';
import { TransitionGroup } from 'react-transition-group';

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

export default function ListOfInputs({ list, setListFn, validate, transform = 'text', maxHeight = '50vh' }) {
  const [addMore, setAddMore] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const textAreaRef = useRef(null);

  const onTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };

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

  const onSaveClick = () => {
    const newList = textareaValue.split(/[,;\s]/).filter(Boolean);
    setListFn((prevState) => [...prevState, ...newList.map((item) => formatValue(item))]);
    setTextareaValue('');
    setAddMore((prevState) => !prevState);
  };

  const formatValue = (value) => {
    switch (transform) {
      case 'domain':
        return sliceDomain(value);

      default:
        return value;
    }
  };

  const createFields = (list, setListFn) => {
    const inputs = [];
    const duplicatedValues = list.filter((item, index) => list.indexOf(item) !== index);
    for (let index = 0; index <= list.length; index++) {
      const isDuplicated = !!duplicatedValues.length;
      const validationObj = validate(list[index]);
      const isValidationError = list.length !== index && (!validationObj.isValueValid || isDuplicated);
      let helperText = '';

      if (isValidationError) {
        helperText = isDuplicated ? 'Duplicated value' : validationObj.helperText;
      }

      inputs.push(
        <Collapse key={index}>
          <ListItem disableGutters disablePadding>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              margin="dense"
              error={isValidationError}
              helperText={helperText}
              name={`${index}`}
              value={list[index] || ''}
              onChange={(e) => handleChange(e, index, list, setListFn)}
              onBlur={(e) =>
                setListFn((prevState) => {
                  const newList = [...prevState];
                  newList[index] = formatValue(e.target.value);
                  setListFn(newList);
                })
              }
              inputProps={{ autoComplete: 'off' }}
              InputProps={
                index === list.length
                  ? undefined
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
          </ListItem>
        </Collapse>,
      );
    }
    return inputs.reverse();
  };

  return (
    <Box className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
      <Collapse in={!addMore} timeout="auto">
        <Box className={`${commonStyles.card}`}>
          <Button type="button" variant="text" onClick={() => setAddMore((prevState) => !prevState)}>
            Bulk adding
          </Button>
        </Box>

        <List sx={{ overflow: 'auto', maxHeight: maxHeight, minHeight: '5rem' }}>
          <TransitionGroup>{createFields(list, setListFn)}</TransitionGroup>
        </List>
      </Collapse>

      <Collapse in={addMore} timeout="auto">
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
          <TextField value={textareaValue} multiline rows={8} onChange={onTextareaChange} inputRef={textAreaRef} />
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button type="button" variant="contained" sx={{ mr: 1 }} onClick={onSaveClick} disabled={!textareaValue}>
              Paste
            </Button>

            <Button type="button" variant="outlined" onClick={() => setAddMore((prevState) => !prevState)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
