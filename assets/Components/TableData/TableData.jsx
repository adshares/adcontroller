import React from 'react';
import { Table, TableCell, TableHead, TableRow } from '@mui/material';

export default function TableData() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Company</TableCell>
          <TableCell>City</TableCell>
          <TableCell>State</TableCell>
        </TableRow>
      </TableHead>
    </Table>
  );
}
