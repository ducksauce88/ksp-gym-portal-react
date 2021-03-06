import React, { useState } from 'react';
// import {TestWorkoutData} from './test-data.js';
import {
  WorkoutExpandableTable,
  FilterForm
} from './show-workout/Show-Workouts';
// import NavBar from './navbar.js';
import { makeStyles } from '@material-ui/core/styles';
import { NewWorkoutSummary } from './create-workout/New-Workout-Summary';
import { CreateWorkoutForm } from './create-workout/Create-Workout-Form';
import LoadingDots from './create-workout/Loading';
import {
  Navbar,
  Nav,
  NavDropdown,
  FormControl,
  Form,
  Button,
  NavItem
} from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Link,
  NavLink,
  Route
} from 'react-router-dom';
import { Redirect } from 'react-router';
const outerDivStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    'flex-direction': 'row'
  }
}));

function App() {
  const classes = outerDivStyles();
  return (
    <div>
      <NavBar />
      <div className={classes.root}>{/* <ViewWorkouts /> */}</div>
    </div>
  );
}

const ViewWorkouts = () => {
  return (
    <>
      <FilterForm />
      <WorkoutExpandableTable />
    </>
  );
};

const navBarStyle = makeStyles(theme => ({
  root: {
    'background-color': 'white'
  }
}));

const NavBar = props => {
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      <Navbar bg="transparent" variant="dark" expand="lg">
        <Navbar.Brand href="#home">KSP Workout Portal</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/create-workout/Create-Workout-Form">
              Create Workout
            </Nav.Link>
            {/* <Nav.Link href="./Create-Workout">Create Workout</Nav.Link> */}
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-success">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      <Route path="/" exact component={ViewWorkouts} />
      <Route
        path="/create-workout/Create-Workout-Form"
        exact
        component={CreateWorkoutForm}
      />
      <Route path="/new-workout-summary" exact component={NewWorkoutSummary} />
      <Route path="/loading" exact component={LoadingDots} />
    </Router>
  );
};

export default App;
