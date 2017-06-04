import 'bootstrap/dist/css/bootstrap.css';

import angular from 'angular';

import routing from './app.config';
import home from '../thaihome/home';

angular.module('app', ['ui.router',home])
    .config(routing);
    aaa