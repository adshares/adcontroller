import React, { useState } from 'react';
import {
  Alert,
  Box,
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
import styles from '../Wallet/styles.scss';

const Commissions = () => {
  const [publisherCommission, setPublisherCommission] = useState(10);
  const [advertiserCommission, setAdvertiserCommission] = useState(50);
  const [isRefundReferralEnabled, setIsRefundReferralEnabled] = useState(true);
  const [refundReferral, setRefundReferral] = useState(27.83);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Card sx={{ width: 'calc(50% - 8px)' }}>
          <CardHeader title="Advertiser commission" titleTypographyProps={{ align: 'center' }} />
          <CardContent>
            <Typography variant="body1" align="center">
              Set a commission that will be subtracted from event payments. It will be a part of your income.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Slider
                step={0.01}
                valueLabelDisplay="auto"
                size="small"
                value={Number(advertiserCommission) || 0}
                onChange={(e) => setAdvertiserCommission(e.target.value)}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  variant="standard"
                  sx={{ width: '5em' }}
                  size="small"
                  name="publisherCommission"
                  inputProps={{ style: { textAlign: 'center' }, min: 0, max: 100, step: 0.01 }}
                  value={Number(advertiserCommission).toString()}
                  onChange={(e) => setAdvertiserCommission(Number(e.target.value).toFixed(2))}
                  type="number"
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  %
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ width: 'calc(50% - 8px)' }}>
          <CardHeader title="Publisher commission" titleTypographyProps={{ align: 'center' }} />
          <CardContent>
            <Typography variant="body1" align="center">
              Set a commission that will be subtracted from publishers’ revenue from ads that were displayed. It will be a part of your
              income
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Slider
                step={0.01}
                valueLabelDisplay="auto"
                size="small"
                value={Number(publisherCommission) || 0}
                onChange={(e) => setPublisherCommission(e.target.value)}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  variant="standard"
                  sx={{ width: '5em' }}
                  size="small"
                  name="publisherCommission"
                  inputProps={{ style: { textAlign: 'center' }, min: 0, max: 100, step: 0.01 }}
                  value={Number(publisherCommission).toString()}
                  onChange={(e) => setPublisherCommission(Number(e.target.value).toFixed(2))}
                  type="number"
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  %
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Card sx={{ mt: 1, width: '100%' }}>
        <Box className={`${styles.flex} ${styles.spaceBetween}`}>
          <CardHeader title="Referral settings" />
          <FormControlLabel
            label="Enable refund referral"
            control={<Checkbox checked={isRefundReferralEnabled} onChange={() => setIsRefundReferralEnabled(!isRefundReferralEnabled)} />}
          />
        </Box>

        <Collapse in={isRefundReferralEnabled} timeout="auto">
          <CardContent>
            <Card raised sx={{ width: 'calc(50% - 8px)' }}>
              <CardContent>
                <Typography variant="body1" align="center">
                  Set a commission that will refund to the referral program members
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Slider
                    step={0.01}
                    valueLabelDisplay="auto"
                    size="small"
                    value={Number(refundReferral) || 0}
                    onChange={(e) => setRefundReferral(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      variant="standard"
                      sx={{ width: '5em' }}
                      size="small"
                      name="publisherCommission"
                      inputProps={{ style: { textAlign: 'center' }, min: 0, max: 100, step: 0.01 }}
                      value={Number(refundReferral).toString()}
                      onChange={(e) => setRefundReferral(Number(e.target.value).toFixed(2))}
                      type="number"
                    />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      %
                    </Typography>
                  </Box>
                </Box>
                {publisherCommission < refundReferral && (
                  <Alert severity="warning">Referral refund should not be greater than a publisher commission</Alert>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
};

export default Commissions;
