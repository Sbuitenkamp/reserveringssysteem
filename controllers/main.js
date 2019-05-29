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