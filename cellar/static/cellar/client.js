// global state
let store = {
  page: "index", // determines what html to generate
  user: null, // username
  entries: null, // list of all user's entries
  customers: null, // list of all user's customers
  contacts: null, // list of all user's contacts
  tags: null, // list of all user's tags
  uncreated: null, // uncreated object instances (from user input)
};

// not currently in use...
const updateStore = (state, newState) => {
  store = Object.assign(newState, state);
};

// grab the root element which all html will be appended to:
const root = document.getElementById("root");

// render html:
const render = async (root, state) => {
  root.innerHTML = await App(state);
};

// create content
const App = async (state) => {
  if (state.page === "index") {
    await loadStore(state);

    return `
        <div class='welcome fs-700 ff-sans-cond letter-spacing-1 text-white uppercase'>
            Welcome, <span class='fs-700 ff-sans-cond letter-spacing-1 text-accent uppercase'>${state.user}!</span>
        </div>
        ${makeModal('new-entry-modal')}
        ${makeModal('add-objects-modal')}
        ${makeSearchBox()}
        ${makeAddBtn()}

        <div class='container flex' id='entries-container'>${displayEntries(state.entries)}</div>
    `;
  }
};

// loads relevant user data into the global store:
const loadStore = async (state) => {
  console.log("Fetching User Objects...");
  state.user = await getUser();
  state.entries = await getList("Entries");
  state.customers = await getList("Customers");
  state.contacts = await getList("Contacts");
  state.tags = await getList("Tags");

  console.log({ store });
  // updateStore(state, store);
};

//////////////////////////////////////
// HTML COMPONENTS ///////////////////
//////////////////////////////////////

// generate HTML for one entry:
const makeEntryHTML = (entry, regex = null) => {
  let contacts = entry.contacts.map((c) => `${c.first_name}${c.last_name !== null ? " " + c.last_name : ""}`);
  let tags = entry.tags.map((t) => makeTagElement("tags", t.id, t.name));
  let customerName = entry.customer ? entry.customer.name : null;
  let description = entry.description;
  
  let flagBtn;
  if (entry.flagged) {
    flagBtn = `
        <button id='entry-${entry.id}-favourite-btn' class='neupho round-btn bg-dark fave-entry-btn inset' data-id='${entry.id}'>
            <i class="bi bi-flag-fill"></i>
        </button>
    `;
  }
  else {
    flagBtn = `
        <button id='entry-${entry.id}-favourite-btn' class='neupho round-btn bg-dark fave-entry-btn' data-id='${entry.id}'>
            <i class="bi bi-flag"></i>
        </button>
    `;
  }

  // if a regular expression was given to filter the entries,
  // then find and replace that regex with a highlight span
  if (regex) {
    contacts = contacts.map((c) => {
      c = c.replace(regex, (match) => {
        return `<span class='hl'>${match}</span>`;
      });
      return c;
    });

    tags = tags.map((t) => {
      t.innerHTML = t.innerHTML.replace(regex, (match) => {
        return `<span class='hl'>${match}</span>`;
      });
      return t;
    });

    description = description.replace(regex, (match) => {
      return `<span class='hl'>${match}</span>`;
    });

    if (customerName) {
      customerName = customerName.replace(regex, (match) => `<span class='hl'>${match}</span>`);
    }
  }

  // convert the tags array into an array of HTML
  tags = tags.map((t) => t.outerHTML);

  return `
        <div id='entry-${entry.id}' class=' neupho entry-container container bg-dark text-white'>
            ${entry.customer !== null ? `<div class='entry-customer fs-500 text-accent'>${customerName}</div>` : ""}
            ${contacts.length > 0 ? `<div class='entry-contacts fs-300 text-white'>${contacts.join("  &middot  ")}</div>`: ""}
            <div class='description fs-300 neupho inset'>${description}</div>
            ${entry.tags.length > 0 ? `<div class='fs-300 neupho tag-container inset flex'>${tags.join("")}</div>` : ""}
            <div class='entry-btn-container flex'>
                ${flagBtn}
                <button id='entry-${entry.id}-edit-btn' class='neupho round-btn bg-dark edit-entry-btn' data-id='${entry.id}'>
                    <i class='bi bi-pencil-square'></i>
                </button>
                <button id='entry-${entry.id}-delete-btn' class='neupho round-btn bg-dark delete-entry-btn' data-id='${entry.id}'>
                    <i class="bi bi-x-lg"></i>
                </button>
                <select class='neupho text-accent bg-dark' onchange='statusChange(this, ${entry.id})'>
                    <option value='active'>Active</option>
                    <option ${entry.completed ? 'selected' : ''} value='complete'>Complete</option>
                    <option ${entry.archived ? 'selected' : ''} value='archived'>Archived</option>
                </select>
            </div>
        </div>
    `;
};

