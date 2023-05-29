import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';

export default function Placeholders() {
  return (
    <>
      <PlaceholdersCard />
    </>
  );
}

const PlaceholdersCard = (props) => {
  const [fileList, setFileList] = useState(null);

  const handleFileChange = (event) => {
    setFileList(event.target.files);
  };

  const handleUploadClick = () => {
    if (!fileList) {
      return;
    }

    const data = new FormData();
    files.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });
    data.append('medium', 'web');
    // data.append('vendor', null);
    data.append('type', 'image');

    fetch('http://localhost:8030/api/supply-placeholders', {
      method: 'POST',
      body: data,
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  const files = fileList ? [...fileList] : [];

  return (
    <Card {...props}>
      <CardHeader title="Placeholders" subheader="Set creatives which will be presented to the user in case of missing campaigns." />
      <CardContent>
        <div>
          <input type="file" onChange={handleFileChange} multiple />
          <ul>
            {files.map((file, i) => (
              <li key={i}>
                {file.name} - {file.type}
              </li>
            ))}
          </ul>
          <button onClick={handleUploadClick}>Upload</button>
        </div>
      </CardContent>
    </Card>
  );
};
