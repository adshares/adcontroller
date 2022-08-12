import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import ListOfInputs from '../../common/ListOfInputs/ListOfInputs';
import commonStyles from '../../common/commonStyles.scss';

export default function Demand() {
  return (
    <>
      <CampaignSettingsCard />
      <BannerSettingsCard />
      <RejectedDomainsCard />
    </>
  );
}

const CampaignSettingsCard = () => {
  const [campaignMinBudget, setCampaignMinBudget] = useState(0);
  const [campaignMinCpa, setCampaignMinCpa] = useState(0);
  const [campaignMinCpm, setCampaignMinCpm] = useState(0);

  const onSaveClick = () => {
    console.log({
      campaignMinBudget,
      campaignMinCpa,
      campaignMinCpm,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Campaign settings" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <FormControl margin="dense">
            <InputLabel htmlFor="campaignMinBudget">Minimal campaign budget</InputLabel>
            <OutlinedInput
              id="campaignMinBudget"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Minimal campaign budget"
              value={Number(campaignMinBudget).toString()}
              onChange={(e) => setCampaignMinBudget(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
          <FormControl margin="dense">
            <InputLabel htmlFor="campaignMinCpa">Minimal campaign CPA</InputLabel>
            <OutlinedInput
              id="campaignMinCpa"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Minimal campaign CPA"
              value={Number(campaignMinCpa).toString()}
              onChange={(e) => setCampaignMinCpa(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
          <FormControl margin="dense">
            <InputLabel htmlFor="campaignMinCpm">Minimal campaign CPM</InputLabel>
            <OutlinedInput
              id="campaignMinCpm"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="Minimal campaign CPM"
              value={Number(campaignMinCpm).toString()}
              onChange={(e) => setCampaignMinCpm(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
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

const BannerSettingsCard = () => {
  const [uploadLimitImage, setUploadLimitImage] = useState(0);
  const [uploadLimitModel, setUploadLimitModel] = useState(0);
  const [uploadLimitVideo, setUploadLimitVideo] = useState(0);
  const [uploadLimitHtml, setUploadLimitHtml] = useState(0);

  const onSaveClick = () => {
    console.log({
      uploadLimitImage,
      uploadLimitModel,
      uploadLimitVideo,
      uploadLimitHtml,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Banner settings" subheader="lorem ipsum dolor sit amet" />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitImage">Image size limit</InputLabel>
            <OutlinedInput
              id="uploadLimitImage"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Image size limit"
              value={Number(uploadLimitImage).toString()}
              onChange={(e) => setUploadLimitImage(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitVideo">Video size limit</InputLabel>
            <OutlinedInput
              id="uploadLimitVideo"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Video size limit"
              value={Number(uploadLimitVideo).toString()}
              onChange={(e) => setUploadLimitVideo(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitModel">Upload model limit</InputLabel>
            <OutlinedInput
              id="uploadLimitModel"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Upload model limit"
              value={Number(uploadLimitModel).toString()}
              onChange={(e) => setUploadLimitModel(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>

          <FormControl margin="dense">
            <InputLabel htmlFor="uploadLimitHtml">Upload HTML limit</InputLabel>
            <OutlinedInput
              id="uploadLimitHtml"
              size="small"
              type="number"
              endAdornment={<InputAdornment position="end">MB</InputAdornment>}
              label="Upload model limit"
              value={Number(uploadLimitHtml).toString()}
              onChange={(e) => setUploadLimitHtml(Number(e.target.value).toFixed(2))}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
          </FormControl>
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

const RejectedDomainsCard = () => {
  const [rejectedDomains, setRejectedDomains] = useState([]);
  const [isFieldsValid, setFieldsValid] = useState(true);

  const onSaveClick = () => {
    console.log(rejectedDomains);
    //TODO: send data
  };

  const fieldsHandler = (fields) => {
    if (fields.length > 0) {
      setRejectedDomains(fields.map((field) => field.field));
      setFieldsValid(fields.some((field) => field.isValueValid));
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rejected domains:" subheader="Here you can define domains. All subdomains will be rejected." />
      <CardContent>
        <ListOfInputs initialList={rejectedDomains} fieldsHandler={fieldsHandler} type="domain" maxHeight="calc(100vh - 22rem)" />
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={!isFieldsValid} type="button" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
