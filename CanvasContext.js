/* globals window */

(function () {
    function CanvasContext(canvas) {
        this.context = canvas.getContext("2d");
        this.context.font = "12px HelveticaNeue-Light, sans-serif";
        this.context.fillStyle = "rgb(0, 0, 0)";
        this.context.strokeStyle = "rgb(211, 211, 211)";
    }

    CanvasContext.prototype.drawImage = function(image, x, y) {
        this.context.drawImage(image, x, y);
    };

    // paint the box
    CanvasContext.prototype.paintBox = function(element, fillStyle) {
        
        var width = element.clientWidth,
            height = element.clientHeight,
            // offset the amount scrolled horizontally
            xStart = element.getBoundingClientRect().left + window.scrollX,
            // offset the amount scrolled vertically
            yStart = element.getBoundingClientRect().top + window.scrollY;
        
        this.context.save();
        
        // paint the box with the given color
        this.context.clearRect(xStart, yStart, width, height);
        this.context.fillStyle = fillStyle;
        this.context.fillRect(xStart, yStart, width, height); 
    
        this.context.restore();
    };

    CanvasContext.prototype.paintTextbox = function(element) {
        var textarea = element.getElementsByTagName("textarea")[0],
            boundary = element.getBoundingClientRect(),
            paddingLeft = 20,
            paddingTop = 15,
            lineHeightCSS = window.getComputedStyle(textarea, null).getPropertyValue("line-height"),
            lineHeight = parseInt(lineHeightCSS.slice(0, -2), 10),
            lineWidth = textarea.clientWidth,

            // co-ordinates for drawing text
            xText = boundary.left + paddingLeft,
            yText = boundary.top + lineHeight + paddingTop,
        
            // co-ordinates for drawing box
            xStart = boundary.left,
            xEnd = xStart + boundary.width,
            yStart = boundary.top,
            yEnd = yStart + element.offsetHeight;
        
        drawBox(this.context, xStart, xEnd, yStart, yEnd);
      
        paintText(textarea.value, this.context, xText, yText, lineWidth, lineHeight, yEnd);
    };
    
    // @text may contain line breaks
    function paintText(text, context, x, y, lineWidth, lineHeight, yLimit) {
        
        // split the string at \n or \r
        var paragraphs = text.replace(/(\r\n|\n\r|\r|\n)/g, "\n").split("\n");

        paragraphs.every(function(paragraph) {
            y = write(paragraph, context, x, y, lineWidth, lineHeight, yLimit);
            y += lineHeight;
            
            if (!enoughSpace(y+lineHeight, yLimit)) {
                return false;   
            }
            
            return true;
        });
    }

    // return: y co-ordinate of the last line of the string written 
    function write(string, context, x, y, lineWidth, lineHeight, yLimit) {
        
        var words = string.split(" "),
            letterSpacing = String.fromCharCode(8202) + String.fromCharCode(8202),
            currentLine = "",
            w_Width = 0; // word width
        
        var print = function() {
            // print out the current line
            context.fillText(justify(context, currentLine, lineWidth), x, y);
            // start a new line
            y += lineHeight;
            currentLine = "";
        };
        
        words.every(function(word) {
            // space out the characters in the word
            word = word.split("").join(letterSpacing);
            
            // measure the width of the word
            w_Width = context.measureText(word).width;

            // word is longer than the line width
            if (lineWidth < w_Width) {
                
                if (currentLine !== "") {
                    // make sure there's enough space to print another line
                    if (!enoughSpace(y+lineHeight, yLimit)) {
                        return false;   
                    }
                    
                    // print out the current line and start a new line
                    print();
                }
                
                while (word) {
                    
                    // current line is full, print it out
                    if (context.measureText(currentLine).width >= lineWidth) {
                        // make sure there's enough space to print another line
                        if (!enoughSpace(y+lineHeight, yLimit)) {
                            return false;   
                        }
                        
                        print();
                    }
                    
                    // current line is not yet full, add another character to it
                    currentLine += word.slice(0, 1);
                    word = word.slice(1);
                }

                // the long word has been processed
                currentLine += " ";
            }

            // normal length word, but there is not enough space left in the current line
            else if ((lineWidth - context.measureText(currentLine).width) < w_Width) {
                
                // make sure there's enough space to print another line
                if (!enoughSpace(y+lineHeight, yLimit)) {
                    return false;   
                }
                
                // print it out and start a new line
                print();
            }

            // add the normal length word to the current line
            currentLine += word + " ";
            
            return true;
        });
                
        // print out the last line of the paragraph
        context.fillText(justify(context, currentLine, lineWidth), x, y);
        
        return y;
    }
    
    function enoughSpace(start, limit) {
        return start < limit;
    }

    function justify(context, string, l_Width) {

        var w_Array = string.trim().split(" "), // word array
            space = String.fromCharCode(8202),  // hairline space to be inserted between the words
            i = 0;

        // insert a hairline space in between each word
        while (context.measureText(string).width < l_Width) {       
            w_Array[i++] += space;
            i = (i >= (w_Array.length-1)) ? 0 : i;
            string = w_Array.join(" ");  
        }

        return string;    
    }
    
    // paint the box around the text
    function drawBox(context, xStart, xEnd, yStart, yEnd) {
        
        context.save();
        
        context.fillStyle = "rgb(255, 255, 255)";
        context.shadowColor = "rgba(0, 0, 0, 0.4)";
        context.shadowBlur = 10;
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        
        context.beginPath();
        context.moveTo(xStart-9, yStart+27);

        context.lineTo(xStart, yStart+22);
        context.lineTo(xStart, yStart);
        context.lineTo(xEnd, yStart);
        context.lineTo(xEnd, yEnd);
        context.lineTo(xStart, yEnd);

        context.lineTo(xStart, yStart+32);
        context.lineTo(xStart-9, yStart+27);

        context.closePath();
        context.stroke();
        context.fill();
        
        context.restore();
    }
    
    window.CanvasContext = CanvasContext;
        
})();
