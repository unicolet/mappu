/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */


sc_require("resources/OpenLayers");

/*globals Maps */

SC.Binding.labelPrefix = function(prefix) {
    return this.transform(function(value, binding) {
        return prefix + " " + (value ? value : "n/a");
    });
};

var app_logo_huge = static_url('images/app-logo-huge.png');
var icon_tools_16 = static_url('sc-icon-tools-16');

// This page describes the main user interface for your application.  
Maps.mainPage = SC.Page.design({

    layersAndSearch: SC.outlet("mainPane.toolbar.layers"),
    openLayersView : SC.outlet("mainPane.topLeftView"),
    rightSplitPane : SC.outlet("mainPane.bottomRightView"),
    geotoolsPane   : SC.outlet("mainPane.geotoolsPane"),
    explorerPane   : SC.outlet("mainPane.explorerPane"),

    //mainPane.splitview: null,
    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page
    // load.
      mainPane: SC.MainPane.design( {
        childViews: 'toolbar topLeftView bottomRightView loading geotoolsPane explorerPane'.w(),

        defaultResponder: 'Maps.statechart',

        loading: SC.ProgressView.design({
            layout: { top: 0, height: 4, left: -2, right: -2, zIndex: Maps.RIGHT_TOOL_BOX_PANE_ZINDEX+1},
            isIndeterminate: YES,
            isRunning: YES,
            isVisibleBinding: SC.Binding.oneWay("Maps.isLoading")
        }),

        toolbar : SC.ToolbarView.design({
            layout: { top: 6, left: 0, right: 0, height: 44 },
            anchorLocation: SC.ANCHOR_TOP,
            childViews : 'logo layers tools menu'.w(),

            logo: SC.LabelView.design({
                layout: {centerY:0, left:20, height:36, width: 500},
                value: APPCONFIG.title,
                classNames: "app-logo".w()
            }),
            layers : SC.SegmentedView.design({
                layout: { centerY: 0, height: 30, centerX: ( $(window).width()<1024 ? 0-130: 0), width: 170 },
                controlSize: SC.LARGE_CONTROL_SIZE,
                items : [
                    {title: "_layers".loc(), action: 'LAYERS', icon: "icon-layers-16"},
                    {title: "_search".loc(), action: 'SEARCH', icon: "icon-search-16"}
                ],
                itemIconKey: 'icon',
                itemTitleKey : 'title',
                itemValueKey : 'action',
                allowsEmptySelection: YES,
                allowsMultipleSelection: YES,
                action: 'didChooseLayersOrSearch'
            }),
            tools : SC.SegmentedView.design({
                layout: { centerY: 0, height: 30, centerX: 210, width: 250 },
                controlSize: SC.LARGE_CONTROL_SIZE,
                items : [
                    {title: "_pan".loc(), action: 'toolMove', icon:"icon-pan-16"},
                    {title: "_area".loc(), action: 'toolArea', icon:"icon-area-16"},
                    {title: "_length".loc(), action: 'toolLength', icon:"icon-measure-16"}
                ],
                itemIconKey: 'icon',
                itemTitleKey : 'title',
                itemValueKey : 'action',
                action: 'didClickOnTools'
            }),
            menu: SC.PopupButtonView.design({
                layout: {right: 5, width: 100, height: 24, centerY:0},
                icon: "icon-menu-open",
                titleBinding: "Maps.authenticationManager.username",
                menuBinding: 'Maps.authenticationManager.menuPane'
            })
        }),

      topLeftView: Maps.OpenLayers.design({
          layout: { top: 45, left: 0, bottom:0, right: 0 },

          layerId: 'olmap',

          contentBinding: "Maps.openLayersController.content",
          exampleView: Maps.OpenLayersLayer
      }),

         bottomRightView: SC.View.design({
            classNames: ["bottomRightView"],
            layout: { top: 60, width: 299, bottom:50, right: 15, zIndex: Maps.RIGHT_TOOL_BOX_PANE_ZINDEX },
            childViews: "resultsView noResultsView buttons featureView".w(),

            resultsView: SC.ScrollView.design({
                layout: { top: 0, left: 0, height:250, right: -1 },
                hasHorizontalScroller: NO,
                backgroundColor: 'white',
                contentView: SC.ListView.design({
                    classNames: ["maps-chkbox-starred","denim","feature-list-item-view"],
                    rowHeight: 30,
                    contentBinding: 'Maps.featureInfoController.arrangedObjects',
                    selectionBinding: 'Maps.featureInfoController.selection',
                    contentValueKey: "intelligentName",
                    contentCheckboxKey: "isStarred",
                    exampleView: Maps.FeatureListItemView,
                    hasContentRightIcon: YES,
                    contentRightIconKey: "rightIconKey",
                    rightIconAction: "zoomToFeature"
                })
            }),
            noResultsView:  SC.LabelView.design({
                classNames: ["rotated_tip","arrow_left"],
                textAlign: SC.ALIGN_CENTER,

                layout: { top: 50, left: 50, height:250, right: -1 },
                isVisibleBinding: SC.Binding.oneWay("Maps.featureInfoController.[].length").bool().not(),
                escapeHTML: NO,
                value: "_featureinfo_instructions".loc()
            }),

            buttons: SC.View.design({
                classNames: ["graduated"],
                layout: { top: 251, height: 50, left:0, right: -1 },
                childViews: "clearq notifications".w(),
                clearq: SC.ButtonView.design({
                    layout: { top: 10, height: 24, left: 14, width: 80 },
                    //classNames: ["borderless"],
                    title: "_clear_q".loc(),
                    icon: "icon-clear-16",
                    action: "clearQueryResults"
                }),
                notifications : SC.LabelView.design({
                    layout: { top: 14, height: 20, right: 15, left: 140 },
                    escapeHTML: NO,
                    valueBinding: SC.Binding.oneWay("Maps.openLayersController.measure")
                })
            }),

            featureView:SC.TabView.extend({
                layout: { top: 301, bottom: -1, left:-1, right: -1 },
                controlSize: SC.SMALL_CONTROL_SIZE,
                itemTitleKey: "title",
                itemValueKey: "tab",
                nowShowing: "Maps.featureView",
                items: [
                    {title: "_attributes".loc(), tab: "Maps.featureView" },
                    {title: "_tags".loc(), tab: "Maps.tagsTab" },
                    {title: "_comments".loc(), tab: "Maps.commentsTab" },
                    {title: "_links".loc(), tab: "Maps.linksTab" }
                ]
            })
        }),

        geotoolsPane: SC.View.design({
              classNames: ["tray"],
              closedLayoutRight: 144,
              layout: {width:170, height:400, right:this.closedLayoutRight||144, top:70, zIndex:Maps.RIGHT_TOOL_BOX_PANE_ZINDEX-1},
              isOpen: function() {
                return this.layout.right!==this.closedLayoutRight;
              },
              childViews: "toolsui".w(),
              toolsui: SC.View.design({
                  classNames: ["tray_overflow"],
                  childViews: "handle feature1 feature2 operation go help helptext".w(),
                  handle: SC.View.design({
                      classNames: ["tray_button"],
                      layout: {top: 5, width: 30, height: 40, left: -31},
                      childViews: "icon".w(),
                      isVisibleBinding: SC.Binding.oneWay("Maps.featureInfoController.[].length").bool(),
                      icon: SC.ImageView.design({
                          layout: {top: 12, width: 16, height: 16, left: 7 },
                          value: 'sc-icon-tools-16',
                          toolTip: "_geotools_tooltip".loc()
                      }),
                      click: function() {
                          var rootResponder = this.getPath('pane.rootResponder');
                          rootResponder.sendAction('toggleGeoTools', '', this, this.get('pane'));
                          return YES;
                      },
                      touchStart: function() {
                          return YES;
                      },
                      touchEnd: function() {
                          this.click();
                          return YES;
                      },
                      firstTimeVisible: true,
                      _maps_isVisibleDidChange: function() {
                         if(this.get('isVisible') && this.firstTimeVisible) {
                            this.$().addClass('bounce');
                            this.firstTimeVisible=false;
                         }
                      }.observes('isVisible')
                  }),
                  feature1: Maps.DropView.design({
                      layout: {top: 5, left:5, right:10, height:30},
                      valueBinding: "Maps.featureInfoController.feature1descr",
                      textAlign: SC.ALIGN_CENTER,
                      classNames: ["maps-dropview"],
                      dropTargetProperty: "feature1"
                  }),
                  feature2: Maps.DropView.design({
                      layout: {top: 51, left:5, right:10, height:30},
                      valueBinding: "Maps.featureInfoController.feature2descr",
                      textAlign: SC.ALIGN_CENTER,
                      classNames: ["maps-dropview"],
                      dropTargetProperty: "feature2"
                  }),
                  operation: SC.SelectView.design({
                      layout: {top: 102, left:5, right:10, height:24},
                      items: [
                          { title: "_area", value: "Area", pos: 1},
                          { title: "_intersection", value: "Intersection", pos: 2},
                          { title: "_union", value: "Union", pos: 3 },
                          { title: "_buffer5", value: "Buffer5", pos: 4 },
                          { title: "_buffer25", value: "Buffer25", pos: 5 }
                      ],
                      itemTitleKey: 'title',
                      itemValueKey: 'value',
                      itemSortKey: 'pos',
                      checkboxEnabled: YES,
                      valueBinding: "Maps.featureInfoController.operation"
                  }),
                  go: SC.SegmentedView.design({
                      layout: {top: 133, width:150, height:36, left:5},
                      items: [
                          {title: "OK", action:"maps_PerformGeoOperation"},
                          {title: "_clear", action:"maps_PerformGeoClear"},
                          {title: "_close", action:"maps_PerformGeoClose"}
                      ],
                      itemTitleKey: "title",
                      itemActionKey: "action"
                  }),
                  help: SC.ImageView.design({
                      layout: {top: 180, centerX:0, height:24, width:24},
                      value: "sc-icon-help-24"
                  }),
                  helptext: SC.LabelView.design({
                      textAlign: SC.ALIGN_CENTER,
                      layout: {top: 210,left:5, right:10, bottom:5},

                      value:"_geotools_help".loc()
                  })
              })
          }),

          explorerPane: SC.View.design({
              classNames: ["tray"],
              closedLayoutRight: 104,
              layout: {width:210, height:450, right:this.closedLayoutRight||104, top:120, zIndex:Maps.RIGHT_TOOL_BOX_PANE_ZINDEX-2},
              isOpen: function() {
                return this.layout.right!==this.closedLayoutRight;
              },
              childViews: "explorerui".w(),
              explorerui: SC.View.design({
                  classNames: ["tray_overflow"],
                  layout: {top:0,bottom:0,left:0,right:0},
                  childViews: "handle tags notags buttons".w(),

                  handle: SC.View.design({
                    classNames: ["tray_button"],
                    layout: {top: 5, width: 30, height: 40, left: -31 },
                    childViews: "icon".w(),
                    icon: SC.ImageView.design({
                        layout: {top: 12, width: 16, height: 16, left: 7 },
                        value: "icon-explore-16",
                        toolTip: "_explore_tooltip".loc()
                    }),
                    click: function() {
                      var rootResponder = this.getPath('pane.rootResponder');
                      rootResponder.sendAction('toggleTagExplorer', '', this, this.get('pane'));
                    },
                    touchStart: function() {
                        return YES;
                    },
                    touchEnd: function() {
                        this.click();
                        return YES;
                    }
                  }),
                  tags:SC.ScrollView.design({
                      layout: {top:0,bottom:130,left:0,right:0},
                      contentView: SC.ListView.design({
                          classNames: ["denim"],
                          rowHeight: 30,
                          contentBinding: "Maps.tagsController.arrangedObjects",
                          selectionBinding: "Maps.tagsController.selection",
                          contentValueKey: "tag",
                          contentCheckboxKey: "visible",
                          contentIconKey: "paletteColor",
                          contentUnreadCountKey: "occurrences",
                          isSelectable: NO,
                          hasContentIcon: YES
                      })
                  }),
                  notags: SC.LabelView.design({
                      classNames: ["rotated_tip"],
                      textAlign: SC.ALIGN_CENTER,
                      layout: {width:200, height:100,centerX:15,centerY:-50},
                      value: "_no_tags".loc(),
                      isVisibleBinding: SC.Binding.oneWay("Maps.tagsController.[].length").bool().not()
                  }),
                  buttons: SC.View.design({
                      classNames: ["graduated"],
                      layout: {bottom:0,height:190,left:0,right:0},
                      childViews: "onlyShowLayer mine help helpText rendertags reloadtags".w(),
                      onlyShowLayer: SC.SelectView.design({
                          layout: {top: 5, left:5, height:24, right:15},
                          valueBinding: "Maps.tagsController.selectedLayer",
                          itemsBinding: SC.Binding.oneWay("Maps.openLayersController.content"),
                          itemTitleKey: 'title',
                          itemValueKey: 'name'
                      }),
                      mine: SC.CheckboxView.design({
                          layout: {top: 35, left:5, height:24, right:15},
                          title: "_only_show_mine".loc(),
                          toolTip: "_only_show_mine_tip".loc(),
                          valueBinding: "Maps.tagsController.onlyShowMine"
                      }),
                      help: SC.ImageView.design({
                          layout: {top: 65, centerX:0, height:24, width:24},
                          value: "sc-icon-help-24"
                      }),
                      helpText: SC.LabelView.design({
                          layout: {bottom:31,top:91,left:5,right:15},
                          value: "_tagexplorer_help".loc()
                      }),
                      rendertags: SC.ButtonView.design({
                          //classNames: ["borderless"],
                          layout: {bottom:0,width:0.56,height:24,right:10},
                          title: "_rendertags".loc(),
                          icon: "icon-rendertags-24",
                          action: "maps_RenderTags",
                          controlSize: SC.LARGE_CONTROL_SIZE
                      }),
                      reloadtags: SC.ButtonView.design({
                          //classNames: ["borderless"],
                          layout: {bottom:0,width:0.48,height:24,left:0},
                          title: "_reloadtags".loc(),
                          icon: "icon-refresh-24",
                          action: "maps_ReloadTags",
                          controlSize: SC.LARGE_CONTROL_SIZE
                      })
                  })
              })
          })
    }),

    queryListPane: SC.View.design({
        layout: {top:0, bottom:0, right:0, left:0},
        childViews: "label queryList".w(),
        label:SC.LabelView.design({
            layout: {top:5, left:5, right:5},
            value: "_query_howto".loc()
        }),
        queryList: SC.ScrollView.design({
            layout: {bottom:0, top:46, left:0, right:0},
            backgroundColor: 'white',
            contentView: SC.ListView.design({
                classNames: "border-top".w(),
                rowHeight:34,
                contentBinding: 'Maps.layerQueryController.arrangedObjects',
                selectionBinding: 'Maps.layerQueryController.selection',
                contentValueKey: "description",
                action:"maps_GoToEditQuery"
            })
        })
    }),

    queryEditPane: SC.View.design({
        childViews: "title form send back".w(),
        title: SC.LabelView.design({
            layout: {top:5, left:5, right:5},
            valueBinding: SC.Binding.from("Maps.layerQueryController.selection").transform(function(value, isForward) {
                if (isForward && value.firstObject()) {
                    return value.firstObject().get("description")
                }
            })
        }),
        form: Maps.FormView.design({
            layout: {top: 36, left:5, right:5, height: 72},
            valueBinding: SC.Binding.from("Maps.layerQueryController.selection").transform(function(value, isForward) {
                if (isForward && value.firstObject()) {
                    return value.firstObject().get("filterString")
                }
            })
        }),
        back: SC.ButtonView.design({
            layout: {right:100, bottom: 10, width: 80, height: 24},
            title: "_back".loc(),
            action: "layerQueryBack",
            themeName: "point-left"
        }),
        send: SC.ButtonView.design({
            layout: {right:10, bottom: 10, width: 80, height: 24},
            title: "_run".loc(),
            action: "layerQueryRun"
        })
    }),

    layerSearchPane : SC.PickerPane.design({
        removeAction: "didCloseSearchPalette",

        layout: { height: 200, width: 400},
        contentView: SC.WorkspaceView.extend({
            topToolbar: null,
            bottomToolbar: null,

            contentView: SC.SceneView.design({
                classNames: 'popover_content_background'.w(),
                layout: {top:0,bottom:0,left:0,right:0},
                scenes: ["Maps.mainPage.queryListPane", "Maps.mainPage.queryEditPane"],
                nowShowingBinding: "Maps.openLayersController.layerSearchNowShowing"
            })
        })
    }).create(),

    layerPalette : SC.PickerPane.extend({
        removeAction: "didCloseLayerPalette",

        layout: { width: 500, height: 400 },
        contentView: SC.WorkspaceView.extend({
            topToolbar: SC.ToolbarView.design({
                childViews: "advancedBtn legendBtn googleView".w(),
                googleView: SC.RadioView.design({
                    layout: {centerY: 0, left: 30, width:200, height: 16},
                    items: '_streets_satellite'.loc().w(),
                    valueBinding: "Maps.openLayersController.whichGoogleLayer",
                    height: 24,
                    layoutDirection: SC.LAYOUT_HORIZONTAL
                }),
                advancedBtn: SC.ImageButtonView.design({
                    layout: {width: 30, centerY: 0, right: 0, height: 16},
                    image: "icon-settings-16",
                    action: "showAdvancedOptions",
                    isVisibleBinding: "Maps.authenticationManager.isAdmin",
                    toolTip: "_settings".loc()
                }),
                legendBtn: SC.ButtonView.design({
                    layout: {width: 80, centerY: 0, right: 40, height: 24},
                    titleBinding: "Maps.openLayersController.legendBtnText",
                    action: "toggleLegend",
                    isEnabledBinding: SC.Binding.oneWay("Maps.openLayersController.selection").transform(function(value, binding) {
                        if(value && value.length()>0)
                            return true;
                        return false;
                    })
                })
            }),
            bottomToolbar: null,

            contentView:SC.View.extend({
                classNames: 'popover_content_background'.w(),
                layout: {top: 0, left: 0, right: 0, bottom: 0},
                childViews: 'layerView layerDetailView instructionsView'.w(),
                layerView: SC.ScrollView.design({
                    hasHorizontalScroller: NO,
                    layout: { top: 0, bottom: 0, left: 0, width: 210 },
                    backgroundColor: 'white',
                    contentView: SC.ListView.design({
                        classNames: "border-right".w(),
                        layout:{top:0,bottom:0,right:0,left:0},
                        rowHeight: 30,
                        contentBinding: 'Maps.openLayersController.arrangedObjects',
                        selectionBinding: 'Maps.openLayersController.selection',
                        contentValueKey: "title",
                        contentCheckboxKey: "visible",
                        contentIconKey: "legendIcon",
                        contentRightIconKey: "filterIcon",
                        hasContentIcon: NO,
                        hasContentRightIcon: YES,
                        canReorderContent: YES,
                        isEditable: YES,
                        action: "onLayerSelected",
                        target: "Maps.openLayersController",
                        actOnSelect: YES
                        //showAlternatingRows: YES
                    })
                }),
                layerDetailView: SC.SceneView.design({
                    layout: { top: 0, bottom: 0, left: 211, right: 0 },
                    scenes: ["Maps.mainPage.layerInfoView","Maps.mainPage.layerLegendView"],
                    nowShowingBinding: "Maps.openLayersController.layerPaletteNowShowing",
                    isVisibleBinding: SC.Binding.oneWay('Maps.openLayersController.selection').transform(function(value, binding) {
                        if(value && value.length()>0)
                            return true;
                        return false;
                    })
                }),
                instructionsView: SC.LabelView.design({
                    classNames: ["rotated_tip","arrow_left"],
                    textAlign: SC.ALIGN_CENTER,

                    layout: { top: 0, bottom: 0, left: 251, right: 50 },
                    isVisibleBinding: SC.Binding.oneWay('Maps.openLayersController.selection').transform(function(value, binding) {
                        if(value && value.length()>0)
                            return false;
                        return true;
                    }),
                    escapeHTML: NO,
                    value: "_layer_pane_instructions".loc()
                })
            })
        })
    }).create(),

    layerInfoView: SC.View.design({
        layout: { top: 0, bottom: 0, right: 0, left: 0 },
        isVisibleBinding: SC.Binding.bool().from("Maps.layerController.content"),
        childViews: "title name description opacitylbl opacity toggleFilter googlearth".w(),
        title: SC.LabelView.design({
            value: "_info".loc(),
            controlSize: SC.LARGE_CONTROL_SIZE,
            layout: {top: 10, right:5, height: 20, left:5}
        }),
        name: SC.LabelView.design({
            valueBinding: SC.Binding.from('Maps.layerController.name').labelPrefix("Nome:"),
            layout: {top: 35, right:5, height: 20, left:5}
        }),
        opacitylbl: SC.LabelView.design({
            layout: {top: 60, right:5, height: 20, left:5},
            value: "_opacity".loc()
        }),
        opacity:SC.SliderView.design({
            layout: {top: 80, right:10, height: 20, left:10},
            valueBinding: 'Maps.layerController.opacity',
            maximum: 10,
            minimum: 0,
            step: 1
        }),
        description: SC.LabelView.design({
            valueBinding: SC.Binding.from('Maps.layerController.description').labelPrefix("_description:".loc()),
            layout: {top: 120, right:5, bottom: 50, left:5}
        }),
        toggleFilter: SC.ButtonView.design({
            layout: {bottom: 10, left:5, height: 24, right:60},
            titleBinding: SC.Binding.labelPrefix("_remove_filter".loc()).from("Maps.layerController.cql_filter"),
            action: "doRemoveFilter",
            isEnabledBinding: SC.Binding.bool().from("Maps.layerController.cql_filter")
        }),
        googlearth: SC.ImageButtonView.design({
            layout: {bottom: 10, width:24, height: 24, right:10},
            action: "doOpenLayerWithGoogleEarth",
            image: "icon-google-earth-24"
        })
    }),
    layerLegendView: SC.ScrollView.design({
        backgroundColor: "white",
        layout: { top: 0, bottom: 0, right: 0, left: 0 },
        isHorizontalScrollerVisible: NO,
        contentView: Maps.LegendView.design({
            useStaticLayout: YES,
            valueBinding: 'Maps.layerController.legendIcon'
        })
    }),

    addressPane: SC.PalettePane.design({
        layout: {width: 500, height: 200, centerX:0, centerY:0},
        contentView: SC.View.design({
            childViews: "addressList button close".w(),
            addressList: SC.ScrollView.design({
                layout: {top:5, left:5, right:5, height: 160},
                contentView: SC.ListView.design({
                    contentBinding: "Maps.addressController.arrangedObjects",
                    selectionBinding: "Maps.addressController.selection",
                    contentValueKey: "formatted_address"
                })
            }),
            button: SC.ButtonView.design({
                layout: {bottom:5, width: 100, height: 24, right: 100},
                title: "_launch".loc(),
                action: function() {
                    alert("Stiamo lavorando anche a  questo...");
                }
            }),
            close: SC.ButtonView.design({
                layout: {bottom:5, width: 80, height: 24, right: 5},
                title: "_close".loc(),
                action: "close"
            })
        })
    }).create()
});

