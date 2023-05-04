import { Box, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useCreateNotification } from '../../hooks';
import Events from '../Events/Events';
import apiService from '../../utils/apiService';
import { getFlowChartData } from '../../utils/chartUtils';
import ServiceStatusTable from '../../Components/ServiceStatusTable/ServiceStatusTable';
import Spinner from '../../Components/Spinner/Spinner';
import configSelectors from '../../redux/config/configSelectors';
import { useGetTurnoverByTypeQuery } from '../../redux/monitoring/monitoringApi';

export default function Dashboard() {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Events dataType="latest" />
        </Grid>
        <Grid item xs={6}>
          <ServiceStatus />
        </Grid>
        <Grid item xs={6}>
          <Flow />
        </Grid>
      </Grid>
    </>
  );
}

const ServiceStatus = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});
  const { createErrorNotification } = useCreateNotification();

  useEffect(() => {
    getStepData().catch((error) => console.log(error));
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData('status');
      setData(response);
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Status" />
      <CardContent>{isLoading ? <Spinner /> : <ServiceStatusTable data={data} />}</CardContent>
    </Card>
  );
};

const Flow = (props) => {
  const adServerAddress = useSelector(configSelectors.getAppData).AdServer.WalletAddress;
  const queryConfig = {
    'filter[date][from]': dayjs().startOf('month').format(),
    'filter[date][to]': dayjs().endOf('day').format(),
  };
  const [chartData, setChartData] = useState({ datasets: [] });

  const { data: dspExpenseTurnoverResponse, isFetching: isFetchingDspExpense } = useGetTurnoverByTypeQuery(
    { ...queryConfig, type: 'DspExpense' },
    { refetchOnMountOrArgChange: true },
  );
  const { data: sspIncomeTurnoverResponse, isFetching: isFetchingSspIncome } = useGetTurnoverByTypeQuery(
    { ...queryConfig, type: 'SspIncome' },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    const sspIncomeData = sspIncomeTurnoverResponse?.data || [];
    const dspExpenseData = dspExpenseTurnoverResponse?.data || [];
    setChartData(getFlowChartData(sspIncomeData, dspExpenseData, adServerAddress));
  }, [dspExpenseTurnoverResponse, sspIncomeTurnoverResponse]);

  return (
    <Card {...props}>
      <CardHeader title="Flow" />
      <CardContent>
        <Typography variant="body1">
          Sankey diagram below presents transfers between connected servers. <Link to="/network/connected-servers">More info</Link>
        </Typography>
        {!isFetchingDspExpense && !isFetchingSspIncome && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {chartData.datasets.length > 0 ? <Chart type={'sankey'} data={chartData} /> : <Typography variant="b800">No data</Typography>}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
