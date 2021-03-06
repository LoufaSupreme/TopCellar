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
  initializeTooltip();
};

// create content
const App = async (state) => {
    if (state.page === "index") {
        await loadStore(state);

        return `
            <section id='header'>
                <div class="navbar flex bottom-shadow">
                    ${makeNavBar()}
                </div>
                <div id='filter-accordion' class='accordion bottom-shadow'>
                    ${makeEntryFilterBox()}
                </div>
                <div id='sort-accordion' class='accordion bottom-shadow'>
                    ${makeEntrySortBox()}
                </div>
                <div id='alert-container' class=''></div>
            </section>
            <section id='main'>
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
                <div id='alert-container' class=''></div>
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
    else if (state.page === "kpi") {
        return `
            <section id='header'>
                <div class="navbar flex">
                    ${makeNavBar()}
                </div>
                <div id='alert-container' class=''></div>
            </section>
            <section id='main'>
                <canvas id="myChart" width="400" height="400"></canvas>
            </section>
            
        `;
    }
};

// loads relevant user data into the global store:
const loadStore = async (state) => {
    console.log("Fetching User Objects...");
    
    const promises = [
        getUser(),
        getList("Entries"),
        getList("Customers"),
        getList("Contacts"),
        getList("Tags"),
    ]

    return Promise.all(promises)
        .then(results => {
            state.user = results[0];
            state.entries = results[1];
            state.customers = results[2];
            state.contacts = results[3];
            state.tags = results[4];
            console.log({ store });
        })
        .catch(err => console.error(err));
}

//////////////////////////////////////
// HTML COMPONENTS ///////////////////
//////////////////////////////////////

//// navbar /////////////////////////
const makeNavBar = () => {
    return `
        <h1><a class='navbar-brand text-accent' href="/">TopCellar</a></h1>
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
                    <a id='kpi-link' class="nav-link" href="#">KPIs</a>
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

const makeAlert = (message, type) => {
    return `
        <div class='alert alert-${type}'>
            ${message}
        </div>
    `;
}
  

//// ROLODEX /////////////////////////////////

// create contact card html for one contact:
const makeContactCard = (contact, regex = null) => {
    let name = contact.name;
    let company = contact.company ? contact.company.name : "";
    let position = contact.position ? contact.position : "";
    let email = contact.email ? contact.email : "";
    let phone_cell = contact.phone_cell ? contact.phone_cell : "";
    let phone_office = contact.phone_office ? contact.phone_office : "";
    let notes = contact.notes ? 'Read Notes' : ''; 
    
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
        <div id='contact-${contact.id}' class='contact-card neupho'>
            <div class='contact-btns-container flex'>
                <button class='contact-card-edit' data-id=${contact.id}>Edit</button>
                <button class='contact-card-del' data-id=${contact.id}>Delete</button>
            </div>
            <div class='company-container'>
                <div class='company-info-container'>
                    <div class='company-logo'>?</div>
                    <div class='company-name'>${company}</div>
                </div>
            </div>
            <div class='accent-rect-container'>
                <div class='accent-rect'><i class='bi bi-person-circle'></i></div>
                <div class='accent-rect'><i class='bi bi-globe'></i></div>
                <div class='accent-rect'><i class='bi bi-telephone'></i></div>
                <div class='accent-rect'><i class='bi bi-card-list'></i></div>
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
                    <div class='notes' data-id='${contact.id}'>${notes}</div>
                </div>
            </div>
        </div>
    `;
}

// display the notes for a contact:
const makeContactNotes = (contact) => {
    return `
        <div class="prompt-container neupho container bg-dark text-white" id="contact-notes-container">
            <span class='text-accent fs-400'>${contact.name}</span>
            <span>Notes:</span>
            <div class='description fs-300 neupho inset'>${contact.notes}</div>
            <button id='contact-notes-btn' class='neupho bg-dark'>Close</button>
        </div>
    `;
}

//// INDEX ///////////////////////////////////

// generate HTML for one entry:
const makeEntryHTML = (entry, regex = null) => {

    // create object with ID, b/c we need it to create the bootstrap tooltip popup
    let contacts = entry.contacts.map(c => {
        return {
            html: `${c.first_name}${c.last_name !== null ? ' ' + c.last_name : ''}`,
            id: c.id,
        };
    });
    let tags = entry.tags.map(t => makeTagElement('tags', t.id, t.name));
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
        contacts = contacts.map(c => {
            c.html = c.html.replace(regex, (match) => {
                return `<span class='hl'>${match}</span>`;
            });
            return c;
        });

        tags = tags.map(t => {
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

    // add bootstrap tooltip to contact names, to display contact card popup:
    contacts = contacts.map(c => {
        const contact = store.contacts.find(person => person.id === c.id);
        return `
            <span data-bs-toggle='tooltip' data-bs-placement='top' data-bs-html='true' title="${makeContactCard(contact)}">
                ${c.html}
            </span>
        `;
    })

    // convert the tags array into an array of HTML
    tags = tags.map((t) => t.outerHTML);

    // make containers for each photo:
    const photos = entry.photos.map(photo => {
        return `
            <img src="${photo.url}" alt="entry ${entry.id} image" class="entry-img" data-id='${photo.id}'>
        `;
    }).join('');

    const rank = entry.rank !== null ? entry.rank : 0;
    const dollar_value = `$${formatNumber(entry.dollar_value)}`;

    return `
        <div id='entry-${entry.id}' class='neupho entry-container container bg-dark text-white'>
            <div class='flex'>
                <div class='flex entry-names-container'>
                    ${entry.customer !== null ? `<div class='entry-customer fs-500 text-accent'>${customerName}</div>` : ''}
                    ${contacts.length > 0 ? `<div class='entry-contacts fs-300 text-white'>${contacts.join('  &middot  ')}</div>`: ''}
                </div>
                <div class='flex entry-stats-container'>
                    <div class='fs-400 text-accent'>${rank}</div>
                    <div class='fs-300 text-white'>${dollar_value}</div>
                    <div class='fs-200 text-white'>${entry.timestamp.full}</div>
                </div>
            </div>
            <div class='description fs-300 neupho inset'>${description}</div>
            ${entry.tags.length > 0 ? `<div class='fs-300 neupho tag-container inset flex'>${tags.join('')}</div>` : ''}
            <div class='image-container'>
                ${photos}
            </div>
            <div class='entry-btn-container flex'>
                ${flagBtn}
                <button id='entry-${entry.id}-edit-btn' class='neupho round-btn bg-dark edit-entry-btn' data-id='${entry.id}'>
                    <i class='bi bi-pencil-square'></i>
                </button>
                <button id='entry-${entry.id}-delete-btn' class='neupho round-btn bg-dark delete-entry-btn' data-id='${entry.id}'>
                    <i class='bi bi-x-lg'></i>
                </button>
                <div class='select-container'>
                    <select class='neupho text-accent bg-dark' onchange='statusChange(this, ${entry.id})'>
                        <option value='active'>Active</option>
                        <option ${entry.completed ? 'selected' : ''} value='complete'>Complete</option>
                        <option ${entry.archived ? 'selected' : ''} value='archived'>Archived</option>
                    </select>
                    <span class='select-arrow'><i class='bi bi-chevron-down'></i></span>
                </div>
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
            let suggestion = '';

            // if it's a "tag" element, add an "x" button to allow it to be deleted directly from the dropdown:
            if (type === 'tags') {
                suggestion = `
                    <li class="suggestion ${type}-suggestion fs-300" data-type="${type}" data-inputID='${inputID}' data-id="${option.suggestion.id}">
                        <div class='flex suggestion-inner'>
                            <div class='suggestion-content'>${option.suggestion.name}</div>
                            <div class='suggestion-exit' data-id="${option.suggestion.id}">
                                <i class="bi bi-x"></i>
                            </div>
                        </div>
                    </li>
                `;
            }

            // otherwise if it's a 'customer' or 'contact' suggestion, don't make a 'x' btn:
            else {
                suggestion = `
                    <li class="suggestion ${type}-suggestion fs-300" data-type="${type}" data-inputID='${inputID}' data-id="${option.suggestion.id}">
                        ${option.suggestion.name}
                    </li>
                `;
            }

            return suggestion;
        })
        .join("");
        
    options = '<ul class="fs-200 text-white"><span id="suggestions-title">Choose Existing:</span>' + options + '</ul>';
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
                <input id="new-entry-customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("customers")}
            </div>
            <div class="neupho tag-container inset flex">
                <input id="new-entry-contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("contacts")}
            </div>
            <div class='description-wrapper flex'>
                <div id='description-error' class='input-error'>Error</div>
                <textarea class='description neupho inset bg-dark' placeholder="Description" cols="10" rows="1" required></textarea>
            </div>
            <input class='neupho inset' type="date" value="${now.getFullYear()}-${month}-${day}">
            <div class='flex form-input-flex'>
                <div class='input-wrapper flex'>
                    <input id='entry-value' class='neupho inset' type="number" placeholder="$ Value" oninput='rankCalc()'>
                </div>
                <div class='input-wrapper flex'>
                    <input id='entry-likelihood' class='neupho inset' type="number" placeholder="Likelihood" oninput='rankCalc()'>
                </div>
                <div class='input-wrapper flex'>
                    <div id='rank-error' class='input-error'>Error</div>
                    <input id='entry-rank' class='neupho inset' type="number" placeholder="Rank">
                </div>
            </div>
            <div class="tag-container neupho inset flex">
                <input id="new-entry-tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("tags")}
            </div>
            <input type='file' name='entry-images' multiple>
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="submit-new-btn">CREATE</button>
                <button type="buton" class='neupho bg-dark' id="cancel-new-btn">CANCEL</button>
            </div>
        </div>
    `;
};

// make html to render a new Contact form:
const makeContactForm = (contact = null) => {
    // if a contact is passed in, then preload the contact's info into the form:
    const title = contact ? 'Edit Contact' : 'New Contact';
    const btn = contact ? 'Accept' : 'Create';
    const type = contact ? 'edit' : 'new';
    const contact_id = contact ? contact.id : undefined;
    const first_name = contact ? contact.first_name : "";
    const last_name = contact ? contact.last_name : "";
    const position = contact ? contact.position : "";
    const phone_cell = contact ? contact.phone_cell : "";
    const phone_office = contact ? contact.phone_office : "";
    const email = contact ? contact.email : "";
    const notes = contact ? contact.notes : "";

    let company = "";
    if (contact) {
        if (contact.company) {
            company = makeTagElement('customers', contact.company.id, contact.company.name, 'unlocked').outerHTML;
        }
    }
    
    return `
        <div class="prompt-container neupho container bg-dark text-white" id="contact-form-container">
            <div class='text-accent fs-700'>${title}</div>
            <div class='name-wrapper flex'>
                <div id='name-error' class='input-error'>Error</div>
                <div class="neupho inset">
                    <input id="first-name-input" type="text" placeholder="First Name" value='${first_name}'required>
                </div>
            </div>
            <div class="neupho inset">
                <input id="last-name-input" type="text" placeholder="Last Name" value='${last_name}'>
            </div>
            <div class="neupho inset">
                <input id="position-input" type="text" placeholder="Title / Position" value='${position}'>
            </div>
            <div class="neupho inset">
                <input id="email-input" type="email" placeholder="Email" value='${email}'>
            </div>
            <div class="neupho inset">
                <input id="cell-input" class="" type="tel" pattern='^(1-)?[0-9]{3}-[0-9]{3}-[0-9]{4}' oninput='formatPhoneNum(this)' placeholder="Cell Phone" value='${phone_cell}'>
            </div>
            <div class="neupho inset">
                <input id="office-input" class="" type="tel" pattern='^(1-)?[0-9]{3}-[0-9]{3}-[0-9]{4}' oninput='formatPhoneNum(this)' placeholder="Office Phone" value='${phone_office}'>
            </div>
            <div class="neupho tag-container inset flex">
                ${company}
                <input id="customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Company" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("customers")}
            </div>
            <div class='description-wrapper flex'>
                <textarea id='notes-input' class='description neupho inset bg-dark' placeholder="Notes" cols="10" rows="1">${notes}</textarea>
            </div>
            <div class='form-btn-container flex'>
                <button type="button" class='neupho bg-dark' id="submit-${type}-btn" data-id='${contact_id}'>${btn}</button>
                <button type="button" class='neupho bg-dark' id="cancel-new-btn">Cancel</button>
            </div>
        </div>
    `;
}

// fires when an Edit btn is clicked within an existing entry
const makeEditForm = async (entryContainer) => {
    const entry_ID = entryContainer.id.split("-")[1];
    const entry = await getInstance("entry", entry_ID);
  
    let customerTag = '';
    if (entry.customer) {
        customerTag = makeTagElement("customers", entry.customer.id, entry.customer.name,'active').outerHTML;
    }

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
            <input id="customers-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account" onfocusout='inputFocusOut(this)'>
            ${makeSuggestionDiv("customers", entry_ID)}
        </div>
        <div class="tag-container neupho inset flex">
            ${contactTags}
            <input id="contacts-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts" onfocusout='inputFocusOut(this)'>
            ${makeSuggestionDiv("contacts", entry_ID)}
        </div>
        <div class='description-wrapper flex'>
            <div id='description-error' class='input-error'>Error</div>
            <textarea class='description neupho inset bg-dark' placeholder="Description" cols="10" rows="1">${entry.description}</textarea>
        </div>
            <input class='neupho inset' type="date" value="${entry.timestamp.year}-${month}-${day}">
            <div class='flex form-input-flex'>
                <div class='input-wrapper flex'>
                    <input id='entry-value' class='neupho inset' type="number" placeholder="$ Value" oninput='rankCalc(${entry_ID})' value='${entry.dollar_value}'>
                </div>
                <div class='input-wrapper flex'>
                    <input id='entry-likelihood' class='neupho inset' type="number" placeholder="Likelihood" oninput='rankCalc(${entry_ID})' value='${entry.likelihood}'>
                </div>
                <div class='input-wrapper flex'>
                    <div id='rank-error' class='input-error'>Error</div>
                    <input id='entry-rank' class='neupho inset' type="number" placeholder="Rank" value='${entry.rank}'>
                </div>
            </div>
        <div class="neupho tag-container inset flex">
            ${tagTags}
            <input id="tags-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags" onfocusout='inputFocusOut(this)'>
            ${makeSuggestionDiv("tags", entry_ID)}
        </div>
        <input type='file' name='entry-images' multiple>
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
// status = 'locked' means it will not be rendered with an 'x' btn to allow it to be removed
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
const makeEntryFilterBox = () => {
    return `
    <div class='accordion-title flex fs-300'>
        <i class="bi bi-funnel"></i>
        <span>Filter</span>
        <i class="bi bi-chevron-down"></i>
    </div>
    <div id='filter-container' class=''>
        <div class='flex'>
            <div class='select-container'>
                <select class='neupho bg-dark'>
                    <option value='new'>New Custom Filter</option>
                    <option value='custom1'>Custom Filter 1</option>
                    <option value='custom2'>Custom Filter 2</option>
                </select>
                <span class='select-arrow'><i class="bi bi-chevron-down"></i></span>
            </div>        
        </div>
        <div>
            <div class='flex'>
                <div class='flex flex-center'>Filter by: </div>
                <div class='select-container'>
                    <select id='filter-any-all' class='neupho bg-dark'>
                        <option value='any'>Any</option>
                        <option value='all'>All</option>
                    </select>
                    <span class='select-arrow'><i class="bi bi-chevron-down"></i></span>
                </div>
            </div>
            <div class="neupho tag-container inset flex">
                <input id="customers-input" class="tag-input filter-input" type="text" data-id="undefined" data-list="customers" placeholder="Accounts" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("customers")}
            </div>
            <div class="neupho tag-container inset flex">
                <input id="contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("contacts")}
            </div>
            <div class="tag-container neupho inset flex">
                <input id="tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags" onfocusout='inputFocusOut(this)'>
                ${makeSuggestionDiv("tags")}
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
            <div class='form-btn-container flex'>
                <button type="buton" class='neupho bg-dark' id="filter-btn">Filter</button>
            </div>
        </div>
    </div>
    `;
}

// create a form to apply sorting criteria to the entries:
const makeEntrySortBox = () => {
    return `
        <div class='accordion-title flex fs-300'>
            <i class="bi bi-arrow-down-up"></i>
            <span>Sort</span>
            <i class="bi bi-chevron-down"></i>
        </div>
        <div id='sort-container' class=''>
            <div class='flex'>
                <div class='select-container'>
                    <select id='sortBy' class='neupho bg-dark'>
                        <option value='date-created'>Date Created</option>
                        <option value='customer-name'>Customer Name</option>
                        <option value='date-flagged'>Date Flagged</option>
                        <option value='date-completed'>Date Completed</option>
                        <option value='date-archived'>Date Archived</option>
                        <option value='date-edited'>Date Edited</option>
                        <option value='priority'>Priority</option>
                        <option value='dollars'>Dollar Value</option>
                    </select>
                    <span class='select-arrow'><i class="bi bi-chevron-down"></i></span>
                </div>  
                <div class='select-container'>              
                    <select id='sortDirection' class='neupho bg-dark'>
                        <option value='descending'>Descending</option>
                        <option value='ascending'>Ascending</option>
                    </select>
                    <span class='select-arrow'><i class="bi bi-chevron-down"></i></span>
                </div>            
                <div class='form-btn-container flex'>
                    <button type="buton" class='neupho bg-dark' id="sort-btn">Sort</button>
                </div>
            </div>
        </div>
    `;
}

// create a button to make the new entry form appear:
const makeAddBtn = () => {
  
    return `
        <div class='toolbar-container flex'>
            <div class='toolbar flex'>
                <button id='add-btn' class='round-btn neupho bg-dark text-accent neupho'>
                    <i class="bi bi-plus-lg"></i>
                </button>
            </div>
        </div>
    `;
};

//////////////////////////////////////
// HELPER FUNCTIONS /////////////////
//////////////////////////////////////

// inserts commas to separate thousands:
// source: https://blog.abelotech.com/posts/number-currency-formatting-javascript/
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}


// auto calculates rank/priority when the value or likelihood inputs change
const rankCalc = async (entry_id = null) => {
    let form;
    // if an entry ID was passed, then this is an edit:
    if (entry_id) form = document.querySelector(`#entry-${entry_id}`);
    // otherwise it's a new entry:
    else form = document.querySelector('#entry-form-container');

    const entryValue = +form.querySelector('#entry-value').value;
    const entryLikelihood = +form.querySelector('#entry-likelihood').value;
    const rankInput = form.querySelector('#entry-rank');

    // fetch a summary of the existing entries dollar values:
    const valueData = await entryValueKPI();
    // normalize the inputted entry value b/w 0 and 10:
    const valueRange = valueData.max_value - valueData.min_value;
    const normalizedValue = Math.ceil((entryValue - valueData.min_value) / valueRange * 10);

    // calculate a suggested rank based on normalized dollar value and estimate of likelihood:
    const suggestedRank = normalizedValue * entryLikelihood; 
    if (suggestedRank <= 0) rankInput.value = '';
    else rankInput.value = suggestedRank;
    console.log(`Suggested Rank: ${rankInput.value}`);
}

