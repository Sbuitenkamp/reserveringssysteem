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
    let dataToSend = {};
    const children = [...node.children].splice(0, node.children.length - 2);
    for (const child of children) {
        if (child.className.match(/ +/)) child.className = child.className.split(/ +/g)[1];
        dataToSend[child.className] = child.childNodes[1].value;
    }
    $.post('/reservation-pop-up', dataToSend, data => {
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

function updateReservation(form) {
    if (!form) return alert('Er is iets misgegaan');
    const { costTotal, costPaid, number } = formToJSON(form);
    ws.send(JSON.stringify({
        type: 'update',
        table: 'reservations',
        options: {
            where: { number }
        },
        values: {
            costTotal,
            costPaid,
            amountUnpaid: costTotal - costPaid
        }
    }));
    hidePopUp();
}