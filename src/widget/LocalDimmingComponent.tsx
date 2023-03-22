import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';

import Landing from './Landing';
import { requestAPI, webdsService } from './local_exports';

const removeWatermark = () => {
  const ids: string[] = [];
  const iframes = document.body.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    if (iframe.id.startsWith('sb__open-sandbox')) ids.push(iframe.id);
  });
  for (const id of ids) {
    const node = document.createElement('div');
    node.style.setProperty('display', 'none', 'important');
    node.id = id;
    document.getElementById(id)?.remove();
    document.body.appendChild(node);
  }
};

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

  const webdsTheme = webdsService.ui.getWebDSTheme();

  useEffect(() => {
    const initialize = async () => {
      setInitialized(true);
    };
    removeWatermark();
    initialize();
  }, []);

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
