/*globals $, gettext, fabric, PDFJS*/
var QRCodeArea = fabric.util.createClass(fabric.Rect, {

    type: 'QRCodeArea',

    initialize: function (options) {
        options || (options = {});

        this.callSuper('initialize', options);
        this.set('label', options.label || '');
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
        });
    },

    _render: function (ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '16px Helvetica';
        ctx.fillStyle = '#fff';
        ctx.fillText(gettext('QR Code'), -this.width / 2, -this.height / 2 + 20);
    }
});


var editor = {
    $pdfcv: null,
    $fcv: null,
    $cva: null,
    $fabric: null,
    objects: [],

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
        text.setControlsVisibility({'mtr': false});
        editor.fabric.add(text);
    },

    _add_qrcode: function () {
        var rect = new QRCodeArea({
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
    },

    init: function () {
        editor.$pdfcv = $("#pdf-canvas");
        editor.$fcv = $("#fabric-canvas");
        editor.$cva = $("#editor-canvas-area");
        editor._load_pdf();
        editor.$pdfcv.get(0).width = editor.$cva.width();
        $("#editor-add-qrcode").click(editor._add_qrcode);
        $("#editor-add-text").click(editor._add_text);
    }

};

$(function () {
    editor.init();
});
