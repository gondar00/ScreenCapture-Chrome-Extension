/* globals document, window, chrome, navigator, Image, Uint8Array, Blob, FileError, Event, CanvasContext, Box, Blackout, Highlight, UserInput */

function setImage(dataUrl) {

    var canvas = document.getElementById("canvas"),
        context = null,
        img = new Image();
    
    img.addEventListener("load", function() {
        
        // scale the canvas for retina displays
        canvas.width = img.width = img.width / window.devicePixelRatio;
        canvas.height = img.height = img.height / window.devicePixelRatio;      
        
        context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, canvas.width, canvas.height); 
    });
    
    img.src = dataUrl;
}

document.addEventListener("DOMContentLoaded", function() {

    var storage = {}, // stores all the user created box elements
        
        // saves user's preference for the startup page
        localStorage = window.localStorage, 
        url = chrome.extension.getURL("screenshot"),
        
        body = document.getElementsByTagName("body")[0],

        // start-up screen
        startUp = document.getElementById("start-up"),
        gotIt = document.getElementById("got-it"),
        hideWelcome = document.getElementById("hide-welcome"),
    
        canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        
        overlay = document.getElementById("overlay"),
        overlayContext = null,
        
        tools = document.getElementById("tools"),
        highlight = document.getElementById("highlight"),
        blackOut = document.getElementById("black-out"),
        addNote = document.getElementById("add-note"),
        download = document.getElementById("download"),
        
        // delete confirmation for user input
        confirmation = document.getElementById("confirmation"),
        delYes = document.getElementById("delYes"),
        delNo = document.getElementById("delNo"),
    
        // download confirmation
        btnOK = document.getElementById("OK"),
        
        // canvas for exporting the content
        exportCanvas = null,
        exportContext = null,
        
        // styles used for painting canvases
        backgroundStyle = "rgba(0, 0, 0, 0.5)";
    
    // check if user has previously asked to hide the start up screen
    if (localStorage.getItem(url)) {
        startUp.classList.add("hide");
    }
    
    // remove the start-up screen
    gotIt.addEventListener("click", function() {
        // save the flag
        var checked = hideWelcome.checked;
        if (checked) {
            localStorage.setItem(url, checked);    
        }
        
        // hide the start-up screen
        startUp.classList.add("hide");
    });
    
    // --- drag & drop ---
    
    var moveTarget = null, // the DOM element being dragged
        
        mouseX = 0, mouseY = 0,
        elementX = 0, elementY = 0,
    
        // the distance between the mouse and the top & left edge of the element being dragged
        xOffset = 0, yOffset = 0;
    
    var move = function(target, event) {
        
        moveTarget = target;
        
        elementX = moveTarget.offsetLeft;
        moveTarget.style.left = elementX + "px";

        elementY = moveTarget.offsetTop;
        moveTarget.style.top = elementY + "px";

        mouseX = event.clientX;
        mouseY = event.clientY;

        xOffset = mouseX - elementX;
        yOffset = mouseY - elementY;        
    };
  
    document.addEventListener("mousedown", function(event) {    
        var target = event.target;
        
        if (target.classList.contains("parent-mover")) {
            move(target.parentNode, event);
        }
        
        else if (target.classList.contains("movable")) {
            move(target, event);
        }
        
        else {
            moveTarget = null;   
        }
    });

    document.addEventListener("mousemove", function(event) {
        if (!moveTarget) { return; }

        mouseX = event.clientX;
        mouseY = event.clientY;

        elementX = mouseX - xOffset;
        moveTarget.style.left = elementX + "px";

        elementY = mouseY - yOffset;
        moveTarget.style.top = elementY + "px";

        if (moveTarget.classList.contains(Highlight.class)) {
            paintHighlights();
        }
    });
    
    document.addEventListener("mouseup", function() {
        moveTarget = null;
    });

    document.addEventListener("contextmenu", function() {
        // so that right clicks don't trigger drag & drop
        moveTarget = null;
    });
    
    // --- end of drag & drop ---
    
    var noAction = function() {
        return body.classList.contains("no-action");    
    };
    
    // -- handlers for removing user created DOM elements
    var removeHandler = function(event) {
        
        if (noAction()) { return; }
        
        // remove the parent node
        remove(event.target.parentNode);
    };
    
    // go through the storage and repaint all the highlights
    var paintHighlights = function() {
        
        if (!overlayContext) { return; }
        
        // make sure to paing the background first
        overlayContext.paintBox(body, backgroundStyle);
        
        // paint the element if it's a Highlight
        for (var id in storage) {
            var element = storage[id];
            if (element instanceof Highlight) {  
                element.paint(overlayContext);
            }
        }
    };
    
    // add the user created box element
    var insert = function(ui) {
        storage[ui.id] = ui; 
        body.appendChild(ui.element);
        
        // add a transparent background if there isn't one
        if (Object.keys(storage).length === 1) {
            
            if (!overlayContext) {
                overlay.width = canvas.width;
                overlay.height = canvas.height;
                overlayContext = new CanvasContext(overlay);     
            }
            
            overlayContext.paintBox(body, backgroundStyle);
        }
    };
    
    // removes the user created DOM element
    var remove = function(element) {        
        // remove the element from storage AND the UI
        delete storage[element.id];
        body.removeChild(element);
        
        // clear the background if no more user created DOM elements
        if (!Object.keys(storage).length) {
            overlayContext.paintBox(body, "transparent");
        }
        else {
            // repaint all the highlights
            paintHighlights();
        }
    };
    
    // -- code for handling userinput --
    
    // the user input that is about to be removed
    var toBeRemoved = null;
    
    var hideConfirmation = function() {
        confirmation.classList.remove("appear");
        body.classList.remove("no-action");
    };
    
    // delete the userinput
    delYes.addEventListener("click", function(event) {
        remove(toBeRemoved);   
        hideConfirmation();
    });
    
    // leave the note userinput
    delNo.addEventListener("click", function() {
        hideConfirmation();
    });
    
    var userInputHandler = function(event) {
        
        if (noAction()) { return; }

        var target = event.target;
        var userinput = target.parentNode;
        var userinputBox = storage[userinput.id];
        
        // if there is note, ask for confirmation
        if (!userinputBox.isEmpty()) {
            confirmation.classList.add("appear");
            body.classList.add("no-action");
            toBeRemoved = userinput;
        }
        
        else {
            remove(userinput);   
        }  
    };

    // hide the download confirmation 
    btnOK.addEventListener("click", function() {
        body.classList.remove("notice-up");
    });
    
    // download the content on the screen as a image file for user to save onto their computer
    var downloadImg = function() {
        
        // create export canvas if not already exist
        if (!exportCanvas) {
            exportCanvas = document.createElement("canvas");
            exportCanvas.width = canvas.width;
            exportCanvas.height = canvas.height;
            exportContext = new CanvasContext(exportCanvas);
        }

        // combine the two canvases
        exportContext.drawImage(canvas, 0, 0);
        exportContext.drawImage(overlay, 0, 0);
        
        // paint the UI components onto the EXPORT canvas if not already on OVERLAY
        for (var id in storage) {
            var box = storage[id];
            if (!(box instanceof Highlight)) {
                box.paint(exportContext);
            }
        }

        // download the file to user's download folder
        var dataUrl = exportCanvas.toDataURL("image/jpeg"),
            fileName = "snapshot-" + Date.now() + ".jpg",
            a = document.createElement('a');
        
        a.href = dataUrl;
        a.download = fileName; 
        a.click();   
        
        // display download confirmation
        body.classList.add("notice-up");
    };
    
    // Toolbar
    tools.addEventListener("click", function(event) {
        
        if (noAction()) { return; }
        
        var target = event.target;

        if (target === highlight) {
            var highlightBox = new Highlight(removeHandler, paintHighlights);
            insert(highlightBox);
            highlightBox.paint(overlayContext);
        }
        else if (target === blackOut) {
            insert(new Blackout(removeHandler));
        }
        else if (target === addNote) {
            var userInput = new UserInput(userInputHandler);
            insert(userInput);
            userInput.focus(); 
        }
        else if (target === download) {
            downloadImg();
        }
    });
});
