import React, { useEffect, useState } from 'react';
import { useCreateNotification } from '../../hooks';
import { EventsLatest } from '../Events/Events';
import apiService from '../../utils/apiService';
import ServiceStatusTable from '../../Components/ServiceStatusTable/ServiceStatusTable';
import Spinner from '../../Components/Spinner/Spinner';
import { Card, CardContent, CardHeader } from '@mui/material';

export default function Dashboard() {
  return (
    <>
      <EventsLatest />
      <ServiceStatus sx={{ mt: 3 }} />
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
