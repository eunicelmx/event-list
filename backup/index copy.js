let globalDate = new Date();
let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let monthText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let month = document.getElementById("curr-month");
let year = document.getElementById("curr-year");
let calendar = document.getElementById("calendar-dates");
let addEventBtn = document.getElementById("add-event-btn");
let prev = document.getElementById("prev");
let next = document.getElementById("next");
let displayList = document.getElementById("event-lists");
let closeEventBtn = document.getElementById("close-event-btn");
// import fs from "./modules.js"
// const fs = require('fs')
// import * as fs from 'fs';


// let the month be the key
let loadedEventRecords = {};

/** Default settings */
month.textContent = monthText[globalDate.getMonth()];
year.textContent = globalDate.getFullYear();
loadMonthDays(globalDate)
addPrevNextListeners();
addEventBtnListener();

$("#add-event-form").submit(function(e) {
    e.preventDefault();
    var form = $(this);
    var actionUrl = form.attr('action');
    let jsForm = document.getElementById("add-event-form");
    let dataTest = {
        "event" : jsForm.elements['event'].value,
        "date" : jsForm.elements['date'].value,
        "time" : jsForm.elements['time'].value
    };
    console.log(dataTest);
    
    $.ajax({
        type: "POST",
        url: actionUrl,
        data: dataTest,
        success: function(res)
        {
            // add to ul
            resetEventList();
            res.forEach(element => {
                console.log("cameeeee")
                let time = element['time'];
                let desc = element['event'];
                addToList(time, desc);
            });
            let date = jsForm.elements['date'].value;
            loadedEventRecords[date] = res;
            let td = document.getElementById(date);
            td.childNodes[1].style.display = "block";
        }
    });
    
});

function addToList(time, desc) {
    let li = document.createElement("li");
    let timeSpan = document.createElement("span");
    let descSpan = document.createElement("span");
    timeSpan.textContent = time;
    descSpan.textContent = desc;
    li.appendChild(timeSpan);
    li.appendChild(descSpan);
    li.classList.add("animate-event");
    displayList.appendChild(li);
    // arrange by timing
}

function getAllDaysInMonth(year, month) {
    const date = new Date(year, month, 1);

    const dates = [];

    while (date.getMonth() === month) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}

function addEventBtnListener() {
    let form = document.getElementById("add-event-form");
    addEventBtn.addEventListener('click', () => {
        if (addEventBtn.classList.contains("toggle-btn")) {
            addEventBtn.textContent = '+';
            addEventBtn.classList.remove("toggle-btn");
            form.classList.remove("show");
        } else {
            addEventBtn.classList.add("toggle-btn");
            addEventBtn.textContent = '-';
            form.classList.add("show");
        }
    })
    closeEventBtn.addEventListener('click', () => {
        let flipCardInner = document.getElementsByClassName("flip-card-inner");
        flipCardInner[0].style.transform = "rotateY(0deg)";
        form.classList.remove("show");
        addEventBtn.textContent = '+';
        addEventBtn.classList.remove("toggle-btn");
    })
}

function resetTable() {
    let tbody = document.getElementById("tbody");
    calendar.removeChild(tbody);
}

function resetEventList() {
    while (displayList.firstChild) {
        displayList.removeChild(displayList.firstChild);
    }
}

function getEvents(date) {
    // check if record has been saved in the array/session
    // else retrieve from json file.
    /**
     * bug todo:  if user added new event , instead of doing a
     * get request, update the local storage/array and add another
     * event to the list
     * */
    let actionUrl = "/events/" + date;
    $.ajax({
        type: "GET",
        url: actionUrl
    })
    .done((res) => {
        console.log("success", res);
        displayEventList(res, date);
    })
    .fail((res) => {
        // console.log("failed", res.responseText);
    })
    .always();
    
}

function loadEventsForTheDay(date, td) {
    // check if record has been saved in the array/session
    // else retrieve from json file.
    /**
     * bug todo:  if user added new event , instead of doing a
     * get request, update the local storage/array and add another
     * event to the list
     * */
    let actionUrl = "/events/" + date;
    $.ajax({
        type: "GET",
        url: actionUrl
    })
    .done((res) => {
        console.log("success", res);
        if(res != "no-events-for-the-date" || res != "no-events") {
            loadedEventRecords[date] = res;
            const children = td.childNodes;
            children[1].style.display = "block";
        }
        
    })
    .fail((res) => {
        // console.log("failed", res.responseText);
    })
    .always((res) => {
        return res;
    });
}