// generate HTML for suggestion dropdowns:
// entry_ID is the ID of the entry div that this dropdown is associated with.  Null if not associated with one (e.g. making new entry)
const makeSuggestionDiv = (type, entry_ID = null) => {
  return `<div class='suggestions ${type}-suggestions' style='display: none' data-type='${type}' data-id='${entry_ID}'>DUMMY TEXT</div>`;
};

// make html to render a new Entry form:
const makeEntryForm = () => {
  const now = new Date();
  // add leading zeros to dates if less than 10 (important for date input values...):
  const month = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
  const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();

  return `
        <div class="prompt-container neupho container bg-dark text-white" id="entry-form-container">
            <div class='text-accent fs-700'>New Entry</div>
            <div class="neupho tag-container inset flex">
                <input id="customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account">
                ${makeSuggestionDiv("customers")}
            </div>
            <div class="neupho tag-container inset flex">
                <input id="contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
                ${makeSuggestionDiv("contacts")}
            </div>
            <div class='description-wrapper flex'>
                <textarea class='description neupho inset bg-dark' placeholder="Description" cols="10" rows="1"></textarea>
            </div>
            <div class='flex'>
                <input class='neupho inset' type="date" value="${now.getFullYear()}-${month}-${day}">
                <input class='neupho inset' type="number" placeholder="Rank">
            </div>
            <div class="tag-container neupho inset flex">
                <input id="tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
                ${makeSuggestionDiv("tags")}
            </div>
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="submit-new-btn">CREATE</button>
                <button type="buton" class='neupho bg-dark' id="cancel-new-btn">CANCEL</button>
            </div>
        </div>
    `;
};

// fires when an Edit btn is clicked within an existing entry
const makeEditForm = async (entryContainer) => {
    const entry_ID = entryContainer.id.split("-")[1];
    const entry = await getInstance("entry", entry_ID);
  
    const customerTag = makeTagElement(
      "customers",
      entry.customer.id,
      entry.customer.name
    ).outerHTML;
    const contactTags = entry.contacts
      .map((c) => makeTagElement("contacts", c.id, `${c.first_name} ${c.last_name !== null ? c.last_name : ""}`).outerHTML)
      .join("");
    const tagTags = entry.tags
      .map((t) => makeTagElement("tags", t.id, t.name).outerHTML)
      .join("");
  
    // add leading zeros to dates if less than 10 (important for date input values...):
    const month = entry.timestamp.month < 10 ? `0${entry.timestamp.month}` : entry.timestamp.month;
    const day = entry.timestamp.day < 10 ? `0${entry.timestamp.day}` : entry.timestamp.day;
  
    entryContainer.innerHTML = `
        <div class="tag-container neupho inset flex">
            ${customerTag}
            <input id="customers-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account">
            ${makeSuggestionDiv("customers", entry_ID)}
        </div>
        <div class="tag-container neupho inset flex">
            ${contactTags}
            <input id="contacts-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
            ${makeSuggestionDiv("contacts", entry_ID)}
        </div>
        <div class='description-wrapper flex'>
            <textarea class='description neupho inset bg-dark' placeholder="Description" cols="10" rows="1">${entry.description}</textarea>
        </div>
        <div class='flex'>
            <input class='neupho inset' type="date" value="${entry.timestamp.year}-${month}-${day}">
            <input class='neupho inset' type="number" placeholder="Rank" value='${entry.rank}'>
        </div>
        <div class="neupho tag-container inset flex">
            ${tagTags}
            <input id="tags-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
            ${makeSuggestionDiv("tags", entry_ID)}
        </div>
        <div class='form-btn-container flex'>
            <button id='accept-edit-btn' class='neupho bg-dark' data-id="${entry_ID}">Accept Changes</button>
            <button id='cancel-edit-btn' class='neupho bg-dark' data-id='${entry_ID}'>Cancel</button>
        </div>
    `;
  };  

