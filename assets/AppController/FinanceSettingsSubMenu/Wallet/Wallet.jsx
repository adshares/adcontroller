import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControlLabel,
  Icon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import styles from './styles.scss';

const WalletSettingsCard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [nodeHost, setNodeHost] = useState('');
  const [nodePort, setNodePort] = useState('');
  const [editMode, setEditMode] = useState(false);
  return (
    <Card className={styles.card}>
      <Box className={`${styles.flex} ${styles.spaceBetween}`}>
        <CardHeader title="Wallet settings" />
        <Button variant="text" type="button" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </Box>
      <CardContent>
        <>
          <Collapse in={!editMode}>
            <Box className={`${styles.flex}`}>
              <Typography variant="h6">You wallet address:</Typography>
              <Typography variant="h6" sx={{ ml: 1 }}>
                0002-0000064A-3695
              </Typography>
            </Box>
          </Collapse>
          <Collapse in={editMode}>
            <Box className={`${styles.card} ${styles.flex} ${styles.spaceEvenly}`}>
              <TextField
                sx={{ width: '40%' }}
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="walletAddress"
                label="Wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                type="text"
              />

              <TextField
                sx={{ width: '40%' }}
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="secretKey"
                label="Secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                type="text"
              />
            </Box>
            <Box className={`${styles.card} ${styles.flex} ${styles.spaceEvenly}`}>
              <TextField
                sx={{ width: '40%' }}
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="nodeHost"
                label="Node host"
                value={nodeHost}
                onChange={(e) => setNodeHost(e.target.value)}
                type="text"
              />

              <TextField
                sx={{ width: '40%' }}
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="nodePort"
                label="Node port"
                value={nodePort}
                onChange={(e) => setNodePort(e.target.value)}
                type="text"
              />
            </Box>
            <Box className={`${styles.card} ${styles.flex} ${styles.flexEnd}`}>
              <Button variant="contained" type="button">
                Save
              </Button>
            </Box>
          </Collapse>
        </>
      </CardContent>
    </Card>
  );
};

const WalletStatusCard = () => {
  return (
    <Card className={styles.card}>
      <CardHeader title="Wallet status" />
      <CardContent>
        <Box className={styles.flex}>
          <Typography variant="h6">Total balance:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            999,999 ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          {
            // eslint-disable-next-line max-len
            "It is the total balance of all users accounts. It is an amount that should be at least equal to the sum funds stored on hot andcold ADS wallets. The amount exceeding this value is operator's profit"
          }
        </Typography>
      </CardContent>
      <CardContent>
        <Box className={styles.flex}>
          <Typography variant="h6">Unused bonuses:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            1,000 ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci doloremque dolorum eligendi harum ipsa molestias quis
          recusandae. Commodi, debitis dignissimos, dolores enim nisi porro, quos rem repellendus rerum unde veniam.
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
    <Card className={styles.card}>
      <CardContent>
        <Box className={`${styles.flex} ${styles.spaceBetween}`}>
          <Typography variant="h5">Cold wallet settings</Typography>
          <FormControlLabel label="Enable cold wallet" control={<Checkbox checked={isEnabled} onChange={() => setEnabled(!isEnabled)} />} />
        </Box>
      </CardContent>

      <Collapse in={isEnabled} timeout="auto">
        <CardContent>
          <Box className={`${styles.flex} ${styles.spaceAround}`}>
            <Box className={`${styles.flex} ${styles.alignCenter}`}>
              <Tooltip title={'lorem ipsum'}>
                <Icon>
                  <HelpIcon color="primary" />
                </Icon>
              </Tooltip>
              <TextField
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="minThresholdValue"
                label="Min threshold value"
                value={minThresholdValue}
                onChange={(e) => setMinThresholdValue(e.target.value)}
                type="text"
              />
              <Typography sx={{ ml: 1 }} variant="body1">
                ADS
              </Typography>
            </Box>

            <Box className={`${styles.flex} ${styles.alignCenter}`}>
              <Tooltip title={'lorem ipsum'}>
                <Icon>
                  <HelpIcon color="primary" />
                </Icon>
              </Tooltip>
              <TextField
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="maxThresholdValue"
                label="Max threshold value"
                value={maxThresholdValue}
                onChange={(e) => setMaxThresholdValue(e.target.value)}
                type="text"
              />
              <Typography sx={{ ml: 1 }} variant="body1">
                ADS
              </Typography>
            </Box>

            <Box className={`${styles.flex} ${styles.alignCenter}`}>
              <Tooltip title={'lorem ipsum'}>
                <Icon>
                  <HelpIcon color="primary" />
                </Icon>
              </Tooltip>
              <TextField
                // error={!!errorObj.base_adserver_name}
                // helperText={errorObj.base_adserver_name}
                size="small"
                name="coldWalletAddress"
                label="Cold wallet address"
                value={coldWalletAddress}
                onChange={(e) => setColdWalletAddress(e.target.value)}
                type="text"
              />
            </Box>
          </Box>
          <Box className={`${styles.card} ${styles.flex} ${styles.flexEnd}`}>
            <Button variant="contained" type="button">
              Save
            </Button>
          </Box>
        </CardContent>
      </Collapse>
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
