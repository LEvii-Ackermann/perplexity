// Toggle logic for a button
const button = document.getElementById('toggleButton');

if (button) {
    button.addEventListener('click', () => {
        const isActive = button.classList.toggle('active');
        
        if (isActive) {
            console.log('Button is now ACTIVE');
            button.textContent = 'Deactivate';
        } else {
            console.log('Button is now INACTIVE');
            button.textContent = 'Activate';
        }
    });
} else {
    console.error('Button not found!');
}