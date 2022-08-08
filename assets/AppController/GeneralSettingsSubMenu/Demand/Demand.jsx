import React, { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import ListOfInputs from '../../common/ListOfInputs/ListOfInputs';
import commonStyles from '../../common/commonStyles.scss';

export default function Demand() {
  const [rejectedDomains, setRejectedDomains] = useState([]);
  const [isFieldsValid, setFieldsValid] = useState(true);

  const onSaveClick = () => {
    console.log(rejectedDomains);
    //TODO: send data
  };

  const fieldsHandler = (fields) => {
    if (fields.length > 0) {
      setRejectedDomains(fields.map((field) => field.field));
      setFieldsValid(fields.some((field) => field.isValueValid));
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rejected domains:" subheader="Here you can define domains. All subdomains will be rejected." />
      <CardContent>
        <ListOfInputs initialList={rejectedDomains} fieldsHandler={fieldsHandler} type="domain" maxHeight="calc(100vh - 22rem)" />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={!isFieldsValid} type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
