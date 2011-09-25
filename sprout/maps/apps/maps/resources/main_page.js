// ==========================================================================
// Project:   Maps - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Maps */

SC.Binding.labelPrefix = function(prefix) {
  return this.transform(function(value, binding) {
    return prefix + " " + (value ? value : "n/a");
  }) ;
} ;

// This page describes the main user interface for your application.  
Maps.mainPage = SC.Page.design({

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page
    // load.
    mainPane: SC.MainPane.design({
        childViews: 'toolbar splitview'.w(),

        defaultResponder: 'Maps.MainResponder',

        toolbar : SC.ToolbarView.design({
            layout: { top: 0, left: 0, right: 0, height: 36 },
            anchorLocation: SC.ANCHOR_TOP,
            childViews : 'layers tools label'.w(),

            layers : SC.SegmentedView.design({
                layout: { centerY: 0, height: 24, right: 630, width: 160 },
                items : [
                    {title: 'Layers', action: 'LAYERS'},
                    {title: 'Search', action: 'SEARCH'}
                ],
                itemTitleKey : 'title',
                itemValueKey : 'action',
                valueBinding: "Maps.openLayersController.layersAndSearch",
                allowsEmptySelection: YES,
                allowsMultipleSelection: YES
            }),
            tools : SC.SegmentedView.design({
                layout: { centerY: 0, height: 24, right: 370, width: 270 },
                items : [
                    {title: 'Move', action: 'toolMove'},
                    {title: 'Area', action: 'toolArea'},
                    {title: 'Length', action: 'toolLength'},
                    {title: 'Geo Tools', action: 'toolGeo'}
                ],
                itemTitleKey : 'title',
                itemValueKey : 'action',
                valueBinding: "Maps.openLayersController.tools"
            }),
            label : SC.LabelView.design({
                classNames: ['maps_black'],
                layout: { centerY: 0, height: 24, right: 230, width: 130 },
                escapeHTML: NO,
                valueBinding: "Maps.openLayersController.measure"
            })
        }),

        splitview : SC.SplitView.design({
            layout: { top: 37, left: 0, bottom:0, right: 0 },
            layoutDirection: SC.LAYOUT_HORIZONTAL,

            bottomRightMinThickness: 200,
            bottomRightMinThickness: 0.8,
            defaultThickness: 0.8,

            topLeftView: Maps.OpenLayers.design({
                minThickness: 200,
                maxThickness: 0.8,
                layout: { top: 37, left: 0, bottom:0, right: 224 },

                layerId: 'olmap',

                contentBinding: "Maps.openLayersController.content",
                exampleView: Maps.OpenLayersLayer
            }),

            bottomRightView: SC.View.design({
                layout: { top: 37, width: 223, bottom:0, right: 0 },
                minThickness: 0.6,
                maxThickness: 0.8,

                childViews: "resultsView featureView".w(),
                resultsView: SC.ScrollView.design({
                    layout: { top: 0, left: 0, height:250, right: -1 },
                    hasHorizontalScroller: NO,
                    backgroundColor: 'white',
                    contentView: SC.ListView.design({
                        classNames: ["maps-chkbox-starred"],
                        rowHeight: 24,
                        contentBinding: 'Maps.featureInfoController.arrangedObjects',
                        selectionBinding: 'Maps.featureInfoController.selection',
                        contentValueKey: "name",
                        contentCheckboxKey: "isStarred",
                        action: "dblclick"
                    })
                }),

                featureView: SCTable.TableView.design({
                    layout: { top: 251, bottom: -1, left:0, right: -1 },

                    contentBinding: 'Maps.featureInfoAttributesController.arrangedObjects',
                    selectionBinding: 'Maps.featureInfoAttributesController.selection',

                    action: "onAttributeDoubleClick",
                    target: "Maps.featureInfoAttributesController",

                    columns: [SC.Object.create(SCTable.Column, {
                        name: "Property",
                        valueKey: 'property',
                        width: 100,
                        canSort: YES
                        }),
                        SC.Object.create(SCTable.Column, {
                            name: "Value",
                            valueKey: 'value',
                            width: 170,
                            canSort: YES
                        })]
                })
            })
        })
    }),
    tagsTab: SC.View.design({
        childViews: "star tags saveTags".w(),
        star: SC.LabelView.design({
            layout: {left: 10, top:10, width: 350, height: 30 },
            valueBinding: 'Maps.socialController.starredAsText'
        }),
        tags: SC.TextFieldView.design({
            isTextArea: YES,
            layout: {left: 10, top: 35, right: 10, height: 60 },
            valueBinding: 'Maps.socialController.tags'
        }),
        saveTags: SC.ButtonView.design({
            layout: {top: 110, right: 10, width: 50},
            title: "Save",
            action: "saveTags",
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
                //exampleView: Maps.CommentView,
                //canEditContent: YES,
                //canDeleteContent: YES
            })
        }),
        newComment: SC.TextFieldView.design({
            layout: {bottom: 10, left:10, width: 295, height: 25 },
            valueBinding: "Maps.socialCommentsController.newCommentText",
            hint: "Aggiungi un commento..."
        }),
        addComment: SC.ButtonView.design({
            layout: {bottom: 10, right:55, width: 25, height: 25},
            title: "+",
            action: "addComment",
            isEnabledBinding: SC.Binding.bool().from("Maps.socialCommentsController.newCommentText")
        }),
        delComment: SC.ButtonView.design({
            layout: {bottom: 10, right:10, width: 25, height: 25},
            title: "-",
            action: "delComment",
            isEnabledBinding: SC.Binding.transform(function(value, binding) {
                return (value && value.length()>0) ? true : false;
              }).from("Maps.socialCommentsController.selection")
        })
    }),

    linksTab: SC.View.design({
        childViews: "links description".w(),
        links: SC.ScrollView.design({
            layout: {left: 10, top:15, right: 10, bottom: 50 },
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
            title: "Links",
            layout: {bottom: 10, right:10, width: 130, height: 30 }
        })
    }),

    queryListPane: SC.View.design({
        layout: {top:10, bottom:10, right:10, left:10},
        childViews: "label queryList".w(),
        label:SC.LabelView.design({
            layout: {top:5, left:5, right:5},
            value: "Double click to choose one of the available queries"
        }),
        queryList: SC.ScrollView.design({
            layout: {bottom:5, top:36, left:5, right:5},
            backgroundColor: 'white',
            contentView: SC.ListView.design({
                rowHeight:24,
                contentBinding: 'Maps.layerQueryController.arrangedObjects',
                selectionBinding: 'Maps.layerQueryController.selection',
                contentValueKey: "description",
                action:"goToEditQuery"
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
            title: "Back",
            action: "layerQueryBack",
            themeName: "point-left"
        }),
        send: SC.ButtonView.design({
            layout: {right:10, bottom: 10, width: 80, height: 25},
            title: "Run",
            action: "layerQueryRun"
        })
    }),

    layerSearchPane : SC.PickerPane.design({
        layout: { height: 200, width: 400},
        contentView: SC.SceneView.design({
            layout: {top:0,bottom:0,left:0,right:0},
            scenes: ["Maps.mainPage.queryListPane", "Maps.mainPage.queryEditPane"],
            nowShowingBinding: "Maps.openLayersController.layerSearchNowShowing"
        })
    }).create(),

    layerPalette : SC.PickerPane.extend({
        layout: { width: 500, height: 300 },
        contentView: SC.View.extend({
            layout: {top: 0, left: 0, right: 0, bottom: 0},
            childViews: 'googleView layerView layerDetailView'.w(),
            googleView: SC.RadioView.design({
                layout: {top: 10, left: 5, right: 5, height: 30},
                items: 'Streets Satellite'.w(),
                valueBinding: "Maps.openLayersController.whichGoogleLayer",
                height: 24,
                layoutDirection: SC.LAYOUT_HORIZONTAL
            }),
            layerView: SC.ScrollView.design({
                hasHorizontalScroller: NO,
                layout: { top: 40, bottom: 5, left: 5, width: 200 },
                backgroundColor: 'white',
                contentView: SC.ListView.design({
                    rowHeight: 24,
                    contentBinding: 'Maps.openLayersController.arrangedObjects',
                    selectionBinding: 'Maps.openLayersController.selection',
                    contentValueKey: "name",
                    contentCheckboxKey: "visible",
                    contentIconKey: "legendIcon",
                    contentRightIconKey: "filterIcon",
                    hasContentIcon: YES,
                    hasContentRightIcon: YES,
                    action:"layerSearch",
                    canReorderContent: YES,
                    isEditable: YES,
                    action: "onLayerSelected",
                    target: "Maps.openLayersController",
                    actOnSelect: YES
                })
            }),
            layerDetailView: SC.View.design({
                layout: { top: 40, bottom: 5, right: 10, width: 270 },
                isVisibleBinding: SC.Binding.bool().from("Maps.layerController.content"),
                childViews: "title name description opacitylbl opacity toggleFilter".w(),
                title: SC.LabelView.design({
                    value: "Informazioni",
                    controlSize: SC.LARGE_CONTROL_SIZE,
                    layout: {top: 0, right:5, height: 20, left:5}
                }),
                name: SC.LabelView.design({
                    valueBinding: SC.Binding.from('Maps.layerController.name').labelPrefix("Nome:"),
                    layout: {top: 25, right:5, height: 20, left:5}
                }),
                opacitylbl: SC.LabelView.design({
                    layout: {top: 50, right:5, height: 20, left:5},
                    value: "Trasparenza:"
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
                    layout: {bottom: 10, left:5, height: 25, right:5},
                    titleBinding: SC.Binding.labelPrefix("Rimuovi filtro").from("Maps.layerController.cql_filter"),
                    action: "doRemoveFilter",
                    isEnabledBinding: SC.Binding.bool().from("Maps.layerController.cql_filter")
                })
            })
        })
    }).create(),

    geotools : SC.PalettePane.create({
        layout: { width: 144, height: 159, left: 200, top: 100 },
        contentView: SC.View.extend({
            layout:{top:0,bottom:0,left:0,right:0},
            childViews: "feature1 feature2 operation go".w(),
            feature1: Maps.DropView.design({
                layout: {top: 5, left:5, right:5, height:36},
                valueBinding: "Maps.featureInfoController.feature1descr",
                textAlign: SC.ALIGN_CENTER,
                classNames: ["maps-dropview"],
                dropTargetProperty: "feature1"
            }),
            feature2: Maps.DropView.design({
                layout: {top: 46, left:5, right:5, height:36},
                valueBinding: "Maps.featureInfoController.feature2descr",
                textAlign: SC.ALIGN_CENTER,
                classNames: ["maps-dropview"],
                dropTargetProperty: "feature2"
            }),
            operation: SC.SelectView.design({
                layout: {top: 97, left:5, right:5, height:36},
                items: [
                    { title: "Intersection", pos: 1},
                    { title: "Union", pos: 2 },
                    { title: "Buffer", pos: 3 }
                ],
                itemTitleKey: 'title',
                itemValueKey: 'title',
                itemSortKey: 'pos',
                checkboxEnabled: YES,
                valueBinding: "Maps.featureInfoController.operation"
            }),
            go: SC.SegmentedView.design({
                layout: {top: 128, left:5, right:5, height:36},
                items: [
                    {title: "OK", action:"performGeoOperation"},
                    {title: "Clear", action:"performGeoClear"},
                    {title: "Close", action:"performGeoClose"}
                ],
                itemTitleKey: "title",
                itemActionKey: "action"
            })
        })
    })

});

