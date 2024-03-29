let globalDate = new Date();
let days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
let monthText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let month = document.getElementById("curr-month");
let year = document.getElementById("curr-year");
let currentDate = document.getElementById("curr-date");
let calendar = document.getElementById("calendar-dates");
let addEventBtn = document.getElementById("add-event-btn");
let prev = document.getElementById("prev");
let next = document.getElementById("next");
let displayList = document.getElementById("event-lists");
let closeEventBtn = document.getElementById("close-event-btn");
let formDate = document.getElementById("form-date");
let dateHeader = document.getElementById("date-header");
let currDateText = globalDate.getDate()+ "" + monthText[globalDate.getMonth()] + globalDate.getFullYear();
let flipped = false;
let change = false;
let selectedTD;
let bigWordContainer = document.getElementById("big-word");
// let the month be the key
let loadedEventRecords = {};

/** Default settings */
loadMonthDays(globalDate);

defaultSettings();
addPrevNextListeners();
addEventBtnListener();

addCurrentDateListener();

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
            let date = jsForm.elements['date'].value;
            resetEventList();
            loadedEventRecords[date] = res;
            displayEventList(loadedEventRecords[date], date)
            // res.forEach(element => {
            //     console.log("cameeeee")
            //     let time = element['time'];
            //     let desc = element['event'];
            //     addToList(time, desc);
            // });
            // loadedEventRecords[date] = res;
            let td = document.getElementById(date);
            td.childNodes[1].classList.add("toggle-event-exist");
            // td.childNodes[1].style.display = "block";
        }
    });
    
});

function windowResizer() {
    let flipCardInner = document.getElementsByClassName("flip-card-inner");
    if(window.innerWidth >= 800) {
        flipCardInner[0].style.transform = "rotateY(-0deg)";
        // flipped = false;
    } else {
        flipCardInner[0].style.transform = "rotateY(180deg)";

    }
}

function setWordClass(item) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(item.classList.add("light-up"));
        }, 1000);

    }, (reject) => {

    }).then(()=> {
        // console.log("indiv")
    })
}

async function animateWord() {
    let wordSpan = document.getElementsByClassName("animate-word");
    let i = 0;
    for(i; i < wordSpan.length; i++) {
        // console.log("check index", i)
        await setWordClass(wordSpan[i]).then(()=>{
            if (change) {
                wordSpan = document.getElementsByClassName("animate-word");
                i = -1;// console log i if confused
                change = false;
            }
        })
    }   
    
}
function animateTest() {
    let wordSpan = document.getElementsByClassName("animate-word");
    return new Promise((resolve) => {
        resolve(animateWord());
    }, (reject) => {

    }).then(()=> {
        setTimeout(() => {
            for(let x = 0; x<wordSpan.length; x++) {
                wordSpan[x].classList.remove("light-up");
            }
            animateTest()

        }, 1000)
        
    })
    
}

function appendWord(day) {
    let dayArr = day.substr(0, day.length);
    for(let i = 0; i < dayArr.length; i++) {
        let wordSpan = document.createElement("span");
        wordSpan.textContent = dayArr[i];
        // wordSpan.style = "--i:" + i + ";";
        wordSpan.classList.add("animate-word");
        bigWordContainer.appendChild(wordSpan);
    }
}

function defaultSettings() {
    month.textContent = monthText[globalDate.getMonth()];
    year.textContent = globalDate.getFullYear();
    dateHeader.textContent = "Date:" + currDateText;
    appendWord(days[globalDate.getDay()]);
    formDate.value = currDateText;
    window.onresize = windowResizer;
    selectedTD = document.getElementById(currDateText)
    // addCurrentDateListener();
    animateTest()
}

function resetDay() {
    while (bigWordContainer.firstChild) {
        bigWordContainer.removeChild(bigWordContainer.firstChild);
    }
}

