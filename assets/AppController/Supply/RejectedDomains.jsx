import React, { useState } from 'react';
import { useCreateNotification } from '../../hooks';
import { useGetRejectedDomainsQuery, useSetRejectedDomainsSettingsConfigMutation } from '../../redux/config/configApi';
import ListOfInputs from '../../Components/ListOfInputs/ListOfInputs';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';

export default function RejectedDomains() {
  return (
    <>
      <RejectedDomainsCard sx={{ mt: 3 }} />
    </>
  );
}

const RejectedDomainsCard = (props) => {
  const { data, isFetching } = useGetRejectedDomainsQuery({}, { refetchOnMountOrArgChange: true });
  const [setRejectedDomainsSettings, { isLoading }] = useSetRejectedDomainsSettingsConfigMutation();
  const { createSuccessNotification } = useCreateNotification();

  const [RejectedDomains, setRejectedDomains] = useState([]);
  const [isListValid, setListValid] = useState(true);
  const [isListWasChanged, setListWasChanged] = useState(false);

  const onSaveClick = async () => {
    const body = {
      ...(isListWasChanged ? { RejectedDomains: RejectedDomains } : {}),
    };

    const response = await setRejectedDomainsSettings(body);

    if (response.data && response.data.message === 'OK') {
      createSuccessNotification();
    }
  };

  const fieldsHandler = (event) => {
    const { isValuesValid, isListWasChanged, list } = event;
    setRejectedDomains(list);
    setListValid(list.length > 0 ? isValuesValid : true);
    setListWasChanged(isListWasChanged);
  };

  return (
    <Card {...props}>
      <CardHeader
        title="Rejected domains"
        subheader="Set the domains that will be banned. Users will not be able to add a site with such domains. All
         subdomains will also be banned."
      />
      <CardContent>
        {!isFetching && data?.data.rejectedDomains && (
          <ListOfInputs initialList={data.data.rejectedDomains} fieldsHandler={fieldsHandler} listName="RejectedDomains" type="domain" />
        )}
      </CardContent>
      <CardActions>
        <Button
          disabled={isFetching || isLoading || !isListWasChanged || !isListValid}
          type="button"
          variant="contained"
          onClick={onSaveClick}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
