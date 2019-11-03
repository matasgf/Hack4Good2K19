/*
Workr Index JS
Frank Giddens
November 1, 2019
*/

"use strict";

let current = {"event" : 0, "job" : 0, "view" : {"type" : "job", "list" : "new"}};
let filters = {"distance" : null, "minimumPay" : null};
let info = {"events" : null, "jobs" : null};
let initSet = true;
let kbShortcuts;
let socket = io.connect();

const loadEvent = () => {
    current.event++;
    let temp = new Date(info.events.data[current.event].date_end).valueOf();
    while(Date.now() > temp){
        current.event++;
        temp = new Date(info.events.data[current.event].date_end).valueOf();
    }
    temp = new Date(info.events.data[current.event].date_begin);
    document.getElementById("eventTitle").textContent = info.events.data[current.event].title;
    document.getElementById("eventCost").textContent = "Cost to attend: $" + info.events.data[current.event].cost;
    document.getElementById("eventDate").textContent = (temp.getMonth() + 1) + "/" + temp.getDate() + " " + temp.getHours() + ":" + temp.getMinutes(); //info.events.data[current.event].date_begin;
    document.getElementById("eventAddress").textContent = info.events.data[current.event].location.street;
    document.getElementById("eventCity").textContent = info.events.data[current.event].location.city + " " + info.events.data[current.event].location.state + " " + info.events.data[current.event].location.zipcode;
    document.getElementById("eventPhone").textContent = info.events.data[current.event].phone;
    document.getElementById("eventEmail").textContent = info.events.data[current.event].email;
    document.getElementById("eventDetails").innerHTML = info.events.data[current.event].description;
};

const loadJob = () => {
    current.job++;
    let temp = new Date(info.jobs.data[current.job].date_expires).valueOf();
    while(Date.now() > temp){
        current.job++;
        temp = new Date(info.jobs.data[current.job].date_expires).valueOf();
    }
    document.getElementById("jobTitle").textContent = info.jobs.data[current.job].title;
    document.getElementById("jobSalary").textContent = info.jobs.data[current.job].pay_rate;
    document.getElementById("jobEmployer").textContent = info.jobs.data[current.job].employer.name;
    document.getElementById("jobAddress").textContent = info.jobs.data[current.job].locations.data[0].street;
    document.getElementById("jobCity").textContent = info.jobs.data[current.job].locations.data[0].city + " " + info.jobs.data[current.job].locations.data[0].state + " " + info.jobs.data[current.job].locations.data[0].zipcode
    if(info.jobs.data[current.job].req_education === null){
        document.getElementById("jobEdu").textContent = "No Education Required";
    }
    else{
        switch(info.jobs.data[current.job].req_education){
            case "high_school":
                document.getElementById("jobEdu").textContent = "High School";
                break;
            case "associate":
                document.getElementById("jobEdu").textContent = "Associate Degree";
                break;
            case "bachelor":
                document.getElementById("jobEdu").textContent = "Bachelor Degree";
                break;
            case "master":
                document.getElementById("jobEdu").textContent = "Masters Degree";
                break;
            case "doctorate":
                document.getElementById("jobEdu").textContent = "Doctorate";
                break;
        }
    }
    document.getElementById("jobDetails").innerHTML = info.jobs.data[current.job].description;
};

const acceptEvent = () => {
    let output = window.localStorage.getItem("acceptedEvents");
    if(output === null){
        output = [];
    }
    output.push(current.event);
    window.localStorage.setItem("acceptedEvents") = output;
    loadEvent();
};

const denyEvent = () => {
    let output = window.localStorage.getItem("deniedEvents");
    if(output === null){
        output = [];
    }
    output.push(current.event);
    //window.localStorage.setItem("deniedEvents") = output;
    loadEvent();
};

const acceptJob = () => {
    let output = window.localStorage.getItem("acceptedJobs");
    if(output === null){
        output = [];
    }
    output.push(current.job);
    //window.localStorage.setItem("acceptedJobs") = output;
    loadJob();
};

const denyJob = () => {
    let output = window.localStorage.getItem("deniedJobs");
    if(output === null){
        output = [];
    }
    output.push(current.job);
    //window.localStorage.setItem("deniedJobs") = output;
    loadJob();
};

