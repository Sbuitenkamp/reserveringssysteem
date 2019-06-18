function reload(table) {
    for (let i = table.rows.length - 1; i > 0; i--) table.deleteRow(i);
    hidePopUp();
    wsOnOpen();
}

ws.onopen = wsOnOpen;

// event emitted when receiving message
ws.onmessage = wsOnMessage;