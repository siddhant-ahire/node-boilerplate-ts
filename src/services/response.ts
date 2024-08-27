interface ApiResponse<T> {
    status: string;
    message: string;
    data?: T;
    error?: any;
  }
  
  export const successResponse = <T>(message: string, data: T): ApiResponse<T> => {
    return {
      status: 'success',
      message,
      data
    };
  };
  
  export const errorResponse = (message: string, error?: any): ApiResponse<null> => {
    return {
      status: 'error',
      message,
      error
    };
  };
  