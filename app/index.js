import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { today } from 'user-activity';
import { battery } from "power";


// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const myTime = document.getElementById("myTime");
const myDate = document.getElementById("myDate");
const myHeartText = document.getElementById("myHeartText");
const myStepsText = document.getElementById("myStepsText"); 
const myFloorsText = document.getElementById("myFloorsText");
const myBatteryText = document.getElementById("myBatteryText");

const _days = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT'
};

const _months = {
  0: 'JAN',
  1: 'FEB',
  2: 'MAR',
  3: 'APR',
  4: 'MAY',
  5: 'JUN',
  6: 'JUL',
  7: 'AUG',
  8: 'SEP',
  9: 'OCT',
  10: 'NOV',
  11: 'DEC'
}

// Set the steps on first load
myStepsText.text = today.adjusted.steps;
myFloorsText.text = today.adjusted.elevationGain;
myBatteryText.text = Math.floor(battery.chargeLevel) + "%";

// Update the steps each time the screen comes on
display.onchange = function() {
  if (display.on) {
    myStepsText.text = today.adjusted.steps;
    myFloorsText.text = today.adjusted.elevationGain;
    myBatteryText.text = Math.floor(battery.chargeLevel) + "%";
  }
}

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {  

  let today = evt.date;
  let hours = today.getHours();
  
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  myTime.text = `${hours}:${mins}`; 
  myDate.text = `${_days[today.getDay()]}, ${today.getDate()} ${_months[today.getMonth()]}`;
}

if (HeartRateSensor) {
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    myHeartText.text = `${hrm.heartRate}`;
  });
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? hrm.start() : hrm.stop();
  });
  hrm.start();
}
