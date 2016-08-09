/*eslint-disable*/
var domutil = require('common/domutil');
var datetime = require('common/datetime');
var TimeResize = require('handler/time/resize');

describe('TimeResize', function() {
    var mockInstance;

    it('checkExpectCondition()', function() {
        var target = document.createElement('div');
        var parent = document.createElement('div');
        expect(TimeResize.prototype.checkExpectCondition(target)).toBe(false);

        domutil.addClass(target, '/* @echo CSS_PREFIX */time-resize-handle');
        expect(TimeResize.prototype.checkExpectCondition(target)).toBe(false);

        domutil.addClass(parent, '/* @echo CSS_PREFIX */time-date');
        domutil.addClass(parent, 'tui-view-20');

        parent.appendChild(target);

        mockInstance = {
            timeGridView: {
                children: {
                    items: {
                        '20': 'hello'
                    }
                }
            }
        };

        expect(TimeResize.prototype.checkExpectCondition.call(mockInstance, target)).toBe('hello');

        domutil.removeClass(parent, 'tui-view-20');
        expect(TimeResize.prototype.checkExpectCondition.call(mockInstance, target)).toBe(false);
    });

    describe('_updateEvent()', function() {
        var baseControllerMock;

        beforeEach(function() {
            baseControllerMock = jasmine.createSpyObj('Base', ['updateEvent']);
            baseControllerMock.events = {
                items: {
                    '20': {
                        getStarts: function() {
                            return new Date('2015-05-01T09:30:00+09:00');
                        },
                        getEnds: function() {
                            return new Date('2015-05-01T10:30:00+09:00');
                        },
                        starts: new Date('2015-05-01T09:30:00+09:00'),
                        ends: new Date('2015-05-01T10:30:00+09:00'),
                        duration: function() {
                            return new Date(new Date('2015-05-01T10:30:00+09:00') - new Date('2015-05-01T09:30:00+09:00'));
                        }
                    }
                }
            }

            mockInstance = {
                baseController: baseControllerMock,
                fire: jasmine.createSpy('fire')
            };
        });

        it('update event model by event data.', function() {
            var oneHour = datetime.millisecondsFrom('hour', 1);
            var eventData = {
                targetModelID: 20,
                nearestRange: [0, oneHour],
                relatedView: {
                    getDate: function() {
                        return new Date('2015-05-01T00:00:00+09:00');
                    }
                }
            };

            TimeResize.prototype._updateEvent.call(mockInstance, eventData);

            expect(mockInstance.fire).toHaveBeenCalledWith('beforeUpdateEvent', {
                model: baseControllerMock.events.items[20],
                starts: new Date('2015-05-01T09:30:00+09:00'),
                ends: new Date('2015-05-01T11:00:00+09:00')
            });
        });

        it('can\'t update event duration less than 30 minutes.', function() {
            var oneHour = datetime.millisecondsFrom('hour', 1);
            var eventData = {
                targetModelID: 20,
                // backward resize!
                nearestRange: [oneHour, 0],
                relatedView: {
                    getDate: function() {
                        return new Date('2015-05-01T00:00:00+09:00');
                    }
                }
            };

            TimeResize.prototype._updateEvent.call(mockInstance, eventData);

            expect(mockInstance.fire).toHaveBeenCalledWith('beforeUpdateEvent', {
                model: baseControllerMock.events.items[20],
                starts: new Date('2015-05-01T09:30:00+09:00'),
                ends: new Date('2015-05-01T10:00:00+09:00')
            });
        });

        it('can\' update ends exceed 23:59:59:999', function() {
            var twoDay = datetime.millisecondsFrom('hour', 48);
            var eventData = {
                targetModelID: 20,
                nearestRange: [0, twoDay],
                relatedView: {
                    getDate: function() {
                        return new Date('2015-05-01T00:00:00+09:00');
                    }
                }
            };

            TimeResize.prototype._updateEvent.call(mockInstance, eventData);

            expect(mockInstance.fire).toHaveBeenCalledWith('beforeUpdateEvent', {
                model: baseControllerMock.events.items[20],
                starts: new Date('2015-05-01T09:30:00+09:00'),
                ends: new Date('2015-05-01T23:59:59+09:00')
            });
        });

    });
});
