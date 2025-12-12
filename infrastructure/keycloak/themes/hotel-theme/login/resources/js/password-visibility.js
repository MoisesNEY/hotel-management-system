document.addEventListener('DOMContentLoaded', function () {
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    passwordInputs.forEach(input => {
        // Create wrapper if not exists (though we will add it in FTL)
        // Or cleaner: just append the button if we are using relative positioning

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'password-toggle';
        button.type = 'button';
        button.setAttribute('aria-label', 'Toggle password visibility');

        // Icon (Eye)
        button.innerHTML = `
            <svg class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <svg class="eye-off-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:none;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
            </svg>
        `;

        button.addEventListener('click', function () {
            const eye = this.querySelector('.eye-icon');
            const eyeOff = this.querySelector('.eye-off-icon');

            if (input.type === 'password') {
                input.type = 'text';
                eye.style.display = 'none';
                eyeOff.style.display = 'block';
            } else {
                input.type = 'password';
                eye.style.display = 'block';
                eyeOff.style.display = 'none';
            }
        });

        // Wrap the input in a relative container to ensure correct positioning
        // This isolates the input from the label so top: 50% works correctly
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'block';
        wrapper.style.width = '100%';

        // Insert wrapper before input
        input.parentNode.insertBefore(wrapper, input);

        // Move input into wrapper
        wrapper.appendChild(input);

        // Append button to wrapper
        wrapper.appendChild(button);
    });
});
