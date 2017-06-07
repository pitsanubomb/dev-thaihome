import angular from 'angular';
import 'bootstrap/dist/css/bootstrap.css';
import '../style/style.css';
// import '../style/font-awesome.css';
import appModule from './app.config';


angular.module(document, [appModule.name])
