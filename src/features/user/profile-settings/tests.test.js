import { validateUpdateAvailabilityMiddleware } from './middlewares';

describe.only('validateUpdateAvailabilityMiddleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  // Test Scenario 1: Valid data with fixed lunch
  test('should pass validation for valid data with fixed lunch', () => {
    mockRequest = {
      body: {
        data: {
          availability: {
            fixedLunch: true,
            fixedLunchStarttime: '12:00',
            fixedLunchEndtime: '13:00',
            week: [
              {
                day: 'Monday',
                starttime: '09:00',
                endtime: '17:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              },
              {
                day: 'Tuesday',
                starttime: '09:00',
                endtime: '17:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              }
            ]
          }
        }
      }
    };

    validateUpdateAvailabilityMiddleware(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  // Test Scenario 2: Valid data with closed days
  test('should pass validation for closed days with no times', () => {
    mockRequest = {
      body: {
        data: {
          availability: {
            fixedLunch: false,
            fixedLunchStarttime: '',
            fixedLunchEndtime: '',
            week: [
              {
                day: 'Monday',
                starttime: '',
                endtime: '',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: false
              }
            ]
          }
        }
      }
    };

    validateUpdateAvailabilityMiddleware(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  // Test Scenario 3: Invalid - times set for closed day
  test('should fail validation when times are set for closed day', () => {
    mockRequest = {
      body: {
        data: {
          availability: {
            fixedLunch: false,
            fixedLunchStarttime: '',
            fixedLunchEndtime: '',
            week: [
              {
                day: 'Monday',
                starttime: '09:00', // Invalid: time set but day is closed
                endtime: '17:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: false
              }
            ]
          }
        }
      }
    };

    validateUpdateAvailabilityMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Start and end times must be empty if the day is not open'
          })
        ])
      })
    );
  });

  // Test Scenario 4: Invalid - start time after end time
  test('should fail validation when start time is after end time', () => {
    mockRequest = {
      body: {
        data: {
          availability: {
            fixedLunch: false,
            fixedLunchStarttime: '',
            fixedLunchEndtime: '',
            week: [
              {
                day: 'Monday',
                starttime: '17:00', // Invalid: start time after end time
                endtime: '09:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              }
            ]
          }
        }
      }
    };

    validateUpdateAvailabilityMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Start time cannot be greater than or equal to end time'
          })
        ])
      })
    );
  });

  // Test Scenario 5: Invalid - missing required day field
  test('should fail validation when day field is missing', () => {
    mockRequest = {
      body: {
        data: {
          availability: {
            fixedLunch: false,
            fixedLunchStarttime: '',
            fixedLunchEndtime: '',
            week: [
              {
                // day field missing
                starttime: '09:00',
                endtime: '17:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              }
            ]
          }
        }
      }
    };

    validateUpdateAvailabilityMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('"day" is required')
          })
        ])
      })
    );
  });

  // Test Scenario 6: Valid - full week with varying schedules
  test('should pass validation for full week with varying schedules', () => {
    mockRequest = {
      body: {
        data: {
          availability: {
            fixedLunch: true,
            fixedLunchStarttime: '12:00',
            fixedLunchEndtime: '13:00',
            week: [
              {
                day: 'Monday',
                starttime: '09:00',
                endtime: '17:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              },
              {
                day: 'Tuesday',
                starttime: '10:00',
                endtime: '18:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              },
              {
                day: 'Wednesday',
                starttime: '',
                endtime: '',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: false
              },
              {
                day: 'Thursday',
                starttime: '08:00',
                endtime: '16:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              },
              {
                day: 'Friday',
                starttime: '09:00',
                endtime: '15:00',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: true
              },
              {
                day: 'Saturday',
                starttime: '',
                endtime: '',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: false
              },
              {
                day: 'Sunday',
                starttime: '',
                endtime: '',
                lunchstarttime: '',
                lunchendtime: '',
                isOpen: false
              }
            ]
          }
        }
      }
    };

    validateUpdateAvailabilityMiddleware(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
