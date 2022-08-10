import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import commonStyles from '../../common/commonStyles.scss';
import { logoH30, logoH60, logoH90, favicon16x16, favicon32x32, favicon48x48, favicon96x96 } from '../../../img/tmp';

export default function Panel() {
  return (
    <>
      <Placeholders />
      <Rebranding />
    </>
  );
}

const Placeholders = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [customHeadMetaTags, setCustomHeadMetaTags] = useState('');
  const [robots, setRobots] = useState('');

  const onSaveClick = () => {
    console.log({
      title,
      description,
      keywords,
      customHeadMetaTags,
      robots,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Panel placeholders" subheader="Here you can read and edit placeholders for index.html and robots.txt" />
      <CardContent>
        <FormControl fullWidth size="small">
          <TextField value={title} onChange={(e) => setTitle(e.target.value)} label="Title" size="small" margin="dense" />
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label="Description"
            multiline
            rows={8}
            margin="dense"
          />
          <TextField value={keywords} onChange={(e) => setKeywords(e.target.value)} label="Keywords" size="small" margin="dense" />
          <TextField
            value={customHeadMetaTags}
            onChange={(e) => setCustomHeadMetaTags(e.target.value)}
            label="Custom HEAD meta-tags"
            multiline
            rows={8}
            margin="dense"
          />
          <TextField value={robots} onChange={(e) => setRobots(e.target.value)} label="robots.txt" multiline rows={8} margin="dense" />
        </FormControl>
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

const Rebranding = () => {
  const [changedImages, setChangedImages] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const onSaveClick = () => {
    console.log(changedImages);
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
        case 'favicon16x16':
          if (width === 16 && height === 16 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file, [`preview_${name}`]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 16x16', { variant: 'error', persist: true });
          }
          break;

        case 'favicon32x32':
          if (width === 32 && height === 32 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file, [`preview_${name}`]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 32x32', { variant: 'error' });
          }
          break;

        case 'favicon48x48':
          if (width === 48 && height === 48 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file, [`preview_${name}`]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 48x48', { variant: 'error' });
          }
          break;

        case 'favicon96x96':
          if (width === 96 && height === 96 && isFileTypeIsPng) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file, [`preview_${name}`]: URL.createObjectURL(file) }));
          } else {
            enqueueSnackbar('Image should be png with size 96x96', { variant: 'error' });
          }
          break;

        case 'logoH30':
        case 'logoH60':
        case 'logoH90':
          if (height >= 30) {
            setChangedImages((prevState) => ({ ...prevState, [name]: file, [`preview_${name}`]: URL.createObjectURL(file) }));
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
                  <Box component="img" src={changedImages.preview_favicon16x16 || favicon16x16} height="16px" width="16px" />
                </TableCell>
                <TableCell align="center" width="20%">
                  <Typography variant="body1">16x16</Typography>
                </TableCell>
                <TableCell align="center" width="40%">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="favicon16x16" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell width="40%">
                  <Box component="img" src={changedImages.preview_favicon32x32 || favicon32x32} height="32px" width="32px" />
                </TableCell>
                <TableCell width="20%">
                  <Typography align="center" variant="body1">
                    32x32
                  </Typography>
                </TableCell>
                <TableCell align="center" width="40%">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="favicon32x32" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box component="img" src={changedImages.preview_favicon48x48 || favicon48x48} height="48px" width="48px" />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    48x48
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="favicon48x48" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box component="img" src={changedImages.preview_favicon96x96 || favicon96x96} height="96px" width="96px" />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    96x96
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained">
                    Change
                    <input hidden accept="image/*" type="file" name="favicon96x96" onChange={onInputChange} />
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
                  <Box component="img" src={changedImages.preview_logoH30 || logoH30} height="30px" maxWidth="100%" />
                </TableCell>
                <TableCell width="20%">
                  <Typography align="center" variant="body1">
                    Min height 30
                  </Typography>
                </TableCell>
                <TableCell align="center" width="40%">
                  <Button component="label" variant="contained" color="secondary">
                    Change
                    <input hidden accept="image/*" type="file" name="logoH30" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box component="img" src={changedImages.preview_logoH60 || logoH60} height="60px" maxWidth="100%" />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    @2x
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained" color="secondary">
                    Change
                    <input hidden accept="image/*" type="file" name="logoH60" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box component="img" src={changedImages.preview_logoH90 || logoH90} height="90px" maxWidth="100%" />
                </TableCell>
                <TableCell>
                  <Typography align="center" variant="body1">
                    @3x
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button component="label" variant="contained" color="secondary">
                    Change
                    <input hidden accept="image/*" type="file" name="logoH90" onChange={onInputChange} />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
