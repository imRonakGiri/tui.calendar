var AlldayMoveGuide = require('handler/allday/moveGuide');

describe('handler:AlldayMoveGuide', function() {
    describe('_getEventBlockDataFunc()', function() {
        var mockInst,
            mockEventData;

        beforeEach(function() {
            mockInst = {
                alldayMove: {
                    alldayView: {
                        options: {
                            renderStartDate: '2015-05-01',
                            renderEndDate: '2015-05-05'
                        }
                    }
                }
            };
        });

        it('return function that can calculate event block rendering information.', function() {
            mockEventData = {
                model: {
                    starts: new Date('2015-05-01T00:00:00+09:00'),
                    ends: new Date('2015-05-03T23:59:59+09:00')
                },
                datesInRange: 5
            };

            var func = AlldayMoveGuide.prototype._getEventBlockDataFunc.call(mockInst, mockEventData);

            expect(func(0)).toEqual({
                baseWidthPercent: 20,
                fromLeft: 0,
                fromRight: -2
            });

            // 마우스가 오른쪽 그리드로 한칸 이동
            expect(func(1)).toEqual({
                baseWidthPercent: 20,
                fromLeft: 1,
                fromRight: -1
            });
        });
    });

    describe('event handler', function() {
        var inst;

        beforeEach(function() {
            inst = new AlldayMoveGuide(jasmine.createSpyObj('alldayMove', ['on']));
            inst.alldayMove = {
                alldayView: {
                    options: {
                        renderStartDate: '2015-05-01',
                        renderEndDate: '2015-05-05'
                    }
                }
            };
            spyOn(inst, 'refreshGuideElement');
        });

        describe('_onDrag()', function() {
            it('can calculate guide element new width and left.', function() {
                // 2일짜리 일정을
                inst.getEventDataFunc = inst._getEventBlockDataFunc({
                    model: {
                        starts: new Date('2015-05-01T00:00:00+09:00'),
                        ends: new Date('2015-05-02T23:59:59+09:00')
                    },
                    datesInRange: 5
                });

                // 오른쪽으로 한칸 이동 시
                inst._dragStartXIndex = 0;
                inst._onDrag({
                    xIndex: 1,
                    datesInRange: 5
                });

                expect(inst.refreshGuideElement).toHaveBeenCalledWith(20, 40, false, false);

                inst.refreshGuideElement.calls.reset();
                // 4일짜리 일정을
                inst.getEventDataFunc = inst._getEventBlockDataFunc({
                    model: {
                        starts: new Date('2015-05-02T00:00:00+09:00'),
                        ends: new Date('2015-05-05T23:59:59+09:00')
                    },
                    datesInRange: 5
                });

                // 오른쪽으로 한 칸 이동
                inst._dragStartXIndex = 3;
                inst._onDrag({
                    xIndex: 4,
                    datesInRange: 5
                });

                // left: 40, width: 80 이지만 오른쪽으로 렌더링 범위를 초과했으므로 width는 60%
                expect(inst.refreshGuideElement).toHaveBeenCalledWith(40, 60, false, true);
            });
        });
    });
});
