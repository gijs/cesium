/*global defineSuite*/
defineSuite([
         '../Specs/createContext',
         '../Specs/destroyContext',
         'Core/Cartesian3',
         'Core/PrimitiveType',
         'Renderer/BufferUsage',
         'Renderer/PixelDatatype',
         'Renderer/PixelFormat',
         'Renderer/TextureWrap',
         'Renderer/TextureMinificationFilter',
         'Renderer/TextureMagnificationFilter'
     ], 'Renderer/CubeMap', function(
         createContext,
         destroyContext,
         Cartesian3,
         PrimitiveType,
         BufferUsage,
         PixelDatatype,
         PixelFormat,
         TextureWrap,
         TextureMinificationFilter,
         TextureMagnificationFilter) {
    "use strict";
    /*global xit,it,expect,beforeEach,afterEach,waitsFor*/

    var context;
    var sp;
    var va;
    var cubeMap;

    var greenImage;
    var blueImage;
    var blueAlphaImage;
    var blueOverRedImage;

    beforeEach(function() {
        context = createContext();
    });

    afterEach(function() {
        if (sp) {
            sp = sp.destroy();
        }

        if (va) {
            va = va.destroy();
        }

        if (cubeMap) {
            cubeMap = cubeMap.destroy();
        }

        destroyContext(context);
    });

    it('initializem suite', function() {
        greenImage = new Image();
        greenImage.src = './Data/Images/Green.png';

        blueImage = new Image();
        blueImage.src = './Data/Images/Blue.png';

        blueAlphaImage = new Image();
        blueAlphaImage.src = './Data/Images/BlueAlpha.png';

        blueOverRedImage = new Image();
        blueOverRedImage.src = './Data/Images/BlueOverRed.png';

        waitsFor(function() {
            return greenImage.complete && blueImage.complete && blueAlphaImage.complete && blueOverRedImage.complete;
        }, 'Load .png file(s) for texture test.', 3000);
    });

    it('creates with defaults', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });

        expect(cubeMap.getPixelFormat()).toEqual(PixelFormat.RGBA);
        expect(cubeMap.getPixelDatatype()).toEqual(PixelDatatype.UNSIGNED_BYTE);
    });

    // TODO:  creates from the framebuffer
    // TODO:  copies from the framebuffer

    it('gets the default sampler', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });

        var sampler = cubeMap.getSampler();
        expect(sampler.wrapS).toEqual(TextureWrap.CLAMP);
        expect(sampler.wrapT).toEqual(TextureWrap.CLAMP);
        expect(sampler.minificationFilter).toEqual(TextureMinificationFilter.LINEAR);
        expect(sampler.magnificationFilter).toEqual(TextureMagnificationFilter.LINEAR);
    });

    it('sets a sampler', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });

        var sampler = context.createSampler({
            wrapS : TextureWrap.REPEAT,
            wrapT : TextureWrap.MIRRORED_REPEAT,
            minificationFilter : TextureMinificationFilter.NEAREST,
            magnificationFilter : TextureMagnificationFilter.NEAREST
        });
        cubeMap.setSampler(sampler);

        var s = cubeMap.getSampler();
        expect(s.wrapS).toEqual(sampler.wrapS);
        expect(s.wrapT).toEqual(sampler.wrapT);
        expect(s.minificationFilter).toEqual(sampler.minificationFilter);
        expect(s.magnificationFilter).toEqual(sampler.magnificationFilter);
    });

    it('gets width and height', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });

        expect(cubeMap.getWidth()).toEqual(16);
        expect(cubeMap.getHeight()).toEqual(16);
    });

    it('draws with a cube map', function() {
        cubeMap = context.createCubeMap({
            source : {
                positiveX : blueImage,
                negativeX : greenImage,
                positiveY : blueImage,
                negativeY : greenImage,
                positiveZ : blueImage,
                negativeZ : greenImage
            }
        });

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_texture;' +
            'uniform mediump vec3 u_direction;' +
            'void main() { gl_FragColor = textureCube(u_texture, u_direction); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_texture.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        var da = {
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        };

        // +X is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        // -X is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(-1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        // +Y is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        // -Y is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, -1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        // +Z is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, 1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        // -Z is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, -1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('draws with a cube map with premultiplied alpha', function() {
        cubeMap = context.createCubeMap({
            source : {
                positiveX : blueAlphaImage,
                negativeX : blueAlphaImage,
                positiveY : blueAlphaImage,
                negativeY : blueAlphaImage,
                positiveZ : blueAlphaImage,
                negativeZ : blueAlphaImage
            },
            preMultiplyAlpha : true
        });
        expect(cubeMap.getPreMultiplyAlpha()).toEqual(true);

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_texture;' +
            'uniform mediump vec3 u_direction;' +
            'void main() { gl_FragColor = textureCube(u_texture, u_direction); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_texture.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        var da = {
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        };

        // +X is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 127, 127]);

        // -X is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(-1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 127, 127]);

        // +Y is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 127, 127]);

        // -Y is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, -1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 127, 127]);

        // +Z is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, 1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 127, 127]);

        // -Z is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, -1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 127, 127]);
    });

    it('creates a cube map with typed arrays', function() {
        cubeMap = context.createCubeMap({
            source : {
                positiveX : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([0, 0, 0, 255])
                },
                negativeX : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([0, 0, 255, 0])
                },
                positiveY : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([0, 255, 0, 0])
                },
                negativeY : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([255, 0, 0, 0])
                },
                positiveZ : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([0, 0, 255, 255])
                },
                negativeZ : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([255, 255, 0, 0])
                }
            }
        });

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_texture;' +
            'uniform mediump vec3 u_direction;' +
            'void main() { gl_FragColor = textureCube(u_texture, u_direction); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_texture.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        var da = {
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        };

        sp.getAllUniforms().u_direction.value = new Cartesian3(1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 0, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(-1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, -1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([255, 0, 0, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, 1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, -1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([255, 255, 0, 0]);
    });

    it('creates a cube map with typed arrays and images', function() {
        cubeMap = context.createCubeMap({
            source : {
                positiveX : blueImage,
                negativeX : greenImage,
                positiveY : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([0, 255, 0, 0])
                },
                negativeY : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([255, 0, 0, 0])
                },
                positiveZ : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([0, 0, 255, 255])
                },
                negativeZ : {
                    width : 1,
                    height : 1,
                    arrayBufferView : new Uint8Array([255, 255, 0, 0])
                }
            }
        });

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_texture;' +
            'uniform mediump vec3 u_direction;' +
            'void main() { gl_FragColor = textureCube(u_texture, u_direction); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_texture.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        var da = {
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        };

        sp.getAllUniforms().u_direction.value = new Cartesian3(1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(-1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, -1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([255, 0, 0, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, 1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, -1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([255, 255, 0, 0]);
    });

    it('copies to a cube map', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });
        cubeMap.getPositiveX().copyFrom(blueImage);
        cubeMap.getNegativeX().copyFrom(greenImage);
        cubeMap.getPositiveY().copyFrom(blueImage);
        cubeMap.getNegativeY().copyFrom(greenImage);
        cubeMap.getPositiveZ().copyFrom(blueImage);
        cubeMap.getNegativeZ().copyFrom(greenImage);

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_cubeMap;' +
            'uniform mediump vec3 u_direction;' +
            'void main() { gl_FragColor = textureCube(u_cubeMap, u_direction); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_cubeMap.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        var da = {
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        };

        // +X is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        // -X is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(-1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        // +Y is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        // -Y is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, -1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);

        // +Z is blue
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, 1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        // -Z is green
        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, -1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 255]);
    });

    it('copies from a typed array', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });
        cubeMap.getPositiveX().copyFrom({
            width : 1,
            height : 1,
            arrayBufferView : new Uint8Array([0, 0, 0, 255])
        });
        cubeMap.getNegativeX().copyFrom({
            width : 1,
            height : 1,
            arrayBufferView : new Uint8Array([0, 0, 255, 0])
        });
        cubeMap.getPositiveY().copyFrom({
            width : 1,
            height : 1,
            arrayBufferView : new Uint8Array([0, 255, 0, 0])
        });
        cubeMap.getNegativeY().copyFrom({
            width : 1,
            height : 1,
            arrayBufferView : new Uint8Array([255, 0, 0, 0])
        });
        cubeMap.getPositiveZ().copyFrom({
            width : 1,
            height : 1,
            arrayBufferView : new Uint8Array([0, 0, 255, 255])
        });
        cubeMap.getNegativeZ().copyFrom({
            width : 1,
            height : 1,
            arrayBufferView : new Uint8Array([255, 255, 0, 0])
        });

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_cubeMap;' +
            'uniform mediump vec3 u_direction;' +
            'void main() { gl_FragColor = textureCube(u_cubeMap, u_direction); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_cubeMap.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        var da = {
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        };

        sp.getAllUniforms().u_direction.value = new Cartesian3(1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 0, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(-1, 0, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 255, 0, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, -1, 0);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([255, 0, 0, 0]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, 1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);

        sp.getAllUniforms().u_direction.value = new Cartesian3(0, 0, -1);
        context.draw(da);
        expect(context.readPixels()).toEqualArray([255, 255, 0, 0]);
    });

    it('draws with a cube map and a texture', function() {
        cubeMap = context.createCubeMap({
            source : {
                positiveX : greenImage,
                negativeX : greenImage,
                positiveY : greenImage,
                negativeY : greenImage,
                positiveZ : greenImage,
                negativeZ : greenImage
            }
        });

        var texture = context.createTexture2D({
            source : blueImage
        });

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_cubeMap;' +
            'uniform sampler2D u_texture;' +
            'void main() { gl_FragColor = textureCube(u_cubeMap, vec3(1.0, 0.0, 0.0)) + texture2D(u_texture, vec2(0.0)); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_cubeMap.value = cubeMap;
        sp.getAllUniforms().u_texture.value = texture;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        context.draw({
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        });
        expect(context.readPixels()).toEqualArray([0, 255, 255, 255]);

        texture = texture.destroy();
    });

    // Fails on firefox.  Should be fixed soon: https://bugzilla.mozilla.org/show_bug.cgi?id=685156
    xit('generates mipmaps', function() {
        cubeMap = context.createCubeMap({
            source : {
                positiveX : blueImage,
                negativeX : greenImage,
                positiveY : blueImage,
                negativeY : greenImage,
                positiveZ : blueImage,
                negativeZ : greenImage
            }
        });

        cubeMap.generateMipmap();
        cubeMap.setSampler(context.createSampler({
            minificationFilter : TextureMinificationFilter.NEAREST_MIPMAP_LINEAR
        }));

        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';
        var fs =
            'uniform samplerCube u_cubeMap;' +
            'void main() { gl_FragColor = textureCube(u_cubeMap, vec3(1.0, 0.0, 0.0)); }';
        sp = context.createShaderProgram(vs, fs, {
            position : 0
        });
        sp.getAllUniforms().u_cubeMap.value = cubeMap;

        va = context.createVertexArray();
        va.addAttribute({
            vertexBuffer : context.createVertexBuffer(new Float32Array([0, 0, 0, 1]), BufferUsage.STATIC_DRAW),
            componentsPerAttribute : 4
        });

        context.draw({
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va
        });
        expect(context.readPixels()).toEqualArray([0, 0, 255, 255]);
    });

    it('destroys', function() {
        var c = context.createCubeMap({
            width : 16,
            height : 16
        });

        expect(c.isDestroyed()).toEqual(false);
        c.destroy();
        expect(c.isDestroyed()).toEqual(true);
    });

    it('fails to create (description)', function() {
        expect(function() {
            cubeMap = context.createCubeMap();
        }).toThrow();
    });

    it('fails to create (source)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({});
        }).toThrow();
    });

    it('fails to create (width, no height)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                width : 16
            });
        }).toThrow();
    });

    it('fails to create (width != height)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                width : 16,
                height : 32
            });
        }).toThrow();
    });

    it('fails to create (small width)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                width : 0,
                height : 0
            });
        }).toThrow();
    });

    it('fails to create (large width)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                width : context.getMaximumCubeMapSize() + 1,
                height : context.getMaximumCubeMapSize() + 1
            });
        }).toThrow();
    });

    it('fails to create (PixelFormat)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                width : 16,
                height : 16,
                pixelFormat : 'invalid PixelFormat'
            });
        }).toThrow();
    });

    it('fails to create (pixelDatatype)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                width : 16,
                height : 16,
                pixelFormat : PixelFormat.RGBA,
                pixelDatatype : 'invalid pixelDatatype'
            });
        }).toThrow();
    });

    it('fails to create (source)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                source : {}
            });
        }).toThrow();
    });

    it('fails to create (source width and height)', function() {
        expect(function() {
            cubeMap = context.createCubeMap({
                source : {
                    positiveX : greenImage, // 1x1
                    negativeX : greenImage, // 1x1
                    positiveY : greenImage, // 1x1
                    negativeY : greenImage, // 1x1
                    positiveZ : greenImage, // 1x1
                    negativeZ : blueOverRedImage // 1x2
                }
            });
        }).toThrow();
    });

    it('fails to copy from an image (source)', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });

        expect(function() {
            cubeMap.getPositiveX().copyFrom();
        }).toThrow();
    });

    it('fails to copy from an image (xOffset)', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });
        var image = new Image();

        expect(function() {
            cubeMap.getPositiveY().copyFrom(image, -1);
        }).toThrow();
    });

    it('fails to copy from an image (yOffset)', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });
        var image = new Image();

        expect(function() {
            cubeMap.getPositiveZ().copyFrom(image, 0, -1);
        }).toThrow();
    });

    it('fails to copy from an image (width)', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });
        var image = new Image();
        image.width = 16 + 1;

        expect(function() {
            cubeMap.getNegativeX().copyFrom(image);
        }).toThrow();
    });

    it('fails to copy from an image (height)', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });
        var image = new Image();
        image.height = 16 + 1;

        expect(function() {
            cubeMap.getNegativeY().copyFrom(image);
        }).toThrow();
    });

    it('fails to copy from the frame buffer (xOffset)', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });

        expect(function() {
            cubeMap.getPositiveX().copyFromFramebuffer(-1);
        }).toThrow();
    });

    it('fails to copy from the frame buffer (yOffset)', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });

        expect(function() {
            cubeMap.getPositiveY().copyFromFramebuffer(0, -1);
        }).toThrow();
    });

    it('fails to copy from the frame buffer (framebufferXOffset)', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });

        expect(function() {
            cubeMap.getPositiveZ().copyFromFramebuffer(0, 0, -1);
        }).toThrow();
    });

    it('fails to copy from the frame buffer (framebufferYOffset)', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });

        expect(function() {
            cubeMap.getNegativeX().copyFromFramebuffer(0, 0, 0, -1);
        }).toThrow();
    });

    it('fails to copy from the frame buffer (width)', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });

        expect(function() {
            cubeMap.getNegativeY().copyFromFramebuffer(0, 0, 0, 0, cubeMap.getWidth() + 1);
        }).toThrow();
    });

    it('fails to copy from the frame buffer (height)', function() {
        cubeMap = context.createCubeMap({
            width : 1,
            height : 1
        });

        expect(function() {
            cubeMap.getNegativeZ().copyFromFramebuffer(0, 0, 0, 0, 0, cubeMap.getHeight() + 1);
        }).toThrow();
    });

    it('fails to generate mipmaps (width)', function() {
        cubeMap = context.createCubeMap({
            width : 3,
            height : 3
        });

        expect(function() {
            cubeMap.generateMipmap();
        }).toThrow();
    });

    it('fails to generate mipmaps (hint)', function() {
        cubeMap = context.createCubeMap({
            width : 16,
            height : 16
        });

        expect(function() {
            cubeMap.generateMipmap('invalid hint');
        }).toThrow();
    });

    it('fails to destroy', function() {
        var c = context.createCubeMap({
            width : 16,
            height : 16
        });
        c.destroy();

        expect(function() {
            c.destroy();
        }).toThrow();
    });
});
