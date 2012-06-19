/*global defineSuite*/
defineSuite([
         'Scene/BillboardCollection',
         '../Specs/createContext',
         '../Specs/destroyContext',
         '../Specs/sceneState',
         '../Specs/pick',
         'Core/Cartesian2',
         'Core/Cartesian3',
         'Core/Matrix4',
         'Core/Math',
         'Renderer/TextureMinificationFilter',
         'Renderer/TextureMagnificationFilter',
         'Scene/HorizontalOrigin',
         'Scene/VerticalOrigin'
     ], function(
         BillboardCollection,
         createContext,
         destroyContext,
         sceneState,
         pick,
         Cartesian2,
         Cartesian3,
         Matrix4,
         CesiumMath,
         TextureMinificationFilter,
         TextureMagnificationFilter,
         HorizontalOrigin,
         VerticalOrigin) {
    "use strict";
    /*global it,expect,beforeEach,afterEach,waitsFor*/

    var context;
    var billboards;
    var us;

    var greenImage;
    var blueImage;
    var whiteImage;

    function createTextureAtlas(images) {
        var atlas = context.createTextureAtlas(images);

        // ANGLE Workaround
        atlas.getTexture().setSampler(context.createSampler({
            minificationFilter : TextureMinificationFilter.NEAREST,
            magnificationFilter : TextureMagnificationFilter.NEAREST
        }));

        return atlas;
    }

    beforeEach(function() {
        context = createContext();
        billboards = new BillboardCollection();

        var camera = {
            eye : new Cartesian3(-1.0, 0.0, 0.0),
            target : Cartesian3.ZERO,
            up : Cartesian3.UNIT_Z
        };
        us = context.getUniformState();
        us.setView(Matrix4.createLookAt(camera.eye, camera.target, camera.up));
        us.setProjection(Matrix4.createPerspectiveFieldOfView(CesiumMath.toRadians(60.0), 1.0, 0.01, 10.0));
    });

    afterEach(function() {
        billboards = billboards && billboards.destroy();
        destroyContext(context);
    });

    it('initialize suite', function() {
        greenImage = new Image();
        greenImage.src = './Data/Images/Green.png';

        blueImage = new Image();
        blueImage.src = './Data/Images/Blue.png';

        whiteImage = new Image();
        whiteImage.src = './Data/Images/White.png';

        waitsFor(function() {
            return greenImage.complete && blueImage.complete && whiteImage.complete;
        }, 'Load .png file(s) for billboard collection test.', 3000);
    });

    it('default constructs a billboard', function() {
        var b = billboards.add();
        expect(b.getShow()).toEqual(true);
        expect(b.getPosition().equals(Cartesian3.ZERO)).toEqual(true);
        expect(b.getPixelOffset().equals(Cartesian2.ZERO)).toEqual(true);
        expect(b.getEyeOffset().equals(Cartesian3.ZERO)).toEqual(true);
        expect(b.getHorizontalOrigin()).toEqual(HorizontalOrigin.CENTER);
        expect(b.getVerticalOrigin()).toEqual(VerticalOrigin.CENTER);
        expect(b.getScale()).toEqual(1.0);
        expect(b.getImageIndex()).toEqual(0);
        expect(b.getColor().red).toEqual(1.0);
        expect(b.getColor().green).toEqual(1.0);
        expect(b.getColor().blue).toEqual(1.0);
        expect(b.getColor().alpha).toEqual(1.0);
    });

    it('explicitly constructs a billboard', function() {
        var b = billboards.add({
            show : false,
            position : new Cartesian3(1.0, 2.0, 3.0),
            pixelOffset : new Cartesian2(1.0, 2.0),
            eyeOffset : new Cartesian3(1.0, 2.0, 3.0),
            horizontalOrigin : HorizontalOrigin.LEFT,
            verticalOrigin : VerticalOrigin.BOTTOM,
            scale : 2.0,
            imageIndex : 1,
            color : {
                red : 1.0,
                green : 2.0,
                blue : 3.0,
                alpha : 4.0
            }
        });

        expect(b.getShow()).toEqual(false);
        expect(b.getPosition().equals(new Cartesian3(1.0, 2.0, 3.0))).toEqual(true);
        expect(b.getPixelOffset().equals(new Cartesian2(1.0, 2.0))).toEqual(true);
        expect(b.getEyeOffset().equals(new Cartesian3(1.0, 2.0, 3.0))).toEqual(true);
        expect(b.getHorizontalOrigin()).toEqual(HorizontalOrigin.LEFT);
        expect(b.getVerticalOrigin()).toEqual(VerticalOrigin.BOTTOM);
        expect(b.getScale()).toEqual(2.0);
        expect(b.getImageIndex()).toEqual(1);
        expect(b.getColor().red).toEqual(1.0);
        expect(b.getColor().green).toEqual(2.0);
        expect(b.getColor().blue).toEqual(3.0);
        expect(b.getColor().alpha).toEqual(4.0);
    });

    it('set billboard properties', function() {
        var b = billboards.add();
        b.setShow(false);
        b.setPosition(new Cartesian3(1.0, 2.0, 3.0));
        b.setPixelOffset(new Cartesian2(1.0, 2.0));
        b.setEyeOffset(new Cartesian3(1.0, 2.0, 3.0));
        b.setHorizontalOrigin(HorizontalOrigin.LEFT);
        b.setVerticalOrigin(VerticalOrigin.BOTTOM);
        b.setScale(2.0);
        b.setImageIndex(1);
        b.setColor({
            red : 1.0,
            green : 2.0,
            blue : 3.0,
            alpha : 4.0
        });

        expect(b.getShow()).toEqual(false);
        expect(b.getPosition().equals(new Cartesian3(1.0, 2.0, 3.0))).toEqual(true);
        expect(b.getPixelOffset().equals(new Cartesian2(1.0, 2.0))).toEqual(true);
        expect(b.getEyeOffset().equals(new Cartesian3(1.0, 2.0, 3.0))).toEqual(true);
        expect(b.getHorizontalOrigin()).toEqual(HorizontalOrigin.LEFT);
        expect(b.getVerticalOrigin()).toEqual(VerticalOrigin.BOTTOM);
        expect(b.getScale()).toEqual(2.0);
        expect(b.getImageIndex()).toEqual(1);
        expect(b.getColor().red).toEqual(1.0);
        expect(b.getColor().green).toEqual(2.0);
        expect(b.getColor().blue).toEqual(3.0);
        expect(b.getColor().alpha).toEqual(4.0);
    });

    it('set a removed billboard property', function() {
        var b = billboards.add();
        billboards.remove(b);
        b.setShow(false);
        expect(b.getShow()).toEqual(false);
    });

    it('has zero billboards when constructed', function() {
        expect(billboards.getLength()).toEqual(0);
    });

    it('adds a billboard', function() {
        var b = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });

        expect(billboards.getLength()).toEqual(1);
        expect(billboards.get(0).equals(b)).toEqual(true);
    });

    it('removes the first billboard', function() {
        var one = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        var two = billboards.add({
            position : {
                x : 4.0,
                y : 5.0,
                z : 6.0
            }
        });

        expect(billboards.getLength()).toEqual(2);

        expect(billboards.remove(one)).toEqual(true);

        expect(billboards.getLength()).toEqual(1);
        expect(billboards.get(0).equals(two)).toEqual(true);
    });

    it('removes the last billboard', function() {
        var one = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        var two = billboards.add({
            position : {
                x : 4.0,
                y : 5.0,
                z : 6.0
            }
        });

        expect(billboards.getLength()).toEqual(2);

        expect(billboards.remove(two)).toEqual(true);

        expect(billboards.getLength()).toEqual(1);
        expect(billboards.get(0).equals(one)).toEqual(true);
    });

    it('removes the same billboard twice', function() {
        var b = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        expect(billboards.getLength()).toEqual(1);

        expect(billboards.remove(b)).toEqual(true);
        expect(billboards.getLength()).toEqual(0);

        expect(billboards.remove(b)).toEqual(false);
        expect(billboards.getLength()).toEqual(0);
    });

    it('removes null', function() {
        billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        expect(billboards.getLength()).toEqual(1);

        expect(billboards.remove(null)).toEqual(false);
        expect(billboards.getLength()).toEqual(1);
    });

    it('adds and removes billboards', function() {
        var one = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        var two = billboards.add({
            position : {
                x : 4.0,
                y : 5.0,
                z : 6.0
            }
        });
        expect(billboards.getLength()).toEqual(2);
        expect(billboards.get(0).equals(one)).toEqual(true);
        expect(billboards.get(1).equals(two)).toEqual(true);

        expect(billboards.remove(two)).toEqual(true);
        var three = billboards.add({
            position : {
                x : 7.0,
                y : 8.0,
                z : 9.0
            }
        });
        expect(billboards.getLength()).toEqual(2);
        expect(billboards.get(0).equals(one)).toEqual(true);
        expect(billboards.get(1).equals(three)).toEqual(true);
    });

    it('removes all billboards', function() {
        billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        billboards.add({
            position : {
                x : 4.0,
                y : 5.0,
                z : 6.0
            }
        });
        expect(billboards.getLength()).toEqual(2);

        billboards.removeAll();
        expect(billboards.getLength()).toEqual(0);
    });

    it('contains a billboard', function() {
        var b = billboards.add();
        billboards.add(b);

        expect(billboards.contains(b)).toEqual(true);
    });

    it('does not contain a billboard', function() {
        var b0 = billboards.add();
        var b1 = billboards.add();

        billboards.add(b0);
        billboards.add(b1);
        billboards.remove(b0);

        expect(billboards.contains(b0)).toEqual(false);
    });

    it('does not contain undefined', function() {
        expect(billboards.contains()).toBeFalsy();
    });

    it('sets and gets a texture atlas', function() {
        expect(billboards.getTextureAtlas()).not.toBeDefined();

        var atlas = createTextureAtlas([greenImage]);
        billboards.setTextureAtlas(atlas);
        expect(billboards.getTextureAtlas()).toEqual(atlas);
    });

    it('destroys a texture atlas', function() {
        var b = new BillboardCollection();
        expect(b.getDestroyTextureAtlas()).toEqual(true);

        var atlas = createTextureAtlas([greenImage]);
        b.setTextureAtlas(atlas);
        b = b.destroy();

        expect(atlas.isDestroyed()).toEqual(true);
    });

    it('does not destroy a texture atlas', function() {
        var b = new BillboardCollection();
        b.setDestroyTextureAtlas(false);

        var atlas = createTextureAtlas([greenImage]);
        b.setTextureAtlas(atlas);
        b = b.destroy();

        expect(atlas.isDestroyed()).toEqual(false);
    });

    it('does not render when constructed', function() {
        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);
    });

    it('modifies and removes a billboard, then renders', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage, blueImage]));
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });
        billboards.add({
            position : {
                x : 1.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 1
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        b.setScale(2.0);
        billboards.remove(b);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('renders a green billboard', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('adds and renders a billboard', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage, blueImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        billboards.add({
            position : {
                x : -0.5,
                y : 0.0,
                z : 0.0
            }, // Closer to viewer
            imageIndex : 1
        });

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('removes and renders a billboard', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage, blueImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });
        var blueBillboard = billboards.add({
            position : {
                x : -0.5,
                y : 0.0,
                z : 0.0
            }, // Closer to viewer
            imageIndex : 1
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.remove(blueBillboard);
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('removes all billboards and renders', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.removeAll();
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);
    });

    it('removes all billboards, adds a billboard, and renders', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage, blueImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.removeAll();
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 1
        });

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('renders with a different texture atlas', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.setTextureAtlas(createTextureAtlas([blueImage]));
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('renders with a different buffer usage', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage]));
        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('renders using billboard show property', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage, blueImage]));
        var greenBillboard = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });
        var blueBillboard = billboards.add({
            show : false,
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 1
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        greenBillboard.setShow(false);
        blueBillboard.setShow(true);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('renders using billboard position property', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage]));
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setPosition({
            x : -2.0,
            y : 0.0,
            z : 0.0
        }); // Behind viewer
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setPosition({
            x : 0.0,
            y : 0.0,
            z : 0.0
        }); // Back in front of viewer
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('renders using billboard scale property', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage]));
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setScale(0.0);
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setScale(2.0);
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('renders using billboard imageIndex property', function() {
        billboards.setTextureAtlas(createTextureAtlas([greenImage, blueImage]));
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setImageIndex(1);
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('renders using billboard color property', function() {
        billboards.setTextureAtlas(createTextureAtlas([whiteImage]));
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([255, 255, 255, 255]);

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setColor({
            red : 1.0,
            green : 0.0,
            blue : 1.0,
            alpha : 1.0
        });
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([255, 0, 255, 255]);

        // Update a second time since it goes through a different vertex array update path
        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        b.setColor({
            red : 0.0,
            green : 1.0,
            blue : 0.0,
            alpha : 1.0
        });
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('updates 10% of billboards', function() {
        billboards.setTextureAtlas(createTextureAtlas([whiteImage]));
        for ( var i = 0; i < 10; ++i) {
            billboards.add({
                position : {
                    x : 0.0,
                    y : 0.0,
                    z : 0.0
                },
                imageIndex : 0,
                show : (i === 3)
            });
        }

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        // First render - default billboard color is white.
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([255, 255, 255, 255]);

        billboards.get(3).setColor({
            red : 0.0,
            green : 1.0,
            blue : 0.0,
            alpha : 1.0
        });

        // Second render - billboard is green
        context.clear();
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        billboards.get(3).setColor({
            red : 1.0,
            green : 0.0,
            blue : 0.0,
            alpha : 1.0
        });

        // Third render - update goes through a different vertex array update path
        context.clear();
        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([255, 0, 0, 255]);
    });

    it('renders more than 16K billboards', function() {
        billboards.setTextureAtlas(createTextureAtlas([whiteImage]));
        for ( var i = 0; i < 16 * 1024; ++i) {
            billboards.add({
                position : {
                    x : 0.0,
                    y : 0.0,
                    z : 0.0
                },
                imageIndex : 0,
                color : {
                    alpha : 0.0
                }
            });
        }

        billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        context.clear();
        expect(context.readPixels()).toEqualArray([0, 0, 0, 0]);

        billboards.update(context, sceneState);
        billboards.render(context, us);
        expect(context.readPixels()).toEqualArray([255, 255, 255, 255]);
    });

    it('is picked', function() {
        billboards.setTextureAtlas(createTextureAtlas([whiteImage]));
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        billboards.update(context, sceneState);

        var pickedObject = pick(context, billboards, 0, 0);
        expect(pickedObject).toEqual(b);
    });

    it('is not picked', function() {
        billboards.setTextureAtlas(createTextureAtlas([whiteImage]));
        billboards.add({
            show : false,
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            imageIndex : 0
        });

        billboards.update(context, sceneState);

        var pickedObject = pick(context, billboards, 0, 0);
        expect(pickedObject).not.toBeDefined();
    });

    it('computes screen space position (1)', function() {
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            }
        });

        expect(b.computeScreenSpacePosition(us).equals(new Cartesian2(0.5, 0.5)));
    });

    it('computes screen space position (2)', function() {
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            pixelOffset : {
                x : 1.0,
                y : 2.0
            }
        });

        expect(b.computeScreenSpacePosition(us).equals(new Cartesian2(1.5, 2.5)));
    });

    it('computes screen space position (3)', function() {
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            },
            eyeOffset : {
                x : 5.0,
                y : 5.0,
                z : 0.0
            }
        });

        var p = b.computeScreenSpacePosition(us);
        expect(p.x).toBeGreaterThan(0.5);
        expect(p.y).toBeGreaterThan(0.5);
    });

    it('throws when computing screen space position when not in a collection', function() {
        var b = billboards.add({
            position : {
                x : 0.0,
                y : 0.0,
                z : 0.0
            }
        });
        billboards.remove(b);

        expect(function() {
            b.computeScreenSpacePosition(us);
        }).toThrow();
    });

    it('throws when computing screen space position without uniform state', function() {
        var b = billboards.add();

        expect(function() {
            b.computeScreenSpacePosition();
        }).toThrow();
    });

    it('equals another billboard', function() {
        var b = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            },
            color : {
                red : 1.0,
                green : 0.0,
                blue : 0.0,
                alpha : 1.0
            }
        });
        var b2 = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            },
            color : {
                red : 1.0,
                green : 0.0,
                blue : 0.0,
                alpha : 1.0
            }
        });

        expect(b.equals(b2)).toEqual(true);
    });

    it('does not equal another billboard', function() {
        var b = billboards.add({
            position : {
                x : 1.0,
                y : 2.0,
                z : 3.0
            }
        });
        var b2 = billboards.add({
            position : {
                x : 4.0,
                y : 5.0,
                z : 6.0
            }
        });

        expect(b.equals(b2)).toEqual(false);
    });

    it('does not equal null', function() {
        var b = billboards.add({});
        expect(b.equals(null)).toBeFalsy();
    });

    it('throws when accessing without an index', function() {
        expect(function() {
            billboards.get();
        }).toThrow();
    });
});