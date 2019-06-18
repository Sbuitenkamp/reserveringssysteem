window.addEventListener('load', () => {
    makeActive();
    const body = document.querySelector('body');
    body.innerHTML += `<div class="pop-up-container" id="pop-up-container"></div>`;
    body.addEventListener('click', function (e) {
        const popUpContainer = document.querySelector('#pop-up-container');
        if (e.target === popUpContainer) hidePopUp();
    });
});