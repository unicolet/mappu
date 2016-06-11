/**
 *  Mappu : yet another web gis (with social taste).
 *  Copyright (c) 2011 Umberto Nicoletti - umberto.nicoletti _at_ gmail.com, all rights reserved.
 *
 *  Licensed under the LGPL.
 */

module("Maps.feature");

Maps.__isTesting = true;

test("feature.intelligent.name.simple", function () {
    var f = Maps.Feature.create({store:Maps.store, name:"the_name"});

    equals(f.get("intelligentName"), "the_name");
});

test("feature.intelligent.name.withname", function () {
    var f = Maps.store.createRecord(
        Maps.Feature,
        { name:'the_name', other_name:'other' },
        Math.random(Math.floor(Math.random() * 99999999))
    );

    equals(f.get("intelligentName"), "the_name: other");
});

test("feature.intelligent.name.withSTATENAME", function () {
    var f = Maps.store.createRecord(
        Maps.Feature,
        { name:'the_name', STATE_NAME:'other' },
        Math.random(Math.floor(Math.random() * 99999999))
    );

    equals(f.get("intelligentName"), "the_name: other");
});

test("feature.intelligent.name.withdescr", function () {
    var f = Maps.store.createRecord(
        Maps.Feature,
        { name:'the_name', description:'descr' },
        Math.random(Math.floor(Math.random() * 99999999))
    );

    equals(f.get("intelligentName"), "the_name (descr)");
});

test("feature.intelligent.name.withdescrandname", function () {
    var f = Maps.store.createRecord(
        Maps.Feature,
        { name:'the_name', description:'descr', STATE_NAME:'other' },
        Math.random(Math.floor(Math.random() * 99999999))
    );

    equals(f.get("intelligentName"), "the_name (descr)");
});

test("feature.intelligent.name.withdescrandnome", function () {
    var f = Maps.store.createRecord(
        Maps.Feature,
        { name:'the_name', description:'descr', STATE_NOME:'other' },
        Math.random(Math.floor(Math.random() * 99999999))
    );

    equals(f.get("intelligentName"), "the_name (descr)");
});