import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import MUIDataTable from 'mui-datatables';
import commonStyles from '../../common/commonStyles.scss';
import TableData from '../../../Components/TableData/TableData';

export default function Users() {
  return (
    <>
      <UsersCard />
    </>
  );
}

// const columns = [
//   {
//     name: 'name',
//     label: 'Name',
//     options: {
//       setCellProps: () => ({ style: { width: '250px', textAlign: 'center' } }),
//     },
//   },
//   {
//     name: 'company',
//     label: 'Company',
//     options: {
//       setCellProps: () => ({ style: { width: '250px', textAlign: 'center' } }),
//     },
//   },
//   {
//     name: 'city',
//     label: 'City',
//     options: {
//       setCellProps: () => ({ style: { width: '250px', textAlign: 'center' } }),
//       customBodyRender: (data, type, row) => {
//         return <pre>{data}</pre>;
//       },
//     },
//   },
//   {
//     name: 'state',
//     label: 'State',
//     options: {
//       setCellProps: () => ({ style: { width: '250px', textAlign: 'center' } }),
//     },
//   },
// ];
// const data = [
//   ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
//   ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
//   ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
//   ['James Houston', 'Test Corp', 'Dallas', 'TX'],
//   ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
//   ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
//   ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
//   ['James Houston', 'Test Corp', 'Dallas', 'TX'],
//   ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
//   ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
//   ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
//   ['James Houston', 'Test Corp', 'Dallas', 'TX'],
//   ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
//   ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
//   ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
//   ['James Houston', 'Test Corp', 'Dallas', 'TX'],
//   ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
//   ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
//   ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
//   ['James Houston', 'Test Corp', 'Dallas', 'TX'],
//   ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
//   ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
//   ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
//   ['James Houston', 'Test Corp', 'Dallas', 'TX'],
// ];

const UsersCard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((result) => result.json())
      .then((data) => {
        console.log(data);
        const mappedData = data.map((person) => [person.name, person.company.name, person.address.city, person.address.zipcose]);
        setData(mappedData);
      });
  }, []);

  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Users" />
      <CardContent>
        <TableData />
      </CardContent>
    </Card>
  );
};
