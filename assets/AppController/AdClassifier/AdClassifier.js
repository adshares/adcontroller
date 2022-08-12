import React, { useState } from 'react';
import commonStyles from '../common/commonStyles.scss';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

export default function AdClassifier() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [editMode, setEditMode] = useState(false);

  const onSaveClick = () => {
    console.log({
      url,
      apiKey,
      apiSecret,
    });
  };

  return (
    <Card className={commonStyles.card}>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader title="AdClassifier" subheader="lorem ipsum dolor set amet" />
        <CardActions>
          <IconButton type="button" onClick={() => setEditMode(!editMode)}>
            {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
          </IconButton>
        </CardActions>
      </Box>

      <Collapse in={!editMode} timeout="auto">
        <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
          <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>{url}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Api key</TableCell>
                  <TableCell>{apiKey}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Collapse>

      <Collapse in={editMode} timeout="auto">
        <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
          <Box className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}>
            <TextField fullWidth margin="dense" size="small" label="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <TextField fullWidth margin="dense" size="small" label="Api key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <TextField
              fullWidth
              margin="dense"
              size="small"
              label="Api secret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </Box>
        </CardContent>
        <CardActions>
          <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
            <Button variant="contained" type="button" onClick={onSaveClick}>
              Save
            </Button>
          </Box>
        </CardActions>
      </Collapse>
    </Card>
  );
}
