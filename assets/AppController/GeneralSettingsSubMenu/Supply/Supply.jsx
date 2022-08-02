import React, { useState } from 'react';
import commonStyles from '../../commonStyles.scss';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

export default function Supply() {
  const [acceptBannersManually, setAcceptBannersManually] = useState(false);
  const [classifierLocalBanners, setClassifierLocalBanners] = useState('all-by-default');

  const onSaveClick = () => {
    //TODO: send data
    console.log({ acceptBannersManually, classifierLocalBanners });
  };
  return (
    <Card className={`${commonStyles.card}`}>
      <CardHeader title="Site options" subheader="Site banners classifications settings." />
      <CardContent>
        <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceEvenly} ${commonStyles.alignStart}`}>
          <FormControlLabel
            label="Require banner acceptance by default"
            control={<Checkbox checked={acceptBannersManually} onChange={() => setAcceptBannersManually((prevState) => !prevState)} />}
          />

          <FormControl>
            <FormLabel focused={false}>Classification of banners from the server</FormLabel>
            <RadioGroup value={classifierLocalBanners} onChange={(e) => setClassifierLocalBanners(e.target.value)}>
              <FormControlLabel value="all-by-default" control={<Radio />} label="Default from all servers" />
              <FormControlLabel value="local-by-default" control={<Radio />} label="Default from local server" />
              <FormControlLabel value="local-only" control={<Radio />} label="Only from local server" />
            </RadioGroup>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
