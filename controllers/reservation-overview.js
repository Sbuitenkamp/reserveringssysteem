window.onload = makeActive(document.querySelector('.link>a[href="/reservation-overview"]'))

// event emitted when connected
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
// event emitted when receiving message
ws.onmessage = ev => {
    const data = JSON.parse(ev.data);
    let renderedNumbers = [];
    console.log(data);
    for (const dataEntry of data) {
        if (renderedNumbers.includes(dataEntry.number)) {
            const row = document.querySelector(`#row${dataEntry.number}`);
            const parts = [...row.childNodes.values()];
            // grouping by number and adding to existing row
            parts.forEach(part => {
                if (validateNode(part)) return;
                let classes = part.className.split(/ +/g);
                if (part.className.includes('cost') || part.className.includes('amountUnpaid')) part.childNodes[1].value = Number(part.childNodes[1].value) + dataEntry[classes[0]];
                else {
                    if (classes.length === 1) {
                        if (typeof dataEntry[classes[0]] === 'boolean') return;
                        if (`${dataEntry[classes[0]]}` !== part.childNodes[1].value) part.childNodes[1].value += ', ' + dataEntry[classes[0]];
                    } else {
                        if (typeof dataEntry[classes[0]][classes[1]] === 'boolean') return;
                        if (`${dataEntry[classes[0]][classes[1]]}` !== part.childNodes[1].value) part.childNodes[1].value += ', ' + dataEntry[classes[0]][classes[1]];
                    }
                }
            })
        } else {
            // rendering the data in a row
            renderedNumbers.push(dataEntry.number);
            document.querySelector('table').innerHTML += `
<form action="/reservation-pop-up" method="get">
    <tr onclick="showPopUp(this)" id="row${dataEntry.number}">
        <td class="number">
            <input class="data-entry" name="number" type="text" value="${dataEntry.number}" disabled>
        </td>
        <td class="reservationGuest name">
            <input class="data-entry" name="name" type="text" value="${dataEntry.reservationGuest.name}" disabled>
        </td>
        <td class="dateArrival">
            <input class="data-entry" name="dateArrival" type="text" value="${dataEntry.dateArrival}" disabled>
        </td>
        <td class="dateDeparture">
            <input class="data-entry" name="dateDeparture" type="text" value="${dataEntry.dateDeparture}" disabled>
        </td>
        <td class="reservationObject description">
            <input class="data-entry" name="description" type="text" value="${dataEntry.reservationObject.description}" disabled>
        </td>
        <td class="status">
            <input class="data-entry" name="status" type="text" value="${dataEntry.status}" disabled>
        </td>
        <td class="costTotal">
            <input class="data-entry" name="costTotal" type="text" value="${dataEntry.costTotal}" disabled>
        </td>
        <td class="costPaid">
            <input class="data-entry" name="costPaid" type="text" value="${dataEntry.costPaid}" disabled>
        </td>
        <td class="amountUnpaid">
            <input class="data-entry" name="amountUnpaid" type="text" value="${dataEntry.amountUnpaid}" disabled>
        </td>
        <td class="unpaidSince">
            <input class="data-entry" name="unpaidSince" type="text" value="${dataEntry.unpaidSince}" disabled>
        </td>
        <td class="reservationGuest email">
            <input class="data-entry" name="email" type="text" value="${dataEntry.reservationGuest.email}" disabled>
        </td>
        <td class="reservationGuest firstArrival">
            <input class="data-entry" name="firstArrival" type="text" value="${dataEntry.reservationGuest.firstArrival ? 'ja' : 'nee'}" disabled>
        </td>
        <td class="validationStatus">
            <input class="data-entry" name="validationStatus" type="text" value="${dataEntry.validationStatus || 'geen'}" disabled>
        </td>
        <td class="createdAt">
            <input class="data-entry" name="createdAt" type="text" value="${dataEntry.createdAt}" disabled>
        </td>
        <td class="bookMethod">
            <input class="data-entry" name="bookMethod" type="text" value="${dataEntry.bookMethod}" disabled>
        </td>
        <td class="reservationGuest phone">
            <input class="data-entry" name="phone" type="text" value="${dataEntry.reservationGuest.phone}" disabled>
        </td>
        <td class="reservationGuest mobilePhone">
            <input class="data-entry" name="mobilePhone" type="text" value="${dataEntry.reservationGuest.mobilePhone || 'geen'}" disabled>
        </td>
        <td class="reservationGuest address">
            <input class="data-entry" name="address" type="text" value="${dataEntry.reservationGuest.address}, ${dataEntry.reservationGuest.cityTown}" disabled>
        </td>
        <td class="preferredReservation">
            <input class="data-entry" name="preferredReservation" type="text" value="${dataEntry.preferedReservation ? 'ja' : 'nee'}" disabled>
        </td>
        <td class="reservedPlace">
            <input class="data-entry" name="reservedPlace" type="text" value="${dataEntry.reservedPlace}" disabled>
        </td>
        <td class="reservationGuest licensePlate">
            <input class="data-entry" name="licensePlate" type="text" value="${dataEntry.reservationGuest.licensePlate}" disabled>
        </td>
        <td class="edit"></td>
        <td class="delete"></td>
    </tr>
</form>
`.trim();
        }
    }
};