import angular from 'angular';
import 'bootstrap/dist/css/bootstrap.css';
import '../style/style.css';
import appModule from './app.config';


angular.bootstrap(document, [appModule.name]);