/**TODEL: might delete this */
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
        //TODO unselect
        resetDay()
        resetEventList()
        change = true;
        appendWord(days[globalDate.getDay()]);
        displayEventList(loadedEventRecords[currDateText], currDateText);
        let flipCardInner = document.getElementsByClassName("flip-card-inner");
        flipCardInner[0].style.transform = "rotateY(0deg)";
        form.classList.remove("show");
        addEventBtn.textContent = '+';
        addEventBtn.classList.remove("toggle-btn");
        selectedTD.classList.remove("selected");
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

function loadEventsForTheDay(date) {
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
        if(res != "no-events-for-the-date" && res != "no-events") {
            loadedEventRecords[date] = res;
            if(date == currDateText) {
                displayEventList(loadedEventRecords[date], date);
            }
            if(res.length > 0) {
                let td = document.getElementById(date);
                const children = td.childNodes;
                children[1].classList.add("toggle-event-exist")
                // children[1].style.display = "block";
            }
            
        } else {
            console.log("hello world", date)
        }
        
    })
    .fail((res) => {
        console.log("failed", res.responseText);
    })
    .always((res) => {
        return res;
    });
}

function performDelete(idx, date) {
    let actionUrl = "/delete/" + idx;
    let dataObj = {
        "date": date
    }
    $.ajax({
        type: "POST",
        url: actionUrl,
        data: dataObj,
        success: function(res)
        {
            // add to ul
            resetEventList();
            console.log("resde", res, res.length);
            loadedEventRecords[date] = res;
            displayEventList(loadedEventRecords[date], date)
            if(res.length == 0) {
                let td = document.getElementById(date);
                const children = td.childNodes;
                console.log("eunic", date, children[1])

                children[1].classList.remove("toggle-event-exist");
            }
            // res.forEach(element => {
            //     console.log("cameeeee")
            //     let time = element['time'];
            //     let desc = element['event'];
            //     addToList(time, desc);
            // });
            // let date = jsForm.elements['date'].value;
            // let td = document.getElementById(date);
            // td.childNodes[1].style.display = "block";
        }
    });
} 

function addEditDeleteBtnListener(idx, date, form) {
    let editBtns = document.getElementsByClassName("edit");
    let deleteBtns = document.getElementsByClassName("delete");
    let editForms = document.getElementsByClassName("update-event-form");

    // for(let i = 0; i<editBtns.length; i++) {
        editBtns[idx].addEventListener("click", ()=> {
            // show form
            editForms[idx].classList.remove("hide");
            performUpdate(form);
        })
        deleteBtns[idx].addEventListener("click", () => {
            // send request to server to delete specific record
            performDelete(idx, date);
        })
    // }
}

function performUpdate(form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        var actionUrl = form.action;
        let dataObj = {
            "event" : form.elements['event'].value,
            "date" : form.elements['date'].value,
            "time" : form.elements['time'].value
        };
        console.log(dataObj);
        
        $.ajax({
            type: "POST",
            url: actionUrl,
            data: dataObj,
            success: function(res)
            {
                // add to ul
                let date = form.elements['date'].value;
                resetEventList();
                loadedEventRecords[date] = res;
                displayEventList(loadedEventRecords[date], date)
                form.classList.add("hide")
            }
        });
    })
}

function createUpdateForm(idx, singleEvent, date) {
    // Create a form dynamically
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/update/" + idx);

    // Create an input element for time
    var formTime = document.createElement("input");
    formTime.setAttribute("type", "time");
    formTime.setAttribute("name", "time");
    formTime.setAttribute("value", singleEvent.time);

    // Create an input element for event name
    var formEvent = document.createElement("input");
    formEvent.setAttribute("type", "text");
    formEvent.setAttribute("name", "event");
    formEvent.setAttribute("value", singleEvent.event);
    formEvent.setAttribute("placeholder", "What's the event?");

    // Create an input element for event name
    var hidden = document.createElement("input");
    hidden.setAttribute("type", "hidden");
    hidden.setAttribute("name", "date");
    hidden.setAttribute("value", date);

    // create a submit button
    var submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("name", "submit");
    submit.setAttribute("value", "Submit");

    // create reset btn
    var reset = document.createElement("input");
    reset.setAttribute("type", "reset");
    reset.setAttribute("name", "reset");
    reset.setAttribute("value", "Reset");

    form.classList.add("update-event-form", "hide");
    form.appendChild(formTime);
    form.appendChild(formEvent);
    form.appendChild(hidden);
    form.appendChild(submit);
    form.appendChild(reset);

    return form;
}

