// event emmited when connected
ws.onopen = () => {
    // sending a send event to websocket server
    ws.send(JSON.stringify({
        table: 'reservations',
        type: 'select',
        options: {
            attributes: {
                exclude: [
                    'id',
                    'guestId',
                    'itemId',
                    'objectId'
                ]
            },
            // group: ['number'],
            include: [
                {
                    association: 'reservationGuest',
                    attributes: [
                        'name',
                        'email',
                        'phone',
                        'mobilePhone',
                        'firstArrival',
                        'address',
                        'cityTown',
                        'licensePlate'
                    ]
                },
                {
                    association: 'reservationObject',
                    attributes: ['description']
                }
            ]
        }
    }));
};
// event emmited when receiving message
ws.onmessage = ev => {
    const data = JSON.parse(ev.data);
    let renderedNumbers = [];
    for (const dataEntry of data) {
        if (renderedNumbers.includes(dataEntry.number)) {
            const row = document.querySelector(`#row${dataEntry.number}`);
            const parts = [...row.childNodes.values()];
            parts.forEach(part => {
                if (part.nodeName === '#text') return;
                if (part.className.includes('date')) return;
                if (part.className.includes('address')) return;
                if (part.className.includes('mobilePhone')) return;
                if (part.className.includes('validation')) return;
                if (part.className.includes('createdAt')) return;
                let classes = part.className.split(/ +/g);
                if (part.className.includes('cost') || part.className.includes('amountUnpaid')) {
                    part.innerHTML = Number(part.innerHTML) + dataEntry[classes[0]];
                } else {
                    if (classes.length === 1) {
                        if (typeof dataEntry[classes[0]] === 'boolean') return;
                        if (`${dataEntry[classes[0]]}` !== part.innerHTML) part.innerHTML += ', ' + dataEntry[classes[0]];
                    } else {
                        if (typeof dataEntry[classes[0]][classes[1]] === 'boolean') return;
                        if (`${dataEntry[classes[0]][classes[1]]}` !== part.innerHTML) part.innerHTML += ', ' + dataEntry[classes[0]][classes[1]];
                    }
                }
            })
        } else {
            renderedNumbers.push(dataEntry.number);
            document.querySelector('table').innerHTML += `
<tr id="row${dataEntry.number}">
    <td class="number">${dataEntry.number}</td>
    <td class="reservationGuest name">${dataEntry.reservationGuest.name}</td>
    <td class="dateArrival">${dataEntry.dateArrival}</td>
    <td class="dateDeparture">${dataEntry.dateDeparture}</td>
    <td class="reservationObject description">${dataEntry.reservationObject.description}</td>
    <td class="status">${dataEntry.status}</td>
    <td class="costTotal">${dataEntry.costTotal}</td>
    <td class="costPaid">${dataEntry.costPaid}</td>
    <td class="amountUnpaid">${dataEntry.amountUnpaid}</td>
    <td class="unpaidSince">${dataEntry.unpaidSince}</td>
    <td class="reservationGuest email">${dataEntry.reservationGuest.email}</td>
    <td class="reservationGuest firstArrival">${dataEntry.reservationGuest.firstArrival ? 'ja' : 'nee'}</td>
    <td class="validationStatus">${dataEntry.validationStatus || 'geen'}</td>
    <td class="createdAt">${dataEntry.createdAt}</td>
    <td class="bookMethod">${dataEntry.bookMethod}</td>
    <td class="reservationGuest phone">${dataEntry.reservationGuest.phone}</td>
    <td class="reservationGuest mobilePhone">${dataEntry.reservationGuest.mobilePhone || 'geen'}</td>
    <td class="reservationGuest address">${dataEntry.reservationGuest.address}, ${dataEntry.reservationGuest.cityTown}</td>
    <td class="preferredReservation">${dataEntry.preferedReservation ? 'ja' : 'nee'}</td>
    <td class="reservedPlace">${dataEntry.reservedPlace}</td>
    <td class="reservationGuest licensePlate">${dataEntry.reservationGuest.licensePlate}</td>
</tr>
`.trim();
        }
    }
};