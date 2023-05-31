import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import queryString from 'query-string';

export default function Placeholders() {
  return (
    <>
      <PlaceholdersCard />
    </>
  );
}

const PlaceholdersCard = (props) => {
  const [fileList, setFileList] = useState(null);

  // // media list
  // fetch('http://localhost:8030/api/taxonomy/media')
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));
  //
  // // vendors list for medium=decentraland
  // fetch('http://localhost:8030/api/taxonomy/media/decentraland/vendors')
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));
  //
  // // taxonomy for medium=metaverse, vendor=decentraland
  // fetch('http://localhost:8030/api/taxonomy/media/metaverse?vendor=decentraland')
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));
  //
  // // placeholders
  // fetch('http://localhost:8030/api/supply-placeholders')
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));
  //
  // const parsed = {
  //   'filter[medium]': 'metaverse',
  //   'filter[vendor]': 'decentraland',
  // };
  // const query = queryString.stringify(parsed);
  // // placeholders with filter
  // fetch(`http://localhost:8030/api/supply-placeholders?${query}`)
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));
  //
  // const uuid = 'e1ef118b-c0a1-49f8-8f77-244a8b04b553';
  // // delete placeholder
  // fetch(`http://localhost:8030/api/supply-placeholders/${uuid}`, {
  //   method: 'DELETE',
  // })
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));

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

    // upload
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