// create a modal div (for pop up user prompts)
// types: new-entry-modal, add-objects-modal
const makeModal = (type = null) => {
  return `
        <div id='${type}' class="modal">
            <div class="prompt-container neupho bg-dark text-white flex">
                        
            </div>
        </div>
    `;
};

// generates HTML for the popup modal with details on the to-be-created customer and/or contacts:
const generateModalText = (customer, contacts) => {
  let promptText = "";
  if (customer) {
    promptText += `
        <div class='modal-text fs-300'>We couldn't find the following customer in your Rolodex:</div>
        <div class='modal-object fs-400 text-accent'>${customer.name}</div>
    `;
  }

  if (contacts) {
    const contactText = contacts
      .map((contact) => `<div class='modal-object fs-400 text-accent'>${contact.first_name} ${contact.last_name}</div>`).join("");

    promptText += `
        <div class='modal-text fs-300'>We couldn't find the following contacts in your Rolodex:</div>
        ${contactText}
    `;
  }

    promptText += `            
        <div class='modal-text fs-300'>Would you like to add them now?</div>
        <div class='flex form-btn-container'>
            <button id='modal-accept-btn' class='accept-btn modal-btn neupho bg-dark'>ACCEPT</button>
            <button id='modal-cancel-btn' class='cancel-btn modal-btn neupho bg-dark'>CANCEL AND MAKE CHANGES</button>
        </div>
    `;
    return promptText;
};

// create the html for a new tag div:
const makeTagElement = (type, id, content) => {
  const tag = document.createElement("div"); // make new tag div
  tag.classList.add("tag"); // add "tag" to classname list
  tag.dataset.id = id === "undefined" ? -1 : id; // id of the content (i.e. if customer name, then customer.id)
  tag.dataset.list = type; // the type of tag e.g. 'customers' or 'contacts'
  tag.innerHTML = content; // the text of the tag
  return tag;
};

// create search box at top of screen to filter entries:
const makeSearchBox = () => {
  return `
        <div class='search-container neupho inset'>
            <input type="text" id="search" placeholder="Search">
        </div>
        <div class='search-count fs-200 text-white'></div>
    `;
};

// create a button to make the new entry form appear:
const makeAddBtn = () => {
  return `
        <div class='toolbar-container flex'>
            <div class='toolbar flex'>
                <div id='toolbar-filter-btn' class='neupho inset'>
                    <span class='fs-400 text-accent'>FILTER<span>
                </div>
                <button id='add-btn' class='round-btn bg-dark text-accent neupho'>
                    <i class="bi bi-plus-lg"></i>
                </button>
                <div id='toolbar-sort-btn' class='neupho inset'>
                    <span class='fs-400 text-accent'>SORT<span>
                </div>
            </div>
        </div>
    `;
};

//////////////////////////////////////
// HELPER FUNCTIONS /////////////////
//////////////////////////////////////

// creates a new entry:
// fired if user clicks on the accept btn in the popup modal (when creating entries with new customer or contacts):
const handleModalAccept = async () => {
    // make the new entry form modal dissapear:
    const newEntryModal = document.querySelector('#new-entry-modal');
    newEntryModal.classList.remove('open');

    // grab the entry container div, so we can update it:
    const entriesContainer = document.querySelector('#entries-container');

    // 
    if (store.uncreated) {
        if (store.uncreated.customer) {
            const newCustomer = await newInstance(store.uncreated.customer,"Customer");
            store.uncreated.customer.id = newCustomer.id;
        }

        if (store.uncreated.contacts) {
            const newContacts = await newInstance(store.uncreated.contacts,"Contacts"); // create new contacts in db
            newContacts.forEach((c) => {
                const target = store.uncreated.contacts.find((el) => {
                    return c.first_name === el.first_name && c.last_name === el.last_name
                });
                target.id = c.id;
            });
        }
    }

  if (store.uncreated.mode === "create") {
    // make a new entry from the stored new entry details:
    await newInstance(store.uncreated.entry, "Entry");
    store.uncreated = null; // reset store.uncreated to null

    await loadStore(store);
    entriesContainer.innerHTML = displayEntries(store.entries);

    // render(root, store);
  } 
  else if (store.uncreated.mode === "update") {
    // update the existing instance:
    await updateInstance(store.uncreated.entry, "entry", store.uncreated.entry.id);
    store.uncreated = null; // reset store.uncreated to null
    await loadStore(store);
    entriesContainer.innerHTML = displayEntries(store.entries);

    // render(root, store);
  } 
  else {
    console.error("Uncreated Object mode is neither create nor update...");
  }
};

