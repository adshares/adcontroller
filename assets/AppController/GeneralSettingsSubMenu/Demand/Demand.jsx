import React, { useRef, useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, TextField } from '@mui/material';
import commonStyles from '../../commonStyles.scss';

export default function Demand() {
  const [textareaValue, setTextareaValue] = useState('');
  const textareaRef = useRef(null);

  const onTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };

  const onSaveClick = () => {
    const rejectedDomains = textareaValue
      .split(/[,;\[\]{}()|\s]/)
      .filter(Boolean)
      .filter((el, idx, arr) => arr.indexOf(el) === idx);
    console.log(rejectedDomains);
    setTextareaValue(rejectedDomains.join('\n'));
    //TODO: send data
  };

  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Rejected domains" subheader="Here you can define domains. All subdomains will be rejected." />

      <CardContent>
        <TextField inputRef={textareaRef} value={textareaValue} multiline rows={8} fullWidth onChange={onTextareaChange} />
      </CardContent>

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