Maps.loginPane = SC.Pane.design({
    layout:{top:0,bottom:0,left:0,right:0},
    themeName: "loginPane",
    childViews: "loginform".w(),
    loginform:SC.View.design({
        layout: {width: 300, height: 300, centerX:0, centerY: 0},

        childViews: 'labelU login labelP password button message'.w(),
        labelU: SC.LabelView.design({
            layout: {top:5, width:100, left:5, height:20},
            value: "Username: ",
            classNames:"formlabel".w()
        }),
        login: SC.TextFieldView.design({
            layout: {top:5, right:5, left:105, height:20},
            valueBinding: "Maps.authenticationManager.inputUsername"
        }),
        labelP: SC.LabelView.design({
            layout: {top:45, width:100, left:5, height:20},
            value: "Password: ",
            classNames:"formlabel".w()
        }),
        password: SC.TextFieldView.design({
            layout: {top:45, right:5, left:105, height:20},
            valueBinding: "Maps.authenticationManager.inputPassword",
            isPassword: YES
        }),
        message: SC.LabelView.design({
            layout: {top:80, right:5, left:5, height:20},
            valueBinding: "Maps.authenticationManager.message",
            isVisibleBinding: "Maps.authenticationManager.message",
            classNames:"formlabel".w()
        }),
        button: SC.ButtonView.design({
            layout: {top:110, right:5, width:55, height:30},
            title:"Login",
            controlSize:SC.HUGE_CONTROL_SIZE,
            themeName: 'round',
            action: "submitLogin",
            target: "Maps.authenticationManager",
            isEnabledBinding: "Maps.authenticationManager._username"
        })
    })
}).create();
