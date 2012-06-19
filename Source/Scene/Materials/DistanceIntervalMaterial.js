/*global define*/
define([
        '../../Shaders/Materials/DistanceIntervalMaterial',
        '../../Scene/Materials/materialBuilder'
    ], function(
        ShadersDistanceIntervalMaterial,
        materialBuilder) {
    "use strict";

    /**
     * DOC_TBA
     *
     * @name DistanceIntervalMaterial
     * @constructor
     */
    function DistanceIntervalMaterial(template) {
        var t = template || {};

        /**
         * DOC_TBA
         */
        this.intervals = t.intervals || [];

        // TODO: Expose get/set - can change distance/color, but not number of intervals
        var distances = [];
        var colors = [];

        for ( var i = 0; i < this.intervals.length; ++i) {
            distances.push(this.intervals[i].distance);
            colors.push(this.intervals[i].color);
        }

        this._uniforms = {
            u_distances : function() {
                return distances;
            },
            u_colors : function() {
                return colors;
            }
        };
    }

    DistanceIntervalMaterial.prototype._getShaderSource = function() {
        return "#define NUMBER_OF_DISTANCES " + this.intervals.length.toString() + "\n" +
               materialBuilder.constructMaterial(ShadersDistanceIntervalMaterial);
    };

    return DistanceIntervalMaterial;
});