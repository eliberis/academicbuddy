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
        url: Routing.generate("groups_update", { "id" : id }),
        type: 'PUT',
        headers: { "X-CSRF-Token":  this.csrfToken },
        dataType: "json",
        data: JSON.stringify(group),
        success: function(data) {
            onSuccess(); // No response on success
        } 
    });
}

ApiComms.prototype.emailGroups = function(onSuccess) {
    $.ajax({
        url: Routing.generate("groups_email"),
        type: 'POST',
        headers: { "X-CSRF-Token":  this.csrfToken },
        success: function(data) {
            onSuccess(); // No response on success
        } 
    });
}

ApiComms.prototype.emailUnsuccessfulApplicants = function(onSuccess) {
    $.ajax({
        url: Routing.generate("groups_inform_unsuccessful"),
        type: 'POST',
        headers: { "X-CSRF-Token":  this.csrfToken },
        success: function(data) {
            onSuccess(); // No response on success
        } 
    });
}

/** Main JS application **/
var GroupApp = function() {
    var self = this;
    self.comms = new ApiComms();

    self.singleton = {pupils:[]};

    // We assume users don't change during the grouping process
    self.comms.listUsers(function (users) {
        self.pupils = users["pupils"];
        self.mentors = users["mentors"];
        self.comms.listGroups(self.loadGroups.bind(self));
    });
    
    $("#new-group-btn").on('click', function(e) { self.addGroup.call(self); } );
    $("#send-group-mail-btn").on('click', function(e) { self.sendGroupEmails.call(self); });
    $("#inform-unsucc-btn").on('click', function(e) { self.informUnsuccessfulApplicants.call(self); });
}

GroupApp.prototype.addGroup = function() {
    var self = this;
    console.log("Adding a new group.");
    self.comms.createGroup(function(id) {
        self.displayGroup(id, self.singleton);
    });
}

GroupApp.prototype.formGroupFromIds = function(mentorId, secMentorId, pupilIds) {
    var self = this;
    var locate = function(id, where) {
        return $.grep(where, function(e){ return e.id === id; })[0];
    }

    return {
        mentor: locate(mentorId, self.mentors),
        secondary_mentor: locate(secMentorId, self.mentors),
        pupils: pupilIds.map(function(id) { return locate(id, self.pupils); })
    };
}

GroupApp.prototype.showError = function(msg) {
    this.showAlert("alert-danger", msg);
}

GroupApp.prototype.showSuccess = function(msg) {
    this.showAlert("alert-success", msg);
}

GroupApp.prototype.showAlert = function(type, msg) {
    var alertHtml = '\
       <div id="group-status-alert" class="alert {type} alert-dismissible" role="alert"> \
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> \
        {msg} \
      </div>'
      .replace(/{type}/g, type)
      .replace(/{msg}/g, msg);
    $("#group-status-alert").remove();
    $("#alert-placeholder").append(alertHtml);
}

GroupApp.prototype.loadGroups = function(groupObj) {
    var self = this;
    self.groups = groupObj.groups;
    if($.isEmptyObject(self.groups)) {
        return;
    }
    Object.keys(groupObj.groups).forEach(function (id) {
        var group = groupObj.groups[id];
        console.info("Setting up card for group #" + id + " with mentor " + (group.mentor? group.mentor.email : "(unknown)"));
        self.displayGroup(id, group);
    });
};

GroupApp.prototype.deleteAllGroups = function() {
    var self = this;
    self.comms.deleteAllGroups(function() {
        $(".group-card-wrapper").delete();
        self.groups = [];
    });
}

GroupApp.prototype.deleteGroup = function(id) {
    var self = this;
    self.comms.deleteGroup(id, function() {
        console.info("Group #" + id + " deleted.");
        $("#group-card-"+id).remove();
        self.showSuccess("Group #" + id + " deleted.");
    });
}

