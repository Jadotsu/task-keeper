const addButton = document.getElementById("input-button");
const addText = document.getElementById("input-text");
const listDiv = document.getElementById("list");
const notesText = document.getElementById("notes-input");
const returnButton = document.getElementById("return-button");

const colorA = document.getElementById("color-a");
const colorB = document.getElementById("color-b");

const backgroundColor = ["#3E2476","#FC0F00"];

if (localStorage.getItem("backgroundColorA")){
    backgroundColor[0]=localStorage.getItem("backgroundColorA");
    backgroundColor[1]=localStorage.getItem("backgroundColorB");
    colorA.value = rgb2hex(backgroundColor[0]);
    colorB.value = rgb2hex(backgroundColor[1]);
}

function saveSort(){

}


const input = document.querySelector('input');

ColorUpdate();

colorA.oninput = function (e){
    ColorChange(this.jscolor,"0");
};

colorB.oninput = function (e){
    ColorChange(this.jscolor,"1");
}

function ColorChange(color,side){
    backgroundColor[side] = color.toRGBString();
    localStorage.setItem("backgroundColorA",backgroundColor[0]);
    localStorage.setItem("backgroundColorB",backgroundColor[1]);
    ColorUpdate();
}

function ColorUpdate(){
    let colorHover = $("#container");
    colorHover.css("--colorA",backgroundColor[0]);
    colorHover.css("--colorB",backgroundColor[1]);
}

document.getElementById("change-colors").addEventListener("click",function(e){
    document.getElementById("change-colors-div").classList.toggle("menu-hide");
    if (document.getElementById("change-colors-div").classList.contains("menu-hide")){
        document.getElementById("change-colors").innerHTML = "> Change Colors";
    } else {
        document.getElementById("change-colors").innerHTML = "v Change Colors";
    }
},false);

document.getElementById("menu-button").addEventListener("click",function(e){
    if (document.getElementById("menu-back").classList.contains("menu-hide")){
        document.getElementById("menu-back").classList.toggle("menu-hide")
    } else {
        CloseMenu();
    }
},false);

document.getElementById("change-name").addEventListener("click",function(e){
    document.getElementById("name-input-div").classList.toggle("menu-hide");
    if (!document.getElementById("name-input-div").classList.contains("menu-hide")){
        document.getElementById("name-input-text").focus();
        document.getElementById("change-name").innerHTML = "v Change Name";
    } else {
        document.getElementById("change-name").innerHTML = "> Change Name";
    }
},false);

document.getElementById("reset-all").addEventListener("click",function(e){
    document.getElementById("reset-all-div").classList.toggle("menu-hide");
    if (!document.getElementById("reset-all-div").classList.contains("menu-hide")){
        document.getElementById("reset-all").innerHTML = "v Reset Data";
    } else {
        document.getElementById("reset-all").innerHTML = "> Reset Data";
    }
},false);


document.getElementById("name-input-button").addEventListener("click",function (e){
    const newName = document.getElementById("name-input-text").value;
    if (newName !== ''){
        UpdateName(newName);
        document.getElementById("menu-back").classList.toggle("menu-hide");
    }
},false);

document.getElementById("name-input-text").addEventListener("keypress",function (e){
    if (e.key === "Enter") {
        const newName = document.getElementById("name-input-text").value;
        if (newName !== '') {
            UpdateName(newName);
            CloseMenu();
        }
    }
},false);

document.getElementById("reset-all-button").addEventListener("click",function (e){
    localStorage.clear();
    activeTask = 0;
    location.reload();
},false);

function CloseMenu(){
    document.getElementById("reset-all-div").classList.toggle("menu-hide",true);
    document.getElementById("change-colors-div").classList.toggle("menu-hide",true);
    document.getElementById("name-input-div").classList.toggle("menu-hide",true);
    document.getElementById("menu-back").classList.toggle("menu-hide",true);
    document.getElementById("change-name").innerHTML = "> Change Name";
    document.getElementById("change-colors").innerHTML = "> Change Colors";
    document.getElementById("reset-all").innerHTML = "> Reset Data";
}

