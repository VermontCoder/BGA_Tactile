// ...existing code...

function handleResize() {
    const body = document.getElementById('ebd-body');
    if (window.innerWidth < 1050) {
        body.classList.add('mobile_version');
    } else {
        body.classList.remove('mobile_version');
    }
}

// Attach the resize event listener
window.addEventListener('resize', handleResize);

// Call the function initially to set the correct class on page load
handleResize();

// ...existing code...