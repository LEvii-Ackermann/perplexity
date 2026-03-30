document.getElementById('toggleButton').addEventListener('click', function() {
    this.classList.toggle('active');
    if (this.classList.contains('active')) {
        this.textContent = 'Active!';
    } else {
        this.textContent = 'Click Me';
    }
});