// display error or success alerts:
const displayAlert = (msg, type) => {
    const alertContainer = document.querySelector('#alert-container');
    const alert = makeAlert(msg, type);
    alertContainer.innerHTML = alert;
    alertContainer.classList.toggle('show');

    setTimeout(() => {
        alertContainer.classList.toggle('show');
    }, 3000);
}

// initialize all the tooltips on the page
// https://getbootstrap.com/docs/5.0/components/tooltips/
const initializeTooltip = () => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tt => new bootstrap.Tooltip(tt));
}

// triggered via onfocusout event handler on .tag-input elements
// hides the suggestion dropdown box if focus is lost
const inputFocusOut = (input) => {
    // have to put inside a setTimeout, otherwise clicking on a suggestion dropdown item create a new tag properly, b/c the data from the dropdown menu will be gone
    setTimeout(() => {
        input.parentNode.querySelector('.suggestions').style.display = 'none';
    }, 100);
}

// add dashes to phonenumbers as user types.
// triggered by oninput in input[type='tel']
const formatPhoneNum = (inputField) => {
    const nums = inputField.value.split('-').join("");
    const countryCode = '1';
    const digits = nums[0] === countryCode ? 1 : 0;

    // get character position of the cursor:
    let cursorPosition = inputField.selectionStart;

    // add dashes (format 1-xxx-xxx-xxxx or xxx-xxx-xxxx):
    if (nums.length > digits+10) {
        inputField.value = `${digits === 1 ? nums.slice(0, digits) + '-' : ""}` + nums.slice(digits,digits+3) + '-' + nums.slice(digits+3,digits+6) + '-' + nums.slice(digits+6,digits+10);
    }
    else if (nums.length > digits+6) {
        inputField.value = `${digits === 1 ? nums.slice(0, digits) + '-' : ""}` + nums.slice(digits,digits+3) + '-' + nums.slice(digits+3,digits+6) + '-' + nums.slice(digits+6,nums.length);
    }
    else if (nums.length > digits+5) {
        inputField.value = `${digits === 1 ? nums.slice(0, digits) + '-' : ""}` + nums.slice(digits,digits+3) + '-' + nums.slice(digits+3,nums.length);
    }
    else if (nums.length > digits+3) {
        inputField.value = `${digits === 1 ? nums.slice(0, digits) + '-' : ""}` + nums.slice(digits, digits+3) + '-' + nums.slice(digits+3, nums.length);
    }
    else if (nums.length > 1 && digits === 1) {
        inputField.value = nums.slice(0,digits) + '-' + nums.slice(digits, nums.length);
    }

    // reseting the input value automatically puts the cursor at the end, which is annoying,
    // so reset the cursor back to where it was before, taking into account any dashes that we added...
    // if the character 1 space behind the cursor is a dash, then move the cursor up one character:
    if (inputField.value.slice(cursorPosition-1, cursorPosition) === '-') {
        cursorPosition++;
    }
    
    inputField.selectionStart = cursorPosition;
    inputField.selectionEnd = cursorPosition;
}

