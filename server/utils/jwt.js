/**
 * JWT 工具模块
 * 处理 Token 生成和验证
 */

const jwt = require('jsonwebtoken');

// JWT 密钥（生产环境应从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'yougou-mall-secret-key-2026';
const JWT_EXPIRES_IN = '7d';  // Token 7天过期

/**
 * 生成 JWT Token
 * @param {Object} payload - Token 载荷数据
 * @returns {string} JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * 验证 JWT Token
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的数据，失败返回 null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * 解码 Token（不验证）
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的数据
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  JWT_SECRET
};
