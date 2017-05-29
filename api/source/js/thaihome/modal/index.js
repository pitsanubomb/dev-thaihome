(function () {
  "use strict";
  angular.module('ThaiHome')
    .service("Modal", ['$uibModal', '$rootScope', '$templateCache', 'CONFIG', 'Property', 'DTOptionsBuilder', 'User', 'Discount', 'Location', 'Email', 'Notification', 'Currency', '$filter', 'Season', '$sce','$route', function ($uibModal, $rootScope, $templateCache, CONFIG, Property, DTOptionsBuilder, User, Discount, Location, Email, Notification, Currency, $filter, Season, $sce , $route) {
      this.openGallery = function (images, unique) {
        var template = $templateCache.get('templates/thaihome/property-gallery/index.html');
        var scope = $rootScope.$new();
        scope.images = images;
        scope.unique = unique;
        $uibModal.open({
          windowClass: 'property-gallery',
          template: template,
          scope: scope,
          controller: "GalleryCtrl",
          animation: true
        });
      };

      this.propertyDetails = function (property, translation, close) {
        var template = $templateCache.get('templates/thaihome/property-details/more.html');
        var scope = $rootScope.$new();
        scope.showMoreClose = close;
        scope.property = property;
        scope.translation = translation;
        $uibModal.open({
          windowClass: 'about-property',
          template: template,
          scope: scope,
          animation: true
        });
      };

      this.default = function (message) {

        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><p>' + message + '</p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.rules = function (translation) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        console.log(translation);
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><h3>House Rules</h3><p class="wrapspace">' + translation.texts[0].house_rules + '</p>',
          windowTemplate: windowTemplate,
          scope: false,
          windowClass: 'property-rules',
          animation: true
        });
      };


      this.messageReceived = function () {
        return false;
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><p>Your message has been sent. We will reply as quickly as possible.</p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.tags = function (data) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/tags/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          animation: true
        });

      };

      this.cancellation = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><h3>{{T.transCancellation}}</h3><p ng-bind-html="T.transCancellationTerms"></p>',
          windowTemplate: windowTemplate,
          scope: false,
          windowClass: 'property-rules',
          animation: true
        });
      };
      /*
       1) Cleaning fees are always refunded if the guest did not check in.
       2) Cancellation must be by email to note@flipinvert.com
       3) For a full refund, cancellation must be made 5 days before the check in, if later than 5 days, any booking fee or deposit will be kept by the
       */

      this.bookingList = function (data) {
        var scope = $rootScope.$new(true);
        scope.bookings = data;
        scope.dtOptions = DTOptionsBuilder.newOptions();
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/booking/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });

      };

      this.newBooking = function (email, id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Your booking has been saved</h3><p>A booking confirmation will be sent to ' + email + ' as  soon as we receive the payment. <br />Please note, a bank transfer can take 4-6 days, we will notify you as soon as we get the money</p><p><a ng-click="$close()" href="javascript:void(0);" ui-sref="booking({id: \'' + id + '\' })"><md-button class="md-raised md-primary">View Booking Status</md-button></a> <md-button class="md-raised md-primary" ng-click="$close()">Continue with Payment</md-button></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      function getIdAsString(id){
        return String(id);
      };

      this.newBookingManagement = function (id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Booking has been saved</h3><p><a ng-click="$close()" href="/management/booking/' + id + '//"><md-button class="md-raised md-primary">View Booking Status</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.bookingUpdateModal = function (id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<div style="text-align:center;"><h3>Booking has been saved</h3><p><a ng-click="$close()" ui-sref="management.home" ui-sref-opts="{reload: true, notify: true}"><md-button class="md-raised md-primary">Home</md-button></a><a ng-click="$close()" href="/management/booking/' + id + '// "><md-button class="md-raised md-primary">Ok</md-button></a></p></div>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        })
      };

      this.minimDays = function (days) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Sorry</h3><p>This property requires a minimum booking period of <b>' + days + '</b> nights</p><p><a ng-click="$close()" href="javascript:void(0);"><md-button class="md-raised md-primary">OK</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.doubleBooking = function (data) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $('.page-loading').addClass('hide');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Dates not available</h3><p>We\'re sorry but it appears these dates (<b>' + moment.unix(data.checkin).utc().format(CONFIG.DEFAULT_DATE_FORMAT) + ' - ' + moment.unix(data.checkout).utc().format(CONFIG.DEFAULT_DATE_FORMAT) + '</b>) are allready booked</p><p>Please go back and select other dates<p><a ng-click="openCalendar();$close();" href="javascript:void(0);"><md-button class="md-raised md-primary">Back</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.doubleBookingAgent = function (data) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
		$('.page-loading').addClass('hide');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Dates not available</h3><p>We\'re sorry but it appears these dates (<b>' + moment.unix(data.checkin).format(CONFIG.DEFAULT_DATE_FORMAT) + ' - ' + moment.unix(data.checkout).format(CONFIG.DEFAULT_DATE_FORMAT) + '</b>) are allready booked</p><p>Please go back and select other dates<p><a ui-sref="agent.home" ng-click="$close();" href="javascript:void(0);"><md-button class="md-raised md-primary">Back</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.newBookingAgent = function (email, id) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Your booking has been saved</h3><p>A booking confirmation will be sent to ' + email + ' as  soon as we receive the payment. <br />Please note, a bank transfer can take 4-6 days, we will notify you as soon as we get the money</p><p><a ng-click="$close()" href="javascript:void(0);" ui-sref="agent.booking({id: \'' + id + '\' })"><md-button class="md-raised md-primary">View Booking Status</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.newAgent = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template-noclose.html');
        $uibModal.open({
          backdrop: 'static',
          template: '<h3>Successfully Registered</h3><br><p><a ng-click="$close()" href="javascript:void(0);" ui-sref="agent_login"><md-button class="md-raised md-primary">Login</md-button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false
        });
      };

      this.ownership = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><p><b>Tenant Ownership</b><p>If you are the agent who first booked this tenant, then you are the tenant owner. This means that any future bookings this tenant makes with us will pay commission to you for the next 2 years. Even if the tenant books directly with us or extends his lease with us, you will still be paid <b><u>full commission!</u></b></p><br /><p><b>Send booking to Tenant</b></p><p>You can send the booking link to the tenant. This will show information and photos to the tenant with your agency name on the booking form. It will also allow the tenant to pay the booking via credit cards, paypal or bank transfer directly into our account via our online secure payment system. We will inform you once the tenant has paid and transfer your commission. </p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: false,
        });
      };

      this.rating = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<p>Your rating has been saved</p><p>Thank you!</p><p><a ui-sref="home" ui-sref-opts="{reload:true}" ng-click="$close()" style="cursor:pointer;"><button class="btn btn-primary">Back to Thaihome</button></a></p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.throwError = function (error) {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        $uibModal.open({
          template: '<h3>ERROR:</h3><br /><p>' + error + '</p>',
          windowTemplate: windowTemplate,
          scope: false,
          animation: true
        });
      };

      this.agentList = function (showExtra, commission) {
        var modal = this;
        User.getAll({
          type: "agent"
        }).then(function (agents) {
          var scope = $rootScope.$new(true);
          scope.agents = agents;
          scope.commission = commission;
          scope.conditionsAgent = '';
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectAgent = function (agent, commissionC, conditionsAgent) {
            $rootScope.$broadcast("agentSelected", agent, commissionC, conditionsAgent);
          };
          scope.showExtra = showExtra ? true : false;
          scope.addAgent = function () {
            modal.addAgent();
          };
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/agent/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };

      this.addTenant = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/tenant/add.html');
        var scope = $rootScope.$new(true);
        scope.createTenant = function (tenant) {
          instance.close();
          tenant.type = 'tenant';
          tenant.password = tenant.email;
          tenant.username = tenant.email;
          User.add(tenant).then(function (data) {
            $rootScope.$broadcast("tenantSelected", data.data);
          });
        };
        var instance = $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });
      };

      this.addAgent = function () {
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/agent/add.html');
        var scope = $rootScope.$new(true);
        scope.createAgent = function (agent) {
          instance.close();
          agent.type = 'agent';
          agent.agent = agent.name;
          User.add(agent).then(function (data) {
            $rootScope.$broadcast("agentSelected", data.data);
          });
        };
        var instance = $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });
      };

      this.tenantList = function () {
        var modal = this;
        User.getAll({
          type: "tenant"
        }).then(function (tenants) {
          var scope = $rootScope.$new(true);
          scope.tenants = tenants;
          scope.addTenant = function () {
            modal.addTenant();
          };
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectTenant = function (tenant) {
            $rootScope.$broadcast("tenantSelected", tenant);
          };
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/tenant/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };


      this.seasonList = function () {
        var scope = $rootScope.$new(true);
        scope.seasons = Season.list();
        scope.dtOptions = DTOptionsBuilder.newOptions();
        scope.selectSeason = function (season) {
          $rootScope.$broadcast("seasonSelected", season);
        };
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/season/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true
        });

      };

      this.currencyList = function () {
        Currency.getAll().then(function (currencies) {
          var scope = $rootScope.$new(true);
          scope.currencies = currencies;
          scope.dtOptions = DTOptionsBuilder.newOptions();
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/currency/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true,
            controller: 'Locale'
          });
        });

      };

      this.statusList = function (statuses) {
        //statuses = _.without(statuses, _.findWhere(statuses, {
        //value: 1
        //}));
        var scope = $rootScope.$new(true);
        scope.statuses = statuses;
        scope.dtOptions = DTOptionsBuilder.newOptions();
        scope.selectStatus = function (status) {
          $rootScope.$broadcast("statusSelected", status);
        };
        var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/status/index.html');
        $uibModal.open({
          template: template,
          windowTemplate: windowTemplate,
          scope: scope,
          animation: true,
          controller: 'Locale'
        });
      };

      /*this.emailList = function (booking, sentEmails, autoselect, user) {
		var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
        var template = $templateCache.get('templates/lists/email/index.html');
        var scope = $rootScope.$new(true);
        Email.list().then(function (emails) {
          scope.emails = _.sortBy(emails, function(e) { return e.name; }); // 2016-05-31 - Ajay - Emails sort by name
          scope.languages = $rootScope.languages;
          scope.emailLanguage = 'en';
          scope.searchEmail = function (value) {
            var found = _.findWhere(sentEmails, {
              "email": value
            });
            if (found) {
              return ' - Sent ' + $filter('timeAgo')(found.date);
            } else {
              return '';
            }
          };

          scope.getEmailHTML = function (type) {
            Email.send(type, {
              booking: booking,
              preview: true,
              subject: $rootScope.T['email_subject_' + type],
              language: scope.emailLanguage,
              userID:  $rootScope.admin.id
            }).then(function (data) {
              scope.emailHTML = $sce.trustAsHtml('<div style="overflow-y:auto;">' + data.html + '</div>');
              scope.subject = data.subject;
            });
          };

          scope.selectLang = function (l) {
            scope.emailLanguage = l;
          };

		  scope.tenantDetail = {};
		  scope.getTenantDetail = function(id){
			User.getDetails(id).then(function (data) {
				scope.tenantDetail = data;
			});
		  }

          var modalInstance = $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
          var origModalInstance = modalInstance;

          modalInstance.rendered.then(function () {
            if (autoselect) {
              scope.emailType = autoselect;
              scope.getEmailHTML(autoselect);
              scope.getTenantDetail(user);
            }else{
				scope.getTenantDetail(user);
			}
          });

          scope.sendEmail = function (type, preview, html,subject) {
            Email.send(type, {
              booking: booking,
              customHTML: html.toString(),
              preview: preview || false,
              //subject: $rootScope.T['email_subject_' + type],
              customSubject:subject,
              language: scope.emailLanguage,
			  userID:  $rootScope.admin.id
            }).then(function (data) {
              if (preview) {
                $uibModal.open({
                  template: '<i class="material-icons" id="close-window"  ng-click="$close()">highlight_off</i><div style="overflow-y:auto;">' + data + '</div>',
                  animation: true
                });
                return;
              }
              $rootScope.$broadcast("emailSent", {
                booking: booking,
                type: type
              });
              origModalInstance.close();
              Notification.success({
                message: 'Email sent!'
              });
              if (type == 'rating') {
                $rootScope.$broadcast('updateStatus', {
                  id: booking,
                  status: 6
                });
              }
			  window.location.reload();  // 2016-05-31 - Ajay - Reload when send email
            }).catch(function (e) {
              Notification.error({
                message: e
              });
            });
          };
        });


      };*/


      this.locationList = function () {
        Location.getAll().then(function (locations) {
          var scope = $rootScope.$new(true);
          scope.locations = locations;
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectLocation = function (tenant) {
            $rootScope.$broadcast("locationSelected", tenant);
          };
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/location/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };

      this.propertyList = function (checkin, checkout) {
        Notification.success({
          message: 'Loading...'
        });
        Property.getAllDetails(checkin, checkout).then(function (properties) {
          var data = properties;
          var scope = $rootScope.$new(true);
          scope.data = data;
          scope.dtOptions = DTOptionsBuilder.newOptions().withOption('bPaginate', false);
          scope.selectProperty = function (property) {
            $rootScope.$broadcast("propertySelected", property);
          };
          scope.currency = $rootScope.currency;
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/property/index.html');
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });

      };

      this.discountList = function () {
        Discount.findAll({
          active: true
        }).then(function (discounts) {
          var windowTemplate = $templateCache.get('templates/thaihome/modal/template.html');
          var template = $templateCache.get('templates/lists/discount/index.html');
          var data = discounts;
          var scope = $rootScope.$new(true);
          scope.data = data;
          scope.dtOptions = DTOptionsBuilder.newOptions();
          scope.selectDiscount = function (discount) {
            $rootScope.$broadcast("discountSelected", discount);
          };
          $uibModal.open({
            template: template,
            windowTemplate: windowTemplate,
            scope: scope,
            animation: true
          });
        });
      };

          }]);
})();