Maps.loginPage = SC.Page.design({
    mainPane: SC.MainPane.design({
        classNames: ["hippie_background"],
        themeName: "loginPane",
        layout:{top:0,bottom:0,left:0,right:0},
        childViews: "logo loginform".w(),
        logo: SC.ImageView.design({
            layout:{centerY:0, left:( $(window).width()<=1024 ? 80-50: 80), width: 373, height: 96},
            value:app_logo_huge,
            canLoadInBackground: YES
        }),
        loginform:SC.View.design({
            layout: {width:400, bottom:-1, top:-1, left:( $(window).width()<=1024 ? 600-130: 600) },
            classNames:"loginform".w(),

            //childViews: 'labelU login labelP password button message loading'.w(),
            childViews: 'title login password button message loading'.w(),
            title: SC.LabelView.design({
                classNames: ["white"],
                layout: {top:30, width:200, left:15, height:50},
                value: APPCONFIG.title,
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            login: SC.TextFieldView.design({
                layout: {top:245, right:15, left:15, height:50},
                valueBinding: "Maps.authenticationManager.inputUsername",
                controlSize: SC.HUGE_CONTROL_SIZE,
		        //hintOnFocus: NO,
                shouldRenderBorder: NO,
                hint: "_username".loc()
            }),
            labelP: SC.LabelView.design({
                layout: {top:305, width:200, left:15, height:50},
                value: "Password: ",
                classNames:"formlabel".w(),
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            password: SC.TextFieldView.design({
                layout: {top:305, right:15, left:15, height:50},
                valueBinding: "Maps.authenticationManager.inputPassword",
                isPassword: YES,
                controlSize: SC.HUGE_CONTROL_SIZE,
		        //hintOnFocus: NO,
                shouldRenderBorder: NO,
                hint: "password".loc()
            }),
            message: SC.LabelView.design({
                layout: {top:365, right:15, left:15, height:50},
                valueBinding: "Maps.authenticationManager.message",
                isVisibleBinding: "Maps.authenticationManager.message",
                classNames:"loginmessage".w(),
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            button: SC.ButtonView.design({
                layout: {top:420, right:15, width:55, height:30},
                title:"Login",
                controlSize:SC.HUGE_CONTROL_SIZE,
                action: "submitLogin",
                target: "Maps.authenticationManager",
                isEnabledBinding: "Maps.authenticationManager.inputUsername"
            }),
            loading:SC.ImageView.design({
                layout: {top:420, right:85, width:25, height:30},
                value: "spinner",
                isVisibleBinding: "Maps.isLoading"
            })
        })
    })
});

Maps.helpSheetPane = SC.SheetPane.design({
    layout: {width:650, height:400, centerX:0},
    contentView: SC.View.extend({
        layout: {top:10,bottom:5,left:5,right:10},
        childViews: "icon text closeBtn".w(),
        icon: SC.ImageView.design({
            layout: {left: 5, centerY:0, height:24, width:24},
            value: "sc-icon-help-24"
        }),
        text: SC.ScrollView.design({
            layout: {left: 40, right: 0, top:0, bottom: 40 },
            hasHorizontalScroller: NO,
            contentView: SC.StaticContentView.design({
                classNames: ["help_text"],
                content: "_help_text".loc()
            })
        }),
        closeBtn: SC.ButtonView.design({
            layout: {width: 90, right: 0, height:24, bottom: 0 },
            title: "_close".loc(),
            action: "helpClose"
        })
    })
}).create();

Maps.usageTipSheetPane = SC.SheetPane.create({
  layout: { width: 650, height: 350, centerX: 0 },
  contentView: SC.View.extend({
      childViews: "title tipText tipImg showCheckbox nextBtn closeBtn".w(),
      title: SC.LabelView.design({
          classNames: ["help_text"],
          layout: {top:10, left: 10, right:10, height: 50 },
          value: "_usage_tip_title".loc(),
          controlSize: SC.HUGE_CONTROL_SIZE,
          fontWeight: SC.BOLD_WEIGHT,
          icon: "icon-tips-16"
      }),
      tipText: SC.LabelView.design({
          classNames: ["help_text"],
          layout: {top:60, left: 10, width:430, height: 240 },
          valueBinding: "Maps.usageTipController.tipText"
      }),
      tipImg: SC.ImageView.design({
          layout: {top:60, right: 10, width:194, height: 240 },
          valueBinding: "Maps.usageTipController.tipImg",
          useImageQueue: YES
      }),
      showCheckbox: SC.CheckboxView.design({
          layout: {bottom: 5, left: 10, width: "0.3", height: 24 },
          title: "_tip_at_startup".loc(),
          valueBinding: "Maps.usageTipController.showTips"
      }),
      nextBtn: SC.ButtonView.design({
          layout: {bottom: 5, right: 100, width: 80, height: 24 },
          title: "_next".loc(),
          action: function() {
              Maps.usageTipController.showNextTip();
          }
      }),
      closeBtn: SC.ButtonView.design({
          layout: {bottom: 5, right: 10, width: 80, height: 24 },
          title: "_close".loc(),
          action: function() {
              Maps.usageTipSheetPane.remove();
          }
      })

  })
});
