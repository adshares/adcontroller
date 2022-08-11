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
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';

export default function Settings() {
  return (
    <>
      <RegistrationModeCard />
      <AutoWithdrawalCard />
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
  const [advertiserApplyFormUrl, setAdvertiserApplyFormUrl] = useState('');
  const [publisherApplyFormUrl, setPublisherApplyFormUrl] = useState('');

  const handleSelectChange = (event) => {
    setRegistrationMode(event.target.value);
  };

  const onSaveClick = () => {
    console.log({
      registrationMode,
      emailVerificationRequired,
      autoAccountConfirmation,
      autoRegistrationAllowed,
      advertiserApplyFormUrl,
      publisherApplyFormUrl,
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
              size="small"
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
            <FormControl fullWidth>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                margin="dense"
                label="Advertiser apply form URL"
                value={advertiserApplyFormUrl}
                onChange={(e) => setAdvertiserApplyFormUrl(e.target.value)}
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                margin="dense"
                label="Publisher apply form URL"
                value={publisherApplyFormUrl}
                onChange={(e) => setPublisherApplyFormUrl(e.target.value)}
                inputProps={{ autoComplete: 'off' }}
              />
            </FormControl>
          </Collapse>

          <Collapse in={registrationMode !== 'private'} timeout="auto">
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
          </Collapse>
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

const AutoWithdrawalCard = () => {
  const [adsWithdrawal, setAdsWithdrawal] = useState(0);
  const [bscWithdrawal, setBscWithdrawal] = useState(0);
  const onSaveClick = () => {
    console.log({ adsWithdrawal: Number(adsWithdrawal), bscWithdrawal: Number(bscWithdrawal) });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Auto withdrawal" subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit." />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <FormControl sc={{ width: '50%' }} margin="dense">
            <InputLabel htmlFor="adsWithdrawal">Auto ADS withdrawal</InputLabel>
            <OutlinedInput
              id="adsWithdrawal"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="ADS minimum withdrawal"
              value={Number(adsWithdrawal).toString()}
              onChange={(e) => setAdsWithdrawal(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
          <FormControl sc={{ width: '50%' }} margin="dense">
            <InputLabel htmlFor="bscWithdrawal">Auto BSC withdrawal</InputLabel>
            <OutlinedInput
              id="bscWithdrawal"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="BSC minimum withdrawal"
              value={Number(bscWithdrawal).toString()}
              onChange={(e) => setBscWithdrawal(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
        </Box>
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
