/**
 * 文件数据库工具模块
 * 基于 JSON 文件的轻量级数据存储
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(__dirname, '../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 数据文件路径
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// 初始化数据文件
function initDataFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log(`[DB] 初始化数据文件: ${path.basename(filePath)}`);
  }
}

// 读取 JSON 文件
function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[DB ERROR] 读取文件失败: ${filePath}`, err);
    return null;
  }
}

// 写入 JSON 文件
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[DB ERROR] 写入文件失败: ${filePath}`, err);
    return false;
  }
}

// ========== 用户数据操作 ==========

function initUsers() {
  initDataFile(USERS_FILE, []);
}

function getUsers() {
  return readJson(USERS_FILE) || [];
}

function saveUsers(users) {
  return writeJson(USERS_FILE, users);
}

function findUserByUsername(username) {
  const users = getUsers();
  return users.find(u => u.username === username);
}

function findUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id);
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email === email);
}

function createUser(userData) {
  const users = getUsers();
  users.push(userData);
  return saveUsers(users) ? userData : null;
}

function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  return saveUsers(users) ? users[index] : null;
}

// ========== 订单数据操作 ==========

function initOrders() {
  initDataFile(ORDERS_FILE, []);
}

function getOrders() {
  return readJson(ORDERS_FILE) || [];
}

function saveOrders(orders) {
  return writeJson(ORDERS_FILE, orders);
}

function getOrdersByUserId(userId) {
  const orders = getOrders();
  return orders.filter(o => o.userId === userId);
}

function findOrderById(orderId) {
  const orders = getOrders();
  return orders.find(o => o.id === orderId);
}

function findOrderByIdAndUser(orderId, userId) {
  const orders = getOrders();
  return orders.find(o => o.id === orderId && o.userId === userId);
}

function createOrder(orderData) {
  const orders = getOrders();
  orders.unshift(orderData);
  return saveOrders(orders) ? orderData : null;
}

function updateOrder(orderId, userId, updates) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId && o.userId === userId);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates };
  return saveOrders(orders) ? orders[index] : null;
}

function deleteOrder(orderId, userId) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId && o.userId === userId);
  if (index === -1) return false;
  orders.splice(index, 1);
  return saveOrders(orders);
}

module.exports = {
  initUsers, initOrders,
  getUsers, saveUsers, findUserByUsername, findUserById, findUserByEmail, createUser, updateUser,
  getOrders, saveOrders, getOrdersByUserId, findOrderById, findOrderByIdAndUser, createOrder, updateOrder, deleteOrder
};
