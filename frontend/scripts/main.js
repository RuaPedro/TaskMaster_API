import { init as navigationInit } from './navigation.js'

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('inicializando la aplicacion');
    navigationInit();
}