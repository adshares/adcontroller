import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useCreateNotification } from '../../hooks';
import { useSetRejectedDomainsSettingsConfigMutation } from '../../redux/config/configApi';
import { changeRejectedDomainsInformation } from '../../redux/config/configSlice';
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
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
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
      dispatch(changeRejectedDomainsInformation(response.data.data));
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
        <ListOfInputs
          initialList={appData.AdServer.RejectedDomains}
          fieldsHandler={fieldsHandler}
          listName="RejectedDomains"
          type="domain"
        />
      </CardContent>
      <CardActions>
        <Button disabled={isLoading || !isListWasChanged || !isListValid} type="button" variant="contained" onClick={onSaveClick}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
};
