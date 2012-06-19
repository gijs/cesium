/*global define*/
define([
        './JulianDate',
        './DeveloperError'
    ], function(
        JulianDate,
        DeveloperError) {
    "use strict";

    /**
     * An interval defined by a start date and a stop date.  The end points are optionally included
     * in the interval.  The interval should be treated as immutable.
     *
     * @name TimeInterval
     * @constructor
     *
     * @param {JulianDate} start The start date of the interval.
     * @param {JulianDate} stop The stop date of the interval.
     * @param {Boolean} [isStartIncluded=true] <code>true</code> if the start date is included in the interval, <code>false</code> otherwise.
     * @param {Boolean} [isStopIncluded=true] <code>true</code> if the stop date is included in the interval, <code>false</code> otherwise.
     * @param {Object} [data The data associated with this interval.
     *
     * @exception {DeveloperError} start must be specified.
     * @exception {DeveloperError} stop must be specified.
     *
     * @see TimeInterval.fromIso8601
     * @see TimeIntervalCollection
     * @see JulianDate
     *
     * @example
     * // Construct an Timeinterval closed on one end with a Color payload.
     * var interval = new TimeInterval(JulianDate.fromTotalDays(1000), JulianDate.fromTotalDays(1001), true, false, Color.WHITE);
     */
    function TimeInterval(start, stop, isStartIncluded, isStopIncluded, data) {
        if (typeof start === 'undefined') {
            throw new DeveloperError('start must be specified.');
        }

        if (typeof stop === 'undefined') {
            throw new DeveloperError('stop must be specified.');
        }

        if (typeof isStartIncluded === 'undefined') {
            isStartIncluded = true;
        }

        if (typeof isStopIncluded === 'undefined') {
            isStopIncluded = true;
        }

        var stopComparedToStart = JulianDate.compare(stop, start);

        this.start = start;
        this.stop = stop;
        this.data = data;
        this.isStartIncluded = isStartIncluded;
        this.isStopIncluded = isStopIncluded;
        this.isEmpty = stopComparedToStart < 0 || (stopComparedToStart === 0 && (!isStartIncluded || !isStopIncluded));
    }

    /**
     * Creates an immutable TimeInterval from an ISO 8601 interval string.
     *
     * @memberof TimeInterval
     *
     * @param {String} iso8601String A valid ISO8601 interval.
     * @param {Boolean} [isStartIncluded=true] <code>true</code> if the start date is included in the interval, <code>false</code> otherwise.
     * @param {Boolean} [isStopIncluded=true] <code>true</code> if the stop date is included in the interval, <code>false</code> otherwise.
     * @param {Object} [data] The data associated with this interval.
     *
     * @return {TimeInterval} The new {@Link TimeInterval} instance or <code>undefined</code> if an invalid ISO8601 string is provided.
     *
     * @see TimeInterval
     * @see TimeIntervalCollection
     * @see JulianDate
     * @see <a href='http://en.wikipedia.org/wiki/ISO_8601'>ISO 8601 on Wikipedia</a>.
     *
     * @example
     * // Construct an open Timeinterval with a Cartesian data payload.
     * var interval = TimeInterval.fromIso8601('2012-03-15T11:02:24.55Z/2012-03-15T12:28:24.03Z', false, false, new Cartesian3(1,2,3));
     */
    TimeInterval.fromIso8601 = function(iso8601String, isStartIncluded, isStopIncluded, data) {
        var iso8601Interval = iso8601String.split('/');
        var intervalStart = JulianDate.fromIso8601(iso8601Interval[0]);
        var intervalStop = JulianDate.fromIso8601(iso8601Interval[1]);
        return new TimeInterval(intervalStart, intervalStop, isStartIncluded, isStopIncluded, data);
    };

    /**
     * Creates a copy of this TimeInterval.
     *
     * @returns A new TimeInterval that is equal to this interval.
     *
     * @memberof TimeInterval
     */
    TimeInterval.prototype.clone = function() {
        return new TimeInterval(this.start, this.stop, this.isStartIncluded, this.isStopIncluded, this.data);
    };

    /**
     * An empty interval.
     *
     * @memberof TimeInterval
     *
     */
    TimeInterval.EMPTY = Object.freeze(new TimeInterval(new JulianDate(0, 0), new JulianDate(0, 0), false, false));

    /**
     * Computes an interval which is the intersection of this interval with another while
     * also providing a means to merge the data of the two intervals.
     *
     * @param {TimeInterval} other The interval to intersect with this interval.
     * @param {Function} [mergeCallback] A callback which takes the data property from
     * both intervals as input and merges it into a single new value. If the callback is undefined,
     * this will intersect the two intervals and return the new interval with the data from this
     * interval.
     *
     * @return {TimeInterval} The new {@Link TimeInterval} that is the intersection of the two intervals,
     * with its data representing the merge of the data in the two existing intervals.
     */
    TimeInterval.prototype.intersect = function(other, mergeCallback) {
        if (typeof other === 'undefined') {
            return TimeInterval.EMPTY;
        }

        var otherStart = other.start;
        var otherStop = other.stop;
        var otherIsStartIncluded = other.isStartIncluded;
        var otherIsStopIncluded = other.isStopIncluded;

        var thisStart = this.start;
        var thisStop = this.stop;
        var thisIsStartIncluded = this.isStartIncluded;
        var thisIsStopIncluded = this.isStopIncluded;

        var outputData;
        var isStartIncluded;
        var isStopIncluded;

        if (otherStart.greaterThanOrEquals(thisStart) && thisStop.greaterThanOrEquals(otherStart)) {

            isStartIncluded = (!otherStart.equals(thisStart) && otherIsStartIncluded) || (thisIsStartIncluded && otherIsStartIncluded);

            isStopIncluded = thisIsStopIncluded && otherIsStopIncluded;

            outputData = typeof mergeCallback !== 'undefined' ? mergeCallback(this.data, other.data) : this.data;

            if (thisStop.greaterThanOrEquals(otherStop)) {
                isStopIncluded = isStopIncluded || (!otherStop.equals(thisStop) && otherIsStopIncluded);
                return new TimeInterval(otherStart, otherStop, isStartIncluded, isStopIncluded, outputData);
            }

            isStopIncluded = isStopIncluded || thisIsStopIncluded;
            return new TimeInterval(otherStart, thisStop, isStartIncluded, isStopIncluded, outputData);
        }

        if (otherStart.lessThanOrEquals(thisStart) && thisStart.lessThanOrEquals(otherStop)) {

            isStartIncluded = (otherStart.equals(thisStart) === false && thisIsStartIncluded) || (thisIsStartIncluded && otherIsStartIncluded);

            isStopIncluded = thisIsStopIncluded && otherIsStopIncluded;

            outputData = typeof mergeCallback !== 'undefined' ? mergeCallback(this.data, other.data) : this.data;
            if (thisStop.greaterThanOrEquals(otherStop)) {
                isStopIncluded = isStopIncluded || (otherStop.equals(thisStop) === false && otherIsStopIncluded);
                return new TimeInterval(thisStart, otherStop, isStartIncluded, isStopIncluded, outputData);
            }

            isStopIncluded = isStopIncluded || thisIsStopIncluded;
            return new TimeInterval(thisStart, thisStop, isStartIncluded, isStopIncluded, outputData);
        }

        return TimeInterval.EMPTY;
    };

    /**
     * Returns <code>true</code> if this interval contains the specified date.
     *
     * @memberof TimeInterval
     *
     * @param {JulianDate} date The date to check for.
     *
     * @return {Boolean} <code>true</code> if the TimeInterval contains the specified date, <code>false</code> otherwise.
     */
    TimeInterval.prototype.contains = function(date) {
        if (this.isEmpty) {
            return false;
        }

        var startComparedToDate = JulianDate.compare(this.start, date);
        // if (start == date)
        if (startComparedToDate === 0) {
            return this.isStartIncluded;
        }

        var dateComparedToStop = JulianDate.compare(date, this.stop);
        // if (date == stop)
        if (dateComparedToStop === 0) {
            return this.isStopIncluded;
        }

        // return start < date && date < stop
        return startComparedToDate < 0 && dateComparedToStop < 0;
    };

    /**
     * Returns true if this TimeInterval equals <code>other</code> componentwise.
     *
     * @memberof TimeInterval
     * @param {TimeInterval} other The TimeInterval to compare for equality.
     * @return {Boolean} <code>true</code> if the TimeIntervals are equal componentwise, <code>false</code> otherwise.
     */
    TimeInterval.prototype.equals = function(other) {
        return typeof other !== 'undefined' &&
               ((this.isEmpty && other.isEmpty) ||
                (this.isStartIncluded === other.isStartIncluded &&
                this.isStopIncluded === other.isStopIncluded &&
                this.start.equals(other.start) &&
                this.stop.equals(other.stop)));
    };

    /**
     * Returns <code>true</code> if this TimeInterval equals other componentwise
     * within the specified epsilon.
     *
     * @memberof TimeInterval
     *
     * @param {TimeInterval} other The TimeInterval to compare for equality.
     * @param {Number} [epsilon=0.0] The epsilon to use for equality testing.
     *
     * @return {Boolean} <code>true</code> if the TimeIntervals are equal within the specified epsilon, <code>false</code> otherwise.
     */
    TimeInterval.prototype.equalsEpsilon = function(other, epsilon) {
        return typeof other !== 'undefined' &&
               ((this.isEmpty && other.isEmpty) ||
                (this.isStartIncluded === other.isStartIncluded &&
                 this.isStopIncluded === other.isStopIncluded &&
                 this.start.equalsEpsilon(other.start, epsilon) &&
                 this.stop.equalsEpsilon(other.stop, epsilon)));
    };

    return TimeInterval;
});