class Tokini {
    constructor() {
        this.options = [];
        this.initializeElements();
        this.bindEvents();
        this.initializeTheme();
        this.registerServiceWorker();
        this.startContinuousShuffle();
    }

    initializeElements() {
        this.optionInput = document.getElementById('optionInput');
        this.addButton = document.getElementById('addButton');
        this.optionsList = document.getElementById('optionsList');
        this.rollButton = document.getElementById('rollButton');
        this.resultArea = document.getElementById('resultArea');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
    }

    bindEvents() {
        // Add option when button is clicked
        this.addButton.addEventListener('click', () => this.addOption());
        
        // Add option when Enter key is pressed
        this.optionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addOption();
            }
        });

        // Roll decision when button is clicked
        this.rollButton.addEventListener('click', () => this.rollDecision());

        // Clear result when new option is being added
        this.optionInput.addEventListener('input', () => this.clearResult());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    addOption() {
        const optionText = this.optionInput.value.trim();
        
        if (!optionText) {
            this.showTemporaryMessage('Please enter an option!', 'error');
            return;
        }

        if (this.options.includes(optionText)) {
            this.showTemporaryMessage('This option already exists!', 'error');
            return;
        }

        if (this.options.length >= 10) {
            this.showTemporaryMessage('Maximum 10 options allowed!', 'error');
            return;
        }

        this.options.push(optionText);
        this.renderOptions();
        this.optionInput.value = '';
        this.optionInput.focus();
        this.clearResult();
        
        // Enable roll button if we have at least 2 options
        this.updateRollButton();
    }

    removeOption(index) {
        this.options.splice(index, 1);
        this.renderOptions();
        this.clearResult();
        this.updateRollButton();
    }

    renderOptions() {
        this.optionsList.innerHTML = '';
        
        if (this.options.length === 0) {
            this.optionsList.innerHTML = `
                <div class="text-center text-muted-light dark:text-muted-dark py-4">
                    <p class="text-sm">No options yet! Add some above 📝</p>
                </div>
            `;
            return;
        }
        
        this.options.forEach((option, index) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'flex justify-between items-center group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
            optionItem.innerHTML = `
                <p class="text-foreground-light dark:text-foreground-dark">${this.escapeHtml(option)}</p>
                <button 
                    class="text-muted-light dark:text-muted-dark opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 dark:hover:text-red-400 p-1 rounded"
                    onclick="tokini.removeOption(${index})"
                >
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            `;
            this.optionsList.appendChild(optionItem);
        });
    }

    rollDecision() {
        if (this.options.length < 2) {
            this.showTemporaryMessage('Add at least 2 options to make a decision!', 'error');
            return;
        }

        // Disable roll button during animation
        this.rollButton.disabled = true;
        this.rollButton.style.pointerEvents = 'none';

        // Get the dice element
        const dice = document.querySelector('.dice');
        const diceContainer = document.querySelector('.dice-container');
        
        // Clear any existing intervals
        this.clearIntervals();
        
        // Start the dice rolling animation
        this.startDiceRoll(dice, diceContainer);
        
        // Add some suspense with a delay
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * this.options.length);
            const chosenOption = this.options[randomIndex];
            
            // Stop rolling and show final result
            this.stopDiceRoll(dice, diceContainer, chosenOption);
            
        }, 2000); // Match the 2s animation duration
    }

    startDiceRoll(dice, container) {
        // Add rolling class for container animation
        dice.classList.add('dice-rolling');
        
        // Clear continuous shuffle during active roll
        if (this.continuousShuffleInterval) {
            clearInterval(this.continuousShuffleInterval);
        }
        
        // Start changing dice faces rapidly
        this.diceRollInterval = setInterval(() => {
            const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            const randomFace = diceFaces[Math.floor(Math.random() * diceFaces.length)];
            dice.textContent = randomFace;
        }, 100); // Change face every 100ms for fast rolling effect
    }

    stopDiceRoll(dice, container, chosenOption) {
        // Clear the dice face changing interval
        if (this.diceRollInterval) {
            clearInterval(this.diceRollInterval);
        }
        
        // Remove rolling class and add bounce
        dice.classList.remove('dice-rolling');
        dice.classList.add('dice-bounce');
        
        // Set final dice face based on the result
        const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const finalFace = diceFaces[Math.floor(Math.random() * diceFaces.length)];
        dice.textContent = finalFace;
        
        // Display result
        this.displayResult(chosenOption);
        
        // Re-enable roll button after bounce animation
        setTimeout(() => {
            dice.classList.remove('dice-bounce');
            this.rollButton.disabled = false;
            this.rollButton.style.pointerEvents = 'auto';
            
            // Restart continuous shuffle after roll is complete
            this.startContinuousShuffle();
        }, 600);
    }

    startContinuousShuffle() {
        // Start continuous shuffling of dice faces
        this.continuousShuffleInterval = setInterval(() => {
            const dice = document.querySelector('.dice');
            if (dice && !dice.classList.contains('dice-rolling')) {
                const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
                const randomFace = diceFaces[Math.floor(Math.random() * diceFaces.length)];
                dice.textContent = randomFace;
            }
        }, 800); // Change face every 800ms for gentle shuffling
    }

    clearIntervals() {
        // Clear any existing intervals
        if (this.diceRollInterval) {
            clearInterval(this.diceRollInterval);
        }
        if (this.continuousShuffleInterval) {
            clearInterval(this.continuousShuffleInterval);
        }
    }

    displayResult(option) {
        this.resultArea.innerHTML = `
            <p class="text-lg text-muted-light dark:text-muted-dark">The result is...</p>
            <p class="text-2xl font-bold text-primary">${this.escapeHtml(option)}</p>
        `;
    }

    clearResult() {
        this.resultArea.innerHTML = '';
    }

    updateRollButton() {
        // The roll button is always enabled in this design
        // The dice animation will handle the visual feedback
    }

    showTemporaryMessage(message, type = 'info') {
        // Create temporary message element with Tailwind classes
        const messageEl = document.createElement('div');
        messageEl.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg font-medium text-sm shadow-lg transition-all duration-300 ${
            type === 'error' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`;
        messageEl.textContent = message;

        document.body.appendChild(messageEl);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeTheme() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('tokini-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            this.themeIcon.textContent = 'light_mode';
        } else {
            document.documentElement.classList.remove('dark');
            this.themeIcon.textContent = 'dark_mode';
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            this.themeIcon.textContent = 'dark_mode';
            localStorage.setItem('tokini-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            this.themeIcon.textContent = 'light_mode';
            localStorage.setItem('tokini-theme', 'dark');
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, show update notification
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 left-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
        notification.innerHTML = `
            <span>New version available!</span>
            <button onclick="location.reload()" class="bg-white text-primary px-3 py-1 rounded font-medium hover:bg-gray-100 transition-colors">
                Update
            </button>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }
}

// Initialize the app when DOM is loaded
let tokini;
document.addEventListener('DOMContentLoaded', () => {
    tokini = new Tokini();
});

// Add some fun keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to roll decision
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (tokini && tokini.options.length >= 2) {
            tokini.rollDecision();
        }
    }
    
    // Escape to clear result
    if (e.key === 'Escape') {
        if (tokini) {
            tokini.clearResult();
        }
    }
});