const setView = () => {
    if(current.view.list == "new"){
        if(current.view.type == "job"){
            current.job--;
            document.getElementById("mainCard").innerHTML = "<strong class=\"card-title\" id=\"jobTitle\"></strong><p class=\"card-subtitle\"><span id=\"jobSalary\"></span><br/><a class=\"text-dark\" href=\"https://www.google.com/maps/dir/405+N+Jefferson+Ave,+Springfield,+MO+65806/3436+S+Farm+Rd+135,+Springfield,+MO+65807/\"><span id=\"jobEmployer\"></span><br/><span id=\"jobAddress\"></span><br/><span id=\"jobCity\"></span><br/><span id=\"jobDistance\"></span></a></p><div class=\"card-body\"><strong>Requirements</strong><ul class=\"list-group\" id=\"jobRequirements\"><li class=\"list-group-item\"><p><i class=\"fas fa-graduation-cap\"></i><span class=\"float-right\" id=\"jobEdu\"></span></p></li></ul><br/><div id=\"jobDetails\"></div><br/><div class=\"fixed-bottom row\"><button class=\"btn btn-outline-danger lead mb-2 ml-4 mr-auto\" id=\"jobDenyBtn\"><h3><i class=\"fas fa-times\"></i></h3></button><button class=\"btn btn-outline-secondary lead mb-2 mx-auto\" id=\"jobLinkBtn\"><h3><i class=\"fas fa-external-link-alt\"></i></h3></button><button class=\"btn btn-outline-success mb-2 ml-auto mr-4\" id=\"jobAcceptBtn\"><h3><i class=\"fas fa-check\"></i></h3></button></div></div>";
            document.getElementById("jobAcceptBtn").addEventListener("click", () => {
                document.getElementById("jobAcceptBtn").classList.remove("active");
                document.getElementById("jobAcceptBtn").blur();
                acceptJob();
            });
            document.getElementById("jobDenyBtn").addEventListener("click", () => {
                document.getElementById("jobDenyBtn").classList.remove("active");
                document.getElementById("jobDenyBtn").blur();
                denyJob();
            });
            document.getElementById("jobLinkBtn").addEventListener("click", () => {
                document.getElementById("jobLinkBtn").classList.remove("active");
                document.getElementById("jobLinkBtn").blur();
                window.open(info.jobs.data[current.job].url);
            });
            kbShortcuts = document.addEventListener("keydown", (evt) => {
                switch(evt.key){
                    case "ArrowLeft":
                        document.getElementById("jobDenyBtn").classList.add("active");
                        setTimeout(() => {
                            document.getElementById("jobDenyBtn").classList.remove("active");
                            document.getElementById("jobDenyBtn").blur();
                            denyJob();
                        }, 250);
                        break;
                    case "ArrowRight":
                        document.getElementById("jobAcceptBtn").classList.add("active");
                        setTimeout(() => {
                            document.getElementById("jobAcceptBtn").classList.remove("active");
                            document.getElementById("jobAcceptBtn").blur();
                            acceptJob();
                        }, 250);
                        break;
                }
            });
            loadJob();
        }
        else{
            current.event--;
            document.getElementById("mainCard").innerHTML = "<strong class=\"card-title\" id=\"eventTitle\"></strong><p class=\"card-subtitle\"><span id=\"eventCost\"></span><br/><span id=\"eventDate\"></span><br/><a class=\"text-dark\" href=\"https://www.google.com/maps/dir/405+N+Jefferson+Ave,+Springfield,+MO+65806/3436+S+Farm+Rd+135,+Springfield,+MO+65807/\"><span id=\"eventAddress\"></span><br/><span id=\"eventCity\"></span></a><br/><span id=\"eventPhone\"></span><br/><span id=\"eventEmail\"></span></p><div class=\"card-body\"><div id=\"eventDetails\"></div><br/><div class=\"fixed-bottom row\"><button class=\"btn btn-outline-danger lead mb-2 ml-4 mr-auto\" id=\"eventDenyBtn\"><h3><i class=\"fas fa-times\"></i></h3></button><button class=\"btn btn-outline-secondary lead mb-2 mx-auto\" id=\"eventLinkBtn\"><h3><i class=\"fas fa-external-link-alt\"></i></h3></button><button class=\"btn btn-outline-success mb-2 ml-auto mr-4\" id=\"eventAcceptBtn\"><h3><i class=\"fas fa-check\"></i></h3></button></div></div>";
            document.getElementById("eventAcceptBtn").addEventListener("click", () => {
                document.getElementById("eventAcceptBtn").classList.remove("active");
                document.getElementById("eventAcceptBtn").blur();
                acceptEvent();
            });
            document.getElementById("eventDenyBtn").addEventListener("click", () => {
                document.getElementById("eventDenyBtn").classList.remove("active");
                document.getElementById("eventDenyBtn").blur();
                denyEvent();
            });
            document.getElementById("eventLinkBtn").addEventListener("click", () => {
                document.getElementById("eventLinkBtn").classList.remove("active");
                document.getElementById("eventLinkBtn").blur();
                window.open(info.events.data[current.event].url);
            });
            kbShortcuts = document.addEventListener("keydown", (evt) => {
                switch(evt.key){
                    case "ArrowLeft":
                        document.getElementById("eventDenyBtn").classList.add("active");
                        setTimeout(() => {
                            document.getElementById("eventDenyBtn").classList.remove("active");
                            document.getElementById("eventDenyBtn").blur();
                            denyEvent();
                        }, 250);
                        break;
                    case "ArrowRight":
                        document.getElementById("eventAcceptBtn").classList.add("active");
                        setTimeout(() => {
                            document.getElementById("eventAcceptBtn").classList.remove("active");
                            document.getElementById("eventAcceptBtn").blur();
                            acceptEvent();
                        }, 250);
                        break;
                }
            });
            loadEvent();
        }
    }
    else{
        if(current.view.type == "job"){
            //Saved Jobs
        }
        else{
            //Saved Events
        }
    }
};

const init = () => {
    socket.emit("reqEvents", {});
    socket.emit("reqJobs", {});
};

document.getElementById("listSwitch").addEventListener("click", () => {
    if(current.view.list == "new"){
        current.view.list = "saved";
    }
    else{
        current.view.list = "new";
    }
    setView();
});

document.getElementById("typeSwitch").addEventListener("click", () => {
    if(current.view.type == "job"){
        current.view.type = "event";
    }
    else{
        current.view.type = "job";
    }
    setView();
});

socket.on("recEvents", (data) => {
    info.events = data;
});

socket.on("recJobs", (data) => {
    info.jobs = data;
    if(initSet){
        initSet = false;
        setView();
    }
});

init();
