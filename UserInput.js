/* globals window, document, Box, Event */

(function() {
    
    function UserInput(removeHandler) {
        this.userInput = new Box(removeHandler);
        this.userInput.addClass("note");
        
        this.id = this.userInput.id;
        this.element = this.userInput.element;
        
        // area for user to add some text
        this.textarea = document.createElement("textarea");
        this.textarea.classList.add("parent-mover");
        this.textarea.setAttribute("placeholder", "Add your note here");
        this.element.appendChild(this.textarea);
        
        // area that mirrors the textarea 
        this.mirror = document.createElement("div");
        this.mirror.classList.add("mirror");
        this.element.appendChild(this.mirror);
        
        var self = this;
        
        // auto adjust textarea height
        this.textarea.addEventListener("input", function() {
            // force a "\n" on mirror.innerHTML would register the "\n" entered by user
            self.mirror.style.height = "auto";
            self.mirror.innerHTML = this.value + "\n";
            self.element.style.height = self.mirror.offsetHeight + "px";
        });
        
        // listen for resize event on the note
        this.element.addEventListener("resize", function() {
            self.mirror.style.height = self.element.offsetHeight - 2 + "px";
            self.mirror.style.width = self.element.offsetWidth - 2 + "px";
        });
    }
    
    UserInput.prototype.focus = function() {
        this.textarea.focus();  
    };

    UserInput.prototype.isEmpty = function() {
        return this.textarea.value.trim().length === 0;
    };
    
    UserInput.prototype.paint = function(context) {
        context.paintTextbox(this.element);
    };
    
    window.UserInput = UserInput;
})();