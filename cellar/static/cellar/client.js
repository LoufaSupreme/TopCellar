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
        <section id='header'>
            <div class="navbar flex">
                ${makeNavBar()}
            </div>
        </section>
        <section id='main'>
            <div id='sidebar' class='accordion'>
                <div id='sidebar-open-btn'>
                    <i class="bi bi-funnel"></i>
                </div>
                ${makeFilterBox()}
                ${makeSortBox()}
            </div>
            <div class='welcome fs-700 ff-sans-cond letter-spacing-1 text-white uppercase'>
                Welcome, <span class='fs-700 ff-sans-cond letter-spacing-1 text-accent uppercase'>${state.user}!</span>
            </div>
            ${makeModal('new-entry-modal')}
            ${makeModal('add-objects-modal')}
            ${makeAddBtn()}

            <div class='container flex' id='cards-container'>
                ${displayEntries(state.entries)}
            </div>
        </section>
    `;
  }
  else if (state.page === 'rolodex') {
      return `
        <section id='header'>
            <div class="navbar flex">
                ${makeNavBar()}
            </div>
        </section>
        <section id='main'>
            ${makeModal('new-entry-modal')}
            ${makeModal('add-objects-modal')}
            ${makeAddBtn()}

            <div class='container flex' id='cards-container'>
                ${displayContacts(state.contacts)}
            </div>
        </section>
  
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

//// navbar /////////////////////////
const makeNavBar = () => {
    return `
        <h1><a class='navbar-brand text-accent' href="#">TopCellar</a></h1>
        ${makeSearchBox()}
        <div class="nav-content flex">
            <ul class="navbar-nav flex">
                <li class="nav-item">
                    <a class="nav-link" href="/">Sales Activity</a>
                </li>
                <li class="nav-item">
                    <a id='rolodex-link' class="nav-link" href="#">Rolodex</a>
                </li>    
                <li class="nav-item">
                    <a class="nav-link" href="#">KPIs</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/logout">Log Out</a>
                </li>
            </ul>
        </div>
    `;
}

// create search box at top of screen to filter entries:
const makeSearchBox = () => {
    return `
        <div class='flex search-container'>
            <div class='search-bar-container flex neupho inset'>
                <input type="text" id="search" placeholder="Search">
                <div class='search-count fs-200 text-white'></div>
                <i class="fas fa-search"></i>
            </div>
        </div>
      `;
  };
  

//// ROLODEX /////////////////////////////////

// create contact card html for one contact:
const makeContactCard = (contact, regex = null) => {
    let name = contact.name;
    let company = contact.company ? contact.company.name : "";
    let position = contact.position ? contact.position : "";
    let email = contact.email ? contact.email : "";
    let phone_cell = contact.phone_cell ? contact.phone_cell : "";
    let phone_office = contact.phone_office ? contact.phone_office : "";
    let notes = contact.notes ? 'Notes...' : 'No Notes'; 
    
    // if a regular expression was given to filter the contacts,
    // then find and replace that regex with a highlight span
    if (regex) {
        name = name.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        company = company.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        position = position.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        email = email.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        phone_cell = phone_cell.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        phone_office = phone_office.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        if (contact.notes && contact.notes.match(regex)) {
            notes = `<span class='hl'>${notes}</span>`;
        }
    }

    return `
        <div class='contact-card neupho'>
            <div class='company-container'>
                <div class='company-info-container'>
                    <div class='company-logo'>?</div>
                    <div class='company-name'>${company}</div>
                </div>
            </div>
            <div class='accent-rect-container'>
                <div class='accent-rect'><i class="bi bi-person-circle"></i></div>
                <div class='accent-rect'><i class="bi bi-globe"></i></div>
                <div class='accent-rect'><i class="bi bi-telephone"></i></div>
                <div class='accent-rect'><i class="bi bi-card-list"></i></div>
            </div>
            <div class='info-container'>
                <div class='info'>
                    <div class='name'><span class='fs-400 text-accent'>${name}</span></div>
                    <div class='position'>${position}</div>
                </div>
                <div class='info'>
                    <div class='email'>${email}</div>
                </div>
                <div class='info'>
                    <div class='cell'>${phone_cell}</div>
                    <div class='office'>${phone_office}</div>
                </div>
                <div class='info'>
                    <div class='notes'>${notes}</div>
                </div>
            </div>
        </div>
    `;
}

//// INDEX ///////////////////////////////////

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
            <div class='fs-200 text-white'>${entry.timestamp.full}</div>
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
    return `
        <div class='suggestions ${type}-suggestions flex' style='display: none' data-type='${type}' data-id='${entry_ID}'>
            DUMMY TEXT
        </div>    
    `;
};

