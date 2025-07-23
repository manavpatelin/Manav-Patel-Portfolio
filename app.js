// Ubuntu 25.04 "Plucky Puffin" Portfolio JavaScript for Manav Patel
class Ubuntu25Portfolio {
    constructor() {
        this.windows = new Map();
        this.zIndex = 1000;
        this.isDragging = false;
        this.dragData = {};
        this.isMobile = window.innerWidth <= 900;
        this.notifications = [];
        this.activeWindow = null;
        
        this.init();
    }

    init() {
        this.initClock();
        this.initWindows();
        this.initDock();
        this.initHamburgerMenu();
        this.initKeyboardNavigation();
        this.initResponsive();
        this.initContactForm();
        this.initNotificationSystem();
        this.initProjectButtons();
        
        // Initialize window positions
        this.initWindowPositions();
        
        // Show about window by default after a short delay
        setTimeout(() => {
            this.openWindow('about');
        }, 500);
        
        // Show welcome notification
        this.showNotification('Welcome to Manav Patel\'s Portfolio on Ubuntu 25.04!', 'success');
    }

    initClock() {
        const clockElement = document.getElementById('clock');
        
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            clockElement.innerHTML = `<div>${timeString}</div><div style="font-size: 10px; opacity: 0.7;">${dateString}</div>`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    initProjectButtons() {
        // Initialize all project action buttons with proper event handling
        const projectButtons = document.querySelectorAll('.btn--demo, .btn--github');
        
        projectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const url = button.getAttribute('href');
                if (url && url !== '#') {
                    // Add click feedback
                    button.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 150);
                    
                    // Show notification based on button type
                    if (button.classList.contains('btn--demo')) {
                        this.showNotification('Opening live demo...', 'info');
                    } else if (button.classList.contains('btn--github')) {
                        this.showNotification('Opening GitHub repository...', 'info');
                    }
                    
                    // Open the URL in a new tab
                    window.open(url, '_blank', 'noopener,noreferrer');
                } else {
                    this.showNotification('Link not available', 'warning');
                }
            });
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    initWindows() {
        const windows = document.querySelectorAll('.window');
        
        windows.forEach(window => {
            const windowId = window.dataset.window;
            this.windows.set(windowId, {
                element: window,
                isOpen: false,
                isMaximized: false,
                isMinimized: false,
                originalPosition: { x: 0, y: 0, width: 0, height: 0 }
            });
            
            this.initWindowControls(window);
            this.initWindowDragging(window);
            this.initWindowFocus(window);
        });
    }

    initDock() {
        const dockButtons = document.querySelectorAll('.dock-button');
        
        dockButtons.forEach(button => {
            // Clear any existing event listeners
            button.onclick = null;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const windowId = e.currentTarget.dataset.window;
                console.log('Dock button clicked:', windowId);
                this.toggleWindow(windowId);
                
                // Add ripple effect
                this.addRippleEffect(e.currentTarget, e);
            });
            
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const windowId = e.currentTarget.dataset.window;
                    this.toggleWindow(windowId);
                }
            });
        });
    }

    addRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: ${event.clientX - rect.left - size / 2}px;
            top: ${event.clientY - rect.top - size / 2}px;
            z-index: 9999;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    initWindowControls(window) {
        const windowId = window.dataset.window;
        const closeBtn = window.querySelector('.window-control.close');
        const minimizeBtn = window.querySelector('.window-control.minimize');
        const maximizeBtn = window.querySelector('.window-control.maximize');

        // Close button functionality
        if (closeBtn) {
            closeBtn.removeEventListener('click', this.handleClose); // Remove existing
            this.handleClose = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked for:', windowId);
                this.closeWindow(windowId);
            };
            closeBtn.addEventListener('click', this.handleClose);
            
            closeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // Prevent window dragging
            });
        }

        // Minimize button functionality  
        if (minimizeBtn) {
            minimizeBtn.removeEventListener('click', this.handleMinimize); // Remove existing
            this.handleMinimize = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Minimize button clicked for:', windowId);
                this.minimizeWindow(windowId);
            };
            minimizeBtn.addEventListener('click', this.handleMinimize);
            
            minimizeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // Prevent window dragging
            });
        }

        // Maximize button functionality
        if (maximizeBtn) {
            maximizeBtn.removeEventListener('click', this.handleMaximize); // Remove existing
            this.handleMaximize = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Maximize button clicked for:', windowId);
                this.toggleMaximize(windowId);
            };
            maximizeBtn.addEventListener('click', this.handleMaximize);
            
            maximizeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // Prevent window dragging
            });
        }

        // Double-click to maximize/restore
        const header = window.querySelector('.window-header');
        if (header) {
            header.addEventListener('dblclick', (e) => {
                if (!e.target.classList.contains('window-control')) {
                    this.toggleMaximize(windowId);
                }
            });
        }

        // Keyboard support for window controls
        const controls = window.querySelectorAll('.window-control');
        controls.forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
            
            // Add tabindex for keyboard navigation
            btn.setAttribute('tabindex', '0');
        });
    }

    initWindowDragging(window) {
        const header = window.querySelector('.window-header');
        const windowId = window.dataset.window;

        if (header) {
            // Remove existing listeners
            header.removeEventListener('mousedown', this.handleMouseDown);
            
            this.handleMouseDown = (e) => {
                // Don't drag if clicking on window controls
                if (e.target.classList.contains('window-control')) {
                    return;
                }
                
                console.log('Starting drag for:', windowId);
                this.startDrag(windowId, e);
            };
            
            header.addEventListener('mousedown', this.handleMouseDown);

            // Touch support for mobile
            header.addEventListener('touchstart', (e) => {
                if (!this.isMobile) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    initWindowFocus(window) {
        window.addEventListener('mousedown', (e) => {
            // Don't change focus if clicking window controls
            if (e.target.classList.contains('window-control')) {
                return;
            }
            
            const windowId = window.dataset.window;
            this.bringToFront(windowId);
            this.activeWindow = windowId;
        });
    }

    startDrag(windowId, e) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        if (windowData.isMaximized || this.isMobile) return;
        
        this.isDragging = true;
        this.bringToFront(windowId);
        
        const rect = window.getBoundingClientRect();
        const workspace = document.querySelector('.workspace');
        const workspaceRect = workspace.getBoundingClientRect();
        
        this.dragData = {
            windowId,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: rect.left - workspaceRect.left,
            startTop: rect.top - workspaceRect.top
        };
        
        // Add dragging class for visual feedback
        window.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        // Bind drag methods to this context
        this.boundOnDrag = this.onDrag.bind(this);
        this.boundStopDrag = this.stopDrag.bind(this);
        
        document.addEventListener('mousemove', this.boundOnDrag, { passive: false });
        document.addEventListener('mouseup', this.boundStopDrag, { passive: false });
        
        e.preventDefault();
        e.stopPropagation();
    }

    onDrag(e) {
        if (!this.isDragging) return;
        
        const { windowId, startX, startY, startLeft, startTop } = this.dragData;
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        const workspace = document.querySelector('.workspace');
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Constrain to workspace with some padding
        const padding = 20;
        const maxLeft = workspace.offsetWidth - window.offsetWidth + padding;
        const maxTop = workspace.offsetHeight - window.offsetHeight + padding;
        
        newLeft = Math.max(-padding, Math.min(newLeft, maxLeft));
        newTop = Math.max(-padding, Math.min(newTop, maxTop));
        
        window.style.left = newLeft + 'px';
        window.style.top = newTop + 'px';
        
        // Add smooth transform for better performance
        window.style.transform = 'translateZ(0)';
        
        e.preventDefault();
    }

    stopDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Remove dragging class
        const windowData = this.windows.get(this.dragData.windowId);
        if (windowData) {
            windowData.element.classList.remove('dragging');
        }
        
        document.removeEventListener('mousemove', this.boundOnDrag);
        document.removeEventListener('mouseup', this.boundStopDrag);
    }

    toggleWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) {
            console.error('Window not found:', windowId);
            return;
        }
        
        console.log('Toggling window:', windowId, 'Current state:', {
            isOpen: windowData.isOpen,
            isMinimized: windowData.isMinimized
        });
        
        if (windowData.isMinimized) {
            this.restoreWindow(windowId);
        } else if (windowData.isOpen) {
            if (this.activeWindow === windowId) {
                this.minimizeWindow(windowId);
            } else {
                this.bringToFront(windowId);
                this.activeWindow = windowId;
            }
        } else {
            this.openWindow(windowId);
        }
    }

    openWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) {
            console.error('Window data not found for:', windowId);
            return;
        }
        
        const window = windowData.element;
        if (!window) {
            console.error('Window element not found for:', windowId);
            return;
        }
        
        console.log('Opening window:', windowId);
        
        // Close other windows in mobile mode
        if (this.isMobile) {
            this.windows.forEach((data, id) => {
                if (id !== windowId && data.isOpen) {
                    this.closeWindow(id);
                }
            });
        }
        
        windowData.isOpen = true;
        windowData.isMinimized = false;
        
        window.classList.add('open', 'opening');
        window.style.display = 'flex';
        
        // Auto-maximize on mobile
        if (this.isMobile) {
            windowData.isMaximized = true;
            window.classList.add('maximized');
        }
        
        this.bringToFront(windowId);
        this.activeWindow = windowId;
        this.updateDockButton(windowId);
        
        // Re-initialize project buttons when projects window opens
        if (windowId === 'projects') {
            setTimeout(() => {
                this.initProjectButtons();
            }, 100);
        }
        
        // Remove opening animation class
        setTimeout(() => {
            window.classList.remove('opening');
        }, 300);
        
        // Show notification with appropriate message
        const windowTitles = {
            about: 'About - Manav Patel',
            experience: 'Professional Experience',
            projects: 'Major Projects',
            skills: 'Technical Skills',
            education: 'Educational Background',
            resume: 'Resume & Links',
            contact: 'Contact Information'
        };
        
        const windowTitle = windowTitles[windowId] || 'Window';
        this.showNotification(`Opened ${windowTitle}`, 'success');
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        console.log('Closing window:', windowId);
        
        // Show notification
        const windowTitles = {
            about: 'About - Manav Patel',
            experience: 'Professional Experience', 
            projects: 'Major Projects',
            skills: 'Technical Skills',
            education: 'Educational Background',
            resume: 'Resume & Links',
            contact: 'Contact Information'
        };
        
        const windowTitle = windowTitles[windowId] || 'Window';
        this.showNotification(`Closed ${windowTitle}`, 'info');
        
        // Add closing animation
        window.style.transform = 'scale(0.9)';
        window.style.opacity = '0';
        window.style.transition = 'all 0.2s ease-out';
        
        setTimeout(() => {
            windowData.isOpen = false;
            windowData.isMinimized = false;
            windowData.isMaximized = false;
            
            window.classList.remove('open', 'maximized', 'active');
            window.style.display = 'none';
            window.style.transform = '';
            window.style.opacity = '';
            window.style.transition = '';
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
            }
            
            this.updateDockButton(windowId);
        }, 200);
    }

    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        console.log('Minimizing window:', windowId);
        
        // Show notification
        const windowTitles = {
            about: 'About - Manav Patel',
            experience: 'Professional Experience',
            projects: 'Major Projects', 
            skills: 'Technical Skills',
            education: 'Educational Background',
            resume: 'Resume & Links',
            contact: 'Contact Information'
        };
        
        const windowTitle = windowTitles[windowId] || 'Window';
        this.showNotification(`Minimized ${windowTitle}`, 'info');
        
        // Add minimize animation
        const dockButton = document.querySelector(`[data-window="${windowId}"]`);
        if (dockButton) {
            const dockRect = dockButton.getBoundingClientRect();
            const windowRect = window.getBoundingClientRect();
            
            window.style.transformOrigin = 'center center';
            window.style.transform = `scale(0.1) translate(${(dockRect.left - windowRect.left) / 10}px, ${(dockRect.top - windowRect.top) / 10}px)`;
            window.style.opacity = '0';
            window.style.transition = 'all 0.3s ease-out';
        } else {
            // Fallback if dock button not found
            window.style.transform = 'scale(0.1)';
            window.style.opacity = '0';
            window.style.transition = 'all 0.3s ease-out';
        }
        
        setTimeout(() => {
            windowData.isMinimized = true;
            window.classList.remove('open', 'active');
            window.style.display = 'none';
            window.style.transform = '';
            window.style.opacity = '';
            window.style.transition = '';
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
            }
            
            this.updateDockButton(windowId);
        }, 300);
    }

    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        console.log('Restoring window:', windowId);
        
        windowData.isMinimized = false;
        window.classList.add('open');
        window.style.display = 'flex';
        
        // Add restore animation
        window.style.transform = 'scale(0.9)';
        window.style.opacity = '0';
        window.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            window.style.transform = 'scale(1)';
            window.style.opacity = '1';
            
            setTimeout(() => {
                window.style.transform = '';
                window.style.opacity = '';
                window.style.transition = '';
            }, 300);
        }, 50);
        
        this.bringToFront(windowId);
        this.activeWindow = windowId;
        this.updateDockButton(windowId);
        
        // Re-initialize project buttons if restoring projects window
        if (windowId === 'projects') {
            setTimeout(() => {
                this.initProjectButtons();
            }, 100);
        }
        
        // Show notification
        const windowTitles = {
            about: 'About - Manav Patel',
            experience: 'Professional Experience',
            projects: 'Major Projects',
            skills: 'Technical Skills', 
            education: 'Educational Background',
            resume: 'Resume & Links',
            contact: 'Contact Information'
        };
        
        const windowTitle = windowTitles[windowId] || 'Window';
        this.showNotification(`Restored ${windowTitle}`, 'success');
    }

    toggleMaximize(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        console.log('Toggling maximize for:', windowId, 'Currently maximized:', windowData.isMaximized);
        
        if (windowData.isMaximized) {
            windowData.isMaximized = false;
            window.classList.remove('maximized');
            
            // Restore original position with animation
            const { x, y, width, height } = windowData.originalPosition;
            if (x !== 0 || y !== 0 || width !== 0 || height !== 0) {
                window.style.transition = 'all 0.3s ease-out';
                setTimeout(() => {
                    window.style.left = x + 'px';
                    window.style.top = y + 'px';
                    window.style.width = width + 'px';
                    window.style.height = height + 'px';
                    
                    setTimeout(() => {
                        window.style.transition = '';
                    }, 300);
                }, 50);
            }
            
            this.showNotification('Window restored', 'info');
        } else {
            // Save current position
            const rect = window.getBoundingClientRect();
            const workspace = document.querySelector('.workspace');
            const workspaceRect = workspace.getBoundingClientRect();
            windowData.originalPosition = {
                x: rect.left - workspaceRect.left,
                y: rect.top - workspaceRect.top,
                width: rect.width,
                height: rect.height
            };
            
            windowData.isMaximized = true;
            window.style.transition = 'all 0.3s ease-out';
            window.classList.add('maximized');
            
            setTimeout(() => {
                window.style.transition = '';
            }, 300);
            
            this.showNotification('Window maximized', 'info');
        }
    }

    bringToFront(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        this.zIndex++;
        window.style.zIndex = this.zIndex;
        
        // Update visual indicators
        document.querySelectorAll('.window').forEach(w => {
            w.classList.remove('active');
        });
        window.classList.add('active');
    }

    updateDockButton(windowId) {
        const button = document.querySelector(`[data-window="${windowId}"]`);
        if (!button) return;
        
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        button.classList.toggle('active', windowData.isOpen && !windowData.isMinimized);
        button.classList.toggle('minimized', windowData.isMinimized);
        
        // Add glow effect for active windows
        if (windowData.isOpen && !windowData.isMinimized) {
            button.style.boxShadow = '0 0 20px rgba(233, 84, 32, 0.5)';
        } else {
            button.style.boxShadow = '';
        }
    }

    initHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const dock = document.getElementById('dock');
        
        if (hamburger && dock) {
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dock.classList.toggle('open');
                hamburger.classList.toggle('active');
                
                // Animate hamburger icon
                const spans = hamburger.querySelectorAll('span');
                if (dock.classList.contains('open')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    spans.forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                }
            });
            
            // Close dock when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (this.isMobile && !dock.contains(e.target) && !hamburger.contains(e.target)) {
                    dock.classList.remove('open');
                    hamburger.classList.remove('active');
                    
                    // Reset hamburger icon
                    const spans = hamburger.querySelectorAll('span');
                    spans.forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                }
            });
        }
    }

    initKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + number keys to open windows
            if (e.altKey && e.key >= '1' && e.key <= '7') {
                e.preventDefault();
                const windowIds = ['about', 'experience', 'projects', 'skills', 'education', 'resume', 'contact'];
                const windowId = windowIds[parseInt(e.key) - 1];
                if (windowId) {
                    this.toggleWindow(windowId);
                }
            }
            
            // Escape to close active window
            if (e.key === 'Escape') {
                if (this.activeWindow) {
                    this.closeWindow(this.activeWindow);
                }
            }
            
            // Alt + Tab to cycle through windows
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
        });
    }

    cycleWindows() {
        const openWindows = Array.from(this.windows.entries())
            .filter(([id, data]) => data.isOpen && !data.isMinimized);
        
        if (openWindows.length <= 1) return;
        
        const currentIndex = openWindows.findIndex(([id]) => id === this.activeWindow);
        const nextIndex = (currentIndex + 1) % openWindows.length;
        const [nextWindowId] = openWindows[nextIndex];
        
        this.bringToFront(nextWindowId);
        this.activeWindow = nextWindowId;
        
        const windowTitles = {
            about: 'About',
            experience: 'Experience', 
            projects: 'Projects',
            skills: 'Skills',
            education: 'Education',
            resume: 'Resume',
            contact: 'Contact'
        };
        
        this.showNotification(`Switched to ${windowTitles[nextWindowId]}`, 'info');
    }

    initResponsive() {
        const handleResize = () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 900;
            
            if (wasMobile !== this.isMobile) {
                // Handle transition between mobile and desktop
                this.windows.forEach((windowData, windowId) => {
                    if (windowData.isOpen) {
                        if (this.isMobile) {
                            // Force maximize on mobile
                            windowData.isMaximized = true;
                            windowData.element.classList.add('maximized');
                        } else {
                            // Restore desktop behavior
                            windowData.isMaximized = false;
                            windowData.element.classList.remove('maximized');
                        }
                    }
                });
                
                // Close mobile dock
                const dock = document.getElementById('dock');
                const hamburger = document.getElementById('hamburger');
                if (dock && hamburger) {
                    dock.classList.remove('open');
                    hamburger.classList.remove('active');
                    
                    // Reset hamburger icon
                    const spans = hamburger.querySelectorAll('span');
                    spans.forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                }
            }
        };
        
        window.addEventListener('resize', handleResize);
    }

    initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Validate form data
            if (!data.name || !data.email || !data.subject || !data.message) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            this.showNotification('Sending message...', 'info');
            
            // Disable form temporarily
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Add loading animation to button
            submitBtn.style.opacity = '0.7';
            
            setTimeout(() => {
                this.showNotification(`Thank you ${data.name}! Your message has been sent to Manav.`, 'success');
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
            }, 2000);
        });
    }

    initNotificationSystem() {
        // Initialize notification area
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) {
            const area = document.createElement('div');
            area.id = 'notification-area';
            area.className = 'notification-area';
            document.body.appendChild(area);
        }
    }

    showNotification(message, type = 'info') {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add appropriate icon based on type
        let icon = 'ℹ️';
        switch(type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            case 'info': icon = 'ℹ️'; break;
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 16px;">${icon}</span>
                <div style="font-weight: 500; flex: 1;">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; opacity: 0.7; font-size: 18px; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"
                        title="Close notification">×</button>
            </div>
        `;
        
        notificationArea.appendChild(notification);
        
        // Auto-remove notification after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 4000);
        
        this.notifications.push({
            element: notification,
            message,
            type,
            timestamp: Date.now()
        });
    }

    initWindowPositions() {
        // Set initial positions for windows with cascade effect
        const positions = [
            { x: 100, y: 80 },   // about
            { x: 150, y: 120 },  // experience
            { x: 200, y: 160 },  // projects
            { x: 250, y: 200 },  // skills
            { x: 300, y: 240 },  // education
            { x: 350, y: 280 },  // resume
            { x: 400, y: 320 }   // contact
        ];
        
        let index = 0;
        this.windows.forEach((windowData) => {
            const window = windowData.element;
            const position = positions[index % positions.length];
            
            window.style.left = position.x + 'px';
            window.style.top = position.y + 'px';
            
            // Set default size
            if (!this.isMobile) {
                window.style.width = '700px';
                window.style.height = '550px';
            }
            
            index++;
        });
    }

    // Utility method to get system info
    getSystemInfo() {
        return {
            os: 'Ubuntu 25.04 LTS "Plucky Puffin"',
            desktop: 'GNOME 48',
            theme: 'Yaru',
            kernel: '6.8.0-generic',
            memory: '8 GB',
            processor: 'Portfolio Engine v2.5',
            user: 'Manav Patel'
        };
    }

    // Method to add custom CSS animations
    addCustomAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .window.dragging {
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                transform: rotate(1deg) !important;
                cursor: grabbing;
            }
            
            .dock-button.active {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .window.active .window-header {
                background: linear-gradient(90deg, var(--dark-grey), var(--ubuntu-orange));
            }
            
            .window-control:hover {
                transform: scale(1.1);
                filter: brightness(1.2);
            }
            
            .notification {
                animation: slideInFromRight 0.3s ease-out;
            }
            
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .skill-item.advanced {
                animation: skillGlow 3s ease-in-out infinite alternate;
            }
            
            @keyframes skillGlow {
                from { box-shadow: 0 0 5px var(--success-color); }
                to { box-shadow: 0 0 20px var(--success-color), 0 0 30px var(--success-color); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Global portfolio instance
let portfolioInstance = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐧 Ubuntu 25.04 Portfolio initializing for Manav Patel...');
    portfolioInstance = new Ubuntu25Portfolio();
    
    // Add custom animations
    portfolioInstance.addCustomAnimations();
    
    // Make instance globally accessible for debugging
    window.portfolio = portfolioInstance;
    
    console.log('✅ Ubuntu 25.04 Portfolio ready!');
    
    // Add some portfolio-specific functionality
    setTimeout(() => {
        console.log('System Info:', portfolioInstance.getSystemInfo());
    }, 1000);
});

// Handle window clicks for focus
document.addEventListener('click', (e) => {
    const window = e.target.closest('.window');
    if (window && window.classList.contains('open') && portfolioInstance) {
        const windowId = window.dataset.window;
        portfolioInstance.bringToFront(windowId);
        portfolioInstance.activeWindow = windowId;
    }
});

// Handle visibility change (for pausing/resuming animations)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Portfolio paused');
    } else {
        console.log('Portfolio resumed');
        if (portfolioInstance) {
            portfolioInstance.showNotification('Welcome back! 🐧', 'info');
        }
    }
});

// Add easter egg - Konami code for fun
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length &&
        konamiCode.every((key, index) => key === konamiSequence[index])) {
        
        if (portfolioInstance) {
            portfolioInstance.showNotification('🎉 Konami Code activated! Manav appreciates your attention to detail!', 'success');
            
            // Add special effect
            document.body.style.animation = 'rainbow 2s linear infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            
            // Open all windows in a cascade
            setTimeout(() => {
                const windowIds = ['about', 'experience', 'projects', 'skills', 'education', 'resume', 'contact'];
                windowIds.forEach((id, index) => {
                    setTimeout(() => {
                        portfolioInstance.openWindow(id);
                    }, index * 300);
                });
            }, 1000);
        }
        
        konamiCode = [];
    }
});

// Add rainbow animation for easter egg
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// Performance optimization - throttle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (portfolioInstance) {
            portfolioInstance.initResponsive();
        }
    }, 250);
});

// Add some debug helpers
window.debugPortfolio = {
    openAllWindows: () => {
        const windowIds = ['about', 'experience', 'projects', 'skills', 'education', 'resume', 'contact'];
        windowIds.forEach((id, index) => {
            setTimeout(() => {
                portfolioInstance.openWindow(id);
            }, index * 200);
        });
    },
    closeAllWindows: () => {
        const windowIds = ['about', 'experience', 'projects', 'skills', 'education', 'resume', 'contact'];
        windowIds.forEach(id => {
            portfolioInstance.closeWindow(id);
        });
    },
    showSystemInfo: () => {
        console.table(portfolioInstance.getSystemInfo());
    },
    testNotifications: () => {
        portfolioInstance.showNotification('Test Success Notification', 'success');
        setTimeout(() => portfolioInstance.showNotification('Test Error Notification', 'error'), 1000);
        setTimeout(() => portfolioInstance.showNotification('Test Warning Notification', 'warning'), 2000);
        setTimeout(() => portfolioInstance.showNotification('Test Info Notification', 'info'), 3000);
    }
};

console.log('🎯 Debug commands available: window.debugPortfolio');
console.log('📧 Contact: manavrpatel1@gmail.com');
console.log('🔗 LinkedIn: https://linkedin.com/in/manav-patel');
console.log('💻 GitHub: https://github.com/manavrpatel1');