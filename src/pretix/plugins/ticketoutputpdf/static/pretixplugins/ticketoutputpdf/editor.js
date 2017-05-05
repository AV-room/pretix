/*globals $, gettext, fabric, PDFJS*/
fabric.Barcodearea = fabric.util.createClass(fabric.Rect, {
    type: 'barcodearea',

    initialize: function (options) {
        options || (options = {});

        this.callSuper('initialize', options);
        this.set('label', options.label || '');
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {});
    },

    _render: function (ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '16px Helvetica';
        ctx.fillStyle = '#fff';
        ctx.fillText(gettext('QR Code'), -this.width / 2, -this.height / 2 + 20);
    },
});
fabric.Barcodearea.fromObject = function(object, callback, forceAsync) {
    return fabric.Object._fromObject('Barcodearea', object, callback, forceAsync);
};


var editor = {
    $pdfcv: null,
    $fcv: null,
    $cva: null,
    $fabric: null,
    objects: [],
    history: [],
    _history_pos: 0,

    _load_pdf: function () {
        // TODO: Loading indicators
        var url = editor.$pdfcv.attr("data-pdf-url");
        // TODO: Handle cross-origin issues if static files are on a different origin
        PDFJS.workerSrc = editor.$pdfcv.attr("data-worker-url");

        // Asynchronous download of PDF
        var loadingTask = PDFJS.getDocument(url);
        loadingTask.promise.then(function (pdf) {
            console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function (page) {
                console.log('Page loaded');
                var canvas = document.getElementById('pdf-canvas');

                var scale = editor.$cva.width() / page.getViewport(1.0).width;
                var viewport = page.getViewport(scale);

                // Prepare canvas using PDF page dimensions
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.then(function () {
                    console.log('Page rendered');
                    editor._init_fabric();
                    editor._draw_objects();
                });
            });
        }, function (reason) {
            var msg = gettext('The PDF background file could not be loaded for the following reason:');
            editor._error(msg + ' ' + reason);
        });
    },

    _init_fabric: function () {
        editor.$fcv.get(0).width = editor.$pdfcv.get(0).width;
        editor.$fcv.get(0).height = editor.$pdfcv.get(0).height;
        editor.fabric = new fabric.Canvas('fabric-canvas');

        editor.fabric.on(
            'object:modified', function () {
                editor._create_savepoint();
            },
            'object:added', function () {
                editor._create_savepoint();
            });
    },

    _draw_objects: function () {
        console.log('Objects drawn')
    },

    _error: function (msg) {
        editor.$cva.before("<div class='alert alert-danger'>" + msg + "</div>");
    },

    _add_text: function () {
        var text = new fabric.Text('Hello world', {
            left: 100,
            top: 100,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
        });
        text.setControlsVisibility({
            'tr': false,
            'tl': false,
            'mt': false,
            'br': false,
            'bl': false,
            'mb': false,
            'mr': false,
            'ml': false,
            'mtr': false
        });
        editor.fabric.add(text);
        editor._create_savepoint();
    },

    _add_qrcode: function () {
        var rect = new fabric.Barcodearea({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            lockRotation: true,
            lockUniScaling: true,
            fill: '#666'
        });
        rect.setControlsVisibility({'mtr': false});
        editor.fabric.add(rect);
        editor._create_savepoint();
    },

    _on_keydown: function (e) {
        var step = e.shiftKey ? 10 : 1;
        var thing = editor.fabric.getActiveObject() ? editor.fabric.getActiveObject() : editor.fabric.getActiveGroup();
        console.log(e.keyCode, e.ctrlKey, e.shiftKey);
        switch (e.keyCode) {
            case 38:  /* Up arrow */
                thing.set('top', thing.get('top') - step);
                thing.setCoords();
                break;
            case 40:  /* Down arrow */
                thing.set('top', thing.get('top') + step);
                thing.setCoords();
                break;
            case 37:  /* Left arrow  */
                thing.set('left', thing.get('left') - step);
                thing.setCoords();
                break;
            case 39:  /* Right arrow  */
                thing.set('left', thing.get('left') + step);
                thing.setCoords();
                break;
            case 46:  /* Delete */
                thing.remove();
                break;
            case 89:  /* Y */
                if (e.ctrlKey) {
                    editor._redo();
                }
                break;
            case 90:  /* Z */
                if (e.ctrlKey) {
                    editor._undo();
                }
                break;
            default:
                return;
        }
        e.preventDefault();
        editor.fabric.renderAll();
    },

    _create_savepoint: function () {
        var state = JSON.stringify(editor.fabric);
        if (editor._history_pos > 0) {
            editor.history.splice(-1 * editor._history_pos, editor._history_pos);
            editor._history_pos = 0;
        }
        editor.history.push(state);
    },

    _undo: function undo() {
        if (editor._history_pos < editor.history.length) {
            editor._history_pos += 1;
            editor.fabric.clear().renderAll();
            editor.fabric.loadFromJSON(editor.history[editor.history.length - 1 - editor._history_pos]);
            editor.fabric.renderAll();
        }
    },

    _redo: function redo() {
        if (editor._history_pos > 0) {
            editor._history_pos -= 1;
            editor.fabric.clear().renderAll();
            editor.fabric.loadFromJSON(editor.history[editor.history.length - 1 - editor._history_pos]);
            editor.fabric.renderAll();
        }
    },

    init: function () {
        editor.$pdfcv = $("#pdf-canvas");
        editor.$fcv = $("#fabric-canvas");
        editor.$cva = $("#editor-canvas-area");
        editor._load_pdf();
        editor.$pdfcv.get(0).width = editor.$cva.width();
        $("#editor-add-qrcode").click(editor._add_qrcode);
        $("#editor-add-text").click(editor._add_text);
        editor.$cva.get(0).tabIndex = 1000;
        editor.$cva.on("keydown", editor._on_keydown);
    }

};

$(function () {
    editor.init();
});
