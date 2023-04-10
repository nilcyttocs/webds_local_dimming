import React, { useEffect, useState } from 'react';

import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import { useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { postRequest } from './LocalDimmingComponent';
import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

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
  const [poweredOn, setPoweredOn] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [localDimming, setLocalDimming] = useState<string>('off');
  const [darkScene, setDarkScene] = useState<boolean>(false);
  const [outsideLight, setOutsideLight] = useState<number>(0);
  const [outsideLightCommitted, setOutsideLightCommitted] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(5);
  const [brightnessCommitted, setBrightnessCommitted] = useState<number>(5);
  const [showBacklight, setShowBacklight] = useState<boolean>(false);

  const theme = useTheme();

  const powerOn = async (
    shift: boolean,
    ctrl: boolean,
    alt: boolean,
    meta: boolean
  ) => {
    setPoweredOn(true);
    try {
      if (shift || ctrl || alt || meta) {
        await postRequest('powerOn', [shift, ctrl, alt, meta]);
        const userData: Number = await postRequest('GetUserData');
        setShowBacklight(userData === 1);
      } else {
        await postRequest('powerOn');
        setShowBacklight(false);
      }
      await sleep(3000);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to power on.');
      setPoweredOn(false);
      return;
    }
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
    setInitialized(true);
  };

  const powerOff = async (
    shift: boolean,
    ctrl: boolean,
    alt: boolean,
    meta: boolean
  ) => {
    try {
      if (shift || ctrl || alt || meta) {
        await postRequest('powerOff', [shift, ctrl, alt, meta]);
      } else {
        await postRequest('powerOff');
      }
      setPoweredOn(false);
      setInitialized(false);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to power off.');
      return;
    }
  };

  const handleLocalDimming = async (value: string) => {
    try {
      let setting: boolean | number;
      switch (value) {
        case 'off':
          setting = false;
          break;
        case 'on':
          setting = true;
          break;
        case 'half':
          setting = 2;
          break;
        case 'backlight':
          setting = 4;
          break;
        default:
          setting = false;
          break;
      }
      await postRequest('EnableLocalDimming', [setting]);
      setLocalDimming(value);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set local dimming.');
    }
  };

  const handleDarkScene = async (value: boolean) => {
    try {
      await postRequest('EnableDarkSceneEnhancement', [value]);
      setDarkScene(value);
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
    powerOn(false, false, false, false);
    return () => {
      if (poweredOn) {
        powerOff(false, false, false, false);
      }
    };
  }, []);

  return (
    <Canvas
      title="SB7900 Local Dimming"
      annotation={
        <Switch
          checked={poweredOn}
          onChange={event => {
            const mouseEvent: MouseEvent = window.event as MouseEvent;
            if (event.target.checked) {
              powerOn(
                mouseEvent.shiftKey,
                mouseEvent.ctrlKey,
                mouseEvent.altKey,
                mouseEvent.metaKey
              );
            } else {
              powerOff(
                mouseEvent.shiftKey,
                mouseEvent.ctrlKey,
                mouseEvent.altKey,
                mouseEvent.metaKey
              );
            }
          }}
        />
      }
    >
      <Content
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {poweredOn &&
          (initialized ? (
            <>
              <Typography>Local Dimming</Typography>
              <RadioGroup
                row
                value={localDimming}
                onChange={event => handleLocalDimming(event.target.value)}
              >
                <FormControlLabel control={<Radio />} label="Off" value="off" />
                <FormControlLabel control={<Radio />} label="On" value="on" />
                <FormControlLabel
                  control={<Radio />}
                  label="Half & Half"
                  value="half"
                />
                {showBacklight && (
                  <FormControlLabel
                    control={<Radio />}
                    label="Show Backlight"
                    value="backlight"
                  />
                )}
              </RadioGroup>
              <FormControlLabel
                control={<Checkbox />}
                label="Dark Scene Enhancement"
                value={darkScene}
                checked={darkScene}
                onClick={() => {
                  handleDarkScene(!darkScene);
                }}
                sx={{ width: '0px', padding: '0px', marginTop: '16px' }}
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
            </>
          ) : (
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
          ))}
        <Typography
          variant="h1"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            opacity: '0.2',
            zIndex: '99'
          }}
        >
          For Nichia Only
        </Typography>
      </Content>
    </Canvas>
  );
};

export default Landing;
