const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE02PgxnsZb22qYQRIqe3CQZIoCNlPmJ8975fmmrT2KIn40KPYO2PhBrEuNKgEu6ebCr-r0-yFMqzd/pub?output=csv';

fetch(url)
    .then(res => res.text())
    .then(text => {
        console.log(text.split('\n').slice(0, 5).join('\n'));
    })
    .catch(err => console.error(err));