GroupApp.prototype.displayGroup = function(id, group) {
    var self = this;

    // Add group html
    var groupHtml = '\
    <div id="group-card-{id}" data-id="{id}" class="group-card-wrapper col-sm-4 col-md-3"> \
      <div class="group-card panel-shadow"> \
        <h3>Grupė #{id}</h3> \
        <div class="form-group"> \
          <label for="select-mentor-{id}">Mentorius</label> \
          <select class="form-control" id="select-mentor-{id}"> \
          </select> \
        </div> \
        <div class="form-group"> \
          <label for="select-secondary-mentor-{id}">Pagalbinis mentorius</label> \
          <select class="form-control" id="select-secondary-mentor-{id}"> \
          </select> \
        </div> \
        <div class="form-group"> \
          <label for="select-pupils-{id}">Mokiniai</label> \
          <select class="form-control" id="select-pupils-{id}" multiple="multiple"> \
          </select> \
        </div> \
        <div class="form-group"> \
          <button type="button" class="btn btn-success form-control save-group"> \
            <span class="glyphicon glyphicon-ok"></span> Išsaugoti \
          </button> \
          <button type="button" class="btn btn-danger form-control remove-group"> \
            <span class="glyphicon glyphicon-remove"></span> Pašalinti \
          </button> \
        </div> \
      </div> \
    </div>'.replace(/{id}/g, id);
    $("#groups-container").append(groupHtml);

    // Set up select values: TODO rewrite with select2 API
    var $mentorSelect = $("#select-mentor-" + id), $secMentorSelect = $("#select-secondary-mentor-" + id);
    $mentorSelect.append('<option value="">(nėra)</option>');
    $secMentorSelect.append('<option value="">(nėra)</option>');
    self.mentors.forEach(function (mentor) {
        var optionStr = '<option {selected} value="{id}">{name}</option>'
            .replace(/{id}/g, mentor.id)
            .replace(/{name}/g, mentor.name);
        $mentorSelect.append(optionStr
            .replace(/{selected}/g, group.mentor !== undefined && mentor.id == group.mentor.id? "selected" : ""));
        $secMentorSelect.append(optionStr
            .replace(/{selected}/g, group.secondary_mentor !== undefined && mentor.id == group.secondary_mentor.id? "selected" : ""));
        
    });

    var $pupilSelect = $("#select-pupils-" + id);
    var pupilIds = group.pupils.map(function(p) { return p.id; });
    self.pupils.forEach(function (pupil) {
        var optionStr = '<option {selected} value="{id}">{name}</option>'
            .replace(/{id}/g, pupil.id)
            .replace(/{name}/g, pupil.name)
            .replace(/{selected}/g, pupilIds.indexOf(pupil.id) != -1? "selected" : "");
        $pupilSelect.append(optionStr);
    });

    $('#group-card-'+id+' select').select2();

    // Set up button callbacks
    $('#group-card-'+id+' .save-group').on('click', function(e) {
        var self = this;
        console.info("Saving group "+id);
        var mentorId = parseInt($("#select-mentor-"+id).select2('data')[0].id) || null;
        var secMentorId = parseInt($("#select-secondary-mentor-"+id).select2('data')[0].id) || null;
        var pupilIds = $("#select-pupils-"+id).select2('data').map(function(p) {
            return parseInt(p.id);
        })
        var group = self.formGroupFromIds(mentorId, secMentorId, pupilIds);
        self.comms.updateGroup(id, group, function() {
            console.info("Group " + id + " updated");
            self.showSuccess("Group #" + id + " updated");
        })
    }.bind(self));
    $('#group-card-'+id+' .remove-group').on('click', function(e) {
        if(!confirm("Click OK to confirm deletion.")) { 
            return;
        }
        this.deleteGroup.call(this, id);
    }.bind(self));
}

GroupApp.prototype.sendGroupEmails = function() {
    // TODO: check all mentors are set
    var self = this;
    if(!confirm("This will send an introductory email to each group. Continue?")) return;
    self.comms.emailGroups(function() {
        console.info("Group emails sent!");
        self.showSuccess("Group emails sent! (Check 'Sent' folder just to be sure)");
    });
}

GroupApp.prototype.informUnsuccessfulApplicants = function() {
    var self = this;
    if(!confirm("This will send an email to each non-activated pupil. Continue?")) return;
    self.comms.emailUnsuccessfulApplicants(function() {
        console.info("Emails to unsuccessful applicants sent!");
        self.showSuccess("Emails to unsuccessful applicants sent! (Check 'Sent' folder just to be sure)");
    });
}

var app = new GroupApp();
$(document).ajaxError(function (err, xhr) {
    console.log(err, xhr);
    app.showError(xhr.responseText); 
});