function UpdateName(name){
    document.getElementById("name-input-text").value = '';
    userName = name;
    localStorage.setItem("UserName",name);
    if (activeTask == 0) {
        document.querySelector("#title").innerHTML = userName + "'s Tasks";
        const txt = document.querySelector("#title");
        const nWidth = textWidth(txt.innerHTML,"30px");
        txt.style.fontSize = clamp(30*200/nWidth,11.5,30)+"px";
    }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

let UID = 1;
let userName = "";
let tasks = {};
let homeNotes = "~Change settings with ☰\n" +
    "~Move tasks with ⬍\n" +
    "~Check off a task with ◯\n" +
    "~Open by clicking the text.\n" +
    "~Delete a task with ×\n" +
    "~Your info is stored locally!";
let activeTask = 0;
let firstLoad = 0;


LoadData();

if (tasks !== null) {
    for (const [i, t] of Object.entries(tasks)) {
        if(t.PID == activeTask) {
            BuildTask(t);
        }
    }
} else {
    tasks = {};
}

Sortable.create(document.getElementById("list"),{
    animation:150,
    handle:".handle",
    ghostClass:'ghost-class',
    store: {
        // Sorting acquisition (called during initialization)
        get: function (sortable) {
            console.log("get");
            let order = localStorage.getItem("order"+activeTask);
            return order ? order.split('|') : [];
        },

        // Saving the acquired sorting (called each time upon sorting modification)
        set: function (sortable) {
            console.log("set");
            let order = sortable.toArray();
            localStorage.setItem("order"+activeTask, order.join('|'));
        }
    }
});



function FolderCheck(id){
    let childCount = 0;
    let childCompleted = 0;
    for (const [i, t] of Object.entries(tasks)) {
        if (t.PID === id){
            childCount++;
            if (t.checked){
                childCompleted++;
            }
        }
    }
    if (childCount === 0){
        tasks[id].folder = false;
    } else {
        tasks[id].folder = true;
        if (childCompleted === childCount){
            tasks[id].checked = true;
        } else {
            tasks[id].checked = false;
        }
        if (tasks[id].PID != 0){
            FolderCheck(tasks[id].PID);
        }
    }
    SaveData();
}

returnButton.addEventListener("click",function(e){
    if (activeTask != 0) {
        OpenTask(tasks[activeTask].PID);
    }
});

addButton.addEventListener("click",function(e){
    AddTask(addText.value);
},false);
addText.addEventListener("keypress",function(e){
    if (e.key==="Enter"){
        AddTask(addText.value);
    }
}, false);

addText.addEventListener("paste",function(e){
    const pasted = (event.clipboardData || window.clipboardData).getData("text");
    const split = pasted.split(/\r?\n/);
    if (split.length > 1){
        split.forEach(e => {
            AddTask(e);
            setTimeout(function(){
                addText.value = '';
            });
        });
    }
}, false);

notesText.addEventListener("input",function(e){
    SaveNote();
}, false);

function AddTask(text){
    if(text !== ''){
        let task = {
            Task:sanitize(text),
            Notes:"",
            ID:UID++,
            checked:false,
            folder:false,
            PID:activeTask,
        }
        tasks[task.ID]=task;
        if (activeTask != 0){
            FolderCheck(activeTask);
        }
        BuildTask(task);
        addText.value = '';
        SaveData();
    }
}

function BuildTask(task){
    let li = document.createElement("div");
    li.classList.add("task")
    li.classList.add("list-group-item");
    li.id = task.ID;
    li.innerHTML = "<div class=\"handle\"><p>⬍&nbsp;</p></div>" +
        "<div class=\"taskBounds\">\n" +
        "<button class=\"taskImage\"><p>☰</p></button>\n" +
        "<div class=\"taskTextContainer\"><div class=\"taskText\">"+task.Task+"</div></div>\n" +
        "</div>\n" +
        "<button class=\"taskDelete\">×</button>";
    listDiv.appendChild(li);
    let deleteButton = li.querySelector(".taskDelete");
    deleteButton.addEventListener("click",function(e){
        DeleteTask(task.ID);
        if (activeTask != 0) {
            FolderCheck(activeTask);
        }
    },false);

    let openButton = li.querySelector(".taskOpen");

    if (task.checked){
        li.classList.add("checked");
    }
    if (task.folder){
        li.classList.add("folder");
        deleteButton.style.width = "0";
        deleteButton.style.fontSize = "0";
    } else {
        deleteButton.style.width = "24px";
        deleteButton.style.fontSize = "20px";
    }
    let checkClick = li.querySelector(".taskImage");
    checkClick.addEventListener("click", function(e){
        if (task.folder){
            OpenTask(task.ID);
        } else {
            checkClick.parentElement.parentElement.classList.toggle("checked");
            task.checked = !task.checked;
            if (activeTask != 0) {
                FolderCheck(activeTask);
            }
            SaveData();
        }
    }, false);

    let taskText = li.querySelector(".taskTextContainer");
    taskText.addEventListener("click", function(e){
        OpenTask(task.ID);
    }, false);


    const txt =  li.querySelector(".taskText");
    const nWidth = textWidth(task.Task,"20px");
    txt.style.fontSize = clamp(20*190/nWidth,16,20)+"px";
}

function DeleteTask(taskID) {
    let li = document.getElementById(taskID);
    li.remove();
    if (activeTask != 0) {
        FolderCheck(activeTask);
    }
    delete tasks[taskID];
    SaveData();
}

function OpenTask(taskID) {
    SaveData();
    activeTask = taskID;
    localStorage.setItem("ActiveTask",taskID);
    location.reload();
}


function SaveNote(){
    if (activeTask == 0){
        homeNotes = notesText.value;
        localStorage.setItem("HomeNotes",homeNotes);
    } else {
        tasks[activeTask].Notes = notesText.value;
    }
}

function SaveData(){
    SaveNote();
    localStorage.setItem("TaskList",JSON.stringify(tasks));
    localStorage.setItem("lastUID",UID.toString());
    localStorage.setItem("UserName",userName);
    localStorage.setItem("ActiveTask",activeTask);
}

function LoadData() {
    if(localStorage.getItem("UserName")) {
        tasks = JSON.parse(localStorage.getItem("TaskList")) || tasks;
        UID = localStorage.getItem("lastUID") || UID;
        userName = localStorage.getItem("UserName") || userName;
        if (localStorage.getItem("HomeNotes") !== null){
            homeNotes = localStorage.getItem("HomeNotes");
        }
        activeTask = localStorage.getItem("ActiveTask") || activeTask;
        if (activeTask == 0) {
            returnButton.classList.toggle("hide",true);
            document.querySelector("#title").innerHTML = userName + "'s Tasks";
            notesText.value = homeNotes;
        } else {
            returnButton.classList.toggle("hide",false);
            document.querySelector("#title").innerHTML = tasks[activeTask].Task;
            notesText.value = tasks[activeTask].Notes;
        }
        const txt = document.querySelector("#title");
        const nWidth = textWidth(txt.innerHTML,"30px");
        txt.style.fontSize = clamp(30*200/nWidth,11.5,30)+"px";
    } else {
        window.location = "./new.html";
    }
}


function sanitize(string) {
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function textWidth(text,fontSize){
    let html = $('<span style="position:absolute;width:auto;left:-9999px">'+text+'</span>');
    html.css("font-size",fontSize);
    html.css("font-family",addText.style.fontFamily);
    $('body').append(html);
    let width = html.width();
    html.remove();
    return width;
}

function rgb2hex(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}
$("#container").css("opacity",1);
$("#container").css("transition","--colorA 240ms ease, --colorB 240ms ease");