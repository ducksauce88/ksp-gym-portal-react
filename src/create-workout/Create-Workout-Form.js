import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import {
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';
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
import { useStyles, iconTheme } from './styles.js';
import { ThemeProvider } from '@material-ui/styles';
import {
  NormalFormTextField,
  Series,
  TypographyField
} from './Workout-Fields.js';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import { getOptions, alertmessage, parseJSON } from '../api/api-calls';
import { makeStyles } from '@material-ui/core/styles';

// TEMP, NEED TO REMOVE
// REPLACE WITH WEB API CALL
const sourceLocations = [
  {
    id: '5da228c501edb329bb43a972',
    name: 'Allentown',
    phone: '6013905742'
  },
  {
    id: '5da228c501edb329bb41a972',
    name: 'Bethlehem',
    phone: '6103905742'
  }
];

const sourceDevices = [
  {
    id: '5da228c501edb329bb49a972',
    name: 'Allentown Device 1',
    location: 'Allentown'
  },
  {
    id: '5da228c511edb329bb49a972',
    name: 'Allentown Device 2',
    location: 'Allentown'
  },
  {
    id: '5da228c521edb329bb49a972',
    name: 'Bethlehem Intro Device',
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
          label="Date"
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
const CreateWorkoutEntryForm = props => {
  const classes = useStyles();

  const [locations] = useState(sourceLocations); // Locations in NoSQL database
  const [devices, setDevices] = useState([]); // Devices in NoSQL database
  const [formLocations, setFormLocations] = useState([]); // Locations to be submitted
  const [formDevices, setFormDevices] = useState([]); // Devices to be submitted
  const [formAllSelectedTimes, setFormAllSelectedTimes] = useState([]); // Workout to be submitted
  const [formSeries, setFormSeries] = useState([]); // Series to be submitted
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date().setSeconds(0));

  // ------ Series Changes
  const handleSeriesAdd = () => {
    let series = {
      series_number: formSeries.length + 1,
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

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const handleTimeChange = date => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const newDateTime = new Date();
    newDateTime.setDate(selectedDate.getDate());
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);
    setSelectedTime(newDateTime);
    setSelectedDate(newDateTime);
  };
  // Pushes the current selected time on to the list and
  // sets the time state for form submission.
  // The time will always be available due to the state
  // being set on render or after 'Add Time' button click
  const handleAllSelctedTimesChange = () => {
    const times = formAllSelectedTimes;
    const newTime = new Date(selectedTime);
    times.push(new Date(selectedTime));
    setFormAllSelectedTimes([...times]);
  };

  const handleSubmit = () => {
    const workoutDateTime = selectedDate;
    const workout = {
      workout_name: workoutName,
      workout_date: workoutDateTime,
      workout_times: formAllSelectedTimes,
      workout_image_url: 'www.youre-awesome.com',
      locations: [...formLocations],
      devices: [...formDevices],
      workout_series: [...formSeries]
    };
    // post to server
    const postData = async () => {
      return await fetch(
        process.env.REACT_APP_API_POST_WORKOUT,
        getOptions(workout)
      );
    };
    props.history.push({
      // pathname: '/new-workout-summary',
      pathname: '/loading'
    });
    const response = postData();
    response.then(parseJSON).then(res => {
      if (res.status !== 200) {
        alertmessage(res.json.errors);
      } else if (res.ok) {
        props.history.push({
          pathname: '/new-workout-summary',
          state: { posted_date: res.json }
        });
      }
    });
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
            allSelectedTimes={formAllSelectedTimes}
            handleAllSelctedTimesChange={handleAllSelctedTimesChange}
            handleDateChange={handleDateChange}
            handleTimeChange={handleTimeChange}
            handleWorkoutNameChange={handleWorkoutNameChange}
          />
          <ThemeProvider theme={iconTheme}>
            <ControlPointIcon color="primary" onClick={handleSeriesAdd} />
            {<TypographyField title={'Add Series'} h={'h8'} />}
          </ThemeProvider>
          <div className={classes.seriesGridParent}>
            {formSeries.map((currElement, index) => (
              <>
                <Series
                  series_number={currElement.series_number}
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

const listStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper
  }
}));

const StyledListItem = withStyles({
  root: {
    backgroundColor: 'blue',
    '&$selected': {
      backgroundColor: 'red'
    }
  },
  selected: {}
})(ListItem);

const StyledList = withStyles({
  root: {
    backgroundColor: '#484848',
    width: '150%',
    '&$selected': {
      backgroundColor: 'red'
    }
  },
  selected: {}
})(List);

const SelectedTimes = props => {
  const classes = listStyles();
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };
  const toTwelveHourTime = date => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  return (
    <>
      <div className={classes.root}>
        <StyledList component="nav" aria-label="main mailbox folders">
          {props.allSelectedTimes.map((time, index) => (
            <>
              <div>
                <ListItem
                  button
                  selected={selectedIndex === index}
                  onClick={event => handleListItemClick(event, index)}
                >
                  {toTwelveHourTime(time)}
                </ListItem>
              </div>
            </>
          ))}
          {/* <ListItem
            button
            selected={selectedIndex === 0}
            onClick={event => handleListItemClick(event, 0)}
          >
            {'5:00PM'}
          </ListItem> */}
        </StyledList>
        {/* <Divider /> */}
      </div>
    </>
  );
};

SelectedTimes.propTypes = {
  allSelectedTimes: PropTypes.array
};

const EmptyListItem = () => {
  return (
    <>
      <div>
        <ListItem button selected={''} onClick={''}>
          {''}
        </ListItem>
      </div>
    </>
  );
};

const WorkoutSelectors = props => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.selctorsParent}>
        <div className={classes.workoutDateGrid}>
          <Paper className={classes.paper}>
            <div className={classes.filterSelectorGrid1}>
              <div className={classes.filterSelectorGrid1}>
                <div className={classes.datePickerGrid}>
                  <NormalDatePicker
                    selectedDate={props.selectedDate}
                    handleDateChange={props.handleDateChange}
                  />
                </div>
                <div className={classes.dateTimePickerGrid}>
                  <NormalTimePicker
                    selectedDate={props.selectedTime}
                    handleDateChange={props.handleTimeChange}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={props.handleAllSelctedTimesChange}
                  >
                    Add Time
                  </Button>
                </div>
              </div>
              <div className={classes.filterSelectorGrid2}>
                <div className={classes.selectedTimesGrid}>
                  <SelectedTimes allSelectedTimes={props.allSelectedTimes} />
                </div>
              </div>
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
  allSelectedTimes: PropTypes.array,
  handleAllSelctedTimesChange: PropTypes.array,
  selectedTime: PropTypes.string,
  handleDateChange: PropTypes.func,
  handleTimeChange: PropTypes.func,
  handleWorkoutNameChange: PropTypes.func
};

export { CreateWorkoutEntryForm as CreateWorkoutForm, useStyles };
