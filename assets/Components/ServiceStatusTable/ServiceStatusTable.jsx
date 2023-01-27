import React from 'react';
import { Icon, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const ServiceStatusTable = ({ data }) => {
  const fields = ['adserver', 'adpanel', 'aduser', 'adselect', 'adclassify', 'adpay', 'main.js'];
  return (
    <Table>
      <TableBody>
        {fields
          .filter((field) => data.hasOwnProperty(field))
          .map((field) => (
            <TableRow key={data[field].module}>
              <TableCell align="left">
                <Typography variant="tableText1">{data[field].module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableText1">{data[field].version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableText1">{data[field].url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={data[field].code}>
                  <Icon>{data[field].code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default ServiceStatusTable;