// creates and displays a modal for the user to choose whether to make new customer/contact objects, or go back and edit the entry before submitting.
const promptUserMakeObj = (newObjects) => {
  const modal = document.querySelector("#add-objects-modal");
  const container = modal.querySelector(".prompt-container");

  const modalText = generateModalText(newObjects.customer, newObjects.contacts);

  container.innerHTML = modalText;
  modal.classList.add("open");
};

// fired when the "create" btn is clicked to submit a new entry
const initiateNewEntry = async (form) => {
  console.log("Initiated new entry...");

  // get all the inputted data from the entry form
  const newEntryData = getFormData(form);
  const newObjects = checkNewInstances(newEntryData, "create");

  // if there are some new objects, let the user know:
  if (newObjects.customer !== null || newObjects.contacts !== null) {
    console.log("Found new Customer or Contact instances. Prompting user...");
    store.uncreated = newObjects; // load new objects into store so they can be created if the user wishes
    promptUserMakeObj(newObjects); // create a modal user prompt to ask them if they want to create the new objects
    
    return {
        status: 'incomplete',
        message: 'New customer or contact objects to be created'
    };
  } 
  else {
    // otherwise send post request to DB to make new entry:
    newInstance(newEntryData, "Entry");
    await loadStore(store);
    const entriesContainer = document.querySelector('#entries-container');
    entriesContainer.innerHTML = displayEntries(store.entries);

    return {
        status: 'complete',
        message: 'Sending request to create new entry...'
    };
    // render(root, store);
    // const tagElements = Array.from(form.querySelectorAll('.tag')); // grab all of the tag elements
    // tagElements.forEach(el => el.remove());  // remove them from the DOM now that the entry is created
  }
};

const initiateEdit = async (form, entry_id) => {
  console.log(`Updating Entry ${entry_id}`);

  // get all the inputted data from the entry form
  const newEntryData = getFormData(form);
  const newObjects = checkNewInstances(newEntryData, "update");
  newObjects.entry.id = entry_id;
  const entriesContainer = document.querySelector('#entries-container');

  // if there are some new objects, let the user know:
  if (newObjects.customer !== null || newObjects.contacts !== null) {
    console.log("Found new Customer or Contact instances. Prompting user...");
    store.uncreated = newObjects; // load new objects into store so they can be created if the user wishes
    promptUserMakeObj(newObjects); // create a modal user prompt to ask them if they want to create the new objects
  } 
  else {
    // otherwise send put request to DB to update the entry:
    updateInstance(newEntryData, "entry", entry_id);
    await loadStore(store);
    entriesContainer.innerHTML = displayEntries(store.entries);
  }
};

// takes the data from an entry form (new or edit) and checks if there are customers or contacts that don't yet exist:
// returns the new objects in a newObjects object:
const checkNewInstances = (data, keyword) => {
  const customer = data.customer;
  const contacts = data.contacts;

  // check for inputted customers or contacts that don't yet exist and add them to a newObjects object
  const newContacts = contactExists(contacts);

  const newObjects = {
    mode: keyword,
    customer: !customerExists(customer) ? customer : null,
    contacts: newContacts.length > 0 ? newContacts : null,
    entry: data,
  };

  return newObjects;
};

// checks if a passed customer object already exists:
// returns boolean
const customerExists = (customer) => {
  const existingCustomers = store.customers;

  return (
    existingCustomers.filter((el) => {
      return (el.id === customer.id && el.name.toLowerCase() === customer.name.toLowerCase());
    }).length > 0
  );
};

// checks if a passed array of contact objects already exists:
// returns a filtered array of the contacts that don't exist:
const contactExists = (contacts) => {
  const existingContacts = store.contacts;

  return contacts.filter((elem) => {
    return !existingContacts.find((x) => {
      return (elem.id === x.id && elem.first_name.toLowerCase() === x.first_name.toLowerCase());
    });
  });
};

