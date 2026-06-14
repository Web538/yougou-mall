/**
 * 认证中间件
 * 验证请求中的 JWT Token
 */

const { verifyToken } = require('../utils/jwt');

/**
 * 验证 Token 中间件
 * 从 Authorization 头获取 Token 并验证
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌，请先登录'
    });
  }

  // 解析 Bearer Token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: '令牌格式错误，应为: Bearer <token>'
    });
  }

  const token = parts[1];

  // 验证 Token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期，请重新登录'
    });
  }

  // 将用户信息附加到请求对象
  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email
  };

  next();
}

/**
 * 可选认证中间件
 * 如果有 Token 则验证，没有则继续
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = null;
    return next();
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (decoded) {
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
  } else {
    req.user = null;
  }

  next();
}

module.exports = {
  authMiddleware,
  optionalAuth
};
