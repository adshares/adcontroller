import React, { useEffect, useState } from 'react';
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
import commonStyles from '../../commonStyles.scss';

function Commissions() {
  const [publisherCommission, setPublisherCommission] = useState(0);
  const [advertiserCommission, setAdvertiserCommission] = useState(0);
  const [isRefundReferralEnabled, setIsRefundReferralEnabled] = useState(true);
  const [refundReferral, setRefundReferral] = useState(0);

  //TODO: Add service to read write and change commissions values
  useEffect(() => {
    setPublisherCommission(10);
    setAdvertiserCommission(20);
    setRefundReferral(10.53);
  }, []);

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
                value={Number(advertiserCommission) || 0}
                onChange={(e) => setAdvertiserCommission(e.target.value)}
              />
              <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <TextField
                  variant="standard"
                  sx={{ width: '5em' }}
                  size="small"
                  name="publisherCommission"
                  inputProps={{ style: { textAlign: 'center' }, min: 0, max: 100, step: 0.01, autoComplete: 'off' }}
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
                value={Number(publisherCommission) || 0}
                onChange={(e) => setPublisherCommission(e.target.value)}
              />
              <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <TextField
                  variant="standard"
                  sx={{ width: '5em' }}
                  size="small"
                  name="publisherCommission"
                  inputProps={{ style: { textAlign: 'center' }, min: 0, max: 100, step: 0.01, autoComplete: 'off' }}
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

      <Card className={`${commonStyles.card}`}>
        <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween}`}>
          <CardHeader title="Referral settings" />
          <FormControlLabel
            label="Enable refund referral"
            control={<Checkbox checked={isRefundReferralEnabled} onChange={() => setIsRefundReferralEnabled(!isRefundReferralEnabled)} />}
          />
        </Box>
        <Collapse in={isRefundReferralEnabled} timeout="auto">
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
                    value={Number(refundReferral) || 0}
                    onChange={(e) => setRefundReferral(e.target.value)}
                  />
                  <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                    <TextField
                      variant="standard"
                      sx={{ width: '5em' }}
                      size="small"
                      name="publisherCommission"
                      inputProps={{ style: { textAlign: 'center' }, min: 0, max: 100, step: 0.01, autoComplete: 'off' }}
                      value={Number(refundReferral).toString()}
                      onChange={(e) => setRefundReferral(Number(e.target.value).toFixed(2))}
                      type="number"
                    />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      %
                    </Typography>
                  </Box>
                </Box>
                <Collapse in={publisherCommission < refundReferral} timeout="auto">
                  <Alert severity="warning">Referral refund should not be greater than a publisher commission</Alert>
                </Collapse>
              </CardContent>
            </Card>
          </CardContent>
        </Collapse>
      </Card>

      <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
        <Button variant="contained" type="button">
          Save
        </Button>
      </Box>
    </>
  );
}

export default Commissions;
