# 优购商城 - Spring Boot 订单模块 API 接口文档

## 一、项目概述

基于 Spring Boot 3.2.5 + MyBatis Plus 3.5.6 实现的电商订单模块 CRUD 接口。

### 技术栈

| 技术 | 版本 | 说明 |
|:---|:---|:---|
| Spring Boot | 3.2.5 | 后端框架 |
| MyBatis Plus | 3.5.6 | ORM 框架 |
| MySQL | 8.0+ | 生产数据库 |
| H2 | - | 测试数据库 |
| Lombok | - | 简化代码 |
| Hutool | 5.8.26 | 工具类 |

---

## 二、接口列表

### 订单查询

| 方法 | 路径 | 说明 |
|:---|:---|:---|
| GET | `/api/orders` | 分页查询用户订单列表 |
| GET | `/api/orders/{id}` | 根据ID查询订单详情 |
| GET | `/api/orders/no/{orderNo}` | 根据订单编号查询 |

### 订单创建

| 方法 | 路径 | 说明 |
|:---|:---|:---|
| POST | `/api/orders` | 创建订单 |

### 订单状态更新

| 方法 | 路径 | 说明 |
|:---|:---|:---|
| PUT | `/api/orders/status` | 更新订单状态 |
| POST | `/api/orders/{id}/pay` | 支付订单 |
| POST | `/api/orders/{id}/cancel` | 取消订单 |

### 订单删除

| 方法 | 路径 | 说明 |
|:---|:---|:---|
| DELETE | `/api/orders/{id}` | 删除订单（软删除） |

---

## 三、接口详情

### 1. 分页查询用户订单列表

**请求**
```
GET /api/orders?userId=1001&status=0&page=1&pageSize=10
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| userId | Long | 是 | 用户ID |
| status | Integer | 否 | 订单状态：0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-退款中 6-已退款 |
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |

**响应**
```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "list": [
            {
                "id": 1,
                "orderNo": "ORD202606140001",
                "userId": 1001,
                "totalAmount": 8999.00,
                "freightAmount": 0.00,
                "payAmount": 8999.00,
                "status": 0,
                "statusText": "待付款",
                "paymentMethod": null,
                "paymentTime": null,
                "shippingName": "张三",
                "shippingPhone": "13800138001",
                "shippingProvince": "北京市",
                "shippingCity": "北京市",
                "shippingDistrict": "朝阳区",
                "shippingAddress": "建国路88号",
                "remark": null,
                "createTime": "2026-06-14T10:30:00",
                "updateTime": "2026-06-14T10:30:00",
                "items": [
                    {
                        "id": 1,
                        "orderId": 1,
                        "productId": 1001,
                        "productName": "Apple iPhone 15 Pro",
                        "productIcon": "/images/iphone15.jpg",
                        "skuId": 2001,
                        "skuName": "深空黑",
                        "price": 8999.00,
                        "quantity": 1,
                        "subtotal": 8999.00
                    }
                ]
            }
        ],
        "total": 5,
        "page": 1,
        "pageSize": 10,
        "totalPages": 1
    },
    "timestamp": 1718333400000
}
```

---

### 2. 根据ID查询订单详情

**请求**
```
GET /api/orders/1
```

**响应**
```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "id": 1,
        "orderNo": "ORD202606140001",
        "userId": 1001,
        "totalAmount": 8999.00,
        "status": 0,
        "statusText": "待付款",
        "items": [...]
    }
}
```

**错误响应**
```json
{
    "code": 404,
    "message": "订单不存在",
    "data": null
}
```

---

### 3. 根据订单编号查询

**请求**
```
GET /api/orders/no/ORD202606140001
```

---

### 4. 创建订单

**请求**
```
POST /api/orders
Content-Type: application/json

