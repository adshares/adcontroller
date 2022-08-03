import React, { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import ListOfInputs from '../../common/ListOfInputs/ListOfInputs';
import commonStyles from '../../common/commonStyles.scss';

export default function Demand() {
  const [rejectedDomains, setRejectedDomains] = useState([]);

  const onSaveClick = () => {
    console.log(rejectedDomains);
    //TODO: send data
  };

  const validateInput = (value) => {
    const isEmptyField = !value;
    const isValid = !isEmptyField;
    let helperText = '';

    if (isEmptyField) {
      helperText = 'Field cannot be empty. Enter domain or remove field';
    }
    return {
      isValid,
      helperText,
    };
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rejected domains:" subheader="Here you can define domains. All subdomains will be rejected." />
      <CardContent>
        <ListOfInputs
          type="domain"
          list={rejectedDomains}
          setListFn={setRejectedDomains}
          validate={validateInput}
          maxHeight="calc(100vh - 22rem)"
        />
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
