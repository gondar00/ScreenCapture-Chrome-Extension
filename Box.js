/* globals window, document, Event */

(function() {
    
    function Box(removeHandler) {
        
        this.id = Date.now();
        
        this.element = document.createElement("div");
        this.element.setAttribute("id", this.id);
        this.element.classList.add("box");
        this.element.classList.add("movable");
     
        // the remove button
        this.btnRemove = document.createElement("button");
        this.btnRemove.classList.add("remove");
        this.btnRemove.innerHTML = "&times;";
        this.btnRemove.addEventListener("click", removeHandler);
        this.element.appendChild(this.btnRemove);
        
        // resize handle
        this.handle = document.createElement("div");
        this.handle.classList.add("handle");
        this.element.appendChild(this.handle);
        makeBoxResizable(this.handle);
        
        // make the box the top most element when clicked
        this.element.addEventListener("click", function() {
            var existing = document.getElementsByClassName("top")[0];
            if (existing) {
                existing.classList.remove("top");   
            }
            
            this.classList.add("top");
        });
    }
    
    Box.prototype.addClass = function(className) {
        this.element.classList.add(className);
    };
    
    Box.prototype.removeClass = function(className) {};
    
    function makeBoxResizable(handle) {
        
        var resizeTarget = null;
        
        // the last location of the mouse event
        var lastX, lastY = null;
        
        document.addEventListener("mousedown", function(event) {

            var target = event.target;
            
            if (target === handle) {
                resizeTarget = event.target.parentNode;
                lastX = event.clientX;
                lastY = event.clientY;
            }
            else {
                resizeTarget = null;     
            }
        });
        
        document.addEventListener("mousemove", function(event) {            
            if (!resizeTarget) {
                return;   
            }
            
            // find the current location of the mouse
            var currentX = event.clientX;
            var currentY = event.clientY;
            
            // increment the height and width by how much the mouse has moved
            resizeTarget.style.height = resizeTarget.offsetHeight + (currentY - lastY) + "px";
            resizeTarget.style.width = resizeTarget.offsetWidth + (currentX - lastX) + "px";
            
            lastX = currentX;
            lastY = currentY;
            
            // create & dispatch the resize event
            resizeTarget.dispatchEvent(new Event("resize"));
        });
        
        document.addEventListener("mouseup", function() {            
            resizeTarget = null; 
        });    
    }
    
    window.Box = Box;
})();