// creates a new entry:
// fired if user clicks on the accept btn in the popup modal (when creating entries with new customer or contacts):
const handleModalAccept = async () => {
    console.log('User has accepted creation of new objects...');
    // make the new entry form modal dissapear:
    const newEntryModal = document.querySelector('#new-entry-modal');
    newEntryModal.classList.remove('open');

    // 
    if (store.uncreated) {
        if (store.uncreated.customer) {
            const newCustomer = await newInstance(store.uncreated.customer, "customer");
            store.uncreated.customer.id = newCustomer.id;
            store.customers.unshift(newCustomer);
        }

        if (store.uncreated.contacts) {
            // create new contacts in db
            const newContacts = await newInstance(store.uncreated.contacts, "contact");
            store.contacts.unshift(...newContacts);

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
        console.log('Requesting creationg of new instance...');
        // make a new entry from the stored new entry details:
        if (store.uncreated.type === 'entry') updateCreateInstance(store.uncreated.data, "entry");
        // or make a new contact:
        else if (store.uncreated.type === 'contact') updateCreateInstance(store.uncreated.data, 'contact')

        store.uncreated = null; // reset to nothing
    } 
    else if (store.uncreated.mode === "update") {
        console.log('Requesting update of existing instance...');
        // update the instance:
        if (store.uncreated.type === 'entry') updateCreateInstance(store.uncreated.data, "entry", store.uncreated.data.id);
        else if (store.uncreated.type === 'contact') updateCreateInstance(store.uncreated.data, 'contact', store.uncreated.data.id);

        store.uncreated = null; // reset to nothing
    } 
    else {
        console.error("Uncreated Object mode is neither create nor update...");
    }
};

// creates and displays a modal for the user to choose whether to make new customer/contact objects, or go back and edit the entry before submitting.
const makePromptModal = (newObjects) => {
  const modal = document.querySelector("#add-objects-modal");
  const container = modal.querySelector(".prompt-container");

  const modalText = generateModalText(newObjects.customer, newObjects.contacts);

  container.innerHTML = modalText;
  modal.classList.add("open");
};

// fired when the "create" btn is clicked to submit a new entry
const initiateNewEntry = (form) => {
    console.log("Initiating new entry...");

    try {
        // get all the inputted data from the entry form
        const newEntryData = getFormData(form);

        // check if the form contains new customers or contacts:
        const newObjects = checkNewInstances(newEntryData, {mode:'create', type: 'entry'});

        // if there are some new objects, let the user know:
        if (newObjects.customer !== null || newObjects.contacts !== null) {
            console.log("Found new Customer or Contact instances. Prompting user...");

            // load new objects into store so they can be created if the user wishes
            store.uncreated = newObjects;

            // create a modal user prompt to ask them if they want to create the new objects
            makePromptModal(newObjects);
        } 
        // otherwise send post request to DB to make new entry:
        else {
            console.log('Creating new entry...');
            const newEntry = updateCreateInstance(newEntryData, 'entry');

            // if a new object is returned:
            if (newEntry) {
                // grab the modal of the form:
                const modal = document.querySelector('#new-entry-modal');
                // remove its visibility:
                modal.classList.remove('open');
            }
        }
    }
    catch (errorArray) {
        errorArray.forEach(err => console.error(err));
    }
};

// sends API call to make a new instance of type 'entry' or 'contact'
// updates DOM with newly created instance
// returns newly created instance
const updateCreateInstance = async (instanceData, instanceType, instance_ID = null) => {

    // grab DOM container that displays the instances (entries or customers depending on the page (index / rolodex))
    const objectsContainer = document.querySelector('#cards-container');
    let newObject;

    // if an ID has been passed in, then update the instance that has that ID:
    if (instance_ID) {
        newObject = await updateInstance(instanceData, instanceType, instance_ID);

        // if there's image data, add it to the new entry
        // then append each serialized photo that's returned to the newObject
        if (instanceData.photos) {
            console.log('Images found...');
            const newPhotos = await addFiles(instanceData.photos, newObject.id);
            newPhotos.forEach(photo => newObject.photos.push(photo));
        }
        
        // display the updated object instance:
        if (instanceType === 'entry') {
            // find it:
            oldEntryIndex = store.entries.findIndex(entry => entry.id === +instance_ID);
            // replace it:
            store.entries[oldEntryIndex] = newObject;
            // display it:
            objectsContainer.innerHTML = displayEntries(store.entries);
            initializeTooltip();
        }
        else if (instanceType === 'contact') {
            oldContactIndex = store.contacts.findIndex(contact => contact.id === +instance_ID);
            store.contacts[oldContactIndex] = newObject;
            objectsContainer.innerHTML = displayContacts(store.contacts);
            initializeTooltip();
        }
    }
    // otherwise, create a new instance:
    else {
        newObject = await newInstance(instanceData, instanceType);
        
        // if there's image data, add it to the new entry:
        if (instanceData.photos) {
            console.log('Images found...');
            newObject.photos = await addFiles(instanceData.photos, newObject.id);
        }

        // display the new object instance:
        if (instanceType === 'entry') {
            // add new entry to store:
            store.entries.unshift(newObject);
            // display it:
            objectsContainer.innerHTML = displayEntries(store.entries);
              initializeTooltip();
        }
        else if (instanceType === 'contact') {
            store.contacts.unshift(newObject);
            objectsContainer.innerHTML = displayContacts(store.contacts);
            initializeTooltip();
        }
    }

    return newObject;
}

// fired when the "create" or "accept" btn is clicked to make/edit a contact:
const initiateNewContact = async (form, contact_id = null) => {

    try {
        // get all the inputted data from the entry form
        const newContactData = getContactFormData(form);
        let newObjects;

        if (contact_id) {
            console.log(`Initiating edit of contact ${contact_id}`);
            newObjects = checkNewInstances(newContactData, {mode:'update', type: 'contact'});
            newObjects.data.id = contact_id;
        }
        else {
            console.log('Initiating new contact...');
            newObjects = checkNewInstances(newContactData, {mode:'create', type: 'contact'});
        }

        // if there are some new objects, let the user know:
        if (newObjects.customer !== null) {
            console.log("Found new Customer instance. Prompting user...");
            store.uncreated = newObjects; // load new objects into store so they can be created if the user wishes
            makePromptModal(newObjects); // create a modal user prompt to ask them if they want to create the new objects        
        }
        else {
            // otherwise send post/put request to DB to create/edit:
            let newContactInfo;
            if (!contact_id) {
                console.log('Sending request to create new contact...')
                newContactInfo = updateCreateInstance(newContactData, "contact"); 
            }

            else {
                console.log(`Sending request to update contact ${contact_id}...`)
                newContactInfo = updateCreateInstance(newContactData, 'contact', contact_id);
            }

            // if a new object is returned:
            if (newContactInfo) {
                // grab the modal of the form:
                const modal = document.querySelector('#new-entry-modal');
                // remove its visibility:
                modal.classList.remove('open');
            }
            else console.error('Something went wrong. No new contact info returned.');
        }
    }
    catch (errorArray) {
        errorArray.forEach(err => console.error(err));
    }
}

const initiateEdit = (form, entry_id) => {
    console.log(`Initiating update for Entry ${entry_id}`);
    const originalEntry = store.entries.find(entry => entry.id === parseInt(entry_id));

    // get all the inputted data from the entry form
    const newEntryData = getFormData(form);
    // replace the flagged/archived/completed data with this entries real data
    // have to do this because the getFormData function assumes them all to be false, bc there's no input for them in the form.  
    newEntryData.flagged = originalEntry.flagged;
    newEntryData.archived = originalEntry.archived;
    newEntryData.completed = originalEntry.completed;

    newEntryData.date_flagged = originalEntry.date_flagged;
    newEntryData.date_completed = originalEntry.date_completed;
    newEntryData.date_archived = originalEntry.date_archived;

    // set the edited date to now:
    newEntryData.date_edited = rightAboutNow();

    const newObjects = checkNewInstances(newEntryData, {mode:'update', type: 'entry'});
    console.log(newObjects)
    newObjects.data.id = entry_id;

    // if there are some new objects, let the user know:
    if (newObjects.customer !== null || newObjects.contacts !== null) {
        console.log("Found new Customer or Contact instances. Prompting user...");
        store.uncreated = newObjects; // load new objects into store so they can be created if the user wishes
        makePromptModal(newObjects); // create a modal user prompt to ask them if they want to create the new objects
    } 
    else {
        // otherwise send put request to DB to update the entry:
        updateCreateInstance(newEntryData, "entry", entry_id);
    }
};

// takes the data from an entry form or contact form (new or edit) and checks if there are customers or contacts that don't yet exist:
// returns the new objects in a newObjects object:
// params = {mode: "update" or "create, type: "contact" or "entry"}
const checkNewInstances = (data, params) => {
  const customer = data.customer || data.company;
  const contacts = data.contacts || [];

  // check for inputted customers or contacts that don't yet exist and add them to a newObjects object
  const newContacts = contactExists(contacts);

  const newObjects = {
    mode: params.mode,
    type: params.type,
    customer: !customerExists(customer) ? customer : null,
    contacts: newContacts.length > 0 ? newContacts : null,
    data: data,
  };

  return newObjects;
};

// checks if a passed customer object already exists:
// returns boolean
const customerExists = (customer) => {
    if (!customer) return true;
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
    // reset all form validation error messages:
    const errorMsgs = form.querySelectorAll('.input-error');
    errorMsgs.forEach(msg => msg.classList.remove('active'));
    
    // grab all of the tag elements:
    const tagElements = Array.from(form.querySelectorAll(".tag"));

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

    // array to catch any validation errors:
    const errorBucket = [];
    const description = form.querySelector("textarea").value;
    if (description === '') {
        errorBucket.push("Description can't be blank");
        const descriptionError = form.querySelector('#description-error');
        descriptionError.innerText = "Description can't be blank";
        descriptionError.classList.add('active');
    }

    const dollar_value = form.querySelector('#entry-value').value;
    const likelihood = form.querySelector('#entry-likelihood').value;

    const rank = form.querySelector('#entry-rank').value;
    // check if rank is a number
    if (!rank.match(/^\d+$/) && rank !== '') {
        errorBucket.push('Only numbers accepted');
        const rankError = form.querySelector('#rank-error');
        rankError.innerText = "Only numbers accepted";
        rankError.classList.add('active');
    }

    const date = form.querySelector('input[type="date"]').value.split("-");
    const time = new Date();

    // get all the images uploaded to the form and add to FormData instance:
    const images = form.querySelector('input[type="file"]').files;
    let imageFormData = new FormData();
    // append images to FormData object:
    for (let i = 0; i < images.length; i++) {
        imageFormData.append('images', images.item(i));
    }
    if (images.length === 0) imageFormData = null;

    // create details for new entry:
    const newEntryDetails = {
        customer: customer,
        contacts: contacts,
        tags: tags,
        description: description,
        dollar_value: dollar_value,
        likelihood: likelihood,
        rank: rank,
        timestamp: {
        year: parseInt(date[0]),
        month: parseInt(date[1]),
        day: parseInt(date[2]),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
        },
        flagged: false,
        archived: false,
        completed: false,
        photos: imageFormData,
    };

    console.log("Got form data:");
    console.log(newEntryDetails);

    // if validation errors occured, throw an array of those errors:
    if (errorBucket.length > 0) throw errorBucket;
    // otherwise return the entry details:
    return newEntryDetails;
};

// get the data from the new contact form:
const getContactFormData = (form) => {
    // reset any form validation error msgs:
    const errorMsgs = form.querySelectorAll('.input-error');
    errorMsgs.forEach(msg => msg.classList.remove('active'));
    
    // grab all of the tag elements
    const tagElements = Array.from(form.querySelectorAll(".tag")); 

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

    // validation:
    const errorBucket = [];
    if (first_name === '') {
        const errorMsg = form.querySelector('#name-error');
        errorMsg.innerText = "First name can't be blank";
        errorMsg.classList.add('active');
        errorBucket.push("First name can't be blank");
    }

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

    // if there were validation errors, throw the errorBucket
    if (errorBucket.length > 0) throw errorBucket;

    // otherwise, return the data:
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

// handles a dropdown suggestion being clicked:
const handleSuggestionClicked = (suggestion) => {
    // get the input associated with that suggestion (has id = suggestion.dataset.inputid):
    const input = document.querySelector(`#${suggestion.dataset.inputid}`);
    input.value = suggestion.innerText; // load the input
    input.dataset.id = suggestion.dataset.id; // set the data-id of the input to the same as the value object

    addTag(input);
    input.focus(); // resume focus on the input box
};

// deletes an entry:
const handleEntryDelete = (entry_id) => {
  const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
  entryContainer.remove(); // remove it from DOM
  deleteInstance("entry", entry_id);
};

// deletes a contact:
const handleContactDelete = (contact_id) => {
    const contactCard = document.querySelector(`#contact-${contact_id}`);
    contactCard.remove();
    deleteInstance('contact', contact_id);
}

// helper function
// returns a json object for the date/time of right meow:
const rightAboutNow = () => {
    let now = new Date();
    return {
        day: now.getDate(),
        month: now.getMonth()+1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
    }
}

// changes entry flagged status:
const handleEntryFlag = (entry_id) => {
    const entry = store.entries.find(entry => entry.id === parseInt(entry_id));
    const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
    const flagBtn = entryContainer.querySelector('.fave-entry-btn');

    const flagTime = rightAboutNow();
    
    if (entry.flagged) {
        flagBtn.classList.remove('inset');
        flagBtn.innerHTML = "<i class='bi bi-flag'></i>";  
        entry.flagged = false;
        entry.date_flagged = null;
        updateInstance(entry, 'entry', entry_id);  
    }
    else {
        flagBtn.classList.add('inset');
        flagBtn.innerHTML = "<i class='bi bi-flag-fill'></i>";  
        entry.flagged = true; 
        entry.date_flagged = flagTime; 
        updateInstance(entry, 'entry', entry_id);  
    }
}

// changes entry status (input via dropdown select)
// fired from the select dropdown onchange event
const statusChange = (dropdown, entry_id) => {
    const entry = store.entries.find(entry => entry.id === parseInt(entry_id));

    if (dropdown.value === 'active') {
        entry.completed = false;
        entry.date_completed = null;
        entry.archived = false;
        entry.date_archived = null;
    }
    else if (dropdown.value === 'complete') {
        entry.completed = true;
        entry.date_completed = rightAboutNow();
        entry.archived = false;
        entry.date_archived = null;
    }
    else if (dropdown.value === 'archived') {
        entry.completed = false;
        entry.date_completed = null;
        entry.archived = true;
        entry.date_archived = rightAboutNow();
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
    
    // fires when user clicks big "+" btn:
    // generates new entry form for entry creation:
    if (e.target.id === "add-btn") {
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
    
    // fires when the entry submit button is clicked:
    else if (e.target.id === "submit-new-btn") {
        if (store.page === 'index') {
            console.log('User submitting data for new entry...')
            // grab the form from which the entry data came from:
            const form = document.querySelector("#entry-form-container"); 
            initiateNewEntry(form); // initiate the creation of a new entry            
        }
        else if (store.page === 'rolodex') {
            console.log('User submitting data for new contact...')
            // grab the form from which the entry data came from:
            const form = document.querySelector('#contact-form-container');
            initiateNewContact(form);
        }
    }

    else if (e.target.id === "cancel-new-btn") {
        const modal = document.querySelector('#new-entry-modal');
        modal.classList.remove('open');
    }

    // submit when editing an existing contact:
    else if (e.target.id === 'submit-edit-btn') {
        const form = document.querySelector('#contact-form-container');
        initiateNewContact(form, +e.target.dataset.id);
    }

    // fires when a customer or contact suggestion is clicked:
    else if (e.target.classList.contains('suggestion')) {
        handleSuggestionClicked(e.target);
    }

    // fires when a tag type dropdown suggestion is clicked:
    // tag suggetsions are more complicated b/c they contain an 'x' btn
    else if (e.target.classList.contains("suggestion-inner")) {
        handleSuggestionClicked(e.target.parentElement);
    }

    // fires when 'x' is clicked inside tag suggestion
    // deletes a tag element from the db and store:
    else if (e.target.classList.contains('suggestion-exit')) {
        const suggestion_id = +e.target.dataset.id;
        const deleteStatus = deleteInstance('tag', suggestion_id);
        // if delete was successful, then remove it from the store as well:
        if (deleteStatus) {
            const tagIndex = store.tags.findIndex(t => t.id === suggestion_id);
            store.tags.splice(tagIndex, 1);
        }
    }

    // cancel or accept changes btn on user prompt modal to add customers and contacts:
    else if (e.target.classList.contains("modal-btn")) {
        const modal = document.querySelector("#add-objects-modal");
        if (e.target.id === "modal-accept-btn") handleModalAccept();
        modal.classList.remove("open");
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
        initializeTooltip();
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
        initializeTooltip();
    }

    // fires when user clicks "filter" or "sort" beside the add btn
    else if (e.target.classList.contains('accordion')) {
        e.target.classList.toggle('accordion-open');
        const chevron = e.target.querySelector('.bi-chevron-down');
        chevron.classList.toggle('bi-chevron');
        chevron.classList.toggle('bi-chevron-up');
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

    // click on KPI nav link - switch page
    else if (e.target.id === 'kpi-link') {
        e.preventDefault();
        store.page = 'kpi';
        render(root, store);
    }

    // click on "delete" btn inside contact card:
    else if (e.target.classList.contains('contact-card-del')) {
        const contact_id = e.target.dataset.id;
        handleContactDelete(contact_id);
    }

    // click on 'edit' btn inside contact card:
    else if (e.target.classList.contains('contact-card-edit')) {
        const contact = store.contacts.find(el => el.id === +e.target.dataset.id);
        const contactForm = makeContactForm(contact);
        const modal = document.querySelector('#new-entry-modal');
        modal.innerHTML = contactForm;
        modal.classList.add('open');
    }

    // click on notes section of contact card:
    else if (e.target.classList.contains('notes')) {
        const contact = store.contacts.find(el => el.id === +e.target.dataset.id);
        const modal = document.querySelector('#new-entry-modal');
        modal.innerHTML = makeContactNotes(contact);
        modal.classList.add('open');
    }

    // click on close btn in contact notes modal:
    else if (e.target.id === 'contact-notes-btn') {
        const modal = document.querySelector('#new-entry-modal');
        modal.classList.remove('open');
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
        options = findMatches(inputBox.value, listItems, ["first_name", "last_name"]);
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
        initializeTooltip();
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
        initializeTooltip();
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
        suggestionArea.style.setProperty('transform', `translateY(${parentHeight-5}px)`);

        suggestionArea.style.setProperty('width', `75%`);

        const listType = inputBox.dataset.list;

        // if the input box is not empty and its in focus, display the suggestions:
        if (inputBox.value.trim() !== '' && inputBox === document.activeElement) {
            const options = listSuggestions(inputBox);
            if (options.length > 0) {
                suggestionArea.style.display = "block";
                suggestionArea.innerHTML = displaySuggestions(inputBox.id, options, listType);
            }
            else suggestionArea.style.display = "none";
        }
        else suggestionArea.style.display = "none";
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
    const results = arr.filter((el) => {
        const regex = new RegExp(targetWord, "gi");
        return propertyList
            .map((prop) => {
                return el[prop] !== null ? el[prop].match(regex) : null;
            })
            .filter((prop) => prop !== null)[0];
    });
    return results;
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

    if (criteria.sortBy.includes('date')) {
        let dateCategory = '';
        if (criteria.sortBy.includes('created')) dateCategory = 'timestamp';
        else if (criteria.sortBy.includes('completed')) dateCategory = 'date_completed';
        else if (criteria.sortBy.includes('edited')) dateCategory = 'date_edited';
        else if (criteria.sortBy.includes('archived')) dateCategory = 'date_archived';
        else if (criteria.sortBy.includes('flagged')) dateCategory = 'date_flagged';

        entries = entries.sort((a, b) => {
            console.log('count')
            if (a[dateCategory] === b[dateCategory]) return 0;
            if (!a[dateCategory]) return 1;
            if (!b[dateCategory]) return -1;
            
            const a_date = new Date(
                a[dateCategory].year, 
                a[dateCategory].month - 1, 
                a[dateCategory].day, 
                a[dateCategory].hour,
                a[dateCategory].minute,
                a[dateCategory].second
            );
            const b_date = new Date(
                b[dateCategory].year, 
                b[dateCategory].month - 1, 
                b[dateCategory].day, 
                b[dateCategory].hour,
                b[dateCategory].minute,
                b[dateCategory].second
            );
            if (criteria.sortDirection === 'descending') {
                return a_date > b_date ? -1 : 1;
            }
            else return a_date > b_date ? 1 : -1;
        });
    }
    
    else if (criteria.sortBy === 'customer-name') {
        entries = entries.sort((a, b) => {
            const a_customer_name = a.customer ? a.customer.name : null;
            const b_customer_name = b.customer ? b.customer.name : null;
            if (criteria.sortDirection === 'descending') {
                return a_customer_name > b_customer_name ? -1 : 1;
            }
            else return a_customer_name > b_customer_name ? 1 : -1;
        })
    }

    else if (criteria.sortBy === 'priority') {
        entries = entries.sort((a, b) => {
            if (criteria.sortDirection === 'ascending') {
                return a.rank > b.rank ? 1 : -1;
            }
            else return a.rank > b.rank ? -1 : 1;
        })
    }

    else if (criteria.sortBy === 'dollars') {
        entries = entries.sort((a, b) => {
            if (criteria.sortDirection === 'ascending') {
                return a.dollar_value > b.dollar_value ? 1 : -1;
            }
            else return a.dollar_value > b.dollar_value ? -1 : 1;
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
    console.log("Displaying Contacts...");

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
