import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useSetCommissionsConfigMutation } from '../../../redux/config/configApi';
import { returnNumber, setDecimalPlaces } from '../../../utils/helpers';
import { useCreateNotification, useForm } from '../../../hooks';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControlLabel,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import commonStyles from '../../common/commonStyles.scss';

function Commissions() {
  const appData = useSelector(configSelectors.getAppData);
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
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = { ...(ReferralRefundEnabled !== appData.AdServer.ReferralRefundEnabled ? { ReferralRefundEnabled } : {}) };
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = returnNumber(form.fields[field]) / 100;
      }
    });

    try {
      await setCommissionsConfig(body).unwrap();
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween}`}>
        <Card className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
          <CardHeader title="Advertiser commission" titleTypographyProps={{ align: 'center' }} />
          <CardContent>
            <Typography variant="body1" align="center">
              Set a commission that will be subtracted from event payments. It will be a part of your income.
            </Typography>
            <Box className={`${commonStyles.flex} ${commonStyles.flexWrap} ${commonStyles.justifyCenter}`}>
              <Slider
                step={0.01}
                valueLabelDisplay="auto"
                size="small"
                name="OperatorTxFee"
                value={returnNumber(form.fields.OperatorTxFee) || 0}
                onChange={form.onChange}
                onFocus={form.setTouched}
              />
              <Box className={`${commonStyles.flex}`}>
                <TextField
                  sx={{ width: '5em' }}
                  variant="standard"
                  size="small"
                  name="OperatorTxFee"
                  error={form.touchedFields.OperatorTxFee && !form.errorObj.OperatorTxFee.isValid}
                  helperText={form.touchedFields.OperatorTxFee && form.errorObj.OperatorTxFee.helperText}
                  value={setDecimalPlaces(form.fields.OperatorTxFee, 2)}
                  onChange={form.onChange}
                  onFocus={form.setTouched}
                  type="number"
                  inputProps={{
                    style: { textAlign: 'center' },
                    min: 0,
                    max: 100,
                    step: 0.01,
                    autoComplete: 'off',
                  }}
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  %
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}>
          <CardHeader title="Publisher commission" titleTypographyProps={{ align: 'center' }} />
          <CardContent>
            <Typography variant="body1" align="center">
              Set a commission that will be subtracted from publishers’ revenue from ads that were displayed. It will be a part of your
              income
            </Typography>
            <Box className={`${commonStyles.flex} ${commonStyles.flexWrap} ${commonStyles.justifyCenter}`}>
              <Slider
                step={0.01}
                valueLabelDisplay="auto"
                size="small"
                name="OperatorRxFee"
                value={returnNumber(form.fields.OperatorRxFee) || 0}
                onChange={form.onChange}
                onFocus={form.setTouched}
              />
              <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <TextField
                  sx={{ width: '5em' }}
                  variant="standard"
                  size="small"
                  name="OperatorRxFee"
                  error={form.touchedFields.OperatorRxFee && !form.errorObj.OperatorRxFee.isValid}
                  helperText={form.touchedFields.OperatorRxFee && form.errorObj.OperatorRxFee.helperText}
                  value={setDecimalPlaces(form.fields.OperatorRxFee, 2)}
                  onChange={form.onChange}
                  onFocus={form.setTouched}
                  type="number"
                  inputProps={{
                    style: { textAlign: 'center' },
                    min: 0,
                    max: 100,
                    step: 0.01,
                    autoComplete: 'off',
                  }}
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  %
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card className={`${commonStyles.card}`}>
        <CardHeader title="Referral settings" />
        <FormControlLabel
          label="Enable refund referral"
          sx={{ pl: 2, whiteSpace: 'nowrap' }}
          control={<Checkbox checked={ReferralRefundEnabled} onChange={() => setReferralRefundEnabled((prevState) => !prevState)} />}
        />
        <Collapse in={ReferralRefundEnabled} timeout="auto">
          <CardContent>
            <Card
              raised
              className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.justifySpaceBetween}`}
            >
              <CardContent>
                <Typography variant="body1" align="center">
                  Set a commission that will refund to the referral program members
                </Typography>
                <Box className={`${commonStyles.flex} ${commonStyles.flexWrap} ${commonStyles.justifyCenter}`}>
                  <Slider
                    step={0.01}
                    valueLabelDisplay="auto"
                    size="small"
                    name="ReferralRefundCommission"
                    value={returnNumber(form.fields.ReferralRefundCommission) || 0}
                    onChange={form.onChange}
                    onFocus={form.setTouched}
                  />
                  <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                    <TextField
                      sx={{ width: '5em' }}
                      variant="standard"
                      size="small"
                      name="ReferralRefundCommission"
                      error={form.touchedFields.ReferralRefundCommission && !form.errorObj.ReferralRefundCommission.isValid}
                      helperText={form.touchedFields.ReferralRefundCommission && form.errorObj.ReferralRefundCommission.helperText}
                      value={setDecimalPlaces(form.fields.ReferralRefundCommission, 2)}
                      onChange={form.onChange}
                      onFocus={form.setTouched}
                      type="number"
                      inputProps={{
                        style: { textAlign: 'center' },
                        min: 0,
                        max: 100,
                        step: 0.01,
                        autoComplete: 'off',
                      }}
                    />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      %
                    </Typography>
                  </Box>
                </Box>
                <Collapse in={Number(form.fields.OperatorRxFee) < Number(form.fields.ReferralRefundCommission)} timeout="auto">
                  <Alert severity="warning">Referral refund should not be greater than a publisher commission</Alert>
                </Collapse>
              </CardContent>
            </Card>
          </CardContent>
        </Collapse>
      </Card>

      <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
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
