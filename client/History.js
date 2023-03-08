import toggleSidebar from './script'
let btn = document.querySelector('.toggle');
let btnst = true;
btn.onclick = function() {
    if(btnst === true) {
        document.querySelector('.toggle span').classList.add('toggle');
        document.getElementById('sidebar').classList.add('sidebarshow');
        btnst = false;
        toggleSidebar();
    }else {
        document.querySelector('.toggle span').classList.remove('toggle');
        document.getElementById('sidebar').classList.remove('sidebarshow');
        btnst = true;
    }
}