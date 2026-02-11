// ========== CUSTOM CURSOR ==========
// Usage: CustomCursor.init('a, button, ...')
// The parameter specifies selectors for elements that trigger the hover effect.

window.CustomCursor = (function() {
    return {
        init: function(hoverSelectors) {
            var cursor = document.getElementById('custom-cursor');
            if (!cursor) return;

            document.addEventListener('mousemove', function(e) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });

            document.addEventListener('mousedown', function() {
                cursor.classList.add('clicking');
            });

            document.addEventListener('mouseup', function() {
                cursor.classList.remove('clicking');
            });

            document.addEventListener('mouseleave', function() {
                cursor.style.opacity = '0';
            });

            document.addEventListener('mouseenter', function() {
                cursor.style.opacity = '1';
            });

            var interactiveElements = document.querySelectorAll(hoverSelectors);
            interactiveElements.forEach(function(el) {
                el.addEventListener('mouseenter', function() {
                    cursor.classList.add('hovering');
                });
                el.addEventListener('mouseleave', function() {
                    cursor.classList.remove('hovering');
                });
            });
        }
    };
})();
