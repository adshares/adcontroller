import React, { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const OPTION_VALUE_THIS_MONTH = '0';
const OPTION_VALUE_THIS_YEAR = '1';
const OPTION_VALUE_PREVIOUS_MONTH = '2';
const OPTION_VALUE_PREVIOUS_YEAR = '3';
const OPTION_VALUE_LAST_MONTH = '4';
const OPTION_VALUE_LAST_YEAR = '5';
const OPTION_VALUE_CUSTOM = '6';

export default function DateRangePicker({ dateFrom, dateTo, disabled, onDateFromChange, onDateToChange, ...props }) {
  const dateRangeOptions = [
    { value: OPTION_VALUE_THIS_MONTH, label: 'This month' },
    { value: OPTION_VALUE_THIS_YEAR, label: 'This year' },
    { value: OPTION_VALUE_PREVIOUS_MONTH, label: 'Previous month' },
    { value: OPTION_VALUE_PREVIOUS_YEAR, label: 'Previous year' },
    { value: OPTION_VALUE_LAST_MONTH, label: 'Last month' },
    { value: OPTION_VALUE_LAST_YEAR, label: 'Last year' },
    { value: OPTION_VALUE_CUSTOM, label: 'Custom' },
  ];

  const handleDateRangeChange = (value) => {
    if (OPTION_VALUE_THIS_MONTH === value) {
      onDateFromChange(dayjs().startOf('month'));
      onDateToChange(dayjs().endOf('day'));
    } else if (OPTION_VALUE_THIS_YEAR === value) {
      onDateFromChange(dayjs().startOf('year'));
      onDateToChange(dayjs().endOf('day'));
    } else if (OPTION_VALUE_PREVIOUS_MONTH === value) {
      const startOfMonth = dayjs().startOf('month');
      onDateFromChange(startOfMonth.subtract(1, 'month'));
      onDateToChange(startOfMonth.subtract(1, 'second'));
    } else if (OPTION_VALUE_PREVIOUS_YEAR === value) {
      const startOfYear = dayjs().startOf('year');
      onDateFromChange(startOfYear.subtract(1, 'year'));
      onDateToChange(startOfYear.subtract(1, 'second'));
    } else if (OPTION_VALUE_LAST_MONTH === value) {
      onDateFromChange(dayjs().subtract(1, 'month').startOf('day'));
      onDateToChange(dayjs().endOf('day'));
    } else if (OPTION_VALUE_LAST_YEAR === value) {
      onDateFromChange(dayjs().subtract(1, 'year').startOf('day'));
      onDateToChange(dayjs().endOf('day'));
    }
    setDataRangeOption(value);
  };

  const [dataRangeOption, setDataRangeOption] = useState(OPTION_VALUE_THIS_MONTH);

  return (
    <Box {...props}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="From"
          value={dateFrom}
          onChange={(newValue) => {
            onDateFromChange(newValue);
            setDataRangeOption(OPTION_VALUE_CUSTOM);
          }}
          disabled={disabled}
          minDate={dayjs().subtract(2, 'year')}
          maxDate={dateTo}
          disableFuture={true}
          sx={{ mr: 2 }}
        />
        <DatePicker
          label="To"
          value={dateTo}
          onChange={(newValue) => {
            onDateToChange(newValue);
            setDataRangeOption(OPTION_VALUE_CUSTOM);
          }}
          disabled={disabled}
          maxDate={dayjs().endOf('day')}
          sx={{ mr: 2 }}
        />
        <FormControl sx={{ minWidth: '176px' }}>
          <InputLabel id="date-range-select-label">Date range</InputLabel>
          <Select
            labelId="date-range-select-label"
            id="date-range-select"
            value={dataRangeOption}
            label="Date range"
            onChange={(event) => handleDateRangeChange(event.target.value)}
            disabled={disabled}
          >
            {dateRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </LocalizationProvider>
    </Box>
  );
}
