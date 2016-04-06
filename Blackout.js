/* globals window, Box */

(function() {
    
    function Blackout(removeHandler) {
        this.blackout = new Box(removeHandler);
        this.blackout.addClass("blackout-box");
        
        this.id = this.blackout.id;
        this.element = this.blackout.element;
    }
    
    Blackout.prototype.paint = function(context) {
        context.paintBox(this.element, Blackout.fillStyle);
    };
    
    Blackout.fillStyle = "black";
    
    window.Blackout = Blackout;
})();