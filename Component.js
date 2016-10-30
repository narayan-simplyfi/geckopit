sap.ui.define([
    'sap/ui/core/UIComponent',
    'sap/m/routing/Router',
    'sap/ui/model/resource/ResourceModel',
    'sap/ui/model/odata/ODataModel',
    'sap/ui/model/json/JSONModel'
], function(UIComponent,
    Router,
    ResourceModel,
    ODataModel,
    JSONModel) {

    return UIComponent.extend("ipms.atm.app.Component", {

        metadata: {
            includes: ["css/style.css"],
            config: {
                fullWidth: true,
                serviceConfig: {
                    name: "app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E",
                    serviceUrl: "/destinations/IOT/com.sap.iotservices.mms/v1/api/http/",
                }
            },
            routing: {
                config: {
                    routerClass: Router,
                    viewType: "XML",
                    viewPath: "ipms.atm.app.views",
                    controlId: "mainApp",
                    controlAggregation: "pages",
                    transition: "slide"
                },
                routes: [{
                    pattern: "login",
                    name: "login",
                    target: "login"
                }, {
                    pattern: "dashboard",
                    name: "dashboard",
                    target: "main"
                }, {
                    pattern: "atms/:type:/:value:",
                    name: "atms",
                    target: "atms"
                }, {
                    pattern: "ticket-management/:type:/:value:",
                    name: "ticket-management",
                    target: "ticketManagement"
                }, {
                    pattern: "operators/:type:/:value:",
                    name: "operators",
                    target: "operators"
                }, {
                    pattern: ":all*:",
                    name: "all",
                    target: "main"
                }],
                targets: {
                    main: {
                        viewName: "Dashboard",
                        viewLevel: 1
                    },
                    atms: {
                        viewName: "ATMs",
                        viewLevel: 1
                    },
                    operators: {
                        viewName: "Operators",
                        viewLevel: 1
                    },
                    ticketManagement: {
                        viewName: "TicketManagement",
                        viewLevel: 1
                    },
                    login: {
                        viewName: "Login",
                        viewLevel: 1
                    }
                }
            }
        },

        init: function() {
            // call overwritten init (calls createContent)
            UIComponent.prototype.init.apply(this, arguments);

            // set i18n model
            var i18nModel = new ResourceModel({
                bundleName: "ipms.atm.app.i18n.i18n"
            });
            this.setModel(i18nModel, "i18n");

            var mConfig = this.getMetadata().getConfig();
            var sServiceUrl = mConfig.serviceConfig.serviceUrl;

            // Create and set domain model to the component
            // var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {
            //     json: true,
            //     loadMetadataAsync: true
            // });

            // oModel.attachMetadataFailed(function() {
            //     console.log('MetadataFailed');
            //     this.getEventBus().publish("Component", "MetadataFailed");
            // }, this);

            // this.setModel(oModel, "IOT");

            this._router = this.getRouter();
            // initialize the router
            this._router.initialize();
        },

        goBack: function() {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var oPrevHash = oHistory.getPreviousHash();
            if (oPrevHash !== undefined) {
                window.history.go(-1);
            } else {
                this._router.navTo("Dashboard", {}, true);
            }
        },

        createContent: function() {
            return sap.ui.view({
                viewName: "ipms.atm.app.views.App",
                type: "XML"
            });
        }
    });

});
