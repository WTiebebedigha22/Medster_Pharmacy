// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Paystack API errors
  if (err.name === 'PaystackError') {
    return res.status(err.statusCode || 502).json({
      message: 'Payment gateway error',
      error: err.message,
    });
  }

  // iRECPlus API errors
  if (err.name === 'IRECError') {
    return res.status(err.statusCode || 502).json({
      message: 'Pharmacy system error',
      error: err.message,
    });
  }

  // Supabase errors
  if (err.code === '23505') {
    return res.status(409).json({
      message: 'Resource already exists',
      error: err.detail,
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'File too large',
      error: 'Maximum file size is 5MB',
    });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Unexpected file field',
      error: 'Check the file field name',
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: 'Upload error',
      error: err.message,
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Async handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
