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
            group: ['number'],
            include: [
                {
                    association: 'reservationGuest',
                    attributes: [
                        'name',
                        'email',
                        'phone',
                        'mobilePhone',
                        'firstArrival',
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
    console.log(data);
};