import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import { Paper, Grid, TextField, Typography, Button } from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  KeyboardTimePicker
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {
  FilterSelectionComponent,
  locationCheckboxProcedures,
  containsObject,
  deviceCheckboxProcedures
} from './Workout-Side-Filter';
import { useStyles, seriesHeadingTheme, iconTheme } from './styles.js';
import { ThemeProvider } from '@material-ui/styles';
import {
  Exercise,
  NormalFormTextField,
  Series,
  ControlPointAdd,
  TypographyField
} from './Workout-Fields.js';
import ControlPointIcon from '@material-ui/icons/ControlPoint';

// TEMP, NEED TO REMOVE
// REPLACE WITH WEB API CALL
const sourceLocations = [
  {
    id: '243q3r',
    name: 'Allentown',
    phone: '6013905742'
  },
  {
    id: 'wfer43',
    name: 'Bethlehem',
    phone: '6103905742'
  }
];

const sourceDevices = [
  {
    id: 'xadfw213423',
    name: 'Adult Device 1 Alt',
    location: 'Allentown'
  },
  {
    id: 'asdfvv23431',
    name: 'Adult Device 2 Alt',
    location: 'Allentown'
  },
  {
    id: 'averv035',
    name: 'Adult Device 1 Beth',
    location: 'Bethlehem'
  },
  {
    id: 'er68sdasd',
    name: 'Adult Device 2 Beth',
    location: 'Bethlehem'
  },
  {
    id: '34r34q4f3f',
    name: 'Intro Device Beth',
    location: 'Bethlehem'
  }
];

const CssDatePicker = withStyles({
  root: {
    '& .MuiInput-root': {
      color: 'white',
      borderBottomColor: 'white'
    },
    '& .Mui-focused': {
      borderBottomColor: 'white'
    },
    '& .MuiInput-input': {
      borderBottomColor: 'white'
    },
    '& label.Mui-focused': {
      color: 'white',
      borderBottomColor: 'white'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white',
      color: 'white'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'white',
      color: 'white'
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
        borderBottomColor: 'white',
        color: 'white'
      },
      '&:hover fieldset': {
        borderColor: 'white',
        borderBottomColor: 'white',
        color: 'white'
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
        borderBottomColor: 'white',
        color: 'white'
      },
      flexGrow: 1,
      color: 'white'
    }
  }
})(KeyboardDatePicker);

const CssTimePicker = withStyles({
  root: {
    '& .MuiInput-root': {
      color: 'white',
      borderBottomColor: 'white'
    },
    '& .Mui-focused': {
      borderBottomColor: 'white'
    },
    '& .MuiInput-input': {
      borderBottomColor: 'white'
    },
    '& label.Mui-focused': {
      color: 'white',
      borderBottomColor: 'white'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white',
      color: 'white'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'white',
      color: 'white'
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
        borderBottomColor: 'white',
        color: 'white'
      },
      '&:hover fieldset': {
        borderColor: 'white',
        borderBottomColor: 'white',
        color: 'white'
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
        borderBottomColor: 'white',
        color: 'white'
      },
      flexGrow: 1,
      color: 'white'
    }
  }
})(KeyboardTimePicker);

const NormalDatePicker = props => {
  const classes = useStyles();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {/* <Grid container justify="space-around"> */}
        <CssDatePicker
          margin="normal"
          id="date-picker-dialog"
          label="Date picker dialog"
          format="MM/dd/yyyy"
          value={props.selectedDate}
          onChange={props.handleDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date'
          }}
          InputLabelProps={{
            classes: {
              root: classes.datePicker
            }
          }}
        />
      </MuiPickersUtilsProvider>
    </>
  );
};

NormalDatePicker.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  handleDateChange: PropTypes.func
};

const NormalTimePicker = props => {
  const classes = useStyles();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {/* <Grid container justify="space-around"> */}
        <CssTimePicker
          margin="normal"
          id="time-picker"
          label="Time picker"
          value={props.selectedDate}
          onChange={props.handleDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date'
          }}
          InputLabelProps={{
            classes: {
              root: classes.datePicker
            }
          }}
        />
      </MuiPickersUtilsProvider>
    </>
  );
};

NormalTimePicker.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  handleDateChange: PropTypes.func
};

