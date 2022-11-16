import React from 'react';
import { Route, Switch, HashRouter } from 'react-router-dom';

import Home from './components/Home';
import ActuatorList from './components/ActuatorList';
import RuleList from './components/RuleList'
import ActuatorControl from './components/ActuatorControl';
import RuleEdit from './components/RuleEdit';
import UserSignUp from './components/UserSignUp';
import { Box } from '@mui/system';
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme'

function App() {
  return (
    <HashRouter>
      <Box>
        <ThemeProvider theme={theme}>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/actuator-list/" component={ActuatorList} />
          <Route path="/rule-list/" component={RuleList} />
          <Route path='/actuator-control/:id/' component={ActuatorControl} />
          <Route path='/rule/edit/' component={RuleEdit} />
          <Route path='/user/signup/' component={UserSignUp} />
        </Switch>
        </ThemeProvider>
      </Box>
    </HashRouter>
  );
}

export default App;