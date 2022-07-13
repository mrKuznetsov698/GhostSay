let recorder;
let data;
let status_div;
let lbl;
let busy;

function init_microphone(){
    navigator.mediaDevices.getUserMedia({'audio': true})
    .then(s => {
        recorder = new MediaRecorder(s);
        recorder.ondataavailable = function (ev) {
            console.log(ev.data);
            data = ev.data;
        }
    })
}

function init_polling() {
    document.xml = new XMLHttpRequest()
    document.xml.onload = () => {
        lbl.innerHTML = `Status: ${document.xml.responseText}`;
        busy = document.xml.responseText === 'Busy';
        status_div.style.backgroundColor = busy ? '#ff0000' : "#00ff00";
    }
    setInterval(function () {
        document.xml.open('GET', '/getStatus');
        document.xml.send();
    }, 2000);
}

function init_variables() {
    status_div = document.getElementById('indicator');
    lbl = document.getElementById('status');
}

function init() {
    init_microphone();
    init_variables();
    init_polling();
}

function startRecord() {
    console.log('Start recording...')
    try {
        recorder.start();
    }
    catch (ex){
        // if (ex instanceof navigator.mediaDevices.)
        new Toast({
            title: "Error",
            text: ex,
            theme: 'danger',
            autohide: true,
            interval: 15000
        })
    }
    new Toast({
        title: "Information",
        text: "Recording start",
        theme: 'info',
        autohide: true,
        interval: 10000
    })
}
function stopRecord() {
    console.log('Recording stop.')
    recorder.stop();
    new Toast({
        title: "Information",
        text: "Recording stop",
        theme: 'info',
        autohide: true,
        interval: 10000
    })
}

function playRecorded() {
    if (!data) {
        new Toast({
            title: "Warning",
            text: "You can't play recorded, before recording",
            theme: 'warning',
            autohide: true,
            interval: 10000
        })
        return;
    }
    console.log('Play recorded...')
    new Toast({
        title: "Information",
        text: "Play recorded",
        theme: 'info',
        autohide: true,
        interval: 10000
    })
    let au = new Audio();
    au.src = URL.createObjectURL(data);
    au.play();
}

function sendRecord() {
    if (!data || busy)
        return;
    console.log('Sending recorded...')
    new Toast({
        title: "Information",
        text: "Send recorded",
        theme: 'info',
        autohide: true,
        interval: 10000
    })
    let reader = new FileReader();
    reader.onload = function (ev) {
        let xml = new XMLHttpRequest();
        xml.open('POST', '/data');
        xml.send(btoa(ev.target.result));
        console.log('Sending complete')
    }
    reader.readAsBinaryString(data);
}

function form_sub(form) {
    if (busy) {
        new Toast({
            title: "Warning",
            text: "You can't send file, while playing another music",
            theme: 'warning',
            autohide: true,
            interval: 10000
        })
        return false;
    }
    console.log('Sending file...');
}