{
    "userId": 1001,
    "freightAmount": 0.00,
    "shippingName": "张三",
    "shippingPhone": "13800138001",
    "shippingProvince": "北京市",
    "shippingCity": "北京市",
    "shippingDistrict": "朝阳区",
    "shippingAddress": "建国路88号",
    "remark": "尽快发货",
    "items": [
        {
            "productId": 1001,
            "productName": "Apple iPhone 15 Pro",
            "productIcon": "/images/iphone15.jpg",
            "skuId": 2001,
            "skuName": "深空黑",
            "price": 8999.00,
            "quantity": 1
        }
    ]
}
```

**参数校验**

| 字段 | 校验规则 |
|:---|:---|
| userId | 不能为空 |
| shippingName | 不能为空 |
| shippingPhone | 不能为空 |
| shippingProvince | 不能为空 |
| shippingCity | 不能为空 |
| shippingDistrict | 不能为空 |
| shippingAddress | 不能为空 |
| items | 不能为空 |
| items[].productId | 不能为空 |
| items[].productName | 不能为空 |
| items[].price | 必须大于0 |
| items[].quantity | 必须大于0 |

**响应**
```json
{
    "code": 200,
    "message": "订单创建成功",
    "data": {
        "id": 1701234567890123,
        "orderNo": "ORD202606140001",
        "totalAmount": 8999.00,
        "status": 0,
        "statusText": "待付款"
    }
}
```

---

### 5. 支付订单

**请求**
```
POST /api/orders/{id}/pay
```

**响应**
```json
{
    "code": 200,
    "message": "支付成功",
    "data": {
        "id": 1,
        "status": 1,
        "statusText": "待发货",
        "paymentTime": "2026-06-14T10:35:00"
    }
}
```

---

### 6. 取消订单

**请求**
```
POST /api/orders/{id}/cancel?operatorId=1001&operatorName=张三
```

**响应**
```json
{
    "code": 200,
    "message": "订单取消成功",
    "data": {
        "id": 1,
        "status": 4,
        "statusText": "已取消"
    }
}
```

---

### 7. 删除订单

**请求**
```
DELETE /api/orders/{id}
```

**响应**
```json
{
    "code": 200,
    "message": "订单删除成功",
    "data": true
}
```

---

## 四、订单状态流转

```
┌─────────┐     支付      ┌─────────┐     发货      ┌─────────┐     收货      ┌─────────┐
│  待付款  │ ─────────────> │  待发货  │ ─────────────> │  待收货  │ ─────────────> │ 已完成  │
└────┬────┘               └────┬────┘               └────┬────┘               └─────────┘
     │                          │                          │
     │ 取消                     │ 申请退款                 │ 申请退款
     v                          v                          v
┌─────────┐               ┌─────────┐               ┌─────────┐
│ 已取消   │               │ 退款中   │               │ 退款中   │
└─────────┘               └────┬────┘               └────┬────┘
                               │                          │
                               v                          v
                          ┌─────────┐               ┌─────────┐
                          │ 已退款   │               │ 已退款   │
                          └─────────┘               └─────────┘
