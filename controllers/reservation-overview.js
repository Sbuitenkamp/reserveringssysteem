window.onload = makeActive(document.querySelector('.link>a[href="/reservation-overview"]'))

// event emitted when connected
function wsOnOpen() {
    // sending a send event to websocket server
    ws.send(JSON.stringify({
        table: 'reservations',
        type: 'select',
        options: {}
    }));
}

function reload(table) {
    for (let i = table.rows.length - 1; i > 0; i--) table.deleteRow(i);
    hidePopUp();
    wsOnOpen();
}

ws.onopen = wsOnOpen;

// event emitted when receiving message
ws.onmessage = ev => {
    const data = JSON.parse(ev.data);
    const table = document.querySelector('table');
    if (data.update || data.destroy) return reload(table);
    console.log(data);
    for (const dataEntry of data) {
        // rendering the data in a row
        table.innerHTML += `
<tbody class="tbody">
<form action="/reservation-pop-up" method="get">
    <tr id="row${dataEntry.number}" onclick="showPopUp(this)">
        <td class="number">
            <input class="data-entry" name="number" type="text" value="${dataEntry.number}" disabled>
        </td>
        <td class="reservationGuest name">
            <input class="data-entry" name="name" type="text" value="${dataEntry.guest.name}" disabled>
        </td>
        <td class="dateArrival">
            <input class="data-entry" name="dateArrival" type="text" value="${dataEntry.dateArrival}" disabled>
        </td>
        <td class="dateDeparture">
            <input class="data-entry" name="dateDeparture" type="text" value="${dataEntry.dateDeparture}" disabled>
        </td>
        <td class="reservationObject description">
            <input class="data-entry" name="description" type="text" value="${dataEntry.objectId}" disabled>
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
            <input class="data-entry" name="email" type="text" value="${dataEntry.guest.email}" disabled>
        </td>
        <td class="reservationGuest firstArrival">
            <input class="data-entry" name="firstArrival" type="text" value="${dataEntry.guest.firstArrival ? 'ja' : 'nee'}" disabled>
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
            <input class="data-entry" name="phone" type="text" value="${dataEntry.guestId}" disabled>
        </td>
        <td class="reservationGuest mobilePhone">
            <input class="data-entry" name="mobilePhone" type="text" value="${dataEntry.guestId || 'geen'}" disabled>
        </td>
        <td class="reservationGuest address">
            <input class="data-entry" name="address" type="text" value="${dataEntry.guest.address}, ${dataEntry.guest.cityTown}" disabled>
        </td>
        <td class="preferredReservation">
            <input class="data-entry" name="preferredReservation" type="text" value="${dataEntry.preferedReservation ? 'ja' : 'nee'}" disabled>
        </td>
        <td class="reservedPlace">
            <input class="data-entry" name="reservedPlace" type="text" value="${dataEntry.reservedPlace}" disabled>
        </td>
        <td class="reservationGuest licensePlate">
            <input class="data-entry" name="licensePlate" type="text" value="${dataEntry.guest.licensePlate}" disabled>
        </td>
        <td class="delete">
            <button id="${dataEntry.number}" class="deleteReservation" onclick="deleteReservation(this)">
                <i class="fas fa-times"></i>
            </button>
        </td>
    </tr>
</form>
</tbody>
`.trim();
    }
};