function displayEventList(eventList, date) {
    if(eventList == undefined) {return;}
    resetEventList()
    dateHeader.textContent = date;
    for(let i = 0; i < eventList.length; i++) {
        console.log("euniceee")
        let form = createUpdateForm(i, eventList[i], date)

        let li = document.createElement("li");
        let time = document.createElement("span");
        let event = document.createElement("span");
        let editIcon = document.createElement("span");
        let delIcon = document.createElement("span");
        // let hidden = date;// add to the input:hidden
        
        time.textContent = eventList[i].time;
        event.textContent = eventList[i].event;
        editIcon.textContent = "edit"
        delIcon.textContent = "del"

        editIcon.classList.add("edit", "icons", "hide");
        delIcon.classList.add("delete", "icons", "hide");
        li.appendChild(time);
        li.appendChild(event);
        li.appendChild(editIcon);
        li.appendChild(delIcon);
        li.appendChild(form);
        li.classList.add("event")
        li.addEventListener("mouseover", (e) => {
            editIcon.classList.remove("hide");
            delIcon.classList.remove("hide");
        })
        li.addEventListener("mouseleave", (e) => {
            editIcon.classList.add("hide");
            delIcon.classList.add("hide");
        })
        li.classList.add("animate-event")
        displayList.appendChild(li);
        addEditDeleteBtnListener(i, date, form);
    }
}

function createEventPage(td, date) {
    let txtContent = date.getDate() 
                        + monthText[date.getMonth()] 
                        + date.getFullYear();
    // load into object
    loadEventsForTheDay(txtContent)
    // read from object
    td.addEventListener('click', () => {
        //retrieve events
        /**
         * 1. check if local have already load before this particular date's event
         *    [probs stored inside cache/session]
         *    - if stored before just retrieve the events from there using date as ID
         *    - if never, load from the json file/database then store inside the local
         */
        selectedTD.classList.remove("selected");// remove previous selectedTD
        selectedTD = td;
        if(!td.classList.contains("active")) {
            td.classList.add("selected");
        }
        resetDay();
        change = true;
        appendWord(days[date.getDay()]);
        // animateWord()

        flipped = true;
        if(window.innerWidth < 800) {
            let flipCardInner = document.getElementsByClassName("flip-card-inner");
            flipCardInner[0].style.transform = "rotateY(180deg)";
        }
        // let flipCardInner = document.getElementsByClassName("flip-card-inner");
        // flipCardInner[0].style.transform = "rotateY(180deg)";
        let dateHeader = document.getElementById("date-header");
        let formDate = document.getElementById("form-date");
        dateHeader.textContent = "Date: " + txtContent;
        formDate.value = txtContent;
        // refresh eventlist
        resetEventList();
        displayEventList(loadedEventRecords[txtContent], txtContent);
    })
}

function loadMonthDays(date) {
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
        // tdSpan.classList.add("toggle-event-exist", "hide");
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
    //TODO: deafultsettings?
    currentDate.addEventListener("click", () => {
        console.log("globalmonth", globalDate.getMonth())
        let currYear = globalDate.getFullYear();
        let mth = globalDate.getMonth() + 1;
        resetTable();
        resetEventList();
        date = new Date(currYear + '-' + mth);
        year.textContent = currYear;
        month.textContent = monthText[mth - 1];
        loadMonthDays(date)
    })
}


function addCurrentDateListener() {
    let date = new Date();
    let currYear = globalDate.getFullYear();
    currentDate.addEventListener("click", () => {
        console.log("came in here")
        // resetDay();
        // defaultSettings();
        resetTable();
        let mth = globalDate.getMonth();
        date = new Date(currYear + '-' + mth);
        year.textContent = currYear;
        month.textContent = monthText[mth -1];
        loadMonthDays(date)
    })
}