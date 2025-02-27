(() => {
    var __webpack_modules__ = {
        9500: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Global_1 = __webpack_require__(9427);
            var now = function() {
                if (Global_1.glob.performance && Global_1.glob.performance.now) return function() {
                    return Global_1.glob.performance.now();
                };
                return function() {
                    return (new Date).getTime();
                };
            }();
            var Animation = function() {
                function Animation(func, layers) {
                    this.id = Animation.animIdCounter++;
                    this.frame = {
                        time: 0,
                        timeDiff: 0,
                        lastTime: now(),
                        frameRate: 0
                    };
                    this.func = func;
                    this.setLayers(layers);
                }
                Animation.prototype.setLayers = function(layers) {
                    var lays = [];
                    if (!layers) lays = []; else if (layers.length > 0) lays = layers; else lays = [ layers ];
                    this.layers = lays;
                    return this;
                };
                Animation.prototype.getLayers = function() {
                    return this.layers;
                };
                Animation.prototype.addLayer = function(layer) {
                    var n, layers = this.layers, len = layers.length;
                    for (n = 0; n < len; n++) if (layers[n]._id === layer._id) return false;
                    this.layers.push(layer);
                    return true;
                };
                Animation.prototype.isRunning = function() {
                    var n, a = Animation, animations = a.animations, len = animations.length;
                    for (n = 0; n < len; n++) if (animations[n].id === this.id) return true;
                    return false;
                };
                Animation.prototype.start = function() {
                    this.stop();
                    this.frame.timeDiff = 0;
                    this.frame.lastTime = now();
                    Animation._addAnimation(this);
                    return this;
                };
                Animation.prototype.stop = function() {
                    Animation._removeAnimation(this);
                    return this;
                };
                Animation.prototype._updateFrameObject = function(time) {
                    this.frame.timeDiff = time - this.frame.lastTime;
                    this.frame.lastTime = time;
                    this.frame.time += this.frame.timeDiff;
                    this.frame.frameRate = 1e3 / this.frame.timeDiff;
                };
                Animation._addAnimation = function(anim) {
                    this.animations.push(anim);
                    this._handleAnimation();
                };
                Animation._removeAnimation = function(anim) {
                    var n, id = anim.id, animations = this.animations, len = animations.length;
                    for (n = 0; n < len; n++) if (animations[n].id === id) {
                        this.animations.splice(n, 1);
                        break;
                    }
                };
                Animation._runFrames = function() {
                    var anim, layers, func, n, i, layersLen, layer, key, needRedraw, layerHash = {}, animations = this.animations;
                    for (n = 0; n < animations.length; n++) {
                        anim = animations[n];
                        layers = anim.layers;
                        func = anim.func;
                        anim._updateFrameObject(now());
                        layersLen = layers.length;
                        if (func) needRedraw = func.call(anim, anim.frame) !== false; else needRedraw = true;
                        if (!needRedraw) continue;
                        for (i = 0; i < layersLen; i++) {
                            layer = layers[i];
                            if (layer._id !== void 0) layerHash[layer._id] = layer;
                        }
                    }
                    for (key in layerHash) {
                        if (!layerHash.hasOwnProperty(key)) continue;
                        layerHash[key].draw();
                    }
                };
                Animation._animationLoop = function() {
                    var Anim = Animation;
                    if (Anim.animations.length) {
                        Anim._runFrames();
                        requestAnimationFrame(Anim._animationLoop);
                    } else Anim.animRunning = false;
                };
                Animation._handleAnimation = function() {
                    if (!this.animRunning) {
                        this.animRunning = true;
                        requestAnimationFrame(this._animationLoop);
                    }
                };
                Animation.animations = [];
                Animation.animIdCounter = 0;
                Animation.animRunning = false;
                return Animation;
            }();
            exports.Animation = Animation;
        },
        3076: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Container_1 = __webpack_require__(9957);
            var Node_1 = __webpack_require__(5924);
            var Factory_1 = __webpack_require__(696);
            var Canvas_1 = __webpack_require__(7544);
            var BaseLayer = function(_super) {
                __extends(BaseLayer, _super);
                function BaseLayer(config) {
                    var _this = _super.call(this, config) || this;
                    _this.canvas = new Canvas_1.SceneCanvas;
                    _this._waitingForDraw = false;
                    _this.on("visibleChange", _this._checkVisibility);
                    _this._checkVisibility();
                    _this.on("imageSmoothingEnabledChange", _this._setSmoothEnabled);
                    _this._setSmoothEnabled();
                    return _this;
                }
                BaseLayer.prototype.createPNGStream = function() {
                    var c = this.canvas._canvas;
                    return c.createPNGStream();
                };
                BaseLayer.prototype.getCanvas = function() {
                    return this.canvas;
                };
                BaseLayer.prototype.getHitCanvas = function() {
                    return this.hitCanvas;
                };
                BaseLayer.prototype.getContext = function() {
                    return this.getCanvas().getContext();
                };
                BaseLayer.prototype.clear = function(bounds) {
                    this.getContext().clear(bounds);
                    return this;
                };
                BaseLayer.prototype.setZIndex = function(index) {
                    _super.prototype.setZIndex.call(this, index);
                    var stage = this.getStage();
                    if (stage) {
                        stage.content.removeChild(this.getCanvas()._canvas);
                        if (index < stage.children.length - 1) stage.content.insertBefore(this.getCanvas()._canvas, stage.children[index + 1].getCanvas()._canvas); else stage.content.appendChild(this.getCanvas()._canvas);
                    }
                    return this;
                };
                BaseLayer.prototype.moveToTop = function() {
                    Node_1.Node.prototype.moveToTop.call(this);
                    var stage = this.getStage();
                    if (stage) {
                        stage.content.removeChild(this.getCanvas()._canvas);
                        stage.content.appendChild(this.getCanvas()._canvas);
                    }
                    return true;
                };
                BaseLayer.prototype.moveUp = function() {
                    var moved = Node_1.Node.prototype.moveUp.call(this);
                    if (!moved) return false;
                    var stage = this.getStage();
                    if (!stage) return false;
                    stage.content.removeChild(this.getCanvas()._canvas);
                    if (this.index < stage.children.length - 1) stage.content.insertBefore(this.getCanvas()._canvas, stage.children[this.index + 1].getCanvas()._canvas); else stage.content.appendChild(this.getCanvas()._canvas);
                    return true;
                };
                BaseLayer.prototype.moveDown = function() {
                    if (Node_1.Node.prototype.moveDown.call(this)) {
                        var stage = this.getStage();
                        if (stage) {
                            var children = stage.children;
                            stage.content.removeChild(this.getCanvas()._canvas);
                            stage.content.insertBefore(this.getCanvas()._canvas, children[this.index + 1].getCanvas()._canvas);
                        }
                        return true;
                    }
                    return false;
                };
                BaseLayer.prototype.moveToBottom = function() {
                    if (Node_1.Node.prototype.moveToBottom.call(this)) {
                        var stage = this.getStage();
                        if (stage) {
                            var children = stage.children;
                            stage.content.removeChild(this.getCanvas()._canvas);
                            stage.content.insertBefore(this.getCanvas()._canvas, children[1].getCanvas()._canvas);
                        }
                        return true;
                    }
                    return false;
                };
                BaseLayer.prototype.getLayer = function() {
                    return this;
                };
                BaseLayer.prototype.hitGraphEnabled = function() {
                    return true;
                };
                BaseLayer.prototype.remove = function() {
                    var _canvas = this.getCanvas()._canvas;
                    Node_1.Node.prototype.remove.call(this);
                    if (_canvas && _canvas.parentNode && Util_1.Util._isInDocument(_canvas)) _canvas.parentNode.removeChild(_canvas);
                    return this;
                };
                BaseLayer.prototype.getStage = function() {
                    return this.parent;
                };
                BaseLayer.prototype.setSize = function(_a) {
                    var width = _a.width, height = _a.height;
                    this.canvas.setSize(width, height);
                    this._setSmoothEnabled();
                    return this;
                };
                BaseLayer.prototype._toKonvaCanvas = function(config) {
                    config = config || {};
                    config.width = config.width || this.getWidth();
                    config.height = config.height || this.getHeight();
                    config.x = config.x !== void 0 ? config.x : this.x();
                    config.y = config.y !== void 0 ? config.y : this.y();
                    return Node_1.Node.prototype._toKonvaCanvas.call(this, config);
                };
                BaseLayer.prototype._checkVisibility = function() {
                    var visible = this.visible();
                    if (visible) this.canvas._canvas.style.display = "block"; else this.canvas._canvas.style.display = "none";
                };
                BaseLayer.prototype._setSmoothEnabled = function() {
                    this.getContext()._context.imageSmoothingEnabled = this.imageSmoothingEnabled();
                };
                BaseLayer.prototype.getWidth = function() {
                    if (this.parent) return this.parent.width();
                };
                BaseLayer.prototype.setWidth = function() {
                    Util_1.Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
                };
                BaseLayer.prototype.getHeight = function() {
                    if (this.parent) return this.parent.height();
                };
                BaseLayer.prototype.setHeight = function() {
                    Util_1.Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
                };
                BaseLayer.prototype.getIntersection = function(pos, selector) {
                    return null;
                };
                BaseLayer.prototype.batchDraw = function() {
                    var _this = this;
                    if (!this._waitingForDraw) {
                        this._waitingForDraw = true;
                        Util_1.Util.requestAnimFrame((function() {
                            _this.draw();
                            _this._waitingForDraw = false;
                        }));
                    }
                    return this;
                };
                BaseLayer.prototype._applyTransform = function(shape, context, top) {
                    var m = shape.getAbsoluteTransform(top).getMatrix();
                    context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                };
                return BaseLayer;
            }(Container_1.Container);
            exports.BaseLayer = BaseLayer;
            BaseLayer.prototype.nodeType = "BaseLayer";
            Factory_1.Factory.addGetterSetter(BaseLayer, "imageSmoothingEnabled", true);
            Factory_1.Factory.addGetterSetter(BaseLayer, "clearBeforeDraw", true);
            Util_1.Collection.mapMethods(BaseLayer);
        },
        7544: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Context_1 = __webpack_require__(8265);
            var Global_1 = __webpack_require__(9427);
            var Factory_1 = __webpack_require__(696);
            var Validators_1 = __webpack_require__(4783);
            var _pixelRatio;
            function getDevicePixelRatio() {
                if (_pixelRatio) return _pixelRatio;
                var canvas = Util_1.Util.createCanvasElement();
                var context = canvas.getContext("2d");
                _pixelRatio = function() {
                    var devicePixelRatio = Global_1.Konva._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                    return devicePixelRatio / backingStoreRatio;
                }();
                return _pixelRatio;
            }
            var Canvas = function() {
                function Canvas(config) {
                    this.pixelRatio = 1;
                    this.width = 0;
                    this.height = 0;
                    this.isCache = false;
                    var conf = config || {};
                    var pixelRatio = conf.pixelRatio || Global_1.Konva.pixelRatio || getDevicePixelRatio();
                    this.pixelRatio = pixelRatio;
                    this._canvas = Util_1.Util.createCanvasElement();
                    this._canvas.style.padding = "0";
                    this._canvas.style.margin = "0";
                    this._canvas.style.border = "0";
                    this._canvas.style.background = "transparent";
                    this._canvas.style.position = "absolute";
                    this._canvas.style.top = "0";
                    this._canvas.style.left = "0";
                }
                Canvas.prototype.getContext = function() {
                    return this.context;
                };
                Canvas.prototype.getPixelRatio = function() {
                    return this.pixelRatio;
                };
                Canvas.prototype.setPixelRatio = function(pixelRatio) {
                    var previousRatio = this.pixelRatio;
                    this.pixelRatio = pixelRatio;
                    this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
                };
                Canvas.prototype.setWidth = function(width) {
                    this.width = this._canvas.width = width * this.pixelRatio;
                    this._canvas.style.width = width + "px";
                    var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
                    _context.scale(pixelRatio, pixelRatio);
                };
                Canvas.prototype.setHeight = function(height) {
                    this.height = this._canvas.height = height * this.pixelRatio;
                    this._canvas.style.height = height + "px";
                    var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
                    _context.scale(pixelRatio, pixelRatio);
                };
                Canvas.prototype.getWidth = function() {
                    return this.width;
                };
                Canvas.prototype.getHeight = function() {
                    return this.height;
                };
                Canvas.prototype.setSize = function(width, height) {
                    this.setWidth(width || 0);
                    this.setHeight(height || 0);
                };
                Canvas.prototype.toDataURL = function(mimeType, quality) {
                    try {
                        return this._canvas.toDataURL(mimeType, quality);
                    } catch (e) {
                        try {
                            return this._canvas.toDataURL();
                        } catch (err) {
                            Util_1.Util.error("Unable to get data URL. " + err.message + " For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.");
                            return "";
                        }
                    }
                };
                return Canvas;
            }();
            exports.Canvas = Canvas;
            Factory_1.Factory.addGetterSetter(Canvas, "pixelRatio", void 0, Validators_1.getNumberValidator());
            var SceneCanvas = function(_super) {
                __extends(SceneCanvas, _super);
                function SceneCanvas(config) {
                    if (config === void 0) config = {
                        width: 0,
                        height: 0
                    };
                    var _this = _super.call(this, config) || this;
                    _this.context = new Context_1.SceneContext(_this);
                    _this.setSize(config.width, config.height);
                    return _this;
                }
                return SceneCanvas;
            }(Canvas);
            exports.SceneCanvas = SceneCanvas;
            var HitCanvas = function(_super) {
                __extends(HitCanvas, _super);
                function HitCanvas(config) {
                    if (config === void 0) config = {
                        width: 0,
                        height: 0
                    };
                    var _this = _super.call(this, config) || this;
                    _this.hitCanvas = true;
                    _this.context = new Context_1.HitContext(_this);
                    _this.setSize(config.width, config.height);
                    return _this;
                }
                return HitCanvas;
            }(Canvas);
            exports.HitCanvas = HitCanvas;
        },
        9957: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var DragAndDrop_1 = __webpack_require__(7752);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Container = function(_super) {
                __extends(Container, _super);
                function Container() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.children = new Util_1.Collection;
                    return _this;
                }
                Container.prototype.getChildren = function(filterFunc) {
                    if (!filterFunc) return this.children;
                    var results = new Util_1.Collection;
                    this.children.each((function(child) {
                        if (filterFunc(child)) results.push(child);
                    }));
                    return results;
                };
                Container.prototype.hasChildren = function() {
                    return this.getChildren().length > 0;
                };
                Container.prototype.removeChildren = function() {
                    var child;
                    for (var i = 0; i < this.children.length; i++) {
                        child = this.children[i];
                        child.parent = null;
                        child.index = 0;
                        child.remove();
                    }
                    this.children = new Util_1.Collection;
                    return this;
                };
                Container.prototype.destroyChildren = function() {
                    var child;
                    for (var i = 0; i < this.children.length; i++) {
                        child = this.children[i];
                        child.parent = null;
                        child.index = 0;
                        child.destroy();
                    }
                    this.children = new Util_1.Collection;
                    return this;
                };
                Container.prototype.add = function() {
                    var children = [];
                    for (var _i = 0; _i < arguments.length; _i++) children[_i] = arguments[_i];
                    if (arguments.length > 1) {
                        for (var i = 0; i < arguments.length; i++) this.add(arguments[i]);
                        return this;
                    }
                    var child = children[0];
                    if (child.getParent()) {
                        child.moveTo(this);
                        return this;
                    }
                    var _children = this.children;
                    this._validateAdd(child);
                    child._clearCaches();
                    child.index = _children.length;
                    child.parent = this;
                    _children.push(child);
                    this._fire("add", {
                        child
                    });
                    return this;
                };
                Container.prototype.destroy = function() {
                    if (this.hasChildren()) this.destroyChildren();
                    _super.prototype.destroy.call(this);
                    return this;
                };
                Container.prototype.find = function(selector) {
                    return this._generalFind(selector, false);
                };
                Container.prototype.get = function(selector) {
                    Util_1.Util.warn("collection.get() method is deprecated. Please use collection.find() instead.");
                    return this.find(selector);
                };
                Container.prototype.findOne = function(selector) {
                    var result = this._generalFind(selector, true);
                    return result.length > 0 ? result[0] : void 0;
                };
                Container.prototype._generalFind = function(selector, findOne) {
                    var retArr = [];
                    this._descendants((function(node) {
                        var valid = node._isMatch(selector);
                        if (valid) retArr.push(node);
                        if (valid && findOne) return true;
                        return false;
                    }));
                    return Util_1.Collection.toCollection(retArr);
                };
                Container.prototype._descendants = function(fn) {
                    var shouldStop = false;
                    for (var i = 0; i < this.children.length; i++) {
                        var child = this.children[i];
                        shouldStop = fn(child);
                        if (shouldStop) return true;
                        if (!child.hasChildren()) continue;
                        shouldStop = child._descendants(fn);
                        if (shouldStop) return true;
                    }
                    return false;
                };
                Container.prototype.toObject = function() {
                    var obj = Node_1.Node.prototype.toObject.call(this);
                    obj.children = [];
                    var children = this.getChildren();
                    var len = children.length;
                    for (var n = 0; n < len; n++) {
                        var child = children[n];
                        obj.children.push(child.toObject());
                    }
                    return obj;
                };
                Container.prototype.isAncestorOf = function(node) {
                    var parent = node.getParent();
                    while (parent) {
                        if (parent._id === this._id) return true;
                        parent = parent.getParent();
                    }
                    return false;
                };
                Container.prototype.clone = function(obj) {
                    var node = Node_1.Node.prototype.clone.call(this, obj);
                    this.getChildren().each((function(no) {
                        node.add(no.clone());
                    }));
                    return node;
                };
                Container.prototype.getAllIntersections = function(pos) {
                    var arr = [];
                    this.find("Shape").each((function(shape) {
                        if (shape.isVisible() && shape.intersects(pos)) arr.push(shape);
                    }));
                    return arr;
                };
                Container.prototype._setChildrenIndices = function() {
                    this.children.each((function(child, n) {
                        child.index = n;
                    }));
                };
                Container.prototype.drawScene = function(can, top, caching) {
                    var layer = this.getLayer(), canvas = can || layer && layer.getCanvas(), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
                    if (this.isVisible() || caching) if (!caching && cachedSceneCanvas) {
                        context.save();
                        layer._applyTransform(this, context, top);
                        this._drawCachedSceneCanvas(context);
                        context.restore();
                    } else this._drawChildren(canvas, "drawScene", top, false, caching, caching);
                    return this;
                };
                Container.prototype.drawHit = function(can, top, caching) {
                    var layer = this.getLayer(), canvas = can || layer && layer.hitCanvas, context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
                    if (this.shouldDrawHit(canvas) || caching) if (!caching && cachedHitCanvas) {
                        context.save();
                        layer._applyTransform(this, context, top);
                        this._drawCachedHitCanvas(context);
                        context.restore();
                    } else this._drawChildren(canvas, "drawHit", top, false, caching, caching);
                    return this;
                };
                Container.prototype._drawChildren = function(canvas, drawMethod, top, caching, skipBuffer, skipComposition) {
                    var clipX, clipY, layer = this.getLayer(), context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = clipWidth && clipHeight || clipFunc;
                    if (hasClip && layer) {
                        context.save();
                        var transform = this.getAbsoluteTransform(top);
                        var m = transform.getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        context.beginPath();
                        if (clipFunc) clipFunc.call(this, context, this); else {
                            clipX = this.clipX();
                            clipY = this.clipY();
                            context.rect(clipX, clipY, clipWidth, clipHeight);
                        }
                        context.clip();
                        m = transform.copy().invert().getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                    }
                    var hasComposition = this.globalCompositeOperation() !== "source-over" && !skipComposition && drawMethod === "drawScene";
                    if (hasComposition && layer) {
                        context.save();
                        context._applyGlobalCompositeOperation(this);
                    }
                    this.children.each((function(child) {
                        child[drawMethod](canvas, top, caching, skipBuffer);
                    }));
                    if (hasComposition && layer) context.restore();
                    if (hasClip && layer) context.restore();
                };
                Container.prototype.shouldDrawHit = function(canvas) {
                    if (canvas && canvas.isCache) return true;
                    var layer = this.getLayer();
                    var layerUnderDrag = false;
                    DragAndDrop_1.DD._dragElements.forEach((function(elem) {
                        if (elem.dragStatus === "dragging" && elem.node.getLayer() === layer) layerUnderDrag = true;
                    }));
                    var dragSkip = !Global_1.Konva.hitOnDragEnabled && layerUnderDrag;
                    return layer && layer.hitGraphEnabled() && this.isVisible() && !dragSkip;
                };
                Container.prototype.getClientRect = function(config) {
                    config = config || {};
                    var skipTransform = config.skipTransform;
                    var relativeTo = config.relativeTo;
                    var minX, minY, maxX, maxY;
                    var selfRect = {
                        x: 1 / 0,
                        y: 1 / 0,
                        width: 0,
                        height: 0
                    };
                    var that = this;
                    this.children.each((function(child) {
                        if (!child.visible()) return;
                        var rect = child.getClientRect({
                            relativeTo: that,
                            skipShadow: config.skipShadow,
                            skipStroke: config.skipStroke
                        });
                        if (rect.width === 0 && rect.height === 0) return;
                        if (minX === void 0) {
                            minX = rect.x;
                            minY = rect.y;
                            maxX = rect.x + rect.width;
                            maxY = rect.y + rect.height;
                        } else {
                            minX = Math.min(minX, rect.x);
                            minY = Math.min(minY, rect.y);
                            maxX = Math.max(maxX, rect.x + rect.width);
                            maxY = Math.max(maxY, rect.y + rect.height);
                        }
                    }));
                    var shapes = this.find("Shape");
                    var hasVisible = false;
                    for (var i = 0; i < shapes.length; i++) {
                        var shape = shapes[i];
                        if (shape._isVisible(this)) {
                            hasVisible = true;
                            break;
                        }
                    }
                    if (hasVisible && minX !== void 0) selfRect = {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY
                    }; else selfRect = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                    if (!skipTransform) return this._transformedRect(selfRect, relativeTo);
                    return selfRect;
                };
                return Container;
            }(Node_1.Node);
            exports.Container = Container;
            Factory_1.Factory.addComponentsGetterSetter(Container, "clip", [ "x", "y", "width", "height" ]);
            Factory_1.Factory.addGetterSetter(Container, "clipX", void 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Container, "clipY", void 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Container, "clipWidth", void 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Container, "clipHeight", void 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Container, "clipFunc");
            Util_1.Collection.mapMethods(Container);
        },
        8265: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Global_1 = __webpack_require__(9427);
            var COMMA = ",", OPEN_PAREN = "(", CLOSE_PAREN = ")", OPEN_PAREN_BRACKET = "([", CLOSE_BRACKET_PAREN = "])", SEMICOLON = ";", DOUBLE_PAREN = "()", EQUALS = "=", CONTEXT_METHODS = [ "arc", "arcTo", "beginPath", "bezierCurveTo", "clearRect", "clip", "closePath", "createLinearGradient", "createPattern", "createRadialGradient", "drawImage", "ellipse", "fill", "fillText", "getImageData", "createImageData", "lineTo", "moveTo", "putImageData", "quadraticCurveTo", "rect", "restore", "rotate", "save", "scale", "setLineDash", "setTransform", "stroke", "strokeText", "transform", "translate" ];
            var CONTEXT_PROPERTIES = [ "fillStyle", "strokeStyle", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "lineCap", "lineDashOffset", "lineJoin", "lineWidth", "miterLimit", "font", "textAlign", "textBaseline", "globalAlpha", "globalCompositeOperation", "imageSmoothingEnabled" ];
            var traceArrMax = 100;
            var Context = function() {
                function Context(canvas) {
                    this.canvas = canvas;
                    this._context = canvas._canvas.getContext("2d");
                    if (Global_1.Konva.enableTrace) {
                        this.traceArr = [];
                        this._enableTrace();
                    }
                }
                Context.prototype.fillShape = function(shape) {
                    if (shape.fillEnabled()) this._fill(shape);
                };
                Context.prototype._fill = function(shape) {};
                Context.prototype.strokeShape = function(shape) {
                    if (shape.hasStroke()) this._stroke(shape);
                };
                Context.prototype._stroke = function(shape) {};
                Context.prototype.fillStrokeShape = function(shape) {
                    this.fillShape(shape);
                    this.strokeShape(shape);
                };
                Context.prototype.getTrace = function(relaxed) {
                    var n, trace, method, args, traceArr = this.traceArr, len = traceArr.length, str = "";
                    for (n = 0; n < len; n++) {
                        trace = traceArr[n];
                        method = trace.method;
                        if (method) {
                            args = trace.args;
                            str += method;
                            if (relaxed) str += DOUBLE_PAREN; else if (Util_1.Util._isArray(args[0])) str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN; else str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
                        } else {
                            str += trace.property;
                            if (!relaxed) str += EQUALS + trace.val;
                        }
                        str += SEMICOLON;
                    }
                    return str;
                };
                Context.prototype.clearTrace = function() {
                    this.traceArr = [];
                };
                Context.prototype._trace = function(str) {
                    var len, traceArr = this.traceArr;
                    traceArr.push(str);
                    len = traceArr.length;
                    if (len >= traceArrMax) traceArr.shift();
                };
                Context.prototype.reset = function() {
                    var pixelRatio = this.getCanvas().getPixelRatio();
                    this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
                };
                Context.prototype.getCanvas = function() {
                    return this.canvas;
                };
                Context.prototype.clear = function(bounds) {
                    var canvas = this.getCanvas();
                    if (bounds) this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0); else this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
                };
                Context.prototype._applyLineCap = function(shape) {
                    var lineCap = shape.getLineCap();
                    if (lineCap) this.setAttr("lineCap", lineCap);
                };
                Context.prototype._applyOpacity = function(shape) {
                    var absOpacity = shape.getAbsoluteOpacity();
                    if (absOpacity !== 1) this.setAttr("globalAlpha", absOpacity);
                };
                Context.prototype._applyLineJoin = function(shape) {
                    var lineJoin = shape.getLineJoin();
                    if (lineJoin) this.setAttr("lineJoin", lineJoin);
                };
                Context.prototype.setAttr = function(attr, val) {
                    this._context[attr] = val;
                };
                Context.prototype.arc = function(a0, a1, a2, a3, a4, a5) {
                    this._context.arc(a0, a1, a2, a3, a4, a5);
                };
                Context.prototype.arcTo = function(a0, a1, a2, a3, a4) {
                    this._context.arcTo(a0, a1, a2, a3, a4);
                };
                Context.prototype.beginPath = function() {
                    this._context.beginPath();
                };
                Context.prototype.bezierCurveTo = function(a0, a1, a2, a3, a4, a5) {
                    this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
                };
                Context.prototype.clearRect = function(a0, a1, a2, a3) {
                    this._context.clearRect(a0, a1, a2, a3);
                };
                Context.prototype.clip = function() {
                    this._context.clip();
                };
                Context.prototype.closePath = function() {
                    this._context.closePath();
                };
                Context.prototype.createImageData = function(a0, a1) {
                    var a = arguments;
                    if (a.length === 2) return this._context.createImageData(a0, a1); else if (a.length === 1) return this._context.createImageData(a0);
                };
                Context.prototype.createLinearGradient = function(a0, a1, a2, a3) {
                    return this._context.createLinearGradient(a0, a1, a2, a3);
                };
                Context.prototype.createPattern = function(a0, a1) {
                    return this._context.createPattern(a0, a1);
                };
                Context.prototype.createRadialGradient = function(a0, a1, a2, a3, a4, a5) {
                    return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
                };
                Context.prototype.drawImage = function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                    var a = arguments, _context = this._context;
                    if (a.length === 3) _context.drawImage(a0, a1, a2); else if (a.length === 5) _context.drawImage(a0, a1, a2, a3, a4); else if (a.length === 9) _context.drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8);
                };
                Context.prototype.ellipse = function(a0, a1, a2, a3, a4, a5, a6, a7) {
                    this._context.ellipse(a0, a1, a2, a3, a4, a5, a6, a7);
                };
                Context.prototype.isPointInPath = function(x, y) {
                    return this._context.isPointInPath(x, y);
                };
                Context.prototype.fill = function() {
                    this._context.fill();
                };
                Context.prototype.fillRect = function(x, y, width, height) {
                    this._context.fillRect(x, y, width, height);
                };
                Context.prototype.strokeRect = function(x, y, width, height) {
                    this._context.strokeRect(x, y, width, height);
                };
                Context.prototype.fillText = function(a0, a1, a2) {
                    this._context.fillText(a0, a1, a2);
                };
                Context.prototype.measureText = function(text) {
                    return this._context.measureText(text);
                };
                Context.prototype.getImageData = function(a0, a1, a2, a3) {
                    return this._context.getImageData(a0, a1, a2, a3);
                };
                Context.prototype.lineTo = function(a0, a1) {
                    this._context.lineTo(a0, a1);
                };
                Context.prototype.moveTo = function(a0, a1) {
                    this._context.moveTo(a0, a1);
                };
                Context.prototype.rect = function(a0, a1, a2, a3) {
                    this._context.rect(a0, a1, a2, a3);
                };
                Context.prototype.putImageData = function(a0, a1, a2) {
                    this._context.putImageData(a0, a1, a2);
                };
                Context.prototype.quadraticCurveTo = function(a0, a1, a2, a3) {
                    this._context.quadraticCurveTo(a0, a1, a2, a3);
                };
                Context.prototype.restore = function() {
                    this._context.restore();
                };
                Context.prototype.rotate = function(a0) {
                    this._context.rotate(a0);
                };
                Context.prototype.save = function() {
                    this._context.save();
                };
                Context.prototype.scale = function(a0, a1) {
                    this._context.scale(a0, a1);
                };
                Context.prototype.setLineDash = function(a0) {
                    if (this._context.setLineDash) this._context.setLineDash(a0); else if ("mozDash" in this._context) this._context["mozDash"] = a0; else if ("webkitLineDash" in this._context) this._context["webkitLineDash"] = a0;
                };
                Context.prototype.getLineDash = function() {
                    return this._context.getLineDash();
                };
                Context.prototype.setTransform = function(a0, a1, a2, a3, a4, a5) {
                    this._context.setTransform(a0, a1, a2, a3, a4, a5);
                };
                Context.prototype.stroke = function() {
                    this._context.stroke();
                };
                Context.prototype.strokeText = function(a0, a1, a2, a3) {
                    this._context.strokeText(a0, a1, a2, a3);
                };
                Context.prototype.transform = function(a0, a1, a2, a3, a4, a5) {
                    this._context.transform(a0, a1, a2, a3, a4, a5);
                };
                Context.prototype.translate = function(a0, a1) {
                    this._context.translate(a0, a1);
                };
                Context.prototype._enableTrace = function() {
                    var n, args, that = this, len = CONTEXT_METHODS.length, _simplifyArray = Util_1.Util._simplifyArray, origSetter = this.setAttr;
                    var func = function(methodName) {
                        var ret, origMethod = that[methodName];
                        that[methodName] = function() {
                            args = _simplifyArray(Array.prototype.slice.call(arguments, 0));
                            ret = origMethod.apply(that, arguments);
                            that._trace({
                                method: methodName,
                                args
                            });
                            return ret;
                        };
                    };
                    for (n = 0; n < len; n++) func(CONTEXT_METHODS[n]);
                    that.setAttr = function() {
                        origSetter.apply(that, arguments);
                        var prop = arguments[0];
                        var val = arguments[1];
                        if (prop === "shadowOffsetX" || prop === "shadowOffsetY" || prop === "shadowBlur") val /= this.canvas.getPixelRatio();
                        that._trace({
                            property: prop,
                            val
                        });
                    };
                };
                Context.prototype._applyGlobalCompositeOperation = function(node) {
                    var globalCompositeOperation = node.getGlobalCompositeOperation();
                    if (globalCompositeOperation !== "source-over") this.setAttr("globalCompositeOperation", globalCompositeOperation);
                };
                return Context;
            }();
            exports.Context = Context;
            CONTEXT_PROPERTIES.forEach((function(prop) {
                Object.defineProperty(Context.prototype, prop, {
                    get: function() {
                        return this._context[prop];
                    },
                    set: function(val) {
                        this._context[prop] = val;
                    }
                });
            }));
            var SceneContext = function(_super) {
                __extends(SceneContext, _super);
                function SceneContext() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                SceneContext.prototype._fillColor = function(shape) {
                    var fill = shape.fill();
                    this.setAttr("fillStyle", fill);
                    shape._fillFunc(this);
                };
                SceneContext.prototype._fillPattern = function(shape) {
                    var fillPatternX = shape.getFillPatternX(), fillPatternY = shape.getFillPatternY(), fillPatternRotation = Global_1.Konva.getAngle(shape.getFillPatternRotation()), fillPatternOffsetX = shape.getFillPatternOffsetX(), fillPatternOffsetY = shape.getFillPatternOffsetY(), fillPatternScaleX = shape.getFillPatternScaleX(), fillPatternScaleY = shape.getFillPatternScaleY();
                    if (fillPatternX || fillPatternY) this.translate(fillPatternX || 0, fillPatternY || 0);
                    if (fillPatternRotation) this.rotate(fillPatternRotation);
                    if (fillPatternScaleX || fillPatternScaleY) this.scale(fillPatternScaleX, fillPatternScaleY);
                    if (fillPatternOffsetX || fillPatternOffsetY) this.translate(-1 * fillPatternOffsetX, -1 * fillPatternOffsetY);
                    this.setAttr("fillStyle", shape._getFillPattern());
                    shape._fillFunc(this);
                };
                SceneContext.prototype._fillLinearGradient = function(shape) {
                    var grd = shape._getLinearGradient();
                    if (grd) {
                        this.setAttr("fillStyle", grd);
                        shape._fillFunc(this);
                    }
                };
                SceneContext.prototype._fillRadialGradient = function(shape) {
                    var grd = shape._getRadialGradient();
                    if (grd) {
                        this.setAttr("fillStyle", grd);
                        shape._fillFunc(this);
                    }
                };
                SceneContext.prototype._fill = function(shape) {
                    var hasColor = shape.fill(), fillPriority = shape.getFillPriority();
                    if (hasColor && fillPriority === "color") {
                        this._fillColor(shape);
                        return;
                    }
                    var hasPattern = shape.getFillPatternImage();
                    if (hasPattern && fillPriority === "pattern") {
                        this._fillPattern(shape);
                        return;
                    }
                    var hasLinearGradient = shape.getFillLinearGradientColorStops();
                    if (hasLinearGradient && fillPriority === "linear-gradient") {
                        this._fillLinearGradient(shape);
                        return;
                    }
                    var hasRadialGradient = shape.getFillRadialGradientColorStops();
                    if (hasRadialGradient && fillPriority === "radial-gradient") {
                        this._fillRadialGradient(shape);
                        return;
                    }
                    if (hasColor) this._fillColor(shape); else if (hasPattern) this._fillPattern(shape); else if (hasLinearGradient) this._fillLinearGradient(shape); else if (hasRadialGradient) this._fillRadialGradient(shape);
                };
                SceneContext.prototype._strokeLinearGradient = function(shape) {
                    var start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
                    if (colorStops) {
                        for (var n = 0; n < colorStops.length; n += 2) grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        this.setAttr("strokeStyle", grd);
                    }
                };
                SceneContext.prototype._stroke = function(shape) {
                    var dash = shape.dash(), strokeScaleEnabled = shape.getStrokeScaleEnabled();
                    if (shape.hasStroke()) {
                        if (!strokeScaleEnabled) {
                            this.save();
                            var pixelRatio = this.getCanvas().getPixelRatio();
                            this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                        }
                        this._applyLineCap(shape);
                        if (dash && shape.dashEnabled()) {
                            this.setLineDash(dash);
                            this.setAttr("lineDashOffset", shape.dashOffset());
                        }
                        this.setAttr("lineWidth", shape.strokeWidth());
                        if (!shape.getShadowForStrokeEnabled()) this.setAttr("shadowColor", "rgba(0,0,0,0)");
                        var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
                        if (hasLinearGradient) this._strokeLinearGradient(shape); else this.setAttr("strokeStyle", shape.stroke());
                        shape._strokeFunc(this);
                        if (!strokeScaleEnabled) this.restore();
                    }
                };
                SceneContext.prototype._applyShadow = function(shape) {
                    var util = Util_1.Util, color = util.get(shape.getShadowRGBA(), "black"), blur = util.get(shape.getShadowBlur(), 5), offset = util.get(shape.getShadowOffset(), {
                        x: 0,
                        y: 0
                    }), scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
                    this.setAttr("shadowColor", color);
                    this.setAttr("shadowBlur", blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
                    this.setAttr("shadowOffsetX", offset.x * scaleX);
                    this.setAttr("shadowOffsetY", offset.y * scaleY);
                };
                return SceneContext;
            }(Context);
            exports.SceneContext = SceneContext;
            var HitContext = function(_super) {
                __extends(HitContext, _super);
                function HitContext() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                HitContext.prototype._fill = function(shape) {
                    this.save();
                    this.setAttr("fillStyle", shape.colorKey);
                    shape._fillFuncHit(this);
                    this.restore();
                };
                HitContext.prototype.strokeShape = function(shape) {
                    if (shape.hasHitStroke()) this._stroke(shape);
                };
                HitContext.prototype._stroke = function(shape) {
                    if (shape.hasHitStroke()) {
                        var strokeScaleEnabled = shape.getStrokeScaleEnabled();
                        if (!strokeScaleEnabled) {
                            this.save();
                            var pixelRatio = this.getCanvas().getPixelRatio();
                            this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                        }
                        this._applyLineCap(shape);
                        var hitStrokeWidth = shape.hitStrokeWidth();
                        var strokeWidth = hitStrokeWidth === "auto" ? shape.strokeWidth() : hitStrokeWidth;
                        this.setAttr("lineWidth", strokeWidth);
                        this.setAttr("strokeStyle", shape.colorKey);
                        shape._strokeFuncHit(this);
                        if (!strokeScaleEnabled) this.restore();
                    }
                };
                return HitContext;
            }(Context);
            exports.HitContext = HitContext;
        },
        7752: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Global_1 = __webpack_require__(9427);
            var Util_1 = __webpack_require__(5520);
            exports.DD = {
                get isDragging() {
                    var flag = false;
                    exports.DD._dragElements.forEach((function(elem) {
                        if (elem.dragStatus === "dragging") flag = true;
                    }));
                    return flag;
                },
                justDragged: false,
                get node() {
                    var node;
                    exports.DD._dragElements.forEach((function(elem) {
                        node = elem.node;
                    }));
                    return node;
                },
                _dragElements: new Map,
                _drag: function(evt) {
                    exports.DD._dragElements.forEach((function(elem, key) {
                        var node = elem.node;
                        var stage = node.getStage();
                        stage.setPointersPositions(evt);
                        if (elem.pointerId === void 0) elem.pointerId = Util_1.Util._getFirstPointerId(evt);
                        var pos = stage._changedPointerPositions.find((function(pos) {
                            return pos.id === elem.pointerId;
                        }));
                        if (!pos) return;
                        if (elem.dragStatus !== "dragging") {
                            var dragDistance = node.dragDistance();
                            var distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
                            if (distance < dragDistance) return;
                            node.startDrag({
                                evt
                            });
                            if (!node.isDragging()) return;
                        }
                        node._setDragPosition(evt, elem);
                        node.fire("dragmove", {
                            type: "dragmove",
                            target: node,
                            evt
                        }, true);
                    }));
                },
                _endDragBefore: function(evt) {
                    exports.DD._dragElements.forEach((function(elem, key) {
                        var node = elem.node;
                        var stage = node.getStage();
                        if (evt) stage.setPointersPositions(evt);
                        var pos = stage._changedPointerPositions.find((function(pos) {
                            return pos.id === elem.pointerId;
                        }));
                        if (!pos) return;
                        if (elem.dragStatus === "dragging" || elem.dragStatus === "stopped") {
                            exports.DD.justDragged = true;
                            Global_1.Konva.listenClickTap = false;
                            elem.dragStatus = "stopped";
                        }
                        var drawNode = elem.node.getLayer() || elem.node instanceof Global_1.Konva["Stage"] && elem.node;
                        if (drawNode) drawNode.draw();
                    }));
                },
                _endDragAfter: function(evt) {
                    exports.DD._dragElements.forEach((function(elem, key) {
                        if (elem.dragStatus === "stopped") elem.node.fire("dragend", {
                            type: "dragend",
                            target: elem.node,
                            evt
                        }, true);
                        if (elem.dragStatus !== "dragging") exports.DD._dragElements.delete(key);
                    }));
                }
            };
            if (Global_1.Konva.isBrowser) {
                window.addEventListener("mouseup", exports.DD._endDragBefore, true);
                window.addEventListener("touchend", exports.DD._endDragBefore, true);
                window.addEventListener("mousemove", exports.DD._drag);
                window.addEventListener("touchmove", exports.DD._drag);
                window.addEventListener("mouseup", exports.DD._endDragAfter, false);
                window.addEventListener("touchend", exports.DD._endDragAfter, false);
            }
        },
        696: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Validators_1 = __webpack_require__(4783);
            var GET = "get", SET = "set";
            exports.Factory = {
                addGetterSetter: function(constructor, attr, def, validator, after) {
                    this.addGetter(constructor, attr, def);
                    this.addSetter(constructor, attr, validator, after);
                    this.addOverloadedGetterSetter(constructor, attr);
                },
                addGetter: function(constructor, attr, def) {
                    var method = GET + Util_1.Util._capitalize(attr);
                    constructor.prototype[method] = constructor.prototype[method] || function() {
                        var val = this.attrs[attr];
                        return val === void 0 ? def : val;
                    };
                },
                addSetter: function(constructor, attr, validator, after) {
                    var method = SET + Util_1.Util._capitalize(attr);
                    if (!constructor.prototype[method]) exports.Factory.overWriteSetter(constructor, attr, validator, after);
                },
                overWriteSetter: function(constructor, attr, validator, after) {
                    var method = SET + Util_1.Util._capitalize(attr);
                    constructor.prototype[method] = function(val) {
                        if (validator && val !== void 0 && val !== null) val = validator.call(this, val, attr);
                        this._setAttr(attr, val);
                        if (after) after.call(this);
                        return this;
                    };
                },
                addComponentsGetterSetter: function(constructor, attr, components, validator, after) {
                    var n, component, len = components.length, capitalize = Util_1.Util._capitalize, getter = GET + capitalize(attr), setter = SET + capitalize(attr);
                    constructor.prototype[getter] = function() {
                        var ret = {};
                        for (n = 0; n < len; n++) {
                            component = components[n];
                            ret[component] = this.getAttr(attr + capitalize(component));
                        }
                        return ret;
                    };
                    var basicValidator = Validators_1.getComponentValidator(components);
                    constructor.prototype[setter] = function(val) {
                        var key, oldVal = this.attrs[attr];
                        if (validator) val = validator.call(this, val);
                        if (basicValidator) basicValidator.call(this, val, attr);
                        for (key in val) {
                            if (!val.hasOwnProperty(key)) continue;
                            this._setAttr(attr + capitalize(key), val[key]);
                        }
                        this._fireChangeEvent(attr, oldVal, val);
                        if (after) after.call(this);
                        return this;
                    };
                    this.addOverloadedGetterSetter(constructor, attr);
                },
                addOverloadedGetterSetter: function(constructor, attr) {
                    var capitalizedAttr = Util_1.Util._capitalize(attr), setter = SET + capitalizedAttr, getter = GET + capitalizedAttr;
                    constructor.prototype[attr] = function() {
                        if (arguments.length) {
                            this[setter](arguments[0]);
                            return this;
                        }
                        return this[getter]();
                    };
                },
                addDeprecatedGetterSetter: function(constructor, attr, def, validator) {
                    Util_1.Util.error("Adding deprecated " + attr);
                    var method = GET + Util_1.Util._capitalize(attr);
                    var message = attr + " property is deprecated and will be removed soon. Look at Konva change log for more information.";
                    constructor.prototype[method] = function() {
                        Util_1.Util.error(message);
                        var val = this.attrs[attr];
                        return val === void 0 ? def : val;
                    };
                    this.addSetter(constructor, attr, validator, (function() {
                        Util_1.Util.error(message);
                    }));
                    this.addOverloadedGetterSetter(constructor, attr);
                },
                backCompat: function(constructor, methods) {
                    Util_1.Util.each(methods, (function(oldMethodName, newMethodName) {
                        var method = constructor.prototype[newMethodName];
                        var oldGetter = GET + Util_1.Util._capitalize(oldMethodName);
                        var oldSetter = SET + Util_1.Util._capitalize(oldMethodName);
                        function deprecated() {
                            method.apply(this, arguments);
                            Util_1.Util.error('"' + oldMethodName + '" method is deprecated and will be removed soon. Use ""' + newMethodName + '" instead.');
                        }
                        constructor.prototype[oldMethodName] = deprecated;
                        constructor.prototype[oldGetter] = deprecated;
                        constructor.prototype[oldSetter] = deprecated;
                    }));
                },
                afterSetFilter: function() {
                    this._filterUpToDate = false;
                }
            };
        },
        21: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Container_1 = __webpack_require__(9957);
            var BaseLayer_1 = __webpack_require__(3076);
            var Global_1 = __webpack_require__(9427);
            var FastLayer = function(_super) {
                __extends(FastLayer, _super);
                function FastLayer() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FastLayer.prototype._validateAdd = function(child) {
                    var type = child.getType();
                    if (type !== "Shape") Util_1.Util.throw("You may only add shapes to a fast layer.");
                };
                FastLayer.prototype.hitGraphEnabled = function() {
                    return false;
                };
                FastLayer.prototype.drawScene = function(can) {
                    var layer = this.getLayer(), canvas = can || layer && layer.getCanvas();
                    if (this.clearBeforeDraw()) canvas.getContext().clear();
                    Container_1.Container.prototype.drawScene.call(this, canvas);
                    return this;
                };
                FastLayer.prototype.draw = function() {
                    this.drawScene();
                    return this;
                };
                return FastLayer;
            }(BaseLayer_1.BaseLayer);
            exports.FastLayer = FastLayer;
            FastLayer.prototype.nodeType = "FastLayer";
            Global_1._registerNode(FastLayer);
            Util_1.Collection.mapMethods(FastLayer);
        },
        9427: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var PI_OVER_180 = Math.PI / 180;
            function detectBrowser() {
                return typeof window !== "undefined" && ({}.toString.call(window) === "[object Window]" || {}.toString.call(window) === "[object global]");
            }
            var _detectIE = function(ua) {
                var msie = ua.indexOf("msie ");
                if (msie > 0) return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
                var trident = ua.indexOf("trident/");
                if (trident > 0) {
                    var rv = ua.indexOf("rv:");
                    return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
                }
                var edge = ua.indexOf("edge/");
                if (edge > 0) return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
                return false;
            };
            exports._parseUA = function(userAgent) {
                var ua = userAgent.toLowerCase(), match = /(chrome)[ /]([\w.]+)/.exec(ua) || /(webkit)[ /]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ /]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [], mobile = !!userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i), ieMobile = !!userAgent.match(/IEMobile/i);
                return {
                    browser: match[1] || "",
                    version: match[2] || "0",
                    isIE: _detectIE(ua),
                    mobile,
                    ieMobile
                };
            };
            exports.glob = typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : typeof window !== "undefined" ? window : typeof WorkerGlobalScope !== "undefined" ? self : {};
            exports.Konva = {
                _global: exports.glob,
                version: "6.0.0",
                isBrowser: detectBrowser(),
                isUnminified: /param/.test(function(param) {}.toString()),
                dblClickWindow: 400,
                getAngle: function(angle) {
                    return exports.Konva.angleDeg ? angle * PI_OVER_180 : angle;
                },
                enableTrace: false,
                _pointerEventsEnabled: false,
                hitOnDragEnabled: false,
                captureTouchEventsEnabled: false,
                listenClickTap: false,
                inDblClickWindow: false,
                pixelRatio: void 0,
                dragDistance: 3,
                angleDeg: true,
                showWarnings: true,
                dragButtons: [ 0, 1 ],
                isDragging: function() {
                    return exports.Konva["DD"].isDragging;
                },
                isDragReady: function() {
                    return !!exports.Konva["DD"].node;
                },
                UA: exports._parseUA(exports.glob.navigator && exports.glob.navigator.userAgent || ""),
                document: exports.glob.document,
                _injectGlobal: function(Konva) {
                    exports.glob.Konva = Konva;
                },
                _parseUA: exports._parseUA
            };
            exports._NODES_REGISTRY = {};
            exports._registerNode = function(NodeClass) {
                exports._NODES_REGISTRY[NodeClass.prototype.getClassName()] = NodeClass;
                exports.Konva[NodeClass.prototype.getClassName()] = NodeClass;
            };
        },
        9625: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Container_1 = __webpack_require__(9957);
            var Global_1 = __webpack_require__(9427);
            var Group = function(_super) {
                __extends(Group, _super);
                function Group() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Group.prototype._validateAdd = function(child) {
                    var type = child.getType();
                    if (type !== "Group" && type !== "Shape") Util_1.Util.throw("You may only add groups and shapes to groups.");
                };
                return Group;
            }(Container_1.Container);
            exports.Group = Group;
            Group.prototype.nodeType = "Group";
            Global_1._registerNode(Group);
            Util_1.Collection.mapMethods(Group);
        },
        1647: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Container_1 = __webpack_require__(9957);
            var Factory_1 = __webpack_require__(696);
            var BaseLayer_1 = __webpack_require__(3076);
            var Canvas_1 = __webpack_require__(7544);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var HASH = "#", BEFORE_DRAW = "beforeDraw", DRAW = "draw", INTERSECTION_OFFSETS = [ {
                x: 0,
                y: 0
            }, {
                x: -1,
                y: -1
            }, {
                x: 1,
                y: -1
            }, {
                x: 1,
                y: 1
            }, {
                x: -1,
                y: 1
            } ], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
            var Layer = function(_super) {
                __extends(Layer, _super);
                function Layer() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.hitCanvas = new Canvas_1.HitCanvas({
                        pixelRatio: 1
                    });
                    return _this;
                }
                Layer.prototype.setSize = function(_a) {
                    var width = _a.width, height = _a.height;
                    _super.prototype.setSize.call(this, {
                        width,
                        height
                    });
                    this.hitCanvas.setSize(width, height);
                    return this;
                };
                Layer.prototype._validateAdd = function(child) {
                    var type = child.getType();
                    if (type !== "Group" && type !== "Shape") Util_1.Util.throw("You may only add groups and shapes to a layer.");
                };
                Layer.prototype.getIntersection = function(pos, selector) {
                    var obj, i, intersectionOffset, shape;
                    if (!this.hitGraphEnabled() || !this.isVisible()) return null;
                    var spiralSearchDistance = 1;
                    var continueSearch = false;
                    while (true) {
                        for (i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
                            intersectionOffset = INTERSECTION_OFFSETS[i];
                            obj = this._getIntersection({
                                x: pos.x + intersectionOffset.x * spiralSearchDistance,
                                y: pos.y + intersectionOffset.y * spiralSearchDistance
                            });
                            shape = obj.shape;
                            if (shape && selector) return shape.findAncestor(selector, true); else if (shape) return shape;
                            continueSearch = !!obj.antialiased;
                            if (!obj.antialiased) break;
                        }
                        if (continueSearch) spiralSearchDistance += 1; else return null;
                    }
                };
                Layer.prototype._getIntersection = function(pos) {
                    var ratio = this.hitCanvas.pixelRatio;
                    var colorKey, shape, p = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data, p3 = p[3];
                    if (p3 === 255) {
                        colorKey = Util_1.Util._rgbToHex(p[0], p[1], p[2]);
                        shape = Shape_1.shapes[HASH + colorKey];
                        if (shape) return {
                            shape
                        };
                        return {
                            antialiased: true
                        };
                    } else if (p3 > 0) return {
                        antialiased: true
                    };
                    return {};
                };
                Layer.prototype.drawScene = function(can, top) {
                    var layer = this.getLayer(), canvas = can || layer && layer.getCanvas();
                    this._fire(BEFORE_DRAW, {
                        node: this
                    });
                    if (this.clearBeforeDraw()) canvas.getContext().clear();
                    Container_1.Container.prototype.drawScene.call(this, canvas, top);
                    this._fire(DRAW, {
                        node: this
                    });
                    return this;
                };
                Layer.prototype.drawHit = function(can, top) {
                    var layer = this.getLayer(), canvas = can || layer && layer.hitCanvas;
                    if (layer && layer.clearBeforeDraw()) layer.getHitCanvas().getContext().clear();
                    Container_1.Container.prototype.drawHit.call(this, canvas, top);
                    return this;
                };
                Layer.prototype.clear = function(bounds) {
                    BaseLayer_1.BaseLayer.prototype.clear.call(this, bounds);
                    this.getHitCanvas().getContext().clear(bounds);
                    return this;
                };
                Layer.prototype.enableHitGraph = function() {
                    this.hitGraphEnabled(true);
                    return this;
                };
                Layer.prototype.disableHitGraph = function() {
                    this.hitGraphEnabled(false);
                    return this;
                };
                Layer.prototype.toggleHitCanvas = function() {
                    if (!this.parent) return;
                    var parent = this.parent;
                    var added = !!this.hitCanvas._canvas.parentNode;
                    if (added) parent.content.removeChild(this.hitCanvas._canvas); else parent.content.appendChild(this.hitCanvas._canvas);
                };
                return Layer;
            }(BaseLayer_1.BaseLayer);
            exports.Layer = Layer;
            Layer.prototype.nodeType = "Layer";
            Global_1._registerNode(Layer);
            Factory_1.Factory.addGetterSetter(Layer, "hitGraphEnabled", true, Validators_1.getBooleanValidator());
            Util_1.Collection.mapMethods(Layer);
        },
        5924: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Canvas_1 = __webpack_require__(7544);
            var Global_1 = __webpack_require__(9427);
            var DragAndDrop_1 = __webpack_require__(7752);
            var Validators_1 = __webpack_require__(4783);
            exports.ids = {};
            exports.names = {};
            var _addId = function(node, id) {
                if (!id) return;
                exports.ids[id] = node;
            };
            exports._removeId = function(id, node) {
                if (!id) return;
                if (exports.ids[id] !== node) return;
                delete exports.ids[id];
            };
            exports._addName = function(node, name) {
                if (name) {
                    if (!exports.names[name]) exports.names[name] = [];
                    exports.names[name].push(node);
                }
            };
            exports._removeName = function(name, _id) {
                if (!name) return;
                var nodes = exports.names[name];
                if (!nodes) return;
                for (var n = 0; n < nodes.length; n++) {
                    var no = nodes[n];
                    if (no._id === _id) nodes.splice(n, 1);
                }
                if (nodes.length === 0) delete exports.names[name];
            };
            var ABSOLUTE_OPACITY = "absoluteOpacity", ABSOLUTE_TRANSFORM = "absoluteTransform", ABSOLUTE_SCALE = "absoluteScale", CANVAS = "canvas", CHANGE = "Change", CHILDREN = "children", KONVA = "konva", LISTENING = "listening", MOUSEENTER = "mouseenter", MOUSELEAVE = "mouseleave", NAME = "name", SET = "set", SHAPE = "Shape", SPACE = " ", STAGE = "stage", TRANSFORM = "transform", UPPER_STAGE = "Stage", VISIBLE = "visible", TRANSFORM_CHANGE_STR = [ "xChange.konva", "yChange.konva", "scaleXChange.konva", "scaleYChange.konva", "skewXChange.konva", "skewYChange.konva", "rotationChange.konva", "offsetXChange.konva", "offsetYChange.konva", "transformsEnabledChange.konva" ].join(SPACE);
            [ "scaleXChange.konva", "scaleYChange.konva" ].join(SPACE);
            var emptyChildren = new Util_1.Collection;
            var idCounter = 1;
            var Node = function() {
                function Node(config) {
                    var _this = this;
                    this._id = idCounter++;
                    this.eventListeners = {};
                    this.attrs = {};
                    this.index = 0;
                    this.parent = null;
                    this._cache = new Map;
                    this._lastPos = null;
                    this._batchingTransformChange = false;
                    this._needClearTransformCache = false;
                    this._filterUpToDate = false;
                    this._isUnderCache = false;
                    this.children = emptyChildren;
                    this._dragEventId = null;
                    this.setAttrs(config);
                    this.on(TRANSFORM_CHANGE_STR, (function() {
                        if (_this._batchingTransformChange) {
                            _this._needClearTransformCache = true;
                            return;
                        }
                        _this._clearCache(TRANSFORM);
                        _this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
                    }));
                    this.on("visibleChange.konva", (function() {
                        _this._clearSelfAndDescendantCache(VISIBLE);
                    }));
                    this.on("listeningChange.konva", (function() {
                        _this._clearSelfAndDescendantCache(LISTENING);
                    }));
                    this.on("opacityChange.konva", (function() {
                        _this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
                    }));
                }
                Node.prototype.hasChildren = function() {
                    return false;
                };
                Node.prototype.getChildren = function() {
                    return emptyChildren;
                };
                Node.prototype._clearCache = function(attr) {
                    if (attr) this._cache.delete(attr); else this._cache.clear();
                };
                Node.prototype._getCache = function(attr, privateGetter) {
                    var cache = this._cache.get(attr);
                    if (cache === void 0) {
                        cache = privateGetter.call(this);
                        this._cache.set(attr, cache);
                    }
                    return cache;
                };
                Node.prototype._getCanvasCache = function() {
                    return this._cache.get(CANVAS);
                };
                Node.prototype._clearSelfAndDescendantCache = function(attr, forceEvent) {
                    this._clearCache(attr);
                    if (forceEvent && attr === ABSOLUTE_TRANSFORM) this.fire("_clearTransformCache");
                    if (this.isCached()) return;
                    if (this.children) this.children.each((function(node) {
                        node._clearSelfAndDescendantCache(attr, true);
                    }));
                };
                Node.prototype.clearCache = function() {
                    this._cache.delete(CANVAS);
                    this._clearSelfAndDescendantCache();
                    return this;
                };
                Node.prototype.cache = function(config) {
                    var conf = config || {};
                    var rect = {};
                    if (conf.x === void 0 || conf.y === void 0 || conf.width === void 0 || conf.height === void 0) rect = this.getClientRect({
                        skipTransform: true,
                        relativeTo: this.getParent()
                    });
                    var width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === void 0 ? rect.x : conf.x, y = conf.y === void 0 ? rect.y : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false;
                    if (!width || !height) {
                        Util_1.Util.error("Can not cache the node. Width or height of the node equals 0. Caching is skipped.");
                        return;
                    }
                    width += offset * 2;
                    height += offset * 2;
                    x -= offset;
                    y -= offset;
                    var cachedSceneCanvas = new Canvas_1.SceneCanvas({
                        pixelRatio,
                        width,
                        height
                    }), cachedFilterCanvas = new Canvas_1.SceneCanvas({
                        pixelRatio,
                        width: 0,
                        height: 0
                    }), cachedHitCanvas = new Canvas_1.HitCanvas({
                        pixelRatio: 1,
                        width,
                        height
                    }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
                    cachedHitCanvas.isCache = true;
                    this._cache.delete("canvas");
                    this._filterUpToDate = false;
                    if (conf.imageSmoothingEnabled === false) {
                        cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
                        cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
                    }
                    sceneContext.save();
                    hitContext.save();
                    sceneContext.translate(-x, -y);
                    hitContext.translate(-x, -y);
                    this._isUnderCache = true;
                    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
                    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
                    this.drawScene(cachedSceneCanvas, this, true);
                    this.drawHit(cachedHitCanvas, this, true);
                    this._isUnderCache = false;
                    sceneContext.restore();
                    hitContext.restore();
                    if (drawBorder) {
                        sceneContext.save();
                        sceneContext.beginPath();
                        sceneContext.rect(0, 0, width, height);
                        sceneContext.closePath();
                        sceneContext.setAttr("strokeStyle", "red");
                        sceneContext.setAttr("lineWidth", 5);
                        sceneContext.stroke();
                        sceneContext.restore();
                    }
                    this._cache.set(CANVAS, {
                        scene: cachedSceneCanvas,
                        filter: cachedFilterCanvas,
                        hit: cachedHitCanvas,
                        x,
                        y
                    });
                    return this;
                };
                Node.prototype.isCached = function() {
                    return this._cache.has("canvas");
                };
                Node.prototype.getClientRect = function(config) {
                    throw new Error('abstract "getClientRect" method call');
                };
                Node.prototype._transformedRect = function(rect, top) {
                    var points = [ {
                        x: rect.x,
                        y: rect.y
                    }, {
                        x: rect.x + rect.width,
                        y: rect.y
                    }, {
                        x: rect.x + rect.width,
                        y: rect.y + rect.height
                    }, {
                        x: rect.x,
                        y: rect.y + rect.height
                    } ];
                    var minX, minY, maxX, maxY;
                    var trans = this.getAbsoluteTransform(top);
                    points.forEach((function(point) {
                        var transformed = trans.point(point);
                        if (minX === void 0) {
                            minX = maxX = transformed.x;
                            minY = maxY = transformed.y;
                        }
                        minX = Math.min(minX, transformed.x);
                        minY = Math.min(minY, transformed.y);
                        maxX = Math.max(maxX, transformed.x);
                        maxY = Math.max(maxY, transformed.y);
                    }));
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY
                    };
                };
                Node.prototype._drawCachedSceneCanvas = function(context) {
                    context.save();
                    context._applyOpacity(this);
                    context._applyGlobalCompositeOperation(this);
                    var canvasCache = this._getCanvasCache();
                    context.translate(canvasCache.x, canvasCache.y);
                    var cacheCanvas = this._getCachedSceneCanvas();
                    var ratio = cacheCanvas.pixelRatio;
                    context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
                    context.restore();
                };
                Node.prototype._drawCachedHitCanvas = function(context) {
                    var canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
                    context.save();
                    context.translate(canvasCache.x, canvasCache.y);
                    context.drawImage(hitCanvas._canvas, 0, 0);
                    context.restore();
                };
                Node.prototype._getCachedSceneCanvas = function() {
                    var len, imageData, n, filter, filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext();
                    if (filters) {
                        if (!this._filterUpToDate) {
                            var ratio = sceneCanvas.pixelRatio;
                            filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
                            try {
                                len = filters.length;
                                filterContext.clear();
                                filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
                                imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
                                for (n = 0; n < len; n++) {
                                    filter = filters[n];
                                    if (typeof filter !== "function") {
                                        Util_1.Util.error("Filter should be type of function, but got " + typeof filter + " instead. Please check correct filters");
                                        continue;
                                    }
                                    filter.call(this, imageData);
                                    filterContext.putImageData(imageData, 0, 0);
                                }
                            } catch (e) {
                                Util_1.Util.error("Unable to apply filter. " + e.message + " This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.");
                            }
                            this._filterUpToDate = true;
                        }
                        return filterCanvas;
                    }
                    return sceneCanvas;
                };
                Node.prototype.on = function(evtStr, handler) {
                    if (arguments.length === 3) return this._delegate.apply(this, arguments);
                    var n, event, parts, baseEvent, name, events = evtStr.split(SPACE), len = events.length;
                    for (n = 0; n < len; n++) {
                        event = events[n];
                        parts = event.split(".");
                        baseEvent = parts[0];
                        name = parts[1] || "";
                        if (!this.eventListeners[baseEvent]) this.eventListeners[baseEvent] = [];
                        this.eventListeners[baseEvent].push({
                            name,
                            handler
                        });
                    }
                    return this;
                };
                Node.prototype.off = function(evtStr, callback) {
                    var n, t, event, parts, baseEvent, name, events = (evtStr || "").split(SPACE), len = events.length;
                    if (!evtStr) for (t in this.eventListeners) this._off(t);
                    for (n = 0; n < len; n++) {
                        event = events[n];
                        parts = event.split(".");
                        baseEvent = parts[0];
                        name = parts[1];
                        if (baseEvent) {
                            if (this.eventListeners[baseEvent]) this._off(baseEvent, name, callback);
                        } else for (t in this.eventListeners) this._off(t, name, callback);
                    }
                    return this;
                };
                Node.prototype.dispatchEvent = function(evt) {
                    var e = {
                        target: this,
                        type: evt.type,
                        evt
                    };
                    this.fire(evt.type, e);
                    return this;
                };
                Node.prototype.addEventListener = function(type, handler) {
                    this.on(type, (function(evt) {
                        handler.call(this, evt.evt);
                    }));
                    return this;
                };
                Node.prototype.removeEventListener = function(type) {
                    this.off(type);
                    return this;
                };
                Node.prototype._delegate = function(event, selector, handler) {
                    var stopNode = this;
                    this.on(event, (function(evt) {
                        var targets = evt.target.findAncestors(selector, true, stopNode);
                        for (var i = 0; i < targets.length; i++) {
                            evt = Util_1.Util.cloneObject(evt);
                            evt.currentTarget = targets[i];
                            handler.call(targets[i], evt);
                        }
                    }));
                };
                Node.prototype.remove = function() {
                    if (this.isDragging()) this.stopDrag();
                    DragAndDrop_1.DD._dragElements.delete(this._id);
                    this._remove();
                    return this;
                };
                Node.prototype._clearCaches = function() {
                    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
                    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
                    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
                    this._clearSelfAndDescendantCache(STAGE);
                    this._clearSelfAndDescendantCache(VISIBLE);
                    this._clearSelfAndDescendantCache(LISTENING);
                };
                Node.prototype._remove = function() {
                    this._clearCaches();
                    var parent = this.getParent();
                    if (parent && parent.children) {
                        parent.children.splice(this.index, 1);
                        parent._setChildrenIndices();
                        this.parent = null;
                    }
                };
                Node.prototype.destroy = function() {
                    exports._removeId(this.id(), this);
                    var names = (this.name() || "").split(/\s/g);
                    for (var i = 0; i < names.length; i++) {
                        var subname = names[i];
                        exports._removeName(subname, this._id);
                    }
                    this.remove();
                    return this;
                };
                Node.prototype.getAttr = function(attr) {
                    var method = "get" + Util_1.Util._capitalize(attr);
                    if (Util_1.Util._isFunction(this[method])) return this[method]();
                    return this.attrs[attr];
                };
                Node.prototype.getAncestors = function() {
                    var parent = this.getParent(), ancestors = new Util_1.Collection;
                    while (parent) {
                        ancestors.push(parent);
                        parent = parent.getParent();
                    }
                    return ancestors;
                };
                Node.prototype.getAttrs = function() {
                    return this.attrs || {};
                };
                Node.prototype.setAttrs = function(config) {
                    var key, method;
                    if (!config) return this;
                    for (key in config) {
                        if (key === CHILDREN) continue;
                        method = SET + Util_1.Util._capitalize(key);
                        if (Util_1.Util._isFunction(this[method])) this[method](config[key]); else this._setAttr(key, config[key]);
                    }
                    return this;
                };
                Node.prototype.isListening = function() {
                    return this._getCache(LISTENING, this._isListening);
                };
                Node.prototype._isListening = function() {
                    var listening = this.listening(), parent = this.getParent();
                    if (listening === "inherit") if (parent) return parent.isListening(); else return true; else return listening;
                };
                Node.prototype.isVisible = function() {
                    return this._getCache(VISIBLE, this._isVisible);
                };
                Node.prototype._isVisible = function(relativeTo) {
                    var visible = this.visible(), parent = this.getParent();
                    if (visible === "inherit") if (parent && parent !== relativeTo) return parent._isVisible(relativeTo); else return true; else if (relativeTo && relativeTo !== parent) return visible && parent._isVisible(relativeTo); else return visible;
                };
                Node.prototype.shouldDrawHit = function() {
                    var layer = this.getLayer();
                    return !layer && this.isListening() && this.isVisible() || layer && layer.hitGraphEnabled() && this.isListening() && this.isVisible();
                };
                Node.prototype.show = function() {
                    this.visible(true);
                    return this;
                };
                Node.prototype.hide = function() {
                    this.visible(false);
                    return this;
                };
                Node.prototype.getZIndex = function() {
                    return this.index || 0;
                };
                Node.prototype.getAbsoluteZIndex = function() {
                    var nodes, len, n, child, depth = this.getDepth(), that = this, index = 0;
                    function addChildren(children) {
                        nodes = [];
                        len = children.length;
                        for (n = 0; n < len; n++) {
                            child = children[n];
                            index++;
                            if (child.nodeType !== SHAPE) nodes = nodes.concat(child.getChildren().toArray());
                            if (child._id === that._id) n = len;
                        }
                        if (nodes.length > 0 && nodes[0].getDepth() <= depth) addChildren(nodes);
                    }
                    if (that.nodeType !== UPPER_STAGE) addChildren(that.getStage().getChildren());
                    return index;
                };
                Node.prototype.getDepth = function() {
                    var depth = 0, parent = this.parent;
                    while (parent) {
                        depth++;
                        parent = parent.parent;
                    }
                    return depth;
                };
                Node.prototype._batchTransformChanges = function(func) {
                    this._batchingTransformChange = true;
                    func();
                    this._batchingTransformChange = false;
                    if (this._needClearTransformCache) {
                        this._clearCache(TRANSFORM);
                        this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM, true);
                    }
                    this._needClearTransformCache = false;
                };
                Node.prototype.setPosition = function(pos) {
                    var _this = this;
                    this._batchTransformChanges((function() {
                        _this.x(pos.x);
                        _this.y(pos.y);
                    }));
                    return this;
                };
                Node.prototype.getPosition = function() {
                    return {
                        x: this.x(),
                        y: this.y()
                    };
                };
                Node.prototype.getAbsolutePosition = function(top) {
                    var haveCachedParent = false;
                    var parent = this.parent;
                    while (parent) {
                        if (parent.isCached()) {
                            haveCachedParent = true;
                            break;
                        }
                        parent = parent.parent;
                    }
                    if (haveCachedParent && !top) top = true;
                    var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Util_1.Transform, offset = this.offset();
                    absoluteTransform.m = absoluteMatrix.slice();
                    absoluteTransform.translate(offset.x, offset.y);
                    return absoluteTransform.getTranslation();
                };
                Node.prototype.setAbsolutePosition = function(pos) {
                    var it, origTrans = this._clearTransform();
                    this.attrs.x = origTrans.x;
                    this.attrs.y = origTrans.y;
                    delete origTrans.x;
                    delete origTrans.y;
                    this._clearCache(TRANSFORM);
                    it = this._getAbsoluteTransform();
                    it.invert();
                    it.translate(pos.x, pos.y);
                    pos = {
                        x: this.attrs.x + it.getTranslation().x,
                        y: this.attrs.y + it.getTranslation().y
                    };
                    this._setTransform(origTrans);
                    this.setPosition({
                        x: pos.x,
                        y: pos.y
                    });
                    return this;
                };
                Node.prototype._setTransform = function(trans) {
                    var key;
                    for (key in trans) this.attrs[key] = trans[key];
                };
                Node.prototype._clearTransform = function() {
                    var trans = {
                        x: this.x(),
                        y: this.y(),
                        rotation: this.rotation(),
                        scaleX: this.scaleX(),
                        scaleY: this.scaleY(),
                        offsetX: this.offsetX(),
                        offsetY: this.offsetY(),
                        skewX: this.skewX(),
                        skewY: this.skewY()
                    };
                    this.attrs.x = 0;
                    this.attrs.y = 0;
                    this.attrs.rotation = 0;
                    this.attrs.scaleX = 1;
                    this.attrs.scaleY = 1;
                    this.attrs.offsetX = 0;
                    this.attrs.offsetY = 0;
                    this.attrs.skewX = 0;
                    this.attrs.skewY = 0;
                    return trans;
                };
                Node.prototype.move = function(change) {
                    var changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
                    if (changeX !== void 0) x += changeX;
                    if (changeY !== void 0) y += changeY;
                    this.setPosition({
                        x,
                        y
                    });
                    return this;
                };
                Node.prototype._eachAncestorReverse = function(func, top) {
                    var len, n, family = [], parent = this.getParent();
                    if (top && top._id === this._id) {
                        func(this);
                        return;
                    }
                    family.unshift(this);
                    while (parent && (!top || parent._id !== top._id)) {
                        family.unshift(parent);
                        parent = parent.parent;
                    }
                    len = family.length;
                    for (n = 0; n < len; n++) func(family[n]);
                };
                Node.prototype.rotate = function(theta) {
                    this.rotation(this.rotation() + theta);
                    return this;
                };
                Node.prototype.moveToTop = function() {
                    if (!this.parent) {
                        Util_1.Util.warn("Node has no parent. moveToTop function is ignored.");
                        return false;
                    }
                    var index = this.index;
                    this.parent.children.splice(index, 1);
                    this.parent.children.push(this);
                    this.parent._setChildrenIndices();
                    return true;
                };
                Node.prototype.moveUp = function() {
                    if (!this.parent) {
                        Util_1.Util.warn("Node has no parent. moveUp function is ignored.");
                        return false;
                    }
                    var index = this.index, len = this.parent.getChildren().length;
                    if (index < len - 1) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.splice(index + 1, 0, this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                };
                Node.prototype.moveDown = function() {
                    if (!this.parent) {
                        Util_1.Util.warn("Node has no parent. moveDown function is ignored.");
                        return false;
                    }
                    var index = this.index;
                    if (index > 0) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.splice(index - 1, 0, this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                };
                Node.prototype.moveToBottom = function() {
                    if (!this.parent) {
                        Util_1.Util.warn("Node has no parent. moveToBottom function is ignored.");
                        return false;
                    }
                    var index = this.index;
                    if (index > 0) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.unshift(this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                };
                Node.prototype.setZIndex = function(zIndex) {
                    if (!this.parent) {
                        Util_1.Util.warn("Node has no parent. zIndex parameter is ignored.");
                        return this;
                    }
                    if (zIndex < 0 || zIndex >= this.parent.children.length) Util_1.Util.warn("Unexpected value " + zIndex + " for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to " + (this.parent.children.length - 1) + ".");
                    var index = this.index;
                    this.parent.children.splice(index, 1);
                    this.parent.children.splice(zIndex, 0, this);
                    this.parent._setChildrenIndices();
                    return this;
                };
                Node.prototype.getAbsoluteOpacity = function() {
                    return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
                };
                Node.prototype._getAbsoluteOpacity = function() {
                    var absOpacity = this.opacity();
                    var parent = this.getParent();
                    if (parent && !parent._isUnderCache) absOpacity *= parent.getAbsoluteOpacity();
                    return absOpacity;
                };
                Node.prototype.moveTo = function(newContainer) {
                    if (this.getParent() !== newContainer) {
                        this._remove();
                        newContainer.add(this);
                    }
                    return this;
                };
                Node.prototype.toObject = function() {
                    var key, val, getter, defaultValue, nonPlainObject, obj = {}, attrs = this.getAttrs();
                    obj.attrs = {};
                    for (key in attrs) {
                        val = attrs[key];
                        nonPlainObject = Util_1.Util.isObject(val) && !Util_1.Util._isPlainObject(val) && !Util_1.Util._isArray(val);
                        if (nonPlainObject) continue;
                        getter = typeof this[key] === "function" && this[key];
                        delete attrs[key];
                        defaultValue = getter ? getter.call(this) : null;
                        attrs[key] = val;
                        if (defaultValue !== val) obj.attrs[key] = val;
                    }
                    obj.className = this.getClassName();
                    return Util_1.Util._prepareToStringify(obj);
                };
                Node.prototype.toJSON = function() {
                    return JSON.stringify(this.toObject());
                };
                Node.prototype.getParent = function() {
                    return this.parent;
                };
                Node.prototype.findAncestors = function(selector, includeSelf, stopNode) {
                    var res = [];
                    if (includeSelf && this._isMatch(selector)) res.push(this);
                    var ancestor = this.parent;
                    while (ancestor) {
                        if (ancestor === stopNode) return res;
                        if (ancestor._isMatch(selector)) res.push(ancestor);
                        ancestor = ancestor.parent;
                    }
                    return res;
                };
                Node.prototype.isAncestorOf = function(node) {
                    return false;
                };
                Node.prototype.findAncestor = function(selector, includeSelf, stopNode) {
                    return this.findAncestors(selector, includeSelf, stopNode)[0];
                };
                Node.prototype._isMatch = function(selector) {
                    if (!selector) return false;
                    if (typeof selector === "function") return selector(this);
                    var n, sel, selectorArr = selector.replace(/ /g, "").split(","), len = selectorArr.length;
                    for (n = 0; n < len; n++) {
                        sel = selectorArr[n];
                        if (!Util_1.Util.isValidSelector(sel)) {
                            Util_1.Util.warn('Selector "' + sel + '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
                            Util_1.Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
                            Util_1.Util.warn("Konva is awesome, right?");
                        }
                        if (sel.charAt(0) === "#") {
                            if (this.id() === sel.slice(1)) return true;
                        } else if (sel.charAt(0) === ".") {
                            if (this.hasName(sel.slice(1))) return true;
                        } else if (this.className === sel || this.nodeType === sel) return true;
                    }
                    return false;
                };
                Node.prototype.getLayer = function() {
                    var parent = this.getParent();
                    return parent ? parent.getLayer() : null;
                };
                Node.prototype.getStage = function() {
                    return this._getCache(STAGE, this._getStage);
                };
                Node.prototype._getStage = function() {
                    var parent = this.getParent();
                    if (parent) return parent.getStage(); else return;
                };
                Node.prototype.fire = function(eventType, evt, bubble) {
                    if (evt === void 0) evt = {};
                    evt.target = evt.target || this;
                    if (bubble) this._fireAndBubble(eventType, evt); else this._fire(eventType, evt);
                    return this;
                };
                Node.prototype.getAbsoluteTransform = function(top) {
                    if (top) return this._getAbsoluteTransform(top); else return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
                };
                Node.prototype._getAbsoluteTransform = function(top) {
                    var at;
                    if (top) {
                        at = new Util_1.Transform;
                        this._eachAncestorReverse((function(node) {
                            var transformsEnabled = node.transformsEnabled();
                            if (transformsEnabled === "all") at.multiply(node.getTransform()); else if (transformsEnabled === "position") at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
                        }), top);
                        return at;
                    } else {
                        if (this.parent) at = this.parent.getAbsoluteTransform().copy(); else at = new Util_1.Transform;
                        var transformsEnabled = this.transformsEnabled();
                        if (transformsEnabled === "all") at.multiply(this.getTransform()); else if (transformsEnabled === "position") at.translate(this.x() - this.offsetX(), this.y() - this.offsetY());
                        return at;
                    }
                };
                Node.prototype.getAbsoluteScale = function(top) {
                    var parent = this;
                    while (parent) {
                        if (parent._isUnderCache) top = parent;
                        parent = parent.getParent();
                    }
                    var transform = this.getAbsoluteTransform(top);
                    var attrs = transform.decompose();
                    return {
                        x: attrs.scaleX,
                        y: attrs.scaleY
                    };
                };
                Node.prototype.getAbsoluteRotation = function() {
                    return this.getAbsoluteTransform().decompose().rotation;
                };
                Node.prototype.getTransform = function() {
                    return this._getCache(TRANSFORM, this._getTransform);
                };
                Node.prototype._getTransform = function() {
                    var m = new Util_1.Transform, x = this.x(), y = this.y(), rotation = Global_1.Konva.getAngle(this.rotation()), scaleX = this.scaleX(), scaleY = this.scaleY(), skewX = this.skewX(), skewY = this.skewY(), offsetX = this.offsetX(), offsetY = this.offsetY();
                    if (x !== 0 || y !== 0) m.translate(x, y);
                    if (rotation !== 0) m.rotate(rotation);
                    if (skewX !== 0 || skewY !== 0) m.skew(skewX, skewY);
                    if (scaleX !== 1 || scaleY !== 1) m.scale(scaleX, scaleY);
                    if (offsetX !== 0 || offsetY !== 0) m.translate(-1 * offsetX, -1 * offsetY);
                    return m;
                };
                Node.prototype.clone = function(obj) {
                    var key, allListeners, len, n, listener, attrs = Util_1.Util.cloneObject(this.attrs);
                    for (key in obj) attrs[key] = obj[key];
                    var node = new this.constructor(attrs);
                    for (key in this.eventListeners) {
                        allListeners = this.eventListeners[key];
                        len = allListeners.length;
                        for (n = 0; n < len; n++) {
                            listener = allListeners[n];
                            if (listener.name.indexOf(KONVA) < 0) {
                                if (!node.eventListeners[key]) node.eventListeners[key] = [];
                                node.eventListeners[key].push(listener);
                            }
                        }
                    }
                    return node;
                };
                Node.prototype._toKonvaCanvas = function(config) {
                    config = config || {};
                    var box = this.getClientRect();
                    var stage = this.getStage(), x = config.x !== void 0 ? config.x : box.x, y = config.y !== void 0 ? config.y : box.y, pixelRatio = config.pixelRatio || 1, canvas = new Canvas_1.SceneCanvas({
                        width: config.width || box.width || (stage ? stage.width() : 0),
                        height: config.height || box.height || (stage ? stage.height() : 0),
                        pixelRatio
                    }), context = canvas.getContext();
                    context.save();
                    if (x || y) context.translate(-1 * x, -1 * y);
                    this.drawScene(canvas);
                    context.restore();
                    return canvas;
                };
                Node.prototype.toCanvas = function(config) {
                    return this._toKonvaCanvas(config)._canvas;
                };
                Node.prototype.toDataURL = function(config) {
                    config = config || {};
                    var mimeType = config.mimeType || null, quality = config.quality || null;
                    var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
                    if (config.callback) config.callback(url);
                    return url;
                };
                Node.prototype.toImage = function(config) {
                    if (!config || !config.callback) throw "callback required for toImage method config argument";
                    var callback = config.callback;
                    delete config.callback;
                    Util_1.Util._urlToImage(this.toDataURL(config), (function(img) {
                        callback(img);
                    }));
                };
                Node.prototype.setSize = function(size) {
                    this.width(size.width);
                    this.height(size.height);
                    return this;
                };
                Node.prototype.getSize = function() {
                    return {
                        width: this.width(),
                        height: this.height()
                    };
                };
                Node.prototype.getClassName = function() {
                    return this.className || this.nodeType;
                };
                Node.prototype.getType = function() {
                    return this.nodeType;
                };
                Node.prototype.getDragDistance = function() {
                    if (this.attrs.dragDistance !== void 0) return this.attrs.dragDistance; else if (this.parent) return this.parent.getDragDistance(); else return Global_1.Konva.dragDistance;
                };
                Node.prototype._off = function(type, name, callback) {
                    var i, evtName, handler, evtListeners = this.eventListeners[type];
                    for (i = 0; i < evtListeners.length; i++) {
                        evtName = evtListeners[i].name;
                        handler = evtListeners[i].handler;
                        if ((evtName !== "konva" || name === "konva") && (!name || evtName === name) && (!callback || callback === handler)) {
                            evtListeners.splice(i, 1);
                            if (evtListeners.length === 0) {
                                delete this.eventListeners[type];
                                break;
                            }
                            i--;
                        }
                    }
                };
                Node.prototype._fireChangeEvent = function(attr, oldVal, newVal) {
                    this._fire(attr + CHANGE, {
                        oldVal,
                        newVal
                    });
                };
                Node.prototype.setId = function(id) {
                    var oldId = this.id();
                    exports._removeId(oldId, this);
                    _addId(this, id);
                    this._setAttr("id", id);
                    return this;
                };
                Node.prototype.setName = function(name) {
                    var oldNames = (this.name() || "").split(/\s/g);
                    var newNames = (name || "").split(/\s/g);
                    var subname, i;
                    for (i = 0; i < oldNames.length; i++) {
                        subname = oldNames[i];
                        if (newNames.indexOf(subname) === -1 && subname) exports._removeName(subname, this._id);
                    }
                    for (i = 0; i < newNames.length; i++) {
                        subname = newNames[i];
                        if (oldNames.indexOf(subname) === -1 && subname) exports._addName(this, subname);
                    }
                    this._setAttr(NAME, name);
                    return this;
                };
                Node.prototype.addName = function(name) {
                    if (!this.hasName(name)) {
                        var oldName = this.name();
                        var newName = oldName ? oldName + " " + name : name;
                        this.setName(newName);
                    }
                    return this;
                };
                Node.prototype.hasName = function(name) {
                    if (!name) return false;
                    var fullName = this.name();
                    if (!fullName) return false;
                    var names = (fullName || "").split(/\s/g);
                    return names.indexOf(name) !== -1;
                };
                Node.prototype.removeName = function(name) {
                    var names = (this.name() || "").split(/\s/g);
                    var index = names.indexOf(name);
                    if (index !== -1) {
                        names.splice(index, 1);
                        this.setName(names.join(" "));
                    }
                    return this;
                };
                Node.prototype.setAttr = function(attr, val) {
                    var func = this[SET + Util_1.Util._capitalize(attr)];
                    if (Util_1.Util._isFunction(func)) func.call(this, val); else this._setAttr(attr, val);
                    return this;
                };
                Node.prototype._setAttr = function(key, val) {
                    var oldVal = this.attrs[key];
                    if (oldVal === val && !Util_1.Util.isObject(val)) return;
                    if (val === void 0 || val === null) delete this.attrs[key]; else this.attrs[key] = val;
                    this._fireChangeEvent(key, oldVal, val);
                };
                Node.prototype._setComponentAttr = function(key, component, val) {
                    var oldVal;
                    if (val !== void 0) {
                        oldVal = this.attrs[key];
                        if (!oldVal) this.attrs[key] = this.getAttr(key);
                        this.attrs[key][component] = val;
                        this._fireChangeEvent(key, oldVal, val);
                    }
                };
                Node.prototype._fireAndBubble = function(eventType, evt, compareShape) {
                    if (evt && this.nodeType === SHAPE) evt.target = this;
                    var shouldStop = (eventType === MOUSEENTER || eventType === MOUSELEAVE) && (compareShape && (this === compareShape || this.isAncestorOf && this.isAncestorOf(compareShape)) || this.nodeType === "Stage" && !compareShape);
                    if (!shouldStop) {
                        this._fire(eventType, evt);
                        var stopBubble = (eventType === MOUSEENTER || eventType === MOUSELEAVE) && compareShape && compareShape.isAncestorOf && compareShape.isAncestorOf(this) && !compareShape.isAncestorOf(this.parent);
                        if ((evt && !evt.cancelBubble || !evt) && this.parent && this.parent.isListening() && !stopBubble) if (compareShape && compareShape.parent) this._fireAndBubble.call(this.parent, eventType, evt, compareShape); else this._fireAndBubble.call(this.parent, eventType, evt);
                    }
                };
                Node.prototype._fire = function(eventType, evt) {
                    var i, events = this.eventListeners[eventType];
                    if (events) {
                        evt = evt || {};
                        evt.currentTarget = this;
                        evt.type = eventType;
                        for (i = 0; i < events.length; i++) events[i].handler.call(this, evt);
                    }
                };
                Node.prototype.draw = function() {
                    this.drawScene();
                    this.drawHit();
                    return this;
                };
                Node.prototype._createDragElement = function(evt) {
                    var pointerId = evt ? evt.pointerId : void 0;
                    var stage = this.getStage();
                    var ap = this.getAbsolutePosition();
                    var pos = stage._getPointerById(pointerId) || stage._changedPointerPositions[0] || ap;
                    DragAndDrop_1.DD._dragElements.set(this._id, {
                        node: this,
                        startPointerPos: pos,
                        offset: {
                            x: pos.x - ap.x,
                            y: pos.y - ap.y
                        },
                        dragStatus: "ready",
                        pointerId
                    });
                };
                Node.prototype.startDrag = function(evt) {
                    if (!DragAndDrop_1.DD._dragElements.has(this._id)) this._createDragElement(evt);
                    var elem = DragAndDrop_1.DD._dragElements.get(this._id);
                    elem.dragStatus = "dragging";
                    this.fire("dragstart", {
                        type: "dragstart",
                        target: this,
                        evt: evt && evt.evt
                    }, true);
                };
                Node.prototype._setDragPosition = function(evt, elem) {
                    var pos = this.getStage()._getPointerById(elem.pointerId);
                    if (!pos) return;
                    var newNodePos = {
                        x: pos.x - elem.offset.x,
                        y: pos.y - elem.offset.y
                    };
                    var dbf = this.dragBoundFunc();
                    if (dbf !== void 0) {
                        var bounded = dbf.call(this, newNodePos, evt);
                        if (!bounded) Util_1.Util.warn("dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc."); else newNodePos = bounded;
                    }
                    if (!this._lastPos || this._lastPos.x !== newNodePos.x || this._lastPos.y !== newNodePos.y) {
                        this.setAbsolutePosition(newNodePos);
                        if (this.getLayer()) this.getLayer().batchDraw(); else if (this.getStage()) this.getStage().batchDraw();
                    }
                    this._lastPos = newNodePos;
                };
                Node.prototype.stopDrag = function(evt) {
                    var elem = DragAndDrop_1.DD._dragElements.get(this._id);
                    if (elem) elem.dragStatus = "stopped";
                    DragAndDrop_1.DD._endDragBefore(evt);
                    DragAndDrop_1.DD._endDragAfter(evt);
                };
                Node.prototype.setDraggable = function(draggable) {
                    this._setAttr("draggable", draggable);
                    this._dragChange();
                };
                Node.prototype.isDragging = function() {
                    var elem = DragAndDrop_1.DD._dragElements.get(this._id);
                    return elem ? elem.dragStatus === "dragging" : false;
                };
                Node.prototype._listenDrag = function() {
                    this._dragCleanup();
                    this.on("mousedown.konva touchstart.konva", (function(evt) {
                        var _this = this;
                        var shouldCheckButton = evt.evt["button"] !== void 0;
                        var canDrag = !shouldCheckButton || Global_1.Konva.dragButtons.indexOf(evt.evt["button"]) >= 0;
                        if (!canDrag) return;
                        if (this.isDragging()) return;
                        var hasDraggingChild = false;
                        DragAndDrop_1.DD._dragElements.forEach((function(elem) {
                            if (_this.isAncestorOf(elem.node)) hasDraggingChild = true;
                        }));
                        if (!hasDraggingChild) this._createDragElement(evt);
                    }));
                };
                Node.prototype._dragChange = function() {
                    if (this.attrs.draggable) this._listenDrag(); else {
                        this._dragCleanup();
                        var stage = this.getStage();
                        if (stage && DragAndDrop_1.DD._dragElements.has(this._id)) this.stopDrag();
                    }
                };
                Node.prototype._dragCleanup = function() {
                    this.off("mousedown.konva");
                    this.off("touchstart.konva");
                };
                Node.create = function(data, container) {
                    if (Util_1.Util._isString(data)) data = JSON.parse(data);
                    return this._createNode(data, container);
                };
                Node._createNode = function(obj, container) {
                    var no, len, n, className = Node.prototype.getClassName.call(obj), children = obj.children;
                    if (container) obj.attrs.container = container;
                    if (!Global_1._NODES_REGISTRY[className]) {
                        Util_1.Util.warn('Can not find a node with class name "' + className + '". Fallback to "Shape".');
                        className = "Shape";
                    }
                    var Class = Global_1._NODES_REGISTRY[className];
                    no = new Class(obj.attrs);
                    if (children) {
                        len = children.length;
                        for (n = 0; n < len; n++) no.add(Node._createNode(children[n]));
                    }
                    return no;
                };
                return Node;
            }();
            exports.Node = Node;
            Node.prototype.nodeType = "Node";
            Node.prototype._attrsAffectingSize = [];
            Factory_1.Factory.addGetterSetter(Node, "zIndex");
            Factory_1.Factory.addGetterSetter(Node, "absolutePosition");
            Factory_1.Factory.addGetterSetter(Node, "position");
            Factory_1.Factory.addGetterSetter(Node, "x", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "y", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "globalCompositeOperation", "source-over", Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Node, "opacity", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "name", "", Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Node, "id", "", Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Node, "rotation", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addComponentsGetterSetter(Node, "scale", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Node, "scaleX", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "scaleY", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addComponentsGetterSetter(Node, "skew", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Node, "skewX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "skewY", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addComponentsGetterSetter(Node, "offset", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Node, "offsetX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "offsetY", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "dragDistance", null, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "width", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "height", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Node, "listening", "inherit", (function(val) {
                var isValid = val === true || val === false || val === "inherit";
                if (!isValid) Util_1.Util.warn(val + ' is a not valid value for "listening" attribute. The value may be true, false or "inherit".');
                return val;
            }));
            Factory_1.Factory.addGetterSetter(Node, "preventDefault", true, Validators_1.getBooleanValidator());
            Factory_1.Factory.addGetterSetter(Node, "filters", null, (function(val) {
                this._filterUpToDate = false;
                return val;
            }));
            Factory_1.Factory.addGetterSetter(Node, "visible", "inherit", (function(val) {
                var isValid = val === true || val === false || val === "inherit";
                if (!isValid) Util_1.Util.warn(val + ' is a not valid value for "visible" attribute. The value may be true, false or "inherit".');
                return val;
            }));
            Factory_1.Factory.addGetterSetter(Node, "transformsEnabled", "all", Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Node, "size");
            Factory_1.Factory.addGetterSetter(Node, "dragBoundFunc");
            Factory_1.Factory.addGetterSetter(Node, "draggable", false, Validators_1.getBooleanValidator());
            Factory_1.Factory.backCompat(Node, {
                rotateDeg: "rotate",
                setRotationDeg: "setRotation",
                getRotationDeg: "getRotation"
            });
            Util_1.Collection.mapMethods(Node);
        },
        974: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Global_1 = __webpack_require__(9427);
            var Captures = new Map;
            var SUPPORT_POINTER_EVENTS = Global_1.Konva._global["PointerEvent"] !== void 0;
            function getCapturedShape(pointerId) {
                return Captures.get(pointerId);
            }
            exports.getCapturedShape = getCapturedShape;
            function createEvent(evt) {
                return {
                    evt,
                    pointerId: evt.pointerId
                };
            }
            exports.createEvent = createEvent;
            function hasPointerCapture(pointerId, shape) {
                return Captures.get(pointerId) === shape;
            }
            exports.hasPointerCapture = hasPointerCapture;
            function setPointerCapture(pointerId, shape) {
                releaseCapture(pointerId);
                var stage = shape.getStage();
                if (!stage) return;
                Captures.set(pointerId, shape);
                if (SUPPORT_POINTER_EVENTS) shape._fire("gotpointercapture", createEvent(new PointerEvent("gotpointercapture")));
            }
            exports.setPointerCapture = setPointerCapture;
            function releaseCapture(pointerId, target) {
                var shape = Captures.get(pointerId);
                if (!shape) return;
                var stage = shape.getStage();
                if (stage && stage.content) ;
                Captures.delete(pointerId);
                if (SUPPORT_POINTER_EVENTS) shape._fire("lostpointercapture", createEvent(new PointerEvent("lostpointercapture")));
            }
            exports.releaseCapture = releaseCapture;
        },
        9071: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var PointerEvents = __webpack_require__(974);
            var HAS_SHADOW = "hasShadow";
            var SHADOW_RGBA = "shadowRGBA";
            var patternImage = "patternImage";
            var linearGradient = "linearGradient";
            var radialGradient = "radialGradient";
            var dummyContext;
            function getDummyContext() {
                if (dummyContext) return dummyContext;
                dummyContext = Util_1.Util.createCanvasElement().getContext("2d");
                return dummyContext;
            }
            exports.shapes = {};
            function _fillFunc(context) {
                context.fill();
            }
            function _strokeFunc(context) {
                context.stroke();
            }
            function _fillFuncHit(context) {
                context.fill();
            }
            function _strokeFuncHit(context) {
                context.stroke();
            }
            function _clearHasShadowCache() {
                this._clearCache(HAS_SHADOW);
            }
            function _clearGetShadowRGBACache() {
                this._clearCache(SHADOW_RGBA);
            }
            function _clearFillPatternCache() {
                this._clearCache(patternImage);
            }
            function _clearLinearGradientCache() {
                this._clearCache(linearGradient);
            }
            function _clearRadialGradientCache() {
                this._clearCache(radialGradient);
            }
            var Shape = function(_super) {
                __extends(Shape, _super);
                function Shape(config) {
                    var _this = _super.call(this, config) || this;
                    var key;
                    while (true) {
                        key = Util_1.Util.getRandomColor();
                        if (key && !(key in exports.shapes)) break;
                    }
                    _this.colorKey = key;
                    exports.shapes[key] = _this;
                    _this.on("shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva", _clearHasShadowCache);
                    _this.on("shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva", _clearGetShadowRGBACache);
                    _this.on("fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva", _clearFillPatternCache);
                    _this.on("fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva", _clearLinearGradientCache);
                    _this.on("fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva", _clearRadialGradientCache);
                    return _this;
                }
                Shape.prototype.getContext = function() {
                    return this.getLayer().getContext();
                };
                Shape.prototype.getCanvas = function() {
                    return this.getLayer().getCanvas();
                };
                Shape.prototype.getSceneFunc = function() {
                    return this.attrs.sceneFunc || this["_sceneFunc"];
                };
                Shape.prototype.getHitFunc = function() {
                    return this.attrs.hitFunc || this["_hitFunc"];
                };
                Shape.prototype.hasShadow = function() {
                    return this._getCache(HAS_SHADOW, this._hasShadow);
                };
                Shape.prototype._hasShadow = function() {
                    return this.shadowEnabled() && this.shadowOpacity() !== 0 && !!(this.shadowColor() || this.shadowBlur() || this.shadowOffsetX() || this.shadowOffsetY());
                };
                Shape.prototype._getFillPattern = function() {
                    return this._getCache(patternImage, this.__getFillPattern);
                };
                Shape.prototype.__getFillPattern = function() {
                    if (this.fillPatternImage()) {
                        var ctx = getDummyContext();
                        var pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || "repeat");
                        return pattern;
                    }
                };
                Shape.prototype._getLinearGradient = function() {
                    return this._getCache(linearGradient, this.__getLinearGradient);
                };
                Shape.prototype.__getLinearGradient = function() {
                    var colorStops = this.fillLinearGradientColorStops();
                    if (colorStops) {
                        var ctx = getDummyContext();
                        var start = this.fillLinearGradientStartPoint();
                        var end = this.fillLinearGradientEndPoint();
                        var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                        for (var n = 0; n < colorStops.length; n += 2) grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        return grd;
                    }
                };
                Shape.prototype._getRadialGradient = function() {
                    return this._getCache(radialGradient, this.__getRadialGradient);
                };
                Shape.prototype.__getRadialGradient = function() {
                    var colorStops = this.fillRadialGradientColorStops();
                    if (colorStops) {
                        var ctx = getDummyContext();
                        var start = this.fillRadialGradientStartPoint();
                        var end = this.fillRadialGradientEndPoint();
                        var grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
                        for (var n = 0; n < colorStops.length; n += 2) grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        return grd;
                    }
                };
                Shape.prototype.getShadowRGBA = function() {
                    return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
                };
                Shape.prototype._getShadowRGBA = function() {
                    if (this.hasShadow()) {
                        var rgba = Util_1.Util.colorToRGBA(this.shadowColor());
                        return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a * (this.shadowOpacity() || 1) + ")";
                    }
                };
                Shape.prototype.hasFill = function() {
                    return this.fillEnabled() && !!(this.fill() || this.fillPatternImage() || this.fillLinearGradientColorStops() || this.fillRadialGradientColorStops());
                };
                Shape.prototype.hasStroke = function() {
                    return this.strokeEnabled() && this.strokeWidth() && !!(this.stroke() || this.strokeLinearGradientColorStops());
                };
                Shape.prototype.hasHitStroke = function() {
                    var width = this.hitStrokeWidth();
                    if (width === "auto") return this.hasStroke();
                    return this.strokeEnabled() && !!width;
                };
                Shape.prototype.intersects = function(point) {
                    var p, stage = this.getStage(), bufferHitCanvas = stage.bufferHitCanvas;
                    bufferHitCanvas.getContext().clear();
                    this.drawHit(bufferHitCanvas);
                    p = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
                    return p[3] > 0;
                };
                Shape.prototype.destroy = function() {
                    Node_1.Node.prototype.destroy.call(this);
                    delete exports.shapes[this.colorKey];
                    delete this.colorKey;
                    return this;
                };
                Shape.prototype._useBufferCanvas = function(caching) {
                    return !!((!caching || this.hasShadow()) && this.perfectDrawEnabled() && this.getAbsoluteOpacity() !== 1 && this.hasFill() && this.hasStroke() && this.getStage());
                };
                Shape.prototype.setStrokeHitEnabled = function(val) {
                    Util_1.Util.warn("strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.");
                    if (val) this.hitStrokeWidth("auto"); else this.hitStrokeWidth(0);
                };
                Shape.prototype.getStrokeHitEnabled = function() {
                    if (this.hitStrokeWidth() === 0) return false; else return true;
                };
                Shape.prototype.getSelfRect = function() {
                    var size = this.size();
                    return {
                        x: this._centroid ? -size.width / 2 : 0,
                        y: this._centroid ? -size.height / 2 : 0,
                        width: size.width,
                        height: size.height
                    };
                };
                Shape.prototype.getClientRect = function(attrs) {
                    attrs = attrs || {};
                    var skipTransform = attrs.skipTransform;
                    var relativeTo = attrs.relativeTo;
                    var fillRect = this.getSelfRect();
                    var applyStroke = !attrs.skipStroke && this.hasStroke();
                    var strokeWidth = applyStroke && this.strokeWidth() || 0;
                    var fillAndStrokeWidth = fillRect.width + strokeWidth;
                    var fillAndStrokeHeight = fillRect.height + strokeWidth;
                    var applyShadow = !attrs.skipShadow && this.hasShadow();
                    var shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
                    var shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
                    var preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
                    var preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
                    var blurRadius = applyShadow && this.shadowBlur() || 0;
                    var width = preWidth + blurRadius * 2;
                    var height = preHeight + blurRadius * 2;
                    var roundingOffset = 0;
                    if (Math.round(strokeWidth / 2) !== strokeWidth / 2) roundingOffset = 1;
                    var rect = {
                        width: width + roundingOffset,
                        height: height + roundingOffset,
                        x: -Math.round(strokeWidth / 2 + blurRadius) + Math.min(shadowOffsetX, 0) + fillRect.x,
                        y: -Math.round(strokeWidth / 2 + blurRadius) + Math.min(shadowOffsetY, 0) + fillRect.y
                    };
                    if (!skipTransform) return this._transformedRect(rect, relativeTo);
                    return rect;
                };
                Shape.prototype.drawScene = function(can, top, caching, skipBuffer) {
                    var stage, bufferCanvas, bufferContext, layer = this.getLayer(), canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.sceneFunc(), hasShadow = this.hasShadow(), hasStroke = this.hasStroke();
                    if (!this.isVisible() && !caching) return this;
                    if (cachedCanvas) {
                        context.save();
                        layer._applyTransform(this, context, top);
                        this._drawCachedSceneCanvas(context);
                        context.restore();
                        return this;
                    }
                    if (!drawFunc) return this;
                    context.save();
                    if (this._useBufferCanvas(caching) && !skipBuffer) {
                        stage = this.getStage();
                        bufferCanvas = stage.bufferCanvas;
                        bufferContext = bufferCanvas.getContext();
                        bufferContext.clear();
                        bufferContext.save();
                        bufferContext._applyLineJoin(this);
                        if (!caching) if (layer) layer._applyTransform(this, bufferContext, top); else {
                            var m = this.getAbsoluteTransform(top).getMatrix();
                            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        }
                        drawFunc.call(this, bufferContext, this);
                        bufferContext.restore();
                        var ratio = bufferCanvas.pixelRatio;
                        if (hasShadow && !canvas.hitCanvas) {
                            context.save();
                            context._applyShadow(this);
                            context._applyOpacity(this);
                            context._applyGlobalCompositeOperation(this);
                            context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
                            context.restore();
                        } else {
                            context._applyOpacity(this);
                            context._applyGlobalCompositeOperation(this);
                            context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
                        }
                    } else {
                        context._applyLineJoin(this);
                        if (!caching) if (layer) layer._applyTransform(this, context, top); else {
                            var o = this.getAbsoluteTransform(top).getMatrix();
                            context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                        }
                        if (hasShadow && hasStroke && !canvas.hitCanvas) {
                            context.save();
                            if (!caching) {
                                context._applyOpacity(this);
                                context._applyGlobalCompositeOperation(this);
                            }
                            context._applyShadow(this);
                            drawFunc.call(this, context, this);
                            context.restore();
                            if (this.hasFill() && this.shadowForStrokeEnabled()) drawFunc.call(this, context, this);
                        } else if (hasShadow && !canvas.hitCanvas) {
                            context.save();
                            if (!caching) {
                                context._applyOpacity(this);
                                context._applyGlobalCompositeOperation(this);
                            }
                            context._applyShadow(this);
                            drawFunc.call(this, context, this);
                            context.restore();
                        } else {
                            if (!caching) {
                                context._applyOpacity(this);
                                context._applyGlobalCompositeOperation(this);
                            }
                            drawFunc.call(this, context, this);
                        }
                    }
                    context.restore();
                    return this;
                };
                Shape.prototype.drawHit = function(can, top, caching) {
                    var layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
                    if (!this.colorKey) {
                        console.log(this);
                        Util_1.Util.warn("Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. See the shape in logs above. If you want to reuse shape you should call remove() instead of destroy()");
                    }
                    if (!this.shouldDrawHit() && !caching) return this;
                    if (cachedHitCanvas) {
                        context.save();
                        layer._applyTransform(this, context, top);
                        this._drawCachedHitCanvas(context);
                        context.restore();
                        return this;
                    }
                    if (!drawFunc) return this;
                    context.save();
                    context._applyLineJoin(this);
                    if (!caching) if (layer) layer._applyTransform(this, context, top); else {
                        var o = this.getAbsoluteTransform(top).getMatrix();
                        context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                    }
                    drawFunc.call(this, context, this);
                    context.restore();
                    return this;
                };
                Shape.prototype.drawHitFromCache = function(alphaThreshold) {
                    if (alphaThreshold === void 0) alphaThreshold = 0;
                    var hitImageData, hitData, len, rgbColorKey, i, alpha, cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight();
                    hitContext.clear();
                    hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
                    try {
                        hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
                        hitData = hitImageData.data;
                        len = hitData.length;
                        rgbColorKey = Util_1.Util._hexToRgb(this.colorKey);
                        for (i = 0; i < len; i += 4) {
                            alpha = hitData[i + 3];
                            if (alpha > alphaThreshold) {
                                hitData[i] = rgbColorKey.r;
                                hitData[i + 1] = rgbColorKey.g;
                                hitData[i + 2] = rgbColorKey.b;
                                hitData[i + 3] = 255;
                            } else hitData[i + 3] = 0;
                        }
                        hitContext.putImageData(hitImageData, 0, 0);
                    } catch (e) {
                        Util_1.Util.error("Unable to draw hit graph from cached scene canvas. " + e.message);
                    }
                    return this;
                };
                Shape.prototype.hasPointerCapture = function(pointerId) {
                    return PointerEvents.hasPointerCapture(pointerId, this);
                };
                Shape.prototype.setPointerCapture = function(pointerId) {
                    PointerEvents.setPointerCapture(pointerId, this);
                };
                Shape.prototype.releaseCapture = function(pointerId) {
                    PointerEvents.releaseCapture(pointerId, this);
                };
                return Shape;
            }(Node_1.Node);
            exports.Shape = Shape;
            Shape.prototype._fillFunc = _fillFunc;
            Shape.prototype._strokeFunc = _strokeFunc;
            Shape.prototype._fillFuncHit = _fillFuncHit;
            Shape.prototype._strokeFuncHit = _strokeFuncHit;
            Shape.prototype._centroid = false;
            Shape.prototype.nodeType = "Shape";
            Global_1._registerNode(Shape);
            Factory_1.Factory.addGetterSetter(Shape, "stroke", void 0, Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Shape, "strokeWidth", 2, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "hitStrokeWidth", "auto", Validators_1.getNumberOrAutoValidator());
            Factory_1.Factory.addGetterSetter(Shape, "strokeHitEnabled", true, Validators_1.getBooleanValidator());
            Factory_1.Factory.addGetterSetter(Shape, "perfectDrawEnabled", true, Validators_1.getBooleanValidator());
            Factory_1.Factory.addGetterSetter(Shape, "shadowForStrokeEnabled", true, Validators_1.getBooleanValidator());
            Factory_1.Factory.addGetterSetter(Shape, "lineJoin");
            Factory_1.Factory.addGetterSetter(Shape, "lineCap");
            Factory_1.Factory.addGetterSetter(Shape, "sceneFunc");
            Factory_1.Factory.addGetterSetter(Shape, "hitFunc");
            Factory_1.Factory.addGetterSetter(Shape, "dash");
            Factory_1.Factory.addGetterSetter(Shape, "dashOffset", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "shadowColor", void 0, Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Shape, "shadowBlur", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "shadowOpacity", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addComponentsGetterSetter(Shape, "shadowOffset", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "shadowOffsetX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "shadowOffsetY", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternImage");
            Factory_1.Factory.addGetterSetter(Shape, "fill", void 0, Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternY", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "fillLinearGradientColorStops");
            Factory_1.Factory.addGetterSetter(Shape, "strokeLinearGradientColorStops");
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientStartRadius", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientEndRadius", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientColorStops");
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternRepeat", "repeat");
            Factory_1.Factory.addGetterSetter(Shape, "fillEnabled", true);
            Factory_1.Factory.addGetterSetter(Shape, "strokeEnabled", true);
            Factory_1.Factory.addGetterSetter(Shape, "shadowEnabled", true);
            Factory_1.Factory.addGetterSetter(Shape, "dashEnabled", true);
            Factory_1.Factory.addGetterSetter(Shape, "strokeScaleEnabled", true);
            Factory_1.Factory.addGetterSetter(Shape, "fillPriority", "color");
            Factory_1.Factory.addComponentsGetterSetter(Shape, "fillPatternOffset", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternOffsetX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternOffsetY", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addComponentsGetterSetter(Shape, "fillPatternScale", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternScaleX", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternScaleY", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addComponentsGetterSetter(Shape, "fillLinearGradientStartPoint", [ "x", "y" ]);
            Factory_1.Factory.addComponentsGetterSetter(Shape, "strokeLinearGradientStartPoint", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "fillLinearGradientStartPointX", 0);
            Factory_1.Factory.addGetterSetter(Shape, "strokeLinearGradientStartPointX", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillLinearGradientStartPointY", 0);
            Factory_1.Factory.addGetterSetter(Shape, "strokeLinearGradientStartPointY", 0);
            Factory_1.Factory.addComponentsGetterSetter(Shape, "fillLinearGradientEndPoint", [ "x", "y" ]);
            Factory_1.Factory.addComponentsGetterSetter(Shape, "strokeLinearGradientEndPoint", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "fillLinearGradientEndPointX", 0);
            Factory_1.Factory.addGetterSetter(Shape, "strokeLinearGradientEndPointX", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillLinearGradientEndPointY", 0);
            Factory_1.Factory.addGetterSetter(Shape, "strokeLinearGradientEndPointY", 0);
            Factory_1.Factory.addComponentsGetterSetter(Shape, "fillRadialGradientStartPoint", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientStartPointX", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientStartPointY", 0);
            Factory_1.Factory.addComponentsGetterSetter(Shape, "fillRadialGradientEndPoint", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientEndPointX", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillRadialGradientEndPointY", 0);
            Factory_1.Factory.addGetterSetter(Shape, "fillPatternRotation", 0);
            Factory_1.Factory.backCompat(Shape, {
                dashArray: "dash",
                getDashArray: "getDash",
                setDashArray: "getDash",
                drawFunc: "sceneFunc",
                getDrawFunc: "getSceneFunc",
                setDrawFunc: "setSceneFunc",
                drawHitFunc: "hitFunc",
                getDrawHitFunc: "getHitFunc",
                setDrawHitFunc: "setHitFunc"
            });
            Util_1.Collection.mapMethods(Shape);
        },
        6936: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Container_1 = __webpack_require__(9957);
            var Global_1 = __webpack_require__(9427);
            var Canvas_1 = __webpack_require__(7544);
            var DragAndDrop_1 = __webpack_require__(7752);
            var Global_2 = __webpack_require__(9427);
            var PointerEvents = __webpack_require__(974);
            var STAGE = "Stage", STRING = "string", PX = "px", MOUSEOUT = "mouseout", MOUSELEAVE = "mouseleave", MOUSEOVER = "mouseover", MOUSEENTER = "mouseenter", MOUSEMOVE = "mousemove", MOUSEDOWN = "mousedown", MOUSEUP = "mouseup", POINTERMOVE = "pointermove", POINTERDOWN = "pointerdown", POINTERUP = "pointerup", POINTERCANCEL = "pointercancel", LOSTPOINTERCAPTURE = "lostpointercapture", CONTEXTMENU = "contextmenu", CLICK = "click", DBL_CLICK = "dblclick", TOUCHSTART = "touchstart", TOUCHEND = "touchend", TAP = "tap", DBL_TAP = "dbltap", TOUCHMOVE = "touchmove", WHEEL = "wheel", CONTENT_MOUSEOUT = "contentMouseout", CONTENT_MOUSEOVER = "contentMouseover", CONTENT_MOUSEMOVE = "contentMousemove", CONTENT_MOUSEDOWN = "contentMousedown", CONTENT_MOUSEUP = "contentMouseup", CONTENT_CONTEXTMENU = "contentContextmenu", CONTENT_CLICK = "contentClick", CONTENT_DBL_CLICK = "contentDblclick", CONTENT_TOUCHSTART = "contentTouchstart", CONTENT_TOUCHEND = "contentTouchend", CONTENT_DBL_TAP = "contentDbltap", CONTENT_TAP = "contentTap", CONTENT_TOUCHMOVE = "contentTouchmove", CONTENT_WHEEL = "contentWheel", RELATIVE = "relative", KONVA_CONTENT = "konvajs-content", UNDERSCORE = "_", CONTAINER = "container", MAX_LAYERS_NUMBER = 5, EMPTY_STRING = "", EVENTS = [ MOUSEENTER, MOUSEDOWN, MOUSEMOVE, MOUSEUP, MOUSEOUT, TOUCHSTART, TOUCHMOVE, TOUCHEND, MOUSEOVER, WHEEL, CONTEXTMENU, POINTERDOWN, POINTERMOVE, POINTERUP, POINTERCANCEL, LOSTPOINTERCAPTURE ], eventsLength = EVENTS.length;
            function addEvent(ctx, eventName) {
                ctx.content.addEventListener(eventName, (function(evt) {
                    ctx[UNDERSCORE + eventName](evt);
                }), false);
            }
            var NO_POINTERS_MESSAGE = "Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);";
            exports.stages = [];
            function checkNoClip(attrs) {
                if (attrs === void 0) attrs = {};
                if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) Util_1.Util.warn("Stage does not support clipping. Please use clip for Layers or Groups.");
                return attrs;
            }
            var Stage = function(_super) {
                __extends(Stage, _super);
                function Stage(config) {
                    var _this = _super.call(this, checkNoClip(config)) || this;
                    _this._pointerPositions = [];
                    _this._changedPointerPositions = [];
                    _this._buildDOM();
                    _this._bindContentEvents();
                    exports.stages.push(_this);
                    _this.on("widthChange.konva heightChange.konva", _this._resizeDOM);
                    _this.on("visibleChange.konva", _this._checkVisibility);
                    _this.on("clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva", (function() {
                        checkNoClip(_this.attrs);
                    }));
                    _this._checkVisibility();
                    return _this;
                }
                Stage.prototype._validateAdd = function(child) {
                    var isLayer = child.getType() === "Layer";
                    var isFastLayer = child.getType() === "FastLayer";
                    var valid = isLayer || isFastLayer;
                    if (!valid) Util_1.Util.throw("You may only add layers to the stage.");
                };
                Stage.prototype._checkVisibility = function() {
                    if (!this.content) return;
                    var style = this.visible() ? "" : "none";
                    this.content.style.display = style;
                };
                Stage.prototype.setContainer = function(container) {
                    if (typeof container === STRING) {
                        if (container.charAt(0) === ".") {
                            var className = container.slice(1);
                            container = document.getElementsByClassName(className)[0];
                        } else {
                            var id;
                            if (container.charAt(0) !== "#") id = container; else id = container.slice(1);
                            container = document.getElementById(id);
                        }
                        if (!container) throw "Can not find container in document with id " + id;
                    }
                    this._setAttr(CONTAINER, container);
                    if (this.content) {
                        if (this.content.parentElement) this.content.parentElement.removeChild(this.content);
                        container.appendChild(this.content);
                    }
                    return this;
                };
                Stage.prototype.shouldDrawHit = function() {
                    return true;
                };
                Stage.prototype.clear = function() {
                    var n, layers = this.children, len = layers.length;
                    for (n = 0; n < len; n++) layers[n].clear();
                    return this;
                };
                Stage.prototype.clone = function(obj) {
                    if (!obj) obj = {};
                    obj.container = document.createElement("div");
                    return Container_1.Container.prototype.clone.call(this, obj);
                };
                Stage.prototype.destroy = function() {
                    _super.prototype.destroy.call(this);
                    var content = this.content;
                    if (content && Util_1.Util._isInDocument(content)) this.container().removeChild(content);
                    var index = exports.stages.indexOf(this);
                    if (index > -1) exports.stages.splice(index, 1);
                    return this;
                };
                Stage.prototype.getPointerPosition = function() {
                    var pos = this._pointerPositions[0] || this._changedPointerPositions[0];
                    if (!pos) {
                        Util_1.Util.warn(NO_POINTERS_MESSAGE);
                        return null;
                    }
                    return {
                        x: pos.x,
                        y: pos.y
                    };
                };
                Stage.prototype._getPointerById = function(id) {
                    return this._pointerPositions.find((function(p) {
                        return p.id === id;
                    }));
                };
                Stage.prototype.getPointersPositions = function() {
                    return this._pointerPositions;
                };
                Stage.prototype.getStage = function() {
                    return this;
                };
                Stage.prototype.getContent = function() {
                    return this.content;
                };
                Stage.prototype._toKonvaCanvas = function(config) {
                    config = config || {};
                    var x = config.x || 0, y = config.y || 0, canvas = new Canvas_1.SceneCanvas({
                        width: config.width || this.width(),
                        height: config.height || this.height(),
                        pixelRatio: config.pixelRatio || 1
                    }), _context = canvas.getContext()._context, layers = this.children;
                    if (x || y) _context.translate(-1 * x, -1 * y);
                    layers.each((function(layer) {
                        if (!layer.isVisible()) return;
                        var layerCanvas = layer._toKonvaCanvas(config);
                        _context.drawImage(layerCanvas._canvas, x, y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
                    }));
                    return canvas;
                };
                Stage.prototype.getIntersection = function(pos, selector) {
                    if (!pos) return null;
                    var n, shape, layers = this.children, len = layers.length, end = len - 1;
                    for (n = end; n >= 0; n--) {
                        shape = layers[n].getIntersection(pos, selector);
                        if (shape) return shape;
                    }
                    return null;
                };
                Stage.prototype._resizeDOM = function() {
                    var width = this.width();
                    var height = this.height();
                    if (this.content) {
                        this.content.style.width = width + PX;
                        this.content.style.height = height + PX;
                    }
                    this.bufferCanvas.setSize(width, height);
                    this.bufferHitCanvas.setSize(width, height);
                    this.children.each((function(layer) {
                        layer.setSize({
                            width,
                            height
                        });
                        layer.draw();
                    }));
                };
                Stage.prototype.add = function(layer) {
                    if (arguments.length > 1) {
                        for (var i = 0; i < arguments.length; i++) this.add(arguments[i]);
                        return this;
                    }
                    _super.prototype.add.call(this, layer);
                    var length = this.children.length;
                    if (length > MAX_LAYERS_NUMBER) Util_1.Util.warn("The stage has " + length + " layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.");
                    layer.setSize({
                        width: this.width(),
                        height: this.height()
                    });
                    layer.draw();
                    if (Global_1.Konva.isBrowser) this.content.appendChild(layer.canvas._canvas);
                    return this;
                };
                Stage.prototype.getParent = function() {
                    return null;
                };
                Stage.prototype.getLayer = function() {
                    return null;
                };
                Stage.prototype.hasPointerCapture = function(pointerId) {
                    return PointerEvents.hasPointerCapture(pointerId, this);
                };
                Stage.prototype.setPointerCapture = function(pointerId) {
                    PointerEvents.setPointerCapture(pointerId, this);
                };
                Stage.prototype.releaseCapture = function(pointerId) {
                    PointerEvents.releaseCapture(pointerId, this);
                };
                Stage.prototype.getLayers = function() {
                    return this.getChildren();
                };
                Stage.prototype._bindContentEvents = function() {
                    if (!Global_1.Konva.isBrowser) return;
                    for (var n = 0; n < eventsLength; n++) addEvent(this, EVENTS[n]);
                };
                Stage.prototype._mouseenter = function(evt) {
                    this.setPointersPositions(evt);
                    this._fire(MOUSEENTER, {
                        evt,
                        target: this,
                        currentTarget: this
                    });
                };
                Stage.prototype._mouseover = function(evt) {
                    this.setPointersPositions(evt);
                    this._fire(CONTENT_MOUSEOVER, {
                        evt
                    });
                    this._fire(MOUSEOVER, {
                        evt,
                        target: this,
                        currentTarget: this
                    });
                };
                Stage.prototype._mouseout = function(evt) {
                    var _a;
                    this.setPointersPositions(evt);
                    var targetShape = ((_a = this.targetShape) === null || _a === void 0 ? void 0 : _a.getStage()) ? this.targetShape : null;
                    var eventsEnabled = !DragAndDrop_1.DD.isDragging || Global_1.Konva.hitOnDragEnabled;
                    if (targetShape && eventsEnabled) {
                        targetShape._fireAndBubble(MOUSEOUT, {
                            evt
                        });
                        targetShape._fireAndBubble(MOUSELEAVE, {
                            evt
                        });
                        this._fire(MOUSELEAVE, {
                            evt,
                            target: this,
                            currentTarget: this
                        });
                        this.targetShape = null;
                    } else if (eventsEnabled) {
                        this._fire(MOUSELEAVE, {
                            evt,
                            target: this,
                            currentTarget: this
                        });
                        this._fire(MOUSEOUT, {
                            evt,
                            target: this,
                            currentTarget: this
                        });
                    }
                    this.pointerPos = void 0;
                    this._pointerPositions = [];
                    this._fire(CONTENT_MOUSEOUT, {
                        evt
                    });
                };
                Stage.prototype._mousemove = function(evt) {
                    var _a;
                    if (Global_1.Konva.UA.ieMobile) return this._touchmove(evt);
                    this.setPointersPositions(evt);
                    var pointerId = Util_1.Util._getFirstPointerId(evt);
                    var shape;
                    var targetShape = ((_a = this.targetShape) === null || _a === void 0 ? void 0 : _a.getStage()) ? this.targetShape : null;
                    var eventsEnabled = !DragAndDrop_1.DD.isDragging || Global_1.Konva.hitOnDragEnabled;
                    if (eventsEnabled) {
                        shape = this.getIntersection(this.getPointerPosition());
                        if (shape && shape.isListening()) {
                            var differentTarget = targetShape !== shape;
                            if (eventsEnabled && differentTarget) {
                                if (targetShape) {
                                    targetShape._fireAndBubble(MOUSEOUT, {
                                        evt,
                                        pointerId
                                    }, shape);
                                    targetShape._fireAndBubble(MOUSELEAVE, {
                                        evt,
                                        pointerId
                                    }, shape);
                                }
                                shape._fireAndBubble(MOUSEOVER, {
                                    evt,
                                    pointerId
                                }, targetShape);
                                shape._fireAndBubble(MOUSEENTER, {
                                    evt,
                                    pointerId
                                }, targetShape);
                                shape._fireAndBubble(MOUSEMOVE, {
                                    evt,
                                    pointerId
                                });
                                this.targetShape = shape;
                            } else shape._fireAndBubble(MOUSEMOVE, {
                                evt,
                                pointerId
                            });
                        } else {
                            if (targetShape && eventsEnabled) {
                                targetShape._fireAndBubble(MOUSEOUT, {
                                    evt,
                                    pointerId
                                });
                                targetShape._fireAndBubble(MOUSELEAVE, {
                                    evt,
                                    pointerId
                                });
                                this._fire(MOUSEOVER, {
                                    evt,
                                    target: this,
                                    currentTarget: this,
                                    pointerId
                                });
                                this.targetShape = null;
                            }
                            this._fire(MOUSEMOVE, {
                                evt,
                                target: this,
                                currentTarget: this,
                                pointerId
                            });
                        }
                        this._fire(CONTENT_MOUSEMOVE, {
                            evt
                        });
                    }
                    if (evt.cancelable) evt.preventDefault();
                };
                Stage.prototype._mousedown = function(evt) {
                    if (Global_1.Konva.UA.ieMobile) return this._touchstart(evt);
                    this.setPointersPositions(evt);
                    var pointerId = Util_1.Util._getFirstPointerId(evt);
                    var shape = this.getIntersection(this.getPointerPosition());
                    DragAndDrop_1.DD.justDragged = false;
                    Global_1.Konva.listenClickTap = true;
                    if (shape && shape.isListening()) {
                        this.clickStartShape = shape;
                        shape._fireAndBubble(MOUSEDOWN, {
                            evt,
                            pointerId
                        });
                    } else this._fire(MOUSEDOWN, {
                        evt,
                        target: this,
                        currentTarget: this,
                        pointerId
                    });
                    this._fire(CONTENT_MOUSEDOWN, {
                        evt
                    });
                };
                Stage.prototype._mouseup = function(evt) {
                    if (Global_1.Konva.UA.ieMobile) return this._touchend(evt);
                    this.setPointersPositions(evt);
                    var pointerId = Util_1.Util._getFirstPointerId(evt);
                    var shape = this.getIntersection(this.getPointerPosition()), clickStartShape = this.clickStartShape, clickEndShape = this.clickEndShape, fireDblClick = false;
                    if (Global_1.Konva.inDblClickWindow) {
                        fireDblClick = true;
                        clearTimeout(this.dblTimeout);
                    } else if (!DragAndDrop_1.DD.justDragged) {
                        Global_1.Konva.inDblClickWindow = true;
                        clearTimeout(this.dblTimeout);
                    }
                    this.dblTimeout = setTimeout((function() {
                        Global_1.Konva.inDblClickWindow = false;
                    }), Global_1.Konva.dblClickWindow);
                    if (shape && shape.isListening()) {
                        this.clickEndShape = shape;
                        shape._fireAndBubble(MOUSEUP, {
                            evt,
                            pointerId
                        });
                        if (Global_1.Konva.listenClickTap && clickStartShape && clickStartShape._id === shape._id) {
                            shape._fireAndBubble(CLICK, {
                                evt,
                                pointerId
                            });
                            if (fireDblClick && clickEndShape && clickEndShape === shape) shape._fireAndBubble(DBL_CLICK, {
                                evt,
                                pointerId
                            });
                        }
                    } else {
                        this._fire(MOUSEUP, {
                            evt,
                            target: this,
                            currentTarget: this,
                            pointerId
                        });
                        if (Global_1.Konva.listenClickTap) this._fire(CLICK, {
                            evt,
                            target: this,
                            currentTarget: this,
                            pointerId
                        });
                        if (fireDblClick) this._fire(DBL_CLICK, {
                            evt,
                            target: this,
                            currentTarget: this,
                            pointerId
                        });
                    }
                    this._fire(CONTENT_MOUSEUP, {
                        evt
                    });
                    if (Global_1.Konva.listenClickTap) {
                        this._fire(CONTENT_CLICK, {
                            evt
                        });
                        if (fireDblClick) this._fire(CONTENT_DBL_CLICK, {
                            evt
                        });
                    }
                    Global_1.Konva.listenClickTap = false;
                    if (evt.cancelable) evt.preventDefault();
                };
                Stage.prototype._contextmenu = function(evt) {
                    this.setPointersPositions(evt);
                    var shape = this.getIntersection(this.getPointerPosition());
                    if (shape && shape.isListening()) shape._fireAndBubble(CONTEXTMENU, {
                        evt
                    }); else this._fire(CONTEXTMENU, {
                        evt,
                        target: this,
                        currentTarget: this
                    });
                    this._fire(CONTENT_CONTEXTMENU, {
                        evt
                    });
                };
                Stage.prototype._touchstart = function(evt) {
                    var _this = this;
                    this.setPointersPositions(evt);
                    var triggeredOnShape = false;
                    this._changedPointerPositions.forEach((function(pos) {
                        var shape = _this.getIntersection(pos);
                        Global_1.Konva.listenClickTap = true;
                        DragAndDrop_1.DD.justDragged = false;
                        var hasShape = shape && shape.isListening();
                        if (!hasShape) return;
                        if (Global_1.Konva.captureTouchEventsEnabled) shape.setPointerCapture(pos.id);
                        _this.tapStartShape = shape;
                        shape._fireAndBubble(TOUCHSTART, {
                            evt,
                            pointerId: pos.id
                        }, _this);
                        triggeredOnShape = true;
                        if (shape.isListening() && shape.preventDefault() && evt.cancelable) evt.preventDefault();
                    }));
                    if (!triggeredOnShape) this._fire(TOUCHSTART, {
                        evt,
                        target: this,
                        currentTarget: this,
                        pointerId: this._changedPointerPositions[0].id
                    });
                    this._fire(CONTENT_TOUCHSTART, {
                        evt
                    });
                };
                Stage.prototype._touchmove = function(evt) {
                    var _this = this;
                    this.setPointersPositions(evt);
                    var eventsEnabled = !DragAndDrop_1.DD.isDragging || Global_1.Konva.hitOnDragEnabled;
                    if (eventsEnabled) {
                        var triggeredOnShape = false;
                        var processedShapesIds = {};
                        this._changedPointerPositions.forEach((function(pos) {
                            var shape = PointerEvents.getCapturedShape(pos.id) || _this.getIntersection(pos);
                            var hasShape = shape && shape.isListening();
                            if (!hasShape) return;
                            if (processedShapesIds[shape._id]) return;
                            processedShapesIds[shape._id] = true;
                            shape._fireAndBubble(TOUCHMOVE, {
                                evt,
                                pointerId: pos.id
                            });
                            triggeredOnShape = true;
                            if (shape.isListening() && shape.preventDefault() && evt.cancelable) evt.preventDefault();
                        }));
                        if (!triggeredOnShape) this._fire(TOUCHMOVE, {
                            evt,
                            target: this,
                            currentTarget: this,
                            pointerId: this._changedPointerPositions[0].id
                        });
                        this._fire(CONTENT_TOUCHMOVE, {
                            evt
                        });
                    }
                    if (DragAndDrop_1.DD.isDragging && DragAndDrop_1.DD.node.preventDefault() && evt.cancelable) evt.preventDefault();
                };
                Stage.prototype._touchend = function(evt) {
                    var _this = this;
                    this.setPointersPositions(evt);
                    var clickEndShape = this.clickEndShape, fireDblClick = false;
                    if (Global_1.Konva.inDblClickWindow) {
                        fireDblClick = true;
                        clearTimeout(this.dblTimeout);
                    } else if (!DragAndDrop_1.DD.justDragged) {
                        Global_1.Konva.inDblClickWindow = true;
                        clearTimeout(this.dblTimeout);
                    }
                    this.dblTimeout = setTimeout((function() {
                        Global_1.Konva.inDblClickWindow = false;
                    }), Global_1.Konva.dblClickWindow);
                    var triggeredOnShape = false;
                    var processedShapesIds = {};
                    var tapTriggered = false;
                    var dblTapTriggered = false;
                    this._changedPointerPositions.forEach((function(pos) {
                        var shape = PointerEvents.getCapturedShape(pos.id) || _this.getIntersection(pos);
                        if (shape) shape.releaseCapture(pos.id);
                        var hasShape = shape && shape.isListening();
                        if (!hasShape) return;
                        if (processedShapesIds[shape._id]) return;
                        processedShapesIds[shape._id] = true;
                        _this.clickEndShape = shape;
                        shape._fireAndBubble(TOUCHEND, {
                            evt,
                            pointerId: pos.id
                        });
                        triggeredOnShape = true;
                        if (Global_1.Konva.listenClickTap && shape === _this.tapStartShape) {
                            tapTriggered = true;
                            shape._fireAndBubble(TAP, {
                                evt,
                                pointerId: pos.id
                            });
                            if (fireDblClick && clickEndShape && clickEndShape === shape) {
                                dblTapTriggered = true;
                                shape._fireAndBubble(DBL_TAP, {
                                    evt,
                                    pointerId: pos.id
                                });
                            }
                        }
                        if (shape.isListening() && shape.preventDefault() && evt.cancelable) evt.preventDefault();
                    }));
                    if (!triggeredOnShape) this._fire(TOUCHEND, {
                        evt,
                        target: this,
                        currentTarget: this,
                        pointerId: this._changedPointerPositions[0].id
                    });
                    if (Global_1.Konva.listenClickTap && !tapTriggered) this._fire(TAP, {
                        evt,
                        target: this,
                        currentTarget: this,
                        pointerId: this._changedPointerPositions[0].id
                    });
                    if (fireDblClick && !dblTapTriggered) this._fire(DBL_TAP, {
                        evt,
                        target: this,
                        currentTarget: this,
                        pointerId: this._changedPointerPositions[0].id
                    });
                    this._fire(CONTENT_TOUCHEND, {
                        evt
                    });
                    if (Global_1.Konva.listenClickTap) {
                        this._fire(CONTENT_TAP, {
                            evt
                        });
                        if (fireDblClick) this._fire(CONTENT_DBL_TAP, {
                            evt
                        });
                    }
                    Global_1.Konva.listenClickTap = false;
                };
                Stage.prototype._wheel = function(evt) {
                    this.setPointersPositions(evt);
                    var shape = this.getIntersection(this.getPointerPosition());
                    if (shape && shape.isListening()) shape._fireAndBubble(WHEEL, {
                        evt
                    }); else this._fire(WHEEL, {
                        evt,
                        target: this,
                        currentTarget: this
                    });
                    this._fire(CONTENT_WHEEL, {
                        evt
                    });
                };
                Stage.prototype._pointerdown = function(evt) {
                    if (!Global_1.Konva._pointerEventsEnabled) return;
                    this.setPointersPositions(evt);
                    var shape = PointerEvents.getCapturedShape(evt.pointerId) || this.getIntersection(this.getPointerPosition());
                    if (shape) shape._fireAndBubble(POINTERDOWN, PointerEvents.createEvent(evt));
                };
                Stage.prototype._pointermove = function(evt) {
                    if (!Global_1.Konva._pointerEventsEnabled) return;
                    this.setPointersPositions(evt);
                    var shape = PointerEvents.getCapturedShape(evt.pointerId) || this.getIntersection(this.getPointerPosition());
                    if (shape) shape._fireAndBubble(POINTERMOVE, PointerEvents.createEvent(evt));
                };
                Stage.prototype._pointerup = function(evt) {
                    if (!Global_1.Konva._pointerEventsEnabled) return;
                    this.setPointersPositions(evt);
                    var shape = PointerEvents.getCapturedShape(evt.pointerId) || this.getIntersection(this.getPointerPosition());
                    if (shape) shape._fireAndBubble(POINTERUP, PointerEvents.createEvent(evt));
                    PointerEvents.releaseCapture(evt.pointerId);
                };
                Stage.prototype._pointercancel = function(evt) {
                    if (!Global_1.Konva._pointerEventsEnabled) return;
                    this.setPointersPositions(evt);
                    var shape = PointerEvents.getCapturedShape(evt.pointerId) || this.getIntersection(this.getPointerPosition());
                    if (shape) shape._fireAndBubble(POINTERUP, PointerEvents.createEvent(evt));
                    PointerEvents.releaseCapture(evt.pointerId);
                };
                Stage.prototype._lostpointercapture = function(evt) {
                    PointerEvents.releaseCapture(evt.pointerId);
                };
                Stage.prototype.setPointersPositions = function(evt) {
                    var _this = this;
                    var contentPosition = this._getContentPosition(), x = null, y = null;
                    evt = evt ? evt : window.event;
                    if (evt.touches !== void 0) {
                        this._pointerPositions = [];
                        this._changedPointerPositions = [];
                        Util_1.Collection.prototype.each.call(evt.touches, (function(touch) {
                            _this._pointerPositions.push({
                                id: touch.identifier,
                                x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                                y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
                            });
                        }));
                        Util_1.Collection.prototype.each.call(evt.changedTouches || evt.touches, (function(touch) {
                            _this._changedPointerPositions.push({
                                id: touch.identifier,
                                x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                                y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
                            });
                        }));
                    } else {
                        x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
                        y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
                        this.pointerPos = {
                            x,
                            y
                        };
                        this._pointerPositions = [ {
                            x,
                            y,
                            id: Util_1.Util._getFirstPointerId(evt)
                        } ];
                        this._changedPointerPositions = [ {
                            x,
                            y,
                            id: Util_1.Util._getFirstPointerId(evt)
                        } ];
                    }
                };
                Stage.prototype._setPointerPosition = function(evt) {
                    Util_1.Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
                    this.setPointersPositions(evt);
                };
                Stage.prototype._getContentPosition = function() {
                    if (!this.content || !this.content.getBoundingClientRect) return {
                        top: 0,
                        left: 0,
                        scaleX: 1,
                        scaleY: 1
                    };
                    var rect = this.content.getBoundingClientRect();
                    return {
                        top: rect.top,
                        left: rect.left,
                        scaleX: rect.width / this.content.clientWidth || 1,
                        scaleY: rect.height / this.content.clientHeight || 1
                    };
                };
                Stage.prototype._buildDOM = function() {
                    this.bufferCanvas = new Canvas_1.SceneCanvas({
                        width: this.width(),
                        height: this.height()
                    });
                    this.bufferHitCanvas = new Canvas_1.HitCanvas({
                        pixelRatio: 1,
                        width: this.width(),
                        height: this.height()
                    });
                    if (!Global_1.Konva.isBrowser) return;
                    var container = this.container();
                    if (!container) throw "Stage has no container. A container is required.";
                    container.innerHTML = EMPTY_STRING;
                    this.content = document.createElement("div");
                    this.content.style.position = RELATIVE;
                    this.content.style.userSelect = "none";
                    this.content.className = KONVA_CONTENT;
                    this.content.setAttribute("role", "presentation");
                    container.appendChild(this.content);
                    this._resizeDOM();
                };
                Stage.prototype.cache = function() {
                    Util_1.Util.warn("Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.");
                    return this;
                };
                Stage.prototype.clearCache = function() {
                    return this;
                };
                Stage.prototype.batchDraw = function() {
                    this.children.each((function(layer) {
                        layer.batchDraw();
                    }));
                    return this;
                };
                return Stage;
            }(Container_1.Container);
            exports.Stage = Stage;
            Stage.prototype.nodeType = STAGE;
            Global_2._registerNode(Stage);
            Factory_1.Factory.addGetterSetter(Stage, "container");
        },
        7733: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Animation_1 = __webpack_require__(9500);
            var Node_1 = __webpack_require__(5924);
            var Global_1 = __webpack_require__(9427);
            var blacklist = {
                node: 1,
                duration: 1,
                easing: 1,
                onFinish: 1,
                yoyo: 1
            }, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter = 0, colorAttrs = [ "fill", "stroke", "shadowColor" ];
            var TweenEngine = function() {
                function TweenEngine(prop, propFunc, func, begin, finish, duration, yoyo) {
                    this.prop = prop;
                    this.propFunc = propFunc;
                    this.begin = begin;
                    this._pos = begin;
                    this.duration = duration;
                    this._change = 0;
                    this.prevPos = 0;
                    this.yoyo = yoyo;
                    this._time = 0;
                    this._position = 0;
                    this._startTime = 0;
                    this._finish = 0;
                    this.func = func;
                    this._change = finish - this.begin;
                    this.pause();
                }
                TweenEngine.prototype.fire = function(str) {
                    var handler = this[str];
                    if (handler) handler();
                };
                TweenEngine.prototype.setTime = function(t) {
                    if (t > this.duration) if (this.yoyo) {
                        this._time = this.duration;
                        this.reverse();
                    } else this.finish(); else if (t < 0) if (this.yoyo) {
                        this._time = 0;
                        this.play();
                    } else this.reset(); else {
                        this._time = t;
                        this.update();
                    }
                };
                TweenEngine.prototype.getTime = function() {
                    return this._time;
                };
                TweenEngine.prototype.setPosition = function(p) {
                    this.prevPos = this._pos;
                    this.propFunc(p);
                    this._pos = p;
                };
                TweenEngine.prototype.getPosition = function(t) {
                    if (t === void 0) t = this._time;
                    return this.func(t, this.begin, this._change, this.duration);
                };
                TweenEngine.prototype.play = function() {
                    this.state = PLAYING;
                    this._startTime = this.getTimer() - this._time;
                    this.onEnterFrame();
                    this.fire("onPlay");
                };
                TweenEngine.prototype.reverse = function() {
                    this.state = REVERSING;
                    this._time = this.duration - this._time;
                    this._startTime = this.getTimer() - this._time;
                    this.onEnterFrame();
                    this.fire("onReverse");
                };
                TweenEngine.prototype.seek = function(t) {
                    this.pause();
                    this._time = t;
                    this.update();
                    this.fire("onSeek");
                };
                TweenEngine.prototype.reset = function() {
                    this.pause();
                    this._time = 0;
                    this.update();
                    this.fire("onReset");
                };
                TweenEngine.prototype.finish = function() {
                    this.pause();
                    this._time = this.duration;
                    this.update();
                    this.fire("onFinish");
                };
                TweenEngine.prototype.update = function() {
                    this.setPosition(this.getPosition(this._time));
                };
                TweenEngine.prototype.onEnterFrame = function() {
                    var t = this.getTimer() - this._startTime;
                    if (this.state === PLAYING) this.setTime(t); else if (this.state === REVERSING) this.setTime(this.duration - t);
                };
                TweenEngine.prototype.pause = function() {
                    this.state = PAUSED;
                    this.fire("onPause");
                };
                TweenEngine.prototype.getTimer = function() {
                    return (new Date).getTime();
                };
                return TweenEngine;
            }();
            var Tween = function() {
                function Tween(config) {
                    var duration, key, that = this, node = config.node, nodeId = node._id, easing = config.easing || exports.Easings.Linear, yoyo = !!config.yoyo;
                    if (typeof config.duration === "undefined") duration = .3; else if (config.duration === 0) duration = .001; else duration = config.duration;
                    this.node = node;
                    this._id = idCounter++;
                    var layers = node.getLayer() || (node instanceof Global_1.Konva["Stage"] ? node.getLayers() : null);
                    if (!layers) Util_1.Util.error("Tween constructor have `node` that is not in a layer. Please add node into layer first.");
                    this.anim = new Animation_1.Animation((function() {
                        that.tween.onEnterFrame();
                    }), layers);
                    this.tween = new TweenEngine(key, (function(i) {
                        that._tweenFunc(i);
                    }), easing, 0, 1, duration * 1e3, yoyo);
                    this._addListeners();
                    if (!Tween.attrs[nodeId]) Tween.attrs[nodeId] = {};
                    if (!Tween.attrs[nodeId][this._id]) Tween.attrs[nodeId][this._id] = {};
                    if (!Tween.tweens[nodeId]) Tween.tweens[nodeId] = {};
                    for (key in config) if (blacklist[key] === void 0) this._addAttr(key, config[key]);
                    this.reset();
                    this.onFinish = config.onFinish;
                    this.onReset = config.onReset;
                }
                Tween.prototype._addAttr = function(key, end) {
                    var start, diff, tweenId, n, len, trueEnd, trueStart, endRGBA, node = this.node, nodeId = node._id;
                    tweenId = Tween.tweens[nodeId][key];
                    if (tweenId) delete Tween.attrs[nodeId][tweenId][key];
                    start = node.getAttr(key);
                    if (Util_1.Util._isArray(end)) {
                        diff = [];
                        len = Math.max(end.length, start.length);
                        if (key === "points" && end.length !== start.length) if (end.length > start.length) {
                            trueStart = start;
                            start = Util_1.Util._prepareArrayForTween(start, end, node.closed());
                        } else {
                            trueEnd = end;
                            end = Util_1.Util._prepareArrayForTween(end, start, node.closed());
                        }
                        if (key.indexOf("fill") === 0) for (n = 0; n < len; n++) if (n % 2 === 0) diff.push(end[n] - start[n]); else {
                            var startRGBA = Util_1.Util.colorToRGBA(start[n]);
                            endRGBA = Util_1.Util.colorToRGBA(end[n]);
                            start[n] = startRGBA;
                            diff.push({
                                r: endRGBA.r - startRGBA.r,
                                g: endRGBA.g - startRGBA.g,
                                b: endRGBA.b - startRGBA.b,
                                a: endRGBA.a - startRGBA.a
                            });
                        } else for (n = 0; n < len; n++) diff.push(end[n] - start[n]);
                    } else if (colorAttrs.indexOf(key) !== -1) {
                        start = Util_1.Util.colorToRGBA(start);
                        endRGBA = Util_1.Util.colorToRGBA(end);
                        diff = {
                            r: endRGBA.r - start.r,
                            g: endRGBA.g - start.g,
                            b: endRGBA.b - start.b,
                            a: endRGBA.a - start.a
                        };
                    } else diff = end - start;
                    Tween.attrs[nodeId][this._id][key] = {
                        start,
                        diff,
                        end,
                        trueEnd,
                        trueStart
                    };
                    Tween.tweens[nodeId][key] = this._id;
                };
                Tween.prototype._tweenFunc = function(i) {
                    var key, attr, start, diff, newVal, n, len, end, node = this.node, attrs = Tween.attrs[node._id][this._id];
                    for (key in attrs) {
                        attr = attrs[key];
                        start = attr.start;
                        diff = attr.diff;
                        end = attr.end;
                        if (Util_1.Util._isArray(start)) {
                            newVal = [];
                            len = Math.max(start.length, end.length);
                            if (key.indexOf("fill") === 0) for (n = 0; n < len; n++) if (n % 2 === 0) newVal.push((start[n] || 0) + diff[n] * i); else newVal.push("rgba(" + Math.round(start[n].r + diff[n].r * i) + "," + Math.round(start[n].g + diff[n].g * i) + "," + Math.round(start[n].b + diff[n].b * i) + "," + (start[n].a + diff[n].a * i) + ")"); else for (n = 0; n < len; n++) newVal.push((start[n] || 0) + diff[n] * i);
                        } else if (colorAttrs.indexOf(key) !== -1) newVal = "rgba(" + Math.round(start.r + diff.r * i) + "," + Math.round(start.g + diff.g * i) + "," + Math.round(start.b + diff.b * i) + "," + (start.a + diff.a * i) + ")"; else newVal = start + diff * i;
                        node.setAttr(key, newVal);
                    }
                };
                Tween.prototype._addListeners = function() {
                    var _this = this;
                    this.tween.onPlay = function() {
                        _this.anim.start();
                    };
                    this.tween.onReverse = function() {
                        _this.anim.start();
                    };
                    this.tween.onPause = function() {
                        _this.anim.stop();
                    };
                    this.tween.onFinish = function() {
                        var node = _this.node;
                        var attrs = Tween.attrs[node._id][_this._id];
                        if (attrs.points && attrs.points.trueEnd) node.setAttr("points", attrs.points.trueEnd);
                        if (_this.onFinish) _this.onFinish.call(_this);
                    };
                    this.tween.onReset = function() {
                        var node = _this.node;
                        var attrs = Tween.attrs[node._id][_this._id];
                        if (attrs.points && attrs.points.trueStart) node.points(attrs.points.trueStart);
                        if (_this.onReset) _this.onReset();
                    };
                };
                Tween.prototype.play = function() {
                    this.tween.play();
                    return this;
                };
                Tween.prototype.reverse = function() {
                    this.tween.reverse();
                    return this;
                };
                Tween.prototype.reset = function() {
                    this.tween.reset();
                    return this;
                };
                Tween.prototype.seek = function(t) {
                    this.tween.seek(t * 1e3);
                    return this;
                };
                Tween.prototype.pause = function() {
                    this.tween.pause();
                    return this;
                };
                Tween.prototype.finish = function() {
                    this.tween.finish();
                    return this;
                };
                Tween.prototype.destroy = function() {
                    var key, nodeId = this.node._id, thisId = this._id, attrs = Tween.tweens[nodeId];
                    this.pause();
                    for (key in attrs) delete Tween.tweens[nodeId][key];
                    delete Tween.attrs[nodeId][thisId];
                };
                Tween.attrs = {};
                Tween.tweens = {};
                return Tween;
            }();
            exports.Tween = Tween;
            Node_1.Node.prototype.to = function(params) {
                var onFinish = params.onFinish;
                params.node = this;
                params.onFinish = function() {
                    this.destroy();
                    if (onFinish) onFinish();
                };
                var tween = new Tween(params);
                tween.play();
            };
            exports.Easings = {
                BackEaseIn: function(t, b, c, d) {
                    var s = 1.70158;
                    return c * (t /= d) * t * ((s + 1) * t - s) + b;
                },
                BackEaseOut: function(t, b, c, d) {
                    var s = 1.70158;
                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                },
                BackEaseInOut: function(t, b, c, d) {
                    var s = 1.70158;
                    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
                    return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
                },
                ElasticEaseIn: function(t, b, c, d, a, p) {
                    var s = 0;
                    if (t === 0) return b;
                    if ((t /= d) === 1) return b + c;
                    if (!p) p = d * .3;
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    } else s = p / (2 * Math.PI) * Math.asin(c / a);
                    return -a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) + b;
                },
                ElasticEaseOut: function(t, b, c, d, a, p) {
                    var s = 0;
                    if (t === 0) return b;
                    if ((t /= d) === 1) return b + c;
                    if (!p) p = d * .3;
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    } else s = p / (2 * Math.PI) * Math.asin(c / a);
                    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
                },
                ElasticEaseInOut: function(t, b, c, d, a, p) {
                    var s = 0;
                    if (t === 0) return b;
                    if ((t /= d / 2) === 2) return b + c;
                    if (!p) p = d * (.3 * 1.5);
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    } else s = p / (2 * Math.PI) * Math.asin(c / a);
                    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
                },
                BounceEaseOut: function(t, b, c, d) {
                    if ((t /= d) < 1 / 2.75) return c * (7.5625 * t * t) + b; else if (t < 2 / 2.75) return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b; else if (t < 2.5 / 2.75) return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b; else return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
                },
                BounceEaseIn: function(t, b, c, d) {
                    return c - exports.Easings.BounceEaseOut(d - t, 0, c, d) + b;
                },
                BounceEaseInOut: function(t, b, c, d) {
                    if (t < d / 2) return exports.Easings.BounceEaseIn(t * 2, 0, c, d) * .5 + b; else return exports.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
                },
                EaseIn: function(t, b, c, d) {
                    return c * (t /= d) * t + b;
                },
                EaseOut: function(t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                EaseInOut: function(t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                    return -c / 2 * (--t * (t - 2) - 1) + b;
                },
                StrongEaseIn: function(t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                StrongEaseOut: function(t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                StrongEaseInOut: function(t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                },
                Linear: function(t, b, c, d) {
                    return c * t / d + b;
                }
            };
        },
        5520: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Global_1 = __webpack_require__(9427);
            var Collection = function() {
                function Collection() {}
                Collection.toCollection = function(arr) {
                    var n, collection = new Collection, len = arr.length;
                    for (n = 0; n < len; n++) collection.push(arr[n]);
                    return collection;
                };
                Collection._mapMethod = function(methodName) {
                    Collection.prototype[methodName] = function() {
                        var i, len = this.length;
                        var args = [].slice.call(arguments);
                        for (i = 0; i < len; i++) this[i][methodName].apply(this[i], args);
                        return this;
                    };
                };
                Collection.mapMethods = function(constructor) {
                    var prot = constructor.prototype;
                    for (var methodName in prot) Collection._mapMethod(methodName);
                };
                return Collection;
            }();
            exports.Collection = Collection;
            Collection.prototype = [];
            Collection.prototype.each = function(func) {
                for (var n = 0; n < this.length; n++) func(this[n], n);
            };
            Collection.prototype.toArray = function() {
                var n, arr = [], len = this.length;
                for (n = 0; n < len; n++) arr.push(this[n]);
                return arr;
            };
            var Transform = function() {
                function Transform(m) {
                    if (m === void 0) m = [ 1, 0, 0, 1, 0, 0 ];
                    this.m = m && m.slice() || [ 1, 0, 0, 1, 0, 0 ];
                }
                Transform.prototype.copy = function() {
                    return new Transform(this.m);
                };
                Transform.prototype.point = function(point) {
                    var m = this.m;
                    return {
                        x: m[0] * point.x + m[2] * point.y + m[4],
                        y: m[1] * point.x + m[3] * point.y + m[5]
                    };
                };
                Transform.prototype.translate = function(x, y) {
                    this.m[4] += this.m[0] * x + this.m[2] * y;
                    this.m[5] += this.m[1] * x + this.m[3] * y;
                    return this;
                };
                Transform.prototype.scale = function(sx, sy) {
                    this.m[0] *= sx;
                    this.m[1] *= sx;
                    this.m[2] *= sy;
                    this.m[3] *= sy;
                    return this;
                };
                Transform.prototype.rotate = function(rad) {
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var m11 = this.m[0] * c + this.m[2] * s;
                    var m12 = this.m[1] * c + this.m[3] * s;
                    var m21 = this.m[0] * -s + this.m[2] * c;
                    var m22 = this.m[1] * -s + this.m[3] * c;
                    this.m[0] = m11;
                    this.m[1] = m12;
                    this.m[2] = m21;
                    this.m[3] = m22;
                    return this;
                };
                Transform.prototype.getTranslation = function() {
                    return {
                        x: this.m[4],
                        y: this.m[5]
                    };
                };
                Transform.prototype.skew = function(sx, sy) {
                    var m11 = this.m[0] + this.m[2] * sy;
                    var m12 = this.m[1] + this.m[3] * sy;
                    var m21 = this.m[2] + this.m[0] * sx;
                    var m22 = this.m[3] + this.m[1] * sx;
                    this.m[0] = m11;
                    this.m[1] = m12;
                    this.m[2] = m21;
                    this.m[3] = m22;
                    return this;
                };
                Transform.prototype.multiply = function(matrix) {
                    var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
                    var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
                    var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
                    var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
                    var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
                    var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
                    this.m[0] = m11;
                    this.m[1] = m12;
                    this.m[2] = m21;
                    this.m[3] = m22;
                    this.m[4] = dx;
                    this.m[5] = dy;
                    return this;
                };
                Transform.prototype.invert = function() {
                    var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
                    var m0 = this.m[3] * d;
                    var m1 = -this.m[1] * d;
                    var m2 = -this.m[2] * d;
                    var m3 = this.m[0] * d;
                    var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
                    var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
                    this.m[0] = m0;
                    this.m[1] = m1;
                    this.m[2] = m2;
                    this.m[3] = m3;
                    this.m[4] = m4;
                    this.m[5] = m5;
                    return this;
                };
                Transform.prototype.getMatrix = function() {
                    return this.m;
                };
                Transform.prototype.setAbsolutePosition = function(x, y) {
                    var m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3], m4 = this.m[4], m5 = this.m[5], yt = (m0 * (y - m5) - m1 * (x - m4)) / (m0 * m3 - m1 * m2), xt = (x - m4 - m2 * yt) / m0;
                    return this.translate(xt, yt);
                };
                Transform.prototype.decompose = function() {
                    var a = this.m[0];
                    var b = this.m[1];
                    var c = this.m[2];
                    var d = this.m[3];
                    var e = this.m[4];
                    var f = this.m[5];
                    var delta = a * d - b * c;
                    var result = {
                        x: e,
                        y: f,
                        rotation: 0,
                        scaleX: 0,
                        scaleY: 0,
                        skewX: 0,
                        skewY: 0
                    };
                    if (a != 0 || b != 0) {
                        var r = Math.sqrt(a * a + b * b);
                        result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
                        result.scaleX = r;
                        result.scaleY = delta / r;
                        result.skewX = (a * c + b * d) / delta;
                        result.skewY = 0;
                    } else if (c != 0 || d != 0) {
                        var s = Math.sqrt(c * c + d * d);
                        result.rotation = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
                        result.scaleX = delta / s;
                        result.scaleY = s;
                        result.skewX = 0;
                        result.skewY = (a * c + b * d) / delta;
                    }
                    result.rotation = exports.Util._getRotation(result.rotation);
                    return result;
                };
                return Transform;
            }();
            exports.Transform = Transform;
            var OBJECT_ARRAY = "[object Array]", OBJECT_NUMBER = "[object Number]", OBJECT_STRING = "[object String]", OBJECT_BOOLEAN = "[object Boolean]", PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH = "#", EMPTY_STRING = "", ZERO = "0", KONVA_WARNING = "Konva warning: ", KONVA_ERROR = "Konva error: ", RGB_PAREN = "rgb(", COLORS = {
                aliceblue: [ 240, 248, 255 ],
                antiquewhite: [ 250, 235, 215 ],
                aqua: [ 0, 255, 255 ],
                aquamarine: [ 127, 255, 212 ],
                azure: [ 240, 255, 255 ],
                beige: [ 245, 245, 220 ],
                bisque: [ 255, 228, 196 ],
                black: [ 0, 0, 0 ],
                blanchedalmond: [ 255, 235, 205 ],
                blue: [ 0, 0, 255 ],
                blueviolet: [ 138, 43, 226 ],
                brown: [ 165, 42, 42 ],
                burlywood: [ 222, 184, 135 ],
                cadetblue: [ 95, 158, 160 ],
                chartreuse: [ 127, 255, 0 ],
                chocolate: [ 210, 105, 30 ],
                coral: [ 255, 127, 80 ],
                cornflowerblue: [ 100, 149, 237 ],
                cornsilk: [ 255, 248, 220 ],
                crimson: [ 220, 20, 60 ],
                cyan: [ 0, 255, 255 ],
                darkblue: [ 0, 0, 139 ],
                darkcyan: [ 0, 139, 139 ],
                darkgoldenrod: [ 184, 132, 11 ],
                darkgray: [ 169, 169, 169 ],
                darkgreen: [ 0, 100, 0 ],
                darkgrey: [ 169, 169, 169 ],
                darkkhaki: [ 189, 183, 107 ],
                darkmagenta: [ 139, 0, 139 ],
                darkolivegreen: [ 85, 107, 47 ],
                darkorange: [ 255, 140, 0 ],
                darkorchid: [ 153, 50, 204 ],
                darkred: [ 139, 0, 0 ],
                darksalmon: [ 233, 150, 122 ],
                darkseagreen: [ 143, 188, 143 ],
                darkslateblue: [ 72, 61, 139 ],
                darkslategray: [ 47, 79, 79 ],
                darkslategrey: [ 47, 79, 79 ],
                darkturquoise: [ 0, 206, 209 ],
                darkviolet: [ 148, 0, 211 ],
                deeppink: [ 255, 20, 147 ],
                deepskyblue: [ 0, 191, 255 ],
                dimgray: [ 105, 105, 105 ],
                dimgrey: [ 105, 105, 105 ],
                dodgerblue: [ 30, 144, 255 ],
                firebrick: [ 178, 34, 34 ],
                floralwhite: [ 255, 255, 240 ],
                forestgreen: [ 34, 139, 34 ],
                fuchsia: [ 255, 0, 255 ],
                gainsboro: [ 220, 220, 220 ],
                ghostwhite: [ 248, 248, 255 ],
                gold: [ 255, 215, 0 ],
                goldenrod: [ 218, 165, 32 ],
                gray: [ 128, 128, 128 ],
                green: [ 0, 128, 0 ],
                greenyellow: [ 173, 255, 47 ],
                grey: [ 128, 128, 128 ],
                honeydew: [ 240, 255, 240 ],
                hotpink: [ 255, 105, 180 ],
                indianred: [ 205, 92, 92 ],
                indigo: [ 75, 0, 130 ],
                ivory: [ 255, 255, 240 ],
                khaki: [ 240, 230, 140 ],
                lavender: [ 230, 230, 250 ],
                lavenderblush: [ 255, 240, 245 ],
                lawngreen: [ 124, 252, 0 ],
                lemonchiffon: [ 255, 250, 205 ],
                lightblue: [ 173, 216, 230 ],
                lightcoral: [ 240, 128, 128 ],
                lightcyan: [ 224, 255, 255 ],
                lightgoldenrodyellow: [ 250, 250, 210 ],
                lightgray: [ 211, 211, 211 ],
                lightgreen: [ 144, 238, 144 ],
                lightgrey: [ 211, 211, 211 ],
                lightpink: [ 255, 182, 193 ],
                lightsalmon: [ 255, 160, 122 ],
                lightseagreen: [ 32, 178, 170 ],
                lightskyblue: [ 135, 206, 250 ],
                lightslategray: [ 119, 136, 153 ],
                lightslategrey: [ 119, 136, 153 ],
                lightsteelblue: [ 176, 196, 222 ],
                lightyellow: [ 255, 255, 224 ],
                lime: [ 0, 255, 0 ],
                limegreen: [ 50, 205, 50 ],
                linen: [ 250, 240, 230 ],
                magenta: [ 255, 0, 255 ],
                maroon: [ 128, 0, 0 ],
                mediumaquamarine: [ 102, 205, 170 ],
                mediumblue: [ 0, 0, 205 ],
                mediumorchid: [ 186, 85, 211 ],
                mediumpurple: [ 147, 112, 219 ],
                mediumseagreen: [ 60, 179, 113 ],
                mediumslateblue: [ 123, 104, 238 ],
                mediumspringgreen: [ 0, 250, 154 ],
                mediumturquoise: [ 72, 209, 204 ],
                mediumvioletred: [ 199, 21, 133 ],
                midnightblue: [ 25, 25, 112 ],
                mintcream: [ 245, 255, 250 ],
                mistyrose: [ 255, 228, 225 ],
                moccasin: [ 255, 228, 181 ],
                navajowhite: [ 255, 222, 173 ],
                navy: [ 0, 0, 128 ],
                oldlace: [ 253, 245, 230 ],
                olive: [ 128, 128, 0 ],
                olivedrab: [ 107, 142, 35 ],
                orange: [ 255, 165, 0 ],
                orangered: [ 255, 69, 0 ],
                orchid: [ 218, 112, 214 ],
                palegoldenrod: [ 238, 232, 170 ],
                palegreen: [ 152, 251, 152 ],
                paleturquoise: [ 175, 238, 238 ],
                palevioletred: [ 219, 112, 147 ],
                papayawhip: [ 255, 239, 213 ],
                peachpuff: [ 255, 218, 185 ],
                peru: [ 205, 133, 63 ],
                pink: [ 255, 192, 203 ],
                plum: [ 221, 160, 203 ],
                powderblue: [ 176, 224, 230 ],
                purple: [ 128, 0, 128 ],
                rebeccapurple: [ 102, 51, 153 ],
                red: [ 255, 0, 0 ],
                rosybrown: [ 188, 143, 143 ],
                royalblue: [ 65, 105, 225 ],
                saddlebrown: [ 139, 69, 19 ],
                salmon: [ 250, 128, 114 ],
                sandybrown: [ 244, 164, 96 ],
                seagreen: [ 46, 139, 87 ],
                seashell: [ 255, 245, 238 ],
                sienna: [ 160, 82, 45 ],
                silver: [ 192, 192, 192 ],
                skyblue: [ 135, 206, 235 ],
                slateblue: [ 106, 90, 205 ],
                slategray: [ 119, 128, 144 ],
                slategrey: [ 119, 128, 144 ],
                snow: [ 255, 255, 250 ],
                springgreen: [ 0, 255, 127 ],
                steelblue: [ 70, 130, 180 ],
                tan: [ 210, 180, 140 ],
                teal: [ 0, 128, 128 ],
                thistle: [ 216, 191, 216 ],
                transparent: [ 255, 255, 255, 0 ],
                tomato: [ 255, 99, 71 ],
                turquoise: [ 64, 224, 208 ],
                violet: [ 238, 130, 238 ],
                wheat: [ 245, 222, 179 ],
                white: [ 255, 255, 255 ],
                whitesmoke: [ 245, 245, 245 ],
                yellow: [ 255, 255, 0 ],
                yellowgreen: [ 154, 205, 5 ]
            }, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/, animQueue = [];
            exports.Util = {
                _isElement: function(obj) {
                    return !!(obj && obj.nodeType == 1);
                },
                _isFunction: function(obj) {
                    return !!(obj && obj.constructor && obj.call && obj.apply);
                },
                _isPlainObject: function(obj) {
                    return !!obj && obj.constructor === Object;
                },
                _isArray: function(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
                },
                _isNumber: function(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_NUMBER && !isNaN(obj) && isFinite(obj);
                },
                _isString: function(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_STRING;
                },
                _isBoolean: function(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
                },
                isObject: function(val) {
                    return val instanceof Object;
                },
                isValidSelector: function(selector) {
                    if (typeof selector !== "string") return false;
                    var firstChar = selector[0];
                    return firstChar === "#" || firstChar === "." || firstChar === firstChar.toUpperCase();
                },
                _sign: function(number) {
                    if (number === 0) return 0;
                    if (number > 0) return 1; else return -1;
                },
                requestAnimFrame: function(callback) {
                    animQueue.push(callback);
                    if (animQueue.length === 1) requestAnimationFrame((function() {
                        var queue = animQueue;
                        animQueue = [];
                        queue.forEach((function(cb) {
                            cb();
                        }));
                    }));
                },
                createCanvasElement: function() {
                    var canvas = document.createElement("canvas");
                    try {
                        canvas.style = canvas.style || {};
                    } catch (e) {}
                    return canvas;
                },
                createImageElement: function() {
                    return document.createElement("img");
                },
                _isInDocument: function(el) {
                    while (el = el.parentNode) if (el == document) return true;
                    return false;
                },
                _simplifyArray: function(arr) {
                    var n, val, retArr = [], len = arr.length, util = exports.Util;
                    for (n = 0; n < len; n++) {
                        val = arr[n];
                        if (util._isNumber(val)) val = Math.round(val * 1e3) / 1e3; else if (!util._isString(val)) val = val.toString();
                        retArr.push(val);
                    }
                    return retArr;
                },
                _urlToImage: function(url, callback) {
                    var imageObj = new Global_1.glob.Image;
                    imageObj.onload = function() {
                        callback(imageObj);
                    };
                    imageObj.src = url;
                },
                _rgbToHex: function(r, g, b) {
                    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                },
                _hexToRgb: function(hex) {
                    hex = hex.replace(HASH, EMPTY_STRING);
                    var bigint = parseInt(hex, 16);
                    return {
                        r: bigint >> 16 & 255,
                        g: bigint >> 8 & 255,
                        b: bigint & 255
                    };
                },
                getRandomColor: function() {
                    var randColor = (Math.random() * 16777215 << 0).toString(16);
                    while (randColor.length < 6) randColor = ZERO + randColor;
                    return HASH + randColor;
                },
                get: function(val, def) {
                    if (val === void 0) return def; else return val;
                },
                getRGB: function(color) {
                    var rgb;
                    if (color in COLORS) {
                        rgb = COLORS[color];
                        return {
                            r: rgb[0],
                            g: rgb[1],
                            b: rgb[2]
                        };
                    } else if (color[0] === HASH) return this._hexToRgb(color.substring(1)); else if (color.substr(0, 4) === RGB_PAREN) {
                        rgb = RGB_REGEX.exec(color.replace(/ /g, ""));
                        return {
                            r: parseInt(rgb[1], 10),
                            g: parseInt(rgb[2], 10),
                            b: parseInt(rgb[3], 10)
                        };
                    } else return {
                        r: 0,
                        g: 0,
                        b: 0
                    };
                },
                colorToRGBA: function(str) {
                    str = str || "black";
                    return exports.Util._namedColorToRBA(str) || exports.Util._hex3ColorToRGBA(str) || exports.Util._hex6ColorToRGBA(str) || exports.Util._rgbColorToRGBA(str) || exports.Util._rgbaColorToRGBA(str) || exports.Util._hslColorToRGBA(str);
                },
                _namedColorToRBA: function(str) {
                    var c = COLORS[str.toLowerCase()];
                    if (!c) return null;
                    return {
                        r: c[0],
                        g: c[1],
                        b: c[2],
                        a: 1
                    };
                },
                _rgbColorToRGBA: function(str) {
                    if (str.indexOf("rgb(") === 0) {
                        str = str.match(/rgb\(([^)]+)\)/)[1];
                        var parts = str.split(/ *, */).map(Number);
                        return {
                            r: parts[0],
                            g: parts[1],
                            b: parts[2],
                            a: 1
                        };
                    }
                },
                _rgbaColorToRGBA: function(str) {
                    if (str.indexOf("rgba(") === 0) {
                        str = str.match(/rgba\(([^)]+)\)/)[1];
                        var parts = str.split(/ *, */).map(Number);
                        return {
                            r: parts[0],
                            g: parts[1],
                            b: parts[2],
                            a: parts[3]
                        };
                    }
                },
                _hex6ColorToRGBA: function(str) {
                    if (str[0] === "#" && str.length === 7) return {
                        r: parseInt(str.slice(1, 3), 16),
                        g: parseInt(str.slice(3, 5), 16),
                        b: parseInt(str.slice(5, 7), 16),
                        a: 1
                    };
                },
                _hex3ColorToRGBA: function(str) {
                    if (str[0] === "#" && str.length === 4) return {
                        r: parseInt(str[1] + str[1], 16),
                        g: parseInt(str[2] + str[2], 16),
                        b: parseInt(str[3] + str[3], 16),
                        a: 1
                    };
                },
                _hslColorToRGBA: function(str) {
                    if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
                        var _a = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str), hsl = (_a[0], _a.slice(1));
                        var h = Number(hsl[0]) / 360;
                        var s = Number(hsl[1]) / 100;
                        var l = Number(hsl[2]) / 100;
                        var t2 = void 0;
                        var t3 = void 0;
                        var val = void 0;
                        if (s === 0) {
                            val = l * 255;
                            return {
                                r: Math.round(val),
                                g: Math.round(val),
                                b: Math.round(val),
                                a: 1
                            };
                        }
                        if (l < .5) t2 = l * (1 + s); else t2 = l + s - l * s;
                        var t1 = 2 * l - t2;
                        var rgb = [ 0, 0, 0 ];
                        for (var i = 0; i < 3; i++) {
                            t3 = h + 1 / 3 * -(i - 1);
                            if (t3 < 0) t3++;
                            if (t3 > 1) t3--;
                            if (6 * t3 < 1) val = t1 + (t2 - t1) * 6 * t3; else if (2 * t3 < 1) val = t2; else if (3 * t3 < 2) val = t1 + (t2 - t1) * (2 / 3 - t3) * 6; else val = t1;
                            rgb[i] = val * 255;
                        }
                        return {
                            r: Math.round(rgb[0]),
                            g: Math.round(rgb[1]),
                            b: Math.round(rgb[2]),
                            a: 1
                        };
                    }
                },
                haveIntersection: function(r1, r2) {
                    return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
                },
                cloneObject: function(obj) {
                    var retObj = {};
                    for (var key in obj) if (this._isPlainObject(obj[key])) retObj[key] = this.cloneObject(obj[key]); else if (this._isArray(obj[key])) retObj[key] = this.cloneArray(obj[key]); else retObj[key] = obj[key];
                    return retObj;
                },
                cloneArray: function(arr) {
                    return arr.slice(0);
                },
                _degToRad: function(deg) {
                    return deg * PI_OVER_DEG180;
                },
                _radToDeg: function(rad) {
                    return rad * DEG180_OVER_PI;
                },
                _getRotation: function(radians) {
                    return Global_1.Konva.angleDeg ? exports.Util._radToDeg(radians) : radians;
                },
                _capitalize: function(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                },
                throw: function(str) {
                    throw new Error(KONVA_ERROR + str);
                },
                error: function(str) {
                    console.error(KONVA_ERROR + str);
                },
                warn: function(str) {
                    if (!Global_1.Konva.showWarnings) return;
                    console.warn(KONVA_WARNING + str);
                },
                extend: function(child, parent) {
                    function Ctor() {
                        this.constructor = child;
                    }
                    Ctor.prototype = parent.prototype;
                    var oldProto = child.prototype;
                    child.prototype = new Ctor;
                    for (var key in oldProto) if (oldProto.hasOwnProperty(key)) child.prototype[key] = oldProto[key];
                    child.__super__ = parent.prototype;
                    child.super = parent;
                },
                _getControlPoints: function(x0, y0, x1, y1, x2, y2, t) {
                    var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = t * d01 / (d01 + d12), fb = t * d12 / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
                    return [ p1x, p1y, p2x, p2y ];
                },
                _expandPoints: function(p, tension) {
                    var n, cp, len = p.length, allPoints = [];
                    for (n = 2; n < len - 2; n += 2) {
                        cp = exports.Util._getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
                        allPoints.push(cp[0]);
                        allPoints.push(cp[1]);
                        allPoints.push(p[n]);
                        allPoints.push(p[n + 1]);
                        allPoints.push(cp[2]);
                        allPoints.push(cp[3]);
                    }
                    return allPoints;
                },
                each: function(obj, func) {
                    for (var key in obj) func(key, obj[key]);
                },
                _inRange: function(val, left, right) {
                    return left <= val && val < right;
                },
                _getProjectionToSegment: function(x1, y1, x2, y2, x3, y3) {
                    var x, y, dist;
                    var pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
                    if (pd2 == 0) {
                        x = x1;
                        y = y1;
                        dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
                    } else {
                        var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
                        if (u < 0) {
                            x = x1;
                            y = y1;
                            dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
                        } else if (u > 1) {
                            x = x2;
                            y = y2;
                            dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
                        } else {
                            x = x1 + u * (x2 - x1);
                            y = y1 + u * (y2 - y1);
                            dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
                        }
                    }
                    return [ x, y, dist ];
                },
                _getProjectionToLine: function(pt, line, isClosed) {
                    var pc = exports.Util.cloneObject(pt);
                    var dist = Number.MAX_VALUE;
                    line.forEach((function(p1, i) {
                        if (!isClosed && i === line.length - 1) return;
                        var p2 = line[(i + 1) % line.length];
                        var proj = exports.Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
                        var px = proj[0], py = proj[1], pdist = proj[2];
                        if (pdist < dist) {
                            pc.x = px;
                            pc.y = py;
                            dist = pdist;
                        }
                    }));
                    return pc;
                },
                _prepareArrayForTween: function(startArray, endArray, isClosed) {
                    var n, start = [], end = [];
                    if (startArray.length > endArray.length) {
                        var temp = endArray;
                        endArray = startArray;
                        startArray = temp;
                    }
                    for (n = 0; n < startArray.length; n += 2) start.push({
                        x: startArray[n],
                        y: startArray[n + 1]
                    });
                    for (n = 0; n < endArray.length; n += 2) end.push({
                        x: endArray[n],
                        y: endArray[n + 1]
                    });
                    var newStart = [];
                    end.forEach((function(point) {
                        var pr = exports.Util._getProjectionToLine(point, start, isClosed);
                        newStart.push(pr.x);
                        newStart.push(pr.y);
                    }));
                    return newStart;
                },
                _prepareToStringify: function(obj) {
                    var desc;
                    obj.visitedByCircularReferenceRemoval = true;
                    for (var key in obj) {
                        if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == "object")) continue;
                        desc = Object.getOwnPropertyDescriptor(obj, key);
                        if (obj[key].visitedByCircularReferenceRemoval || exports.Util._isElement(obj[key])) if (desc.configurable) delete obj[key]; else return null; else if (exports.Util._prepareToStringify(obj[key]) === null) if (desc.configurable) delete obj[key]; else return null;
                    }
                    delete obj.visitedByCircularReferenceRemoval;
                    return obj;
                },
                _assign: function(target, source) {
                    for (var key in source) target[key] = source[key];
                    return target;
                },
                _getFirstPointerId: function(evt) {
                    if (!evt.touches) return 999; else return evt.changedTouches[0].identifier;
                }
            };
        },
        4783: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Global_1 = __webpack_require__(9427);
            var Util_1 = __webpack_require__(5520);
            function _formatValue(val) {
                if (Util_1.Util._isString(val)) return '"' + val + '"';
                if (Object.prototype.toString.call(val) === "[object Number]") return val;
                if (Util_1.Util._isBoolean(val)) return val;
                return Object.prototype.toString.call(val);
            }
            function RGBComponent(val) {
                if (val > 255) return 255; else if (val < 0) return 0;
                return Math.round(val);
            }
            exports.RGBComponent = RGBComponent;
            function alphaComponent(val) {
                if (val > 1) return 1; else if (val < 1e-4) return 1e-4;
                return val;
            }
            exports.alphaComponent = alphaComponent;
            function getNumberValidator() {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    if (!Util_1.Util._isNumber(val)) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a number.');
                    return val;
                };
            }
            exports.getNumberValidator = getNumberValidator;
            function getNumberOrAutoValidator() {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    var isNumber = Util_1.Util._isNumber(val);
                    var isAuto = val === "auto";
                    if (!(isNumber || isAuto)) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a number or "auto".');
                    return val;
                };
            }
            exports.getNumberOrAutoValidator = getNumberOrAutoValidator;
            function getStringValidator() {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    if (!Util_1.Util._isString(val)) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a string.');
                    return val;
                };
            }
            exports.getStringValidator = getStringValidator;
            function getFunctionValidator() {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    if (!Util_1.Util._isFunction(val)) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a function.');
                    return val;
                };
            }
            exports.getFunctionValidator = getFunctionValidator;
            function getNumberArrayValidator() {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    if (!Util_1.Util._isArray(val)) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a array of numbers.'); else val.forEach((function(item) {
                        if (!Util_1.Util._isNumber(item)) Util_1.Util.warn('"' + attr + '" attribute has non numeric element ' + item + ". Make sure that all elements are numbers.");
                    }));
                    return val;
                };
            }
            exports.getNumberArrayValidator = getNumberArrayValidator;
            function getBooleanValidator() {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    var isBool = val === true || val === false;
                    if (!isBool) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a boolean.');
                    return val;
                };
            }
            exports.getBooleanValidator = getBooleanValidator;
            function getComponentValidator(components) {
                if (Global_1.Konva.isUnminified) return function(val, attr) {
                    if (!Util_1.Util.isObject(val)) Util_1.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be an object with properties ' + components);
                    return val;
                };
            }
            exports.getComponentValidator = getComponentValidator;
        },
        3668: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Global_1 = __webpack_require__(9427);
            var Util_1 = __webpack_require__(5520);
            var Node_1 = __webpack_require__(5924);
            var Container_1 = __webpack_require__(9957);
            var Stage_1 = __webpack_require__(6936);
            var Layer_1 = __webpack_require__(1647);
            var FastLayer_1 = __webpack_require__(21);
            var Group_1 = __webpack_require__(9625);
            var DragAndDrop_1 = __webpack_require__(7752);
            var Shape_1 = __webpack_require__(9071);
            var Animation_1 = __webpack_require__(9500);
            var Tween_1 = __webpack_require__(7733);
            var Context_1 = __webpack_require__(8265);
            var Canvas_1 = __webpack_require__(7544);
            exports.Konva = Util_1.Util._assign(Global_1.Konva, {
                Collection: Util_1.Collection,
                Util: Util_1.Util,
                Transform: Util_1.Transform,
                Node: Node_1.Node,
                ids: Node_1.ids,
                names: Node_1.names,
                Container: Container_1.Container,
                Stage: Stage_1.Stage,
                stages: Stage_1.stages,
                Layer: Layer_1.Layer,
                FastLayer: FastLayer_1.FastLayer,
                Group: Group_1.Group,
                DD: DragAndDrop_1.DD,
                Shape: Shape_1.Shape,
                shapes: Shape_1.shapes,
                Animation: Animation_1.Animation,
                Tween: Tween_1.Tween,
                Easings: Tween_1.Easings,
                Context: Context_1.Context,
                Canvas: Canvas_1.Canvas
            });
        },
        6970: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            0;
            var _CoreInternals_1 = __webpack_require__(3668);
            var Arc_1 = __webpack_require__(1057);
            var Arrow_1 = __webpack_require__(9548);
            var Circle_1 = __webpack_require__(101);
            var Ellipse_1 = __webpack_require__(759);
            var Image_1 = __webpack_require__(5324);
            var Label_1 = __webpack_require__(9887);
            var Line_1 = __webpack_require__(2463);
            var Path_1 = __webpack_require__(2698);
            var Rect_1 = __webpack_require__(3815);
            var RegularPolygon_1 = __webpack_require__(2679);
            var Ring_1 = __webpack_require__(6527);
            var Sprite_1 = __webpack_require__(4096);
            var Star_1 = __webpack_require__(1869);
            var Text_1 = __webpack_require__(6658);
            var TextPath_1 = __webpack_require__(9421);
            var Transformer_1 = __webpack_require__(7214);
            var Wedge_1 = __webpack_require__(7589);
            var Blur_1 = __webpack_require__(3689);
            var Brighten_1 = __webpack_require__(3927);
            var Contrast_1 = __webpack_require__(1726);
            var Emboss_1 = __webpack_require__(2323);
            var Enhance_1 = __webpack_require__(2068);
            var Grayscale_1 = __webpack_require__(2957);
            var HSL_1 = __webpack_require__(1593);
            var HSV_1 = __webpack_require__(447);
            var Invert_1 = __webpack_require__(1752);
            var Kaleidoscope_1 = __webpack_require__(2085);
            var Mask_1 = __webpack_require__(5788);
            var Noise_1 = __webpack_require__(2108);
            var Pixelate_1 = __webpack_require__(6896);
            var Posterize_1 = __webpack_require__(6535);
            var RGB_1 = __webpack_require__(2285);
            var RGBA_1 = __webpack_require__(9858);
            var Sepia_1 = __webpack_require__(7780);
            var Solarize_1 = __webpack_require__(9937);
            var Threshold_1 = __webpack_require__(6169);
            exports.k = _CoreInternals_1.Konva.Util._assign(_CoreInternals_1.Konva, {
                Arc: Arc_1.Arc,
                Arrow: Arrow_1.Arrow,
                Circle: Circle_1.Circle,
                Ellipse: Ellipse_1.Ellipse,
                Image: Image_1.Image,
                Label: Label_1.Label,
                Tag: Label_1.Tag,
                Line: Line_1.Line,
                Path: Path_1.Path,
                Rect: Rect_1.Rect,
                RegularPolygon: RegularPolygon_1.RegularPolygon,
                Ring: Ring_1.Ring,
                Sprite: Sprite_1.Sprite,
                Star: Star_1.Star,
                Text: Text_1.Text,
                TextPath: TextPath_1.TextPath,
                Transformer: Transformer_1.Transformer,
                Wedge: Wedge_1.Wedge,
                Filters: {
                    Blur: Blur_1.Blur,
                    Brighten: Brighten_1.Brighten,
                    Contrast: Contrast_1.Contrast,
                    Emboss: Emboss_1.Emboss,
                    Enhance: Enhance_1.Enhance,
                    Grayscale: Grayscale_1.Grayscale,
                    HSL: HSL_1.HSL,
                    HSV: HSV_1.HSV,
                    Invert: Invert_1.Invert,
                    Kaleidoscope: Kaleidoscope_1.Kaleidoscope,
                    Mask: Mask_1.Mask,
                    Noise: Noise_1.Noise,
                    Pixelate: Pixelate_1.Pixelate,
                    Posterize: Posterize_1.Posterize,
                    RGB: RGB_1.RGB,
                    RGBA: RGBA_1.RGBA,
                    Sepia: Sepia_1.Sepia,
                    Solarize: Solarize_1.Solarize,
                    Threshold: Threshold_1.Threshold
                }
            });
        },
        3689: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            function BlurStack() {
                this.r = 0;
                this.g = 0;
                this.b = 0;
                this.a = 0;
                this.next = null;
            }
            var mul_table = [ 512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259 ];
            var shg_table = [ 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];
            function filterGaussBlurRGBA(imageData, radius) {
                var pixels = imageData.data, width = imageData.width, height = imageData.height;
                var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
                var div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2, stackStart = new BlurStack, stackEnd = null, stack = stackStart, stackIn = null, stackOut = null, mul_sum = mul_table[radius], shg_sum = shg_table[radius];
                for (i = 1; i < div; i++) {
                    stack = stack.next = new BlurStack;
                    if (i === radiusPlus1) stackEnd = stack;
                }
                stack.next = stackStart;
                yw = yi = 0;
                for (y = 0; y < height; y++) {
                    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
                    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
                    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
                    r_sum += sumFactor * pr;
                    g_sum += sumFactor * pg;
                    b_sum += sumFactor * pb;
                    a_sum += sumFactor * pa;
                    stack = stackStart;
                    for (i = 0; i < radiusPlus1; i++) {
                        stack.r = pr;
                        stack.g = pg;
                        stack.b = pb;
                        stack.a = pa;
                        stack = stack.next;
                    }
                    for (i = 1; i < radiusPlus1; i++) {
                        p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                        r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
                        g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
                        b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
                        a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
                        r_in_sum += pr;
                        g_in_sum += pg;
                        b_in_sum += pb;
                        a_in_sum += pa;
                        stack = stack.next;
                    }
                    stackIn = stackStart;
                    stackOut = stackEnd;
                    for (x = 0; x < width; x++) {
                        pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
                        if (pa !== 0) {
                            pa = 255 / pa;
                            pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
                            pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
                            pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
                        } else pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                        r_sum -= r_out_sum;
                        g_sum -= g_out_sum;
                        b_sum -= b_out_sum;
                        a_sum -= a_out_sum;
                        r_out_sum -= stackIn.r;
                        g_out_sum -= stackIn.g;
                        b_out_sum -= stackIn.b;
                        a_out_sum -= stackIn.a;
                        p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
                        r_in_sum += stackIn.r = pixels[p];
                        g_in_sum += stackIn.g = pixels[p + 1];
                        b_in_sum += stackIn.b = pixels[p + 2];
                        a_in_sum += stackIn.a = pixels[p + 3];
                        r_sum += r_in_sum;
                        g_sum += g_in_sum;
                        b_sum += b_in_sum;
                        a_sum += a_in_sum;
                        stackIn = stackIn.next;
                        r_out_sum += pr = stackOut.r;
                        g_out_sum += pg = stackOut.g;
                        b_out_sum += pb = stackOut.b;
                        a_out_sum += pa = stackOut.a;
                        r_in_sum -= pr;
                        g_in_sum -= pg;
                        b_in_sum -= pb;
                        a_in_sum -= pa;
                        stackOut = stackOut.next;
                        yi += 4;
                    }
                    yw += width;
                }
                for (x = 0; x < width; x++) {
                    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
                    yi = x << 2;
                    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
                    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
                    r_sum += sumFactor * pr;
                    g_sum += sumFactor * pg;
                    b_sum += sumFactor * pb;
                    a_sum += sumFactor * pa;
                    stack = stackStart;
                    for (i = 0; i < radiusPlus1; i++) {
                        stack.r = pr;
                        stack.g = pg;
                        stack.b = pb;
                        stack.a = pa;
                        stack = stack.next;
                    }
                    yp = width;
                    for (i = 1; i <= radius; i++) {
                        yi = yp + x << 2;
                        r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
                        g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
                        b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
                        a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
                        r_in_sum += pr;
                        g_in_sum += pg;
                        b_in_sum += pb;
                        a_in_sum += pa;
                        stack = stack.next;
                        if (i < heightMinus1) yp += width;
                    }
                    yi = x;
                    stackIn = stackStart;
                    stackOut = stackEnd;
                    for (y = 0; y < height; y++) {
                        p = yi << 2;
                        pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
                        if (pa > 0) {
                            pa = 255 / pa;
                            pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
                            pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
                            pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
                        } else pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                        r_sum -= r_out_sum;
                        g_sum -= g_out_sum;
                        b_sum -= b_out_sum;
                        a_sum -= a_out_sum;
                        r_out_sum -= stackIn.r;
                        g_out_sum -= stackIn.g;
                        b_out_sum -= stackIn.b;
                        a_out_sum -= stackIn.a;
                        p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
                        r_sum += r_in_sum += stackIn.r = pixels[p];
                        g_sum += g_in_sum += stackIn.g = pixels[p + 1];
                        b_sum += b_in_sum += stackIn.b = pixels[p + 2];
                        a_sum += a_in_sum += stackIn.a = pixels[p + 3];
                        stackIn = stackIn.next;
                        r_out_sum += pr = stackOut.r;
                        g_out_sum += pg = stackOut.g;
                        b_out_sum += pb = stackOut.b;
                        a_out_sum += pa = stackOut.a;
                        r_in_sum -= pr;
                        g_in_sum -= pg;
                        b_in_sum -= pb;
                        a_in_sum -= pa;
                        stackOut = stackOut.next;
                        yi += width;
                    }
                }
            }
            exports.Blur = function Blur(imageData) {
                var radius = Math.round(this.blurRadius());
                if (radius > 0) filterGaussBlurRGBA(imageData, radius);
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "blurRadius", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        3927: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.Brighten = function(imageData) {
                var i, brightness = this.brightness() * 255, data = imageData.data, len = data.length;
                for (i = 0; i < len; i += 4) {
                    data[i] += brightness;
                    data[i + 1] += brightness;
                    data[i + 2] += brightness;
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "brightness", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        1726: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.Contrast = function(imageData) {
                var adjust = Math.pow((this.contrast() + 100) / 100, 2);
                var i, data = imageData.data, nPixels = data.length, red = 150, green = 150, blue = 150;
                for (i = 0; i < nPixels; i += 4) {
                    red = data[i];
                    green = data[i + 1];
                    blue = data[i + 2];
                    red /= 255;
                    red -= .5;
                    red *= adjust;
                    red += .5;
                    red *= 255;
                    green /= 255;
                    green -= .5;
                    green *= adjust;
                    green += .5;
                    green *= 255;
                    blue /= 255;
                    blue -= .5;
                    blue *= adjust;
                    blue += .5;
                    blue *= 255;
                    red = red < 0 ? 0 : red > 255 ? 255 : red;
                    green = green < 0 ? 0 : green > 255 ? 255 : green;
                    blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
                    data[i] = red;
                    data[i + 1] = green;
                    data[i + 2] = blue;
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "contrast", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        2323: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Util_1 = __webpack_require__(5520);
            var Validators_1 = __webpack_require__(4783);
            exports.Emboss = function(imageData) {
                var strength = this.embossStrength() * 10, greyLevel = this.embossWhiteLevel() * 255, direction = this.embossDirection(), blend = this.embossBlend(), dirY = 0, dirX = 0, data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
                switch (direction) {
                  case "top-left":
                    dirY = -1;
                    dirX = -1;
                    break;

                  case "top":
                    dirY = -1;
                    dirX = 0;
                    break;

                  case "top-right":
                    dirY = -1;
                    dirX = 1;
                    break;

                  case "right":
                    dirY = 0;
                    dirX = 1;
                    break;

                  case "bottom-right":
                    dirY = 1;
                    dirX = 1;
                    break;

                  case "bottom":
                    dirY = 1;
                    dirX = 0;
                    break;

                  case "bottom-left":
                    dirY = 1;
                    dirX = -1;
                    break;

                  case "left":
                    dirY = 0;
                    dirX = -1;
                    break;

                  default:
                    Util_1.Util.error("Unknown emboss direction: " + direction);
                }
                do {
                    var offsetY = (y - 1) * w4;
                    var otherY = dirY;
                    if (y + otherY < 1) otherY = 0;
                    if (y + otherY > h) otherY = 0;
                    var offsetYOther = (y - 1 + otherY) * w * 4;
                    var x = w;
                    do {
                        var offset = offsetY + (x - 1) * 4;
                        var otherX = dirX;
                        if (x + otherX < 1) otherX = 0;
                        if (x + otherX > w) otherX = 0;
                        var offsetOther = offsetYOther + (x - 1 + otherX) * 4;
                        var dR = data[offset] - data[offsetOther];
                        var dG = data[offset + 1] - data[offsetOther + 1];
                        var dB = data[offset + 2] - data[offsetOther + 2];
                        var dif = dR;
                        var absDif = dif > 0 ? dif : -dif;
                        var absG = dG > 0 ? dG : -dG;
                        var absB = dB > 0 ? dB : -dB;
                        if (absG > absDif) dif = dG;
                        if (absB > absDif) dif = dB;
                        dif *= strength;
                        if (blend) {
                            var r = data[offset] + dif;
                            var g = data[offset + 1] + dif;
                            var b = data[offset + 2] + dif;
                            data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
                            data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
                            data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
                        } else {
                            var grey = greyLevel - dif;
                            if (grey < 0) grey = 0; else if (grey > 255) grey = 255;
                            data[offset] = data[offset + 1] = data[offset + 2] = grey;
                        }
                    } while (--x);
                } while (--y);
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "embossStrength", .5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "embossWhiteLevel", .5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "embossDirection", "top-left", null, Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "embossBlend", false, null, Factory_1.Factory.afterSetFilter);
        },
        2068: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            function remap(fromValue, fromMin, fromMax, toMin, toMax) {
                var toValue, fromRange = fromMax - fromMin, toRange = toMax - toMin;
                if (fromRange === 0) return toMin + toRange / 2;
                if (toRange === 0) return toMin;
                toValue = (fromValue - fromMin) / fromRange;
                toValue = toRange * toValue + toMin;
                return toValue;
            }
            exports.Enhance = function(imageData) {
                var r, g, b, i, data = imageData.data, nSubPixels = data.length, rMin = data[0], rMax = rMin, gMin = data[1], gMax = gMin, bMin = data[2], bMax = bMin;
                var enhanceAmount = this.enhance();
                if (enhanceAmount === 0) return;
                for (i = 0; i < nSubPixels; i += 4) {
                    r = data[i + 0];
                    if (r < rMin) rMin = r; else if (r > rMax) rMax = r;
                    g = data[i + 1];
                    if (g < gMin) gMin = g; else if (g > gMax) gMax = g;
                    b = data[i + 2];
                    if (b < bMin) bMin = b; else if (b > bMax) bMax = b;
                }
                if (rMax === rMin) {
                    rMax = 255;
                    rMin = 0;
                }
                if (gMax === gMin) {
                    gMax = 255;
                    gMin = 0;
                }
                if (bMax === bMin) {
                    bMax = 255;
                    bMin = 0;
                }
                var rMid, rGoalMax, rGoalMin, gMid, gGoalMax, gGoalMin, bMid, bGoalMax, bGoalMin;
                if (enhanceAmount > 0) {
                    rGoalMax = rMax + enhanceAmount * (255 - rMax);
                    rGoalMin = rMin - enhanceAmount * (rMin - 0);
                    gGoalMax = gMax + enhanceAmount * (255 - gMax);
                    gGoalMin = gMin - enhanceAmount * (gMin - 0);
                    bGoalMax = bMax + enhanceAmount * (255 - bMax);
                    bGoalMin = bMin - enhanceAmount * (bMin - 0);
                } else {
                    rMid = (rMax + rMin) * .5;
                    rGoalMax = rMax + enhanceAmount * (rMax - rMid);
                    rGoalMin = rMin + enhanceAmount * (rMin - rMid);
                    gMid = (gMax + gMin) * .5;
                    gGoalMax = gMax + enhanceAmount * (gMax - gMid);
                    gGoalMin = gMin + enhanceAmount * (gMin - gMid);
                    bMid = (bMax + bMin) * .5;
                    bGoalMax = bMax + enhanceAmount * (bMax - bMid);
                    bGoalMin = bMin + enhanceAmount * (bMin - bMid);
                }
                for (i = 0; i < nSubPixels; i += 4) {
                    data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
                    data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
                    data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "enhance", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        2957: (__unused_webpack_module, exports) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.Grayscale = function(imageData) {
                var i, brightness, data = imageData.data, len = data.length;
                for (i = 0; i < len; i += 4) {
                    brightness = .34 * data[i] + .5 * data[i + 1] + .16 * data[i + 2];
                    data[i] = brightness;
                    data[i + 1] = brightness;
                    data[i + 2] = brightness;
                }
            };
        },
        1593: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "hue", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "saturation", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "luminance", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            exports.HSL = function(imageData) {
                var i, data = imageData.data, nPixels = data.length, v = 1, s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, l = this.luminance() * 127;
                var vsu = v * s * Math.cos(h * Math.PI / 180), vsw = v * s * Math.sin(h * Math.PI / 180);
                var rr = .299 * v + .701 * vsu + .167 * vsw, rg = .587 * v - .587 * vsu + .33 * vsw, rb = .114 * v - .114 * vsu - .497 * vsw;
                var gr = .299 * v - .299 * vsu - .328 * vsw, gg = .587 * v + .413 * vsu + .035 * vsw, gb = .114 * v - .114 * vsu + .293 * vsw;
                var br = .299 * v - .3 * vsu + 1.25 * vsw, bg = .587 * v - .586 * vsu - 1.05 * vsw, bb = .114 * v + .886 * vsu - .2 * vsw;
                var r, g, b, a;
                for (i = 0; i < nPixels; i += 4) {
                    r = data[i + 0];
                    g = data[i + 1];
                    b = data[i + 2];
                    a = data[i + 3];
                    data[i + 0] = rr * r + rg * g + rb * b + l;
                    data[i + 1] = gr * r + gg * g + gb * b + l;
                    data[i + 2] = br * r + bg * g + bb * b + l;
                    data[i + 3] = a;
                }
            };
        },
        447: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.HSV = function(imageData) {
                var i, data = imageData.data, nPixels = data.length, v = Math.pow(2, this.value()), s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360;
                var vsu = v * s * Math.cos(h * Math.PI / 180), vsw = v * s * Math.sin(h * Math.PI / 180);
                var rr = .299 * v + .701 * vsu + .167 * vsw, rg = .587 * v - .587 * vsu + .33 * vsw, rb = .114 * v - .114 * vsu - .497 * vsw;
                var gr = .299 * v - .299 * vsu - .328 * vsw, gg = .587 * v + .413 * vsu + .035 * vsw, gb = .114 * v - .114 * vsu + .293 * vsw;
                var br = .299 * v - .3 * vsu + 1.25 * vsw, bg = .587 * v - .586 * vsu - 1.05 * vsw, bb = .114 * v + .886 * vsu - .2 * vsw;
                var r, g, b, a;
                for (i = 0; i < nPixels; i += 4) {
                    r = data[i + 0];
                    g = data[i + 1];
                    b = data[i + 2];
                    a = data[i + 3];
                    data[i + 0] = rr * r + rg * g + rb * b;
                    data[i + 1] = gr * r + gg * g + gb * b;
                    data[i + 2] = br * r + bg * g + bb * b;
                    data[i + 3] = a;
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "hue", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "saturation", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "value", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        1752: (__unused_webpack_module, exports) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.Invert = function(imageData) {
                var i, data = imageData.data, len = data.length;
                for (i = 0; i < len; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
            };
        },
        2085: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Util_1 = __webpack_require__(5520);
            var Validators_1 = __webpack_require__(4783);
            var ToPolar = function(src, dst, opt) {
                var i, x, y, srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, r = 0, g = 0, b = 0, a = 0;
                var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
                x = xSize - xMid;
                y = ySize - yMid;
                rad = Math.sqrt(x * x + y * y);
                rMax = rad > rMax ? rad : rMax;
                var radius, theta, rSize = ySize, tSize = xSize;
                var sin, cos, conversion = 360 / tSize * Math.PI / 180;
                for (theta = 0; theta < tSize; theta += 1) {
                    sin = Math.sin(theta * conversion);
                    cos = Math.cos(theta * conversion);
                    for (radius = 0; radius < rSize; radius += 1) {
                        x = Math.floor(xMid + rMax * radius / rSize * cos);
                        y = Math.floor(yMid + rMax * radius / rSize * sin);
                        i = (y * xSize + x) * 4;
                        r = srcPixels[i + 0];
                        g = srcPixels[i + 1];
                        b = srcPixels[i + 2];
                        a = srcPixels[i + 3];
                        i = (theta + radius * xSize) * 4;
                        dstPixels[i + 0] = r;
                        dstPixels[i + 1] = g;
                        dstPixels[i + 2] = b;
                        dstPixels[i + 3] = a;
                    }
                }
            };
            var FromPolar = function(src, dst, opt) {
                var i, x, y, dx, dy, srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, r = 0, g = 0, b = 0, a = 0;
                var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
                x = xSize - xMid;
                y = ySize - yMid;
                rad = Math.sqrt(x * x + y * y);
                rMax = rad > rMax ? rad : rMax;
                var radius, theta, rSize = ySize, tSize = xSize, phaseShift = opt.polarRotation || 0;
                var x1, y1;
                for (x = 0; x < xSize; x += 1) for (y = 0; y < ySize; y += 1) {
                    dx = x - xMid;
                    dy = y - yMid;
                    radius = Math.sqrt(dx * dx + dy * dy) * rSize / rMax;
                    theta = (Math.atan2(dy, dx) * 180 / Math.PI + 360 + phaseShift) % 360;
                    theta = theta * tSize / 360;
                    x1 = Math.floor(theta);
                    y1 = Math.floor(radius);
                    i = (y1 * xSize + x1) * 4;
                    r = srcPixels[i + 0];
                    g = srcPixels[i + 1];
                    b = srcPixels[i + 2];
                    a = srcPixels[i + 3];
                    i = (y * xSize + x) * 4;
                    dstPixels[i + 0] = r;
                    dstPixels[i + 1] = g;
                    dstPixels[i + 2] = b;
                    dstPixels[i + 3] = a;
                }
            };
            exports.Kaleidoscope = function(imageData) {
                var xSize = imageData.width, ySize = imageData.height;
                var x, y, xoff, i, r, g, b, a, srcPos, dstPos;
                var power = Math.round(this.kaleidoscopePower());
                var angle = Math.round(this.kaleidoscopeAngle());
                var offset = Math.floor(xSize * (angle % 360) / 360);
                if (power < 1) return;
                var tempCanvas = Util_1.Util.createCanvasElement();
                tempCanvas.width = xSize;
                tempCanvas.height = ySize;
                var scratchData = tempCanvas.getContext("2d").getImageData(0, 0, xSize, ySize);
                ToPolar(imageData, scratchData, {
                    polarCenterX: xSize / 2,
                    polarCenterY: ySize / 2
                });
                var minSectionSize = xSize / Math.pow(2, power);
                while (minSectionSize <= 8) {
                    minSectionSize *= 2;
                    power -= 1;
                }
                minSectionSize = Math.ceil(minSectionSize);
                var sectionSize = minSectionSize;
                var xStart = 0, xEnd = sectionSize, xDelta = 1;
                if (offset + minSectionSize > xSize) {
                    xStart = sectionSize;
                    xEnd = 0;
                    xDelta = -1;
                }
                for (y = 0; y < ySize; y += 1) for (x = xStart; x !== xEnd; x += xDelta) {
                    xoff = Math.round(x + offset) % xSize;
                    srcPos = (xSize * y + xoff) * 4;
                    r = scratchData.data[srcPos + 0];
                    g = scratchData.data[srcPos + 1];
                    b = scratchData.data[srcPos + 2];
                    a = scratchData.data[srcPos + 3];
                    dstPos = (xSize * y + x) * 4;
                    scratchData.data[dstPos + 0] = r;
                    scratchData.data[dstPos + 1] = g;
                    scratchData.data[dstPos + 2] = b;
                    scratchData.data[dstPos + 3] = a;
                }
                for (y = 0; y < ySize; y += 1) {
                    sectionSize = Math.floor(minSectionSize);
                    for (i = 0; i < power; i += 1) {
                        for (x = 0; x < sectionSize + 1; x += 1) {
                            srcPos = (xSize * y + x) * 4;
                            r = scratchData.data[srcPos + 0];
                            g = scratchData.data[srcPos + 1];
                            b = scratchData.data[srcPos + 2];
                            a = scratchData.data[srcPos + 3];
                            dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
                            scratchData.data[dstPos + 0] = r;
                            scratchData.data[dstPos + 1] = g;
                            scratchData.data[dstPos + 2] = b;
                            scratchData.data[dstPos + 3] = a;
                        }
                        sectionSize *= 2;
                    }
                }
                FromPolar(scratchData, imageData, {
                    polarRotation: 0
                });
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "kaleidoscopePower", 2, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "kaleidoscopeAngle", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        5788: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            function pixelAt(idata, x, y) {
                var idx = (y * idata.width + x) * 4;
                var d = [];
                d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
                return d;
            }
            function rgbDistance(p1, p2) {
                return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2) + Math.pow(p1[2] - p2[2], 2));
            }
            function rgbMean(pTab) {
                var m = [ 0, 0, 0 ];
                for (var i = 0; i < pTab.length; i++) {
                    m[0] += pTab[i][0];
                    m[1] += pTab[i][1];
                    m[2] += pTab[i][2];
                }
                m[0] /= pTab.length;
                m[1] /= pTab.length;
                m[2] /= pTab.length;
                return m;
            }
            function backgroundMask(idata, threshold) {
                var rgbv_no = pixelAt(idata, 0, 0);
                var rgbv_ne = pixelAt(idata, idata.width - 1, 0);
                var rgbv_so = pixelAt(idata, 0, idata.height - 1);
                var rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
                var thres = threshold || 10;
                if (rgbDistance(rgbv_no, rgbv_ne) < thres && rgbDistance(rgbv_ne, rgbv_se) < thres && rgbDistance(rgbv_se, rgbv_so) < thres && rgbDistance(rgbv_so, rgbv_no) < thres) {
                    var mean = rgbMean([ rgbv_ne, rgbv_no, rgbv_se, rgbv_so ]);
                    var mask = [];
                    for (var i = 0; i < idata.width * idata.height; i++) {
                        var d = rgbDistance(mean, [ idata.data[i * 4], idata.data[i * 4 + 1], idata.data[i * 4 + 2] ]);
                        mask[i] = d < thres ? 0 : 255;
                    }
                    return mask;
                }
            }
            function applyMask(idata, mask) {
                for (var i = 0; i < idata.width * idata.height; i++) idata.data[4 * i + 3] = mask[i];
            }
            function erodeMask(mask, sw, sh) {
                var weights = [ 1, 1, 1, 1, 0, 1, 1, 1, 1 ];
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var maskResult = [];
                for (var y = 0; y < sh; y++) for (var x = 0; x < sw; x++) {
                    var so = y * sw + x;
                    var a = 0;
                    for (var cy = 0; cy < side; cy++) for (var cx = 0; cx < side; cx++) {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = scy * sw + scx;
                            var wt = weights[cy * side + cx];
                            a += mask[srcOff] * wt;
                        }
                    }
                    maskResult[so] = a === 255 * 8 ? 255 : 0;
                }
                return maskResult;
            }
            function dilateMask(mask, sw, sh) {
                var weights = [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ];
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var maskResult = [];
                for (var y = 0; y < sh; y++) for (var x = 0; x < sw; x++) {
                    var so = y * sw + x;
                    var a = 0;
                    for (var cy = 0; cy < side; cy++) for (var cx = 0; cx < side; cx++) {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = scy * sw + scx;
                            var wt = weights[cy * side + cx];
                            a += mask[srcOff] * wt;
                        }
                    }
                    maskResult[so] = a >= 255 * 4 ? 255 : 0;
                }
                return maskResult;
            }
            function smoothEdgeMask(mask, sw, sh) {
                var weights = [ 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9 ];
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var maskResult = [];
                for (var y = 0; y < sh; y++) for (var x = 0; x < sw; x++) {
                    var so = y * sw + x;
                    var a = 0;
                    for (var cy = 0; cy < side; cy++) for (var cx = 0; cx < side; cx++) {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = scy * sw + scx;
                            var wt = weights[cy * side + cx];
                            a += mask[srcOff] * wt;
                        }
                    }
                    maskResult[so] = a;
                }
                return maskResult;
            }
            exports.Mask = function(imageData) {
                var threshold = this.threshold(), mask = backgroundMask(imageData, threshold);
                if (mask) {
                    mask = erodeMask(mask, imageData.width, imageData.height);
                    mask = dilateMask(mask, imageData.width, imageData.height);
                    mask = smoothEdgeMask(mask, imageData.width, imageData.height);
                    applyMask(imageData, mask);
                }
                return imageData;
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "threshold", 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        2108: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.Noise = function(imageData) {
                var i, amount = this.noise() * 255, data = imageData.data, nPixels = data.length, half = amount / 2;
                for (i = 0; i < nPixels; i += 4) {
                    data[i + 0] += half - 2 * half * Math.random();
                    data[i + 1] += half - 2 * half * Math.random();
                    data[i + 2] += half - 2 * half * Math.random();
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "noise", .2, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        6896: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Util_1 = __webpack_require__(5520);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.Pixelate = function(imageData) {
                var x, y, i, red, green, blue, alpha, xBinStart, xBinEnd, yBinStart, yBinEnd, xBin, yBin, pixelsInBin, pixelSize = Math.ceil(this.pixelSize()), width = imageData.width, height = imageData.height, nBinsX = Math.ceil(width / pixelSize), nBinsY = Math.ceil(height / pixelSize), data = imageData.data;
                if (pixelSize <= 0) {
                    Util_1.Util.error("pixelSize value can not be <= 0");
                    return;
                }
                for (xBin = 0; xBin < nBinsX; xBin += 1) for (yBin = 0; yBin < nBinsY; yBin += 1) {
                    red = 0;
                    green = 0;
                    blue = 0;
                    alpha = 0;
                    xBinStart = xBin * pixelSize;
                    xBinEnd = xBinStart + pixelSize;
                    yBinStart = yBin * pixelSize;
                    yBinEnd = yBinStart + pixelSize;
                    pixelsInBin = 0;
                    for (x = xBinStart; x < xBinEnd; x += 1) {
                        if (x >= width) continue;
                        for (y = yBinStart; y < yBinEnd; y += 1) {
                            if (y >= height) continue;
                            i = (width * y + x) * 4;
                            red += data[i + 0];
                            green += data[i + 1];
                            blue += data[i + 2];
                            alpha += data[i + 3];
                            pixelsInBin += 1;
                        }
                    }
                    red /= pixelsInBin;
                    green /= pixelsInBin;
                    blue /= pixelsInBin;
                    alpha /= pixelsInBin;
                    for (x = xBinStart; x < xBinEnd; x += 1) {
                        if (x >= width) continue;
                        for (y = yBinStart; y < yBinEnd; y += 1) {
                            if (y >= height) continue;
                            i = (width * y + x) * 4;
                            data[i + 0] = red;
                            data[i + 1] = green;
                            data[i + 2] = blue;
                            data[i + 3] = alpha;
                        }
                    }
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "pixelSize", 8, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        6535: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.Posterize = function(imageData) {
                var i, levels = Math.round(this.levels() * 254) + 1, data = imageData.data, len = data.length, scale = 255 / levels;
                for (i = 0; i < len; i += 1) data[i] = Math.floor(data[i] / scale) * scale;
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "levels", .5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        2285: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.RGB = function(imageData) {
                var i, brightness, data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue();
                for (i = 0; i < nPixels; i += 4) {
                    brightness = (.34 * data[i] + .5 * data[i + 1] + .16 * data[i + 2]) / 255;
                    data[i] = brightness * red;
                    data[i + 1] = brightness * green;
                    data[i + 2] = brightness * blue;
                    data[i + 3] = data[i + 3];
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "red", 0, (function(val) {
                this._filterUpToDate = false;
                if (val > 255) return 255; else if (val < 0) return 0; else return Math.round(val);
            }));
            Factory_1.Factory.addGetterSetter(Node_1.Node, "green", 0, (function(val) {
                this._filterUpToDate = false;
                if (val > 255) return 255; else if (val < 0) return 0; else return Math.round(val);
            }));
            Factory_1.Factory.addGetterSetter(Node_1.Node, "blue", 0, Validators_1.RGBComponent, Factory_1.Factory.afterSetFilter);
        },
        9858: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.RGBA = function(imageData) {
                var i, ia, data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha();
                for (i = 0; i < nPixels; i += 4) {
                    ia = 1 - alpha;
                    data[i] = red * alpha + data[i] * ia;
                    data[i + 1] = green * alpha + data[i + 1] * ia;
                    data[i + 2] = blue * alpha + data[i + 2] * ia;
                }
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "red", 0, (function(val) {
                this._filterUpToDate = false;
                if (val > 255) return 255; else if (val < 0) return 0; else return Math.round(val);
            }));
            Factory_1.Factory.addGetterSetter(Node_1.Node, "green", 0, (function(val) {
                this._filterUpToDate = false;
                if (val > 255) return 255; else if (val < 0) return 0; else return Math.round(val);
            }));
            Factory_1.Factory.addGetterSetter(Node_1.Node, "blue", 0, Validators_1.RGBComponent, Factory_1.Factory.afterSetFilter);
            Factory_1.Factory.addGetterSetter(Node_1.Node, "alpha", 1, (function(val) {
                this._filterUpToDate = false;
                if (val > 1) return 1; else if (val < 0) return 0; else return val;
            }));
        },
        7780: (__unused_webpack_module, exports) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.Sepia = function(imageData) {
                var i, r, g, b, data = imageData.data, nPixels = data.length;
                for (i = 0; i < nPixels; i += 4) {
                    r = data[i + 0];
                    g = data[i + 1];
                    b = data[i + 2];
                    data[i + 0] = Math.min(255, r * .393 + g * .769 + b * .189);
                    data[i + 1] = Math.min(255, r * .349 + g * .686 + b * .168);
                    data[i + 2] = Math.min(255, r * .272 + g * .534 + b * .131);
                }
            };
        },
        9937: (__unused_webpack_module, exports) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.Solarize = function(imageData) {
                var data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
                do {
                    var offsetY = (y - 1) * w4;
                    var x = w;
                    do {
                        var offset = offsetY + (x - 1) * 4;
                        var r = data[offset];
                        var g = data[offset + 1];
                        var b = data[offset + 2];
                        if (r > 127) r = 255 - r;
                        if (g > 127) g = 255 - g;
                        if (b > 127) b = 255 - b;
                        data[offset] = r;
                        data[offset + 1] = g;
                        data[offset + 2] = b;
                    } while (--x);
                } while (--y);
            };
        },
        6169: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Validators_1 = __webpack_require__(4783);
            exports.Threshold = function(imageData) {
                var i, level = this.threshold() * 255, data = imageData.data, len = data.length;
                for (i = 0; i < len; i += 1) data[i] = data[i] < level ? 0 : 255;
            };
            Factory_1.Factory.addGetterSetter(Node_1.Node, "threshold", .5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
        },
        3054: (module, exports, __webpack_require__) => {
            var Konva = __webpack_require__(6970).k;
            Konva._injectGlobal(Konva);
            exports["default"] = Konva;
            module.exports = exports["default"];
        },
        1057: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Global_1 = __webpack_require__(9427);
            var Validators_1 = __webpack_require__(4783);
            var Global_2 = __webpack_require__(9427);
            var Arc = function(_super) {
                __extends(Arc, _super);
                function Arc() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Arc.prototype._sceneFunc = function(context) {
                    var angle = Global_1.Konva.getAngle(this.angle()), clockwise = this.clockwise();
                    context.beginPath();
                    context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
                    context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Arc.prototype.getWidth = function() {
                    return this.outerRadius() * 2;
                };
                Arc.prototype.getHeight = function() {
                    return this.outerRadius() * 2;
                };
                Arc.prototype.setWidth = function(width) {
                    this.outerRadius(width / 2);
                };
                Arc.prototype.setHeight = function(height) {
                    this.outerRadius(height / 2);
                };
                return Arc;
            }(Shape_1.Shape);
            exports.Arc = Arc;
            Arc.prototype._centroid = true;
            Arc.prototype.className = "Arc";
            Arc.prototype._attrsAffectingSize = [ "innerRadius", "outerRadius" ];
            Global_2._registerNode(Arc);
            Factory_1.Factory.addGetterSetter(Arc, "innerRadius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Arc, "outerRadius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Arc, "angle", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Arc, "clockwise", false, Validators_1.getBooleanValidator());
            Util_1.Collection.mapMethods(Arc);
        },
        9548: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Line_1 = __webpack_require__(2463);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Arrow = function(_super) {
                __extends(Arrow, _super);
                function Arrow() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Arrow.prototype._sceneFunc = function(ctx) {
                    _super.prototype._sceneFunc.call(this, ctx);
                    var PI2 = Math.PI * 2;
                    var points = this.points();
                    var tp = points;
                    var fromTension = this.tension() !== 0 && points.length > 4;
                    if (fromTension) tp = this.getTensionPoints();
                    var n = points.length;
                    var dx, dy;
                    if (fromTension) {
                        dx = points[n - 2] - (tp[tp.length - 2] + tp[tp.length - 4]) / 2;
                        dy = points[n - 1] - (tp[tp.length - 1] + tp[tp.length - 3]) / 2;
                    } else {
                        dx = points[n - 2] - points[n - 4];
                        dy = points[n - 1] - points[n - 3];
                    }
                    var radians = (Math.atan2(dy, dx) + PI2) % PI2;
                    var length = this.pointerLength();
                    var width = this.pointerWidth();
                    ctx.save();
                    ctx.beginPath();
                    ctx.translate(points[n - 2], points[n - 1]);
                    ctx.rotate(radians);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-length, width / 2);
                    ctx.lineTo(-length, -width / 2);
                    ctx.closePath();
                    ctx.restore();
                    if (this.pointerAtBeginning()) {
                        ctx.save();
                        ctx.translate(points[0], points[1]);
                        if (fromTension) {
                            dx = (tp[0] + tp[2]) / 2 - points[0];
                            dy = (tp[1] + tp[3]) / 2 - points[1];
                        } else {
                            dx = points[2] - points[0];
                            dy = points[3] - points[1];
                        }
                        ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
                        ctx.moveTo(0, 0);
                        ctx.lineTo(-length, width / 2);
                        ctx.lineTo(-length, -width / 2);
                        ctx.closePath();
                        ctx.restore();
                    }
                    var isDashEnabled = this.dashEnabled();
                    if (isDashEnabled) {
                        this.attrs.dashEnabled = false;
                        ctx.setLineDash([]);
                    }
                    ctx.fillStrokeShape(this);
                    if (isDashEnabled) this.attrs.dashEnabled = true;
                };
                Arrow.prototype.getSelfRect = function() {
                    var lineRect = _super.prototype.getSelfRect.call(this);
                    var offset = this.pointerWidth() / 2;
                    return {
                        x: lineRect.x - offset,
                        y: lineRect.y - offset,
                        width: lineRect.width + offset * 2,
                        height: lineRect.height + offset * 2
                    };
                };
                return Arrow;
            }(Line_1.Line);
            exports.Arrow = Arrow;
            Arrow.prototype.className = "Arrow";
            Global_1._registerNode(Arrow);
            Factory_1.Factory.addGetterSetter(Arrow, "pointerLength", 10, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Arrow, "pointerWidth", 10, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Arrow, "pointerAtBeginning", false);
            Util_1.Collection.mapMethods(Arrow);
        },
        101: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Circle = function(_super) {
                __extends(Circle, _super);
                function Circle() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Circle.prototype._sceneFunc = function(context) {
                    context.beginPath();
                    context.arc(0, 0, this.radius(), 0, Math.PI * 2, false);
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Circle.prototype.getWidth = function() {
                    return this.radius() * 2;
                };
                Circle.prototype.getHeight = function() {
                    return this.radius() * 2;
                };
                Circle.prototype.setWidth = function(width) {
                    if (this.radius() !== width / 2) this.radius(width / 2);
                };
                Circle.prototype.setHeight = function(height) {
                    if (this.radius() !== height / 2) this.radius(height / 2);
                };
                return Circle;
            }(Shape_1.Shape);
            exports.Circle = Circle;
            Circle.prototype._centroid = true;
            Circle.prototype.className = "Circle";
            Circle.prototype._attrsAffectingSize = [ "radius" ];
            Global_1._registerNode(Circle);
            Factory_1.Factory.addGetterSetter(Circle, "radius", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(Circle);
        },
        759: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Ellipse = function(_super) {
                __extends(Ellipse, _super);
                function Ellipse() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Ellipse.prototype._sceneFunc = function(context) {
                    var rx = this.radiusX(), ry = this.radiusY();
                    context.beginPath();
                    context.save();
                    if (rx !== ry) context.scale(1, ry / rx);
                    context.arc(0, 0, rx, 0, Math.PI * 2, false);
                    context.restore();
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Ellipse.prototype.getWidth = function() {
                    return this.radiusX() * 2;
                };
                Ellipse.prototype.getHeight = function() {
                    return this.radiusY() * 2;
                };
                Ellipse.prototype.setWidth = function(width) {
                    this.radiusX(width / 2);
                };
                Ellipse.prototype.setHeight = function(height) {
                    this.radiusY(height / 2);
                };
                return Ellipse;
            }(Shape_1.Shape);
            exports.Ellipse = Ellipse;
            Ellipse.prototype.className = "Ellipse";
            Ellipse.prototype._centroid = true;
            Ellipse.prototype._attrsAffectingSize = [ "radiusX", "radiusY" ];
            Global_1._registerNode(Ellipse);
            Factory_1.Factory.addComponentsGetterSetter(Ellipse, "radius", [ "x", "y" ]);
            Factory_1.Factory.addGetterSetter(Ellipse, "radiusX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Ellipse, "radiusY", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(Ellipse);
        },
        5324: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Image = function(_super) {
                __extends(Image, _super);
                function Image() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Image.prototype._useBufferCanvas = function() {
                    return !!((this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke() && this.getStage());
                };
                Image.prototype._sceneFunc = function(context) {
                    var cropWidth, cropHeight, params, width = this.width(), height = this.height(), image = this.image();
                    if (image) {
                        cropWidth = this.cropWidth();
                        cropHeight = this.cropHeight();
                        if (cropWidth && cropHeight) params = [ image, this.cropX(), this.cropY(), cropWidth, cropHeight, 0, 0, width, height ]; else params = [ image, 0, 0, width, height ];
                    }
                    if (this.hasFill() || this.hasStroke()) {
                        context.beginPath();
                        context.rect(0, 0, width, height);
                        context.closePath();
                        context.fillStrokeShape(this);
                    }
                    if (image) context.drawImage.apply(context, params);
                };
                Image.prototype._hitFunc = function(context) {
                    var width = this.width(), height = this.height();
                    context.beginPath();
                    context.rect(0, 0, width, height);
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Image.prototype.getWidth = function() {
                    var _a;
                    var image = this.image();
                    return (_a = this.attrs.width) !== null && _a !== void 0 ? _a : image ? image.width : 0;
                };
                Image.prototype.getHeight = function() {
                    var _a;
                    var image = this.image();
                    return (_a = this.attrs.height) !== null && _a !== void 0 ? _a : image ? image.height : 0;
                };
                Image.fromURL = function(url, callback) {
                    var img = Util_1.Util.createImageElement();
                    img.onload = function() {
                        var image = new Image({
                            image: img
                        });
                        callback(image);
                    };
                    img.crossOrigin = "Anonymous";
                    img.src = url;
                };
                return Image;
            }(Shape_1.Shape);
            exports.Image = Image;
            Image.prototype.className = "Image";
            Global_1._registerNode(Image);
            Factory_1.Factory.addGetterSetter(Image, "image");
            Factory_1.Factory.addComponentsGetterSetter(Image, "crop", [ "x", "y", "width", "height" ]);
            Factory_1.Factory.addGetterSetter(Image, "cropX", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Image, "cropY", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Image, "cropWidth", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Image, "cropHeight", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(Image);
        },
        9887: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Group_1 = __webpack_require__(9625);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var ATTR_CHANGE_LIST = [ "fontFamily", "fontSize", "fontStyle", "padding", "lineHeight", "text", "width" ], CHANGE_KONVA = "Change.konva", NONE = "none", UP = "up", RIGHT = "right", DOWN = "down", LEFT = "left", attrChangeListLen = ATTR_CHANGE_LIST.length;
            var Label = function(_super) {
                __extends(Label, _super);
                function Label(config) {
                    var _this = _super.call(this, config) || this;
                    _this.on("add.konva", (function(evt) {
                        this._addListeners(evt.child);
                        this._sync();
                    }));
                    return _this;
                }
                Label.prototype.getText = function() {
                    return this.find("Text")[0];
                };
                Label.prototype.getTag = function() {
                    return this.find("Tag")[0];
                };
                Label.prototype._addListeners = function(text) {
                    var n, that = this;
                    var func = function() {
                        that._sync();
                    };
                    for (n = 0; n < attrChangeListLen; n++) text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
                };
                Label.prototype.getWidth = function() {
                    return this.getText().width();
                };
                Label.prototype.getHeight = function() {
                    return this.getText().height();
                };
                Label.prototype._sync = function() {
                    var width, height, pointerDirection, pointerWidth, x, y, pointerHeight, text = this.getText(), tag = this.getTag();
                    if (text && tag) {
                        width = text.width();
                        height = text.height();
                        pointerDirection = tag.pointerDirection();
                        pointerWidth = tag.pointerWidth();
                        pointerHeight = tag.pointerHeight();
                        x = 0;
                        y = 0;
                        switch (pointerDirection) {
                          case UP:
                            x = width / 2;
                            y = -1 * pointerHeight;
                            break;

                          case RIGHT:
                            x = width + pointerWidth;
                            y = height / 2;
                            break;

                          case DOWN:
                            x = width / 2;
                            y = height + pointerHeight;
                            break;

                          case LEFT:
                            x = -1 * pointerWidth;
                            y = height / 2;
                            break;
                        }
                        tag.setAttrs({
                            x: -1 * x,
                            y: -1 * y,
                            width,
                            height
                        });
                        text.setAttrs({
                            x: -1 * x,
                            y: -1 * y
                        });
                    }
                };
                return Label;
            }(Group_1.Group);
            exports.Label = Label;
            Label.prototype.className = "Label";
            Global_1._registerNode(Label);
            Util_1.Collection.mapMethods(Label);
            var Tag = function(_super) {
                __extends(Tag, _super);
                function Tag() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Tag.prototype._sceneFunc = function(context) {
                    var width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = Math.min(this.cornerRadius(), width / 2, height / 2);
                    context.beginPath();
                    if (!cornerRadius) context.moveTo(0, 0); else context.moveTo(cornerRadius, 0);
                    if (pointerDirection === UP) {
                        context.lineTo((width - pointerWidth) / 2, 0);
                        context.lineTo(width / 2, -1 * pointerHeight);
                        context.lineTo((width + pointerWidth) / 2, 0);
                    }
                    if (!cornerRadius) context.lineTo(width, 0); else {
                        context.lineTo(width - cornerRadius, 0);
                        context.arc(width - cornerRadius, cornerRadius, cornerRadius, Math.PI * 3 / 2, 0, false);
                    }
                    if (pointerDirection === RIGHT) {
                        context.lineTo(width, (height - pointerHeight) / 2);
                        context.lineTo(width + pointerWidth, height / 2);
                        context.lineTo(width, (height + pointerHeight) / 2);
                    }
                    if (!cornerRadius) context.lineTo(width, height); else {
                        context.lineTo(width, height - cornerRadius);
                        context.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
                    }
                    if (pointerDirection === DOWN) {
                        context.lineTo((width + pointerWidth) / 2, height);
                        context.lineTo(width / 2, height + pointerHeight);
                        context.lineTo((width - pointerWidth) / 2, height);
                    }
                    if (!cornerRadius) context.lineTo(0, height); else {
                        context.lineTo(cornerRadius, height);
                        context.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
                    }
                    if (pointerDirection === LEFT) {
                        context.lineTo(0, (height + pointerHeight) / 2);
                        context.lineTo(-1 * pointerWidth, height / 2);
                        context.lineTo(0, (height - pointerHeight) / 2);
                    }
                    if (cornerRadius) {
                        context.lineTo(0, cornerRadius);
                        context.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 3 / 2, false);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Tag.prototype.getSelfRect = function() {
                    var x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
                    if (direction === UP) {
                        y -= pointerHeight;
                        height += pointerHeight;
                    } else if (direction === DOWN) height += pointerHeight; else if (direction === LEFT) {
                        x -= pointerWidth * 1.5;
                        width += pointerWidth;
                    } else if (direction === RIGHT) width += pointerWidth * 1.5;
                    return {
                        x,
                        y,
                        width,
                        height
                    };
                };
                return Tag;
            }(Shape_1.Shape);
            exports.Tag = Tag;
            Tag.prototype.className = "Tag";
            Global_1._registerNode(Tag);
            Factory_1.Factory.addGetterSetter(Tag, "pointerDirection", NONE);
            Factory_1.Factory.addGetterSetter(Tag, "pointerWidth", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Tag, "pointerHeight", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Tag, "cornerRadius", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(Tag);
        },
        2463: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            var __spreadArrays = this && this.__spreadArrays || function() {
                for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
                var r = Array(s), k = 0;
                for (i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
                k++) r[k] = a[j];
                return r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Line = function(_super) {
                __extends(Line, _super);
                function Line(config) {
                    var _this = _super.call(this, config) || this;
                    _this.on("pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva", (function() {
                        this._clearCache("tensionPoints");
                    }));
                    return _this;
                }
                Line.prototype._sceneFunc = function(context) {
                    var tp, len, n, points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier();
                    if (!length) return;
                    context.beginPath();
                    context.moveTo(points[0], points[1]);
                    if (tension !== 0 && length > 4) {
                        tp = this.getTensionPoints();
                        len = tp.length;
                        n = closed ? 0 : 4;
                        if (!closed) context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
                        while (n < len - 2) context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
                        if (!closed) context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
                    } else if (bezier) {
                        n = 2;
                        while (n < length) context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
                    } else for (n = 2; n < length; n += 2) context.lineTo(points[n], points[n + 1]);
                    if (closed) {
                        context.closePath();
                        context.fillStrokeShape(this);
                    } else context.strokeShape(this);
                };
                Line.prototype.getTensionPoints = function() {
                    return this._getCache("tensionPoints", this._getTensionPoints);
                };
                Line.prototype._getTensionPoints = function() {
                    if (this.closed()) return this._getTensionPointsClosed(); else return Util_1.Util._expandPoints(this.points(), this.tension());
                };
                Line.prototype._getTensionPointsClosed = function() {
                    var p = this.points(), len = p.length, tension = this.tension(), firstControlPoints = Util_1.Util._getControlPoints(p[len - 2], p[len - 1], p[0], p[1], p[2], p[3], tension), lastControlPoints = Util_1.Util._getControlPoints(p[len - 4], p[len - 3], p[len - 2], p[len - 1], p[0], p[1], tension), middle = Util_1.Util._expandPoints(p, tension), tp = [ firstControlPoints[2], firstControlPoints[3] ].concat(middle).concat([ lastControlPoints[0], lastControlPoints[1], p[len - 2], p[len - 1], lastControlPoints[2], lastControlPoints[3], firstControlPoints[0], firstControlPoints[1], p[0], p[1] ]);
                    return tp;
                };
                Line.prototype.getWidth = function() {
                    return this.getSelfRect().width;
                };
                Line.prototype.getHeight = function() {
                    return this.getSelfRect().height;
                };
                Line.prototype.getSelfRect = function() {
                    var points = this.points();
                    if (points.length < 4) return {
                        x: points[0] || 0,
                        y: points[1] || 0,
                        width: 0,
                        height: 0
                    };
                    if (this.tension() !== 0) points = __spreadArrays([ points[0], points[1] ], this._getTensionPoints(), [ points[points.length - 2], points[points.length - 1] ]); else points = this.points();
                    var minX = points[0];
                    var maxX = points[0];
                    var minY = points[1];
                    var maxY = points[1];
                    var x, y;
                    for (var i = 0; i < points.length / 2; i++) {
                        x = points[i * 2];
                        y = points[i * 2 + 1];
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY
                    };
                };
                return Line;
            }(Shape_1.Shape);
            exports.Line = Line;
            Line.prototype.className = "Line";
            Line.prototype._attrsAffectingSize = [ "points", "bezier", "tension" ];
            Global_1._registerNode(Line);
            Factory_1.Factory.addGetterSetter(Line, "closed", false);
            Factory_1.Factory.addGetterSetter(Line, "bezier", false);
            Factory_1.Factory.addGetterSetter(Line, "tension", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Line, "points", [], Validators_1.getNumberArrayValidator());
            Util_1.Collection.mapMethods(Line);
        },
        2698: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Global_1 = __webpack_require__(9427);
            var Path = function(_super) {
                __extends(Path, _super);
                function Path(config) {
                    var _this = _super.call(this, config) || this;
                    _this.dataArray = [];
                    _this.pathLength = 0;
                    _this.dataArray = Path.parsePathData(_this.data());
                    _this.pathLength = 0;
                    for (var i = 0; i < _this.dataArray.length; ++i) _this.pathLength += _this.dataArray[i].pathLength;
                    _this.on("dataChange.konva", (function() {
                        this.dataArray = Path.parsePathData(this.data());
                        this.pathLength = 0;
                        for (var i = 0; i < this.dataArray.length; ++i) this.pathLength += this.dataArray[i].pathLength;
                    }));
                    return _this;
                }
                Path.prototype._sceneFunc = function(context) {
                    var ca = this.dataArray;
                    context.beginPath();
                    var isClosed = false;
                    for (var n = 0; n < ca.length; n++) {
                        var c = ca[n].command;
                        var p = ca[n].points;
                        switch (c) {
                          case "L":
                            context.lineTo(p[0], p[1]);
                            break;

                          case "M":
                            context.moveTo(p[0], p[1]);
                            break;

                          case "C":
                            context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                            break;

                          case "Q":
                            context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                            break;

                          case "A":
                            var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                            var r = rx > ry ? rx : ry;
                            var scaleX = rx > ry ? 1 : rx / ry;
                            var scaleY = rx > ry ? ry / rx : 1;
                            context.translate(cx, cy);
                            context.rotate(psi);
                            context.scale(scaleX, scaleY);
                            context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                            context.scale(1 / scaleX, 1 / scaleY);
                            context.rotate(-psi);
                            context.translate(-cx, -cy);
                            break;

                          case "z":
                            isClosed = true;
                            context.closePath();
                            break;
                        }
                    }
                    if (!isClosed && !this.hasFill()) context.strokeShape(this); else context.fillStrokeShape(this);
                };
                Path.prototype.getSelfRect = function() {
                    var points = [];
                    this.dataArray.forEach((function(data) {
                        if (data.command === "A") {
                            var start = data.points[4];
                            var dTheta = data.points[5];
                            var end = data.points[4] + dTheta;
                            var inc = Math.PI / 180;
                            if (Math.abs(start - end) < inc) inc = Math.abs(start - end);
                            if (dTheta < 0) for (var t = start - inc; t > end; t -= inc) {
                                var point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                                points.push(point.x, point.y);
                            } else for (t = start + inc; t < end; t += inc) {
                                point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                                points.push(point.x, point.y);
                            }
                        } else if (data.command === "C") for (t = 0; t <= 1; t += .01) {
                            point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
                            points.push(point.x, point.y);
                        } else points = points.concat(data.points);
                    }));
                    var minX = points[0];
                    var maxX = points[0];
                    var minY = points[1];
                    var maxY = points[1];
                    var x, y;
                    for (var i = 0; i < points.length / 2; i++) {
                        x = points[i * 2];
                        y = points[i * 2 + 1];
                        if (!isNaN(x)) {
                            minX = Math.min(minX, x);
                            maxX = Math.max(maxX, x);
                        }
                        if (!isNaN(y)) {
                            minY = Math.min(minY, y);
                            maxY = Math.max(maxY, y);
                        }
                    }
                    return {
                        x: Math.round(minX),
                        y: Math.round(minY),
                        width: Math.round(maxX - minX),
                        height: Math.round(maxY - minY)
                    };
                };
                Path.prototype.getLength = function() {
                    return this.pathLength;
                };
                Path.prototype.getPointAtLength = function(length) {
                    var point, i = 0, ii = this.dataArray.length;
                    if (!ii) return null;
                    while (i < ii && length > this.dataArray[i].pathLength) {
                        length -= this.dataArray[i].pathLength;
                        ++i;
                    }
                    if (i === ii) {
                        point = this.dataArray[i - 1].points.slice(-2);
                        return {
                            x: point[0],
                            y: point[1]
                        };
                    }
                    if (length < .01) {
                        point = this.dataArray[i].points.slice(0, 2);
                        return {
                            x: point[0],
                            y: point[1]
                        };
                    }
                    var cp = this.dataArray[i];
                    var p = cp.points;
                    switch (cp.command) {
                      case "L":
                        return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);

                      case "C":
                        return Path.getPointOnCubicBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3], p[4], p[5]);

                      case "Q":
                        return Path.getPointOnQuadraticBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3]);

                      case "A":
                        var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6];
                        theta += dTheta * length / cp.pathLength;
                        return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
                    }
                    return null;
                };
                Path.getLineLength = function(x1, y1, x2, y2) {
                    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                };
                Path.getPointOnLine = function(dist, P1x, P1y, P2x, P2y, fromX, fromY) {
                    if (fromX === void 0) fromX = P1x;
                    if (fromY === void 0) fromY = P1y;
                    var m = (P2y - P1y) / (P2x - P1x + 1e-8);
                    var run = Math.sqrt(dist * dist / (1 + m * m));
                    if (P2x < P1x) run *= -1;
                    var rise = m * run;
                    var pt;
                    if (P2x === P1x) pt = {
                        x: fromX,
                        y: fromY + rise
                    }; else if ((fromY - P1y) / (fromX - P1x + 1e-8) === m) pt = {
                        x: fromX + run,
                        y: fromY + rise
                    }; else {
                        var ix, iy;
                        var len = this.getLineLength(P1x, P1y, P2x, P2y);
                        if (len < 1e-8) return;
                        var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
                        u /= len * len;
                        ix = P1x + u * (P2x - P1x);
                        iy = P1y + u * (P2y - P1y);
                        var pRise = this.getLineLength(fromX, fromY, ix, iy);
                        var pRun = Math.sqrt(dist * dist - pRise * pRise);
                        run = Math.sqrt(pRun * pRun / (1 + m * m));
                        if (P2x < P1x) run *= -1;
                        rise = m * run;
                        pt = {
                            x: ix + run,
                            y: iy + rise
                        };
                    }
                    return pt;
                };
                Path.getPointOnCubicBezier = function(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
                    function CB1(t) {
                        return t * t * t;
                    }
                    function CB2(t) {
                        return 3 * t * t * (1 - t);
                    }
                    function CB3(t) {
                        return 3 * t * (1 - t) * (1 - t);
                    }
                    function CB4(t) {
                        return (1 - t) * (1 - t) * (1 - t);
                    }
                    var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
                    var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
                    return {
                        x,
                        y
                    };
                };
                Path.getPointOnQuadraticBezier = function(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
                    function QB1(t) {
                        return t * t;
                    }
                    function QB2(t) {
                        return 2 * t * (1 - t);
                    }
                    function QB3(t) {
                        return (1 - t) * (1 - t);
                    }
                    var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
                    var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
                    return {
                        x,
                        y
                    };
                };
                Path.getPointOnEllipticalArc = function(cx, cy, rx, ry, theta, psi) {
                    var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
                    var pt = {
                        x: rx * Math.cos(theta),
                        y: ry * Math.sin(theta)
                    };
                    return {
                        x: cx + (pt.x * cosPsi - pt.y * sinPsi),
                        y: cy + (pt.x * sinPsi + pt.y * cosPsi)
                    };
                };
                Path.parsePathData = function(data) {
                    if (!data) return [];
                    var cs = data;
                    var cc = [ "m", "M", "l", "L", "v", "V", "h", "H", "z", "Z", "c", "C", "q", "Q", "t", "T", "s", "S", "a", "A" ];
                    cs = cs.replace(new RegExp(" ", "g"), ",");
                    for (var n = 0; n < cc.length; n++) cs = cs.replace(new RegExp(cc[n], "g"), "|" + cc[n]);
                    var arr = cs.split("|");
                    var ca = [];
                    var coords = [];
                    var cpx = 0;
                    var cpy = 0;
                    var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
                    var match;
                    for (n = 1; n < arr.length; n++) {
                        var str = arr[n];
                        var c = str.charAt(0);
                        str = str.slice(1);
                        coords.length = 0;
                        while (match = re.exec(str)) coords.push(match[0]);
                        var p = [];
                        for (var j = 0, jlen = coords.length; j < jlen; j++) {
                            var parsed = parseFloat(coords[j]);
                            if (!isNaN(parsed)) p.push(parsed); else p.push(0);
                        }
                        while (p.length > 0) {
                            if (isNaN(p[0])) break;
                            var cmd = null;
                            var points = [];
                            var startX = cpx, startY = cpy;
                            var prevCmd, ctlPtx, ctlPty;
                            var rx, ry, psi, fa, fs, x1, y1;
                            switch (c) {
                              case "l":
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = "L";
                                points.push(cpx, cpy);
                                break;

                              case "L":
                                cpx = p.shift();
                                cpy = p.shift();
                                points.push(cpx, cpy);
                                break;

                              case "m":
                                var dx = p.shift();
                                var dy = p.shift();
                                cpx += dx;
                                cpy += dy;
                                cmd = "M";
                                if (ca.length > 2 && ca[ca.length - 1].command === "z") for (var idx = ca.length - 2; idx >= 0; idx--) if (ca[idx].command === "M") {
                                    cpx = ca[idx].points[0] + dx;
                                    cpy = ca[idx].points[1] + dy;
                                    break;
                                }
                                points.push(cpx, cpy);
                                c = "l";
                                break;

                              case "M":
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = "M";
                                points.push(cpx, cpy);
                                c = "L";
                                break;

                              case "h":
                                cpx += p.shift();
                                cmd = "L";
                                points.push(cpx, cpy);
                                break;

                              case "H":
                                cpx = p.shift();
                                cmd = "L";
                                points.push(cpx, cpy);
                                break;

                              case "v":
                                cpy += p.shift();
                                cmd = "L";
                                points.push(cpx, cpy);
                                break;

                              case "V":
                                cpy = p.shift();
                                cmd = "L";
                                points.push(cpx, cpy);
                                break;

                              case "C":
                                points.push(p.shift(), p.shift(), p.shift(), p.shift());
                                cpx = p.shift();
                                cpy = p.shift();
                                points.push(cpx, cpy);
                                break;

                              case "c":
                                points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = "C";
                                points.push(cpx, cpy);
                                break;

                              case "S":
                                ctlPtx = cpx;
                                ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === "C") {
                                    ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                    ctlPty = cpy + (cpy - prevCmd.points[3]);
                                }
                                points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = "C";
                                points.push(cpx, cpy);
                                break;

                              case "s":
                                ctlPtx = cpx;
                                ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === "C") {
                                    ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                    ctlPty = cpy + (cpy - prevCmd.points[3]);
                                }
                                points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = "C";
                                points.push(cpx, cpy);
                                break;

                              case "Q":
                                points.push(p.shift(), p.shift());
                                cpx = p.shift();
                                cpy = p.shift();
                                points.push(cpx, cpy);
                                break;

                              case "q":
                                points.push(cpx + p.shift(), cpy + p.shift());
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = "Q";
                                points.push(cpx, cpy);
                                break;

                              case "T":
                                ctlPtx = cpx;
                                ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === "Q") {
                                    ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                    ctlPty = cpy + (cpy - prevCmd.points[1]);
                                }
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = "Q";
                                points.push(ctlPtx, ctlPty, cpx, cpy);
                                break;

                              case "t":
                                ctlPtx = cpx;
                                ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === "Q") {
                                    ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                    ctlPty = cpy + (cpy - prevCmd.points[1]);
                                }
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = "Q";
                                points.push(ctlPtx, ctlPty, cpx, cpy);
                                break;

                              case "A":
                                rx = p.shift();
                                ry = p.shift();
                                psi = p.shift();
                                fa = p.shift();
                                fs = p.shift();
                                x1 = cpx;
                                y1 = cpy;
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = "A";
                                points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                                break;

                              case "a":
                                rx = p.shift();
                                ry = p.shift();
                                psi = p.shift();
                                fa = p.shift();
                                fs = p.shift();
                                x1 = cpx;
                                y1 = cpy;
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = "A";
                                points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                                break;
                            }
                            ca.push({
                                command: cmd || c,
                                points,
                                start: {
                                    x: startX,
                                    y: startY
                                },
                                pathLength: this.calcLength(startX, startY, cmd || c, points)
                            });
                        }
                        if (c === "z" || c === "Z") ca.push({
                            command: "z",
                            points: [],
                            start: void 0,
                            pathLength: 0
                        });
                    }
                    return ca;
                };
                Path.calcLength = function(x, y, cmd, points) {
                    var len, p1, p2, t;
                    var path = Path;
                    switch (cmd) {
                      case "L":
                        return path.getLineLength(x, y, points[0], points[1]);

                      case "C":
                        len = 0;
                        p1 = path.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                        for (t = .01; t <= 1; t += .01) {
                            p2 = path.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                        return len;

                      case "Q":
                        len = 0;
                        p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                        for (t = .01; t <= 1; t += .01) {
                            p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                        return len;

                      case "A":
                        len = 0;
                        var start = points[4];
                        var dTheta = points[5];
                        var end = points[4] + dTheta;
                        var inc = Math.PI / 180;
                        if (Math.abs(start - end) < inc) inc = Math.abs(start - end);
                        p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                        if (dTheta < 0) for (t = start - inc; t > end; t -= inc) {
                            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        } else for (t = start + inc; t < end; t += inc) {
                            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        return len;
                    }
                    return 0;
                };
                Path.convertEndpointToCenterParameterization = function(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
                    var psi = psiDeg * (Math.PI / 180);
                    var xp = Math.cos(psi) * (x1 - x2) / 2 + Math.sin(psi) * (y1 - y2) / 2;
                    var yp = -1 * Math.sin(psi) * (x1 - x2) / 2 + Math.cos(psi) * (y1 - y2) / 2;
                    var lambda = xp * xp / (rx * rx) + yp * yp / (ry * ry);
                    if (lambda > 1) {
                        rx *= Math.sqrt(lambda);
                        ry *= Math.sqrt(lambda);
                    }
                    var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) / (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
                    if (fa === fs) f *= -1;
                    if (isNaN(f)) f = 0;
                    var cxp = f * rx * yp / ry;
                    var cyp = f * -ry * xp / rx;
                    var cx = (x1 + x2) / 2 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
                    var cy = (y1 + y2) / 2 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
                    var vMag = function(v) {
                        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                    };
                    var vRatio = function(u, v) {
                        return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
                    };
                    var vAngle = function(u, v) {
                        return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
                    };
                    var theta = vAngle([ 1, 0 ], [ (xp - cxp) / rx, (yp - cyp) / ry ]);
                    var u = [ (xp - cxp) / rx, (yp - cyp) / ry ];
                    var v = [ (-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry ];
                    var dTheta = vAngle(u, v);
                    if (vRatio(u, v) <= -1) dTheta = Math.PI;
                    if (vRatio(u, v) >= 1) dTheta = 0;
                    if (fs === 0 && dTheta > 0) dTheta -= 2 * Math.PI;
                    if (fs === 1 && dTheta < 0) dTheta += 2 * Math.PI;
                    return [ cx, cy, rx, ry, theta, dTheta, psi, fs ];
                };
                return Path;
            }(Shape_1.Shape);
            exports.Path = Path;
            Path.prototype.className = "Path";
            Path.prototype._attrsAffectingSize = [ "data" ];
            Global_1._registerNode(Path);
            Factory_1.Factory.addGetterSetter(Path, "data");
            Util_1.Collection.mapMethods(Path);
        },
        3815: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Global_1 = __webpack_require__(9427);
            var Rect = function(_super) {
                __extends(Rect, _super);
                function Rect() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Rect.prototype._sceneFunc = function(context) {
                    var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
                    context.beginPath();
                    if (!cornerRadius) context.rect(0, 0, width, height); else {
                        var topLeft = 0;
                        var topRight = 0;
                        var bottomLeft = 0;
                        var bottomRight = 0;
                        if (typeof cornerRadius === "number") topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2); else {
                            topLeft = Math.min(cornerRadius[0], width / 2, height / 2);
                            topRight = Math.min(cornerRadius[1], width / 2, height / 2);
                            bottomRight = Math.min(cornerRadius[2], width / 2, height / 2);
                            bottomLeft = Math.min(cornerRadius[3], width / 2, height / 2);
                        }
                        context.moveTo(topLeft, 0);
                        context.lineTo(width - topRight, 0);
                        context.arc(width - topRight, topRight, topRight, Math.PI * 3 / 2, 0, false);
                        context.lineTo(width, height - bottomRight);
                        context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
                        context.lineTo(bottomLeft, height);
                        context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
                        context.lineTo(0, topLeft);
                        context.arc(topLeft, topLeft, topLeft, Math.PI, Math.PI * 3 / 2, false);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                return Rect;
            }(Shape_1.Shape);
            exports.Rect = Rect;
            Rect.prototype.className = "Rect";
            Global_1._registerNode(Rect);
            Factory_1.Factory.addGetterSetter(Rect, "cornerRadius", 0);
            Util_1.Collection.mapMethods(Rect);
        },
        2679: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var RegularPolygon = function(_super) {
                __extends(RegularPolygon, _super);
                function RegularPolygon() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                RegularPolygon.prototype._sceneFunc = function(context) {
                    var n, x, y, sides = this.sides(), radius = this.radius();
                    context.beginPath();
                    context.moveTo(0, 0 - radius);
                    for (n = 1; n < sides; n++) {
                        x = radius * Math.sin(n * 2 * Math.PI / sides);
                        y = -1 * radius * Math.cos(n * 2 * Math.PI / sides);
                        context.lineTo(x, y);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                RegularPolygon.prototype.getWidth = function() {
                    return this.radius() * 2;
                };
                RegularPolygon.prototype.getHeight = function() {
                    return this.radius() * 2;
                };
                RegularPolygon.prototype.setWidth = function(width) {
                    this.radius(width / 2);
                };
                RegularPolygon.prototype.setHeight = function(height) {
                    this.radius(height / 2);
                };
                return RegularPolygon;
            }(Shape_1.Shape);
            exports.RegularPolygon = RegularPolygon;
            RegularPolygon.prototype.className = "RegularPolygon";
            RegularPolygon.prototype._centroid = true;
            RegularPolygon.prototype._attrsAffectingSize = [ "radius" ];
            Global_1._registerNode(RegularPolygon);
            Factory_1.Factory.addGetterSetter(RegularPolygon, "radius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(RegularPolygon, "sides", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(RegularPolygon);
        },
        6527: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var PIx2 = Math.PI * 2;
            var Ring = function(_super) {
                __extends(Ring, _super);
                function Ring() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Ring.prototype._sceneFunc = function(context) {
                    context.beginPath();
                    context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
                    context.moveTo(this.outerRadius(), 0);
                    context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Ring.prototype.getWidth = function() {
                    return this.outerRadius() * 2;
                };
                Ring.prototype.getHeight = function() {
                    return this.outerRadius() * 2;
                };
                Ring.prototype.setWidth = function(width) {
                    this.outerRadius(width / 2);
                };
                Ring.prototype.setHeight = function(height) {
                    this.outerRadius(height / 2);
                };
                return Ring;
            }(Shape_1.Shape);
            exports.Ring = Ring;
            Ring.prototype.className = "Ring";
            Ring.prototype._centroid = true;
            Ring.prototype._attrsAffectingSize = [ "innerRadius", "outerRadius" ];
            Global_1._registerNode(Ring);
            Factory_1.Factory.addGetterSetter(Ring, "innerRadius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Ring, "outerRadius", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(Ring);
        },
        4096: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Animation_1 = __webpack_require__(9500);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Sprite = function(_super) {
                __extends(Sprite, _super);
                function Sprite(config) {
                    var _this = _super.call(this, config) || this;
                    _this._updated = true;
                    _this.anim = new Animation_1.Animation((function() {
                        var updated = _this._updated;
                        _this._updated = false;
                        return updated;
                    }));
                    _this.on("animationChange.konva", (function() {
                        this.frameIndex(0);
                    }));
                    _this.on("frameIndexChange.konva", (function() {
                        this._updated = true;
                    }));
                    _this.on("frameRateChange.konva", (function() {
                        if (!this.anim.isRunning()) return;
                        clearInterval(this.interval);
                        this._setInterval();
                    }));
                    return _this;
                }
                Sprite.prototype._sceneFunc = function(context) {
                    var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), x = set[ix4 + 0], y = set[ix4 + 1], width = set[ix4 + 2], height = set[ix4 + 3], image = this.image();
                    if (this.hasFill() || this.hasStroke()) {
                        context.beginPath();
                        context.rect(0, 0, width, height);
                        context.closePath();
                        context.fillStrokeShape(this);
                    }
                    if (image) if (offsets) {
                        var offset = offsets[anim], ix2 = index * 2;
                        context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
                    } else context.drawImage(image, x, y, width, height, 0, 0, width, height);
                };
                Sprite.prototype._hitFunc = function(context) {
                    var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), width = set[ix4 + 2], height = set[ix4 + 3];
                    context.beginPath();
                    if (offsets) {
                        var offset = offsets[anim];
                        var ix2 = index * 2;
                        context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
                    } else context.rect(0, 0, width, height);
                    context.closePath();
                    context.fillShape(this);
                };
                Sprite.prototype._useBufferCanvas = function() {
                    return (this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke();
                };
                Sprite.prototype._setInterval = function() {
                    var that = this;
                    this.interval = setInterval((function() {
                        that._updateIndex();
                    }), 1e3 / this.frameRate());
                };
                Sprite.prototype.start = function() {
                    if (this.isRunning()) return;
                    var layer = this.getLayer();
                    this.anim.setLayers(layer);
                    this._setInterval();
                    this.anim.start();
                };
                Sprite.prototype.stop = function() {
                    this.anim.stop();
                    clearInterval(this.interval);
                };
                Sprite.prototype.isRunning = function() {
                    return this.anim.isRunning();
                };
                Sprite.prototype._updateIndex = function() {
                    var index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
                    if (index < len - 1) this.frameIndex(index + 1); else this.frameIndex(0);
                };
                return Sprite;
            }(Shape_1.Shape);
            exports.Sprite = Sprite;
            Sprite.prototype.className = "Sprite";
            Global_1._registerNode(Sprite);
            Factory_1.Factory.addGetterSetter(Sprite, "animation");
            Factory_1.Factory.addGetterSetter(Sprite, "animations");
            Factory_1.Factory.addGetterSetter(Sprite, "frameOffsets");
            Factory_1.Factory.addGetterSetter(Sprite, "image");
            Factory_1.Factory.addGetterSetter(Sprite, "frameIndex", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Sprite, "frameRate", 17, Validators_1.getNumberValidator());
            Factory_1.Factory.backCompat(Sprite, {
                index: "frameIndex",
                getIndex: "getFrameIndex",
                setIndex: "setFrameIndex"
            });
            Util_1.Collection.mapMethods(Sprite);
        },
        1869: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var Star = function(_super) {
                __extends(Star, _super);
                function Star() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Star.prototype._sceneFunc = function(context) {
                    var innerRadius = this.innerRadius(), outerRadius = this.outerRadius(), numPoints = this.numPoints();
                    context.beginPath();
                    context.moveTo(0, 0 - outerRadius);
                    for (var n = 1; n < numPoints * 2; n++) {
                        var radius = n % 2 === 0 ? outerRadius : innerRadius;
                        var x = radius * Math.sin(n * Math.PI / numPoints);
                        var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
                        context.lineTo(x, y);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Star.prototype.getWidth = function() {
                    return this.outerRadius() * 2;
                };
                Star.prototype.getHeight = function() {
                    return this.outerRadius() * 2;
                };
                Star.prototype.setWidth = function(width) {
                    this.outerRadius(width / 2);
                };
                Star.prototype.setHeight = function(height) {
                    this.outerRadius(height / 2);
                };
                return Star;
            }(Shape_1.Shape);
            exports.Star = Star;
            Star.prototype.className = "Star";
            Star.prototype._centroid = true;
            Star.prototype._attrsAffectingSize = [ "innerRadius", "outerRadius" ];
            Global_1._registerNode(Star);
            Factory_1.Factory.addGetterSetter(Star, "numPoints", 5, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Star, "innerRadius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Star, "outerRadius", 0, Validators_1.getNumberValidator());
            Util_1.Collection.mapMethods(Star);
        },
        6658: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Global_1 = __webpack_require__(9427);
            var Validators_1 = __webpack_require__(4783);
            var Global_2 = __webpack_require__(9427);
            var AUTO = "auto", CENTER = "center", JUSTIFY = "justify", CHANGE_KONVA = "Change.konva", CONTEXT_2D = "2d", DASH = "-", LEFT = "left", TEXT = "text", TEXT_UPPER = "Text", TOP = "top", BOTTOM = "bottom", MIDDLE = "middle", NORMAL = "normal", PX_SPACE = "px ", SPACE = " ", RIGHT = "right", WORD = "word", CHAR = "char", NONE = "none", ELLIPSIS = "…", ATTR_CHANGE_LIST = [ "fontFamily", "fontSize", "fontStyle", "fontVariant", "padding", "align", "verticalAlign", "lineHeight", "text", "width", "height", "wrap", "ellipsis", "letterSpacing" ], attrChangeListLen = ATTR_CHANGE_LIST.length;
            var dummyContext;
            function getDummyContext() {
                if (dummyContext) return dummyContext;
                dummyContext = Util_1.Util.createCanvasElement().getContext(CONTEXT_2D);
                return dummyContext;
            }
            function _fillFunc(context) {
                context.fillText(this._partialText, this._partialTextX, this._partialTextY);
            }
            function _strokeFunc(context) {
                context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
            }
            function checkDefaultFill(config) {
                config = config || {};
                if (!config.fillLinearGradientColorStops && !config.fillRadialGradientColorStops && !config.fillPatternImage) config.fill = config.fill || "black";
                return config;
            }
            String.prototype.trimRight;
            var Text = function(_super) {
                __extends(Text, _super);
                function Text(config) {
                    var _this = _super.call(this, checkDefaultFill(config)) || this;
                    _this._partialTextX = 0;
                    _this._partialTextY = 0;
                    for (var n = 0; n < attrChangeListLen; n++) _this.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, _this._setTextData);
                    _this._setTextData();
                    return _this;
                }
                Text.prototype._sceneFunc = function(context) {
                    var n, padding = this.padding(), fontSize = this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, textArr = this.textArr, textArrLen = textArr.length, verticalAlign = this.verticalAlign(), alignY = 0, align = this.align(), totalWidth = this.getWidth(), letterSpacing = this.letterSpacing(), fill = this.fill(), textDecoration = this.textDecoration(), shouldUnderline = textDecoration.indexOf("underline") !== -1, shouldLineThrough = textDecoration.indexOf("line-through") !== -1;
                    var translateY = 0;
                    translateY = lineHeightPx / 2;
                    var lineTranslateX = 0;
                    var lineTranslateY = 0;
                    context.setAttr("font", this._getContextFont());
                    context.setAttr("textBaseline", MIDDLE);
                    context.setAttr("textAlign", LEFT);
                    if (verticalAlign === MIDDLE) alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2; else if (verticalAlign === BOTTOM) alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
                    context.translate(padding, alignY + padding);
                    for (n = 0; n < textArrLen; n++) {
                        lineTranslateX = 0;
                        lineTranslateY = 0;
                        var spacesNumber, oneWord, lineWidth, obj = textArr[n], text = obj.text, width = obj.width, lastLine = n !== textArrLen - 1;
                        context.save();
                        if (align === RIGHT) lineTranslateX += totalWidth - width - padding * 2; else if (align === CENTER) lineTranslateX += (totalWidth - width - padding * 2) / 2;
                        if (shouldUnderline) {
                            context.save();
                            context.beginPath();
                            context.moveTo(lineTranslateX, translateY + lineTranslateY + Math.round(fontSize / 2));
                            spacesNumber = text.split(" ").length - 1;
                            oneWord = spacesNumber === 0;
                            lineWidth = align === JUSTIFY && lastLine && !oneWord ? totalWidth - padding * 2 : width;
                            context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY + Math.round(fontSize / 2));
                            context.lineWidth = fontSize / 15;
                            context.strokeStyle = fill;
                            context.stroke();
                            context.restore();
                        }
                        if (shouldLineThrough) {
                            context.save();
                            context.beginPath();
                            context.moveTo(lineTranslateX, translateY + lineTranslateY);
                            spacesNumber = text.split(" ").length - 1;
                            oneWord = spacesNumber === 0;
                            lineWidth = align === JUSTIFY && lastLine && !oneWord ? totalWidth - padding * 2 : width;
                            context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY);
                            context.lineWidth = fontSize / 15;
                            context.strokeStyle = fill;
                            context.stroke();
                            context.restore();
                        }
                        if (letterSpacing !== 0 || align === JUSTIFY) {
                            spacesNumber = text.split(" ").length - 1;
                            for (var li = 0; li < text.length; li++) {
                                var letter = text[li];
                                if (letter === " " && n !== textArrLen - 1 && align === JUSTIFY) lineTranslateX += Math.floor((totalWidth - padding * 2 - width) / spacesNumber);
                                this._partialTextX = lineTranslateX;
                                this._partialTextY = translateY + lineTranslateY;
                                this._partialText = letter;
                                context.fillStrokeShape(this);
                                lineTranslateX += Math.round(this.measureSize(letter).width) + letterSpacing;
                            }
                        } else {
                            this._partialTextX = lineTranslateX;
                            this._partialTextY = translateY + lineTranslateY;
                            this._partialText = text;
                            context.fillStrokeShape(this);
                        }
                        context.restore();
                        if (textArrLen > 1) translateY += lineHeightPx;
                    }
                };
                Text.prototype._hitFunc = function(context) {
                    var width = this.getWidth(), height = this.getHeight();
                    context.beginPath();
                    context.rect(0, 0, width, height);
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Text.prototype.setText = function(text) {
                    var str = Util_1.Util._isString(text) ? text : text === null || text === void 0 ? "" : text + "";
                    this._setAttr(TEXT, str);
                    return this;
                };
                Text.prototype.getWidth = function() {
                    var isAuto = this.attrs.width === AUTO || this.attrs.width === void 0;
                    return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
                };
                Text.prototype.getHeight = function() {
                    var isAuto = this.attrs.height === AUTO || this.attrs.height === void 0;
                    return isAuto ? this.fontSize() * this.textArr.length * this.lineHeight() + this.padding() * 2 : this.attrs.height;
                };
                Text.prototype.getTextWidth = function() {
                    return this.textWidth;
                };
                Text.prototype.getTextHeight = function() {
                    Util_1.Util.warn("text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.");
                    return this.textHeight;
                };
                Text.prototype.measureSize = function(text) {
                    var metrics, _context = getDummyContext(), fontSize = this.fontSize();
                    _context.save();
                    _context.font = this._getContextFont();
                    metrics = _context.measureText(text);
                    _context.restore();
                    return {
                        width: metrics.width,
                        height: fontSize
                    };
                };
                Text.prototype._getContextFont = function() {
                    if (Global_1.Konva.UA.isIE) return this.fontStyle() + SPACE + this.fontSize() + PX_SPACE + this.fontFamily();
                    return this.fontStyle() + SPACE + this.fontVariant() + SPACE + this.fontSize() + PX_SPACE + this.fontFamily();
                };
                Text.prototype._addTextLine = function(line) {
                    if (this.align() === JUSTIFY) line = line.trim();
                    var width = this._getTextWidth(line);
                    return this.textArr.push({
                        text: line,
                        width
                    });
                };
                Text.prototype._getTextWidth = function(text) {
                    var letterSpacing = this.letterSpacing();
                    var length = text.length;
                    return getDummyContext().measureText(text).width + (length ? letterSpacing * (length - 1) : 0);
                };
                Text.prototype._setTextData = function() {
                    var lines = this.text().split("\n"), fontSize = +this.fontSize(), textWidth = 0, lineHeightPx = this.lineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO && width !== void 0, fixedHeight = height !== AUTO && height !== void 0, padding = this.padding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap = this.wrap(), shouldWrap = wrap !== NONE, wrapAtWord = wrap !== CHAR && shouldWrap, shouldAddEllipsis = this.ellipsis() && !shouldWrap;
                    this.textArr = [];
                    getDummyContext().font = this._getContextFont();
                    var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0;
                    for (var i = 0, max = lines.length; i < max; ++i) {
                        var line = lines[i];
                        var lineWidth = this._getTextWidth(line);
                        if (fixedWidth && lineWidth > maxWidth) while (line.length > 0) {
                            var low = 0, high = line.length, match = "", matchWidth = 0;
                            while (low < high) {
                                var mid = low + high >>> 1, substr = line.slice(0, mid + 1), substrWidth = this._getTextWidth(substr) + additionalWidth;
                                if (substrWidth <= maxWidth) {
                                    low = mid + 1;
                                    match = substr + (shouldAddEllipsis ? ELLIPSIS : "");
                                    matchWidth = substrWidth;
                                } else high = mid;
                            }
                            if (match) {
                                if (wrapAtWord) {
                                    var wrapIndex;
                                    var nextChar = line[match.length];
                                    var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
                                    if (nextIsSpaceOrDash && matchWidth <= maxWidth) wrapIndex = match.length; else wrapIndex = Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
                                    if (wrapIndex > 0) {
                                        low = wrapIndex;
                                        match = match.slice(0, low);
                                        matchWidth = this._getTextWidth(match);
                                    }
                                }
                                match = match.trimRight();
                                this._addTextLine(match);
                                textWidth = Math.max(textWidth, matchWidth);
                                currentHeightPx += lineHeightPx;
                                if (!shouldWrap || fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) break;
                                line = line.slice(low);
                                line = line.trimLeft();
                                if (line.length > 0) {
                                    lineWidth = this._getTextWidth(line);
                                    if (lineWidth <= maxWidth) {
                                        this._addTextLine(line);
                                        currentHeightPx += lineHeightPx;
                                        textWidth = Math.max(textWidth, lineWidth);
                                        break;
                                    }
                                }
                            } else break;
                        } else {
                            this._addTextLine(line);
                            currentHeightPx += lineHeightPx;
                            textWidth = Math.max(textWidth, lineWidth);
                        }
                        if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) break;
                    }
                    this.textHeight = fontSize;
                    this.textWidth = textWidth;
                };
                Text.prototype.getStrokeScaleEnabled = function() {
                    return true;
                };
                return Text;
            }(Shape_1.Shape);
            exports.Text = Text;
            Text.prototype._fillFunc = _fillFunc;
            Text.prototype._strokeFunc = _strokeFunc;
            Text.prototype.className = TEXT_UPPER;
            Text.prototype._attrsAffectingSize = [ "text", "fontSize", "padding", "wrap", "lineHeight" ];
            Global_2._registerNode(Text);
            Factory_1.Factory.overWriteSetter(Text, "width", Validators_1.getNumberOrAutoValidator());
            Factory_1.Factory.overWriteSetter(Text, "height", Validators_1.getNumberOrAutoValidator());
            Factory_1.Factory.addGetterSetter(Text, "fontFamily", "Arial");
            Factory_1.Factory.addGetterSetter(Text, "fontSize", 12, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Text, "fontStyle", NORMAL);
            Factory_1.Factory.addGetterSetter(Text, "fontVariant", NORMAL);
            Factory_1.Factory.addGetterSetter(Text, "padding", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Text, "align", LEFT);
            Factory_1.Factory.addGetterSetter(Text, "verticalAlign", TOP);
            Factory_1.Factory.addGetterSetter(Text, "lineHeight", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Text, "wrap", WORD);
            Factory_1.Factory.addGetterSetter(Text, "ellipsis", false);
            Factory_1.Factory.addGetterSetter(Text, "letterSpacing", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Text, "text", "", Validators_1.getStringValidator());
            Factory_1.Factory.addGetterSetter(Text, "textDecoration", "");
            Util_1.Collection.mapMethods(Text);
        },
        9421: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Path_1 = __webpack_require__(2698);
            var Text_1 = __webpack_require__(6658);
            var Validators_1 = __webpack_require__(4783);
            var Global_1 = __webpack_require__(9427);
            var EMPTY_STRING = "", NORMAL = "normal";
            function _fillFunc(context) {
                context.fillText(this.partialText, 0, 0);
            }
            function _strokeFunc(context) {
                context.strokeText(this.partialText, 0, 0);
            }
            var TextPath = function(_super) {
                __extends(TextPath, _super);
                function TextPath(config) {
                    var _this = _super.call(this, config) || this;
                    _this.dummyCanvas = Util_1.Util.createCanvasElement();
                    _this.dataArray = [];
                    _this.dataArray = Path_1.Path.parsePathData(_this.attrs.data);
                    _this.on("dataChange.konva", (function() {
                        this.dataArray = Path_1.Path.parsePathData(this.attrs.data);
                        this._setTextData();
                    }));
                    _this.on("textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva", _this._setTextData);
                    if (config && config["getKerning"]) {
                        Util_1.Util.warn('getKerning TextPath API is deprecated. Please use "kerningFunc" instead.');
                        _this.kerningFunc(config["getKerning"]);
                    }
                    _this._setTextData();
                    return _this;
                }
                TextPath.prototype._sceneFunc = function(context) {
                    context.setAttr("font", this._getContextFont());
                    context.setAttr("textBaseline", this.textBaseline());
                    context.setAttr("textAlign", "left");
                    context.save();
                    var textDecoration = this.textDecoration();
                    var fill = this.fill();
                    var fontSize = this.fontSize();
                    var glyphInfo = this.glyphInfo;
                    if (textDecoration === "underline") context.beginPath();
                    for (var i = 0; i < glyphInfo.length; i++) {
                        context.save();
                        var p0 = glyphInfo[i].p0;
                        context.translate(p0.x, p0.y);
                        context.rotate(glyphInfo[i].rotation);
                        this.partialText = glyphInfo[i].text;
                        context.fillStrokeShape(this);
                        if (textDecoration === "underline") {
                            if (i === 0) context.moveTo(0, fontSize / 2 + 1);
                            context.lineTo(fontSize, fontSize / 2 + 1);
                        }
                        context.restore();
                    }
                    if (textDecoration === "underline") {
                        context.strokeStyle = fill;
                        context.lineWidth = fontSize / 20;
                        context.stroke();
                    }
                    context.restore();
                };
                TextPath.prototype._hitFunc = function(context) {
                    context.beginPath();
                    var glyphInfo = this.glyphInfo;
                    if (glyphInfo.length >= 1) {
                        var p0 = glyphInfo[0].p0;
                        context.moveTo(p0.x, p0.y);
                    }
                    for (var i = 0; i < glyphInfo.length; i++) {
                        var p1 = glyphInfo[i].p1;
                        context.lineTo(p1.x, p1.y);
                    }
                    context.setAttr("lineWidth", this.fontSize());
                    context.setAttr("strokeStyle", this.colorKey);
                    context.stroke();
                };
                TextPath.prototype.getTextWidth = function() {
                    return this.textWidth;
                };
                TextPath.prototype.getTextHeight = function() {
                    Util_1.Util.warn("text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.");
                    return this.textHeight;
                };
                TextPath.prototype.setText = function(text) {
                    return Text_1.Text.prototype.setText.call(this, text);
                };
                TextPath.prototype._getContextFont = function() {
                    return Text_1.Text.prototype._getContextFont.call(this);
                };
                TextPath.prototype._getTextSize = function(text) {
                    var dummyCanvas = this.dummyCanvas;
                    var _context = dummyCanvas.getContext("2d");
                    _context.save();
                    _context.font = this._getContextFont();
                    var metrics = _context.measureText(text);
                    _context.restore();
                    return {
                        width: metrics.width,
                        height: parseInt(this.attrs.fontSize, 10)
                    };
                };
                TextPath.prototype._setTextData = function() {
                    var that = this;
                    var size = this._getTextSize(this.attrs.text);
                    var letterSpacing = this.letterSpacing();
                    var align = this.align();
                    var kerningFunc = this.kerningFunc();
                    this.textWidth = size.width;
                    this.textHeight = size.height;
                    var textFullWidth = Math.max(this.textWidth + ((this.attrs.text || "").length - 1) * letterSpacing, 0);
                    this.glyphInfo = [];
                    var fullPathWidth = 0;
                    for (var l = 0; l < that.dataArray.length; l++) if (that.dataArray[l].pathLength > 0) fullPathWidth += that.dataArray[l].pathLength;
                    var offset = 0;
                    if (align === "center") offset = Math.max(0, fullPathWidth / 2 - textFullWidth / 2);
                    if (align === "right") offset = Math.max(0, fullPathWidth - textFullWidth);
                    var charArr = this.text().split("");
                    var spacesNumber = this.text().split(" ").length - 1;
                    var p0, p1, pathCmd;
                    var pIndex = -1;
                    var currentT = 0;
                    var getNextPathSegment = function() {
                        currentT = 0;
                        var pathData = that.dataArray;
                        for (var j = pIndex + 1; j < pathData.length; j++) if (pathData[j].pathLength > 0) {
                            pIndex = j;
                            return pathData[j];
                        } else if (pathData[j].command === "M") p0 = {
                            x: pathData[j].points[0],
                            y: pathData[j].points[1]
                        };
                        return {};
                    };
                    var findSegmentToFitCharacter = function(c) {
                        var glyphWidth = that._getTextSize(c).width + letterSpacing;
                        if (c === " " && align === "justify") glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
                        var currLen = 0;
                        var attempts = 0;
                        p1 = void 0;
                        while (Math.abs(glyphWidth - currLen) / glyphWidth > .01 && attempts < 25) {
                            attempts++;
                            var cumulativePathLength = currLen;
                            while (pathCmd === void 0) {
                                pathCmd = getNextPathSegment();
                                if (pathCmd && cumulativePathLength + pathCmd.pathLength < glyphWidth) {
                                    cumulativePathLength += pathCmd.pathLength;
                                    pathCmd = void 0;
                                }
                            }
                            if (pathCmd === {} || p0 === void 0) return;
                            var needNewSegment = false;
                            switch (pathCmd.command) {
                              case "L":
                                if (Path_1.Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) p1 = Path_1.Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y); else pathCmd = void 0;
                                break;

                              case "A":
                                var start = pathCmd.points[4];
                                var dTheta = pathCmd.points[5];
                                var end = pathCmd.points[4] + dTheta;
                                if (currentT === 0) currentT = start + 1e-8; else if (glyphWidth > currLen) currentT += Math.PI / 180 * dTheta / Math.abs(dTheta); else currentT -= Math.PI / 360 * dTheta / Math.abs(dTheta);
                                if (dTheta < 0 && currentT < end || dTheta >= 0 && currentT > end) {
                                    currentT = end;
                                    needNewSegment = true;
                                }
                                p1 = Path_1.Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                                break;

                              case "C":
                                if (currentT === 0) if (glyphWidth > pathCmd.pathLength) currentT = 1e-8; else currentT = glyphWidth / pathCmd.pathLength; else if (glyphWidth > currLen) currentT += (glyphWidth - currLen) / pathCmd.pathLength; else currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                                if (currentT > 1) {
                                    currentT = 1;
                                    needNewSegment = true;
                                }
                                p1 = Path_1.Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                                break;

                              case "Q":
                                if (currentT === 0) currentT = glyphWidth / pathCmd.pathLength; else if (glyphWidth > currLen) currentT += (glyphWidth - currLen) / pathCmd.pathLength; else currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                                if (currentT > 1) {
                                    currentT = 1;
                                    needNewSegment = true;
                                }
                                p1 = Path_1.Path.getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3]);
                                break;
                            }
                            if (p1 !== void 0) currLen = Path_1.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                            if (needNewSegment) {
                                needNewSegment = false;
                                pathCmd = void 0;
                            }
                        }
                    };
                    var testChar = "C";
                    var glyphWidth = that._getTextSize(testChar).width + letterSpacing;
                    var lettersInOffset = offset / glyphWidth - 1;
                    for (var k = 0; k < lettersInOffset; k++) {
                        findSegmentToFitCharacter(testChar);
                        if (p0 === void 0 || p1 === void 0) break;
                        p0 = p1;
                    }
                    for (var i = 0; i < charArr.length; i++) {
                        findSegmentToFitCharacter(charArr[i]);
                        if (p0 === void 0 || p1 === void 0) break;
                        var width = Path_1.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                        var kern = 0;
                        if (kerningFunc) try {
                            kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
                        } catch (e) {
                            kern = 0;
                        }
                        p0.x += kern;
                        p1.x += kern;
                        this.textWidth += kern;
                        var midpoint = Path_1.Path.getPointOnLine(kern + width / 2, p0.x, p0.y, p1.x, p1.y);
                        var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
                        this.glyphInfo.push({
                            transposeX: midpoint.x,
                            transposeY: midpoint.y,
                            text: charArr[i],
                            rotation,
                            p0,
                            p1
                        });
                        p0 = p1;
                    }
                };
                TextPath.prototype.getSelfRect = function() {
                    if (!this.glyphInfo.length) return {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                    var points = [];
                    this.glyphInfo.forEach((function(info) {
                        points.push(info.p0.x);
                        points.push(info.p0.y);
                        points.push(info.p1.x);
                        points.push(info.p1.y);
                    }));
                    var minX = points[0] || 0;
                    var maxX = points[0] || 0;
                    var minY = points[1] || 0;
                    var maxY = points[1] || 0;
                    var x, y;
                    for (var i = 0; i < points.length / 2; i++) {
                        x = points[i * 2];
                        y = points[i * 2 + 1];
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                    var fontSize = this.fontSize();
                    return {
                        x: minX - fontSize / 2,
                        y: minY - fontSize / 2,
                        width: maxX - minX + fontSize,
                        height: maxY - minY + fontSize
                    };
                };
                return TextPath;
            }(Shape_1.Shape);
            exports.TextPath = TextPath;
            TextPath.prototype._fillFunc = _fillFunc;
            TextPath.prototype._strokeFunc = _strokeFunc;
            TextPath.prototype._fillFuncHit = _fillFunc;
            TextPath.prototype._strokeFuncHit = _strokeFunc;
            TextPath.prototype.className = "TextPath";
            TextPath.prototype._attrsAffectingSize = [ "text", "fontSize", "data" ];
            Global_1._registerNode(TextPath);
            Factory_1.Factory.addGetterSetter(TextPath, "data");
            Factory_1.Factory.addGetterSetter(TextPath, "fontFamily", "Arial");
            Factory_1.Factory.addGetterSetter(TextPath, "fontSize", 12, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(TextPath, "fontStyle", NORMAL);
            Factory_1.Factory.addGetterSetter(TextPath, "align", "left");
            Factory_1.Factory.addGetterSetter(TextPath, "letterSpacing", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(TextPath, "textBaseline", "middle");
            Factory_1.Factory.addGetterSetter(TextPath, "fontVariant", NORMAL);
            Factory_1.Factory.addGetterSetter(TextPath, "text", EMPTY_STRING);
            Factory_1.Factory.addGetterSetter(TextPath, "textDecoration", null);
            Factory_1.Factory.addGetterSetter(TextPath, "kerningFunc", null);
            Util_1.Collection.mapMethods(TextPath);
        },
        7214: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            var __assign = this && this.__assign || function() {
                __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                        s = arguments[i];
                        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                    }
                    return t;
                };
                return __assign.apply(this, arguments);
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Node_1 = __webpack_require__(5924);
            var Shape_1 = __webpack_require__(9071);
            var Rect_1 = __webpack_require__(3815);
            var Group_1 = __webpack_require__(9625);
            var Global_1 = __webpack_require__(9427);
            var Validators_1 = __webpack_require__(4783);
            var Global_2 = __webpack_require__(9427);
            var EVENTS_NAME = "tr-konva";
            var ATTR_CHANGE_LIST = [ "resizeEnabledChange", "rotateAnchorOffsetChange", "rotateEnabledChange", "enabledAnchorsChange", "anchorSizeChange", "borderEnabledChange", "borderStrokeChange", "borderStrokeWidthChange", "borderDashChange", "anchorStrokeChange", "anchorStrokeWidthChange", "anchorFillChange", "anchorCornerRadiusChange", "ignoreStrokeChange" ].map((function(e) {
                return e + "." + EVENTS_NAME;
            })).join(" ");
            var NODES_RECT = "nodesRect";
            var TRANSFORM_CHANGE_STR = [ "widthChange", "heightChange", "scaleXChange", "scaleYChange", "skewXChange", "skewYChange", "rotationChange", "offsetXChange", "offsetYChange", "transformsEnabledChange", "strokeWidthChange" ].map((function(e) {
                return e + "." + EVENTS_NAME;
            })).join(" ");
            var ANGLES = {
                "top-left": -45,
                "top-center": 0,
                "top-right": 45,
                "middle-right": -90,
                "middle-left": 90,
                "bottom-left": -135,
                "bottom-center": 180,
                "bottom-right": 135
            };
            var TOUCH_DEVICE = "ontouchstart" in Global_1.Konva._global;
            function getCursor(anchorName, rad) {
                if (anchorName === "rotater") return "crosshair";
                rad += Util_1.Util._degToRad(ANGLES[anchorName] || 0);
                var angle = (Util_1.Util._radToDeg(rad) % 360 + 360) % 360;
                if (Util_1.Util._inRange(angle, 315 + 22.5, 360) || Util_1.Util._inRange(angle, 0, 22.5)) return "ns-resize"; else if (Util_1.Util._inRange(angle, 45 - 22.5, 45 + 22.5)) return "nesw-resize"; else if (Util_1.Util._inRange(angle, 90 - 22.5, 90 + 22.5)) return "ew-resize"; else if (Util_1.Util._inRange(angle, 135 - 22.5, 135 + 22.5)) return "nwse-resize"; else if (Util_1.Util._inRange(angle, 180 - 22.5, 180 + 22.5)) return "ns-resize"; else if (Util_1.Util._inRange(angle, 225 - 22.5, 225 + 22.5)) return "nesw-resize"; else if (Util_1.Util._inRange(angle, 270 - 22.5, 270 + 22.5)) return "ew-resize"; else if (Util_1.Util._inRange(angle, 315 - 22.5, 315 + 22.5)) return "nwse-resize"; else {
                    Util_1.Util.error("Transformer has unknown angle for cursor detection: " + angle);
                    return "pointer";
                }
            }
            var ANCHORS_NAMES = [ "top-left", "top-center", "top-right", "middle-right", "middle-left", "bottom-left", "bottom-center", "bottom-right" ];
            var MAX_SAFE_INTEGER = 1e8;
            function getCenter(shape) {
                return {
                    x: shape.x + shape.width / 2 * Math.cos(shape.rotation) + shape.height / 2 * Math.sin(-shape.rotation),
                    y: shape.y + shape.height / 2 * Math.cos(shape.rotation) + shape.width / 2 * Math.sin(shape.rotation)
                };
            }
            function rotateAroundPoint(shape, angleRad, point) {
                var x = point.x + (shape.x - point.x) * Math.cos(angleRad) - (shape.y - point.y) * Math.sin(angleRad);
                var y = point.y + (shape.x - point.x) * Math.sin(angleRad) + (shape.y - point.y) * Math.cos(angleRad);
                return __assign(__assign({}, shape), {
                    rotation: shape.rotation + angleRad,
                    x,
                    y
                });
            }
            function rotateAroundCenter(shape, deltaRad) {
                var center = getCenter(shape);
                return rotateAroundPoint(shape, deltaRad, center);
            }
            function getSnap(snaps, newRotationRad, tol) {
                var snapped = newRotationRad;
                for (var i = 0; i < snaps.length; i++) {
                    var angle = Global_1.Konva.getAngle(snaps[i]);
                    var absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
                    var dif = Math.min(absDiff, Math.PI * 2 - absDiff);
                    if (dif < tol) snapped = angle;
                }
                return snapped;
            }
            var Transformer = function(_super) {
                __extends(Transformer, _super);
                function Transformer(config) {
                    var _this = _super.call(this, config) || this;
                    _this._transforming = false;
                    _this._createElements();
                    _this._handleMouseMove = _this._handleMouseMove.bind(_this);
                    _this._handleMouseUp = _this._handleMouseUp.bind(_this);
                    _this.update = _this.update.bind(_this);
                    _this.on(ATTR_CHANGE_LIST, _this.update);
                    if (_this.getNode()) _this.update();
                    return _this;
                }
                Transformer.prototype.attachTo = function(node) {
                    this.setNode(node);
                    return this;
                };
                Transformer.prototype.setNode = function(node) {
                    Util_1.Util.warn("tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.");
                    return this.setNodes([ node ]);
                };
                Transformer.prototype.getNode = function() {
                    return this._nodes && this._nodes[0];
                };
                Transformer.prototype.setNodes = function(nodes) {
                    var _this = this;
                    if (nodes === void 0) nodes = [];
                    if (this._nodes && this._nodes.length) this.detach();
                    this._nodes = nodes;
                    if (nodes.length === 1) this.rotation(nodes[0].rotation()); else this.rotation(0);
                    this._nodes.forEach((function(node) {
                        var additionalEvents = node._attrsAffectingSize.map((function(prop) {
                            return prop + "Change." + EVENTS_NAME;
                        })).join(" ");
                        var onChange = function() {
                            _this._resetTransformCache();
                            if (!_this._transforming) _this.update();
                        };
                        node.on(additionalEvents, onChange);
                        node.on(TRANSFORM_CHANGE_STR, onChange);
                        node.on("_clearTransformCache." + EVENTS_NAME, onChange);
                        node.on("xChange." + EVENTS_NAME + " yChange." + EVENTS_NAME, onChange);
                        _this._proxyDrag(node);
                    }));
                    this._resetTransformCache();
                    var elementsCreated = !!this.findOne(".top-left");
                    if (elementsCreated) this.update();
                    return this;
                };
                Transformer.prototype._proxyDrag = function(node) {
                    var _this = this;
                    var lastPos;
                    node.on("dragstart." + EVENTS_NAME, (function() {
                        lastPos = node.getAbsolutePosition();
                    }));
                    node.on("dragmove." + EVENTS_NAME, (function() {
                        if (!lastPos) return;
                        var abs = node.getAbsolutePosition();
                        var dx = abs.x - lastPos.x;
                        var dy = abs.y - lastPos.y;
                        _this.nodes().forEach((function(otherNode) {
                            if (otherNode === node) return;
                            if (otherNode.isDragging()) return;
                            var otherAbs = otherNode.getAbsolutePosition();
                            otherNode.setAbsolutePosition({
                                x: otherAbs.x + dx,
                                y: otherAbs.y + dy
                            });
                            otherNode.startDrag();
                        }));
                        lastPos = null;
                    }));
                };
                Transformer.prototype.getNodes = function() {
                    return this._nodes;
                };
                Transformer.prototype.getActiveAnchor = function() {
                    return this._movingAnchorName;
                };
                Transformer.prototype.detach = function() {
                    if (this._nodes) this._nodes.forEach((function(node) {
                        node.off("." + EVENTS_NAME);
                    }));
                    this._nodes = [];
                    this._resetTransformCache();
                };
                Transformer.prototype._resetTransformCache = function() {
                    this._clearCache(NODES_RECT);
                    this._clearCache("transform");
                    this._clearSelfAndDescendantCache("absoluteTransform");
                };
                Transformer.prototype._getNodeRect = function() {
                    return this._getCache(NODES_RECT, this.__getNodeRect);
                };
                Transformer.prototype.__getNodeShape = function(node, rot, relative) {
                    if (rot === void 0) rot = this.rotation();
                    var rect = node.getClientRect({
                        skipTransform: true,
                        skipShadow: true,
                        skipStroke: this.ignoreStroke()
                    });
                    var absScale = node.getAbsoluteScale(relative);
                    var absPos = node.getAbsolutePosition(relative);
                    var dx = rect.x * absScale.x - node.offsetX() * absScale.x;
                    var dy = rect.y * absScale.y - node.offsetY() * absScale.y;
                    var rotation = (Global_1.Konva.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) % (Math.PI * 2);
                    var box = {
                        x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
                        y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
                        width: rect.width * absScale.x,
                        height: rect.height * absScale.y,
                        rotation
                    };
                    return rotateAroundPoint(box, -Global_1.Konva.getAngle(rot), {
                        x: 0,
                        y: 0
                    });
                };
                Transformer.prototype.__getNodeRect = function() {
                    var _this = this;
                    var node = this.getNode();
                    if (!node) return {
                        x: -MAX_SAFE_INTEGER,
                        y: -MAX_SAFE_INTEGER,
                        width: 0,
                        height: 0,
                        rotation: 0
                    };
                    var totalPoints = [];
                    this.nodes().map((function(node) {
                        var box = node.getClientRect({
                            skipTransform: true,
                            skipShadow: true,
                            skipStroke: _this.ignoreStroke()
                        });
                        var points = [ {
                            x: box.x,
                            y: box.y
                        }, {
                            x: box.x + box.width,
                            y: box.y
                        }, {
                            x: box.x + box.width,
                            y: box.y + box.height
                        }, {
                            x: box.x,
                            y: box.y + box.height
                        } ];
                        var trans = node.getAbsoluteTransform();
                        points.forEach((function(point) {
                            var transformed = trans.point(point);
                            totalPoints.push(transformed);
                        }));
                    }));
                    var tr = new Util_1.Transform;
                    tr.rotate(-Global_1.Konva.getAngle(this.rotation()));
                    var minX, minY, maxX, maxY;
                    totalPoints.forEach((function(point) {
                        var transformed = tr.point(point);
                        if (minX === void 0) {
                            minX = maxX = transformed.x;
                            minY = maxY = transformed.y;
                        }
                        minX = Math.min(minX, transformed.x);
                        minY = Math.min(minY, transformed.y);
                        maxX = Math.max(maxX, transformed.x);
                        maxY = Math.max(maxY, transformed.y);
                    }));
                    tr.invert();
                    var p = tr.point({
                        x: minX,
                        y: minY
                    });
                    return {
                        x: p.x,
                        y: p.y,
                        width: maxX - minX,
                        height: maxY - minY,
                        rotation: Global_1.Konva.getAngle(this.rotation())
                    };
                };
                Transformer.prototype.getX = function() {
                    return this._getNodeRect().x;
                };
                Transformer.prototype.getY = function() {
                    return this._getNodeRect().y;
                };
                Transformer.prototype.getWidth = function() {
                    return this._getNodeRect().width;
                };
                Transformer.prototype.getHeight = function() {
                    return this._getNodeRect().height;
                };
                Transformer.prototype._createElements = function() {
                    this._createBack();
                    ANCHORS_NAMES.forEach(function(name) {
                        this._createAnchor(name);
                    }.bind(this));
                    this._createAnchor("rotater");
                };
                Transformer.prototype._createAnchor = function(name) {
                    var _this = this;
                    var anchor = new Rect_1.Rect({
                        stroke: "rgb(0, 161, 255)",
                        fill: "white",
                        strokeWidth: 1,
                        name: name + " _anchor",
                        dragDistance: 0,
                        draggable: true,
                        hitStrokeWidth: TOUCH_DEVICE ? 10 : "auto"
                    });
                    var self = this;
                    anchor.on("mousedown touchstart", (function(e) {
                        self._handleMouseDown(e);
                    }));
                    anchor.on("dragstart", (function(e) {
                        anchor.stopDrag();
                        e.cancelBubble = true;
                    }));
                    anchor.on("dragend", (function(e) {
                        e.cancelBubble = true;
                    }));
                    anchor.on("mouseenter", (function() {
                        var rad = Global_1.Konva.getAngle(_this.rotation());
                        var cursor = getCursor(name, rad);
                        anchor.getStage().content.style.cursor = cursor;
                        _this._cursorChange = true;
                    }));
                    anchor.on("mouseout", (function() {
                        anchor.getStage().content.style.cursor = "";
                        _this._cursorChange = false;
                    }));
                    this.add(anchor);
                };
                Transformer.prototype._createBack = function() {
                    var _this = this;
                    var back = new Shape_1.Shape({
                        name: "back",
                        width: 0,
                        height: 0,
                        draggable: true,
                        sceneFunc: function(ctx) {
                            var tr = this.getParent();
                            var padding = tr.padding();
                            ctx.beginPath();
                            ctx.rect(-padding, -padding, this.width() + padding * 2, this.height() + padding * 2);
                            ctx.moveTo(this.width() / 2, -padding);
                            if (tr.rotateEnabled()) ctx.lineTo(this.width() / 2, -tr.rotateAnchorOffset() * Util_1.Util._sign(this.height()) - padding);
                            ctx.fillStrokeShape(this);
                        },
                        hitFunc: function(ctx, shape) {
                            if (!_this.shouldOverdrawWholeArea()) return;
                            var padding = _this.padding();
                            ctx.beginPath();
                            ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
                            ctx.fillStrokeShape(shape);
                        }
                    });
                    this.add(back);
                    this._proxyDrag(back);
                };
                Transformer.prototype._handleMouseDown = function(e) {
                    this._movingAnchorName = e.target.name().split(" ")[0];
                    var attrs = this._getNodeRect();
                    var width = attrs.width;
                    var height = attrs.height;
                    var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
                    this.sin = Math.abs(height / hypotenuse);
                    this.cos = Math.abs(width / hypotenuse);
                    window.addEventListener("mousemove", this._handleMouseMove);
                    window.addEventListener("touchmove", this._handleMouseMove);
                    window.addEventListener("mouseup", this._handleMouseUp, true);
                    window.addEventListener("touchend", this._handleMouseUp, true);
                    this._transforming = true;
                    var ap = e.target.getAbsolutePosition();
                    var pos = e.target.getStage().getPointerPosition();
                    this._anchorDragOffset = {
                        x: pos.x - ap.x,
                        y: pos.y - ap.y
                    };
                    this._fire("transformstart", {
                        evt: e,
                        target: this.getNode()
                    });
                    this.getNode()._fire("transformstart", {
                        evt: e,
                        target: this.getNode()
                    });
                };
                Transformer.prototype._handleMouseMove = function(e) {
                    var x, y, newHypotenuse;
                    var anchorNode = this.findOne("." + this._movingAnchorName);
                    var stage = anchorNode.getStage();
                    stage.setPointersPositions(e);
                    var pp = stage.getPointerPosition();
                    var newNodePos = {
                        x: pp.x - this._anchorDragOffset.x,
                        y: pp.y - this._anchorDragOffset.y
                    };
                    var oldAbs = anchorNode.getAbsolutePosition();
                    anchorNode.setAbsolutePosition(newNodePos);
                    var newAbs = anchorNode.getAbsolutePosition();
                    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) return;
                    if (this._movingAnchorName === "rotater") {
                        var attrs = this._getNodeRect();
                        x = anchorNode.x() - attrs.width / 2;
                        y = -anchorNode.y() + attrs.height / 2;
                        var delta = Math.atan2(-y, x) + Math.PI / 2;
                        if (attrs.height < 0) delta -= Math.PI;
                        var oldRotation = Global_1.Konva.getAngle(this.rotation());
                        var newRotation = oldRotation + delta;
                        var tol = Global_1.Konva.getAngle(this.rotationSnapTolerance());
                        var snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);
                        var diff = snappedRot - attrs.rotation;
                        var shape = rotateAroundCenter(attrs, diff);
                        this._fitNodesInto(shape, e);
                        return;
                    }
                    var keepProportion = this.keepRatio() || e.shiftKey;
                    var centeredScaling = this.centeredScaling() || e.altKey;
                    if (this._movingAnchorName === "top-left") {
                        if (keepProportion) {
                            var comparePoint = centeredScaling ? {
                                x: this.width() / 2,
                                y: this.height() / 2
                            } : {
                                x: this.findOne(".bottom-right").x(),
                                y: this.findOne(".bottom-right").y()
                            };
                            newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) + Math.pow(comparePoint.y - anchorNode.y(), 2));
                            var reverseX = this.findOne(".top-left").x() > comparePoint.x ? -1 : 1;
                            var reverseY = this.findOne(".top-left").y() > comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            this.findOne(".top-left").x(comparePoint.x - x);
                            this.findOne(".top-left").y(comparePoint.y - y);
                        }
                    } else if (this._movingAnchorName === "top-center") this.findOne(".top-left").y(anchorNode.y()); else if (this._movingAnchorName === "top-right") {
                        if (keepProportion) {
                            comparePoint = centeredScaling ? {
                                x: this.width() / 2,
                                y: this.height() / 2
                            } : {
                                x: this.findOne(".bottom-left").x(),
                                y: this.findOne(".bottom-left").y()
                            };
                            newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(comparePoint.y - anchorNode.y(), 2));
                            reverseX = this.findOne(".top-right").x() < comparePoint.x ? -1 : 1;
                            reverseY = this.findOne(".top-right").y() > comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            this.findOne(".top-right").x(comparePoint.x + x);
                            this.findOne(".top-right").y(comparePoint.y - y);
                        }
                        var pos = anchorNode.position();
                        this.findOne(".top-left").y(pos.y);
                        this.findOne(".bottom-right").x(pos.x);
                    } else if (this._movingAnchorName === "middle-left") this.findOne(".top-left").x(anchorNode.x()); else if (this._movingAnchorName === "middle-right") this.findOne(".bottom-right").x(anchorNode.x()); else if (this._movingAnchorName === "bottom-left") {
                        if (keepProportion) {
                            comparePoint = centeredScaling ? {
                                x: this.width() / 2,
                                y: this.height() / 2
                            } : {
                                x: this.findOne(".top-right").x(),
                                y: this.findOne(".top-right").y()
                            };
                            newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) + Math.pow(anchorNode.y() - comparePoint.y, 2));
                            reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;
                            reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            anchorNode.x(comparePoint.x - x);
                            anchorNode.y(comparePoint.y + y);
                        }
                        pos = anchorNode.position();
                        this.findOne(".top-left").x(pos.x);
                        this.findOne(".bottom-right").y(pos.y);
                    } else if (this._movingAnchorName === "bottom-center") this.findOne(".bottom-right").y(anchorNode.y()); else if (this._movingAnchorName === "bottom-right") {
                        if (keepProportion) {
                            comparePoint = centeredScaling ? {
                                x: this.width() / 2,
                                y: this.height() / 2
                            } : {
                                x: this.findOne(".top-left").x(),
                                y: this.findOne(".top-left").y()
                            };
                            newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(anchorNode.y() - comparePoint.y, 2));
                            reverseX = this.findOne(".bottom-right").x() < comparePoint.x ? -1 : 1;
                            reverseY = this.findOne(".bottom-right").y() < comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            this.findOne(".bottom-right").x(comparePoint.x + x);
                            this.findOne(".bottom-right").y(comparePoint.y + y);
                        }
                    } else console.error(new Error("Wrong position argument of selection resizer: " + this._movingAnchorName));
                    centeredScaling = this.centeredScaling() || e.altKey;
                    if (centeredScaling) {
                        var topLeft = this.findOne(".top-left");
                        var bottomRight = this.findOne(".bottom-right");
                        var topOffsetX = topLeft.x();
                        var topOffsetY = topLeft.y();
                        var bottomOffsetX = this.getWidth() - bottomRight.x();
                        var bottomOffsetY = this.getHeight() - bottomRight.y();
                        bottomRight.move({
                            x: -topOffsetX,
                            y: -topOffsetY
                        });
                        topLeft.move({
                            x: bottomOffsetX,
                            y: bottomOffsetY
                        });
                    }
                    var absPos = this.findOne(".top-left").getAbsolutePosition();
                    x = absPos.x;
                    y = absPos.y;
                    var width = this.findOne(".bottom-right").x() - this.findOne(".top-left").x();
                    var height = this.findOne(".bottom-right").y() - this.findOne(".top-left").y();
                    this._fitNodesInto({
                        x,
                        y,
                        width,
                        height,
                        rotation: Global_1.Konva.getAngle(this.rotation())
                    }, e);
                };
                Transformer.prototype._handleMouseUp = function(e) {
                    this._removeEvents(e);
                };
                Transformer.prototype.getAbsoluteTransform = function() {
                    return this.getTransform();
                };
                Transformer.prototype._removeEvents = function(e) {
                    if (this._transforming) {
                        this._transforming = false;
                        window.removeEventListener("mousemove", this._handleMouseMove);
                        window.removeEventListener("touchmove", this._handleMouseMove);
                        window.removeEventListener("mouseup", this._handleMouseUp, true);
                        window.removeEventListener("touchend", this._handleMouseUp, true);
                        var node = this.getNode();
                        this._fire("transformend", {
                            evt: e,
                            target: node
                        });
                        if (node) node.fire("transformend", {
                            evt: e,
                            target: node
                        });
                        this._movingAnchorName = null;
                    }
                };
                Transformer.prototype._fitNodesInto = function(newAttrs, evt) {
                    var _this = this;
                    var oldAttrs = this._getNodeRect();
                    var minSize = 1;
                    if (Util_1.Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
                        this.update();
                        return;
                    }
                    if (Util_1.Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
                        this.update();
                        return;
                    }
                    var allowNegativeScale = true;
                    var t = new Util_1.Transform;
                    t.rotate(Global_1.Konva.getAngle(this.rotation()));
                    if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf("left") >= 0) {
                        var offset = t.point({
                            x: -this.padding() * 2,
                            y: 0
                        });
                        newAttrs.x += offset.x;
                        newAttrs.y += offset.y;
                        newAttrs.width += this.padding() * 2;
                        this._movingAnchorName = this._movingAnchorName.replace("left", "right");
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    } else if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf("right") >= 0) {
                        offset = t.point({
                            x: this.padding() * 2,
                            y: 0
                        });
                        this._movingAnchorName = this._movingAnchorName.replace("right", "left");
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        newAttrs.width += this.padding() * 2;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    }
                    if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf("top") >= 0) {
                        offset = t.point({
                            x: 0,
                            y: -this.padding() * 2
                        });
                        newAttrs.x += offset.x;
                        newAttrs.y += offset.y;
                        this._movingAnchorName = this._movingAnchorName.replace("top", "bottom");
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        newAttrs.height += this.padding() * 2;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    } else if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf("bottom") >= 0) {
                        offset = t.point({
                            x: 0,
                            y: this.padding() * 2
                        });
                        this._movingAnchorName = this._movingAnchorName.replace("bottom", "top");
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        newAttrs.height += this.padding() * 2;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    }
                    if (this.boundBoxFunc()) {
                        var bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
                        if (bounded) newAttrs = bounded; else Util_1.Util.warn("boundBoxFunc returned falsy. You should return new bound rect from it!");
                    }
                    var baseSize = 1e7;
                    var oldTr = new Util_1.Transform;
                    oldTr.translate(oldAttrs.x, oldAttrs.y);
                    oldTr.rotate(oldAttrs.rotation);
                    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
                    var newTr = new Util_1.Transform;
                    newTr.translate(newAttrs.x, newAttrs.y);
                    newTr.rotate(newAttrs.rotation);
                    newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);
                    var delta = newTr.multiply(oldTr.invert());
                    this._nodes.forEach((function(node) {
                        var parentTransform = node.getParent().getAbsoluteTransform();
                        var localTransform = node.getTransform().copy();
                        localTransform.translate(node.offsetX(), node.offsetY());
                        var newLocalTransform = new Util_1.Transform;
                        newLocalTransform.multiply(parentTransform.copy().invert()).multiply(delta).multiply(parentTransform).multiply(localTransform);
                        var attrs = newLocalTransform.decompose();
                        node._batchTransformChanges((function() {
                            node.setAttrs(attrs);
                        }));
                        _this._fire("transform", {
                            evt,
                            target: node
                        });
                        node._fire("transform", {
                            evt,
                            target: node
                        });
                    }));
                    this.rotation(Util_1.Util._getRotation(newAttrs.rotation));
                    this._resetTransformCache();
                    this.update();
                    this.getLayer().batchDraw();
                };
                Transformer.prototype.forceUpdate = function() {
                    this._resetTransformCache();
                    this.update();
                };
                Transformer.prototype._batchChangeChild = function(selector, attrs) {
                    var anchor = this.findOne(selector);
                    anchor._batchTransformChanges((function() {
                        anchor.setAttrs(attrs);
                    }));
                };
                Transformer.prototype.update = function() {
                    var _this = this;
                    var attrs = this._getNodeRect();
                    this.rotation(Util_1.Util._getRotation(attrs.rotation));
                    var width = attrs.width;
                    var height = attrs.height;
                    var enabledAnchors = this.enabledAnchors();
                    var resizeEnabled = this.resizeEnabled();
                    var padding = this.padding();
                    var anchorSize = this.anchorSize();
                    this.find("._anchor").each((function(node) {
                        node._batchTransformChanges((function() {
                            node.setAttrs({
                                width: anchorSize,
                                height: anchorSize,
                                offsetX: anchorSize / 2,
                                offsetY: anchorSize / 2,
                                stroke: _this.anchorStroke(),
                                strokeWidth: _this.anchorStrokeWidth(),
                                fill: _this.anchorFill(),
                                cornerRadius: _this.anchorCornerRadius()
                            });
                        }));
                    }));
                    this._batchChangeChild(".top-left", {
                        x: 0,
                        y: 0,
                        offsetX: anchorSize / 2 + padding,
                        offsetY: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("top-left") >= 0
                    });
                    this._batchChangeChild(".top-center", {
                        x: width / 2,
                        y: 0,
                        offsetY: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("top-center") >= 0
                    });
                    this._batchChangeChild(".top-right", {
                        x: width,
                        y: 0,
                        offsetX: anchorSize / 2 - padding,
                        offsetY: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("top-right") >= 0
                    });
                    this._batchChangeChild(".middle-left", {
                        x: 0,
                        y: height / 2,
                        offsetX: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("middle-left") >= 0
                    });
                    this._batchChangeChild(".middle-right", {
                        x: width,
                        y: height / 2,
                        offsetX: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("middle-right") >= 0
                    });
                    this._batchChangeChild(".bottom-left", {
                        x: 0,
                        y: height,
                        offsetX: anchorSize / 2 + padding,
                        offsetY: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("bottom-left") >= 0
                    });
                    this._batchChangeChild(".bottom-center", {
                        x: width / 2,
                        y: height,
                        offsetY: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("bottom-center") >= 0
                    });
                    this._batchChangeChild(".bottom-right", {
                        x: width,
                        y: height,
                        offsetX: anchorSize / 2 - padding,
                        offsetY: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf("bottom-right") >= 0
                    });
                    this._batchChangeChild(".rotater", {
                        x: width / 2,
                        y: -this.rotateAnchorOffset() * Util_1.Util._sign(height) - padding,
                        visible: this.rotateEnabled()
                    });
                    this._batchChangeChild(".back", {
                        width,
                        height,
                        visible: this.borderEnabled(),
                        stroke: this.borderStroke(),
                        strokeWidth: this.borderStrokeWidth(),
                        dash: this.borderDash(),
                        x: 0,
                        y: 0
                    });
                };
                Transformer.prototype.isTransforming = function() {
                    return this._transforming;
                };
                Transformer.prototype.stopTransform = function() {
                    if (this._transforming) {
                        this._removeEvents();
                        var anchorNode = this.findOne("." + this._movingAnchorName);
                        if (anchorNode) anchorNode.stopDrag();
                    }
                };
                Transformer.prototype.destroy = function() {
                    if (this.getStage() && this._cursorChange) this.getStage().content.style.cursor = "";
                    Group_1.Group.prototype.destroy.call(this);
                    this.detach();
                    this._removeEvents();
                    return this;
                };
                Transformer.prototype.toObject = function() {
                    return Node_1.Node.prototype.toObject.call(this);
                };
                return Transformer;
            }(Group_1.Group);
            exports.Transformer = Transformer;
            function validateAnchors(val) {
                if (!(val instanceof Array)) Util_1.Util.warn("enabledAnchors value should be an array");
                if (val instanceof Array) val.forEach((function(name) {
                    if (ANCHORS_NAMES.indexOf(name) === -1) Util_1.Util.warn("Unknown anchor name: " + name + ". Available names are: " + ANCHORS_NAMES.join(", "));
                }));
                return val || [];
            }
            Transformer.prototype.className = "Transformer";
            Global_2._registerNode(Transformer);
            Factory_1.Factory.addGetterSetter(Transformer, "enabledAnchors", ANCHORS_NAMES, validateAnchors);
            Factory_1.Factory.addGetterSetter(Transformer, "resizeEnabled", true);
            Factory_1.Factory.addGetterSetter(Transformer, "anchorSize", 10, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "rotateEnabled", true);
            Factory_1.Factory.addGetterSetter(Transformer, "rotationSnaps", []);
            Factory_1.Factory.addGetterSetter(Transformer, "rotateAnchorOffset", 50, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "rotationSnapTolerance", 5, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "borderEnabled", true);
            Factory_1.Factory.addGetterSetter(Transformer, "anchorStroke", "rgb(0, 161, 255)");
            Factory_1.Factory.addGetterSetter(Transformer, "anchorStrokeWidth", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "anchorFill", "white");
            Factory_1.Factory.addGetterSetter(Transformer, "anchorCornerRadius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "borderStroke", "rgb(0, 161, 255)");
            Factory_1.Factory.addGetterSetter(Transformer, "borderStrokeWidth", 1, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "borderDash");
            Factory_1.Factory.addGetterSetter(Transformer, "keepRatio", true);
            Factory_1.Factory.addGetterSetter(Transformer, "centeredScaling", false);
            Factory_1.Factory.addGetterSetter(Transformer, "ignoreStroke", false);
            Factory_1.Factory.addGetterSetter(Transformer, "padding", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Transformer, "node");
            Factory_1.Factory.addGetterSetter(Transformer, "nodes");
            Factory_1.Factory.addGetterSetter(Transformer, "boundBoxFunc");
            Factory_1.Factory.addGetterSetter(Transformer, "shouldOverdrawWholeArea", false);
            Factory_1.Factory.backCompat(Transformer, {
                lineEnabled: "borderEnabled",
                rotateHandlerOffset: "rotateAnchorOffset",
                enabledHandlers: "enabledAnchors"
            });
            Util_1.Collection.mapMethods(Transformer);
        },
        7589: function(__unused_webpack_module, exports, __webpack_require__) {
            "use strict";
            var __extends = this && this.__extends || function() {
                var extendStatics = function(d, b) {
                    extendStatics = Object.setPrototypeOf || {
                        __proto__: []
                    } instanceof Array && function(d, b) {
                        d.__proto__ = b;
                    } || function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                    return extendStatics(d, b);
                };
                return function(d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
                };
            }();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Util_1 = __webpack_require__(5520);
            var Factory_1 = __webpack_require__(696);
            var Shape_1 = __webpack_require__(9071);
            var Global_1 = __webpack_require__(9427);
            var Validators_1 = __webpack_require__(4783);
            var Global_2 = __webpack_require__(9427);
            var Wedge = function(_super) {
                __extends(Wedge, _super);
                function Wedge() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Wedge.prototype._sceneFunc = function(context) {
                    context.beginPath();
                    context.arc(0, 0, this.radius(), 0, Global_1.Konva.getAngle(this.angle()), this.clockwise());
                    context.lineTo(0, 0);
                    context.closePath();
                    context.fillStrokeShape(this);
                };
                Wedge.prototype.getWidth = function() {
                    return this.radius() * 2;
                };
                Wedge.prototype.getHeight = function() {
                    return this.radius() * 2;
                };
                Wedge.prototype.setWidth = function(width) {
                    this.radius(width / 2);
                };
                Wedge.prototype.setHeight = function(height) {
                    this.radius(height / 2);
                };
                return Wedge;
            }(Shape_1.Shape);
            exports.Wedge = Wedge;
            Wedge.prototype.className = "Wedge";
            Wedge.prototype._centroid = true;
            Wedge.prototype._attrsAffectingSize = [ "radius" ];
            Global_2._registerNode(Wedge);
            Factory_1.Factory.addGetterSetter(Wedge, "radius", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Wedge, "angle", 0, Validators_1.getNumberValidator());
            Factory_1.Factory.addGetterSetter(Wedge, "clockwise", false);
            Factory_1.Factory.backCompat(Wedge, {
                angleDeg: "angle",
                getAngleDeg: "getAngle",
                setAngleDeg: "setAngle"
            });
            Util_1.Collection.mapMethods(Wedge);
        },
        6755: (module, __unused_webpack_exports, __webpack_require__) => {
            const between = __webpack_require__(492);
            const Pair = __webpack_require__(2674);
            const {vector} = __webpack_require__(2653);
            class Anchor {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                }
                equal(other) {
                    return this.isAt(other.x, other.y);
                }
                isAt(x, y) {
                    return Pair.equal(this.x, this.y, x, y);
                }
                translated(dx, dy) {
                    return this.copy().translate(dx, dy);
                }
                translate(dx, dy) {
                    this.x += dx;
                    this.y += dy;
                    return this;
                }
                closeTo(other, tolerance) {
                    return between(this.x, other.x - tolerance, other.x + tolerance) && between(this.y, other.y - tolerance, other.y + tolerance);
                }
                copy() {
                    return new Anchor(this.x, this.y);
                }
                diff(other) {
                    return Pair.diff(this.x, this.y, other.x, other.y);
                }
                asPair() {
                    return [ this.x, this.y ];
                }
                asVector() {
                    return vector(this.x, this.y);
                }
                export() {
                    return this.asVector();
                }
                static atRandom(maxX, maxY) {
                    return new Anchor(Math.random() * maxX, Math.random() * maxY);
                }
                static import(vector) {
                    return anchor(vector.x, vector.y);
                }
            }
            function anchor(x, y) {
                return new Anchor(x, y);
            }
            module.exports = {
                anchor,
                Anchor
            };
        },
        1843: module => {
            const Vertical = {
                atVector(vector) {
                    return vector.y;
                },
                atDimension(image) {
                    return image.height;
                }
            };
            const Horizontal = {
                atVector(vector) {
                    return vector.x;
                },
                atDimension(image) {
                    return image.width;
                }
            };
            module.exports = {
                Vertical,
                Horizontal
            };
        },
        492: module => {
            function between(value, min, max) {
                return min <= value && value <= max;
            }
            module.exports = between;
        },
        8450: (module, __unused_webpack_exports, __webpack_require__) => {
            const Pair = __webpack_require__(2674);
            __webpack_require__(4374);
            const Puzzle = __webpack_require__(222);
            const Manufacturer = __webpack_require__(5279);
            const {twoAndTwo} = __webpack_require__(9351);
            const Structure = __webpack_require__(4857);
            const ImageMetadata = __webpack_require__(1471);
            const {vector, ...Vector} = __webpack_require__(2653);
            const Metadata = __webpack_require__(9839);
            const SpatialMetadata = __webpack_require__(8516);
            const {PuzzleValidator, PieceValidator} = __webpack_require__(3906);
            const {Horizontal, Vertical} = __webpack_require__(1843);
            const Shuffler = __webpack_require__(9243);
            const {diameter} = __webpack_require__(3491);
            const {itself} = __webpack_require__(2721);
            const {Classic} = __webpack_require__(4270);
            class Canvas {
                constructor(id, {width, height, pieceSize = 50, proximity = 10, borderFill = 0, strokeWidth = 3, strokeColor = "black", lineSoftness = 0, preventOffstageDrag = false, image = null, fixed = false, painter = null, puzzleDiameter = null, maxPiecesCount = null, outline = null}) {
                    this.width = width;
                    this.height = height;
                    this.pieceSize = diameter(pieceSize);
                    this.borderFill = Vector.cast(borderFill);
                    this.imageMetadata = ImageMetadata.asImageMetadata(image);
                    this.strokeWidth = strokeWidth;
                    this.strokeColor = strokeColor;
                    this.lineSoftness = lineSoftness;
                    this.preventOffstageDrag = preventOffstageDrag;
                    this.proximity = proximity;
                    this.fixed = fixed;
                    this._painter = painter || new window["headbreaker"]["painters"]["Konva"];
                    this._initialize();
                    this._painter.initialize(this, id);
                    this._maxPiecesCount = Vector.cast(maxPiecesCount);
                    this._puzzleDiameter = Vector.cast(puzzleDiameter);
                    this._imageAdjuster = itself;
                    this._outline = outline || Classic;
                }
                _initialize() {
                    this._puzzle = null;
                    this.figures = {};
                    this.templates = {};
                    this._figurePadding = null;
                    this._drawn = false;
                }
                sketchPiece({structure, size = null, metadata}) {
                    SpatialMetadata.initialize(metadata, Vector.zero());
                    this.renderPiece(this._newPiece(structure, size, metadata));
                }
                renderPiece(piece) {
                    const figure = {
                        label: null,
                        group: null,
                        shape: null
                    };
                    this.figures[piece.metadata.id] = figure;
                    this._painter.sketch(this, piece, figure, this._outline);
                    const label = piece.metadata.label;
                    if (label && label.text) {
                        label.fontSize = label.fontSize || piece.diameter.y * .55;
                        label.y = label.y || (piece.diameter.y - label.fontSize) / 2;
                        this._painter.label(this, piece, figure);
                    }
                    this._bindGroupToPiece(figure.group, piece);
                    this._bindPieceToGroup(piece, figure.group);
                }
                renderPieces(pieces) {
                    pieces.forEach((it => {
                        this._annotatePiecePosition(it);
                        this.renderPiece(it);
                    }));
                }
                renderPuzzle(puzzle) {
                    this.pieceSize = puzzle.pieceSize;
                    this.proximity = puzzle.proximity * 2;
                    this._puzzle = puzzle;
                    this.renderPieces(puzzle.pieces);
                }
                autogenerate({horizontalPiecesCount = 5, verticalPiecesCount = 5, insertsGenerator = twoAndTwo, metadata = []} = {}) {
                    const manufacturer = new Manufacturer;
                    manufacturer.withDimensions(horizontalPiecesCount, verticalPiecesCount);
                    manufacturer.withInsertsGenerator(insertsGenerator);
                    manufacturer.withMetadata(metadata);
                    this.autogenerateWithManufacturer(manufacturer);
                }
                autogenerateWithManufacturer(manufacturer) {
                    manufacturer.withStructure(this.settings);
                    this._puzzle = manufacturer.build();
                    this._maxPiecesCount = vector(manufacturer.width, manufacturer.height);
                    this.renderPieces(this.puzzle.pieces);
                }
                defineTemplate(name, template) {
                    this.templates[name] = template;
                }
                sketchPieceUsingTemplate(id, templateName) {
                    const options = this.templates[templateName];
                    if (!options) throw new Error(`Unknown template ${id}`);
                    const metadata = Metadata.copy(options.metadata);
                    metadata.id = id;
                    this.sketchPiece({
                        structure: options.structure,
                        metadata
                    });
                }
                shuffle(farness = 1) {
                    const offset = this.pieceRadius;
                    this.puzzle.shuffle(farness * (this.width - offset.x), farness * (this.height - offset.y));
                    this.puzzle.translate(offset.x, offset.y);
                    this.autoconnected = true;
                }
                shuffleColumns(farness = 1) {
                    this.shuffleWith(farness, Shuffler.columns);
                }
                shuffleGrid(farness = 1) {
                    this.shuffleWith(farness, Shuffler.grid);
                }
                shuffleLine(farness = 1) {
                    this.shuffleWith(farness, Shuffler.line);
                }
                shuffleWith(farness, shuffler) {
                    this.solve();
                    this.puzzle.shuffleWith(Shuffler.padder(this.proximity * 3, this.maxPiecesCount.x, this.maxPiecesCount.y));
                    this.puzzle.shuffleWith(shuffler);
                    this.puzzle.shuffleWith(Shuffler.noise(Vector.cast(this.proximity * farness / 2)));
                    this.autoconnected = true;
                }
                solve() {
                    this.puzzle.pieces.forEach((it => {
                        const {x, y} = it.metadata.targetPosition;
                        it.relocateTo(x, y);
                    }));
                    this.autoconnect();
                }
                autoconnect() {
                    this.puzzle.autoconnect();
                    this.autoconnected = true;
                }
                registerKeyboardGestures(gestures = {
                    16: puzzle => puzzle.forceConnectionWhileDragging(),
                    17: puzzle => puzzle.forceDisconnectionWhileDragging()
                }) {
                    this._painter.registerKeyboardGestures(this, gestures);
                }
                draw() {
                    if (this._drawn) throw new Error("This canvas has already been drawn. Call redraw instead");
                    if (!this.autoconnected) this.autoconnect();
                    this.puzzle.updateValidity();
                    this.autoconnected = false;
                    this.redraw();
                    this._drawn = true;
                }
                redraw() {
                    this._painter.draw(this);
                }
                refill() {
                    this.puzzle.pieces.forEach((piece => {
                        this._painter.fill(this, piece, this.getFigure(piece));
                    }));
                }
                clear() {
                    this._initialize();
                    this._painter.reinitialize(this);
                }
                attachConnectionRequirement(requirement) {
                    this.puzzle.attachConnectionRequirement(requirement);
                }
                clearConnectionRequirements() {
                    this.puzzle.clearConnectionRequirements();
                }
                attachValidator(validator) {
                    this.puzzle.attachValidator(validator);
                }
                attachSolvedValidator() {
                    this.puzzle.attachValidator(new PuzzleValidator(SpatialMetadata.solved));
                }
                attachRelativePositionValidator() {
                    this.puzzle.attachValidator(new PuzzleValidator(SpatialMetadata.relativePosition));
                }
                attachRelativeRefsValidator(expected) {
                    this.puzzle.attachValidator(new PuzzleValidator(PuzzleValidator.relativeRefs(expected)));
                }
                attachAbsolutePositionValidator() {
                    this.puzzle.attachValidator(new PieceValidator(SpatialMetadata.absolutePosition));
                }
                onConnect(f) {
                    this.puzzle.onConnect(((piece, target) => {
                        f(piece, this.getFigure(piece), target, this.getFigure(target));
                    }));
                }
                onDisconnect(f) {
                    this.puzzle.onDisconnect(((piece, target) => {
                        f(piece, this.getFigure(piece), target, this.getFigure(target));
                    }));
                }
                onTranslate(f) {
                    this.puzzle.onTranslate(((piece, dx, dy) => {
                        f(piece, this.getFigure(piece), dx, dy);
                    }));
                }
                reframeWithinDimensions() {
                    if (!this.fixed) throw new Error("Only fixed canvas can be reframed");
                    this.puzzle.reframe(this.figurePadding, Vector.minus(vector(this.width, this.height), this.figurePadding));
                }
                onValid(f) {
                    this.puzzle.onValid(f);
                }
                get valid() {
                    return this.puzzle.valid;
                }
                getFigure(piece) {
                    return this.getFigureById(piece.metadata.id);
                }
                getFigureById(id) {
                    return this.figures[id];
                }
                resize(width, height) {
                    this.width = width;
                    this.height = height;
                    this._painter.resize(this, width, height);
                }
                scale(factor) {
                    this._painter.scale(this, Vector.cast(factor));
                }
                _annotatePiecePosition(piece) {
                    const p = piece.centralAnchor.asVector();
                    SpatialMetadata.initialize(piece.metadata, p, Vector.copy(p));
                }
                _bindGroupToPiece(group, piece) {
                    piece.onTranslate(((_dx, _dy) => {
                        this._painter.physicalTranslate(this, group, piece);
                        this._painter.logicalTranslate(this, piece, group);
                    }));
                }
                _bindPieceToGroup(piece, group) {
                    this._painter.onDrag(this, piece, group, ((dx, dy) => {
                        if (!Pair.isNull(dx, dy)) {
                            piece.drag(dx, dy, true);
                            this._painter.logicalTranslate(this, piece, group);
                            this.redraw();
                        }
                    }));
                    this._painter.onDragEnd(this, piece, group, (() => {
                        piece.drop();
                        this.puzzle.validate();
                        this.redraw();
                    }));
                }
                _baseImageMetadataFor(piece) {
                    if (this.imageMetadata) {
                        const scale = piece.metadata.scale || this.imageMetadata.scale || 1;
                        const offset = Vector.plus(piece.metadata.targetPosition || Vector.zero(), this.imageMetadata.offset || Vector.zero());
                        return {
                            content: this.imageMetadata.content,
                            offset,
                            scale
                        };
                    } else return ImageMetadata.asImageMetadata(piece.metadata.image);
                }
                imageMetadataFor(piece) {
                    return this._imageAdjuster(this._baseImageMetadataFor(piece));
                }
                adjustImagesToPuzzle(axis) {
                    this._imageAdjuster = image => {
                        const scale = axis.atVector(this.puzzleDiameter) / axis.atDimension(image.content);
                        const offset = Vector.plus(image.offset, Vector.minus(this.borderFill, this.pieceDiameter));
                        return {
                            content: image.content,
                            scale,
                            offset
                        };
                    };
                }
                adjustImagesToPuzzleWidth() {
                    this.adjustImagesToPuzzle(Horizontal);
                }
                adjustImagesToPuzzleHeight() {
                    this.adjustImagesToPuzzle(Vertical);
                }
                adjustImagesToPiece(axis) {
                    this._imageAdjuster = image => {
                        const scale = axis.atVector(this.pieceDiameter) / axis.atDimension(image.content);
                        const offset = Vector.plus(image.offset, this.borderFill);
                        return {
                            content: image.content,
                            scale,
                            offset
                        };
                    };
                }
                adjustImagesToPieceWidth() {
                    this.adjustImagesToPiece(Horizontal);
                }
                adjustImagesToPieceHeight() {
                    this.adjustImagesToPiece(Vertical);
                }
                _initializeEmptyPuzzle() {
                    this._puzzle = new Puzzle(this.settings);
                }
                _newPiece(structureLike, size, metadata) {
                    let piece = this.puzzle.newPiece(Structure.asStructure(structureLike), {
                        centralAnchor: vector(metadata.currentPosition.x, metadata.currentPosition.y),
                        metadata,
                        size
                    });
                    return piece;
                }
                get puzzleDiameter() {
                    return this._puzzleDiameter || this.estimatedPuzzleDiameter;
                }
                get estimatedPuzzleDiameter() {
                    return Vector.plus(Vector.multiply(this.pieceDiameter, this.maxPiecesCount), this.strokeWidth * 2);
                }
                get maxPiecesCount() {
                    if (!this._maxPiecesCount) throw new Error("max pieces count was not specified");
                    return this._maxPiecesCount;
                }
                get pieceRadius() {
                    return this.pieceSize.radius;
                }
                get pieceDiameter() {
                    return this.pieceSize.diameter;
                }
                get figurePadding() {
                    if (!this._figurePadding) this._figurePadding = Vector.plus(this.strokeWidth, this.borderFill);
                    return this._figurePadding;
                }
                get figuresCount() {
                    return Object.values(this.figures).length;
                }
                get puzzle() {
                    if (!this._puzzle) this._initializeEmptyPuzzle();
                    return this._puzzle;
                }
                get settings() {
                    return {
                        pieceRadius: this.pieceRadius,
                        proximity: this.proximity
                    };
                }
            }
            module.exports = Canvas;
        },
        511: (module, __unused_webpack_exports, __webpack_require__) => {
            const {pivot} = __webpack_require__(2721);
            function noConnectionRequirements(_one, _other) {
                return true;
            }
            class Connector {
                constructor(axis, forward, backward) {
                    this.axis = axis;
                    this.forward = forward;
                    this.backward = backward;
                    this.forwardAnchor = `${forward}Anchor`;
                    this.backwardAnchor = `${backward}Anchor`;
                    this.forwardConnection = `${forward}Connection`;
                    this.backwardConnection = `${backward}Connection`;
                    this.requirement = noConnectionRequirements;
                }
                attract(one, other, back = false) {
                    const [iron, magnet] = pivot(one, other, back);
                    let dx, dy;
                    if (magnet.centralAnchor[this.axis] > iron.centralAnchor[this.axis]) [dx, dy] = magnet[this.backwardAnchor].diff(iron[this.forwardAnchor]); else [dx, dy] = magnet[this.forwardAnchor].diff(iron[this.backwardAnchor]);
                    iron.push(dx, dy);
                }
                openMovement(one, delta) {
                    return delta > 0 && !one[this.forwardConnection] || delta < 0 && !one[this.backwardConnection] || delta == 0;
                }
                canConnectWith(one, other, proximity) {
                    return this.closeTo(one, other, proximity) && this.match(one, other) && one.correctlyConnectedWith(other);
                }
                closeTo(one, other, proximity) {
                    return one[this.forwardAnchor].closeTo(other[this.backwardAnchor], proximity);
                }
                match(one, other) {
                    return one[this.forward].match(other[this.backward]);
                }
                connectWith(one, other, proximity, back) {
                    if (!this.canConnectWith(one, other, proximity)) throw new Error(`can not connect ${this.forward}!`);
                    if (one[this.forwardConnection] !== other) {
                        this.attract(other, one, back);
                        one[this.forwardConnection] = other;
                        other[this.backwardConnection] = one;
                        one.fireConnect(other);
                    }
                }
                attachRequirement(requirement) {
                    this.requirement = requirement;
                }
                static horizontal() {
                    return new Connector("x", "right", "left");
                }
                static vertical() {
                    return new Connector("y", "down", "up");
                }
            }
            module.exports = {
                Connector,
                noConnectionRequirements
            };
        },
        6754: (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(511);
            const TryDisconnection = {
                dragShouldDisconnect(piece, dx, dy) {
                    return piece.horizontalConnector.openMovement(piece, dx) && piece.verticalConnector.openMovement(piece, dy);
                }
            };
            const ForceDisconnection = {
                dragShouldDisconnect(_piece, _dx, _dy) {
                    return true;
                }
            };
            const ForceConnection = {
                dragShouldDisconnect(_piece, _dx, _dy) {
                    return false;
                }
            };
            module.exports = {
                TryDisconnection,
                ForceDisconnection,
                ForceConnection
            };
        },
        7426: (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(8450);
            __webpack_require__(4374);
            const Painter = __webpack_require__(4391);
            class DummyPainter extends Painter {
                initialize(canvas, id) {
                    canvas["__nullLayer__"] = {
                        drawn: false,
                        figures: 0
                    };
                }
                draw(canvas) {
                    canvas["__nullLayer__"].drawn = true;
                }
                sketch(canvas, _piece, _figure, outline) {
                    canvas["__nullLayer__"].figures++;
                }
            }
            module.exports = DummyPainter;
        },
        1471: (module, __unused_webpack_exports, __webpack_require__) => {
            const {vector} = __webpack_require__(2653);
            function asImageMetadata(imageLike) {
                if (imageLike instanceof HTMLImageElement || imageLike instanceof HTMLCanvasElement) return {
                    content: imageLike,
                    offset: vector(1, 1),
                    scale: 1
                };
                return imageLike;
            }
            module.exports = {
                asImageMetadata
            };
        },
        6520: (module, __unused_webpack_exports, __webpack_require__) => {
            const Pair = __webpack_require__(2674);
            const {anchor, Anchor} = __webpack_require__(6755);
            const Puzzle = __webpack_require__(222);
            const Piece = __webpack_require__(4374);
            const {Tab, Slot, None} = __webpack_require__(2055);
            const {NullValidator, PieceValidator, PuzzleValidator} = __webpack_require__(3906);
            const {Horizontal, Vertical} = __webpack_require__(1843);
            const Structure = __webpack_require__(4857);
            const Outline = __webpack_require__(4270);
            const Canvas = __webpack_require__(8450);
            const Manufacturer = __webpack_require__(5279);
            const {InsertSequence, ...generators} = __webpack_require__(9351);
            const Metadata = __webpack_require__(9839);
            const SpatialMetadata = __webpack_require__(8516);
            const {vector, ...Vector} = __webpack_require__(2653);
            const {radius, diameter} = __webpack_require__(3491);
            const Shuffler = __webpack_require__(9243);
            const outline = __webpack_require__(4270);
            const dragMode = __webpack_require__(6754);
            const connector = __webpack_require__(511);
            module.exports = {
                anchor,
                vector,
                radius,
                diameter,
                Anchor,
                Puzzle,
                Piece,
                Canvas,
                Manufacturer,
                InsertSequence,
                PieceValidator,
                PuzzleValidator,
                NullValidator,
                Horizontal,
                Vertical,
                Tab,
                Slot,
                None,
                Pair,
                Metadata,
                SpatialMetadata,
                Outline,
                Structure,
                Vector,
                Shuffler,
                generators,
                outline,
                dragMode,
                connector,
                painters: {
                    Dummy: __webpack_require__(7426),
                    Konva: __webpack_require__(8599)
                }
            };
        },
        2055: module => {
            const Tab = {
                isSlot: () => false,
                isTab: () => true,
                isNone: () => false,
                match: other => other.isSlot(),
                toString: () => "Tab",
                complement: () => Slot,
                serialize: () => "T"
            };
            const Slot = {
                isSlot: () => true,
                isTab: () => false,
                isNone: () => false,
                match: other => other.isTab(),
                toString: () => "Slot",
                complement: () => Tab,
                serialize: () => "S"
            };
            const None = {
                isSlot: () => false,
                isTab: () => false,
                isNone: () => true,
                match: other => false,
                toString: () => "None",
                complement: () => None,
                serialize: () => "-"
            };
            module.exports = {
                None,
                Slot,
                Tab
            };
        },
        8599: (module, __unused_webpack_exports, __webpack_require__) => {
            let Konva;
            try {
                Konva = __webpack_require__(3054);
            } catch (e) {
                Konva = {
                    Stage: class {
                        constructor(_options) {
                            throw new Error("Konva not loaded");
                        }
                    }
                };
            }
            __webpack_require__(8450);
            __webpack_require__(4270);
            __webpack_require__(4374);
            const Pair = __webpack_require__(2674);
            const {vector, ...Vector} = __webpack_require__(2653);
            const Painter = __webpack_require__(4391);
            function currentPositionDiff(model, group) {
                return Pair.diff(group.x(), group.y(), model.metadata.currentPosition.x, model.metadata.currentPosition.y);
            }
            class KonvaPainter extends Painter {
                initialize(canvas, id) {
                    var stage = new Konva.Stage({
                        container: id,
                        width: canvas.width,
                        height: canvas.height,
                        draggable: !canvas.fixed
                    });
                    this._initializeLayer(stage, canvas);
                }
                _initializeLayer(stage, canvas) {
                    var layer = new Konva.Layer;
                    stage.add(layer);
                    canvas["__konvaLayer__"] = layer;
                }
                draw(canvas) {
                    canvas["__konvaLayer__"].draw();
                }
                reinitialize(canvas) {
                    const layer = canvas["__konvaLayer__"];
                    const stage = layer.getStage();
                    layer.destroy();
                    this._initializeLayer(stage, canvas);
                }
                resize(canvas, width, height) {
                    const layer = canvas["__konvaLayer__"];
                    const stage = layer.getStage();
                    stage.width(width);
                    stage.height(height);
                }
                scale(canvas, factor) {
                    canvas["__konvaLayer__"].getStage().scale(factor);
                }
                sketch(canvas, piece, figure, outline) {
                    figure.group = new Konva.Group({
                        x: piece.metadata.currentPosition.x,
                        y: piece.metadata.currentPosition.y,
                        draggable: !piece.metadata.fixed,
                        dragBoundFunc: canvas.preventOffstageDrag ? position => {
                            const furthermost = Vector.minus(vector(canvas.width, canvas.height), piece.size.radius);
                            return Vector.max(Vector.min(position, furthermost), piece.size.radius);
                        } : null
                    });
                    figure.shape = new Konva.Line({
                        points: outline.draw(piece, piece.diameter, canvas.borderFill),
                        bezier: outline.isBezier(),
                        tension: outline.isBezier() ? null : canvas.lineSoftness,
                        stroke: piece.metadata.strokeColor || canvas.strokeColor,
                        strokeWidth: canvas.strokeWidth,
                        closed: true,
                        ...Vector.multiply(piece.radius, -1)
                    });
                    this.fill(canvas, piece, figure);
                    figure.group.add(figure.shape);
                    canvas["__konvaLayer__"].add(figure.group);
                }
                fill(canvas, piece, figure) {
                    const image = canvas.imageMetadataFor(piece);
                    figure.shape.fill(!image ? piece.metadata.color || "black" : null);
                    figure.shape.fillPatternImage(image && image.content);
                    figure.shape.fillPatternScale(image && {
                        x: image.scale,
                        y: image.scale
                    });
                    figure.shape.fillPatternOffset(image && Vector.divide(image.offset, image.scale));
                }
                label(_canvas, piece, figure) {
                    figure.label = new Konva.Text({
                        ...Vector.minus({
                            x: piece.metadata.label.x || figure.group.width() / 2,
                            y: piece.metadata.label.y || figure.group.height() / 2
                        }, piece.radius),
                        text: piece.metadata.label.text,
                        fontSize: piece.metadata.label.fontSize,
                        fontFamily: piece.metadata.label.fontFamily || "Sans Serif",
                        fill: piece.metadata.label.color || "white"
                    });
                    figure.group.add(figure.label);
                }
                physicalTranslate(_canvas, group, piece) {
                    group.x(piece.centralAnchor.x);
                    group.y(piece.centralAnchor.y);
                }
                logicalTranslate(_canvas, piece, group) {
                    Vector.update(piece.metadata.currentPosition, group.x(), group.y());
                }
                onDrag(canvas, piece, group, f) {
                    group.on("mouseover", (() => {
                        document.body.style.cursor = "pointer";
                    }));
                    group.on("mouseout", (() => {
                        document.body.style.cursor = "default";
                    }));
                    group.on("dragmove", (() => {
                        let [dx, dy] = currentPositionDiff(piece, group);
                        group.zIndex(canvas.figuresCount - 1);
                        f(dx, dy);
                    }));
                }
                onDragEnd(_canvas, _piece, group, f) {
                    group.on("dragend", (() => {
                        f();
                    }));
                }
                registerKeyboardGestures(canvas, gestures) {
                    const container = canvas["__konvaLayer__"].getStage().container();
                    container.tabIndex = -1;
                    this._registerKeyDown(canvas, container, gestures);
                    this._registerKeyUp(canvas, container, gestures);
                }
                _registerKeyDown(canvas, container, gestures) {
                    container.addEventListener("keydown", (function(e) {
                        for (let keyCode in gestures) if (e.keyCode == keyCode) gestures[keyCode](canvas.puzzle);
                    }));
                }
                _registerKeyUp(canvas, container, gestures) {
                    container.addEventListener("keyup", (function(e) {
                        for (let keyCode in gestures) if (e.keyCode == keyCode) canvas.puzzle.tryDisconnectionWhileDragging();
                    }));
                }
            }
            module.exports = KonvaPainter;
        },
        5279: (module, __unused_webpack_exports, __webpack_require__) => {
            const Puzzle = __webpack_require__(222);
            __webpack_require__(4374);
            const {Anchor} = __webpack_require__(6755);
            const {anchor} = __webpack_require__(6755);
            const {fixed, InsertSequence} = __webpack_require__(9351);
            const Metadata = __webpack_require__(9839);
            class Manufacturer {
                constructor() {
                    this.insertsGenerator = fixed;
                    this.metadata = [];
                    this.headAnchor = null;
                }
                withMetadata(metadata) {
                    this.metadata = metadata;
                }
                withInsertsGenerator(generator) {
                    this.insertsGenerator = generator || this.insertsGenerator;
                }
                withHeadAt(anchor) {
                    this.headAnchor = anchor;
                }
                withStructure(structure) {
                    this.structure = structure;
                }
                withDimensions(width, height) {
                    this.width = width;
                    this.height = height;
                }
                build() {
                    const puzzle = new Puzzle(this.structure);
                    const positioner = new Positioner(puzzle, this.headAnchor);
                    let verticalSequence = this._newSequence();
                    let horizontalSequence;
                    for (let y = 0; y < this.height; y++) {
                        horizontalSequence = this._newSequence();
                        verticalSequence.next();
                        for (let x = 0; x < this.width; x++) {
                            horizontalSequence.next();
                            const piece = this._buildPiece(puzzle, horizontalSequence, verticalSequence);
                            piece.centerAround(positioner.naturalAnchor(x, y));
                        }
                    }
                    this._annotateAll(puzzle.pieces);
                    return puzzle;
                }
                _annotateAll(pieces) {
                    pieces.forEach(((piece, index) => this._annotate(piece, index)));
                }
                _annotate(piece, index) {
                    const baseMetadata = this.metadata[index];
                    const metadata = baseMetadata ? Metadata.copy(baseMetadata) : {};
                    metadata.id = metadata.id || String(index + 1);
                    piece.annotate(metadata);
                }
                _newSequence() {
                    return new InsertSequence(this.insertsGenerator);
                }
                _buildPiece(puzzle, horizontalSequence, verticalSequence) {
                    return puzzle.newPiece({
                        left: horizontalSequence.previousComplement(),
                        up: verticalSequence.previousComplement(),
                        right: horizontalSequence.current(this.width),
                        down: verticalSequence.current(this.height)
                    });
                }
            }
            class Positioner {
                constructor(puzzle, headAnchor) {
                    this.puzzle = puzzle;
                    this.initializeOffset(headAnchor);
                }
                initializeOffset(headAnchor) {
                    if (headAnchor) this.offset = headAnchor.asVector(); else this.offset = this.pieceDiameter;
                }
                get pieceDiameter() {
                    return this.puzzle.pieceDiameter;
                }
                naturalAnchor(x, y) {
                    return anchor(x * this.pieceDiameter.x + this.offset.x, y * this.pieceDiameter.y + this.offset.y);
                }
            }
            module.exports = Manufacturer;
        },
        9839: module => {
            function copy(metadata) {
                return JSON.parse(JSON.stringify(metadata));
            }
            module.exports = {
                copy
            };
        },
        4270: (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(4374);
            const {vector, ...Vector} = __webpack_require__(2653);
            function select(insert, t, s, n) {
                return insert.isTab() ? t : insert.isSlot() ? s : n;
            }
            const sl = (p, t, s, n) => select(p.left, t, s, n);
            const sr = (p, t, s, n) => select(p.right, t, s, n);
            const su = (p, t, s, n) => select(p.up, t, s, n);
            const sd = (p, t, s, n) => select(p.down, t, s, n);
            class Squared {
                draw(piece, size = 50, borderFill = 0) {
                    const sizeVector = Vector.cast(size);
                    const offset = Vector.divide(Vector.multiply(borderFill, 5), sizeVector);
                    return [ 0 - offset.x, 0 - offset.y, 1, 0 - offset.y, 2, select(piece.up, -1 - offset.y, 1 - offset.y, 0 - offset.y), 3, 0 - offset.y, 4 + offset.x, 0 - offset.y, 4 + offset.x, 1, sr(piece, 5 + offset.x, 3 + offset.x, 4 + offset.x), 2, 4 + offset.x, 3, 4 + offset.x, 4 + offset.y, 3, 4 + offset.y, 2, select(piece.down, 5 + offset.y, 3 + offset.y, 4 + offset.y), 1, 4 + offset.y, 0 - offset.x, 4 + offset.y, 0 - offset.x, 3, sl(piece, -1 - offset.x, 1 - offset.x, 0 - offset.x), 2, 0 - offset.x, 1 ].map(((it, index) => it * (index % 2 === 0 ? sizeVector.x : sizeVector.y) / 5));
                }
                isBezier() {
                    return false;
                }
            }
            class Rounded {
                constructor({bezelize = false, bezelDepth = 2 / 5, insertDepth = 4 / 5, borderLength = 1 / 3, referenceInsertAxis = null} = {}) {
                    this.bezelize = bezelize;
                    this.bezelDepth = bezelDepth;
                    this.insertDepth = insertDepth;
                    this.borderLength = borderLength;
                    this.referenceInsertAxis = referenceInsertAxis;
                }
                referenceInsertAxisLength(fullSize) {
                    return this.referenceInsertAxis ? this.referenceInsertAxis.atVector(fullSize) : Vector.inner.min(fullSize);
                }
                draw(p, size = 150, borderFill = 0) {
                    const fullSize = Vector.cast(size);
                    const r = Math.trunc(this.referenceInsertAxisLength(fullSize) * (1 - 2 * this.borderLength) * 100) / 100;
                    const s = Vector.divide(Vector.minus(fullSize, r), 2);
                    const o = Vector.multiply(r, this.insertDepth);
                    const b = Vector.multiply(Vector.inner.min(s), this.bezelDepth);
                    const [b0, b1, b2, b3] = this.bezels(p);
                    const nx = c => c ? b.x : 0;
                    const ny = c => c ? b.y : 0;
                    const rsy = r + s.y;
                    const rsx = r + s.x;
                    const r2sy = r + 2 * s.y;
                    const r2sx = r + 2 * s.x;
                    return [ nx(b0), 0, ...b0 ? [ 0, 0, 0, 0, 0, b.y ] : [], 0, ny(b0), 0, s.y, 0, s.y, ...sl(p, [ -o.x, s.y, -o.x, rsy ], [ o.x, s.y, o.x, rsy ], [ 0, s.y, 0, rsy ]), 0, rsy, 0, rsy, 0, r2sy, 0, r2sy - ny(b1), ...b1 ? [ 0, r2sy, 0, r2sy, b.x, r2sy ] : [], nx(b1), r2sy, s.x, r2sy, s.x, r2sy, ...sd(p, [ s.x, r2sy + o.y, rsx, r2sy + o.y ], [ s.x, r2sy - o.y, rsx, r2sy - o.y ], [ s.x, r2sy, rsx, r2sy ]), rsx, r2sy, rsx, r2sy, r2sx, r2sy, r2sx - nx(b2), r2sy, ...b2 ? [ r2sx, r2sy, r2sx, r2sy, r2sx, r2sy - b.y ] : [], r2sx, r2sy - ny(b2), r2sx, rsy, r2sx, rsy, ...sr(p, [ r2sx + o.x, rsy, r2sx + o.x, s.y ], [ r2sx - o.x, rsy, r2sx - o.x, s.y ], [ r2sx, rsy, r2sx, s.y ]), r2sx, s.y, r2sx, s.y, r2sx, 0, r2sx, ny(b3), ...b3 ? [ r2sx, 0, r2sx, 0, r2sx - b.x, 0 ] : [], r2sx - nx(b3), 0, rsx, 0, rsx, 0, ...su(p, [ rsx, -o.y, s.x, -o.y ], [ rsx, o.y, s.x, o.y ], [ rsx, 0, s.x, 0 ]), s.x, 0, s.x, 0, 0, 0, b0 ? b.x : 0, 0 ];
                }
                bezels(p) {
                    if (this.bezelize) return [ p.left.isNone() && p.up.isNone(), p.left.isNone() && p.down.isNone(), p.right.isNone() && p.down.isNone(), p.right.isNone() && p.up.isNone() ]; else return [ false, false, false, false ];
                }
                isBezier() {
                    return true;
                }
            }
            module.exports = {
                Classic: new Squared,
                Squared,
                Rounded
            };
        },
        4391: (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(8450);
            __webpack_require__(4374);
            class Painter {
                resize(canvas, width, height) {}
                initialize(canvas, id) {}
                reinitialize(canvas) {}
                draw(canvas) {}
                scale(canvas, factor) {}
                sketch(canvas, piece, figure, outline) {}
                fill(canvas, piece, figure) {}
                label(canvas, piece, figure) {}
                physicalTranslate(canvas, group, piece) {}
                logicalTranslate(canvas, piece, group) {}
                onDrag(canvas, piece, group, f) {}
                onDragEnd(canvas, piece, group, f) {}
                registerKeyboardGestures(canvas, gestures) {}
            }
            module.exports = Painter;
        },
        2674: module => {
            function isNull(x, y) {
                return equal(x, y, 0, 0);
            }
            function equal(x1, y1, x2, y2, delta = 0) {
                return Math.abs(x1 - x2) <= delta && Math.abs(y1 - y2) <= delta;
            }
            function diff(x1, y1, x2, y2) {
                return [ x1 - x2, y1 - y2 ];
            }
            module.exports = {
                isNull,
                diff,
                equal
            };
        },
        4374: (module, __unused_webpack_exports, __webpack_require__) => {
            const Pair = __webpack_require__(2674);
            const {anchor, Anchor} = __webpack_require__(6755);
            const {None} = __webpack_require__(2055);
            const {Connector} = __webpack_require__(511);
            const Structure = __webpack_require__(4857);
            const {itself, orthogonalTransform} = __webpack_require__(2721);
            class Piece {
                constructor({up = None, down = None, left = None, right = None} = {}, config = {}) {
                    this.up = up;
                    this.down = down;
                    this.left = left;
                    this.right = right;
                    this.metadata = {};
                    this.centralAnchor = null;
                    this._size = null;
                    this._horizontalConnector = null;
                    this._verticalConnector = null;
                    this._initializeListeners();
                    this.configure(config);
                }
                _initializeListeners() {
                    this.translateListeners = [];
                    this.connectListeners = [];
                    this.disconnectListeners = [];
                }
                configure(config) {
                    if (config.centralAnchor) this.centerAround(Anchor.import(config.centralAnchor));
                    if (config.metadata) this.annotate(config.metadata);
                    if (config.size) this.resize(config.size);
                }
                annotate(metadata) {
                    Object.assign(this.metadata, metadata);
                }
                reannotate(metadata) {
                    this.metadata = metadata;
                }
                belongTo(puzzle) {
                    this.puzzle = puzzle;
                }
                get presentConnections() {
                    return this.connections.filter(itself);
                }
                get connections() {
                    return [ this.rightConnection, this.downConnection, this.leftConnection, this.upConnection ];
                }
                get inserts() {
                    return [ this.right, this.down, this.left, this.up ];
                }
                onTranslate(f) {
                    this.translateListeners.push(f);
                }
                onConnect(f) {
                    this.connectListeners.push(f);
                }
                onDisconnect(f) {
                    this.disconnectListeners.push(f);
                }
                fireTranslate(dx, dy) {
                    this.translateListeners.forEach((it => it(this, dx, dy)));
                }
                fireConnect(other) {
                    this.connectListeners.forEach((it => it(this, other)));
                }
                fireDisconnect(others) {
                    others.forEach((other => {
                        this.disconnectListeners.forEach((it => it(this, other)));
                    }));
                }
                connectVerticallyWith(other, back = false) {
                    this.verticalConnector.connectWith(this, other, this.proximity, back);
                }
                attractVertically(other, back = false) {
                    this.verticalConnector.attract(this, other, back);
                }
                connectHorizontallyWith(other, back = false) {
                    this.horizontalConnector.connectWith(this, other, this.proximity, back);
                }
                attractHorizontally(other, back = false) {
                    this.horizontalConnector.attract(this, other, back);
                }
                tryConnectWith(other, back = false) {
                    this.tryConnectHorizontallyWith(other, back);
                    this.tryConnectVerticallyWith(other, back);
                }
                correctlyConnectedWith(other) {
                    if (!other) {
                        console.log("❌ Other piece is null");
                        return false;
                    }
                    const thisTarget = this.metadata.targetPosition;
                    const otherTarget = other.metadata.targetPosition;
                    const thisCurrent = this.metadata.currentPosition;
                    const otherCurrent = other.metadata.currentPosition;
                    if (!thisTarget || !otherTarget) return false;
                    const tolerance = this.diameter.x * .1;
                    const dx = thisTarget.x - otherTarget.x;
                    const dy = thisTarget.y - otherTarget.y;
                    const cx = thisCurrent.x - otherCurrent.x;
                    const cy = thisCurrent.y - otherCurrent.y;
                    const expectedDistanceX = this.diameter.x;
                    const expectedDistanceY = this.diameter.y;
                    const horizontal = Math.abs(dx + expectedDistanceX) <= tolerance && Math.abs(dy) <= tolerance;
                    const vertical = Math.abs(dy + expectedDistanceY) <= tolerance && Math.abs(dx) <= tolerance;
                    if (horizontal && Math.abs(cy) <= tolerance || vertical && Math.abs(cx) <= tolerance) return true; else return false;
                }
                tryConnectHorizontallyWith(other, back = false) {
                    if (this.canConnectHorizontallyWith(other)) this.connectHorizontallyWith(other, back);
                }
                tryConnectVerticallyWith(other, back = false) {
                    if (this.canConnectVerticallyWith(other)) this.connectVerticallyWith(other, back);
                }
                disconnect() {
                    if (!this.connected) return;
                    const connections = this.presentConnections;
                    if (this.upConnection) {
                        this.upConnection.downConnection = null;
                        this.upConnection = null;
                    }
                    if (this.downConnection) {
                        this.downConnection.upConnection = null;
                        this.downConnection = null;
                    }
                    if (this.leftConnection) {
                        this.leftConnection.rightConnection = null;
                        this.leftConnection = null;
                    }
                    if (this.rightConnection) {
                        this.rightConnection.leftConnection = null;
                        this.rightConnection = null;
                    }
                    this.fireDisconnect(connections);
                }
                centerAround(anchor) {
                    if (this.centralAnchor) throw new Error("this pieces has already being centered. Use recenterAround instead");
                    this.centralAnchor = anchor;
                }
                locateAt(x, y) {
                    this.centerAround(anchor(x, y));
                }
                isAt(x, y) {
                    return this.centralAnchor.isAt(x, y);
                }
                recenterAround(anchor, quiet = false) {
                    const [dx, dy] = anchor.diff(this.centralAnchor);
                    this.translate(dx, dy, quiet);
                }
                relocateTo(x, y, quiet = false) {
                    this.recenterAround(anchor(x, y), quiet);
                }
                translate(dx, dy, quiet = false) {
                    if (!Pair.isNull(dx, dy)) {
                        this.centralAnchor.translate(dx, dy);
                        if (!quiet) this.fireTranslate(dx, dy);
                    }
                }
                push(dx, dy, quiet = false, pushedPieces = [ this ]) {
                    this.translate(dx, dy, quiet);
                    const stationaries = this.presentConnections.filter((it => pushedPieces.indexOf(it) === -1));
                    pushedPieces.push(...stationaries);
                    stationaries.forEach((it => it.push(dx, dy, false, pushedPieces)));
                }
                drag(dx, dy, quiet = false) {
                    if (Pair.isNull(dx, dy)) return;
                    if (this.dragShouldDisconnect(dx, dy)) {
                        this.disconnect();
                        this.translate(dx, dy, quiet);
                    } else this.push(dx, dy, quiet);
                }
                dragShouldDisconnect(dx, dy) {
                    return this.puzzle.dragShouldDisconnect(this, dx, dy);
                }
                drop() {
                    this.puzzle.autoconnectWith(this);
                }
                dragAndDrop(dx, dy) {
                    this.drag(dx, dy);
                    this.drop();
                }
                canConnectHorizontallyWith(other) {
                    return this.horizontalConnector.canConnectWith(this, other, this.proximity);
                }
                canConnectVerticallyWith(other) {
                    return this.verticalConnector.canConnectWith(this, other, this.proximity);
                }
                verticallyCloseTo(other) {
                    return this.verticalConnector.closeTo(this, other, this.proximity);
                }
                horizontallyCloseTo(other) {
                    return this.horizontalConnector.closeTo(this, other, this.proximity);
                }
                verticallyMatch(other) {
                    return this.verticalConnector.match(this, other);
                }
                horizontallyMatch(other) {
                    return this.horizontalConnector.match(this, other);
                }
                get connected() {
                    return !!(this.upConnection || this.downConnection || this.leftConnection || this.rightConnection);
                }
                get downAnchor() {
                    return this.centralAnchor.translated(0, this.radius.y);
                }
                get rightAnchor() {
                    return this.centralAnchor.translated(this.radius.x, 0);
                }
                get upAnchor() {
                    return this.centralAnchor.translated(0, -this.radius.y);
                }
                get leftAnchor() {
                    return this.centralAnchor.translated(-this.radius.x, 0);
                }
                resize(size) {
                    this._size = size;
                }
                get radius() {
                    return this.size.radius;
                }
                get diameter() {
                    return this.size.diameter;
                }
                get size() {
                    return this._size || this.puzzle.pieceSize;
                }
                get proximity() {
                    return this.puzzle.proximity;
                }
                get id() {
                    return this.metadata.id;
                }
                get horizontalConnector() {
                    return this.getConnector("horizontal");
                }
                get verticalConnector() {
                    return this.getConnector("vertical");
                }
                getConnector(kind) {
                    const connector = kind + "Connector";
                    const _connector = "_" + connector;
                    if (this.puzzle && !this[_connector]) return this.puzzle[connector];
                    if (!this[_connector]) this[_connector] = Connector[kind]();
                    return this[_connector];
                }
                export({compact = false} = {}) {
                    const base = {
                        centralAnchor: this.centralAnchor && this.centralAnchor.export(),
                        structure: Structure.serialize(this),
                        metadata: this.metadata
                    };
                    if (this._size) base.size = {
                        radius: this._size.radius
                    };
                    return compact ? base : Object.assign(base, {
                        connections: orthogonalTransform(this.connections, (it => ({
                            id: it.id
                        })))
                    });
                }
                static import(dump) {
                    return new Piece(Structure.deserialize(dump.structure), {
                        centralAnchor: dump.centralAnchor,
                        metadata: dump.metadata,
                        size: dump.size
                    });
                }
            }
            module.exports = Piece;
        },
        2721: module => {
            function pivot(one, other, back = false) {
                return back ? [ one, other ] : [ other, one ];
            }
            function orthogonalMap(values, mapper, replacement = null) {
                return values.map((it => {
                    const value = it || replacement;
                    return value && mapper(value);
                }));
            }
            function orthogonalTransform(values, mapper, replacement = null) {
                const [right, down, left, up] = orthogonalMap(values, mapper, replacement);
                return {
                    right,
                    down,
                    left,
                    up
                };
            }
            function itself(arg) {
                return arg;
            }
            module.exports = {
                pivot,
                itself,
                orthogonalMap,
                orthogonalTransform
            };
        },
        222: (module, __unused_webpack_exports, __webpack_require__) => {
            const {Anchor} = __webpack_require__(6755);
            const Piece = __webpack_require__(4374);
            const {NullValidator} = __webpack_require__(3906);
            const {vector, ...Vector} = __webpack_require__(2653);
            const {radius} = __webpack_require__(3491);
            const Shuffler = __webpack_require__(9243);
            const dragMode = __webpack_require__(6754);
            const {Connector, noConnectionRequirements} = __webpack_require__(511);
            class Puzzle {
                constructor({pieceRadius = 2, proximity = 1} = {}) {
                    this.pieceSize = radius(pieceRadius);
                    this.proximity = proximity;
                    this.pieces = [];
                    this.validator = new NullValidator;
                    this.dragMode = dragMode.TryDisconnection;
                    this.horizontalConnector = Connector.horizontal();
                    this.verticalConnector = Connector.vertical();
                }
                newPiece(structure = {}, config = {}) {
                    const piece = new Piece(structure, config);
                    this.addPiece(piece);
                    return piece;
                }
                addPiece(piece) {
                    this.pieces.push(piece);
                    piece.belongTo(this);
                }
                addPieces(pieces) {
                    pieces.forEach((it => this.addPiece(it)));
                }
                annotate(metadata) {
                    this.pieces.forEach(((piece, index) => piece.annotate(metadata[index])));
                }
                relocateTo(points) {
                    this.pieces.forEach(((piece, index) => piece.relocateTo(...points[index])));
                }
                autoconnect() {
                    this.pieces.forEach((it => this.autoconnectWith(it)));
                }
                disconnect() {
                    this.pieces.forEach((it => it.disconnect()));
                }
                autoconnectWith(piece) {
                    this.pieces.filter((it => it !== piece)).forEach((other => {
                        piece.tryConnectWith(other);
                        other.tryConnectWith(piece, true);
                    }));
                }
                shuffle(maxX, maxY) {
                    this.shuffleWith(Shuffler.random(maxX, maxY));
                }
                shuffleWith(shuffler) {
                    this.disconnect();
                    shuffler(this.pieces).forEach((({x, y}, index) => {
                        this.pieces[index].relocateTo(x, y);
                    }));
                    this.autoconnect();
                }
                translate(dx, dy) {
                    this.pieces.forEach((it => it.translate(dx, dy)));
                }
                reframe(min, max) {
                    let dx;
                    const leftOffstage = min.x - Math.min(...this.pieces.map((it => it.leftAnchor.x)));
                    if (leftOffstage > 0) dx = leftOffstage; else {
                        const rightOffstage = max.x - Math.max(...this.pieces.map((it => it.rightAnchor.x)));
                        if (rightOffstage < 0) dx = rightOffstage; else dx = 0;
                    }
                    let dy;
                    const upOffstage = min.y - Math.min(...this.pieces.map((it => it.upAnchor.y)));
                    if (upOffstage > 0) dy = upOffstage; else {
                        const downOffstage = max.y - Math.max(...this.pieces.map((it => it.downAnchor.y)));
                        if (downOffstage < 0) dy = downOffstage; else dy = 0;
                    }
                    this.translate(dx, dy);
                }
                onTranslate(f) {
                    this.pieces.forEach((it => it.onTranslate(f)));
                }
                onConnect(f) {
                    this.pieces.forEach((it => it.onConnect(f)));
                }
                onDisconnect(f) {
                    this.pieces.forEach((it => it.onDisconnect(f)));
                }
                onValid(f) {
                    this.validator.onValid(f);
                }
                get points() {
                    return this.pieces.map((it => it.centralAnchor.asPair()));
                }
                get refs() {
                    return this.points.map((([x, y], index) => {
                        const diameter = this.pieces[index].diameter;
                        return [ x / diameter.x, y / diameter.y ];
                    }));
                }
                get metadata() {
                    return this.pieces.map((it => it.metadata));
                }
                get head() {
                    return this.pieces[0];
                }
                get headAnchor() {
                    return this.head.centralAnchor;
                }
                get verticalRequirement() {
                    return this.verticalConnector.requirement;
                }
                get horizontalRequirement() {
                    return this.horizontalConnector.requirement;
                }
                attachHorizontalConnectionRequirement(requirement) {
                    this.horizontalConnector.attachRequirement(requirement);
                }
                attachVerticalConnectionRequirement(requirement) {
                    this.verticalConnector.attachRequirement(requirement);
                }
                attachConnectionRequirement(requirement) {
                    this.attachHorizontalConnectionRequirement(requirement);
                    this.attachVerticalConnectionRequirement(requirement);
                }
                clearConnectionRequirements() {
                    this.attachConnectionRequirement(noConnectionRequirements);
                }
                attachValidator(validator) {
                    this.validator = validator;
                }
                isValid() {
                    return this.validator.isValid(this);
                }
                get valid() {
                    return this.validator.valid;
                }
                validate() {
                    this.validator.validate(this);
                }
                updateValidity() {
                    this.validator.validate(this);
                }
                get connected() {
                    return this.pieces.every((it => it.connected));
                }
                get pieceDiameter() {
                    return this.pieceSize.diameter;
                }
                get pieceRadius() {
                    return this.pieceSize.radius;
                }
                forceConnectionWhileDragging() {
                    this.dragMode = dragMode.ForceConnection;
                }
                forceDisconnectionWhileDragging() {
                    this.dragMode = dragMode.ForceDisconnection;
                }
                tryDisconnectionWhileDragging() {
                    this.dragMode = dragMode.TryDisconnection;
                }
                dragShouldDisconnect(piece, dx, dy) {
                    return this.dragMode.dragShouldDisconnect(piece, dx, dy);
                }
                export(options = {}) {
                    return {
                        pieceRadius: this.pieceRadius,
                        proximity: this.proximity,
                        pieces: this.pieces.map((it => it.export(options)))
                    };
                }
                static import(dump) {
                    const puzzle = new Puzzle({
                        pieceRadius: dump.pieceRadius,
                        proximity: dump.proximity
                    });
                    puzzle.addPieces(dump.pieces.map((it => Piece.import(it))));
                    puzzle.autoconnect();
                    return puzzle;
                }
            }
            module.exports = Puzzle;
        },
        9351: (module, __unused_webpack_exports, __webpack_require__) => {
            const {Tab, Slot, None} = __webpack_require__(2055);
            function fixed(_n) {
                return Tab;
            }
            function flipflop(n) {
                return n % 2 === 0 ? Tab : Slot;
            }
            function twoAndTwo(n) {
                return n % 4 < 2 ? Tab : Slot;
            }
            function random(_) {
                return Math.random() < .5 ? Tab : Slot;
            }
            class InsertSequence {
                constructor(generator) {
                    this.generator = generator;
                    this.n = 0;
                    this._previous;
                    this._current = None;
                }
                previousComplement() {
                    return this._previous.complement();
                }
                current(max) {
                    if (this.n == max) return None;
                    return this._current;
                }
                next() {
                    this._previous = this._current;
                    this._current = this.generator(this.n++);
                    return this._current;
                }
            }
            module.exports = {
                InsertSequence,
                fixed,
                flipflop,
                twoAndTwo,
                random
            };
        },
        9243: (module, __unused_webpack_exports, __webpack_require__) => {
            const {Anchor} = __webpack_require__(6755);
            function sampleIndex(list) {
                return Math.round(Math.random() * (list.length - 1));
            }
            function random(maxX, maxY) {
                return pieces => pieces.map((_it => Anchor.atRandom(maxX, maxY)));
            }
            const grid = pieces => {
                const destinations = pieces.map((it => it.centralAnchor.asVector()));
                for (let i = 0; i < destinations.length; i++) {
                    const j = sampleIndex(destinations);
                    const temp = destinations[j];
                    destinations[j] = destinations[i];
                    destinations[i] = temp;
                }
                return destinations;
            };
            const columns = pieces => {
                const destinations = pieces.map((it => it.centralAnchor.asVector()));
                const columns = new Map;
                for (let destination of destinations) {
                    if (!columns.get(destination.x)) columns.set(destination.x, destinations.filter((it => it.x == destination.x)));
                    const column = columns.get(destination.x);
                    const j = sampleIndex(column);
                    const temp = column[j].y;
                    column[j].y = destination.y;
                    destination.y = temp;
                }
                return destinations;
            };
            const line = pieces => {
                const destinations = pieces.map((it => it.centralAnchor.asVector()));
                const columns = new Set(destinations.map((it => it.x)));
                const maxX = Math.max(...columns);
                const minX = Math.min(...columns);
                const width = (maxX - minX) / (columns.size - 1);
                const pivot = minX + width / 2;
                const lineLength = destinations.length * width;
                const linePivot = destinations.filter((it => it.x < pivot)).length * width;
                const init = [];
                const tail = [];
                for (let i = 0; i < linePivot; i += width) init.push(i);
                for (let i = init[init.length - 1] + width; i < lineLength; i += width) tail.push(i);
                for (let destination of destinations) {
                    const source = destination.x < pivot ? init : tail;
                    const index = sampleIndex(source);
                    destination.y = 0;
                    destination.x = source[index];
                    source.splice(index, 1);
                }
                return destinations;
            };
            function padder(padding, width, height) {
                return pieces => {
                    const destinations = pieces.map((it => it.centralAnchor.asVector()));
                    let dx = 0;
                    let dy = 0;
                    for (let j = 0; j < height; j++) {
                        for (let i = 0; i < width; i++) {
                            const destination = destinations[i + width * j];
                            destination.x += dx;
                            destination.y += dy;
                            dx += padding;
                        }
                        dx = 0;
                        dy += padding;
                    }
                    return destinations;
                };
            }
            function noise(maxDistance) {
                return pieces => pieces.map((it => Anchor.atRandom(2 * maxDistance.x, 2 * maxDistance.y).translate(-maxDistance.x, -maxDistance.y).translate(it.centralAnchor.x, it.centralAnchor.y).asVector()));
            }
            const noop = pieces => pieces.map((it => it.centralAnchor));
            module.exports = {
                random,
                grid,
                columns,
                line,
                noop,
                padder,
                noise
            };
        },
        3491: (module, __unused_webpack_exports, __webpack_require__) => {
            const Vector = __webpack_require__(2653);
            function radius(value) {
                const vector = Vector.cast(value);
                return {
                    radius: vector,
                    diameter: Vector.multiply(vector, 2)
                };
            }
            function diameter(value) {
                const vector = Vector.cast(value);
                return {
                    radius: Vector.multiply(vector, .5),
                    diameter: vector
                };
            }
            module.exports = {
                radius,
                diameter
            };
        },
        8516: (module, __unused_webpack_exports, __webpack_require__) => {
            const Vector = __webpack_require__(2653);
            __webpack_require__(4374);
            __webpack_require__(2674);
            const {PuzzleValidator} = __webpack_require__(3906);
            function diffToTarget(piece) {
                return Vector.diff(piece.metadata.targetPosition, piece.centralAnchor.asVector());
            }
            const solved = puzzle => relativePosition(puzzle) && PuzzleValidator.connected(puzzle);
            const relativePosition = puzzle => {
                const diff0 = diffToTarget(puzzle.head);
                return puzzle.pieces.every((piece => PuzzleValidator.equalDiffs(diff0, diffToTarget(piece))));
            };
            const absolutePosition = piece => Vector.equal(piece.centralAnchor.asVector(), piece.metadata.targetPosition);
            function initialize(metadata, target, current) {
                metadata.targetPosition = metadata.targetPosition || target;
                metadata.currentPosition = metadata.currentPosition || current || Vector.copy(metadata.targetPosition);
            }
            module.exports = {
                initialize,
                solved,
                relativePosition,
                absolutePosition
            };
        },
        4857: (module, __unused_webpack_exports, __webpack_require__) => {
            const {Slot, Tab, None} = __webpack_require__(2055);
            const {orthogonalMap} = __webpack_require__(2721);
            function parseInsert(insert) {
                return insert === "S" ? Slot : insert === "T" ? Tab : None;
            }
            function serialize(structure) {
                return orthogonalMap([ structure.right, structure.down, structure.left, structure.up ], (it => it.serialize()), None).join("");
            }
            function deserialize(string) {
                if (string.length !== 4) throw new Error("structure string must be 4-chars long");
                return {
                    right: parseInsert(string[0]),
                    down: parseInsert(string[1]),
                    left: parseInsert(string[2]),
                    up: parseInsert(string[3])
                };
            }
            function asStructure(structureLike) {
                if (typeof structureLike === "string") return deserialize(structureLike);
                return structureLike;
            }
            module.exports = {
                serialize,
                deserialize,
                asStructure
            };
        },
        3906: (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(222);
            __webpack_require__(4374);
            const Pair = __webpack_require__(2674);
            class AbstractValidator {
                constructor() {
                    this.validListeners = [];
                    this._valid = void 0;
                }
                validate(puzzle) {
                    const wasValid = this._valid;
                    this.updateValidity(puzzle);
                    if (this._valid && !wasValid) this.fireValid(puzzle);
                }
                updateValidity(puzzle) {
                    this._valid = this.isValid(puzzle);
                }
                fireValid(puzzle) {
                    this.validListeners.forEach((it => it(puzzle)));
                }
                onValid(f) {
                    this.validListeners.push(f);
                }
                get valid() {
                    return this._valid;
                }
                get isNull() {
                    return false;
                }
            }
            class PieceValidator extends AbstractValidator {
                constructor(f) {
                    super();
                    this.condition = f;
                }
                isValid(puzzle) {
                    return puzzle.pieces.every((it => this.condition(it)));
                }
            }
            class PuzzleValidator extends AbstractValidator {
                constructor(f) {
                    super();
                    this.condition = f;
                }
                isValid(puzzle) {
                    return this.condition(puzzle);
                }
                static equalDiffs([dx0, dy0], [dx, dy]) {
                    return Pair.equal(dx0, dy0, dx, dy, PuzzleValidator.DIFF_DELTA);
                }
            }
            class NullValidator extends AbstractValidator {
                isValid(puzzle) {
                    return false;
                }
                get isNull() {
                    return true;
                }
            }
            PuzzleValidator.DIFF_DELTA = .01;
            PuzzleValidator.connected = puzzle => puzzle.connected;
            PuzzleValidator.relativeRefs = expected => puzzle => {
                function diff(x, y, index) {
                    return Pair.diff(x, y, ...expected[index]);
                }
                const refs = puzzle.refs;
                const [x0, y0] = refs[0];
                const diff0 = diff(x0, y0, 0);
                return refs.every((([x, y], index) => PuzzleValidator.equalDiffs(diff0, diff(x, y, index))));
            };
            module.exports = {
                PuzzleValidator,
                PieceValidator,
                NullValidator
            };
        },
        2653: (module, __unused_webpack_exports, __webpack_require__) => {
            const Pair = __webpack_require__(2674);
            function vector(x, y) {
                return {
                    x,
                    y
                };
            }
            function cast(value) {
                if (typeof value === "number") return vector(value, value); else return value;
            }
            function zero() {
                return vector(0, 0);
            }
            function equal(one, other, delta = 0) {
                return Pair.equal(one.x, one.y, other.x, other.y, delta);
            }
            function copy({x, y}) {
                return {
                    x,
                    y
                };
            }
            function update(vector, x, y) {
                vector.x = x;
                vector.y = y;
            }
            function diff(one, other) {
                return Pair.diff(one.x, one.y, other.x, other.y);
            }
            function multiply(one, other) {
                return apply(one, other, ((v1, v2) => v1 * v2));
            }
            function divide(one, other) {
                return apply(one, other, ((v1, v2) => v1 / v2));
            }
            function plus(one, other) {
                return apply(one, other, ((v1, v2) => v1 + v2));
            }
            function minus(one, other) {
                return apply(one, other, ((v1, v2) => v1 - v2));
            }
            function min(one, other) {
                return apply(one, other, Math.min);
            }
            function max(one, other) {
                return apply(one, other, Math.max);
            }
            function apply(one, other, f) {
                const first = cast(one);
                const second = cast(other);
                return {
                    x: f(first.x, second.x),
                    y: f(first.y, second.y)
                };
            }
            const inner = {
                min(one) {
                    return this.apply(one, Math.min);
                },
                max(one) {
                    return this.apply(one, Math.max);
                },
                apply(one, f) {
                    return f(one.x, one.y);
                }
            };
            module.exports = {
                cast,
                vector,
                copy,
                equal,
                zero,
                update,
                diff,
                multiply,
                divide,
                plus,
                minus,
                apply,
                min,
                max,
                inner
            };
        }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== void 0) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        return module.exports;
    }
    (() => {
        __webpack_require__.g = function() {
            if (typeof globalThis === "object") return globalThis;
            try {
                return this || new Function("return this")();
            } catch (e) {
                if (typeof window === "object") return window;
            }
        }();
    })();
    (() => {
        "use strict";
        const modules_flsModules = {};
        let _slideUp = (target, duration = 500, showmore = 0) => {
            if (!target.classList.contains("_slide")) {
                target.classList.add("_slide");
                target.style.transitionProperty = "height, margin, padding";
                target.style.transitionDuration = duration + "ms";
                target.style.height = `${target.offsetHeight}px`;
                target.offsetHeight;
                target.style.overflow = "hidden";
                target.style.height = showmore ? `${showmore}px` : `0px`;
                target.style.paddingTop = 0;
                target.style.paddingBottom = 0;
                target.style.marginTop = 0;
                target.style.marginBottom = 0;
                window.setTimeout((() => {
                    target.hidden = !showmore ? true : false;
                    !showmore ? target.style.removeProperty("height") : null;
                    target.style.removeProperty("padding-top");
                    target.style.removeProperty("padding-bottom");
                    target.style.removeProperty("margin-top");
                    target.style.removeProperty("margin-bottom");
                    !showmore ? target.style.removeProperty("overflow") : null;
                    target.style.removeProperty("transition-duration");
                    target.style.removeProperty("transition-property");
                    target.classList.remove("_slide");
                    document.dispatchEvent(new CustomEvent("slideUpDone", {
                        detail: {
                            target
                        }
                    }));
                }), duration);
            }
        };
        let _slideDown = (target, duration = 500, showmore = 0) => {
            if (!target.classList.contains("_slide")) {
                target.classList.add("_slide");
                target.hidden = target.hidden ? false : null;
                showmore ? target.style.removeProperty("height") : null;
                let height = target.offsetHeight;
                target.style.overflow = "hidden";
                target.style.height = showmore ? `${showmore}px` : `0px`;
                target.style.paddingTop = 0;
                target.style.paddingBottom = 0;
                target.style.marginTop = 0;
                target.style.marginBottom = 0;
                target.offsetHeight;
                target.style.transitionProperty = "height, margin, padding";
                target.style.transitionDuration = duration + "ms";
                target.style.height = height + "px";
                target.style.removeProperty("padding-top");
                target.style.removeProperty("padding-bottom");
                target.style.removeProperty("margin-top");
                target.style.removeProperty("margin-bottom");
                window.setTimeout((() => {
                    target.style.removeProperty("height");
                    target.style.removeProperty("overflow");
                    target.style.removeProperty("transition-duration");
                    target.style.removeProperty("transition-property");
                    target.classList.remove("_slide");
                    document.dispatchEvent(new CustomEvent("slideDownDone", {
                        detail: {
                            target
                        }
                    }));
                }), duration);
            }
        };
        let _slideToggle = (target, duration = 500) => {
            if (target.hidden) return _slideDown(target, duration); else return _slideUp(target, duration);
        };
        function functions_FLS(message) {
            setTimeout((() => {
                if (window.FLS) console.log(message);
            }), 0);
        }
        let formValidate = {
            getErrors(form) {
                let error = 0;
                let formRequiredItems = form.querySelectorAll("*[data-required]");
                if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                    if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
                }));
                return error;
            },
            validateInput(formRequiredItem) {
                let error = 0;
                if (formRequiredItem.dataset.required === "email") {
                    formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                    if (this.emailTest(formRequiredItem)) {
                        this.addError(formRequiredItem);
                        error++;
                    } else this.removeError(formRequiredItem);
                } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
                    this.addError(formRequiredItem);
                    error++;
                } else if (!formRequiredItem.value.trim()) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
                return error;
            },
            addError(formRequiredItem) {
                formRequiredItem.classList.add("_form-error");
                formRequiredItem.parentElement.classList.add("_form-error");
                let inputError = formRequiredItem.parentElement.querySelector(".form__error");
                if (inputError) formRequiredItem.parentElement.removeChild(inputError);
                if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
            },
            removeError(formRequiredItem) {
                formRequiredItem.classList.remove("_form-error");
                formRequiredItem.parentElement.classList.remove("_form-error");
                if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
            },
            formClean(form) {
                form.reset();
                setTimeout((() => {
                    let inputs = form.querySelectorAll("input,textarea");
                    for (let index = 0; index < inputs.length; index++) {
                        const el = inputs[index];
                        el.parentElement.classList.remove("_form-focus");
                        el.classList.remove("_form-focus");
                        formValidate.removeError(el);
                    }
                    let checkboxes = form.querySelectorAll(".checkbox__input");
                    if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                        const checkbox = checkboxes[index];
                        checkbox.checked = false;
                    }
                    if (modules_flsModules.select) {
                        let selects = form.querySelectorAll("div.select");
                        if (selects.length) for (let index = 0; index < selects.length; index++) {
                            const select = selects[index].querySelector("select");
                            modules_flsModules.select.selectBuild(select);
                        }
                    }
                }), 0);
            },
            emailTest(formRequiredItem) {
                return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
            }
        };
        class SelectConstructor {
            constructor(props, data = null) {
                let defaultConfig = {
                    init: true,
                    logging: true,
                    speed: 150
                };
                this.config = Object.assign(defaultConfig, props);
                this.selectClasses = {
                    classSelect: "select",
                    classSelectBody: "select__body",
                    classSelectTitle: "select__title",
                    classSelectValue: "select__value",
                    classSelectLabel: "select__label",
                    classSelectInput: "select__input",
                    classSelectText: "select__text",
                    classSelectLink: "select__link",
                    classSelectOptions: "select__options",
                    classSelectOptionsScroll: "select__scroll",
                    classSelectOption: "select__option",
                    classSelectContent: "select__content",
                    classSelectRow: "select__row",
                    classSelectData: "select__asset",
                    classSelectDisabled: "_select-disabled",
                    classSelectTag: "_select-tag",
                    classSelectOpen: "_select-open",
                    classSelectActive: "_select-active",
                    classSelectFocus: "_select-focus",
                    classSelectMultiple: "_select-multiple",
                    classSelectCheckBox: "_select-checkbox",
                    classSelectOptionSelected: "_select-selected",
                    classSelectPseudoLabel: "_select-pseudo-label"
                };
                this._this = this;
                if (this.config.init) {
                    const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll("select");
                    if (selectItems.length) {
                        this.selectsInit(selectItems);
                        this.setLogging(`Прокинувся, построїв селектов: (${selectItems.length})`);
                    } else this.setLogging("Сплю, немає жодного select");
                }
            }
            getSelectClass(className) {
                return `.${className}`;
            }
            getSelectElement(selectItem, className) {
                return {
                    originalSelect: selectItem.querySelector("select"),
                    selectElement: selectItem.querySelector(this.getSelectClass(className))
                };
            }
            selectsInit(selectItems) {
                selectItems.forEach(((originalSelect, index) => {
                    this.selectInit(originalSelect, index + 1);
                }));
                document.addEventListener("click", function(e) {
                    this.selectsActions(e);
                }.bind(this));
                document.addEventListener("keydown", function(e) {
                    this.selectsActions(e);
                }.bind(this));
                document.addEventListener("focusin", function(e) {
                    this.selectsActions(e);
                }.bind(this));
                document.addEventListener("focusout", function(e) {
                    this.selectsActions(e);
                }.bind(this));
            }
            selectInit(originalSelect, index) {
                const _this = this;
                let selectItem = document.createElement("div");
                selectItem.classList.add(this.selectClasses.classSelect);
                originalSelect.parentNode.insertBefore(selectItem, originalSelect);
                selectItem.appendChild(originalSelect);
                originalSelect.hidden = true;
                index ? originalSelect.dataset.id = index : null;
                if (this.getSelectPlaceholder(originalSelect)) {
                    originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
                    if (this.getSelectPlaceholder(originalSelect).label.show) {
                        const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
                        selectItemTitle.insertAdjacentHTML("afterbegin", `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
                    }
                }
                selectItem.insertAdjacentHTML("beforeend", `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
                this.selectBuild(originalSelect);
                originalSelect.dataset.speed = originalSelect.dataset.speed ? originalSelect.dataset.speed : this.config.speed;
                this.config.speed = +originalSelect.dataset.speed;
                originalSelect.addEventListener("change", (function(e) {
                    _this.selectChange(e);
                }));
            }
            selectBuild(originalSelect) {
                const selectItem = originalSelect.parentElement;
                selectItem.dataset.id = originalSelect.dataset.id;
                originalSelect.dataset.classModif ? selectItem.classList.add(`select_${originalSelect.dataset.classModif}`) : null;
                originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
                originalSelect.hasAttribute("data-checkbox") && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
                this.setSelectTitleValue(selectItem, originalSelect);
                this.setOptions(selectItem, originalSelect);
                originalSelect.hasAttribute("data-search") ? this.searchActions(selectItem) : null;
                originalSelect.hasAttribute("data-open") ? this.selectAction(selectItem) : null;
                this.selectDisabled(selectItem, originalSelect);
            }
            selectsActions(e) {
                const targetElement = e.target;
                const targetType = e.type;
                if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelect)) || targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag))) {
                    const selectItem = targetElement.closest(".select") ? targetElement.closest(".select") : document.querySelector(`.${this.selectClasses.classSelect}[data-id="${targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag)).dataset.selectId}"]`);
                    const originalSelect = this.getSelectElement(selectItem).originalSelect;
                    if (targetType === "click") {
                        if (!originalSelect.disabled) if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag))) {
                            const targetTag = targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag));
                            const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-id="${targetTag.dataset.selectId}"] .select__option[data-value="${targetTag.dataset.value}"]`);
                            this.optionAction(selectItem, originalSelect, optionItem);
                        } else if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTitle))) this.selectAction(selectItem); else if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectOption))) {
                            const optionItem = targetElement.closest(this.getSelectClass(this.selectClasses.classSelectOption));
                            this.optionAction(selectItem, originalSelect, optionItem);
                        }
                    } else if (targetType === "focusin" || targetType === "focusout") {
                        if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelect))) targetType === "focusin" ? selectItem.classList.add(this.selectClasses.classSelectFocus) : selectItem.classList.remove(this.selectClasses.classSelectFocus);
                    } else if (targetType === "keydown" && e.code === "Escape") this.selectsСlose();
                } else this.selectsСlose();
            }
            selectsСlose(selectOneGroup) {
                const selectsGroup = selectOneGroup ? selectOneGroup : document;
                const selectActiveItems = selectsGroup.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
                if (selectActiveItems.length) selectActiveItems.forEach((selectActiveItem => {
                    this.selectСlose(selectActiveItem);
                }));
            }
            selectСlose(selectItem) {
                const originalSelect = this.getSelectElement(selectItem).originalSelect;
                const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
                if (!selectOptions.classList.contains("_slide")) {
                    selectItem.classList.remove(this.selectClasses.classSelectOpen);
                    _slideUp(selectOptions, originalSelect.dataset.speed);
                    setTimeout((() => {
                        selectItem.style.zIndex = "";
                    }), originalSelect.dataset.speed);
                }
            }
            selectAction(selectItem) {
                const originalSelect = this.getSelectElement(selectItem).originalSelect;
                const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
                const selectOpenzIndex = originalSelect.dataset.zIndex ? originalSelect.dataset.zIndex : 3;
                this.setOptionsPosition(selectItem);
                if (originalSelect.closest("[data-one-select]")) {
                    const selectOneGroup = originalSelect.closest("[data-one-select]");
                    this.selectsСlose(selectOneGroup);
                }
                setTimeout((() => {
                    if (!selectOptions.classList.contains("_slide")) {
                        selectItem.classList.toggle(this.selectClasses.classSelectOpen);
                        _slideToggle(selectOptions, originalSelect.dataset.speed);
                        if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) selectItem.style.zIndex = selectOpenzIndex; else setTimeout((() => {
                            selectItem.style.zIndex = "";
                        }), originalSelect.dataset.speed);
                    }
                }), 0);
            }
            setSelectTitleValue(selectItem, originalSelect) {
                const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
                const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
                if (selectItemTitle) selectItemTitle.remove();
                selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
                originalSelect.hasAttribute("data-search") ? this.searchActions(selectItem) : null;
            }
            getSelectTitleValue(selectItem, originalSelect) {
                let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
                if (originalSelect.multiple && originalSelect.hasAttribute("data-tags")) {
                    selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map((option => `<span role="button" data-select-id="${selectItem.dataset.id}" data-value="${option.value}" class="_select-tag">${this.getSelectElementContent(option)}</span>`)).join("");
                    if (originalSelect.dataset.tags && document.querySelector(originalSelect.dataset.tags)) {
                        document.querySelector(originalSelect.dataset.tags).innerHTML = selectTitleValue;
                        if (originalSelect.hasAttribute("data-search")) selectTitleValue = false;
                    }
                }
                selectTitleValue = selectTitleValue.length ? selectTitleValue : originalSelect.dataset.placeholder ? originalSelect.dataset.placeholder : "";
                let pseudoAttribute = "";
                let pseudoAttributeClass = "";
                if (originalSelect.hasAttribute("data-pseudo-label")) {
                    pseudoAttribute = originalSelect.dataset.pseudoLabel ? ` data-pseudo-label="${originalSelect.dataset.pseudoLabel}"` : ` data-pseudo-label="Заповніть атрибут"`;
                    pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
                }
                this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
                if (originalSelect.hasAttribute("data-search")) return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`; else {
                    const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.class ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.class}` : "";
                    return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
                }
            }
            getSelectElementContent(selectOption) {
                const selectOptionData = selectOption.dataset.asset ? `${selectOption.dataset.asset}` : "";
                const selectOptionDataHTML = selectOptionData.indexOf("img") >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
                let selectOptionContentHTML = ``;
                selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : "";
                selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : "";
                selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : "";
                selectOptionContentHTML += selectOptionData ? `</span>` : "";
                selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : "";
                selectOptionContentHTML += selectOption.textContent;
                selectOptionContentHTML += selectOptionData ? `</span>` : "";
                selectOptionContentHTML += selectOptionData ? `</span>` : "";
                return selectOptionContentHTML;
            }
            getSelectPlaceholder(originalSelect) {
                const selectPlaceholder = Array.from(originalSelect.options).find((option => !option.value));
                if (selectPlaceholder) return {
                    value: selectPlaceholder.textContent,
                    show: selectPlaceholder.hasAttribute("data-show"),
                    label: {
                        show: selectPlaceholder.hasAttribute("data-label"),
                        text: selectPlaceholder.dataset.label
                    }
                };
            }
            getSelectedOptionsData(originalSelect, type) {
                let selectedOptions = [];
                if (originalSelect.multiple) selectedOptions = Array.from(originalSelect.options).filter((option => option.value)).filter((option => option.selected)); else selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
                return {
                    elements: selectedOptions.map((option => option)),
                    values: selectedOptions.filter((option => option.value)).map((option => option.value)),
                    html: selectedOptions.map((option => this.getSelectElementContent(option)))
                };
            }
            getOptions(originalSelect) {
                const selectOptionsScroll = originalSelect.hasAttribute("data-scroll") ? `data-simplebar` : "";
                const customMaxHeightValue = +originalSelect.dataset.scroll ? +originalSelect.dataset.scroll : null;
                let selectOptions = Array.from(originalSelect.options);
                if (selectOptions.length > 0) {
                    let selectOptionsHTML = ``;
                    if (this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show || originalSelect.multiple) selectOptions = selectOptions.filter((option => option.value));
                    selectOptionsHTML += `<div ${selectOptionsScroll} ${selectOptionsScroll ? `style="max-height: ${customMaxHeightValue}px"` : ""} class="${this.selectClasses.classSelectOptionsScroll}">`;
                    selectOptions.forEach((selectOption => {
                        selectOptionsHTML += this.getOption(selectOption, originalSelect);
                    }));
                    selectOptionsHTML += `</div>`;
                    return selectOptionsHTML;
                }
            }
            getOption(selectOption, originalSelect) {
                const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : "";
                const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute("data-show-selected") && !originalSelect.multiple ? `hidden` : ``;
                const selectOptionClass = selectOption.dataset.class ? ` ${selectOption.dataset.class}` : "";
                const selectOptionLink = selectOption.dataset.href ? selectOption.dataset.href : false;
                const selectOptionLinkTarget = selectOption.hasAttribute("data-href-blank") ? `target="_blank"` : "";
                let selectOptionHTML = ``;
                selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-value="${selectOption.value}" type="button">`;
                selectOptionHTML += this.getSelectElementContent(selectOption);
                selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
                return selectOptionHTML;
            }
            setOptions(selectItem, originalSelect) {
                const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
                selectItemOptions.innerHTML = this.getOptions(originalSelect);
            }
            setOptionsPosition(selectItem) {
                const originalSelect = this.getSelectElement(selectItem).originalSelect;
                const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
                const selectItemScroll = this.getSelectElement(selectItem, this.selectClasses.classSelectOptionsScroll).selectElement;
                const customMaxHeightValue = +originalSelect.dataset.scroll ? `${+originalSelect.dataset.scroll}px` : ``;
                const selectOptionsPosMargin = +originalSelect.dataset.optionsMargin ? +originalSelect.dataset.optionsMargin : 10;
                if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
                    selectOptions.hidden = false;
                    const selectItemScrollHeight = selectItemScroll.offsetHeight ? selectItemScroll.offsetHeight : parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue("max-height"));
                    const selectOptionsHeight = selectOptions.offsetHeight > selectItemScrollHeight ? selectOptions.offsetHeight : selectItemScrollHeight + selectOptions.offsetHeight;
                    const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
                    selectOptions.hidden = true;
                    const selectItemHeight = selectItem.offsetHeight;
                    const selectItemPos = selectItem.getBoundingClientRect().top;
                    const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
                    const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);
                    if (selectItemResult < 0) {
                        const newMaxHeightValue = selectOptionsHeight + selectItemResult;
                        if (newMaxHeightValue < 100) {
                            selectItem.classList.add("select--show-top");
                            selectItemScroll.style.maxHeight = selectItemPos < selectOptionsHeight ? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px` : customMaxHeightValue;
                        } else {
                            selectItem.classList.remove("select--show-top");
                            selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
                        }
                    }
                } else setTimeout((() => {
                    selectItem.classList.remove("select--show-top");
                    selectItemScroll.style.maxHeight = customMaxHeightValue;
                }), +originalSelect.dataset.speed);
            }
            optionAction(selectItem, originalSelect, optionItem) {
                const selectOptions = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOptions)}`);
                if (!selectOptions.classList.contains("_slide")) {
                    if (originalSelect.multiple) {
                        optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
                        const originalSelectSelectedItems = this.getSelectedOptionsData(originalSelect).elements;
                        originalSelectSelectedItems.forEach((originalSelectSelectedItem => {
                            originalSelectSelectedItem.removeAttribute("selected");
                        }));
                        const selectSelectedItems = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
                        selectSelectedItems.forEach((selectSelectedItems => {
                            originalSelect.querySelector(`option[value = "${selectSelectedItems.dataset.value}"]`).setAttribute("selected", "selected");
                        }));
                    } else {
                        if (!originalSelect.hasAttribute("data-show-selected")) setTimeout((() => {
                            if (selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`)) selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`).hidden = false;
                            optionItem.hidden = true;
                        }), this.config.speed);
                        originalSelect.value = optionItem.hasAttribute("data-value") ? optionItem.dataset.value : optionItem.textContent;
                        this.selectAction(selectItem);
                    }
                    this.setSelectTitleValue(selectItem, originalSelect);
                    this.setSelectChange(originalSelect);
                }
            }
            selectChange(e) {
                e.target;
            }
            setSelectChange(originalSelect) {
                if (originalSelect.hasAttribute("data-validate")) formValidate.validateInput(originalSelect);
                if (originalSelect.hasAttribute("data-submit") && originalSelect.value) {
                    let tempButton = document.createElement("button");
                    tempButton.type = "submit";
                    originalSelect.closest("form").append(tempButton);
                    tempButton.click();
                    tempButton.remove();
                }
                const selectItem = originalSelect.parentElement;
                this.selectCallback(selectItem, originalSelect);
            }
            selectDisabled(selectItem, originalSelect) {
                if (originalSelect.disabled) {
                    selectItem.classList.add(this.selectClasses.classSelectDisabled);
                    this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
                } else {
                    selectItem.classList.remove(this.selectClasses.classSelectDisabled);
                    this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
                }
            }
            searchActions(selectItem) {
                this.getSelectElement(selectItem).originalSelect;
                const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
                const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
                const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption} `);
                const _this = this;
                selectInput.addEventListener("input", (function() {
                    selectOptionsItems.forEach((selectOptionsItem => {
                        if (selectOptionsItem.textContent.toUpperCase().includes(selectInput.value.toUpperCase())) selectOptionsItem.hidden = false; else selectOptionsItem.hidden = true;
                    }));
                    selectOptions.hidden === true ? _this.selectAction(selectItem) : null;
                }));
            }
            selectCallback(selectItem, originalSelect) {
                document.dispatchEvent(new CustomEvent("selectCallback", {
                    detail: {
                        select: originalSelect
                    }
                }));
            }
            setLogging(message) {
                this.config.logging ? functions_FLS(`[select]: ${message} `) : null;
            }
        }
        modules_flsModules.select = new SelectConstructor({});
        let addWindowScrollEvent = false;
        setTimeout((() => {
            if (addWindowScrollEvent) {
                let windowScroll = new Event("windowScroll");
                window.addEventListener("scroll", (function(e) {
                    document.dispatchEvent(windowScroll);
                }));
            }
        }), 0);
        var src = __webpack_require__(6520);
        const gameField = document.getElementById("field");
        if (gameField) {
            let puzzleImage = new Image;
            puzzleImage.src = gameField.dataset.image;
            puzzleImage.onload = () => {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const imgRatio = puzzleImage.naturalWidth / puzzleImage.naturalHeight;
                let puzzleWidth = windowWidth * .93;
                let puzzleHeight = puzzleWidth / imgRatio;
                if (puzzleHeight > windowHeight * .93) {
                    puzzleHeight = windowHeight * .93;
                    puzzleWidth = puzzleHeight * imgRatio;
                }
                const piecesX = 4, piecesY = 6;
                const pieceSize = {
                    x: puzzleWidth / piecesX * .77,
                    y: puzzleHeight / piecesY * .77
                };
                const puzzle = new src.Canvas("field", {
                    width: windowWidth * .9,
                    height: windowHeight * .9,
                    pieceSize,
                    image: puzzleImage,
                    mergeInteractivity: true,
                    outline: new src.outline.Rounded,
                    painter: new src.painters.Konva,
                    preventOffstageDrag: true,
                    fixed: true
                });
                puzzle.puzzle.attachConnectionRequirement(((one, other) => one.correctlyConnectedWith(other)));
                puzzle.adjustImagesToPuzzleWidth();
                puzzle.autogenerate({
                    horizontalPiecesCount: piecesX,
                    verticalPiecesCount: piecesY
                });
                puzzle.shuffle(.8);
                puzzle.draw();
                puzzle.puzzle.forceConnectionWhileDragging();
                const timer = new PuzzleTimer;
                timer.start();
                puzzle.attachSolvedValidator();
                document.getElementById("solvePuzzle").addEventListener("click", (() => {
                    puzzle.puzzle.pieces.forEach((t => t.relocateTo(t.metadata.targetPosition.x, t.metadata.targetPosition.y)));
                    puzzle.puzzle.autoconnect();
                    puzzle.redraw();
                    onPuzzleValid(timer);
                }));
                puzzle.onValid((() => onPuzzleValid(timer)));
            };
        }
        function explode() {
            const duration = 3e3;
            const animationEnd = Date.now() + duration;
            const defaults = {
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0
            };
            const interval = setInterval((() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                        x: Math.random() * .2 + .1,
                        y: Math.random() - .2
                    }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: {
                        x: Math.random() * .2 + .7,
                        y: Math.random() - .2
                    }
                });
            }), 250);
        }
        function onPuzzleValid(timer) {
            const timeTaken = timer.stop();
            explode();
            setTimeout((() => {
                document.getElementById("field").hidden = true;
                document.getElementById("solvePuzzle").hidden = true;
                const resultEl = document.querySelector(".game__result");
                resultEl.hidden = false;
                resultEl.querySelector("[data-time]").innerText = `${Math.floor(timeTaken / 60)}:${String(Math.round(timeTaken % 60)).padStart(2, "0")}`;
            }), 3e3);
        }
        class PuzzleTimer {
            constructor() {
                this.startTime = performance.now();
            }
            start() {
                this.startTime = performance.now();
            }
            stop() {
                return (performance.now() - this.startTime) / 1e3;
            }
        }
        window["FLS"] = false;
    })();
})();