// capture the inputted values for new entry:
const getFormData = (form) => {
  const tagElements = Array.from(form.querySelectorAll(".tag")); // grab all of the tag elements

  const customer = tagElements
    .filter((tag) => tag.dataset.list === "customers")
    .map((cust) => {
      return {
        id: parseInt(cust.dataset.id),
        name: cust.innerHTML,
      };
    })[0];
  const contacts = tagElements
    .filter((tag) => tag.dataset.list === "contacts")
    .map((cont) => {
      const names = cont.innerHTML.trim().split(" ");
      const first_name = names[0];
      const last_name = names.length > 1 ? names[1] : null;

      return {
        id: parseInt(cont.dataset.id),
        first_name: first_name,
        last_name: last_name,
      };
    });
  const tags = tagElements
    .filter((tag) => tag.dataset.list === "tags")
    .map((tag) => {
      return {
        id: tag.dataset.id !== undefined ? parseInt(tag.dataset.id) : -1,
        name: tag.innerHTML,
      };
    });
  const description = form.querySelector("textarea").value;
  const rank = form.querySelector('input[type="number"]').value;
  const date = form.querySelector('input[type="date"]').value.split("-");

  // create details for new entry:
  const newEntryDetails = {
    customer: customer,
    contacts: contacts,
    tags: tags,
    description: description,
    rank: rank,
    date: {
      year: parseInt(date[0]),
      month: parseInt(date[1]),
      day: parseInt(date[2]),
    },
  };

  console.log("Got form data:");
  console.log(newEntryDetails);
  return newEntryDetails;
};

//////////////////////////////////////
// EVENT HANDLER FUNCTIONS ////////////
//////////////////////////////////////

// handles the entry submit btn being clicked to submit a new entry:
const handleEntrySubmitClicked = async () => {
  const form = document.querySelector("#entry-form-container"); // grab the parent elem of the form
  const modal = document.querySelector('#new-entry-modal');
  const newEntryStatus = await initiateNewEntry(form); // initiate the creation of a new entry
  
  if (newEntryStatus.status === 'complete') {
    modal.classList.remove('open');
    console.log(newEntryStatus.message);
  }
};

// handles a dropdown suggestion being clicked:
const handleSuggestionClicked = (suggestion) => {
  // get the input associated with that suggestion (has id = suggestion.dataset.inputid):
  const input = document.querySelector(`#${suggestion.dataset.inputid}`);
  input.value = suggestion.innerHTML; // load the input
  input.dataset.id = suggestion.dataset.id; // set the data-id of the input to the same as the value object

  addTag(input);
  input.focus(); // resume focus on the input box
};

// handles the accept or cancel btn on the modal for new object entries (customers or contacts)
const handleModalBtnClicked = (btn) => {
  const modal = document.querySelector("#add-objects-modal");

  if (btn.id === "modal-accept-btn") handleModalAccept();
  modal.classList.remove("open");
};

// deletes an entry:
const handleEntryDelete = (entry_id) => {
  const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
  entryContainer.remove(); // remove it from DOM
  deleteInstance("entry", entry_id);
};

// changes entry flagged status:
const handleEntryFlag = (entry_id) => {
    const entry = store.entries.find(entry => entry.id === parseInt(entry_id));
    const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
    const flagBtn = entryContainer.querySelector('.fave-entry-btn');
    
    if (entry.flagged) {
        flagBtn.classList.remove('inset');
        flagBtn.innerHTML = "<i class='bi bi-flag'></i>";  
        entry.flagged = false;
        updateInstance(entry, 'entry', entry_id);  
    }
    else {
        flagBtn.classList.add('inset');
        flagBtn.innerHTML = "<i class='bi bi-flag-fill'></i>";  
        entry.flagged = true;  
        updateInstance(entry, 'entry', entry_id);  
    }
}

// changes entry status (input via dropdown select)
// fired from the select dropdown onchange event
const statusChange = (dropdown, entry_id) => {
    const entry = store.entries.find(entry => entry.id === parseInt(entry_id));
    if (dropdown.value === 'active') {
        entry.completed = false;
        entry.archived = false;
    }
    else if (dropdown.value === 'complete') {
        entry.completed = true;
        entry.archived = false;
    }
    else if (dropdown.value === 'archived') {
        entry.completed = false;
        entry.archived = true;
    }
    else {
        console.error('Status not recognized');
    }
    
    // update the db:
    updateInstance(entry, 'entry', entry_id);
}

