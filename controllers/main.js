const ws = new WebSocket('ws://localhost:40510');

function validateNode(node) {
    if (node.nodeName === '#text') return true;
    if (node.className.includes('date')) return true;
    if (node.className.includes('address')) return true;
    if (node.className.includes('mobilePhone')) return true;
    if (node.className.includes('validation')) return true;
    if (node.className.includes('createdAt')) return true;
    if (node.className.includes('delete')) return true;
    if (node.className.includes('edit')) return true;
}

function makeActive(node) {
    const active = document.querySelector('.active');
    if (active) active.classList.remove('active');
    if (node) node.parentElement.classList.add('active');
}

function showPopUp(node) {
    const dataToSend = node.children[0].children[0].value;
    $.post('/reservation-pop-up', { number: dataToSend }, data => {
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
    });
}

function hidePopUp() {
    const node = document.querySelector('#pop-up-container');
    node.classList.remove('animate-pop-up');
    setTimeout( () => {
        node.innerHTML = '';
        node.style.display = 'none';
    }, 200);
}

function formToJSON (elements) {
    return [].reduce.call(elements, (data, element) => {
        if (element.tagName === 'BUTTON') return data;
        data[element.name] = element.value;
        return data;
    }, {});
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