'use strict';
var env = require('node-env-file');
env(__dirname + '/.env');
module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    concat: {
      bowerjs: {
        src: [
                    './bower_components/jquery/dist/jquery.min.js',
                    './bower_components/datatables/media/js/jquery.dataTables.js',
                    './bower_components/angular/angular.js',
                    './bower_components/underscore/underscore.js',
                    './bower_components/thaihome-dependecies/calendar/base.js',
                    './bower_components/angular-route/angular-route.js',
                    './bower_components/angular-animate/angular-animate.js',
                    './bower_components/angular-resource/angular-resource.js',
					'./bower_components/angular-recaptcha/release/angular-recaptcha.js',
                    './bower_components/angular-aria/angular-aria.js',
                    './bower_components/angular-material/angular-material.js',
                    './bower_components/angular-bootstrap/ui-bootstrap.js',
                    './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                    './bower_components/moment/moment.js',
                    './bower_components/angular-moment/angular-moment.js',
                    './bower_components/angular-scroll/angular-scroll.js',
                    './bower_components/angular-touch/angular-touch.js',
                    './bower_components/angular-ui-router/release/angular-ui-router.js',
                    './bower_components/angular-underscore-module/angular-underscore-module.js',
                    './bower_components/ngmap/build/scripts/ng-map.js',
                    './bower_components/angular-datatables/dist/angular-datatables.js',
                    './bower_components/angular-xeditable/dist/js/xeditable.js',
                    './bower_components/angular-ui-notification/dist/angular-ui-notification.min.js',
                    './bower_components/angular-route-styles/ui-route-styles.js',
                    './bower_components/angular-file-upload/dist/angular-file-upload.js',
                    './bower_components/angular-credit-cards/release/angular-credit-cards.js',
                    './bower_components/jquery-ui/jquery-ui.js',
                    './bower_components/angular-ui-sortable/sortable.js',
                    './bower_components/metisMenu/dist/metisMenu.js',
                    './bower_components/angular-multi-step-form/dist/browser/angular-multi-step-form.js',
                    './bower_components/scheduler/daypilot-all.min.js',
                    './bower_components/moment-duration-format/lib/moment-duration-format.js',
                    './bower_components/hotkeys/index.js',
                    './bower_components/textAngular/dist/textAngular-rangy.min.js',
                    './bower_components/textAngular/dist/textAngular-sanitize.min.js',
                    './bower_components/textAngular/dist/textAngular.min.js',
                    './bower_components/jquery-mobile-bower/jquery.mobile-1.4.5.min.js',
                    './bower_components/thaihome-dependecies/powertip/jquery.powertip.js',
                    './bower_components/thaihome-dependecies/dpd/angular-dpd.js',
                    './bower_components/ngclipboard/dist/ngclipboard.min.js',
                    './bower_components/sweetalert/dist/sweetalert.min.js'],
        dest: './public/bower.js'
      },
      scriptsjs: {
        src: [
                    './source/js/**/app.js',
                    './source/js/**/**/*.js',
                    './source/templates/admin/inspection/*.js'
                ],
        dest: './public/scripts.js'
      },
      bowercss: {
        src: ['./bower_components/textAngular/dist/textAngular.css',
                    './bower_components/angular-bootstrap/ui-bootstrap-csp.css',
                    './bower_components/datatables/media/css/dataTables.bootstrap.css',
                    './bower_components/thaihome-dependecies/calendar/picker.css',
                    './bower_components/angular-material/angular-material.css',
                    './bower_components/bootstrap/dist/css/bootstrap.css',
                    './bower_components/datatables/media/css/jquery.dataTables.css',
                    './bower_components/angular-xeditable/dist/css/xeditable.css',
                    './bower_components/angular-ui-notification/dist/angular-ui-notification.min.css',
                    './bower_components/thaihome-dependecies/powertip/jquery.powertip.css',
                    './bower_components/sweetalert/dist/sweetalert.css'
                ],
        dest: './public/bower.css'
      },
      customcss: {
        src: [
                  './source/css/style.css'
                ],
        dest: './public/styles.css'
      }
    },
    /*uglify: {
      scripts: {
        files: {
          './public/bower.min.js': ['./public/bower.js'],
          './public/scripts.min.js': ['./public/scripts.js'],
          './public/templates.min.js': ['./public/templates.js'],
          './public/env.min.js': ['./public/env.js']
        }
      }
    },*/
    copy: {
      dev: {
        files: [
          {
            cwd: './source/',
            src: './index.html',
            dest: './public/',
            expand: true
            },
          {
            cwd: './source/css',
            src: '*.css',
            dest: './public/css',
            expand: true
            }]

      }
    },

    html2js: {
      options: {
        rename: function (moduleName) {
          return moduleName.replace('../source/', '');
        }
      },
      main: {
        src: ['./source/templates/**/**/*.html', '!./source/index.html'],
        dest: 'public/templates.js'
      },
    },
    watch: {
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['dev', 'notify:gruntfile']
      },

      scripts: {
        files: ['./source/js/**/**/*.js',  './source/templates/admin/inspection/*.js'],
        tasks: ['concat:scriptsjs', 'notify:scripts'],
      },
      css: {
        files: ['./source/css/**/*.css'],
        tasks: ['concat:customcss', 'notify:css'],
      },
      html: {
        files: ['./source/templates/**/*.html'],
        tasks: ['html2js', 'notify:html']
      }
    },
    notify: {
      copy: {
        options: {
          title: 'Files Copied',
          message: 'Went just fine!'
        }
      },
      html: {
        options: {
          title: 'HTML source files copied!',
          message: 'Went just fine!'
        }
      },
      css: {
        options: {
          title: 'CSS concatenated and minified!',
          message: 'No issues!'
        }
      },
      scripts: {
        options: {
          title: 'JavaScript uglified!',
          message: 'All good here!'
        }
      },
      gruntfile: {
        options: {
          title: 'Gruntfile reloaded!',
          message: 'Gruntfile has been reloaded! Check your terminal!'
        }
      }
    },
    ngconstant: {
      options: {
        dest: './public/env.js',
        name: 'ENV'
      },
      dist: {
        constants: {
          'CONFIG': {
            API_URL: process.env.API_URL,
            DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
            HELPER_URL: process.env.HELPER_URL,
            DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE,
            DEFAULT_DATE_FORMAT: process.env.DEFAULT_DATE_FORMAT,
            SHORT_DATE_FORMAT: process.env.SHORT_DATE_FORMAT,
            DEFAULT_FULL_DATE_FORMAT: process.env.DEFAULT_FULL_DATE_FORMAT,
            HOME_IMAGE_TIMEOUT: process.env.HOME_IMAGE_TIMEOUT,
            BOOKING_DAYS_EXPIRE: process.env.BOOKING_DAYS_EXPIRE,
            PUBLIC_KEY: process.env.PUBLIC_KEY,
          }
        }
      }
    },
    nodemon: {
      start: {
        script: 'app.js'
      }
    },
    concurrent: {
      dev: ['start', 'dev'],
      publish: ['start', 'publish'],
      options: {
        logConcurrentOutput: true
      }
    },
    htmlmin: { // Task
      publish: { // Target
        options: { // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: { // Dictionary of files
          './public/index.html': './public/index.html', // 'destination': 'source'
        }
      }
    }
  });

  //Loading NPM tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-ng-constant');

  //Concurrent tasks
  grunt.registerTask('default', ['concurrent:dev', 'ngconstant']);
  grunt.registerTask('publish', ['htmlmin:publish', 'ngconstant', 'copy:publish']);
  //Rest of tasks
  grunt.registerTask('dev', ['concat', 'html2js', 'copy:dev',   'ngconstant', 'watch']);
  grunt.registerTask('build', ['htmlmin:stage', 'cssmin', 'copy:stage', 'ngconstant']);
  grunt.registerTask('start', ['nodemon:start']);
  grunt.registerTask('deploy', ['concat', 'html2js', 'copy:dev', 'ngconstant']);
};