```

| 状态值 | 状态名 | 可流转到 |
|:---:|:---:|:---|
| 0 | 待付款 | 1-待发货, 4-已取消 |
| 1 | 待发货 | 2-待收货, 5-退款中 |
| 2 | 待收货 | 3-已完成, 5-退款中 |
| 3 | 已完成 | - |
| 4 | 已取消 | - |
| 5 | 退款中 | 6-已退款, 2-待收货 |
| 6 | 已退款 | - |

---

## 五、数据库表结构

### t_order (订单主表)

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | BIGINT | 订单ID (雪花算法) |
| order_no | VARCHAR(32) | 订单编号 |
| user_id | BIGINT | 用户ID |
| total_amount | DECIMAL(10,2) | 订单总金额 |
| freight_amount | DECIMAL(10,2) | 运费金额 |
| pay_amount | DECIMAL(10,2) | 实付金额 |
| status | TINYINT | 订单状态 |
| payment_method | VARCHAR(20) | 支付方式 |
| payment_time | DATETIME | 支付时间 |
| shipping_name | VARCHAR(50) | 收货人姓名 |
| shipping_phone | VARCHAR(20) | 收货人电话 |
| shipping_province | VARCHAR(50) | 收货省份 |
| shipping_city | VARCHAR(50) | 收货城市 |
| shipping_district | VARCHAR(50) | 收货区县 |
| shipping_address | VARCHAR(255) | 详细地址 |
| remark | VARCHAR(500) | 订单备注 |
| deleted | TINYINT | 删除标记 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### t_order_item (订单明细表)

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | BIGINT | 明细ID |
| order_id | BIGINT | 订单ID |
| product_id | BIGINT | 商品ID |
| product_name | VARCHAR(200) | 商品名称 |
| product_icon | VARCHAR(500) | 商品图标 |
| sku_id | BIGINT | SKU ID |
| sku_name | VARCHAR(200) | SKU规格名称 |
| price | DECIMAL(10,2) | 商品单价 |
| quantity | INT | 购买数量 |
| subtotal | DECIMAL(10,2) | 小计金额 |

### t_order_log (订单日志表)

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | BIGINT | 日志ID |
| order_id | BIGINT | 订单ID |
| operate_type | VARCHAR(20) | 操作类型 |
| operate_msg | VARCHAR(500) | 操作描述 |
| operator_id | BIGINT | 操作人ID |
| operator_name | VARCHAR(100) | 操作人名称 |
| create_time | DATETIME | 操作时间 |

---

## 六、项目结构

```
springboot-order/
├── pom.xml
├── src/main/java/com/yougou/order/
│   ├── OrderApplication.java          # 启动类
│   ├── common/
│   │   └── Result.java                # 统一响应
│   ├── config/
│   │   ├── MyBatisPlusConfig.java     # MP配置
│   │   └── WebConfig.java             # Web配置
│   ├── controller/
│   │   └── OrderController.java       # REST控制器
│   ├── dto/
│   │   ├── CreateOrderDTO.java        # 创建订单DTO
│   │   └── UpdateOrderStatusDTO.java  # 更新状态DTO
│   ├── entity/
│   │   ├── Order.java                 # 订单实体
│   │   ├── OrderItem.java             # 订单明细实体
│   │   ├── OrderLog.java              # 订单日志实体
│   │   ├── OrderStatus.java           # 状态枚举
│   │   └── OperateType.java           # 操作类型枚举
│   ├── mapper/
│   │   ├── OrderMapper.java           # 订单Mapper
│   │   ├── OrderItemMapper.java       # 明细Mapper
│   │   └── OrderLogMapper.java        # 日志Mapper
│   ├── service/
│   │   ├── OrderService.java          # 服务接口
│   │   └── impl/
│   │       └── OrderServiceImpl.java  # 服务实现
│   └── vo/
│       ├── OrderVO.java               # 订单VO
│       ├── OrderItemVO.java           # 明细VO
│       └── OrderPageVO.java           # 分页VO
├── src/main/resources/
│   ├── application.yml                # 主配置
│   ├── schema.sql                     # 建表SQL
│   └── mapper/*.xml                   # Mapper XML
└── src/test/
    ├── java/com/yougou/order/
    │   ├── OrderApplicationTests.java  # 启动测试
    │   ├── OrderServiceTest.java       # 单元测试
    │   └── OrderControllerTest.java    # 集成测试
    └── resources/
        ├── application.yml            # 测试配置
        ├── schema.sql                 # 测试建表
        └── data.sql                   # 测试数据
```

---

## 七、启动方式

### 1. 安装 MySQL 并执行 SQL

```bash
mysql -u root -p < src/main/resources/schema.sql
```

### 2. 修改配置文件

修改 `application.yml` 中的数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/yougou_order
    username: your_username
    password: your_password
```

### 3. 启动应用

```bash
mvn spring-boot:run
```

或

```bash
mvn clean package
java -jar target/order-service-1.0.0.jar
```

### 4. 访问接口

- API 基础路径: `http://localhost:8080/api/orders`
- H2 控制台: `http://localhost:8080/h2-console`

---

**文档生成时间**: 2026-06-14
