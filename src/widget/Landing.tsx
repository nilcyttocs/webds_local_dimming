import React, { useEffect, useState } from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { postRequest } from './LocalDimmingComponent';
import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';

const outsideLightMarks = [
  {
    value: 0,
    label: 'Dark'
  },
  {
    value: 1,
    label: 'Bright'
  }
];

const brightnessMarks = [
  {
    value: 0,
    label: '50'
  },
  {
    value: 1,
    label: '100'
  },
  {
    value: 2,
    label: '200'
  },
  {
    value: 3,
    label: '300'
  },
  {
    value: 4,
    label: '400'
  },
  {
    value: 5,
    label: '500'
  },
  {
    value: 6,
    label: '600'
  },
  {
    value: 7,
    label: '700'
  },
  {
    value: 8,
    label: '800'
  },
  {
    value: 9,
    label: '900'
  },
  {
    value: 10,
    label: '1000'
  },
  {
    value: 11,
    label: '1100'
  }
];

export const Landing = (props: any): JSX.Element => {
  const [localDimming, setLocalDimming] = useState<boolean>(false);
  const [darkScene, setDarkScene] = useState<boolean>(false);
  const [outsideLight, setOutsideLight] = useState<number>(0);
  const [outsideLightCommitted, setOutsideLightCommitted] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(5);
  const [brightnessCommitted, setBrightnessCommitted] = useState<number>(5);

  const theme = useTheme();

  const handleLocalDimming = async (setting: boolean) => {
    try {
      await postRequest('EnableLocalDimming', [setting]);
      setLocalDimming(setting);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set local dimming.');
    }
  };

  const handleDarkScene = async (setting: boolean) => {
    try {
      await postRequest('EnableDarkSceneEnhancement', [setting]);
      setDarkScene(setting);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set dark scene enhancement.');
    }
  };

  const handleOutsideLightChange = (event: any, value: any) => {
    if (value === outsideLight) {
      return;
    }
    setOutsideLight(value);
  };

  const handleOutsideLightChangeCommitted = async (event: any, value: any) => {
    if (value === outsideLightCommitted) {
      return;
    }
    try {
      await postRequest('SetOutsideLightLevel', [value]);
      setOutsideLightCommitted(value);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set outside light level.');
    }
  };

  const handleBrightnessChange = (event: any, value: any) => {
    if (value === brightness) {
      return;
    }
    setBrightness(value);
  };

  const handleBrightnessChangeCommitted = async (event: any, value: any) => {
    if (value === brightnessCommitted) {
      return;
    }
    try {
      await postRequest('SetBrightness', [
        Number(brightnessMarks[value].label)
      ]);
      setBrightnessCommitted(value);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set brightness.');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await postRequest('EnableLocalDimming', [false]);
        await postRequest('EnableDarkSceneEnhancement', [false]);
        await postRequest('SetOutsideLightLevel', [0]);
        await postRequest('SetBrightness', [500]);
      } catch (error) {
        console.error(error);
        props.setAlert('Failed to initialize.');
        return;
      }
    };
    initialize();
  }, []);

  return (
    <Canvas title="SB7900 Local Dimming">
      <Content
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <FormControlLabel
          control={<Checkbox />}
          label="Local Dimming"
          value={localDimming}
          checked={localDimming}
          onClick={() => {
            handleLocalDimming(!localDimming);
          }}
          sx={{ padding: '0px' }}
        />
        <FormControlLabel
          control={<Checkbox />}
          label="Dark Scene Enhancement"
          value={darkScene}
          checked={darkScene}
          onClick={() => {
            handleDarkScene(!darkScene);
          }}
          sx={{ marginTop: '16px' }}
        />
        <div style={{ marginTop: '32px' }}>
          <Typography>Outside Light Level</Typography>
          <Slider
            valueLabelDisplay="off"
            step={null}
            min={0}
            max={1}
            value={outsideLight}
            marks={outsideLightMarks}
            onChange={handleOutsideLightChange}
            onChangeCommitted={handleOutsideLightChangeCommitted}
            sx={{
              width: '80px',
              marginTop: '4px',
              marginLeft: '16px',
              '& .MuiSlider-track': {
                height: '2px !important'
              },
              '& .MuiSlider-markLabel': {
                color: theme.palette.text.primary
              },
              '& .MuiSlider-mark': {
                backgroundColor: '#bfbfbf',
                height: '16px',
                '& .MuiSlider-markActive': {
                  backgroundColor: 'currentColor'
                }
              }
            }}
          />
        </div>
        <div style={{ marginTop: '32px' }}>
          <Typography>Brightness (nit)</Typography>
          <Slider
            valueLabelDisplay="off"
            step={null}
            min={0}
            max={11}
            value={brightness}
            marks={brightnessMarks}
            onChange={handleBrightnessChange}
            onChangeCommitted={handleBrightnessChangeCommitted}
            sx={{
              width: '640px',
              marginTop: '4px',
              marginLeft: '16px',
              '& .MuiSlider-track': {
                height: '2px !important'
              },
              '& .MuiSlider-markLabel': {
                color: theme.palette.text.primary
              },
              '& .MuiSlider-mark': {
                backgroundColor: '#bfbfbf',
                height: '16px',
                '& .MuiSlider-markActive': {
                  backgroundColor: 'currentColor'
                }
              }
            }}
          />
        </div>
      </Content>
    </Canvas>
  );
};

export default Landing;
