import { getAllClients } from './controllers';
import { getAllClientsService } from './services';
import { messages } from './messages';

describe('Clients Controllers', () => {
  describe('getAllClients', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
      mockRequest = {
        body: {
          decodedToken: {
            _id: 'mockUserId'
          }
        }
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      nextFunction = jest.fn();
    });

    test('should return clients successfully', async () => {
      const mockClients = [
        {
          _id: 'client1',
          firstName: 'John',
          lastName: 'Doe'
        },
        {
          _id: 'client2',
          firstName: 'Jane',
          lastName: 'Smith'
        }
      ];

      // Mock the service
      jest.spyOn(getAllClientsService, 'getAllClientsService')
        .mockResolvedValue(mockClients);

      await getAllClients(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        clients: mockClients,
        message: messages.clients.getAllSuccess
      });
    });

    test('should handle errors', async () => {
      const mockError = new Error('Test error');

      // Mock the service to throw an error
      jest.spyOn(getAllClientsService, 'getAllClientsService')
        .mockRejectedValue(mockError);

      await getAllClients(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(mockError);
    });
  });
}); 