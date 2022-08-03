import React, { useRef, useState } from 'react';
import { Box, Button, Checkbox, Collapse, FormControlLabel, IconButton, InputAdornment, List, ListItem, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../commonStyles.scss';
import { TransitionGroup } from 'react-transition-group';

export default function ListOfInputs({ list, setListFn, validate, maxHeight = '50vh' }) {
  const [addMore, setAddMore] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
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

  const onSaveClick = () => {
    const newList = textareaValue.split(/[,;\s]/).filter(Boolean);
    setListFn((prevState) => [...prevState, ...newList]);
    setTextareaValue('');
    setAddMore((prevState) => !prevState);
  };

  const createFields = (list, setListFn) => {
    const inputs = [];
    const duplicatedValues = list.filter((item, index) => list.indexOf(item) !== index);
    for (let index = 0; index <= list.length; index++) {
      const isDuplicated = duplicatedValues.some((el) => el === list[index]);
      const validationObj = validate(list[index]);
      const isValidationError = list.length !== index && (!validationObj.isValid || isDuplicated);
      let helperText = '';

      if (isValidationError) {
        helperText = isDuplicated ? 'Duplicated value' : validationObj.helperText;
      }

      inputs.push(
        <Collapse key={index}>
          <ListItem disableGutters disablePadding>
            <TextField
              error={isValidationError}
              helperText={helperText}
              fullWidth
              name={`${index}`}
              variant="outlined"
              size="small"
              margin="dense"
              value={list[index] || ''}
              onChange={(e) => handleChange(e, index, list, setListFn)}
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

  const onTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };

  return (
    <Box className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
      <FormControlLabel
        label="Paste a few"
        control={<Checkbox checked={addMore} onChange={() => setAddMore((prevState) => !prevState)} />}
      />

      <Collapse in={!addMore} timeout="auto">
        <List sx={{ overflow: 'auto', maxHeight: maxHeight, minHeight: '5rem' }}>
          <TransitionGroup>{createFields(list, setListFn)}</TransitionGroup>
        </List>
      </Collapse>

      <Collapse in={addMore} timeout="auto">
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.flexColumn}`}>
          <TextField value={textareaValue} multiline rows={8} onChange={onTextareaChange} inputRef={textAreaRef} />
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button type="button" variant="contained" sx={{ mr: 1 }} onClick={onSaveClick}>
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
