/**
 * 认证路由模块
 * 处理用户注册、登录、个人信息等接口
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');
const db = require('../utils/db');

const router = express.Router();

// 初始化数据库
db.initUsers();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 参数验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      });
    }

    // 用户名格式验证
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: '用户名长度应为3-20个字符'
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址'
      });
    }

    // 密码强度验证
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6个字符'
      });
    }

    // 检查用户名是否已存在
    if (db.findUserByUsername(username)) {
      return res.status(409).json({
        success: false,
        message: '用户名已被注册'
      });
    }

    // 检查邮箱是否已存在
    if (db.findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: '邮箱已被注册'
      });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      phone: phone || '',
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedUser = db.createUser(user);
    if (!savedUser) {
      return res.status(500).json({
        success: false,
        message: '注册失败，请稍后重试'
      });
    }

    // 生成 Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    console.error('[AUTH ERROR] Register:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户（支持用户名或邮箱登录）
    const user = db.findUserByUsername(username) || db.findUserByEmail(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    // 更新最后登录时间
    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    console.error('[AUTH ERROR] Login:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

/**
 * GET /api/auth/profile
 * 获取当前用户信息（需要认证）
 */
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const user = db.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 返回用户信息（不包含密码）
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (err) {
    console.error('[AUTH ERROR] Profile:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * PUT /api/auth/profile
 * 更新当前用户信息
 */
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { phone, avatar } = req.body;
    const updates = { updatedAt: new Date().toISOString() };

    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = db.updateUser(req.user.id, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('[AUTH ERROR] Update Profile:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * PUT /api/auth/password
 * 修改密码
 */
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供旧密码和新密码'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少为6个字符'
      });
    }

    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.updateUser(user.id, { password: hashedPassword, updatedAt: new Date().toISOString() });

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (err) {
    console.error('[AUTH ERROR] Change Password:', err);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
