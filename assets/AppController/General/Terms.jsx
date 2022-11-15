import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../hooks';
import { useSetRegulationsConfigMutation } from '../../redux/config/configApi';
import { changeRegulationsInformation } from '../../redux/config/configSlice';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Grid } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import CollapsibleTextarea from '../../Components/CollapsibleTextarea/CollapsibleTextarea';

export default function Terms() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <PrivacyCard />
      </Grid>
      <Grid item xs={6}>
        <TermAndConditionCard />
      </Grid>
    </Grid>
  );
}

const PrivacyCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRegulationsConfig, { isLoading }] = useSetRegulationsConfigMutation();
  const form = useForm({
    initialFields: {
      PrivacyPolicy: appData.AdServer.PrivacyPolicy || '',
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {
      ...(form.changedFields.PrivacyPolicy ? { PrivacyPolicy: form.fields.PrivacyPolicy } : {}),
    };

    const response = await setRegulationsConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeRegulationsInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card className={commonStyles.card} width="mainContainer">
      <CardHeader title="Privacy policy" />
      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <CollapsibleTextarea
            collapsible
            value={form.fields.PrivacyPolicy}
            name="PrivacyPolicy"
            fullWidth
            multiline
            rows={20}
            label="Privacy"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const TermAndConditionCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRegulationsConfig, { isLoading }] = useSetRegulationsConfigMutation();
  const form = useForm({
    initialFields: {
      Terms: appData.AdServer.Terms || '',
    },
  });
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {
      ...(form.changedFields.Terms ? { Terms: form.fields.Terms } : {}),
    };

    const response = await setRegulationsConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeRegulationsInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card className={commonStyles.card} width="mainContainer">
      <CardHeader title="Terms and conditions" />
      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <CollapsibleTextarea
            collapsible
            value={form.fields.Terms}
            name="Terms"
            fullWidth
            multiline
            rows={20}
            label="Terms and conditions"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
