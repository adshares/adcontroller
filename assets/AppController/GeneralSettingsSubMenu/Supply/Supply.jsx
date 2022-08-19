import React, { useState } from 'react';
import commonStyles from '../../common/commonStyles.scss';
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
  Icon,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Tooltip,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function Supply() {
  return (
    <>
      <SiteOptions />
      <ZoneOptions />
    </>
  );
}

const SiteOptions = () => {
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
};

const ZoneOptions = () => {
  const [allowZoneInIFrame, setAllowZoneInIFrame] = useState(false);
  const [maxPageZones, setMaxPageZones] = useState(0);

  const onSaveClick = () => {
    console.log({ allowZoneInIFrame, maxPageZones });
  };
  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Zone options" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            <FormControl margin="dense">
              <FormControlLabel
                label="Allow zone in IFRAME"
                control={<Checkbox checked={allowZoneInIFrame} onChange={() => setAllowZoneInIFrame((prevState) => !prevState)} />}
              />
            </FormControl>
            <Tooltip title="lorem ipsum dolor set amet">
              <Icon>
                <HelpIcon color="primary" />
              </Icon>
            </Tooltip>
          </Box>

          <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            <FormControl margin="dense" fullWidth>
              <InputLabel htmlFor="maxPageZones">Maximum zones per page</InputLabel>
              <OutlinedInput
                id="maxPageZones"
                size="small"
                type="number"
                label="Maximum zones per page"
                value={Number(maxPageZones).toString()}
                onChange={(e) => setMaxPageZones(Number(e.target.value).toFixed(0))}
                inputProps={{ autoComplete: 'off', min: 0 }}
              />
            </FormControl>
            <Tooltip title="lorem ipsum dolor set amet" sx={{ ml: 1 }}>
              <Icon>
                <HelpIcon color="primary" />
              </Icon>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