// handles clicks anywhere on the document.  Called on window load.
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleClicks = (e) => {
  // fires when the entry submit button is clicked:
  if (e.target.id === "submit-new-btn") handleEntrySubmitClicked();

  if (e.target.id === "cancel-new-btn") {
    // const entryForm = document.querySelector(".form-container");
    // entryForm.style.display = "none";
    const modal = document.querySelector('#new-entry-modal');
    modal.classList.remove('open');
  }

  // fires when a dropdown suggestion is clicked:
  else if (e.target.classList.contains("suggestion"))
    handleSuggestionClicked(e.target);

  // cancel or accept changes btn on user prompt modal to add customers and contacts:
  else if (e.target.classList.contains("modal-btn"))
    handleModalBtnClicked(e.target);

    else if (e.target.classList.contains('fave-entry-btn')) {
        handleEntryFlag(e.target.dataset.id);
    }

  // fires when user clicks on edit btn inside an existing entry:
  else if (e.target.classList.contains("edit-entry-btn")) {
    const entry_id = e.target.dataset.id;
    const entryContainer = document.querySelector(`#entry-${entry_id}`);
    makeEditForm(entryContainer);
  }

  // fires when user clicks on delete btn inside an existing entry:
  else if (e.target.classList.contains("delete-entry-btn"))
    handleEntryDelete(e.target.dataset.id);

  // fires when user clicks on accept changes btn when entry is being edited
  else if (e.target.id === "accept-edit-btn") {
    const entry_id = e.target.dataset.id; // get the entry ID from the buttons data-id attribute
    const form = document.querySelector(`#entry-${entry_id}`); // grab the div (entry container) that contains all the inputs
    initiateEdit(form, entry_id);
  }

  // fires when user clicks on cancel btn when entry is being editied
  else if (e.target.id === "cancel-edit-btn") {
    const entry_id = parseInt(e.target.dataset.id);
    const entryContainer = document.querySelector(`#entry-${entry_id}`);
    const entry = store.entries.find((ent) => ent.id === entry_id);
    entryContainer.outerHTML = makeEntryHTML(entry);
  } 
    // fires when user clicks big "+" btn:
    // generates new entry form for entry creation:
  else if (e.target.id === "add-btn") {
        const entryForm = makeEntryForm();
        const modal = document.querySelector('#new-entry-modal');
        modal.innerHTML = entryForm;
        modal.classList.add('open');

    // const entryForm = document.querySelector(".form-container");
    // entryForm.style.display = "block";
  }
};

// populate the suggestion dropdown with options:
const listSuggestions = (inputBox) => {
  const listType = inputBox.dataset.list;
  const listItems = store[listType]; // grab the list of items for listType from store
  const parent = inputBox.parentElement;

  // the below is now not needed since all have 'name' properties:
  let options = [];
  if (listType === "customers") {
    options = findMatches(inputBox.value, listItems, ["name"]);
  } else if (listType === "contacts") {
    options = findMatches(inputBox.value, listItems, [
      "first_name",
      "last_name",
    ]);
  } else {
    options = findMatches(inputBox.value, listItems, ["name"]);
  }

  options = options.map((option) => {
    return { suggestion: option, active: false };
  });

  const suggestionArea = parent.querySelector(".suggestions");
  suggestionArea.style.display = "block";
  suggestionArea.innerHTML = `<ul>${displaySuggestions(inputBox.id, options, listType)}</ul>`;
};

// fires everytime a user types in the search box.
// used to filter the entries on screen
const handleSearchInput = (searchInput) => {
  let targetValue = searchInput.value;
  const currentEntries = [...store.entries];  // creates a copy
  const entryContainer = document.querySelector("#entries-container");
  const searchCount = document.querySelector('.search-count');

    // if only typed 1 letter, display the full set of entries: 
  if (targetValue.length < 2) {
    entryContainer.innerHTML = displayEntries(currentEntries);
    searchCount.style.display = 'none';
  }
  else {
    //   targetValue = targetValue.split(' ').reduce((acc, curr) => {
    //     return acc += `(?=.*${curr})`;
    //   },'');

      targetValue = targetValue.split(' ').join('|');

    const regex = new RegExp(targetValue, "gi");
    const filtered = filterEntries(currentEntries, regex);
    entryContainer.innerHTML = displayEntries(filtered, regex);
    searchCount.style.display = 'block';
    if (filtered.length === 0) {
        searchCount.innerHTML = `No results found`;
    }
    else if (filtered.length === 1) {
        searchCount.innerHTML = `${filtered.length} result`;
    } else {
        searchCount.innerHTML = `${filtered.length} results`;
    }
  }
};

