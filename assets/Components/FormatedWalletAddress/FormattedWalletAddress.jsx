import React, { useState } from 'react';
import { Link, Tooltip, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

export default function FormattedWalletAddress({ wallet, variant = 'tableText2', sx = {} }) {
  const [addressWasCopied, setAddressCopied] = useState(false);
  const parseConnectedWallet = (wallet) => {
    if (!wallet) {
      return null;
    }
    const href =
      18 === wallet.length
        ? `https://operator.adshares.net/blockexplorer/accounts/${wallet}`
        : `https://bscscan.com/address/${wallet}#tokentxns`;

    return (
      <>
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
            sx={{ cursor: 'pointer', ...sx }}
            variant={variant}
            onClick={() => {
              setAddressCopied(true);
              return navigator.clipboard.writeText(wallet);
            }}
          >
            {wallet.length > 18 ? wallet.slice(0, 8) + '…' + wallet.slice(wallet.length - 6) : wallet}
          </Typography>
        </Tooltip>
        <Link href={href} target="_blank" rel="nofollow noopener noreferrer" underline={'none'}>
          <LinkIcon sx={{ ml: '0.5rem', verticalAlign: 'middle' }} />
        </Link>
      </>
    );
  };

  return parseConnectedWallet(wallet);
}