// The entire workout form assembled together
const CreateWorkoutEntryForm = () => {
  const classes = useStyles();

  const [locations] = useState(sourceLocations); // Locations in NoSQL database
  const [devices, setDevices] = useState([]); // Devices in NoSQL database
  const [formLocations, setFormLocations] = useState([]); // Locations to be submitted
  const [formDevices, setFormDevices] = useState([]); // Devices to be submitted
  const [formWorkout, setFormWorkout] = useState([]); // Workout to be submitted
  const [formSeries, setFormSeries] = useState([]); // Series to be submitted
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date().setSeconds(0));

  // ------ Series Changes
  const handleSeriesAdd = () => {
    let series = {
      id: formSeries.length + 1,
      series_tag: '',
      exercises: []
    };
    let tempList = formSeries;
    tempList.push(series);
    setFormSeries([...tempList]);
  };

  // Sets the series tag
  const handleSeriesTagChange = id => event => {
    const tempList = formSeries;
    tempList[id - 1]['series_tag'] = event.target.value;
    setFormSeries([...tempList]);
  };
  const handleExerciseChange = (seriesId, exerciseArr) => {
    const tempList = formSeries;
    tempList[seriesId - 1]['exercises'] = [...exerciseArr];
    setFormSeries([...tempList]);
  };
  // ------ End Series Changes

  function handleDateChange(date) {
    setSelectedDate(date);
  }

  const handleTimeChange = date => {
    setSelectedTime(date);
  };

  const handleSubmit = event => {
    const loc = formLocations;
    const dev = formDevices;
    const series = formSeries;
    const workoutname = workoutName;
    const workoutDateTime = selectedDate;
    // const wtime = selectedTime.getHours() + ':' + ((selectedTime.getMinutes() < 10) ? '0':'') + selectedTime.getMinutes();
    workoutDateTime.setTime(selectedTime.getTime());

    const workout = {
      workout_name: workoutName,
      workout_date: workoutDateTime,
      workout_series: formSeries
    };

    // event.preventDefault();
    // let test = event.currentTarget;
    // const data = new FormData(event.target);

    // console.log(`WorkoutName in handlesubmit: ${workoutName}`);
  };
  const handleWorkoutNameChange = event => {
    setWorkoutName(event.target.value);
  };

  // Handles a change to the Locations filter on the left side of the page.
  // A change here will update formLocations to store what locations the workout is for.
  const handleLocationChange = event => {
    locationCheckboxProcedures(
      event,
      locations,
      formLocations,
      setFormLocations
    );
  };
  // This use effect handles updating the Devices filter on the left side of the screen
  // Devices are shown when the user selects the locaiton it is intended for.
  useEffect(() => {
    // build list of devices that have the location name of the ones selected
    const checkedList = sourceDevices.filter(x => {
      const test = formDevices;
      for (var i = 0; i < formLocations.length; i++) {
        // only show the checkboxes that have the same location name
        // as the locaiton check boxes that are selected
        if (x.location === formLocations[i].name) {
          return x;
        }
      }
    });
    // update the devices list
    setDevices(checkedList);
  }, [formLocations]);
  // This hook is to manage the formDevices list upon chages made to
  // the devices state list
  useEffect(() => {
    const checkedList = sourceDevices.filter(x => {
      for (var i = 0; i < formLocations.length; i++) {
        // Only add the items in the list that are for that location
        // and are previously in formDevices
        if (x.location === formLocations[i].name) {
          if (containsObject(x, formDevices)) {
            return x;
          }
        }
      }
    });
    // update the formDevices list for submitting
    setFormDevices(checkedList);
  }, [devices]);
  // Handles a change to the Devices fileter when the
  const handleDeviceChange = event => {
    deviceCheckboxProcedures(event, devices, formDevices, setFormDevices);
  };
  return (
    <>
      <div className={classes.mainWrapper}>
        <div className={classes.sidebar}>
          <Paper>
            <FilterSelectionComponent
              locations={locations}
              locationHandleFn={handleLocationChange}
              devices={devices}
              devicesHandleFn={handleDeviceChange}
            />
          </Paper>
        </div>
        <div className={classes.formgrid}>
          <WorkoutSelectors
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            handleDateChange={handleDateChange}
            handleTimeChange={handleTimeChange}
            handleWorkoutNameChange={handleWorkoutNameChange}
          />
          <ThemeProvider theme={iconTheme}>
            <ControlPointIcon color="primary" onClick={handleSeriesAdd} />
            {<TypographyField title={'Add Series'} h={'h8'} />}
          </ThemeProvider>
          <div className={classes.gridParent}>
            {formSeries.map((currElement, index) => (
              <>
                <Series
                  series_number={currElement.id}
                  handleTagChange={handleSeriesTagChange}
                  handleExerciseChange={handleExerciseChange}
                />
              </>
            ))}
          </div>
          <ThemeProvider theme={iconTheme}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </ThemeProvider>
        </div>
      </div>
    </>
  );
};

const WorkoutSelectors = props => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.gridParent}>
        <div className={classes.workoutDateGrid}>
          <Paper className={classes.paper}>
            <div className={classes.workoutFormDivParent}>
              <NormalDatePicker
                selectedDate={props.selectedDate}
                handleDateChange={props.handleDateChange}
              />
              <NormalTimePicker
                selectedDate={props.selectedTime}
                handleDateChange={props.handleTimeChange}
              />
            </div>
          </Paper>
        </div>
        <div className={classes.workoutNameGrid}>
          <Paper className={classes.paper}>
            <div className={classes.workoutTextField}>
              <NormalFormTextField
                labelName="Workout Name"
                handleChange={props.handleWorkoutNameChange}
              />
            </div>
          </Paper>
        </div>
      </div>
    </>
  );
};

WorkoutSelectors.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  selectedTime: PropTypes.string,
  handleDateChange: PropTypes.func,
  handleTimeChange: PropTypes.func,
  handleWorkoutNameChange: PropTypes.func
};

export { CreateWorkoutEntryForm as CreateWorkoutForm, useStyles };
