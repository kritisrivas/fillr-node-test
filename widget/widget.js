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
      window.addEventListener('message', (event) => {
        // - Merge fields from frames.
        // - Process Fields and send event once all fields are collected.
      });
      //create event "frames:loaded" and send mock fieldsData
      const fieldsData = [
        { "address_line_1" : "Address Line 1" },
        { "cc_number" : "Number" },
        { "cc_type" : "Type" },
        { "country" : "Country" },
        { "first_name" : "First Name" },
        { "last_name" : "Last Name" }
      ]
      const event = new CustomEvent("frames:loaded", {
        detail: {
          fields: fieldsData
        }
      })
      document.dispatchEvent(event)
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
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