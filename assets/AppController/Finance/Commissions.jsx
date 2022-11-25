import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { useSetCommissionsConfigMutation } from '../../redux/config/configApi';
import { changeCommissionsConfigInformation } from '../../redux/config/configSlice';
import { returnNumber, setDecimalPlaces } from '../../utils/helpers';
import { useCreateNotification, useForm } from '../../hooks';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
  Slider,
  Typography,
} from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';

function Commissions() {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setCommissionsConfig, { isLoading }] = useSetCommissionsConfigMutation();
  const form = useForm({
    initialFields: {
      OperatorRxFee: (Math.round(appData.AdServer.OperatorRxFee * 10000) / 100).toString(),
      OperatorTxFee: (Math.round(appData.AdServer.OperatorTxFee * 10000) / 100).toString(),
      ReferralRefundCommission: (Math.round(appData.AdServer.ReferralRefundCommission * 10000) / 100).toString(),
    },
    validation: {
      OperatorRxFee: ['number'],
      OperatorTxFee: ['number'],
      ReferralRefundCommission: ['number'],
    },
  });
  const [ReferralRefundEnabled, setReferralRefundEnabled] = useState(appData.AdServer.ReferralRefundEnabled);
  const { createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = { ...(ReferralRefundEnabled !== appData.AdServer.ReferralRefundEnabled ? { ReferralRefundEnabled } : {}) };
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = returnNumber(form.fields[field]) / 100;
      }
    });

    const response = await setCommissionsConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeCommissionsConfigInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: '1060px', display: 'flex' }}>
        <Card
          sx={{ height: '100%', mr: 2 }}
          className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}
        >
          <CardHeader
            title="Advertiser commission"
            subheader="Set a commission that will be subtracted from event payments. It will be a part of your income."
          />
          <CardContent>
            <Slider
              color="secondary"
              step={0.01}
              valueLabelDisplay="auto"
              size="small"
              name="OperatorTxFee"
              value={returnNumber(form.fields.OperatorTxFee) || 0}
              onChange={form.onChange}
              onFocus={form.setTouched}
            />
            <FormControl fullWidth error={form.touchedFields.OperatorTxFee && !form.errorObj.OperatorTxFee.isValid}>
              <OutlinedInput
                sx={{ mt: 3.5 }}
                color="secondary"
                name="OperatorTxFee"
                type="number"
                startAdornment={<InputAdornment position="start">%</InputAdornment>}
                value={setDecimalPlaces(form.fields.OperatorTxFee, 2)}
                onChange={form.onChange}
                onFocus={form.setTouched}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
                  autoComplete: 'off',
                }}
              />
              <FormHelperText>{form.touchedFields.OperatorTxFee && form.errorObj.OperatorTxFee.helperText}</FormHelperText>
            </FormControl>
          </CardContent>
        </Card>

        <Card className={`${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
          <CardHeader
            title="Publisher commission"
            subheader="Set a commission that will be subtracted from publishers’ revenue from ads that were displayed. It will be a part of your income."
          />
          <CardContent>
            <Slider
              color="secondary"
              step={0.01}
              valueLabelDisplay="auto"
              size="small"
              name="OperatorRxFee"
              value={returnNumber(form.fields.OperatorRxFee) || 0}
              onChange={form.onChange}
              onFocus={form.setTouched}
            />
            <FormControl fullWidth error={form.touchedFields.OperatorRxFee && !form.errorObj.OperatorRxFee.isValid}>
              <OutlinedInput
                sx={{ mt: 3.5 }}
                color="secondary"
                name="OperatorRxFee"
                type="number"
                startAdornment={<InputAdornment position="start">%</InputAdornment>}
                value={setDecimalPlaces(form.fields.OperatorRxFee, 2)}
                onChange={form.onChange}
                onFocus={form.setTouched}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
                  autoComplete: 'off',
                }}
              />
              <FormHelperText>{form.touchedFields.OperatorRxFee && form.errorObj.OperatorRxFee.helperText}</FormHelperText>
            </FormControl>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardHeader title="Refund program" subheader="Set a commission that will be refund to the program members." />
        <FormControlLabel
          label="Enable refund program"
          sx={{ pl: 2, whiteSpace: 'nowrap' }}
          control={<Checkbox checked={ReferralRefundEnabled} onChange={() => setReferralRefundEnabled((prevState) => !prevState)} />}
        />
        <Collapse in={ReferralRefundEnabled} timeout="auto">
          <CardContent>
            <Slider
              color="secondary"
              step={0.01}
              valueLabelDisplay="auto"
              size="small"
              name="ReferralRefundCommission"
              value={returnNumber(form.fields.ReferralRefundCommission) || 0}
              onChange={form.onChange}
              onFocus={form.setTouched}
            />
            <FormControl fullWidth error={form.touchedFields.ReferralRefundCommission && !form.errorObj.ReferralRefundCommission.isValid}>
              <OutlinedInput
                sx={{ mt: 3.5 }}
                color="secondary"
                name="ReferralRefundCommission"
                type="number"
                startAdornment={<InputAdornment position="start">%</InputAdornment>}
                value={setDecimalPlaces(form.fields.ReferralRefundCommission, 2)}
                onChange={form.onChange}
                onFocus={form.setTouched}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
                  autoComplete: 'off',
                }}
              />
              <FormHelperText>
                {form.touchedFields.ReferralRefundCommission && form.errorObj.ReferralRefundCommission.helperText}
              </FormHelperText>
            </FormControl>
            <Collapse in={Number(form.fields.OperatorRxFee) < Number(form.fields.ReferralRefundCommission)} timeout="auto">
              <Alert sx={{ mt: 3 }} severity="warning">
                <Typography variant="alert">The refund should be no more than the publisher's commission.</Typography>
              </Alert>
            </Collapse>
          </CardContent>
        </Collapse>
      </Card>

      <Box sx={{ maxWidth: '1060px' }} className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
        <Button
          disabled={
            (appData.AdServer.ReferralRefundEnabled === ReferralRefundEnabled && !form.isFormWasChanged) || isLoading || !form.isFormValid
          }
          onClick={onSaveClick}
          variant="contained"
          type="button"
        >
          Save
        </Button>
      </Box>
    </>
  );
}

export default Commissions;
