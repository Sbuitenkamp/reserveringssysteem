function reservationRow(dataEntry) {
    return `
<tbody class="tbody">
<form action="/pop-up" method="get">
    <tr id="row${dataEntry.number}" onclick="showPopUp({ node: this, table: 'reservations' })">
        <td>
            <input class="data-entry" name="number" type="text" value="${dataEntry.number}" disabled>
        </td>
        <td>
            <input class="data-entry" name="name" type="text" value="${dataEntry.guest.name}" disabled>
        </td>
        <td>
            <input class="data-entry" name="dateArrival" type="text" value="${dataEntry.dateArrival}" disabled>
        </td>
        <td>
            <input class="data-entry" name="dateDeparture" type="text" value="${dataEntry.dateDeparture}" disabled>
        </td>
        <td>
            <input class="data-entry" name="description" type="text" value="${dataEntry.objects.map(el => el.description).join(', ')}" disabled>
        </td>
        <td>
            <input class="data-entry" name="status" type="text" value="${dataEntry.status}" disabled>
        </td>
        <td>
            <input class="data-entry" name="costTotal" type="text" value="${dataEntry.costTotal}" disabled>
        </td>
        <td>
            <input class="data-entry" name="costPaid" type="text" value="${dataEntry.costPaid}" disabled>
        </td>
        <td>
            <input class="data-entry" name="amountUnpaid" type="text" value="${dataEntry.amountUnpaid}" disabled>
        </td>
        <td>
            <input class="data-entry" name="unpaidSince" type="text" value="${dataEntry.unpaidSince}" disabled>
        </td>
        <td>
            <input class="data-entry" name="email" type="text" value="${dataEntry.guest.email}" disabled>
        </td>
        <td>
            <input class="data-entry" name="firstArrival" type="text" value="${dataEntry.guest.firstArrival ? 'ja' : 'nee'}" disabled>
        </td>
        <td>
            <input class="data-entry" name="validationStatus" type="text" value="${dataEntry.validationStatus || 'geen'}" disabled>
        </td>
        <td>
            <input class="data-entry" name="createdAt" type="text" value="${dataEntry.createdAt}" disabled>
        </td>
        <td>
            <input class="data-entry" name="bookMethod" type="text" value="${dataEntry.bookMethod}" disabled>
        </td>
        <td>
            <input class="data-entry" name="phone" type="text" value="${dataEntry.guestId}" disabled>
        </td>
        <td>
            <input class="data-entry" name="mobilePhone" type="text" value="${dataEntry.guestId || 'geen'}" disabled>
        </td>
        <td>
            <input class="data-entry" name="address" type="text" value="${dataEntry.guest.address}, ${dataEntry.guest.cityTown}" disabled>
        </td>
        <td>
            <input class="data-entry" name="preferredReservation" type="text" value="${dataEntry.preferedReservation ? 'ja' : 'nee'}" disabled>
        </td>
        <td>
            <input class="data-entry" name="reservedPlace" type="text" value="${dataEntry.reservedPlace}" disabled>
        </td>
        <td>
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

function guestRow(dataEntry) {
    return `
<tbody class="tbody">
<form action="/pop-up" method="get">
    <tr id="row${dataEntry.number}" onclick="showPopUp({ node: this, table: 'guests' })">
        <td>
            <input class="data-entry" name="number" type="text" value="${dataEntry.number}" disabled>
        </td>
        <td>
            <input class="data-entry" name="pronoun" type="text" value="${dataEntry.pronoun}" disabled>
        </td>
        <td>
            <input class="data-entry" name="name" type="text" value="${dataEntry.name}" disabled>
        </td>
        <td>
            <input class="data-entry" name="email" type="text" value="${dataEntry.email}" disabled>
        </td>
        <td>
            <input class="data-entry" name="address" type="text" value="${dataEntry.address}, ${dataEntry.cityTown}" disabled>
        </td>
        <td>
            <input class="data-entry" name="zipCode" type="text" value="${dataEntry.zipCode}" disabled>
        </td>
        <td>
            <input class="data-entry" name="brochureDate" type="text" value="${dataEntry.brochureDate || 'geen'}" disabled>
        </td>
        <td>
            <input class="data-entry" name="phone" type="text" value="${dataEntry.phone}" disabled>
        </td>
        <td>
            <input class="data-entry" name="mobilePhone" type="text" value="${dataEntry.mobilePhone}" disabled>
        </td>
        <td>
            <input class="data-entry" name="licensePlate" type="text" value="${dataEntry.licensePlate}" disabled>
        </td>
        <td>
            <input class="data-entry" name="firstArrival" type="text" value="${dataEntry.firstArrival ? 'ja' : 'nee'}" disabled>
        </td>
        <td>
            <input class="data-entry" name="unwanted" type="text" value="${dataEntry.unwanted ? 'ja' : 'nee'}" disabled>
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