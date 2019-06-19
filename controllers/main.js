const ws = new WebSocket('ws://localhost:40510');
let expanded = false;

function makeActive() {
    const node = document.querySelector(`.link>a[href="${window.location.pathname}"]`);
    const active = document.querySelector('.active');
    if (active) active.classList.remove('active');
    if (node) node.parentElement.classList.add('active');
}

function showPopUp({ node, location, table }) {
    let dataToSend;
    if (node) dataToSend = node.children[0].children[0].value;
    if (!location) location = window.location.pathname.substr(1).split(/-+/g)[0];
    $.post('/pop-up', { number: dataToSend, location, table }, data => renderPopUp(data));
}

function renderPopUp(data) {
    const container = document.querySelector('#pop-up-container');
    const popUp = document.createElement('div');
    container.appendChild(popUp);
    container.style.display = 'flex';
    setTimeout( () => container.classList.add('animate-pop-up'), 50);
    popUp.innerHTML = data;
    popUp.className = 'pop-up';
    popUp.id = 'pop-up';
    popUp.style.display = 'flex';
}

function hidePopUp() {
    const node = document.querySelector('#pop-up-container');
    node.classList.remove('animate-pop-up');
    setTimeout( () => {
        node.innerHTML = '';
        node.style.display = 'none';
    }, 200);
}

function outerParent(elt) {
    while (elt && (elt.tagName !== "TR" || !elt.id)) elt = elt.parentNode;
    if (elt) return elt;
}

function error(message) {
    // TODO: create error function for error display
    alert(message);
}

// event emitted when connected
function wsOnOpen() {
    // getting table name from path location
    const table = window.location.pathname.substr(1).split(/-+/g)[0] + 's';
    // sending a send event to websocket server
    ws.send(JSON.stringify({
        table,
        type: 'select',
        options: {}
    }));
}

function wsOnMessage(ev) {
    const location = window.location.pathname.substr(1).split(/-+/g)[0];
    const data = JSON.parse(ev.data);
    const table = document.querySelector('table');
    if (data.update || data.destroy) return reload(table);
    for (const dataEntry of data) {
        // rendering the data in a row
        if (location === 'reservation') table.innerHTML += reservationRow(dataEntry);
        else if (location === 'guest') table.innerHTML += guestRow(dataEntry);
    }
}

// database operations
function addEntry(data) {
    if (!data) return error('Er is iets misgegaan');
    console.log(data);
}

function updateEntry(data) {
    if (!data) return error('Er is iets misgegaan');

    ws.send(JSON.stringify({
        type: 'update',
        table: 'reservations',
        options,
        values: {
            costTotal,
            costPaid,
            amountUnpaid: costTotal - costPaid
        }
    }));
    hidePopUp();
}

function deleteEntry(data) {
    if (!data) return;
    const confirm = window.confirm(`Weet u zeker dat u deze record wilt verwijderen?`);
    let options = { number: data.number };
    if (!confirm) return;
    ws.send(JSON.stringify({
        type: 'destroy',
        table: data.table,
        options
    }));
}

// form to json
function isValidElement(element) {
    return element.name && element.value;
}

function isValidValue(element) {
    return (!['checkbox', 'radio'].includes(element.type) || element.checked);
}

function isCheckbox(element) {
    return element.type === 'checkbox';
}

function isMultiSelect(element) {
    return element.options && element.multiple;
}

function getSelectValues(options) {
    [].reduce.call(options, (values, option) => {
        return option.selected ? values.concat(option.value) : values;
    }, []);
}

function formToJSON(elements) {
    [].reduce.call(elements, (data, element) => {
        if (isValidElement(element) && isValidValue(element)) {
            if (isCheckbox(element)) data[element.name] = (data[element.name] || []).concat(element.value);
            else if (isMultiSelect(element)) data[element.name] = getSelectValues(element);
            else data[element.name] = element.value;
        }
        return data;
    }, {});
}