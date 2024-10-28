'use strict'
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.
function execute() {
  try {
    if (isTopFrame()) {
      handleTopFrame();
    } else {
      handleChildFrame();
    }
  } catch (error) {
    console.error("Error executing script:", error);
  }
}

function handleTopFrame() {
  //create object to collect fields
  let collectedFields = {};

  //collect top frame fields
  window.addEventListener("load", () => {
    try {
      const topFrameData = collectFieldsFromFrame(window.document);
      collectedFields = { ...collectedFields, ...topFrameData };
    } catch (error) {
      console.error("Error collecting fields from top frame:", error);
    }
  });

  window.addEventListener("message", (event) => {
    // Merge fields received from child frames.
    if (event.data && event.data.type === "fields") {
      collectedFields = { ...collectedFields, ...event.data.fields };
    }
    // Process Fields and send event once all fields are collected.
    const sortedCollectedData = getSortedFields(collectedFields);
    dispatchFramesLoadedEvent(sortedCollectedData);
  });
}

function handleChildFrame() {
  // Collect child frame's fields
  const childFrameData = collectFieldsFromFrame(document);
  const nestedIframe = document.querySelector("iframe");
  if (nestedIframe) {
    nestedIframe.addEventListener("load", () => {
      try {
        //Collect nested frame's fields
        const nestedFormData = collectFieldsFromFrame(nestedIframe.contentWindow.document);
        //Merge both child frames' fields
        const combinedData = { ...childFrameData, ...nestedFormData };
        //send combined fields to top frame
        sendFieldsToParent(combinedData);
      } catch (error) {
        console.error("Error accessing nested iframe:", error);
      }
    });
  } else {
    //If there is no nested iframe, just send the current frame's data
    sendFieldsToParent(childFrameData);
  }
}

function collectFieldsFromFrame(frameDoc) {
  const frameData = {};
  frameDoc.querySelectorAll("input[name], select[name]").forEach((element) => {
    const label = frameDoc.querySelector(`label[for="${element.id}"]`);
    frameData[element.name] = label ? label.innerText : "";
  });
  return frameData;
}

function getSortedFields(fields) {
  const sortedEntries = Object.entries(fields).sort(([a], [b]) => a.localeCompare(b));
  return sortedEntries.map(([key, value]) => ({ [key]: value }));
}

function dispatchFramesLoadedEvent(fields) {
  //create event "frames:loaded" and send all collected Fields to the event
  const framesLoadedEvent = new CustomEvent("frames:loaded", {
    detail: { fields },
  });
  document.dispatchEvent(framesLoadedEvent);
}

function sendFieldsToParent(fields) {
  window.parent.postMessage({ type: "fields", fields }, "*");
}

// Utility functions to check and get the top frame
// as Karma test framework changes top & context frames.
// Use this instead of "window.top".
function getTopFrame() {
  return window.top.frames[0];
}

function isTopFrame() {
  return window.location.pathname == "/context.html";
}

execute();