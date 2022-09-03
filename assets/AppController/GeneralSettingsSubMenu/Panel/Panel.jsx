import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useSetPlaceholdersConfigMutation, useUploadAssetsMutation } from '../../../redux/config/configApi';
import { changePlaceholdersInformation } from '../../../redux/config/configSlice';
import { useCreateNotification, useForm } from '../../../hooks';
import configuration from '../../../controllerConfig/configuration';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import commonStyles from '../../common/commonStyles.scss';

export default function Panel() {
  return (
    <>
      <Placeholders />
      <Rebranding />
    </>
  );
}

const Placeholders = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setPlaceholdersConfig, { isLoading }] = useSetPlaceholdersConfigMutation();
  const form = useForm({
    initialFields: {
      PlaceholderIndexDescription: appData.AdPanel.PlaceholderIndexDescription || '',
      PlaceholderIndexKeywords: appData.AdPanel.PlaceholderIndexKeywords || '',
      PlaceholderIndexMetaTags: appData.AdPanel.PlaceholderIndexMetaTags || '',
      PlaceholderIndexTitle: appData.AdPanel.PlaceholderIndexTitle || '',
      PlaceholderRobotsTxt: appData.AdPanel.PlaceholderRobotsTxt || '',
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = form.fields[field] || null;
      }
    });
    try {
      const response = await setPlaceholdersConfig(body).unwrap();
      dispatch(changePlaceholdersInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Panel placeholders" subheader="Here you can read and edit placeholders for index.html and robots.txt" />
      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField
            value={form.fields.PlaceholderIndexTitle}
            name="PlaceholderIndexTitle"
            label="Title"
            size="small"
            margin="dense"
            fullWidth
          />
          <TextField
            value={form.fields.PlaceholderIndexDescription}
            name="PlaceholderIndexDescription"
            label="Description"
            multiline
            rows={8}
            margin="dense"
            fullWidth
            size="small"
          />
          <TextField
            value={form.fields.PlaceholderIndexKeywords}
            name="PlaceholderIndexKeywords"
            label="Keywords"
            size="small"
            margin="dense"
            fullWidth
          />
          <TextField
            value={form.fields.PlaceholderIndexMetaTags}
            name="PlaceholderIndexMetaTags"
            label="Custom HEAD meta-tags"
            multiline
            rows={8}
            margin="dense"
            fullWidth
            size="small"
          />
          <TextField
            value={form.fields.PlaceholderRobotsTxt}
            name="PlaceholderRobotsTxt"
            label="robots.txt"
            multiline
            rows={8}
            margin="dense"
            fullWidth
            size="small"
          />
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const Rebranding = () => {
  const [uploadAssets, { isLoading }] = useUploadAssetsMutation();
  const [changedImages, setChangedImages] = useState({});
  const [previews, setPreviews] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const formData = new FormData();
    Object.keys(changedImages).forEach((file) => formData.append(file, changedImages[file]));
    if (Object.keys(changedImages).length > 0) {
      try {
        await uploadAssets(formData).unwrap();
        setChangedImages({});
        createSuccessNotification();
      } catch (err) {
        createErrorNotification(err);
      }
    }
  };

  const onInputChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const isFileIsImage = file && file.type.split('/')[0] === 'image';
    const isFileTypeIsPng = file && file.type.split('/')[1] === 'png';

    if (!isFileIsImage) {
      enqueueSnackbar('File must be image', { variant: 'error' });
      return;
    }

    const image = new Image();
    const fr = new FileReader();

    fr.onload = function () {
      if (fr !== null && typeof fr.result == 'string') {
        image.src = fr.result;
      }
    };
    fr.readAsDataURL(file);

    image.onload = () => {
      const width = image.width;
      const height = image.height;

      switch (name) {
        case 'Favicon16x16':
          if (width === 16 && height === 16 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 16x16', { variant: 'error', persist: true });
          }
          break;

        case 'Favicon32x32':
          if (width === 32 && height === 32 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 32x32', { variant: 'error' });
          }
          break;

        case 'Favicon48x48':
          if (width === 48 && height === 48 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 48x48', { variant: 'error' });
          }
          break;

        case 'Favicon96x96':
          if (width === 96 && height === 96 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 96x96', { variant: 'error' });
          }
          break;

        case 'LogoH30':
          if (height >= 30) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be with min height 30', { variant: 'error' });
          }
          break;
        case 'LogoH60':
          if (height >= 30) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be with min height 30', { variant: 'error' });
          }
          break;
        case 'LogoH90':
          if (height >= 30) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file }));
            setPreviews((prevState) => ({ ...prevState, [name]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be with min height 30', { variant: 'error' });
          }
          break;

        default:
          break;
      }
    };
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Rebranding" subheader={'lorem ipsum dolor sit amet'} />
      <CardContent>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad aliquid consectetur corporis, dolores ducimus eaque eligendi, esse
          fugiat inventore officia perspiciatis provident quo ratione reprehenderit sunt unde vel voluptatem voluptatum.
        </div>
        <div>
          Iste, natus, voluptates! Amet blanditiis facilis iusto labore modi nulla, officiis quaerat quam quia. Amet architecto deserunt
          dolores expedita fugiat labore odio quibusdam quo repellat repellendus sit temporibus, totam vero.
        </div>
      </CardContent>

      <CardHeader title="Assets" subheader={'lorem ipsum dolor sit amet'} />
      <CardContent>
        <Box className={commonStyles.card}>
          <Typography variant="h6">Favicons</Typography>
          <Typography variant="body2">You can add favicons with only svg extension and sizes 16x16, 32x32, 48x48, 96x96</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell width="40%">
                  <Box
                    component="img"
                    src={previews.Favicon16x16 || `${configuration.baseUrl}/assets/panel/Favicon16x16`}
                    height="16px"
                    width="16px"
                  />
                </TableCell>
                <TableCell align="center" width="20%">
                  <Typography variant="body1">16x16</Typography>
                </TableCell>
                <TableCell align="center" width="40%">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="Favicon16x16" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell width="40%">
                  <Box
                    component="img"
                    src={previews.Favicon32x32 || `${configuration.baseUrl}/assets/panel/Favicon32x32`}
                    height="32px"
                    width="32px"
                  />
                </TableCell>
                <TableCell width="20%">
                  <Typography align="center" variant="body1">
                    32x32
                  </Typography>
                </TableCell>
                <TableCell align="center" width="40%">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="Favicon32x32" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box
                    component="img"
                    src={previews.Favicon48x48 || `${configuration.baseUrl}/assets/panel/Favicon48x48`}
                    height="48px"
                    width="48px"
                  />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    48x48
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="Favicon48x48" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box
                    component="img"
                    src={previews.Favicon96x96 || `${configuration.baseUrl}/assets/panel/Favicon96x96`}
                    height="96px"
                    width="96px"
                  />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    96x96
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="Favicon96x96" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Box className={commonStyles.card}>
          <Typography variant="h6">Logos</Typography>
          <Typography variant="body2">You can add logo with height 30 and optional @2x and @3x</Typography>
          <Table sx={{ backgroundColor: 'primary.main', mt: 1 }}>
            <TableBody>
              <TableRow>
                <TableCell width="40%">
                  <Box
                    component="img"
                    src={previews.LogoH30 || `${configuration.baseUrl}/assets/panel/LogoH30`}
                    height="30px"
                    maxWidth="100%"
                  />
                </TableCell>
                <TableCell width="20%">
                  <Typography align="center" variant="body1">
                    Min height 30
                  </Typography>
                </TableCell>
                <TableCell align="center" width="40%">
                  <Button component="label" variant="contained" color="secondary">
                    Change
                    <input hidden accept="image/*" type="file" name="LogoH30" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box
                    component="img"
                    src={previews.LogoH60 || `${configuration.baseUrl}/assets/panel/LogoH60`}
                    height="60px"
                    maxWidth="100%"
                  />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    @2x
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained" color="secondary">
                    Change
                    <input hidden accept="image/*" type="file" name="LogoH60" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box
                    component="img"
                    src={previews.LogoH90 || `${configuration.baseUrl}/assets/panel/LogoH90`}
                    height="90px"
                    maxWidth="100%"
                  />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    @3x
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained" color="secondary">
                    Change
                    <input hidden accept="image/*" type="file" name="LogoH90" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || Object.keys(changedImages).length === 0} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
