# 优购商城 - Spring Boot 订单模块

基于 Spring Boot 3 + MyBatis Plus 实现的电商订单模块 CRUD 接口。

## 技术栈

| 技术 | 版本 | 说明 |
|:---|:---|:---|
| Spring Boot | 3.2.5 | 后端框架 |
| MyBatis Plus | 3.5.6 | ORM 框架 |
| MySQL | 8.0+ | 生产数据库 |
| H2 | - | 测试数据库 |
| Lombok | - | 简化代码 |

## 项目结构

```
springboot-order/
├── pom.xml
├── src/main/java/com/yougou/order/
│   ├── OrderApplication.java          # 启动类
│   ├── common/Result.java             # 统一响应
│   ├── config/                        # 配置类
│   ├── controller/OrderController.java
│   ├── dto/                           # 数据传输对象
│   ├── entity/                        # 实体类
│   ├── mapper/                        # Mapper接口
│   ├── service/                       # 服务层
│   └── vo/                            # 视图对象
├── src/main/resources/
│   ├── application.yml
│   ├── schema.sql                     # 数据库建表SQL
│   └── mapper/*.xml                   # Mapper XML
└── src/test/                          # 测试
```

## 快速开始

### 1. 安装依赖

```bash
mvn clean install
```

### 2. 配置数据库

创建 MySQL 数据库并执行 SQL：

```bash
mysql -u root -p < src/main/resources/schema.sql
```

修改 `application.yml` 中的数据库连接信息。

### 3. 启动服务

```bash
mvn spring-boot:run
```

### 4. 访问接口

- API 基础路径: http://localhost:8080/api/orders
- H2 控制台: http://localhost:8080/h2-console

## API 接口

| 方法 | 路径 | 说明 |
|:---|:---|:---|
| GET | `/api/orders` | 分页查询用户订单列表 |
| GET | `/api/orders/{id}` | 根据ID查询订单详情 |
| GET | `/api/orders/no/{orderNo}` | 根据订单编号查询 |
| POST | `/api/orders` | 创建订单 |
| POST | `/api/orders/{id}/pay` | 支付订单 |
| POST | `/api/orders/{id}/cancel` | 取消订单 |
| PUT | `/api/orders/status` | 更新订单状态 |
| DELETE | `/api/orders/{id}` | 删除订单 |

详细接口文档见 [docs/API.md](docs/API.md)。

## 运行测试

```bash
# 运行所有测试
mvn test

# 运行单元测试
mvn test -Dtest=OrderServiceTest

# 运行集成测试
mvn test -Dtest=OrderControllerTest
```

测试报告见 [docs/TEST_REPORT.md](docs/TEST_REPORT.md)。

## 订单状态

| 值 | 状态 | 说明 |
|:---:|:---|:---|
| 0 | 待付款 | 订单已创建，等待用户支付 |
| 1 | 待发货 | 已支付，等待商家发货 |
| 2 | 待收货 | 已发货，等待用户确认收货 |
| 3 | 已完成 | 用户已确认收货，订单完成 |
| 4 | 已取消 | 订单已取消 |
| 5 | 退款中 | 申请退款，等待处理 |
| 6 | 已退款 | 退款已完成 |

## License

MIT
