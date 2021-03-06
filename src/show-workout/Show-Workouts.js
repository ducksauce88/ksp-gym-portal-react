import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { fetchJsonPromise, alertmessage, parseJSON } from '../api/api-calls';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { ThemeProvider } from '@material-ui/styles';
import { useStyles, editButtonTheme } from './styles';
import { Paper, Button } from '@material-ui/core';
import {
  toTwelveHourTimeShort,
  convertIfDate,
  removeFromArrayByIndex,
  cleanAndTitle
} from '../tools/tools';
import { PreviewWorkout } from '../workouts/workout-view';

const panelStyles = makeStyles(theme => ({
  root: {
    width: '75%',
    'margin-top': '10px',
    margin: 'auto',
    outline: 0,
    padding: '5px',
    'border-radius': '2x',
    'justify-content': 'center',
    'background-color': '#484848'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  summary: {
    'background-color': '#484848',
    color: 'white'
  }
}));

const filterBoxStyles = makeStyles(theme => ({
  root: {
    'margin-top': '10px',
    'padding-left': '20px',
    width: '10%',
    float: 'left'
  }
}));

// Component Description:
//    Location filter for filter form
const LocationFilter = props => {
  const [selectedLocation, setSelectedLocation] = useState('Locations');
  const locations = [
    {
      id: 1,
      name: 'Allentown',
      phone: '6109305742'
    },
    {
      id: 2,
      name: 'Bethlehem',
      phone: '6103905742'
    }
  ];
  const classes = filterBoxStyles();
  const handleSelection = (evtKey, evt) => {
    // console.log(`Selected ${evt.target.innerHTML}`);
    setSelectedLocation(evt.target.innerHTML);
  };
  return (
    <>
      <DropdownButton
        size="sm"
        title={selectedLocation}
        id={`dropdown-button-drop`}
        key={0}
        onSelect={handleSelection}
      >
        <LocationDropdownList locations={locations} />
      </DropdownButton>
    </>
  );
};

const LocationDropdownList = props => {
  return (
    <>
      {props.locations.map(location => (
        <Dropdown.Item key={location.id} eventKey={location.id}>
          {location.name}
        </Dropdown.Item>
      ))}
    </>
  );
};

LocationDropdownList.propTypes = {
  locations: PropTypes.array
};

const FilterForm = () => {
  const classes = filterBoxStyles();
  return (
    <>
      <div className={classes.root}>
        <form>
          <div className="form-group">
            <LocationFilter />
            <label>Show Days</label>
            <input type="text" className="form-control" placeholder="3"></input>
          </div>
        </form>
      </div>
    </>
  );
};

// Component Description:
//    Top div to display the workouts in a list
const WorkoutExpandableTable = props => {
  const [workoutinfo, setWorkoutinfo] = useState([]);
  const classes = panelStyles();
  const apiGetWorkouts = `${process.env.REACT_APP_API_GET_WORKOUTS_LIMIT}/3`;
  // Call fetch data one time.
  // We need to use ,[] at the end of useEffect() to make sure
  // it is only ran one time. Not sure if this is preffered and I'm not sure
  // if it will re render later when needed.
  useEffect(() => {
    // Fetch the data on initial page load to default
    fetchJsonPromise(apiGetWorkouts).then(res => setWorkoutinfo(res));
    //.catch(error => {
    //alert('ERROR: Unable to reach Workout APIs!');
    //});
  }, []);

  // Delete a workout from the workoutinfo list
  const handleWorkoutDelete = id => {
    const tempArr = removeFromArrayByIndex(workoutinfo, x => x.id == id);
    setWorkoutinfo([...tempArr]);
  };

  return (
    <div className={classes.root}>
      {workoutinfo.map(workout => {
        return (
          <WorkoutLineItem
            key={workout.id}
            workoutinfo={workout}
            handleWorkoutDelete={handleWorkoutDelete}
          />
        );
      })}
    </div>
  );
};
WorkoutExpandableTable.propTypes = {
  workoutinfo: PropTypes.object
};

const paperWrapper = makeStyles(theme => ({
  root: {
    width: '100%',
    'margin-top': '0px',
    margin: 'left',
    outline: 0,
    padding: '5px',
    // 'border-radius': '2x',
    // 'justify-content': 'center',
    'background-color': '#484848'
  },
  text: {
    'background-color': '#484848'
  },
  button: {},
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  summary: {
    'background-color': '#484848',
    color: 'black'
  }
}));

// Component Description:
//    Each individual line item in the workout list
const WorkoutLineItem = props => {
  const classes = panelStyles();
  const paperStyles = useStyles();
  const workoutName = `Workout Name: ${props.workoutinfo.workout_name}`;
  // const workoutDate = `Workout Times: ${new Date( props.workoutinfo.date_added).toLocaleString()}`;
  let formatedDateTimes = props.workoutinfo.workout_times.map(x => {
    return toTwelveHourTimeShort(new Date(x));
  });
  let strFormatedDateTimes = formatedDateTimes.join(' \\\\ ');
  const workoutDate = `Workout Times: ${strFormatedDateTimes}`;
  const workoutHeader = `${workoutName} | ${workoutDate}`;

  const handleDelete = () => {
    const postLink =
      process.env.REACT_APP_API_DELETE_WORKOUT + props.workoutinfo.id;
    const deleteRecord = async () => {
      return await fetch(postLink, { method: 'delete' });
    };

    deleteRecord()
      .then(parseJSON)
      .then(res => {
        if (res.status !== 200) {
          alertmessage(res.json.errors);
        } else if (res.ok) {
          //alertmessage('properly deleted')
          // delete workout=
          props.handleWorkoutDelete(props.workoutinfo.id);
        }
      });
    // const postData = async () => {
    //   return await fetch(
    //     process.env.REACT_APP_API_POST_WORKOUT,
    //     getOptions(workout)
    //   );
    // };
  };

  return (
    <ExpansionPanel
      expanded={process.env.NODE_ENV === 'development' ? 'true' : 'false'} // expand in development
      className={classes.summary + ' rounded'}
    >
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{workoutHeader}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className={paperStyles.root}>
          <Paper className={paperStyles.paper}>
            <PreviewWorkout workoutInfo={props.workoutinfo} textSize={'h4'} />
          </Paper>
          <Paper className={paperStyles.paper}>
            <ThemeProvider theme={editButtonTheme}>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </ThemeProvider>
          </Paper>
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

WorkoutLineItem.propTypes = {
  workoutinfo: PropTypes.object,
  handleWorkoutDelete: PropTypes.func
};

const WorkoutSummary = props => {
  return (
    <>
      {Object.entries(props.data).map(key => {
        const keyTitle = cleanAndTitle(key[0]);

        //let isDate = isValidDate(value)
        // if date, convert it
        {
          /* if (isDate) {
          var isodate = new Date(value);
          value = isodate; //toTwelveHourTimeShort(isDate).toISOString();
        } */
        }
        if (Array.isArray(key[1])) {
          return (
            <>
              <li>
                {keyTitle}:
                <ul>
                  <WorkoutSummary
                    data={key[1]}
                    useparent={false}
                    parentname={key[0]}
                  />
                </ul>
              </li>
            </>
          );
        } else if (typeof key[1] === 'object') {
          return (
            <>
              <ul>
                <WorkoutSummary data={key[1]} parentname={key[0]} />
              </ul>
            </>
          );
        } else if (
          keyTitle.toLowerCase().includes('id') ||
          keyTitle.toLowerCase().includes('_id')
        ) {
          const doNothing = '';
        } else {
          return (
            <>
              <li key={keyTitle}>
                {props.useparent === undefined
                  ? keyTitle + ':'
                  : props.useparent
                  ? props.parentname
                  : props.parentname === undefined
                  ? keyTitle + ':'
                  : ''}{' '}
                {convertIfDate(key[1])}
              </li>
            </>
          );
        }
      })}
    </>
  );
};

// Component Description:
//    Each series per workout
const Series = props => {
  return (
    <>
      <ul>
        <li>Series Number: {props.series.series_number}</li>
        <li>Series Tag: {props.series.series_tag}</li>
        <li>
          <Exercises series={props.series} />
        </li>
      </ul>
    </>
  );
};
Series.propTypes = {
  series: PropTypes.array
};
// Component Description:
//    Each exercise per series
const Exercises = props => {
  return (
    <>
      Exercises:
      <ul>
        {props.series.exercises.map(exercise => (
          <li key={props.series.series_number}>
            {exercise.exercise_name} | {exercise.exercise_reps}
          </li>
        ))}
      </ul>
    </>
  );
};
Exercises.propTypes = {
  series: PropTypes.array
};

export { WorkoutExpandableTable, FilterForm };
