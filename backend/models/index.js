const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Category = require('./Category');
const LoginLog = require('./LoginLog');
const BrowseLog = require('./BrowseLog');
const OperationLog = require('./OperationLog');

// 建立模型关联关系

// 用户和购物车的一对多关系
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// 产品和购物车的一对多关系
Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// 用户和订单的一对多关系
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// 订单和订单项的一对多关系
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// 产品和订单项的一对多关系
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// 用户行为日志关联
User.hasMany(LoginLog, { foreignKey: 'userId' });
LoginLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(BrowseLog, { foreignKey: 'userId' });
BrowseLog.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(BrowseLog, { foreignKey: 'productId' });
BrowseLog.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(OperationLog, { foreignKey: 'userId' });
OperationLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Product,
  Cart,
  Order,
  OrderItem,
  Category,
  LoginLog,
  BrowseLog,
  OperationLog,
  sequelize
};