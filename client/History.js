
let btn = document.querySelector('.toggle');
let btnst = true;
btn.onclick = function() {
    if(btnst === true) {
        document.querySelector('.toggle').classList.add('toggle');
        document.getElementById('sidebar').classList.add('sidebarshow');
        btnst = false;
    }else if(btnst === false) {
        document.querySelector('.toggle').classList.remove('toggle');
        document.getElementById('sidebar').classList.remove('sidebarshow');
        btnst = true;
    }
}