/**
 * Created by JetBrains WebStorm.
 * User: unicoletti
 * Date: 9/25/11
 * Time: 10:01 AM
 * To change this template use File | Settings | File Templates.
 */
Maps.User=SC.Record.extend({
    username: SC.Record.attr(String),
    authenticated: SC.Record.attr(Boolean)
});