function displayEventList(eventList, date) {
    if(eventList == undefined) {return;}
    for(let i = 0; i < eventList.length; i++) {
        // let form = document.createElement("form");
        let li = document.createElement("li");
        let time = document.createElement("span");
        let event = document.createElement("span");
        let hidden = date;// add to the input:hidden
        time.textContent = eventList[i].time;
        event.textContent = eventList[i].event;
        li.appendChild(time);
        li.appendChild(event);
        li.classList.add = "event"
        displayList.appendChild(li);
    }
}

function createEventPage(td, date) {
    let txtContent = date.getDate() 
                        + monthText[date.getMonth()] 
                        + date.getFullYear();
    // load into object
    loadEventsForTheDay(txtContent, td)
    if(loadedEventRecords[txtContent] != undefined) {
        console.log("came in here");
        
    } else {
        console.log("huhhh")
    }
    // read from object
    td.addEventListener('click', () => {
        //retrieve events
        /**
         * 1. check if local have already load before this particular date's event
         *    [probs stored inside cache/session]
         *    - if stored before just retrieve the events from there using date as ID
         *    - if never, load from the json file/database then store inside the local
         */
        let flipCardInner = document.getElementsByClassName("flip-card-inner");
        flipCardInner[0].style.transform = "rotateY(180deg)";
        let dateHeader = document.getElementById("date-header");
        let formDate = document.getElementById("form-date");
        dateHeader.textContent = "Date: " + txtContent;
        formDate.value = txtContent;
        // refresh eventlist
        resetEventList();
        displayEventList(loadedEventRecords[txtContent], date);
    })
}

function loadMonthDays(date) {
    // reset table data
    // prob need to loop this part to get every single month
    // const currDate = new Date('2023-' + num);//'2023-05-24'
    // resetTable();
    // const currDate = date;//new Date(strDate);
    let datesArr = getAllDaysInMonth(date.getFullYear(), date.getMonth())
    let tbody = document.createElement("tbody");
    tbody.id = "tbody";
    let tr = document.createElement("tr");
    let firstDate = datesArr[0].getDay();
    let counter = 0;
    let currDateText = globalDate.getDate()+ "" + monthText[globalDate.getMonth()] + globalDate.getFullYear();
    //prepend prev month's dates if needed [FIRST ROW]
    for(let x = 0 ; x < firstDate; x++) {
        let td = document.createElement("td");
        tr.appendChild(td);
        counter ++; // keep track how many days are there in a row
    }
    for( let i = 0; i < datesArr.length; i++) {
        let currDate = datesArr[i];
        let dayNum = datesArr[i].getDay();
        let dateNum = datesArr[i].getDate();
        let td = document.createElement("td");
        let tdDate = datesArr[i].getDate()+ "" + monthText[datesArr[i].getMonth()] + datesArr[i].getFullYear();
        let tdSpan = document.createElement("span");
        let tdPara = document.createElement("p");
        tdPara.textContent = dateNum;
        tdSpan.classList.add("toggle-event-exist");
        td.appendChild(tdPara);
        td.appendChild(tdSpan);
        td.id = tdDate;
        if(currDateText == tdDate) {
            td.classList.add("active");
        }
        tr.appendChild(td);
        createEventPage(td, currDate);
        if(counter == 6) {
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            counter = 0;
        } else {
            if( i == datesArr.length - 1) {
                // append next month's first few dates if needed [LAST ROW]
                let remainingTD = 6 - dayNum;
                // if remainingTD = 0, means that the final row is empty
                // hence dont need to append a new row.
                if (remainingTD > 0) {
                    for(let z = 0; z < remainingTD; z++) {
                        td = document.createElement("td");
                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);
                }
                
            }
            counter ++;
        }
    }
    calendar.appendChild(tbody);
}

function addPrevNextListeners() {
    // if previous month < current Month [prev month is already over] 
    // dont load the days of the prev months
    // else if previous month have not passed, 
    // load the days of the prev months
    // allow user to add events
    let date = new Date();
    let currYear = date.getFullYear();
    prev.addEventListener('click', () => {
        resetTable();
        let mth = date.getMonth();
        if(mth < 1) {
            console.log("came in here");
            currYear -= 1;
            mth = 12;
            year.textContent = currYear;
        }
        date = new Date(currYear + '-' + mth);
        month.textContent = monthText[mth -1];
        loadMonthDays(date);
    })
    next.addEventListener('click', () => {
        resetTable();
        let mth = date.getMonth() + 2;
        if(mth > 12) {
            currYear += 1;
            mth = 1;
            year.textContent = currYear;
        }
        date = new Date(currYear + '-' + mth);
        month.textContent = monthText[mth-1];
        loadMonthDays(date);
    })
}