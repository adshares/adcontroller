import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControlLabel,
  Icon,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../common/commonStyles.scss';

function WalletSettingsCard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [nodeHost, setNodeHost] = useState('');
  const [nodePort, setNodePort] = useState('');
  const [editMode, setEditMode] = useState(false);
  return (
    <Card className={commonStyles.card}>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader title="Wallet settings" />
        <IconButton type="button" onClick={() => setEditMode(!editMode)}>
          {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
        </IconButton>
      </Box>
      <CardContent>
        <>
          <Collapse in={!editMode} timeout="auto">
            <Box className={`${commonStyles.flex}`}>
              <Typography variant="h6">You wallet address:</Typography>
              <Typography variant="h6" sx={{ ml: 1 }}>
                {/*TODO: Add service to read wallet address*/}
                0002-0000064A-3695
              </Typography>
            </Box>
          </Collapse>
          <Collapse in={editMode} timeout="auto">
            <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifySpaceEvenly}`}>
              <TextField
                sx={{ width: '40%' }}
                size="small"
                name="walletAddress"
                label="Wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />

              <TextField
                sx={{ width: '40%' }}
                size="small"
                name="secretKey"
                label="Secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifySpaceEvenly}`}>
              <TextField
                sx={{ width: '40%' }}
                size="small"
                name="nodeHost"
                label="Node host"
                value={nodeHost}
                onChange={(e) => setNodeHost(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />

              <TextField
                sx={{ width: '40%' }}
                size="small"
                name="nodePort"
                label="Node port"
                value={nodePort}
                onChange={(e) => setNodePort(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
              <Button variant="contained" type="button">
                Save
              </Button>
            </Box>
          </Collapse>
        </>
      </CardContent>
    </Card>
  );
}

const WalletStatusCard = () => {
  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Wallet status" />
      <CardContent>
        <Box className={commonStyles.flex}>
          <Typography variant="h6">Total balance:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {/*TODO: Add service for read wallet balance*/}
            999,999 ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          It is the total balance of all users accounts. It is an amount that should be at least equal to the sum funds stored on hot and
          cold ADS wallets. The amount exceeding this value is operator's profit
        </Typography>
      </CardContent>
      <CardContent>
        <Box className={commonStyles.flex}>
          <Typography variant="h6">Unused bonuses:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {/*TODO: Add service for read wallet balance*/}
            1,000 ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          It is the total amount of all bonuses that were added to users' accounts but have not been used so far.
        </Typography>
      </CardContent>
    </Card>
  );
};

const ColdWalletSettingsCard = () => {
  const [isEnabled, setEnabled] = useState(true);
  const [minThresholdValue, setMinThresholdValue] = useState('');
  const [maxThresholdValue, setMaxThresholdValue] = useState('');
  const [coldWalletAddress, setColdWalletAddress] = useState('');
  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Cold wallet settings" />
      <FormControlLabel
        sx={{ pl: 2 }}
        label="Enable cold wallet"
        control={<Checkbox checked={isEnabled} onChange={() => setEnabled(!isEnabled)} />}
      />

      <Collapse in={isEnabled} timeout="auto">
        <CardContent>
          <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceAround}`}>
            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <TextField
                size="small"
                name="minThresholdValue"
                label="Min threshold value"
                value={minThresholdValue}
                onChange={(e) => setMinThresholdValue(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
              <Typography sx={{ ml: 1 }} variant="body1">
                ADS
              </Typography>
              <Tooltip
                title={
                  // eslint-disable-next-line max-len
                  'Set a minimum amount required to run operations. In case the amount drops below the specified threshold, you will be notified via e-mail'
                }
              >
                <Icon>
                  <HelpIcon color="primary" />
                </Icon>
              </Tooltip>
            </Box>

            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <TextField
                size="small"
                name="maxThresholdValue"
                label="Max threshold value"
                value={maxThresholdValue}
                onChange={(e) => setMaxThresholdValue(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
              <Typography sx={{ ml: 1 }} variant="body1">
                ADS
              </Typography>
              <Tooltip
                title={
                  // eslint-disable-next-line max-len
                  'Set a maximum amount that can be stored on a hot wallet. All funds exceeding this amount will be automatically transferred to your cold wallet.'
                }
              >
                <Icon>
                  <HelpIcon color="primary" />
                </Icon>
              </Tooltip>
            </Box>

            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <TextField
                size="small"
                name="coldWalletAddress"
                label="Cold wallet address"
                value={coldWalletAddress}
                onChange={(e) => setColdWalletAddress(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
              <Tooltip title="Enter your ADS account address">
                <Icon>
                  <HelpIcon color="primary" />
                </Icon>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const Wallet = () => {
  return (
    <>
      <WalletSettingsCard />
      <WalletStatusCard />
      <ColdWalletSettingsCard />
    </>
  );
};

export default Wallet;
