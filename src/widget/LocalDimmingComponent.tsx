import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';

import Landing from './Landing';
import { requestAPI, webdsService } from './local_exports';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const postRequest = async (request: string, args?: any[]) => {
  const dataToSend: any = {
    request
  };
  if (args) {
    dataToSend['arguments'] = args;
  }
  try {
    const response = await requestAPI<any>('tutor/LocalDimming', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const LocalDimmingComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initialize = async () => {
      try {
        await postRequest('powerOn');
        await sleep(3000);
      } catch (error) {
        console.error(error);
        setAlert('Failed to power on.');
        return;
      }
      setInitialized(true);
    };
    initialize();
  }, []);

  const webdsTheme = webdsService.ui.getWebDSTheme();

  return (
    <ThemeProvider theme={webdsTheme}>
      <div className="jp-webds-widget-body">
        {alert !== undefined && (
          <Alert
            severity="error"
            onClose={() => setAlert(undefined)}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {alert}
          </Alert>
        )}
        {initialized && <Landing setAlert={setAlert} />}
      </div>
      {!initialized && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CircularProgress color="primary" />
        </div>
      )}
    </ThemeProvider>
  );
};

export default LocalDimmingComponent;
