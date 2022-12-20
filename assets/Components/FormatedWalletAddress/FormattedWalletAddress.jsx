import React, { useState } from 'react';
import { Tooltip, Typography } from '@mui/material';

export default function FormattedWalletAddress({ wallet, variant = 'tableBody2' }) {
  const [addressWasCopied, setAddressCopied] = useState(false);
  const parseConnectedWallet = (wallet) => {
    if (!wallet) {
      return null;
    }
    return (
      <Tooltip
        onClose={() => setTimeout(() => setAddressCopied(false), 200)}
        title={
          addressWasCopied ? (
            <Typography variant="tableText2">Address was copied</Typography>
          ) : (
            <Typography variant="tableText2">
              Click for copy{' '}
              <Typography variant="tableText2" sx={{ fontFamily: 'Monospace' }}>
                {wallet}
              </Typography>
            </Typography>
          )
        }
      >
        <Typography
          sx={{ cursor: 'pointer', fontFamily: 'Monospace' }}
          variant={variant}
          onClick={() => {
            setAddressCopied(true);
            return navigator.clipboard.writeText(wallet);
          }}
        >
          {wallet.length > 18 ? wallet.slice(0, 9) + String.fromCharCode(8230) + wallet.slice(wallet.length - 9) : wallet}
        </Typography>
      </Tooltip>
    );
  };

  return parseConnectedWallet(wallet);
}
