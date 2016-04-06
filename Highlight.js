/* globals window, Box */

(function() {
    
    function Highlight(removeHandler, resizeHandler) {
        this.highlight = new Box(removeHandler);
        this.highlight.addClass(Highlight.class);
        
        this.id = this.highlight.id;
        
        this.element = this.highlight.element;
        this.element.addEventListener("resize", resizeHandler);
    }

    Highlight.prototype.paint = function(context) {
        context.paintBox(this.element, Highlight.fillStyle);
    };

    Highlight.class = "highlight-box";
    
    Highlight.fillStyle = "transparent";
    
    window.Highlight = Highlight;
})();