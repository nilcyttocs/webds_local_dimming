import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import { useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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

const darkSceneStrengthMarks = [
  {
    value: 0,
    label: 'Weak'
  },
  {
    value: 128,
    label: 'Strong'
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2, paddingTop: 3 }}>{children}</Box>}
    </div>
  );
}

export const Landing = (props: any): JSX.Element => {
  const [tab, setTab] = useState<number>(0);
  const [poweredOn, setPoweredOn] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [localDimming, setLocalDimming] = useState<string>('off');
  const [outsideLight, setOutsideLight] = useState<number>(0);
  const [outsideLightCommitted, setOutsideLightCommitted] = useState<number>(0);
  const [darkScene, setDarkScene] = useState<boolean>(false);
  const [darkSceneStrength, setDarkSceneStrength] = useState<number>(0);
  const [darkSceneStrengthCommitted, setDarkSceneStrengthCommitted] = useState<
    number
  >(0);
  const [brightness, setBrightness] = useState<number>(5);
  const [brightnessCommitted, setBrightnessCommitted] = useState<number>(5);
  const [defectMode, setDefectMode] = useState<number>(0);

  const theme = useTheme();

  const initializeMain = async () => {
    try {
      await postRequest('EnableLocalDimming', [false]);
      setLocalDimming('off');
      await postRequest('EnableDarkSceneEnhancement', [false]);
      setDarkScene(false);
      await postRequest('SetOutsideLightLevel', [0]);
      setOutsideLight(0);
      setOutsideLightCommitted(0);
      await postRequest('SetDarkSceneEnhancementStrength', [0]);
      setDarkSceneStrength(0);
      setDarkSceneStrengthCommitted(0);
      await postRequest('SetBrightness', [500]);
      setBrightness(5);
      setBrightnessCommitted(5);
    } catch (error) {
      console.error(error);
      return Promise.reject('Failed to initialize Main tab.');
    }
  };

  const initializeLEDDefect = async () => {
    try {
      await postRequest('SetLedDefectDemoMode', [0]);
      setDefectMode(0);
    } catch (error) {
      console.error(error);
      return Promise.reject('Failed to initialize LED Defect tab.');
    }
  };

  const powerOn = async () => {
    setPoweredOn(true);
    try {
      await postRequest('powerOn');
      await sleep(3000);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to power on.');
      setPoweredOn(false);
      return;
    }
    try {
      await initializeMain();
    } catch (error) {
      props.setAlert(error);
      return;
    }
    setTab(0);
    setInitialized(true);
  };

  const powerOff = async () => {
    try {
      await postRequest('powerOff');
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
      return;
    }
    try {
      const darkSceneStrength: number = await postRequest(
        'GetDarkSceneEnhancementStrength'
      );
      setDarkSceneStrength(darkSceneStrength);
      setDarkSceneStrengthCommitted(darkSceneStrength);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set dark scene enhancement strength.');
      return;
    }
    try {
      const brightness: number = await postRequest('GetBrightnessIndex');
      setBrightness(brightness);
      setBrightnessCommitted(brightness);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set brightness.');
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
      return;
    }
    try {
      const darkSceneStrength: number = await postRequest(
        'GetDarkSceneEnhancementStrength'
      );
      setDarkSceneStrength(darkSceneStrength);
      setDarkSceneStrengthCommitted(darkSceneStrength);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set dark scene enhancement strength.');
      return;
    }
    try {
      const brightness: number = await postRequest('GetBrightnessIndex');
      setBrightness(brightness);
      setBrightnessCommitted(brightness);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set brightness.');
    }
  };

  const handleDarkSceneStrengthChange = (event: any, value: any) => {
    if (value === darkSceneStrength) {
      return;
    }
    setDarkSceneStrength(value);
  };

  const handleDarkSceneStrengthChangeCommitted = async (
    event: any,
    value: any
  ) => {
    if (value === darkSceneStrengthCommitted) {
      return;
    }
    try {
      await postRequest('SetDarkSceneEnhancementStrength', [value]);
      setDarkSceneStrengthCommitted(value);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set dark scene enhancement strength.');
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

  const handleDefectModeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const mode = Number((event.target as HTMLInputElement).value);
    try {
      await postRequest('SetLedDefectDemoMode', [mode]);
      setDefectMode(mode);
    } catch (error) {
      console.error(error);
      props.setAlert('Failed to set LED defect mode.');
    }
  };

  const handleTabChange = async (
    event: React.SyntheticEvent,
    newTab: number
  ) => {
    switch (newTab) {
      case 0:
        try {
          await initializeMain();
        } catch (error) {
          props.setAlert(error);
          return;
        }
        break;
      case 1:
        try {
          await initializeLEDDefect();
        } catch (error) {
          props.setAlert(error);
          return;
        }
        break;
      default:
        break;
    }
    setTab(newTab);
  };

  const showMain = (): JSX.Element => {
    return (
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
        <div style={{ marginTop: '24px' }}>
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
          <Typography>Dark Scene Enhancement Strength</Typography>
          <Slider
            valueLabelDisplay="off"
            step={2}
            min={0}
            max={128}
            value={darkSceneStrength}
            marks={darkSceneStrengthMarks}
            onChange={handleDarkSceneStrengthChange}
            onChangeCommitted={handleDarkSceneStrengthChangeCommitted}
            sx={{
              width: '240px',
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
    );
  };

  const showLEDDefect = (): JSX.Element => {
    return (
      <>
        <FormControl>
          <RadioGroup value={defectMode} onChange={handleDefectModeChange}>
            <FormControlLabel
              value={0}
              control={<Radio />}
              label="Normal Display"
            />
            <FormControlLabel
              value={1}
              control={<Radio />}
              label="Black Out Several LEDs"
            />
            <FormControlLabel
              value={2}
              control={<Radio />}
              label="Compensate Blacked Out LEDs"
            />
          </RadioGroup>
        </FormControl>
      </>
    );
  };

  useEffect(() => {
    powerOn();
    return () => {
      if (poweredOn) {
        powerOff();
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
            if (event.target.checked) {
              powerOn();
            } else {
              powerOff();
            }
          }}
        />
      }
    >
      <Content
        sx={{
          height: '640px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {poweredOn &&
          (initialized ? (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={handleTabChange}>
                  <Tab label="Main" />
                  <Tab label="LED Defect" />
                </Tabs>
              </Box>
              <TabPanel value={tab} index={0}>
                {showMain()}
              </TabPanel>
              <TabPanel value={tab} index={1}>
                {showLEDDefect()}
              </TabPanel>
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
      </Content>
    </Canvas>
  );
};

export default Landing;
