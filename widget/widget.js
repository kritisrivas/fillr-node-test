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
      const topIframe = getTopFrame();
      if (topIframe) {
        topIframe.addEventListener("load", () => {
          try {
            const topFrame = topIframe.document;
            topFrameData = collectFieldsFromFrame(topFrame);
            collectedFields = { ...collectedFields, ...topFrameData };
          }
          catch(error){
            console.log("error")
          }
        });
      }
      
      window.addEventListener('message', (event) => {
        // - Merge fields from frames.
        if (event.data && event.data.type === "fields") {
          collectedFields = {...collectedFields, ...event.data.fields};
        }
        // - Process Fields and send event once all fields are collected.
        const sortedObj = Object.fromEntries(Object.entries(collectedFields).sort())
        const sortedCollectedData = Object.entries(sortedObj).map(([key, value]) => ({ [key]: value })) 
        //create event "frames:loaded" and send collected Fields
        const framesLoadedEvent = new CustomEvent("frames:loaded", {
          detail: {
            fields: sortedCollectedData
          }
        })
        document.dispatchEvent(framesLoadedEvent);
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
      
      //collect both child frames data together as they are nested.
      let childFrameData = {};
      childFrameData = collectFieldsFromFrame(document);

      const nestedIframe = document.querySelector("iframe");
      if (nestedIframe) {
        //check if nested iframe is loaded
        nestedIframe.addEventListener("load", () => {
          try{
            const nestedDocument = nestedIframe.contentWindow.document;
            let nestedFormData = {};
            // collect the form fields from the nested iframe
            nestedFormData = collectFieldsFromFrame(nestedDocument)
            const combinedData = { ...childFrameData, ...nestedFormData };
            //send combined fields to top frame
            window.parent.postMessage(
            { type: "fields", fields: combinedData },
            "*"
            );
          } catch (error) {
            console.error("Error accessing nested iframe:", error);
          }
        });
        
      }
    }
	} catch (e) {
		console.error(e)
	}
}

function collectFieldsFromFrame(frameDoc){
  let frameData = {};
  frameDoc
  .querySelectorAll("input[name], select[name]")
  .forEach((element) => {
    const label = frameDoc.querySelector(
      `label[for="${element.id}"]`
    );
    frameData[element.name] = label.innerText;
  });
  return frameData
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