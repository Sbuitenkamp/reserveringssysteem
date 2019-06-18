const ws = new WebSocket('ws://localhost:40510');

function makeActive() {
    const node = document.querySelector(`.link>a[href="${window.location.pathname}"]`);
    const active = document.querySelector('.active');
    if (active) active.classList.remove('active');
    if (node) node.parentElement.classList.add('active');
}

function showPopUp(node) {
    const dataToSend = node.children[0].children[0].value;
    const location = window.location.pathname.substr(1).split(/-+/g)[0];
    if (location === 'reservation') $.post('/reservation-pop-up', { number: dataToSend }, data => renderPopUp(data));
    else if (location === 'guest') $.post('/guest-pop-up', { number: dataToSend }, data => renderPopUp(data));
}

function renderPopUp(data) {
    const container = document.querySelector('#pop-up-container');
    const popUp = document.createElement('div');
    container.appendChild(popUp);
    container.style.display = 'flex';
    setTimeout( () => {
        container.classList.add('animate-pop-up');
    }, 50);
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

function determineType(node, type) {
    if (type === 'reservering')  {
        const number = node.id.splice(0, -1);
        return { number };
    } else if (type === 'rij') {
        const idString = outerParent().id;
        const id = Number(idString.substr(idString.length - 1));
        return { id };
    }
}

function updateReservation(form) {
    if (!form) return error('Er is iets misgegaan');

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

function deleteReservation(node) {
    if (!node) return;
    const type = node.className === 'deleteReservation' ? 'reservering' : 'rij';
    const confirm = window.confirm(`Weet u zeker dat u deze ${type} wilt verwijderen?`);
    let options = {};
    if (!confirm) return;
    options.where = determineType(node , type);
    ws.send(JSON.stringify({
        type: 'destroy',
        table: 'reservations',
        options
    }))
}

function error(message) {
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
