const ws = new WebSocket('ws://localhost:40510');
// event emmited when connected
ws.onopen = () => {
    console.log('websocket is connected ...');
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
                        'location',
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
    console.log(data);
};