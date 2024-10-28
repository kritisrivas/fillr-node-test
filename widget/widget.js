'use strict'
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.
function execute() {
	try {
    // Step 1 Scrape Fields and Create Fields list object.
    // Step 2 Add Listener for Top Frame to Receive Fields.
    if (isTopFrame()) {
      //create object to collect data
      let collectedFields = {}; 
      //collect top frame data
      let topFrameData = {};
      document.querySelectorAll("input[name]").forEach((element)=>{
        const label = document.querySelector(`label[for="${element.id}"]`);
        topFrameData[element.name] = label.innerText;
      })
      collectedFields = {...collectedFields, ...topFrameData}
      
      window.addEventListener('message', (event) => {
        // - Merge fields from frames.
        if (event.data && event.data.type === "fields") {
          console.log(event.data.fields);
          collectedFields = {...collectedFields, ...event.data.fields};
        }
        // console.log(collectedFields);
        // - Process Fields and send event once all fields are collected.
        //create event "frames:loaded" and send collected Fields
        const framesLoadedEvent = new CustomEvent("frames:loaded", {
          detail: {
            fields: collectedFields
          }
        })
        document.dispatchEvent(framesLoadedEvent);
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
      //collect both child frames data depending on loaded iframe's path
      let childFrameData = {};
      document.querySelectorAll("input[name], select[name]").forEach((element)=>{
        const label = document.querySelector(`label[for="${element.id}"]`);
        childFrameData[element.name] = label.innerText;
      })
      if(window.location.pathname.includes("address.html")){
        window.parent.postMessage({ type: 'fields', fields: childFrameData }, '*');
      }
      if(window.location.pathname.includes("payment.html")){
        window.parent.parent.postMessage({ type: 'fields', fields: childFrameData }, '*');
      }
    }
	} catch (e) {
		console.error(e)
	}
}

execute();

// Utility functions to check and get the top frame
// as Karma test framework changes top & context frames.
// Use this instead of "window.top".
function getTopFrame() {
  return window.top.frames[0];
}

function isTopFrame() {
  return window.location.pathname == '/context.html';
}