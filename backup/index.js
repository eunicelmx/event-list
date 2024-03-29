let date = new Date();
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

console.log(date);

// test[0].addEventListener('click', () => {
//     console.log("heelll")
// })

// date.getmonth() starts from 0[jan] to 11[dec]
/** Default settings */
month.textContent = date.getMonth() + 1;
year.textContent = date.getFullYear();
loadMonthDays(date)
addNextListener();
addEventBtnListener();
// this is the id of the form
$("#add-event-form").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

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
        data: dataTest, // serializes the form's elements.
        // data: form.serialize(), // serializes the form's elements.
        // contentType: "application/json",
        success: function(data)
        {
            // add to ul
            let time = jsForm.elements['time'].value;
            let desc = jsForm.elements['event'].value;
            addToList(time, desc);
            console.log("success",data);
        //   alert(data); // show response from the php script.
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
    addEventBtn.addEventListener('click', () => {
        let form = document.getElementById("add-event-form");
        form.classList.add("show");
    })
    closeEventBtn.addEventListener('click', () => {
        console.log("fsdfsdfsdf");
        let flipCardInner = document.getElementsByClassName("flip-card-inner");
        flipCardInner[0].style.transform = "rotateY(0deg)";
    })
}

function resetTable() {
    let tbody = document.getElementById("tbody");
    calendar.removeChild(tbody);
    // calendar.reset();
    // calendar = calendarCopy;
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
    // displayEventList(loadedEventRecords[date], date);
    let actionUrl = "/events/" + date;
    // let response = [];
    $.ajax({
        type: "GET",
        url: actionUrl
    })
    .done((res) => {
        console.log("success", res);
        displayEventList(res, date);
    })
    .fail((res) => {
        console.log("failed", res.responseText);
    })
    .always();
    
}

function loadEventsForTheDay(date) {
    // check if record has been saved in the array/session
    // else retrieve from json file.
    /**
     * bug todo:  if user added new event , instead of doing a
     * get request, update the local storage/array and add another
     * event to the list
     * */
    let actionUrl = "/events/" + date;
    // let response = [];
    return $.ajax({
        type: "GET",
        url: actionUrl
    })
    .done((res) => {
        // console.log("success", res);
        return res;
        // loadedEventRecords[date] = res;
        // displayEventList(res, date);
    })
    .fail((res) => {
        // console.log("failed", res.responseText);
    })
    .always((res) => {
        // console.log("always", res)
        return res;
    });
    // loadedEventRecords[date] = await response;
    
}

function displayEventList(eventList, date) {
    for(let i = 0; i < eventList.length; i++) {
        // let form = document.createElement("form");
        let li = document.createElement("li");
        let time = document.createElement("span");
        let event = document.createElement("span");
        let hidden = date;// add to the input:hidden
        // let addEventBtn = document.createElement("btn")
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
    loadEventsForTheDay(txtContent).then((res) => {
        console.log("response after", res);
        loadedEventRecords[txtContent] = res;
        console.log("testing", loadedEventRecords);

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
    });
    
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
    console.log(firstDate);
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
        td.textContent = dateNum;
        tr.appendChild(td);
        createEventPage(td, currDate);
        // console.log(datesArr[i].getDate(),dayNum, days[dayNum], td);
        if(counter == 6) {
            // calendar.appendChild(tr);
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
                    // calendar.appendChild(tr);
                    tbody.appendChild(tr);
                }
                
            }
            counter ++;
        }
    }
    calendar.appendChild(tbody);
}

function addPrevListener() {
    // if previous month < current Month [prev month is already over] 
    // dont load the days of the prev months
    // else if previous month have not passed, 
    // load the days of the prev months
    // allow user to add events
    prev.addEventListener('click', () => {

    })
}

function addNextListener() {
    next.addEventListener('click', () => {
        resetTable();

        let mth = date.getMonth() + 2;
        date = new Date('2023-' + mth);
        console.log(date)
        month.textContent = mth;
        loadMonthDays(date);
    })
}

// // prob need to loop this part to get every single month
// const currDate = new Date();//'2023-05-24'
// let datesArr = getAllDaysInMonth(currDate.getFullYear(), currDate.getMonth())
// let tr = document.createElement("tr");
// let firstDate = datesArr[0].getDay();
// let counter = 0;
// //prepend prev month's dates if needed [FIRST ROW]
// for(let x = 0 ; x < firstDate; x++) {
//     let td = document.createElement("td");
//     tr.appendChild(td);
//     counter ++; // keep track how many days are there in a row
// }
// for( let i = 0; i < datesArr.length; i++) {
//     let dayNum = datesArr[i].getDay();
//     let dateNum = datesArr[i].getDate();
//     let td = document.createElement("td");
//     td.textContent = dateNum;
//     tr.appendChild(td);
//     console.log(datesArr[i].getDate(),dayNum, days[dayNum], td);
//     if(counter == 6) {
//         calendar.appendChild(tr);
//         tr = document.createElement("tr");
//         counter = 0;
//     } else {
//         if( i == datesArr.length - 1) {
//             // append next month's first few dates if needed [LAST ROW]
//             let remainingTD = 6 - dayNum;
//             // if remainingTD = 0, means that the final row is empty
//             // hence dont need to append a new row.
//             if (remainingTD > 0) {
//                 for(let z = 0; z < remainingTD; z++) {
//                     td = document.createElement("td");
//                     tr.appendChild(td);
//                 }
//                 calendar.appendChild(tr);
//             }
            
//         }
//         counter ++;
//     }
// }



// 👇️ All days in March 2022
// console.log(getAllDaysInMonth(datet.getFullYear(), datet.getMonth()));