const displaySuggestions = (inputID, options, type) => {
    options = options
      .map((option) => {
        return `<li class="suggestion ${type}-suggestion fs-300" data-type="${type}" data-inputID='${inputID}' data-id="${option.suggestion.id}">${option.suggestion.name}</li>`;
      })
      .join("");
      
      options = '<ul class="fs-200 text-white">Choose Existing:' + options + '</ul>';
      return options;
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
                <input id="new-entry-customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account">
                ${makeSuggestionDiv("customers")}
            </div>
            <div class="neupho tag-container inset flex">
                <input id="new-entry-contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
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
                <input id="new-entry-tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
                ${makeSuggestionDiv("tags")}
            </div>
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="submit-new-btn">CREATE</button>
                <button type="buton" class='neupho bg-dark' id="cancel-new-btn">CANCEL</button>
            </div>
        </div>
    `;
};

// make html to render a new Contact form:
const makeContactForm = () => {
    return `
        <div class="prompt-container neupho container bg-dark text-white" id="contact-form-container">
            <div class='text-accent fs-700'>New Contact</div>
            <div class="neupho inset">
                <input id="first-name-input" class="" type="text" placeholder="First Name" required>
            </div>
            <div class="neupho inset">
                <input id="last-name-input" class="" type="text" placeholder="Last Name">
            </div>
            <div class="neupho inset">
                <input id="position-input" class="" type="text" placeholder="Title / Position">
            </div>
            <div class="neupho inset">
                <input id="email-input" class="" type="email" placeholder="Email">
            </div>
            <div class="neupho inset">
                <input id="cell-input" class="" type="tel" pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}' oninput='formatPhoneNum(this)' placeholder="Cell Phone">
            </div>
            <div class="neupho inset">
                <input id="office-input" class="" type="tel" pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}' oninput='formatPhoneNum(this)' placeholder="Office Phone">
            </div>
            <div class="neupho tag-container inset flex">
                <input id="customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Company">
                ${makeSuggestionDiv("customers")}
            </div>
            <div class='description-wrapper flex'>
                <textarea id='notes-input' class='description neupho inset bg-dark' placeholder="Notes" cols="10" rows="1"></textarea>
            </div>
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="submit-new-btn">CREATE</button>
                <button type="buton" class='neupho bg-dark' id="cancel-new-btn">CANCEL</button>
            </div>
        </div>
    `;
}

// fires when an Edit btn is clicked within an existing entry
const makeEditForm = async (entryContainer) => {
    const entry_ID = entryContainer.id.split("-")[1];
    const entry = await getInstance("entry", entry_ID);
  
    const customerTag = makeTagElement(
      "customers",
      entry.customer.id,
      entry.customer.name,
      'active',
    ).outerHTML;
    const contactTags = entry.contacts
      .map((c) => makeTagElement("contacts", c.id, `${c.first_name} ${c.last_name !== null ? c.last_name : ""}`, 'active').outerHTML)
      .join("");
    const tagTags = entry.tags
      .map((t) => makeTagElement("tags", t.id, t.name, 'active').outerHTML)
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
      .map((contact) => {
        const name = contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name;
        
        return `
        <div class='modal-object fs-400 text-accent'>
            ${name}
        </div>`
      }).join("");

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
// type = customers, contacts, tags
const makeTagElement = (type, id, content, status = 'locked') => {
    const tag = document.createElement("div"); // make new tag div
    tag.classList.add("tag"); // add "tag" to classname list
    tag.dataset.id = id === "undefined" ? -1 : id; // id of the content (i.e. if customer name, then customer.id)
    tag.dataset.list = type; // the type of tag e.g. 'customers' or 'contacts'
    tag.innerHTML = content; // the text of the tag

    if (status !== 'locked') {
        const exit = document.createElement('div');
        exit.classList.add('tag-close-btn');
        exit.innerHTML = '<i class="bi bi-x"></i>';
        tag.appendChild(exit);
    }

    return tag;
};

// create a form to apply multiple filters to the entries
const makeFilterBox = () => {
    return `
    <div id='filter-container' class='neupho'>
        <div class='flex'>
            <div class='text-accent fs-500'>Filter</div>
            <select class='neupho bg-dark'>
                <option value='new'>New Custom Filter</option>
                <option value='custom1'>Custom Filter 1</option>
                <option value='custom2'>Custom Filter 2</option>
            </select>
        </div>
        <div>
            <div class='flex'>
                <span>Show entries with</span>
                <select id='filter-any-all' class='neupho bg-dark'>
                    <option value='any'>ANY</option>
                    <option value='all'>ALL</option>
                </select>
                <span>of the below parameters</span>
            </div>
            <div class="neupho tag-container inset flex">
                <input id="customers-input" class="tag-input filter-input" type="text" data-id="undefined" data-list="customers" placeholder="Accounts">
                ${makeSuggestionDiv("customers")}
            </div>
            <div class="neupho tag-container inset flex">
                <input id="contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
                ${makeSuggestionDiv("contacts")}
            </div>
            <div class='flex datebox-container'>
                <input id='filter-date-from' class='neupho inset' type="date">
                <div class='text-white'>TO</div>
                <input id='filter-date-to' class='neupho inset' type="date">
            </div>
            <div class='flex checkbox-container'>
                <div>
                    <input class='cb-flagged' type="checkbox" name="flagged" value="true">
                    <label for="flagged"> Flagged</label>
                </div>
                <div>
                    <input class='cb-flagged' type="checkbox" name="unflagged" value="false">
                    <label for="unflagged"> Unflagged</label>
                </div>
            </div>
            <div class='flex checkbox-container'>
                <div>
                    <input class='cb-status' type="checkbox" name="active" value="active">
                    <label for="active"> Active</label>
                </div>
                <div>
                    <input class='cb-status' type="checkbox" name="completed" value="completed">
                    <label for="completed"> Completed</label>
                </div>
                <div>
                    <input class='cb-status' type="checkbox" name="archived" value="archived">
                    <label for="archived"> Archived</label>
                </div>
            </div>
            <div class="tag-container neupho inset flex">
                <input id="tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
                ${makeSuggestionDiv("tags")}
            </div>
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="filter-btn">Filter</button>
            </div>
        </div>
    </div>
    `;
}

// create a form to apply sorting criteria to the entries:
const makeSortBox = () => {
    return `
        <div id='sort-container' class='neupho'>
            <div class='text-accent fs-500'>Sort</div>
            <div class='flex'>
                <select id='sortBy' class='neupho bg-dark'>
                    <option value='date'>Date Created</option>
                    <option value='customer_name'>Customer Name</option>
                    <option value='flagged'>Flagged</option>
                </select>
                <select id='sortDirection' class='neupho bg-dark'>
                    <option value='descending'>Descending</option>
                    <option value='ascending'>Ascending</option>
                </select>
            </div>
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="sort-btn">Sort</button>
            </div>
        </div>
    `;
}

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

// add dashes to phonenumbers as user types.
// triggered by oninput in input[type='tel']
const formatPhoneNum = (inputField) => {
    const nums = inputField.value.split('-').join("");
    
    if (nums.length === 3) inputField.value = nums;
    else if (nums.length === 4) {
        inputField.value = nums.slice(0, 3) + '-' + nums.slice(3, 4);
    }
    else if (nums.length === 6) {
        inputField.value = nums.slice(0,3) + '-' + nums.slice(3,6);
    }
    else if (nums.length === 7) {
        inputField.value = nums.slice(0,3) + '-' + nums.slice(3,6) + '-' + nums.slice(6,7);
    }
    else if (nums.length > 10) {
        inputField.value = inputField.value.slice(0, 12);
    }
}

// creates a new entry:
// fired if user clicks on the accept btn in the popup modal (when creating entries with new customer or contacts):
const handleModalAccept = async () => {
    // make the new entry form modal dissapear:
    const newEntryModal = document.querySelector('#new-entry-modal');
    newEntryModal.classList.remove('open');

    // grab the entry container div, so we can update it:
    const entriesContainer = document.querySelector('#cards-container');

    // 
    if (store.uncreated) {
        if (store.uncreated.customer) {
            const newCustomer = await newInstance(store.uncreated.customer,"Customer");
            store.uncreated.customer.id = newCustomer.id;
        }

        if (store.uncreated.contacts) {
            const newContacts = await newInstance(store.uncreated.contacts,"Contacts"); // create new contacts in db

            // update contact ID in store:
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
  console.log("Initiating new entry...");

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
    await newInstance(newEntryData, "Entry");
    await loadStore(store);
    const entriesContainer = document.querySelector('#cards-container');
    entriesContainer.innerHTML = displayEntries(store.entries);

    return {
        status: 'complete',
        message: 'Sending request to create new entry...'
    };
  }
};

// fired when the "create" btn is clicked to make a new contact:
const initiateNewContact = async (form) => {
    console.log('Initiating new contact...');

    // get all the inputted data from the entry form
    const newContactData = getContactFormData(form);
    const newObjects = checkNewInstances(newContactData, "create");

    // if there are some new objects, let the user know:
    if (newObjects.customer !== null) {
        console.log("Found new Customer instance. Prompting user...");
        store.uncreated = newObjects; // load new objects into store so they can be created if the user wishes
        promptUserMakeObj(newObjects); // create a modal user prompt to ask them if they want to create the new objects
        
        return {
            status: 'incomplete',
            message: 'New customer or contact objects to be created'
        };
    }
    else {
        // otherwise send post request to DB to make new contact:
        await newInstance(newContactData, "Contacts");
        await loadStore(store);
        const contactsContainer = document.querySelector('#cards-container');
        contactsContainer.innerHTML = displayContacts(store.contacts);
    
        return {
            status: 'complete',
            message: 'Sending request to create new contact...'
        };
      }
}

const initiateEdit = async (form, entry_id) => {
    console.log(`Updating Entry ${entry_id}`);
    const originalEntry = store.entries.find(entry => entry.id === parseInt(entry_id));

    // get all the inputted data from the entry form
    const newEntryData = getFormData(form);
    // replace the flagged/archived/completed data with this entries real data
    // have to do this because the getFormData function assumes them all to be false, bc there's no input for them in the form.  
    newEntryData.flagged = originalEntry.flagged;
    newEntryData.archived = originalEntry.archived;
    newEntryData.completed = originalEntry.completed;

    const newObjects = checkNewInstances(newEntryData, "update");
    newObjects.entry.id = entry_id;
    const entriesContainer = document.querySelector('#cards-container');

    // if there are some new objects, let the user know:
    if (newObjects.customer !== null || newObjects.contacts !== null) {
        console.log("Found new Customer or Contact instances. Prompting user...");
        store.uncreated = newObjects; // load new objects into store so they can be created if the user wishes
        promptUserMakeObj(newObjects); // create a modal user prompt to ask them if they want to create the new objects
    } 
    else {
        // otherwise send put request to DB to update the entry:
        await updateInstance(newEntryData, "entry", entry_id);
        await loadStore(store);
        entriesContainer.innerHTML = displayEntries(store.entries);
    }
};

// takes the data from an entry form (new or edit) and checks if there are customers or contacts that don't yet exist:
// returns the new objects in a newObjects object:
const checkNewInstances = (data, keyword) => {
  const customer = data.customer || data.company;
  const contacts = data.contacts || [];

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
        name: cust.innerText,
      };
    })[0];

  const contacts = tagElements
    .filter((tag) => tag.dataset.list === "contacts")
    .map((cont) => {
      const names = cont.innerText.trim().split(" ");
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
        name: tag.innerText,
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
    timestamp: {
      year: parseInt(date[0]),
      month: parseInt(date[1]),
      day: parseInt(date[2]),
    },
    flagged: false,
    archived: false,
    completed: false,
  };

  console.log("Got form data:");
  console.log(newEntryDetails);
  return newEntryDetails;
};

// get the data from the new contact form:
const getContactFormData = (form) => {
    const tagElements = Array.from(form.querySelectorAll(".tag")); // grab all of the tag elements

    const company = tagElements
        .filter((tag) => tag.dataset.list === "customers")
        .map((cust) => {
            return {
                id: parseInt(cust.dataset.id),
                name: cust.innerText,
            };
        })[0];

    const first_name = form.querySelector('#first-name-input').value;
    const last_name = form.querySelector('#last-name-input').value;
    const position = form.querySelector('#position-input').value;
    const email = form.querySelector('#email-input').value;
    const cell = form.querySelector('#cell-input').value;
    const office = form.querySelector('#office-input').value;
    const notes = form.querySelector('#notes-input').value;

    const newContactDetails = {
        first_name: first_name,
        last_name: last_name,
        company: company,
        position: position,
        email: email,
        phone_cell: cell,
        phone_office: office,
        notes: notes,
    };
    console.log('Got contact form data:');
    console.log(newContactDetails);
    return newContactDetails;
}

// gets the data from the filter form:
const getFilterFormData = (form) => {
    const tagElements = Array.from(form.querySelectorAll(".tag")); // grab all of the tag elements

    const customers = tagElements
        .filter((tag) => tag.dataset.list === "customers")
        .map((cust) => {
            return {
                id: parseInt(cust.dataset.id),
                name: cust.innerText,
            };
        });

    const contacts = tagElements
        .filter((tag) => tag.dataset.list === "contacts")
        .map((cont) => {
            const names = cont.innerText.trim().split(" ");
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
                name: tag.innerText,
            };
        });

    
    let fromDate = form.querySelector('#filter-date-from').value.split("-");
    fromDate = fromDate.length === 3 ? fromDate : '';

    let toDate = form.querySelector('#filter-date-to').value.split("-");
    toDate = toDate.length === 3 ? toDate : '';

    const anyAllSelect = form.querySelector('#filter-any-all').value;

    // get checkbox data:
    const checkBoxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));

    const flagged = checkBoxes
        .filter(box => box.classList.contains('cb-flagged') && box.checked === true)
        .map(box => {
            return {
                name: box.name,
                value: box.value,
            }
        });

    const status = checkBoxes
        .filter(box => box.classList.contains('cb-status') && box.checked === true)
        .map(box => box.value);    

    console.log(status);

    const filterParameters = {
        type: anyAllSelect,
        customers: customers,
        contacts: contacts, 
        tags: tags, 
        fromDate: fromDate,
        toDate: toDate,
        flagged: flagged,
        status: status,
    }

    return filterParameters;
}

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
}

// handles the new contact form "create" btn being clicked:
const handleContactSubmit = async () => {
    const form = document.querySelector('#contact-form-container');
    const modal = document.querySelector('#new-entry-modal');
    const createStatus = await initiateNewContact(form);

    if (createStatus === 'complete') {
        modal.classList.remove('open');
        console.log(createStatus.message);
    }
}

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
    // console.log(e.target);
    // fires when the entry submit button is clicked:
    if (e.target.id === "submit-new-btn") {
        if (store.page === 'index') handleEntrySubmitClicked();
        else if (store.page === 'rolodex') handleContactSubmit();
    }

    if (e.target.id === "cancel-new-btn") {
        // const entryForm = document.querySelector(".form-container");
        // entryForm.style.display = "none";
        const modal = document.querySelector('#new-entry-modal');
        modal.classList.remove('open');
    }

    // fires when a dropdown suggestion is clicked:
    else if (e.target.classList.contains("suggestion")) {
        handleSuggestionClicked(e.target);
    }

    // cancel or accept changes btn on user prompt modal to add customers and contacts:
    else if (e.target.classList.contains("modal-btn")) {
        handleModalBtnClicked(e.target);
    }

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
        if (store.page === 'index') {
            const entryForm = makeEntryForm();
            const modal = document.querySelector('#new-entry-modal');
            modal.innerHTML = entryForm;
            modal.classList.add('open');
        }
        else if (store.page === 'rolodex') {
            const contactForm = makeContactForm();
            const modal = document.querySelector('#new-entry-modal');
            modal.innerHTML = contactForm;
            modal.classList.add('open');
        }
    }

        // fires when user clicks on a tag's "X"
    else if (e.target.classList.contains('tag-close-btn')) {
        e.target.parentNode.remove();
    }

    // fires when user clicks on "filter" btn within filter container
    else if (e.target.id === 'filter-btn') {
        const form = document.querySelector('#filter-container');
        const filterParams = getFilterFormData(form);
        const filteredEntries = filterEntries(store.entries, filterParams);
        const entriesContainer = document.querySelector('#cards-container');
        entriesContainer.innerHTML = displayEntries(filteredEntries);
    }

    // fires when user clicks on "sort" btn within the sort container
    else if (e.target.id === 'sort-btn') {
        const form = document.querySelector('#sort-container');
        const sortBy = form.querySelector('#sortBy').value;
        const sortDirection = form.querySelector('#sortDirection').value;
        const sortParams = {
            sortBy: sortBy,
            sortDirection: sortDirection,
        }
        const sortedEntries = sortEntries(store.entries, sortParams);
        const entriesContainer = document.querySelector('#cards-container');
        entriesContainer.innerHTML = displayEntries(sortedEntries, true);
    }

    // fires when user clicks "filter" or "sort" beside the add btn
    else if (e.target.id === 'toolbar-filter-btn' || e.target.id === 'toolbar-sort-btn' ) {
        const sidebar = document.querySelector('#sidebar')
        sidebar.classList.toggle('open');
    }

    // fires when user clicks on little filter cutout on sidebar:
    else if (e.target.id === 'sidebar-open-btn') {
        const sidebar = document.querySelector('#sidebar')
        sidebar.classList.toggle('open');
    }

    // click on Rolodex nav link - switch page
    else if (e.target.id === 'rolodex-link') {
        e.preventDefault();
        store.page = 'rolodex';
        render(root, store);
    }
};


// populate the suggestion dropdown with options:
const listSuggestions = (inputBox) => {
    const listType = inputBox.dataset.list;
    const listItems = store[listType]; // grab the list of items for listType from store

    // the below is now not needed since all have 'name' properties:
    let options = [];
    if (listType === "customers") {
        options = findMatches(inputBox.value, listItems, ["name"]);
    } 
    else if (listType === "contacts") {
        options = findMatches(inputBox.value, listItems, [
        "first_name",
        "last_name",
        ]);
    } 
    else {
        options = findMatches(inputBox.value, listItems, ["name"]);
    }

    options = options.map((option) => {
        return { suggestion: option, active: false };
    });

    return options;
}

// fires everytime a user types in the search box.
// used to filter the entries on screen
const handleSearchInput = (searchInput) => {
    // create an "or" regex statement for each word in search bar:
    const targetValue = searchInput.value.split(' ').join('|');
    const regex = new RegExp(targetValue, "gi");

    // display for # of returned results:
    const searchCount = document.querySelector('.search-count');
    const cardsContainer = document.querySelector("#cards-container");
    const currentEntries = [...store.entries];  // creates a copy
    const currentContacts = [...store.contacts];

    // if only typed 1 letter, display the full set of entries: 
    if (targetValue.length < 1 && store.page === 'index') {
        cardsContainer.innerHTML = displayEntries(currentEntries);
        searchCount.style.display = 'none';
    }
    // or the full set of contacts:
    else if (targetValue.length < 1 && store.page === 'rolodex') {
        cardsContainer.innerHTML = displayContacts(currentContacts);
        searchCount.style.display = 'none';
    }
    else if (store.page === 'index') {
        const filtered = searchEntries(currentEntries, regex);
        cardsContainer.innerHTML = displayEntries(filtered, regex);
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
    else if (store.page === 'rolodex') {
        const filtered = searchContacts(currentContacts, regex);
        cardsContainer.innerHTML = displayContacts(filtered, regex);
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
    if (e.target.classList.contains("tag-input")) {
        const inputBox = e.target;
        const parent = inputBox.parentElement;
        const parentHeight = parent.getBoundingClientRect().height;
        const suggestionArea = parent.querySelector(".suggestions");
        // set the position of the suggestion box to be just underneath the input box
        suggestionArea.style.setProperty('transform', `translateY(${parentHeight}px)`);

        const listType = inputBox.dataset.list;

        // if the input box is not empty
        if (inputBox.value.trim() !== '') {
            const options = listSuggestions(inputBox);
            if (options.length > 0) {
                suggestionArea.style.display = "block";
                suggestionArea.innerHTML = displaySuggestions(inputBox.id, options, listType);
            }
        }
        else {
            suggestionArea.style.display = "none";
        }
    }

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


// inserts a new element in the DOM with ".tag" classname
// used for customers, contacts and tags
const addTag = (inputField) => {
    const parent = inputField.parentNode; // container div
    // if there's already a customer name in the parent div, remove it.
    // only want one customer to be able to be selected at a time
    if (inputField.dataset.list === "customers" && parent.querySelector(".tag") && !inputField.classList.contains('filter-input')) {
        parent.firstElementChild.remove();
    }

    // make new tag:
    const tag = makeTagElement(
        inputField.dataset.list,
        inputField.dataset.id,
        inputField.value,
        'active',
    );

    // check if this tag already exists:
    // returns boolean
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

        // hide suggestion box again:
        const suggestionBox = parent.querySelector('.suggestions');
        suggestionBox.style.display = "none";
        
    }

    inputField.value = ""; // reset input box
    inputField.dataset.id = undefined; // reset data-id
};

// returns list of entries that contain the target string anywhere:
const searchEntries = (entries, regex) => {
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
                } 
                else return con.first_name.match(regex);
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

// returns list of contacts that contain the target string anywhere:
const searchContacts = (contacts, regex) => {
    const filtered = contacts.filter(contact => {
        let companyMatch = false;
        let contactMatch = false;
        let emailMatch = false;
        let positionMatch = false;
        let cellPhoneMatch = false;
        let officePhoneMatch = false;
        let notesMatch = false;

        if (contact.company) companyMatch = contact.company.name.match(regex);
        if (contact.name) contactMatch = contact.name.match(regex);
        if (contact.email) emailMatch = contact.email.match(regex);
        if (contact.phone_cell) {
            const cell = contact.phone_cell.toString();
            cellPhoneMatch = cell.match(regex);
        }
        if (contact.phone_office) {
            const office = contact.phone_office.toString();
            officePhoneMatch = office.match(regex);
        }
        if (contact.position) positionMatch = contact.position.match(regex);
        if (contact.notes) notesMatch = contact.notes.match(regex);

        return companyMatch || contactMatch || emailMatch || positionMatch || cellPhoneMatch || officePhoneMatch || notesMatch;
    });

    return filtered;
}

// returns list of entries that match filter criteria
const filterEntries = (entries, criteria) => {
    
    // returns a list of booleans, one for each customer criteria matched
    function customerMatch(entry) {
        let customerMatches = [];
        // for each customer in criteria, check if it matches the entry's customer:
        for (let i = 0; i < criteria.customers.length; i++) {
            const criteriaCustomer = criteria.customers[i];
            if (
                entry.customer.name === criteriaCustomer.name &&
                entry.customer.id === criteriaCustomer.id    
            ) {
                // if the customer matches, add true to the array
                customerMatches.push(true)
            }
            // otherwise add false (no match)
            else customerMatches.push(false);
        }
        return customerMatches;
    }

    // returns a list of booleans, one for each contact criteria matched
    function contactMatch(entry) {
        let contactMatches = [];
        // for each contact in criteria, check if it matches any of the entry contacts:
        for (let i = 0; i < criteria.contacts.length; i++) {
            const criteriaContact = criteria.contacts[i];
            const contactMatch = entry.contacts.filter(contact => {
                return contact.id === criteriaContact.id;
            });
            
            // if a non-empty array was returned, add true to array:
            if (contactMatch.length > 0) contactMatches.push(true);
            else contactMatches.push(false);
        }
        return contactMatches;
    }

    // returns a list of booleans, one for each tag criteria matched
    function tagMatch(entry) {
        let tagMatches = [];
        // for each tag in criteria, check if it matches any of the entry tags:
        for (let i = 0; i < criteria.tags.length; i++) {
            const criteriaTag = criteria.tags[i];
            const tagMatch = entry.tags.filter(tag => {
                return tag.id === criteriaTag.id;
            });

            // if a non-empty array was returned, add true to array.
            if (tagMatch.length > 0) tagMatches.push(true);
            else tagMatches.push(false);
        }
        return tagMatches;
    }


    function flagMatch(entry) {
        let flagMatches = [];

        for (let i = 0; i < criteria.flagged.length; i++) {
            const flagType = criteria.flagged[i];
            if (String(entry.flagged) === flagType.value) flagMatches.push(true);
            else flagMatches.push(false);
        }
        return flagMatches;
    }

    function statusMatch(entry) {
        let statusMatches = [];

        for (let i = 0; i < criteria.status.length; i++) {
            const criteriaStatus = criteria.status[i];
            if (
                criteriaStatus === 'active' && 
                entry.completed === false &&
                entry.archived === false
            ) {
                statusMatches.push(true)
            }
            else if (entry[criteriaStatus] === true) {
                statusMatches.push(true)
            }
            else statusMatches.push(false);
        }
        return statusMatches;
    }
    
    // returns a boolean
    // true if entry timestamp matches date criteria
    // type = "any" or "all"
    function dateMatch(entry, type) {
        
        if (type === 'any') {
            // if no date criteria specified, ignore all entries
            if (criteria.fromDate === '' && criteria.toDate === '') return false;
        }
        else if (type === 'all') {
            if (criteria.fromDate === '' && criteria.toDate === '') return true;
        }

        // if only toDate given, take all entries created up to that date:
        else if (criteria.fromDate === '' && criteria.toDate !== '') {
            const targetEndDate = new Date(
                parseInt(criteria.toDate[0]),
                parseInt(criteria.toDate[1]),
                parseInt(criteria.toDate[2])
            );

            const entryDate = new Date(
                entry.timestamp.year,
                entry.timestamp.month,
                entry.timestamp.day
            );
            
            if (entryDate <= targetEndDate) return true;
        }

        // if only fromDate given, take all entries created after that date:
        else if (criteria.fromDate !== '' && criteria.toDate === '') {
            const targetStartDate = new Date(
                parseInt(criteria.fromDate[0]),
                parseInt(criteria.fromDate[1]),
                parseInt(criteria.fromDate[2])
            );

            const entryDate = new Date(
                entry.timestamp.year,
                entry.timestamp.month,
                entry.timestamp.day
            );
            
            if (entryDate >= targetStartDate) return true;
        }

        // if both given, take entries created inside that range:
        else if (criteria.fromDate !== '' && criteria.toDate !== '') {
            const targetStartDate = new Date(
                parseInt(criteria.fromDate[0]),
                parseInt(criteria.fromDate[1]),
                parseInt(criteria.fromDate[2])
            );

            const targetEndDate = new Date(
                parseInt(criteria.toDate[0]),
                parseInt(criteria.toDate[1]),
                parseInt(criteria.toDate[2])
            );

            const entryDate = new Date(
                entry.timestamp.year,
                entry.timestamp.month,
                entry.timestamp.day
            );
            
            if (entryDate >= targetStartDate && entryDate <= targetEndDate) return true;
        }
        else return false;
    }

    
    // if user chose "any" in dropdown
    // i.e. return entries that include ANY of the filter criteria:
    if (criteria.type === 'any') {
        console.log('Filtering entries matching ANY criteria...')

        entries = entries.filter(entry => {

            // check if any customers match
            if (entry.customer) {
                const customerMatches = customerMatch(entry)
                // if any of the criteria matched, add to filtered array
                if (customerMatches.length > 0 && customerMatches.some(el => el === true)) return true;
            }

            // check if any contacts match
            if (entry.contacts) {
                const contactMatches = contactMatch(entry);
                // if any of the criteria matched, add to filtered array
                if (contactMatches.length > 0 && contactMatches.some(el => el === true)) return true;
            }

            // check if any tags match
            if (entry.tags) {
                const tagMatches = tagMatch(entry);
                // if any of the criteria matched, add to filtered array
                if (tagMatches.length > 0 && tagMatches.some(el => el === true)) return true;
            }

            // check if flag criteria matches:
            const flagMatches = flagMatch(entry);
            if (flagMatches.length > 0 && flagMatches.some(el => el === true)) return true;

            const statusMatches = statusMatch(entry);
            if (statusMatches.length > 0 && statusMatches.some(el => el === true)) return true;

            // check if date range matches
            const dateMatches = dateMatch(entry, 'any');
            if (dateMatches) return true;
        });
        return entries;
    }

    // return entries that satisfy ALL the filter criteria at once:
    else if (criteria.type === 'all') {
        console.log('Filtering entries matching ALL criteria...')
        return entries = entries.filter(entry => {
            // array of booleans for each check
            let allMatches = [];
            
            // check if entry matches date criteria:
            if (dateMatch(entry, 'all')) allMatches.push(true);
            else allMatches.push(false);

            // check if flag criteria matches:
            const flagMatches = flagMatch(entry);
            // if the flagMatches array is empty, treat it as if it passed the match test
            if (flagMatches.length === 0) allMatches.push(true);
            else if (flagMatches.length > 0 && flagMatches.every(el => el === true)) allMatches.push(true);
            else allMatches.push(false);

            // check if status (completed, archived, active) matches:
            const statusMatches = statusMatch(entry);
            // if the statusMatches array is empty, treat it as if it passed the match test
            if (statusMatches.length === 0) allMatches.push(true);
            else if (statusMatches.length > 0 && statusMatches.every(el => el === true)) allMatches.push(true);
            else allMatches.push(false);
            
            // check if entry customer matches:
            if (entry.customer && criteria.customers.length > 0) {
                const matches = customerMatch(entry);
                if (matches.length > 0 && matches.every(el => el === true)) {
                    allMatches.push(true);
                }
                else allMatches.push(false);
            }

            if (entry.contacts && criteria.contacts.length > 0) {
                const matches = contactMatch(entry);
                if (matches.length > 0 && matches.every(el => el === true)) {
                    allMatches.push(true);
                }
                else allMatches.push(false);
            }

            if (entry.tags && criteria.tags.length > 0) {
                const matches = tagMatch(entry);
                if (matches.length > 0 && matches.every(el => el === true)) {
                    allMatches.push(true);
                } 
                else allMatches.push(false);
            }

            if (allMatches.length > 0 && allMatches.every(el => el === true)) return true;
        })
    }
}

const sortEntries = (entries, criteria) => {
    console.log(`Sorting entries by ${criteria.sortBy} in ${criteria.sortDirection} order...`);

    if (criteria.sortBy === 'date') {
        entries = entries.sort((a, b) => {
            const a_date = new Date(
                a.timestamp.year, 
                a.timestamp.month - 1, 
                a.timestamp.day, 
                a.timestamp.hour,
                a.timestamp.minute,
                a.timestamp.second
            );
            const b_date = new Date(
                b.timestamp.year, 
                b.timestamp.month - 1, 
                b.timestamp.day, 
                b.timestamp.hour,
                b.timestamp.minute,
                b.timestamp.second
            );
            if (criteria.sortDirection === 'descending') {
                return a_date > b_date ? -1 : 1;
            }
            else return a_date > b_date ? 1 : -1;
        })
    }
    else if (criteria.sortBy === 'customer_name') {
        entries = entries.sort((a, b) => {
            const a_customer_name = a.customer ? a.customer.name : null;
            const b_customer_name = b.customer ? b.customer.name : null;
            if (criteria.sortDirection === 'descending') {
                return a_customer_name > b_customer_name ? -1 : 1;
            }
            else return a_customer_name > b_customer_name ? 1 : -1;
        })
    }
    else if (criteria.sortBy === 'flagged') {
        entries = entries.sort((a, b) => {
            if (criteria.sortDirection === 'descending') {
                return a.flagged > b.flagged ? 1 : -1;
            }
            else return a.flagged > b.flagged ? -1 : 1;
        })
    }

    return entries;
}

// display each entry on the page:
// regex is for the search function
const displayEntries = (entries, regex = null) => {
    console.log("Displaying Entries...");

    return entries
        .map((entry) => makeEntryHTML(entry, regex))
        .join("");
};

const displayContacts = (contacts, regex = null) => {
    console.log("DIsplaying Contacts...");

    return contacts
        .map(contact => makeContactCard(contact, regex))
        .join("");
}

// run on DOM content loaded:
window.addEventListener("load", () => {
  document.addEventListener("click", handleClicks);
  document.addEventListener("keyup", handleKeyUp);
  render(root, store);
});
