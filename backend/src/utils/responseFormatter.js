export function ok(res, data, message = 'success', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function fail(res, message = 'error', status = 400, details = null) {
  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}

