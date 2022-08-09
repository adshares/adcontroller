import React, { useState } from 'react';
import commonStyles from '../../common/commonStyles.scss';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

export default function Users() {
  return (
    <>
      <RegistrationModeCard />
      <PrivacyCard />
      <TermAndConditionCard />
    </>
  );
}

const RegistrationModeCard = () => {
  const [registrationMode, setRegistrationMode] = useState('public');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [autoAccountConfirmation, setAutoAccountConfirmation] = useState(false);
  const [autoRegistrationAllowed, setAutoRegistrationAllowed] = useState(false);
  const [advertiserApplyFromUrl, setAdvertiserApplyFromUrl] = useState(false);
  const [publisherApplyFromUrl, setPublisherApplyFromUrl] = useState(false);

  const handleSelectChange = (event) => {
    setRegistrationMode(event.target.value);
  };

  const onSaveClick = () => {
    console.log({
      registrationMode,
      emailVerificationRequired,
      autoAccountConfirmation,
      autoRegistrationAllowed,
      advertiserApplyFromUrl,
      publisherApplyFromUrl,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Registration mode" subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit." />

      <Box sx={{ p: 2 }} className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box raised className={commonStyles.halfCard}>
          <FormControl fullWidth>
            <InputLabel id="registrationModeLabel">Set registration mode</InputLabel>
            <Select
              labelId="registrationModeLabel"
              id="registrationMode"
              value={registrationMode}
              label="Set registration mode"
              onChange={handleSelectChange}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>

          <Collapse in={registrationMode === 'restricted'} timeout="auto">
            <FormControl>
              <FormControlLabel
                label="Apply advertiser from URL"
                control={
                  <Checkbox checked={advertiserApplyFromUrl} onChange={() => setAdvertiserApplyFromUrl((prevState) => !prevState)} />
                }
              />
              <FormControlLabel
                label="Apply publisher from URL"
                control={<Checkbox checked={publisherApplyFromUrl} onChange={() => setPublisherApplyFromUrl((prevState) => !prevState)} />}
              />
            </FormControl>
          </Collapse>

          <FormControl>
            <FormControlLabel
              label="E-mail verification required"
              control={
                <Checkbox checked={emailVerificationRequired} onChange={() => setEmailVerificationRequired((prevState) => !prevState)} />
              }
            />
            <FormControlLabel
              label="Auto account confirmation"
              control={
                <Checkbox checked={autoAccountConfirmation} onChange={() => setAutoAccountConfirmation((prevState) => !prevState)} />
              }
            />
            <FormControlLabel
              label="Auto registration allowed"
              control={
                <Checkbox checked={autoRegistrationAllowed} onChange={() => setAutoRegistrationAllowed((prevState) => !prevState)} />
              }
            />
          </FormControl>
        </Box>
      </Box>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const PrivacyCard = () => {
  const [privacyTextField, setPrivacyTextField] = useState('');

  const onSaveClick = () => {
    console.log(privacyTextField);
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Privacy" subheader="Here you can read and edit your privacy settings" />
      <CardContent>
        <TextField
          value={privacyTextField}
          onChange={(e) => setPrivacyTextField(e.target.value)}
          fullWidth
          multiline
          rows={8}
          label="Privacy"
        />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const TermAndConditionCard = () => {
  const [termsAndConditionTextField, setTermsAndConditionTextField] = useState('');

  const onSaveClick = () => {
    console.log(termsAndConditionTextField);
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Terms and conditions" subheader="Here you can read and edit your terms and conditions" />
      <CardContent>
        <TextField
          value={termsAndConditionTextField}
          onChange={(e) => setTermsAndConditionTextField(e.target.value)}
          fullWidth
          multiline
          rows={8}
          label="Terms and conditions"
        />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