// handles keyup events anywhere on the document.  Called on window load.
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleKeyUp = (e) => {
  if (e.target.classList.contains("tag-input")) listSuggestions(e.target);

  // if user hits enter while inside an input box w/ class 'tag-input', create a new tag element:
  if (e.target.classList.contains("tag-input") && e.key === "Enter") {
    addTag(e.target);
  }

  if (e.target.id === "search") handleSearchInput(e.target);
};

// returns a filtered array
// for each el[prop] combination of el in arr and prop in propertyList, checks whether targetWord matches:
const findMatches = (targetWord, arr, propertyList) => {
  return arr.filter((el) => {
    const regex = new RegExp(targetWord, "gi");
    return propertyList
      .map((prop) => {
        return el[prop] !== null ? el[prop].match(regex) : null;
      })
      .filter((prop) => prop !== null)[0];
  });
};

const displaySuggestions = (inputID, options, type) => {
  return options
    .map((option) => {
      return `<li class="suggestion ${type}-suggestion" data-type="${type}" data-inputID='${inputID}' data-id="${option.suggestion.id}">${option.suggestion.name}</li>`;
    })
    .join("");
};

// inserts a new element in the DOM with ".tag" classname
// used for customers, contacts and tags
const addTag = (inputField) => {
  const parent = inputField.parentNode; // container div

  // if there's already a customer name in the parent div, remove it.
  // only want one customer to be able to be selected at a time
  if (inputField.dataset.list === "customers" && parent.querySelector(".tag")) {
    parent.firstElementChild.remove();
  }

  // make new tag:
  const tag = makeTagElement(
    inputField.dataset.list,
    inputField.dataset.id,
    inputField.value
  );

  // check if this tag already exists:
  const tagExists =
    Array.from(parent.querySelectorAll(".tag")).filter((el) => {
      return (
        el.dataset.id === tag.dataset.id &&
        el.innerHTML.trim() === tag.innerHTML
      );
    }).length > 0;

  // if tag doesn't exist, add it:
  if (!tagExists) {
    parent.insertBefore(tag, inputField); // add input value as new '.tag' element before the input field
  }

  inputField.value = ""; // reset input box
  inputField.dataset.id = undefined; // reset data-id
};

// returns any entry that contains the target string anywhere:
const filterEntries = (entries, regex) => {
  const filtered = entries.filter((entry) => {
    let customerMatch = false;
    let descriptionMatch = false;
    let contactMatch = false;
    let tagMatch = false;

    if (entry.customer) customerMatch = entry.customer.name.match(regex);
    if (entry.description) descriptionMatch = entry.description.match(regex);
    if (entry.contacts)
      contactMatch =
        entry.contacts.filter((con) => {
          if (con.last_name) {
            return con.first_name.match(regex) || con.last_name.match(regex);
          } else return con.first_name.match(regex);
        }).length > 0;
    if (entry.tags)
      tagMatch =
        entry.tags.filter((tag) => {
          return tag.name.match(regex);
        }).length > 0;

    return customerMatch || descriptionMatch || contactMatch || tagMatch;
  });

  return filtered;
};

// filter array of entries based on criteria
// criteria is an object with key:value pairs of what to filter {"author.name": 'Jane Doe', "user.id": 1}
const filterEntries2 = (entries, criteria) => {
  const filteredEntries = entries.filter((entry) => {
    for (let key in criteria) {
      const keys = key.split(".");

      let val = entry;
      for (let k of keys) {
        if (val[k]) {
          val = val[k];
        }
      }
      if (val === undefined || val != criteria[key]) {
        return false;
      }
    }
    return true;
  });

  return filteredEntries;
};

// display each entry on the page:
const displayEntries = (entries, regex = null) => {
  console.log("Displaying Entries...");

  return entries
    .map((entry) => makeEntryHTML(entry, regex))
    .reverse()
    .join("");
};

// run on DOM content loaded:
window.addEventListener("load", () => {
  document.addEventListener("click", handleClicks);
  document.addEventListener("keyup", handleKeyUp);
  render(root, store);
});
