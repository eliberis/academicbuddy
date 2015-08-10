$(function() {
    $('select').select2();
});

/** API Comms **/
var ApiComms = function() {
    this.updateCsrfToken();
}

ApiComms.prototype.updateCsrfToken = function() {
    var self = this;
    $.get(Routing.generate("groups_token"), function(data) {
        self.csrfToken = data;
    });
}

ApiComms.prototype.listGroups = function(onSuccess) {
    $.getJSON(Routing.generate("groups_list"), function(data) {
        onSuccess(data);
    });
}

ApiComms.prototype.createGroup = function(onSuccess) {
    $.ajax({
        url: Routing.generate("groups_create"),
        type: 'POST',
        headers: { "X-CSRF-Token":  this.csrfToken },
        dataType: "text",
        success: function(data) {
            onSuccess(parseInt(data));
        } 
    });
}

ApiComms.prototype.deleteAllGroups = function(onSuccess) {
    $.ajax({
        url: Routing.generate("groups_delete_all"),
        type: 'DELETE',
        headers: { "X-CSRF-Token":  this.csrfToken },
        dataType: "text",
        success: function(data) {
            onSuccess(); // No response on success
        } 
    });
}

ApiComms.prototype.listUsers = function(onSuccess) {
    $.getJSON(Routing.generate("groups_users"), function(data) {
        onSuccess(data);
    });
}

ApiComms.prototype.getGroup = function(id, onSuccess) {
    $.getJSON(Routing.generate("groups_get", { "id" : id }), function(data) {
        onSuccess(data);
    });
}

ApiComms.prototype.deleteGroup = function(id, onSuccess) {
    $.ajax({
        url: Routing.generate("groups_delete", { "id" : id }),
        type: 'DELETE',
        headers: { "X-CSRF-Token":  this.csrfToken },
        dataType: "text",
        success: function(data) {
            onSuccess(); // No response on success
        } 
    });
}

ApiComms.prototype.updateGroup = function(id, group, onSuccess) {
    $.ajax({
        url: Routing.generate("groups_delete", { "id" : id }),
        type: 'PUT',
        headers: { "X-CSRF-Token":  this.csrfToken },
        dataType: "json",
        data: group,
        success: function(data) {
            onSuccess(); // No response on success
        } 
    });
}

/** Main JS application **/
var GroupApp = function() {
    var self = this;
    this.comms = new ApiComms();
    this.comms.listGroups(self.loadGroups);
}

GroupApp.prototype.showError = function(msg) {
    console.error(msg);
}

GroupApp.prototype.loadGroups = function(groupObj) {
    Object.keys(groupObj.groups).forEach(function (id) {
        var group = groupObj.groups[id];
        // TODO: set up a card for group #id
        console.log("Setting up card for group #" + id + " with mentor " + (group.mentor? group.mentor.email : "(unknown)"));
    });
};

var app = new GroupApp();
$(document).ajaxError(function (err) {
    app.showError(err); 
});