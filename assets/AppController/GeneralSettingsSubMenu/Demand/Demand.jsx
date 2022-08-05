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

  const validateValue = (value) => {
    const isEmptyField = !value;
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))', // OR ip (v4) address
      'i',
    );
    const isValidUrl = value ? urlPattern.test(value) : false;

    const isValueValid = !isEmptyField && isValidUrl;
    let helperText = '';

    if (isEmptyField) {
      helperText = 'Field cannot be empty. Enter domain or remove field';
    } else if (!isValidUrl) {
      helperText = 'Field must be a domain';
    }
    return {
      isValueValid,
      helperText,
    };
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rejected domains:" subheader="Here you can define domains. All subdomains will be rejected." />
      <CardContent>
        <ListOfInputs
          transform="domain"
          list={rejectedDomains}
          setListFn={setRejectedDomains}
          validate={validateValue}
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
