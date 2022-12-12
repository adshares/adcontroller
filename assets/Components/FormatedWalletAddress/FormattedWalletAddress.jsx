import React, { useState } from 'react';
import { Tooltip, Typography } from '@mui/material';

export default function FormattedWalletAddress({ wallet }) {
  const [addressWasCopied, setAddressCopied] = useState(false);
  const parseConnectedWallet = (wallet) => {
    if (!wallet) {
      return null;
    }
    return (
      <Tooltip
        onClose={() => setTimeout(() => setAddressCopied(false), 100)}
        title={
          addressWasCopied ? (
            'Address was copied'
          ) : (
            <span>
              Click for copy <br /> {wallet}
            </span>
          )
        }
      >
        <Typography
          sx={{ cursor: 'pointer' }}
          variant="body2"
          onClick={() => {
            setAddressCopied(true);
            return navigator.clipboard.writeText(wallet);
          }}
        >
          {wallet.length > 18 ? wallet.slice(0, 15) + '...' : wallet}
        </Typography>
      </Tooltip>
    );
  };

  return parseConnectedWallet(wallet);
}
