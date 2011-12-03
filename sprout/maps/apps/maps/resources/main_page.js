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

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page
    // load.
    mainPane: SC.MainPane.design(SC.Animatable, {
        childViews: 'toolbar splitview'.w(),

        transitions: {
            opacity: { duration: 1.5, timing: SC.Animatable.TRANSITION_CSS_EASE_IN_OUT } // CSS-transition-only timing function (JavaScript gets linear)
        },

        defaultResponder: 'Maps.MainResponder',

        toolbar : SC.ToolbarView.design({
            layout: { top: 0, left: 0, right: 0, height: 44 },
            anchorLocation: SC.ANCHOR_TOP,
            childViews : 'logo layers tools menu'.w(),

            logo: SC.LabelView.design({
                layout: {centerY:0, left:20, height:24, width: 500},
                value: APPCONFIG.title,
                classNames: "app-logo".w()
            }),
            layers : SC.SegmentedView.design({
                layout: { centerY: 0, height: 30, centerX: 0, width: 160 },
                controlSize: SC.LARGE_CONTROL_SIZE,
                items : [
                    {title: "_layers".loc(), action: 'LAYERS', icon: "sc-icon-options-16"},
                    {title: "_search".loc(), action: 'SEARCH', icon: "sc-icon-bookmark-16"}
                ],
                itemIconKey: 'icon',
                itemTitleKey : 'title',
                itemValueKey : 'action',
                valueBinding: "Maps.openLayersController.layersAndSearch",
                allowsEmptySelection: YES,
                allowsMultipleSelection: YES
            }),
            tools : SC.SegmentedView.design({
                layout: { centerY: 0, height: 30, centerX: 260, width: 350 },
                controlSize: SC.LARGE_CONTROL_SIZE,
                items : [
                    {title: "_pan".loc(), action: 'toolMove', icon:""},
                    {title: "_area".loc(), action: 'toolArea', icon:""},
                    {title: "_length".loc(), action: 'toolLength', icon:""},
                    {title: "_geotools".loc(), action: 'toolGeo', icon: icon_tools_16},
                    {title: "_explorer".loc(), action: 'toolExplorer'/*, icon: icon_tools_16*/}
                ],
                itemIconKey: 'icon',
                itemTitleKey : 'title',
                itemValueKey : 'action',
                valueBinding: "Maps.openLayersController.tools"
            }),
            menu: SC.PopupButtonView.design({
                layout: {right: 5, width: 100, height: 24, centerY:0},
                icon: "icon-menu-open",
                titleBinding: "Maps.authenticationManager.username",
                menuBinding: 'Maps.authenticationManager.menuPane'
            })
        }),

        splitview : SC.SplitView.design({
            // these methods overriden from default because the default (wrongly) returns 100 when size==0
            splitViewGetSizeForChild: function(splitView, child) {
                return child.get('size') === undefined ? 100 : child.get('size');
            },

            collapseToLeft: function(child) {
                // check if child is already collapsed
                if (child.get("size") != 0) {
                    var childViews = this.get("childViews");
                    var childIndex = -1;
                    for (var i = 0; i < childViews.length; i++) {
                        if (childViews[i] === child) childIndex = i;
                    }

                    // set size=0 or won't collapse, save current size
                    var currentSize = child.get("size");
                    child.set("size", 0);
                    if (childIndex == (childViews.length - 1)) {
                        // collapsing rightmost child
                        this.adjustPositionForChild(child, childViews[childIndex - 1].get("position") + currentSize);
                    } else {
                        // to collapse we expand the child on the right
                        this.adjustPositionForChild(childViews[childIndex + 1], child.get("position"));
                    }
                }
            },

            collapseToRight: function(child) {
                // check if child is already collapsed
                if (child.get("size") != 0) {
                    var childViews = this.get("childViews");
                    var childIndex = -1;
                    for (var i = 0; i < childViews.length; i++) {
                        if (childViews[i] === child) childIndex = i;
                    }

                    // set size=0 or won't collapse, save current size
                    var currentSize = child.get("size");

                    if (childIndex == 0) {
                        // cannot collapse to the right
                    } else {
                        child.set("size", 0);
                        // expand size of the child on the right to the right
                        childViews[childIndex - 2].set("size", child.get("position") + currentSize);
                        // move collapsing child to the right
                        this.adjustPositionForChild(child, child.get("position") + currentSize);
                    }
                }
            },

            expandToLeft: function(child, size) {
                var childViews = this.get("childViews");
                var childIndex = -1;
                for (var i = 0; i < childViews.length; i++) {
                    if (childViews[i] === child) childIndex = i;
                }

                // set size to expand to
                child.set("size", size);
                if (childIndex == 0) {
                    // child is the leftmost child
                    this.adjustPositionForChild(childViews[childIndex + 1], child.get("position"));
                } else {
                    // resize against left child
                    this.adjustPositionForChild(child, childViews[childIndex - 1].get("position") - size);
                }
            },

            expandToRight: function(child, size) {
                var childViews = this.get("childViews");
                var childIndex = -1;
                for (var i = 0; i < childViews.length; i++) {
                    if (childViews[i] === child) childIndex = i;
                }

                // set size to expand to
                child.set("size", size);
                if (childIndex == childViews.length - 1) {
                    // cannot expand further rightmost child
                } else {
                    // resize against right child
                    this.adjustPositionForChild(childViews[childIndex + 1], childViews[childIndex + 1].get("position") + size);
                }
            },

            layout: { top: 45, left: 0, bottom:0, right: 0 },
            layoutDirection: SC.LAYOUT_HORIZONTAL,
            childViews: 'labelExplorer topLeftView middleRightView bottomRightView'.w(),

            labelExplorer: SC.ContainerView.extend(SC.SplitChild,{
                layout:{top:0,bottom:0,left:0,right:0},

                size:0,
                canCollapse:YES,
                minimumSize:0
            }),
            topLeftView: Maps.OpenLayers.design( SC.SplitChild, {
                layout: { top: 0, left: 0, bottom:0, right: 300 },

                layerId: 'olmap',

                contentBinding: "Maps.openLayersController.content",
                exampleView: Maps.OpenLayersLayer
            }),

            middleRightView: SC.ContainerView.extend(SC.Animatable,SC.SplitChild,{
                transitions: {
                    left: { duration: .25, timing: SC.Animatable.TRANSITION_EASE_IN_OUT },
                    width: { duration: .25, timing: SC.Animatable.TRANSITION_EASE_IN_OUT }
                },
                layout:{top:0,bottom:0,left:0,right:0},
                size: 0,
                canCollapse: YES,
                minimumSize:0
            }),

            bottomRightView: SC.View.design(SC.SplitChild, {
                size: 300,
                layout: { top: 0, width: 299, bottom:0, right: 0 },
                childViews: "resultsView buttons featureView".w(),
                resultsView: SC.ScrollView.design({
                    layout: { top: 0, left: 0, height:250, right: -1 },
                    hasHorizontalScroller: NO,
                    backgroundColor: 'white',
                    contentView: SC.ListView.design({
                        classNames: ["maps-chkbox-starred","denim"],
                        rowHeight: 30,
                        contentBinding: 'Maps.featureInfoController.arrangedObjects',
                        selectionBinding: 'Maps.featureInfoController.selection',
                        contentValueKey: "name",
                        contentCheckboxKey: "isStarred",
                        action: "maps_featureSelected"
                    })
                }),

                buttons: SC.View.design({
                    classNames: ["graduated"],
                    layout: { top: 251, height: 40, left:0, right: -1 },
                    childViews: "clearq notifications loading".w(),
                    clearq: SC.ButtonView.design({
                        layout: { centerY: 0, height: 30, left: 5, width: 100 },
                        classNames: ["borderless"],
                        title: "_clear_q".loc(),
                        icon: "sc-icon-trash-16",
                        action: "maps_ClearQueryResults"
                    }),
                    notifications : SC.LabelView.design({
                        classNames: ['text-shadow'],
                        layout: { centerY: 0, height: 24, right: 45, width: 100 },
                        escapeHTML: NO,
                        valueBinding: "Maps.openLayersController.measure"
                    }),
                    loading:SC.ImageView.design({
                        layout: { top: 0, bottom:0, width:40, right: 0 },
                        value: "spinner",
                        isVisibleBinding: "Maps.isLoading",

                        didAppendToDocument: function() {
                            SC.Request.manager.inflight.addObserver('[]', function(array) {
                                var length = array.get('length');

                                SC.run(function() {
                                    Maps.set('isLoading', length > 0);
                                }, this);
                            });
                        }
                    })
                }),

                featureView: SCTable.TableView.design({
                    layout: { top: 291, bottom: -1, left:0, right: -1 },

                    classNames: ["denim"],

                    contentBinding: 'Maps.featureInfoAttributesController.arrangedObjects',
                    selectionBinding: 'Maps.featureInfoAttributesController.selection',

                    action: "onAttributeDoubleClick",
                    target: "Maps.featureInfoAttributesController",

                    columns: [SC.Object.create(SCTable.Column, {
                        name: "_property".loc(),
                        valueKey: 'property',
                        width: 100,
                        canSort: YES
                    }),
                        SC.Object.create(SCTable.Column, {
                            name: "_value".loc(),
                            valueKey: 'value',
                            width: 170,
                            canSort: YES
                        })]
                })
            })
        })
    }),
    tagsTab: SC.View.design({
        childViews: "star tags tagsHelp saveTags".w(),
        star: SC.LabelView.design({
            layout: {left: 10, top:15, width: 350, height: 30 },
            valueBinding: 'Maps.socialController.starredAsText'
        }),
        tags: SC.TextFieldView.design({
            isTextArea: YES,
            layout: {left: 10, top: 50, right: 10, height: 50 },
            valueBinding: 'Maps.socialController.tags'
        }),
        tagsHelp: SC.LabelView.design({
            layout: {top: 115, left: 10, width: 300},
            value: "_howtotypetags".loc()
        }),
        saveTags: SC.ButtonView.design({
            layout: {top: 115, right: 10, width: 70},
            title: "_save".loc(),
            action: "maps_SaveTags",
            titleMinWidth: 40
        })
    }),

    commentsTab: SC.View.design({
        childViews: "comments newComment addComment delComment".w(),
        comments: SC.ScrollView.design({
            layout: {left: 10, top:15, right: 10, bottom: 50 },
            backgroundColor: 'white',
            contentView: SC.ListView.design({
                themeName: "comments",
                rowHeight: 75,
                showAlternatingRows: YES,
                isSelectable: YES,
                contentBinding: 'Maps.socialCommentsController.arrangedObjects',
                selectionBinding: 'Maps.socialCommentsController.selection',
                contentValueKey: "readable"
            })
        }),
        newComment: SC.TextFieldView.design({
            layout: {bottom: 10, left:10, width: 295, height: 25 },
            valueBinding: "Maps.socialCommentsController.newCommentText",
            hint: "_addcomment_tip"
        }),
        addComment: SC.ButtonView.design({
            layout: {bottom: 10, right:55, width: 25, height: 25},
            title: "+",
            action: "maps_AddComment",
            isEnabledBinding: SC.Binding.bool().from("Maps.socialCommentsController.newCommentText")
        }),
        delComment: SC.ButtonView.design({
            layout: {bottom: 10, right:10, width: 25, height: 25},
            title: "-",
            action: "maps_DelComment",
            isEnabledBinding: SC.Binding.transform(
                function(value, binding) {
                    return (value && value.length() > 0) ? true : false;
                }).from("Maps.socialCommentsController.selection")
        })
    }),

    nosocialTab: SC.View.design({
        childViews: "icon explanation".w(),
        icon: SC.ImageView.design({
            layout: {centerY:0, left: 10, width:24, height:24},
            value: "sc-icon-alert-24"
        }),
        explanation: SC.LabelView.design({
            layout: {centerY:0, left: 54, right:10, height: 80},
            value: "_nosocial_expl".loc()
        })
    }),

    linksTab: SC.View.design({
        childViews: "links description".w(),
        links: SC.ScrollView.design({
            layout: {left: 0, top:0, right: 0, bottom:0},
            backgroundColor: 'white',
            contentView: SC.ListView.design({
                rowHeight: 45,
                showAlternatingRows: YES,
                isSelectable: NO,
                contentBinding: 'Maps.linkController.arrangedObjects',
                selectionBinding: 'Maps.linkController.selection',
                contentValueKey: "title",
                exampleView: Maps.LinkView
            })
        }),
        description: SC.LabelView.design({
            title: "_links".loc(),
            layout: {bottom: 10, right:10, width: 130, height: 30 }
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
                if (isForward) {
                    return value.firstObject().get("description")
                }
            })
        }),
        form: Maps.FormView.design({
            layout: {top: 36, left:5, right:5, height: 72},
            // does not seem to work ???
            valueBinding: SC.Binding.from("Maps.layerQueryController.selection").transform(function(value, isForward) {
                if (isForward) {
                    return value.firstObject().get("filterString")
                }
            })
        }),
        back: SC.ButtonView.design({
            layout: {right:100, bottom: 10, width: 80, height: 25},
            title: "_back".loc(),
            action: "layerQueryBack",
            themeName: "point-left"
        }),
        send: SC.ButtonView.design({
            layout: {right:10, bottom: 10, width: 80, height: 25},
            title: "_run".loc(),
            action: "layerQueryRun"
        })
    }),

    layerSearchPane : SC.PickerPane.design(SC.Animatable, {
        themeName: 'popover',

        transitions: {
            opacity: { duration: .25, timing: SC.Animatable.TRANSITION_CSS_EASE_IN_OUT }
        },

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

    layerPalette : SC.PickerPane.extend(SC.Animatable, {
        themeName: 'popover',

        transitions: {
            opacity: { duration: .25, timing: SC.Animatable.TRANSITION_CSS_EASE_IN_OUT }
        },

        layout: { width: 500, height: 400 },
        contentView: SC.WorkspaceView.extend({
            topToolbar: SC.ToolbarView.design({
                childViews: ["advancedBtn","legendBtn"],
                advancedBtn: SC.ImageButtonView.design({
                    layout: {width: 30, centerY: 0, right: 0, height: 16},
                    image: "sc-icon-options-16",
                    action: "showAdvancedOptions",
                    isEnabledBinding: "Maps.authenticationManager.isAdmin"
                }),
                legendBtn: SC.ButtonView.design({
                    layout: {width: 80, centerY: 0, right: 40, height: 26},
                    titleBinding: "Maps.MainResponder.legendBtnText",
                    action: "toggleLegend"
                })
            }),
            bottomToolbar: null,

            contentView:SC.View.extend({
                classNames: 'popover_content_background'.w(),
                layout: {top: 0, left: 0, right: 0, bottom: 0},
                childViews: 'googleView layerView layerDetailView'.w(),
                googleView: SC.RadioView.design({
                    layout: {top: 15, left: 30, width:200, height: 30},
                    items: '_streets_satellite'.loc().w(),
                    valueBinding: "Maps.openLayersController.whichGoogleLayer",
                    height: 24,
                    layoutDirection: SC.LAYOUT_HORIZONTAL
                }),
                layerView: SC.ScrollView.design({
                    hasHorizontalScroller: NO,
                    layout: { top: 40, bottom: 0, left: 0, width: 210 },
                    backgroundColor: 'white',
                    contentView: SC.ListView.design({
                        layout:{top:0,bottom:0,right:0,left:8},
                        rowHeight: 30,
                        contentBinding: 'Maps.openLayersController.arrangedObjects',
                        selectionBinding: 'Maps.openLayersController.selection',
                        contentValueKey: "name",
                        contentCheckboxKey: "visible",
                        contentIconKey: "legendIcon",
                        contentRightIconKey: "filterIcon",
                        hasContentIcon: NO,
                        hasContentRightIcon: YES,
                        action:"maps_LayerSearch",
                        canReorderContent: YES,
                        isEditable: YES,
                        action: "onLayerSelected",
                        target: "Maps.openLayersController",
                        actOnSelect: YES
                        //showAlternatingRows: YES
                    })
                }),
                layerDetailView: SC.SceneView.design({
                    layout: { top: 40, bottom: 5, right: 10, width: 270 },
                    scenes: ["Maps.mainPage.layerInfoView","Maps.mainPage.layerLegendView"],
                    nowShowingBinding: "Maps.openLayersController.layerPaletteNowShowing"
                })
            })
        })
    }).create(),

    geotoolsPane: SC.View.design({
        childViews: "feature1 feature2 operation go help helptext".w(),
        feature1: Maps.DropView.design({
            layout: {top: 5, left:5, right:5, height:30},
            valueBinding: "Maps.featureInfoController.feature1descr",
            textAlign: SC.ALIGN_CENTER,
            classNames: ["maps-dropview","text-shadow"],
            dropTargetProperty: "feature1"
        }),
        feature2: Maps.DropView.design({
            layout: {top: 51, left:5, right:5, height:30},
            valueBinding: "Maps.featureInfoController.feature2descr",
            textAlign: SC.ALIGN_CENTER,
            classNames: ["maps-dropview","text-shadow"],
            dropTargetProperty: "feature2"
        }),
        operation: SC.SelectView.design({
            layout: {top: 102, left:5, right:5, height:36},
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
            layout: {top: 180, centerX:0, height:26, width:26},
            value: "sc-icon-help-24"
        }),
        helptext: SC.LabelView.design({
            layout: {top: 210,left:5, right:5, bottom:5},
            value:"_geotools_help".loc(),
            classNames: "text-shadow".w()
        })
    }),

    explorerPane: SC.View.design({
        layout: {top:0,bottom:0,left:0,right:0},
        childViews: "tags buttons".w(),

        tags:SC.ScrollView.design({
            layout: {top:0,bottom:130,left:0,right:0},
            contentView: SC.ListView.design({
                classNames: ["denim"],
                rowHeight: 30,
                contentBinding: "Maps.tagsController.arrangedObjects",
                selectionBinding: "Maps.tagsController.selection",
                contentValueKey: "tag",
                contentCheckboxKey: "visible",
                //contentIconKey: "legendIcon",
                contentUnreadCountKey: "occurrences"
                //hasContentIcon: YES
            })
        }),
        buttons: SC.View.design({
            classNames: ["graduated"],
            layout: {bottom:0,height:130,left:0,right:0},
            childViews: "help helpText rendertags reloadtags".w(),
            help: SC.ImageView.design({
                layout: {top: 5, centerX:0, height:26, width:26},
                value: "sc-icon-help-24"
            }),
            helpText: SC.LabelView.design({
                classNames: "text-shadow".w(),
                layout: {bottom:31,top:31,left:5,right:5},
                value: "_tagexplorer_help".loc()
            }),
            rendertags: SC.ButtonView.design({
                classNames: ["borderless"],
                layout: {bottom:0,width:0.48,height:26,right:0},
                title: "_rendertags".loc(),
                icon: "icon-rendertags-24",
                action: "maps_RenderTags",
                controlSize: SC.LARGE_CONTROL_SIZE
            }),
            reloadtags: SC.ButtonView.design({
                classNames: ["borderless"],
                layout: {bottom:0,width:0.48,height:26,left:0},
                title: "_reloadtags".loc(),
                icon: "icon-refresh-24",
                action: "maps_ReloadTags",
                controlSize: SC.LARGE_CONTROL_SIZE
            })
        })
    }),

    layerInfoView: SC.View.design({
        layout: { top: 0, bottom: 0, right: 0, left: 0 },
        isVisibleBinding: SC.Binding.bool().from("Maps.layerController.content"),
        childViews: "title name description opacitylbl opacity toggleFilter googlearth".w(),
        title: SC.LabelView.design({
            value: "_info".loc(),
            controlSize: SC.LARGE_CONTROL_SIZE,
            layout: {top: 0, right:5, height: 20, left:5}
        }),
        name: SC.LabelView.design({
            valueBinding: SC.Binding.from('Maps.layerController.name').labelPrefix("Nome:"),
            layout: {top: 25, right:5, height: 20, left:5}
        }),
        opacitylbl: SC.LabelView.design({
            layout: {top: 50, right:5, height: 20, left:5},
            value: "_opacity".loc()
        }),
        opacity:SC.SliderView.design({
            layout: {top: 70, right:10, height: 20, left:10},
            valueBinding: 'Maps.layerController.opacity',
            maximum: 10,
            minimum: 0,
            step: 1
        }),
        description: SC.LabelView.design({
            valueBinding: SC.Binding.from('Maps.layerController.description').labelPrefix("Descrizione:"),
            layout: {top: 110, right:5, bottom: 50, left:5}
        }),
        toggleFilter: SC.ButtonView.design({
            layout: {bottom: 10, left:5, height: 25, right:60},
            titleBinding: SC.Binding.labelPrefix("Rimuovi filtro").from("Maps.layerController.cql_filter"),
            action: "doRemoveFilter",
            isEnabledBinding: SC.Binding.bool().from("Maps.layerController.cql_filter")
        }),
        googlearth: SC.ImageButtonView.design({
            layout: {bottom: 10, width:25, height: 25, right:10},
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
    })

});

Maps.loginPage = SC.Page.design({
    mainPane: SC.MainPane.design({
        themeName: "loginPane",
        layout:{top:0,bottom:0,left:0,right:0},
        childViews: "logo loginform".w(),
        logo: SC.ImageView.design({
            layout:{centerY:0, left:80, width: 373, height: 96},
            value:app_logo_huge,
            canLoadInBackground: YES
        }),
        loginform:SC.View.design({
            layout: {width: 500, height: 300, left: 600, centerY: 0},
            classNames:"loginform".w(),

            childViews: 'labelU login labelP password button message'.w(),
            labelU: SC.LabelView.design({
                layout: {top:45, width:200, left:15, height:50},
                value: "_username".loc(),
                classNames:"formlabel".w(),
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            login: SC.TextFieldView.design({
                layout: {top:45, right:25, left:155, height:50},
                valueBinding: "Maps.authenticationManager.inputUsername",
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            labelP: SC.LabelView.design({
                layout: {top:105, width:200, left:15, height:50},
                value: "Password: ",
                classNames:"formlabel".w(),
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            password: SC.TextFieldView.design({
                layout: {top:105, right:25, left:155, height:50},
                valueBinding: "Maps.authenticationManager.inputPassword",
                isPassword: YES,
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            message: SC.LabelView.design({
                layout: {top:165, right:25, left:15, height:50},
                valueBinding: "Maps.authenticationManager.message",
                isVisibleBinding: "Maps.authenticationManager.message",
                classNames:"loginmessage".w(),
                controlSize: SC.HUGE_CONTROL_SIZE
            }),
            button: SC.ButtonView.design({
                layout: {top:220, right:35, width:55, height:30},
                title:"Login",
                controlSize:SC.HUGE_CONTROL_SIZE,
                themeName: 'round',
                action: "submitLogin",
                target: "Maps.authenticationManager",
                isEnabledBinding: "Maps.authenticationManager.inputUsername"
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
            layout: {left: 5, centerY:0, height:26, width:26},
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
            layout: {width: 90, right: 0, height:35, bottom: 0 },
            title: "_close".loc(),
            action: "helpClose"
        })
    })
}).create();
